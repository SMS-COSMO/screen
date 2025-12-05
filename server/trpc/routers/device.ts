import { z } from 'zod';
import { protectedProcedure, publicProcedure, requireRoles, router } from '../trpc';

const locationZod = z.string()
  .max(20, { message: '设备名不能超过20个字符' });
const deviceIdZod = z.number();
const programIdZod = z.number();

export const deviceRouter = router({
  create: protectedProcedure
    .use(requireRoles(['admin']))
    .input(z.object({ location: locationZod }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.deviceController.create(input);
    }),

  delete: protectedProcedure
    .use(requireRoles(['admin']))
    .input(z.object({ id: deviceIdZod }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.deviceController.delete(input.id);
    }),

  edit: protectedProcedure
    .use(requireRoles(['admin']))
    .input(z.object({ id: deviceIdZod, new_location: locationZod }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.deviceController.edit(input.id, input.new_location);
    }),

  bindProgram: protectedProcedure
    .use(requireRoles(['admin']))
    .input(z.object({ id: deviceIdZod, programId: programIdZod }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.deviceController.bindProgram(input.id, input.programId);
    }),

  info: publicProcedure
    .use(requireRoles(['admin']))
    .input(z.object({ id: deviceIdZod }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.deviceController.getInfo(input.id);
    }),

  list: publicProcedure
    .query(async ({ ctx }) => {
      return await ctx.deviceController.getList();
    }),

  contents: publicProcedure
    .input(z.object({ id: deviceIdZod }))
    .query(async ({ ctx, input }) => {
      return await ctx.deviceController.getContentsByDevice(input.id, ctx);
    }),

  contents_: publicProcedure
    .input(z.object({ id: deviceIdZod }))
    .query(async ({ ctx, input }) => {
      return await ctx.deviceController.getContentsByDevice_(input.id, ctx);
    }),
});
