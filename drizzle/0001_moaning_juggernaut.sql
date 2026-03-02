CREATE TABLE `agent_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionName` varchar(255) NOT NULL,
	`systemPrompt` text,
	`temperature` int DEFAULT 70,
	`model` varchar(64) DEFAULT 'gpt-4-turbo',
	`maxSteps` int DEFAULT 50,
	`status` enum('idle','reasoning','executing','completed','error') DEFAULT 'idle',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` varchar(64) NOT NULL,
	`keyName` varchar(255) NOT NULL,
	`encryptedKey` text NOT NULL,
	`lastUsed` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memory_store` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `memory_store_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `task_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`taskDescription` text NOT NULL,
	`status` enum('pending','in_progress','completed','failed') DEFAULT 'pending',
	`outcome` text,
	`duration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `task_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tool_executions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`toolName` varchar(255) NOT NULL,
	`parameters` text,
	`result` text,
	`error` text,
	`status` enum('pending','running','completed','failed') DEFAULT 'pending',
	`duration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tool_executions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `agent_sessions` ADD CONSTRAINT `agent_sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `api_keys` ADD CONSTRAINT `api_keys_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `memory_store` ADD CONSTRAINT `memory_store_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `task_history` ADD CONSTRAINT `task_history_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tool_executions` ADD CONSTRAINT `tool_executions_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;