import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import type { TLnfUploadForm, TNewContent, TRawContent, TRawUser } from '../../db/db';
import { db } from '../../db/db';
import { contents, programsToContents, uploadLimits, users } from '../../db/schema';
import type { Context } from '../context';
import { UserController } from './user';

const UserCtrl = new UserController();
type ContentState = 'created' | 'approved' | 'rejected' | 'inuse' | 'outdated';
export class ContentController {
  private async fetchOwner(res: TRawContent[], ctx: Context) {
    const named_res: (TRawContent & { owner: string })[] = [];
    res.forEach(async (cnt) => {
      named_res.push({
        ...cnt,
        owner: (await ctx.userController.getProfile(cnt.ownerId)).username,
      });
    });
    return named_res;
  }

  // 获取所有管理员用户ID
  private async getAdminUserIds(): Promise<number[]> {
    const adminUsers = await db.query.users.findMany({
      where: eq(users.role, 'admin'),
      columns: { id: true },
    });
    return adminUsers.map(user => user.id);
  }

  async create(newContent: TNewContent, ctx: Context) {
    // 获取当前用户的权限信息
    const currentUser = await ctx.userController.getList();
    const userRole = currentUser[0].role;
    if (newContent.categoryId == null || typeof newContent.categoryId !== 'number')
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'categoryId 必须为有效的数字' });
    // 获取内容类型信息
    const categoryInfo = await ctx.poolController.getInfo(newContent.categoryId);
    const categoryRole = categoryInfo.roleRequirement;

    // 检查用户是否有权限创建该类型的内容
    if (userRole === 'club' && categoryRole === 'admin')
      throw new TRPCError({ code: 'FORBIDDEN', message: '用户没有权限创建该类型的内容' });

    // 插入新内容到数据库
    await db.insert(contents).values(newContent);

    // 发送通知给所有管理员
    try {
      const adminIds = await this.getAdminUserIds();
      const userInfo = await ctx.userController.getProfile(newContent.ownerId);

      for (const adminId of adminIds) {
        await ctx.notificationController.createNotification(
          newContent.ownerId, // 发送者是内容创建者
          adminId, // 接收者是管理员
          '新内容待审核',
          `用户 ${userInfo.username} 提交了新内容"${newContent.name}"，请及时审核。`,
        );
      }
    } catch (error) {
      // 通知发送失败不影响内容创建
      console.error('发送通知失败:', error);
    }

    return '内容创建成功';
  }

  async delete(id: number) {
    await db.delete(contents).where(eq(contents.id, id));
    return '内容删除成功';
  }

  async edit(id: number, new_name: string, ctx?: Context) {
    // 获取内容信息用于通知
    const content = await db.query.contents.findFirst({
      where: eq(contents.id, id),
    });

    await db.update(contents)
      .set({ name: new_name })
      .where(eq(contents.id, id));

    // 发送通知给所有管理员
    if (ctx && content) {
      try {
        const adminIds = await this.getAdminUserIds();
        const userInfo = await ctx.userController.getProfile(content.ownerId);

        for (const adminId of adminIds) {
          await ctx.notificationController.createNotification(
            content.ownerId, // 发送者是内容修改者
            adminId, // 接收者是管理员
            '内容已修改',
            `用户 ${userInfo.username} 修改了内容"${new_name}"，请重新审核。`,
          );
        }
      } catch (error) {
        // 通知发送失败不影响内容修改
        console.error('发送修改通知失败:', error);
      }
    }

    return '内容名修改成功';
  }

  // updateInfo returns the updated info
  async updateInfo(id: number, ctx: Context) {
    const relationToProgram = await db.query.programsToContents.findMany({
      where: eq(programsToContents.contentId, id),
    }); // 获取所有跟id为指定值的content有关的program
    const res = await db.query.contents.findFirst({
      where: eq(contents.id, id),
    });
    const now = new Date(); // 创建一个时间戳
    if (!res) {
      throw new TRPCError({ code: 'NOT_FOUND', message: '内容不存在' });
    } else if (relationToProgram.length > 0) {
      if (res.expireDate <= now)
        res.state = 'outdated';
      relationToProgram.forEach(async (ids) => {
        const sequences = await ctx.programController.getSequence(ids.programId, ctx);
        sequences.forEach(async (seq) => {
          if (seq.type === 'content')
            res.state = 'inuse';
        });
      });
    }
    return res;
  }

  async getList(ctx: Context) {
    const res = await db.query.contents.findMany();
    return await this.fetchOwner(res, ctx);
  }

  async getListByOwner(ownerId: number, ctx: Context) {
    const res = await db.query.contents.findMany({
      where: eq(contents.ownerId, ownerId),
    });
    return await this.fetchOwner(res, ctx);
  }

  async getListByCategory(categoryId: number, ctx: Context) {
    const res = await db.query.contents.findMany({
      where: eq(contents.categoryId, categoryId),
    });
    return await this.fetchOwner(res, ctx);
  }

  async updateReviewStatus(id: number, state: ContentState, reviewNotes?: string, ctx?: Context) {
    // 获取内容信息
    const content = await db.query.contents.findFirst({
      where: eq(contents.id, id),
    });

    if (!content) {
      throw new TRPCError({ code: 'NOT_FOUND', message: '内容不存在' });
    }

    // 更新审核状态
    await db.update(contents)
      .set({ state, reviewNotes: reviewNotes ?? null })
      .where(eq(contents.id, id));

    // 发送通知给内容所有者
    if (ctx && ctx.user) {
      try {
        let notificationTitle = '';
        let notificationContent = '';

        if (state === 'approved') {
          notificationTitle = '内容审核通过';
          notificationContent = `您的内容"${content.name}"已通过审核，现在可以正常使用了。`;
        } else if (state === 'rejected') {
          notificationTitle = '内容审核未通过';
          notificationContent = `您的内容"${content.name}"审核未通过。${reviewNotes ? `原因：${reviewNotes}` : '请联系管理员了解详情。'}`;
        }

        if (notificationTitle && notificationContent) {
          await ctx.notificationController.createNotification(
            ctx.user.id, // 发送者是当前管理员
            content.ownerId, // 接收者是内容所有者
            notificationTitle,
            notificationContent,
          );
        }
      } catch (error) {
        // 通知发送失败不影响审核状态更新
        console.error('发送审核通知失败:', error);
      }
    }

    return '内容审核状态修改成功';
  }

  // 真正创建失物招领内容
  async createLostnfound(lnfUploadForm: TLnfUploadForm, newContent: TNewContent, ctx: Context, fingerprint: string) {
    // 1、创建或更新上传记录
    const res = await db.query.uploadLimits.findFirst({
      where: eq(uploadLimits.fingerprint, fingerprint),
    });
    const now = new Date();
    if (!res) {
      // 如果没有记录插入新纪录，（为啥TLnfUploadForm的count字段是可选的？schema里有notnull啊）
      lnfUploadForm.count = 1;
      await db.insert(uploadLimits).values(lnfUploadForm);
    } else if (now.getTime() - res.date.getTime() > 24 * 3600 * 1000) {
      // 如果有记录但记录过期，时间变为当前，count变为1
      await db.update(uploadLimits).set({ date: now, count: 1 }).where(eq(uploadLimits.fingerprint, fingerprint));
    } else {
      // 如果有记录且记录没有过期，count+1,时间不变
      await db.update(uploadLimits).set({ count: res.count + 1 }).where(eq(uploadLimits.fingerprint, fingerprint));
    }
    // 2、获得失物招领能否上传的指示
    const nowRes = await db.query.uploadLimits.findFirst({
      where: eq(uploadLimits.fingerprint, fingerprint),
    });
    let disAbilityToUpload = false;// 默认可以上传
    // 如果一天内上传大于3次，disAbilityToUpload变为true,也就是不能上传。
    if (nowRes) {
      disAbilityToUpload = nowRes.count > 3 && now.getTime() - nowRes.date.getTime() < 24 * 3600 * 1000;
    }
    if (disAbilityToUpload)
      throw new TRPCError({ code: 'BAD_REQUEST', message: '上传次数过多' });
    // 3、真正开始上传
    const categoryInfo = await ctx.poolController.getLnfInfo();
    const userInfo = await ctx.userController.getLnfInfo();
    newContent.categoryId = categoryInfo.id;
    newContent.ownerId = userInfo.id;
    await db.insert(contents).values(newContent);

    // 发送通知给所有管理员
    try {
      const adminIds = await this.getAdminUserIds();

      for (const adminId of adminIds) {
        await ctx.notificationController.createNotification(
          newContent.ownerId, // 发送者是内容创建者
          adminId, // 接收者是管理员
          '新失物招领内容待审核',
          `用户提交了新的失物招领内容"${newContent.name}"，请及时审核。`,
        );
      }
    } catch (error) {
      // 通知发送失败不影响内容创建
      console.error('发送失物招领通知失败:', error);
    }

    return '创建成功';
  }

  // 通过内容id获取内容
  // getInfo doesn't update the state
  async getContentById(id: number) {
    const res = await db.query.contents.findFirst({
      where: eq(contents.id, id),
    });
    if (!res)
      throw new TRPCError({ code: 'NOT_FOUND', message: '内容不存在' });
    return res;
  }

  // 同样进行用户检验
  async updateContentById(newContent: TRawContent, accessToken: string, ctx?: Context) {
    const content = await db.query.contents.findFirst({
      where: eq(contents.id, newContent.id),
    });
    if (!content)
      throw new TRPCError({ code: 'NOT_FOUND', message: '内容不存在' });
    const res = await UserCtrl.checkAccessToken(accessToken, content?.ownerId);
    if (!res)
      throw new TRPCError({ code: 'FORBIDDEN', message: '用户没有权限更新该类型的内容' });
    await db.update(contents)
      .set(newContent)
      .where(eq(contents.id, newContent.id));

    // 发送通知给所有管理员
    if (ctx) {
      try {
        const adminIds = await this.getAdminUserIds();
        const userInfo = await ctx.userController.getProfile(newContent.ownerId);

        for (const adminId of adminIds) {
          await ctx.notificationController.createNotification(
            newContent.ownerId, // 发送者是内容修改者
            adminId, // 接收者是管理员
            '内容已修改',
            `用户 ${userInfo.username} 修改了内容"${newContent.name}"，请重新审核。`,
          );
        }
      } catch (error) {
        // 通知发送失败不影响内容更新
        console.error('发送修改通知失败:', error);
      }
    }

    return '内容更新成功';
  }
}
