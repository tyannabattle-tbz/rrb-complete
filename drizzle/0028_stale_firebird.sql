CREATE TABLE `custom_stations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`content_types` json NOT NULL,
	`icon` varchar(50),
	`color` varchar(20),
	`is_public` int DEFAULT 0,
	`total_listeners` int DEFAULT 0,
	`current_listeners` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `custom_stations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `station_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`station_id` int NOT NULL,
	`date` timestamp NOT NULL,
	`total_listeners` int DEFAULT 0,
	`peak_listeners` int DEFAULT 0,
	`total_listen_time` int DEFAULT 0,
	`unique_users` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `station_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `station_content_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`station_id` int NOT NULL,
	`content_type` varchar(50) NOT NULL,
	`source_url` varchar(500) NOT NULL,
	`priority` int DEFAULT 1,
	`is_active` int DEFAULT 1,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `station_content_sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `station_playback_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`station_id` int NOT NULL,
	`content_type` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`duration` int,
	`start_time` timestamp NOT NULL,
	`end_time` timestamp,
	`listeners` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `station_playback_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `station_sharing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`station_id` int NOT NULL,
	`owner_id` varchar(255) NOT NULL,
	`shared_with_user_id` varchar(255) NOT NULL,
	`permission` varchar(20) DEFAULT 'view',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `station_sharing_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `station_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`content_types` json NOT NULL,
	`icon` varchar(50) NOT NULL,
	`color` varchar(20) NOT NULL,
	`is_active` int DEFAULT 1,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `station_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_station_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`station_id` int NOT NULL,
	`is_favorite` int DEFAULT 0,
	`last_listened_at` timestamp,
	`total_listen_time` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `user_station_preferences_id` PRIMARY KEY(`id`)
);
