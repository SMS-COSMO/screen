import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { env } from '../env';

import type { contents, devices, programs, users } from './schema';
import * as schema from './schema';

const options = (() => {
  switch (env.DATABASE_CONNECTION_TYPE) {
    case 'local': return { url: env.DATABASE_URL };
    case 'remote': return { url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN };
  }
})();

const client = createClient(options);
export const db = drizzle(client, { schema });

export type TRawUser = typeof users.$inferSelect;
export type TNewUser = typeof users.$inferInsert;
export type TNewDevice = typeof devices.$inferInsert;
export type TNewProgram = typeof programs.$inferInsert;
export type TNewContent = typeof contents.$inferInsert;
