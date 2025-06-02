import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import type { TNewContent, TRawContent, TRawUser } from '../../db/db';
import { db } from '../../db/db';
import { contents, programsToContents, users } from '../../db/schema';
import type { Context } from '../context';

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

  async edit(id: number, new_name: string) {
    await db.update(contents)
      .set({ name: new_name })
      .where(eq(contents.id, id));
    return '内容名修改成功';
  }

  // getInfo doesn't update the state
  async getInfo(id: number) {
    const res = await db.query.contents.findFirst({
      where: eq(contents.id, id),
    });
    if (!res)
      throw new TRPCError({ code: 'NOT_FOUND', message: '内容不存在' });
    return res;
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

  // 通过内容id获取内容, 同时检查请求者是否可以获得内容
  async getContentById(id: number, uId: number) {
    // !!! 缺陷, 在后端检查是否有权时却需要前端告诉是否有权
    // 这会导致前端可以伪造请求, 使得后端无法判断是否有权, 待修正
    const content = await db.query.contents.findFirst({
      where: eq(contents.id, id),
    });
    const user = await db.query.users.findFirst({ where: eq(users.id, uId) });
    if (!content)
      throw new TRPCError({ code: 'NOT_FOUND', message: '内容不存在' });
    if (!user)
      throw new TRPCError({ code: 'NOT_FOUND', message: '用户不存在' });
    if (user.id !== content?.ownerId)
      throw new TRPCError({ code: 'FORBIDDEN', message: '用户没有权限获取该类型的内容' });
    return content;
  }

  async updateContentById(newContent: TRawContent, ctx?: Context) {
    const content = await db.query.contents.findFirst({
      where: eq(contents.id, newContent.id),
    });
    if (!content)
      throw new TRPCError({ code: 'NOT_FOUND', message: '内容不存在' });

    // 更新内容
    await db.update(contents)
      .set(newContent)
      .where(eq(contents.id, newContent.id));

    // 发送通知给所有管理员（如果内容被修改）
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
