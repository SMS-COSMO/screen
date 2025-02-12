import { TRPCClientError } from '@trpc/client';
import { toast } from 'vue-sonner';
import type { AppRouter } from '~/server/trpc/routers';

export function useIsTRPCClientError(cause: unknown): cause is TRPCClientError<AppRouter> {
  return cause instanceof TRPCClientError;
}

export async function useErrorHandler(err: unknown): Promise<void> {
  if (useIsTRPCClientError(err)) {
    if (err.data?.zodError) {
      for (const issue of err.data.zodError)
        toast.error(issue.message);
    } else {
      toast.error(err.message);
      if (err.message === '用户未登录')
        onNuxtReady(() => navigateTo('/login'));
    }
  } else {
    // console.log(err);
    toast.error('未知错误');
  }
}
