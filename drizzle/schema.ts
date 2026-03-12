import { mysqlTable, mysqlSchema, AnyMySqlColumn, int, varchar, mysqlEnum, timestamp, decimal, text, json, foreignKey, bigint, index, tinyint, date } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const accountingInvoices = mysqlTable("accounting_invoices", {
	id: int().autoincrement().notNull(),
	invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
	type: mysqlEnum(['receivable','payable']).notNull(),
	clientName: varchar("client_name", { length: 255 }).notNull(),
	clientEmail: varchar("client_email", { length: 320 }),
	issueDate: timestamp("issue_date", { mode: 'string' }).notNull(),
	dueDate: timestamp("due_date", { mode: 'string' }).notNull(),
	subtotal: decimal({ precision: 15, scale: 2 }).notNull(),
	tax: decimal({ precision: 15, scale: 2 }).default('0.00').notNull(),
	total: decimal({ precision: 15, scale: 2 }).notNull(),
	amountPaid: decimal("amount_paid", { precision: 15, scale: 2 }).default('0.00').notNull(),
	status: mysqlEnum(['draft','sent','paid','partial','overdue','cancelled','void']).default('draft').notNull(),
	subsidiary: varchar({ length: 255 }),
	notes: text(),
	lineItems: json("line_items"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const accountingPayments = mysqlTable("accounting_payments", {
	id: int().autoincrement().notNull(),
	invoiceId: int("invoice_id"),
	paymentDate: timestamp("payment_date", { mode: 'string' }).notNull(),
	amount: decimal({ precision: 15, scale: 2 }).notNull(),
	method: mysqlEnum(['cash','check','wire','ach','credit_card','stripe','paypal','other']).default('stripe').notNull(),
	reference: varchar({ length: 255 }),
	notes: text(),
	status: mysqlEnum(['pending','completed','failed','refunded']).default('completed').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const accountingReconciliation = mysqlTable("accounting_reconciliation", {
	id: int().autoincrement().notNull(),
	accountId: int("account_id").notNull(),
	reconciliationDate: timestamp("reconciliation_date", { mode: 'string' }).notNull(),
	statementBalance: decimal("statement_balance", { precision: 15, scale: 2 }).notNull(),
	bookBalance: decimal("book_balance", { precision: 15, scale: 2 }).notNull(),
	difference: decimal({ precision: 15, scale: 2 }).notNull(),
	status: mysqlEnum(['in_progress','completed','discrepancy']).default('in_progress').notNull(),
	notes: text(),
	reconciledBy: int("reconciled_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

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

export const adInventory = mysqlTable("ad_inventory", {
	id: int().autoincrement().notNull(),
	sponsorName: varchar("sponsor_name", { length: 255 }).notNull(),
	campaignName: varchar("campaign_name", { length: 255 }).notNull(),
	audioUrl: text("audio_url"),
	durationSeconds: int("duration_seconds").default(30).notNull(),
	category: mysqlEnum(['commercial','psa','promo','sponsor','community']).default('commercial').notNull(),
	targetChannels: text("target_channels"),
	rotationWeight: int("rotation_weight").default(1).notNull(),
	maxPlaysPerHour: int("max_plays_per_hour").default(2),
	timeSlotStart: varchar("time_slot_start", { length: 5 }),
	timeSlotEnd: varchar("time_slot_end", { length: 5 }),
	active: tinyint().default(1).notNull(),
	totalPlays: int("total_plays").default(0).notNull(),
	budgetCents: int("budget_cents"),
	costPerPlayCents: int("cost_per_play_cents"),
	startDate: bigint("start_date", { mode: "number" }),
	endDate: bigint("end_date", { mode: "number" }),
	createdAt: bigint("created_at", { mode: "number" }).notNull(),
	updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
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
	isActive: tinyint().default(1),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const agents = mysqlTable("agents", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	type: varchar({ length: 100 }),
	status: mysqlEnum(['active','inactive','maintenance']).default('active'),
	capabilities: json(),
	configuration: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
});

export const aiRecommendations = mysqlTable("ai_recommendations", {
	id: int().autoincrement().notNull(),
	userId: int("user_id").notNull(),
	type: mysqlEnum(['content','playlist','channel','track']).default('content'),
	itemId: int("item_id"),
	itemType: varchar("item_type", { length: 100 }),
	score: decimal({ precision: 5, scale: 4 }).default('0'),
	reason: text(),
	isActive: tinyint("is_active").default(1).notNull(),
	approved: tinyint().default(0).notNull(),
	clicked: tinyint().default(0).notNull(),
	engaged: tinyint().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
});

export const alertBroadcastLog = mysqlTable("alert_broadcast_log", {
	id: int().autoincrement().notNull(),
	alertId: int().notNull().references(() => emergencyAlerts.id, { onDelete: "cascade" } ),
	channelId: int().notNull().references(() => radioChannels.id, { onDelete: "set null" } ),
	status: mysqlEnum(['pending','broadcasting','delivered','failed']).default('pending'),
	listenersReached: int().default(0),
	interruptedRegularContent: tinyint().default(0),
	error: text(),
	broadcastStartedAt: timestamp({ mode: 'string' }),
	broadcastEndedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const alertDeliveryLog = mysqlTable("alert_delivery_log", {
	id: int().autoincrement().notNull(),
	alertId: int().notNull().references(() => emergencyAlerts.id, { onDelete: "cascade" } ),
	nodeId: int().references(() => hybridcastNodes.id, { onDelete: "set null" } ),
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
	isActive: tinyint().default(1),
	notifyOnTrigger: tinyint().default(1),
	autoResolve: tinyint().default(0),
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

export const audioContent = mysqlTable("audio_content", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 255 }).notNull(),
	artist: varchar({ length: 255 }),
	album: varchar({ length: 255 }),
	genre: varchar({ length: 100 }),
	duration: int().default(0),
	fileUrl: text("file_url"),
	coverUrl: text("cover_url"),
	type: mysqlEnum(['music','podcast','audiobook','ambient','frequency']).default('music'),
	isPublic: tinyint("is_public").default(1).notNull(),
	playCount: int("play_count").default(0),
	isFavorited: tinyint("is_favorited").default(0).notNull(),
	metadata: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
});

export const audioPlayCounts = mysqlTable("audio_play_counts", {
	id: int().autoincrement().notNull(),
	trackId: varchar("track_id", { length: 255 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	artist: varchar({ length: 255 }).notNull(),
	playCount: int("play_count").default(0).notNull(),
	lastPlayedAt: timestamp("last_played_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
},
(table) => [
	index("idx_play_count").on(table.playCount),
	index("track_id").on(table.trackId),
]);

export const audioPlaybackHistory = mysqlTable("audio_playback_history", {
	id: int().autoincrement().notNull(),
	userId: int("user_id").notNull(),
	contentId: int("content_id").notNull(),
	playedAt: timestamp("played_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	durationPlayed: int("duration_played").default(0),
	completed: tinyint().default(0).notNull(),
	source: varchar({ length: 100 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
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
	autoSaveEnabled: tinyint().default(1),
	autoSaveInterval: int().default(60000),
	maxVersions: int().default(50),
	retentionDays: int().default(30),
	lastAutoSave: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const autonomousDecisions = mysqlTable("autonomousDecisions", {
	id: int().autoincrement().notNull(),
	decisionId: varchar({ length: 255 }).notNull(),
	policy: varchar({ length: 255 }).notNull(),
	system: mysqlEnum(['qumus','rrb','hybridcast']).notNull(),
	action: varchar({ length: 255 }).notNull(),
	reasoning: text(),
	autonomyLevel: int().default(90),
	humanOverride: int().default(0),
	overrideReason: text(),
	result: mysqlEnum(['success','failed','pending']).default('pending'),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("decisionId").on(table.decisionId),
]);

export const autonomousTasks = mysqlTable("autonomous_tasks", {
	id: varchar({ length: 255 }).notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	goal: text().notNull(),
	priority: int().default(5).notNull(),
	status: mysqlEnum(['queued','executing','completed','failed','cancelled']).default('queued').notNull(),
	steps: json(),
	constraints: json(),
	result: json(),
	error: text(),
	executionTime: int(),
	retryCount: int().default(0),
	maxRetries: int().default(3),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	startedAt: timestamp({ mode: 'string' }),
	completedAt: timestamp({ mode: 'string' }),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_userId").on(table.userId),
	index("idx_status").on(table.status),
	index("idx_createdAt").on(table.createdAt),
]);

export const bookkeepingAccounts = mysqlTable("bookkeeping_accounts", {
	id: int().autoincrement().notNull(),
	accountCode: varchar("account_code", { length: 20 }).notNull(),
	accountName: varchar("account_name", { length: 255 }).notNull(),
	accountType: mysqlEnum("account_type", ['asset','liability','equity','revenue','expense']).notNull(),
	parentAccountId: int("parent_account_id"),
	description: text(),
	isActive: tinyint("is_active").default(1).notNull(),
	balance: decimal({ precision: 15, scale: 2 }).default('0.00').notNull(),
	subsidiary: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const bookkeepingJournalEntries = mysqlTable("bookkeeping_journal_entries", {
	id: int().autoincrement().notNull(),
	entryNumber: varchar("entry_number", { length: 50 }).notNull(),
	entryDate: timestamp("entry_date", { mode: 'string' }).notNull(),
	description: text().notNull(),
	reference: varchar({ length: 255 }),
	status: mysqlEnum(['draft','posted','voided']).default('draft').notNull(),
	createdBy: int("created_by"),
	approvedBy: int("approved_by"),
	totalDebit: decimal("total_debit", { precision: 15, scale: 2 }).default('0.00').notNull(),
	totalCredit: decimal("total_credit", { precision: 15, scale: 2 }).default('0.00').notNull(),
	subsidiary: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const bookkeepingLedgerLines = mysqlTable("bookkeeping_ledger_lines", {
	id: int().autoincrement().notNull(),
	journalEntryId: int("journal_entry_id").notNull(),
	accountId: int("account_id").notNull(),
	debit: decimal({ precision: 15, scale: 2 }).default('0.00').notNull(),
	credit: decimal({ precision: 15, scale: 2 }).default('0.00').notNull(),
	memo: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const broadcastAuditLog = mysqlTable("broadcast_audit_log", {
	id: int().autoincrement().notNull(),
	userId: int("user_id"),
	action: varchar({ length: 255 }).notNull(),
	resourceType: varchar("resource_type", { length: 100 }).notNull(),
	resourceId: int("resource_id"),
	details: json(),
	ipAddress: varchar("ip_address", { length: 45 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const broadcastChatCommands = mysqlTable("broadcast_chat_commands", {
	id: int().autoincrement().notNull(),
	userId: int("user_id"),
	command: varchar({ length: 255 }).notNull(),
	description: text(),
	responseTemplate: text("response_template"),
	isActive: tinyint("is_active").default(1).notNull(),
	usageCount: int("usage_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
});

export const broadcastSchedules = mysqlTable("broadcast_schedules", {
	id: int().autoincrement().notNull(),
	userId: int("user_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	startTime: timestamp("start_time", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	endTime: timestamp("end_time", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	status: mysqlEnum(['scheduled','live','completed','cancelled']).default('scheduled'),
	type: mysqlEnum(['music','talk','news','emergency','special']).default('music'),
	playlistId: int("playlist_id"),
	autonomousScheduling: tinyint("autonomous_scheduling").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
	createdBy: int("created_by"),
});

export const broadcasts = mysqlTable("broadcasts", {
	id: int().autoincrement().notNull(),
	system: mysqlEnum(['qumus','rrb','hybridcast']).notNull(),
	createdBy: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	content: text(),
	status: mysqlEnum(['scheduled','live','completed','cancelled']).default('scheduled'),
	startTime: timestamp({ mode: 'string' }).notNull(),
	endTime: timestamp({ mode: 'string' }),
	duration: int(),
	channels: json(),
	isEmergency: int().default(0),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
});

export const commercialBreaks = mysqlTable("commercial_breaks", {
	id: int().autoincrement().notNull(),
	scheduleId: int("schedule_id").notNull(),
	position: int().default(0),
	duration: int().default(30),
	type: mysqlEnum(['pre_roll','mid_roll','post_roll']).default('mid_roll'),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const commercialImpressions = mysqlTable("commercial_impressions", {
	id: int().autoincrement().notNull(),
	commercialId: varchar("commercial_id", { length: 100 }).notNull(),
	commercialTitle: varchar("commercial_title", { length: 255 }).notNull(),
	channelName: varchar("channel_name", { length: 255 }),
	djVoice: varchar("dj_voice", { length: 50 }),
	category: varchar({ length: 50 }),
	impressionType: mysqlEnum("impression_type", ['view','listen','click','complete']).default('view'),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
},
(table) => [
	index("idx_commercial_id").on(table.commercialId),
	index("idx_created_at").on(table.createdAt),
	index("idx_channel").on(table.channelName),
]);

export const commercials = mysqlTable("commercials", {
	id: int().autoincrement().notNull(),
	breakId: int("break_id").notNull(),
	advertiser: varchar({ length: 255 }),
	title: varchar({ length: 255 }).notNull(),
	fileUrl: text("file_url"),
	duration: int().default(30),
	isActive: tinyint("is_active").default(1).notNull(),
	impressions: int().default(0),
	clicks: int().default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const conferenceAttendees = mysqlTable("conference_attendees", {
	id: int().autoincrement().notNull(),
	conferenceId: int("conference_id").notNull().references(() => conferences.id, { onDelete: "cascade" } ),
	userId: int("user_id").references(() => users.id, { onDelete: "set null" } ),
	name: varchar({ length: 255 }),
	email: varchar({ length: 320 }),
	rsvpStatus: mysqlEnum("rsvp_status", ['invited','accepted','declined','tentative','attended']).default('invited').notNull(),
	role: mysqlEnum(['host','co-host','presenter','attendee','observer']).default('attendee').notNull(),
	joinedAt: timestamp("joined_at", { mode: 'string' }),
	leftAt: timestamp("left_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	qrCode: varchar("qr_code", { length: 255 }),
	checkedIn: tinyint("checked_in").default(0),
	checkedInAt: timestamp("checked_in_at", { mode: 'string' }),
	ticketType: varchar("ticket_type", { length: 32 }).default('general'),
	organization: varchar({ length: 255 }),
	accessibilityNeeds: text("accessibility_needs"),
});

export const conferenceSpeakers = mysqlTable("conference_speakers", {
	id: int().autoincrement().notNull(),
	conferenceId: int("conference_id").notNull().references(() => conferences.id, { onDelete: "cascade" } ),
	userId: int("user_id"),
	name: varchar({ length: 255 }).notNull(),
	bio: text(),
	photoUrl: varchar("photo_url", { length: 512 }),
	title: varchar({ length: 255 }),
	organization: varchar({ length: 255 }),
	socialTwitter: varchar("social_twitter", { length: 255 }),
	socialLinkedin: varchar("social_linkedin", { length: 255 }),
	socialWebsite: varchar("social_website", { length: 512 }),
	sessionTopic: varchar("session_topic", { length: 512 }),
	speakerOrder: int("speaker_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const conferences = mysqlTable("conferences", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 500 }).notNull(),
	description: text(),
	type: mysqlEnum(['meeting','conference','webinar','broadcast','workshop','huddle']).default('meeting').notNull(),
	platform: mysqlEnum(['jitsi','zoom','meet','discord','skype','rrb-live','phone']).default('jitsi').notNull(),
	hostUserId: int("host_user_id").references(() => users.id, { onDelete: "cascade" } ),
	hostName: varchar("host_name", { length: 255 }),
	roomCode: varchar("room_code", { length: 100 }).notNull(),
	externalUrl: varchar("external_url", { length: 2048 }),
	scheduledAt: timestamp("scheduled_at", { mode: 'string' }),
	durationMinutes: int("duration_minutes").default(60),
	maxAttendees: int("max_attendees").default(100),
	status: mysqlEnum(['scheduled','live','completed','cancelled']).default('scheduled').notNull(),
	isRecurring: tinyint("is_recurring").default(0),
	recurrencePattern: varchar("recurrence_pattern", { length: 100 }),
	password: varchar({ length: 100 }),
	recordingEnabled: tinyint("recording_enabled").default(1),
	captionsEnabled: tinyint("captions_enabled").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
	recordingUrl: text("recording_url"),
	recordingKey: text("recording_key"),
	recordingStatus: varchar("recording_status", { length: 20 }).default('none'),
	actualAttendees: int("actual_attendees").default(0),
	translationEnabled: tinyint("translation_enabled").default(0),
	translationLanguages: text("translation_languages"),
	transcript: text(),
	transcriptStatus: varchar("transcript_status", { length: 32 }),
	restreamActive: tinyint("restream_active").default(0),
	restreamKey: varchar("restream_key", { length: 255 }),
	restreamStartedAt: timestamp("restream_started_at", { mode: 'string' }),
	restreamEndedAt: timestamp("restream_ended_at", { mode: 'string' }),
	restreamPlatforms: text("restream_platforms"),
});

export const meetingPresentations = mysqlTable("meeting_presentations", {
	id: int().autoincrement().notNull(),
	conferenceId: int("conference_id").references(() => conferences.id, { onDelete: "cascade" }),
	roomCode: varchar("room_code", { length: 100 }),
	title: varchar({ length: 500 }).notNull(),
	filename: varchar({ length: 500 }).notNull(),
	fileUrl: text("file_url").notNull(),
	fileKey: text("file_key").notNull(),
	fileSize: int("file_size"),
	mimeType: varchar("mime_type", { length: 100 }),
	uploadedBy: int("uploaded_by").references(() => users.id, { onDelete: "set null" }),
	uploadedByName: varchar("uploaded_by_name", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const contentListenerHistory = mysqlTable("content_listener_history", {
	id: int().autoincrement().notNull(),
	contentId: int().notNull().references(() => rockinBoogieContent.id, { onDelete: "cascade" } ),
	timestamp: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	listenerCount: int().notNull(),
	engagementScore: decimal({ precision: 5, scale: 2 }).default('0'),
});

export const contentSchedule = mysqlTable("content_schedule", {
	id: int().autoincrement().notNull(),
	channelId: int("channel_id").notNull(),
	channelName: varchar("channel_name", { length: 255 }).notNull(),
	showName: varchar("show_name", { length: 255 }).notNull(),
	showType: mysqlEnum("show_type", ['music','talk','podcast','commercial','healing','live_event','news','gospel','emergency']).default('music').notNull(),
	dayOfWeek: mysqlEnum("day_of_week", ['monday','tuesday','wednesday','thursday','friday','saturday','sunday','daily']).default('daily').notNull(),
	startTime: varchar("start_time", { length: 10 }).notNull(),
	endTime: varchar("end_time", { length: 10 }).notNull(),
	description: text(),
	host: varchar({ length: 255 }),
	isRecurring: tinyint("is_recurring").default(1).notNull(),
	isActive: tinyint("is_active").default(1).notNull(),
	priority: int().default(5).notNull(),
	qumusManaged: tinyint("qumus_managed").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
});

export const conventionAttendees = mysqlTable("convention_attendees", {
	id: int().autoincrement().notNull(),
	conventionId: int("convention_id").notNull().references(() => conventions.id, { onDelete: "cascade" } ),
	userId: int("user_id"),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	role: mysqlEnum(['attendee','speaker','panelist','moderator','vip','sponsor','organizer']).default('attendee').notNull(),
	ticketType: mysqlEnum("ticket_type", ['free','general','vip','speaker','sponsor']).default('free').notNull(),
	registrationStatus: mysqlEnum("registration_status", ['pending','confirmed','checked_in','cancelled','refunded']).default('pending').notNull(),
	stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
	checkedInAt: bigint("checked_in_at", { mode: "number" }),
	platform: varchar({ length: 100 }),
	avatarUrl: text("avatar_url"),
	bio: text(),
	createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const conventionSessions = mysqlTable("convention_sessions", {
	id: int().autoincrement().notNull(),
	conventionId: int("convention_id").notNull().references(() => conventions.id, { onDelete: "cascade" } ),
	studioSessionId: int("studio_session_id"),
	title: varchar({ length: 500 }).notNull(),
	description: text(),
	sessionType: mysqlEnum("session_type", ['keynote','panel','workshop','breakout','networking','performance','qa','fireside_chat']).default('panel').notNull(),
	track: varchar({ length: 100 }),
	room: varchar({ length: 100 }),
	startTime: bigint("start_time", { mode: "number" }).notNull(),
	endTime: bigint("end_time", { mode: "number" }).notNull(),
	maxParticipants: int("max_participants").default(50),
	currentParticipants: int("current_participants").default(0),
	speakers: json(),
	isRecorded: tinyint("is_recorded").default(1),
	recordingUrl: text("recording_url"),
	status: mysqlEnum(['scheduled','live','ended','cancelled']).default('scheduled').notNull(),
	createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const conventions = mysqlTable("conventions", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 500 }).notNull(),
	subtitle: varchar({ length: 500 }),
	description: text(),
	hostUserId: int("host_user_id"),
	status: mysqlEnum(['draft','announced','registration_open','active','day_of','ended','archived']).default('draft').notNull(),
	startDate: bigint("start_date", { mode: "number" }).notNull(),
	endDate: bigint("end_date", { mode: "number" }).notNull(),
	timezone: varchar({ length: 50 }).default('America/New_York'),
	maxAttendees: int("max_attendees").default(500),
	currentAttendees: int("current_attendees").default(0),
	isVirtual: tinyint("is_virtual").default(1),
	isHybrid: tinyint("is_hybrid").default(0),
	venueInfo: text("venue_info"),
	bannerUrl: text("banner_url"),
	logoUrl: text("logo_url"),
	websiteUrl: text("website_url"),
	registrationFee: decimal("registration_fee", { precision: 10, scale: 2 }).default('0.00'),
	stripeProductId: varchar("stripe_product_id", { length: 255 }),
	tags: json(),
	sponsors: json(),
	socialLinks: json("social_links"),
	createdAt: bigint("created_at", { mode: "number" }).notNull(),
	updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
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
	isResolved: tinyint().default(0),
	resolvedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const documentationPages = mysqlTable("documentation_pages", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 500 }).notNull(),
	slug: varchar({ length: 500 }).notNull(),
	content: text(),
	category: varchar({ length: 100 }).default('general'),
	sortOrder: int("sort_order").default(0),
	isPublished: tinyint("is_published").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const donations = mysqlTable("donations", {
	id: int().autoincrement().notNull(),
	userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	amount: varchar({ length: 20 }).notNull(),
	stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
	stripeInvoiceId: varchar("stripe_invoice_id", { length: 255 }),
	stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
	status: mysqlEnum(['pending','completed','refunded','failed']).default('pending').notNull(),
	purpose: varchar({ length: 100 }).default('general-fund'),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
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

export const ecosystemCommands = mysqlTable("ecosystem_commands", {
	id: varchar({ length: 255 }).notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	target: mysqlEnum(['rrb','hybridcast','canryn','sweet_miracles']).notNull(),
	action: varchar({ length: 255 }).notNull(),
	params: json().notNull(),
	priority: int().default(5).notNull(),
	status: mysqlEnum(['queued','executing','completed','failed']).default('queued').notNull(),
	result: json(),
	error: text(),
	executionTime: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	executedAt: timestamp({ mode: 'string' }),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_userId").on(table.userId),
	index("idx_target").on(table.target),
	index("idx_status").on(table.status),
]);

export const ecosystemStatus = mysqlTable("ecosystem_status", {
	id: int().autoincrement().notNull(),
	entity: mysqlEnum(['rrb','hybridcast','canryn','sweet_miracles']).notNull(),
	status: mysqlEnum(['online','offline','degraded','maintenance']).default('online').notNull(),
	lastHeartbeat: timestamp({ mode: 'string' }),
	commandsProcessed: int().default(0),
	failureRate: decimal({ precision: 5, scale: 2 }).default('0'),
	metadata: json(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("unique_entity").on(table.entity),
]);

export const emailConfigs = mysqlTable("email_configs", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	provider: mysqlEnum(['sendgrid','mailgun','smtp']).default('sendgrid'),
	apiKey: text().notNull(),
	fromEmail: varchar({ length: 255 }).notNull(),
	fromName: varchar({ length: 255 }),
	isActive: tinyint().default(1),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const emailSubscribers = mysqlTable("email_subscribers", {
	id: int().autoincrement().notNull(),
	email: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }),
	source: varchar({ length: 100 }).default('flyer'),
	interests: json(),
	subscribedAt: timestamp("subscribed_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	unsubscribedAt: timestamp("unsubscribed_at", { mode: 'string' }),
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

export const entertainmentMetrics = mysqlTable("entertainment_metrics", {
	id: int().autoincrement().notNull(),
	userId: int("user_id"),
	metricType: varchar("metric_type", { length: 100 }).notNull(),
	metricValue: decimal("metric_value", { precision: 10, scale: 2 }).default('0'),
	period: varchar({ length: 50 }),
	metadata: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const entertainmentPlaylistItems = mysqlTable("entertainment_playlist_items", {
	id: int().autoincrement().notNull(),
	playlistId: int("playlist_id").notNull(),
	contentId: int("content_id").notNull(),
	position: int().default(0).notNull(),
	addedAt: timestamp("added_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const entertainmentPlaylists = mysqlTable("entertainment_playlists", {
	id: int().autoincrement().notNull(),
	userId: int("user_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	coverUrl: text("cover_url"),
	isPublic: tinyint("is_public").default(0).notNull(),
	isPublished: tinyint("is_published").default(1).notNull(),
	trackCount: int("track_count").default(0),
	totalDuration: int("total_duration").default(0),
	playCount: int("play_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
});

export const entertainmentUserPreferences = mysqlTable("entertainment_user_preferences", {
	id: int().autoincrement().notNull(),
	userId: int("user_id").notNull(),
	preferredGenres: json("preferred_genres"),
	preferredArtists: json("preferred_artists"),
	preferredTypes: json("preferred_types"),
	notificationsEnabled: tinyint("notifications_enabled").default(1).notNull(),
	autoPlayEnabled: tinyint("auto_play_enabled").default(1).notNull(),
	qualityPreference: mysqlEnum("quality_preference", ['low','medium','high','lossless']).default('high'),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
});

export const escalationPolicies = mysqlTable("escalation_policies", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	triggers: json().notNull(),
	actions: json().notNull(),
	isActive: tinyint().default(1),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const familyTree = mysqlTable("family_tree", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	nickname: varchar({ length: 255 }),
	relationship: varchar({ length: 255 }),
	birthYear: int("birth_year"),
	deathYear: int("death_year"),
	bio: text(),
	imageUrl: varchar("image_url", { length: 1000 }),
	parentId: int("parent_id"),
	generation: int().default(0),
	isKeyFigure: tinyint("is_key_figure").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const featureFlags = mysqlTable("feature_flags", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	flagName: varchar({ length: 255 }).notNull(),
	isEnabled: tinyint().default(0),
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
	isPublic: tinyint().default(0),
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

export const fundraisingGoals = mysqlTable("fundraising_goals", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	targetAmount: decimal("target_amount", { precision: 12, scale: 2 }).notNull(),
	currentAmount: decimal("current_amount", { precision: 12, scale: 2 }).default('0').notNull(),
	currency: varchar({ length: 10 }).default('USD').notNull(),
	campaign: varchar({ length: 255 }).notNull(),
	startDate: bigint("start_date", { mode: "number" }).notNull(),
	endDate: bigint("end_date", { mode: "number" }),
	donorCount: int("donor_count").default(0),
	isActive: tinyint("is_active").default(1).notNull(),
	createdAt: bigint("created_at", { mode: "number" }).notNull(),
	updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

export const generatedContent = mysqlTable("generated_content", {
	id: int().autoincrement().notNull(),
	userId: int("user_id").notNull(),
	type: mysqlEnum(['text','image','audio','video']).default('text'),
	prompt: text(),
	content: text(),
	fileUrl: text("file_url"),
	status: mysqlEnum(['pending','generating','completed','failed']).default('pending'),
	metadata: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
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

export const hrDepartments = mysqlTable("hr_departments", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	code: varchar({ length: 20 }).notNull(),
	subsidiary: varchar({ length: 255 }),
	managerId: int("manager_id"),
	description: text(),
	budget: decimal({ precision: 15, scale: 2 }),
	headcount: int().default(0).notNull(),
	isActive: tinyint("is_active").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const hrEmployees = mysqlTable("hr_employees", {
	id: int().autoincrement().notNull(),
	employeeNumber: varchar("employee_number", { length: 20 }).notNull(),
	firstName: varchar("first_name", { length: 100 }).notNull(),
	lastName: varchar("last_name", { length: 100 }).notNull(),
	email: varchar({ length: 320 }),
	phone: varchar({ length: 20 }),
	title: varchar({ length: 255 }),
	departmentId: int("department_id"),
	subsidiary: varchar({ length: 255 }),
	hireDate: timestamp("hire_date", { mode: 'string' }).notNull(),
	terminationDate: timestamp("termination_date", { mode: 'string' }),
	status: mysqlEnum(['active','on_leave','terminated','retired']).default('active').notNull(),
	employmentType: mysqlEnum("employment_type", ['full_time','part_time','contractor','intern']).default('full_time').notNull(),
	salary: decimal({ precision: 12, scale: 2 }),
	payFrequency: mysqlEnum("pay_frequency", ['weekly','biweekly','monthly','annual']).default('biweekly').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const hrPayroll = mysqlTable("hr_payroll", {
	id: int().autoincrement().notNull(),
	employeeId: int("employee_id").notNull(),
	payPeriodStart: timestamp("pay_period_start", { mode: 'string' }).notNull(),
	payPeriodEnd: timestamp("pay_period_end", { mode: 'string' }).notNull(),
	grossPay: decimal("gross_pay", { precision: 12, scale: 2 }).notNull(),
	deductions: decimal({ precision: 12, scale: 2 }).default('0.00').notNull(),
	netPay: decimal("net_pay", { precision: 12, scale: 2 }).notNull(),
	taxWithheld: decimal("tax_withheld", { precision: 12, scale: 2 }).default('0.00').notNull(),
	status: mysqlEnum(['pending','processed','paid','voided']).default('pending').notNull(),
	paidDate: timestamp("paid_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const hrTimeTracking = mysqlTable("hr_time_tracking", {
	id: int().autoincrement().notNull(),
	employeeId: int("employee_id").notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	hoursWorked: decimal("hours_worked", { precision: 5, scale: 2 }).notNull(),
	overtime: decimal({ precision: 5, scale: 2 }).default('0.00').notNull(),
	projectCode: varchar("project_code", { length: 50 }),
	notes: text(),
	status: mysqlEnum(['pending','approved','rejected']).default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
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

export const legalComplianceItems = mysqlTable("legal_compliance_items", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 500 }).notNull(),
	category: mysqlEnum(['fcc','copyright','gdpr','ccpa','ada','tax','employment_law','broadcast_license','other']).notNull(),
	status: mysqlEnum(['compliant','non_compliant','pending_review','in_progress','waived']).default('pending_review').notNull(),
	dueDate: timestamp("due_date", { mode: 'string' }),
	assignedTo: int("assigned_to"),
	description: text(),
	resolution: text(),
	subsidiary: varchar({ length: 255 }),
	priority: mysqlEnum(['low','medium','high','critical']).default('medium').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const legalContracts = mysqlTable("legal_contracts", {
	id: int().autoincrement().notNull(),
	contractNumber: varchar("contract_number", { length: 50 }).notNull(),
	title: varchar({ length: 500 }).notNull(),
	contractType: mysqlEnum("contract_type", ['artist_agreement','licensing','nda','employment','vendor','distribution','publishing','sponsorship','partnership','other']).notNull(),
	counterparty: varchar({ length: 255 }).notNull(),
	status: mysqlEnum(['draft','review','approved','active','expired','terminated','disputed']).default('draft').notNull(),
	startDate: timestamp("start_date", { mode: 'string' }),
	endDate: timestamp("end_date", { mode: 'string' }),
	value: decimal({ precision: 15, scale: 2 }),
	subsidiary: varchar({ length: 255 }),
	description: text(),
	terms: text(),
	assignedTo: int("assigned_to"),
	approvedBy: int("approved_by"),
	documentUrl: varchar("document_url", { length: 500 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const legalIntellectualProperty = mysqlTable("legal_intellectual_property", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 500 }).notNull(),
	ipType: mysqlEnum("ip_type", ['copyright','trademark','patent','trade_secret','licensing_right','masters','publishing_right']).notNull(),
	registrationNumber: varchar("registration_number", { length: 100 }),
	owner: varchar({ length: 255 }).notNull(),
	status: mysqlEnum(['pending','registered','active','expired','disputed','transferred']).default('pending').notNull(),
	filingDate: timestamp("filing_date", { mode: 'string' }),
	expirationDate: timestamp("expiration_date", { mode: 'string' }),
	description: text(),
	subsidiary: varchar({ length: 255 }),
	value: decimal({ precision: 15, scale: 2 }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const listenerAnalytics = mysqlTable("listener_analytics", {
	id: int().autoincrement().notNull(),
	channelId: int("channel_id").notNull(),
	channelName: varchar("channel_name", { length: 255 }).notNull(),
	listenerCount: int("listener_count").default(0).notNull(),
	peakListeners: int("peak_listeners").default(0).notNull(),
	geoRegion: varchar("geo_region", { length: 100 }),
	deviceType: mysqlEnum("device_type", ['desktop','mobile','tablet','smart_speaker','other']).default('desktop'),
	sessionDurationSeconds: int("session_duration_seconds").default(0),
	timestamp: bigint({ mode: "number" }).notNull(),
	hourOfDay: int("hour_of_day"),
	dayOfWeek: int("day_of_week"),
	createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const listeners = mysqlTable("listeners", {
	id: int().autoincrement().notNull(),
	broadcastId: int().notNull().references(() => broadcasts.id, { onDelete: "cascade" } ),
	userId: int().references(() => users.id, { onDelete: "set null" } ),
	sessionId: varchar({ length: 255 }).notNull(),
	joinedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	leftAt: timestamp({ mode: 'string' }),
	duration: int(),
	engagement: int().default(0),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const mediaDistribution = mysqlTable("media_distribution", {
	id: int().autoincrement().notNull(),
	projectId: int("project_id").notNull(),
	platform: varchar({ length: 100 }).notNull(),
	status: mysqlEnum(['pending','distributed','failed','removed']).default('pending'),
	externalUrl: text("external_url"),
	externalId: varchar("external_id", { length: 255 }),
	metrics: json(),
	distributedAt: timestamp("distributed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const mediaProjects = mysqlTable("media_projects", {
	id: int().autoincrement().notNull(),
	userId: int("user_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	type: mysqlEnum(['video','audio','image','mixed']).default('video'),
	status: mysqlEnum(['draft','in_progress','review','published','archived']).default('draft'),
	fileUrl: text("file_url"),
	thumbnailUrl: text("thumbnail_url"),
	metadata: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
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

export const monetizationEvents = mysqlTable("monetization_events", {
	id: int().autoincrement().notNull(),
	userId: int("user_id").notNull(),
	type: mysqlEnum(['ad_impression','ad_click','subscription','donation','tip','purchase']).default('ad_impression'),
	amount: decimal({ precision: 10, scale: 2 }).default('0'),
	currency: varchar({ length: 10 }).default('USD'),
	source: varchar({ length: 100 }),
	referenceId: varchar("reference_id", { length: 255 }),
	metadata: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const musicPlaylists = mysqlTable("music_playlists", {
	id: int().autoincrement().notNull(),
	playlistId: varchar("playlist_id", { length: 255 }).notNull(),
	userId: int("user_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	coverUrl: text("cover_url"),
	isPublic: tinyint("is_public").default(0).notNull(),
	trackCount: int("track_count").default(0),
	totalDuration: int("total_duration").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
	createdBy: int("created_by"),
});

export const musicTracks = mysqlTable("music_tracks", {
	id: int().autoincrement().notNull(),
	trackId: varchar("track_id", { length: 255 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	artist: varchar({ length: 255 }),
	album: varchar({ length: 255 }),
	genre: varchar({ length: 100 }),
	duration: int().default(0),
	fileUrl: text("file_url"),
	coverArtUrl: text("cover_art_url"),
	bpm: int(),
	keySignature: varchar("key_signature", { length: 10 }),
	energyLevel: decimal("energy_level", { precision: 3, scale: 2 }),
	isPublic: tinyint("is_public").default(0).notNull(),
	playCount: int("play_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	releaseDate: date("release_date", { mode: 'string' }),
	createdBy: int("created_by"),
	isrc: varchar({ length: 255 }),
	rights: varchar({ length: 255 }),
});

export const newsArticles = mysqlTable("news_articles", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 500 }).notNull(),
	slug: varchar({ length: 500 }).notNull(),
	summary: text(),
	content: text(),
	category: varchar({ length: 100 }).default('general'),
	source: varchar({ length: 255 }),
	sourceUrl: varchar("source_url", { length: 1000 }),
	imageUrl: varchar("image_url", { length: 1000 }),
	isBreaking: tinyint("is_breaking").default(0),
	isFeatured: tinyint("is_featured").default(0),
	authorId: int("author_id"),
	publishedAt: timestamp("published_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
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
	enablePushNotifications: tinyint().default(1),
	enableSoundNotifications: tinyint().default(1),
	enableEmailNotifications: tinyint().default(0),
	soundVolume: int().default(70),
	notificationTypes: json(),
	escalationEnabled: tinyint().default(1),
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
	isRead: tinyint().default(0),
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

export const playlistTracks = mysqlTable("playlist_tracks", {
	id: int().autoincrement().notNull(),
	playlistId: int("playlist_id").notNull(),
	trackId: int("track_id").notNull(),
	position: int().default(0).notNull(),
	addedAt: timestamp("added_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const playlists = mysqlTable("playlists", {
	id: int().autoincrement().notNull(),
	userId: int("user_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	coverUrl: text("cover_url"),
	isPublic: tinyint("is_public").default(0).notNull(),
	trackCount: int("track_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
});

export const plugins = mysqlTable("plugins", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	type: mysqlEnum(['tool','integration','middleware','custom']).default('custom'),
	code: text().notNull(),
	config: json(),
	isActive: tinyint().default(1),
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
	triggered: tinyint().default(0),
	triggeredAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const qumusAutonomousActions = mysqlTable("qumus_autonomous_actions", {
	id: int().autoincrement().notNull(),
	decisionId: varchar("decision_id", { length: 255 }).notNull(),
	policyId: varchar("policy_id", { length: 100 }).notNull(),
	userId: int("user_id"),
	actionType: varchar("action_type", { length: 100 }).notNull(),
	input: json().notNull(),
	output: json(),
	confidence: decimal({ precision: 5, scale: 2 }).notNull(),
	autonomousFlag: tinyint("autonomous_flag").notNull(),
	status: mysqlEnum(['pending','processing','completed','failed','escalated']).default('pending').notNull(),
	result: mysqlEnum(['success','failure','escalated','timeout']).default('success').notNull(),
	executionTime: int("execution_time"),
	errorMessage: text("error_message"),
	metadata: json(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	timestamp: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("qumus_autonomous_actions_decision_id_unique").on(table.decisionId),
]);

export const qumusCorePolicies = mysqlTable("qumus_core_policies", {
	id: int().autoincrement().notNull(),
	policyId: varchar("policy_id", { length: 100 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	policyType: mysqlEnum("policy_type", ['recommendation_engine','payment_processing','content_moderation','user_registration','subscription_management','performance_alert','analytics_aggregation','compliance_reporting']).notNull(),
	autonomyLevel: int("autonomy_level").notNull(),
	confidenceThreshold: int("confidence_threshold").default(80).notNull(),
	enabled: tinyint().default(1).notNull(),
	priority: int().default(0).notNull(),
	conditions: json(),
	actions: json(),
	escalationRules: json("escalation_rules"),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("qumus_core_policies_policy_id_unique").on(table.policyId),
]);

export const qumusDecisionLogs = mysqlTable("qumus_decision_logs", {
	id: int().autoincrement().notNull(),
	decisionId: varchar("decision_id", { length: 255 }).notNull(),
	policyId: varchar("policy_id", { length: 100 }).notNull(),
	policyType: varchar("policy_type", { length: 100 }).notNull(),
	userId: int("user_id"),
	decisionType: varchar("decision_type", { length: 100 }).notNull(),
	input: json().notNull(),
	output: json(),
	confidence: decimal({ precision: 5, scale: 2 }).notNull(),
	autonomousFlag: tinyint("autonomous_flag").notNull(),
	result: varchar({ length: 50 }).notNull(),
	executionTime: int("execution_time"),
	metadata: json(),
	timestamp: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("qumus_decision_logs_decision_id_unique").on(table.decisionId),
]);

export const qumusHumanReview = mysqlTable("qumus_human_review", {
	id: int().autoincrement().notNull(),
	decisionId: varchar("decision_id", { length: 255 }).notNull(),
	policyId: varchar("policy_id", { length: 100 }).notNull(),
	userId: int("user_id"),
	escalationReason: varchar("escalation_reason", { length: 100 }).notNull(),
	priority: mysqlEnum(['low','medium','high','critical']).default('medium').notNull(),
	originalInput: json("original_input").notNull(),
	originalOutput: json("original_output"),
	confidence: decimal({ precision: 5, scale: 2 }).notNull(),
	decision: varchar({ length: 50 }),
	reviewNotes: text("review_notes"),
	reviewedBy: varchar("reviewed_by", { length: 255 }),
	reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
	status: mysqlEnum(['pending','in_review','completed','expired']).default('pending').notNull(),
	metadata: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("qumus_human_review_decision_id_unique").on(table.decisionId),
]);

export const qumusMetrics = mysqlTable("qumus_metrics", {
	id: int().autoincrement().notNull(),
	policyId: varchar("policy_id", { length: 100 }).notNull(),
	policyType: varchar("policy_type", { length: 100 }).notNull(),
	totalDecisions: int("total_decisions").default(0).notNull(),
	autonomousCount: int("autonomous_count").default(0).notNull(),
	escalatedCount: int("escalated_count").default(0).notNull(),
	approvedCount: int("approved_count").default(0).notNull(),
	rejectedCount: int("rejected_count").default(0).notNull(),
	autonomyPercentage: decimal("autonomy_percentage", { precision: 5, scale: 2 }).default('0').notNull(),
	averageConfidence: decimal("average_confidence", { precision: 5, scale: 2 }).default('0').notNull(),
	successRate: decimal("success_rate", { precision: 5, scale: 2 }).default('0').notNull(),
	failureRate: decimal("failure_rate", { precision: 5, scale: 2 }).default('0').notNull(),
	avgExecutionTime: int("avg_execution_time").default(0).notNull(),
	escalationRate: decimal("escalation_rate", { precision: 5, scale: 2 }).default('0').notNull(),
	period: varchar({ length: 50 }).notNull(),
	timestamp: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const qumusPolicyRecommendations = mysqlTable("qumus_policy_recommendations", {
	id: int().autoincrement().notNull(),
	policyId: varchar("policy_id", { length: 100 }).notNull(),
	policyType: varchar("policy_type", { length: 100 }).notNull(),
	recommendationType: varchar("recommendation_type", { length: 100 }).notNull(),
	currentValue: varchar("current_value", { length: 255 }),
	recommendedValue: varchar("recommended_value", { length: 255 }).notNull(),
	reason: text().notNull(),
	confidence: decimal({ precision: 5, scale: 2 }).notNull(),
	impact: varchar({ length: 50 }).notNull(),
	implemented: tinyint().default(0).notNull(),
	implementedAt: timestamp("implemented_at", { mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const quotaAlerts = mysqlTable("quota_alerts", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	quotaType: mysqlEnum(['requests','tokens','cost','sessions']).notNull(),
	threshold: int().notNull(),
	isTriggered: tinyint().default(0),
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

export const radioChannels = mysqlTable("radioChannels", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	frequency: decimal({ precision: 6, scale: 2 }),
	healingFrequency: int(),
	streamUrl: varchar({ length: 2048 }),
	status: mysqlEnum(['active','inactive','maintenance']).default('active'),
	listeners: int().default(0),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
});

export const radioChannelsV2 = mysqlTable("radio_channels", {
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

export const radioChatMessages = mysqlTable("radio_chat_messages", {
	id: int().autoincrement().notNull(),
	channelId: int().notNull(),
	channelName: varchar({ length: 255 }).notNull(),
	userId: varchar({ length: 255 }),
	userName: varchar({ length: 255 }).default('Listener').notNull(),
	userAvatar: varchar({ length: 500 }),
	message: text().notNull(),
	messageType: mysqlEnum(['user','dj_valanna','dj_seraph','dj_candy','system']).default('user').notNull(),
	isAiGenerated: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_channel").on(table.channelId),
	index("idx_created").on(table.createdAt),
]);

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

export const royaltyCollaborators = mysqlTable("royalty_collaborators", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull().references(() => royaltyProjects.id, { onDelete: "cascade" } ),
	userId: int().references(() => users.id, { onDelete: "set null" } ),
	artistName: varchar({ length: 255 }).notNull(),
	role: mysqlEnum(['artist','producer','songwriter','engineer','featured','session_musician','other']).default('artist').notNull(),
	splitPercentage: decimal({ precision: 5, scale: 2 }).default('0.00').notNull(),
	email: varchar({ length: 320 }),
	isRegistered: tinyint().default(0).notNull(),
	inviteStatus: mysqlEnum(['pending','accepted','declined']).default('pending').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	stripeConnectAccountId: varchar("stripe_connect_account_id", { length: 255 }),
	stripeOnboardingComplete: tinyint("stripe_onboarding_complete").default(0).notNull(),
	payoutMethod: mysqlEnum("payout_method", ['stripe_connect','manual','check','wire','paypal']).default('manual').notNull(),
});

export const royaltyDistributions = mysqlTable("royalty_distributions", {
	id: int().autoincrement().notNull(),
	paymentId: int().notNull().references(() => royaltyPayments.id, { onDelete: "cascade" } ),
	collaboratorId: int().notNull().references(() => royaltyCollaborators.id, { onDelete: "set null" } ),
	amount: decimal({ precision: 12, scale: 2 }).notNull(),
	splitPercentage: decimal({ precision: 5, scale: 2 }).notNull(),
	status: mysqlEnum(['calculated','pending_payment','paid','disputed']).default('calculated').notNull(),
	paidAt: timestamp({ mode: 'string' }),
	transactionRef: varchar({ length: 255 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const royaltyPayments = mysqlTable("royalty_payments", {
	id: int().autoincrement().notNull(),
	projectId: int().notNull().references(() => royaltyProjects.id, { onDelete: "cascade" } ),
	source: varchar({ length: 255 }).notNull(),
	sourceType: mysqlEnum(['streaming','download','sync_license','performance','mechanical','merch','other']).default('streaming').notNull(),
	grossAmount: decimal({ precision: 12, scale: 2 }).notNull(),
	netAmount: decimal({ precision: 12, scale: 2 }).notNull(),
	currency: varchar({ length: 3 }).default('USD').notNull(),
	periodStart: timestamp({ mode: 'string' }),
	periodEnd: timestamp({ mode: 'string' }),
	statementRef: varchar({ length: 255 }),
	notes: text(),
	recordedBy: int().notNull().references(() => users.id, { onDelete: "set null" } ),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

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
	createdBy: int().notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const royaltyStatements = mysqlTable("royalty_statements", {
	id: int().autoincrement().notNull(),
	collaboratorId: int().notNull().references(() => royaltyCollaborators.id, { onDelete: "cascade" } ),
	projectId: int().notNull().references(() => royaltyProjects.id, { onDelete: "set null" } ),
	periodStart: timestamp({ mode: 'string' }).notNull(),
	periodEnd: timestamp({ mode: 'string' }).notNull(),
	totalEarnings: decimal({ precision: 12, scale: 2 }).default('0.00').notNull(),
	totalPaid: decimal({ precision: 12, scale: 2 }).default('0.00').notNull(),
	balance: decimal({ precision: 12, scale: 2 }).default('0.00').notNull(),
	status: mysqlEnum(['draft','issued','acknowledged']).default('draft').notNull(),
	generatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const rrbChannelStats = mysqlTable("rrb_channel_stats", {
	id: int().autoincrement().notNull(),
	channelId: int().notNull().references(() => rrbChannels.id, { onDelete: "cascade" } ),
	date: timestamp({ mode: 'string' }).notNull(),
	totalListeners: int().default(0),
	peakListeners: int().default(0),
	averageSessionDuration: int().default(0),
	totalStreamTime: int().default(0),
	uptime: decimal({ precision: 5, scale: 2 }).default('100'),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const rrbChannels = mysqlTable("rrb_channels", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	category: varchar({ length: 64 }).notNull(),
	genre: varchar({ length: 64 }),
	artwork: varchar({ length: 512 }),
	isActive: int().default(1),
	priority: int().default(100),
	listeners: int().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
});

export const rrbFrequencies = mysqlTable("rrb_frequencies", {
	id: int().autoincrement().notNull(),
	frequency: int().notNull(),
	name: varchar({ length: 64 }).notNull(),
	description: text(),
	solfeggio: varchar({ length: 64 }),
	benefits: text(),
	color: varchar({ length: 7 }),
	isDefault: int().default(0),
	isActive: int().default(1),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const rrbListeningHistory = mysqlTable("rrb_listening_history", {
	id: int().autoincrement().notNull(),
	userId: int().references(() => users.id, { onDelete: "cascade" } ),
	channelId: int().notNull().references(() => rrbChannels.id, { onDelete: "set null" } ),
	frequencyId: int().references(() => rrbFrequencies.id, { onDelete: "set null" } ),
	sessionStartTime: timestamp({ mode: 'string' }).notNull(),
	sessionEndTime: timestamp({ mode: 'string' }),
	durationSeconds: int(),
	deviceType: varchar({ length: 64 }),
	userAgent: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const rrbStreamSources = mysqlTable("rrb_stream_sources", {
	id: int().autoincrement().notNull(),
	channelId: int().notNull().references(() => rrbChannels.id, { onDelete: "cascade" } ),
	url: varchar({ length: 512 }).notNull(),
	sourceType: mysqlEnum(['soma','icecast','shoutcast','generic','custom']).notNull(),
	priority: int().default(100),
	bitrate: int(),
	format: varchar({ length: 32 }),
	isActive: int().default(1),
	lastHealthCheck: timestamp({ mode: 'string' }),
	healthStatus: mysqlEnum(['healthy','degraded','offline','unknown']).default('unknown'),
	failureCount: int().default(0),
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
	isActive: tinyint().default(1),
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
	resolved: tinyint().default(0),
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

export const socialMediaPosts = mysqlTable("social_media_posts", {
	id: int().autoincrement().notNull(),
	platform: mysqlEnum(['twitter','instagram','discord','facebook','tiktok','youtube']).notNull(),
	postType: mysqlEnum("post_type", ['text','image','video','story','reel','announcement']).default('text').notNull(),
	content: text().notNull(),
	mediaUrl: text("media_url"),
	hashtags: text(),
	scheduledAt: bigint("scheduled_at", { mode: "number" }).notNull(),
	publishedAt: bigint("published_at", { mode: "number" }),
	status: mysqlEnum(['draft','scheduled','published','failed','cancelled']).default('scheduled').notNull(),
	campaign: varchar({ length: 255 }).default('selma-to-un-csw70'),
	qumusManaged: tinyint("qumus_managed").default(1).notNull(),
	createdAt: bigint("created_at", { mode: "number" }).notNull(),
	updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

export const solbonesFrequencyRolls = mysqlTable("solbones_frequency_rolls", {
	id: int().autoincrement().notNull(),
	userId: int("user_id"),
	dice1: int("dice_1").default(1).notNull(),
	dice2: int("dice_2").default(1).notNull(),
	dice3: int("dice_3").default(1).notNull(),
	frequency: int(),
	score: int().default(0).notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const solbonesLeaderboard = mysqlTable("solbones_leaderboard", {
	id: int().autoincrement().notNull(),
	userId: int("user_id"),
	username: varchar({ length: 255 }),
	score: int().default(0).notNull(),
	gamesPlayed: int("games_played").default(1).notNull(),
	highestScore: int("highest_score").default(0).notNull(),
	totalTallies: int("total_tallies").default(0).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const squaddMembers = mysqlTable("squadd_members", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	organization: varchar({ length: 255 }),
	missionArea: varchar("mission_area", { length: 100 }).notNull(),
	missionIcon: varchar("mission_icon", { length: 50 }).notNull(),
	bio: text().notNull(),
	quote: text(),
	email: varchar({ length: 255 }),
	photoUrl: text("photo_url"),
	focusAreas: json("focus_areas"),
	achievements: json(),
	slug: varchar({ length: 100 }).notNull(),
	displayOrder: int("display_order").default(0),
	isActive: tinyint("is_active").default(1).notNull(),
	createdAt: bigint("created_at", { mode: "number" }).notNull(),
	updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

export const streamingStatus = mysqlTable("streaming_status", {
	id: int().autoincrement().notNull(),
	broadcastId: varchar("broadcast_id", { length: 255 }).notNull(),
	channelId: int("channel_id"),
	status: mysqlEnum(['offline','starting','live','paused','ending']).default('offline'),
	viewerCount: int("viewer_count").default(0),
	peakViewers: int("peak_viewers").default(0),
	streamUrl: text("stream_url"),
	startedAt: timestamp("started_at", { mode: 'string' }),
	endedAt: timestamp("ended_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
	platform: mysqlEnum(['youtube','twitch','facebook','instagram','website','radio','podcast']).default('website').notNull(),
	bitrate: varchar({ length: 50 }),
	resolution: varchar({ length: 50 }),
	frameRate: varchar("frame_rate", { length: 20 }),
	latency: int(),
	errorMessage: text("error_message"),
	lastUpdated: timestamp("last_updated", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const studioGuests = mysqlTable("studio_guests", {
	id: int().autoincrement().notNull(),
	sessionId: int("session_id").notNull().references(() => studioSessions.id, { onDelete: "cascade" } ),
	userId: int("user_id"),
	guestName: varchar("guest_name", { length: 255 }).notNull(),
	guestEmail: varchar("guest_email", { length: 255 }),
	guestAvatar: text("guest_avatar"),
	platform: mysqlEnum(['internal','youtube','twitch','zoom','discord','twitter_spaces','custom']).default('internal').notNull(),
	platformHandle: varchar("platform_handle", { length: 255 }),
	role: mysqlEnum(['host','co_host','panelist','guest','moderator','speaker','attendee']).default('guest').notNull(),
	status: mysqlEnum(['invited','accepted','declined','waiting','connected','on_air','muted','disconnected']).default('invited').notNull(),
	inviteToken: varchar("invite_token", { length: 64 }),
	joinedAt: bigint("joined_at", { mode: "number" }),
	leftAt: bigint("left_at", { mode: "number" }),
	isMuted: tinyint("is_muted").default(0),
	isVideoOn: tinyint("is_video_on").default(1),
	isScreenSharing: tinyint("is_screen_sharing").default(0),
	speakingOrder: int("speaking_order"),
	bio: text(),
	createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const studioRecordings = mysqlTable("studio_recordings", {
	id: int().autoincrement().notNull(),
	sessionId: int("session_id").notNull().references(() => studioSessions.id, { onDelete: "cascade" } ),
	title: varchar({ length: 500 }).notNull(),
	description: text(),
	recordingUrl: text("recording_url").notNull(),
	thumbnailUrl: text("thumbnail_url"),
	durationSeconds: int("duration_seconds").default(0),
	fileSizeMb: decimal("file_size_mb", { precision: 10, scale: 2 }),
	format: mysqlEnum(['mp4','mp3','wav','webm','mkv']).default('mp4'),
	isPublished: tinyint("is_published").default(0),
	viewCount: int("view_count").default(0),
	tags: json(),
	createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const studioSessions = mysqlTable("studio_sessions", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 500 }).notNull(),
	description: text(),
	hostUserId: int("host_user_id"),
	sessionType: mysqlEnum("session_type", ['podcast','live_show','interview','panel','workshop','convention_panel','recording']).default('podcast').notNull(),
	status: mysqlEnum(['draft','scheduled','greenroom','live','recording','ended','archived']).default('draft').notNull(),
	scheduledAt: bigint("scheduled_at", { mode: "number" }),
	startedAt: bigint("started_at", { mode: "number" }),
	endedAt: bigint("ended_at", { mode: "number" }),
	maxGuests: int("max_guests").default(8),
	isPublic: tinyint("is_public").default(1),
	streamPlatforms: json("stream_platforms"),
	streamKeys: json("stream_keys"),
	recordingEnabled: tinyint("recording_enabled").default(1),
	recordingUrl: text("recording_url"),
	thumbnailUrl: text("thumbnail_url"),
	tags: json(),
	conventionId: int("convention_id"),
	breakoutRoomId: int("breakout_room_id"),
	viewerCount: int("viewer_count").default(0),
	peakViewers: int("peak_viewers").default(0),
	joinCode: varchar("join_code", { length: 20 }),
	createdAt: bigint("created_at", { mode: "number" }).notNull(),
	updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
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
	isActive: tinyint().default(1),
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
	isActive: tinyint().default(1),
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

export const systemAuditLog = mysqlTable("systemAuditLog", {
	id: int().autoincrement().notNull(),
	system: mysqlEnum(['qumus','rrb','hybridcast']).notNull(),
	userId: int().references(() => users.id, { onDelete: "cascade" } ),
	action: varchar({ length: 255 }).notNull(),
	resourceType: varchar({ length: 64 }),
	resourceId: varchar({ length: 255 }),
	changes: json(),
	ipAddress: varchar({ length: 45 }),
	userAgent: text(),
	status: mysqlEnum(['success','failed']).default('success'),
	errorMessage: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const systemCommands = mysqlTable("systemCommands", {
	id: int().autoincrement().notNull(),
	commandId: varchar({ length: 255 }).notNull(),
	sourceSystem: mysqlEnum(['qumus','rrb','hybridcast']).notNull(),
	targetSystem: mysqlEnum(['qumus','rrb','hybridcast']).notNull(),
	command: varchar({ length: 255 }).notNull(),
	parameters: json(),
	status: mysqlEnum(['pending','executing','completed','failed']).default('pending'),
	result: json(),
	errorMessage: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	completedAt: timestamp({ mode: 'string' }),
},
(table) => [
	index("commandId").on(table.commandId),
]);

export const systemMetrics = mysqlTable("systemMetrics", {
	id: int().autoincrement().notNull(),
	system: mysqlEnum(['qumus','rrb','hybridcast']).notNull(),
	timestamp: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	activeListeners: int().default(0),
	totalBroadcasts: int().default(0),
	totalDonations: decimal({ precision: 15, scale: 2 }).default('0'),
	uptime: decimal({ precision: 5, scale: 2 }).default('100'),
	cpuUsage: decimal({ precision: 5, scale: 2 }),
	memoryUsage: decimal({ precision: 5, scale: 2 }),
	bandwidth: int(),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
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

export const systemMetricsV2 = mysqlTable("system_metrics", {
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

export const systemUpdates = mysqlTable("system_updates", {
	id: int().autoincrement().notNull(),
	version: varchar({ length: 50 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	changelog: text().notNull(),
	category: mysqlEnum(['feature','bugfix','security','content','infrastructure']).default('feature').notNull(),
	severity: mysqlEnum(['critical','major','minor','patch']).default('minor').notNull(),
	status: mysqlEnum(['draft','published','deployed','rolled_back']).default('draft').notNull(),
	affectedSystems: text("affected_systems"),
	publishedBy: varchar("published_by", { length: 255 }),
	publishedAt: bigint("published_at", { mode: "number" }),
	deployedAt: bigint("deployed_at", { mode: "number" }),
	createdAt: bigint("created_at", { mode: "number" }).notNull(),
	updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

export const taskExecutionLog = mysqlTable("task_execution_log", {
	id: int().autoincrement().notNull(),
	taskId: varchar({ length: 255 }).notNull().references(() => autonomousTasks.id, { onDelete: "cascade" } ),
	eventType: mysqlEnum(['submitted','started','step_completed','completed','failed','retried']).notNull(),
	details: json(),
	timestamp: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_taskId").on(table.taskId),
	index("idx_timestamp").on(table.timestamp),
]);

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

export const taskSteps = mysqlTable("task_steps", {
	id: varchar({ length: 255 }).notNull(),
	taskId: varchar({ length: 255 }).notNull().references(() => autonomousTasks.id, { onDelete: "cascade" } ),
	stepNumber: int().notNull(),
	description: text().notNull(),
	status: mysqlEnum(['pending','executing','completed','failed','skipped']).default('pending').notNull(),
	result: json(),
	error: text(),
	executionTime: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	startedAt: timestamp({ mode: 'string' }),
	completedAt: timestamp({ mode: 'string' }),
},
(table) => [
	index("idx_taskId").on(table.taskId),
]);

export const teamMembers = mysqlTable("team_members", {
	id: int().autoincrement().notNull(),
	teamId: int().notNull().references(() => teams.id, { onDelete: "cascade" } ),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	role: mysqlEnum(['viewer','editor','admin']).default('viewer'),
	joinedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const teamNotifications = mysqlTable("team_notifications", {
	id: int().autoincrement().notNull(),
	updateId: int("update_id").notNull(),
	userId: int("user_id"),
	channel: mysqlEnum(['push','email','in_app','webhook','sms']).default('in_app').notNull(),
	recipient: varchar({ length: 255 }).notNull(),
	delivered: tinyint().default(0).notNull(),
	readAt: bigint("read_at", { mode: "number" }),
	acknowledgedAt: bigint("acknowledged_at", { mode: "number" }),
	appliedAt: bigint("applied_at", { mode: "number" }),
	errorMessage: text("error_message"),
	createdAt: bigint("created_at", { mode: "number" }).notNull(),
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
	autoRenew: tinyint().default(1),
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
	role: mysqlEnum(['user','admin','editor']).default('user').notNull(),
	systemRoles: json(),
	accessibleSystems: json(),
	preferences: json(),
	lastActiveSystem: varchar({ length: 64 }).default('qumus'),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	lastSignedIn: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("users_openId_unique").on(table.openId),
]);

export const usersWithStripe = mysqlTable("users_with_stripe", {
	id: int().autoincrement().notNull(),
	userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull(),
	stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const viewerMetrics = mysqlTable("viewer_metrics", {
	id: int().autoincrement().notNull(),
	streamId: int("stream_id"),
	timestamp: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	viewerCount: int("viewer_count").default(0),
	chatMessages: int("chat_messages").default(0),
	engagementScore: decimal("engagement_score", { precision: 5, scale: 2 }).default('0'),
	avgWatchTime: int("avg_watch_time").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const webhookEndpoints = mysqlTable("webhook_endpoints", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	url: varchar({ length: 2048 }).notNull(),
	events: text().notNull(),
	secret: varchar({ length: 255 }).notNull(),
	isActive: tinyint().default(1),
	retryCount: int().default(3),
	lastTriggered: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	failureCount: int("failure_count").default(0),
});

export const webhookInstallations = mysqlTable("webhook_installations", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	templateId: int().notNull().references(() => webhookTemplates.id),
	name: varchar({ length: 255 }).notNull(),
	config: json().notNull(),
	isActive: tinyint().default(1),
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
	isPublic: tinyint().default(1),
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

// ─── Podcast Shows ─────────────────────────────────────────
export const podcastShows = mysqlTable("podcast_shows", {
  id: int().autoincrement().notNull(),
  slug: varchar({ length: 100 }).notNull(),
  title: varchar({ length: 500 }).notNull(),
  subtitle: varchar({ length: 500 }),
  description: text(),
  hostPersona: mysqlEnum("host_persona", ['candy', 'valanna', 'seraph']).notNull(),
  hostName: varchar("host_name", { length: 255 }).notNull(),
  coverImageUrl: text("cover_image_url"),
  themeColor: varchar("theme_color", { length: 20 }).default('#a78bfa'),
  scheduleDay: varchar("schedule_day", { length: 100 }),
  scheduleTime: varchar("schedule_time", { length: 50 }),
  scheduleTimezone: varchar("schedule_timezone", { length: 20 }).default('CT'),
  isLive: tinyint("is_live").default(0),
  totalEpisodes: int("total_episodes").default(0),
  totalListeners: int("total_listeners").default(0),
  spotifyUrl: text("spotify_url"),
  appleUrl: text("apple_url"),
  youtubeUrl: text("youtube_url"),
  rssFeedUrl: text("rss_feed_url"),
  isActive: tinyint("is_active").default(1).notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

// ─── Podcast Episodes ──────────────────────────────────────
export const podcastEpisodes = mysqlTable("podcast_episodes", {
  id: int().autoincrement().notNull(),
  showId: int("show_id").notNull(),
  episodeNumber: int("episode_number").notNull(),
  title: varchar({ length: 500 }).notNull(),
  description: text(),
  audioUrl: text("audio_url"),
  audioFileKey: varchar("audio_file_key", { length: 500 }),
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  duration: int(),
  fileSize: int("file_size"),
  status: mysqlEnum("status", ['draft', 'uploading', 'processing', 'ready', 'published', 'scheduled', 'archived']).default('draft').notNull(),
  publishedAt: bigint("published_at", { mode: "number" }),
  scheduledPublishAt: bigint("scheduled_publish_at", { mode: "number" }),
  spotifyEpisodeId: varchar("spotify_episode_id", { length: 255 }),
  appleEpisodeId: varchar("apple_episode_id", { length: 255 }),
  youtubeVideoId: varchar("youtube_video_id", { length: 255 }),
  distributionStatus: json("distribution_status"),
  playCount: int("play_count").default(0),
  downloadCount: int("download_count").default(0),
  likeCount: int("like_count").default(0),
  tags: json("tags"),
  guestNames: json("guest_names"),
  showNotes: text("show_notes"),
  transcriptUrl: text("transcript_url"),
  chapters: json("chapters"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

// ─── Call-In Queue ─────────────────────────────────────────
export const callInQueue = mysqlTable("call_in_queue", {
  id: int().autoincrement().notNull(),
  showId: int("show_id").notNull(),
  sessionId: int("session_id"),
  userId: int("user_id"),
  callerName: varchar("caller_name", { length: 255 }).notNull(),
  callerEmail: varchar("caller_email", { length: 255 }),
  topic: text(),
  status: mysqlEnum("status", ['waiting', 'screening', 'ready', 'on_air', 'completed', 'dropped', 'rejected']).default('waiting').notNull(),
  queuePosition: int("queue_position").default(0),
  peerId: varchar("peer_id", { length: 255 }),
  connectionType: mysqlEnum("connection_type", ['webrtc', 'phone', 'sip']).default('webrtc').notNull(),
  isMuted: tinyint("is_muted").default(1),
  joinedAt: bigint("joined_at", { mode: "number" }).notNull(),
  onAirAt: bigint("on_air_at", { mode: "number" }),
  endedAt: bigint("ended_at", { mode: "number" }),
  durationOnAir: int("duration_on_air"),
  rating: int(),
  notes: text(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

// ─── Client Profiles ──────────────────────────────────────
export const clientProfiles = mysqlTable("client_profiles", {
  id: int().autoincrement().notNull(),
  userId: int("user_id").notNull(),
  displayName: varchar("display_name", { length: 255 }),
  bio: text(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
});

// ─── Client Donation History ──────────────────────────────
export const clientDonationHistory = mysqlTable("client_donation_history", {
  id: int().autoincrement().notNull(),
  userId: int("user_id").notNull(),
  amount: decimal({ precision: 10, scale: 2 }).notNull(),
  currency: varchar({ length: 10 }).default('USD'),
  status: varchar({ length: 50 }).default('completed'),
  stripePaymentId: varchar("stripe_payment_id", { length: 255 }),
  campaign: varchar({ length: 255 }),
  message: text(),
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

// ─── Client Content Uploads ───────────────────────────────
export const clientContentUploads = mysqlTable("client_content_uploads", {
  id: int().autoincrement().notNull(),
  userId: int("user_id").notNull(),
  fileName: varchar("file_name", { length: 500 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileKey: varchar("file_key", { length: 500 }),
  fileType: varchar("file_type", { length: 100 }),
  fileSize: int("file_size"),
  status: varchar({ length: 50 }).default('uploaded'),
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

// ─── Reviews ──────────────────────────────────────────────
export const reviews = mysqlTable("reviews", {
  id: int().autoincrement().notNull(),
  userId: int("user_id").notNull(),
  targetType: varchar("target_type", { length: 100 }).notNull(),
  targetId: int("target_id").notNull(),
  rating: int().notNull(),
  title: varchar({ length: 500 }),
  content: text(),
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
});

// ─── Review Helpfulness ───────────────────────────────────
export const reviewHelpfulness = mysqlTable("review_helpfulness", {
  id: int().autoincrement().notNull(),
  reviewId: int("review_id").notNull(),
  userId: int("user_id").notNull(),
  helpful: tinyint().default(1),
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

// ─── Review Responses ─────────────────────────────────────
export const reviewResponses = mysqlTable("review_responses", {
  id: int().autoincrement().notNull(),
  reviewId: int("review_id").notNull(),
  userId: int("user_id").notNull(),
  content: text().notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

// ─── Agent Connections ────────────────────────────────────
export const agentConnections = mysqlTable("agent_connections", {
  id: int().autoincrement().notNull(),
  agentId: int("agent_id").notNull(),
  connectedAgentId: int("connected_agent_id").notNull(),
  status: varchar({ length: 50 }).default('active'),
  connectionType: varchar("connection_type", { length: 100 }).default('peer'),
  metadata: json(),
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

// ─── Analytics Summary ────────────────────────────────────
export const analyticsSummary = mysqlTable("analytics_summary", {
  id: int().autoincrement().notNull(),
  date: date().notNull(),
  platform: varchar({ length: 100 }),
  totalViews: int("total_views").default(0),
  totalEngagement: int("total_engagement").default(0),
  totalShares: int("total_shares").default(0),
  totalComments: int("total_comments").default(0),
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

// ─── Broadcast Schedule ───────────────────────────────────
export const broadcastSchedule = mysqlTable("broadcast_schedule", {
  id: int().autoincrement().notNull(),
  channelId: int("channel_id"),
  title: varchar({ length: 500 }).notNull(),
  description: text(),
  startTime: timestamp("start_time", { mode: 'string' }),
  endTime: timestamp("end_time", { mode: 'string' }),
  status: varchar({ length: 50 }).default('scheduled'),
  contentType: varchar("content_type", { length: 100 }),
  contentUrl: text("content_url"),
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

// ─── Bulk Schedule Templates ──────────────────────────────
export const bulkScheduleTemplates = mysqlTable("bulk_schedule_templates", {
  id: int().autoincrement().notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  templateData: json("template_data"),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

// ─── Content Calendar Posts ───────────────────────────────
export const contentCalendarPosts = mysqlTable("content_calendar_posts", {
  id: int().autoincrement().notNull(),
  title: varchar({ length: 500 }).notNull(),
  content: text(),
  platform: varchar({ length: 100 }),
  scheduledAt: timestamp("scheduled_at", { mode: 'string' }),
  status: varchar({ length: 50 }).default('draft'),
  mediaUrls: json("media_urls"),
  hashtags: json(),
  createdBy: int("created_by"),
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
});

// ─── Custom Stations ──────────────────────────────────────
export const customStations = mysqlTable("custom_stations", {
  id: int().autoincrement().notNull(),
  userId: int("user_id").notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  genre: varchar({ length: 100 }),
  themeColor: varchar("theme_color", { length: 20 }),
  logoUrl: text("logo_url"),
  isPublic: tinyint("is_public").default(1),
  listenerCount: int("listener_count").default(0),
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
});

// ─── Decision Logs ────────────────────────────────────────
export const decisionLogs = mysqlTable("decision_logs", {
  id: int().autoincrement().notNull(),
  decisionId: varchar("decision_id", { length: 255 }),
  policyId: varchar("policy_id", { length: 255 }),
  action: varchar({ length: 255 }),
  result: text(),
  confidence: decimal({ precision: 5, scale: 2 }),
  metadata: json(),
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

// ─── File Access Logs ─────────────────────────────────────
export const fileAccessLogs = mysqlTable("file_access_logs", {
  id: int().autoincrement().notNull(),
  fileId: int("file_id").notNull(),
  userId: int("user_id"),
  action: varchar({ length: 50 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

// ─── Platform Engagement Metrics ──────────────────────────
export const platformEngagementMetrics = mysqlTable("platform_engagement_metrics", {
  id: int().autoincrement().notNull(),
  platform: varchar({ length: 100 }).notNull(),
  date: date().notNull(),
  impressions: int().default(0),
  clicks: int().default(0),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }).default('0'),
  followersGained: int("followers_gained").default(0),
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

// ─── Station Content Sources ──────────────────────────────
export const stationContentSources = mysqlTable("station_content_sources", {
  id: int().autoincrement().notNull(),
  stationId: int("station_id").notNull(),
  sourceType: varchar("source_type", { length: 100 }).notNull(),
  sourceUrl: text("source_url"),
  isActive: tinyint("is_active").default(1),
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

// ─── Station Playback History ─────────────────────────────
export const stationPlaybackHistory = mysqlTable("station_playback_history", {
  id: int().autoincrement().notNull(),
  stationId: int("station_id").notNull(),
  trackTitle: varchar("track_title", { length: 500 }),
  artist: varchar({ length: 255 }),
  playedAt: timestamp("played_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
  duration: int(),
});

// ─── User Station Preferences ─────────────────────────────
export const userStationPreferences = mysqlTable("user_station_preferences", {
  id: int().autoincrement().notNull(),
  userId: int("user_id").notNull(),
  stationId: int("station_id").notNull(),
  isFavorite: tinyint("is_favorite").default(0),
  volume: int().default(80),
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

// ─── Decisions ────────────────────────────────────────────
export const decisions = mysqlTable("decisions", {
  id: int().autoincrement().notNull(),
  policyId: varchar("policy_id", { length: 255 }),
  decisionType: varchar("decision_type", { length: 100 }),
  action: varchar({ length: 255 }),
  confidence: decimal({ precision: 5, scale: 2 }),
  status: varchar({ length: 50 }).default('pending'),
  result: text(),
  metadata: json(),
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
  executedAt: timestamp("executed_at", { mode: 'string' }),
});

// ─── Files ────────────────────────────────────────────────
export const files = mysqlTable("files", {
  id: int().autoincrement().notNull(),
  userId: int("user_id"),
  fileName: varchar("file_name", { length: 500 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileKey: varchar("file_key", { length: 500 }),
  mimeType: varchar("mime_type", { length: 100 }),
  fileSize: int("file_size"),
  category: varchar({ length: 100 }),
  isPublic: tinyint("is_public").default(0),
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
});

// ─── Payments ─────────────────────────────────────────────
export const payments = mysqlTable("payments", {
  id: int().autoincrement().notNull(),
  userId: int("user_id").notNull(),
  stripePaymentId: varchar("stripe_payment_id", { length: 255 }),
  amount: decimal({ precision: 10, scale: 2 }).notNull(),
  currency: varchar({ length: 10 }).default('USD'),
  status: varchar({ length: 50 }).default('pending'),
  description: text(),
  metadata: json(),
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

// ─── Subscriptions ────────────────────────────────────────
export const subscriptions = mysqlTable("subscriptions", {
  id: int().autoincrement().notNull(),
  userId: int("user_id").notNull(),
  plan: varchar({ length: 100 }).notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  status: varchar({ length: 50 }).default('active'),
  currentPeriodStart: timestamp("current_period_start", { mode: 'string' }),
  currentPeriodEnd: timestamp("current_period_end", { mode: 'string' }),
  cancelAtPeriodEnd: tinyint("cancel_at_period_end").default(0),
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
});

// ─── Station Analytics ────────────────────────────────────
export const stationAnalytics = mysqlTable("station_analytics", {
  id: int().autoincrement().notNull(),
  stationId: int("station_id").notNull(),
  date: date(),
  listeners: int().default(0),
  peakListeners: int("peak_listeners").default(0),
  totalPlayTime: int("total_play_time").default(0),
  avgSessionDuration: int("avg_session_duration").default(0),
  tracksPlayed: int("tracks_played").default(0),
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

// ─── Station Templates ────────────────────────────────────
export const stationTemplates = mysqlTable("station_templates", {
  id: int().autoincrement().notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  genre: varchar({ length: 100 }),
  defaultConfig: json("default_config"),
  previewUrl: text("preview_url"),
  isActive: tinyint("is_active").default(1),
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

// ─── Station Sharing ──────────────────────────────────────
export const stationSharing = mysqlTable("station_sharing", {
  id: int().autoincrement().notNull(),
  stationId: int("station_id").notNull(),
  sharedWithUserId: int("shared_with_user_id").notNull(),
  permission: varchar({ length: 50 }).default('listen'),
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
});


// System-wide configuration (Restream URL, platform settings, etc.)
export const systemConfig = mysqlTable("system_config", {
  id: int().autoincrement().notNull(),
  configKey: varchar("config_key", { length: 255 }).notNull(),
  configValue: text("config_value").notNull(),
  description: varchar({ length: 500 }),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  updatedBy: varchar("updated_by", { length: 255 }),
});
