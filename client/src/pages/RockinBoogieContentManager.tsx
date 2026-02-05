'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Play, Pause, Music, Radio, Headphones, Calendar, Users, TrendingUp, Loader } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { ContentGenerationForm } from '@/components/ContentGenerationForm';
import { ScheduledGenerationDashboard } from '@/components/ScheduledGenerationDashboard';
import { ContentPreviewModal } from '@/components/ContentPreviewModal';
import { AudioPlayer } from '@/components/AudioPlayer';
import RockinBoogiePlayerQUMUS from '@/components/RockinBoogiePlayerQUMUS';
import { useState } from 'react';

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
  // ALL HOOKS MUST BE AT THE TOP
  const [showPlayer, setShowPlayer] = useState(false);
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

  // CONDITIONAL RENDERING AFTER ALL HOOKS
  if (showPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <Button 
          onClick={() => setShowPlayer(false)}
          className="mb-4 bg-slate-700 hover:bg-slate-600"
        >
          Back to Content
        </Button>
        <RockinBoogiePlayerQUMUS />
      </div>
    );
  }

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
        return 'text-green-400';
      case 'scheduled':
        return 'text-yellow-400';
      case 'archived':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-amber-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Rockin' Rockin' Boogie Content Manager</h1>
              <p className="text-slate-400">Manage radio stations, podcasts, and audiobooks powered by HybridCast</p>
            </div>
          </div>
          <Button onClick={() => setShowNewForm(!showNewForm)} className="gap-2 bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4" />
            New Content
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Total Listeners</p>
            <p className="text-3xl font-bold text-white mt-2">{totalListeners.toLocaleString()}</p>
            <p className="text-green-400 text-xs mt-2">↑ 12% this week</p>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Active Content</p>
            <p className="text-3xl font-bold text-white mt-2">{contentItems.filter((i: any) => i.status === 'active').length}</p>
            <p className="text-blue-400 text-xs mt-2">Currently streaming</p>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Total Content</p>
            <p className="text-3xl font-bold text-white mt-2">{contentItems.length}</p>
            <p className="text-purple-400 text-xs mt-2">In library</p>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Avg Rating</p>
            <p className="text-3xl font-bold text-white mt-2">NaN</p>
            <p className="text-orange-400 text-xs mt-2">Out of 5.0</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('content')}
            className={`pb-2 px-4 font-medium transition ${
              activeTab === 'content'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Content Library
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-2 px-4 font-medium transition ${
              activeTab === 'analytics'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Analytics
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content Library */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4">Content Library</h2>
            {contentLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 text-amber-400 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {contentItems.map((item: any) => (
                  <Card key={item.id} className="bg-slate-800 border-slate-700 p-4 hover:border-amber-400 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1 text-amber-400">{getTypeIcon(item.type)}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white">{item.title}</h3>
                          <p className="text-sm text-slate-400">{item.description}</p>
                          <div className="flex gap-4 mt-2 text-xs text-slate-500">
                            <span className={getStatusColor(item.status)}>
                              {item.status.toUpperCase()}
                            </span>
                            <span>★ {item.rating || 0.0}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Listeners</p>
                        <p className="font-bold text-white">{(item.listeners / 1000).toFixed(1)}K</p>
                        <p className="text-xs text-slate-400 capitalize">Type</p>
                        <p className="font-bold text-white capitalize text-sm">{item.type}</p>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-2 pt-3 border-t border-slate-700">
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowPlayer(true)}>
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
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Analytics & Actions */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Analytics</h2>
            <Card className="bg-slate-800 border-slate-700 p-4 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h3 className="font-bold text-white">Content Stats</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Content Items</span>
                  <span className="font-bold text-white">{contentItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Streams</span>
                  <span className="font-bold text-white">{contentItems.filter((i: any) => i.status === 'active').length}</span>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white">Quick Actions</h3>
              </div>
              <div className="space-y-2">
                <Button className="w-full justify-start gap-2 bg-slate-700 hover:bg-slate-600">
                  <Users className="w-4 h-4" />
                  View Listeners
                </Button>
                <Button className="w-full justify-start gap-2 bg-slate-700 hover:bg-slate-600">
                  <Calendar className="w-4 h-4" />
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
