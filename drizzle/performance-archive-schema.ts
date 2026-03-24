import { mysqlTable, mysqlSchema, AnyMySqlColumn, primaryKey, foreignKey, unique, index } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { varchar, text, int, datetime, boolean, decimal, json, timestamp } from "drizzle-orm/mysql-core";

/**
 * Performance Recording Archive Schema
 * Stores all recorded performances, metadata, and playback information
 */

export const performanceRecordings = mysqlTable(
  "performance_recordings",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    performanceId: varchar("performance_id", { length: 36 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    recordingDate: datetime("recording_date").notNull(),
    duration: int("duration").notNull(), // in seconds
    bandMembers: json("band_members").notNull(), // JSON array of band member IDs
    audioUrl: varchar("audio_url", { length: 512 }).notNull(),
    waveformUrl: varchar("waveform_url", { length: 512 }),
    thumbnailUrl: varchar("thumbnail_url", { length: 512 }),
    
    // Metadata
    genre: varchar("genre", { length: 100 }),
    bpm: int("bpm"),
    keySignature: varchar("key_signature", { length: 20 }),
    timeSignature: varchar("time_signature", { length: 20 }),
    
    // Quality metrics
    bitrate: varchar("bitrate", { length: 50 }),
    sampleRate: int("sample_rate"),
    channels: int("channels"),
    
    // Performance stats
    peakLevel: decimal("peak_level", { precision: 5, scale: 2 }),
    averageLevel: decimal("average_level", { precision: 5, scale: 2 }),
    noiseFloor: decimal("noise_floor", { precision: 5, scale: 2 }),
    
    // Tags and organization
    tags: json("tags"), // JSON array of tags
    category: varchar("category", { length: 50 }),
    isPublic: boolean("is_public").default(false),
    isFavorite: boolean("is_favorite").default(false),
    
    // Timestamps
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    performanceIdIdx: index("performance_id_idx").on(table.performanceId),
    recordingDateIdx: index("recording_date_idx").on(table.recordingDate),
    genreIdx: index("genre_idx").on(table.genre),
    categoryIdx: index("category_idx").on(table.category),
  })
);

export const performancePlaybackHistory = mysqlTable(
  "performance_playback_history",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    recordingId: varchar("recording_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    playbackPosition: int("playback_position").notNull(), // in seconds
    totalPlaybackTime: int("total_playback_time").notNull(), // in seconds
    playCount: int("play_count").default(0),
    lastPlayedAt: datetime("last_played_at"),
    
    // User feedback
    rating: int("rating"), // 1-5 stars
    notes: text("notes"),
    
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    recordingIdIdx: index("recording_id_idx").on(table.recordingId),
    userIdIdx: index("user_id_idx").on(table.userId),
  })
);

export const performanceCollaborators = mysqlTable(
  "performance_collaborators",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    recordingId: varchar("recording_id", { length: 36 }).notNull(),
    bandMemberId: varchar("band_member_id", { length: 36 }).notNull(),
    bandMemberName: varchar("band_member_name", { length: 255 }).notNull(),
    instrument: varchar("instrument", { length: 100 }).notNull(),
    trackNumber: int("track_number"),
    soloTrackUrl: varchar("solo_track_url", { length: 512 }),
    
    // Performance metrics
    latency: int("latency"), // in milliseconds
    recordingQuality: varchar("recording_quality", { length: 50 }),
    notes: text("notes"),
    
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    recordingIdIdx: index("recording_id_idx").on(table.recordingId),
    bandMemberIdIdx: index("band_member_id_idx").on(table.bandMemberId),
  })
);

export const performanceVersions = mysqlTable(
  "performance_versions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    recordingId: varchar("recording_id", { length: 36 }).notNull(),
    versionNumber: int("version_number").notNull(),
    audioUrl: varchar("audio_url", { length: 512 }).notNull(),
    
    // Version info
    versionName: varchar("version_name", { length: 255 }),
    description: text("description"),
    isCurrentVersion: boolean("is_current_version").default(false),
    
    // Changes made
    changeLog: text("change_log"),
    editedBy: varchar("edited_by", { length: 36 }),
    editedAt: datetime("edited_at"),
    
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    recordingIdIdx: index("recording_id_idx").on(table.recordingId),
    versionNumberIdx: index("version_number_idx").on(table.versionNumber),
  })
);

