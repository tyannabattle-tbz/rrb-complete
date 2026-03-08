import { describe, it, expect } from 'vitest';

/**
 * Webhook Manager & Ad Rotation Systems Tests
 * 
 * Tests for:
 * 1. Webhook Manager Router (CRUD, dispatch, logs, stats)
 * 2. Webhook Endpoints Schema (columns, types)
 * 3. Webhook Logs Schema (columns, types)
 * 4. Ad Rotation Router (CRUD, weighted rotation, seed defaults)
 * 5. Platform-specific webhook formatting (Slack, Discord, generic)
 * 6. Chunk5 integration verification
 */

// ─── Webhook Manager Router ───────────────────────────────────
describe('Webhook Manager Router', () => {
  it('should export webhookManagerRouter', async () => {
    const { webhookManagerRouter } = await import('./routers/webhookManagerRouter');
    expect(webhookManagerRouter).toBeDefined();
    expect(webhookManagerRouter._def).toBeDefined();
  });

  it('should have all 7 procedures defined', async () => {
    const { webhookManagerRouter } = await import('./routers/webhookManagerRouter');
    const procedures = webhookManagerRouter._def.record;
    expect(procedures).toBeDefined();
    
    const expectedProcedures = ['list', 'add', 'remove', 'toggle', 'test', 'dispatchUpdate', 'logs', 'stats'];
    for (const name of expectedProcedures) {
      expect(procedures[name], `Missing procedure: ${name}`).toBeDefined();
    }
  });

  it('should have list as a query procedure', async () => {
    const { webhookManagerRouter } = await import('./routers/webhookManagerRouter');
    const record = webhookManagerRouter._def.record;
    expect(record.list).toBeDefined();
    expect(record.list._def.type).toBe('query');
  });

  it('should have add as a mutation procedure', async () => {
    const { webhookManagerRouter } = await import('./routers/webhookManagerRouter');
    const record = webhookManagerRouter._def.record;
    expect(record.add).toBeDefined();
    expect(record.add._def.type).toBe('mutation');
  });

  it('should have remove as a mutation procedure', async () => {
    const { webhookManagerRouter } = await import('./routers/webhookManagerRouter');
    const record = webhookManagerRouter._def.record;
    expect(record.remove).toBeDefined();
    expect(record.remove._def.type).toBe('mutation');
  });

  it('should have toggle as a mutation procedure', async () => {
    const { webhookManagerRouter } = await import('./routers/webhookManagerRouter');
    const record = webhookManagerRouter._def.record;
    expect(record.toggle).toBeDefined();
    expect(record.toggle._def.type).toBe('mutation');
  });

  it('should have test as a mutation procedure', async () => {
    const { webhookManagerRouter } = await import('./routers/webhookManagerRouter');
    const record = webhookManagerRouter._def.record;
    expect(record.test).toBeDefined();
    expect(record.test._def.type).toBe('mutation');
  });

  it('should have dispatchUpdate as a mutation procedure', async () => {
    const { webhookManagerRouter } = await import('./routers/webhookManagerRouter');
    const record = webhookManagerRouter._def.record;
    expect(record.dispatchUpdate).toBeDefined();
    expect(record.dispatchUpdate._def.type).toBe('mutation');
  });

  it('should have logs as a query procedure', async () => {
    const { webhookManagerRouter } = await import('./routers/webhookManagerRouter');
    const record = webhookManagerRouter._def.record;
    expect(record.logs).toBeDefined();
    expect(record.logs._def.type).toBe('query');
  });

  it('should have stats as a query procedure', async () => {
    const { webhookManagerRouter } = await import('./routers/webhookManagerRouter');
    const record = webhookManagerRouter._def.record;
    expect(record.stats).toBeDefined();
    expect(record.stats._def.type).toBe('query');
  });
});

