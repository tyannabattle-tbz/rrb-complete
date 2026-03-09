CREATE TABLE `fundraising_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`target_amount` decimal(12,2) NOT NULL,
	`current_amount` decimal(12,2) NOT NULL DEFAULT '0',
	`currency` varchar(10) NOT NULL DEFAULT 'USD',
	`campaign` varchar(255) NOT NULL,
	`start_date` bigint NOT NULL,
	`end_date` bigint,
	`donor_count` int DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` bigint NOT NULL,
	`updated_at` bigint NOT NULL,
	CONSTRAINT `fundraising_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `squadd_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`organization` varchar(255),
	`mission_area` varchar(100) NOT NULL,
	`mission_icon` varchar(50) NOT NULL,
	`bio` text NOT NULL,
	`quote` text,
	`email` varchar(255),
	`photo_url` text,
	`focus_areas` json,
	`achievements` json,
	`slug` varchar(100) NOT NULL,
	`display_order` int DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` bigint NOT NULL,
	`updated_at` bigint NOT NULL,
	CONSTRAINT `squadd_members_id` PRIMARY KEY(`id`)
);
