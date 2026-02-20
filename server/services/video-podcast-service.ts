/**
 * Video Podcast Service
 * 
 * Manages video podcast content, playback, and metadata.
 * Integrates with streaming infrastructure for 24/7 distribution.
 * 
 * A Canryn Production
 */

export interface VideoPodcast {
  id: string;
  title: string;
  description: string;
  channelId: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  publishedAt: Date;
  views: number;
  likes: number;
  comments: number;
  transcript?: string;
  tags: string[];
  category: string;
  resolution: '720p' | '1080p' | '4K';
  format: 'MP4' | 'WebM' | 'HLS';
}

const videoPodcasts = new Map<string, VideoPodcast>();

export function createVideoPodcast(data: Omit<VideoPodcast, 'id' | 'views' | 'likes' | 'comments'>): VideoPodcast {
  const podcast: VideoPodcast = {
    ...data,
    id: `vpod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    views: 0,
    likes: 0,
    comments: 0,
  };

  videoPodcasts.set(podcast.id, podcast);
  return podcast;
}

export function getVideoPodcast(id: string): VideoPodcast | null {
  return videoPodcasts.get(id) || null;
}

export function getChannelVideoPodcasts(channelId: string): VideoPodcast[] {
  return Array.from(videoPodcasts.values()).filter(v => v.channelId === channelId);
}

export function updateVideoPodcast(id: string, updates: Partial<VideoPodcast>): VideoPodcast | null {
  const podcast = videoPodcasts.get(id);
  if (!podcast) return null;

  const updated = { ...podcast, ...updates, id: podcast.id };
  videoPodcasts.set(id, updated);
  return updated;
}

export function incrementViewCount(id: string): VideoPodcast | null {
  const podcast = videoPodcasts.get(id);
  if (!podcast) return null;

  podcast.views += 1;
  return podcast;
}

export function addLike(id: string): VideoPodcast | null {
  const podcast = videoPodcasts.get(id);
  if (!podcast) return null;

  podcast.likes += 1;
  return podcast;
}

export function addComment(id: string): VideoPodcast | null {
  const podcast = videoPodcasts.get(id);
  if (!podcast) return null;

  podcast.comments += 1;
  return podcast;
}

export function deleteVideoPodcast(id: string): boolean {
  return videoPodcasts.delete(id);
}

export function searchVideoPodcasts(query: string, channelId?: string): VideoPodcast[] {
  const lowerQuery = query.toLowerCase();
  return Array.from(videoPodcasts.values()).filter(v => {
    const matchesQuery = 
      v.title.toLowerCase().includes(lowerQuery) ||
      v.description.toLowerCase().includes(lowerQuery) ||
      v.tags.some(t => t.toLowerCase().includes(lowerQuery));
    
    const matchesChannel = !channelId || v.channelId === channelId;
    return matchesQuery && matchesChannel;
  });
}

export function getTrendingVideos(limit: number = 10, channelId?: string): VideoPodcast[] {
  const videos = channelId 
    ? getChannelVideoPodcasts(channelId)
    : Array.from(videoPodcasts.values());

  return videos
    .sort((a, b) => (b.views + b.likes) - (a.views + a.likes))
    .slice(0, limit);
}

export function recommendVideos(watchedVideoIds: string[], limit: number = 5): VideoPodcast[] {
  const watchedVideos = watchedVideoIds
    .map(id => videoPodcasts.get(id))
    .filter((v): v is VideoPodcast => v !== null);

  if (watchedVideos.length === 0) {
    return getTrendingVideos(limit);
  }

  const watchedTags = new Set(watchedVideos.flatMap(v => v.tags));
  const watchedChannels = new Set(watchedVideos.map(v => v.channelId));

  const scored = Array.from(videoPodcasts.values())
    .filter(v => !watchedVideoIds.includes(v.id))
    .map(v => {
      let score = 0;
      
      v.tags.forEach(tag => {
        if (watchedTags.has(tag)) score += 10;
      });

      if (watchedChannels.has(v.channelId)) score += 5;

      score += (v.views + v.likes) / 100;

      return { video: v, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.video);

  return scored;
}

export function getVideoStats(videoId: string) {
  const video = videoPodcasts.get(videoId);
  if (!video) return null;

  return {
    id: videoId,
    title: video.title,
    views: video.views,
    likes: video.likes,
    comments: video.comments,
    engagementRate: video.views > 0 ? ((video.likes + video.comments) / video.views) * 100 : 0,
    duration: video.duration,
    resolution: video.resolution,
  };
}
