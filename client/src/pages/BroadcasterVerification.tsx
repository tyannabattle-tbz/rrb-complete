import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  FileText,
  ID,
  Camera,
  Award,
  Trophy,
  Star,
  Zap,
  Users,
  TrendingUp,
  Download,
  Share2,
  X,
} from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
  progress?: number;
  requirement: string;
}

interface VerificationDocument {
  id: string;
  type: 'government_id' | 'selfie' | 'business_license' | 'tax_id';
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  reviewedAt?: string;
  feedback?: string;
}

const BADGES: Badge[] = [
  {
    id: 'verified',
    name: 'Verified Broadcaster',
    description: 'Identity verified and approved',
    icon: '✓',
    earnedAt: '2026-02-15',
    requirement: 'Complete identity verification',
  },
  {
    id: '1k_viewers',
    name: '1K Viewers',
    description: 'Reached 1,000 concurrent viewers',
    icon: '👁️',
    earnedAt: '2026-02-10',
    requirement: '1,000 concurrent viewers',
  },
  {
    id: '100_hours',
    name: '100 Hours Streamed',
    description: 'Streamed for 100+ hours',
    icon: '⏱️',
    earnedAt: '2026-02-08',
    requirement: '100+ hours of streaming',
  },
  {
    id: '5k_subs',
    name: '5K Subscribers',
    description: 'Reached 5,000 subscribers',
    icon: '👥',
    earnedAt: '2026-02-12',
    requirement: '5,000 subscribers',
  },
  {
    id: '10k_subs',
    name: '10K Subscribers',
    description: 'Reached 10,000 subscribers',
    icon: '🏆',
    progress: 52,
    requirement: '10,000 subscribers',
  },
  {
    id: 'partner',
    name: 'Platform Partner',
    description: 'Official platform partner status',
    icon: '🤝',
    progress: 75,
    requirement: '10K subs + 100K monthly views + 6 months active',
  },
  {
    id: 'top_creator',
    name: 'Top Creator',
    description: 'In top 1% of platform creators',
    icon: '⭐',
    progress: 45,
    requirement: 'Top 1% engagement and growth metrics',
  },
  {
    id: 'revenue_milestone',
    name: '$100K Revenue',
    description: 'Generated $100K in revenue',
    icon: '💰',
    progress: 28,
    requirement: '$100,000 total revenue',
  },
];

const VERIFICATION_DOCUMENTS: VerificationDocument[] = [
  {
    id: 'doc_1',
    type: 'government_id',
    status: 'approved',
    uploadedAt: '2026-02-15',
    reviewedAt: '2026-02-15',
  },
  {
    id: 'doc_2',
    type: 'selfie',
    status: 'approved',
    uploadedAt: '2026-02-15',
    reviewedAt: '2026-02-15',
  },
  {
    id: 'doc_3',
    type: 'business_license',
    status: 'pending',
    uploadedAt: '2026-02-18',
  },
];

