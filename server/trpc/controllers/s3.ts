import { GetObjectCommand, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { env } from '../../env';
import { db } from '../../db/db';
import { contents } from '../../db/schema';
import type { Context } from '../context';
import { S3TestController } from './s3Test';

class S3ControllerBase {
  private s3: S3;
  constructor() {
    this.s3 = new S3({
      endpoint: env.S3_SERVER_URL,
      region: 'global',
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
    });
  }

  /**
   * ## INTERNAL USE ONLY
   *
   * Generates a presigned URL for standard upload to S3.
   * @param key - The key of the object in S3.
   * @returns A Promise that resolves to the presigned URL.
   */
  async getStandardUploadPresignedUrl(key: string) {
    try {
      const putObjectCommand = new PutObjectCommand({
        Bucket: env.BUCKET_NAME,
        Key: key,
      });
      return await getSignedUrl(this.s3, putObjectCommand);
    } catch {
      return false;
    }
  }

  /**
   * ## INTERNAL USE ONLY
   *
   * Retrieves the signed URL for a file with the given key.
   * @param key - The key of the file.
   * @returns The signed URL if successful, otherwise false.
   */
  async getFileUrl(key: string) {
    try {
      return await getSignedUrl(this.s3, new GetObjectCommand({
        Bucket: env.BUCKET_NAME,
        Key: key,
      }));
    } catch {
      return false;
    }
  }

  async deleteFile(key: string) {
    try {
      await this.s3.deleteObject({
        Bucket: env.BUCKET_NAME,
        Key: key,
      });
      return true;
    } catch {
      return false;
    }
  }

  async deleteFileAsClub(key: string, ctx: Context) {
    const content = await db.query.contents.findFirst({ // 检查 所要删除的内容 是否属于 操作的用户
      where: eq(contents.S3FileId, key),
    });
    if (!content)
      throw new TRPCError({ code: 'BAD_REQUEST', message: '所选内容不存在' });
    if (content.ownerId === ctx.user?.id)
      return await this.deleteFile(key);
    else
      throw new TRPCError({ code: 'UNAUTHORIZED', message: '禁止越权删除内容' });
  }
}

const S3Controller = env.ENABLE_S3_MOCK ? S3TestController : S3ControllerBase;

export { S3Controller };
