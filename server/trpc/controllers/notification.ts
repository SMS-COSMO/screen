import { TRPCError } from '@trpc/server';
import { and, eq, inArray } from 'drizzle-orm';
import type { TRawUser } from '../../db/db';
import { db } from '../../db/db';
import { notificationToUser, notifications } from '../../db/schema';
import { TRPCForbidden } from '../../trpc/utils/shared';

export class NotificationController {
  // 获取指定用户的全部通知
  async getAllByOwner(userId: number) {
    try {
      const userNotifications = await db.query.notificationToUser.findMany({
        where: eq(notificationToUser.userId, userId),
        with: {
          notification: {
            with: {
              sender: {
                columns: {
                  id: true,
                  username: true,
                  role: true,
                },
              },
            },
          },
        },
        orderBy: (notificationToUser, { desc }) => [desc(notificationToUser.notificationId)],
      });

      return userNotifications.map(item => ({
        id: item.notification.id,
        title: item.notification.title,
        content: item.notification.content,
        unread: item.notification.unread,
        createdAt: item.notification.createdAt,
        sender: item.notification.sender,
      }));
    } catch {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '获取通知列表失败',
      });
    }
  }

  // 获取指定用户的全部未读通知
  async getUnreadByOwner(userId: number) {
    try {
      const userNotifications = await db.query.notificationToUser.findMany({
        where: eq(notificationToUser.userId, userId),
        with: {
          notification: {
            with: {
              sender: {
                columns: {
                  id: true,
                  username: true,
                  role: true,
                },
              },
            },
          },
        },
        orderBy: (notificationToUser, { desc }) => [desc(notificationToUser.notificationId)],
      });

      // 过滤出未读通知
      return userNotifications
        .filter(item => item.notification && item.notification.unread)
        .map(item => ({
          id: item.notification.id,
          title: item.notification.title,
          content: item.notification.content,
          unread: item.notification.unread,
          createdAt: item.notification.createdAt,
          sender: item.notification.sender,
        }));
    } catch {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '获取未读通知失败',
      });
    }
  }

  // 创建新通知
  async createNotification(
    senderId: number,
    receiverId: number,
    title: string,
    content: string,
  ) {
    try {
      // 创建通知记录
      const [notification] = await db.insert(notifications).values({
        senderId,
        receiverId,
        title,
        content,
        unread: true,
      }).returning();

      // 创建用户-通知关联记录
      await db.insert(notificationToUser).values({
        userId: receiverId,
        notificationId: notification.id,
      });

      return {
        id: notification.id,
        message: '通知创建成功',
      };
    } catch {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '创建通知失败',
      });
    }
  }

  // 标记通知为已读
  async markRead(user: TRawUser, notificationId: number) {
    try {
      // 首先检查通知是否存在
      const notification = await db.query.notifications.findFirst({
        where: eq(notifications.id, notificationId),
      });

      if (!notification) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '通知不存在',
        });
      }

      // 检查用户是否有权限标记此通知（只能标记发给自己的通知）
      const userNotification = await db.query.notificationToUser.findFirst({
        where: and(
          eq(notificationToUser.notificationId, notificationId),
          eq(notificationToUser.userId, user.id),
        ),
      });

      if (!userNotification) {
        throw TRPCForbidden;
      }

      // 标记为已读
      await db.update(notifications)
        .set({ unread: false })
        .where(eq(notifications.id, notificationId));

      return '通知已标记为已读';
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '标记已读失败',
      });
    }
  }

  // 批量标记多个通知为已读
  async markMultipleRead(user: TRawUser, notificationIds: number[]) {
    try {
      // 检查所有通知是否属于当前用户
      const userNotifications = await db.query.notificationToUser.findMany({
        where: eq(notificationToUser.userId, user.id),
      });

      const validNotificationIds = userNotifications.map(un => un.notificationId);
      const invalidIds = notificationIds.filter(id => !validNotificationIds.includes(id));

      if (invalidIds.length > 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '包含无权限访问的通知',
        });
      }

      // 批量标记为已读
      if (notificationIds.length > 0) {
        await db.update(notifications)
          .set({ unread: false })
          .where(inArray(notifications.id, notificationIds));
      }

      return `成功标记 ${notificationIds.length} 条通知为已读`;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '批量标记已读失败',
      });
    }
  }
}
