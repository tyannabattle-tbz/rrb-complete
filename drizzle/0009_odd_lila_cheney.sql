ALTER TABLE `agent_marketplace` MODIFY COLUMN `tags` json;--> statement-breakpoint
ALTER TABLE `agent_marketplace` MODIFY COLUMN `capabilities` json;--> statement-breakpoint
ALTER TABLE `agent_marketplace` MODIFY COLUMN `rating` decimal(3,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `orchestration_results` MODIFY COLUMN `cost` decimal(10,4) DEFAULT '0.0000';--> statement-breakpoint
ALTER TABLE `orchestration_tasks` MODIFY COLUMN `assignedAgents` json;--> statement-breakpoint
ALTER TABLE `webhook_templates` MODIFY COLUMN `rating` decimal(3,2) DEFAULT '0.00';