CREATE TABLE `documentation_pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`slug` varchar(500) NOT NULL,
	`content` text,
	`category` varchar(100) DEFAULT 'general',
	`sort_order` int DEFAULT 0,
	`is_published` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `documentation_pages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_tree` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`nickname` varchar(255),
	`relationship` varchar(255),
	`birth_year` int,
	`death_year` int,
	`bio` text,
	`image_url` varchar(1000),
	`parent_id` int,
	`generation` int DEFAULT 0,
	`is_key_figure` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `family_tree_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news_articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`slug` varchar(500) NOT NULL,
	`summary` text,
	`content` text,
	`category` varchar(100) DEFAULT 'general',
	`source` varchar(255),
	`source_url` varchar(1000),
	`image_url` varchar(1000),
	`is_breaking` boolean DEFAULT false,
	`is_featured` boolean DEFAULT false,
	`author_id` int,
	`published_at` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `news_articles_id` PRIMARY KEY(`id`)
);
