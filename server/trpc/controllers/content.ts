import { TRPCError } from '@trpc/server';
import { Relation, eq } from 'drizzle-orm';
import type { TNewContent, TRawContent } from '../../db/db';
import { db } from '../../db/db';
import { contents, programsToContents } from '../../db/schema';
import { UserController } from './user';
import { PoolController } from './pool';
import { ProgramController } from './program';

type ContentState = 'created' | 'approved' | 'rejected' | 'inuse' | 'outdated';

export class ContentController {
  private async fetchOwner(res: TRawContent[], ctx: { userController: UserController }) {
    const named_res: (TRawContent & { owner: string })[] = [];
    res.forEach(async (cnt) => {
      named_res.push({
        ...cnt,
        owner: (await ctx.userController.getProfile(cnt.ownerId)).username,
      });
    });
    return named_res;
  }

  async create(
    newContent: TNewContent,
    ctx: {
      userController: UserController,
      poolController: PoolController,
    }
  ) {
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

  async getInfo(id: number) {
    const relationToProgram = await db.query.programsToContents.findFirst({
      where: eq(programsToContents.contentId, id),
    }); // 用关系表查找是否有节目引用
    const res = await db.query.contents.findFirst({
      where: eq(contents.id, id),
    });
    const now = new Date(); // 创建一个时间戳
    if (!res)
      throw new TRPCError({ code: 'NOT_FOUND', message: '内容不存在' });
    if (now > res.expireDate) {
      await db.update(contents).set({ state: 'outdated' }).where(eq(contents.id, id));
      res.state = 'outdated';
    }
    if (relationToProgram) {
      await db.update(contents).set({ state: 'inuse' }).where(eq(contents.id, id));
      res.state = 'inuse';
    }
    return res;
  }

  async getList(ctx: { userController: UserController }) {
    const res = await db.query.contents.findMany();
    return await this.fetchOwner(res, ctx);
  }

  async getListByOwner(ownerId: number, ctx: { userController: UserController }) {
    const res = await db.query.contents.findMany({
      where: eq(contents.ownerId, ownerId),
    });
    return await this.fetchOwner(res, ctx);
  }

  async getListByCategory(categoryId: number, ctx: { userController: UserController }) {
    const res = await db.query.contents.findMany({
      where: eq(contents.categoryId, categoryId),
    });
    return await this.fetchOwner(res, ctx);
  }

  async updateReviewStatus(id: number, state: ContentState, reviewNotes?: string) {
    await db.update(contents)
      .set({ state, reviewNotes: reviewNotes ?? null })
      .where(eq(contents.id, id));
    return '内容审核状态修改成功';
  }
}
