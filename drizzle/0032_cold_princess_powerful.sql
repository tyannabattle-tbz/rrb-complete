CREATE TABLE `ad_inventory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sponsor_name` varchar(255) NOT NULL,
	`campaign_name` varchar(255) NOT NULL,
	`audio_url` text,
	`duration_seconds` int NOT NULL DEFAULT 30,
	`category` enum('commercial','psa','promo','sponsor','community') NOT NULL DEFAULT 'commercial',
	`target_channels` text,
	`rotation_weight` int NOT NULL DEFAULT 1,
	`max_plays_per_hour` int DEFAULT 2,
	`time_slot_start` varchar(5),
	`time_slot_end` varchar(5),
	`active` boolean NOT NULL DEFAULT true,
	`total_plays` int NOT NULL DEFAULT 0,
	`budget_cents` int,
	`cost_per_play_cents` int,
	`start_date` bigint,
	`end_date` bigint,
	`created_at` bigint NOT NULL,
	`updated_at` bigint NOT NULL,
	CONSTRAINT `ad_inventory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listener_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channel_id` int NOT NULL,
	`channel_name` varchar(255) NOT NULL,
	`listener_count` int NOT NULL DEFAULT 0,
	`peak_listeners` int NOT NULL DEFAULT 0,
	`geo_region` varchar(100),
	`device_type` enum('desktop','mobile','tablet','smart_speaker','other') DEFAULT 'desktop',
	`session_duration_seconds` int DEFAULT 0,
	`timestamp` bigint NOT NULL,
	`hour_of_day` int,
	`day_of_week` int,
	`created_at` bigint NOT NULL,
	CONSTRAINT `listener_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_updates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`version` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`changelog` text NOT NULL,
	`category` enum('feature','bugfix','security','content','infrastructure') NOT NULL DEFAULT 'feature',
	`severity` enum('critical','major','minor','patch') NOT NULL DEFAULT 'minor',
	`status` enum('draft','published','deployed','rolled_back') NOT NULL DEFAULT 'draft',
	`affected_systems` text,
	`published_by` varchar(255),
	`published_at` bigint,
	`deployed_at` bigint,
	`created_at` bigint NOT NULL,
	`updated_at` bigint NOT NULL,
	CONSTRAINT `system_updates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `team_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`update_id` int NOT NULL,
	`user_id` int,
	`channel` enum('push','email','in_app','webhook','sms') NOT NULL DEFAULT 'in_app',
	`recipient` varchar(255) NOT NULL,
	`delivered` boolean NOT NULL DEFAULT false,
	`read_at` bigint,
	`acknowledged_at` bigint,
	`applied_at` bigint,
	`error_message` text,
	`created_at` bigint NOT NULL,
	CONSTRAINT `team_notifications_id` PRIMARY KEY(`id`)
);
