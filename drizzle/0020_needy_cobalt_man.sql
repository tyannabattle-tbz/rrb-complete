CREATE TABLE `donations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'USD',
	`status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
	`donorTier` enum('bronze','silver','gold','platinum') DEFAULT 'bronze',
	`stripePaymentIntentId` varchar(255),
	`stripeCustomerId` varchar(255),
	`stripeInvoiceId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`campaignId` varchar(255),
	`message` text,
	`isRecurring` boolean DEFAULT false,
	`recurringFrequency` enum('monthly','quarterly','annual'),
	`nextRecurringDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `donations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users_stripe_mapping` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeCustomerId` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_stripe_mapping_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_stripe_mapping_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `users_stripe_mapping_stripeCustomerId_unique` UNIQUE(`stripeCustomerId`)
);
--> statement-breakpoint
ALTER TABLE `donations` ADD CONSTRAINT `donations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users_stripe_mapping` ADD CONSTRAINT `users_stripe_mapping_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;