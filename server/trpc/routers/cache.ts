import { z } from 'zod';
import type { ICacheProvider } from '../utils/cacheType';
import { DiskCacheController, MemoryCacheController } from '../controllers/cache';
import { protectedProcedure, requireRoles, router } from '../trpc';

const cacheItemZod = z.object({
  id: z.string(),
  url: z.string(),
  type: z.enum(['image', 'video']),
  createdAt: z.date(),
  size: z.number(),
  lastAccessedAt: z.date(),
  store: z.enum(['disk', 'memory']),
  ttl: z.number().optional(),
  storeRef: z.string().optional(),
});

const cacheIdZod = z.string();
const cachePreloadZod = z.object({
  method: z.string(),
  args: z.array(z.any()).optional(),
});

const adminProcedure = protectedProcedure.use(requireRoles(['admin']));

function createCacheRouter(provider: ICacheProvider) {
  return router({
    getItem: adminProcedure
      .input(z.object({ id: cacheIdZod }))
      .query(async ({ input }) => {
        return await provider.getItem(input.id);
      }),

    getCache: adminProcedure
      .input(z.object({ id: cacheIdZod }))
      .query(async ({ input }) => {
        return await provider.getCache(input.id);
      }),

    setItem: adminProcedure
      .input(z.object({ item: cacheItemZod }))
      .mutation(async ({ input }) => {
        return await provider.setItem(input.item);
      }),

    deleteItem: adminProcedure
      .input(z.object({ id: cacheIdZod }))
      .mutation(async ({ input }) => {
        return await provider.deleteItem(input.id);
      }),

    clearExpiredItems: adminProcedure
      .mutation(async () => {
        return await provider.clearExpiredItems();
      }),

    preload: adminProcedure
      .input(cachePreloadZod)
      .mutation(async ({ input }) => {
        const args = input.args ?? [];
        const result = await provider.preload(input.method, ...args);
        if (result && typeof result === 'object' && Symbol.asyncIterator in result) {
          const progressList = [] as unknown[];
          for await (const progress of result as AsyncGenerator<unknown>) {
            progressList.push(progress);
          }
          return progressList;
        }
        return result;
      }),

    invalidationCache: adminProcedure
      .input(z.object({ id: cacheIdZod }))
      .mutation(async ({ input }) => {
        return await provider.invalidationCache(input.id);
      }),
  });
}

const memoryCache = new MemoryCacheController();
const diskCache = new DiskCacheController();

export const cacheRouter = router({
  memory: createCacheRouter(memoryCache),
  disk: createCacheRouter(diskCache),
});
