import { create } from 'zustand';

export interface ChannelNotification {
  id: string;
  channelId: string;
  channelName: string;
  type: 'live' | 'listener-spike' | 'new-episode' | 'milestone';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
}

export interface NotificationPreferences {
  enableLiveAlerts: boolean;
  enableListenerSpike: boolean;
  enableNewEpisode: boolean;
  enableMilestones: boolean;
  listenerSpikeThreshold: number; // percentage increase
  favoriteChannelsOnly: boolean;
}

interface NotificationStore {
  notifications: ChannelNotification[];
  preferences: NotificationPreferences;
  unreadCount: number;
  
  // Actions
  addNotification: (notification: Omit<ChannelNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  getNotificationsByChannel: (channelId: string) => ChannelNotification[];
  getUnreadNotifications: () => ChannelNotification[];
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enableLiveAlerts: true,
  enableListenerSpike: true,
  enableNewEpisode: true,
  enableMilestones: true,
  listenerSpikeThreshold: 50, // 50% increase
  favoriteChannelsOnly: false,
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  preferences: DEFAULT_PREFERENCES,
  unreadCount: 0,

  addNotification: (notification) => {
    const newNotification: ChannelNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      read: false,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 100), // Keep last 100
      unreadCount: state.unreadCount + 1,
    }));

    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '🔔',
        tag: notification.channelId,
      });
    }
  },

  markAsRead: (notificationId) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === notificationId);
      if (!notification || notification.read) return state;

      return {
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  deleteNotification: (notificationId) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === notificationId);
      return {
        notifications: state.notifications.filter((n) => n.id !== notificationId),
        unreadCount: notification && !notification.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    });
  },

  clearAllNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  updatePreferences: (newPreferences) => {
    set((state) => ({
      preferences: { ...state.preferences, ...newPreferences },
    }));
    // Persist to localStorage
    localStorage.setItem('notificationPreferences', JSON.stringify(get().preferences));
  },

  getNotificationsByChannel: (channelId) => {
    return get().notifications.filter((n) => n.channelId === channelId);
  },

  getUnreadNotifications: () => {
    return get().notifications.filter((n) => !n.read);
  },
}));

// Load preferences from localStorage on init
export function initializeNotifications() {
  const stored = localStorage.getItem('notificationPreferences');
  if (stored) {
    try {
      const preferences = JSON.parse(stored);
      useNotificationStore.setState({ preferences });
    } catch (e) {
      console.error('Failed to load notification preferences', e);
    }
  }

  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}
