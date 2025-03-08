import { publicProcedure, router } from '../trpc';

export const weatherRouter = router({
  info: publicProcedure
    .query(async ({ ctx }) => {
      return await ctx.weatherController.getInfo();
    }),
});
