import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";

// Sample podcast data
const SAMPLE_PODCASTS = [
  {
    id: '1',
    title: 'The Legacy Podcast',
    description: 'Deep dive into the Rockin Rockin Boogie story',
    artist: 'Seabrun Candy Hunter',
    episodeCount: 12,
    coverUrl: 'https://example.com/covers/legacy-podcast.jpg',
    genre: 'Music History',
  },
  {
    id: '2',
    title: 'Soul Sessions',
    description: 'Exploring soul music and its impact',
    artist: 'Seabrun Candy Hunter',
    episodeCount: 8,
    coverUrl: 'https://example.com/covers/soul-sessions.jpg',
    genre: 'Music',
  },
  {
    id: '3',
    title: 'Boogie Conversations',
    description: 'Interviews with musicians and producers',
    artist: 'Seabrun Candy Hunter',
    episodeCount: 15,
    coverUrl: 'https://example.com/covers/boogie-conversations.jpg',
    genre: 'Interviews',
  },
];

// Sample episodes
const SAMPLE_EPISODES = {
  '1': [
    {
      id: 'ep_1_1',
      podcastId: '1',
      title: 'The Beginning - 1971',
      description: 'How it all started',
      duration: 1800,
      releaseDate: '2025-01-01',
      audioUrl: 'https://example.com/episodes/legacy-1.mp3',
    },
    {
      id: 'ep_1_2',
      podcastId: '1',
      title: 'The Rise to Fame',
      description: 'The journey to stardom',
      duration: 2400,
      releaseDate: '2025-01-08',
      audioUrl: 'https://example.com/episodes/legacy-2.mp3',
    },
    {
      id: 'ep_1_3',
      podcastId: '1',
      title: 'The Music That Defined an Era',
      description: 'Analyzing the sound',
      duration: 2100,
      releaseDate: '2025-01-15',
      audioUrl: 'https://example.com/episodes/legacy-3.mp3',
    },
  ],
  '2': [
    {
      id: 'ep_2_1',
      podcastId: '2',
      title: 'Soul Roots',
      description: 'Origins of soul music',
      duration: 1600,
      releaseDate: '2025-01-02',
      audioUrl: 'https://example.com/episodes/soul-1.mp3',
    },
    {
      id: 'ep_2_2',
      podcastId: '2',
      title: 'Soul Evolution',
      description: 'How soul music evolved',
      duration: 1900,
      releaseDate: '2025-01-09',
      audioUrl: 'https://example.com/episodes/soul-2.mp3',
    },
  ],
  '3': [
    {
      id: 'ep_3_1',
      podcastId: '3',
      title: 'Interview with Producer James',
      description: 'Behind the scenes of production',
      duration: 2200,
      releaseDate: '2025-01-03',
      audioUrl: 'https://example.com/episodes/boogie-1.mp3',
    },
  ],
};

// Sample videos
const SAMPLE_VIDEOS = [
  {
    id: 'vid_1',
    title: 'Rockin Rockin Boogie - Official Video',
    description: 'The iconic performance',
    artist: 'Seabrun Candy Hunter & Little Richard',
    duration: 240,
    releaseDate: '2025-01-01',
    videoUrl: 'https://example.com/videos/rockin-rockin-boogie.mp4',
    thumbnailUrl: 'https://example.com/thumbnails/rockin-rockin-boogie.jpg',
    views: 15000,
  },
  {
    id: 'vid_2',
    title: 'Behind the Scenes - Studio Sessions',
    description: 'Recording the album',
    artist: 'Seabrun Candy Hunter',
    duration: 480,
    releaseDate: '2025-01-05',
    videoUrl: 'https://example.com/videos/studio-sessions.mp4',
    thumbnailUrl: 'https://example.com/thumbnails/studio-sessions.jpg',
    views: 8500,
  },
  {
    id: 'vid_3',
    title: 'Live Performance - Jazz Festival 1975',
    description: 'Historic live performance',
    artist: 'Seabrun Candy Hunter Quartet',
    duration: 1200,
    releaseDate: '2025-01-10',
    videoUrl: 'https://example.com/videos/live-1975.mp4',
    thumbnailUrl: 'https://example.com/thumbnails/live-1975.jpg',
    views: 12000,
  },
];

export const podcastsRouter = router({
  // Get all podcasts
  getPodcasts: publicProcedure.query(async () => {
    return SAMPLE_PODCASTS;
  }),

  // Get single podcast
  getPodcast: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return SAMPLE_PODCASTS.find((p) => p.id === input.id) || null;
    }),

  // Get episodes for a podcast
  getEpisodes: publicProcedure
    .input(z.object({ podcastId: z.string() }))
    .query(async ({ input }) => {
      return SAMPLE_EPISODES[input.podcastId as keyof typeof SAMPLE_EPISODES] || [];
    }),

  // Get all videos
  getVideos: publicProcedure.query(async () => {
    return SAMPLE_VIDEOS;
  }),

  // Get single video
  getVideo: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return SAMPLE_VIDEOS.find((v) => v.id === input.id) || null;
    }),

  // Search podcasts and videos
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const query = input.query.toLowerCase();
      const podcasts = SAMPLE_PODCASTS.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
      const videos = SAMPLE_VIDEOS.filter(
        (v) =>
          v.title.toLowerCase().includes(query) ||
          v.description.toLowerCase().includes(query)
      );
      return { podcasts, videos };
    }),

  // Get by genre
  getByGenre: publicProcedure
    .input(z.object({ genre: z.string() }))
    .query(async ({ input }) => {
      return SAMPLE_PODCASTS.filter((p) => p.genre === input.genre);
    }),
});
