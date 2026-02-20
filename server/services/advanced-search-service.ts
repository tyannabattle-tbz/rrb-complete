// Advanced Search Service with Filters
export interface SearchFilters {
  dateRange?: { start: Date; end: Date };
  duration?: { min: number; max: number };
  channel?: string;
  engagementLevel?: 'low' | 'medium' | 'high';
  contentType?: 'video' | 'podcast' | 'audio' | 'all';
  sortBy?: 'relevance' | 'date' | 'engagement' | 'views';
}

export interface SearchResult {
  id: string;
  title: string;
  type: 'video' | 'podcast' | 'audio';
  channel: string;
  duration: number;
  views: number;
  likes: number;
  comments: number;
  uploadedAt: Date;
  thumbnail?: string;
  description: string;
}

const mockContent: SearchResult[] = [
  {
    id: 'v1',
    title: 'Morning Glory Gospel',
    type: 'video',
    channel: 'RRB Gospel Choir',
    duration: 245,
    views: 1250,
    likes: 89,
    comments: 12,
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    description: 'Beautiful gospel performance',
  },
  {
    id: 'v2',
    title: 'Healing Frequencies 432Hz',
    type: 'audio',
    channel: 'QUMUS Wellness',
    duration: 1800,
    views: 3420,
    likes: 234,
    comments: 45,
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    description: 'Meditation with healing frequencies',
  },
  {
    id: 'p1',
    title: 'Soul Revival Podcast',
    type: 'podcast',
    channel: 'Rockin Rockin Boogie',
    duration: 3600,
    views: 2100,
    likes: 156,
    comments: 28,
    uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    description: 'Weekly podcast about spiritual growth',
  },
];

export const advancedSearchService = {
  search: (query: string, filters?: SearchFilters): SearchResult[] => {
    let results = mockContent.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );

    if (filters) {
      if (filters.dateRange) {
        results = results.filter(
          item => item.uploadedAt >= filters.dateRange!.start && item.uploadedAt <= filters.dateRange!.end
        );
      }

      if (filters.duration) {
        results = results.filter(
          item => item.duration >= filters.duration!.min && item.duration <= filters.duration!.max
        );
      }

      if (filters.channel) {
        results = results.filter(item => item.channel.toLowerCase().includes(filters.channel!.toLowerCase()));
      }

      if (filters.contentType && filters.contentType !== 'all') {
        results = results.filter(item => item.type === filters.contentType);
      }

      if (filters.engagementLevel) {
        const engagementScore = (item: SearchResult) => (item.likes + item.comments * 2) / (item.views || 1);
        const scores = results.map(engagementScore);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length || 0;

        results = results.filter(item => {
          const score = engagementScore(item);
          if (filters.engagementLevel === 'high') return score > avgScore * 1.2;
          if (filters.engagementLevel === 'medium') return score >= avgScore * 0.8 && score <= avgScore * 1.2;
          return score < avgScore * 0.8;
        });
      }

      if (filters.sortBy) {
        results.sort((a, b) => {
          switch (filters.sortBy) {
            case 'date':
              return b.uploadedAt.getTime() - a.uploadedAt.getTime();
            case 'engagement':
              return b.likes + b.comments - (a.likes + a.comments);
            case 'views':
              return b.views - a.views;
            default:
              return 0;
          }
        });
      }
    }

    return results;
  },

  getAutocompleteSuggestions: (query: string): string[] => {
    const allTitles = mockContent.map(item => item.title);
    return allTitles.filter(title => title.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  },

  getFilterOptions: () => ({
    channels: ['RRB Gospel Choir', 'QUMUS Wellness', 'Rockin Rockin Boogie'],
    contentTypes: ['video', 'podcast', 'audio'],
    engagementLevels: ['low', 'medium', 'high'],
    sortOptions: ['relevance', 'date', 'engagement', 'views'],
  }),

  getSearchStats: (results: SearchResult[]) => ({
    totalResults: results.length,
    avgViews: results.reduce((sum, r) => sum + r.views, 0) / results.length || 0,
    avgEngagement: results.reduce((sum, r) => sum + r.likes + r.comments, 0) / results.length || 0,
    contentTypeBreakdown: {
      videos: results.filter(r => r.type === 'video').length,
      podcasts: results.filter(r => r.type === 'podcast').length,
      audio: results.filter(r => r.type === 'audio').length,
    },
  }),
};
