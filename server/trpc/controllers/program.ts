import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import type { TNewProgram, TSequenceUnit } from '../../db/db';
import { db } from '../../db/db';
import { contents, programs, programsToContents } from '../../db/schema';
import type { Context } from '../context';

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
    return await db.query.programs.findMany();
  }

  // gets pool/content name by the way
  // to avoid recursion problem, we consider all controllers as singletons
  // that can be fetched via context.ts
  async getSequence(id: number, ctx: Context) {
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
          ? (await ctx.poolController.getInfo(cnt.id)).category
          : (await ctx.contentController.getContentById(cnt.id)).name,
      });
    });
    return seq;
  }

  async setSequence(id: number, sequence: TSequenceUnit[], ctx: Context) {
    const programsAll = await db.query.programs.findMany();

    for (const pgm of programsAll) { // 这里应该是自动整理数据库中的 programsToContents 表，那为什么还要 throw new TRPCError 
      for (const seq of pgm.sequence) {
        if (seq.type === 'content') {
          await db.update(programsToContents)
            .set({ contentId: seq.id })
            .where(eq(programsToContents.programId, pgm.id));
          // const usedContent = await ctx.contentController.getContentById(seq.id);
          // if (usedContent.state === 'created' || usedContent.state === 'rejected' || usedContent.state === 'outdated')
          //   throw new TRPCError({ code: 'BAD_REQUEST', message: '内容不可用' });
        }
      };
    };

    for (const seq of sequence) { // 检查当前上传的 sequence 是否有不可用内容
      if (seq.type === 'content') {
        const cnt = await db.query.contents.findFirst({
          where: eq(contents.id, seq.id),
        })
        if (!cnt)
          throw new TRPCError({ code: 'BAD_REQUEST', message: '选定了不存在的内容' });
        if (['created', 'rejected', 'outdated'].includes(cnt.state))
          throw new TRPCError({ code: 'BAD_REQUEST', message: '内容不可用' });
      }
    }

    await db.update(programs)
      .set({ sequence })
      .where(eq(programs.id, id));
    return '成功修改内容';
  }
}
