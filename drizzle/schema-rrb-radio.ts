/**
 * RRB Radio Station Database Schema
 * Complete radio broadcasting infrastructure for Rockin' Rockin' Boogie
 * Integrated with Qumus for autonomous scheduling and management
 */

import { sqliteTable, text, integer, real, boolean, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

/**
 * Radio Channels
 * Different broadcast channels (main, healing frequencies, emergency, etc.)
 */
export const radioChannels = sqliteTable(
  'radio_channels',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(), // "Main Station", "Healing Frequencies", "Emergency"
    slug: text('slug').notNull().unique(),
    description: text('description'),
    frequency: real('frequency').notNull().default(432), // Hz (default 432Hz)
    streamUrl: text('stream_url').notNull(),
    backupStreamUrl: text('backup_stream_url'),
    bitrate: integer('bitrate').notNull().default(128), // kbps
    format: text('format').notNull().default('mp3'), // mp3, aac, flac
    isLive: boolean('is_live').notNull().default(false),
    currentListeners: integer('current_listeners').notNull().default(0),
    totalListeners: integer('total_listeners').notNull().default(0),
    status: text('status').notNull().default('active'), // active, maintenance, offline
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    slugIdx: index('radio_channels_slug_idx').on(table.slug),
    statusIdx: index('radio_channels_status_idx').on(table.status),
  })
);

/**
 * Radio Shows/Programs
 * Scheduled shows and programs on each channel
 */
export const radioShows = sqliteTable(
  'radio_shows',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    channelId: integer('channel_id')
      .notNull()
      .references(() => radioChannels.id),
    title: text('title').notNull(),
    description: text('description'),
    host: text('host'),
    duration: integer('duration').notNull(), // minutes
    frequency: text('frequency').notNull(), // daily, weekly, monthly
    dayOfWeek: integer('day_of_week'), // 0-6 for weekly shows
    startTime: text('start_time').notNull(), // HH:MM format
    endTime: text('end_time').notNull(),
    genre: text('genre'),
    imageUrl: text('image_url'),
    isArchived: boolean('is_archived').notNull().default(false),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    channelIdx: index('radio_shows_channel_idx').on(table.channelId),
    frequencyIdx: index('radio_shows_frequency_idx').on(table.frequency),
  })
);

/**
 * Broadcast Episodes
 * Individual episodes/broadcasts of shows
 */
export const broadcastEpisodes = sqliteTable(
  'broadcast_episodes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    showId: integer('show_id')
      .notNull()
      .references(() => radioShows.id),
    channelId: integer('channel_id')
      .notNull()
      .references(() => radioChannels.id),
    title: text('title').notNull(),
    description: text('description'),
    audioUrl: text('audio_url').notNull(),
    duration: integer('duration').notNull(), // seconds
    fileSize: integer('file_size'), // bytes
    format: text('format').notNull().default('mp3'),
    bitrate: integer('bitrate').notNull().default(128),
    playCount: integer('play_count').notNull().default(0),
    downloadCount: integer('download_count').notNull().default(0),
    broadcastDate: text('broadcast_date').notNull(),
    broadcastStartTime: text('broadcast_start_time'),
    broadcastEndTime: text('broadcast_end_time'),
    isLive: boolean('is_live').notNull().default(false),
    isArchived: boolean('is_archived').notNull().default(false),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    showIdx: index('broadcast_episodes_show_idx').on(table.showId),
    channelIdx: index('broadcast_episodes_channel_idx').on(table.channelId),
    dateIdx: index('broadcast_episodes_date_idx').on(table.broadcastDate),
  })
);

/**
 * Listeners/Users
 * Radio listeners and their preferences
 */
export const radioListeners = sqliteTable(
  'radio_listeners',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id').references(() => users.id),
    username: text('username'),
    email: text('email'),
    favoriteChannelId: integer('favorite_channel_id').references(() => radioChannels.id),
    totalListeningHours: real('total_listening_hours').notNull().default(0),
    lastListenedAt: text('last_listened_at'),
    isSubscribed: boolean('is_subscribed').notNull().default(false),
    notificationsEnabled: boolean('notifications_enabled').notNull().default(true),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdx: index('radio_listeners_user_idx').on(table.userId),
    emailIdx: index('radio_listeners_email_idx').on(table.email),
  })
);

/**
 * Listener Preferences
 * Per-listener channel and show preferences
 */
export const listenerPreferences = sqliteTable(
  'listener_preferences',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    listenerId: integer('listener_id')
      .notNull()
      .references(() => radioListeners.id),
    channelId: integer('channel_id')
      .notNull()
      .references(() => radioChannels.id),
    isFavorite: boolean('is_favorite').notNull().default(false),
    notifyOnNewEpisode: boolean('notify_on_new_episode').notNull().default(false),
    autoPlay: boolean('auto_play').notNull().default(false),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    listenerChannelIdx: index('listener_preferences_listener_channel_idx').on(
      table.listenerId,
      table.channelId
    ),
  })
);

/**
 * Listening History
 * Track what listeners have listened to
 */
