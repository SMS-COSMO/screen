// 往届写了搞了储存s3File的数据库, 然而env总是在变, 但并不能一直跟进, 导致开发时不太方便
// 于是使用本地数据库实现s3的功能, 便于本地开发
// 附加: 可以使用setDelayedUpload来模拟网络延迟
import path from 'node:path';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { env } from '../../env';
import { db } from '../../db/db';
import { contents } from '../../db/schema';
import type { Context } from '../context';

type UploadBody = ArrayBuffer | Uint8Array | Buffer;

export class S3TestController {
  private readonly baseDir: string;
  private readonly ready: Promise<void>;
  private delayedUploadMs = 0;

  constructor(baseDir: string = path.resolve(process.cwd(), 'public', 'local-s3')) {
    this.baseDir = baseDir;
    this.ready = mkdir(this.baseDir, { recursive: true }).then(() => undefined);
    console.warn(`启用本地S3Mock, 存储路径: ${this.baseDir}`);
  }

  setDelayedUpload(ms: number) {
    this.delayedUploadMs = Math.max(0, ms);
  }

  /**
   * ## 仅内部使用
   *
   * 返回本地上传地址。需要对应的本地上传路由处理 PUT 请求。
   */
  async getStandardUploadPresignedUrl(key: string) {
    await this.ready;
    const safeKey = this.toSafeKey(key);
    return `${env.SERVER_URL}/api/local-s3/upload/${encodeURIComponent(safeKey)}`;
  }

  /**
   * ## 仅内部使用
   *
   * 返回本地访问地址（由 /public/local-s3 提供静态资源）。
   */
  async getFileUrl(key: string) {
    await this.ready;
    const safeKey = this.toSafeKey(key);
    console.warn(`本地S3访问地址: ${env.SERVER_URL}/local-s3/${encodeURIComponent(safeKey)}`);
    return `${env.SERVER_URL}/local-s3/${encodeURIComponent(safeKey)}`;
  }

  async deleteFile(key: string) {
    try {
      await this.ready;
      await unlink(this.getFilePath(key));
      return true;
    } catch {
      return false;
    }
  }

  async deleteFileAsClub(key: string, ctx: Context) {
    const content = await db.query.contents.findFirst({
      where: eq(contents.S3FileId, key),
    });
    if (!content)
      throw new TRPCError({ code: 'BAD_REQUEST', message: '所选内容不存在' });
    if (content.ownerId === ctx.user?.id)
      return await this.deleteFile(key);
    else
      throw new TRPCError({ code: 'UNAUTHORIZED', message: '禁止越权删除内容' });
  }

  /**
   * 本地开发辅助：将上传的字节写入本地存储。
   * 辅助函数不要用在生产环境!
   */
  async putObject(key: string, body: UploadBody) {
    await this.ready;
    if (this.delayedUploadMs > 0)
      await delay(this.delayedUploadMs);
    await writeFile(this.getFilePath(key), Buffer.from(body as any));
    return true;
  }

  private getFilePath(key: string) {
    const safeKey = this.toSafeKey(key);
    return path.join(this.baseDir, safeKey);
  }

  private toSafeKey(key: string) {
    const safe = key.replace(/[^a-z0-9]/gi, '');
    return safe.length > 0 ? safe : 'file';
  }
}

/**
 * 用法示例：
 *
 * const s3t = new S3TestController();
 * s3t.setDelayedUpload(200); // 模拟 200ms 网络延迟
 * const uploadUrl = await s3t.getStandardUploadPresignedUrl('demo.png');
 * const viewUrl = await s3t.getFileUrl('demo.png');
 * await s3t.putObject('demo.png', someArrayBuffer);
 * await s3t.deleteFile('demo.png');
 */
