// 操作邀请码数据库
import { customAlphabet } from 'nanoid';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { db } from '../../db/db';
import { invitationCode } from '../../db/schema';
import type { Context } from '../context';

interface Code {
  id: number;
  code: string;
  state: boolean;
  createdAt: Date;
}

class ListCode {
  /**
   * 根据关键字查询邀请代码的信息。
   *
   * @param key 查询使用的关键字。
   * @param option 可选参数，指定要查询的字段。默认值为 'code'，可选值包括 'code'、'state'、'id' 和 'createdAt'。
   * @param findWay 可选参数，指定查询方式。默认值为 'first'，'first' 表示查询第一个满足条件的记录，'all' 表示查询所有满足条件的记录。
   * @returns 根据查询方式返回单个记录（当 findWay 为 'first'）或记录数组（当 findWay 为 'all'）。
   */
  public async search(key: string | boolean, option?: 'code' | 'state' | 'id' | 'createdAt' | undefined, findWay?: 'first' | 'all' | 'many' | undefined) {
    // 用于查询的通用函数, option用于选择字段
    // key为查询的关键字
    if (!option)
      option = 'code';
    if (!findWay)
      findWay = 'first';
    const field = invitationCode[option];
    let result: Code[];
    let temp;
    switch (findWay) {
      case 'first':
        temp = await db.query.invitationCode.findFirst({ where: eq(field, key) });
        if (!temp) {
          throw new TRPCError({ code: 'NOT_FOUND', message: `邀请码不存在` });
        }
        result = [temp];
        break;
      case 'many':
        result = await db.query.invitationCode.findMany({ where: eq(field, key) });
        break;
      case 'all':
        // 为了防止意外的调用了all, 这里要求调用all是key必须为'all'
        if (key !== 'all')
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'key must be undefined when findWay is all' });
        result = await db.query.invitationCode.findMany();
        break;
      default:
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid findWay parameter' });
    }
    if (!result)
      throw new TRPCError({ code: 'NOT_FOUND', message: `邀请码不存在` });
    return result;
  }

  public async listAll() {
    // 列出所有的邀请码
    return await this.search('all', undefined, 'all');
  }

  public async listUsed() {
    // 列出所有已使用的邀请码
    return await this.search(true, 'state', 'many');
  }

  public async listSpare() {
    // 列出所有未使用的邀请码
    return await this.search(false, 'state', 'many');
  }
}

class MutateCode {
  // 用于修改操作的类
  private list: ListCode; // 欲修改, 先查询
  constructor() {
    this.list = new ListCode();
  }

  /**
   * 使邀请码失效。
   *
   * 此方法用于检查并将指定的邀请码状态设置为失效。如果邀请码已经失效，则会抛出 TRPCError 异常。
   *
   * @param code - 要使其失效的邀请码字符串。
   * @throws {TRPCError} 当邀请码状态已为失效时抛出该错误，错误代码为 'BAD_REQUEST'。
   * @returns 返回一个表示修改成功的字符串。
   */
  public async invalidateCode(code: string) {
    // 进行检查
    const codeInfo = await this.list.search(code, 'code', 'first');
    if (codeInfo[0].state === true) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: '邀请码已经失效' });
    }
    await db.update(invitationCode).set({ state: true }).where(eq(invitationCode.code, code)).execute();
    return '修改成功';
  }

  public async addCode(Code: string) {
    // 用于添加邀请码
    // 查重
    try {
      await this.list.search(Code, 'code', 'first');
    } catch (e: any) {
      if (e.code === 'NOT_FOUND') {
        // 此处本为!==，猜测是小错误
        // 说明不存在, 可以添加
        db.insert(invitationCode).values({ code: Code }).execute();
        return '添加完成';
      } else {
        throw new TRPCError(e);
      }
    }
  }
}

// 用于检查用户是否有权限使用邀请码的类
class UserChecker {
  private async getUserInfo(ctx: Context) {
    // 获取当前用户信息
    const currentUser = await ctx.userController.getList();
    return currentUser[0];
  }

  public async checkRole(target: 'admin' | 'club' = 'admin', ctx: Context) {
    // 按照传入的要求进行检查用户权限
    const userInfo = await this.getUserInfo(ctx);
    if (userInfo.role !== target) {
      return false;
    }
    return true;
  }

  public async autoCheckAdmin(ctx: Context) {
    // 无参数自动处理越权访问
    const userInfo = await this.getUserInfo(ctx);
    if (userInfo.role !== 'admin') {
      throw new TRPCError({ code: 'FORBIDDEN', message: '用户没有权限使用邀请码' });
    }
    return true;
  }
}

export class CodeController {
  private user: UserChecker;
  private list: ListCode;
  private mutate: MutateCode;
  constructor() {
    this.list = new ListCode();
    this.mutate = new MutateCode();
    this.user = new UserChecker();
  }

  public async generateBatchCode(batch: number, ctx: Context) {
    await this.user.autoCheckAdmin(ctx); // 检查用户权限
    // 生成随机数 包含字母与数字, batch为生成的数量
    const nanoid30 = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 30);
    const codes = Array.from({ length: batch }, () => nanoid30());
    return codes;
  }

  public async addCodeBatch(batch: string[], ctx: Context) {
    // 权限
    await this.user.autoCheckAdmin(ctx);
    // 批量添加邀请码
    for (const code of batch) {
      await this.mutate.addCode(code);
    }
    return '批量添加完成';
  }

  public async invalidateCode(code: string) {
    // 不需要权限
    // 使邀请码失效
    return await this.mutate.invalidateCode(code);
  }

  public async listAll(ctx: Context) {
    // 权限
    await this.user.autoCheckAdmin(ctx);
    // 列出所有邀请码
    return await this.list.listAll();
  }

  public async listUsed(ctx: Context) {
    // 权限
    await this.user.autoCheckAdmin(ctx);
    // 列出所有已使用的邀请码
    return await this.list.listUsed();
  }

  public async listSpare(ctx: Context) {
    // 权限
    await this.user.autoCheckAdmin(ctx);
    // 列出所有未使用的邀请码
    return await this.list.listSpare();
  }

  public isCodeExist(code: string) {
    // 检查邀请码是否存在
    return this.list.search(code, 'code', 'first')
      .then(() => true)
      .catch(() => false);
  }

  public isCodeUsed(code: string): Promise<boolean> {
    // 检查邀请码是否被使用
    return this.list.search(code, 'code', 'first')
      .then(result => result[0].state)
      .catch(() => false);
  }
}
