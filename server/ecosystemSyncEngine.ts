/**
 * QUMUS Ecosystem Sync Engine
 * Validates, syncs, and reports on all subsystems across the entire ecosystem.
 * Used by the Sync Dashboard and the sync-all CLI command.
 */
import mysql from 'mysql2/promise';

async function rawQuery(sql: string, params: any[] = []) {
  const conn = await mysql.createConnection(process.env.DATABASE_URL!);
  try { const [rows] = await conn.execute(sql, params); return rows as any[]; }
  finally { await conn.end(); }
}

export interface SubsystemStatus {
  id: string;
  name: string;
  category: 'core' | 'broadcast' | 'content' | 'community' | 'production' | 'analytics' | 'security';
  status: 'online' | 'degraded' | 'offline' | 'syncing';
  lastSync: string;
  dataCount: number;
  health: number; // 0-100
  details: string;
  errors: string[];
}

export interface SyncReport {
  timestamp: string;
  overallHealth: number;
  subsystems: SubsystemStatus[];
  totalTables: number;
  tablesWithData: number;
  totalRecords: number;
  syncDuration: number;
  warnings: string[];
  recommendations: string[];
}

// All 18 QUMUS subsystems mapped to their DB tables and validation rules
const SUBSYSTEM_DEFINITIONS = [
  {
    id: 'qumus-brain',
    name: 'QUMUS Autonomous Brain',
    category: 'core' as const,
    tables: ['qumus_autonomous_actions', 'qumus_decision_logs', 'qumus_human_review', 'qumus_core_policies', 'qumus_decisions', 'qumus_metrics'],
    critical: true,
  },
  {
    id: 'radio-channels',
    name: 'RRB Radio (54 Channels)',
    category: 'broadcast' as const,
    tables: ['radio_channels', 'radio_stations', 'streaming_status', 'audio_play_counts'],
    critical: true,
    expectedMin: { radio_channels: 54 },
  },
  {
    id: 'broadcast-system',
    name: 'Broadcast & Scheduling',
    category: 'broadcast' as const,
    tables: ['broadcast_schedules', 'content_schedule', 'commercials', 'commercial_impressions'],
    critical: true,
  },
  {
    id: 'hybridcast',
    name: 'HybridCast Emergency Broadcast',
    category: 'broadcast' as const,
    tables: ['hybridcast_nodes', 'emergency_alerts', 'alert_delivery_log', 'alert_broadcast_log'],
    critical: true,
  },
  {
    id: 'conference-hub',
    name: 'Conference Hub (6 Platforms)',
    category: 'community' as const,
    tables: ['conferences', 'conference_attendees'],
    critical: false,
  },
  {
    id: 'podcast-network',
    name: 'Podcast Network',
    category: 'content' as const,
    tables: ['podcast_shows', 'audio_content'],
    critical: false,
  },
  {
    id: 'listener-analytics',
    name: 'Listener Analytics',
    category: 'analytics' as const,
    tables: ['listener_analytics', 'analytics_metrics', 'content_listener_history'],
    critical: true,
  },
  {
    id: 'user-management',
    name: 'User Management & Auth',
    category: 'security' as const,
    tables: ['users', 'agent_sessions', 'api_keys'],
    critical: true,
  },
  {
    id: 'content-engine',
    name: 'Content Engine',
    category: 'content' as const,
    tables: ['rockin_boogie_content', 'social_media_posts', 'news_articles', 'documentation_pages'],
    critical: true,
  },
  {
    id: 'sweet-miracles',
    name: 'Sweet Miracles Foundation',
    category: 'community' as const,
    tables: ['fundraising_goals'],
    critical: false,
    stripeConnected: true,
  },
  {
    id: 'production-studio',
    name: 'Production Studio',
    category: 'production' as const,
    tables: ['studio_sessions', 'studio_guests', 'music_tracks', 'music_playlists'],
    critical: false,
  },
  {
    id: 'meditation-hub',
    name: 'Meditation & Healing Frequencies',
    category: 'community' as const,
    tables: ['meditation_sessions', 'rrb_frequencies'],
    critical: false,
  },
  {
    id: 'solbones-game',
    name: 'Solbones Dice Game',
    category: 'community' as const,
    tables: ['solbones_frequency_rolls', 'solbones_leaderboard'],
    critical: false,
  },
  {
    id: 'family-legacy',
    name: 'Family Legacy & Archives',
    category: 'content' as const,
    tables: ['family_tree'],
    critical: false,
  },
  {
    id: 'dj-management',
    name: 'DJ & Host Management',
    category: 'production' as const,
    tables: ['dj_profiles', 'ad_inventory'],
    critical: false,
  },
  {
    id: 'squadd-team',
    name: 'Squadd Goals Team',
    category: 'community' as const,
    tables: ['squadd_members'],
    critical: false,
  },
  {
    id: 'messaging',
    name: 'Messaging & Chat',
    category: 'community' as const,
    tables: ['messages', 'radio_chat_messages', 'memory_store'],
    critical: false,
  },
  {
    id: 'station-builder',
    name: 'Custom Station Builder',
    category: 'production' as const,
    tables: ['station_templates'],
    critical: false,
  },
  {
    id: 'global-broadcast-state',
    name: 'Global Broadcast State (Single Source of Truth)',
    category: 'broadcast' as const,
    tables: ['global_broadcast_state', 'streaming_status'],
    critical: true,
    expectedMin: { streaming_status: 54 },
  },
  {
    id: 'live-broadcast',
    name: 'Live Broadcast System (Jitsi WebRTC)',
    category: 'broadcast' as const,
    tables: ['broadcasts'],
    critical: true,
  },
  {
    id: 'payments-stripe',
    name: 'Stripe Payments & Donations',
    category: 'core' as const,
    tables: ['payments', 'fundraising_goals'],
    critical: true,
    stripeConnected: true,
  },
];

