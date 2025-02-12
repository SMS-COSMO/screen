import type { inferAsyncReturnType } from '@trpc/server';
import type { H3Event } from 'h3';
import type { TRawUser } from '../db/db';
import process from 'node:process';
import { db } from '../db/db';
import { ContentController } from './controllers/content';
import { DeviceController } from './controllers/device';
import { PoolController } from './controllers/pool';
import { ProgramController } from './controllers/program';
import { S3Controller } from './controllers/s3';
import { UserController } from './controllers/user';

const newGlobal = globalThis as unknown as {
  userController: UserController | undefined;
  deviceController: DeviceController | undefined;
  programController: ProgramController | undefined;
  contentController: ContentController | undefined;
  poolController: PoolController | undefined;
  s3Controller: S3Controller | undefined;
};

const userController = newGlobal.userController ?? new UserController();
const deviceController = newGlobal.deviceController ?? new DeviceController();
const programController = newGlobal.programController ?? new ProgramController();
const contentController = newGlobal.contentController ?? new ContentController();
const poolController = newGlobal.poolController ?? new PoolController();
const s3Controller = newGlobal.s3Controller ?? new S3Controller();

if (process.env.NODE_ENV !== 'production') {
  newGlobal.userController = userController;
  newGlobal.deviceController = deviceController;
  newGlobal.programController = programController;
  newGlobal.contentController = contentController;
  newGlobal.poolController = poolController;
  newGlobal.s3Controller = s3Controller;
}

interface CreateContextOptions {
  user?: TRawUser;
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use
 * it, you can export it from here
 * @credits https://create.t3.gg/en/usage/trpc#-servertrpccontextts'
 */
export function createInnerContext(opts: CreateContextOptions) {
  return {
    db,
    user: opts.user,
    userController,
    deviceController,
    programController,
    contentController,
    poolController,
    s3Controller,
  };
}

export const ctl = {
  uc: userController,
  dc: deviceController,
  pc: programController,
  cc: contentController,
  oc: poolController,
  s3c: s3Controller,
};

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */
export async function createContext(event: H3Event) {
  const header = getRequestHeader(event, 'Authorization');
  const user = await userController.getUserFromHeader(header);
  return createInnerContext({ user });
}

export type Context = inferAsyncReturnType<typeof createContext>;
