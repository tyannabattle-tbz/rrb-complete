CREATE TABLE `admin_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`action` varchar(255) NOT NULL,
	`targetType` varchar(100),
	`targetId` int,
	`changes` json,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cost_analysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`analysisDate` timestamp NOT NULL DEFAULT (now()),
	`totalCost` decimal(12,2),
	`projectedCost` decimal(12,2),
	`savingsOpportunity` decimal(12,2),
	`savingsPercentage` decimal(5,2),
	`recommendations` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cost_analysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cost_optimizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`optimizationType` varchar(100) NOT NULL,
	`description` text,
	`estimatedSavings` decimal(12,2),
	`status` enum('recommended','applied','completed','rejected') DEFAULT 'recommended',
	`appliedAt` timestamp,
	`actualSavings` decimal(12,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cost_optimizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`integrationName` varchar(255) NOT NULL,
	`integrationKey` varchar(100) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`icon` varchar(255),
	`documentation` text,
	`status` enum('active','beta','deprecated') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `integrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `integrations_integrationKey_unique` UNIQUE(`integrationKey`)
);
--> statement-breakpoint
CREATE TABLE `user_integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`integrationId` int NOT NULL,
	`apiKey` varchar(500),
	`configuration` json,
	`webhookUrl` varchar(500),
	`isActive` boolean DEFAULT true,
	`lastSyncedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userIntegrationId` int NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`payload` json,
	`status` enum('pending','delivered','failed') DEFAULT 'pending',
	`retryCount` int DEFAULT 0,
	`lastError` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhook_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `admin_logs` ADD CONSTRAINT `admin_logs_adminId_users_id_fk` FOREIGN KEY (`adminId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cost_analysis` ADD CONSTRAINT `cost_analysis_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cost_optimizations` ADD CONSTRAINT `cost_optimizations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_integrations` ADD CONSTRAINT `user_integrations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_integrations` ADD CONSTRAINT `user_integrations_integrationId_integrations_id_fk` FOREIGN KEY (`integrationId`) REFERENCES `integrations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhook_events` ADD CONSTRAINT `webhook_events_userIntegrationId_user_integrations_id_fk` FOREIGN KEY (`userIntegrationId`) REFERENCES `user_integrations`(`id`) ON DELETE cascade ON UPDATE no action;