async function checkTableCount(table: string): Promise<number> {
  try {
    const rows = await rawQuery(`SELECT COUNT(*) as c FROM \`${table}\``);
    return rows[0]?.c || 0;
  } catch {
    return -1; // table doesn't exist
  }
}

async function checkGlobalBroadcastState(): Promise<{ exists: boolean; syncStatus: string; channelsInSync: number; allChannels: number }> {
  try {
    const rows = await rawQuery('SELECT sync_status, channels_in_sync, all_channels FROM global_broadcast_state ORDER BY id DESC LIMIT 1');
    if (rows.length === 0) return { exists: false, syncStatus: 'UNKNOWN', channelsInSync: 0, allChannels: 54 };
    return { exists: true, syncStatus: rows[0].sync_status, channelsInSync: rows[0].channels_in_sync, allChannels: rows[0].all_channels };
  } catch { return { exists: false, syncStatus: 'UNKNOWN', channelsInSync: 0, allChannels: 54 }; }
}

async function checkStreamingStatusSync(): Promise<{ total: number; synced: number; mismatched: number }> {
  try {
    const [total] = await rawQuery('SELECT COUNT(*) as c FROM radio_channels');
    const [synced] = await rawQuery('SELECT COUNT(*) as c FROM streaming_status ss INNER JOIN radio_channels rc ON ss.channel_id = rc.id WHERE ss.stream_url = rc.streamUrl');
    const totalCount = total?.c || 0;
    const syncedCount = synced?.c || 0;
    return { total: totalCount, synced: syncedCount, mismatched: totalCount - syncedCount };
  } catch { return { total: 0, synced: 0, mismatched: 0 }; }
}

async function checkStreamHealth(): Promise<{ healthy: number; total: number }> {
  try {
    const rows = await rawQuery(`SELECT COUNT(*) as total, SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as healthy FROM radio_channels`);
    return { total: rows[0]?.total || 0, healthy: rows[0]?.healthy || 0 };
  } catch {
    return { total: 0, healthy: 0 };
  }
}

async function checkQumusHealth(): Promise<{ policies: number; decisions: number; subsystems: number }> {
  try {
    const [policies] = await rawQuery(`SELECT COUNT(*) as c FROM qumus_core_policies`);
    const [decisions] = await rawQuery(`SELECT COUNT(*) as c FROM qumus_decision_logs`);
    return { policies: policies?.c || 0, decisions: decisions?.c || 0, subsystems: 18 };
  } catch {
    return { policies: 0, decisions: 0, subsystems: 0 };
  }
}

