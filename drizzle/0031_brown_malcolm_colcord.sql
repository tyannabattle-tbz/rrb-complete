CREATE TABLE `content_schedule` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channel_id` int NOT NULL,
	`channel_name` varchar(255) NOT NULL,
	`show_name` varchar(255) NOT NULL,
	`show_type` enum('music','talk','podcast','commercial','healing','live_event','news','gospel','emergency') NOT NULL DEFAULT 'music',
	`day_of_week` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday','daily') NOT NULL DEFAULT 'daily',
	`start_time` varchar(10) NOT NULL,
	`end_time` varchar(10) NOT NULL,
	`description` text,
	`host` varchar(255),
	`is_recurring` boolean NOT NULL DEFAULT true,
	`is_active` boolean NOT NULL DEFAULT true,
	`priority` int NOT NULL DEFAULT 5,
	`qumus_managed` boolean NOT NULL DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `content_schedule_id` PRIMARY KEY(`id`)
);
