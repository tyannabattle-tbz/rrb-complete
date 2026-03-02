CREATE TABLE `alert_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ruleName` varchar(255) NOT NULL,
	`metricName` varchar(255) NOT NULL,
	`threshold` decimal(15,4),
	`operator` enum('gt','lt','eq','gte','lte') NOT NULL,
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`enabled` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alert_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertRuleId` int NOT NULL,
	`status` enum('triggered','acknowledged','resolved') DEFAULT 'triggered',
	`value` decimal(15,4),
	`message` text,
	`acknowledgedAt` timestamp,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rate_limit_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`endpoint` varchar(255) NOT NULL,
	`requestsPerMinute` int NOT NULL,
	`requestsPerHour` int NOT NULL,
	`requestsPerDay` int NOT NULL,
	`enabled` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rate_limit_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rate_limit_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`endpoint` varchar(255) NOT NULL,
	`requestCount` int DEFAULT 0,
	`resetAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rate_limit_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workspace_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','admin','member','viewer') DEFAULT 'member',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workspace_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`workspaceName` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`plan` enum('free','starter','professional','enterprise') DEFAULT 'free',
	`maxUsers` int DEFAULT 5,
	`maxAgents` int DEFAULT 10,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspaces_id` PRIMARY KEY(`id`),
	CONSTRAINT `workspaces_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `alert_rules` ADD CONSTRAINT `alert_rules_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_alertRuleId_alert_rules_id_fk` FOREIGN KEY (`alertRuleId`) REFERENCES `alert_rules`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rate_limit_rules` ADD CONSTRAINT `rate_limit_rules_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rate_limit_usage` ADD CONSTRAINT `rate_limit_usage_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workspace_members` ADD CONSTRAINT `workspace_members_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workspace_members` ADD CONSTRAINT `workspace_members_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workspaces` ADD CONSTRAINT `workspaces_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;