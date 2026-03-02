CREATE TABLE `auto_save_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int NOT NULL,
	`autoSaveEnabled` boolean DEFAULT true,
	`autoSaveInterval` int DEFAULT 60000,
	`maxVersions` int DEFAULT 50,
	`retentionDays` int DEFAULT 30,
	`lastAutoSave` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `auto_save_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `escalation_policies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`triggers` json NOT NULL,
	`actions` json NOT NULL,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `escalation_policies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `filter_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`filterConfig` json NOT NULL,
	`resultCount` int DEFAULT 0,
	`executionTime` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `filter_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `filter_presets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`filterConfig` json NOT NULL,
	`isPublic` boolean DEFAULT false,
	`usageCount` int DEFAULT 0,
	`lastUsed` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `filter_presets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`notificationId` int NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`channel` enum('push','email','sound','webhook') NOT NULL,
	`status` enum('pending','sent','failed','delivered') DEFAULT 'pending',
	`error` text,
	`sentAt` timestamp,
	`deliveredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notification_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`enablePushNotifications` boolean DEFAULT true,
	`enableSoundNotifications` boolean DEFAULT true,
	`enableEmailNotifications` boolean DEFAULT false,
	`soundVolume` int DEFAULT 70,
	`notificationTypes` json,
	`escalationEnabled` boolean DEFAULT true,
	`escalationDelay` int DEFAULT 300000,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int,
	`type` enum('message','tool_execution','task_completion','error','warning','info') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`isRead` boolean DEFAULT false,
	`actionUrl` varchar(2048),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	`archivedAt` timestamp,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`versionNumber` int NOT NULL,
	`snapshot` json NOT NULL,
	`messageCount` int DEFAULT 0,
	`toolExecutionCount` int DEFAULT 0,
	`taskCount` int DEFAULT 0,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int NOT NULL,
	CONSTRAINT `session_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `auto_save_settings` ADD CONSTRAINT `auto_save_settings_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `auto_save_settings` ADD CONSTRAINT `auto_save_settings_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `escalation_policies` ADD CONSTRAINT `escalation_policies_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `filter_history` ADD CONSTRAINT `filter_history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `filter_presets` ADD CONSTRAINT `filter_presets_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification_events` ADD CONSTRAINT `notification_events_notificationId_notifications_id_fk` FOREIGN KEY (`notificationId`) REFERENCES `notifications`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_versions` ADD CONSTRAINT `session_versions_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_versions` ADD CONSTRAINT `session_versions_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;