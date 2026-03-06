CREATE TABLE `email_subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`name` varchar(255),
	`source` varchar(100) DEFAULT 'flyer',
	`language` varchar(10) DEFAULT 'en',
	`subscribed_at` timestamp DEFAULT (now()),
	`is_active` boolean DEFAULT true,
	CONSTRAINT `email_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_subscribers_email_unique` UNIQUE(`email`)
);