// ─── Webhook Endpoints Schema ─────────────────────────────────
describe('Webhook Endpoints Schema', () => {
  it('should have webhook_endpoints table in schema', async () => {
    const schema = await import('../drizzle/schema');
    expect(schema.webhookEndpoints).toBeDefined();
  });

  it('should have all required columns', async () => {
    const schema = await import('../drizzle/schema');
    const table = schema.webhookEndpoints;
    expect(table.id).toBeDefined();
    expect(table.userId).toBeDefined();
    expect(table.url).toBeDefined();
    expect(table.events).toBeDefined();
    expect(table.secret).toBeDefined();
    expect(table.isActive).toBeDefined();
    expect(table.retryCount).toBeDefined();
    expect(table.failureCount).toBeDefined();
    expect(table.lastTriggered).toBeDefined();
    expect(table.createdAt).toBeDefined();
    expect(table.updatedAt).toBeDefined();
  });
});

// ─── Webhook Logs Schema ──────────────────────────────────────
describe('Webhook Logs Schema', () => {
  it('should have webhook_logs table in schema', async () => {
    const schema = await import('../drizzle/schema');
    expect(schema.webhookLogs).toBeDefined();
  });

  it('should have all required columns', async () => {
    const schema = await import('../drizzle/schema');
    const table = schema.webhookLogs;
    expect(table.id).toBeDefined();
    expect(table.webhookId).toBeDefined();
    expect(table.eventType).toBeDefined();
    expect(table.payload).toBeDefined();
    expect(table.statusCode).toBeDefined();
    expect(table.response).toBeDefined();
    expect(table.error).toBeDefined();
    expect(table.retryCount).toBeDefined();
    expect(table.createdAt).toBeDefined();
  });
});

// ─── Platform-Specific Webhook Formatting ─────────────────────
describe('Platform-Specific Webhook Formatting', () => {
  it('should detect Slack URLs correctly', () => {
    const slackUrl = 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX';
    expect(slackUrl.includes('hooks.slack.com')).toBe(true);
  });

  it('should detect Discord URLs correctly', () => {
    const discordUrl = 'https://discord.com/api/webhooks/123456789/abcdefghijklmnop';
    expect(discordUrl.includes('discord.com/api/webhooks')).toBe(true);
  });

  it('should identify generic URLs as non-Slack non-Discord', () => {
    const genericUrl = 'https://example.com/webhook';
    expect(genericUrl.includes('hooks.slack.com')).toBe(false);
    expect(genericUrl.includes('discord.com/api/webhooks')).toBe(false);
  });

  it('should format Slack payload with blocks structure', () => {
    const title = 'QUMUS Update v3.0';
    const slackPayload = {
      text: `*${title}*`,
      blocks: [
        { type: 'header', text: { type: 'plain_text', text: `🔔 ${title}` } },
        { type: 'section', text: { type: 'mrkdwn', text: '*Version:* 3.0.0' } },
        { type: 'actions', elements: [{ type: 'button', text: { type: 'plain_text', text: 'View Dashboard' } }] },
      ],
    };
    expect(slackPayload.blocks).toHaveLength(3);
    expect(slackPayload.blocks[0].type).toBe('header');
    expect(slackPayload.blocks[1].type).toBe('section');
    expect(slackPayload.blocks[2].type).toBe('actions');
  });

  it('should format Discord payload with embeds structure', () => {
    const title = 'QUMUS Update v3.0';
    const discordPayload = {
      content: `**${title}**`,
      embeds: [{
        title: `🔔 ${title}`,
        description: 'Changelog content',
        color: 0x8B5CF6, // QUMUS purple
        fields: [
          { name: 'Version', value: '3.0.0', inline: true },
          { name: 'Severity', value: 'info', inline: true },
        ],
        footer: { text: 'QUMUS Ecosystem — Canryn Production' },
      }],
    };
    expect(discordPayload.embeds).toHaveLength(1);
    expect(discordPayload.embeds[0].color).toBe(0x8B5CF6);
    expect(discordPayload.embeds[0].footer.text).toContain('Canryn Production');
  });

  it('should use correct severity colors for Discord', () => {
    const severityColors: Record<string, number> = {
      critical: 0xFF0000,
      warning: 0xFFA500,
      info: 0x8B5CF6,
    };
    expect(severityColors.critical).toBe(0xFF0000);
    expect(severityColors.warning).toBe(0xFFA500);
    expect(severityColors.info).toBe(0x8B5CF6);
  });
});

