import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import type { TNewPool } from '../../db/db';
import { db } from '../../db/db';
import { pools } from '../../db/schema';

export class PoolController {
  async create(newPool: TNewPool) {
    await db.insert(pools).values(newPool);
    return '内容类型创建成功';
  }

  async delete(id: number) {
    await db.delete(pools).where(eq(pools.id, id));
    return '内容类型删除成功';
  }

  async edit(id: number, new_name: string) {
    await db.update(pools)
      .set({ category: new_name })
      .where(eq(pools.id, id));
    return '内容类型名修改成功';
  }

  async getInfo(id: number) {
    const res = await db.query.pools.findFirst({
      where: eq(pools.id, id),
    });
    if (!res)
      throw new TRPCError({ code: 'NOT_FOUND', message: '内容类型不存在' });
    return res;
  }

  async getList() {
    const res = await db.query.pools.findMany();
    return res;
  }
}
