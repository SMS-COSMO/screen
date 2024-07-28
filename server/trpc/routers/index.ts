import { router } from '../trpc';
import { userRouter } from './user';
import { deviceRouter } from './device';
import { programRouter } from './program';

export const appRouter = router({
  user: userRouter,
  device: deviceRouter,
  program: programRouter,
});

export type AppRouter = typeof appRouter;
