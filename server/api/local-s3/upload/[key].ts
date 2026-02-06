import { defineEventHandler, getMethod, getRouterParam, readRawBody, setResponseStatus } from 'h3';
import { env } from '../../../env';
import { S3TestController } from '../../../trpc/controllers/s3Test';

export default defineEventHandler(async (event) => {
  if (!env.ENABLE_S3_MOCK) {
    setResponseStatus(event, 404);
    return 'S3 mock disabled.';
  }

  if (getMethod(event) !== 'PUT') {
    setResponseStatus(event, 405);
    return 'Method Not Allowed';
  }

  const key = getRouterParam(event, 'key');
  if (!key) {
    setResponseStatus(event, 400);
    return 'Missing key';
  }

  const body = await readRawBody(event, false);
  if (!body) {
    setResponseStatus(event, 400);
    return 'Empty body';
  }

  const s3t = new S3TestController();
  const ok = await s3t.putObject(key, body);
  if (!ok) {
    setResponseStatus(event, 500);
    return 'Upload failed';
  }

  return 'OK';
});
