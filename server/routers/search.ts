import { publicProcedure, router } from '../_core/trpc';
import { z } from 'zod';

// Mock search index - in production, use a real search service like Elasticsearch or Meilisearch
const searchIndex = [
  {
    id: '1',
    title: 'Rockin Rockin Boogie Legacy',
    description: 'Preserving the legacy of Seabrun Candy Hunter through verified documentation, live radio broadcasting, healing music frequencies, and community empowerment.',
    category: 'rrb',
    url: '/',
    tags: ['legacy', 'radio', 'community'],
  },
  {
    id: '2',
    title: 'RRB Radio Station',
    description: '24/7 live radio broadcasting with healing frequencies and community engagement.',
    category: 'rrb',
    url: '/radio-station',
    tags: ['radio', 'streaming', 'live'],
  },
  {
    id: '3',
    title: 'Music Library',
    description: 'Curated music collection with Spotify integration for all healing frequencies.',
    category: 'rrb',
    url: '/music-library',
    tags: ['music', 'spotify', 'healing'],
  },
  {
    id: '4',
    title: 'Podcast & Video',
    description: 'YouTube integrated podcast and video content with full playback controls.',
    category: 'rrb',
    url: '/podcasts',
    tags: ['podcasts', 'video', 'youtube'],
  },
  {
    id: '5',
    title: 'Solbones Game',
    description: 'Sacred math dice game with Solfeggio frequencies and multiplayer support.',
    category: 'rrb',
    url: '/solbones',
    tags: ['game', 'dice', 'frequencies'],
  },
  {
    id: '6',
    title: 'Sweet Miracles Donations',
    description: 'Support the RRB legacy through Stripe-powered donations and community funding.',
    category: 'rrb',
    url: '/donations',
    tags: ['donations', 'fundraising', 'community'],
  },
  {
    id: '7',
    title: 'Listener Analytics',
    description: 'Real-time listener metrics, engagement tracking, and channel analytics.',
    category: 'rrb',
    url: '/listener-analytics',
    tags: ['analytics', 'metrics', 'insights'],
  },
  {
    id: '8',
    title: 'QUMUS Orchestration',
    description: 'Autonomous AI orchestration engine with 90% autonomous control and human oversight.',
    category: 'qumus',
    url: '/comprehensive-dashboard',
    tags: ['qumus', 'ai', 'orchestration'],
  },
  {
    id: '9',
    title: 'Broadcast Hub',
    description: 'Complete broadcast management platform with scheduling, compliance, and automation.',
    category: 'qumus',
    url: '/broadcast-hub',
    tags: ['broadcast', 'scheduling', 'management'],
  },
  {
    id: '10',
    title: 'HybridCast Emergency',
    description: 'Offline-first emergency broadcast system with mesh networking and resilience.',
    category: 'qumus',
    url: '/hybridcast',
    tags: ['emergency', 'broadcast', 'offline'],
  },
];

export const searchRouter = router({
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        category: z.enum(['all', 'rrb', 'qumus']).optional().default('all'),
        limit: z.number().min(1).max(50).optional().default(10),
      })
    )
    .query(({ input }) => {
      const { query, category, limit } = input;
      const searchTerm = query.toLowerCase();

      // Filter by category
      let results = searchIndex;
      if (category !== 'all') {
        results = results.filter((item) => item.category === category);
      }

      // Search by title, description, and tags
      results = results.filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(searchTerm);
        const descMatch = item.description.toLowerCase().includes(searchTerm);
        const tagMatch = item.tags.some((tag) => tag.toLowerCase().includes(searchTerm));
        return titleMatch || descMatch || tagMatch;
      });

      // Sort by relevance (title matches are more relevant than description matches)
      results.sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(searchTerm) ? 1 : 0;
        const bTitle = b.title.toLowerCase().includes(searchTerm) ? 1 : 0;
        return bTitle - aTitle;
      });

      // Limit results
      results = results.slice(0, limit);

      return {
        query,
        category,
        results,
        totalResults: results.length,
      };
    }),

  // Get popular search terms
  getPopularSearches: publicProcedure.query(() => {
    return {
      popular: [
        { title: 'radio', category: 'rrb' },
        { title: 'music', category: 'rrb' },
        { title: 'podcast', category: 'rrb' },
        { title: 'donations', category: 'rrb' },
        { title: 'frequencies', category: 'rrb' },
        { title: 'broadcast', category: 'qumus' },
        { title: 'orchestration', category: 'qumus' },
      ],
    };
  }),

  // Get search suggestions based on partial query
  getSuggestions: publicProcedure
    .input(z.object({ query: z.string().min(1).max(50) }))
    .query(({ input }) => {
      const { query } = input;
      const searchTerm = query.toLowerCase();

      const suggestions = searchIndex
        .filter(
          (item) =>
            item.title.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm)
        )
        .map((item) => ({
          title: item.title,
          category: item.category,
          url: item.url,
        }))
        .slice(0, 5);

      return { suggestions };
    }),
});
