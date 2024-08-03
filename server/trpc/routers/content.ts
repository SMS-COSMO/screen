import { z } from 'zod';
import { protectedProcedure, requireRoles, router } from '../trpc';

const nameZod = z.string()
  .max(30, { message: '内容名不能超过30个字符' });
const idZod = z.number();
const durationZod = z.number()
  .max(90, { message: '内容展示时长不能超过90秒' });
const fileTypeZod = z.string();
const S3FileIdZod = z.string();
const lifespanZod = z.number()
  .max(15_552_000, { message: '内容有效期不能超过180天' });
const categoryIdZod = z.number();

export const contentRouter = router({
  create: protectedProcedure
    .use(requireRoles(['admin', 'club']))
    .input(z.object({
      name: nameZod,
      ownerId: idZod,
      duration: durationZod,
      fileType: fileTypeZod,
      S3FileId: S3FileIdZod,
      lifespan: lifespanZod,
      categoryId: categoryIdZod,
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.contentController.create(input);
    }),

  delete: protectedProcedure
    .use(requireRoles(['admin']))
    .input(z.object({ id: idZod }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.contentController.delete(input.id);
    }),

  edit: protectedProcedure
    .use(requireRoles(['admin']))
    .input(z.object({ id: idZod, new_name: nameZod }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.contentController.edit(input.id, input.new_name);
    }),

  list: protectedProcedure
    .use(requireRoles(['admin']))
    .query(async ({ ctx }) => {
      return await ctx.contentController.getList();
    }),
});
