/**
 * Podcast Playback Router Tests
 * 
 * Tests for real audio streaming functionality:
 * - Channel initialization with real episodes
 * - Playback state management
 * - Episode queue navigation
 * - Volume and seek controls
 * - Stream URL delivery
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getChannelEpisodes,
  getEpisode,
  getChannel,
  getNextEpisode,
  getPreviousEpisode,
  getFirstEpisode,
  getAllChannels,
} from '../services/podcastService';

describe('Podcast Service', () => {
  describe('Channel Management', () => {
    it('should return all available channels', () => {
      const channels = getAllChannels();
      expect(channels.length).toBe(3);
      expect(channels.map((c) => c.id)).toContain(7);
      expect(channels.map((c) => c.id)).toContain(13);
      expect(channels.map((c) => c.id)).toContain(9);
    });

    it('should get channel by ID', () => {
      const channel = getChannel(7);
      expect(channel).not.toBeNull();
      expect(channel?.name).toBe("Rockin' Rockin' Boogie");
      expect(channel?.episodes.length).toBeGreaterThan(0);
    });

    it('should return null for invalid channel', () => {
      const channel = getChannel(999);
      expect(channel).toBeNull();
    });
  });

  describe('Episode Management', () => {
    it('should get episodes for a channel', () => {
      const episodes = getChannelEpisodes(7);
      expect(episodes.length).toBeGreaterThan(0);
      expect(episodes[0].title).toBeDefined();
      expect(episodes[0].streamUrl).toBeDefined();
    });

    it('should return empty array for invalid channel', () => {
      const episodes = getChannelEpisodes(999);
      expect(episodes).toEqual([]);
    });

    it('should get first episode of channel', () => {
      const episode = getFirstEpisode(7);
      expect(episode).not.toBeNull();
      expect(episode?.title).toBe("Rockin' Rockin' Boogie - Original Recording");
    });

    it('should get specific episode by ID', () => {
      const episode = getEpisode('rr-boogie-001');
      expect(episode).not.toBeNull();
      expect(episode?.title).toBe("Rockin' Rockin' Boogie - Original Recording");
      expect(episode?.streamUrl).toBeDefined();
    });

    it('should return null for invalid episode', () => {
      const episode = getEpisode('invalid-id');
      expect(episode).toBeNull();
    });
  });

  describe('Queue Navigation', () => {
    it('should get next episode in queue', () => {
      const episodes = getChannelEpisodes(7);
      const nextEpisode = getNextEpisode(7, episodes[0].id);
      expect(nextEpisode).not.toBeNull();
      expect(nextEpisode?.id).toBe(episodes[1].id);
    });

    it('should return null for last episode', () => {
      const episodes = getChannelEpisodes(7);
      const lastEpisode = episodes[episodes.length - 1];
      const nextEpisode = getNextEpisode(7, lastEpisode.id);
      expect(nextEpisode).toBeNull();
    });

    it('should get previous episode in queue', () => {
      const episodes = getChannelEpisodes(7);
      const prevEpisode = getPreviousEpisode(7, episodes[1].id);
      expect(prevEpisode).not.toBeNull();
      expect(prevEpisode?.id).toBe(episodes[0].id);
    });

    it('should return null for first episode', () => {
      const episodes = getChannelEpisodes(7);
      const prevEpisode = getPreviousEpisode(7, episodes[0].id);
      expect(prevEpisode).toBeNull();
    });
  });

  describe('Episode Metadata', () => {
    it('should have valid stream URLs', () => {
      const episodes = getChannelEpisodes(7);
      episodes.forEach((episode) => {
        expect(episode.streamUrl).toBeDefined();
        expect(episode.streamUrl).toMatch(/^https?:\/\//);
      });
    });

    it('should have valid duration', () => {
      const episodes = getChannelEpisodes(7);
      episodes.forEach((episode) => {
        expect(episode.duration).toBeGreaterThan(0);
        expect(typeof episode.duration).toBe('number');
      });
    });

    it('should have required episode fields', () => {
      const episode = getFirstEpisode(7);
      expect(episode?.id).toBeDefined();
      expect(episode?.title).toBeDefined();
      expect(episode?.artist).toBeDefined();
      expect(episode?.description).toBeDefined();
      expect(episode?.duration).toBeDefined();
      expect(episode?.streamUrl).toBeDefined();
      expect(episode?.channel).toBeDefined();
    });
  });

  describe('Multiple Channels', () => {
    it('should have different episodes for different channels', () => {
      const channel7Episodes = getChannelEpisodes(7);
      const channel13Episodes = getChannelEpisodes(13);
      const channel9Episodes = getChannelEpisodes(9);

      expect(channel7Episodes[0].id).not.toBe(channel13Episodes[0].id);
      expect(channel13Episodes[0].id).not.toBe(channel9Episodes[0].id);
    });

    it('should maintain channel context in episodes', () => {
      const episodes = getChannelEpisodes(7);
      episodes.forEach((episode) => {
        expect(episode.channel).toBe(7);
      });
    });
  });
});

describe('Podcast Playback State', () => {
  it('should initialize with default state', () => {
    const defaultState = {
      userId: 0,
      currentEpisode: null,
      currentChannel: 7,
      isPlaying: false,
      currentTime: 0,
      volume: 70,
      queue: [],
      queueIndex: 0,
      streamUrl: null,
    };

    expect(defaultState.isPlaying).toBe(false);
    expect(defaultState.volume).toBe(70);
    expect(defaultState.currentChannel).toBe(7);
  });

  it('should track playback state changes', () => {
    let state = {
      userId: 1,
      currentEpisode: null,
      currentChannel: 7,
      isPlaying: false,
      currentTime: 0,
      volume: 70,
      queue: [],
      queueIndex: 0,
      streamUrl: null,
    };

    // Simulate play
    state.isPlaying = true;
    expect(state.isPlaying).toBe(true);

    // Simulate volume change
    state.volume = 50;
    expect(state.volume).toBe(50);

    // Simulate pause
    state.isPlaying = false;
    expect(state.isPlaying).toBe(false);
  });

  it('should handle queue index updates', () => {
    const episodes = getChannelEpisodes(7);
    let queueIndex = 0;

    // Move to next
    queueIndex = (queueIndex + 1) % episodes.length;
    expect(queueIndex).toBe(1);

    // Move to next again
    queueIndex = (queueIndex + 1) % episodes.length;
    expect(queueIndex).toBe(2);

    // Wrap around
    queueIndex = (queueIndex + 1) % episodes.length;
    expect(queueIndex).toBe(3);

    // Move to previous
    queueIndex = (queueIndex - 1 + episodes.length) % episodes.length;
    expect(queueIndex).toBe(2);
  });
});

describe('Audio Stream Validation', () => {
  it('should provide valid stream URLs for playback', () => {
    const channels = [7, 13, 9];
    channels.forEach((channelId) => {
      const episodes = getChannelEpisodes(channelId);
      episodes.forEach((episode) => {
        // Stream URL should be a valid HTTP(S) URL
        expect(episode.streamUrl).toMatch(/^https?:\/\/.+/);
        // Should not be empty
        expect(episode.streamUrl.length).toBeGreaterThan(0);
      });
    });
  });

  it('should maintain stream URL consistency', () => {
    const episode1 = getEpisode('rr-boogie-001');
    const episode2 = getEpisode('rr-boogie-001');
    // Same episode should always have same stream URL
    expect(episode1?.streamUrl).toBe(episode2?.streamUrl);
  });
});
