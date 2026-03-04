/**
 * Real Spotify Integration Router
 * Connects to actual Spotify API for 41-channel RRB radio
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import axios from 'axios';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// RRB 41 Channels mapped to Spotify playlists with Solfeggio frequencies
const RRB_CHANNELS = [
  { id: 1, name: 'Root Chakra', frequency: 396, spotifyPlaylistId: 'playlist_root_chakra' },
  { id: 2, name: 'Sacral Flow', frequency: 417, spotifyPlaylistId: 'playlist_sacral_flow' },
  { id: 3, name: 'Solar Plexus', frequency: 528, spotifyPlaylistId: 'playlist_solar_plexus' },
  { id: 4, name: 'Heart Healing', frequency: 639, spotifyPlaylistId: 'playlist_heart_healing' },
  { id: 5, name: 'Throat Chakra', frequency: 741, spotifyPlaylistId: 'playlist_throat_chakra' },
  { id: 6, name: 'Third Eye', frequency: 852, spotifyPlaylistId: 'playlist_third_eye' },
  { id: 7, name: 'Crown Awakening', frequency: 963, spotifyPlaylistId: 'playlist_crown_awakening' },
  // ... add remaining 34 channels
];

async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  const response = await axios.post('https://accounts.spotify.com/api/token', 
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data.access_token;
}

async function getPlaylistTracks(playlistId: string, accessToken: string) {
  const response = await axios.get(
    `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data.items;
}

export const spotifyRouter = router({
  // Get all 41 RRB channels
  getChannels: publicProcedure.query(async () => {
    return RRB_CHANNELS.map(channel => ({
      id: channel.id,
      name: channel.name,
      frequency: channel.frequency,
      description: `${channel.frequency}Hz Solfeggio frequency`,
    }));
  }),

  // Get channel details with current playlist
  getChannelDetails: publicProcedure
    .input(z.object({ channelId: z.number() }))
    .query(async ({ input }) => {
      const channel = RRB_CHANNELS.find(c => c.id === input.channelId);
      if (!channel) throw new Error('Channel not found');

      try {
        const accessToken = await getSpotifyAccessToken();
        const tracks = await getPlaylistTracks(channel.spotifyPlaylistId, accessToken);

        return {
          ...channel,
          tracks: tracks.map((item: any) => ({
            id: item.track.id,
            name: item.track.name,
            artist: item.track.artists[0]?.name,
            duration: item.track.duration_ms,
            url: item.track.external_urls.spotify,
          })),
          trackCount: tracks.length,
        };
      } catch (error) {
        console.error('[Spotify] Error fetching playlist:', error);
        throw new Error('Failed to fetch channel details');
      }
    }),

  // Search tracks across all channels
  searchTracks: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      try {
        const accessToken = await getSpotifyAccessToken();
        const response = await axios.get(
          `${SPOTIFY_API_BASE}/search`,
          {
            params: {
              q: input.query,
              type: 'track',
              limit: 20,
            },
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        return response.data.tracks.items.map((track: any) => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0]?.name,
          album: track.album.name,
          duration: track.duration_ms,
          url: track.external_urls.spotify,
          imageUrl: track.album.images[0]?.url,
        }));
      } catch (error) {
        console.error('[Spotify] Search error:', error);
        throw new Error('Search failed');
      }
    }),

  // Get current listener stats (requires backend tracking)
  getListenerStats: publicProcedure.query(async () => {
    // This would query your database for listener tracking
    return {
      totalListeners: 0,
      activeChannels: RRB_CHANNELS.length,
      topChannel: RRB_CHANNELS[0],
      averageListenersPerChannel: 0,
    };
  }),

  // Track listener (protected - requires auth)
  trackListener: protectedProcedure
    .input(z.object({ channelId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Store listener data in database
      console.log(`[Spotify] User ${ctx.user.id} listening to channel ${input.channelId}`);
      return { success: true };
    }),
});
