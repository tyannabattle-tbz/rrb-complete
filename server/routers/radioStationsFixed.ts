import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";

// Sample radio station data
const SAMPLE_STATIONS = [
  {
    id: '1',
    name: 'Rockin Classics',
    description: 'The best of 70s and 80s rock',
    genre: 'Rock',
    year: 1975,
    streamUrl: 'https://example.com/stream/rockin-classics',
    listeners: 1250,
    isLive: true,
  },
  {
    id: '2',
    name: 'Soul & Funk Station',
    description: 'Smooth soul and funk grooves',
    genre: 'Soul',
    year: 1970,
    streamUrl: 'https://example.com/stream/soul-funk',
    listeners: 890,
    isLive: true,
  },
  {
    id: '3',
    name: 'Jazz Heritage',
    description: 'Classic jazz and improvisation',
    genre: 'Jazz',
    year: 1960,
    streamUrl: 'https://example.com/stream/jazz-heritage',
    listeners: 650,
    isLive: false,
  },
  {
    id: '4',
    name: 'Blues Legends',
    description: 'Traditional and modern blues',
    genre: 'Blues',
    year: 1950,
    streamUrl: 'https://example.com/stream/blues-legends',
    listeners: 520,
    isLive: true,
  },
  {
    id: '5',
    name: 'Boogie Nights',
    description: 'High-energy boogie and rhythm',
    genre: 'Boogie',
    year: 1972,
    streamUrl: 'https://example.com/stream/boogie-nights',
    listeners: 1100,
    isLive: true,
  },
];

// Sample current track data
const SAMPLE_TRACKS = {
  '1': {
    id: 'track_1',
    title: 'Rockin Rockin Boogie',
    artist: 'Seabrun Candy Hunter & Little Richard',
    album: 'Legacy Restored',
    duration: 180,
    streamUrl: 'https://example.com/tracks/rockin-rockin-boogie.mp3',
    coverUrl: 'https://example.com/covers/rockin-rockin-boogie.jpg',
  },
  '2': {
    id: 'track_2',
    title: 'Soul Serenade',
    artist: 'Seabrun Candy Hunter',
    album: 'Soul Collection',
    duration: 240,
    streamUrl: 'https://example.com/tracks/soul-serenade.mp3',
    coverUrl: 'https://example.com/covers/soul-serenade.jpg',
  },
  '3': {
    id: 'track_3',
    title: 'Jazz Improvisation #3',
    artist: 'Seabrun Candy Hunter Quartet',
    album: 'Live at the Blue Note',
    duration: 420,
    streamUrl: 'https://example.com/tracks/jazz-improv-3.mp3',
    coverUrl: 'https://example.com/covers/jazz-improv-3.jpg',
  },
  '4': {
    id: 'track_4',
    title: 'Delta Blues',
    artist: 'Seabrun Candy Hunter',
    album: 'Blues Roots',
    duration: 300,
    streamUrl: 'https://example.com/tracks/delta-blues.mp3',
    coverUrl: 'https://example.com/covers/delta-blues.jpg',
  },
  '5': {
    id: 'track_5',
    title: 'Boogie Woogie Piano',
    artist: 'Seabrun Candy Hunter',
    album: 'Piano Sessions',
    duration: 200,
    streamUrl: 'https://example.com/tracks/boogie-woogie.mp3',
    coverUrl: 'https://example.com/covers/boogie-woogie.jpg',
  },
};

export const radioStationsRouter = router({
  // Get all stations (public access)
  getStations: publicProcedure.query(async () => {
    return SAMPLE_STATIONS;
  }),

  // Get single station
  getStation: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return SAMPLE_STATIONS.find((s) => s.id === input.id) || null;
    }),

  // Get current track for a station
  getCurrentTrack: publicProcedure
    .input(z.object({ stationId: z.string() }))
    .query(async ({ input }) => {
      return SAMPLE_TRACKS[input.stationId as keyof typeof SAMPLE_TRACKS] || null;
    }),

  // Play station
  play: publicProcedure
    .input(z.object({ stationId: z.string() }))
    .mutation(async ({ input }) => {
      const station = SAMPLE_STATIONS.find((s) => s.id === input.stationId);
      if (!station) {
        throw new Error('Station not found');
      }
      return {
        success: true,
        station,
        message: `Now playing ${station.name}`,
      };
    }),

  // Search stations
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const query = input.query.toLowerCase();
      return SAMPLE_STATIONS.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.genre.toLowerCase().includes(query)
      );
    }),

  // Get stations by genre
  getByGenre: publicProcedure
    .input(z.object({ genre: z.string() }))
    .query(async ({ input }) => {
      return SAMPLE_STATIONS.filter((s) => s.genre === input.genre);
    }),

  // Get live stations
  getLive: publicProcedure.query(async () => {
    return SAMPLE_STATIONS.filter((s) => s.isLive);
  }),
});
