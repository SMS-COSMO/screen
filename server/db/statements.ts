import { eq, sql } from 'drizzle-orm';
import { users } from './schema/user';
import { db } from './db';

export const PMemberUsername = db
  .select({ id: users.id, username: users.username })
  .from(users)
  .where(eq(users.id, sql.placeholder('id')))
  .prepare();

export const PGetBasicUser = db
  .select()
  .from(users)
  .where(eq(users.id, sql.placeholder('id')))
  .prepare();
