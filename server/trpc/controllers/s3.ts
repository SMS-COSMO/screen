import { GetObjectCommand, PutObjectCommand, S3, UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../../env';

export class S3Controller {
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
}
