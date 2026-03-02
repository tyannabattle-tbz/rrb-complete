CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int,
	`action` varchar(255) NOT NULL,
	`resourceType` varchar(64) NOT NULL,
	`resourceId` int,
	`changes` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `agent_collaboration` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`initiatorAgentId` int NOT NULL,
	`collaboratorAgentId` int NOT NULL,
	`collaborationType` enum('sequential','parallel','hierarchical','peer') NOT NULL,
	`message` text,
	`response` text,
	`status` enum('pending','acknowledged','completed','failed') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `agent_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`connectionId` varchar(512) NOT NULL,
	`sourceAgentId` varchar(255) NOT NULL,
	`targetAgentId` varchar(255) NOT NULL,
	`status` enum('connected','disconnected','pending','failed') DEFAULT 'pending',
	`trustLevel` int DEFAULT 50,
	`messageCount` int DEFAULT 0,
	`encryptionEnabled` int DEFAULT 1,
	`lastCommunication` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `agent_connections_id` PRIMARY KEY(`id`),
	CONSTRAINT `agent_connections_connectionId_unique` UNIQUE(`connectionId`)
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
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `agent_installations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`marketplaceAgentId` int NOT NULL,
	`localAgentId` int NOT NULL,
	`version` varchar(50) NOT NULL,
	`status` enum('installed','updating','deprecated','uninstalled') DEFAULT 'installed',
	`lastUpdated` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
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
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
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
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
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
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `agent_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionName` varchar(255) NOT NULL,
	`systemPrompt` text,
	`temperature` int DEFAULT 70,
	`model` varchar(64) DEFAULT 'gpt-4-turbo',
	`maxSteps` int DEFAULT 50,
	`status` enum('idle','reasoning','executing','completed','error') DEFAULT 'idle',
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `agent_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`config` json NOT NULL,
	`memory` text,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
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
	`isActive` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`endpoint` varchar(512) NOT NULL,
	`capabilities` json NOT NULL,
	`autonomyLevel` int DEFAULT 50,
	`publicKey` text NOT NULL,
	`trustScore` int DEFAULT 50,
	`uptime` int DEFAULT 100,
	`messageCount` int DEFAULT 0,
	`lastSeen` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`owner` varchar(255),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `agents_id` PRIMARY KEY(`id`),
	CONSTRAINT `agents_agentId_unique` UNIQUE(`agentId`)
);
--> statement-breakpoint
CREATE TABLE `alert_broadcast_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertId` int NOT NULL,
	`channelId` int NOT NULL,
	`status` enum('pending','broadcasting','delivered','failed') DEFAULT 'pending',
	`listenersReached` int DEFAULT 0,
	`interruptedRegularContent` int DEFAULT 0,
	`error` text,
	`broadcastStartedAt` timestamp,
	`broadcastEndedAt` timestamp,
	`createdAt` timestamp DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `alert_delivery_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertId` int NOT NULL,
	`nodeId` int,
	`region` varchar(255) NOT NULL,
	`status` enum('pending','delivered','failed') DEFAULT 'pending',
	`recipientsReached` int DEFAULT 0,
	`error` text,
	`deliveredAt` timestamp,
	`createdAt` timestamp DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `alert_rules` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`metricName` varchar(255) NOT NULL,
	`operator` enum('gt','lt','eq','gte','lte','ne') DEFAULT 'gt',
	`threshold` decimal(10,2),
	`duration` int,
	`enabled` int DEFAULT true,
	`notificationChannels` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alert_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alerts` (
	`id` varchar(64) NOT NULL,
	`alertRuleId` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`severity` enum('info','warning','critical') DEFAULT 'warning',
	`message` text NOT NULL,
	`value` decimal(10,2),
	`status` enum('active','acknowledged','resolved') DEFAULT 'active',
	`acknowledgedAt` timestamp,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analytics_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`period` varchar(64) NOT NULL,
	`qumusDecisions` int DEFAULT 0,
	`hybridCastBroadcasts` int DEFAULT 0,
	`rockinBoogieListeners` int DEFAULT 0,
	`avgEngagement` decimal(5,2) DEFAULT '0',
	`systemUptime` decimal(5,2) DEFAULT '100',
	`createdAt` timestamp DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `anomaly_baselines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`metricType` enum('session_duration','tool_executions','success_rate','token_usage','cost','error_rate') NOT NULL,
	`baselineValue` decimal(10,4) NOT NULL,
	`standardDeviation` decimal(10,4) NOT NULL,
	`minValue` decimal(10,4),
	`maxValue` decimal(10,4),
	`sampleSize` int DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `anomaly_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`anomalyId` int NOT NULL,
	`action` enum('detected','acknowledged','resolved','dismissed','escalated') NOT NULL,
	`notes` text,
	`performedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
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
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
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
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
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
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
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
	`isActive` int DEFAULT 1,
	`notifyOnTrigger` int DEFAULT 1,
	`autoResolve` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` varchar(64) NOT NULL,
	`keyName` varchar(255) NOT NULL,
	`encryptedKey` text NOT NULL,
	`lastUsed` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `api_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL,
	`requestCount` int DEFAULT 0,
	`tokenCount` int DEFAULT 0,
	`errorCount` int DEFAULT 0,
	`totalDuration` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `ar_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cpuUsage` decimal(5,2) NOT NULL,
	`memoryUsage` decimal(5,2) NOT NULL,
	`storageUsage` decimal(5,2) NOT NULL,
	`networkLatency` decimal(10,2) NOT NULL,
	`taskExecutionTime` decimal(10,2) NOT NULL,
	`successRate` decimal(5,2) NOT NULL,
	`activeConnections` int NOT NULL,
	`broadcastQuality` enum('low','medium','high','ultra') NOT NULL,
	`timestamp` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `ar_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(255) NOT NULL,
	`resource` varchar(255) NOT NULL,
	`resourceId` varchar(255),
	`changes` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`status` enum('success','failure') DEFAULT 'success',
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `auto_save_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int NOT NULL,
	`autoSaveEnabled` int DEFAULT 1,
	`autoSaveInterval` int DEFAULT 60000,
	`maxVersions` int DEFAULT 50,
	`retentionDays` int DEFAULT 30,
	`lastAutoSave` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `autonomous_tasks` (
	`id` varchar(255) NOT NULL,
	`userId` int NOT NULL,
	`goal` text NOT NULL,
	`priority` int NOT NULL DEFAULT 5,
	`status` enum('queued','executing','completed','failed','cancelled') NOT NULL DEFAULT 'queued',
	`steps` json,
	`constraints` json,
	`result` json,
	`error` text,
	`executionTime` int,
	`retryCount` int DEFAULT 0,
	`maxRetries` int DEFAULT 3,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`startedAt` timestamp,
	`completedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `autonomous_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `client_content_uploads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`contentType` enum('audio','video','document','image') NOT NULL,
	`contentUrl` varchar(512) NOT NULL,
	`fileSize` int,
	`duration` int,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`viewCount` int NOT NULL DEFAULT 0,
	`downloadCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_content_uploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `client_donation_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`purpose` varchar(255),
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`transactionId` varchar(255),
	`paymentMethod` varchar(50),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `client_donation_history_id` PRIMARY KEY(`id`),
	CONSTRAINT `client_donation_history_transactionId_unique` UNIQUE(`transactionId`)
);
--> statement-breakpoint
CREATE TABLE `client_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`subscriptionTier` enum('free','silver','gold','platinum') NOT NULL DEFAULT 'free',
	`totalDonated` decimal(12,2) NOT NULL DEFAULT '0',
	`contentUploads` int NOT NULL DEFAULT 0,
	`memberSince` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`lastActivityDate` timestamp,
	`profilePicture` varchar(512),
	`bio` text,
	`preferences` json,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `client_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `content_listener_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentId` int NOT NULL,
	`timestamp` timestamp DEFAULT 'CURRENT_TIMESTAMP',
	`listenerCount` int NOT NULL,
	`engagementScore` decimal(5,2) DEFAULT '0'
);
--> statement-breakpoint
CREATE TABLE `qumus_decision_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`decisionId` varchar(255) NOT NULL,
	`action` enum('created','approved','vetoed','executed','failed') NOT NULL,
	`userId` varchar(255) NOT NULL,
	`reason` text,
	`timestamp` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `qumus_decision_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `qumus_decision_policies` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`subsystem` varchar(255) NOT NULL,
	`rules` json NOT NULL,
	`autonomyThreshold` int NOT NULL,
	`requiresApproval` int NOT NULL DEFAULT 1,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `qumus_decision_policies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `qumus_decisions` (
	`id` varchar(255) NOT NULL,
	`type` enum('broadcast','content','donation','meditation','emergency') NOT NULL,
	`description` text NOT NULL,
	`subsystem` varchar(255) NOT NULL,
	`policy` varchar(255) NOT NULL,
	`autonomyLevel` int NOT NULL,
	`impact` enum('low','medium','high') NOT NULL,
	`status` enum('pending','approved','vetoed') NOT NULL DEFAULT 'pending',
	`approvedBy` varchar(255),
	`approvedAt` timestamp,
	`vetoedBy` varchar(255),
	`vetoedAt` timestamp,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `qumus_decisions_id` PRIMARY KEY(`id`)
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
	`isResolved` int DEFAULT 0,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `donation_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`period` varchar(64) NOT NULL,
	`totalDonations` decimal(15,2) DEFAULT '0',
	`donationCount` int DEFAULT 0,
	`averageDonation` decimal(10,2) DEFAULT '0',
	`totalBroadcastHoursFunded` decimal(10,2) DEFAULT '0',
	`topDonor` varchar(255),
	`topDonorAmount` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `donation_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `donations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`donorName` varchar(255),
	`donorEmail` varchar(255) NOT NULL,
	`amount` int NOT NULL,
	`currency` enum('USD','EUR','GBP') DEFAULT 'USD',
	`stripePaymentIntentId` varchar(255) NOT NULL,
	`status` enum('pending','succeeded','failed','refunded') DEFAULT 'pending',
	`broadcastHoursFunded` decimal(10,2) NOT NULL,
	`receiptSent` int DEFAULT 0,
	`receiptUrl` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `donations_id` PRIMARY KEY(`id`),
	CONSTRAINT `donations_stripePaymentIntentId_unique` UNIQUE(`stripePaymentIntentId`)
);
--> statement-breakpoint
CREATE TABLE `donors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255),
	`phone` varchar(20),
	`donationHistory` json,
	`totalDonated` decimal(10,2) DEFAULT '0',
	`donorTier` enum('bronze','silver','gold','platinum') DEFAULT 'bronze',
	`status` enum('active','inactive','prospect') DEFAULT 'active',
	`createdAt` timestamp DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `ecosystem_commands` (
	`id` varchar(255) NOT NULL,
	`userId` int NOT NULL,
	`target` enum('rrb','hybridcast','canryn','sweet_miracles') NOT NULL,
	`action` varchar(255) NOT NULL,
	`params` json NOT NULL,
	`priority` int NOT NULL DEFAULT 5,
	`status` enum('queued','executing','completed','failed') NOT NULL DEFAULT 'queued',
	`result` json,
	`error` text,
	`executionTime` int,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`executedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ecosystem_commands_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ecosystem_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entity` enum('rrb','hybridcast','canryn','sweet_miracles') NOT NULL,
	`status` enum('online','offline','degraded','maintenance') NOT NULL DEFAULT 'online',
	`lastHeartbeat` timestamp,
	`commandsProcessed` int DEFAULT 0,
	`failureRate` decimal(5,2) DEFAULT '0',
	`metadata` json,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ecosystem_status_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` enum('sendgrid','mailgun','smtp') DEFAULT 'sendgrid',
	`apiKey` text NOT NULL,
	`fromEmail` varchar(255) NOT NULL,
	`fromName` varchar(255),
	`isActive` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `email_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipientEmail` varchar(255) NOT NULL,
	`emailType` enum('donation_receipt','payment_confirmation','subscription_welcome','subscription_renewal','subscription_canceled') NOT NULL,
	`subject` varchar(255) NOT NULL,
	`status` enum('sent','failed','bounced','opened','clicked') DEFAULT 'sent',
	`relatedId` varchar(255),
	`retryCount` int DEFAULT 0,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`sentAt` timestamp,
	CONSTRAINT `email_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emergency_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`severity` enum('critical','high','medium','low') NOT NULL,
	`status` enum('draft','scheduled','active','completed') DEFAULT 'draft',
	`recipients` int DEFAULT 0,
	`deliveryRate` decimal(5,2) DEFAULT '0',
	`createdAt` timestamp DEFAULT 'CURRENT_TIMESTAMP',
	`scheduledFor` timestamp,
	`completedAt` timestamp,
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`broadcastChannelIds` text
);
--> statement-breakpoint
CREATE TABLE `escalation_policies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`triggers` json NOT NULL,
	`actions` json NOT NULL,
	`isActive` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `feature_flags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`flagName` varchar(255) NOT NULL,
	`isEnabled` int DEFAULT 0,
	`rolloutPercentage` int DEFAULT 0,
	`config` json,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `filter_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`filterConfig` json NOT NULL,
	`resultCount` int DEFAULT 0,
	`executionTime` int,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `filter_presets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`filterConfig` json NOT NULL,
	`isPublic` int DEFAULT 0,
	`usageCount` int DEFAULT 0,
	`lastUsed` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `finetuning_datasets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`dataCount` int DEFAULT 0,
	`status` enum('draft','ready','training','completed','failed') DEFAULT 'draft',
	`quality` enum('excellent','good','fair','poor') DEFAULT 'good',
	`tags` text,
	`splitRatio` json,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `finetuning_evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`modelId` int NOT NULL,
	`testDataSize` int,
	`accuracy` decimal(5,4) NOT NULL,
	`precision` decimal(5,4) NOT NULL,
	`recall` decimal(5,4) NOT NULL,
	`f1Score` decimal(5,4) NOT NULL,
	`confusionMatrix` json,
	`classReport` json,
	`evaluatedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `finetuning_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`datasetId` int NOT NULL,
	`modelName` varchar(255) NOT NULL,
	`baseModel` varchar(255) NOT NULL,
	`status` enum('pending','training','completed','failed') DEFAULT 'pending',
	`progress` int DEFAULT 0,
	`epochs` int DEFAULT 3,
	`batchSize` int DEFAULT 32,
	`learningRate` decimal(10,6) DEFAULT '0.0001',
	`trainingStartedAt` timestamp,
	`trainingCompletedAt` timestamp,
	`metrics` json,
	`error` text,
	`modelPath` varchar(2048),
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `finetuning_models` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`jobId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`baseModel` varchar(255) NOT NULL,
	`version` varchar(32) DEFAULT '1.0.0',
	`status` enum('active','archived','deprecated') DEFAULT 'active',
	`accuracy` decimal(5,4),
	`precision` decimal(5,4),
	`recall` decimal(5,4),
	`f1Score` decimal(5,4),
	`modelPath` varchar(2048) NOT NULL,
	`usageCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `grants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`organization` varchar(255),
	`amount` decimal(12,2),
	`deadline` date,
	`description` text,
	`requirements` json,
	`matchScore` decimal(3,2),
	`status` enum('open','applied','awarded','rejected','expired') DEFAULT 'open',
	`createdAt` timestamp DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `hybrid_cast_broadcasts` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`contentUrl` varchar(512),
	`contentType` varchar(32),
	`broadcastMode` enum('online','offline','hybrid') DEFAULT 'hybrid',
	`targetNodes` text,
	`status` enum('scheduled','broadcasting','completed','failed') DEFAULT 'scheduled',
	`startedAt` timestamp,
	`completedAt` timestamp,
	`reachableNodes` int DEFAULT 0,
	`totalNodes` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hybrid_cast_broadcasts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hybrid_cast_connections` (
	`id` varchar(64) NOT NULL,
	`sourceNodeId` varchar(64) NOT NULL,
	`targetNodeId` varchar(64) NOT NULL,
	`connectionType` enum('direct','relay','mesh') DEFAULT 'direct',
	`signalQuality` int,
	`bandwidth` int,
	`latency` int,
	`packetLoss` int,
	`isActive` int DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hybrid_cast_connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hybrid_cast_nodes` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`nodeId` varchar(64) NOT NULL,
	`nodeType` enum('gateway','relay','endpoint','hybrid') DEFAULT 'hybrid',
	`status` enum('online','offline','degraded','unreachable') DEFAULT 'offline',
	`location` varchar(255),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`signalStrength` int,
	`bandwidth` int,
	`latency` int,
	`isActive` int DEFAULT true,
	`lastHeartbeat` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hybrid_cast_nodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `hybrid_cast_nodes_nodeId_unique` UNIQUE(`nodeId`)
);
--> statement-breakpoint
CREATE TABLE `hybridcast_nodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`region` varchar(255) NOT NULL,
	`status` enum('ready','broadcasting','offline') DEFAULT 'ready',
	`coverage` decimal(5,2) DEFAULT '0',
	`lastHealthCheck` timestamp,
	`endpoint` varchar(2048),
	`metadata` json,
	`createdAt` timestamp DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `hybridcast_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planName` varchar(255) NOT NULL,
	`stripePriceId` varchar(255) NOT NULL,
	`amount` int NOT NULL,
	`currency` enum('USD','EUR','GBP') DEFAULT 'USD',
	`interval` enum('month','year') NOT NULL,
	`features` json NOT NULL,
	`maxBroadcasts` int,
	`maxListeners` int,
	`maxStorageGb` int,
	`priority` int DEFAULT 0,
	`description` text,
	`isActive` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hybridcast_plans_id` PRIMARY KEY(`id`),
	CONSTRAINT `hybridcast_plans_stripePriceId_unique` UNIQUE(`stripePriceId`)
);
--> statement-breakpoint
CREATE TABLE `integration_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`serviceName` varchar(255) NOT NULL,
	`action` varchar(255) NOT NULL,
	`status` enum('success','failure','pending') DEFAULT 'pending',
	`request` text,
	`response` text,
	`error` text,
	`duration` int,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `memory_store` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `model_comparisons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`baselineModelId` int NOT NULL,
	`candidateModelId` int NOT NULL,
	`testDataSize` int,
	`baselineMetrics` json NOT NULL,
	`candidateMetrics` json NOT NULL,
	`improvement` decimal(5,2),
	`recommendation` enum('use_baseline','use_candidate','inconclusive') DEFAULT 'inconclusive',
	`comparedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `nonprofit_operations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`metricType` varchar(100),
	`metricValue` decimal(10,2),
	`period` varchar(50),
	`category` varchar(100),
	`metadata` json,
	`createdAt` timestamp DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `notification_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`notificationId` int NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`channel` enum('push','email','sound','webhook') NOT NULL,
	`status` enum('pending','sent','failed','delivered') DEFAULT 'pending',
	`error` text,
	`sentAt` timestamp,
	`deliveredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`enablePushNotifications` int DEFAULT 1,
	`enableSoundNotifications` int DEFAULT 1,
	`enableEmailNotifications` int DEFAULT 0,
	`soundVolume` int DEFAULT 70,
	`notificationTypes` json,
	`escalationEnabled` int DEFAULT 1,
	`escalationDelay` int DEFAULT 300000,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int,
	`type` enum('message','tool_execution','task_completion','error','warning','info') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`isRead` int DEFAULT 0,
	`actionUrl` varchar(2048),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`readAt` timestamp,
	`archivedAt` timestamp
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripePaymentIntentId` varchar(255) NOT NULL,
	`amount` int NOT NULL,
	`currency` enum('USD','EUR','GBP') DEFAULT 'USD',
	`status` enum('succeeded','processing','requires_payment_method','requires_confirmation','requires_action','requires_capture','canceled') DEFAULT 'processing',
	`productName` varchar(255) NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_stripePaymentIntentId_unique` UNIQUE(`stripePaymentIntentId`)
);
--> statement-breakpoint
CREATE TABLE `performance_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int,
	`metricType` varchar(64) NOT NULL,
	`value` decimal(15,4) NOT NULL,
	`unit` varchar(32),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `performance_trends` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL,
	`sessionCount` int DEFAULT 0,
	`averageSessionDuration` int,
	`totalToolExecutions` int DEFAULT 0,
	`averageSuccessRate` decimal(5,2) DEFAULT '0',
	`totalTokensUsed` int DEFAULT 0,
	`estimatedCost` decimal(10,4) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `plugins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('tool','integration','middleware','custom') DEFAULT 'custom',
	`code` text NOT NULL,
	`config` json,
	`isActive` int DEFAULT 1,
	`version` varchar(32) DEFAULT '1.0.0',
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `policy_decisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`policy` varchar(255) NOT NULL,
	`count` int DEFAULT 0,
	`avgTime` int DEFAULT 0,
	`successRate` decimal(5,2) DEFAULT '0',
	`metadata` json,
	`createdAt` timestamp DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
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
	`triggered` int DEFAULT 0,
	`triggeredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `quota_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`quotaType` enum('requests','tokens','cost','sessions') NOT NULL,
	`threshold` int NOT NULL,
	`isTriggered` int DEFAULT 0,
	`lastTriggeredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `quotas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`requestsPerDay` int DEFAULT 10000,
	`tokensPerDay` int DEFAULT 1000000,
	`concurrentSessions` int DEFAULT 10,
	`storageGb` decimal(10,2) DEFAULT '100',
	`resetDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `radio_channels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stationId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`frequency` varchar(64),
	`genre` varchar(128),
	`status` enum('active','scheduled','offline') DEFAULT 'active',
	`currentListeners` int DEFAULT 0,
	`totalListeners` int DEFAULT 0,
	`streamUrl` varchar(2048),
	`metadata` json,
	`createdAt` timestamp DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `radio_stations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`operatorName` varchar(255),
	`description` text,
	`status` enum('active','inactive','maintenance') DEFAULT 'active',
	`totalListeners` int DEFAULT 0,
	`metadata` json,
	`createdAt` timestamp DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `rate_limit_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`limitType` enum('requests_per_minute','requests_per_day','tokens_per_request','concurrent_sessions') NOT NULL,
	`limitValue` int NOT NULL,
	`currentValue` int NOT NULL,
	`action` enum('allowed','throttled','blocked') NOT NULL,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
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
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `report_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportId` int NOT NULL,
	`status` enum('pending','generating','sent','failed') DEFAULT 'pending',
	`sentTo` text,
	`error` text,
	`generatedAt` timestamp,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `review_helpfulness` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewId` int NOT NULL,
	`userId` int NOT NULL,
	`isHelpful` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `review_helpfulness_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `review_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewId` int NOT NULL,
	`responderId` int NOT NULL,
	`response` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `review_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`category` enum('content_quality','user_experience','platform_features','customer_support','general') NOT NULL DEFAULT 'general',
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`isVerified` int NOT NULL DEFAULT 0,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`helpfulCount` int NOT NULL DEFAULT 0,
	`notHelpfulCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rockin_boogie_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` enum('radio','podcast','audiobook') NOT NULL,
	`description` text,
	`status` enum('active','scheduled','archived') DEFAULT 'active',
	`listeners` int DEFAULT 0,
	`duration` varchar(64),
	`schedule` varchar(255),
	`rating` decimal(3,1) DEFAULT '0',
	`contentUrl` varchar(2048),
	`thumbnailUrl` varchar(2048),
	`metadata` json,
	`createdAt` timestamp DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `scheduled_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`reportType` enum('weekly','monthly','daily','custom') DEFAULT 'weekly',
	`schedule` varchar(255) NOT NULL,
	`recipients` text NOT NULL,
	`includeMetrics` json,
	`isActive` int DEFAULT 1,
	`lastRun` timestamp,
	`nextRun` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `session_annotations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`userId` int NOT NULL,
	`messageId` int,
	`comment` text NOT NULL,
	`type` enum('note','flag','question','suggestion') DEFAULT 'note',
	`resolved` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `session_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`duration` int NOT NULL,
	`messageCount` int DEFAULT 0,
	`toolExecutionCount` int DEFAULT 0,
	`successfulToolExecutions` int DEFAULT 0,
	`failedToolExecutions` int DEFAULT 0,
	`successRate` decimal(5,2) DEFAULT '0',
	`averageToolDuration` int,
	`totalTokensUsed` int DEFAULT 0,
	`costEstimate` decimal(10,4) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `session_shares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`sharedBy` int NOT NULL,
	`sharedWith` int NOT NULL,
	`permission` enum('view','edit','admin') DEFAULT 'view',
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `session_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`versionNumber` int NOT NULL,
	`snapshot` json NOT NULL,
	`messageCount` int DEFAULT 0,
	`toolExecutionCount` int DEFAULT 0,
	`taskCount` int DEFAULT 0,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`createdBy` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `solbones_frequency_rolls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`frequencyName` varchar(50) NOT NULL,
	`frequency` int NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`sessionId` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `solbones_frequency_rolls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `solbones_leaderboard` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalRolls` int NOT NULL DEFAULT 0,
	`favoriteFrequency` varchar(50),
	`streak` int NOT NULL DEFAULT 0,
	`lastRollDate` timestamp,
	`achievements` json,
	`score` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `solbones_leaderboard_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscription_tiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(64) NOT NULL,
	`displayName` varchar(255) NOT NULL,
	`description` text,
	`monthlyPrice` decimal(10,2) NOT NULL,
	`requestsPerMinute` int NOT NULL,
	`requestsPerDay` int NOT NULL,
	`requestsPerMonth` int NOT NULL,
	`maxConcurrentSessions` int NOT NULL,
	`maxTokensPerRequest` int NOT NULL,
	`features` json NOT NULL,
	`isActive` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeSubscriptionId` varchar(255) NOT NULL,
	`plan` enum('ar_pro','voice_training','enterprise','hybridcast_basic','hybridcast_pro','hybridcast_enterprise') NOT NULL,
	`status` enum('active','past_due','canceled','unpaid') DEFAULT 'active',
	`currentPeriodStart` timestamp NOT NULL,
	`currentPeriodEnd` timestamp NOT NULL,
	`cancelAtPeriodEnd` int DEFAULT 0,
	`canceledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_stripeSubscriptionId_unique` UNIQUE(`stripeSubscriptionId`)
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
	`isActive` int DEFAULT 1,
	`suppressionCount` int DEFAULT 0,
	`lastSuppressionAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `sweet_miracles_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`alertType` varchar(50) NOT NULL,
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`title` varchar(255) NOT NULL,
	`description` text,
	`broadcastChannels` json,
	`status` enum('draft','scheduled','active','resolved','archived') DEFAULT 'draft',
	`createdAt` timestamp DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `system_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`severity` enum('critical','warning','info') DEFAULT 'info',
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('active','acknowledged','resolved') DEFAULT 'active',
	`acknowledgedBy` int,
	`acknowledgedAt` timestamp,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `system_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`activeUsers` int DEFAULT 0,
	`totalSessions` int DEFAULT 0,
	`totalRequests` int DEFAULT 0,
	`totalTokens` int DEFAULT 0,
	`averageResponseTime` decimal(10,2) DEFAULT '0',
	`errorRate` decimal(5,2) DEFAULT '0',
	`cpuUsage` decimal(5,2) DEFAULT '0',
	`memoryUsage` decimal(5,2) DEFAULT '0',
	`storageUsage` decimal(10,2) DEFAULT '0'
);
--> statement-breakpoint
CREATE TABLE `task_execution_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` varchar(255) NOT NULL,
	`eventType` enum('submitted','started','step_completed','completed','failed','retried') NOT NULL,
	`details` json,
	`timestamp` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `task_execution_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `task_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`taskDescription` text NOT NULL,
	`status` enum('pending','in_progress','completed','failed') DEFAULT 'pending',
	`outcome` text,
	`duration` int,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`completedAt` timestamp
);
--> statement-breakpoint
CREATE TABLE `task_steps` (
	`id` varchar(255) NOT NULL,
	`taskId` varchar(255) NOT NULL,
	`stepNumber` int NOT NULL,
	`description` text NOT NULL,
	`status` enum('pending','executing','completed','failed','skipped') NOT NULL DEFAULT 'pending',
	`result` json,
	`error` text,
	`executionTime` int,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`startedAt` timestamp,
	`completedAt` timestamp,
	CONSTRAINT `task_steps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('viewer','editor','admin') DEFAULT 'viewer',
	`joinedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`ownerId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `tool_executions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`toolName` varchar(255) NOT NULL,
	`parameters` text,
	`result` text,
	`error` text,
	`status` enum('pending','running','completed','failed') DEFAULT 'pending',
	`duration` int,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `tool_usage_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`toolName` varchar(255) NOT NULL,
	`executionCount` int DEFAULT 0,
	`successCount` int DEFAULT 0,
	`failureCount` int DEFAULT 0,
	`totalDuration` int DEFAULT 0,
	`averageDuration` int,
	`lastUsed` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `training_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int,
	`input` text NOT NULL,
	`output` text NOT NULL,
	`quality` enum('excellent','good','fair','poor') DEFAULT 'good',
	`tags` text,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `usage_quotas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`billingCycleStart` timestamp NOT NULL,
	`billingCycleEnd` timestamp NOT NULL,
	`requestsUsed` int DEFAULT 0,
	`requestsLimit` int NOT NULL,
	`tokensUsed` int DEFAULT 0,
	`tokensLimit` int NOT NULL,
	`sessionsCreated` int DEFAULT 0,
	`sessionsLimit` int NOT NULL,
	`costAccrued` decimal(10,4) DEFAULT '0',
	`costLimit` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `user_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tierId` int NOT NULL,
	`status` enum('active','inactive','suspended','cancelled') DEFAULT 'active',
	`billingCycleStart` timestamp NOT NULL,
	`billingCycleEnd` timestamp NOT NULL,
	`autoRenew` int DEFAULT 1,
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `voice_commands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`commandName` varchar(255) NOT NULL,
	`commandPhrase` text NOT NULL,
	`targetSystem` enum('qumus','hybridcast','rrb','canryn') NOT NULL,
	`targetAction` text NOT NULL,
	`confidence` decimal(5,2) NOT NULL,
	`usageCount` int DEFAULT 0,
	`successCount` int DEFAULT 0,
	`lastUsed` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `voice_commands_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_endpoints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`url` varchar(2048) NOT NULL,
	`events` text NOT NULL,
	`secret` varchar(255) NOT NULL,
	`isActive` int DEFAULT 1,
	`retryCount` int DEFAULT 3,
	`lastTriggered` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `webhook_installations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`templateId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`config` json NOT NULL,
	`isActive` int DEFAULT 1,
	`lastTriggered` timestamp,
	`successCount` int DEFAULT 0,
	`failureCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `webhook_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`webhookId` int NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`payload` text NOT NULL,
	`statusCode` int,
	`response` text,
	`error` text,
	`retryCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `webhook_marketplace_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`review` text,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `webhook_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(64) NOT NULL,
	`icon` varchar(255),
	`webhookUrl` varchar(2048) NOT NULL,
	`events` text NOT NULL,
	`configSchema` json,
	`documentation` text,
	`isPublic` int DEFAULT 1,
	`downloads` int DEFAULT 0,
	`rating` decimal(3,2) DEFAULT '0',
	`reviews` int DEFAULT 0,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `wellness_checkins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`checkInType` enum('daily','weekly','emergency') DEFAULT 'daily',
	`status` enum('ok','needs_help','emergency','no_response') DEFAULT 'ok',
	`responseTime` int,
	`notes` text,
	`escalationLevel` int DEFAULT 0,
	`createdAt` timestamp DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_openId_unique`;--> statement-breakpoint
ALTER TABLE `users` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `lastSignedIn` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_collaboration` ADD CONSTRAINT `agent_collaboration_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_collaboration` ADD CONSTRAINT `agent_collaboration_initiatorAgentId_agent_registry_id_fk` FOREIGN KEY (`initiatorAgentId`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_collaboration` ADD CONSTRAINT `agent_collaboration_collaboratorAgentId_agent_registry_id_fk` FOREIGN KEY (`collaboratorAgentId`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_execution_logs` ADD CONSTRAINT `agent_execution_logs_agentId_agent_registry_id_fk` FOREIGN KEY (`agentId`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_execution_logs` ADD CONSTRAINT `agent_execution_logs_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_memory` ADD CONSTRAINT `agent_memory_agentId_agent_registry_id_fk` FOREIGN KEY (`agentId`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_memory` ADD CONSTRAINT `agent_memory_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_performance_metrics` ADD CONSTRAINT `agent_performance_metrics_agentId_agent_registry_id_fk` FOREIGN KEY (`agentId`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_registry` ADD CONSTRAINT `agent_registry_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_sessions` ADD CONSTRAINT `agent_sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_snapshots` ADD CONSTRAINT `agent_snapshots_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_snapshots` ADD CONSTRAINT `agent_snapshots_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agent_tools` ADD CONSTRAINT `agent_tools_agentId_agent_registry_id_fk` FOREIGN KEY (`agentId`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alert_broadcast_log` ADD CONSTRAINT `alert_broadcast_log_alertId_emergency_alerts_id_fk` FOREIGN KEY (`alertId`) REFERENCES `emergency_alerts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alert_broadcast_log` ADD CONSTRAINT `alert_broadcast_log_channelId_radio_channels_id_fk` FOREIGN KEY (`channelId`) REFERENCES `radio_channels`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alert_delivery_log` ADD CONSTRAINT `alert_delivery_log_alertId_emergency_alerts_id_fk` FOREIGN KEY (`alertId`) REFERENCES `emergency_alerts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alert_delivery_log` ADD CONSTRAINT `alert_delivery_log_nodeId_hybridcast_nodes_id_fk` FOREIGN KEY (`nodeId`) REFERENCES `hybridcast_nodes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alert_rules` ADD CONSTRAINT `alert_rules_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_alertRuleId_alert_rules_id_fk` FOREIGN KEY (`alertRuleId`) REFERENCES `alert_rules`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analytics_metrics` ADD CONSTRAINT `analytics_metrics_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anomaly_baselines` ADD CONSTRAINT `anomaly_baselines_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anomaly_history` ADD CONSTRAINT `anomaly_history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anomaly_history` ADD CONSTRAINT `anomaly_history_anomalyId_detected_anomalies_id_fk` FOREIGN KEY (`anomalyId`) REFERENCES `detected_anomalies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anomaly_history` ADD CONSTRAINT `anomaly_history_performedBy_users_id_fk` FOREIGN KEY (`performedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anomaly_insights` ADD CONSTRAINT `anomaly_insights_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anomaly_insights` ADD CONSTRAINT `anomaly_insights_anomalyId_detected_anomalies_id_fk` FOREIGN KEY (`anomalyId`) REFERENCES `detected_anomalies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anomaly_patterns` ADD CONSTRAINT `anomaly_patterns_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anomaly_reports` ADD CONSTRAINT `anomaly_reports_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anomaly_rules` ADD CONSTRAINT `anomaly_rules_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `api_keys` ADD CONSTRAINT `api_keys_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `api_usage` ADD CONSTRAINT `api_usage_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ar_metrics` ADD CONSTRAINT `ar_metrics_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `auto_save_settings` ADD CONSTRAINT `auto_save_settings_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `auto_save_settings` ADD CONSTRAINT `auto_save_settings_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `autonomous_tasks` ADD CONSTRAINT `autonomous_tasks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `client_content_uploads` ADD CONSTRAINT `client_content_uploads_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `client_donation_history` ADD CONSTRAINT `client_donation_history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `client_profiles` ADD CONSTRAINT `client_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_listener_history` ADD CONSTRAINT `content_listener_history_contentId_rockin_boogie_content_id_fk` FOREIGN KEY (`contentId`) REFERENCES `rockin_boogie_content`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `qumus_decision_logs` ADD CONSTRAINT `qumus_decision_logs_decisionId_qumus_decisions_id_fk` FOREIGN KEY (`decisionId`) REFERENCES `qumus_decisions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `detected_anomalies` ADD CONSTRAINT `detected_anomalies_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `detected_anomalies` ADD CONSTRAINT `detected_anomalies_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ecosystem_commands` ADD CONSTRAINT `ecosystem_commands_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_configs` ADD CONSTRAINT `email_configs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `emergency_alerts` ADD CONSTRAINT `emergency_alerts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `escalation_policies` ADD CONSTRAINT `escalation_policies_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `feature_flags` ADD CONSTRAINT `feature_flags_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `filter_history` ADD CONSTRAINT `filter_history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `filter_presets` ADD CONSTRAINT `filter_presets_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `finetuning_datasets` ADD CONSTRAINT `finetuning_datasets_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `finetuning_evaluations` ADD CONSTRAINT `finetuning_evaluations_jobId_finetuning_jobs_id_fk` FOREIGN KEY (`jobId`) REFERENCES `finetuning_jobs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `finetuning_evaluations` ADD CONSTRAINT `finetuning_evaluations_modelId_finetuning_models_id_fk` FOREIGN KEY (`modelId`) REFERENCES `finetuning_models`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `finetuning_jobs` ADD CONSTRAINT `finetuning_jobs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `finetuning_jobs` ADD CONSTRAINT `finetuning_jobs_datasetId_finetuning_datasets_id_fk` FOREIGN KEY (`datasetId`) REFERENCES `finetuning_datasets`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `finetuning_models` ADD CONSTRAINT `finetuning_models_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `finetuning_models` ADD CONSTRAINT `finetuning_models_jobId_finetuning_jobs_id_fk` FOREIGN KEY (`jobId`) REFERENCES `finetuning_jobs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hybrid_cast_broadcasts` ADD CONSTRAINT `hybrid_cast_broadcasts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hybrid_cast_connections` ADD CONSTRAINT `hybrid_cast_connections_sourceNodeId_hybrid_cast_nodes_id_fk` FOREIGN KEY (`sourceNodeId`) REFERENCES `hybrid_cast_nodes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hybrid_cast_connections` ADD CONSTRAINT `hybrid_cast_connections_targetNodeId_hybrid_cast_nodes_id_fk` FOREIGN KEY (`targetNodeId`) REFERENCES `hybrid_cast_nodes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hybrid_cast_nodes` ADD CONSTRAINT `hybrid_cast_nodes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hybridcast_nodes` ADD CONSTRAINT `hybridcast_nodes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `integration_logs` ADD CONSTRAINT `integration_logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `memory_store` ADD CONSTRAINT `memory_store_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `model_comparisons` ADD CONSTRAINT `model_comparisons_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `model_comparisons` ADD CONSTRAINT `model_comparisons_baselineModelId_finetuning_models_id_fk` FOREIGN KEY (`baselineModelId`) REFERENCES `finetuning_models`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `model_comparisons` ADD CONSTRAINT `model_comparisons_candidateModelId_finetuning_models_id_fk` FOREIGN KEY (`candidateModelId`) REFERENCES `finetuning_models`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification_events` ADD CONSTRAINT `notification_events_notificationId_notifications_id_fk` FOREIGN KEY (`notificationId`) REFERENCES `notifications`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `performance_metrics` ADD CONSTRAINT `performance_metrics_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `performance_metrics` ADD CONSTRAINT `performance_metrics_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `performance_trends` ADD CONSTRAINT `performance_trends_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `plugins` ADD CONSTRAINT `plugins_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `policy_decisions` ADD CONSTRAINT `policy_decisions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `predictive_alerts` ADD CONSTRAINT `predictive_alerts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quota_alerts` ADD CONSTRAINT `quota_alerts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quotas` ADD CONSTRAINT `quotas_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `radio_channels` ADD CONSTRAINT `radio_channels_stationId_radio_stations_id_fk` FOREIGN KEY (`stationId`) REFERENCES `radio_stations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `radio_stations` ADD CONSTRAINT `radio_stations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rate_limit_events` ADD CONSTRAINT `rate_limit_events_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reasoning_chains` ADD CONSTRAINT `reasoning_chains_agentId_agent_registry_id_fk` FOREIGN KEY (`agentId`) REFERENCES `agent_registry`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reasoning_chains` ADD CONSTRAINT `reasoning_chains_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `report_history` ADD CONSTRAINT `report_history_reportId_scheduled_reports_id_fk` FOREIGN KEY (`reportId`) REFERENCES `scheduled_reports`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review_helpfulness` ADD CONSTRAINT `review_helpfulness_reviewId_reviews_id_fk` FOREIGN KEY (`reviewId`) REFERENCES `reviews`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review_helpfulness` ADD CONSTRAINT `review_helpfulness_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review_responses` ADD CONSTRAINT `review_responses_reviewId_reviews_id_fk` FOREIGN KEY (`reviewId`) REFERENCES `reviews`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review_responses` ADD CONSTRAINT `review_responses_responderId_users_id_fk` FOREIGN KEY (`responderId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rockin_boogie_content` ADD CONSTRAINT `rockin_boogie_content_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scheduled_reports` ADD CONSTRAINT `scheduled_reports_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_annotations` ADD CONSTRAINT `session_annotations_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_annotations` ADD CONSTRAINT `session_annotations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_annotations` ADD CONSTRAINT `session_annotations_messageId_messages_id_fk` FOREIGN KEY (`messageId`) REFERENCES `messages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_metrics` ADD CONSTRAINT `session_metrics_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_shares` ADD CONSTRAINT `session_shares_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_shares` ADD CONSTRAINT `session_shares_sharedBy_users_id_fk` FOREIGN KEY (`sharedBy`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_shares` ADD CONSTRAINT `session_shares_sharedWith_users_id_fk` FOREIGN KEY (`sharedWith`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_versions` ADD CONSTRAINT `session_versions_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_versions` ADD CONSTRAINT `session_versions_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `solbones_frequency_rolls` ADD CONSTRAINT `solbones_frequency_rolls_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `solbones_leaderboard` ADD CONSTRAINT `solbones_leaderboard_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `suppression_rules` ADD CONSTRAINT `suppression_rules_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `task_execution_log` ADD CONSTRAINT `task_execution_log_taskId_autonomous_tasks_id_fk` FOREIGN KEY (`taskId`) REFERENCES `autonomous_tasks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `task_history` ADD CONSTRAINT `task_history_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `task_steps` ADD CONSTRAINT `task_steps_taskId_autonomous_tasks_id_fk` FOREIGN KEY (`taskId`) REFERENCES `autonomous_tasks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_members` ADD CONSTRAINT `team_members_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_members` ADD CONSTRAINT `team_members_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teams` ADD CONSTRAINT `teams_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tool_executions` ADD CONSTRAINT `tool_executions_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tool_usage_stats` ADD CONSTRAINT `tool_usage_stats_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `training_data` ADD CONSTRAINT `training_data_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `training_data` ADD CONSTRAINT `training_data_sessionId_agent_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `agent_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `usage_quotas` ADD CONSTRAINT `usage_quotas_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_subscriptions` ADD CONSTRAINT `user_subscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_subscriptions` ADD CONSTRAINT `user_subscriptions_tierId_subscription_tiers_id_fk` FOREIGN KEY (`tierId`) REFERENCES `subscription_tiers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `voice_commands` ADD CONSTRAINT `voice_commands_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhook_endpoints` ADD CONSTRAINT `webhook_endpoints_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhook_installations` ADD CONSTRAINT `webhook_installations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhook_installations` ADD CONSTRAINT `webhook_installations_templateId_webhook_templates_id_fk` FOREIGN KEY (`templateId`) REFERENCES `webhook_templates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhook_logs` ADD CONSTRAINT `webhook_logs_webhookId_webhook_endpoints_id_fk` FOREIGN KEY (`webhookId`) REFERENCES `webhook_endpoints`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhook_marketplace_reviews` ADD CONSTRAINT `webhook_marketplace_reviews_templateId_webhook_templates_id_fk` FOREIGN KEY (`templateId`) REFERENCES `webhook_templates`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhook_marketplace_reviews` ADD CONSTRAINT `webhook_marketplace_reviews_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `subscription_tiers_name_unique` ON `subscription_tiers` (`name`);--> statement-breakpoint
CREATE INDEX `users_openId_unique` ON `users` (`openId`);