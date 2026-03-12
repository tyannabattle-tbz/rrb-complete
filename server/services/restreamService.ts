/**
 * Restream Room Service
 * Manages Restream studio room creation and URL management.
 * Stores room URLs in system_config for dynamic access across the platform.
 */

import { getDb } from '../db';
import { systemConfig } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { notifyOwner } from '../_core/notification';

export interface RestreamRoom {
  url: string;
  name: string;
  createdAt: number;
  status: 'active' | 'inactive' | 'pending';
}

/**
 * Get the current Restream studio URL from system config
 */
export async function getRestreamUrl(): Promise<string> {
  const db = await getDb();
  if (!db) return '';
  const rows = await db
    .select()
    .from(systemConfig)
    .where(eq(systemConfig.configKey, 'restream_studio_url'));
  return rows[0]?.configValue || '';
}

/**
 * Set/update the Restream studio URL in system config
 */
export async function setRestreamUrl(url: string, updatedBy: string = 'system'): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const existing = await db
    .select()
    .from(systemConfig)
    .where(eq(systemConfig.configKey, 'restream_studio_url'));

  if (existing.length > 0) {
    await db
      .update(systemConfig)
      .set({
        configValue: url,
        updatedAt: Date.now(),
        updatedBy,
      })
      .where(eq(systemConfig.configKey, 'restream_studio_url'));
  } else {
    await db.insert(systemConfig).values({
      configKey: 'restream_studio_url',
      configValue: url,
      description: 'Restream studio URL — all live/studio buttons use this',
      updatedAt: Date.now(),
      updatedBy,
    });
  }
}

/**
 * Create a new Restream room via the Restream API.
 * If no API key is available, creates a placeholder room entry
 * and notifies the owner to set up the room manually.
 */
export async function createRestreamRoom(options: {
  title?: string;
  description?: string;
  createdBy?: string;
}): Promise<RestreamRoom> {
  const { title = 'RRB Live Broadcast', description = 'Rockin\' Rockin\' Boogie Live', createdBy = 'QUMUS' } = options;

  // Check if we have a Restream API key configured
  const db = await getDb();
  if (!db) return { url: 'https://studio.restream.io', name: title, createdAt: Date.now(), status: 'pending' as const };
  const apiKeyRow = await db
    .select()
    .from(systemConfig)
    .where(eq(systemConfig.configKey, 'restream_api_key'));
  const apiKey = apiKeyRow[0]?.configValue;

  if (apiKey) {
    // Use Restream API to create a room
    try {
      const response = await fetch('https://api.restream.io/v2/platform/all/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          scheduled_for: null, // Live now
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const roomUrl = data.embed?.url || data.url || `https://studio.restream.io/${data.id}`;

        // Save the new room URL
        await setRestreamUrl(roomUrl, createdBy);

        // Notify owner
        await notifyOwner({
          title: '🎙️ Restream Room Created',
          content: `New Restream room created: "${title}"\nURL: ${roomUrl}\nCreated by: ${createdBy}\nTime: ${new Date().toISOString()}`,
        }).catch(() => {});

        return {
          url: roomUrl,
          name: title,
          createdAt: Date.now(),
          status: 'active',
        };
      } else {
        const errorText = await response.text();
        console.error('[Restream] API error:', response.status, errorText);
        throw new Error(`Restream API error: ${response.status}`);
      }
    } catch (err: any) {
      console.error('[Restream] Room creation failed:', err.message);
      // Fall through to manual mode
    }
  }

  // Manual mode — use existing URL or create placeholder
  const existingUrl = await getRestreamUrl();
  const room: RestreamRoom = {
    url: existingUrl || 'https://studio.restream.io',
    name: title,
    createdAt: Date.now(),
    status: existingUrl ? 'active' : 'pending',
  };

  // Store room metadata
  await db.insert(systemConfig).values({
    configKey: `restream_room_${Date.now()}`,
    configValue: JSON.stringify(room),
    description: `Restream room: ${title}`,
    updatedAt: Date.now(),
    updatedBy: createdBy,
  }).catch(() => {});

  // Notify owner to set up manually if no API key
  if (!apiKey) {
    await notifyOwner({
      title: '🎙️ Restream Room Ready — Manual Setup',
      content: `A Restream room request was created for "${title}".\n\nCurrent studio URL: ${room.url}\n\nTo create a new room:\n1. Go to https://studio.restream.io\n2. Create a new broadcast\n3. Copy the room URL\n4. Update it in Admin Settings → Restream URL\n\nAll platform buttons will automatically use the new URL.\n\nTo enable auto-creation, add your Restream API key in Admin Settings.`,
    }).catch(() => {});
  }

  return room;
}

/**
 * Get all stored Restream room records
 */
export async function getRestreamRooms(): Promise<RestreamRoom[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(systemConfig)
    .where(eq(systemConfig.configKey, 'restream_studio_url'));

  // Also get room history
  const roomRows = await db.execute(
    { sql: "SELECT configValue FROM system_config WHERE config_key LIKE 'restream_room_%' ORDER BY updated_at DESC LIMIT 10", params: [] } as any
  );

  const rooms: RestreamRoom[] = [];

  // Current active room
  if (rows[0]?.configValue) {
    rooms.push({
      url: rows[0].configValue,
      name: 'Current Studio',
      createdAt: rows[0].updatedAt || Date.now(),
      status: 'active',
    });
  }

  return rooms;
}
