import { relations } from "drizzle-orm/relations";
import { users, activityLogs, agentSessions, agentCollaboration, agentRegistry, agentExecutionLogs, agentMemory, agentPerformanceMetrics, agentSnapshots, agentTools, emergencyAlerts, alertBroadcastLog, radioChannels, alertDeliveryLog, hybridcastNodes, analyticsMetrics, anomalyBaselines, anomalyHistory, detectedAnomalies, anomalyInsights, anomalyPatterns, anomalyReports, anomalyRules, apiKeys, apiUsage, autoSaveSettings, rockinBoogieContent, contentListenerHistory, emailConfigs, escalationPolicies, featureFlags, filterHistory, filterPresets, finetuningDatasets, finetuningJobs, finetuningEvaluations, finetuningModels, integrationLogs, memoryStore, messages, modelComparisons, notifications, notificationEvents, notificationPreferences, performanceMetrics, performanceTrends, plugins, policyDecisions, predictiveAlerts, quotaAlerts, quotas, radioStations, rateLimitEvents, reasoningChains, scheduledReports, reportHistory, sessionAnnotations, sessionMetrics, sessionShares, sessionVersions, suppressionRules, taskHistory, teams, teamMembers, toolExecutions, toolUsageStats, trainingData, usageQuotas, userSubscriptions, subscriptionTiers, webhookEndpoints, webhookInstallations, webhookTemplates, webhookLogs, webhookMarketplaceReviews } from "./schema";

