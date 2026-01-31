CREATE TABLE `analytics_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int,
	`tokensUsed` int,
	`costUSD` decimal(10,4),
	`modelUsed` varchar(64),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `premium_features` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeCustomerId` varchar(255),
	`subscriptionId` varchar(255),
	`tier` enum('free','pro','enterprise') DEFAULT 'free',
	`tokensPerMonth` int DEFAULT 100000,
	`tokensUsedThisMonth` int DEFAULT 0,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `premium_features_id` PRIMARY KEY(`id`),
	CONSTRAINT `premium_features_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `saved_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`systemPrompt` text,
	`temperature` int,
	`model` varchar(64),
	`tags` text,
	`isPublic` boolean DEFAULT false,
	`downloads` int DEFAULT 0,
	`rating` decimal(3,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `saved_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stripe_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` varchar(255) NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`userId` int,
	`data` json,
	`processed` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stripe_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripe_events_eventId_unique` UNIQUE(`eventId`)
);
--> statement-breakpoint
CREATE TABLE `user_collaborations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('viewer','editor','owner') DEFAULT 'viewer',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	`lastActiveAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_collaborations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `analytics_history` ADD CONSTRAINT `analytics_history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analytics_history` ADD CONSTRAINT `analytics_history_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `premium_features` ADD CONSTRAINT `premium_features_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `saved_templates` ADD CONSTRAINT `saved_templates_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stripe_events` ADD CONSTRAINT `stripe_events_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_collaborations` ADD CONSTRAINT `user_collaborations_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_collaborations` ADD CONSTRAINT `user_collaborations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;