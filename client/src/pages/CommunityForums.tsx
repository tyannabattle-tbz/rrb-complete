import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, Users, TrendingUp, Plus, Search, Heart, Reply, Share2 
} from 'lucide-react';

interface Thread {
  id: string;
  title: string;
  content: string;
  author_id: string;
  category: string;
  views: number;
  replies: number;
  created_at: number;
}

export default function CommunityForums() {
  const [threads, setThreads] = useState<Thread[]>([
    {
      id: 'thread-1',
      title: 'Best RRB Channels to Listen',
      content: 'What are your favorite channels? I\'m looking for recommendations...',
      author_id: 'user-1',
      category: 'recommendations',
      views: 234,
      replies: 18,
      created_at: Date.now() - 2 * 24 * 60 * 60 * 1000,
    },
    {
      id: 'thread-2',
      title: 'Emergency Broadcast System Feedback',
      content: 'How can we improve HybridCast? Share your suggestions...',
      author_id: 'user-2',
      category: 'feedback',
      views: 156,
      replies: 12,
      created_at: Date.now() - 1 * 24 * 60 * 60 * 1000,
    },
    {
      id: 'thread-3',
      title: 'Healing Frequencies Discussion',
      content: 'Let\'s discuss the benefits of different healing frequencies...',
      author_id: 'user-3',
      category: 'wellness',
      views: 89,
      replies: 7,
      created_at: Date.now() - 12 * 60 * 60 * 1000,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['all', 'recommendations', 'feedback', 'wellness', 'technical', 'general'];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      recommendations: 'bg-blue-100 text-blue-800',
      feedback: 'bg-purple-100 text-purple-800',
      wellness: 'bg-green-100 text-green-800',
      technical: 'bg-orange-100 text-orange-800',
      general: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredThreads = threads.filter(thread => {
    const matchesSearch = thread.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || thread.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Community Forums</h1>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            New Thread
          </Button>
        </div>
        <p className="text-gray-300">Join the conversation with RRB Radio community members</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Threads</p>
                <p className="text-3xl font-bold text-white mt-1">{threads.length}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Users</p>
                <p className="text-3xl font-bold text-white mt-1">342</p>
              </div>
              <Users className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Replies</p>
                <p className="text-3xl font-bold text-white mt-1">{threads.reduce((sum, t) => sum + t.replies, 0)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
          <Input 
            placeholder="Search threads..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Button
              key={category}
              variant={activeCategory === category ? 'default' : 'outline'}
              onClick={() => setActiveCategory(category)}
              className={activeCategory === category ? 'bg-purple-600' : ''}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Threads List */}
      <div className="space-y-4">
        {filteredThreads.map(thread => (
          <Card key={thread.id} className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/40 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white hover:text-purple-400 transition-colors">
                      {thread.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">{thread.content}</p>
                  </div>
                  <Badge className={getCategoryColor(thread.category)}>
                    {thread.category}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {thread.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {thread.replies} replies
                    </span>
                  </div>
                  <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-purple-400">
                    <Heart className="w-4 h-4 mr-1" />
                    Like
                  </Button>
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-purple-400">
                    <Reply className="w-4 h-4 mr-1" />
                    Reply
                  </Button>
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-purple-400">
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Eye icon (not in lucide-react, so define it)
function Eye({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}
