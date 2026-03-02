import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';

interface TabType {
  id: string;
  label: string;
}

const tabs: TabType[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'activity', label: 'Activity' },
  { id: 'donations', label: 'Donations' },
  { id: 'content', label: 'Content' },
  { id: 'settings', label: 'Settings' },
];

export default function ClientPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  // tRPC queries
  const profileQuery = trpc.clientPortal.getProfile.useQuery();
  const statsQuery = trpc.clientPortal.getStats.useQuery();
  const donationHistoryQuery = trpc.clientPortal.getDonationHistory.useQuery();
  const contentUploadsQuery = trpc.clientPortal.getContentUploads.useQuery();

  // tRPC mutations
  const updateProfileMutation = trpc.clientPortal.updateProfile.useMutation();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-8 flex items-center justify-center">
        <Card className="bg-gray-900 border-blue-500 p-8 text-center">
          <p className="text-white text-xl">Please log in to access your Client Portal</p>
        </Card>
      </div>
    );
  }

  const profile = profileQuery.data;
  const stats = statsQuery.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">👥 Client Portal</h1>
          <p className="text-xl text-blue-200">Manage your account, donations, and content</p>
        </div>

        {/* Profile Card */}
        {profile && (
          <Card className="bg-gray-900 border-blue-500 p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
                  <span className="text-4xl">👤</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{profile.fullName}</h2>
                  <p className="text-blue-300">{profile.email}</p>
                  <p className="text-blue-300">{profile.phone}</p>
                  <div className="mt-2">
                    <span className="bg-yellow-500 text-gray-900 px-3 py-1 rounded-full font-semibold text-sm">
                      {stats?.subscriptionTier?.toUpperCase() || 'FREE'}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700">
              <div className="text-center">
                <div className="text-blue-300 text-sm mb-1">Total Donated</div>
                <div className="text-3xl font-bold text-white">${stats?.totalDonated || '0'}</div>
              </div>
              <div className="text-center">
                <div className="text-blue-300 text-sm mb-1">Content Uploads</div>
                <div className="text-3xl font-bold text-white">{stats?.contentUploads || '0'}</div>
              </div>
              <div className="text-center">
                <div className="text-blue-300 text-sm mb-1">Days Member</div>
                <div className="text-3xl font-bold text-white">
                  {stats?.memberSince ? Math.floor((Date.now() - new Date(stats.memberSince).getTime()) / (1000 * 60 * 60 * 24)) : '0'}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-2 border-b border-blue-500">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-white border-b-2 border-blue-400'
                    : 'text-blue-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <Card className="bg-gray-900 border-blue-500 p-8">
          {activeTab === 'profile' && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Profile Information</h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-blue-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      defaultValue={profile?.fullName}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-300 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={profile?.email}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      defaultValue={profile?.phone || ''}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-300 mb-2">Member Since</label>
                    <input
                      type="text"
                      defaultValue={profile?.memberSince ? new Date(profile.memberSince).toLocaleDateString() : ''}
                      disabled
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 opacity-50"
                    />
                  </div>
                  <Button
                    onClick={() => setIsEditing(false)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg mt-4"
                  >
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-blue-300 mb-1">Full Name</label>
                    <p className="text-white text-lg">{profile?.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-blue-300 mb-1">Email</label>
                    <p className="text-white text-lg">{profile?.email}</p>
                  </div>
                  <div>
                    <label className="block text-blue-300 mb-1">Phone</label>
                    <p className="text-white text-lg">{profile?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-blue-300 mb-1">Member Since</label>
                    <p className="text-white text-lg">
                      {profile?.memberSince ? new Date(profile.memberSince).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'donations' && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Donation History</h3>
              
              {donationHistoryQuery.data && donationHistoryQuery.data.length > 0 ? (
                <div className="space-y-4">
                  {donationHistoryQuery.data.map((donation, index) => (
                    <div key={index} className="bg-gray-800 p-4 rounded border border-gray-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white font-semibold">${donation.amount}</p>
                          <p className="text-blue-300 text-sm">{donation.purpose || 'General Donation'}</p>
                        </div>
                        <p className="text-gray-400 text-sm">
                          {new Date(donation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-blue-300">No donations yet. Start making a difference!</p>
              )}
            </div>
          )}

          {activeTab === 'content' && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Your Content</h3>
              
              {contentUploadsQuery.data && contentUploadsQuery.data.length > 0 ? (
                <div className="space-y-4">
                  {contentUploadsQuery.data.map((content, index) => (
                    <div key={index} className="bg-gray-800 p-4 rounded border border-gray-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-semibold">{content.title}</p>
                          <p className="text-blue-300 text-sm">{content.contentType}</p>
                          <p className="text-gray-400 text-sm mt-2">{content.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-sm">{content.viewCount} views</p>
                          <p className="text-gray-400 text-sm">{content.downloadCount} downloads</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-blue-300">No content uploaded yet. Share your creations!</p>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded border border-gray-700">
                  <span className="text-white">Email Notifications</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded border border-gray-700">
                  <span className="text-white">Marketing Emails</span>
                  <input type="checkbox" className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded border border-gray-700">
                  <span className="text-white">Two-Factor Authentication</span>
                  <input type="checkbox" className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
