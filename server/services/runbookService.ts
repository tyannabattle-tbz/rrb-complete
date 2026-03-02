import { invokeLLM } from "../_core/llm";

export interface RunbookTask {
  id: string;
  name: string;
  description: string;
  script: string;
  language: "bash" | "python" | "node";
  timeout: number; // in seconds
  retryCount: number;
  requiredParams: string[];
  tags: string[];
}

export interface RunbookExecution {
  id: string;
  taskId: string;
  taskName: string;
  status: "pending" | "running" | "success" | "failed" | "timeout";
  startTime: Date;
  endTime?: Date;
  duration?: number; // in milliseconds
  output: string;
  error?: string;
  exitCode?: number;
  params: Record<string, unknown>;
}

export interface RunbookSchedule {
  id: string;
  taskId: string;
  schedule: string; // cron expression
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  executionHistory: RunbookExecution[];
}

// In-memory storage
const runbooks: Map<string, RunbookTask> = new Map();
const executions: Map<string, RunbookExecution> = new Map();
const schedules: Map<string, RunbookSchedule> = new Map();
let taskIdCounter = 1;
let executionIdCounter = 1;
let scheduleIdCounter = 1;

// Pre-populate with common runbooks
function initializeDefaultRunbooks() {
  createRunbook(
    "backup-database",
    "Backup the production database",
    `#!/bin/bash
echo "Starting database backup..."
BACKUP_FILE="/backups/db-backup-$(date +%Y%m%d-%H%M%S).sql"
mysqldump -u$DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_FILE
if [ $? -eq 0 ]; then
  echo "Backup completed: $BACKUP_FILE"
  exit 0
else
  echo "Backup failed"
  exit 1
fi`,
    "bash",
    300,
    2,
    ["DB_USER", "DB_PASSWORD", "DB_NAME"],
    ["database", "backup", "maintenance"]
  );

  createRunbook(
    "health-check",
    "Run comprehensive health checks on all services",
    `#!/bin/bash
echo "Running health checks..."
FAILED=0

# Check API server
curl -f http://localhost:3000/api/health || FAILED=$((FAILED+1))

# Check database
mysql -u$DB_USER -p$DB_PASSWORD -e "SELECT 1" || FAILED=$((FAILED+1))

# Check cache
redis-cli ping || FAILED=$((FAILED+1))

if [ $FAILED -eq 0 ]; then
  echo "All health checks passed"
  exit 0
else
  echo "$FAILED health checks failed"
  exit 1
fi`,
    "bash",
    60,
    1,
    ["DB_USER", "DB_PASSWORD"],
    ["health", "monitoring", "critical"]
  );

  createRunbook(
    "restart-services",
    "Restart all application services",
    `#!/bin/bash
echo "Restarting services..."
systemctl restart app-server
systemctl restart app-worker
systemctl restart app-scheduler
sleep 5
echo "Services restarted"
exit 0`,
    "bash",
    120,
    1,
    [],
    ["deployment", "restart", "critical"]
  );

  createRunbook(
    "migrate-database",
    "Run database migrations",
    `#!/bin/bash
echo "Running database migrations..."
cd /app
npm run db:migrate
if [ $? -eq 0 ]; then
  echo "Migrations completed successfully"
  exit 0
else
  echo "Migrations failed"
  exit 1
fi`,
    "bash",
    300,
    1,
    [],
    ["database", "migration", "deployment"]
  );

  createRunbook(
    "cleanup-logs",
    "Clean up old log files to free disk space",
    `#!/bin/bash
echo "Cleaning up old logs..."
find /var/log/app -type f -name "*.log" -mtime +30 -delete
echo "Log cleanup completed"
exit 0`,
    "bash",
    60,
    1,
    [],
    ["maintenance", "cleanup", "storage"]
  );
}

export function createRunbook(
  name: string,
  description: string,
  script: string,
  language: "bash" | "python" | "node",
  timeout: number,
  retryCount: number,
  requiredParams: string[],
  tags: string[]
): RunbookTask {
  const id = `runbook-${taskIdCounter++}`;
  const task: RunbookTask = {
    id,
    name,
    description,
    script,
    language,
    timeout,
    retryCount,
    requiredParams,
    tags,
  };
  runbooks.set(id, task);
  return task;
}

export function getRunbook(taskId: string): RunbookTask | null {
  return runbooks.get(taskId) || null;
}

export function getAllRunbooks(): RunbookTask[] {
  return Array.from(runbooks.values());
}

export function getRunbooksByTag(tag: string): RunbookTask[] {
  return Array.from(runbooks.values()).filter((r) => r.tags.includes(tag));
}

export function updateRunbook(taskId: string, updates: Partial<RunbookTask>): RunbookTask | null {
  const runbook = runbooks.get(taskId);
  if (!runbook) return null;

  const updated = { ...runbook, ...updates, id: runbook.id };
  runbooks.set(taskId, updated);
  return updated;
}

export function deleteRunbook(taskId: string): boolean {
  return runbooks.delete(taskId);
}

export async function executeRunbook(taskId: string, params: Record<string, unknown> = {}): Promise<RunbookExecution> {
  const task = runbooks.get(taskId);
  if (!task) {
    throw new Error(`Runbook ${taskId} not found`);
  }

  // Validate required parameters
  for (const param of task.requiredParams) {
    if (!(param in params)) {
      throw new Error(`Missing required parameter: ${param}`);
    }
  }

  const executionId = `exec-${executionIdCounter++}`;
  const execution: RunbookExecution = {
    id: executionId,
    taskId,
    taskName: task.name,
    status: "running",
    startTime: new Date(),
    output: "",
    params,
  };

  executions.set(executionId, execution);

  // Simulate script execution
  try {
    // In production, this would execute the actual script
    const output = await simulateScriptExecution(task, params);
    execution.status = "success";
    execution.output = output;
    execution.exitCode = 0;
  } catch (error) {
    execution.status = "failed";
    execution.error = error instanceof Error ? error.message : String(error);
    execution.exitCode = 1;
  }

  execution.endTime = new Date();
  execution.duration = execution.endTime.getTime() - execution.startTime.getTime();

  return execution;
}

