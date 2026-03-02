import { sqliteTable, text, integer, real, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

/**
 * Content Schedule Schema
 * Manages 24/7 content scheduling for radio, video, podcasts, and commercials
 */

export const contentTypes = sqliteTable('content_types', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // 'radio', 'video', 'podcast', 'commercial'
  description: text('description'),
  createdAt: integer('created_at').notNull(),
});

export const contentLibrary = sqliteTable('content_library', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  contentTypeId: text('content_type_id').notNull().references(() => contentTypes.id),
  duration: integer('duration').notNull(), // in seconds
  fileUrl: text('file_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  metadata: text('metadata'), // JSON: artist, album, genre, etc.
  isActive: integer('is_active').default(1),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const scheduleSlots = sqliteTable('schedule_slots', {
  id: text('id').primaryKey(),
  dayOfWeek: integer('day_of_week').notNull(), // 0-6 (Sunday-Saturday)
  startTime: text('start_time').notNull(), // HH:MM format
  endTime: text('end_time').notNull(), // HH:MM format
  contentTypeId: text('content_type_id').notNull().references(() => contentTypes.id),
  priority: integer('priority').default(0), // Higher = more important
  isActive: integer('is_active').default(1),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
}, (table) => ({
  dayTimeIdx: index('schedule_day_time_idx').on(table.dayOfWeek, table.startTime),
}));

export const scheduleContent = sqliteTable('schedule_content', {
  id: text('id').primaryKey(),
  scheduleSlotId: text('schedule_slot_id').notNull().references(() => scheduleSlots.id),
  contentId: text('content_id').notNull().references(() => contentLibrary.id),
  sequenceOrder: integer('sequence_order').notNull(),
  weight: real('weight').default(1.0), // For weighted random selection
  isActive: integer('is_active').default(1),
  createdAt: integer('created_at').notNull(),
}, (table) => ({
  slotContentIdx: index('schedule_content_slot_idx').on(table.scheduleSlotId),
}));

export const commercialRotation = sqliteTable('commercial_rotation', {
  id: text('id').primaryKey(),
  contentId: text('content_id').notNull().references(() => contentLibrary.id),
  rotationFrequency: integer('rotation_frequency').notNull(), // minutes between plays
  maxPlaysPerDay: integer('max_plays_per_day').notNull(),
  currentPlaysToday: integer('current_plays_today').default(0),
  lastPlayedAt: integer('last_played_at'),
  isActive: integer('is_active').default(1),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
}, (table) => ({
  commercialActiveIdx: index('commercial_active_idx').on(table.isActive),
}));

export const broadcastLog = sqliteTable('broadcast_log', {
  id: text('id').primaryKey(),
  contentId: text('content_id').notNull().references(() => contentLibrary.id),
  startTime: integer('start_time').notNull(),
  endTime: integer('end_time').notNull(),
  duration: integer('duration').notNull(),
  listeners: integer('listeners').default(0),
  engagementScore: real('engagement_score').default(0),
  status: text('status').notNull(), // 'scheduled', 'playing', 'completed', 'failed'
  errorMessage: text('error_message'),
  createdAt: integer('created_at').notNull(),
}, (table) => ({
  statusIdx: index('broadcast_log_status_idx').on(table.status),
  timeIdx: index('broadcast_log_time_idx').on(table.startTime),
}));

export const schedulePresets = sqliteTable('schedule_presets', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  scheduleConfig: text('schedule_config').notNull(), // JSON: full schedule definition
  isDefault: integer('is_default').default(0),
  isActive: integer('is_active').default(1),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const qumusSchedulePolicy = sqliteTable('qumus_schedule_policy', {
  id: text('id').primaryKey(),
  policyName: text('policy_name').notNull(),
  description: text('description'),
  rules: text('rules').notNull(), // JSON: scheduling rules and constraints
  autonomyLevel: integer('autonomy_level').default(90), // 0-100: % autonomous
  humanOverrideEnabled: integer('human_override_enabled').default(1),
  isActive: integer('is_active').default(1),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// Relations
export const contentLibraryRelations = relations(contentLibrary, ({ one, many }) => ({
  contentType: one(contentTypes, {
    fields: [contentLibrary.contentTypeId],
    references: [contentTypes.id],
  }),
  scheduleContent: many(scheduleContent),
  commercialRotation: many(commercialRotation),
  broadcastLog: many(broadcastLog),
}));

export const scheduleSlotRelations = relations(scheduleSlots, ({ one, many }) => ({
  contentType: one(contentTypes, {
    fields: [scheduleSlots.contentTypeId],
    references: [contentTypes.id],
  }),
  scheduleContent: many(scheduleContent),
}));

export const scheduleContentRelations = relations(scheduleContent, ({ one }) => ({
  scheduleSlot: one(scheduleSlots, {
    fields: [scheduleContent.scheduleSlotId],
    references: [scheduleSlots.id],
  }),
  content: one(contentLibrary, {
    fields: [scheduleContent.contentId],
    references: [contentLibrary.id],
  }),
}));
