import { router } from '../trpc';
import { userRouter } from './user';
import { deviceRouter } from './device';
import { programRouter } from './program';
import { contentRouter } from './content';
import { poolRouter } from './pool';
import { s3Router } from './s3';

export const appRouter = router({
  user: userRouter,
  device: deviceRouter,
  program: programRouter,
  content: contentRouter,
  pool: poolRouter,
  s3: s3Router,
});

export type AppRouter = typeof appRouter;