async function simulateScriptExecution(task: RunbookTask, params: Record<string, unknown>): Promise<string> {
  // Simulate script execution with a small delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Generate realistic output based on task type
  const outputs: Record<string, string> = {
    "backup-database": `Starting database backup...
Backup completed: /backups/db-backup-20260130-145730.sql
Backup size: 2.4GB
Backup duration: 45 seconds`,
    "health-check": `Running health checks...
✓ API server: OK (45ms)
✓ Database: OK (12ms)
✓ Cache: OK (8ms)
All health checks passed`,
    "restart-services": `Restarting services...
Stopping app-server... OK
Stopping app-worker... OK
Stopping app-scheduler... OK
Starting app-server... OK
Starting app-worker... OK
Starting app-scheduler... OK
Services restarted`,
    "migrate-database": `Running database migrations...
Migration 001_initial_schema.sql... OK
Migration 002_add_users_table.sql... OK
Migration 003_add_sessions_table.sql... OK
Migrations completed successfully`,
    "cleanup-logs": `Cleaning up old logs...
Deleted 245 log files
Freed 12.5GB of disk space
Log cleanup completed`,
  };

  return outputs[task.name] || `Executed ${task.name} successfully`;
}

export function getExecution(executionId: string): RunbookExecution | null {
  return executions.get(executionId) || null;
}

export function getExecutionHistory(taskId: string, limit: number = 50): RunbookExecution[] {
  return Array.from(executions.values())
    .filter((e) => e.taskId === taskId)
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
    .slice(0, limit);
}

export function getAllExecutions(limit: number = 100): RunbookExecution[] {
  return Array.from(executions.values())
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
    .slice(0, limit);
}

export function createSchedule(taskId: string, schedule: string): RunbookSchedule {
  const task = runbooks.get(taskId);
  if (!task) {
    throw new Error(`Runbook ${taskId} not found`);
  }

  const id = `schedule-${scheduleIdCounter++}`;
  const sched: RunbookSchedule = {
    id,
    taskId,
    schedule,
    enabled: true,
    executionHistory: [],
  };

  schedules.set(id, sched);
  return sched;
}

export function getSchedule(scheduleId: string): RunbookSchedule | null {
  return schedules.get(scheduleId) || null;
}

export function getAllSchedules(): RunbookSchedule[] {
  return Array.from(schedules.values());
}

export function updateSchedule(scheduleId: string, updates: Partial<RunbookSchedule>): RunbookSchedule | null {
  const schedule = schedules.get(scheduleId);
  if (!schedule) return null;

  const updated = { ...schedule, ...updates, id: schedule.id };
  schedules.set(scheduleId, updated);
  return updated;
}

export function deleteSchedule(scheduleId: string): boolean {
  return schedules.delete(scheduleId);
}

export function getExecutionStatistics(): {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDuration: number;
  successRate: number;
  mostUsedRunbooks: Array<{ name: string; count: number }>;
} {
  const allExecutions = Array.from(executions.values());
  const totalExecutions = allExecutions.length;
  const successfulExecutions = allExecutions.filter((e) => e.status === "success").length;
  const failedExecutions = allExecutions.filter((e) => e.status === "failed").length;

  const totalDuration = allExecutions.reduce((sum, e) => sum + (e.duration || 0), 0);
  const averageDuration = totalExecutions > 0 ? totalDuration / totalExecutions : 0;

  const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

  const runbookCounts = new Map<string, number>();
  allExecutions.forEach((e) => {
    runbookCounts.set(e.taskName, (runbookCounts.get(e.taskName) || 0) + 1);
  });

  const mostUsedRunbooks = Array.from(runbookCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalExecutions,
    successfulExecutions,
    failedExecutions,
    averageDuration,
    successRate,
    mostUsedRunbooks,
  };
}

export async function generateRunbookSuggestions(scenario: string): Promise<string[]> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an expert in infrastructure automation and runbook creation. Suggest relevant runbooks for the given scenario.",
      },
      {
        role: "user",
        content: `Suggest runbook names for this scenario: ${scenario}. Return as JSON array of strings.`,
      },
    ],
  });

  const content = response.choices[0]?.message.content;
  if (typeof content === "string") {
    try {
      return JSON.parse(content);
    } catch {
      return [];
    }
  }
  return [];
}

export function exportRunbooks(format: "json" | "yaml" = "json"): string {
  const runbookList = Array.from(runbooks.values());

  if (format === "json") {
    return JSON.stringify(runbookList, null, 2);
  } else {
    // YAML format
    let yaml = "runbooks:\n";
    runbookList.forEach((rb) => {
      yaml += `  - id: ${rb.id}\n`;
      yaml += `    name: ${rb.name}\n`;
      yaml += `    description: ${rb.description}\n`;
      yaml += `    language: ${rb.language}\n`;
      yaml += `    timeout: ${rb.timeout}\n`;
      yaml += `    tags: [${rb.tags.join(", ")}]\n`;
    });
    return yaml;
  }
}

// Initialize default runbooks on module load
initializeDefaultRunbooks();
