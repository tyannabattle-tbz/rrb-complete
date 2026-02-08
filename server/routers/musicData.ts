import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";

const ALBUMS = [
  {
    id: 'album_1',
    title: 'Rockin Rockin Boogie',
    artist: 'Seabrun Candy Hunter & Little Richard',
    releaseYear: 1972,
    genre: 'Rock/Soul',
    trackCount: 10,
  },
  {
    id: 'album_2',
    title: 'Soul Collection',
    artist: 'Seabrun Candy Hunter',
    releaseYear: 1974,
    genre: 'Soul',
    trackCount: 12,
  },
  {
    id: 'album_3',
    title: 'Jazz Sessions',
    artist: 'Seabrun Candy Hunter Quartet',
    releaseYear: 1975,
    genre: 'Jazz',
    trackCount: 8,
  },
  {
    id: 'album_4',
    title: 'Blues Roots',
    artist: 'Seabrun Candy Hunter',
    releaseYear: 1976,
    genre: 'Blues',
    trackCount: 11,
  },
];

const SONGS = [
  {
    id: 'song_1',
    title: 'Rockin Rockin Boogie',
    artist: 'Seabrun Candy Hunter & Little Richard',
    album: 'Rockin Rockin Boogie',
    duration: 180,
    releaseYear: 1972,
    genre: 'Rock/Soul',
  },
  {
    id: 'song_2',
    title: 'Soul Serenade',
    artist: 'Seabrun Candy Hunter',
    album: 'Soul Collection',
    duration: 240,
    releaseYear: 1974,
    genre: 'Soul',
  },
  {
    id: 'song_3',
    title: 'Midnight Blues',
    artist: 'Seabrun Candy Hunter',
    album: 'Blues Roots',
    duration: 300,
    releaseYear: 1976,
    genre: 'Blues',
  },
  {
    id: 'song_4',
    title: 'Jazz Improvisation #1',
    artist: 'Seabrun Candy Hunter Quartet',
    album: 'Jazz Sessions',
    duration: 420,
    releaseYear: 1975,
    genre: 'Jazz',
  },
  {
    id: 'song_5',
    title: 'Boogie Woogie Piano',
    artist: 'Seabrun Candy Hunter',
    album: 'Rockin Rockin Boogie',
    duration: 200,
    releaseYear: 1972,
    genre: 'Rock/Soul',
  },
  {
    id: 'song_6',
    title: 'Love Song',
    artist: 'Seabrun Candy Hunter',
    album: 'Soul Collection',
    duration: 280,
    releaseYear: 1974,
    genre: 'Soul',
  },
];

const CREDITS = [
  {
    role: 'Lead Vocals',
    name: 'Seabrun Candy Hunter',
    description: 'Primary vocalist and composer',
  },
  {
    role: 'Piano & Keys',
    name: 'Seabrun Candy Hunter',
    description: 'Keyboard arrangements and production',
  },
  {
    role: 'Guest Artist',
    name: 'Little Richard',
    description: 'Featured on Rockin Rockin Boogie',
  },
  {
    role: 'Producer',
    name: 'Canryn Production',
    description: 'Album production and engineering',
  },
];

const AWARDS = [
  {
    title: 'Best Soul Album',
    organization: 'Music Heritage Awards',
    year: '1975',
    description: 'Recognition for Soul Collection',
  },
  {
    title: 'Legacy Achievement',
    organization: 'Rockin Music Foundation',
    year: '2024',
    description: 'Lifetime contribution to music',
  },
];

export const musicDataRouter = router({
  getAlbums: publicProcedure.query(async () => {
    return ALBUMS;
  }),

  getAlbumById: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return ALBUMS.find((a) => a.id === input);
    }),

  getSongs: publicProcedure.query(async () => {
    return SONGS;
  }),

  getSongById: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return SONGS.find((s) => s.id === input);
    }),

  getSongsByAlbum: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return SONGS.filter((s) => s.album === input);
    }),

  getSongsByGenre: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return SONGS.filter((s) => s.genre === input);
    }),

  getSongsByYear: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return SONGS.filter((s) => s.releaseYear === input);
    }),

  getCredits: publicProcedure.query(async () => {
    return CREDITS;
  }),

  getAwards: publicProcedure.query(async () => {
    return AWARDS;
  }),

  searchSongs: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const query = input.toLowerCase();
      return SONGS.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.artist.toLowerCase().includes(query) ||
          s.album.toLowerCase().includes(query)
      );
    }),
});
