import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import type { TNewContent } from '../../db/db';
import { db } from '../../db/db';
import { contents } from '../../db/schema';

type ContentState = 'created' | 'approved' | 'rejected' | 'inuse' | 'outdated';

export class ContentController {
  async create(newContent: TNewContent) {
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
    const res = await db.query.contents.findFirst({
      where: eq(contents.id, id),
    });
    if (!res)
      throw new TRPCError({ code: 'NOT_FOUND', message: '内容不存在' });
    return res;
  }

  async getList() {
    const res = await db.query.contents.findMany();
    return res;
  }

  async getListByOwner(ownerId: number) {
    const res = await db.query.contents.findMany({
      where: eq(contents.ownerId, ownerId),
    });
    return res;
  }

  async getListByCategory(categoryId: number) {
    const res = await db.query.contents.findMany({
      where: eq(contents.categoryId, categoryId),
    });
    return res;
  }

  async updateAuditStatus(id: number, state: ContentState, reviewNotes?: string) {
    await db.update(contents)
      .set({ state, reviewNotes: reviewNotes ?? null })
      .where(eq(contents.id, id));
    return '内容审核状态修改成功';
  }
}
