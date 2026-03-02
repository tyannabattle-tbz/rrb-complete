CREATE TABLE `agent_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`config` json NOT NULL,
	`memory` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL,
	`requestCount` int DEFAULT 0,
	`tokenCount` int DEFAULT 0,
	`errorCount` int DEFAULT 0,
	`totalDuration` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` enum('sendgrid','mailgun','smtp') DEFAULT 'sendgrid',
	`apiKey` text NOT NULL,
	`fromEmail` varchar(255) NOT NULL,
	`fromName` varchar(255),
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feature_flags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`flagName` varchar(255) NOT NULL,
	`isEnabled` boolean DEFAULT false,
	`rolloutPercentage` int DEFAULT 0,
	`config` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feature_flags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integration_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`serviceName` varchar(255) NOT NULL,
	`action` varchar(255) NOT NULL,
	`status` enum('success','failure','pending') DEFAULT 'pending',
	`request` text,
	`response` text,
	`error` text,
	`duration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `integration_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performance_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int,
	`metricType` varchar(64) NOT NULL,
	`value` decimal(15,4) NOT NULL,
	`unit` varchar(32),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `performance_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plugins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('tool','integration','middleware','custom') DEFAULT 'custom',
	`code` text NOT NULL,
	`config` json,
	`isActive` boolean DEFAULT true,
	`version` varchar(32) DEFAULT '1.0.0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `plugins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`requestsPerDay` int DEFAULT 10000,
	`tokensPerDay` int DEFAULT 1000000,
	`concurrentSessions` int DEFAULT 10,
	`storageGB` decimal(10,2) DEFAULT '100',
	`resetDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quotas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `report_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportId` int NOT NULL,
	`status` enum('pending','generating','sent','failed') DEFAULT 'pending',
	`sentTo` text,
	`error` text,
	`generatedAt` timestamp,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `report_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`reportType` enum('weekly','monthly','daily','custom') DEFAULT 'weekly',
	`schedule` varchar(255) NOT NULL,
	`recipients` text NOT NULL,
	`includeMetrics` json,
	`isActive` boolean DEFAULT true,
	`lastRun` timestamp,
	`nextRun` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduled_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `training_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int,
	`input` text NOT NULL,
	`output` text NOT NULL,
	`quality` enum('excellent','good','fair','poor') DEFAULT 'good',
	`tags` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `training_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_endpoints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`url` varchar(2048) NOT NULL,
	`events` text NOT NULL,
	`secret` varchar(255) NOT NULL,
	`isActive` boolean DEFAULT true,
	`retryCount` int DEFAULT 3,
	`lastTriggered` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhook_endpoints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`webhookId` int NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`payload` text NOT NULL,
	`statusCode` int,
	`response` text,
	`error` text,
	`retryCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhook_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `agent_snapshots` ADD CONSTRAINT `agent_snapshots_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_snapshots` ADD CONSTRAINT `agent_snapshots_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `api_usage` ADD CONSTRAINT `api_usage_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_configs` ADD CONSTRAINT `email_configs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `feature_flags` ADD CONSTRAINT `feature_flags_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `integration_logs` ADD CONSTRAINT `integration_logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `performance_metrics` ADD CONSTRAINT `performance_metrics_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `performance_metrics` ADD CONSTRAINT `performance_metrics_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `plugins` ADD CONSTRAINT `plugins_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quotas` ADD CONSTRAINT `quotas_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `report_history` ADD CONSTRAINT `report_history_reportId_scheduled_reports_id_fk` FOREIGN KEY (`reportId`) REFERENCES `scheduled_reports`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scheduled_reports` ADD CONSTRAINT `scheduled_reports_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `training_data` ADD CONSTRAINT `training_data_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `training_data` ADD CONSTRAINT `training_data_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhook_endpoints` ADD CONSTRAINT `webhook_endpoints_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhook_logs` ADD CONSTRAINT `webhook_logs_webhookId_webhook_endpoints_id_fk` FOREIGN KEY (`webhookId`) REFERENCES `webhook_endpoints`(`id`) ON DELETE cascade ON UPDATE no action;