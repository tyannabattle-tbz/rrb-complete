CREATE TABLE `autonomous_decisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`decisionId` varchar(255) NOT NULL,
	`policy` varchar(255) NOT NULL,
	`system` enum('qumus','rrb','hybridcast') NOT NULL,
	`action` varchar(255) NOT NULL,
	`reasoning` text,
	`autonomyLevel` int DEFAULT 90,
	`humanOverride` int DEFAULT 0,
	`overrideReason` text,
	`result` enum('success','failed','pending') DEFAULT 'pending',
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `autonomous_decisions_id` PRIMARY KEY(`id`),
	CONSTRAINT `autonomous_decisions_decisionId_unique` UNIQUE(`decisionId`)
);
--> statement-breakpoint
CREATE TABLE `broadcasts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`system` enum('qumus','rrb','hybridcast') NOT NULL,
	`createdBy` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`content` text,
	`status` enum('scheduled','live','completed','cancelled') DEFAULT 'scheduled',
	`startTime` timestamp NOT NULL,
	`endTime` timestamp,
	`duration` int,
	`channels` json DEFAULT ('[]'),
	`isEmergency` int DEFAULT 0,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `broadcasts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listeners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`broadcastId` int NOT NULL,
	`userId` int,
	`sessionId` varchar(255) NOT NULL,
	`joinedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`leftAt` timestamp,
	`duration` int,
	`engagement` int DEFAULT 0,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `listeners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`system` enum('qumus','rrb','hybridcast') NOT NULL,
	`userId` int,
	`action` varchar(255) NOT NULL,
	`resourceType` varchar(64),
	`resourceId` varchar(255),
	`changes` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`status` enum('success','failed') DEFAULT 'success',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `system_audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_commands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commandId` varchar(255) NOT NULL,
	`sourceSystem` enum('qumus','rrb','hybridcast') NOT NULL,
	`targetSystem` enum('qumus','rrb','hybridcast') NOT NULL,
	`command` varchar(255) NOT NULL,
	`parameters` json,
	`status` enum('pending','executing','completed','failed') DEFAULT 'pending',
	`result` json,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`completedAt` timestamp,
	CONSTRAINT `system_commands_id` PRIMARY KEY(`id`),
	CONSTRAINT `system_commands_commandId_unique` UNIQUE(`commandId`)
);
--> statement-breakpoint
ALTER TABLE `broadcasts` ADD CONSTRAINT `broadcasts_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `listeners` ADD CONSTRAINT `listeners_broadcastId_broadcasts_id_fk` FOREIGN KEY (`broadcastId`) REFERENCES `broadcasts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `listeners` ADD CONSTRAINT `listeners_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `system_audit_log` ADD CONSTRAINT `system_audit_log_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;