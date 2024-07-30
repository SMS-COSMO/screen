import { router } from '../trpc';
import { userRouter } from './user';
import { deviceRouter } from './device';
import { programRouter } from './program';
import { contentRouter } from './content';

export const appRouter = router({
  user: userRouter,
  device: deviceRouter,
  program: programRouter,
  content: contentRouter,
});

export type AppRouter = typeof appRouter;
