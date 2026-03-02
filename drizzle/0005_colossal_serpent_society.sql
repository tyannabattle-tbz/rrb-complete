CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int,
	`action` varchar(255) NOT NULL,
	`resourceType` varchar(64) NOT NULL,
	`resourceId` int,
	`changes` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performance_trends` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL,
	`sessionCount` int DEFAULT 0,
	`averageSessionDuration` int,
	`totalToolExecutions` int DEFAULT 0,
	`averageSuccessRate` decimal(5,2) DEFAULT '0',
	`totalTokensUsed` int DEFAULT 0,
	`estimatedCost` decimal(10,4) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `performance_trends_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quota_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`quotaType` enum('requests','tokens','cost','sessions') NOT NULL,
	`threshold` int NOT NULL,
	`isTriggered` boolean DEFAULT false,
	`lastTriggeredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quota_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rate_limit_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`limitType` enum('requests_per_minute','requests_per_day','tokens_per_request','concurrent_sessions') NOT NULL,
	`limitValue` int NOT NULL,
	`currentValue` int NOT NULL,
	`action` enum('allowed','throttled','blocked') NOT NULL,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rate_limit_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session_annotations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`userId` int NOT NULL,
	`messageId` int,
	`comment` text NOT NULL,
	`type` enum('note','flag','question','suggestion') DEFAULT 'note',
	`resolved` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `session_annotations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`duration` int NOT NULL,
	`messageCount` int DEFAULT 0,
	`toolExecutionCount` int DEFAULT 0,
	`successfulToolExecutions` int DEFAULT 0,
	`failedToolExecutions` int DEFAULT 0,
	`successRate` decimal(5,2) DEFAULT '0',
	`averageToolDuration` int,
	`totalTokensUsed` int DEFAULT 0,
	`costEstimate` decimal(10,4) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `session_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session_shares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`sharedBy` int NOT NULL,
	`sharedWith` int NOT NULL,
	`permission` enum('view','edit','admin') DEFAULT 'view',
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `session_shares_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscription_tiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(64) NOT NULL,
	`displayName` varchar(255) NOT NULL,
	`description` text,
	`monthlyPrice` decimal(10,2) NOT NULL,
	`requestsPerMinute` int NOT NULL,
	`requestsPerDay` int NOT NULL,
	`requestsPerMonth` int NOT NULL,
	`maxConcurrentSessions` int NOT NULL,
	`maxTokensPerRequest` int NOT NULL,
	`features` json NOT NULL,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscription_tiers_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscription_tiers_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('viewer','editor','admin') DEFAULT 'viewer',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `team_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`ownerId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tool_usage_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`toolName` varchar(255) NOT NULL,
	`executionCount` int DEFAULT 0,
	`successCount` int DEFAULT 0,
	`failureCount` int DEFAULT 0,
	`totalDuration` int DEFAULT 0,
	`averageDuration` int,
	`lastUsed` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tool_usage_stats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `usage_quotas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`billingCycleStart` timestamp NOT NULL,
	`billingCycleEnd` timestamp NOT NULL,
	`requestsUsed` int DEFAULT 0,
	`requestsLimit` int NOT NULL,
	`tokensUsed` int DEFAULT 0,
	`tokensLimit` int NOT NULL,
	`sessionsCreated` int DEFAULT 0,
	`sessionsLimit` int NOT NULL,
	`costAccrued` decimal(10,4) DEFAULT '0',
	`costLimit` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `usage_quotas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tierId` int NOT NULL,
	`status` enum('active','inactive','suspended','cancelled') DEFAULT 'active',
	`billingCycleStart` timestamp NOT NULL,
	`billingCycleEnd` timestamp NOT NULL,
	`autoRenew` boolean DEFAULT true,
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `performance_trends` ADD CONSTRAINT `performance_trends_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quota_alerts` ADD CONSTRAINT `quota_alerts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rate_limit_events` ADD CONSTRAINT `rate_limit_events_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_annotations` ADD CONSTRAINT `session_annotations_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_annotations` ADD CONSTRAINT `session_annotations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_annotations` ADD CONSTRAINT `session_annotations_messageId_messages_id_fk` FOREIGN KEY (`messageId`) REFERENCES `messages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_metrics` ADD CONSTRAINT `session_metrics_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_shares` ADD CONSTRAINT `session_shares_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_shares` ADD CONSTRAINT `session_shares_sharedBy_users_id_fk` FOREIGN KEY (`sharedBy`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_shares` ADD CONSTRAINT `session_shares_sharedWith_users_id_fk` FOREIGN KEY (`sharedWith`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_members` ADD CONSTRAINT `team_members_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_members` ADD CONSTRAINT `team_members_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teams` ADD CONSTRAINT `teams_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tool_usage_stats` ADD CONSTRAINT `tool_usage_stats_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `usage_quotas` ADD CONSTRAINT `usage_quotas_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_subscriptions` ADD CONSTRAINT `user_subscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_subscriptions` ADD CONSTRAINT `user_subscriptions_tierId_subscription_tiers_id_fk` FOREIGN KEY (`tierId`) REFERENCES `subscription_tiers`(`id`) ON DELETE no action ON UPDATE no action;