CREATE TABLE `anomaly_baselines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`metricType` enum('session_duration','tool_executions','success_rate','token_usage','cost','error_rate') NOT NULL,
	`baselineValue` decimal(10,4) NOT NULL,
	`standardDeviation` decimal(10,4) NOT NULL,
	`minValue` decimal(10,4),
	`maxValue` decimal(10,4),
	`sampleSize` int DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `anomaly_baselines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `anomaly_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`anomalyId` int NOT NULL,
	`action` enum('detected','acknowledged','resolved','dismissed','escalated') NOT NULL,
	`notes` text,
	`performedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `anomaly_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `anomaly_insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`anomalyId` int NOT NULL,
	`insightType` enum('root_cause','trend','prediction','recommendation','correlation') NOT NULL,
	`content` text NOT NULL,
	`confidence` decimal(5,2) DEFAULT '0',
	`actionItems` json,
	`generatedBy` varchar(64) DEFAULT 'llm',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `anomaly_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `anomaly_patterns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`patternName` varchar(255) NOT NULL,
	`patternDescription` text,
	`anomalyTypes` json NOT NULL,
	`frequency` enum('rare','occasional','common','frequent') DEFAULT 'occasional',
	`lastOccurrence` timestamp,
	`occurrenceCount` int DEFAULT 0,
	`correlatedMetrics` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `anomaly_patterns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `anomaly_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ruleName` varchar(255) NOT NULL,
	`ruleDescription` text,
	`condition` text NOT NULL,
	`threshold` decimal(10,4) NOT NULL,
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`isActive` boolean DEFAULT true,
	`notifyOnTrigger` boolean DEFAULT true,
	`autoResolve` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `anomaly_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `detected_anomalies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int,
	`anomalyType` enum('performance_degradation','unusual_tool_usage','high_error_rate','cost_spike','token_spike','success_rate_drop') NOT NULL,
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`metricName` varchar(255) NOT NULL,
	`expectedValue` decimal(10,4),
	`actualValue` decimal(10,4) NOT NULL,
	`deviationPercentage` decimal(10,2) NOT NULL,
	`description` text,
	`aiInsight` text,
	`recommendedAction` text,
	`isResolved` boolean DEFAULT false,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `detected_anomalies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `anomaly_baselines` ADD CONSTRAINT `anomaly_baselines_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anomaly_history` ADD CONSTRAINT `anomaly_history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anomaly_history` ADD CONSTRAINT `anomaly_history_anomalyId_detected_anomalies_id_fk` FOREIGN KEY (`anomalyId`) REFERENCES `detected_anomalies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anomaly_history` ADD CONSTRAINT `anomaly_history_performedBy_users_id_fk` FOREIGN KEY (`performedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anomaly_insights` ADD CONSTRAINT `anomaly_insights_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anomaly_insights` ADD CONSTRAINT `anomaly_insights_anomalyId_detected_anomalies_id_fk` FOREIGN KEY (`anomalyId`) REFERENCES `detected_anomalies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anomaly_patterns` ADD CONSTRAINT `anomaly_patterns_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anomaly_rules` ADD CONSTRAINT `anomaly_rules_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `detected_anomalies` ADD CONSTRAINT `detected_anomalies_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `detected_anomalies` ADD CONSTRAINT `detected_anomalies_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;