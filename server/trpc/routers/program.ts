import { z } from 'zod';
import { protectedProcedure, requireRoles, router } from '../trpc';

const nameZod = z.string()
  .max(30, { message: '节目名不能超过30个字符' });
const programIdZod = z.number();

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
    .input(z.object({ id: programIdZod }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.programController.delete(input.id);
    }),

  edit: protectedProcedure
    .use(requireRoles(['admin']))
    .input(z.object({ id: programIdZod, new_name: nameZod }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.deviceController.edit(input.id, input.new_name);
    }),

  list: protectedProcedure
    .use(requireRoles(['admin']))
    .query(async ({ ctx }) => {
      return await ctx.programController.getList();
    }),
});
