import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import type { TNewContent } from '../../db/db';
import { db } from '../../db/db';
import { contents } from '../../db/schema';
import { UserController } from './user';

export class ContentController {
  private userController: UserController;
  constructor() {
    this.userController = new UserController();
  }

  private async fetchOwner(res: TNewContent[]) {
    const seq: (TNewContent & { owner: string })[] = [];
    res.forEach(async (cnt) => {
      seq.push({
        ...cnt,
        owner: (await this.userController.getProfile(cnt.ownerId)).username,
      });
    });
    return seq;
  }

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
}
