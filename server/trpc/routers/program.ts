import { z } from 'zod';
import { protectedProcedure, publicProcedure, requireRoles, router } from '../trpc';

const nameZod = z.string()
  .max(30, { message: '节目名不能超过30个字符' });
const idZod = z.number();
const sequenceZod = z.array(
  z.object({
    type: z.union([z.literal('pool'), z.literal('content')]),
    id: idZod,
  }),
);

export const programRouter = router({
  create: protectedProcedure
    .use(requireRoles(['admin']))
    .input(z.object({ name: nameZod }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.programController.create(
        { name: input.name, sequence: [] },
      );
    }),

  delete: protectedProcedure
    .use(requireRoles(['admin']))
    .input(z.object({ id: idZod }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.programController.delete(input.id);
    }),

  edit: protectedProcedure
    .use(requireRoles(['admin']))
    .input(z.object({ id: idZod, new_name: nameZod }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.programController.edit(input.id, input.new_name);
    }),

  list: publicProcedure
    .query(async ({ ctx }) => {
      return await ctx.programController.getList();
    }),

  getSequence: publicProcedure
    .input(z.object({ id: idZod }))
    .query(async ({ ctx, input }) => {
      return await ctx.programController.getSequence(input.id);
    }),

  setSequence: protectedProcedure
    .use(requireRoles(['admin']))
    .input(z.object({ id: idZod, sequence: sequenceZod }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.programController.setSequence(input.id, input.sequence);
    }),
});
