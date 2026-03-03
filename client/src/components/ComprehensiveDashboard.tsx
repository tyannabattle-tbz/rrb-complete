import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Users, Activity, FileText, MapPin, TrendingUp, Settings, Mic, Volume2, 
  MessageSquare, Eye, Download, Share2, AlertCircle, CheckCircle, Clock, Zap 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { voiceService } from '@/lib/voiceService';
import { toast } from 'sonner';

interface DashboardTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const TABS: DashboardTab[] = [
  { id: 'admin', label: 'Admin', icon: <Settings className="w-4 h-4" /> },
  { id: 'user', label: 'User', icon: <Users className="w-4 h-4" /> },
  { id: 'team', label: 'Team', icon: <Activity className="w-4 h-4" /> },
  { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
];

// Sample data
const activityData = [
  { time: '00:00', users: 120, files: 45, locations: 12 },
  { time: '04:00', users: 132, files: 52, locations: 15 },
  { time: '08:00', users: 101, files: 38, locations: 8 },
  { time: '12:00', users: 198, files: 78, locations: 22 },
  { time: '16:00', users: 221, files: 92, locations: 28 },
  { time: '20:00', users: 250, files: 110, locations: 35 },
];

const fileTypeData = [
  { name: 'PDF', value: 35, color: '#ef4444' },
  { name: 'Images', value: 28, color: '#f59e0b' },
  { name: 'Audio', value: 22, color: '#3b82f6' },
  { name: 'Documents', value: 15, color: '#10b981' },
];

const teamMembers = [
  { id: 1, name: 'Alice Johnson', role: 'Admin', status: 'active', lastActive: '2 min ago' },
  { id: 2, name: 'Bob Smith', role: 'User', status: 'active', lastActive: '5 min ago' },
  { id: 3, name: 'Carol White', role: 'User', status: 'idle', lastActive: '15 min ago' },
  { id: 4, name: 'David Brown', role: 'Moderator', status: 'active', lastActive: '1 min ago' },
];

export function ComprehensiveDashboard() {
  const [activeTab, setActiveTab] = useState('admin');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 1250,
    activeNow: 342,
    filesAnalyzed: 5847,
    locationsShared: 892,
    chatMessages: 12543,
    avgResponseTime: 1.2,
  });

  useEffect(() => {
    // Setup voice commands
    voiceService.registerCommand('admin', () => setActiveTab('admin'));
    voiceService.registerCommand('user', () => setActiveTab('user'));
    voiceService.registerCommand('team', () => setActiveTab('team'));
    voiceService.registerCommand('analytics', () => setActiveTab('analytics'));
    voiceService.registerCommand('export', () => handleExport());
    voiceService.registerCommand('refresh', () => handleRefresh());

    voiceService.onTranscriptChange((text, isFinal) => {
      setVoiceTranscript(text);
      if (isFinal) {
        toast.success(`Voice command: ${text}`);
      }
    });

    voiceService.onVoiceError((error) => {
      toast.error(`Voice error: ${error}`);
    });

    return () => {
      voiceService.clearCommands();
    };
  }, []);

  const handleVoiceToggle = () => {
    if (isVoiceActive) {
      voiceService.stopListening();
      setIsVoiceActive(false);
    } else {
      voiceService.startListening({ continuous: true, interimResults: true });
      setIsVoiceActive(true);
      voiceService.speak('Voice mode activated. Say a command.');
    }
  };

  const handleExport = () => {
    toast.success('Dashboard data exported');
    voiceService.speak('Dashboard data has been exported');
  };

  const handleRefresh = () => {
    toast.success('Dashboard refreshed');
    voiceService.speak('Dashboard data refreshed');
  };

  const renderAdminSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Users</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active Now</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeNow}</p>
            </div>
            <Activity className="w-8 h-8 text-green-400" />
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">System Health</p>
              <p className="text-3xl font-bold text-purple-600">99.8%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-400" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">System Activity (24h)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="users" stroke="#3b82f6" name="Users" />
            <Line type="monotone" dataKey="files" stroke="#10b981" name="Files Analyzed" />
            <Line type="monotone" dataKey="locations" stroke="#f59e0b" name="Locations Shared" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );

  const renderUserSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Files Analyzed</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.filesAnalyzed}</p>
            </div>
            <FileText className="w-8 h-8 text-indigo-400" />
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-pink-50 to-pink-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Locations Shared</p>
              <p className="text-3xl font-bold text-pink-600">{stats.locationsShared}</p>
            </div>
            <MapPin className="w-8 h-8 text-pink-400" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">File Analysis Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={fileTypeData} cx="50%" cy="50%" labelLine={false} label>
              {fileTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
            <FileText className="w-5 h-5 text-blue-500" />
            <div className="flex-1">
              <p className="font-medium">PDF Analysis Complete</p>
              <p className="text-xs text-slate-500">5 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
            <MapPin className="w-5 h-5 text-green-500" />
            <div className="flex-1">
              <p className="font-medium">Location Shared with Team</p>
              <p className="text-xs text-slate-500">12 minutes ago</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderTeamSection = () => (
    <div className="space-y-6">
      <Card className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Team Members</p>
            <p className="text-3xl font-bold text-cyan-600">{teamMembers.length}</p>
          </div>
          <Users className="w-8 h-8 text-cyan-400" />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Team Members</h3>
        <div className="space-y-3">
          {teamMembers.map(member => (
            <div key={member.id} className="flex items-center justify-between p-3 border border-slate-200 rounded">
              <div className="flex-1">
                <p className="font-medium">{member.name}</p>
                <p className="text-xs text-slate-500">{member.role}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-xs text-slate-600">{member.lastActive}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Shared Locations</h3>
        <div className="space-y-2">
          <p className="text-sm text-slate-600">Total shared locations: 45</p>
          <p className="text-sm text-slate-600">Active shares: 12</p>
          <p className="text-sm text-slate-600">Team coverage: 89%</p>
        </div>
      </Card>
    </div>
  );

  const renderAnalyticsSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Chat Messages</p>
              <p className="text-3xl font-bold text-orange-600">{stats.chatMessages}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-orange-400" />
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Avg Response Time</p>
              <p className="text-3xl font-bold text-red-600">{stats.avgResponseTime}s</p>
            </div>
            <Clock className="w-8 h-8 text-red-400" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Usage Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="users" fill="#3b82f6" name="Users" />
            <Bar dataKey="files" fill="#10b981" name="Files" />
            <Bar dataKey="locations" fill="#f59e0b" name="Locations" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Key Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 rounded">
            <p className="text-xs text-slate-600">Peak Hours</p>
            <p className="text-lg font-bold">18:00 - 22:00</p>
          </div>
          <div className="p-3 bg-slate-50 rounded">
            <p className="text-xs text-slate-600">Avg Session</p>
            <p className="text-lg font-bold">24 min</p>
          </div>
          <div className="p-3 bg-slate-50 rounded">
            <p className="text-xs text-slate-600">Conversion Rate</p>
            <p className="text-lg font-bold">3.2%</p>
          </div>
          <div className="p-3 bg-slate-50 rounded">
            <p className="text-xs text-slate-600">Retention</p>
            <p className="text-lg font-bold">87%</p>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">QUMUS Dashboard</h1>
              <p className="text-sm text-slate-500">Comprehensive system monitoring and analytics</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleVoiceToggle}
                variant={isVoiceActive ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
              >
                {isVoiceActive ? (
                  <>
                    <Volume2 className="w-4 h-4 animate-pulse" />
                    Voice Active
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Voice Control
                  </>
                )}
              </Button>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                Refresh
              </Button>
              <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-200">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Transcript Display */}
        {voiceTranscript && (
          <div className="max-w-7xl mx-auto px-4 py-2 bg-blue-50 border-t border-blue-200">
            <p className="text-sm text-blue-700">
              <Mic className="w-4 h-4 inline mr-2" />
              {voiceTranscript}
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'admin' && renderAdminSection()}
        {activeTab === 'user' && renderUserSection()}
        {activeTab === 'team' && renderTeamSection()}
        {activeTab === 'analytics' && renderAnalyticsSection()}
      </div>
    </div>
  );
}
