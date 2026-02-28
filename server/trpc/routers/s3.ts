import { z } from 'zod';
import { protectedProcedure, publicProcedure, requireRoles, router } from '../trpc';
import Input from '~/components/ui/input/Input.vue';

const S3FileIdZod = z.string();

export const s3Router = router({
  getUploadURL: protectedProcedure
    .use(requireRoles(['admin', 'club']))
    .input(z.object({ s3FileId: S3FileIdZod }))
    .query(async ({ ctx, input }) => {
      return await ctx.s3Controller.getStandardUploadPresignedUrl(input.s3FileId);
    }),

  getViewURL: protectedProcedure
    .use(requireRoles(['admin', 'club']))
    .input(z.object({ s3FileId: S3FileIdZod }))
    .query(async ({ ctx, input }) => {
      return await ctx.s3Controller.getFileUrl(input.s3FileId);
    }),

  deleteFile: protectedProcedure
    .use(requireRoles(['admin']))
    .input(z.object({ s3FileId: S3FileIdZod }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.s3Controller.deleteFile(input.s3FileId);
    }),

  getFileSize: protectedProcedure
    .use(requireRoles(['admin']))
    .input(z.object({ S3FileId: S3FileIdZod }))
    .query(async ({ ctx, input }) => {
      return await ctx.s3Controller.getFileSize(input.S3FileId);
    }),

  deleteFileAsClub: protectedProcedure
    .use(requireRoles(['admin', 'club']))
    .input(z.object({ s3FileId: S3FileIdZod }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.s3Controller.deleteFileAsClub(input.s3FileId, ctx);
    }),

  getLnfUploadURL: publicProcedure
    .input(z.object({ s3FileId: S3FileIdZod }))
    .query(async ({ ctx, input }) => {
      return await ctx.s3Controller.getStandardUploadPresignedUrl(input.s3FileId);
    }),
});
