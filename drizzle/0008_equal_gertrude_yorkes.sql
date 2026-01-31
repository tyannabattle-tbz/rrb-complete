CREATE TABLE `agent_installations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`marketplaceAgentId` int NOT NULL,
	`localAgentId` int NOT NULL,
	`version` varchar(50) NOT NULL,
	`status` enum('installed','updating','deprecated','uninstalled') DEFAULT 'installed',
	`lastUpdated` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_installations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_marketplace` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentName` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`tags` json DEFAULT ('[]'),
	`version` varchar(50) DEFAULT '1.0.0',
	`author` varchar(255) NOT NULL,
	`authorId` int NOT NULL,
	`agentType` enum('reasoning','execution','monitoring','coordination','custom') NOT NULL,
	`capabilities` json DEFAULT ('[]'),
	`configuration` json,
	`rating` decimal(3,2) DEFAULT '0',
	`downloads` int DEFAULT 0,
	`isPublished` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_marketplace_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`review` text,
	`helpful` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conflict_resolution` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orchestrationTaskId` int NOT NULL,
	`agentId1` int NOT NULL,
	`agentId2` int NOT NULL,
	`conflictType` varchar(100) NOT NULL,
	`resolution` enum('agent1_priority','agent2_priority','merge','retry','escalate') NOT NULL,
	`details` json,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conflict_resolution_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orchestration_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orchestrationTaskId` int NOT NULL,
	`agentId` int NOT NULL,
	`resultData` json,
	`executionTime` int,
	`tokensUsed` int DEFAULT 0,
	`cost` decimal(10,4) DEFAULT '0',
	`status` enum('success','partial','failed') NOT NULL,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orchestration_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orchestration_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`taskName` varchar(255) NOT NULL,
	`description` text,
	`orchestrationType` enum('sequential','parallel','hierarchical','swarm') NOT NULL,
	`status` enum('pending','running','completed','failed','paused') DEFAULT 'pending',
	`priority` int DEFAULT 5,
	`assignedAgents` json DEFAULT ('[]'),
	`result` json,
	`startTime` timestamp,
	`endTime` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orchestration_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `swarm_coordination` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orchestrationTaskId` int NOT NULL,
	`agentId` int NOT NULL,
	`role` enum('leader','worker','monitor','coordinator') NOT NULL,
	`status` enum('idle','working','waiting','completed','failed') DEFAULT 'idle',
	`taskAssignment` json,
	`result` json,
	`startTime` timestamp,
	`endTime` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `swarm_coordination_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `agent_installations` ADD CONSTRAINT `agent_installations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_installations` ADD CONSTRAINT `agent_installations_marketplaceAgentId_agent_marketplace_id_fk` FOREIGN KEY (`marketplaceAgentId`) REFERENCES `agent_marketplace`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_installations` ADD CONSTRAINT `agent_installations_localAgentId_agent_registry_id_fk` FOREIGN KEY (`localAgentId`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_marketplace` ADD CONSTRAINT `agent_marketplace_authorId_users_id_fk` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_reviews` ADD CONSTRAINT `agent_reviews_agentId_agent_marketplace_id_fk` FOREIGN KEY (`agentId`) REFERENCES `agent_marketplace`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_reviews` ADD CONSTRAINT `agent_reviews_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `conflict_resolution` ADD CONSTRAINT `conflict_resolution_orchestrationTaskId_orchestration_tasks_id_fk` FOREIGN KEY (`orchestrationTaskId`) REFERENCES `orchestration_tasks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `conflict_resolution` ADD CONSTRAINT `conflict_resolution_agentId1_agent_registry_id_fk` FOREIGN KEY (`agentId1`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `conflict_resolution` ADD CONSTRAINT `conflict_resolution_agentId2_agent_registry_id_fk` FOREIGN KEY (`agentId2`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orchestration_results` ADD CONSTRAINT `orchestration_results_orchestrationTaskId_orchestration_tasks_id_fk` FOREIGN KEY (`orchestrationTaskId`) REFERENCES `orchestration_tasks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orchestration_results` ADD CONSTRAINT `orchestration_results_agentId_agent_registry_id_fk` FOREIGN KEY (`agentId`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orchestration_tasks` ADD CONSTRAINT `orchestration_tasks_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `swarm_coordination` ADD CONSTRAINT `swarm_coordination_orchestrationTaskId_orchestration_tasks_id_fk` FOREIGN KEY (`orchestrationTaskId`) REFERENCES `orchestration_tasks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `swarm_coordination` ADD CONSTRAINT `swarm_coordination_agentId_agent_registry_id_fk` FOREIGN KEY (`agentId`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;