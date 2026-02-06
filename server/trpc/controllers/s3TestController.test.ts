import assert from 'node:assert/strict';
import { mkdtemp, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { it } from 'vitest';

process.env.DATABASE_URL = 'http://localhost:3000';
process.env.DATABASE_CONNECTION_TYPE = 'local';
process.env.DATABASE_AUTH_TOKEN = 'test';
process.env.NODE_ENV = 'development';
process.env.TOKEN_EXPIRATION_TIME = '24h';
process.env.SIGN_PUBLIC_KEY = 'test';
process.env.SIGN_PRIVATE_KEY = 'test';
process.env.ENC_PUBLIC_KEY = 'test';
process.env.ENC_PRIVATE_KEY = 'test';
process.env.SIGN_KID = 'test';
process.env.ENC_KID = 'test';
process.env.SERVER_URL = 'http://localhost:3000';
process.env.S3_SERVER_URL = 'http://localhost:9000';
process.env.S3_ACCESS_KEY_ID = 'test';
process.env.S3_SECRET_ACCESS_KEY = 'test';
process.env.BUCKET_NAME = 'test';
process.env.WEATHER_API_KEY = 'test';
process.env.WEATHER_CITY_CODE = 'test';
process.env.LNF_USER_NAME = 'test';
process.env.LNF_POOL_NAME = 'test';

const { S3TestController } = await import('./s3Test');

it('s3TestController 本地写入/删除', async () => {
  const baseDir = await mkdtemp(path.join(tmpdir(), 's3test-'));
  const ctl = new S3TestController(baseDir);
  const key = 'demo.png';
  const bytes = new Uint8Array([1, 2, 3, 4]);

  const okPut = await ctl.putObject(key, bytes);
  assert.equal(okPut, true);

  const filePath = path.join(baseDir, key);
  await stat(filePath);

  const content = await readFile(filePath);
  assert.deepEqual([...content], [...bytes]);

  const viewUrl = await ctl.getFileUrl(key);
  assert.equal(viewUrl, 'http://localhost:3000/local-s3/demo.png');

  const okDelete = await ctl.deleteFile(key);
  assert.equal(okDelete, true);
});
