import { z } from 'zod';
import { protectedProcedure, publicProcedure, requireRoles, router } from '../trpc';

const locationZod = z.string()
  .max(114514, { message: '这么长的设备名真的有必要吗' });
const deviceIdZod = z.number();

export const deviceRouter = router({
  create: protectedProcedure
    .use(requireRoles(['admin']))
    .input(z.object({ location: locationZod }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.deviceController.create(input);
    }),

  info: protectedProcedure
    .use(requireRoles(['admin']))
    .input(z.object({ id: deviceIdZod }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.deviceController.getInfo(input.id);
    }),

  list: protectedProcedure
    .use(requireRoles(['admin']))
    .query(async ({ ctx }) => {
      return await ctx.deviceController.getList();
    }),
});
