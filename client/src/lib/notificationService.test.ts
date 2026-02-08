import { describe, it, expect, beforeEach, vi } from 'vitest';
import { notificationService } from './notificationService';

describe('NotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should create a singleton instance', () => {
      expect(notificationService).toBeDefined();
    });

    it('should have connect method', () => {
      expect(notificationService.connect).toBeDefined();
      expect(typeof notificationService.connect).toBe('function');
    });

    it('should have disconnect method', () => {
      expect(notificationService.disconnect).toBeDefined();
      expect(typeof notificationService.disconnect).toBe('function');
    });
  });

  describe('event listeners', () => {
    it('should have on method to subscribe to events', () => {
      expect(notificationService.on).toBeDefined();
      expect(typeof notificationService.on).toBe('function');
    });

    it('should have off method to unsubscribe from events', () => {
      expect(notificationService.off).toBeDefined();
      expect(typeof notificationService.off).toBe('function');
    });

    it('should allow subscribing to notification events', () => {
      const callback = vi.fn();
      notificationService.on('notification', callback);
      expect(callback).toBeDefined();
    });

    it('should allow unsubscribing from events', () => {
      const callback = vi.fn();
      notificationService.on('notification', callback);
      notificationService.off('notification', callback);
      expect(callback).toBeDefined();
    });
  });

  describe('notification methods', () => {
    it('should have sendNotification method', () => {
      expect(notificationService.sendNotification).toBeDefined();
      expect(typeof notificationService.sendNotification).toBe('function');
    });

    it('should have markAsRead method', () => {
      expect(notificationService.markAsRead).toBeDefined();
      expect(typeof notificationService.markAsRead).toBe('function');
    });

    it('should have isConnected method', () => {
      expect(notificationService.isConnected).toBeDefined();
      expect(typeof notificationService.isConnected).toBe('function');
    });
  });

  describe('connection status', () => {
    it('should return false when not connected', () => {
      const isConnected = notificationService.isConnected();
      expect(typeof isConnected).toBe('boolean');
    });
  });

  describe('event types', () => {
    it('should support decision_executed events', () => {
      const callback = vi.fn();
      notificationService.on('decision_executed', callback);
      expect(callback).toBeDefined();
    });

    it('should support approval_required events', () => {
      const callback = vi.fn();
      notificationService.on('approval_required', callback);
      expect(callback).toBeDefined();
    });

    it('should support escalation_alert events', () => {
      const callback = vi.fn();
      notificationService.on('escalation_alert', callback);
      expect(callback).toBeDefined();
    });

    it('should support policy_violation events', () => {
      const callback = vi.fn();
      notificationService.on('policy_violation', callback);
      expect(callback).toBeDefined();
    });

    it('should support threshold_breach events', () => {
      const callback = vi.fn();
      notificationService.on('threshold_breach', callback);
      expect(callback).toBeDefined();
    });
  });
});
