import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";

// Sample discography data
const SAMPLE_ALBUMS = [
  {
    id: 'album_1',
    title: 'Rockin Rockin Boogie',
    artist: 'Seabrun Candy Hunter & Little Richard',
    releaseYear: 1972,
    genre: 'Rock/Soul',
    coverUrl: 'https://example.com/covers/rockin-rockin-boogie.jpg',
    description: 'The iconic album that defined an era',
    trackCount: 10,
  },
  {
    id: 'album_2',
    title: 'Soul Collection',
    artist: 'Seabrun Candy Hunter',
    releaseYear: 1974,
    genre: 'Soul',
    coverUrl: 'https://example.com/covers/soul-collection.jpg',
    description: 'A collection of soulful performances',
    trackCount: 12,
  },
  {
    id: 'album_3',
    title: 'Jazz Sessions',
    artist: 'Seabrun Candy Hunter Quartet',
    releaseYear: 1975,
    genre: 'Jazz',
    coverUrl: 'https://example.com/covers/jazz-sessions.jpg',
    description: 'Live jazz performances and improvisations',
    trackCount: 8,
  },
  {
    id: 'album_4',
    title: 'Blues Roots',
    artist: 'Seabrun Candy Hunter',
    releaseYear: 1976,
    genre: 'Blues',
    coverUrl: 'https://example.com/covers/blues-roots.jpg',
    description: 'Traditional and modern blues interpretations',
    trackCount: 11,
  },
];

// Sample songs
const SAMPLE_SONGS = [
  {
    id: 'song_1',
    title: 'Rockin Rockin Boogie',
    artist: 'Seabrun Candy Hunter & Little Richard',
    album: 'Rockin Rockin Boogie',
    albumId: 'album_1',
    duration: 180,
    releaseYear: 1972,
    genre: 'Rock/Soul',
    audioUrl: 'https://example.com/tracks/rockin-rockin-boogie.mp3',
    lyrics: 'Get ready to rock and roll...',
  },
  {
    id: 'song_2',
    title: 'Soul Serenade',
    artist: 'Seabrun Candy Hunter',
    album: 'Soul Collection',
    albumId: 'album_2',
    duration: 240,
    releaseYear: 1974,
    genre: 'Soul',
    audioUrl: 'https://example.com/tracks/soul-serenade.mp3',
    lyrics: 'A soulful melody...',
  },
  {
    id: 'song_3',
    title: 'Midnight Blues',
    artist: 'Seabrun Candy Hunter',
    album: 'Blues Roots',
    albumId: 'album_4',
    duration: 300,
    releaseYear: 1976,
    genre: 'Blues',
    audioUrl: 'https://example.com/tracks/midnight-blues.mp3',
    lyrics: 'The midnight blues...',
  },
  {
    id: 'song_4',
    title: 'Jazz Improvisation #1',
    artist: 'Seabrun Candy Hunter Quartet',
    album: 'Jazz Sessions',
    albumId: 'album_3',
    duration: 420,
    releaseYear: 1975,
    genre: 'Jazz',
    audioUrl: 'https://example.com/tracks/jazz-improv-1.mp3',
    lyrics: 'Instrumental',
  },
  {
    id: 'song_5',
    title: 'Boogie Woogie Piano',
    artist: 'Seabrun Candy Hunter',
    album: 'Rockin Rockin Boogie',
    albumId: 'album_1',
    duration: 200,
    releaseYear: 1972,
    genre: 'Rock/Soul',
    audioUrl: 'https://example.com/tracks/boogie-woogie.mp3',
    lyrics: 'Instrumental',
  },
  {
    id: 'song_6',
    title: 'Love Song',
    artist: 'Seabrun Candy Hunter',
    album: 'Soul Collection',
    albumId: 'album_2',
    duration: 280,
    releaseYear: 1974,
    genre: 'Soul',
    audioUrl: 'https://example.com/tracks/love-song.mp3',
    lyrics: 'A love song for you...',
  },
];

export const musicRouter = router({
  // Get all albums
  getAlbums: publicProcedure.query(async () => {
    return SAMPLE_ALBUMS;
  }),

  // Get single album
  getAlbum: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return SAMPLE_ALBUMS.find((a) => a.id === input.id) || null;
    }),

  // Get all songs
  getSongs: publicProcedure.query(async () => {
    return SAMPLE_SONGS;
  }),

  // Get songs by album
  getSongsByAlbum: publicProcedure
    .input(z.object({ albumId: z.string() }))
    .query(async ({ input }) => {
      return SAMPLE_SONGS.filter((s) => s.albumId === input.albumId);
    }),

  // Get single song
  getSong: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return SAMPLE_SONGS.find((s) => s.id === input.id) || null;
    }),

  // Search songs
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const query = input.query.toLowerCase();
      return SAMPLE_SONGS.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.artist.toLowerCase().includes(query) ||
          s.album.toLowerCase().includes(query)
      );
    }),

  // Get by genre
  getByGenre: publicProcedure
    .input(z.object({ genre: z.string() }))
    .query(async ({ input }) => {
      return SAMPLE_SONGS.filter((s) => s.genre === input.genre);
    }),

  // Get by year
  getByYear: publicProcedure
    .input(z.object({ year: z.number() }))
    .query(async ({ input }) => {
      return SAMPLE_SONGS.filter((s) => s.releaseYear === input.year);
    }),

  // Get discography (all albums and songs)
  getDiscography: publicProcedure.query(async () => {
    return {
      albums: SAMPLE_ALBUMS,
      songs: SAMPLE_SONGS,
      totalAlbums: SAMPLE_ALBUMS.length,
      totalSongs: SAMPLE_SONGS.length,
    };
  }),
});
