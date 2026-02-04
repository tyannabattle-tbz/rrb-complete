CREATE TABLE `alert_delivery_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertId` int NOT NULL,
	`nodeId` int,
	`region` varchar(255) NOT NULL,
	`status` enum('pending','delivered','failed') DEFAULT 'pending',
	`recipientsReached` int DEFAULT 0,
	`error` text,
	`deliveredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alert_delivery_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analytics_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`period` varchar(64) NOT NULL,
	`qumusDecisions` int DEFAULT 0,
	`hybridCastBroadcasts` int DEFAULT 0,
	`rockinBoogieListeners` int DEFAULT 0,
	`avgEngagement` decimal(5,2) DEFAULT '0',
	`systemUptime` decimal(5,2) DEFAULT '100',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analytics_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_listener_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentId` int NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`listenerCount` int NOT NULL,
	`engagementScore` decimal(5,2) DEFAULT '0',
	CONSTRAINT `content_listener_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emergency_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`severity` enum('critical','high','medium','low') NOT NULL,
	`regions` text NOT NULL,
	`status` enum('draft','scheduled','active','completed') DEFAULT 'draft',
	`recipients` int DEFAULT 0,
	`deliveryRate` decimal(5,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`scheduledFor` timestamp,
	`completedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emergency_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hybridcast_nodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`region` varchar(255) NOT NULL,
	`status` enum('ready','broadcasting','offline') DEFAULT 'ready',
	`coverage` decimal(5,2) DEFAULT '0',
	`lastHealthCheck` timestamp,
	`endpoint` varchar(2048),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hybridcast_nodes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `policy_decisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`policy` varchar(255) NOT NULL,
	`count` int DEFAULT 0,
	`avgTime` int DEFAULT 0,
	`successRate` decimal(5,2) DEFAULT '0',
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `policy_decisions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rockin_boogie_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` enum('radio','podcast','audiobook') NOT NULL,
	`description` text,
	`status` enum('active','scheduled','archived') DEFAULT 'active',
	`listeners` int DEFAULT 0,
	`duration` varchar(64),
	`schedule` varchar(255),
	`rating` decimal(3,1) DEFAULT '0',
	`contentUrl` varchar(2048),
	`thumbnailUrl` varchar(2048),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rockin_boogie_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `alert_delivery_log` ADD CONSTRAINT `alert_delivery_log_alertId_emergency_alerts_id_fk` FOREIGN KEY (`alertId`) REFERENCES `emergency_alerts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alert_delivery_log` ADD CONSTRAINT `alert_delivery_log_nodeId_hybridcast_nodes_id_fk` FOREIGN KEY (`nodeId`) REFERENCES `hybridcast_nodes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analytics_metrics` ADD CONSTRAINT `analytics_metrics_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_listener_history` ADD CONSTRAINT `content_listener_history_contentId_rockin_boogie_content_id_fk` FOREIGN KEY (`contentId`) REFERENCES `rockin_boogie_content`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `emergency_alerts` ADD CONSTRAINT `emergency_alerts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hybridcast_nodes` ADD CONSTRAINT `hybridcast_nodes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `policy_decisions` ADD CONSTRAINT `policy_decisions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rockin_boogie_content` ADD CONSTRAINT `rockin_boogie_content_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;