import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, Share2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';

interface CalendarPost {
  id: number;
  title: string;
  content: string;
  scheduledTime: Date;
  platforms: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
}

interface DragItem {
  postId: number;
  originalDate: Date;
}

export const ContentCalendarUI: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    platforms: [] as string[],
    hashtags: [] as string[],
  });

  const utils = trpc.useUtils();
  const { data: posts } = trpc.contentCalendar.getPostsByDateRange.useQuery({
    startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
  });

  const createPostMutation = trpc.contentCalendar.createPost.useMutation({
    onSuccess: () => {
      utils.contentCalendar.getPostsByDateRange.invalidate();
      setIsCreateDialogOpen(false);
      setFormData({ title: '', content: '', platforms: [], hashtags: [] });
    },
  });

  const updateScheduleMutation = trpc.contentCalendar.updatePostSchedule.useMutation({
    onSuccess: () => {
      utils.contentCalendar.getPostsByDateRange.invalidate();
    },
  });

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getPostsForDay = (day: number) => {
    if (!posts) return [];
    return posts.filter((post) => {
      const postDate = new Date(post.scheduledTime);
      return postDate.getDate() === day && postDate.getMonth() === currentDate.getMonth();
    });
  };

  const handleDragStart = (e: React.DragEvent, postId: number, date: Date) => {
    setDraggedItem({ postId, originalDate: date });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, day: number) => {
    e.preventDefault();
    if (!draggedItem) return;

    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    newDate.setHours(draggedItem.originalDate.getHours());
    newDate.setMinutes(draggedItem.originalDate.getMinutes());

    updateScheduleMutation.mutate({
      postId: draggedItem.postId,
      newScheduledTime: newDate,
    });

    setDraggedItem(null);
  };

  const handleCreatePost = async () => {
    if (!formData.title || !formData.content || formData.platforms.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    const scheduledTime = new Date(currentDate);
    scheduledTime.setHours(12, 0, 0, 0);

    createPostMutation.mutate({
      title: formData.title,
      content: formData.content,
      scheduledTime,
      platforms: formData.platforms as any,
      hashtags: formData.hashtags,
    });
  };

  const platformColors: Record<string, string> = {
    twitter: 'bg-blue-500',
    youtube: 'bg-red-500',
    facebook: 'bg-blue-600',
    instagram: 'bg-pink-500',
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-background">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-4">Content Calendar</h1>
        
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Button onClick={() => setIsCreateDialogOpen(true)} className="ml-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-muted">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-4 text-center font-semibold text-foreground border-r border-b border-border last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} className="min-h-32 bg-muted/50 border-r border-b border-border last:border-r-0" />
            ))}
            
            {days.map((day) => {
              const dayPosts = getPostsForDay(day);
              return (
                <div
                  key={day}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, day)}
                  className="min-h-32 border-r border-b border-border last:border-r-0 p-2 bg-background hover:bg-muted/30 transition-colors"
                >
                  <div className="font-semibold text-foreground mb-1">{day}</div>
                  <div className="space-y-1">
                    {dayPosts.map((post) => (
                      <div
                        key={post.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, post.id, new Date(post.scheduledTime))}
                        onClick={() => setSelectedPost(post)}
                        className="p-2 rounded text-xs bg-accent text-accent-foreground cursor-move hover:opacity-80 transition-opacity"
                      >
                        <div className="font-semibold truncate">{post.title}</div>
                        <div className="flex gap-1 mt-1">
                          {post.platforms.map((platform) => (
                            <span
                              key={platform}
                              className={`${platformColors[platform]} text-white px-1 rounded text-xs`}
                            >
                              {platform.slice(0, 2).toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create Post Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Post title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Post content"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Platforms</label>
              <div className="flex gap-2">
                {['twitter', 'youtube', 'facebook', 'instagram'].map((platform) => (
                  <Button
                    key={platform}
                    variant={formData.platforms.includes(platform) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        platforms: formData.platforms.includes(platform)
                          ? formData.platforms.filter((p) => p !== platform)
                          : [...formData.platforms, platform],
                      })
                    }
                  >
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Hashtags (comma-separated)</label>
              <Input
                value={formData.hashtags.join(', ')}
                onChange={(e) => setFormData({ ...formData, hashtags: e.target.value.split(',').map((h) => h.trim()) })}
                placeholder="#qumus #rockinrockinboogie"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePost} disabled={createPostMutation.isPending}>
                {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post Details */}
      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedPost.title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Content</label>
                <p className="text-foreground mt-1">{selectedPost.content}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Scheduled Time</label>
                <p className="text-foreground mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedPost.scheduledTime).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Platforms</label>
                <div className="flex gap-2 mt-1">
                  {selectedPost.platforms.map((platform) => (
                    <span
                      key={platform}
                      className={`${platformColors[platform]} text-white px-3 py-1 rounded text-sm`}
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <p className="text-foreground mt-1 capitalize">{selectedPost.status}</p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setSelectedPost(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ContentCalendarUI;