export async function runFullSync(): Promise<SyncReport> {
  const startTime = Date.now();
  const subsystems: SubsystemStatus[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let totalRecords = 0;
  let tablesWithData = 0;
  let totalTables = 0;

  // Check each subsystem
  for (const def of SUBSYSTEM_DEFINITIONS) {
    const errors: string[] = [];
    let totalCount = 0;
    let health = 100;

    for (const table of def.tables) {
      totalTables++;
      const count = await checkTableCount(table);
      if (count === -1) {
        errors.push(`Table '${table}' does not exist`);
        health -= 20;
      } else if (count === 0) {
        if (def.critical) {
          warnings.push(`Critical table '${table}' in ${def.name} is empty`);
          health -= 10;
        }
      } else {
        tablesWithData++;
        totalCount += count;
        totalRecords += count;
      }
    }

    // Check expected minimums
    if (def.expectedMin) {
      for (const [table, min] of Object.entries(def.expectedMin)) {
        const count = await checkTableCount(table);
        if (count < min) {
          errors.push(`Expected at least ${min} rows in '${table}', found ${count}`);
          health -= 15;
        }
      }
    }

    const status: SubsystemStatus = {
      id: def.id,
      name: def.name,
      category: def.category,
      status: health >= 80 ? 'online' : health >= 50 ? 'degraded' : 'offline',
      lastSync: new Date().toISOString(),
      dataCount: totalCount,
      health: Math.max(0, health),
      details: totalCount > 0 ? `${totalCount.toLocaleString()} records across ${def.tables.length} tables` : 'No data',
      errors,
    };

    subsystems.push(status);
  }

  // Special checks
  const streams = await checkStreamHealth();
  if (streams.total < 54) {
    warnings.push(`Only ${streams.total}/54 radio channels found`);
  }

  const qumus = await checkQumusHealth();
  if (qumus.policies === 0) {
    warnings.push('No QUMUS policies configured');
    recommendations.push('Seed QUMUS core policies for autonomous operation');
  }

  // Check Global Broadcast State sync
  const broadcastState = await checkGlobalBroadcastState();
  if (!broadcastState.exists) {
    warnings.push('Global Broadcast State table not initialized');
  } else if (broadcastState.syncStatus !== 'PERFECT_SYNC') {
    warnings.push(`Broadcast sync status: ${broadcastState.syncStatus} (${broadcastState.channelsInSync}/${broadcastState.allChannels})`);
  }

  // Check streaming_status matches radio_channels
  const streamSync = await checkStreamingStatusSync();
  if (streamSync.mismatched > 0) {
    warnings.push(`${streamSync.mismatched} channels have mismatched streaming_status entries`);
    recommendations.push('Run sync-all to reconcile streaming_status with radio_channels');
  }

  // Check Stripe connectivity
  if (process.env.STRIPE_SECRET_KEY) {
    // Stripe is configured
  } else {
    warnings.push('Stripe secret key not configured — donations and payments will fail');
  }

  // Generate recommendations
  const offlineSystems = subsystems.filter(s => s.status === 'offline');
  const degradedSystems = subsystems.filter(s => s.status === 'degraded');

  if (offlineSystems.length > 0) {
    recommendations.push(`${offlineSystems.length} subsystem(s) offline: ${offlineSystems.map(s => s.name).join(', ')}`);
  }
  if (degradedSystems.length > 0) {
    recommendations.push(`${degradedSystems.length} subsystem(s) degraded: ${degradedSystems.map(s => s.name).join(', ')}`);
  }

  const overallHealth = Math.round(subsystems.reduce((sum, s) => sum + s.health, 0) / subsystems.length);

  return {
    timestamp: new Date().toISOString(),
    overallHealth,
    subsystems,
    totalTables,
    tablesWithData,
    totalRecords,
    syncDuration: Date.now() - startTime,
    warnings,
    recommendations,
  };
}

export async function syncSubsystem(subsystemId: string): Promise<SubsystemStatus | null> {
  const def = SUBSYSTEM_DEFINITIONS.find(d => d.id === subsystemId);
  if (!def) return null;

  const errors: string[] = [];
  let totalCount = 0;
  let health = 100;

  for (const table of def.tables) {
    const count = await checkTableCount(table);
    if (count === -1) {
      errors.push(`Table '${table}' does not exist`);
      health -= 20;
    } else if (count === 0 && def.critical) {
      health -= 10;
    } else {
      totalCount += count;
    }
  }

  return {
    id: def.id,
    name: def.name,
    category: def.category,
    status: health >= 80 ? 'online' : health >= 50 ? 'degraded' : 'offline',
    lastSync: new Date().toISOString(),
    dataCount: totalCount,
    health: Math.max(0, health),
    details: totalCount > 0 ? `${totalCount.toLocaleString()} records across ${def.tables.length} tables` : 'No data',
    errors,
  };
}

export function getSubsystemDefinitions() {
  return SUBSYSTEM_DEFINITIONS;
}
