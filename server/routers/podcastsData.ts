import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";

const PODCASTS = [
  {
    id: '1',
    title: 'The Legacy Podcast',
    description: 'Deep dive into the Rockin Rockin Boogie story',
    artist: 'Seabrun Candy Hunter',
    episodeCount: 12,
    duration: 45,
    views: 2500,
  },
  {
    id: '2',
    title: 'Soul Sessions',
    description: 'Exploring soul music and its impact',
    artist: 'Seabrun Candy Hunter',
    episodeCount: 8,
    duration: 60,
    views: 1800,
  },
  {
    id: '3',
    title: 'Boogie Conversations',
    description: 'Interviews with musicians and producers',
    artist: 'Seabrun Candy Hunter',
    episodeCount: 15,
    duration: 50,
    views: 3200,
  },
];

const VIDEOS = [
  {
    id: 'vid_1',
    title: 'Rockin Rockin Boogie - Official Video',
    description: 'The iconic performance',
    artist: 'Seabrun Candy Hunter & Little Richard',
    duration: 4,
    views: 15000,
  },
  {
    id: 'vid_2',
    title: 'Behind the Scenes - Studio Sessions',
    description: 'Recording the album',
    artist: 'Seabrun Candy Hunter',
    duration: 8,
    views: 8500,
  },
  {
    id: 'vid_3',
    title: 'Live Performance - Jazz Festival 1975',
    description: 'Historic live performance',
    artist: 'Seabrun Candy Hunter Quartet',
    duration: 20,
    views: 12000,
  },
];

export const podcastsDataRouter = router({
  getPodcasts: publicProcedure.query(async () => {
    return PODCASTS;
  }),

  getPodcastById: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return PODCASTS.find((p) => p.id === input);
    }),

  getVideos: publicProcedure.query(async () => {
    return VIDEOS;
  }),

  getVideoById: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return VIDEOS.find((v) => v.id === input);
    }),

  searchContent: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const query = input.toLowerCase();
      const podcasts = PODCASTS.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
      const videos = VIDEOS.filter(
        (v) =>
          v.title.toLowerCase().includes(query) ||
          v.description.toLowerCase().includes(query)
      );
      return { podcasts, videos };
    }),
});
