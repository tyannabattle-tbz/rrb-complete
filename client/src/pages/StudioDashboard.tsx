import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/lib/trpc';
import { Clock, CheckCircle, AlertCircle, Zap } from 'lucide-react';

export default function StudioDashboard() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<any>(null);

  // Fetch active projects
  const { data: projects, isLoading: projectsLoading } = trpc.productionDashboard.getActiveProjects.useQuery();
  
  // Fetch transcoding queue
  const { data: transcodingQueue } = trpc.productionDashboard.getTranscodingQueue.useQuery();
  
  // Fetch production metrics
  const { data: metrics } = trpc.productionDashboard.getProductionMetrics.useQuery();
  
  // Fetch live monitoring data
  const { data: liveMonitoring } = trpc.productionDashboard.getLiveProjectMonitoring.useQuery(undefined, {
    refetchInterval: 5000, // Refresh every 5 seconds
  });
  
  useEffect(() => {
    if (liveMonitoring) {
      setLiveMetrics(liveMonitoring);
    }
  }, [liveMonitoring]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pre-production':
        return 'bg-blue-500';
      case 'production':
        return 'bg-yellow-500';
      case 'post-production':
        return 'bg-purple-500';
      case 'completed':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Studio Dashboard</h1>
          <p className="text-slate-400">Manage your production projects and workflows</p>
        </div>

        {/* Key Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{metrics.activeProjects}</div>
                <p className="text-xs text-slate-500 mt-1">of {metrics.totalProjects} total</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Budget Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  ${(metrics.totalSpent / 1000).toFixed(0)}K
                </div>
                <p className="text-xs text-slate-500 mt-1">of ${(metrics.totalBudget / 1000).toFixed(0)}K</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{metrics.teamMembers}</div>
                <p className="text-xs text-slate-500 mt-1">across all projects</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">On-Time Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">{metrics.deliveryOnTimePercentage}%</div>
                <p className="text-xs text-slate-500 mt-1">completion rate</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Projects */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Active Projects</CardTitle>
                <CardDescription>Your current production projects</CardDescription>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="text-slate-400">Loading projects...</div>
                ) : (
                  <div className="space-y-4">
                    {projects?.map((project) => (
                      <div
                        key={project.projectId}
                        className="p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-slate-500 cursor-pointer transition"
                        onClick={() => setSelectedProject(project.projectId)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-white font-semibold">{project.name}</h3>
                            <p className="text-sm text-slate-400">{project.format} • {project.duration} min</p>
                          </div>
                          <Badge className={`${getStatusColor(project.status)} text-white`}>
                            {project.status}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Progress</span>
                            <span className="text-white font-medium">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-600">
                          <div>
                            <p className="text-xs text-slate-400">Team Size</p>
                            <p className="text-white font-semibold">{project.teamSize}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Budget</p>
                            <p className="text-white font-semibold">${(project.budget / 1000).toFixed(0)}K</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Spent</p>
                            <p className="text-white font-semibold">${(project.spent / 1000).toFixed(0)}K</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Live Project Monitoring Widget */}
          <div>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Live Monitoring
                </CardTitle>
                <CardDescription>Real-time production metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {liveMetrics ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-slate-700 rounded-lg border border-slate-600">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-white">Queue Position</p>
                        <Badge className="bg-blue-600 text-white">{liveMetrics.queuePosition}</Badge>
                      </div>
                      <p className="text-xs text-slate-400">of {liveMetrics.totalInQueue} jobs</p>
                    </div>
                    
                    <div className="p-3 bg-slate-700 rounded-lg border border-slate-600">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-white">Est. Completion</p>
                        <span className="text-xs text-slate-300">{liveMetrics.estimatedCompletion}</span>
                      </div>
                      <p className="text-xs text-slate-400">~{liveMetrics.estimatedMinutes} minutes</p>
                    </div>
                    
                    <div className="p-3 bg-slate-700 rounded-lg border border-slate-600">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-white">CPU Usage</p>
                        <span className="text-xs text-slate-300">{liveMetrics.cpuUsage}%</span>
                      </div>
                      <Progress value={liveMetrics.cpuUsage} className="h-1.5" />
                    </div>
                    
                    <div className="p-3 bg-slate-700 rounded-lg border border-slate-600">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-white">Memory Usage</p>
                        <span className="text-xs text-slate-300">{liveMetrics.memoryUsage}%</span>
                      </div>
                      <Progress value={liveMetrics.memoryUsage} className="h-1.5" />
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-sm">Loading live metrics...</div>
                )}</CardContent>
            </Card>
          </div>
        </div>

        {/* Transcoding Queue Details */}
        <div className="mt-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                Transcoding Queue Details
              </CardTitle>
              <CardDescription>All active encoding jobs with real-time progress</CardDescription>
            </CardHeader>
            <CardContent>
              {transcodingQueue && transcodingQueue.length > 0 ? (
                <div className="space-y-3">
                  {transcodingQueue.map((job, index) => (
                    <div key={job.jobId} className="p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-slate-500 transition">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-slate-400">Job #{index + 1}</span>
                            <p className="text-sm font-medium text-white">{job.targetFormat}</p>
                          </div>
                          <p className="text-xs text-slate-400">{job.sourceFile}</p>
                        </div>
                        <Badge
                          className={{
                            'completed': 'bg-green-600 text-white',
                            'processing': 'bg-yellow-600 text-white',
                            'queued': 'bg-blue-600 text-white',
                            'failed': 'bg-red-600 text-white',
                          }[job.status] || 'bg-gray-600 text-white'}
                        >
                          {job.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-white font-semibold">{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-600">
                        <div>
                          <p className="text-xs text-slate-400">Speed</p>
                          <p className="text-white text-sm font-semibold">{job.speed}x</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Time Left</p>
                          <p className="text-white text-sm font-semibold">{job.timeRemaining}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Output Size</p>
                          <p className="text-white text-sm font-semibold">{job.outputSize}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Quality</p>
                          <p className="text-white text-sm font-semibold">{job.quality}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2 opacity-50" />
                  <p className="text-slate-400">No active transcoding jobs</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex gap-4">
          <Button className="bg-purple-600 hover:bg-purple-700">
            + New Project
          </Button>
          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
            View All Projects
          </Button>
          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
            Analytics
          </Button>
          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
            Live Monitoring
          </Button>
        </div>
      </div>
    </div>
  );
}
