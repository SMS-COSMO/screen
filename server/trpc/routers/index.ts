import { router } from '../trpc';
import { userRouter } from './user';
import { deviceRouter } from './device';

export const appRouter = router({
  user: userRouter,
  device: deviceRouter,
});

export type AppRouter = typeof appRouter;
