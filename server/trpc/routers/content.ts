import { z } from 'zod';
import { protectedProcedure, publicProcedure, requireRoles, router } from '../trpc';

const nameZod = z.string()
  .max(30, { message: '内容名不能超过30个字符' });
const idZod = z.number();
const durationZod = z.number()
  .max(90, { message: '内容展示时长不能超过90秒' });
const fileTypeZod = z.string();
const S3FileIdZod = z.string();
const expireDateZod = z.date();
const categoryIdZod = z.number();
const stateEnumZod = z.enum(['created', 'approved', 'rejected', 'inuse', 'outdated'], { errorMap: () => ({ message: '审核状态错误' }) });
const reviewNotesZod = z.string().optional();
const LnFdurationZod = z.number();// 时长暂无限制
const fingerprintZod = z.string();

export const contentRouter = router({
  create: protectedProcedure
    .use(requireRoles(['admin', 'club']))
    .input(z.object({
      name: nameZod,
      ownerId: idZod,
      duration: durationZod,
      fileType: fileTypeZod,
      S3FileId: S3FileIdZod,
      expireDate: expireDateZod,
      categoryId: categoryIdZod,
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.contentController.create(input, ctx);
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
      return await ctx.contentController.getList(ctx);
    }),

  listByCategory: publicProcedure
    .input(z.object({ id: idZod }))
    .query(async ({ ctx, input }) => {
      return await ctx.contentController.getListByCategory(input.id, ctx);
    }),

  getInfo: publicProcedure
    .input(z.object({ id: idZod }))
    .query(async ({ ctx, input }) => {
      return await ctx.contentController.getInfo(input.id);
    }),

  updateInfo: publicProcedure
    .input(z.object({ id: idZod }))
    .query(async ({ ctx, input }) => {
      return await ctx.contentController.updateInfo(input.id, ctx);
    }),

  updateReviewStatus: protectedProcedure
    .use(requireRoles(['admin']))
    .input(z.object({ id: idZod, state: stateEnumZod, reviewNotes: reviewNotesZod }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.contentController.updateReviewStatus(input.id, input.state, input.reviewNotes);
    }),

  getListByOwner: protectedProcedure
    .input(z.object({ ownerId: idZod }))
    .query(async ({ ctx, input }) => {
      return await ctx.contentController.getListByOwner(input.ownerId, ctx);
    }),

  createLostnfound: publicProcedure
    .input(z.object({
      name: nameZod,
      ownerId: idZod,
      duration: LnFdurationZod,
      fileType: fileTypeZod,
      S3FileId: S3FileIdZod,
      expireDate: expireDateZod,
      categoryId: categoryIdZod,
      fingerprint: fingerprintZod,
      date: z.date(),
    }))
    .mutation(async ({ ctx, input }) => {
      // 使用解构分离 fingerprint 和其他属性
      const { fingerprint, date, ...contentInput } = input;
      const uploadForm = { fingerprint, date };
      return await ctx.contentController.createLostnfound(uploadForm, contentInput, ctx, fingerprint);
    }),
});
