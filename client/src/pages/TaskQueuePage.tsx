import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  ListTodo,
  TrendingUp
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  createdAt: string;
  estimatedCompletion: string;
  assignedTo: string;
}

export default function TaskQueuePage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Schedule Daily Broadcasts',
      description: 'Schedule all daily radio broadcasts across RRB channels',
      status: 'running',
      priority: 'high',
      progress: 65,
      createdAt: '2026-03-04 08:00',
      estimatedCompletion: '2026-03-04 09:30',
      assignedTo: 'QUMUS Core',
    },
    {
      id: '2',
      title: 'Process Listener Feedback',
      description: 'Analyze and process listener feedback from all platforms',
      status: 'pending',
      priority: 'medium',
      progress: 0,
      createdAt: '2026-03-04 10:00',
      estimatedCompletion: '2026-03-04 12:00',
      assignedTo: 'QUMUS Core',
    },
    {
      id: '3',
      title: 'Generate Daily Reports',
      description: 'Generate analytics and performance reports',
      status: 'completed',
      priority: 'medium',
      progress: 100,
      createdAt: '2026-03-04 06:00',
      estimatedCompletion: '2026-03-04 07:00',
      assignedTo: 'QUMUS Core',
    },
    {
      id: '4',
      title: 'Update Emergency Alerts',
      description: 'Update HybridCast emergency alert database',
      status: 'pending',
      priority: 'high',
      progress: 0,
      createdAt: '2026-03-04 09:00',
      estimatedCompletion: '2026-03-04 11:00',
      assignedTo: 'HybridCast System',
    },
    {
      id: '5',
      title: 'Optimize Database Queries',
      description: 'Optimize slow database queries for better performance',
      status: 'failed',
      priority: 'low',
      progress: 30,
      createdAt: '2026-03-03 14:00',
      estimatedCompletion: '2026-03-04 10:00',
      assignedTo: 'QUMUS Core',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'running' | 'completed' | 'failed'>('all');

  const filteredTasks = tasks.filter(task => 
    filterStatus === 'all' || task.status === filterStatus
  );

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    running: tasks.filter(t => t.status === 'running').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length,
  };

  const handlePlayTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: 'running' as const } : t));
  };

  const handlePauseTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: 'pending' as const } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ListTodo className="w-8 h-8 text-purple-400" />
          <h1 className="text-4xl font-bold text-white">Task Queue</h1>
        </div>
        <p className="text-purple-300">Monitor and manage autonomous system tasks</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-slate-400">Total Tasks</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
              <p className="text-sm text-slate-400">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{stats.running}</p>
              <p className="text-sm text-slate-400">Running</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-green-500/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
              <p className="text-sm text-slate-400">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-red-500/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
              <p className="text-sm text-slate-400">Failed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="bg-slate-800 border border-slate-700 text-white rounded-md px-4 py-2"
        >
          <option value="all">All Tasks</option>
          <option value="pending">Pending</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card
            key={task.id}
            className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/50 transition-all"
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(task.status)}
                    <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                    <Badge
                      className={`${
                        task.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : task.status === 'running'
                          ? 'bg-blue-500/20 text-blue-400'
                          : task.status === 'failed'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {task.status}
                    </Badge>
                    <Badge
                      className={`${
                        task.priority === 'high'
                          ? 'bg-red-500/20 text-red-400'
                          : task.priority === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-sm mb-3">{task.description}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          task.status === 'completed'
                            ? 'bg-green-500'
                            : task.status === 'running'
                            ? 'bg-blue-500'
                            : task.status === 'failed'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                        }`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3 text-xs text-slate-400">
                    <div>
                      <span className="text-slate-500">Created:</span> {task.createdAt}
                    </div>
                    <div>
                      <span className="text-slate-500">Est. Completion:</span> {task.estimatedCompletion}
                    </div>
                    <div>
                      <span className="text-slate-500">Assigned to:</span> {task.assignedTo}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {task.status === 'pending' && (
                    <Button
                      onClick={() => handlePlayTask(task.id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                  {task.status === 'running' && (
                    <Button
                      onClick={() => handlePauseTask(task.id)}
                      size="sm"
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDeleteTask(task.id)}
                    size="sm"
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-600/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="text-center py-12">
            <ListTodo className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <p className="text-slate-400">No tasks found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
