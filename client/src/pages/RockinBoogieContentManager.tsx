import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Play, Pause, Music, Radio, Headphones, Calendar, Users, TrendingUp, Loader } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { ContentGenerationForm } from '@/components/ContentGenerationForm';
import { ScheduledGenerationDashboard } from '@/components/ScheduledGenerationDashboard';
import { ContentPreviewModal } from '@/components/ContentPreviewModal';
import { AudioPlayer } from '@/components/AudioPlayer';

interface ContentItem {
  id: number;
  title: string;
  type: 'radio' | 'podcast' | 'audiobook';
  description?: string;
  status: 'active' | 'scheduled' | 'archived';
  listeners: number;
  duration?: string;
  schedule?: string;
  rating?: number;
}

export default function RockinBoogieContentManager() {
  const [selectedContent, setSelectedContent] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('content');
  const [previewContent, setPreviewContent] = useState<any | null>(null);
  const [newContent, setNewContent] = useState({
    title: '',
    type: 'radio' as const,
    description: '',
  });

  // Fetch content from tRPC
  const { data: contentItems = [], isLoading: contentLoading, refetch: refetchContent } = trpc.rockinBoogie.list.useQuery();
  const { data: totalListeners = 0 } = trpc.rockinBoogie.getTotalListeners.useQuery();
  
  // Mutations
  const createMutation = trpc.rockinBoogie.create.useMutation({
    onSuccess: () => {
      refetchContent();
      setNewContent({ title: '', type: 'radio', description: '' });
      setShowNewForm(false);
    },
  });

  const deleteMutation = trpc.rockinBoogie.delete.useMutation({
    onSuccess: () => {
      refetchContent();
      setSelectedContent(null);
    },
  });

  const handleCreateContent = async () => {
    if (!newContent.title.trim()) return;
    await createMutation.mutateAsync({
      title: newContent.title,
      type: newContent.type,
      description: newContent.description,
      status: 'active',
    });
  };

  const handleDeleteContent = async (id: number) => {
    if (confirm('Are you sure you want to delete this content?')) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'radio':
        return <Radio className="w-5 h-5" />;
      case 'podcast':
        return <Headphones className="w-5 h-5" />;
      case 'audiobook':
        return <Music className="w-5 h-5" />;
      default:
        return <Music className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'scheduled':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'archived':
        return 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200';
      default:
        return 'bg-slate-100 dark:bg-slate-700';
    }
  };

  const activeCount = contentItems.filter((c: any) => c.status === 'active').length;
  const avgEngagement = contentItems.length > 0 
    ? Math.round(contentItems.reduce((sum: number, c: any) => sum + (c.rating || 0), 0) / contentItems.length * 10)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Music className="w-8 h-8 text-purple-600" />
                Rockin' Rockin' Boogie Content Manager
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage radio stations, podcasts, and audiobooks powered by HybridCast
              </p>
            </div>
            <Button
              onClick={() => setShowNewForm(!showNewForm)}
              className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-4 h-4" />
              New Content
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Listeners</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {contentLoading ? '...' : totalListeners.toLocaleString()}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">↑ 12% this week</p>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Active Content</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeCount}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Currently streaming</p>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Content</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{contentItems.length}</p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">In library</p>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Avg Rating</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{(avgEngagement / 10).toFixed(1)}</p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">Out of 5.0</p>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Content Library</h2>

            {showNewForm && (
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4 mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white mb-3">Add New Content</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Title"
                    value={newContent.title}
                    onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-900 dark:text-white placeholder-slate-500"
                  />
                  <select
                    value={newContent.type}
                    onChange={(e) => setNewContent({ ...newContent, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-900 dark:text-white"
                  >
                    <option value="radio">Radio</option>
                    <option value="podcast">Podcast</option>
                    <option value="audiobook">Audiobook</option>
                  </select>
                  <textarea
                    placeholder="Description"
                    value={newContent.description}
                    onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-900 dark:text-white placeholder-slate-500"
                    rows={3}
                  ></textarea>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleCreateContent}
                      disabled={createMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {createMutation.isPending ? 'Creating...' : 'Create'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowNewForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {contentLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 animate-spin text-purple-600" />
              </div>
            ) : contentItems.length === 0 ? (
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-8 text-center">
                <p className="text-slate-600 dark:text-slate-400">No content yet. Create your first content item!</p>
              </Card>
            ) : (
              contentItems.map((item: any) => (
                <Card
                  key={item.id}
                  className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                    selectedContent === item.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => setSelectedContent(item.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1 text-purple-600 dark:text-purple-400">{getTypeIcon(item.type)}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.toUpperCase()}
                      </span>
                      {item.rating && (
                        <div className="flex gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{item.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 p-3 bg-slate-50 dark:bg-slate-700 rounded">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Listeners</p>
                      <p className="font-bold text-slate-900 dark:text-white">{(item.listeners / 1000).toFixed(1)}K</p>
                    </div>
                    {item.schedule && (
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Schedule</p>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{item.schedule}</p>
                      </div>
                    )}
                    {item.duration && (
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Duration</p>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{item.duration}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Type</p>
                      <p className="font-bold text-slate-900 dark:text-white capitalize text-sm">{item.type}</p>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Play className="w-3 h-3" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteContent(item.id)}
                      disabled={deleteMutation.isPending}
                      className="gap-1 text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                      {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Analytics Sidebar */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Analytics</h2>

            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Content Stats
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Content Items</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{contentItems.length}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Active Streams</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeCount}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  View Listeners
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Content
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
