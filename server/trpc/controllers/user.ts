import { LibsqlError } from '@libsql/client';
import bcrypt from 'bcrypt';
import { and, eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { TNewUser, TRawUser } from '../../db/db';
import { db } from '../../db/db';
import { refreshTokens, users } from '../../db/schema/user';
import { Auth } from '../utils/auth';
import { TRPCForbidden, useTry } from '../../trpc/utils/shared';
import { PGetBasicUser } from '~/server/db/statements';

export class UserController {
  private auth: Auth;
  constructor() {
    this.auth = new Auth();
  }

  async getUserFromHeader(authorization: string | undefined) {
    if (!authorization)
      return undefined;
    const result = await this.auth.getUserFromToken(authorization);
    if (result.err)
      return undefined;
    return result.user;
  }

  async register(newUser: TNewUser) {
    const { username, password, role } = newUser;
    const hash = await bcrypt.hash(password, 8);
    const user = { username, password: hash, role };
    try {
      await db.insert(users).values(user);
      return '注册成功';
    } catch (err) {
      if (err instanceof LibsqlError && err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY')
        throw new TRPCError({ code: 'BAD_REQUEST', message: '学工号出现重复' });
      else
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '注册失败' });
    }
  }

  async modifyPassword(user: TRawUser, id: string, oldPassword: string, newPassword: string) {
    if (!['admin', 'teacher'].includes(user.role) && user.id !== id)
      throw TRPCForbidden;

    const targetUser = user.id === id
      ? user
      : await useTry(() => db.select().from(users).where(eq(users.id, id)).get());
    if (!targetUser)
      throw new TRPCError({ code: 'NOT_FOUND', message: '用户不存在' });

    if (newPassword === oldPassword)
      throw new TRPCError({ code: 'BAD_REQUEST', message: '新密码不能与旧密码相同' });
    if (!await bcrypt.compare(oldPassword, targetUser.password))
      throw new TRPCError({ code: 'BAD_REQUEST', message: '旧密码不正确' });

    await useTry(async () => db.update(users).set({ password: await bcrypt.hash(newPassword, 8) }).where(eq(users.id, id)));
    return '修改成功';
  }

  async login(username: string, password: string) {
    const user = await useTry(async () => db.select().from(users).where(eq(users.username, username)).get());
    if (!(user && (await bcrypt.compare(password, user.password))))
      throw new TRPCError({ code: 'UNAUTHORIZED', message: '用户名或密码错误' });

    const accessToken = await this.auth.produceAccessToken(user.id);
    const refreshToken = await this.auth.produceRefreshToken(user.id);
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string, id: string) {
    const token = await useTry(
      async () => db
        .delete(refreshTokens)
        .where(and(eq(refreshTokens.token, refreshToken), eq(refreshTokens.owner, id)))
        .returning(),
    );
    if (!token[0])
      throw new TRPCError({ code: 'UNAUTHORIZED', message: '请重新登陆' });

    const newRefreshToken = await this.auth.produceRefreshToken(id);
    const newAccessToken = await this.auth.produceAccessToken(id);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async modify(id: string, newUser: Partial<Omit<TRawUser, 'password' | 'createdAt'>>) {
    await useTry(() => db.update(users).set(newUser).where(eq(users.id, id)));
    return '修改成功';
  }

  async getProfile(id: string) {
    return await useTry(() => PGetBasicUser.get({ id }));
  }

  async getList() {
    return await useTry(() => db.select().from(users).all());
  }

  async remove(id: string) {
    try {
      await db.delete(users).where(eq(users.id, id));
      return '删除成功';
    } catch (err) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '删除失败' });
    }
  }
}
