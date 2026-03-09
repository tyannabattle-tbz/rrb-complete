CREATE TABLE `convention_attendees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`convention_id` int NOT NULL,
	`user_id` int,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`role` enum('attendee','speaker','panelist','moderator','vip','sponsor','organizer') NOT NULL DEFAULT 'attendee',
	`ticket_type` enum('free','general','vip','speaker','sponsor') NOT NULL DEFAULT 'free',
	`registration_status` enum('pending','confirmed','checked_in','cancelled','refunded') NOT NULL DEFAULT 'pending',
	`stripe_payment_intent_id` varchar(255),
	`checked_in_at` bigint,
	`platform` varchar(100),
	`avatar_url` text,
	`bio` text,
	`created_at` bigint NOT NULL,
	CONSTRAINT `convention_attendees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `convention_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`convention_id` int NOT NULL,
	`studio_session_id` int,
	`title` varchar(500) NOT NULL,
	`description` text,
	`session_type` enum('keynote','panel','workshop','breakout','networking','performance','qa','fireside_chat') NOT NULL DEFAULT 'panel',
	`track` varchar(100),
	`room` varchar(100),
	`start_time` bigint NOT NULL,
	`end_time` bigint NOT NULL,
	`max_participants` int DEFAULT 50,
	`current_participants` int DEFAULT 0,
	`speakers` json,
	`is_recorded` boolean DEFAULT true,
	`recording_url` text,
	`status` enum('scheduled','live','ended','cancelled') NOT NULL DEFAULT 'scheduled',
	`created_at` bigint NOT NULL,
	CONSTRAINT `convention_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conventions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`subtitle` varchar(500),
	`description` text,
	`host_user_id` int,
	`status` enum('draft','announced','registration_open','active','day_of','ended','archived') NOT NULL DEFAULT 'draft',
	`start_date` bigint NOT NULL,
	`end_date` bigint NOT NULL,
	`timezone` varchar(50) DEFAULT 'America/New_York',
	`max_attendees` int DEFAULT 500,
	`current_attendees` int DEFAULT 0,
	`is_virtual` boolean DEFAULT true,
	`is_hybrid` boolean DEFAULT false,
	`venue_info` text,
	`banner_url` text,
	`logo_url` text,
	`website_url` text,
	`registration_fee` decimal(10,2) DEFAULT '0.00',
	`stripe_product_id` varchar(255),
	`tags` json,
	`sponsors` json,
	`social_links` json,
	`created_at` bigint NOT NULL,
	`updated_at` bigint NOT NULL,
	CONSTRAINT `conventions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studio_guests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`session_id` int NOT NULL,
	`user_id` int,
	`guest_name` varchar(255) NOT NULL,
	`guest_email` varchar(255),
	`guest_avatar` text,
	`platform` enum('internal','youtube','twitch','zoom','discord','twitter_spaces','custom') NOT NULL DEFAULT 'internal',
	`platform_handle` varchar(255),
	`role` enum('host','co_host','panelist','guest','moderator','speaker','attendee') NOT NULL DEFAULT 'guest',
	`status` enum('invited','accepted','declined','waiting','connected','on_air','muted','disconnected') NOT NULL DEFAULT 'invited',
	`invite_token` varchar(64),
	`joined_at` bigint,
	`left_at` bigint,
	`is_muted` boolean DEFAULT false,
	`is_video_on` boolean DEFAULT true,
	`is_screen_sharing` boolean DEFAULT false,
	`speaking_order` int,
	`bio` text,
	`created_at` bigint NOT NULL,
	CONSTRAINT `studio_guests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studio_recordings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`session_id` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`recording_url` text NOT NULL,
	`thumbnail_url` text,
	`duration_seconds` int DEFAULT 0,
	`file_size_mb` decimal(10,2),
	`format` enum('mp4','mp3','wav','webm','mkv') DEFAULT 'mp4',
	`is_published` boolean DEFAULT false,
	`view_count` int DEFAULT 0,
	`tags` json,
	`created_at` bigint NOT NULL,
	CONSTRAINT `studio_recordings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studio_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`host_user_id` int,
	`session_type` enum('podcast','live_show','interview','panel','workshop','convention_panel','recording') NOT NULL DEFAULT 'podcast',
	`status` enum('draft','scheduled','greenroom','live','recording','ended','archived') NOT NULL DEFAULT 'draft',
	`scheduled_at` bigint,
	`started_at` bigint,
	`ended_at` bigint,
	`max_guests` int DEFAULT 8,
	`is_public` boolean DEFAULT true,
	`stream_platforms` json,
	`stream_keys` json,
	`recording_enabled` boolean DEFAULT true,
	`recording_url` text,
	`thumbnail_url` text,
	`tags` json,
	`convention_id` int,
	`breakout_room_id` int,
	`viewer_count` int DEFAULT 0,
	`peak_viewers` int DEFAULT 0,
	`join_code` varchar(20),
	`created_at` bigint NOT NULL,
	`updated_at` bigint NOT NULL,
	CONSTRAINT `studio_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `convention_attendees` ADD CONSTRAINT `convention_attendees_convention_id_conventions_id_fk` FOREIGN KEY (`convention_id`) REFERENCES `conventions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `convention_attendees` ADD CONSTRAINT `convention_attendees_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `convention_sessions` ADD CONSTRAINT `convention_sessions_convention_id_conventions_id_fk` FOREIGN KEY (`convention_id`) REFERENCES `conventions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `convention_sessions` ADD CONSTRAINT `convention_sessions_studio_session_id_studio_sessions_id_fk` FOREIGN KEY (`studio_session_id`) REFERENCES `studio_sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `conventions` ADD CONSTRAINT `conventions_host_user_id_users_id_fk` FOREIGN KEY (`host_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studio_guests` ADD CONSTRAINT `studio_guests_session_id_studio_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `studio_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studio_guests` ADD CONSTRAINT `studio_guests_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studio_recordings` ADD CONSTRAINT `studio_recordings_session_id_studio_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `studio_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `studio_sessions` ADD CONSTRAINT `studio_sessions_host_user_id_users_id_fk` FOREIGN KEY (`host_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;