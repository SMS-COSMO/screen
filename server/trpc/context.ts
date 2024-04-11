import process from 'node:process';
import type { H3Event } from 'h3';
import type { inferAsyncReturnType } from '@trpc/server';
import { type TRawUser, db } from '../db/db';
import { UserController } from './controllers/user';

const newGlobal = globalThis as unknown as {
  userController: UserController | undefined;
};

const userController = newGlobal.userController ?? new UserController();

if (process.env.NODE_ENV !== 'production')
  newGlobal.userController = userController;

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
  };
}

export const ctl = {
  uc: userController,
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
