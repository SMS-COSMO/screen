import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import type { TNewProgram, TSequenceUnit } from '../../db/db';
import { db } from '../../db/db';
import { programs } from '../../db/schema';
import { ContentController } from './content';
import { PoolController } from './pool';

export class ProgramController {
  private contentController: ContentController;
  private poolController: PoolController;
  constructor() {
    this.contentController = new ContentController();
    this.poolController = new PoolController();
  }

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
    return await db.query.programs.findMany();
  }

  // gets pool/content name by the way
  async getSequence(id: number) {
    const res = await db.query.programs.findFirst({
      where: eq(programs.id, id),
    });
    if (!res)
      throw new TRPCError({ code: 'NOT_FOUND', message: '节目不存在' });
    const seq: (TSequenceUnit & { name?: string })[] = [];
    res.sequence.forEach(async (cnt) => {
      seq.push({
        ...cnt,
        name: cnt.type === 'pool'
          ? (await this.poolController.getInfo(cnt.id)).category
          : (await this.contentController.getInfo(cnt.id)).name,
      });
    });
    return seq;
  }

  async setSequence(id: number, sequence: TSequenceUnit[]) {
    await db.update(programs)
      .set({ sequence })
      .where(eq(programs.id, id));
    return '成功修改内容';
  }
}
