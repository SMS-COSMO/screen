import { z } from 'zod';
import { protectedProcedure, publicProcedure, requireRoles, router } from '../trpc';

const codeZod = z.string().length(30, { message: '邀请码长度必须为30' });
const BatchZod = z.number().min(1, { message: '批量生成邀请码数量必须大于0' });
// 此处, Batch有双重含义, 在一处指生成的数量, 在另一处指一批邀请码的集合, 需要注意
export const invitationCodeRouter = router({
  generateBatchCode: protectedProcedure
    .use(requireRoles(['admin']))
    .input(z.object({ batch: BatchZod }))
    .query(async ({ ctx, input }) => {
      return await ctx.codeController.generateBatchCode(input.batch);
    }),
  addCodeBatch: protectedProcedure
    .use(requireRoles(['admin']))
    .input(z.object({ batch: z.array(codeZod) }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.codeController.addCodeBatch(input.batch);
    }),
  invalidateCode: publicProcedure
    .use(requireRoles(['admin', 'club']))
    .input(z.object({ code: codeZod }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.codeController.invalidateCode(input.code);
    }),
  listAll: protectedProcedure
    .use(requireRoles(['admin']))
    .query(async ({ ctx }) => {
      return await ctx.codeController.listAll();
    }),
  listUsed: protectedProcedure
    .use(requireRoles(['admin']))
    .query(async ({ ctx }) => {
      return await ctx.codeController.listUsed();
    }),
  listSpare: protectedProcedure
    .use(requireRoles(['admin']))
    .query(async ({ ctx }) => {
      return await ctx.codeController.listSpare();
    }),
});
