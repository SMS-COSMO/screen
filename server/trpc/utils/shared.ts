import { TRPCError } from '@trpc/server';
import type { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc';
import { customAlphabet } from 'nanoid';

export function requireEqualOrThrow(
  a: any,
  b: any,
  opts?: {
    message?: string;
    cause?: unknown;
    code: TRPC_ERROR_CODE_KEY;
  },
) {
  if (a !== b)
    throw new TRPCError(opts ?? { code: 'FORBIDDEN' });
}

export const TRPCForbidden = new TRPCError({ code: 'FORBIDDEN', message: '超出权限范围' });

export const makeId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12);
