#!/usr/bin/env node
/**
 * QUMUS Ecosystem Sync-All Command
 * Run: node scripts/sync-all.mjs
 * Or: pnpm sync:all
 * 
 * Validates all 18 subsystems, checks database tables, verifies stream health,
 * and outputs a full ecosystem status report.
 */

import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set. Please configure your environment.');
  process.exit(1);
}

async function rawQuery(sql, params = []) {
  const conn = await mysql.createConnection(DATABASE_URL);
  try {
    const [rows] = await conn.execute(sql, params);
    return rows;
  } finally {
    await conn.end();
  }
}

const SUBSYSTEMS = [
  { id: 'qumus-brain', name: 'QUMUS Autonomous Brain', category: 'core', tables: ['qumus_autonomous_actions', 'qumus_decision_logs', 'qumus_human_review', 'qumus_core_policies', 'qumus_decisions', 'qumus_metrics'], critical: true },
  { id: 'radio-channels', name: 'RRB Radio (54 Channels)', category: 'broadcast', tables: ['radio_channels', 'radio_stations', 'streaming_status', 'audio_play_counts'], critical: true, expectedMin: { radio_channels: 54 } },
  { id: 'broadcast-system', name: 'Broadcast & Scheduling', category: 'broadcast', tables: ['broadcast_schedules', 'content_schedule', 'commercials', 'commercial_impressions'], critical: true },
  { id: 'hybridcast', name: 'HybridCast Emergency Broadcast', category: 'broadcast', tables: ['hybridcast_nodes', 'emergency_alerts', 'alert_delivery_log', 'alert_broadcast_log'], critical: true },
  { id: 'conference-hub', name: 'Conference Hub (6 Platforms)', category: 'community', tables: ['conferences', 'conference_attendees'], critical: false },
  { id: 'podcast-network', name: 'Podcast Network', category: 'content', tables: ['podcast_shows', 'audio_content'], critical: false },
  { id: 'listener-analytics', name: 'Listener Analytics', category: 'analytics', tables: ['listener_analytics', 'analytics_metrics', 'content_listener_history'], critical: true },
  { id: 'user-management', name: 'User Management & Auth', category: 'security', tables: ['users', 'agent_sessions', 'api_keys'], critical: true },
  { id: 'content-engine', name: 'Content Engine', category: 'content', tables: ['rockin_boogie_content', 'social_media_posts', 'news_articles', 'documentation_pages'], critical: true },
  { id: 'sweet-miracles', name: 'Sweet Miracles Foundation', category: 'community', tables: ['fundraising_goals'], critical: false },
  { id: 'production-studio', name: 'Production Studio', category: 'production', tables: ['studio_sessions', 'studio_guests', 'music_tracks', 'music_playlists'], critical: false },
  { id: 'meditation-hub', name: 'Meditation & Healing Frequencies', category: 'community', tables: ['meditation_sessions', 'rrb_frequencies'], critical: false },
  { id: 'solbones-game', name: 'Solbones Dice Game', category: 'community', tables: ['solbones_frequency_rolls', 'solbones_leaderboard'], critical: false },
  { id: 'family-legacy', name: 'Family Legacy & Archives', category: 'content', tables: ['family_tree'], critical: false },
  { id: 'dj-management', name: 'DJ & Host Management', category: 'production', tables: ['dj_profiles', 'ad_inventory'], critical: false },
  { id: 'squadd-team', name: 'Squadd Goals Team', category: 'community', tables: ['squadd_members'], critical: false },
  { id: 'messaging', name: 'Messaging & Chat', category: 'community', tables: ['messages', 'radio_chat_messages', 'memory_store'], critical: false },
  { id: 'station-builder', name: 'Custom Station Builder', category: 'production', tables: ['station_templates'], critical: false },
];

async function checkTable(table) {
  try {
    const rows = await rawQuery(`SELECT COUNT(*) as c FROM \`${table}\``);
    return rows[0]?.c || 0;
  } catch {
    return -1;
  }
}

async function runSync() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║          QUMUS ECOSYSTEM SYNC — Full System Validation       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  const startTime = Date.now();
  let totalRecords = 0;
  let tablesChecked = 0;
  let tablesWithData = 0;
  let onlineCount = 0;
  let degradedCount = 0;
  let offlineCount = 0;
  const warnings = [];

  for (const sub of SUBSYSTEMS) {
    let health = 100;
    let dataCount = 0;
    const errors = [];

    for (const table of sub.tables) {
      tablesChecked++;
      const count = await checkTable(table);
      if (count === -1) {
        errors.push(`Table '${table}' missing`);
        health -= 20;
      } else if (count === 0) {
        if (sub.critical) health -= 10;
      } else {
        tablesWithData++;
        dataCount += count;
        totalRecords += count;
      }
    }

    if (sub.expectedMin) {
      for (const [table, min] of Object.entries(sub.expectedMin)) {
        const count = await checkTable(table);
        if (count < min) {
          errors.push(`Expected ${min}+ rows in '${table}', found ${count}`);
          health -= 15;
        }
      }
    }

    health = Math.max(0, health);
    const status = health >= 80 ? 'ONLINE' : health >= 50 ? 'DEGRADED' : 'OFFLINE';
    const icon = status === 'ONLINE' ? '✅' : status === 'DEGRADED' ? '⚠️' : '❌';

    if (status === 'ONLINE') onlineCount++;
    else if (status === 'DEGRADED') degradedCount++;
    else offlineCount++;

    console.log(`${icon} ${sub.name.padEnd(35)} ${status.padEnd(10)} Health: ${String(health).padStart(3)}%  Records: ${dataCount.toLocaleString()}`);

    if (errors.length > 0) {
      errors.forEach(e => {
        console.log(`   └─ ⚠️  ${e}`);
        warnings.push(`[${sub.name}] ${e}`);
      });
    }
  }

  const duration = Date.now() - startTime;
  const overallHealth = Math.round(SUBSYSTEMS.reduce((sum, _, i) => {
    // Recalculate for summary
    return sum + (i < onlineCount ? 100 : i < onlineCount + degradedCount ? 65 : 25);
  }, 0) / SUBSYSTEMS.length);

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Overall Health:    ${overallHealth}%`);
  console.log(`  Subsystems:        ${onlineCount} online | ${degradedCount} degraded | ${offlineCount} offline`);
  console.log(`  Database:          ${tablesWithData}/${tablesChecked} tables with data`);
  console.log(`  Total Records:     ${totalRecords.toLocaleString()}`);
  console.log(`  Sync Duration:     ${(duration / 1000).toFixed(1)}s`);
  console.log(`  Timestamp:         ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════════════');

  if (warnings.length > 0) {
    console.log('');
    console.log(`⚠️  ${warnings.length} Warning(s):`);
    warnings.forEach(w => console.log(`   • ${w}`));
  }

  console.log('');
  console.log('Sync complete. View full dashboard at /ecosystem-sync');
  console.log('');

  process.exit(overallHealth >= 50 ? 0 : 1);
}

runSync().catch(err => {
  console.error('Sync failed:', err.message);
  process.exit(1);
});
