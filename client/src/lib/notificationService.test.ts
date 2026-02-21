import { describe, it, expect, beforeEach } from 'vitest';
import { useNotificationStore, initializeNotifications } from './notificationService';

describe('Notification Service', () => {
  beforeEach(() => {
    // Reset store before each test
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
      preferences: {
        enableLiveAlerts: true,
        enableListenerSpike: true,
        enableNewEpisode: true,
        enableMilestones: true,
        listenerSpikeThreshold: 50,
        favoriteChannelsOnly: false,
      },
    });
  });

  it('should add a notification', () => {
    const store = useNotificationStore.getState();
    store.addNotification({
      channelId: 'channel-1',
      channelName: 'Test Channel',
      type: 'live',
      title: 'Channel Live',
      message: 'Test Channel is now live',
    });

    expect(store.notifications).toHaveLength(1);
    expect(store.unreadCount).toBe(1);
    expect(store.notifications[0].title).toBe('Channel Live');
  });

  it('should mark notification as read', () => {
    const store = useNotificationStore.getState();
    store.addNotification({
      channelId: 'channel-1',
      channelName: 'Test Channel',
      type: 'live',
      title: 'Channel Live',
      message: 'Test Channel is now live',
    });

    const notifId = store.notifications[0].id;
    store.markAsRead(notifId);

    expect(store.notifications[0].read).toBe(true);
    expect(store.unreadCount).toBe(0);
  });

  it('should delete notification', () => {
    const store = useNotificationStore.getState();
    store.addNotification({
      channelId: 'channel-1',
      channelName: 'Test Channel',
      type: 'live',
      title: 'Channel Live',
      message: 'Test Channel is now live',
    });

    const notifId = store.notifications[0].id;
    store.deleteNotification(notifId);

    expect(store.notifications).toHaveLength(0);
    expect(store.unreadCount).toBe(0);
  });

  it('should mark all notifications as read', () => {
    const store = useNotificationStore.getState();
    store.addNotification({
      channelId: 'channel-1',
      channelName: 'Test Channel',
      type: 'live',
      title: 'Channel Live',
      message: 'Test Channel is now live',
    });
    store.addNotification({
      channelId: 'channel-2',
      channelName: 'Another Channel',
      type: 'listener-spike',
      title: 'Listener Spike',
      message: 'Listener count increased by 100%',
    });

    store.markAllAsRead();

    expect(store.notifications.every((n) => n.read)).toBe(true);
    expect(store.unreadCount).toBe(0);
  });

  it('should get notifications by channel', () => {
    const store = useNotificationStore.getState();
    store.addNotification({
      channelId: 'channel-1',
      channelName: 'Test Channel',
      type: 'live',
      title: 'Channel Live',
      message: 'Test Channel is now live',
    });
    store.addNotification({
      channelId: 'channel-2',
      channelName: 'Another Channel',
      type: 'live',
      title: 'Another Live',
      message: 'Another Channel is now live',
    });

    const channel1Notifs = store.getNotificationsByChannel('channel-1');
    expect(channel1Notifs).toHaveLength(1);
    expect(channel1Notifs[0].channelId).toBe('channel-1');
  });

  it('should get unread notifications', () => {
    const store = useNotificationStore.getState();
    store.addNotification({
      channelId: 'channel-1',
      channelName: 'Test Channel',
      type: 'live',
      title: 'Channel Live',
      message: 'Test Channel is now live',
    });
    store.addNotification({
      channelId: 'channel-2',
      channelName: 'Another Channel',
      type: 'live',
      title: 'Another Live',
      message: 'Another Channel is now live',
    });

    const notifId = store.notifications[0].id;
    store.markAsRead(notifId);

    const unreadNotifs = store.getUnreadNotifications();
    expect(unreadNotifs).toHaveLength(1);
    expect(unreadNotifs[0].read).toBe(false);
  });

  it('should update preferences', () => {
    const store = useNotificationStore.getState();
    store.updatePreferences({
      enableLiveAlerts: false,
      listenerSpikeThreshold: 75,
    });

    expect(store.preferences.enableLiveAlerts).toBe(false);
    expect(store.preferences.listenerSpikeThreshold).toBe(75);
    expect(store.preferences.enableListenerSpike).toBe(true); // Should remain unchanged
  });

  it('should clear all notifications', () => {
    const store = useNotificationStore.getState();
    store.addNotification({
      channelId: 'channel-1',
      channelName: 'Test Channel',
      type: 'live',
      title: 'Channel Live',
      message: 'Test Channel is now live',
    });
    store.addNotification({
      channelId: 'channel-2',
      channelName: 'Another Channel',
      type: 'live',
      title: 'Another Live',
      message: 'Another Channel is now live',
    });

    store.clearAllNotifications();

    expect(store.notifications).toHaveLength(0);
    expect(store.unreadCount).toBe(0);
  });
});