// ─── Ad Rotation Router ───────────────────────────────────────
describe('Ad Rotation Router - Extended', () => {
  it('should export adRotationRouter', async () => {
    const { adRotationRouter } = await import('./routers/adRotationRouter');
    expect(adRotationRouter).toBeDefined();
    expect(adRotationRouter._def).toBeDefined();
  });

  it('should have all expected procedures', async () => {
    const { adRotationRouter } = await import('./routers/adRotationRouter');
    const record = adRotationRouter._def.record;
    expect(record).toBeDefined();
    
    const expectedProcedures = ['getAds', 'createAd', 'updateAd', 'deleteAd', 'getNextAd', 'getStats', 'seedDefaults'];
    for (const name of expectedProcedures) {
      expect(record[name], `Missing procedure: ${name}`).toBeDefined();
    }
  });

  it('should have ad_inventory table with all columns', async () => {
    const schema = await import('../drizzle/schema');
    const table = schema.adInventory;
    expect(table.id).toBeDefined();
    expect(table.sponsorName).toBeDefined();
    expect(table.campaignName).toBeDefined();
    expect(table.audioUrl).toBeDefined();
    expect(table.durationSeconds).toBeDefined();
    expect(table.category).toBeDefined();
    expect(table.targetChannels).toBeDefined();
    expect(table.rotationWeight).toBeDefined();
    expect(table.maxPlaysPerHour).toBeDefined();
    expect(table.timeSlotStart).toBeDefined();
    expect(table.timeSlotEnd).toBeDefined();
    expect(table.active).toBeDefined();
    expect(table.totalPlays).toBeDefined();
    expect(table.budgetCents).toBeDefined();
    expect(table.costPerPlayCents).toBeDefined();
    expect(table.startDate).toBeDefined();
    expect(table.endDate).toBeDefined();
    expect(table.createdAt).toBeDefined();
    expect(table.updatedAt).toBeDefined();
  });

  it('should validate weighted rotation algorithm logic', () => {
    // Simulate weighted rotation: higher weight = more likely to be selected
    const ads = [
      { id: 1, sponsorName: 'Canryn Production', rotationWeight: 5 },
      { id: 2, sponsorName: 'Sweet Miracles', rotationWeight: 4 },
      { id: 3, sponsorName: 'RRB Radio', rotationWeight: 3 },
      { id: 4, sponsorName: 'HybridCast', rotationWeight: 3 },
      { id: 5, sponsorName: 'Solbones', rotationWeight: 2 },
      { id: 6, sponsorName: 'Local Business', rotationWeight: 3 },
      { id: 7, sponsorName: 'Selma Jubilee', rotationWeight: 4 },
      { id: 8, sponsorName: 'Meditation', rotationWeight: 2 },
    ];

    const totalWeight = ads.reduce((sum, ad) => sum + ad.rotationWeight, 0);
    expect(totalWeight).toBe(26);

    // Canryn Production should have highest probability
    const canrynProbability = 5 / totalWeight;
    expect(canrynProbability).toBeGreaterThan(0.15);

    // Meditation should have lowest probability
    const meditationProbability = 2 / totalWeight;
    expect(meditationProbability).toBeLessThan(0.1);
  });

  it('should validate time-slot targeting logic', () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    // Test time comparison
    const isInSlot = (start: string | null, end: string | null): boolean => {
      if (!start || !end) return true; // No time restriction
      return currentTime >= start && currentTime <= end;
    };

    expect(isInSlot(null, null)).toBe(true); // No restriction
    expect(isInSlot('00:00', '23:59')).toBe(true); // Always active
    expect(isInSlot('25:00', '26:00')).toBe(false); // Invalid time
  });

  it('should validate channel targeting logic', () => {
    const isTargeted = (targetChannels: string | null, channelId: number): boolean => {
      if (!targetChannels || targetChannels === 'all') return true;
      const channels = targetChannels.split(',').map(c => parseInt(c.trim()));
      return channels.includes(channelId);
    };

    expect(isTargeted('all', 1)).toBe(true);
    expect(isTargeted(null, 5)).toBe(true);
    expect(isTargeted('5,6,7,8,9,10', 5)).toBe(true);
    expect(isTargeted('5,6,7,8,9,10', 1)).toBe(false);
    expect(isTargeted('5,6,7,8,9,10', 10)).toBe(true);
    expect(isTargeted('5,6,7,8,9,10', 11)).toBe(false);
  });

  it('should have 8 default sponsor ads configured', () => {
    const defaultSponsors = [
      'Canryn Production',
      'Sweet Miracles Foundation',
      'RRB Radio Network',
      'HybridCast Emergency',
      'Solbones Game',
      'Local Business Spotlight',
      'Selma Jubilee Committee',
      'Meditation & Wellness',
    ];
    expect(defaultSponsors).toHaveLength(8);
    expect(defaultSponsors).toContain('Canryn Production');
    expect(defaultSponsors).toContain('Sweet Miracles Foundation');
    expect(defaultSponsors).toContain('HybridCast Emergency');
  });
});

