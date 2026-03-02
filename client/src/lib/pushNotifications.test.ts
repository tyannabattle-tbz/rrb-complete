import { describe, it, expect, beforeEach, vi } from 'vitest';
import { pushNotifications } from './pushNotifications';

describe('Push Notifications Service', () => {
  beforeEach(() => {
    // Mock browser APIs
    global.navigator = {
      serviceWorker: {
        ready: Promise.resolve({} as any),
      },
    } as any;

    global.Notification = {
      permission: 'granted',
      requestPermission: vi.fn(() => Promise.resolve('granted')),
    } as any;

    global.window = {
      PushManager: {},
    } as any;
  });

  it('should initialize push notifications', async () => {
    const result = await pushNotifications.init();
    expect(result).toBe(true);
  });

  it('should check if notifications are enabled', () => {
    const enabled = pushNotifications.isEnabled();
    expect(enabled).toBe(true);
  });

  it('should request notification permission', async () => {
    const permission = await pushNotifications.requestPermission();
    expect(permission).toBe('granted');
  });

  it('should handle critical alerts', async () => {
    await expect(
      pushNotifications.sendCriticalAlert('Test Alert', 'This is a test alert')
    ).resolves.not.toThrow();
  });

  it('should handle broadcast notifications', async () => {
    await expect(
      pushNotifications.sendBroadcastNotification(
        'Test Broadcast',
        'Test content',
        'critical'
      )
    ).resolves.not.toThrow();
  });

  it('should handle network notifications', async () => {
    await expect(
      pushNotifications.sendNetworkNotification('online', 'Network is online')
    ).resolves.not.toThrow();
  });

  it('should handle sync notifications', async () => {
    await expect(
      pushNotifications.sendSyncNotification(5, 'success')
    ).resolves.not.toThrow();
  });
});
