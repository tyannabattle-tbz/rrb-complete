import { mysqlTable, mysqlSchema, AnyMySqlColumn, foreignKey, int, varchar, json, text, timestamp, mysqlEnum, decimal, date, index, boolean } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const activityLogs = mysqlTable("activity_logs", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	sessionId: int().references(() => agentSessions.id, { onDelete: "cascade" } ),
	action: varchar({ length: 255 }).notNull(),
	resourceType: varchar({ length: 64 }).notNull(),
	resourceId: int(),
	changes: json(),
	ipAddress: varchar({ length: 45 }),
	userAgent: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const agentCollaboration = mysqlTable("agent_collaboration", {
	id: int().autoincrement().notNull(),
	sessionId: int().notNull().references(() => agentSessions.id, { onDelete: "cascade" } ),
	initiatorAgentId: int().notNull().references(() => agentRegistry.id, { onDelete: "cascade" } ),
	collaboratorAgentId: int().notNull().references(() => agentRegistry.id, { onDelete: "cascade" } ),
	collaborationType: mysqlEnum(['sequential','parallel','hierarchical','peer']).notNull(),
	message: text(),
	response: text(),
	status: mysqlEnum(['pending','acknowledged','completed','failed']).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const agentExecutionLogs = mysqlTable("agent_execution_logs", {
	id: int().autoincrement().notNull(),
	agentId: int().notNull().references(() => agentRegistry.id, { onDelete: "cascade" } ),
	sessionId: int().notNull().references(() => agentSessions.id, { onDelete: "cascade" } ),
	executionType: mysqlEnum(['task','tool_call','reasoning_step','decision_point']).notNull(),
	input: text(),
	output: text(),
	status: mysqlEnum(['pending','running','success','failed','timeout']).notNull(),
	errorMessage: text(),
	executionTime: int(),
	resourcesUsed: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const agentInstallations = mysqlTable("agent_installations", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	marketplaceAgentId: int().notNull(),
	localAgentId: int().notNull(),
	version: varchar({ length: 50 }).notNull(),
	status: mysqlEnum(['installed','updating','deprecated','uninstalled']).default('installed'),
	lastUpdated: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const agentMemory = mysqlTable("agent_memory", {
	id: int().autoincrement().notNull(),
	agentId: int().notNull().references(() => agentRegistry.id, { onDelete: "cascade" } ),
	sessionId: int().notNull().references(() => agentSessions.id, { onDelete: "cascade" } ),
	memoryType: mysqlEnum(['short_term','long_term','episodic','semantic']).notNull(),
	key: varchar({ length: 255 }).notNull(),
	value: text().notNull(),
	importance: int().default(5),
	accessCount: int().default(0),
	lastAccessedAt: timestamp({ mode: 'string' }),
	expiresAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const agentPerformanceMetrics = mysqlTable("agent_performance_metrics", {
	id: int().autoincrement().notNull(),
	agentId: int().notNull().references(() => agentRegistry.id, { onDelete: "cascade" } ),
	taskSuccessRate: decimal({ precision: 5, scale: 2 }).default('0'),
	averageExecutionTime: int().default(0),
	totalTasksCompleted: int().default(0),
	totalTasksFailed: int().default(0),
	averageTokensPerTask: int().default(0),
	costPerTask: decimal({ precision: 10, scale: 4 }).default('0'),
	uptime: decimal({ precision: 5, scale: 2 }).default('100'),
	lastHealthCheck: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const agentRegistry = mysqlTable("agent_registry", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	agentName: varchar({ length: 255 }).notNull(),
	agentType: mysqlEnum(['reasoning','execution','monitoring','coordination','custom']).notNull(),
	description: text(),
	version: varchar({ length: 64 }).default('1.0.0'),
	status: mysqlEnum(['active','inactive','maintenance','deprecated']).default('active'),
	capabilities: json(),
	configuration: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const agentSessions = mysqlTable("agent_sessions", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id),
	sessionName: varchar({ length: 255 }).notNull(),
	systemPrompt: text(),
	temperature: int().default(70),
	model: varchar({ length: 64 }).default('gpt-4-turbo'),
	maxSteps: int().default(50),
	status: mysqlEnum(['idle','reasoning','executing','completed','error']).default('idle'),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const agentSnapshots = mysqlTable("agent_snapshots", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	sessionId: int().notNull().references(() => agentSessions.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	config: json().notNull(),
	memory: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const agentTools = mysqlTable("agent_tools", {
	id: int().autoincrement().notNull(),
	agentId: int().notNull().references(() => agentRegistry.id, { onDelete: "cascade" } ),
	toolName: varchar({ length: 255 }).notNull(),
	toolType: mysqlEnum(['api','database','file_system','computation','external_service']).notNull(),
	description: text(),
	endpoint: varchar({ length: 512 }),
	authentication: json(),
	parameters: json(),
	rateLimit: int(),
	timeout: int().default(30000),
	isActive: int().default(1),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const alertBroadcastLog = mysqlTable("alert_broadcast_log", {
	id: int().autoincrement().notNull(),
	alertId: int().notNull().references(() => emergencyAlerts.id, { onDelete: "cascade" } ),
	channelId: int().notNull().references(() => radioChannels.id),
	status: mysqlEnum(['pending','broadcasting','delivered','failed']).default('pending'),
	listenersReached: int().default(0),
	interruptedRegularContent: int().default(0),
	error: text(),
	broadcastStartedAt: timestamp({ mode: 'string' }),
	broadcastEndedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const alertDeliveryLog = mysqlTable("alert_delivery_log", {
	id: int().autoincrement().notNull(),
	alertId: int().notNull().references(() => emergencyAlerts.id, { onDelete: "cascade" } ),
	nodeId: int().references(() => hybridcastNodes.id),
	region: varchar({ length: 255 }).notNull(),
	status: mysqlEnum(['pending','delivered','failed']).default('pending'),
	recipientsReached: int().default(0),
	error: text(),
	deliveredAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const analyticsMetrics = mysqlTable("analytics_metrics", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	period: varchar({ length: 64 }).notNull(),
	qumusDecisions: int().default(0),
	hybridCastBroadcasts: int().default(0),
	rockinBoogieListeners: int().default(0),
	avgEngagement: decimal({ precision: 5, scale: 2 }).default('0'),
	systemUptime: decimal({ precision: 5, scale: 2 }).default('100'),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
});

export const anomalyBaselines = mysqlTable("anomaly_baselines", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	metricType: mysqlEnum(['session_duration','tool_executions','success_rate','token_usage','cost','error_rate']).notNull(),
	baselineValue: decimal({ precision: 10, scale: 4 }).notNull(),
	standardDeviation: decimal({ precision: 10, scale: 4 }).notNull(),
	minValue: decimal({ precision: 10, scale: 4 }),
	maxValue: decimal({ precision: 10, scale: 4 }),
	sampleSize: int().default(0),
	lastUpdated: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const anomalyHistory = mysqlTable("anomaly_history", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	anomalyId: int().notNull().references(() => detectedAnomalies.id, { onDelete: "cascade" } ),
	action: mysqlEnum(['detected','acknowledged','resolved','dismissed','escalated']).notNull(),
	notes: text(),
	performedBy: int().references(() => users.id),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const anomalyInsights = mysqlTable("anomaly_insights", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	anomalyId: int().notNull().references(() => detectedAnomalies.id, { onDelete: "cascade" } ),
	insightType: mysqlEnum(['root_cause','trend','prediction','recommendation','correlation']).notNull(),
	content: text().notNull(),
	confidence: decimal({ precision: 5, scale: 2 }).default('0'),
	actionItems: json(),
	generatedBy: varchar({ length: 64 }).default('llm'),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const anomalyPatterns = mysqlTable("anomaly_patterns", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	patternName: varchar({ length: 255 }).notNull(),
	patternDescription: text(),
	anomalyTypes: json().notNull(),
	frequency: mysqlEnum(['rare','occasional','common','frequent']).default('occasional'),
	lastOccurrence: timestamp({ mode: 'string' }),
	occurrenceCount: int().default(0),
	correlatedMetrics: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const anomalyReports = mysqlTable("anomaly_reports", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	reportName: varchar({ length: 255 }).notNull(),
	reportType: mysqlEnum(['daily','weekly','monthly','custom']).notNull(),
	startDate: timestamp({ mode: 'string' }).notNull(),
	endDate: timestamp({ mode: 'string' }).notNull(),
	totalAnomalies: int().default(0),
	criticalCount: int().default(0),
	highCount: int().default(0),
	resolvedCount: int().default(0),
	trendAnalysis: json(),
	impactAssessment: json(),
	recommendations: json(),
	reportContent: text(),
	format: mysqlEnum(['pdf','csv','json','html']).default('pdf'),
	emailDelivery: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const anomalyRules = mysqlTable("anomaly_rules", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	ruleName: varchar({ length: 255 }).notNull(),
	ruleDescription: text(),
	condition: text().notNull(),
	threshold: decimal({ precision: 10, scale: 4 }).notNull(),
	severity: mysqlEnum(['low','medium','high','critical']).default('medium'),
	isActive: int().default(1),
	notifyOnTrigger: int().default(1),
	autoResolve: int().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const apiKeys = mysqlTable("api_keys", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	provider: varchar({ length: 64 }).notNull(),
	keyName: varchar({ length: 255 }).notNull(),
	encryptedKey: text().notNull(),
	lastUsed: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const apiUsage = mysqlTable("api_usage", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	date: timestamp({ mode: 'string' }).notNull(),
	requestCount: int().default(0),
	tokenCount: int().default(0),
	errorCount: int().default(0),
	totalDuration: int().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const auditLogs = mysqlTable("audit_logs", {
	id: int().autoincrement().notNull(),
	userId: int(),
	action: varchar({ length: 255 }).notNull(),
	resource: varchar({ length: 255 }).notNull(),
	resourceId: varchar({ length: 255 }),
	changes: json(),
	ipAddress: varchar({ length: 45 }),
	userAgent: text(),
	status: mysqlEnum(['success','failure']).default('success'),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const autoSaveSettings = mysqlTable("auto_save_settings", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	sessionId: int().notNull().references(() => agentSessions.id, { onDelete: "cascade" } ),
	autoSaveEnabled: int().default(1),
	autoSaveInterval: int().default(60000),
	maxVersions: int().default(50),
	retentionDays: int().default(30),
	lastAutoSave: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const contentListenerHistory = mysqlTable("content_listener_history", {
	id: int().autoincrement().notNull(),
	contentId: int().notNull().references(() => rockinBoogieContent.id, { onDelete: "cascade" } ),
	timestamp: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	listenerCount: int().notNull(),
	engagementScore: decimal({ precision: 5, scale: 2 }).default('0'),
});

export const detectedAnomalies = mysqlTable("detected_anomalies", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	sessionId: int().references(() => agentSessions.id, { onDelete: "cascade" } ),
	anomalyType: mysqlEnum(['performance_degradation','unusual_tool_usage','high_error_rate','cost_spike','token_spike','success_rate_drop']).notNull(),
	severity: mysqlEnum(['low','medium','high','critical']).default('medium'),
	metricName: varchar({ length: 255 }).notNull(),
	expectedValue: decimal({ precision: 10, scale: 4 }),
	actualValue: decimal({ precision: 10, scale: 4 }).notNull(),
	deviationPercentage: decimal({ precision: 10, scale: 2 }).notNull(),
	description: text(),
	aiInsight: text(),
	recommendedAction: text(),
	isResolved: int().default(0),
	resolvedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const donors = mysqlTable("donors", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }),
	phone: varchar({ length: 20 }),
	donationHistory: json(),
	totalDonated: decimal({ precision: 10, scale: 2 }).default('0'),
	donorTier: mysqlEnum(['bronze','silver','gold','platinum']).default('bronze'),
	status: mysqlEnum(['active','inactive','prospect']).default('active'),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
});

export const emailConfigs = mysqlTable("email_configs", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	provider: mysqlEnum(['sendgrid','mailgun','smtp']).default('sendgrid'),
	apiKey: text().notNull(),
	fromEmail: varchar({ length: 255 }).notNull(),
	fromName: varchar({ length: 255 }),
	isActive: int().default(1),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const emergencyAlerts = mysqlTable("emergency_alerts", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	severity: mysqlEnum(['critical','high','medium','low']).notNull(),
	status: mysqlEnum(['draft','scheduled','active','completed']).default('draft'),
	recipients: int().default(0),
	deliveryRate: decimal({ precision: 5, scale: 2 }).default('0'),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	scheduledFor: timestamp({ mode: 'string' }),
	completedAt: timestamp({ mode: 'string' }),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
	broadcastChannelIds: text(),
});

export const escalationPolicies = mysqlTable("escalation_policies", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	triggers: json().notNull(),
	actions: json().notNull(),
	isActive: int().default(1),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const featureFlags = mysqlTable("feature_flags", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	flagName: varchar({ length: 255 }).notNull(),
	isEnabled: int().default(0),
	rolloutPercentage: int().default(0),
	config: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const filterHistory = mysqlTable("filter_history", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	filterConfig: json().notNull(),
	resultCount: int().default(0),
	executionTime: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const filterPresets = mysqlTable("filter_presets", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	filterConfig: json().notNull(),
	isPublic: int().default(0),
	usageCount: int().default(0),
	lastUsed: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const finetuningDatasets = mysqlTable("finetuning_datasets", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	dataCount: int().default(0),
	status: mysqlEnum(['draft','ready','training','completed','failed']).default('draft'),
	quality: mysqlEnum(['excellent','good','fair','poor']).default('good'),
	tags: text(),
	splitRatio: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const finetuningEvaluations = mysqlTable("finetuning_evaluations", {
	id: int().autoincrement().notNull(),
	jobId: int().notNull().references(() => finetuningJobs.id, { onDelete: "cascade" } ),
	modelId: int().notNull().references(() => finetuningModels.id, { onDelete: "cascade" } ),
	testDataSize: int(),
	accuracy: decimal({ precision: 5, scale: 4 }).notNull(),
	precision: decimal({ precision: 5, scale: 4 }).notNull(),
	recall: decimal({ precision: 5, scale: 4 }).notNull(),
	f1Score: decimal({ precision: 5, scale: 4 }).notNull(),
	confusionMatrix: json(),
	classReport: json(),
	evaluatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const finetuningJobs = mysqlTable("finetuning_jobs", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	datasetId: int().notNull().references(() => finetuningDatasets.id, { onDelete: "cascade" } ),
	modelName: varchar({ length: 255 }).notNull(),
	baseModel: varchar({ length: 255 }).notNull(),
	status: mysqlEnum(['pending','training','completed','failed']).default('pending'),
	progress: int().default(0),
	epochs: int().default(3),
	batchSize: int().default(32),
	learningRate: decimal({ precision: 10, scale: 6 }).default('0.0001'),
	trainingStartedAt: timestamp({ mode: 'string' }),
	trainingCompletedAt: timestamp({ mode: 'string' }),
	metrics: json(),
	error: text(),
	modelPath: varchar({ length: 2048 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const finetuningModels = mysqlTable("finetuning_models", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	jobId: int().notNull().references(() => finetuningJobs.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	baseModel: varchar({ length: 255 }).notNull(),
	version: varchar({ length: 32 }).default('1.0.0'),
	status: mysqlEnum(['active','archived','deprecated']).default('active'),
	accuracy: decimal({ precision: 5, scale: 4 }),
	precision: decimal({ precision: 5, scale: 4 }),
	recall: decimal({ precision: 5, scale: 4 }),
	f1Score: decimal({ precision: 5, scale: 4 }),
	modelPath: varchar({ length: 2048 }).notNull(),
	usageCount: int().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const grants = mysqlTable("grants", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 255 }).notNull(),
	organization: varchar({ length: 255 }),
	amount: decimal({ precision: 12, scale: 2 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	deadline: date({ mode: 'string' }),
	description: text(),
	requirements: json(),
	matchScore: decimal({ precision: 3, scale: 2 }),
	status: mysqlEnum(['open','applied','awarded','rejected','expired']).default('open'),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
});

export const hybridcastNodes = mysqlTable("hybridcast_nodes", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }).notNull(),
	region: varchar({ length: 255 }).notNull(),
	status: mysqlEnum(['ready','broadcasting','offline']).default('ready'),
	coverage: decimal({ precision: 5, scale: 2 }).default('0'),
	lastHealthCheck: timestamp({ mode: 'string' }),
	endpoint: varchar({ length: 2048 }),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
});

export const integrationLogs = mysqlTable("integration_logs", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	serviceName: varchar({ length: 255 }).notNull(),
	action: varchar({ length: 255 }).notNull(),
	status: mysqlEnum(['success','failure','pending']).default('pending'),
	request: text(),
	response: text(),
	error: text(),
	duration: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const memoryStore = mysqlTable("memory_store", {
	id: int().autoincrement().notNull(),
	sessionId: int().notNull().references(() => agentSessions.id, { onDelete: "cascade" } ),
	key: varchar({ length: 255 }).notNull(),
	value: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const messages = mysqlTable("messages", {
	id: int().autoincrement().notNull(),
	sessionId: int().notNull().references(() => agentSessions.id, { onDelete: "cascade" } ),
	role: mysqlEnum(['user','assistant','system']).notNull(),
	content: text().notNull(),
	metadata: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const modelComparisons = mysqlTable("model_comparisons", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	baselineModelId: int().notNull().references(() => finetuningModels.id),
	candidateModelId: int().notNull().references(() => finetuningModels.id),
	testDataSize: int(),
	baselineMetrics: json().notNull(),
	candidateMetrics: json().notNull(),
	improvement: decimal({ precision: 5, scale: 2 }),
	recommendation: mysqlEnum(['use_baseline','use_candidate','inconclusive']).default('inconclusive'),
	comparedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const nonprofitOperations = mysqlTable("nonprofit_operations", {
	id: int().autoincrement().notNull(),
	metricType: varchar({ length: 100 }),
	metricValue: decimal({ precision: 10, scale: 2 }),
	period: varchar({ length: 50 }),
	category: varchar({ length: 100 }),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const notificationEvents = mysqlTable("notification_events", {
	id: int().autoincrement().notNull(),
	notificationId: int().notNull().references(() => notifications.id, { onDelete: "cascade" } ),
	eventType: varchar({ length: 64 }).notNull(),
	channel: mysqlEnum(['push','email','sound','webhook']).notNull(),
	status: mysqlEnum(['pending','sent','failed','delivered']).default('pending'),
	error: text(),
	sentAt: timestamp({ mode: 'string' }),
	deliveredAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const notificationPreferences = mysqlTable("notification_preferences", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	enablePushNotifications: int().default(1),
	enableSoundNotifications: int().default(1),
	enableEmailNotifications: int().default(0),
	soundVolume: int().default(70),
	notificationTypes: json(),
	escalationEnabled: int().default(1),
	escalationDelay: int().default(300000),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const notifications = mysqlTable("notifications", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	sessionId: int().references(() => agentSessions.id, { onDelete: "cascade" } ),
	type: mysqlEnum(['message','tool_execution','task_completion','error','warning','info']).notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	severity: mysqlEnum(['low','medium','high','critical']).default('medium'),
	isRead: int().default(0),
	actionUrl: varchar({ length: 2048 }),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	readAt: timestamp({ mode: 'string' }),
	archivedAt: timestamp({ mode: 'string' }),
});

export const performanceMetrics = mysqlTable("performance_metrics", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	sessionId: int().references(() => agentSessions.id, { onDelete: "cascade" } ),
	metricType: varchar({ length: 64 }).notNull(),
	value: decimal({ precision: 15, scale: 4 }).notNull(),
	unit: varchar({ length: 32 }),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const performanceTrends = mysqlTable("performance_trends", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	date: timestamp({ mode: 'string' }).notNull(),
	sessionCount: int().default(0),
	averageSessionDuration: int(),
	totalToolExecutions: int().default(0),
	averageSuccessRate: decimal({ precision: 5, scale: 2 }).default('0'),
	totalTokensUsed: int().default(0),
	estimatedCost: decimal({ precision: 10, scale: 4 }).default('0'),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const plugins = mysqlTable("plugins", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	type: mysqlEnum(['tool','integration','middleware','custom']).default('custom'),
	code: text().notNull(),
	config: json(),
	isActive: int().default(1),
	version: varchar({ length: 32 }).default('1.0.0'),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const policyDecisions = mysqlTable("policy_decisions", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	policy: varchar({ length: 255 }).notNull(),
	count: int().default(0),
	avgTime: int().default(0),
	successRate: decimal({ precision: 5, scale: 2 }).default('0'),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
});

export const predictiveAlerts = mysqlTable("predictive_alerts", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	metricType: varchar({ length: 64 }).notNull(),
	predictedValue: decimal({ precision: 10, scale: 4 }).notNull(),
	confidenceScore: decimal({ precision: 5, scale: 2 }).notNull(),
	predictedAt: timestamp({ mode: 'string' }).notNull(),
	expectedOccurrenceTime: timestamp({ mode: 'string' }).notNull(),
	severity: mysqlEnum(['low','medium','high','critical']).default('medium'),
	proactiveActions: json(),
	triggered: int().default(0),
	triggeredAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const quotaAlerts = mysqlTable("quota_alerts", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	quotaType: mysqlEnum(['requests','tokens','cost','sessions']).notNull(),
	threshold: int().notNull(),
	isTriggered: int().default(0),
	lastTriggeredAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const quotas = mysqlTable("quotas", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	requestsPerDay: int().default(10000),
	tokensPerDay: int().default(1000000),
	concurrentSessions: int().default(10),
	storageGb: decimal({ precision: 10, scale: 2 }).default('100'),
	resetDate: timestamp({ mode: 'string' }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const radioChannels = mysqlTable("radio_channels", {
	id: int().autoincrement().notNull(),
	stationId: int().notNull().references(() => radioStations.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }).notNull(),
	frequency: varchar({ length: 64 }),
	genre: varchar({ length: 128 }),
	status: mysqlEnum(['active','scheduled','offline']).default('active'),
	currentListeners: int().default(0),
	totalListeners: int().default(0),
	streamUrl: varchar({ length: 2048 }),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
});

export const radioStations = mysqlTable("radio_stations", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }).notNull(),
	operatorName: varchar({ length: 255 }),
	description: text(),
	status: mysqlEnum(['active','inactive','maintenance']).default('active'),
	totalListeners: int().default(0),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
});

export const rateLimitEvents = mysqlTable("rate_limit_events", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	limitType: mysqlEnum(['requests_per_minute','requests_per_day','tokens_per_request','concurrent_sessions']).notNull(),
	limitValue: int().notNull(),
	currentValue: int().notNull(),
	action: mysqlEnum(['allowed','throttled','blocked']).notNull(),
	ipAddress: varchar({ length: 45 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const reasoningChains = mysqlTable("reasoning_chains", {
	id: int().autoincrement().notNull(),
	agentId: int().notNull().references(() => agentRegistry.id, { onDelete: "cascade" } ),
	sessionId: int().notNull().references(() => agentSessions.id, { onDelete: "cascade" } ),
	chainType: mysqlEnum(['chain_of_thought','tree_of_thought','graph_of_thought']).notNull(),
	steps: json(),
	finalConclusion: text(),
	confidence: decimal({ precision: 5, scale: 2 }).default('0'),
	tokensUsed: int().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const reportHistory = mysqlTable("report_history", {
	id: int().autoincrement().notNull(),
	reportId: int().notNull().references(() => scheduledReports.id, { onDelete: "cascade" } ),
	status: mysqlEnum(['pending','generating','sent','failed']).default('pending'),
	sentTo: text(),
	error: text(),
	generatedAt: timestamp({ mode: 'string' }),
	sentAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const rockinBoogieContent = mysqlTable("rockin_boogie_content", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	title: varchar({ length: 255 }).notNull(),
	type: mysqlEnum(['radio','podcast','audiobook']).notNull(),
	description: text(),
	status: mysqlEnum(['active','scheduled','archived']).default('active'),
	listeners: int().default(0),
	duration: varchar({ length: 64 }),
	schedule: varchar({ length: 255 }),
	rating: decimal({ precision: 3, scale: 1 }).default('0'),
	contentUrl: varchar({ length: 2048 }),
	thumbnailUrl: varchar({ length: 2048 }),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
});

export const scheduledReports = mysqlTable("scheduled_reports", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	reportType: mysqlEnum(['weekly','monthly','daily','custom']).default('weekly'),
	schedule: varchar({ length: 255 }).notNull(),
	recipients: text().notNull(),
	includeMetrics: json(),
	isActive: int().default(1),
	lastRun: timestamp({ mode: 'string' }),
	nextRun: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const sessionAnnotations = mysqlTable("session_annotations", {
	id: int().autoincrement().notNull(),
	sessionId: int().notNull().references(() => agentSessions.id, { onDelete: "cascade" } ),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	messageId: int().references(() => messages.id, { onDelete: "cascade" } ),
	comment: text().notNull(),
	type: mysqlEnum(['note','flag','question','suggestion']).default('note'),
	resolved: int().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const sessionMetrics = mysqlTable("session_metrics", {
	id: int().autoincrement().notNull(),
	sessionId: int().notNull().references(() => agentSessions.id, { onDelete: "cascade" } ),
	duration: int().notNull(),
	messageCount: int().default(0),
	toolExecutionCount: int().default(0),
	successfulToolExecutions: int().default(0),
	failedToolExecutions: int().default(0),
	successRate: decimal({ precision: 5, scale: 2 }).default('0'),
	averageToolDuration: int(),
	totalTokensUsed: int().default(0),
	costEstimate: decimal({ precision: 10, scale: 4 }).default('0'),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const sessionShares = mysqlTable("session_shares", {
	id: int().autoincrement().notNull(),
	sessionId: int().notNull().references(() => agentSessions.id, { onDelete: "cascade" } ),
	sharedBy: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	sharedWith: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	permission: mysqlEnum(['view','edit','admin']).default('view'),
	expiresAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const sessionVersions = mysqlTable("session_versions", {
	id: int().autoincrement().notNull(),
	sessionId: int().notNull().references(() => agentSessions.id, { onDelete: "cascade" } ),
	versionNumber: int().notNull(),
	snapshot: json().notNull(),
	messageCount: int().default(0),
	toolExecutionCount: int().default(0),
	taskCount: int().default(0),
	description: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	createdBy: int().notNull().references(() => users.id),
});

export const subscriptionTiers = mysqlTable("subscription_tiers", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 64 }).notNull(),
	displayName: varchar({ length: 255 }).notNull(),
	description: text(),
	monthlyPrice: decimal({ precision: 10, scale: 2 }).notNull(),
	requestsPerMinute: int().notNull(),
	requestsPerDay: int().notNull(),
	requestsPerMonth: int().notNull(),
	maxConcurrentSessions: int().notNull(),
	maxTokensPerRequest: int().notNull(),
	features: json().notNull(),
	isActive: int().default(1),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("subscription_tiers_name_unique").on(table.name),
]);

export const suppressionRules = mysqlTable("suppression_rules", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	ruleName: varchar({ length: 255 }).notNull(),
	ruleDescription: text(),
	anomalyType: varchar({ length: 64 }).notNull(),
	condition: text().notNull(),
	suppressionDuration: int(),
	startTime: timestamp({ mode: 'string' }),
	endTime: timestamp({ mode: 'string' }),
	isActive: int().default(1),
	suppressionCount: int().default(0),
	lastSuppressionAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const sweetMiraclesAlerts = mysqlTable("sweet_miracles_alerts", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	alertType: varchar({ length: 50 }).notNull(),
	severity: mysqlEnum(['low','medium','high','critical']).default('medium'),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	broadcastChannels: json(),
	status: mysqlEnum(['draft','scheduled','active','resolved','archived']).default('draft'),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
});

export const systemAlerts = mysqlTable("system_alerts", {
	id: int().autoincrement().notNull(),
	severity: mysqlEnum(['critical','warning','info']).default('info'),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	status: mysqlEnum(['active','acknowledged','resolved']).default('active'),
	acknowledgedBy: int(),
	acknowledgedAt: timestamp({ mode: 'string' }),
	resolvedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const systemMetrics = mysqlTable("system_metrics", {
	id: int().autoincrement().notNull(),
	timestamp: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	activeUsers: int().default(0),
	totalSessions: int().default(0),
	totalRequests: int().default(0),
	totalTokens: int().default(0),
	averageResponseTime: decimal({ precision: 10, scale: 2 }).default('0'),
	errorRate: decimal({ precision: 5, scale: 2 }).default('0'),
	cpuUsage: decimal({ precision: 5, scale: 2 }).default('0'),
	memoryUsage: decimal({ precision: 5, scale: 2 }).default('0'),
	storageUsage: decimal({ precision: 10, scale: 2 }).default('0'),
});

export const taskHistory = mysqlTable("task_history", {
	id: int().autoincrement().notNull(),
	sessionId: int().notNull().references(() => agentSessions.id, { onDelete: "cascade" } ),
	taskDescription: text().notNull(),
	status: mysqlEnum(['pending','in_progress','completed','failed']).default('pending'),
	outcome: text(),
	duration: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	completedAt: timestamp({ mode: 'string' }),
});

export const teamMembers = mysqlTable("team_members", {
	id: int().autoincrement().notNull(),
	teamId: int().notNull().references(() => teams.id, { onDelete: "cascade" } ),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	role: mysqlEnum(['viewer','editor','admin']).default('viewer'),
	joinedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const teams = mysqlTable("teams", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	ownerId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const toolExecutions = mysqlTable("tool_executions", {
	id: int().autoincrement().notNull(),
	sessionId: int().notNull().references(() => agentSessions.id, { onDelete: "cascade" } ),
	toolName: varchar({ length: 255 }).notNull(),
	parameters: text(),
	result: text(),
	error: text(),
	status: mysqlEnum(['pending','running','completed','failed']).default('pending'),
	duration: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const toolUsageStats = mysqlTable("tool_usage_stats", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	toolName: varchar({ length: 255 }).notNull(),
	executionCount: int().default(0),
	successCount: int().default(0),
	failureCount: int().default(0),
	totalDuration: int().default(0),
	averageDuration: int(),
	lastUsed: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const trainingData = mysqlTable("training_data", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	sessionId: int().references(() => agentSessions.id, { onDelete: "cascade" } ),
	input: text().notNull(),
	output: text().notNull(),
	quality: mysqlEnum(['excellent','good','fair','poor']).default('good'),
	tags: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const usageQuotas = mysqlTable("usage_quotas", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	billingCycleStart: timestamp({ mode: 'string' }).notNull(),
	billingCycleEnd: timestamp({ mode: 'string' }).notNull(),
	requestsUsed: int().default(0),
	requestsLimit: int().notNull(),
	tokensUsed: int().default(0),
	tokensLimit: int().notNull(),
	sessionsCreated: int().default(0),
	sessionsLimit: int().notNull(),
	costAccrued: decimal({ precision: 10, scale: 4 }).default('0'),
	costLimit: decimal({ precision: 10, scale: 2 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const userSubscriptions = mysqlTable("user_subscriptions", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	tierId: int().notNull().references(() => subscriptionTiers.id),
	status: mysqlEnum(['active','inactive','suspended','cancelled']).default('active'),
	billingCycleStart: timestamp({ mode: 'string' }).notNull(),
	billingCycleEnd: timestamp({ mode: 'string' }).notNull(),
	autoRenew: int().default(1),
	stripeCustomerId: varchar({ length: 255 }),
	stripeSubscriptionId: varchar({ length: 255 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const users = mysqlTable("users", {
	id: int().autoincrement().notNull(),
	openId: varchar({ length: 64 }).notNull(),
	name: text(),
	email: varchar({ length: 320 }),
	loginMethod: varchar({ length: 64 }),
	role: mysqlEnum(['user','admin']).default('user').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	lastSignedIn: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("users_openId_unique").on(table.openId),
]);

export const webhookEndpoints = mysqlTable("webhook_endpoints", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	url: varchar({ length: 2048 }).notNull(),
	events: text().notNull(),
	secret: varchar({ length: 255 }).notNull(),
	isActive: int().default(1),
	retryCount: int().default(3),
	lastTriggered: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const webhookInstallations = mysqlTable("webhook_installations", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	templateId: int().notNull().references(() => webhookTemplates.id),
	name: varchar({ length: 255 }).notNull(),
	config: json().notNull(),
	isActive: int().default(1),
	lastTriggered: timestamp({ mode: 'string' }),
	successCount: int().default(0),
	failureCount: int().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const webhookLogs = mysqlTable("webhook_logs", {
	id: int().autoincrement().notNull(),
	webhookId: int().notNull().references(() => webhookEndpoints.id, { onDelete: "cascade" } ),
	eventType: varchar({ length: 64 }).notNull(),
	payload: text().notNull(),
	statusCode: int(),
	response: text(),
	error: text(),
	retryCount: int().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const webhookMarketplaceReviews = mysqlTable("webhook_marketplace_reviews", {
	id: int().autoincrement().notNull(),
	templateId: int().notNull().references(() => webhookTemplates.id, { onDelete: "cascade" } ),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	rating: int().notNull(),
	review: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const webhookTemplates = mysqlTable("webhook_templates", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	category: varchar({ length: 64 }).notNull(),
	icon: varchar({ length: 255 }),
	webhookUrl: varchar({ length: 2048 }).notNull(),
	events: text().notNull(),
	configSchema: json(),
	documentation: text(),
	isPublic: int().default(1),
	downloads: int().default(0),
	rating: decimal({ precision: 3, scale: 2 }).default('0'),
	reviews: int().default(0),
	createdBy: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const wellnessCheckins = mysqlTable("wellness_checkins", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	checkInType: mysqlEnum(['daily','weekly','emergency']).default('daily'),
	status: mysqlEnum(['ok','needs_help','emergency','no_response']).default('ok'),
	responseTime: int(),
	notes: text(),
	escalationLevel: int().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
});


// ============================================================================
// HybridCast Off-Grid Mesh Network Tables
// ============================================================================

export const hybridCastNodes = mysqlTable("hybrid_cast_nodes", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  nodeId: varchar("nodeId", { length: 64 }).notNull().unique(),
  nodeType: mysqlEnum("nodeType", ["gateway", "relay", "endpoint", "hybrid"]).default("hybrid"),
  status: mysqlEnum("status", ["online", "offline", "degraded", "unreachable"]).default("offline"),
  location: varchar("location", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  signalStrength: int("signalStrength"), // -100 to 0 dBm
  bandwidth: int("bandwidth"), // Mbps
  latency: int("latency"), // milliseconds
  isActive: int().default(true),
  lastHeartbeat: timestamp("lastHeartbeat"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HybridCastNode = typeof hybridCastNodes.$inferSelect;
export type InsertHybridCastNode = typeof hybridCastNodes.$inferInsert;

export const hybridCastConnections = mysqlTable("hybrid_cast_connections", {
  id: varchar("id", { length: 64 }).primaryKey(),
  sourceNodeId: varchar("sourceNodeId", { length: 64 }).notNull().references(() => hybridCastNodes.id, { onDelete: "cascade" }),
  targetNodeId: varchar("targetNodeId", { length: 64 }).notNull().references(() => hybridCastNodes.id, { onDelete: "cascade" }),
  connectionType: mysqlEnum("connectionType", ["direct", "relay", "mesh"]).default("direct"),
  signalQuality: int("signalQuality"), // 0-100%
  bandwidth: int("bandwidth"), // Mbps
  latency: int("latency"), // milliseconds
  packetLoss: int("packetLoss"), // percentage
  isActive: int().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HybridCastConnection = typeof hybridCastConnections.$inferSelect;
export type InsertHybridCastConnection = typeof hybridCastConnections.$inferInsert;

export const hybridCastBroadcasts = mysqlTable("hybrid_cast_broadcasts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  contentUrl: varchar("contentUrl", { length: 512 }),
  contentType: varchar("contentType", { length: 32 }), // audio, video, data
  broadcastMode: mysqlEnum("broadcastMode", ["online", "offline", "hybrid"]).default("hybrid"),
  targetNodes: text("targetNodes"), // JSON array of node IDs
  status: mysqlEnum("status", ["scheduled", "broadcasting", "completed", "failed"]).default("scheduled"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  reachableNodes: int("reachableNodes").default(0),
  totalNodes: int("totalNodes").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HybridCastBroadcast = typeof hybridCastBroadcasts.$inferSelect;
export type InsertHybridCastBroadcast = typeof hybridCastBroadcasts.$inferInsert;


// ============================================================================
// Alert Rules and Monitoring Tables
// ============================================================================

export const alertRules = mysqlTable("alert_rules", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  metricName: varchar("metricName", { length: 255 }).notNull(),
  operator: mysqlEnum("operator", ["gt", "lt", "eq", "gte", "lte", "ne"]).default("gt"),
  threshold: decimal("threshold", { precision: 10, scale: 2 }),
  duration: int("duration"), // seconds
  enabled: int().default(true),
  notificationChannels: text("notificationChannels"), // JSON array
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AlertRule = typeof alertRules.$inferSelect;
export type InsertAlertRule = typeof alertRules.$inferInsert;

export const alerts = mysqlTable("alerts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  alertRuleId: varchar("alertRuleId", { length: 64 }).notNull().references(() => alertRules.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("warning"),
  message: text("message").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", ["active", "acknowledged", "resolved"]).default("active"),
  acknowledgedAt: timestamp("acknowledgedAt"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;


// ============================================================================
// Solbones Frequency Dice Game Tables
// ============================================================================

export const solbonesFrequencyRolls = mysqlTable("solbones_frequency_rolls", {
	id: int().autoincrement().notNull().primaryKey(),
	userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	dice1: int("dice_1").default(1).notNull(),
	dice2: int("dice_2").default(1).notNull(),
	dice3: int("dice_3").default(1).notNull(),
	frequency: int().notNull(), // Hz value
	score: int().default(0).notNull(),
	notes: text(), // User notes about the experience
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export type SolbonesFrequencyRoll = typeof solbonesFrequencyRolls.$inferSelect;
export type InsertSolbonesFrequencyRoll = typeof solbonesFrequencyRolls.$inferInsert;

export const solbonesLeaderboard = mysqlTable("solbones_leaderboard", {
	id: int().autoincrement().notNull().primaryKey(),
	userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	username: varchar({ length: 255 }),
	score: int().default(0).notNull(),
	gamesPlayed: int("games_played").default(1).notNull(),
	highestScore: int("highest_score").default(0).notNull(),
	totalTallies: int("total_tallies").default(0).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export type SolbonesLeaderboard = typeof solbonesLeaderboard.$inferSelect;
export type InsertSolbonesLeaderboard = typeof solbonesLeaderboard.$inferInsert;

// ============================================================================
// Client Portal Tables
// ============================================================================

export const clientProfiles = mysqlTable("client_profiles", {
	id: int().autoincrement().notNull().primaryKey(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
	fullName: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	phone: varchar({ length: 20 }),
	subscriptionTier: mysqlEnum(['free', 'silver', 'gold', 'platinum']).default('free').notNull(),
	totalDonated: decimal({ precision: 12, scale: 2 }).default('0').notNull(),
	contentUploads: int().default(0).notNull(),
	memberSince: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	lastActivityDate: timestamp({ mode: 'string' }),
	profilePicture: varchar({ length: 512 }), // S3 URL
	bio: text(),
	preferences: json(), // User preferences and settings
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export type ClientProfile = typeof clientProfiles.$inferSelect;
export type InsertClientProfile = typeof clientProfiles.$inferInsert;

export const clientDonationHistory = mysqlTable("client_donation_history", {
	id: int().autoincrement().notNull().primaryKey(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	amount: decimal({ precision: 12, scale: 2 }).notNull(),
	currency: varchar({ length: 3 }).default('USD').notNull(),
	purpose: varchar({ length: 255 }), // e.g., "Sweet Miracles", "HybridCast", etc.
	status: mysqlEnum(['pending', 'completed', 'failed', 'refunded']).default('pending').notNull(),
	transactionId: varchar({ length: 255 }).unique(),
	paymentMethod: varchar({ length: 50 }), // stripe, paypal, etc.
	notes: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export type ClientDonationHistory = typeof clientDonationHistory.$inferSelect;
export type InsertClientDonationHistory = typeof clientDonationHistory.$inferInsert;

export const clientContentUploads = mysqlTable("client_content_uploads", {
	id: int().autoincrement().notNull().primaryKey(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	contentType: mysqlEnum(['audio', 'video', 'document', 'image']).notNull(),
	contentUrl: varchar({ length: 512 }).notNull(), // S3 URL
	fileSize: int(), // bytes
	duration: int(), // seconds (for audio/video)
	status: mysqlEnum(['draft', 'published', 'archived']).default('draft').notNull(),
	viewCount: int().default(0).notNull(),
	downloadCount: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export type ClientContentUpload = typeof clientContentUploads.$inferSelect;
export type InsertClientContentUpload = typeof clientContentUploads.$inferInsert;

// ============================================================================
// Review & Rating Tables
// ============================================================================

export const reviews = mysqlTable("reviews", {
	id: int().autoincrement().notNull().primaryKey(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	rating: int().notNull(), // 1-5 stars
	category: mysqlEnum(['content_quality', 'user_experience', 'platform_features', 'customer_support', 'general']).default('general').notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	isVerified: int().default(0).notNull(), // 0 or 1
	status: mysqlEnum(['pending', 'approved', 'rejected']).default('pending').notNull(),
	helpfulCount: int().default(0).notNull(),
	notHelpfulCount: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

export const reviewHelpfulness = mysqlTable("review_helpfulness", {
	id: int().autoincrement().notNull().primaryKey(),
	reviewId: int().notNull().references(() => reviews.id, { onDelete: "cascade" }),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	isHelpful: int().notNull(), // 1 for helpful, 0 for not helpful
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
	// Ensure one vote per user per review
	sql`UNIQUE KEY unique_review_user_vote (review_id, user_id)`
]);

export type ReviewHelpfulness = typeof reviewHelpfulness.$inferSelect;
export type InsertReviewHelpfulness = typeof reviewHelpfulness.$inferInsert;

export const reviewResponses = mysqlTable("review_responses", {
	id: int().autoincrement().notNull().primaryKey(),
	reviewId: int().notNull().references(() => reviews.id, { onDelete: "cascade" }),
	responderId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	response: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export type ReviewResponse = typeof reviewResponses.$inferSelect;
export type InsertReviewResponse = typeof reviewResponses.$inferInsert;

// ============================================================================
// QUMUS Autonomous Decision Management Tables
// ============================================================================
export const decisions = mysqlTable("qumus_decisions", {
	id: varchar({ length: 255 }).notNull().primaryKey(),
	type: mysqlEnum(['broadcast', 'content', 'donation', 'meditation', 'emergency']).notNull(),
	description: text().notNull(),
	subsystem: varchar({ length: 255 }).notNull(), // HybridCast, Rockin Rockin Boogie, Sweet Miracles, Canryn
	policy: varchar({ length: 255 }).notNull(), // Policy that triggered this decision
	autonomyLevel: int().notNull(), // 0-100 percentage
	impact: mysqlEnum(['low', 'medium', 'high']).notNull(),
	status: mysqlEnum(['pending', 'approved', 'vetoed']).default('pending').notNull(),
	approvedBy: varchar({ length: 255 }), // User ID who approved
	approvedAt: timestamp({ mode: 'string' }),
	vetoedBy: varchar({ length: 255 }), // User ID who vetoed
	vetoedAt: timestamp({ mode: 'string' }),
	metadata: json(), // Additional decision context
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});
export type Decision = typeof decisions.$inferSelect;
export type InsertDecision = typeof decisions.$inferInsert;

export const decisionLogs = mysqlTable("qumus_decision_logs", {
	id: int().autoincrement().notNull().primaryKey(),
	decisionId: varchar({ length: 255 }).notNull().references(() => decisions.id, { onDelete: "cascade" }),
	action: mysqlEnum(['created', 'approved', 'vetoed', 'executed', 'failed']).notNull(),
	userId: varchar({ length: 255 }).notNull(), // User ID or 'system'
	reason: text(),
	timestamp: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});
export type DecisionLog = typeof decisionLogs.$inferSelect;
export type InsertDecisionLog = typeof decisionLogs.$inferInsert;

export const decisionPolicies = mysqlTable("qumus_decision_policies", {
	id: varchar({ length: 255 }).notNull().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	subsystem: varchar({ length: 255 }).notNull(),
	rules: json().notNull(), // Policy rules in JSON format
	autonomyThreshold: int().notNull(), // Min autonomy level to auto-approve
	requiresApproval: int().default(1).notNull(), // 0 or 1
	isActive: int().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});
export type DecisionPolicy = typeof decisionPolicies.$inferSelect;
export type InsertDecisionPolicy = typeof decisionPolicies.$inferInsert;


// Agent Network Tables - Inter-agent communication and discovery
export const agents = mysqlTable("agents", {
	id: int().autoincrement().notNull().primaryKey(),
	agentId: varchar({ length: 255 }).notNull().unique(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	endpoint: varchar({ length: 512 }).notNull(),
	capabilities: json().notNull(),
	autonomyLevel: int().default(50),
	publicKey: text().notNull(),
	trustScore: int().default(50),
	uptime: int().default(100),
	messageCount: int().default(0),
	lastSeen: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
	owner: varchar({ length: 255 }),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const agentConnections = mysqlTable("agent_connections", {
	id: int().autoincrement().notNull().primaryKey(),
	connectionId: varchar({ length: 512 }).notNull().unique(),
	sourceAgentId: varchar({ length: 255 }).notNull(),
	targetAgentId: varchar({ length: 255 }).notNull(),
	status: mysqlEnum(['connected', 'disconnected', 'pending', 'failed']).default('pending'),
	trustLevel: int().default(50),
	messageCount: int().default(0),
	encryptionEnabled: int().default(1),
	lastCommunication: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

// ===== RRB (Rockin Rockin Boogie) Tables =====
export const broadcastSchedules = mysqlTable('broadcast_schedules', {
  id: int('id').autoincrement().primaryKey(),
  broadcastId: varchar('broadcast_id', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  scheduledStartTime: timestamp('scheduled_start_time').notNull(),
  scheduledEndTime: timestamp('scheduled_end_time').notNull(),
  actualStartTime: timestamp('actual_start_time'),
  actualEndTime: timestamp('actual_end_time'),
  status: mysqlEnum('status', ['scheduled', 'live', 'completed', 'cancelled', 'paused']).default('scheduled').notNull(),
  broadcastType: mysqlEnum('broadcast_type', ['live', 'prerecorded', 'streaming', 'podcast', 'radio', 'video']).notNull(),
  channels: json('channels').notNull(), // ['youtube', 'twitch', 'facebook', 'instagram', 'website']
  createdBy: int('created_by').references(() => users.id, { onDelete: 'set null' }),
  autonomousScheduling: boolean('autonomous_scheduling').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const musicTracks = mysqlTable('music_tracks', {
  id: int('id').autoincrement().primaryKey(),
  trackId: varchar('track_id', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  artist: varchar('artist', { length: 255 }).notNull(),
  album: varchar('album', { length: 255 }),
  duration: int('duration').notNull(), // seconds
  genre: varchar('genre', { length: 100 }),
  releaseDate: date('release_date'),
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  coverArtUrl: varchar('cover_art_url', { length: 500 }),
  isrc: varchar('isrc', { length: 50 }), // International Standard Recording Code
  rights: varchar('rights', { length: 255 }), // Rights holder info
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const musicPlaylists = mysqlTable('music_playlists', {
  id: int('id').autoincrement().primaryKey(),
  playlistId: varchar('playlist_id', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdBy: int('created_by').references(() => users.id, { onDelete: 'set null' }),
  isPublic: boolean('is_public').default(false).notNull(),
  trackCount: int('track_count').default(0).notNull(),
  totalDuration: int('total_duration').default(0).notNull(), // seconds
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const playlistTracks = mysqlTable("playlist_tracks", {
  id: int("id").autoincrement().primaryKey(),
  playlistId: int("playlist_id").notNull().references(() => playlists.id, { onDelete: "cascade" }),
  trackId: int("track_id").notNull(),
  position: int("position").default(0).notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const commercialBreaks = mysqlTable('commercial_breaks', {
  id: int('id').autoincrement().primaryKey(),
  breakId: varchar('break_id', { length: 255 }).notNull().unique(),
  broadcastId: varchar('broadcast_id', { length: 255 }).notNull(),
  scheduledTime: timestamp('scheduled_time').notNull(),
  duration: int('duration').notNull(), // seconds
  commercialCount: int('commercial_count').default(0).notNull(),
  totalValue: decimal('total_value', { precision: 10, scale: 2 }).default('0').notNull(),
  status: mysqlEnum('status', ['scheduled', 'running', 'completed', 'skipped']).default('scheduled').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const commercials = mysqlTable('commercials', {
  id: int('id').autoincrement().primaryKey(),
  commercialId: varchar('commercial_id', { length: 255 }).notNull().unique(),
  advertiser: varchar('advertiser', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  duration: int('duration').notNull(), // seconds
  videoUrl: varchar('video_url', { length: 500 }).notNull(),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  rate: decimal('rate', { precision: 10, scale: 2 }).notNull(), // Cost per broadcast
  category: varchar('category', { length: 100 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const broadcastAuditLog = mysqlTable('broadcast_audit_log', {
  id: int('id').autoincrement().primaryKey(),
  auditId: varchar('audit_id', { length: 255 }).notNull().unique(),
  broadcastId: varchar('broadcast_id', { length: 255 }).notNull(),
  action: varchar('action', { length: 100 }).notNull(), // 'started', 'paused', 'resumed', 'ended', 'commercial_inserted', 'content_changed'
  performedBy: int('performed_by').references(() => users.id, { onDelete: 'set null' }),
  details: json('details'), // Additional context
  complianceStatus: mysqlEnum('compliance_status', ['compliant', 'warning', 'violation']).default('compliant').notNull(),
  complianceNotes: text('compliance_notes'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const streamingStatus = mysqlTable('streaming_status', {
  id: int('id').autoincrement().primaryKey(),
  broadcastId: varchar('broadcast_id', { length: 255 }).notNull(),
  platform: mysqlEnum('platform', ['youtube', 'twitch', 'facebook', 'instagram', 'website', 'radio', 'podcast']).notNull(),
  status: mysqlEnum('status', ['offline', 'live', 'error', 'paused']).default('offline').notNull(),
  streamUrl: varchar('stream_url', { length: 500 }),
  bitrate: int('bitrate'), // kbps
  resolution: varchar('resolution', { length: 50 }), // 1080p, 720p, etc.
  frameRate: int('frame_rate'), // fps
  latency: int('latency'), // milliseconds
  errorMessage: text('error_message'),
  lastUpdated: timestamp('last_updated').defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const viewerMetrics = mysqlTable('viewer_metrics', {
  id: int('id').autoincrement().primaryKey(),
  broadcastId: varchar('broadcast_id', { length: 255 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  viewerCount: int('viewer_count').default(0).notNull(),
  peakViewers: int('peak_viewers').default(0).notNull(),
  averageViewDuration: int('average_view_duration').default(0).notNull(), // seconds
  engagementRate: decimal('engagement_rate', { precision: 5, scale: 2 }).default('0').notNull(), // 0-100%
  likeCount: int('like_count').default(0).notNull(),
  commentCount: int('comment_count').default(0).notNull(),
  shareCount: int('share_count').default(0).notNull(),
  bounceRate: decimal('bounce_rate', { precision: 5, scale: 2 }).default('0').notNull(), // 0-100%
  geolocation: json('geolocation'), // {country, region, city, coordinates}
  deviceTypes: json('device_types'), // {mobile, desktop, tablet, tv}
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const generatedContent = mysqlTable('generated_content', {
  id: int('id').autoincrement().primaryKey(),
  contentId: varchar('content_id', { length: 255 }).notNull().unique(),
  broadcastId: varchar('broadcast_id', { length: 255 }).notNull(),
  contentType: mysqlEnum('content_type', ['script', 'description', 'thumbnail', 'title', 'hashtags', 'summary']).notNull(),
  generatedBy: varchar('generated_by', { length: 100 }).notNull(), // 'gpt-4', 'claude', 'llama', etc.
  prompt: text('prompt').notNull(),
  content: text('content').notNull(),
  confidence: decimal('confidence', { precision: 5, scale: 2 }).notNull(), // 0-100
  approved: boolean('approved').default(false).notNull(),
  approvedBy: int('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const broadcastChatCommands = mysqlTable('broadcast_chat_commands', {
  id: int('id').autoincrement().primaryKey(),
  commandId: varchar('command_id', { length: 255 }).notNull().unique(),
  userId: int('user_id').references(() => users.id, { onDelete: 'set null' }),
  broadcastId: varchar('broadcast_id', { length: 255 }).notNull(),
  command: text('command').notNull(), // Natural language command
  commandType: varchar('command_type', { length: 100 }).notNull(), // 'schedule', 'play', 'pause', 'skip', 'insert_commercial'
  parameters: json('parameters'), // Parsed command parameters
  executedBy: varchar('executed_by', { length: 100 }).notNull(), // 'ai_assistant', 'human_operator'
  status: mysqlEnum('status', ['pending', 'executing', 'completed', 'failed']).default('pending').notNull(),
  result: json('result'), // Command execution result
  errorMessage: text('error_message'),
  executionTime: int('execution_time'), // milliseconds
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export const aiRecommendations = mysqlTable('ai_recommendations', {
  id: int('id').autoincrement().primaryKey(),
  recommendationId: varchar('recommendation_id', { length: 255 }).notNull().unique(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  contentId: varchar('content_id', { length: 255 }).notNull(),
  contentType: varchar('content_type', { length: 100 }).notNull(),
  recommendationType: mysqlEnum('recommendation_type', ['personalized', 'trending', 'similar', 'new_release', 'based_on_history']).notNull(),
  relevanceScore: decimal('relevance_score', { precision: 5, scale: 2 }).notNull(), // 0-100
  confidenceScore: decimal('confidence_score', { precision: 5, scale: 2 }).notNull(), // 0-100
  reason: text('reason'), // Why this was recommended
  clicked: boolean('clicked').default(false).notNull(),
  engaged: boolean('engaged').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const audioPlaybackHistory = mysqlTable('audio_playback_history', {
  id: int('id').autoincrement().primaryKey(),
  historyId: varchar('history_id', { length: 255 }).notNull().unique(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  contentId: varchar('content_id', { length: 255 }).notNull().references(() => audioContent.contentId),
  playCount: int('play_count').default(1).notNull(),
  totalListeningTime: int('total_listening_time').default(0).notNull(), // in seconds
  lastPlayedAt: timestamp('last_played_at'),
  isFavorited: boolean('is_favorited').default(false).notNull(),
  rating: decimal('rating', { precision: 3, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const audioContent = mysqlTable('audio_content', {
  id: int('id').autoincrement().primaryKey(),
  contentId: varchar('content_id', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  contentType: mysqlEnum('content_type', ['meditation', 'podcast', 'radio', 'music', 'audiobook', 'other']).notNull(),
  category: varchar('category', { length: 100 }),
  duration: int('duration').notNull(), // in seconds
  audioUrl: varchar('audio_url', { length: 512 }).notNull(),
  coverArtUrl: varchar('cover_art_url', { length: 512 }),
  artist: varchar('artist', { length: 255 }),
  album: varchar('album', { length: 255 }),
  plays: int('plays').default(0).notNull(),
  favorites: int('favorites').default(0).notNull(),
  rating: decimal('rating', { precision: 3, scale: 2 }).default(0),
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const entertainmentUserPreferences = mysqlTable('entertainment_user_preferences', {
  id: int('id').autoincrement().primaryKey(),
  preferencesId: varchar('preferences_id', { length: 255 }).notNull().unique(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  preferredContentTypes: json('preferred_content_types'), // Array of content types
  preferredGenres: json('preferred_genres'), // Array of genres
  recommendationFrequency: mysqlEnum('recommendation_frequency', ['daily', 'weekly', 'monthly', 'never']).default('weekly').notNull(),
  notificationsEnabled: boolean('notifications_enabled').default(true).notNull(),
  autoPlayEnabled: boolean('auto_play_enabled').default(true).notNull(),
  qualityPreference: mysqlEnum('quality_preference', ['low', 'medium', 'high', 'auto']).default('auto').notNull(),
  languagePreference: varchar('language_preference', { length: 10 }).default('en').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const entertainmentPlaylists = mysqlTable('entertainment_playlists', {
  id: int('id').autoincrement().primaryKey(),
  playlistId: varchar('playlist_id', { length: 255 }).notNull().unique(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(false).notNull(),
  coverArtUrl: varchar('cover_art_url', { length: 512 }),
  itemCount: int('item_count').default(0).notNull(),
  plays: int('plays').default(0).notNull(),
  followers: int('followers').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const entertainmentPlaylistItems = mysqlTable('entertainment_playlist_items', {
  id: int('id').autoincrement().primaryKey(),
  itemId: varchar('item_id', { length: 255 }).notNull().unique(),
  playlistId: varchar('playlist_id', { length: 255 }).notNull().references(() => entertainmentPlaylists.playlistId, { onDelete: 'cascade' }),
  contentId: varchar('content_id', { length: 255 }).notNull(),
  contentType: varchar('content_type', { length: 100 }).notNull(),
  position: int('position').notNull(),
  addedAt: timestamp('added_at').defaultNow().notNull(),
});

export const mediaProjects = mysqlTable('media_projects', {
  id: int('id').autoincrement().primaryKey(),
  projectId: varchar('project_id', { length: 255 }).notNull().unique(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  projectType: mysqlEnum('project_type', ['video', 'podcast', 'live_stream', 'shorts', 'music', 'other']).notNull(),
  status: mysqlEnum('status', ['draft', 'recording', 'editing', 'published', 'archived']).default('draft').notNull(),
  duration: int('duration'), // in seconds
  thumbnailUrl: varchar('thumbnail_url', { length: 512 }),
  videoUrl: varchar('video_url', { length: 512 }),
  audioUrl: varchar('audio_url', { length: 512 }),
  views: int('views').default(0).notNull(),
  likes: int('likes').default(0).notNull(),
  shares: int('shares').default(0).notNull(),
  comments: int('comments').default(0).notNull(),
  engagementRate: decimal('engagement_rate', { precision: 5, scale: 2 }).default(0),
  revenue: decimal('revenue', { precision: 10, scale: 2 }).default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  publishedAt: timestamp('published_at'),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const mediaDistribution = mysqlTable('media_distribution', {
  id: int('id').autoincrement().primaryKey(),
  distributionId: varchar('distribution_id', { length: 255 }).notNull().unique(),
  projectId: varchar('project_id', { length: 255 }).notNull().references(() => mediaProjects.projectId),
  platform: mysqlEnum('platform', ['youtube', 'spotify', 'tiktok', 'instagram', 'facebook', 'twitter', 'linkedin', 'podcast_host', 'direct']).notNull(),
  platformUrl: varchar('platform_url', { length: 512 }),
  status: mysqlEnum('status', ['pending', 'published', 'failed', 'scheduled']).default('pending').notNull(),
  platformViews: int('platform_views').default(0),
  platformEngagement: int('platform_engagement').default(0),
  platformRevenue: decimal('platform_revenue', { precision: 10, scale: 2 }).default(0),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const monetizationEvents = mysqlTable('monetization_events', {
  id: int('id').autoincrement().primaryKey(),
  eventId: varchar('event_id', { length: 255 }).notNull().unique(),
  userId: int('user_id').references(() => users.id, { onDelete: 'set null' }),
  contentId: varchar('content_id', { length: 255 }),
  projectId: varchar('project_id', { length: 255 }),
  eventType: mysqlEnum('event_type', ['ad_impression', 'ad_click', 'subscription', 'donation', 'merchandise', 'sponsorship', 'affiliate']).notNull(),
  platform: varchar('platform', { length: 100 }),
  revenue: decimal('revenue', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  metadata: json('metadata'), // Additional event details
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const entertainmentMetrics = mysqlTable('entertainment_metrics', {
  id: int('id').autoincrement().primaryKey(),
  metricsId: varchar('metrics_id', { length: 255 }).notNull().unique(),
  userId: int('user_id').references(() => users.id, { onDelete: 'cascade' }),
  period: mysqlEnum('period', ['daily', 'weekly', 'monthly', 'yearly']).notNull(),
  totalViews: int('total_views').default(0).notNull(),
  totalEngagement: int('total_engagement').default(0).notNull(),
  totalRevenue: decimal('total_revenue', { precision: 15, scale: 2 }).default(0).notNull(),
  averageDuration: decimal('average_duration', { precision: 10, scale: 2 }).default(0).notNull(),
  growthRate: decimal('growth_rate', { precision: 5, scale: 2 }).default(0).notNull(),
  activeProjects: int('active_projects').default(0).notNull(),
  topContent: json('top_content'), // Array of top performing content
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const qumusCorePolicies = mysqlTable('qumus_core_policies', {
  id: int('id').autoincrement().primaryKey(),
  policyId: varchar('policy_id', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  policyType: mysqlEnum('policy_type', [
    'recommendation_engine',
    'payment_processing',
    'content_moderation',
    'user_registration',
    'subscription_management',
    'performance_alert',
    'analytics_aggregation',
    'compliance_reporting'
  ]).notNull(),
  autonomyLevel: int('autonomy_level').notNull(), // 75-98%
  confidenceThreshold: int('confidence_threshold').default(80).notNull(), // 0-100
  enabled: boolean('enabled').default(true).notNull(),
  priority: int('priority').default(0).notNull(),
  conditions: json('conditions'), // Policy conditions
  actions: json('actions'), // Policy actions
  escalationRules: json('escalation_rules'), // When to escalate
  metadata: json('metadata'), // Custom config
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const qumusAutonomousActions = mysqlTable('qumus_autonomous_actions', {
  id: int('id').autoincrement().primaryKey(),
  decisionId: varchar('decision_id', { length: 255 }).notNull().unique(),
  policyId: varchar('policy_id', { length: 100 }).notNull(),
  userId: int('user_id').references(() => users.id, { onDelete: 'set null' }),
  actionType: varchar('action_type', { length: 100 }).notNull(),
  input: json('input').notNull(),
  output: json('output'),
  confidence: decimal('confidence', { precision: 5, scale: 2 }).notNull(), // 0-100
  autonomousFlag: boolean('autonomous_flag').default(true).notNull(), // true = autonomous, false = escalated
  status: mysqlEnum('status', ['pending', 'processing', 'completed', 'failed', 'escalated']).default('pending').notNull(),
  result: mysqlEnum('result', ['success', 'failure', 'escalated', 'timeout']),
  errorMessage: text('error_message'),
  executionTime: int('execution_time'), // milliseconds
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export const qumusHumanReview = mysqlTable('qumus_human_review', {
  id: int('id').autoincrement().primaryKey(),
  decisionId: varchar('decision_id', { length: 255 }).notNull().unique(),
  policyId: varchar('policy_id', { length: 100 }).notNull(),
  userId: int('user_id').references(() => users.id, { onDelete: 'set null' }),
  escalationReason: varchar('escalation_reason', { length: 100 }).notNull(),
  priority: mysqlEnum('priority', ['low', 'medium', 'high', 'critical']).default('medium').notNull(),
  originalInput: json('original_input'),
  originalOutput: json('original_output'),
  confidence: decimal('confidence', { precision: 5, scale: 2 }),
  decision: varchar('decision', { length: 50 }),
  reviewNotes: text('review_notes'),
  reviewedBy: varchar('reviewed_by', { length: 255 }),
  reviewedAt: timestamp('reviewed_at'),
  status: mysqlEnum('status', ['pending', 'in_review', 'completed', 'expired']).default('pending').notNull(),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const qumusDecisionLogs = mysqlTable('qumus_decision_logs', {
  id: int('id').autoincrement().primaryKey(),
  decisionId: varchar('decision_id', { length: 255 }).notNull().unique(),
  policyId: varchar('policy_id', { length: 100 }).notNull(),
  policyType: varchar('policy_type', { length: 100 }).notNull(),
  userId: int('user_id').references(() => users.id, { onDelete: 'set null' }),
  decisionType: varchar('decision_type', { length: 100 }).notNull(),
  input: json('input').notNull(),
  output: json('output'),
  confidence: decimal('confidence', { precision: 5, scale: 2 }).notNull(),
  autonomousFlag: boolean('autonomous_flag').notNull(),
  result: varchar('result', { length: 50 }).notNull(), // 'approved', 'rejected', 'escalated'
  executionTime: int('execution_time'), // milliseconds
  metadata: json('metadata'), // Additional context
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const qumusMetrics = mysqlTable('qumus_metrics', {
  id: int('id').autoincrement().primaryKey(),
  policyId: varchar('policy_id', { length: 100 }).notNull(),
  policyType: varchar('policy_type', { length: 100 }).notNull(),
  totalDecisions: int('total_decisions').default(0).notNull(),
  autonomousCount: int('autonomous_count').default(0).notNull(),
  escalatedCount: int('escalated_count').default(0).notNull(),
  approvedCount: int('approved_count').default(0).notNull(),
  rejectedCount: int('rejected_count').default(0).notNull(),
  autonomyPercentage: decimal('autonomy_percentage', { precision: 5, scale: 2 }).default('0').notNull(), // 0-100%
  averageConfidence: decimal('average_confidence', { precision: 5, scale: 2 }).default('0').notNull(),
  successRate: decimal('success_rate', { precision: 5, scale: 2 }).default('0').notNull(), // 0-100%
  failureRate: decimal('failure_rate', { precision: 5, scale: 2 }).default('0').notNull(),
  avgExecutionTime: int('avg_execution_time').default(0).notNull(), // milliseconds
  escalationRate: decimal('escalation_rate', { precision: 5, scale: 2 }).default('0').notNull(), // 0-100%
  period: varchar('period', { length: 50 }).notNull(), // 'hourly', 'daily', 'weekly', 'monthly'
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const qumusPolicyRecommendations = mysqlTable('qumus_policy_recommendations', {
  id: int('id').autoincrement().primaryKey(),
  policyId: varchar('policy_id', { length: 100 }).notNull(),
  policyType: varchar('policy_type', { length: 100 }).notNull(),
  recommendationType: varchar('recommendation_type', { length: 100 }).notNull(), // 'threshold_adjustment', 'escalation_rule', 'policy_optimization'
  currentValue: varchar('current_value', { length: 255 }),
  recommendedValue: varchar('recommended_value', { length: 255 }).notNull(),
  reason: text('reason').notNull(),
  confidence: decimal('confidence', { precision: 5, scale: 2 }).notNull(),
  impact: varchar('impact', { length: 50 }).notNull(), // 'high', 'medium', 'low'
  implemented: boolean('implemented').default(false).notNull(),
  implementedAt: timestamp('implemented_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const playlists = mysqlTable("playlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false).notNull(),
  coverImageUrl: varchar("cover_image_url", { length: 500 }),
  episodeCount: int("episode_count").default(0).notNull(),
  followers: int("followers").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ═══════════════════════════════════════════════════════════
// CANRYN PRODUCTION — BUSINESS OPERATIONS TABLES
// ═══════════════════════════════════════════════════════════

// ── BOOKKEEPING ──
export const bookkeepingAccounts = mysqlTable('bookkeeping_accounts', {
  id: int().autoincrement().notNull(),
  accountCode: varchar('account_code', { length: 20 }).notNull(),
  accountName: varchar('account_name', { length: 255 }).notNull(),
  accountType: mysqlEnum('account_type', ['asset', 'liability', 'equity', 'revenue', 'expense']).notNull(),
  parentAccountId: int('parent_account_id'),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  balance: decimal('balance', { precision: 15, scale: 2 }).default('0.00').notNull(),
  subsidiary: varchar('subsidiary', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const bookkeepingJournalEntries = mysqlTable('bookkeeping_journal_entries', {
  id: int().autoincrement().notNull(),
  entryNumber: varchar('entry_number', { length: 50 }).notNull(),
  entryDate: timestamp('entry_date').notNull(),
  description: text('description').notNull(),
  reference: varchar('reference', { length: 255 }),
  status: mysqlEnum('status', ['draft', 'posted', 'voided']).default('draft').notNull(),
  createdBy: int('created_by'),
  approvedBy: int('approved_by'),
  totalDebit: decimal('total_debit', { precision: 15, scale: 2 }).default('0.00').notNull(),
  totalCredit: decimal('total_credit', { precision: 15, scale: 2 }).default('0.00').notNull(),
  subsidiary: varchar('subsidiary', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const bookkeepingLedgerLines = mysqlTable('bookkeeping_ledger_lines', {
  id: int().autoincrement().notNull(),
  journalEntryId: int('journal_entry_id').notNull(),
  accountId: int('account_id').notNull(),
  debit: decimal('debit', { precision: 15, scale: 2 }).default('0.00').notNull(),
  credit: decimal('credit', { precision: 15, scale: 2 }).default('0.00').notNull(),
  memo: text('memo'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── HUMAN RESOURCES ──
export const hrEmployees = mysqlTable('hr_employees', {
  id: int().autoincrement().notNull(),
  employeeNumber: varchar('employee_number', { length: 20 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 320 }),
  phone: varchar('phone', { length: 20 }),
  title: varchar('title', { length: 255 }),
  departmentId: int('department_id'),
  subsidiary: varchar('subsidiary', { length: 255 }),
  hireDate: timestamp('hire_date').notNull(),
  terminationDate: timestamp('termination_date'),
  status: mysqlEnum('status', ['active', 'on_leave', 'terminated', 'retired']).default('active').notNull(),
  employmentType: mysqlEnum('employment_type', ['full_time', 'part_time', 'contractor', 'intern']).default('full_time').notNull(),
  salary: decimal('salary', { precision: 12, scale: 2 }),
  payFrequency: mysqlEnum('pay_frequency', ['weekly', 'biweekly', 'monthly', 'annual']).default('biweekly').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const hrDepartments = mysqlTable('hr_departments', {
  id: int().autoincrement().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 20 }).notNull(),
  subsidiary: varchar('subsidiary', { length: 255 }),
  managerId: int('manager_id'),
  description: text('description'),
  budget: decimal('budget', { precision: 15, scale: 2 }),
  headcount: int('headcount').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const hrTimeTracking = mysqlTable('hr_time_tracking', {
  id: int().autoincrement().notNull(),
  employeeId: int('employee_id').notNull(),
  date: timestamp('date').notNull(),
  hoursWorked: decimal('hours_worked', { precision: 5, scale: 2 }).notNull(),
  overtime: decimal('overtime', { precision: 5, scale: 2 }).default('0.00').notNull(),
  projectCode: varchar('project_code', { length: 50 }),
  notes: text('notes'),
  status: mysqlEnum('status', ['pending', 'approved', 'rejected']).default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const hrPayroll = mysqlTable('hr_payroll', {
  id: int().autoincrement().notNull(),
  employeeId: int('employee_id').notNull(),
  payPeriodStart: timestamp('pay_period_start').notNull(),
  payPeriodEnd: timestamp('pay_period_end').notNull(),
  grossPay: decimal('gross_pay', { precision: 12, scale: 2 }).notNull(),
  deductions: decimal('deductions', { precision: 12, scale: 2 }).default('0.00').notNull(),
  netPay: decimal('net_pay', { precision: 12, scale: 2 }).notNull(),
  taxWithheld: decimal('tax_withheld', { precision: 12, scale: 2 }).default('0.00').notNull(),
  status: mysqlEnum('status', ['pending', 'processed', 'paid', 'voided']).default('pending').notNull(),
  paidDate: timestamp('paid_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── ACCOUNTING ──
export const accountingInvoices = mysqlTable('accounting_invoices', {
  id: int().autoincrement().notNull(),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull(),
  type: mysqlEnum('type', ['receivable', 'payable']).notNull(),
  clientName: varchar('client_name', { length: 255 }).notNull(),
  clientEmail: varchar('client_email', { length: 320 }),
  issueDate: timestamp('issue_date').notNull(),
  dueDate: timestamp('due_date').notNull(),
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }).notNull(),
  tax: decimal('tax', { precision: 15, scale: 2 }).default('0.00').notNull(),
  total: decimal('total', { precision: 15, scale: 2 }).notNull(),
  amountPaid: decimal('amount_paid', { precision: 15, scale: 2 }).default('0.00').notNull(),
  status: mysqlEnum('status', ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled', 'void']).default('draft').notNull(),
  subsidiary: varchar('subsidiary', { length: 255 }),
  notes: text('notes'),
  lineItems: json('line_items'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const accountingPayments = mysqlTable('accounting_payments', {
  id: int().autoincrement().notNull(),
  invoiceId: int('invoice_id'),
  paymentDate: timestamp('payment_date').notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  method: mysqlEnum('method', ['cash', 'check', 'wire', 'ach', 'credit_card', 'stripe', 'paypal', 'other']).default('stripe').notNull(),
  reference: varchar('reference', { length: 255 }),
  notes: text('notes'),
  status: mysqlEnum('status', ['pending', 'completed', 'failed', 'refunded']).default('completed').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const accountingReconciliation = mysqlTable('accounting_reconciliation', {
  id: int().autoincrement().notNull(),
  accountId: int('account_id').notNull(),
  reconciliationDate: timestamp('reconciliation_date').notNull(),
  statementBalance: decimal('statement_balance', { precision: 15, scale: 2 }).notNull(),
  bookBalance: decimal('book_balance', { precision: 15, scale: 2 }).notNull(),
  difference: decimal('difference', { precision: 15, scale: 2 }).notNull(),
  status: mysqlEnum('status', ['in_progress', 'completed', 'discrepancy']).default('in_progress').notNull(),
  notes: text('notes'),
  reconciledBy: int('reconciled_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ── CONTRACTS & LEGAL ──
export const legalContracts = mysqlTable('legal_contracts', {
  id: int().autoincrement().notNull(),
  contractNumber: varchar('contract_number', { length: 50 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  contractType: mysqlEnum('contract_type', ['artist_agreement', 'licensing', 'nda', 'employment', 'vendor', 'distribution', 'publishing', 'sponsorship', 'partnership', 'other']).notNull(),
  counterparty: varchar('counterparty', { length: 255 }).notNull(),
  status: mysqlEnum('status', ['draft', 'review', 'approved', 'active', 'expired', 'terminated', 'disputed']).default('draft').notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  value: decimal('value', { precision: 15, scale: 2 }),
  subsidiary: varchar('subsidiary', { length: 255 }),
  description: text('description'),
  terms: text('terms'),
  assignedTo: int('assigned_to'),
  approvedBy: int('approved_by'),
  documentUrl: varchar('document_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const legalIntellectualProperty = mysqlTable('legal_intellectual_property', {
  id: int().autoincrement().notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  ipType: mysqlEnum('ip_type', ['copyright', 'trademark', 'patent', 'trade_secret', 'licensing_right', 'masters', 'publishing_right']).notNull(),
  registrationNumber: varchar('registration_number', { length: 100 }),
  owner: varchar('owner', { length: 255 }).notNull(),
  status: mysqlEnum('status', ['pending', 'registered', 'active', 'expired', 'disputed', 'transferred']).default('pending').notNull(),
  filingDate: timestamp('filing_date'),
  expirationDate: timestamp('expiration_date'),
  description: text('description'),
  subsidiary: varchar('subsidiary', { length: 255 }),
  value: decimal('value', { precision: 15, scale: 2 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const legalComplianceItems = mysqlTable('legal_compliance_items', {
  id: int().autoincrement().notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  category: mysqlEnum('category', ['fcc', 'copyright', 'gdpr', 'ccpa', 'ada', 'tax', 'employment_law', 'broadcast_license', 'other']).notNull(),
  status: mysqlEnum('status', ['compliant', 'non_compliant', 'pending_review', 'in_progress', 'waived']).default('pending_review').notNull(),
  dueDate: timestamp('due_date'),
  assignedTo: int('assigned_to'),
  description: text('description'),
  resolution: text('resolution'),
  subsidiary: varchar('subsidiary', { length: 255 }),
  priority: mysqlEnum('priority', ['low', 'medium', 'high', 'critical']).default('medium').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});


// Stripe integration tables
export const donations = mysqlTable("donations", {
  id: int().autoincrement().notNull().primaryKey(),
  userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: varchar({ length: 20 }).notNull(),
  stripePaymentIntentId: varchar({ length: 255 }),
  stripeInvoiceId: varchar({ length: 255 }),
  stripeCustomerId: varchar({ length: 255 }),
  status: mysqlEnum(['pending', 'completed', 'refunded', 'failed']).default('pending').notNull(),
  purpose: varchar({ length: 100 }).default('general-fund'),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const usersWithStripe = mysqlTable("users_with_stripe", {
  id: int().autoincrement().notNull().primaryKey(),
  userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
  stripeCustomerId: varchar({ length: 255 }).notNull(),
  stripeSubscriptionId: varchar({ length: 255 }),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

// ===== Royalty Tracker Tables =====

export const royaltyProjects = mysqlTable("royalty_projects", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	projectType: mysqlEnum(['single','album','ep','compilation','soundtrack','podcast','commercial','other']).default('single').notNull(),
	releaseDate: timestamp({ mode: 'string' }),
	isrcCode: varchar({ length: 20 }),
	upcCode: varchar({ length: 20 }),
	totalRevenue: decimal({ precision: 12, scale: 2 }).default('0.00').notNull(),
	currency: varchar({ length: 3 }).default('USD').notNull(),
	status: mysqlEnum(['draft','active','completed','archived']).default('draft').notNull(),
	createdBy: int().notNull().references(() => users.id),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const royaltyCollaborators = mysqlTable("royalty_collaborators", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull().references(() => royaltyProjects.id, { onDelete: "cascade" }),
	userId: int().references(() => users.id),
	artistName: varchar({ length: 255 }).notNull(),
	role: mysqlEnum(['artist','producer','songwriter','engineer','featured','session_musician','other']).default('artist').notNull(),
	splitPercentage: decimal({ precision: 5, scale: 2 }).default('0.00').notNull(),
	email: varchar({ length: 320 }),
	isRegistered: boolean().default(false).notNull(),
	inviteStatus: mysqlEnum(['pending','accepted','declined']).default('pending').notNull(),
	stripeConnectAccountId: varchar({ length: 255 }),
	stripeOnboardingComplete: boolean().default(false).notNull(),
	payoutMethod: mysqlEnum(['stripe_connect','manual','check','wire','paypal']).default('manual').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const royaltyPayments = mysqlTable("royalty_payments", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull().references(() => royaltyProjects.id, { onDelete: "cascade" }),
	source: varchar({ length: 255 }).notNull(),
	sourceType: mysqlEnum(['streaming','download','sync_license','performance','mechanical','merch','other']).default('streaming').notNull(),
	grossAmount: decimal({ precision: 12, scale: 2 }).notNull(),
	netAmount: decimal({ precision: 12, scale: 2 }).notNull(),
	currency: varchar({ length: 3 }).default('USD').notNull(),
	periodStart: timestamp({ mode: 'string' }),
	periodEnd: timestamp({ mode: 'string' }),
	statementRef: varchar({ length: 255 }),
	notes: text(),
	recordedBy: int().notNull().references(() => users.id),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const royaltyDistributions = mysqlTable("royalty_distributions", {
	id: int().autoincrement().notNull(),
	paymentId: int().notNull().references(() => royaltyPayments.id, { onDelete: "cascade" }),
	collaboratorId: int().notNull().references(() => royaltyCollaborators.id, { onDelete: "cascade" }),
	amount: decimal({ precision: 12, scale: 2 }).notNull(),
	splitPercentage: decimal({ precision: 5, scale: 2 }).notNull(),
	status: mysqlEnum(['calculated','pending_payment','paid','disputed']).default('calculated').notNull(),
	paidAt: timestamp({ mode: 'string' }),
	transactionRef: varchar({ length: 255 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const royaltyStatements = mysqlTable("royalty_statements", {
	id: int().autoincrement().notNull(),
	collaboratorId: int().notNull().references(() => royaltyCollaborators.id, { onDelete: "cascade" }),
	projectId: int().notNull().references(() => royaltyProjects.id, { onDelete: "cascade" }),
	periodStart: timestamp({ mode: 'string' }).notNull(),
	periodEnd: timestamp({ mode: 'string' }).notNull(),
	totalEarnings: decimal({ precision: 12, scale: 2 }).default('0.00').notNull(),
	totalPaid: decimal({ precision: 12, scale: 2 }).default('0.00').notNull(),
	balance: decimal({ precision: 12, scale: 2 }).default('0.00').notNull(),
	status: mysqlEnum(['draft','issued','acknowledged']).default('draft').notNull(),
	generatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});


// ===== RRB Division & Campaign Management =====
export const campaigns = mysqlTable("campaigns", {
	id: int().autoincrement().notNull().primaryKey(),
	divisionId: varchar({ length: 64 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	type: mysqlEnum(['episode', 'frequency', 'broadcast', 'promotion']).notNull(),
	status: mysqlEnum(['draft', 'scheduled', 'active', 'completed', 'archived']).default('draft'),
	startDate: timestamp({ mode: 'string' }),
	endDate: timestamp({ mode: 'string' }),
	targetChannels: json(), // Array of channel IDs
	metrics: json(), // views, clicks, conversions
	createdBy: int().notNull().references(() => users.id),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});


export const listenerData = mysqlTable("listener_data", {
	id: int().autoincrement().notNull().primaryKey(),
	userId: int().references(() => users.id),
	sessionId: varchar({ length: 255 }).notNull(),
	favoriteChannels: json(), // Array of channel IDs
	favoriteFrequencies: json(), // Array of frequency values
	playHistory: json(), // Array of episode IDs with timestamps
	totalListeningTime: int().default(0), // in seconds
	lastListenedAt: timestamp({ mode: 'string' }),
	deviceInfo: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const broadcastSessions = mysqlTable("broadcast_sessions", {
	id: int().autoincrement().notNull().primaryKey(),
	divisionId: varchar({ length: 64 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	status: mysqlEnum(['scheduled', 'live', 'ended', 'cancelled']).default('scheduled'),
	startTime: timestamp({ mode: 'string' }).notNull(),
	endTime: timestamp({ mode: 'string' }),
	youtubeUrl: varchar({ length: 255 }),
	twitchUrl: varchar({ length: 255 }),
	viewerCount: int().default(0),
	duration: int(), // in seconds
	recordingUrl: varchar({ length: 255 }),
	createdBy: int().notNull().references(() => users.id),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const divisionMetrics = mysqlTable("division_metrics", {
	id: int().autoincrement().notNull().primaryKey(),
	divisionId: varchar({ length: 64 }).notNull(),
	date: varchar({ length: 10 }).notNull(), // YYYY-MM-DD
	totalListeners: int().default(0),
	totalPlaytime: int().default(0), // in seconds
	episodesPlayed: int().default(0),
	frequencySelections: json(), // frequency -> count mapping
	donationsReceived: decimal({ precision: 10, scale: 2 }).default('0'),
	campaignImpressions: int().default(0),
	campaignClicks: int().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const adminLogs = mysqlTable("admin_logs", {
	id: int().autoincrement().notNull().primaryKey(),
	adminId: int().notNull().references(() => users.id),
	action: varchar({ length: 255 }).notNull(),
	resourceType: varchar({ length: 64 }).notNull(),
	resourceId: varchar({ length: 255 }),
	details: json(),
	ipAddress: varchar({ length: 45 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});
