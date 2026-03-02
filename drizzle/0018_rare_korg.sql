CREATE TABLE `alert_broadcast_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertId` int NOT NULL,
	`channelId` int NOT NULL,
	`status` enum('pending','broadcasting','delivered','failed') DEFAULT 'pending',
	`listenersReached` int DEFAULT 0,
	`interruptedRegularContent` boolean DEFAULT false,
	`error` text,
	`broadcastStartedAt` timestamp,
	`broadcastEndedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alert_broadcast_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `radio_channels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stationId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`frequency` varchar(64),
	`genre` varchar(128),
	`status` enum('active','scheduled','offline') DEFAULT 'active',
	`currentListeners` int DEFAULT 0,
	`totalListeners` int DEFAULT 0,
	`streamUrl` varchar(2048),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `radio_channels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `radio_stations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`operatorName` varchar(255),
	`description` text,
	`status` enum('active','inactive','maintenance') DEFAULT 'active',
	`totalListeners` int DEFAULT 0,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `radio_stations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `emergency_alerts` ADD `broadcastChannelIds` text NOT NULL;--> statement-breakpoint
ALTER TABLE `alert_broadcast_log` ADD CONSTRAINT `alert_broadcast_log_alertId_emergency_alerts_id_fk` FOREIGN KEY (`alertId`) REFERENCES `emergency_alerts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alert_broadcast_log` ADD CONSTRAINT `alert_broadcast_log_channelId_radio_channels_id_fk` FOREIGN KEY (`channelId`) REFERENCES `radio_channels`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `radio_channels` ADD CONSTRAINT `radio_channels_stationId_radio_stations_id_fk` FOREIGN KEY (`stationId`) REFERENCES `radio_stations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `radio_stations` ADD CONSTRAINT `radio_stations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `emergency_alerts` DROP COLUMN `regions`;