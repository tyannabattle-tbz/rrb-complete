import { describe, it, expect, beforeEach } from 'vitest';
import {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  isFavorited,
  getFavoriteCount,
  clearAllFavorites,
  exportFavoritesAsJSON,
  importFavoritesFromJSON,
} from './favoritesService';

describe('Favorites Service', () => {
  const userId = 1;
  const channelId = 'test-channel';
  const channelName = 'Test Channel';
  const genre = 'Jazz';

  beforeEach(async () => {
    // Clear favorites before each test
    await clearAllFavorites(userId).catch(() => {});
  });

  it('should add a favorite channel', async () => {
    const result = await addFavorite(userId, channelId, channelName, genre);
    expect(result).toBeDefined();
    expect(result.channelId).toBe(channelId);
    expect(result.channelName).toBe(channelName);
  });

  it('should check if channel is favorited', async () => {
    await addFavorite(userId, channelId, channelName, genre);
    const favorited = await isFavorited(userId, channelId);
    expect(favorited).toBe(true);
  });

  it('should remove a favorite channel', async () => {
    await addFavorite(userId, channelId, channelName, genre);
    const removed = await removeFavorite(userId, channelId);
    expect(removed).toBe(true);

    const favorited = await isFavorited(userId, channelId);
    expect(favorited).toBe(false);
  });

  it('should get user favorites', async () => {
    await addFavorite(userId, 'channel-1', 'Channel 1', 'Jazz');
    await addFavorite(userId, 'channel-2', 'Channel 2', 'Blues');

    const favorites = await getUserFavorites(userId);
    expect(favorites.length).toBe(2);
  });

  it('should get favorite count', async () => {
    await addFavorite(userId, 'channel-1', 'Channel 1', 'Jazz');
    await addFavorite(userId, 'channel-2', 'Channel 2', 'Blues');

    const count = await getFavoriteCount(userId);
    expect(count).toBe(2);
  });

  it('should export favorites as JSON', async () => {
    await addFavorite(userId, 'channel-1', 'Channel 1', 'Jazz');
    const json = await exportFavoritesAsJSON(userId);
    const parsed = JSON.parse(json);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
  });

  it('should import favorites from JSON', async () => {
    const jsonData = JSON.stringify([
      { channelId: 'channel-1', channelName: 'Channel 1', genre: 'Jazz' },
      { channelId: 'channel-2', channelName: 'Channel 2', genre: 'Blues' },
    ]);

    const imported = await importFavoritesFromJSON(userId, jsonData);
    expect(imported.length).toBe(2);

    const count = await getFavoriteCount(userId);
    expect(count).toBe(2);
  });

  it('should clear all favorites', async () => {
    await addFavorite(userId, 'channel-1', 'Channel 1', 'Jazz');
    await addFavorite(userId, 'channel-2', 'Channel 2', 'Blues');

    const cleared = await clearAllFavorites(userId);
    expect(cleared).toBe(true);

    const count = await getFavoriteCount(userId);
    expect(count).toBe(0);
  });

  it('should handle errors gracefully', async () => {
    const result = await getUserFavorites(999);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});
