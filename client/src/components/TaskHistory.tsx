import React, { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ChevronDown, ChevronUp, Search, Filter, Download } from 'lucide-react';

interface TaskLog {
  id: string;
  goal: string;
  status: 'completed' | 'failed' | 'executing' | 'queued';
  priority: number;
  startedAt: Date;
  completedAt?: Date;
  executionTime: number;
  result?: string;
  error?: string;
  steps: number;
  completedSteps: number;
}

interface TaskHistoryProps {
  tasks?: TaskLog[];
  isLoading?: boolean;
}

export function TaskHistory({ tasks = [], isLoading = false }: TaskHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'time'>('date');

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter((task) => {
      const matchesSearch =
        task.goal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return b.priority - a.priority;
        case 'time':
          return b.executionTime - a.executionTime;
        case 'date':
        default:
          return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
      }
    });
  }, [tasks, searchQuery, filterStatus, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900 text-green-200';
      case 'failed':
        return 'bg-red-900 text-red-200';
      case 'executing':
        return 'bg-blue-900 text-blue-200';
      case 'queued':
        return 'bg-yellow-900 text-yellow-200';
      default:
        return 'bg-slate-700 text-slate-200';
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className="space-y-4">
      {/* Header with Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-bold text-white">Task History</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-slate-300 border-slate-600 hover:bg-slate-800"
            onClick={() => {
              const csv = generateCSV(filteredAndSortedTasks);
              downloadCSV(csv);
            }}
          >
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-slate-500" />
          <Input
            placeholder="Search tasks by goal or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="executing">Executing</option>
            <option value="queued">Queued</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="time">Sort by Execution Time</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-8 text-slate-400">Loading tasks...</div>
        ) : filteredAndSortedTasks.length === 0 ? (
          <div className="text-center py-8 text-slate-400">No tasks found</div>
        ) : (
          filteredAndSortedTasks.map((task) => (
            <Card
              key={task.id}
              className="bg-slate-800/50 border-slate-700 p-4 hover:bg-slate-800/70 transition-colors cursor-pointer"
              onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
            >
              {/* Task Summary */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                    <span className="text-xs text-slate-400">Priority {task.priority}</span>
                  </div>
                  <p className="text-white font-medium truncate">{task.goal}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {task.startedAt.toLocaleString()} • {formatTime(task.executionTime)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm text-slate-400">
                      {task.completedSteps}/{task.steps} steps
                    </div>
                    <div className="w-20 h-2 bg-slate-700 rounded-full mt-1">
                      <div
                        className="h-2 bg-blue-500 rounded-full transition-all"
                        style={{
                          width: `${(task.completedSteps / task.steps) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {expandedId === task.id ? (
                    <ChevronUp size={20} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={20} className="text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === task.id && (
                <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-slate-400">Task ID</span>
                      <p className="text-sm text-white font-mono">{task.id}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Execution Time</span>
                      <p className="text-sm text-white">{formatTime(task.executionTime)}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Started</span>
                      <p className="text-sm text-white">{task.startedAt.toLocaleString()}</p>
                    </div>
                    {task.completedAt && (
                      <div>
                        <span className="text-xs text-slate-400">Completed</span>
                        <p className="text-sm text-white">{task.completedAt.toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {task.result && (
                    <div>
                      <span className="text-xs text-slate-400">Result</span>
                      <p className="text-sm text-green-400 mt-1">{task.result}</p>
                    </div>
                  )}

                  {task.error && (
                    <div>
                      <span className="text-xs text-slate-400">Error</span>
                      <p className="text-sm text-red-400 mt-1">{task.error}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => console.log('Retry task:', task.id)}
                    >
                      Retry
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-slate-300 border-slate-600 hover:bg-slate-700"
                      onClick={() => console.log('View logs:', task.id)}
                    >
                      View Logs
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {filteredAndSortedTasks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-4">
          <Card className="bg-slate-800/50 border-slate-700 p-3">
            <span className="text-xs text-slate-400">Total Tasks</span>
            <p className="text-lg font-bold text-white">{filteredAndSortedTasks.length}</p>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-3">
            <span className="text-xs text-slate-400">Completed</span>
            <p className="text-lg font-bold text-green-400">
              {filteredAndSortedTasks.filter((t) => t.status === 'completed').length}
            </p>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-3">
            <span className="text-xs text-slate-400">Failed</span>
            <p className="text-lg font-bold text-red-400">
              {filteredAndSortedTasks.filter((t) => t.status === 'failed').length}
            </p>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-3">
            <span className="text-xs text-slate-400">Avg Time</span>
            <p className="text-lg font-bold text-blue-400">
              {formatTime(
                filteredAndSortedTasks.reduce((sum, t) => sum + t.executionTime, 0) /
                  filteredAndSortedTasks.length
              )}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}

function generateCSV(tasks: TaskLog[]): string {
  const headers = ['ID', 'Goal', 'Status', 'Priority', 'Started', 'Completed', 'Execution Time', 'Result', 'Error'];
  const rows = tasks.map((task) => [
    task.id,
    task.goal,
    task.status,
    task.priority,
    task.startedAt.toISOString(),
    task.completedAt?.toISOString() || '',
    task.executionTime,
    task.result || '',
    task.error || '',
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  return csv;
}

function downloadCSV(csv: string) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `task-history-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}
