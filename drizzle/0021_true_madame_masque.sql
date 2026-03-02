CREATE TABLE `platform_metrics_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('sweetMiracles','rockinBoogie','hybridCast') NOT NULL,
	`metric` varchar(255) NOT NULL,
	`value` decimal(15,2) NOT NULL,
	`unit` varchar(64),
	`metadata` text,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `platform_metrics_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `realtime_metrics_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('sweetMiracles','rockinBoogie','hybridCast') NOT NULL,
	`metric` varchar(255) NOT NULL,
	`currentValue` decimal(15,2) NOT NULL,
	`previousValue` decimal(15,2),
	`changePercent` decimal(5,2),
	`unit` varchar(64),
	`trend` enum('up','down','stable') DEFAULT 'stable',
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `realtime_metrics_cache_id` PRIMARY KEY(`id`)
);
