import React, { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import {
  ArrowLeft, RefreshCw, Loader2, Send, Trash2, Clock, CheckCircle2,
  AlertCircle, XCircle, Eye, Copy, ExternalLink, Shield, Zap, RotateCcw
} from 'lucide-react';

const PLATFORM_COLORS: Record<string, string> = {
  twitter: '#1DA1F2', facebook: '#1877F2', instagram: '#E4405F',
  tiktok: '#00F2EA', youtube: '#FF0000', discord: '#5865F2',
};

const PLATFORM_ICONS: Record<string, string> = {
  twitter: '𝕏', facebook: 'f', instagram: '📸', tiktok: '♪', youtube: '▶', discord: '💬',
};

export default function TwitterQueueManager() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'failed' | 'scheduled' | 'published'>('all');
  const [retryingId, setRetryingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const postsQuery = trpc.socialMedia.listPosts.useQuery();
  const retryPost = trpc.socialMedia.retryPost.useMutation({
    onSuccess: () => {
      toast({ title: 'Post Queued for Retry', description: 'The post will be retried with current credentials.' });
      postsQuery.refetch();
      setRetryingId(null);
    },
    onError: (err) => {
      toast({ title: 'Retry Failed', description: err.message, variant: 'destructive' });
      setRetryingId(null);
    },
  });
  const retryAllFailed = trpc.socialMedia.retryAllFailed.useMutation({
    onSuccess: (data) => {
      toast({ title: 'Bulk Retry Complete', description: `${data.retried} posts queued for retry.` });
      postsQuery.refetch();
    },
    onError: (err) => {
      toast({ title: 'Bulk Retry Failed', description: err.message, variant: 'destructive' });
    },
  });
  const validateCredentials = trpc.socialMedia.validateCredentials.useQuery(undefined, { enabled: !!user });
  const deletePost = trpc.socialMedia.deletePost.useMutation({
    onSuccess: () => {
      toast({ title: 'Post Deleted' });
      postsQuery.refetch();
    },
  });

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>;
  if (!user) { navigate('/'); return null; }

  const posts = (postsQuery.data as any[]) || [];
  const filtered = filter === 'all' ? posts : posts.filter((p: any) => p.status === filter);
  const stats = {
    total: posts.length,
    failed: posts.filter((p: any) => p.status === 'failed').length,
    scheduled: posts.filter((p: any) => p.status === 'scheduled').length,
    published: posts.filter((p: any) => p.status === 'published').length,
    draft: posts.filter((p: any) => p.status === 'draft').length,
  };
  const creds = validateCredentials.data as any;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-blue-950/20 to-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/qumus')} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1" /> QUMUS
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Send className="w-6 h-6 text-blue-400" />
              Social Media Queue Manager
            </h1>
            <p className="text-gray-400 text-sm">{stats.total} posts | {stats.failed} failed | {stats.scheduled} scheduled</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => postsQuery.refetch()} className="border-blue-500/30 text-blue-300">
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
        </div>

        {/* Credential Status */}
        <Card className="bg-gray-900/40 border-gray-800 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-semibold text-sm">API Credential Status</h3>
                  <p className="text-xs text-gray-500">
                    {validateCredentials.isLoading ? 'Checking...' :
                      creds?.twitter?.valid ? '✅ Twitter/X credentials valid' :
                        '❌ Twitter/X credentials invalid — update in Settings → Secrets'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {creds && Object.entries(creds || {}).map(([platform, status]: [string, any]) => (
                  <Badge key={platform}
                    className={status?.valid ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                    {platform}: {status?.valid ? 'OK' : 'Invalid'}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats & Actions */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(['all', 'failed', 'scheduled', 'published'] as const).map(f => (
            <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
              className={filter === f ? 'bg-purple-600' : 'border-gray-700 text-gray-400'}>
              {f === 'all' ? `All (${stats.total})` :
                f === 'failed' ? `Failed (${stats.failed})` :
                  f === 'scheduled' ? `Scheduled (${stats.scheduled})` :
                    `Published (${stats.published})`}
            </Button>
          ))}
          <div className="flex-1" />
          {stats.failed > 0 && (
            <Button size="sm" onClick={() => retryAllFailed.mutate()}
              disabled={retryAllFailed.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white">
              {retryAllFailed.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RotateCcw className="w-3 h-3 mr-1" />}
              Retry All Failed ({stats.failed})
            </Button>
          )}
        </div>

        {/* Posts List */}
        <div className="space-y-3">
          {postsQuery.isLoading ? (
            <div className="text-center py-12 text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading posts...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No posts found</div>
          ) : (
            filtered.map((post: any) => (
              <Card key={post.id} className={`bg-gray-900/40 border-gray-800 ${post.status === 'failed' ? 'border-l-2 border-l-red-500' : post.status === 'published' ? 'border-l-2 border-l-green-500' : 'border-l-2 border-l-yellow-500'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Platform Icon */}
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shrink-0"
                      style={{ backgroundColor: `${PLATFORM_COLORS[post.platform] || '#6B7280'}20`, color: PLATFORM_COLORS[post.platform] || '#6B7280' }}>
                      {PLATFORM_ICONS[post.platform] || '?'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={
                          post.status === 'failed' ? 'bg-red-500/20 text-red-300' :
                            post.status === 'published' ? 'bg-green-500/20 text-green-300' :
                              post.status === 'scheduled' ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-gray-500/20 text-gray-300'
                        }>
                          {post.status === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                          {post.status === 'published' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {post.status === 'scheduled' && <Clock className="w-3 h-3 mr-1" />}
                          {post.status}
                        </Badge>
                        <span className="text-xs text-gray-500 capitalize">{post.platform}</span>
                        {post.campaign && <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300">{post.campaign}</Badge>}
                        {post.qumus_managed && <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-300">QUMUS</Badge>}
                        <span className="text-xs text-gray-600 ml-auto">
                          {post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className={`text-sm text-gray-300 ${expandedId === post.id ? '' : 'line-clamp-2'} cursor-pointer`}
                        onClick={() => setExpandedId(expandedId === post.id ? null : post.id)}>
                        {post.content}
                      </p>
                      {post.hashtags && (
                        <p className="text-xs text-blue-400 mt-1">{post.hashtags}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 shrink-0">
                      {post.status === 'failed' && (
                        <Button size="sm" variant="ghost" onClick={() => { setRetryingId(post.id); retryPost.mutate({ id: post.id }); }}
                          disabled={retryingId === post.id} className="text-amber-400 hover:text-amber-300">
                          {retryingId === post.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => {
                        navigator.clipboard.writeText(post.content);
                        toast({ title: 'Copied', description: 'Post content copied to clipboard.' });
                      }} className="text-gray-400 hover:text-white">
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deletePost.mutate({ id: post.id })}
                        className="text-gray-400 hover:text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Setup Guide */}
        <Card className="bg-gray-900/40 border-gray-800 mt-6">
          <CardHeader>
            <CardTitle className="text-lg text-blue-300">Twitter/X API Setup Guide</CardTitle>
            <CardDescription className="text-gray-400">Fix the 401 error by regenerating your access tokens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-300">
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
              <p className="font-semibold text-white">Step 1: Go to Twitter Developer Portal</p>
              <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-1">
                developer.twitter.com <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
              <p className="font-semibold text-white">Step 2: Regenerate Access Tokens</p>
              <p className="text-gray-400">Go to your App → Keys and Tokens → Regenerate Access Token and Secret</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
              <p className="font-semibold text-white">Step 3: Update in Manus Settings</p>
              <p className="text-gray-400">Go to Settings → Secrets and update these 4 values:</p>
              <ul className="text-xs text-gray-500 space-y-1 ml-4">
                <li>• TWITTER_API_KEY</li>
                <li>• TWITTER_API_SECRET</li>
                <li>• TWITTER_ACCESS_TOKEN</li>
                <li>• TWITTER_ACCESS_TOKEN_SECRET</li>
              </ul>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
              <p className="font-semibold text-white">Step 4: Retry Failed Posts</p>
              <p className="text-gray-400">Click "Retry All Failed" above to resend all 9 failed Twitter posts with the new credentials.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
