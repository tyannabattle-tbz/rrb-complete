import { mysqlTable, mysqlSchema, AnyMySqlColumn, foreignKey, int, varchar, json, text, timestamp, mysqlEnum, decimal, date, index } from "drizzle-orm/mysql-core"
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
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	frequencyName: varchar({ length: 50 }).notNull(), // UT, RE, MI, FA, SOL, LA, TI, DO
	frequency: int().notNull(), // Hz value
	timestamp: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	sessionId: varchar({ length: 255 }), // Optional session identifier
	notes: text(), // User notes about the experience
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export type SolbonesFrequencyRoll = typeof solbonesFrequencyRolls.$inferSelect;
export type InsertSolbonesFrequencyRoll = typeof solbonesFrequencyRolls.$inferInsert;

export const solbonesLeaderboard = mysqlTable("solbones_leaderboard", {
	id: int().autoincrement().notNull().primaryKey(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
	totalRolls: int().default(0).notNull(),
	favoriteFrequency: varchar({ length: 50 }),
	streak: int().default(0).notNull(),
	lastRollDate: timestamp({ mode: 'string' }),
	achievements: json(), // JSON array of achievement badges
	score: int().default(0).notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
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
