import { LibsqlError } from '@libsql/client';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import type { TNewUser, TRawUser } from '../../db/db';
import { db } from '../../db/db';
import { users } from '../../db/schema';
import { TRPCForbidden } from '../../trpc/utils/shared';
import { Auth } from '../utils/auth';

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

  async modifyPassword(user: TRawUser, id: number, oldPassword: string, newPassword: string) {
    if (user.role !== 'admin' && user.id !== id)
      throw TRPCForbidden;

    const targetUser = user.id === id
      ? user
      : await db.query.users.findFirst({ where: eq(users.id, id) });
    if (!targetUser)
      throw new TRPCError({ code: 'NOT_FOUND', message: '用户不存在' });

    if (newPassword === oldPassword)
      throw new TRPCError({ code: 'BAD_REQUEST', message: '新密码不能与旧密码相同' });
    if (!await bcrypt.compare(oldPassword, targetUser.password))
      throw new TRPCError({ code: 'BAD_REQUEST', message: '旧密码不正确' });

    await db.update(users).set({ password: await bcrypt.hash(newPassword, 8) }).where(eq(users.id, id));
    return '修改成功';
  }

  async login(username: string, password: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    if (!(user && (await bcrypt.compare(password, user.password))))
      throw new TRPCError({ code: 'UNAUTHORIZED', message: '用户名或密码错误' });

    const accessToken = await this.auth.produceAccessToken(user.id);

    const {
      password: _password,
      ...info
    } = user;

    return {
      ...info,
      accessToken,
    };
  }

  async modify(id: number, newUser: Partial<Omit<TRawUser, 'password' | 'createdAt'>>) {
    await db.update(users).set(newUser).where(eq(users.id, id));
    return '修改成功';
  }

  async getProfile(id: number) {
    const basicUser = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    if (!basicUser)
      throw new TRPCError({ code: 'NOT_FOUND', message: '用户不存在' });

    const {
      password: _password,
      ...info
    } = basicUser;

    return info;
  }

  async getList() {
    const res = await db.query.users.findMany();
    return res.map((user) => {
      const {
        password: _password,
        ...info
      } = user;

      return info;
    });
  }

  async remove(id: number) {
    try {
      await db.delete(users).where(eq(users.id, id));
      return '删除成功';
    } catch {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '删除失败' });
    }
  }
}
