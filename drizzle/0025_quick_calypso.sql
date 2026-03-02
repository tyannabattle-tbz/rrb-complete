ALTER TABLE `users` ADD `systemRoles` json DEFAULT ('[]');--> statement-breakpoint
ALTER TABLE `users` ADD `accessibleSystems` json DEFAULT ('["qumus","rrb","hybridcast"]');--> statement-breakpoint
ALTER TABLE `users` ADD `preferences` json;--> statement-breakpoint
ALTER TABLE `users` ADD `lastActiveSystem` varchar(64) DEFAULT 'qumus';