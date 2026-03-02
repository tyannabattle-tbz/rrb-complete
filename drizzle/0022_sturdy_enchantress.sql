CREATE TABLE `batch_video_jobs` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`jobName` varchar(255) NOT NULL,
	`videoCount` int NOT NULL,
	`processedCount` int DEFAULT 0,
	`status` enum('queued','processing','completed','failed') DEFAULT 'queued',
	`watermarkId` varchar(64),
	`outputFormat` varchar(32) DEFAULT 'mp4',
	`totalDuration` int,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `batch_video_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meditation_progress` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`completedAt` timestamp DEFAULT (now()),
	`durationCompleted` int,
	`rating` int,
	`notes` text,
	CONSTRAINT `meditation_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meditation_sessions` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`audioUrl` varchar(512) NOT NULL,
	`duration` int NOT NULL,
	`category` varchar(64) NOT NULL,
	`frequency` varchar(32),
	`instructor` varchar(255),
	`difficulty` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
	`rating` int,
	`ratingCount` int DEFAULT 0,
	`isFavorite` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meditation_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meditation_stats` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`totalSessions` int DEFAULT 0,
	`totalMinutes` int DEFAULT 0,
	`currentStreak` int DEFAULT 0,
	`bestStreak` int DEFAULT 0,
	`lastSessionAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meditation_stats_id` PRIMARY KEY(`id`),
	CONSTRAINT `meditation_stats_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `podcast_channels` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`feedUrl` varchar(512),
	`imageUrl` varchar(512),
	`category` varchar(64),
	`episodeCount` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `podcast_channels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `podcast_episodes` (
	`id` varchar(64) NOT NULL,
	`channelId` varchar(64) NOT NULL,
	`title` varchar(512) NOT NULL,
	`description` text,
	`audioUrl` varchar(512) NOT NULL,
	`duration` int,
	`publishedAt` timestamp,
	`playCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `podcast_episodes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `podcast_history` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`episodeId` varchar(64) NOT NULL,
	`playedAt` timestamp DEFAULT (now()),
	`duration` int,
	`completed` boolean DEFAULT false,
	CONSTRAINT `podcast_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `qumus_audit_logs` (
	`id` varchar(64) NOT NULL,
	`decisionId` varchar(64) NOT NULL,
	`policyId` varchar(64) NOT NULL,
	`userId` int,
	`action` varchar(255) NOT NULL,
	`inputData` text,
	`outputData` text,
	`confidence` int,
	`autonomousFlag` boolean,
	`result` varchar(64),
	`errorMessage` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `qumus_audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `qumus_autonomous_actions` (
	`id` varchar(64) NOT NULL,
	`decisionId` varchar(64) NOT NULL,
	`policyId` varchar(64) NOT NULL,
	`userId` int,
	`inputData` text,
	`confidence` int NOT NULL,
	`autonomousAction` boolean NOT NULL,
	`result` text,
	`status` enum('pending','executing','completed','failed','escalated') DEFAULT 'pending',
	`executedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `qumus_autonomous_actions_id` PRIMARY KEY(`id`),
	CONSTRAINT `qumus_autonomous_actions_decisionId_unique` UNIQUE(`decisionId`)
);
--> statement-breakpoint
CREATE TABLE `qumus_decision_policies` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`autonomyLevel` int NOT NULL,
	`confidenceThreshold` int DEFAULT 80,
	`triggers` text,
	`escalationRules` text,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `qumus_decision_policies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `qumus_human_review` (
	`id` varchar(64) NOT NULL,
	`decisionId` varchar(64) NOT NULL,
	`policyId` varchar(64) NOT NULL,
	`userId` int,
	`escalationReason` text,
	`inputData` text,
	`recommendedAction` text,
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`status` enum('pending','approved','rejected','expired') DEFAULT 'pending',
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`reviewNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `qumus_human_review_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `qumus_metrics` (
	`id` varchar(64) NOT NULL,
	`policyId` varchar(64) NOT NULL,
	`period` varchar(32) NOT NULL,
	`totalDecisions` int DEFAULT 0,
	`autonomousDecisions` int DEFAULT 0,
	`escalatedDecisions` int DEFAULT 0,
	`successfulDecisions` int DEFAULT 0,
	`failedDecisions` int DEFAULT 0,
	`averageConfidence` int,
	`averageResponseTime` int,
	`autonomyRate` int,
	`escalationRate` int,
	`successRate` int,
	`humanApprovalRate` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `qumus_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studio_metrics` (
	`id` varchar(64) NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`fps` int,
	`bitrate` int,
	`latency` int,
	`cpuUsage` int,
	`memoryUsage` int,
	`networkNodes` int,
	`networkCoverage` int,
	`errorRate` int,
	`recordedAt` timestamp DEFAULT (now()),
	CONSTRAINT `studio_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studio_sessions` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('idle','recording','streaming','processing','completed') DEFAULT 'idle',
	`resolution` varchar(32) DEFAULT '1920x1080',
	`fps` int DEFAULT 60,
	`bitrate` varchar(32) DEFAULT '5000k',
	`uptime` int DEFAULT 0,
	`viewerCount` int DEFAULT 0,
	`startedAt` timestamp,
	`endedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `studio_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `video_watermarks` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`imageUrl` varchar(512) NOT NULL,
	`position` varchar(32) DEFAULT 'bottom-right',
	`opacity` int DEFAULT 80,
	`scale` int DEFAULT 100,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `video_watermarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `batch_video_jobs` ADD CONSTRAINT `batch_video_jobs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `batch_video_jobs` ADD CONSTRAINT `batch_video_jobs_watermarkId_video_watermarks_id_fk` FOREIGN KEY (`watermarkId`) REFERENCES `video_watermarks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meditation_progress` ADD CONSTRAINT `meditation_progress_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meditation_progress` ADD CONSTRAINT `meditation_progress_sessionId_meditation_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `meditation_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meditation_sessions` ADD CONSTRAINT `meditation_sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meditation_stats` ADD CONSTRAINT `meditation_stats_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `podcast_channels` ADD CONSTRAINT `podcast_channels_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `podcast_episodes` ADD CONSTRAINT `podcast_episodes_channelId_podcast_channels_id_fk` FOREIGN KEY (`channelId`) REFERENCES `podcast_channels`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `podcast_history` ADD CONSTRAINT `podcast_history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `podcast_history` ADD CONSTRAINT `podcast_history_episodeId_podcast_episodes_id_fk` FOREIGN KEY (`episodeId`) REFERENCES `podcast_episodes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `qumus_audit_logs` ADD CONSTRAINT `qumus_audit_logs_policyId_qumus_decision_policies_id_fk` FOREIGN KEY (`policyId`) REFERENCES `qumus_decision_policies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `qumus_audit_logs` ADD CONSTRAINT `qumus_audit_logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `qumus_autonomous_actions` ADD CONSTRAINT `qumus_autonomous_actions_policyId_qumus_decision_policies_id_fk` FOREIGN KEY (`policyId`) REFERENCES `qumus_decision_policies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `qumus_autonomous_actions` ADD CONSTRAINT `qumus_autonomous_actions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `qumus_human_review` ADD CONSTRAINT `qumus_human_review_decisionId_qumus_autonomous_actions_decisionId_fk` FOREIGN KEY (`decisionId`) REFERENCES `qumus_autonomous_actions`(`decisionId`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `qumus_human_review` ADD CONSTRAINT `qumus_human_review_policyId_qumus_decision_policies_id_fk` FOREIGN KEY (`policyId`) REFERENCES `qumus_decision_policies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `qumus_human_review` ADD CONSTRAINT `qumus_human_review_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `qumus_human_review` ADD CONSTRAINT `qumus_human_review_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `qumus_metrics` ADD CONSTRAINT `qumus_metrics_policyId_qumus_decision_policies_id_fk` FOREIGN KEY (`policyId`) REFERENCES `qumus_decision_policies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studio_metrics` ADD CONSTRAINT `studio_metrics_sessionId_studio_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `studio_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studio_sessions` ADD CONSTRAINT `studio_sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `video_watermarks` ADD CONSTRAINT `video_watermarks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;