export function BroadcasterVerification() {
  const [activeTab, setActiveTab] = useState<'overview' | 'verification' | 'badges' | 'leaderboard'>(
    'overview'
  );
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string>('');

  const verifiedBadges = BADGES.filter((b) => b.earnedAt);
  const inProgressBadges = BADGES.filter((b) => b.progress);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black bg-opacity-50 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">Broadcaster Verification & Badges</h1>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-900 bg-opacity-30 border border-green-700 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold">Verified</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'verification', label: 'Verification' },
              { id: 'badges', label: 'Badges' },
              { id: 'leaderboard', label: 'Leaderboard' },
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
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Verification Status */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Verification Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-green-900 to-green-800 rounded-lg border border-green-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-300 text-sm">Identity Verified</p>
                      <p className="text-white font-semibold mt-2">Approved</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-green-200 text-xs mt-3">Verified on Feb 15, 2026</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-lg border border-yellow-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-300 text-sm">Business License</p>
                      <p className="text-white font-semibold mt-2">Under Review</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-400" />
                  </div>
                  <p className="text-yellow-200 text-xs mt-3">Submitted on Feb 18, 2026</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg border border-blue-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-300 text-sm">Verification Score</p>
                      <p className="text-white font-semibold mt-2">95/100</p>
                    </div>
                    <Star className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-blue-200 text-xs mt-3">Excellent standing</p>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gray-800 border-gray-700 p-4">
                <p className="text-gray-400 text-sm">Earned Badges</p>
                <p className="text-3xl font-bold text-white mt-2">{verifiedBadges.length}</p>
              </Card>
              <Card className="bg-gray-800 border-gray-700 p-4">
                <p className="text-gray-400 text-sm">In Progress</p>
                <p className="text-3xl font-bold text-white mt-2">{inProgressBadges.length}</p>
              </Card>
              <Card className="bg-gray-800 border-gray-700 p-4">
                <p className="text-gray-400 text-sm">Verification Level</p>
                <p className="text-3xl font-bold text-white mt-2">Advanced</p>
              </Card>
              <Card className="bg-gray-800 border-gray-700 p-4">
                <p className="text-gray-400 text-sm">Trust Score</p>
                <p className="text-3xl font-bold text-white mt-2">98%</p>
              </Card>
            </div>

            {/* Recent Badges */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Recent Badges Earned</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {verifiedBadges.slice(0, 4).map((badge) => (
                  <div
                    key={badge.id}
                    className="p-4 bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-lg border border-yellow-700"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-2xl">{badge.icon}</p>
                        <p className="text-white font-semibold mt-2">{badge.name}</p>
                        <p className="text-yellow-200 text-sm mt-1">{badge.description}</p>
                      </div>
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <p className="text-yellow-300 text-xs mt-3">Earned: {badge.earnedAt}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Verification Tab */}
        {activeTab === 'verification' && (
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Verification Documents</h2>

              <div className="space-y-4">
                {VERIFICATION_DOCUMENTS.map((doc) => (
                  <div key={doc.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {doc.type === 'government_id' && <ID className="w-5 h-5 text-blue-400 mt-1" />}
                        {doc.type === 'selfie' && <Camera className="w-5 h-5 text-purple-400 mt-1" />}
                        {doc.type === 'business_license' && <FileText className="w-5 h-5 text-green-400 mt-1" />}

                        <div>
                          <p className="text-white font-semibold capitalize">
                            {doc.type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-gray-400 text-sm mt-1">Uploaded: {doc.uploadedAt}</p>
                          {doc.reviewedAt && (
                            <p className="text-gray-400 text-sm">Reviewed: {doc.reviewedAt}</p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        {doc.status === 'approved' && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-green-900 bg-opacity-30 border border-green-700 rounded">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-sm font-semibold">Approved</span>
                          </div>
                        )}
                        {doc.status === 'pending' && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded">
                            <Clock className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-400 text-sm font-semibold">Pending</span>
                          </div>
                        )}
                        {doc.status === 'rejected' && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-red-900 bg-opacity-30 border border-red-700 rounded">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 text-sm font-semibold">Rejected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => setShowUploadModal(true)}
                className="mt-6 w-full bg-orange-600 hover:bg-orange-700 gap-2"
              >
                <Upload className="w-4 h-4" /> Upload New Document
              </Button>
            </Card>

            {/* Verification Requirements */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Verification Requirements</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-700 rounded">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Government-issued ID</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-700 rounded">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Selfie verification</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-700 rounded">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">Business license (in review)</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-700 rounded">
                  <AlertCircle className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-400">Tax ID (optional)</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-6">All Available Badges</h2>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Earned Badges</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {verifiedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="p-4 bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-lg border border-yellow-700 text-center"
                    >
                      <p className="text-4xl mb-2">{badge.icon}</p>
                      <p className="text-white font-semibold text-sm">{badge.name}</p>
                      <p className="text-yellow-200 text-xs mt-2">{badge.description}</p>
                      <p className="text-yellow-300 text-xs mt-3 font-semibold">✓ Earned {badge.earnedAt}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">In Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {inProgressBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="p-4 bg-gradient-to-br from-gray-700 to-gray-600 rounded-lg border border-gray-600"
                    >
                      <p className="text-4xl mb-2 opacity-50">{badge.icon}</p>
                      <p className="text-white font-semibold text-sm">{badge.name}</p>
                      <p className="text-gray-300 text-xs mt-2">{badge.description}</p>
                      <div className="mt-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-400 text-xs">Progress</span>
                          <span className="text-white text-xs font-semibold">{badge.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"
                            style={{ width: `${badge.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs mt-2">{badge.requirement}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Top Verified Broadcasters</h2>

              <div className="space-y-3">
                {[
                  { rank: 1, name: 'Luna Stream', badges: 12, subscribers: 125000, verified: true },
                  { rank: 2, name: 'Tech Guru', badges: 11, subscribers: 98500, verified: true },
                  { rank: 3, name: 'Creative Mind', badges: 10, subscribers: 87200, verified: true },
                  { rank: 4, name: 'You', badges: 5, subscribers: 5200, verified: true },
                  { rank: 5, name: 'Rising Star', badges: 4, subscribers: 3800, verified: true },
                ].map((broadcaster) => (
                  <div
                    key={broadcaster.rank}
                    className={`p-4 rounded-lg border ${
                      broadcaster.rank === 4
                        ? 'bg-gradient-to-r from-orange-900 to-orange-800 border-orange-700'
                        : 'bg-gray-700 border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            broadcaster.rank === 1
                              ? 'bg-yellow-500 text-black'
                              : broadcaster.rank === 2
                              ? 'bg-gray-400 text-black'
                              : broadcaster.rank === 3
                              ? 'bg-orange-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {broadcaster.rank}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{broadcaster.name}</p>
                          <p className="text-gray-400 text-sm">
                            {broadcaster.subscribers.toLocaleString()} subscribers
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          {[...Array(broadcaster.badges)].map((_, i) => (
                            <span key={i} className="text-lg">
                              ⭐
                            </span>
                          ))}
                        </div>
                        <p className="text-gray-400 text-sm">{broadcaster.badges} badges</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="bg-gray-800 border-gray-700 p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Upload Document</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUploadModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm font-semibold">Document Type</label>
                <select className="w-full mt-2 bg-gray-700 border border-gray-600 text-white rounded px-3 py-2">
                  <option>Government ID</option>
                  <option>Selfie</option>
                  <option>Business License</option>
                  <option>Tax ID</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-300 text-sm">Drag and drop or click to upload</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button className="flex-1 bg-orange-600 hover:bg-orange-700">Upload</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
