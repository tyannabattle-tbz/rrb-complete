import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Shield,
  AlertTriangle,
  Ban,
  Clock,
  MessageSquare,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Flag,
  User,
  Calendar,
  MoreVertical,
  Zap,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

interface ModerationCase {
  id: string;
  userId: string;
  userName: string;
  action: 'spam' | 'harassment' | 'hate_speech' | 'misinformation' | 'explicit' | 'other';
  content: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected' | 'banned';
  aiScore: number;
  moderatorNotes?: string;
  resolution?: string;
}

interface BannedUser {
  id: string;
  userId: string;
  userName: string;
  reason: string;
  bannedAt: string;
  duration: 'temporary' | 'permanent';
  expiresAt?: string;
  violations: number;
}

const MODERATION_CASES: ModerationCase[] = [
  {
    id: 'case_1',
    userId: 'user_123',
    userName: 'TrollAccount',
    action: 'spam',
    content: 'BUY NOW!!! CLICK HERE!!! FREE MONEY!!!',
    timestamp: '2026-02-19 23:45',
    status: 'pending',
    aiScore: 0.98,
    moderatorNotes: 'Clear spam pattern',
  },
  {
    id: 'case_2',
    userId: 'user_456',
    userName: 'HappyViewer',
    action: 'other',
    content: 'Great stream! Love the content!',
    timestamp: '2026-02-19 23:40',
    status: 'approved',
    aiScore: 0.02,
    resolution: 'Auto-approved - positive content',
  },
  {
    id: 'case_3',
    userId: 'user_789',
    userName: 'AngryUser',
    action: 'harassment',
    content: 'You suck! Everyone hates you!',
    timestamp: '2026-02-19 23:35',
    status: 'pending',
    aiScore: 0.87,
    moderatorNotes: 'Potential harassment',
  },
  {
    id: 'case_4',
    userId: 'user_321',
    userName: 'MisleadingSource',
    action: 'misinformation',
    content: 'The earth is flat and controlled by aliens',
    timestamp: '2026-02-19 23:30',
    status: 'rejected',
    aiScore: 0.92,
    resolution: 'Removed - misinformation',
  },
  {
    id: 'case_5',
    userId: 'user_654',
    userName: 'ExplicitUser',
    action: 'explicit',
    content: '[Explicit content removed]',
    timestamp: '2026-02-19 23:25',
    status: 'rejected',
    aiScore: 0.95,
    resolution: 'Auto-removed - explicit content',
  },
];

const BANNED_USERS: BannedUser[] = [
  {
    id: 'ban_1',
    userId: 'user_999',
    userName: 'SerialSpammer',
    reason: 'Repeated spam violations',
    bannedAt: '2026-02-18',
    duration: 'permanent',
    violations: 12,
  },
  {
    id: 'ban_2',
    userId: 'user_888',
    userName: 'TempBanned',
    reason: 'Harassment',
    bannedAt: '2026-02-19',
    duration: 'temporary',
    expiresAt: '2026-02-26',
    violations: 3,
  },
];

const ACTION_TYPES = [
  { value: 'spam', label: '🚫 Spam', color: 'bg-red-900' },
  { value: 'harassment', label: '😠 Harassment', color: 'bg-orange-900' },
  { value: 'hate_speech', label: '💔 Hate Speech', color: 'bg-red-950' },
  { value: 'misinformation', label: '❌ Misinformation', color: 'bg-yellow-900' },
  { value: 'explicit', label: '🔞 Explicit', color: 'bg-purple-900' },
  { value: 'other', label: '❓ Other', color: 'bg-gray-700' },
];

