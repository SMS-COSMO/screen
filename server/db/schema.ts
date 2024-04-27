/* eslint-disable ts/no-use-before-define */
import { relations } from 'drizzle-orm';
import type { UpdateDeleteAction } from 'drizzle-orm/sqlite-core';
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const cascade: {
  onUpdate?: UpdateDeleteAction | undefined;
  onDelete?: UpdateDeleteAction | undefined;
} = { onDelete: 'cascade', onUpdate: 'cascade' };

const setNull: {
  onUpdate?: UpdateDeleteAction | undefined;
  onDelete?: UpdateDeleteAction | undefined;
} = { onDelete: 'set null', onUpdate: 'set null' };

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').unique().notNull(),
  password: text('password').notNull(),
  role: text('role', { enum: ['admin', 'club'] }).notNull().default('club'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
  contents: many(contents),
}));

export const refreshTokens = sqliteTable('refresh_tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  token: text('token').notNull(),
  owner: integer('owner').references(() => users.id, cascade).notNull(),
});

export const programs = sqliteTable('programs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  sequence: text('sequence', { mode: 'json' }).notNull().$type<({ type: string; id: number })[]>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const programsRelations = relations(programs, ({ many }) => ({
  devices: many(devices),
  programsToContents: many(programsToContents),
  programsToPools: many(programsToPools),
}));

export const devices = sqliteTable('devices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  location: text('location').notNull(),
  programId: integer('program_id').references(() => programs.id, setNull),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const devicesRelations = relations(devices, ({ one }) => ({
  program: one(programs, {
    fields: [devices.programId],
    references: [programs.id],
  }),
}));

export const contents = sqliteTable('contents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  ownerId: integer('owned_id').references(() => users.id, cascade).notNull(),
  duration: integer('duration').notNull(), // in seconds
  fileType: text('file_type').notNull(),
  S3FileId: text('s3_file_id').notNull(),
  lifespan: integer('lifespan').notNull(), // in seconds
  state: text('state', { enum: ['created', 'approved', 'rejected', 'inuse', 'outdated'] }).notNull().default('created'),
  categoryId: text('category_id').references(() => pools.id, setNull),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const contentsRelations = relations(contents, ({ one, many }) => ({
  programsToContents: many(programsToContents),
  owner: one(users, {
    fields: [contents.ownerId],
    references: [users.id],
  }),
  pool: one(pools, {
    fields: [contents.categoryId],
    references: [pools.id],
  }),
}));

export const programsToContents = sqliteTable('programs_to_contents', {
  programId: integer('program_id').notNull().references(() => programs.id, cascade),
  contentId: integer('content_id').notNull().references(() => contents.id, cascade),
}, t => ({
  pk: primaryKey({ columns: [t.programId, t.contentId] }),
}));

export const programsToContentsRelations = relations(programsToContents, ({ one }) => ({
  program: one(programs, {
    fields: [programsToContents.programId],
    references: [programs.id],
  }),
  content: one(contents, {
    fields: [programsToContents.contentId],
    references: [contents.id],
  }),
}));

export const pools = sqliteTable('pools', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  category: text('category').notNull(),
});

export const programsToPools = sqliteTable('programs_to_pools', {
  programId: integer('program_id').notNull().references(() => programs.id, cascade),
  poolId: integer('pool_id').notNull().references(() => pools.id, cascade),
}, t => ({
  pk: primaryKey({ columns: [t.programId, t.poolId] }),
}));

export const poolsRelations = relations(pools, ({ many }) => ({
  contents: many(contents),
  programsToPools: many(programsToPools),
}));
