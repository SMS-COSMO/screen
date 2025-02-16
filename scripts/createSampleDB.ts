import * as readline from 'node:readline/promises';
import process from 'node:process';

import { eq } from 'drizzle-orm';
import { ctl } from '~/server/trpc/context';
import { env } from '~/server/env';
import { db } from '~/server/db/db';
import { users } from '~/server/db/schema';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const ans = await rl.question(`Make changes to ${env.DATABASE_CONNECTION_TYPE} - ${env.DATABASE_URL}? [Y/n]\n`);
if (ans === 'n' || ans === 'N')
  process.exit(0);

const pwd = await rl.question('? Password (default: 12345678): ') || '12345678';
await ctl.uc.register({
  username: 'admin',
  password: pwd,
  role: 'admin',
});

const admin = await db.select().from(users).where(eq(users.username, 'admin')).get();
if (!admin)
  process.exit(0);

process.exit(0);
