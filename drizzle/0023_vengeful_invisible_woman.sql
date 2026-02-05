CREATE TABLE `dashboard_configurations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dashboardType` varchar(64) NOT NULL,
	`layout` text NOT NULL,
	`theme` varchar(64) DEFAULT 'light',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dashboard_configurations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dashboard_widgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dashboardType` varchar(64) NOT NULL,
	`widgetType` varchar(255) NOT NULL,
	`position` text NOT NULL,
	`size` text NOT NULL,
	`config` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dashboard_widgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `decision_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`decisionId` varchar(255) NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`actionTaken` boolean DEFAULT false,
	`outcome` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `decision_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `policy_performance_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`policyName` varchar(255) NOT NULL,
	`totalDecisions` int DEFAULT 0,
	`acceptedDecisions` int DEFAULT 0,
	`rejectedDecisions` int DEFAULT 0,
	`averageRating` decimal(3,2) DEFAULT '0.00',
	`accuracy` decimal(5,2) DEFAULT '0.00',
	`precision` decimal(5,2) DEFAULT '0.00',
	`recall` decimal(5,2) DEFAULT '0.00',
	`f1Score` decimal(5,2) DEFAULT '0.00',
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `policy_performance_metrics_id` PRIMARY KEY(`id`),
	CONSTRAINT `policy_performance_metrics_policyName_unique` UNIQUE(`policyName`)
);
--> statement-breakpoint
CREATE TABLE `rate_limiting_tiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tierName` varchar(64) NOT NULL,
	`requestsPerMinute` int NOT NULL,
	`requestsPerMonth` int NOT NULL,
	`price` decimal(10,2) DEFAULT '0.00',
	`features` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rate_limiting_tiers_id` PRIMARY KEY(`id`),
	CONSTRAINT `rate_limiting_tiers_tierName_unique` UNIQUE(`tierName`)
);
--> statement-breakpoint
ALTER TABLE `dashboard_configurations` ADD CONSTRAINT `dashboard_configurations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dashboard_widgets` ADD CONSTRAINT `dashboard_widgets_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `decision_feedback` ADD CONSTRAINT `decision_feedback_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;