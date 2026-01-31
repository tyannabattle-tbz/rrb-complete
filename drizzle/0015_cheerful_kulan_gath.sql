CREATE TABLE `cloned_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`originalSessionId` int NOT NULL,
	`clonedSessionId` int NOT NULL,
	`clonedBy` int NOT NULL,
	`clonedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cloned_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collaboration_invites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`invitedBy` int NOT NULL,
	`inviteCode` varchar(64) NOT NULL,
	`invitedEmail` varchar(320),
	`permission` enum('view','edit','admin') DEFAULT 'view',
	`status` enum('pending','accepted','declined','expired') DEFAULT 'pending',
	`expiresAt` timestamp,
	`acceptedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `collaboration_invites_id` PRIMARY KEY(`id`),
	CONSTRAINT `collaboration_invites_inviteCode_unique` UNIQUE(`inviteCode`)
);
--> statement-breakpoint
CREATE TABLE `session_collaborators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`userId` int NOT NULL,
	`permission` enum('view','edit','admin') DEFAULT 'view',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `session_collaborators_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `cloned_sessions` ADD CONSTRAINT `cloned_sessions_originalSessionId_agent_sessions_id_fk` FOREIGN KEY (`originalSessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cloned_sessions` ADD CONSTRAINT `cloned_sessions_clonedSessionId_agent_sessions_id_fk` FOREIGN KEY (`clonedSessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cloned_sessions` ADD CONSTRAINT `cloned_sessions_clonedBy_users_id_fk` FOREIGN KEY (`clonedBy`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `collaboration_invites` ADD CONSTRAINT `collaboration_invites_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `collaboration_invites` ADD CONSTRAINT `collaboration_invites_invitedBy_users_id_fk` FOREIGN KEY (`invitedBy`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_collaborators` ADD CONSTRAINT `session_collaborators_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_collaborators` ADD CONSTRAINT `session_collaborators_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;