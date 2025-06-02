import { createClient } from '@libsql/client';

import { drizzle } from 'drizzle-orm/libsql';
import { env } from '../env';
import type {
  contents,
  devices,
  pools,
  programs,
  uploadLimits,
  users,
} from './schema';
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
export type TRawContent = typeof contents.$inferSelect;
export type TNewContent = typeof contents.$inferInsert;
export type TNewPool = typeof pools.$inferInsert;
export type TSequenceUnit = NonNullable<ReturnType<typeof programs.sequence._.data.at>>;
export type TLnfUploadForm = typeof uploadLimits.$inferInsert;