export const activityLogsRelations = relations(activityLogs, ({one}) => ({
	user: one(users, {
		fields: [activityLogs.userId],
		references: [users.id]
	}),
	agentSession: one(agentSessions, {
		fields: [activityLogs.sessionId],
		references: [agentSessions.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	activityLogs: many(activityLogs),
	agentRegistries: many(agentRegistry),
	agentSessions: many(agentSessions),
	agentSnapshots: many(agentSnapshots),
	analyticsMetrics: many(analyticsMetrics),
	anomalyBaselines: many(anomalyBaselines),
	anomalyHistories_userId: many(anomalyHistory, {
		relationName: "anomalyHistory_userId_users_id"
	}),
	anomalyHistories_performedBy: many(anomalyHistory, {
		relationName: "anomalyHistory_performedBy_users_id"
	}),
	anomalyInsights: many(anomalyInsights),
	anomalyPatterns: many(anomalyPatterns),
	anomalyReports: many(anomalyReports),
	anomalyRules: many(anomalyRules),
	apiKeys: many(apiKeys),
	apiUsages: many(apiUsage),
	autoSaveSettings: many(autoSaveSettings),
	detectedAnomalies: many(detectedAnomalies),
	emailConfigs: many(emailConfigs),
	emergencyAlerts: many(emergencyAlerts),
	escalationPolicies: many(escalationPolicies),
	featureFlags: many(featureFlags),
	filterHistories: many(filterHistory),
	filterPresets: many(filterPresets),
	finetuningDatasets: many(finetuningDatasets),
	finetuningJobs: many(finetuningJobs),
	finetuningModels: many(finetuningModels),
	hybridcastNodes: many(hybridcastNodes),
	integrationLogs: many(integrationLogs),
	modelComparisons: many(modelComparisons),
	notificationPreferences: many(notificationPreferences),
	notifications: many(notifications),
	performanceMetrics: many(performanceMetrics),
	performanceTrends: many(performanceTrends),
	plugins: many(plugins),
	policyDecisions: many(policyDecisions),
	predictiveAlerts: many(predictiveAlerts),
	quotaAlerts: many(quotaAlerts),
	quotas: many(quotas),
	radioStations: many(radioStations),
	rateLimitEvents: many(rateLimitEvents),
	rockinBoogieContents: many(rockinBoogieContent),
	scheduledReports: many(scheduledReports),
	sessionAnnotations: many(sessionAnnotations),
	sessionShares_sharedBy: many(sessionShares, {
		relationName: "sessionShares_sharedBy_users_id"
	}),
	sessionShares_sharedWith: many(sessionShares, {
		relationName: "sessionShares_sharedWith_users_id"
	}),
	sessionVersions: many(sessionVersions),
	suppressionRules: many(suppressionRules),
	teamMembers: many(teamMembers),
	teams: many(teams),
	toolUsageStats: many(toolUsageStats),
	trainingData: many(trainingData),
	usageQuotas: many(usageQuotas),
	userSubscriptions: many(userSubscriptions),
	webhookEndpoints: many(webhookEndpoints),
	webhookInstallations: many(webhookInstallations),
	webhookMarketplaceReviews: many(webhookMarketplaceReviews),
}));

export const agentSessionsRelations = relations(agentSessions, ({one, many}) => ({
	activityLogs: many(activityLogs),
	agentCollaborations: many(agentCollaboration),
	agentExecutionLogs: many(agentExecutionLogs),
	agentMemories: many(agentMemory),
	user: one(users, {
		fields: [agentSessions.userId],
		references: [users.id]
	}),
	agentSnapshots: many(agentSnapshots),
	autoSaveSettings: many(autoSaveSettings),
	detectedAnomalies: many(detectedAnomalies),
	memoryStores: many(memoryStore),
	messages: many(messages),
	notifications: many(notifications),
	performanceMetrics: many(performanceMetrics),
	reasoningChains: many(reasoningChains),
	sessionAnnotations: many(sessionAnnotations),
	sessionMetrics: many(sessionMetrics),
	sessionShares: many(sessionShares),
	sessionVersions: many(sessionVersions),
	taskHistories: many(taskHistory),
	toolExecutions: many(toolExecutions),
	trainingData: many(trainingData),
}));

export const agentCollaborationRelations = relations(agentCollaboration, ({one}) => ({
	agentSession: one(agentSessions, {
		fields: [agentCollaboration.sessionId],
		references: [agentSessions.id]
	}),
	agentRegistry_initiatorAgentId: one(agentRegistry, {
		fields: [agentCollaboration.initiatorAgentId],
		references: [agentRegistry.id],
		relationName: "agentCollaboration_initiatorAgentId_agentRegistry_id"
	}),
	agentRegistry_collaboratorAgentId: one(agentRegistry, {
		fields: [agentCollaboration.collaboratorAgentId],
		references: [agentRegistry.id],
		relationName: "agentCollaboration_collaboratorAgentId_agentRegistry_id"
	}),
}));

export const agentRegistryRelations = relations(agentRegistry, ({one, many}) => ({
	agentCollaborations_initiatorAgentId: many(agentCollaboration, {
		relationName: "agentCollaboration_initiatorAgentId_agentRegistry_id"
	}),
	agentCollaborations_collaboratorAgentId: many(agentCollaboration, {
		relationName: "agentCollaboration_collaboratorAgentId_agentRegistry_id"
	}),
	agentExecutionLogs: many(agentExecutionLogs),
	agentMemories: many(agentMemory),
	agentPerformanceMetrics: many(agentPerformanceMetrics),
	user: one(users, {
		fields: [agentRegistry.userId],
		references: [users.id]
	}),
	agentTools: many(agentTools),
	reasoningChains: many(reasoningChains),
}));

export const agentExecutionLogsRelations = relations(agentExecutionLogs, ({one}) => ({
	agentRegistry: one(agentRegistry, {
		fields: [agentExecutionLogs.agentId],
		references: [agentRegistry.id]
	}),
	agentSession: one(agentSessions, {
		fields: [agentExecutionLogs.sessionId],
		references: [agentSessions.id]
	}),
}));

export const agentMemoryRelations = relations(agentMemory, ({one}) => ({
	agentRegistry: one(agentRegistry, {
		fields: [agentMemory.agentId],
		references: [agentRegistry.id]
	}),
	agentSession: one(agentSessions, {
		fields: [agentMemory.sessionId],
		references: [agentSessions.id]
	}),
}));

export const agentPerformanceMetricsRelations = relations(agentPerformanceMetrics, ({one}) => ({
	agentRegistry: one(agentRegistry, {
		fields: [agentPerformanceMetrics.agentId],
		references: [agentRegistry.id]
	}),
}));

export const agentSnapshotsRelations = relations(agentSnapshots, ({one}) => ({
	user: one(users, {
		fields: [agentSnapshots.userId],
		references: [users.id]
	}),
	agentSession: one(agentSessions, {
		fields: [agentSnapshots.sessionId],
		references: [agentSessions.id]
	}),
}));

export const agentToolsRelations = relations(agentTools, ({one}) => ({
	agentRegistry: one(agentRegistry, {
		fields: [agentTools.agentId],
		references: [agentRegistry.id]
	}),
}));

export const alertBroadcastLogRelations = relations(alertBroadcastLog, ({one}) => ({
	emergencyAlert: one(emergencyAlerts, {
		fields: [alertBroadcastLog.alertId],
		references: [emergencyAlerts.id]
	}),
	radioChannel: one(radioChannels, {
		fields: [alertBroadcastLog.channelId],
		references: [radioChannels.id]
	}),
}));

export const emergencyAlertsRelations = relations(emergencyAlerts, ({one, many}) => ({
	alertBroadcastLogs: many(alertBroadcastLog),
	alertDeliveryLogs: many(alertDeliveryLog),
	user: one(users, {
		fields: [emergencyAlerts.userId],
		references: [users.id]
	}),
}));

export const radioChannelsRelations = relations(radioChannels, ({one, many}) => ({
	alertBroadcastLogs: many(alertBroadcastLog),
	radioStation: one(radioStations, {
		fields: [radioChannels.stationId],
		references: [radioStations.id]
	}),
}));

export const alertDeliveryLogRelations = relations(alertDeliveryLog, ({one}) => ({
	emergencyAlert: one(emergencyAlerts, {
		fields: [alertDeliveryLog.alertId],
		references: [emergencyAlerts.id]
	}),
	hybridcastNode: one(hybridcastNodes, {
		fields: [alertDeliveryLog.nodeId],
		references: [hybridcastNodes.id]
	}),
}));

export const hybridcastNodesRelations = relations(hybridcastNodes, ({one, many}) => ({
	alertDeliveryLogs: many(alertDeliveryLog),
	user: one(users, {
		fields: [hybridcastNodes.userId],
		references: [users.id]
	}),
}));

export const analyticsMetricsRelations = relations(analyticsMetrics, ({one}) => ({
	user: one(users, {
		fields: [analyticsMetrics.userId],
		references: [users.id]
	}),
}));

export const anomalyBaselinesRelations = relations(anomalyBaselines, ({one}) => ({
	user: one(users, {
		fields: [anomalyBaselines.userId],
		references: [users.id]
	}),
}));

export const anomalyHistoryRelations = relations(anomalyHistory, ({one}) => ({
	user_userId: one(users, {
		fields: [anomalyHistory.userId],
		references: [users.id],
		relationName: "anomalyHistory_userId_users_id"
	}),
	detectedAnomaly: one(detectedAnomalies, {
		fields: [anomalyHistory.anomalyId],
		references: [detectedAnomalies.id]
	}),
	user_performedBy: one(users, {
		fields: [anomalyHistory.performedBy],
		references: [users.id],
		relationName: "anomalyHistory_performedBy_users_id"
	}),
}));

export const detectedAnomaliesRelations = relations(detectedAnomalies, ({one, many}) => ({
	anomalyHistories: many(anomalyHistory),
	anomalyInsights: many(anomalyInsights),
	user: one(users, {
		fields: [detectedAnomalies.userId],
		references: [users.id]
	}),
	agentSession: one(agentSessions, {
		fields: [detectedAnomalies.sessionId],
		references: [agentSessions.id]
	}),
}));

export const anomalyInsightsRelations = relations(anomalyInsights, ({one}) => ({
	user: one(users, {
		fields: [anomalyInsights.userId],
		references: [users.id]
	}),
	detectedAnomaly: one(detectedAnomalies, {
		fields: [anomalyInsights.anomalyId],
		references: [detectedAnomalies.id]
	}),
}));

export const anomalyPatternsRelations = relations(anomalyPatterns, ({one}) => ({
	user: one(users, {
		fields: [anomalyPatterns.userId],
		references: [users.id]
	}),
}));

export const anomalyReportsRelations = relations(anomalyReports, ({one}) => ({
	user: one(users, {
		fields: [anomalyReports.userId],
		references: [users.id]
	}),
}));

export const anomalyRulesRelations = relations(anomalyRules, ({one}) => ({
	user: one(users, {
		fields: [anomalyRules.userId],
		references: [users.id]
	}),
}));

export const apiKeysRelations = relations(apiKeys, ({one}) => ({
	user: one(users, {
		fields: [apiKeys.userId],
		references: [users.id]
	}),
}));

export const apiUsageRelations = relations(apiUsage, ({one}) => ({
	user: one(users, {
		fields: [apiUsage.userId],
		references: [users.id]
	}),
}));

export const autoSaveSettingsRelations = relations(autoSaveSettings, ({one}) => ({
	user: one(users, {
		fields: [autoSaveSettings.userId],
		references: [users.id]
	}),
	agentSession: one(agentSessions, {
		fields: [autoSaveSettings.sessionId],
		references: [agentSessions.id]
	}),
}));

export const contentListenerHistoryRelations = relations(contentListenerHistory, ({one}) => ({
	rockinBoogieContent: one(rockinBoogieContent, {
		fields: [contentListenerHistory.contentId],
		references: [rockinBoogieContent.id]
	}),
}));

export const rockinBoogieContentRelations = relations(rockinBoogieContent, ({one, many}) => ({
	contentListenerHistories: many(contentListenerHistory),
	user: one(users, {
		fields: [rockinBoogieContent.userId],
		references: [users.id]
	}),
}));

export const emailConfigsRelations = relations(emailConfigs, ({one}) => ({
	user: one(users, {
		fields: [emailConfigs.userId],
		references: [users.id]
	}),
}));

export const escalationPoliciesRelations = relations(escalationPolicies, ({one}) => ({
	user: one(users, {
		fields: [escalationPolicies.userId],
		references: [users.id]
	}),
}));

export const featureFlagsRelations = relations(featureFlags, ({one}) => ({
	user: one(users, {
		fields: [featureFlags.userId],
		references: [users.id]
	}),
}));

export const filterHistoryRelations = relations(filterHistory, ({one}) => ({
	user: one(users, {
		fields: [filterHistory.userId],
		references: [users.id]
	}),
}));

export const filterPresetsRelations = relations(filterPresets, ({one}) => ({
	user: one(users, {
		fields: [filterPresets.userId],
		references: [users.id]
	}),
}));

export const finetuningDatasetsRelations = relations(finetuningDatasets, ({one, many}) => ({
	user: one(users, {
		fields: [finetuningDatasets.userId],
		references: [users.id]
	}),
	finetuningJobs: many(finetuningJobs),
}));

export const finetuningEvaluationsRelations = relations(finetuningEvaluations, ({one}) => ({
	finetuningJob: one(finetuningJobs, {
		fields: [finetuningEvaluations.jobId],
		references: [finetuningJobs.id]
	}),
	finetuningModel: one(finetuningModels, {
		fields: [finetuningEvaluations.modelId],
		references: [finetuningModels.id]
	}),
}));

export const finetuningJobsRelations = relations(finetuningJobs, ({one, many}) => ({
	finetuningEvaluations: many(finetuningEvaluations),
	user: one(users, {
		fields: [finetuningJobs.userId],
		references: [users.id]
	}),
	finetuningDataset: one(finetuningDatasets, {
		fields: [finetuningJobs.datasetId],
		references: [finetuningDatasets.id]
	}),
	finetuningModels: many(finetuningModels),
}));

export const finetuningModelsRelations = relations(finetuningModels, ({one, many}) => ({
	finetuningEvaluations: many(finetuningEvaluations),
	user: one(users, {
		fields: [finetuningModels.userId],
		references: [users.id]
	}),
	finetuningJob: one(finetuningJobs, {
		fields: [finetuningModels.jobId],
		references: [finetuningJobs.id]
	}),
	modelComparisons_baselineModelId: many(modelComparisons, {
		relationName: "modelComparisons_baselineModelId_finetuningModels_id"
	}),
	modelComparisons_candidateModelId: many(modelComparisons, {
		relationName: "modelComparisons_candidateModelId_finetuningModels_id"
	}),
}));

export const integrationLogsRelations = relations(integrationLogs, ({one}) => ({
	user: one(users, {
		fields: [integrationLogs.userId],
		references: [users.id]
	}),
}));

export const memoryStoreRelations = relations(memoryStore, ({one}) => ({
	agentSession: one(agentSessions, {
		fields: [memoryStore.sessionId],
		references: [agentSessions.id]
	}),
}));

export const messagesRelations = relations(messages, ({one, many}) => ({
	agentSession: one(agentSessions, {
		fields: [messages.sessionId],
		references: [agentSessions.id]
	}),
	sessionAnnotations: many(sessionAnnotations),
}));

export const modelComparisonsRelations = relations(modelComparisons, ({one}) => ({
	user: one(users, {
		fields: [modelComparisons.userId],
		references: [users.id]
	}),
	finetuningModel_baselineModelId: one(finetuningModels, {
		fields: [modelComparisons.baselineModelId],
		references: [finetuningModels.id],
		relationName: "modelComparisons_baselineModelId_finetuningModels_id"
	}),
	finetuningModel_candidateModelId: one(finetuningModels, {
		fields: [modelComparisons.candidateModelId],
		references: [finetuningModels.id],
		relationName: "modelComparisons_candidateModelId_finetuningModels_id"
	}),
}));

export const notificationEventsRelations = relations(notificationEvents, ({one}) => ({
	notification: one(notifications, {
		fields: [notificationEvents.notificationId],
		references: [notifications.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one, many}) => ({
	notificationEvents: many(notificationEvents),
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
	agentSession: one(agentSessions, {
		fields: [notifications.sessionId],
		references: [agentSessions.id]
	}),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({one}) => ({
	user: one(users, {
		fields: [notificationPreferences.userId],
		references: [users.id]
	}),
}));

export const performanceMetricsRelations = relations(performanceMetrics, ({one}) => ({
	user: one(users, {
		fields: [performanceMetrics.userId],
		references: [users.id]
	}),
	agentSession: one(agentSessions, {
		fields: [performanceMetrics.sessionId],
		references: [agentSessions.id]
	}),
}));

export const performanceTrendsRelations = relations(performanceTrends, ({one}) => ({
	user: one(users, {
		fields: [performanceTrends.userId],
		references: [users.id]
	}),
}));

export const pluginsRelations = relations(plugins, ({one}) => ({
	user: one(users, {
		fields: [plugins.userId],
		references: [users.id]
	}),
}));

export const policyDecisionsRelations = relations(policyDecisions, ({one}) => ({
	user: one(users, {
		fields: [policyDecisions.userId],
		references: [users.id]
	}),
}));

export const predictiveAlertsRelations = relations(predictiveAlerts, ({one}) => ({
	user: one(users, {
		fields: [predictiveAlerts.userId],
		references: [users.id]
	}),
}));

export const quotaAlertsRelations = relations(quotaAlerts, ({one}) => ({
	user: one(users, {
		fields: [quotaAlerts.userId],
		references: [users.id]
	}),
}));

export const quotasRelations = relations(quotas, ({one}) => ({
	user: one(users, {
		fields: [quotas.userId],
		references: [users.id]
	}),
}));

export const radioStationsRelations = relations(radioStations, ({one, many}) => ({
	radioChannels: many(radioChannels),
	user: one(users, {
		fields: [radioStations.userId],
		references: [users.id]
	}),
}));

export const rateLimitEventsRelations = relations(rateLimitEvents, ({one}) => ({
	user: one(users, {
		fields: [rateLimitEvents.userId],
		references: [users.id]
	}),
}));

export const reasoningChainsRelations = relations(reasoningChains, ({one}) => ({
	agentRegistry: one(agentRegistry, {
		fields: [reasoningChains.agentId],
		references: [agentRegistry.id]
	}),
	agentSession: one(agentSessions, {
		fields: [reasoningChains.sessionId],
		references: [agentSessions.id]
	}),
}));

export const reportHistoryRelations = relations(reportHistory, ({one}) => ({
	scheduledReport: one(scheduledReports, {
		fields: [reportHistory.reportId],
		references: [scheduledReports.id]
	}),
}));

export const scheduledReportsRelations = relations(scheduledReports, ({one, many}) => ({
	reportHistories: many(reportHistory),
	user: one(users, {
		fields: [scheduledReports.userId],
		references: [users.id]
	}),
}));

export const sessionAnnotationsRelations = relations(sessionAnnotations, ({one}) => ({
	agentSession: one(agentSessions, {
		fields: [sessionAnnotations.sessionId],
		references: [agentSessions.id]
	}),
	user: one(users, {
		fields: [sessionAnnotations.userId],
		references: [users.id]
	}),
	message: one(messages, {
		fields: [sessionAnnotations.messageId],
		references: [messages.id]
	}),
}));

export const sessionMetricsRelations = relations(sessionMetrics, ({one}) => ({
	agentSession: one(agentSessions, {
		fields: [sessionMetrics.sessionId],
		references: [agentSessions.id]
	}),
}));

export const sessionSharesRelations = relations(sessionShares, ({one}) => ({
	agentSession: one(agentSessions, {
		fields: [sessionShares.sessionId],
		references: [agentSessions.id]
	}),
	user_sharedBy: one(users, {
		fields: [sessionShares.sharedBy],
		references: [users.id],
		relationName: "sessionShares_sharedBy_users_id"
	}),
	user_sharedWith: one(users, {
		fields: [sessionShares.sharedWith],
		references: [users.id],
		relationName: "sessionShares_sharedWith_users_id"
	}),
}));

export const sessionVersionsRelations = relations(sessionVersions, ({one}) => ({
	agentSession: one(agentSessions, {
		fields: [sessionVersions.sessionId],
		references: [agentSessions.id]
	}),
	user: one(users, {
		fields: [sessionVersions.createdBy],
		references: [users.id]
	}),
}));

export const suppressionRulesRelations = relations(suppressionRules, ({one}) => ({
	user: one(users, {
		fields: [suppressionRules.userId],
		references: [users.id]
	}),
}));

export const taskHistoryRelations = relations(taskHistory, ({one}) => ({
	agentSession: one(agentSessions, {
		fields: [taskHistory.sessionId],
		references: [agentSessions.id]
	}),
}));

export const teamMembersRelations = relations(teamMembers, ({one}) => ({
	team: one(teams, {
		fields: [teamMembers.teamId],
		references: [teams.id]
	}),
	user: one(users, {
		fields: [teamMembers.userId],
		references: [users.id]
	}),
}));

export const teamsRelations = relations(teams, ({one, many}) => ({
	teamMembers: many(teamMembers),
	user: one(users, {
		fields: [teams.ownerId],
		references: [users.id]
	}),
}));

export const toolExecutionsRelations = relations(toolExecutions, ({one}) => ({
	agentSession: one(agentSessions, {
		fields: [toolExecutions.sessionId],
		references: [agentSessions.id]
	}),
}));

export const toolUsageStatsRelations = relations(toolUsageStats, ({one}) => ({
	user: one(users, {
		fields: [toolUsageStats.userId],
		references: [users.id]
	}),
}));

export const trainingDataRelations = relations(trainingData, ({one}) => ({
	user: one(users, {
		fields: [trainingData.userId],
		references: [users.id]
	}),
	agentSession: one(agentSessions, {
		fields: [trainingData.sessionId],
		references: [agentSessions.id]
	}),
}));

export const usageQuotasRelations = relations(usageQuotas, ({one}) => ({
	user: one(users, {
		fields: [usageQuotas.userId],
		references: [users.id]
	}),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({one}) => ({
	user: one(users, {
		fields: [userSubscriptions.userId],
		references: [users.id]
	}),
	subscriptionTier: one(subscriptionTiers, {
		fields: [userSubscriptions.tierId],
		references: [subscriptionTiers.id]
	}),
}));

export const subscriptionTiersRelations = relations(subscriptionTiers, ({many}) => ({
	userSubscriptions: many(userSubscriptions),
}));

export const webhookEndpointsRelations = relations(webhookEndpoints, ({one, many}) => ({
	user: one(users, {
		fields: [webhookEndpoints.userId],
		references: [users.id]
	}),
	webhookLogs: many(webhookLogs),
}));

export const webhookInstallationsRelations = relations(webhookInstallations, ({one}) => ({
	user: one(users, {
		fields: [webhookInstallations.userId],
		references: [users.id]
	}),
	webhookTemplate: one(webhookTemplates, {
		fields: [webhookInstallations.templateId],
		references: [webhookTemplates.id]
	}),
}));

export const webhookTemplatesRelations = relations(webhookTemplates, ({many}) => ({
	webhookInstallations: many(webhookInstallations),
	webhookMarketplaceReviews: many(webhookMarketplaceReviews),
}));

export const webhookLogsRelations = relations(webhookLogs, ({one}) => ({
	webhookEndpoint: one(webhookEndpoints, {
		fields: [webhookLogs.webhookId],
		references: [webhookEndpoints.id]
	}),
}));

export const webhookMarketplaceReviewsRelations = relations(webhookMarketplaceReviews, ({one}) => ({
	webhookTemplate: one(webhookTemplates, {
		fields: [webhookMarketplaceReviews.templateId],
		references: [webhookTemplates.id]
	}),
	user: one(users, {
		fields: [webhookMarketplaceReviews.userId],
		references: [users.id]
	}),
}));