import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/_core/hooks/useAuth';

interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  joinDate: Date;
  subscriptionTier: 'free' | 'bronze' | 'silver' | 'gold' | 'platinum';
  totalDonations: number;
  contentUploads: number;
  lastActive: Date;
}

interface Activity {
  id: string;
  type: 'upload' | 'donation' | 'comment' | 'share';
  description: string;
  timestamp: Date;
  details?: string;
}

export default function ClientPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'donations' | 'content' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);

  // Mock user data - in production this would come from tRPC
  const [profile, setProfile] = useState<ClientProfile>({
    id: user?.id || 'user-123',
    name: user?.name || 'Client Name',
    email: user?.email || 'client@example.com',
    phone: '+1 (555) 123-4567',
    joinDate: new Date('2024-01-15'),
    subscriptionTier: 'gold',
    totalDonations: 2500,
    contentUploads: 12,
    lastActive: new Date(),
  });

  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'donation',
      description: 'Donated to Sweet Miracles',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      details: '$250 Gold Tier Donation',
    },
    {
      id: '2',
      type: 'upload',
      description: 'Uploaded audio content',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      details: 'Legacy Recording - Side A',
    },
    {
      id: '3',
      type: 'comment',
      description: 'Left a review',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      details: 'Commented on Rockin\' Boogie Episode 5',
    },
  ]);

  const getTierColor = (tier: string) => {
    const colors: { [key: string]: string } = {
      free: 'from-gray-500 to-gray-600',
      bronze: 'from-amber-700 to-amber-800',
      silver: 'from-slate-400 to-slate-500',
      gold: 'from-yellow-500 to-yellow-600',
      platinum: 'from-purple-500 to-purple-600',
    };
    return colors[tier] || colors.free;
  };

  const getTierBenefits = (tier: string) => {
    const benefits: { [key: string]: string[] } = {
      free: ['Basic access', 'Limited uploads', 'Community features'],
      bronze: ['All Free features', '10 uploads/month', 'Priority support'],
      silver: ['All Bronze features', '50 uploads/month', 'Analytics dashboard'],
      gold: ['All Silver features', 'Unlimited uploads', 'Custom branding', 'Advanced analytics'],
      platinum: ['All Gold features', 'Dedicated support', 'API access', 'White-label options'],
    };
    return benefits[tier] || [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
            👥 Client Portal
          </h1>
          <p className="text-gray-300">Manage your account, donations, and content</p>
        </div>

        {/* Profile Card */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-blue-500/50 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-4xl">
                👤
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-grow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{profile.name}</h2>
                  <p className="text-gray-400 mb-2">{profile.email}</p>
                  {profile.phone && <p className="text-gray-400">{profile.phone}</p>}
                </div>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {isEditing ? 'Done' : 'Edit Profile'}
                </Button>
              </div>

              {/* Subscription Tier */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-400">Subscription Tier:</span>
                  <span className={`bg-gradient-to-r ${getTierColor(profile.subscriptionTier)} text-white px-4 py-1 rounded-full font-bold capitalize`}>
                    {profile.subscriptionTier}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">${profile.totalDonations}</div>
                  <div className="text-sm text-gray-400">Total Donated</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-cyan-400">{profile.contentUploads}</div>
                  <div className="text-sm text-gray-400">Content Uploads</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">
                    {Math.floor((Date.now() - profile.joinDate.getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-gray-400">Days Member</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {(['profile', 'activity', 'donations', 'content', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-blue-500/50 p-8">
              <h2 className="text-2xl font-bold text-blue-300 mb-6">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 block mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    disabled={!isEditing}
                    className="w-full bg-slate-700 text-white rounded-lg p-3 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-2">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled={!isEditing}
                    className="w-full bg-slate-700 text-white rounded-lg p-3 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    disabled={!isEditing}
                    className="w-full bg-slate-700 text-white rounded-lg p-3 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-2">Member Since</label>
                  <input
                    type="text"
                    value={profile.joinDate.toLocaleDateString()}
                    disabled
                    className="w-full bg-slate-700 text-white rounded-lg p-3 opacity-50"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-blue-500/50 p-8">
              <h2 className="text-2xl font-bold text-blue-300 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-white">{activity.description}</div>
                        {activity.details && <div className="text-sm text-gray-400 mt-1">{activity.details}</div>}
                      </div>
                      <div className="text-sm text-gray-400">
                        {activity.timestamp.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Donations Tab */}
          {activeTab === 'donations' && (
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-blue-500/50 p-8">
              <h2 className="text-2xl font-bold text-blue-300 mb-6">Donation History</h2>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-lg p-4 border border-yellow-500/50">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-white">Gold Tier Donation</div>
                      <div className="text-sm text-gray-400">Sweet Miracles Campaign</div>
                    </div>
                    <div className="text-2xl font-bold text-yellow-400">$250</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-gray-500/20 to-gray-600/20 rounded-lg p-4 border border-gray-500/50">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-white">Silver Tier Donation</div>
                      <div className="text-sm text-gray-400">Sweet Miracles Campaign</div>
                    </div>
                    <div className="text-2xl font-bold text-gray-300">$100</div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-blue-500/50 p-8">
              <h2 className="text-2xl font-bold text-blue-300 mb-6">Your Content</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-slate-700/50 rounded-lg p-4 border border-blue-500/30">
                    <div className="text-white font-semibold mb-2">Legacy Recording - Side {String.fromCharCode(64 + i)}</div>
                    <div className="text-sm text-gray-400 mb-3">Uploaded 5 days ago</div>
                    <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-blue-500/50 p-8">
              <h2 className="text-2xl font-bold text-blue-300 mb-6">Account Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div>
                    <div className="font-semibold text-white">Email Notifications</div>
                    <div className="text-sm text-gray-400">Receive updates about your account</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div>
                    <div className="font-semibold text-white">Marketing Emails</div>
                    <div className="text-sm text-gray-400">Receive news and special offers</div>
                  </div>
                  <input type="checkbox" className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div>
                    <div className="font-semibold text-white">Two-Factor Authentication</div>
                    <div className="text-sm text-gray-400">Add extra security to your account</div>
                  </div>
                  <Button className="bg-green-500 hover:bg-green-600 text-white text-sm">
                    Enable
                  </Button>
                </div>
                <Button className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white">
                  Delete Account
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
