import { z } from 'zod';
import { protectedProcedure, requireRoles, router } from '../trpc';

const notificationIdZod = z.number().int().min(1, { message: '通知ID无效' });
const userIdZod = z.number().int().min(1, { message: '用户ID无效' });

export const notificationRouter = router({
  // 获取当前用户的所有通知
  getAllByOwner: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.notificationController.getAllByOwner(ctx.user.id);
    }),

  // 获取当前用户的未读通知
  getUnreadByOwner: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.notificationController.getUnreadByOwner(ctx.user.id);
    }),

  // 创建新通知（仅管理员可用）
  createNotification: protectedProcedure
    .input(z.object({
      receiverId: userIdZod,
      title: z.string().min(1, { message: '通知标题不能为空' }).max(100, { message: '通知标题过长' }),
      content: z.string().min(1, { message: '通知内容不能为空' }).max(1000, { message: '通知内容过长' }),
    }))
    .use(requireRoles(['admin']))
    .mutation(async ({ ctx, input }) => {
      return await ctx.notificationController.createNotification(
        ctx.user.id,
        input.receiverId,
        input.title,
        input.content,
      );
    }),

  // 标记单个通知为已读
  markRead: protectedProcedure
    .input(z.object({
      notificationId: notificationIdZod,
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.notificationController.markRead(ctx.user, input.notificationId);
    }),

  // 批量标记通知为已读
  markMultipleRead: protectedProcedure
    .input(z.object({
      notificationIds: z.array(notificationIdZod).min(1, { message: '至少选择一个通知' }),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.notificationController.markMultipleRead(ctx.user, input.notificationIds);
    }),
});
