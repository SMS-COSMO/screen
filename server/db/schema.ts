/* eslint-disable ts/no-use-before-define */
import type { UpdateDeleteAction } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const cascade: {
  onUpdate?: UpdateDeleteAction | undefined;
  onDelete?: UpdateDeleteAction | undefined;
} = { onDelete: 'cascade', onUpdate: 'cascade' };

const setNull: {
  onUpdate?: UpdateDeleteAction | undefined;
  onDelete?: UpdateDeleteAction | undefined;
} = { onDelete: 'set null', onUpdate: 'set null' };

// for god's sake why am I copying type declarations
// Anyway, when declaring enums like roles, use this
const roleEnum: Readonly<[string, ...string[]]> = ['admin', 'club', 'lnf'];
const stateEnum: Readonly<[string, ...string[]]> = ['created', 'approved', 'rejected', 'inuse', 'outdated'];

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').unique().notNull(),
  password: text('password').notNull(),
  role: text('role', { enum: roleEnum }).notNull().default('club'),
  description: text('description').default('SMS Student Club'), // default值为调试用
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
  contents: many(contents),
  notifications: many(notificationToUser),
}));

export const programs = sqliteTable('programs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  sequence: text('sequence', { mode: 'json' }).notNull().$type<({ type: 'pool' | 'content'; id: number })[]>(),
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
  expireDate: integer('expireDate', { mode: 'timestamp' }).notNull(),
  state: text('state', { enum: stateEnum }).notNull().default('created'),
  categoryId: integer('category_id').references(() => pools.id, setNull),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  reviewNotes: text('reviewNotes'),
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
  roleRequirement: text('role_requirement', { enum: roleEnum }).notNull().default('club'),
});

export const programsToPools = sqliteTable('programs_to_pools', {
  programId: integer('program_id').notNull().references(() => programs.id, cascade),
  poolId: integer('pool_id').notNull().references(() => pools.id, cascade),
}, t => ({
  pk: primaryKey({ columns: [t.programId, t.poolId] }),
}));

export const programsToPoolsRelations = relations(programsToPools, ({ one }) => ({
  program: one(programs, {
    fields: [programsToPools.programId],
    references: [programs.id],
  }),
  pool: one(pools, {
    fields: [programsToPools.poolId],
    references: [pools.id],
  }),
}));

export const poolsRelations = relations(pools, ({ many }) => ({
  contents: many(contents),
  programsToPools: many(programsToPools),
}));

// 邀请码表
export const invitationCode = sqliteTable('invitationCode', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull(),
  state: integer('state', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// 通知表
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  senderId: integer('sender_id').notNull().references(() => users.id, setNull),
  receiverId: integer('receiver_id').notNull().references(() => users.id, setNull),
  title: text('title').notNull(),
  content: text('content').notNull(),
  unread: integer('unread', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const notificationToUser = sqliteTable('notification_to_user', {
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  notificationId: integer('notification_id').notNull().references(() => notifications.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, t => ({
  pk: primaryKey({ columns: [t.userId, t.notificationId] }),
}));

export const notificationsRelations = relations(notifications, ({ one, many }) => ({
  sender: one(users, {
    fields: [notifications.senderId],
    references: [users.id],
    relationName: 'notificationSender',
  }),
  receiver: one(users, {
    fields: [notifications.receiverId],
    references: [users.id],
    relationName: 'notificationReceiver',
  }),
  notificationToUser: many(notificationToUser),
}));

export const notificationToUserRelations = relations(notificationToUser, ({ one }) => ({
  user: one(users, {
    fields: [notificationToUser.userId],
    references: [users.id],
  }),
  notification: one(notifications, {
    fields: [notificationToUser.notificationId],
    references: [notifications.id],
  }),
}));
