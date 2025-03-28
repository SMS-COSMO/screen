import { z } from 'zod';
import { protectedProcedure, publicProcedure, requireRoles, router } from '../trpc';

const categoryZod = z.string()
  .max(30, { message: '内容类型名不能超过30个字符' });
const poolIdZod = z.number();
const roleRequirementZod = z.enum(['admin', 'club']);

export const poolRouter = router({
  create: protectedProcedure
    .use(requireRoles(['admin']))
    .input(z.object({ category: categoryZod, roleRequirement: roleRequirementZod }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.poolController.create(
        {
          category: input.category,
          roleRequirement: input.roleRequirement,
        },
      );
    }),

  delete: protectedProcedure
    .use(requireRoles(['admin']))
    .input(z.object({ id: poolIdZod }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.poolController.delete(input.id);
    }),

  edit: protectedProcedure
    .use(requireRoles(['admin']))
    .input(z.object({ id: poolIdZod, new_category: categoryZod, new_roleRequire: roleRequirementZod }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.poolController.edit(input.id, input.new_category, input.new_roleRequire);
    }),

  list: protectedProcedure
    .use(requireRoles(['admin', 'club']))
    .query(async ({ ctx }) => {
      return await ctx.poolController.getList();
    }),

  getInfo: publicProcedure
    .input(z.object({ id: poolIdZod }))
    .query(async ({ ctx, input }) => {
      return await ctx.poolController.getInfo(input.id);
    }),
});
