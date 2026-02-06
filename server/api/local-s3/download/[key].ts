import path from 'node:path';
import process from 'node:process';
import { readFile } from 'node:fs/promises';
import { defineEventHandler, getMethod, getRouterParam, setHeader, setResponseStatus } from 'h3';
import { env } from '../../../env';

export default defineEventHandler(async (event) => {
  if (!env.ENABLE_S3_MOCK) {
    setResponseStatus(event, 404);
    return 'S3 mock disabled.';
  }

  if (getMethod(event) !== 'GET') {
    setResponseStatus(event, 405);
    return 'Method Not Allowed';
  }

  const key = getRouterParam(event, 'key');
  if (!key) {
    setResponseStatus(event, 400);
    return 'Missing key';
  }

  const safeKey = key.replace(/[\\/]/g, '_');
  const filePath = path.join(process.cwd(), 'public', 'local-s3', safeKey);

  try {
    const file = await readFile(filePath);
    setHeader(event, 'Content-Type', 'application/octet-stream');
    setHeader(event, 'Content-Disposition', `attachment; filename="${safeKey}"`);
    return file;
  } catch {
    setResponseStatus(event, 404);
    return 'Not Found';
  }
});