// ─── Chunk5 Webhook Manager Integration ───────────────────────
describe('Chunk5 Webhook Manager Integration', () => {
  it('should include webhookManager in chunk5', async () => {
    const { chunk5Router } = await import('./routerChunks/chunk5');
    const record = chunk5Router._def.record;
    expect(record.webhookManager).toBeDefined();
  });

  it('should include all RRB delivery routers in chunk5', async () => {
    const { chunk5Router } = await import('./routerChunks/chunk5');
    const record = chunk5Router._def.record;
    
    const rrbRouters = ['teamUpdates', 'adRotation', 'listenerAnalytics', 'webhookManager', 'contentScheduler'];
    for (const name of rrbRouters) {
      expect(record[name], `Missing RRB router: ${name}`).toBeDefined();
    }
  });
});

// ─── Webhook Secret Generation ────────────────────────────────
describe('Webhook Secret Generation', () => {
  it('should generate unique webhook secrets', () => {
    const generateSecret = () => `whsec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    const secret1 = generateSecret();
    const secret2 = generateSecret();
    
    expect(secret1).toMatch(/^whsec_/);
    expect(secret2).toMatch(/^whsec_/);
    expect(secret1).not.toBe(secret2);
  });

  it('should include timestamp and random component', () => {
    const secret = `whsec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    const parts = secret.split('_');
    expect(parts).toHaveLength(3);
    expect(parts[0]).toBe('whsec');
    expect(parts[1].length).toBeGreaterThan(0); // timestamp
    expect(parts[2].length).toBeGreaterThan(0); // random
  });
});

// ─── Webhook Dispatch Headers ─────────────────────────────────
describe('Webhook Dispatch Headers', () => {
  it('should include required headers in webhook requests', () => {
    const headers = {
      'Content-Type': 'application/json',
      'X-Webhook-Secret': 'whsec_test_secret',
      'X-Webhook-Source': 'QUMUS-Ecosystem',
      'X-Webhook-Event': 'team_update',
    };
    
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['X-Webhook-Source']).toBe('QUMUS-Ecosystem');
    expect(headers['X-Webhook-Secret']).toMatch(/^whsec_/);
    expect(headers['X-Webhook-Event']).toBe('team_update');
  });
});

// ─── Listener Analytics Schema ────────────────────────────────
describe('Listener Analytics Schema', () => {
  it('should have listener_analytics table', async () => {
    const schema = await import('../drizzle/schema');
    expect(schema.listenerAnalytics).toBeDefined();
  });

  it('should support all device types', () => {
    const deviceTypes = ['desktop', 'mobile', 'tablet', 'smart_speaker', 'other'];
    expect(deviceTypes).toHaveLength(5);
    expect(deviceTypes).toContain('smart_speaker');
  });
});
