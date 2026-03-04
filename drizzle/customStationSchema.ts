import { mysqlTable, varchar, text, int, timestamp, json, boolean } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Content type enum
export type ContentType = 'talk' | 'music' | 'news' | 'meditation' | 'healing' | 'entertainment' | 'educational' | 'sports' | 'comedy' | 'mixed';

// Custom Stations (user-created)
export const customStations = mysqlTable('custom_stations', {
  id: int('id').primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  contentTypes: json('content_types').$type<ContentType[]>().notNull(), // Mix of content types
  icon: varchar('icon', { length: 50 }), // Emoji or icon name
  color: varchar('color', { length: 20 }), // Color scheme
  isPublic: boolean('is_public').default(false), // Can be shared with other users
  totalListeners: int('total_listeners').default(0),
  currentListeners: int('current_listeners').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Predefined Station Templates
export const stationTemplates = mysqlTable('station_templates', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  contentTypes: json('content_types').$type<ContentType[]>().notNull(),
  icon: varchar('icon', { length: 50 }).notNull(),
  color: varchar('color', { length: 20 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Station Content Sources (what content to play)
export const stationContentSources = mysqlTable('station_content_sources', {
  id: int('id').primaryKey().autoincrement(),
  stationId: int('station_id').notNull(),
  contentType: varchar('content_type', { length: 50 }).notNull(),
  sourceUrl: varchar('source_url', { length: 500 }).notNull(), // Stream URL or API endpoint
  priority: int('priority').default(1), // Higher priority plays first
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Station Playback History (what's currently playing)
export const stationPlaybackHistory = mysqlTable('station_playback_history', {
  id: int('id').primaryKey().autoincrement(),
  stationId: int('station_id').notNull(),
  contentType: varchar('content_type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  duration: int('duration'), // in seconds
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  listeners: int('listeners').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// User Station Preferences (what stations they've saved/liked)
export const userStationPreferences = mysqlTable('user_station_preferences', {
  id: int('id').primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  stationId: int('station_id').notNull(),
  isFavorite: boolean('is_favorite').default(false),
  lastListenedAt: timestamp('last_listened_at'),
  totalListenTime: int('total_listen_time').default(0), // in seconds
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Station Sharing (share custom stations with other users)
export const stationSharing = mysqlTable('station_sharing', {
  id: int('id').primaryKey().autoincrement(),
  stationId: int('station_id').notNull(),
  ownerId: varchar('owner_id', { length: 255 }).notNull(),
  sharedWithUserId: varchar('shared_with_user_id', { length: 255 }).notNull(),
  permission: varchar('permission', { length: 20 }).default('view'), // view, edit, admin
  createdAt: timestamp('created_at').defaultNow(),
});

// Station Analytics
export const stationAnalytics = mysqlTable('station_analytics', {
  id: int('id').primaryKey().autoincrement(),
  stationId: int('station_id').notNull(),
  date: timestamp('date').notNull(),
  totalListeners: int('total_listeners').default(0),
  peakListeners: int('peak_listeners').default(0),
  totalListenTime: int('total_listen_time').default(0), // in seconds
  uniqueUsers: int('unique_users').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const customStationsRelations = relations(customStations, ({ many }) => ({
  contentSources: many(stationContentSources),
  playbackHistory: many(stationPlaybackHistory),
  userPreferences: many(userStationPreferences),
  sharing: many(stationSharing),
  analytics: many(stationAnalytics),
}));

export const stationContentSourcesRelations = relations(stationContentSources, ({ one }) => ({
  station: one(customStations, {
    fields: [stationContentSources.stationId],
    references: [customStations.id],
  }),
}));

export const stationPlaybackHistoryRelations = relations(stationPlaybackHistory, ({ one }) => ({
  station: one(customStations, {
    fields: [stationPlaybackHistory.stationId],
    references: [customStations.id],
  }),
}));

export const userStationPreferencesRelations = relations(userStationPreferences, ({ one }) => ({
  station: one(customStations, {
    fields: [userStationPreferences.stationId],
    references: [customStations.id],
  }),
}));

export const stationSharingRelations = relations(stationSharing, ({ one }) => ({
  station: one(customStations, {
    fields: [stationSharing.stationId],
    references: [customStations.id],
  }),
}));

export const stationAnalyticsRelations = relations(stationAnalytics, ({ one }) => ({
  station: one(customStations, {
    fields: [stationAnalytics.stationId],
    references: [customStations.id],
  }),
}));