export const performanceAnalytics = mysqlTable(
  "performance_analytics",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    recordingId: varchar("recording_id", { length: 36 }).notNull(),
    
    // Playback stats
    totalPlays: int("total_plays").default(0),
    uniqueListeners: int("unique_listeners").default(0),
    totalListeningTime: int("total_listening_time").default(0), // in seconds
    averageListeningDuration: decimal("average_listening_duration", { precision: 8, scale: 2 }),
    
    // Engagement
    likes: int("likes").default(0),
    shares: int("shares").default(0),
    comments: int("comments").default(0),
    
    // Geographic data
    topCountries: json("top_countries"), // JSON array
    topCities: json("top_cities"), // JSON array
    
    // Device data
    topDevices: json("top_devices"), // JSON array
    topBrowsers: json("top_browsers"), // JSON array
    
    // Time data
    peakPlaybackHour: int("peak_playback_hour"),
    peakPlaybackDay: varchar("peak_playback_day", { length: 20 }),
    
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    recordingIdIdx: index("recording_id_idx").on(table.recordingId),
  })
);

export const performanceComments = mysqlTable(
  "performance_comments",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    recordingId: varchar("recording_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    userName: varchar("user_name", { length: 255 }).notNull(),
    
    comment: text("comment").notNull(),
    timestamp: decimal("timestamp", { precision: 10, scale: 2 }), // timestamp in recording where comment was made
    
    // Engagement
    likes: int("likes").default(0),
    replies: int("replies").default(0),
    
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    recordingIdIdx: index("recording_id_idx").on(table.recordingId),
    userIdIdx: index("user_id_idx").on(table.userId),
  })
);

export const performanceExports = mysqlTable(
  "performance_exports",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    recordingId: varchar("recording_id", { length: 36 }).notNull(),
    
    // Export details
    exportFormat: varchar("export_format", { length: 50 }).notNull(), // mp3, wav, flac, etc
    exportQuality: varchar("export_quality", { length: 50 }), // high, medium, low
    exportUrl: varchar("export_url", { length: 512 }).notNull(),
    
    // Metadata
    exportedBy: varchar("exported_by", { length: 36 }).notNull(),
    exportedAt: datetime("exported_at").notNull(),
    
    // File info
    fileSize: int("file_size"), // in bytes
    duration: int("duration"), // in seconds
    
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    recordingIdIdx: index("recording_id_idx").on(table.recordingId),
    exportFormatIdx: index("export_format_idx").on(table.exportFormat),
  })
);

/**
 * Type exports for use in application code
 */
export type PerformanceRecording = typeof performanceRecordings.$inferSelect;
export type NewPerformanceRecording = typeof performanceRecordings.$inferInsert;

export type PerformancePlaybackHistory = typeof performancePlaybackHistory.$inferSelect;
export type NewPerformancePlaybackHistory = typeof performancePlaybackHistory.$inferInsert;

export type PerformanceCollaborator = typeof performanceCollaborators.$inferSelect;
export type NewPerformanceCollaborator = typeof performanceCollaborators.$inferInsert;

export type PerformanceVersion = typeof performanceVersions.$inferSelect;
export type NewPerformanceVersion = typeof performanceVersions.$inferInsert;

export type PerformanceAnalytics = typeof performanceAnalytics.$inferSelect;
export type NewPerformanceAnalytics = typeof performanceAnalytics.$inferInsert;

export type PerformanceComment = typeof performanceComments.$inferSelect;
export type NewPerformanceComment = typeof performanceComments.$inferInsert;

export type PerformanceExport = typeof performanceExports.$inferSelect;
export type NewPerformanceExport = typeof performanceExports.$inferInsert;
