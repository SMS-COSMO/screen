import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { TNewProgram } from '../../db/db';
import { db } from '../../db/db';
import { programs } from '../../db/schema';

export class ProgramController {
  async create(newProgram: TNewProgram) {
    await db.insert(programs).values(newProgram);
    return '节目创建成功';
  }

  async delete(id: number) {
    await db.delete(programs).where(eq(programs.id, id));
    return '节目删除成功';
  }

  async edit(id: number, new_name: string) {
    await db.update(programs)
      .set({ name: new_name })
      .where(eq(programs.id, id));
    return '节目名修改成功';
  }

  async getList() {
    const res = await db.query.programs.findMany();
    return res;
  }

  async getSequence(id: number) {
    const res = await db.query.programs.findFirst({
      where: eq(programs.id, id),
    });
    if (!res)
      throw new TRPCError({ code: 'NOT_FOUND', message: '节目不存在' });
    return res.sequence;
  }
}
