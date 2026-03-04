CREATE TABLE `analytics_summary` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`platform` varchar(20) NOT NULL,
	`period` varchar(20) NOT NULL,
	`period_date` timestamp NOT NULL,
	`total_posts` int DEFAULT 0,
	`total_likes` int DEFAULT 0,
	`total_shares` int DEFAULT 0,
	`total_comments` int DEFAULT 0,
	`total_views` int DEFAULT 0,
	`total_impressions` int DEFAULT 0,
	`average_engagement_rate` varchar(50) DEFAULT '0%',
	`top_post` json,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `analytics_summary_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bulk_schedule_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`posts` json NOT NULL,
	`schedule_pattern` varchar(20) NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp,
	`is_active` int DEFAULT 1,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `bulk_schedule_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_calendar_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`scheduled_time` timestamp NOT NULL,
	`platforms` json NOT NULL,
	`status` varchar(20) DEFAULT 'draft',
	`media_urls` json,
	`hashtags` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	`published_at` timestamp,
	CONSTRAINT `content_calendar_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platform_engagement_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` int NOT NULL,
	`platform` varchar(20) NOT NULL,
	`external_post_id` varchar(255) NOT NULL,
	`likes` int DEFAULT 0,
	`shares` int DEFAULT 0,
	`comments` int DEFAULT 0,
	`views` int DEFAULT 0,
	`clicks` int DEFAULT 0,
	`impressions` int DEFAULT 0,
	`engagement_rate` varchar(50) DEFAULT '0%',
	`last_updated` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `platform_engagement_metrics_id` PRIMARY KEY(`id`)
);
