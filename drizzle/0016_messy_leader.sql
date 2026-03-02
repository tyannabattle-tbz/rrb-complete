CREATE TABLE `batch_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`queueId` int NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('pending','processing','completed','failed','cancelled','paused') DEFAULT 'pending',
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`progress` int DEFAULT 0,
	`estimatedTime` int DEFAULT 60,
	`elapsedTime` int DEFAULT 0,
	`parameters` json,
	`result` json,
	`error` text,
	`retryCount` int DEFAULT 0,
	`maxRetries` int DEFAULT 3,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`startedAt` timestamp,
	`completedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `batch_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `batch_queues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`totalJobs` int DEFAULT 0,
	`completedJobs` int DEFAULT 0,
	`failedJobs` int DEFAULT 0,
	`isPaused` boolean DEFAULT false,
	`status` enum('idle','processing','paused','completed') DEFAULT 'idle',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`startedAt` timestamp,
	`completedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `batch_queues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scenes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storyboardId` int NOT NULL,
	`sceneNumber` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`location` varchar(255) NOT NULL,
	`timeOfDay` varchar(64),
	`mood` varchar(64),
	`duration` int DEFAULT 0,
	`characters` json,
	`props` json,
	`lighting` text,
	`soundDesign` text,
	`visualEffects` json,
	`imagePrompt` text,
	`generatedImageUrl` varchar(2048),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scenes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sceneId` int NOT NULL,
	`shotNumber` int NOT NULL,
	`description` text,
	`composition` varchar(64),
	`angle` varchar(64),
	`movement` varchar(64),
	`duration` int DEFAULT 0,
	`dialogue` json,
	`actions` json,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `storyboards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`scriptContent` text NOT NULL,
	`totalDuration` int DEFAULT 0,
	`genre` varchar(64),
	`targetAudience` varchar(255),
	`productionStyle` varchar(255),
	`colorPalette` json,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `storyboards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `voice_commands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int,
	`transcript` text NOT NULL,
	`intent` varchar(64) NOT NULL,
	`confidence` decimal(3,2) NOT NULL,
	`parameters` json,
	`result` text,
	`status` enum('pending','executing','completed','failed') DEFAULT 'pending',
	`error` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`executedAt` timestamp,
	CONSTRAINT `voice_commands_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `batch_jobs` ADD CONSTRAINT `batch_jobs_queueId_batch_queues_id_fk` FOREIGN KEY (`queueId`) REFERENCES `batch_queues`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `batch_jobs` ADD CONSTRAINT `batch_jobs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `batch_queues` ADD CONSTRAINT `batch_queues_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scenes` ADD CONSTRAINT `scenes_storyboardId_storyboards_id_fk` FOREIGN KEY (`storyboardId`) REFERENCES `storyboards`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shots` ADD CONSTRAINT `shots_sceneId_scenes_id_fk` FOREIGN KEY (`sceneId`) REFERENCES `scenes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `storyboards` ADD CONSTRAINT `storyboards_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `voice_commands` ADD CONSTRAINT `voice_commands_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `voice_commands` ADD CONSTRAINT `voice_commands_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;