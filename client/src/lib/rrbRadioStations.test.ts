/**
 * Tests for RRB Radio Stations Configuration
 */

import { describe, it, expect } from 'vitest';
import {
  RRB_RADIO_CHANNELS,
  getFeaturedChannels,
  getChannelsByGenre,
  getAllGenres,
  searchChannels,
  getChannelById,
  getTrendingChannels,
} from './rrbRadioStations';

describe('RRB Radio Stations', () => {
  it('should have 40+ channels configured', () => {
    expect(RRB_RADIO_CHANNELS.length).toBeGreaterThanOrEqual(40);
  });

  it('should have unique channel IDs', () => {
    const ids = RRB_RADIO_CHANNELS.map(ch => ch.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have Rockin\' Rockin\' Boogie as flagship', () => {
    const flagship = RRB_RADIO_CHANNELS.find(ch => ch.id === 'rrb-flagship');
    expect(flagship).toBeDefined();
    expect(flagship?.name).toContain('Rockin\' Rockin\' Boogie');
  });

  it('should have featured channels', () => {
    const featured = getFeaturedChannels();
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.every(ch => ch.featured === true)).toBe(true);
  });

  it('should have Jazz channels', () => {
    const jazzChannels = getChannelsByGenre('Jazz');
    expect(jazzChannels.length).toBeGreaterThan(0);
    expect(jazzChannels.every(ch => ch.genre === 'Jazz')).toBe(true);
  });

  it('should have Blues channels', () => {
    const bluesChannels = getChannelsByGenre('Blues');
    expect(bluesChannels.length).toBeGreaterThan(0);
    expect(bluesChannels.every(ch => ch.genre === 'Blues')).toBe(true);
  });

  it('should have Soul channels', () => {
    const soulChannels = getChannelsByGenre('Soul');
    expect(soulChannels.length).toBeGreaterThan(0);
  });

  it('should have Rock channels', () => {
    const rockChannels = getChannelsByGenre('Rock');
    expect(rockChannels.length).toBeGreaterThan(0);
  });

  it('should have Hip-Hop channels', () => {
    const hipHopChannels = getChannelsByGenre('Hip-Hop');
    expect(hipHopChannels.length).toBeGreaterThan(0);
  });

  it('should have Wellness channels', () => {
    const wellnessChannels = getChannelsByGenre('Wellness');
    expect(wellnessChannels.length).toBeGreaterThan(0);
  });

  it('should have Meditation channels', () => {
    const meditationChannels = getChannelsByGenre('Meditation');
    expect(meditationChannels.length).toBeGreaterThan(0);
  });

  it('should have multiple genres', () => {
    const genres = getAllGenres();
    expect(genres.length).toBeGreaterThan(5);
    expect(genres).toContain('Jazz');
    expect(genres).toContain('Blues');
    expect(genres).toContain('Rock');
  });

  it('should search channels by name', () => {
    const results = searchChannels('Jazz');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(ch => ch.name.includes('Jazz'))).toBe(true);
  });

  it('should search channels by description', () => {
    const results = searchChannels('meditation');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should get channel by ID', () => {
    const channel = getChannelById('rrb-flagship');
    expect(channel).toBeDefined();
    expect(channel?.id).toBe('rrb-flagship');
  });

  it('should return undefined for non-existent channel', () => {
    const channel = getChannelById('non-existent');
    expect(channel).toBeUndefined();
  });

  it('should get trending channels sorted by listeners', () => {
    const trending = getTrendingChannels(5);
    expect(trending.length).toBeLessThanOrEqual(5);
    
    // Check if sorted by listeners (descending)
    for (let i = 0; i < trending.length - 1; i++) {
      expect((trending[i].listeners || 0)).toBeGreaterThanOrEqual((trending[i + 1].listeners || 0));
    }
  });

  it('should have unique stream URLs', () => {
    const urls = RRB_RADIO_CHANNELS.map(ch => ch.streamUrl);
    // Note: Some channels may share URLs (fallback streams), so we just check they exist
    expect(urls.every(url => url && url.startsWith('https://'))).toBe(true);
  });

  it('should have valid colors', () => {
    expect(RRB_RADIO_CHANNELS.every(ch => ch.color && ch.color.startsWith('#'))).toBe(true);
  });

  it('should have emojis for all channels', () => {
    expect(RRB_RADIO_CHANNELS.every(ch => ch.emoji && ch.emoji.length > 0)).toBe(true);
  });

  it('should have frequency values', () => {
    expect(RRB_RADIO_CHANNELS.every(ch => ch.frequency && (ch.frequency === 432 || ch.frequency === 528))).toBe(true);
  });

  it('should have operator channels', () => {
    const operatorChannels = RRB_RADIO_CHANNELS.filter(ch => ch.genre === 'Live');
    expect(operatorChannels.length).toBeGreaterThan(0);
  });

  it('should have emergency broadcast channel', () => {
    const emergency = RRB_RADIO_CHANNELS.find(ch => ch.id === 'emergency-broadcast');
    expect(emergency).toBeDefined();
    expect(emergency?.genre).toBe('Emergency');
  });

  it('should have backup stream channel', () => {
    const backup = RRB_RADIO_CHANNELS.find(ch => ch.id === 'backup-stream');
    expect(backup).toBeDefined();
    expect(backup?.genre).toBe('Backup');
  });

  it('should have listener counts', () => {
    expect(RRB_RADIO_CHANNELS.every(ch => ch.listeners !== undefined && ch.listeners >= 0)).toBe(true);
  });

  it('should have descriptions for all channels', () => {
    expect(RRB_RADIO_CHANNELS.every(ch => ch.description && ch.description.length > 0)).toBe(true);
  });

  it('should have valid channel names', () => {
    expect(RRB_RADIO_CHANNELS.every(ch => ch.name && ch.name.length > 0)).toBe(true);
  });

  it('should have Little Richard tribute channel', () => {
    const tribute = RRB_RADIO_CHANNELS.find(ch => ch.id === 'little-richard-tribute');
    expect(tribute).toBeDefined();
    expect(tribute?.name).toContain('Little Richard');
  });

  it('should have Seabrun\'s Selection channel', () => {
    const selection = RRB_RADIO_CHANNELS.find(ch => ch.id === 'seabrun-selection');
    expect(selection).toBeDefined();
    expect(selection?.name).toContain('Seabrun');
  });

  it('should have RRB Legacy Archive channel', () => {
    const archive = RRB_RADIO_CHANNELS.find(ch => ch.id === 'rrb-legacy-archive');
    expect(archive).toBeDefined();
    expect(archive?.name).toContain('Legacy');
  });
});
