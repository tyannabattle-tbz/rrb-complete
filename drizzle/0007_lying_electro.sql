CREATE TABLE `agent_collaboration` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`initiatorAgentId` int NOT NULL,
	`collaboratorAgentId` int NOT NULL,
	`collaborationType` enum('sequential','parallel','hierarchical','peer') NOT NULL,
	`message` text,
	`response` text,
	`status` enum('pending','acknowledged','completed','failed') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_collaboration_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_execution_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`sessionId` int NOT NULL,
	`executionType` enum('task','tool_call','reasoning_step','decision_point') NOT NULL,
	`input` text,
	`output` text,
	`status` enum('pending','running','success','failed','timeout') NOT NULL,
	`errorMessage` text,
	`executionTime` int,
	`resourcesUsed` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_execution_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_memory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`sessionId` int NOT NULL,
	`memoryType` enum('short_term','long_term','episodic','semantic') NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`importance` int DEFAULT 5,
	`accessCount` int DEFAULT 0,
	`lastAccessedAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_memory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_performance_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`taskSuccessRate` decimal(5,2) DEFAULT '0',
	`averageExecutionTime` int DEFAULT 0,
	`totalTasksCompleted` int DEFAULT 0,
	`totalTasksFailed` int DEFAULT 0,
	`averageTokensPerTask` int DEFAULT 0,
	`costPerTask` decimal(10,4) DEFAULT '0',
	`uptime` decimal(5,2) DEFAULT '100',
	`lastHealthCheck` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_performance_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_registry` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`agentName` varchar(255) NOT NULL,
	`agentType` enum('reasoning','execution','monitoring','coordination','custom') NOT NULL,
	`description` text,
	`version` varchar(64) DEFAULT '1.0.0',
	`status` enum('active','inactive','maintenance','deprecated') DEFAULT 'active',
	`capabilities` json,
	`configuration` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_registry_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_tools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`toolName` varchar(255) NOT NULL,
	`toolType` enum('api','database','file_system','computation','external_service') NOT NULL,
	`description` text,
	`endpoint` varchar(512),
	`authentication` json,
	`parameters` json,
	`rateLimit` int,
	`timeout` int DEFAULT 30000,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_tools_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `anomaly_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`reportName` varchar(255) NOT NULL,
	`reportType` enum('daily','weekly','monthly','custom') NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`totalAnomalies` int DEFAULT 0,
	`criticalCount` int DEFAULT 0,
	`highCount` int DEFAULT 0,
	`resolvedCount` int DEFAULT 0,
	`trendAnalysis` json,
	`impactAssessment` json,
	`recommendations` json,
	`reportContent` text,
	`format` enum('pdf','csv','json','html') DEFAULT 'pdf',
	`emailDelivery` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `anomaly_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `predictive_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`metricType` varchar(64) NOT NULL,
	`predictedValue` decimal(10,4) NOT NULL,
	`confidenceScore` decimal(5,2) NOT NULL,
	`predictedAt` timestamp NOT NULL,
	`expectedOccurrenceTime` timestamp NOT NULL,
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`proactiveActions` json,
	`triggered` boolean DEFAULT false,
	`triggeredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `predictive_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reasoning_chains` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`sessionId` int NOT NULL,
	`chainType` enum('chain_of_thought','tree_of_thought','graph_of_thought') NOT NULL,
	`steps` json,
	`finalConclusion` text,
	`confidence` decimal(5,2) DEFAULT '0',
	`tokensUsed` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reasoning_chains_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suppression_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ruleName` varchar(255) NOT NULL,
	`ruleDescription` text,
	`anomalyType` varchar(64) NOT NULL,
	`condition` text NOT NULL,
	`suppressionDuration` int,
	`startTime` timestamp,
	`endTime` timestamp,
	`isActive` boolean DEFAULT true,
	`suppressionCount` int DEFAULT 0,
	`lastSuppressionAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `suppression_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `agent_collaboration` ADD CONSTRAINT `agent_collaboration_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_collaboration` ADD CONSTRAINT `agent_collaboration_initiatorAgentId_agent_registry_id_fk` FOREIGN KEY (`initiatorAgentId`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_collaboration` ADD CONSTRAINT `agent_collaboration_collaboratorAgentId_agent_registry_id_fk` FOREIGN KEY (`collaboratorAgentId`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_execution_logs` ADD CONSTRAINT `agent_execution_logs_agentId_agent_registry_id_fk` FOREIGN KEY (`agentId`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_execution_logs` ADD CONSTRAINT `agent_execution_logs_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_memory` ADD CONSTRAINT `agent_memory_agentId_agent_registry_id_fk` FOREIGN KEY (`agentId`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_memory` ADD CONSTRAINT `agent_memory_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_performance_metrics` ADD CONSTRAINT `agent_performance_metrics_agentId_agent_registry_id_fk` FOREIGN KEY (`agentId`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_registry` ADD CONSTRAINT `agent_registry_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_tools` ADD CONSTRAINT `agent_tools_agentId_agent_registry_id_fk` FOREIGN KEY (`agentId`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anomaly_reports` ADD CONSTRAINT `anomaly_reports_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `predictive_alerts` ADD CONSTRAINT `predictive_alerts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reasoning_chains` ADD CONSTRAINT `reasoning_chains_agentId_agent_registry_id_fk` FOREIGN KEY (`agentId`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reasoning_chains` ADD CONSTRAINT `reasoning_chains_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `suppression_rules` ADD CONSTRAINT `suppression_rules_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;