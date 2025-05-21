import process from 'node:process';
import * as readline from 'node:readline/promises';

import { eq } from 'drizzle-orm';
import { db } from '~/server/db/db';
import { pools, users } from '~/server/db/schema';
import { env } from '~/server/env';
import { ctl } from '~/server/trpc/context';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const ans = await rl.question(`Make changes to ${env.DATABASE_CONNECTION_TYPE} - ${env.DATABASE_URL}? [Y/n]\n`);
if (ans === 'n' || ans === 'N')
  process.exit(0);

const admin = await db.select().from(users).where(eq(users.username, 'admin')).get();
if (!admin) {
  const pwd = await rl.question('? Admin password (default: 12345678): ') || '12345678';
  await ctl.uc.createAdmin({
    username: 'admin',
    password: pwd,
  });
  const res = await db.select().from(users).where(eq(users.username, 'admin')).get();
  if (!res) {
    console.log('Failed to create admin');
    process.exit(0)
  }
} else
  console.log('Admin detected. Skipping creation...')

const lnfUser = await db.select().from(users).where(eq(users.username, env.LNF_USER_NAME)).get();
if (!lnfUser) {
  await ctl.uc.createLostnFound();
  const res = await db.select().from(users).where(eq(users.username, env.LNF_USER_NAME)).get();
  if (!res) {
    console.log('Failed to create Lost and Found user');
    process.exit(0)
  }
} else
  console.log('Lost and Found user detected. Skipping creation...')

const lnfPool = await db.select().from(users).where(eq(users.username, env.LNF_USER_NAME)).get();
if (!lnfPool) {
  await ctl.oc.createLnFPool();
  const res = await db.select().from(pools).where(eq(pools.category, env.LNF_POOL_NAME)).get();
  if (!res) {
    console.log('Failed to create Lost and Found category');
    process.exit(0)
  }
} else
  console.log('Lost and Found category detected. Skipping creation...')

process.exit(0);
