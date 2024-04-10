import { z } from 'zod';
import { protectedProcedure, publicProcedure, requireRoles, router } from '../trpc';
import { passwordRegex } from '~/constants/user';

const roleEnumZod = z.enum(['admin', 'club'], { errorMap: () => ({ message: '提交了不存在的用户身份' }) });
const userIdZod = z.string().min(1, { message: '用户不存在' });
const usernameZod = z.string().min(2, { message: '用户名长度应至少为2' }).max(15, { message: '用户名超出长度范围' });
const newPasswordZod = z.string().min(8, { message: '用户密码长度应至少为8' }).regex(passwordRegex, '密码必须包含大小写字母、数字与特殊符号');

export const userRouter = router({
  register: protectedProcedure
    .use(requireRoles(['admin']))
    .input(z.object({
      role: roleEnumZod,
      username: usernameZod,
      password: newPasswordZod,
      groupId: z.string().optional(),
      classId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.userController.register(input);
    }),

  remove: protectedProcedure
    .input(z.object({ id: userIdZod }))
    .use(requireRoles(['admin']))
    .mutation(async ({ ctx, input }) => {
      return await ctx.userController.remove(input.id);
    }),

  modifyPassword: protectedProcedure
    .input(z.object({
      id: userIdZod,
      oldPassword: z.string(),
      newPassword: newPasswordZod,
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.userController.modifyPassword(ctx.user, input.id, input.oldPassword, input.newPassword);
    }),

  login: publicProcedure
    .input(z.object({ username: z.string(), password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.userController.login(input.username, input.password);
    }),

  tokenValidity: protectedProcedure
    .query(() => { }), // protectedProcedure will check if user is logged in

  refreshAccessToken: publicProcedure
    .input(z.object({ username: z.string(), refreshToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.userController.refreshAccessToken(input.refreshToken, input.username);
    }),

  modify: protectedProcedure
    .input(z.object({
      id: userIdZod,
      username: usernameZod,
      role: roleEnumZod,
    }))
    .use(requireRoles(['admin']))
    .mutation(async ({ ctx, input }) => {
      const { id, ...newUser } = input;
      return await ctx.userController.modify(id, newUser);
    }),

  profile: protectedProcedure
    .input(z.object({ id: userIdZod }))
    .query(async ({ ctx, input }) => {
      return await ctx.userController.getProfile(input.id);
    }),

  list: protectedProcedure
    .use(requireRoles(['admin']))
    .query(async ({ ctx }) => {
      return await ctx.userController.getList();
    }),
});
