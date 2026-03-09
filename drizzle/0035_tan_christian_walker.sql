CREATE TABLE `social_media_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('twitter','instagram','discord','facebook','tiktok','youtube') NOT NULL,
	`post_type` enum('text','image','video','story','reel','announcement') NOT NULL DEFAULT 'text',
	`content` text NOT NULL,
	`media_url` text,
	`hashtags` text,
	`scheduled_at` bigint NOT NULL,
	`published_at` bigint,
	`status` enum('draft','scheduled','published','failed','cancelled') NOT NULL DEFAULT 'scheduled',
	`campaign` varchar(255) DEFAULT 'selma-to-un-csw70',
	`qumus_managed` boolean NOT NULL DEFAULT true,
	`created_at` bigint NOT NULL,
	`updated_at` bigint NOT NULL,
	CONSTRAINT `social_media_posts_id` PRIMARY KEY(`id`)
);
