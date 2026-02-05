CREATE TABLE `webhook_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` enum('slack','discord','email','webhook','pagerduty') NOT NULL,
	`webhookUrl` varchar(2048) NOT NULL,
	`eventTypes` text NOT NULL,
	`enabled` boolean DEFAULT true,
	`retryPolicy` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhook_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `webhook_subscriptions` ADD CONSTRAINT `webhook_subscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;