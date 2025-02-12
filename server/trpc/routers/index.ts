import { router } from '../trpc';
import { contentRouter } from './content';
import { deviceRouter } from './device';
import { poolRouter } from './pool';
import { programRouter } from './program';
import { s3Router } from './s3';
import { userRouter } from './user';

export const appRouter = router({
  user: userRouter,
  device: deviceRouter,
  program: programRouter,
  content: contentRouter,
  pool: poolRouter,
  s3: s3Router,
});

export type AppRouter = typeof appRouter;
