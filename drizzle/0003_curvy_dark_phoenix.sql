CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(255) NOT NULL,
	`resource` varchar(255) NOT NULL,
	`resourceId` varchar(255),
	`changes` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`status` enum('success','failure') DEFAULT 'success',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `finetuning_datasets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`dataCount` int DEFAULT 0,
	`status` enum('draft','ready','training','completed','failed') DEFAULT 'draft',
	`quality` enum('excellent','good','fair','poor') DEFAULT 'good',
	`tags` text,
	`splitRatio` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `finetuning_datasets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `finetuning_evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`modelId` int NOT NULL,
	`testDataSize` int,
	`accuracy` decimal(5,4) NOT NULL,
	`precision` decimal(5,4) NOT NULL,
	`recall` decimal(5,4) NOT NULL,
	`f1Score` decimal(5,4) NOT NULL,
	`confusionMatrix` json,
	`classReport` json,
	`evaluatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `finetuning_evaluations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `finetuning_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`datasetId` int NOT NULL,
	`modelName` varchar(255) NOT NULL,
	`baseModel` varchar(255) NOT NULL,
	`status` enum('pending','training','completed','failed') DEFAULT 'pending',
	`progress` int DEFAULT 0,
	`epochs` int DEFAULT 3,
	`batchSize` int DEFAULT 32,
	`learningRate` decimal(10,6) DEFAULT '0.0001',
	`trainingStartedAt` timestamp,
	`trainingCompletedAt` timestamp,
	`metrics` json,
	`error` text,
	`modelPath` varchar(2048),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `finetuning_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `finetuning_models` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`jobId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`baseModel` varchar(255) NOT NULL,
	`version` varchar(32) DEFAULT '1.0.0',
	`status` enum('active','archived','deprecated') DEFAULT 'active',
	`accuracy` decimal(5,4),
	`precision` decimal(5,4),
	`recall` decimal(5,4),
	`f1Score` decimal(5,4),
	`modelPath` varchar(2048) NOT NULL,
	`usageCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `finetuning_models_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `model_comparisons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`baselineModelId` int NOT NULL,
	`candidateModelId` int NOT NULL,
	`testDataSize` int,
	`baselineMetrics` json NOT NULL,
	`candidateMetrics` json NOT NULL,
	`improvement` decimal(5,2),
	`recommendation` enum('use_baseline','use_candidate','inconclusive') DEFAULT 'inconclusive',
	`comparedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `model_comparisons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`severity` enum('critical','warning','info') DEFAULT 'info',
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('active','acknowledged','resolved') DEFAULT 'active',
	`acknowledgedBy` int,
	`acknowledgedAt` timestamp,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `system_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`activeUsers` int DEFAULT 0,
	`totalSessions` int DEFAULT 0,
	`totalRequests` int DEFAULT 0,
	`totalTokens` int DEFAULT 0,
	`averageResponseTime` decimal(10,2) DEFAULT '0',
	`errorRate` decimal(5,2) DEFAULT '0',
	`cpuUsage` decimal(5,2) DEFAULT '0',
	`memoryUsage` decimal(5,2) DEFAULT '0',
	`storageUsage` decimal(10,2) DEFAULT '0',
	CONSTRAINT `system_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_installations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`templateId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`config` json NOT NULL,
	`isActive` boolean DEFAULT true,
	`lastTriggered` timestamp,
	`successCount` int DEFAULT 0,
	`failureCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhook_installations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_marketplace_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`review` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhook_marketplace_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(64) NOT NULL,
	`icon` varchar(255),
	`webhookUrl` varchar(2048) NOT NULL,
	`events` text NOT NULL,
	`configSchema` json,
	`documentation` text,
	`isPublic` boolean DEFAULT true,
	`downloads` int DEFAULT 0,
	`rating` decimal(3,2) DEFAULT '0',
	`reviews` int DEFAULT 0,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhook_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `finetuning_datasets` ADD CONSTRAINT `finetuning_datasets_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `finetuning_evaluations` ADD CONSTRAINT `finetuning_evaluations_jobId_finetuning_jobs_id_fk` FOREIGN KEY (`jobId`) REFERENCES `finetuning_jobs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `finetuning_evaluations` ADD CONSTRAINT `finetuning_evaluations_modelId_finetuning_models_id_fk` FOREIGN KEY (`modelId`) REFERENCES `finetuning_models`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `finetuning_jobs` ADD CONSTRAINT `finetuning_jobs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `finetuning_jobs` ADD CONSTRAINT `finetuning_jobs_datasetId_finetuning_datasets_id_fk` FOREIGN KEY (`datasetId`) REFERENCES `finetuning_datasets`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `finetuning_models` ADD CONSTRAINT `finetuning_models_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `finetuning_models` ADD CONSTRAINT `finetuning_models_jobId_finetuning_jobs_id_fk` FOREIGN KEY (`jobId`) REFERENCES `finetuning_jobs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `model_comparisons` ADD CONSTRAINT `model_comparisons_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `model_comparisons` ADD CONSTRAINT `model_comparisons_baselineModelId_finetuning_models_id_fk` FOREIGN KEY (`baselineModelId`) REFERENCES `finetuning_models`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `model_comparisons` ADD CONSTRAINT `model_comparisons_candidateModelId_finetuning_models_id_fk` FOREIGN KEY (`candidateModelId`) REFERENCES `finetuning_models`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhook_installations` ADD CONSTRAINT `webhook_installations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhook_installations` ADD CONSTRAINT `webhook_installations_templateId_webhook_templates_id_fk` FOREIGN KEY (`templateId`) REFERENCES `webhook_templates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhook_marketplace_reviews` ADD CONSTRAINT `webhook_marketplace_reviews_templateId_webhook_templates_id_fk` FOREIGN KEY (`templateId`) REFERENCES `webhook_templates`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhook_marketplace_reviews` ADD CONSTRAINT `webhook_marketplace_reviews_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;