export function ModerationDashboard() {
  const [activeTab, setActiveTab] = useState<'queue' | 'banned' | 'analytics'>('queue');
  const [selectedCase, setSelectedCase] = useState<ModerationCase | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const pendingCases = MODERATION_CASES.filter((c) => c.status === 'pending');
  const approvedCases = MODERATION_CASES.filter((c) => c.status === 'approved');
  const rejectedCases = MODERATION_CASES.filter((c) => c.status === 'rejected');

  const filteredCases = MODERATION_CASES.filter((c) => {
    const matchesSearch =
      c.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = !filterAction || c.action === filterAction;
    const matchesStatus = !filterStatus || c.status === filterStatus;
    return matchesSearch && matchesAction && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black bg-opacity-50 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Shield className="w-8 h-8 text-orange-500" /> Moderation Dashboard
            </h1>
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-900 bg-opacity-30 border border-orange-700 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <span className="text-orange-400 font-semibold">{pendingCases.length} Pending</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            {[
              { id: 'queue', label: 'Moderation Queue' },
              { id: 'banned', label: 'Banned Users' },
              { id: 'analytics', label: 'Analytics' },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Queue Tab */}
        {activeTab === 'queue' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gray-800 border-gray-700 p-4">
                <p className="text-gray-400 text-sm">Pending Review</p>
                <p className="text-3xl font-bold text-orange-400 mt-2">{pendingCases.length}</p>
              </Card>
              <Card className="bg-gray-800 border-gray-700 p-4">
                <p className="text-gray-400 text-sm">Approved Today</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{approvedCases.length}</p>
              </Card>
              <Card className="bg-gray-800 border-gray-700 p-4">
                <p className="text-gray-400 text-sm">Rejected Today</p>
                <p className="text-3xl font-bold text-red-400 mt-2">{rejectedCases.length}</p>
              </Card>
              <Card className="bg-gray-800 border-gray-700 p-4">
                <p className="text-gray-400 text-sm">AI Accuracy</p>
                <p className="text-3xl font-bold text-blue-400 mt-2">94%</p>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card className="bg-gray-800 border-gray-700 p-4">
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by username or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 pl-10"
                  />
                </div>
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white rounded px-3 py-2"
                >
                  <option value="">All Actions</option>
                  {ACTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white rounded px-3 py-2"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </Card>

            {/* Cases List */}
            <div className="space-y-3">
              {filteredCases.map((caseItem) => (
                <Card
                  key={caseItem.id}
                  className={`border-l-4 p-4 cursor-pointer hover:bg-gray-750 transition ${
                    caseItem.status === 'pending'
                      ? 'bg-gray-800 border-gray-700 border-l-orange-500'
                      : caseItem.status === 'approved'
                      ? 'bg-gray-800 border-gray-700 border-l-green-500'
                      : 'bg-gray-800 border-gray-700 border-l-red-500'
                  }`}
                  onClick={() => setSelectedCase(caseItem)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-white font-semibold">{caseItem.userName}</span>
                        <span className={`text-xs px-2 py-1 rounded ${ACTION_TYPES.find((t) => t.value === caseItem.action)?.color}`}>
                          {ACTION_TYPES.find((t) => t.value === caseItem.action)?.label}
                        </span>
                        <span className="text-gray-400 text-xs">{caseItem.timestamp}</span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2 line-clamp-2">{caseItem.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>AI Score: {(caseItem.aiScore * 100).toFixed(0)}%</span>
                        {caseItem.status === 'pending' && <span className="text-orange-400">⏳ Awaiting review</span>}
                        {caseItem.status === 'approved' && <span className="text-green-400">✓ Approved</span>}
                        {caseItem.status === 'rejected' && <span className="text-red-400">✗ Rejected</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {caseItem.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline" className="text-green-400 border-green-700 hover:bg-green-900">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-400 border-red-700 hover:bg-red-900">
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Banned Users Tab */}
        {activeTab === 'banned' && (
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Banned Users</h2>
              <div className="space-y-3">
                {BANNED_USERS.map((user) => (
                  <div key={user.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-semibold">{user.userName}</p>
                        <p className="text-gray-400 text-sm mt-1">Reason: {user.reason}</p>
                        <p className="text-gray-500 text-xs mt-2">
                          Violations: {user.violations} | Banned: {user.bannedAt}
                        </p>
                        {user.duration === 'temporary' && user.expiresAt && (
                          <p className="text-yellow-400 text-xs mt-1">Expires: {user.expiresAt}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded text-sm font-semibold ${
                            user.duration === 'permanent'
                              ? 'bg-red-900 text-red-200'
                              : 'bg-yellow-900 text-yellow-200'
                          }`}
                        >
                          {user.duration === 'permanent' ? '🔒 Permanent' : '⏰ Temporary'}
                        </span>
                        <Button size="sm" variant="outline" className="text-red-400 border-red-700">
                          <Ban className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Violation Breakdown</h3>
                <div className="space-y-3">
                  {ACTION_TYPES.map((type) => {
                    const count = MODERATION_CASES.filter((c) => c.action === type.value).length;
                    return (
                      <div key={type.value}>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-300">{type.label}</span>
                          <span className="text-white font-semibold">{count}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${type.color}`}
                            style={{ width: `${(count / MODERATION_CASES.length) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="bg-gray-800 border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Moderation Performance</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-900 to-green-800 rounded-lg border border-green-700">
                    <p className="text-green-300 text-sm">Auto-Moderation Success</p>
                    <p className="text-white font-bold text-2xl mt-2">94%</p>
                    <p className="text-green-200 text-xs mt-2">AI correctly identified violations</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg border border-blue-700">
                    <p className="text-blue-300 text-sm">Average Review Time</p>
                    <p className="text-white font-bold text-2xl mt-2">2.3 min</p>
                    <p className="text-blue-200 text-xs mt-2">Per moderation case</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-900 to-purple-800 rounded-lg border border-purple-700">
                    <p className="text-purple-300 text-sm">False Positive Rate</p>
                    <p className="text-white font-bold text-2xl mt-2">3.2%</p>
                    <p className="text-purple-200 text-xs mt-2">Incorrectly flagged content</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Moderation Trends</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-700 rounded-lg">
                  <p className="text-gray-300 text-sm">Cases This Week</p>
                  <p className="text-white font-bold text-3xl mt-2">142</p>
                  <p className="text-green-400 text-xs mt-2">↑ 12% from last week</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <p className="text-gray-300 text-sm">Avg Cases/Hour</p>
                  <p className="text-white font-bold text-3xl mt-2">8.4</p>
                  <p className="text-yellow-400 text-xs mt-2">Peak: 15 cases/hour</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <p className="text-gray-300 text-sm">Active Moderators</p>
                  <p className="text-white font-bold text-3xl mt-2">12</p>
                  <p className="text-blue-400 text-xs mt-2">24/7 coverage</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
