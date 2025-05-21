import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '~/server/trpc/routers';

export type RouterOutput = inferRouterOutputs<AppRouter>;
export type RouterInput = inferRouterInputs<AppRouter>;

export type TUserLogin = RouterOutput['user']['login'];

//modify方法对应的类型
export type TUserModify = {
  username: string;
  description: string;
}; 
export type TRole = 'admin' | 'club';
export type TInner = TRole | 'lnf';
