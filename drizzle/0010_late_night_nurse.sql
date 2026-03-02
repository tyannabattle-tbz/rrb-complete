CREATE TABLE `agent_certifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`certificationLevel` enum('bronze','silver','gold','platinum') NOT NULL,
	`securityScore` decimal(5,2) DEFAULT '0.00',
	`performanceScore` decimal(5,2) DEFAULT '0.00',
	`reliabilityScore` decimal(5,2) DEFAULT '0.00',
	`trustScore` decimal(5,2) DEFAULT '0.00',
	`certifiedAt` timestamp,
	`expiresAt` timestamp,
	`status` enum('pending','certified','suspended','revoked') DEFAULT 'pending',
	`auditNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_certifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`executionTime` int,
	`memoryUsage` int,
	`cpuUsage` decimal(5,2),
	`tokensUsed` int DEFAULT 0,
	`cost` decimal(10,4),
	`successRate` decimal(5,2),
	`errorCount` int DEFAULT 0,
	`totalExecutions` int DEFAULT 1,
	`bottlenecks` json,
	`recommendations` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_rollbacks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`fromVersion` varchar(50) NOT NULL,
	`toVersion` varchar(50) NOT NULL,
	`reason` text,
	`performedBy` int NOT NULL,
	`status` enum('pending','completed','failed') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_rollbacks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`version` varchar(50) NOT NULL,
	`versionTag` varchar(100),
	`snapshot` json,
	`configuration` json,
	`changes` json,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`isStable` boolean DEFAULT false,
	CONSTRAINT `agent_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `certification_audits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`certificationId` int NOT NULL,
	`auditType` varchar(100) NOT NULL,
	`findings` json,
	`issues` json,
	`recommendations` json,
	`auditorId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `certification_audits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performance_benchmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`benchmarkName` varchar(255) NOT NULL,
	`testCases` json DEFAULT ('0'),
	`passedTests` json DEFAULT ('0'),
	`failedTests` json DEFAULT ('0'),
	`averageResponseTime` int,
	`p95ResponseTime` int,
	`p99ResponseTime` int,
	`throughput` decimal(10,2),
	`benchmarkDate` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `performance_benchmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `security_scans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`scanType` varchar(100) NOT NULL,
	`vulnerabilities` json,
	`riskScore` decimal(5,2),
	`status` enum('passed','warning','failed') NOT NULL,
	`scanDate` timestamp NOT NULL DEFAULT (now()),
	`remediationDeadline` timestamp,
	CONSTRAINT `security_scans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `agent_certifications` ADD CONSTRAINT `agent_certifications_agentId_agent_registry_id_fk` FOREIGN KEY (`agentId`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_profiles` ADD CONSTRAINT `agent_profiles_agentId_agent_registry_id_fk` FOREIGN KEY (`agentId`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_rollbacks` ADD CONSTRAINT `agent_rollbacks_agentId_agent_registry_id_fk` FOREIGN KEY (`agentId`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_rollbacks` ADD CONSTRAINT `agent_rollbacks_performedBy_users_id_fk` FOREIGN KEY (`performedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_versions` ADD CONSTRAINT `agent_versions_agentId_agent_registry_id_fk` FOREIGN KEY (`agentId`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_versions` ADD CONSTRAINT `agent_versions_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `certification_audits` ADD CONSTRAINT `certification_audits_certificationId_agent_certifications_id_fk` FOREIGN KEY (`certificationId`) REFERENCES `agent_certifications`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `certification_audits` ADD CONSTRAINT `certification_audits_auditorId_users_id_fk` FOREIGN KEY (`auditorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `performance_benchmarks` ADD CONSTRAINT `performance_benchmarks_agentId_agent_registry_id_fk` FOREIGN KEY (`agentId`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `security_scans` ADD CONSTRAINT `security_scans_agentId_agent_registry_id_fk` FOREIGN KEY (`agentId`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;