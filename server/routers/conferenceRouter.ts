import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";
import { qumusEngine } from "../qumus-orchestration";

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = 'rrb-';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const conferenceRouter = router({
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    const [totalRows] = await db.execute(sql`SELECT COUNT(*) as count FROM conferences`);
    const [liveRows] = await db.execute(sql`SELECT COUNT(*) as count FROM conferences WHERE status = 'live'`);
    const [scheduledRows] = await db.execute(sql`SELECT COUNT(*) as count FROM conferences WHERE status = 'scheduled'`);
    const [completedRows] = await db.execute(sql`SELECT COUNT(*) as count FROM conferences WHERE status = 'completed'`);
    const [recordingRows] = await db.execute(sql`SELECT COUNT(*) as count FROM conferences WHERE recording_status = 'available'`);
    return {
      total: (totalRows as any)[0]?.count || 0,
      live: (liveRows as any)[0]?.count || 0,
      scheduled: (scheduledRows as any)[0]?.count || 0,
      completed: (completedRows as any)[0]?.count || 0,
      recordings: (recordingRows as any)[0]?.count || 0,
    };
  }),

  getConferences: publicProcedure
    .input(z.object({
      status: z.enum(['scheduled', 'live', 'completed', 'cancelled', 'all']).optional().default('all'),
      limit: z.number().min(1).max(100).optional().default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      const status = input?.status || 'all';
      const limit = input?.limit || 20;
      const query = status === 'all'
        ? sql`SELECT * FROM conferences ORDER BY created_at DESC LIMIT ${limit}`
        : sql`SELECT * FROM conferences WHERE status = ${status} ORDER BY created_at DESC LIMIT ${limit}`;
      const [rows] = await db.execute(query);
      return rows as any[];
    }),

  getConference: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [rows] = await db.execute(sql`SELECT * FROM conferences WHERE id = ${input.id}`);
      const conferences = rows as any[];
      if (conferences.length === 0) return null;
      const [attendeeRows] = await db.execute(
        sql`SELECT * FROM conference_attendees WHERE conference_id = ${input.id} ORDER BY created_at ASC`
      );
      return { ...conferences[0], attendees: attendeeRows as any[] };
    }),

  // Calendar view - get conferences for a date range
  getCalendarEvents: publicProcedure
    .input(z.object({
      startDate: z.number(),
      endDate: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);
      const [rows] = await db.execute(sql`
        SELECT id, title, type as meeting_type, platform, host_name, room_code, 
               UNIX_TIMESTAMP(scheduled_at)*1000 as scheduled_at, 
               duration_minutes, status, actual_attendees, recording_status,
               UNIX_TIMESTAMP(created_at)*1000 as created_at
        FROM conferences 
        WHERE (scheduled_at BETWEEN ${startDate} AND ${endDate})
           OR (created_at BETWEEN ${startDate} AND ${endDate} AND scheduled_at IS NULL)
        ORDER BY COALESCE(scheduled_at, created_at) ASC
      `);
      return rows as any[];
    }),

  // Analytics - comprehensive conference metrics
  getAnalytics: publicProcedure.query(async () => {
    const db = await getDb();
    // Platform usage
    const [platformRows] = await db.execute(sql`
      SELECT platform, COUNT(*) as count, SUM(actual_attendees) as total_attendees, AVG(duration_minutes) as avg_duration
      FROM conferences GROUP BY platform ORDER BY count DESC
    `);
    // Meeting type breakdown
    const [typeRows] = await db.execute(sql`
      SELECT type, COUNT(*) as count FROM conferences GROUP BY type ORDER BY count DESC
    `);
    // Top hosts
    const [hostRows] = await db.execute(sql`
      SELECT host_name, COUNT(*) as conferences_hosted, SUM(actual_attendees) as total_attendees
      FROM conferences GROUP BY host_name ORDER BY conferences_hosted DESC LIMIT 10
    `);
    // Monthly trend (last 6 months)
    const [trendRows] = await db.execute(sql`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count, SUM(actual_attendees) as attendees
      FROM conferences GROUP BY month ORDER BY month DESC LIMIT 6
    `);
    // Total stats
    const [totalStats] = await db.execute(sql`
      SELECT COUNT(*) as total_conferences, SUM(actual_attendees) as total_attendees, 
             AVG(duration_minutes) as avg_duration, SUM(duration_minutes) as total_minutes,
             COUNT(CASE WHEN recording_status = 'available' THEN 1 END) as total_recordings
      FROM conferences
    `);
    return {
      platforms: platformRows as any[],
      types: typeRows as any[],
      topHosts: hostRows as any[],
      monthlyTrend: trendRows as any[],
      totals: (totalStats as any[])[0] || {},
    };
  }),

  // Recordings archive
  getRecordings: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).optional().default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      const limit = input?.limit || 20;
      const [rows] = await db.execute(sql`
        SELECT id, title, type, platform, host_name, duration_minutes, actual_attendees, recording_url, recording_status, created_at
        FROM conferences WHERE recording_status = 'available' ORDER BY created_at DESC LIMIT ${limit}
      `);
      return rows as any[];
    }),

  createConference: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      meetingType: z.enum(['huddle', 'meeting', 'conference', 'webinar', 'broadcast', 'workshop']).default('meeting'),
      platform: z.enum(['rrb_builtin', 'zoom', 'google_meet', 'discord', 'skype', 'rrb_broadcast']).default('rrb_builtin'),
      scheduledAt: z.number().optional(),
      durationMinutes: z.number().min(5).max(480).default(60),
      maxAttendees: z.number().min(1).max(10000).default(100),
      password: z.string().optional(),
      closedCaptions: z.boolean().default(true),
      recording: z.boolean().default(true),
      source: z.string().optional(), // 'rrb', 'hybridcast', 'tbz-os', 'qumus'
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const now = Date.now();
      const roomCode = generateRoomCode();
      let externalUrl: string | null = null;
      if (input.platform === 'zoom') externalUrl = process.env.VITE_ZOOM_URL || 'https://zoom.us';
      else if (input.platform === 'google_meet') externalUrl = process.env.VITE_MEET_URL || 'https://meet.google.com';
      else if (input.platform === 'discord') externalUrl = process.env.VITE_DISCORD_URL || 'https://discord.gg';
      else if (input.platform === 'skype') externalUrl = process.env.VITE_SKYPE_URL || 'https://join.skype.com';
      const status = input.scheduledAt ? 'scheduled' : 'live';
      const recordingStatus = input.recording ? 'pending' : 'none';
      const platformValue = input.platform === 'rrb_builtin' ? 'jitsi' : input.platform === 'google_meet' ? 'meet' : input.platform === 'rrb_broadcast' ? 'rrb-live' : input.platform;
      const scheduledAtDate = input.scheduledAt ? new Date(input.scheduledAt) : null;
      await db.execute(sql`
        INSERT INTO conferences (title, description, type, platform, host_user_id, host_name, room_code, external_url, scheduled_at, duration_minutes, max_attendees, password, captions_enabled, recording_enabled, status, actual_attendees, recording_status, created_at, updated_at)
        VALUES (${input.title}, ${input.description || null}, ${input.meetingType}, ${platformValue}, ${ctx.user.id}, ${ctx.user.name}, ${roomCode}, ${externalUrl}, ${scheduledAtDate}, ${input.durationMinutes}, ${input.maxAttendees}, ${input.password || null}, ${input.closedCaptions}, ${input.recording}, ${status}, 0, ${recordingStatus}, NOW(), NOW())
      `);
      const [result] = await db.execute(sql`SELECT LAST_INSERT_ID() as id`);
      const conferenceId = (result as any)[0]?.id;
      return { id: conferenceId, roomCode, status, platform: input.platform, externalUrl };
    }),

  // Save recording URL after conference ends
  saveRecording: protectedProcedure
    .input(z.object({
      conferenceId: z.number(),
      recordingUrl: z.string(),
      recordingKey: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.execute(sql`
        UPDATE conferences SET recording_url = ${input.recordingUrl}, recording_key = ${input.recordingKey || null}, 
        recording_status = 'available', updated_at = NOW() WHERE id = ${input.conferenceId}
      `);
      return { success: true };
    }),

  joinConference: protectedProcedure
    .input(z.object({ conferenceId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const [existing] = await db.execute(
        sql`SELECT id FROM conference_attendees WHERE conference_id = ${input.conferenceId} AND user_id = ${ctx.user.id}`
      );
      if ((existing as any[]).length > 0) {
        await db.execute(sql`UPDATE conference_attendees SET joined_at = NOW() WHERE conference_id = ${input.conferenceId} AND user_id = ${ctx.user.id}`);
      } else {
        await db.execute(sql`
          INSERT INTO conference_attendees (conference_id, user_id, user_name, rsvp_status, joined_at, created_at)
          VALUES (${input.conferenceId}, ${ctx.user.id}, ${ctx.user.name}, 'going', NOW(), NOW())
        `);
        await db.execute(sql`UPDATE conferences SET actual_attendees = actual_attendees + 1, updated_at = NOW() WHERE id = ${input.conferenceId}`);
      }
      return { success: true };
    }),

  rsvpConference: protectedProcedure
    .input(z.object({
      conferenceId: z.number(),
      status: z.enum(['going', 'maybe', 'declined']),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const [existing] = await db.execute(
        sql`SELECT id FROM conference_attendees WHERE conference_id = ${input.conferenceId} AND user_id = ${ctx.user.id}`
      );
      if ((existing as any[]).length > 0) {
        await db.execute(sql`UPDATE conference_attendees SET rsvp_status = ${input.status} WHERE conference_id = ${input.conferenceId} AND user_id = ${ctx.user.id}`);
      } else {
        await db.execute(sql`
          INSERT INTO conference_attendees (conference_id, user_id, user_name, rsvp_status, created_at)
          VALUES (${input.conferenceId}, ${ctx.user.id}, ${ctx.user.name}, ${input.status}, NOW())
        `);
      }
      return { success: true };
    }),

  endConference: protectedProcedure
    .input(z.object({ id: z.number(), actualAttendees: z.number().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (input.actualAttendees !== undefined) {
        await db.execute(sql`UPDATE conferences SET status = 'completed', actual_attendees = ${input.actualAttendees}, updated_at = NOW() WHERE id = ${input.id}`);
      } else {
        await db.execute(sql`UPDATE conferences SET status = 'completed', updated_at = NOW() WHERE id = ${input.id}`);
      }
      return { success: true };
    }),

  deleteConference: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.execute(sql`DELETE FROM conference_attendees WHERE conference_id = ${input.id}`);
      await db.execute(sql`DELETE FROM conferences WHERE id = ${input.id}`);
      return { success: true };
    }),

  // Notify attendees about upcoming conference
  notifyAttendees: protectedProcedure
    .input(z.object({
      conferenceId: z.number(),
      message: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const [confRows] = await db.execute(sql`SELECT title, scheduled_at, room_code, platform FROM conferences WHERE id = ${input.conferenceId}`);
      const conf = (confRows as any[])[0];
      if (!conf) throw new Error('Conference not found');
      const [attendeeRows] = await db.execute(sql`SELECT user_name FROM conference_attendees WHERE conference_id = ${input.conferenceId} AND rsvp_status IN ('going', 'maybe')`);
      const attendeeCount = (attendeeRows as any[]).length;
      await notifyOwner({
        title: `Conference Reminder: ${conf.title}`,
        content: input.message || `Conference "${conf.title}" is starting soon. Room: ${conf.room_code} | Platform: ${conf.platform} | ${attendeeCount} attendees confirmed.`,
      });
      // Log QUMUS decision
      try {
        await qumusEngine.makeDecision({
          policyId: 'policy_conference_scheduling',
          confidence: 95,
          inputData: { action: 'attendee_notification', conferenceId: input.conferenceId, attendeeCount },
        });
      } catch (e) { /* non-critical */ }
      return { success: true, notifiedCount: attendeeCount };
    }),

  // Transcribe a conference recording
  transcribeRecording: protectedProcedure
    .input(z.object({
      conferenceId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const [confRows] = await db.execute(sql`SELECT recording_url, recording_status, title FROM conferences WHERE id = ${input.conferenceId}`);
      const conf = (confRows as any[])[0];
      if (!conf || conf.recording_status !== 'available' || !conf.recording_url) {
        throw new Error('No recording available for transcription');
      }
      // Use Whisper transcription service
      try {
        const { transcribeAudio } = await import('../_core/voiceTranscription');
        const result = await transcribeAudio({
          audioUrl: conf.recording_url,
          language: 'en',
          prompt: `Transcribe conference recording: ${conf.title}`,
        });
        // Store transcription in description field for searchability
        const transcriptText = result.text || '';
        await db.execute(sql`UPDATE conferences SET description = CONCAT(COALESCE(description, ''), '\n\n--- TRANSCRIPT ---\n', ${transcriptText}), updated_at = NOW() WHERE id = ${input.conferenceId}`);
        // Log QUMUS decision
        try {
          await qumusEngine.makeDecision({
            policyId: 'policy_conference_scheduling',
            confidence: 92,
            inputData: { action: 'recording_transcription', conferenceId: input.conferenceId, textLength: transcriptText.length },
          });
        } catch (e) { /* non-critical */ }
        return { success: true, transcript: transcriptText, language: result.language };
      } catch (error: any) {
        console.error('[Conference] Transcription failed:', error.message);
        return { success: false, error: error.message };
      }
    }),

  // QUMUS autonomous: create recurring conference from template
  createRecurring: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      meetingType: z.enum(['huddle', 'meeting', 'conference', 'webinar', 'broadcast', 'workshop']).default('meeting'),
      platform: z.enum(['rrb_builtin', 'zoom', 'google_meet', 'discord', 'skype', 'rrb_broadcast']).default('rrb_builtin'),
      durationMinutes: z.number().min(5).max(480).default(60),
      maxAttendees: z.number().min(1).max(10000).default(100),
      recurrencePattern: z.enum(['daily', 'weekly', 'biweekly', 'monthly']).default('weekly'),
      startDate: z.number(), // first occurrence timestamp
      occurrences: z.number().min(1).max(52).default(12),
      source: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const createdIds: number[] = [];
      const platformValue = input.platform === 'rrb_builtin' ? 'jitsi' : input.platform === 'google_meet' ? 'meet' : input.platform === 'rrb_broadcast' ? 'rrb-live' : input.platform;
      let externalUrl: string | null = null;
      if (input.platform === 'zoom') externalUrl = process.env.VITE_ZOOM_URL || 'https://zoom.us';
      else if (input.platform === 'google_meet') externalUrl = process.env.VITE_MEET_URL || 'https://meet.google.com';
      else if (input.platform === 'discord') externalUrl = process.env.VITE_DISCORD_URL || 'https://discord.gg';
      else if (input.platform === 'skype') externalUrl = process.env.VITE_SKYPE_URL || 'https://join.skype.com';

      const intervalMs = input.recurrencePattern === 'daily' ? 86400000
        : input.recurrencePattern === 'weekly' ? 604800000
        : input.recurrencePattern === 'biweekly' ? 1209600000
        : 2592000000; // monthly approx

      for (let i = 0; i < input.occurrences; i++) {
        const scheduledAt = new Date(input.startDate + (i * intervalMs));
        const roomCode = generateRoomCode();
        const titleWithNum = input.occurrences > 1 ? `${input.title} #${i + 1}` : input.title;
        await db.execute(sql`
          INSERT INTO conferences (title, description, type, platform, host_user_id, host_name, room_code, external_url, scheduled_at, duration_minutes, max_attendees, status, is_recurring, recurrence_pattern, recording_enabled, captions_enabled, actual_attendees, recording_status, created_at, updated_at)
          VALUES (${titleWithNum}, ${input.description || null}, ${input.meetingType}, ${platformValue}, ${ctx.user.id}, ${ctx.user.name}, ${roomCode}, ${externalUrl}, ${scheduledAt}, ${input.durationMinutes}, ${input.maxAttendees}, 'scheduled', true, ${input.recurrencePattern}, true, true, 0, 'none', NOW(), NOW())
        `);
        const [result] = await db.execute(sql`SELECT LAST_INSERT_ID() as id`);
        createdIds.push((result as any)[0]?.id);
      }
      // Log QUMUS autonomous decision
      try {
        await qumusEngine.makeDecision({
          policyId: 'policy_conference_scheduling',
          confidence: 95,
          inputData: { action: 'create_recurring', pattern: input.recurrencePattern, occurrences: input.occurrences, source: input.source },
        });
      } catch (e) { /* non-critical */ }
      return { success: true, createdCount: createdIds.length, conferenceIds: createdIds };
    }),

  // UN CSW70 conference templates
  getCSW70Templates: publicProcedure.query(async () => {
    return [
      {
        id: 'csw70-plenary',
        title: 'UN CSW70 Plenary Session',
        description: 'Official plenary session for the 70th Commission on the Status of Women. Focus on gender equality, women\'s empowerment, and sustainable development.',
        meetingType: 'conference' as const,
        platform: 'rrb_builtin' as const,
        durationMinutes: 120,
        maxAttendees: 500,
        tags: ['UN', 'CSW70', 'Gender Equality', 'Plenary'],
        icon: '🌍',
      },
      {
        id: 'csw70-side-event',
        title: 'UN CSW70 Side Event',
        description: 'Side event exploring specific themes related to women\'s rights, economic empowerment, and social justice.',
        meetingType: 'webinar' as const,
        platform: 'rrb_builtin' as const,
        durationMinutes: 90,
        maxAttendees: 200,
        tags: ['UN', 'CSW70', 'Side Event', 'Women\'s Rights'],
        icon: '🎤',
      },
      {
        id: 'csw70-broadcast',
        title: 'UN CSW70 Live Broadcast',
        description: 'Live broadcast of CSW70 proceedings via RRB Radio and HybridCast emergency network. A Voice for the Voiceless.',
        meetingType: 'broadcast' as const,
        platform: 'rrb_broadcast' as const,
        durationMinutes: 180,
        maxAttendees: 10000,
        tags: ['UN', 'CSW70', 'Broadcast', 'RRB Radio', 'HybridCast'],
        icon: '📡',
      },
      {
        id: 'csw70-workshop',
        title: 'UN CSW70 Workshop',
        description: 'Interactive workshop on implementing gender-responsive policies and programs. Canryn Production & Sweet Miracles collaboration.',
        meetingType: 'workshop' as const,
        platform: 'rrb_builtin' as const,
        durationMinutes: 60,
        maxAttendees: 50,
        tags: ['UN', 'CSW70', 'Workshop', 'Canryn Production', 'Sweet Miracles'],
        icon: '🛠️',
      },
      {
        id: 'csw70-panel',
        title: 'UN CSW70 Expert Panel',
        description: 'Expert panel discussion on technology, AI, and women\'s empowerment. Featuring QUMUS autonomous orchestration demonstration.',
        meetingType: 'conference' as const,
        platform: 'rrb_builtin' as const,
        durationMinutes: 90,
        maxAttendees: 300,
        tags: ['UN', 'CSW70', 'Panel', 'AI', 'QUMUS'],
        icon: '💡',
      },
      {
        id: 'csw70-networking',
        title: 'UN CSW70 Networking Huddle',
        description: 'Informal networking session for delegates, NGO representatives, and community leaders.',
        meetingType: 'huddle' as const,
        platform: 'rrb_builtin' as const,
        durationMinutes: 30,
        maxAttendees: 25,
        tags: ['UN', 'CSW70', 'Networking', 'Community'],
        icon: '🤝',
      },
    ];
  }),

  // Create conference from UN CSW70 template
  createFromTemplate: protectedProcedure
    .input(z.object({
      templateId: z.string(),
      scheduledAt: z.number(),
      customTitle: z.string().optional(),
      customDescription: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const templates: Record<string, any> = {
        'csw70-plenary': { title: 'UN CSW70 Plenary Session', type: 'conference', platform: 'jitsi', duration: 120, max: 500, desc: 'Official plenary session for the 70th Commission on the Status of Women.' },
        'csw70-side-event': { title: 'UN CSW70 Side Event', type: 'webinar', platform: 'jitsi', duration: 90, max: 200, desc: 'Side event exploring women\'s rights and social justice.' },
        'csw70-broadcast': { title: 'UN CSW70 Live Broadcast', type: 'broadcast', platform: 'rrb-live', duration: 180, max: 10000, desc: 'Live broadcast via RRB Radio and HybridCast. A Voice for the Voiceless.' },
        'csw70-workshop': { title: 'UN CSW70 Workshop', type: 'workshop', platform: 'jitsi', duration: 60, max: 50, desc: 'Interactive workshop on gender-responsive policies.' },
        'csw70-panel': { title: 'UN CSW70 Expert Panel', type: 'conference', platform: 'jitsi', duration: 90, max: 300, desc: 'Expert panel on technology, AI, and women\'s empowerment.' },
        'csw70-networking': { title: 'UN CSW70 Networking Huddle', type: 'huddle', platform: 'jitsi', duration: 30, max: 25, desc: 'Informal networking session for delegates and leaders.' },
      };
      const tmpl = templates[input.templateId];
      if (!tmpl) throw new Error('Template not found');
      const roomCode = generateRoomCode();
      const scheduledAt = new Date(input.scheduledAt);
      const title = input.customTitle || tmpl.title;
      const description = input.customDescription || tmpl.desc;
      await db.execute(sql`
        INSERT INTO conferences (title, description, type, platform, host_user_id, host_name, room_code, scheduled_at, duration_minutes, max_attendees, status, recording_enabled, captions_enabled, actual_attendees, recording_status, created_at, updated_at)
        VALUES (${title}, ${description}, ${tmpl.type}, ${tmpl.platform}, ${ctx.user.id}, ${ctx.user.name}, ${roomCode}, ${scheduledAt}, ${tmpl.duration}, ${tmpl.max}, 'scheduled', true, true, 0, 'none', NOW(), NOW())
      `);
      const [result] = await db.execute(sql`SELECT LAST_INSERT_ID() as id`);
      const conferenceId = (result as any)[0]?.id;
      // QUMUS decision for UN CSW70 session creation
      try {
        await qumusEngine.makeDecision({
          policyId: 'policy_conference_scheduling',
          confidence: 98,
          inputData: { action: 'un_csw70_session', templateId: input.templateId, conferenceId },
        });
      } catch (e) { /* non-critical */ }
      // Notify owner
      await notifyOwner({
        title: `UN CSW70 Conference Created: ${title}`,
        content: `Template: ${input.templateId} | Room: ${roomCode} | Scheduled: ${scheduledAt.toISOString()} | Max: ${tmpl.max} attendees`,
      });
      return { id: conferenceId, roomCode, status: 'scheduled', platform: tmpl.platform };
    }),

  // Get conference share data for social media
  getShareData: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [rows] = await db.execute(sql`SELECT title, description, type, platform, scheduled_at, room_code, host_name, max_attendees FROM conferences WHERE id = ${input.id}`);
      const conf = (rows as any[])[0];
      if (!conf) return null;
      const scheduledStr = conf.scheduled_at ? new Date(conf.scheduled_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Live Now';
      return {
        title: conf.title,
        description: conf.description || `Join ${conf.title} - ${conf.type} on ${conf.platform}`,
        shareText: `🌍 Join us: ${conf.title}\n📅 ${scheduledStr}\n🎤 Host: ${conf.host_name}\n🔗 Room: ${conf.room_code}\n\nPowered by Canryn Production | A Voice for the Voiceless\n#UNCSW70 #GenderEquality #CanrynProduction`,
        hashtags: ['UNCSW70', 'GenderEquality', 'WomensRights', 'CanrynProduction', 'SweetMiracles', 'RRBRadio'],
        platforms: {
          twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`🌍 ${conf.title} - ${scheduledStr}\nRoom: ${conf.room_code}\n#UNCSW70 #GenderEquality`)}`,
          linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://manusweb-eshiamkd.manus.space/conference`)}`,
        },
      };
    }),

  // Bridge conference to RRB Radio broadcast
  bridgeToBroadcast: protectedProcedure
    .input(z.object({
      conferenceId: z.number(),
      broadcastChannel: z.string().default('RRB-Main'),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const [confRows] = await db.execute(sql`SELECT title, room_code, platform FROM conferences WHERE id = ${input.conferenceId}`);
      const conf = (confRows as any[])[0];
      if (!conf) throw new Error('Conference not found');
      // Update conference to broadcast type
      await db.execute(sql`UPDATE conferences SET type = 'broadcast', updated_at = NOW() WHERE id = ${input.conferenceId}`);
      // Log QUMUS decision for broadcast bridge
      try {
        await qumusEngine.makeDecision({
          policyId: 'policy_broadcast_management',
          confidence: 90,
          inputData: { action: 'conference_broadcast_bridge', conferenceId: input.conferenceId, channel: input.broadcastChannel },
        });
      } catch (e) { /* non-critical */ }
      await notifyOwner({
        title: `Conference Bridged to ${input.broadcastChannel}`,
        content: `"${conf.title}" (Room: ${conf.room_code}) is now broadcasting on ${input.broadcastChannel}`,
      });
      return { success: true, broadcastChannel: input.broadcastChannel };
    }),

  // Permanent test conference - always available for testing/demo
  seedTestConference: publicProcedure.mutation(async () => {
    const db = await getDb();
    // Check if test conference already exists
    const [existing] = await db.execute(sql`SELECT id FROM conferences WHERE room_code = 'rrb-TESTROOM001'`);
    if ((existing as any[]).length > 0) {
      // Reset it to live status
      await db.execute(sql`UPDATE conferences SET status = 'live', actual_attendees = 0, updated_at = NOW() WHERE room_code = 'rrb-TESTROOM001'`);
      return { success: true, id: (existing as any[])[0].id, roomCode: 'rrb-TESTROOM001', message: 'Test conference reset to live' };
    }
    // Create permanent test conference
    await db.execute(sql`
      INSERT INTO conferences (title, description, type, platform, host_user_id, host_name, room_code, external_url, scheduled_at, duration_minutes, max_attendees, status, is_recurring, recurrence_pattern, recording_enabled, captions_enabled, actual_attendees, recording_status, created_at, updated_at)
      VALUES ('RRB Conference Test Room', 'Permanent test conference room for the Canryn Production ecosystem. Always available for testing, demos, and walk-throughs. Powered by QUMUS autonomous orchestration.', 'meeting', 'jitsi', 1, 'QUMUS System', 'rrb-TESTROOM001', NULL, NULL, 480, 1000, 'live', false, NULL, true, true, 0, 'none', NOW(), NOW())
    `);
    const [result] = await db.execute(sql`SELECT LAST_INSERT_ID() as id`);
    const conferenceId = (result as any)[0]?.id;
    // Log QUMUS decision
    try {
      await qumusEngine.makeDecision({
        policyId: 'policy_conference_scheduling',
        confidence: 100,
        inputData: { action: 'seed_test_conference', conferenceId },
      });
    } catch (e) { /* non-critical */ }
    return { success: true, id: conferenceId, roomCode: 'rrb-TESTROOM001', message: 'Permanent test conference created' };
  }),

  // Get the permanent test conference
  getTestConference: publicProcedure.query(async () => {
    const db = await getDb();
    const [rows] = await db.execute(sql`SELECT * FROM conferences WHERE room_code = 'rrb-TESTROOM001' LIMIT 1`);
    const conf = (rows as any[])[0];
    if (!conf) return null;
    const [attendeeRows] = await db.execute(sql`SELECT * FROM conference_attendees WHERE conference_id = ${conf.id} ORDER BY created_at ASC`);
    return { ...conf, attendees: attendeeRows as any[], isTestRoom: true };
  }),

  // Stripe conference ticketing - create checkout for VIP/Speaker tickets
  createTicketCheckout: protectedProcedure
    .input(z.object({
      conferenceId: z.number(),
      ticketType: z.enum(['general', 'vip', 'speaker', 'delegate']).default('general'),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const [confRows] = await db.execute(sql`SELECT title, scheduled_at, room_code FROM conferences WHERE id = ${input.conferenceId}`);
      const conf = (confRows as any[])[0];
      if (!conf) throw new Error('Conference not found');

      const ticketPrices: Record<string, { amount: number; label: string }> = {
        general: { amount: 0, label: 'General Admission (Free)' },
        vip: { amount: 4999, label: 'VIP Access ($49.99)' },
        speaker: { amount: 9999, label: 'Speaker Pass ($99.99)' },
        delegate: { amount: 14999, label: 'UN Delegate Pass ($149.99)' },
      };
      const ticket = ticketPrices[input.ticketType];

      // Free tickets - just register
      if (ticket.amount === 0) {
        const [existing] = await db.execute(
          sql`SELECT id FROM conference_attendees WHERE conference_id = ${input.conferenceId} AND user_id = ${ctx.user.id}`
        );
        if ((existing as any[]).length === 0) {
          await db.execute(sql`
            INSERT INTO conference_attendees (conference_id, user_id, user_name, rsvp_status, created_at)
            VALUES (${input.conferenceId}, ${ctx.user.id}, ${ctx.user.name}, 'going', NOW())
          `);
          await db.execute(sql`UPDATE conferences SET actual_attendees = actual_attendees + 1, updated_at = NOW() WHERE id = ${input.conferenceId}`);
        }
        return { success: true, free: true, message: 'Registered for free admission' };
      }

      // Paid tickets - create Stripe checkout
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' as any });
      const origin = (ctx as any).req?.headers?.origin || 'https://manusweb-eshiamkd.manus.space';
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${conf.title} - ${ticket.label}`,
              description: `Conference ticket: ${input.ticketType.toUpperCase()} | Room: ${conf.room_code} | Powered by Canryn Production`,
              metadata: { conferenceId: String(input.conferenceId), ticketType: input.ticketType },
            },
            unit_amount: ticket.amount,
          },
          quantity: 1,
        }],
        mode: 'payment',
        customer_email: ctx.user.email || undefined,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          customer_email: ctx.user.email || '',
          customer_name: ctx.user.name || '',
          conferenceId: String(input.conferenceId),
          ticketType: input.ticketType,
          type: 'conference_ticket',
        },
        success_url: `${origin}/conference/room/${input.conferenceId}?ticket=success`,
        cancel_url: `${origin}/conference?ticket=cancelled`,
        allow_promotion_codes: true,
      });

      return { success: true, free: false, checkoutUrl: session.url, sessionId: session.id };
    }),

  // Get ticket types for a conference
  getTicketTypes: publicProcedure.query(async () => {
    return [
      { id: 'general', label: 'General Admission', price: 0, description: 'Free access to the conference', perks: ['Join conference', 'Chat access', 'Recording access'] },
      { id: 'vip', label: 'VIP Access', price: 4999, description: 'Priority access with premium features', perks: ['Priority join', 'Speaker Q&A', 'Exclusive recordings', 'VIP badge'] },
      { id: 'speaker', label: 'Speaker Pass', price: 9999, description: 'Full speaker privileges', perks: ['Present & share screen', 'Extended time', 'Speaker profile', 'All VIP perks'] },
      { id: 'delegate', label: 'UN Delegate Pass', price: 14999, description: 'Official delegate access for UN CSW70', perks: ['Delegate credentials', 'All sessions access', 'Networking priority', 'All Speaker perks'] },
    ];
  }),

  // Bridge conference to HybridCast emergency network
  bridgeToHybridCast: protectedProcedure
    .input(z.object({
      conferenceId: z.number(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const [confRows] = await db.execute(sql`SELECT title, room_code FROM conferences WHERE id = ${input.conferenceId}`);
      const conf = (confRows as any[])[0];
      if (!conf) throw new Error('Conference not found');
      // Log QUMUS decision for HybridCast bridge
      try {
        await qumusEngine.makeDecision({
          policyId: 'policy_emergency_response',
          confidence: 88,
          inputData: { action: 'conference_hybridcast_bridge', conferenceId: input.conferenceId, priority: input.priority },
        });
      } catch (e) { /* non-critical */ }
      await notifyOwner({
        title: `Conference Bridged to HybridCast [${input.priority.toUpperCase()}]`,
        content: `"${conf.title}" (Room: ${conf.room_code}) is now on HybridCast emergency network with ${input.priority} priority`,
      });
      return { success: true, hybridcastPriority: input.priority };
    }),
});