export const listeningHistory = sqliteTable(
  'listening_history',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    listenerId: integer('listener_id')
      .notNull()
      .references(() => radioListeners.id),
    episodeId: integer('episode_id')
      .notNull()
      .references(() => broadcastEpisodes.id),
    channelId: integer('channel_id')
      .notNull()
      .references(() => radioChannels.id),
    startedAt: text('started_at').notNull(),
    endedAt: text('ended_at'),
    secondsListened: integer('seconds_listened').notNull().default(0),
    completed: boolean('completed').notNull().default(false),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    listenerIdx: index('listening_history_listener_idx').on(table.listenerId),
    episodeIdx: index('listening_history_episode_idx').on(table.episodeId),
    dateIdx: index('listening_history_date_idx').on(table.startedAt),
  })
);

/**
 * Broadcast Schedule
 * Qumus-managed schedule for 24/7 airwave population
 */
export const broadcastSchedule = sqliteTable(
  'broadcast_schedule',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    channelId: integer('channel_id')
      .notNull()
      .references(() => radioChannels.id),
    episodeId: integer('episode_id')
      .notNull()
      .references(() => broadcastEpisodes.id),
    scheduledStartTime: text('scheduled_start_time').notNull(),
    scheduledEndTime: text('scheduled_end_time').notNull(),
    actualStartTime: text('actual_start_time'),
    actualEndTime: text('actual_end_time'),
    status: text('status').notNull().default('scheduled'), // scheduled, broadcasting, completed, failed
    priority: integer('priority').notNull().default(5), // 1-10
    qumusDecisionId: text('qumus_decision_id'), // Reference to Qumus policy decision
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    channelIdx: index('broadcast_schedule_channel_idx').on(table.channelId),
    statusIdx: index('broadcast_schedule_status_idx').on(table.status),
    timeIdx: index('broadcast_schedule_time_idx').on(table.scheduledStartTime),
  })
);

/**
 * Stream Health Metrics
 * Monitor stream quality and availability
 */
export const streamHealthMetrics = sqliteTable(
  'stream_health_metrics',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    channelId: integer('channel_id')
      .notNull()
      .references(() => radioChannels.id),
    timestamp: text('timestamp')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    uptime: real('uptime').notNull(), // percentage
    bitrate: integer('bitrate'),
    listeners: integer('listeners').notNull().default(0),
    errors: integer('errors').notNull().default(0),
    latency: integer('latency'), // milliseconds
    bandwidth: real('bandwidth'), // Mbps
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    channelIdx: index('stream_health_metrics_channel_idx').on(table.channelId),
    timeIdx: index('stream_health_metrics_time_idx').on(table.timestamp),
  })
);

/**
 * Relations
 */
export const radioChannelsRelations = relations(radioChannels, ({ many }) => ({
  shows: many(radioShows),
  episodes: many(broadcastEpisodes),
  schedules: many(broadcastSchedule),
  metrics: many(streamHealthMetrics),
}));

export const radioShowsRelations = relations(radioShows, ({ one, many }) => ({
  channel: one(radioChannels, {
    fields: [radioShows.channelId],
    references: [radioChannels.id],
  }),
  episodes: many(broadcastEpisodes),
}));

export const broadcastEpisodesRelations = relations(broadcastEpisodes, ({ one, many }) => ({
  show: one(radioShows, {
    fields: [broadcastEpisodes.showId],
    references: [radioShows.id],
  }),
  channel: one(radioChannels, {
    fields: [broadcastEpisodes.channelId],
    references: [radioChannels.id],
  }),
  listeningHistory: many(listeningHistory),
  schedules: many(broadcastSchedule),
}));

export const radioListenersRelations = relations(radioListeners, ({ one, many }) => ({
  user: one(users, {
    fields: [radioListeners.userId],
    references: [users.id],
  }),
  preferences: many(listenerPreferences),
  history: many(listeningHistory),
}));

export const listenerPreferencesRelations = relations(listenerPreferences, ({ one }) => ({
  listener: one(radioListeners, {
    fields: [listenerPreferences.listenerId],
    references: [radioListeners.id],
  }),
  channel: one(radioChannels, {
    fields: [listenerPreferences.channelId],
    references: [radioChannels.id],
  }),
}));

export const listeningHistoryRelations = relations(listeningHistory, ({ one }) => ({
  listener: one(radioListeners, {
    fields: [listeningHistory.listenerId],
    references: [radioListeners.id],
  }),
  episode: one(broadcastEpisodes, {
    fields: [listeningHistory.episodeId],
    references: [broadcastEpisodes.id],
  }),
  channel: one(radioChannels, {
    fields: [listeningHistory.channelId],
    references: [radioChannels.id],
  }),
}));

export const broadcastScheduleRelations = relations(broadcastSchedule, ({ one }) => ({
  channel: one(radioChannels, {
    fields: [broadcastSchedule.channelId],
    references: [radioChannels.id],
  }),
  episode: one(broadcastEpisodes, {
    fields: [broadcastSchedule.episodeId],
    references: [broadcastEpisodes.id],
  }),
}));

export const streamHealthMetricsRelations = relations(streamHealthMetrics, ({ one }) => ({
  channel: one(radioChannels, {
    fields: [streamHealthMetrics.channelId],
    references: [radioChannels.id],
  }),
}));

// Note: 'users' table is imported from main schema
// This schema extends the main schema with RRB-specific tables
