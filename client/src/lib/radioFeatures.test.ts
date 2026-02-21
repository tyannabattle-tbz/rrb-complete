import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getChannelStats,
  formatListenerCount,
  getTrendingChannels,
} from './listenerStats';
import {
  getFavorites,
  isFavorited,
  addFavorite,
  removeFavorite,
  toggleFavorite,
  clearFavorites,
  getFavoriteCount,
} from './channelFavorites';
import {
  getCurrentQuality,
  setQuality,
  getQualityOptions,
  getQualityDetails,
  convertStreamUrl,
  estimateDataUsage,
  recommendQuality,
  type AudioQuality,
} from './audioQuality';

describe('Listener Stats', () => {
  it('should get channel stats', () => {
    const stats = getChannelStats('funky-radio');
    expect(stats.channelId).toBe('funky-radio');
    expect(stats.listenerCount).toBeGreaterThan(0);
    expect(stats.peakListeners).toBeGreaterThan(0);
    expect(stats.lastUpdated).toBeGreaterThan(0);
  });

  it('should format listener counts correctly', () => {
    expect(formatListenerCount(500)).toBe('500');
    expect(formatListenerCount(1500)).toBe('1.5K');
    expect(formatListenerCount(1500000)).toBe('1.5M');
  });

  it('should get trending channels', () => {
    const trending = getTrendingChannels(['funky-radio', 'drone-zone', 'lush'], 2);
    expect(trending).toHaveLength(2);
    expect(trending[0]).toBeDefined();
  });
});

describe('Channel Favorites', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should get empty favorites initially', () => {
    const favorites = getFavorites();
    expect(favorites).toEqual([]);
  });

  it('should add a favorite', () => {
    const result = addFavorite('funky-radio', 'My Funky Station');
    expect(result).toBe(true);
    expect(isFavorited('funky-radio')).toBe(true);
  });

  it('should not add duplicate favorites', () => {
    addFavorite('funky-radio');
    const result = addFavorite('funky-radio');
    expect(result).toBe(false);
    expect(getFavoriteCount()).toBe(1);
  });

  it('should remove a favorite', () => {
    addFavorite('funky-radio');
    const result = removeFavorite('funky-radio');
    expect(result).toBe(true);
    expect(isFavorited('funky-radio')).toBe(false);
  });

  it('should toggle favorite status', () => {
    toggleFavorite('funky-radio');
    expect(isFavorited('funky-radio')).toBe(true);
    
    toggleFavorite('funky-radio');
    expect(isFavorited('funky-radio')).toBe(false);
  });

  it('should clear all favorites', () => {
    addFavorite('funky-radio');
    addFavorite('drone-zone');
    clearFavorites();
    expect(getFavoriteCount()).toBe(0);
  });

  it('should respect max favorites limit', () => {
    for (let i = 0; i < 25; i++) {
      addFavorite(`channel-${i}`);
    }
    expect(getFavoriteCount()).toBe(20); // MAX_FAVORITES = 20
  });
});

describe('Audio Quality', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should get current quality (default)', () => {
    const quality = getCurrentQuality();
    expect(quality).toBe('192');
  });

  it('should set audio quality', () => {
    setQuality('320');
    expect(getCurrentQuality()).toBe('320');
  });

  it('should get quality options', () => {
    const options = getQualityOptions();
    expect(options).toHaveLength(3);
    expect(options[0].value).toBe('128');
    expect(options[1].value).toBe('192');
    expect(options[2].value).toBe('320');
  });

  it('should get quality details', () => {
    const details = getQualityDetails('128');
    expect(details.label).toBe('128 kbps');
    expect(details.bitrate).toBe(128);
  });

  it('should convert stream URLs to different qualities', () => {
    const url = 'https://ice1.somafm.com/funky-radio-128-mp3';
    expect(convertStreamUrl(url, '192')).toBe('https://ice1.somafm.com/funky-radio-192-mp3');
    expect(convertStreamUrl(url, '320')).toBe('https://ice1.somafm.com/funky-radio-320-mp3');
  });

  it('should estimate data usage', () => {
    const usage128 = estimateDataUsage('128', 60);
    const usage320 = estimateDataUsage('320', 60);
    // 320 should use more data than 128
    expect(parseFloat(usage320)).toBeGreaterThan(parseFloat(usage128));
  });

  it('should recommend quality based on connection', () => {
    expect(recommendQuality('wifi')).toBe('320');
    expect(recommendQuality('4g')).toBe('192');
    expect(recommendQuality('3g')).toBe('128');
  });
});
