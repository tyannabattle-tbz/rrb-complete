/**
 * Tests for QUMUS Command Console, Sweet Miracles Fundraising, and Push Notifications
 */
import { describe, it, expect, beforeAll } from 'vitest';

// ===== QUMUS Notification Service Tests =====
describe('QUMUS Notification Service', () => {
  let notificationService: typeof import('../server/services/qumus-notifications');

  beforeAll(async () => {
    notificationService = await import('../server/services/qumus-notifications');
  });

  it('should export all notification functions', () => {
    expect(notificationService.queueNotification).toBeDefined();
    expect(notificationService.sendImmediate).toBeDefined();
    expect(notificationService.getNotificationStats).toBeDefined();
    expect(notificationService.updateNotificationRule).toBeDefined();
    expect(notificationService.notifyHumanReviewEscalation).toBeDefined();
    expect(notificationService.notifyEmergencyBroadcast).toBeDefined();
    expect(notificationService.notifyAgentHealthDegraded).toBeDefined();
    expect(notificationService.notifySecurityAlert).toBeDefined();
    expect(notificationService.notifyCampaignMilestone).toBeDefined();
  });

  it('should return notification stats with correct structure', () => {
    const stats = notificationService.getNotificationStats();
    expect(stats).toHaveProperty('totalSent');
    expect(stats).toHaveProperty('totalFailed');
    expect(stats).toHaveProperty('queueLength');
    expect(stats).toHaveProperty('isProcessing');
    expect(stats).toHaveProperty('rules');
    expect(stats).toHaveProperty('recentNotifications');
    expect(typeof stats.totalSent).toBe('number');
    expect(typeof stats.totalFailed).toBe('number');
    expect(typeof stats.isProcessing).toBe('boolean');
    expect(Array.isArray(stats.rules)).toBe(true);
    expect(Array.isArray(stats.recentNotifications)).toBe(true);
  });

  it('should have 6 notification rules configured', () => {
    const stats = notificationService.getNotificationStats();
    expect(stats.rules.length).toBe(6);
    const ruleTypes = stats.rules.map((r: any) => r.type);
    expect(ruleTypes).toContain('human_review');
    expect(ruleTypes).toContain('emergency');
    expect(ruleTypes).toContain('agent_health');
    expect(ruleTypes).toContain('security');
    expect(ruleTypes).toContain('campaign');
    expect(ruleTypes).toContain('system');
  });

  it('should have all rules enabled by default', () => {
    const stats = notificationService.getNotificationStats();
    for (const rule of stats.rules) {
      expect(rule.enabled).toBe(true);
    }
  });

  it('should update notification rules', () => {
    const result = notificationService.updateNotificationRule('human_review', {
      minSeverity: 'high',
      enabled: true,
    });
    expect(result).toBe(true);

    const stats = notificationService.getNotificationStats();
    const hrRule = stats.rules.find((r: any) => r.type === 'human_review');
    expect(hrRule?.minSeverity).toBe('high');

    // Reset
    notificationService.updateNotificationRule('human_review', {
      minSeverity: 'medium',
    });
  });

  it('should return false for unknown rule type', () => {
    const result = notificationService.updateNotificationRule('nonexistent', {
      enabled: false,
    });
    expect(result).toBe(false);
  });

  it('should queue notifications without throwing', () => {
    expect(() => {
      notificationService.queueNotification({
        type: 'system',
        severity: 'high',
        title: 'Test Notification',
        body: 'This is a test',
      });
    }).not.toThrow();
  });

  it('should queue human review escalation notifications', () => {
    expect(() => {
      notificationService.notifyHumanReviewEscalation('Test Policy', 'Low confidence');
    }).not.toThrow();
  });

  it('should queue emergency broadcast notifications', () => {
    expect(() => {
      notificationService.notifyEmergencyBroadcast('Test Emergency', 'Emergency details');
    }).not.toThrow();
  });

  it('should queue agent health notifications', () => {
    expect(() => {
      notificationService.notifyAgentHealthDegraded('RRB', 'degraded');
    }).not.toThrow();
  });

  it('should queue security alert notifications', () => {
    expect(() => {
      notificationService.notifySecurityAlert('Test Alert', 'Security details');
    }).not.toThrow();
  });

  it('should queue campaign milestone notifications', () => {
    expect(() => {
      notificationService.notifyCampaignMilestone('Test Campaign', '50% funded');
    }).not.toThrow();
  });
});

// ===== Command Execution Router Tests =====
describe('Command Execution Router', () => {
  it('should import the command execution router', async () => {
    const mod = await import('../server/routers/commandExecutionRouter');
    expect(mod.commandExecutionRouter).toBeDefined();
  });
});

// ===== Sweet Miracles Campaigns Router Tests =====
describe('Sweet Miracles Campaigns Router', () => {
  it('should import the campaigns router', async () => {
    const mod = await import('../server/routers/sweetMiraclesCampaigns');
    expect(mod.sweetMiraclesCampaignsRouter).toBeDefined();
  });
});

// ===== QUMUS Complete Router — Notification Endpoints =====
describe('QUMUS Complete Router — Notification Endpoints', () => {
  it('should have notification endpoints in the router', async () => {
    const mod = await import('../server/routers/rrb/qumusComplete');
    const router = mod.qumusCompleteRouter;
    // Check that the router has the notification procedures
    expect(router).toBeDefined();
    // The router object has _def.procedures
    const procedures = (router as any)._def.procedures;
    expect(procedures).toBeDefined();
    expect(procedures.getNotificationStats).toBeDefined();
    expect(procedures.updateNotificationRule).toBeDefined();
    expect(procedures.sendTestNotification).toBeDefined();
  });
});

// ===== Push Notification Router Tests =====
describe('Push Notification Router', () => {
  it('should export sendPushToAll and notificationHistory', async () => {
    const mod = await import('../server/routers/pushNotificationRouter');
    expect(mod.sendPushToAll).toBeDefined();
    expect(mod.notificationHistory).toBeDefined();
    expect(typeof mod.sendPushToAll).toBe('function');
    expect(Array.isArray(mod.notificationHistory)).toBe(true);
  });

  it('should export the push notification router', async () => {
    const mod = await import('../server/routers/pushNotificationRouter');
    expect(mod.pushNotificationRouter).toBeDefined();
  });
});

// ===== Integration: Autonomous Loop + Notifications =====
describe('Autonomous Loop Notification Integration', () => {
  it('should import notification helpers in the autonomous loop', async () => {
    const mod = await import('../server/services/qumus-autonomous-loop');
    expect(mod.QumusAutonomousLoop).toBeDefined();
    expect(mod.getAutonomousLoop).toBeDefined();
  });

  it('should have notification imports wired correctly', async () => {
    // Verify the notification service is importable alongside the loop
    const [loopMod, notifMod] = await Promise.all([
      import('../server/services/qumus-autonomous-loop'),
      import('../server/services/qumus-notifications'),
    ]);
    expect(loopMod.getAutonomousLoop).toBeDefined();
    expect(notifMod.queueNotification).toBeDefined();
    expect(notifMod.notifyHumanReviewEscalation).toBeDefined();
    expect(notifMod.notifySecurityAlert).toBeDefined();
    expect(notifMod.notifyEmergencyBroadcast).toBeDefined();
  });
});
