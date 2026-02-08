import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";

// Sample radio station data
const RADIO_STATIONS = [
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

const TRACKS = [
  {
    id: 'track_1',
    title: 'Rockin Rockin Boogie',
    artist: 'Seabrun Candy Hunter & Little Richard',
    album: 'Legacy Restored',
    duration: 180,
    streamUrl: 'https://example.com/tracks/rockin-rockin-boogie.mp3',
  },
  {
    id: 'track_2',
    title: 'Soul Serenade',
    artist: 'Seabrun Candy Hunter',
    album: 'Soul Collection',
    duration: 240,
    streamUrl: 'https://example.com/tracks/soul-serenade.mp3',
  },
  {
    id: 'track_3',
    title: 'Jazz Improvisation #3',
    artist: 'Seabrun Candy Hunter Quartet',
    album: 'Live at the Blue Note',
    duration: 420,
    streamUrl: 'https://example.com/tracks/jazz-improv-3.mp3',
  },
  {
    id: 'track_4',
    title: 'Delta Blues',
    artist: 'Seabrun Candy Hunter',
    album: 'Blues Roots',
    duration: 300,
    streamUrl: 'https://example.com/tracks/delta-blues.mp3',
  },
  {
    id: 'track_5',
    title: 'Boogie Woogie Piano',
    artist: 'Seabrun Candy Hunter',
    album: 'Piano Sessions',
    duration: 200,
    streamUrl: 'https://example.com/tracks/boogie-woogie.mp3',
  },
];

export const radioStationsDataRouter = router({
  getStations: publicProcedure.query(async () => {
    return RADIO_STATIONS;
  }),

  getStationById: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return RADIO_STATIONS.find((s) => s.id === input);
    }),

  getTracks: publicProcedure.query(async () => {
    return TRACKS;
  }),

  getTrackById: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return TRACKS.find((t) => t.id === input);
    }),

  getTracksByGenre: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return TRACKS.filter((t) => {
        const station = RADIO_STATIONS.find((s) => s.genre === input);
        return station ? true : false;
      });
    }),
});
