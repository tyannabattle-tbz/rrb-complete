/**
 * Radio Directory Listing Router — Canryn Production
 * 
 * Manages radio station presence across global directories:
 * - RadioBrowser API (programmatic auto-registration)
 * - TuneIn, Radio Garden, Radio.net, Streema, etc. (manual submission tracking)
 * - Stream metadata endpoint for directory scrapers
 * - Station profile/branding management
 * - Stream health monitoring
 */
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

// RadioBrowser API servers
const RADIO_BROWSER_SERVERS = [
  'https://de2.api.radio-browser.info',
  'https://fi1.api.radio-browser.info',
  'https://nl1.api.radio-browser.info',
];

function getRandomServer() {
  return RADIO_BROWSER_SERVERS[Math.floor(Math.random() * RADIO_BROWSER_SERVERS.length)];
}

// All supported directories with submission info
const DIRECTORY_CATALOG = [
  {
    id: 'radiobrowser',
    name: 'RadioBrowser',
    description: 'Community-driven open directory used by VLC, Kodi, and 100s of apps worldwide',
    reach: '100+ apps',
    submissionType: 'api' as const,
    submissionUrl: 'https://www.radio-browser.info/',
    logoUrl: 'https://www.radio-browser.info/favicon.ico',
  },
  {
    id: 'tunein',
    name: 'TuneIn',
    description: 'Largest internet radio directory with 75M+ monthly users. Available on smart speakers, cars, and mobile.',
    reach: '75M+ monthly users',
    submissionType: 'manual' as const,
    submissionUrl: 'https://broadcasters.tunein.com/stations/add',
    logoUrl: 'https://tunein.com/favicon.ico',
    instructions: 'Visit TuneIn On Air portal. Fill in station name, stream URL, genre, and location. US stations use the broadcaster portal; non-US stations use the self-service portal.',
  },
  {
    id: 'radiogarden',
    name: 'Radio Garden',
    description: 'Visual globe-based radio discovery. Great for community and independent radio stations.',
    reach: 'Global visual discovery',
    submissionType: 'manual' as const,
    submissionUrl: 'http://radio.garden/settings/add',
    logoUrl: 'https://radio.garden/favicon.ico',
    instructions: 'Submit your station via the Radio Garden add station form. Include stream URL, station name, location (city/country), and genre.',
  },
  {
    id: 'radionet',
    name: 'Radio.net',
    description: 'One of the largest directories with 60,000+ stations. Strong European presence.',
    reach: '60K+ stations',
    submissionType: 'manual' as const,
    submissionUrl: 'https://www.radio.net/s/addstation',
    logoUrl: 'https://www.radio.net/favicon.ico',
    instructions: 'Submit station via the Radio.net add station form. Provide stream URL, name, country, genre, and station logo.',
  },
  {
    id: 'streema',
    name: 'Streema (Simple Radio)',
    description: 'Global directory powering the Simple Radio app. Browse by genre, country, and city.',
    reach: 'Global directory',
    submissionType: 'manual' as const,
    submissionUrl: 'https://streema.com/radios/add/',
    logoUrl: 'https://streema.com/favicon.ico',
    instructions: 'Add your station on Streema. Provide station name, stream URL, website, country, city, and genres.',
  },
  {
    id: 'onlineradiobox',
    name: 'Online Radio Box',
    description: 'Large directory with schedule features and live listener counts.',
    reach: 'Global with analytics',
    submissionType: 'manual' as const,
    submissionUrl: 'https://onlineradiobox.com/add/',
    logoUrl: 'https://onlineradiobox.com/favicon.ico',
    instructions: 'Submit via Online Radio Box. Include station name, stream URL, website, country, city, genre, and description.',
  },
  {
    id: 'audacy',
    name: 'Audacy (Radio.com)',
    description: 'US-focused directory. Particularly strong for regional and local stations.',
    reach: 'US regional focus',
    submissionType: 'manual' as const,
    submissionUrl: 'https://www.audacy.com/contact',
    logoUrl: 'https://www.audacy.com/favicon.ico',
    instructions: 'Contact Audacy to submit your station. FCC call letters may be required for US stations.',
  },
  {
    id: 'radiofm',
    name: 'RadioFM',
    description: '45,000+ stations with 50M+ active listeners globally.',
    reach: '50M+ active listeners',
    submissionType: 'manual' as const,
    submissionUrl: 'https://www.radiofm.net/add-station',
    logoUrl: 'https://www.radiofm.net/favicon.ico',
    instructions: 'Submit your station on RadioFM. Provide stream URL, station name, genre, country, and logo.',
  },
  {
    id: 'internetradio',
    name: 'Internet Radio',
    description: 'Large collection of indie and niche broadcasts. Popular among independent creators.',
    reach: 'Indie/niche audience',
    submissionType: 'manual' as const,
    submissionUrl: 'https://www.internet-radio.com/submit/',
    logoUrl: 'https://www.internet-radio.com/favicon.ico',
    instructions: 'Submit via Internet Radio directory. Provide station name, stream URL, genre, bitrate, and description.',
  },
  {
    id: 'shoutcast',
    name: 'SHOUTcast Directory',
    description: 'Classic internet radio directory. Requires SHOUTcast or Icecast compatible stream.',
    reach: 'Classic internet radio',
    submissionType: 'manual' as const,
    submissionUrl: 'https://www.shoutcast.com/',
    logoUrl: 'https://www.shoutcast.com/favicon.ico',
    instructions: 'Register for a SHOUTcast Freemium plan. Set public=yes in your stream settings. Fill in station name, genre, and URL in the SHOUTcast admin panel.',
  },
];

export const radioDirectoryRouter = router({
  // Get all available directories with submission info
  getDirectories: protectedProcedure.query(() => DIRECTORY_CATALOG),

  // Get station profile/branding info for submissions
  getStationProfile: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return null;
    try {
      const rows = await db.execute(
        sql`SELECT * FROM radio_station_profile ORDER BY id DESC LIMIT 1`
      );
      return (rows as any)[0]?.[0] ?? null;
    } catch {
      return null;
    }
  }),

  // Save/update station profile
  saveStationProfile: protectedProcedure
    .input(z.object({
      stationName: z.string().min(1),
      tagline: z.string().optional(),
      description: z.string().optional(),
      genre: z.string().optional(),
      tags: z.string().optional(),
      streamUrl: z.string().url(),
      websiteUrl: z.string().url().optional(),
      logoUrl: z.string().optional(),
      bannerUrl: z.string().optional(),
      country: z.string().optional(),
      countryCode: z.string().max(2).optional(),
      state: z.string().optional(),
      city: z.string().optional(),
      language: z.string().optional(),
      languageCode: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      contactEmail: z.string().email().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      // Upsert: try update first, then insert
      try {
        await db.execute(sql`
          INSERT INTO radio_station_profile (
            station_name, tagline, description, genre, tags, stream_url,
            website_url, logo_url, banner_url, country, country_code,
            state, city, language, language_code, latitude, longitude, contact_email
          ) VALUES (
            ${input.stationName}, ${input.tagline ?? null}, ${input.description ?? null},
            ${input.genre ?? null}, ${input.tags ?? null}, ${input.streamUrl},
            ${input.websiteUrl ?? null}, ${input.logoUrl ?? null}, ${input.bannerUrl ?? null},
            ${input.country ?? null}, ${input.countryCode ?? null},
            ${input.state ?? null}, ${input.city ?? null},
            ${input.language ?? null}, ${input.languageCode ?? null},
            ${input.latitude ?? null}, ${input.longitude ?? null},
            ${input.contactEmail ?? null}
          ) ON DUPLICATE KEY UPDATE
            station_name = VALUES(station_name),
            tagline = VALUES(tagline),
            description = VALUES(description),
            genre = VALUES(genre),
            tags = VALUES(tags),
            stream_url = VALUES(stream_url),
            website_url = VALUES(website_url),
            logo_url = VALUES(logo_url),
            banner_url = VALUES(banner_url),
            country = VALUES(country),
            country_code = VALUES(country_code),
            state = VALUES(state),
            city = VALUES(city),
            language = VALUES(language),
            language_code = VALUES(language_code),
            latitude = VALUES(latitude),
            longitude = VALUES(longitude),
            contact_email = VALUES(contact_email)
        `);
      } catch {
        // Table might not exist yet, create it
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS radio_station_profile (
            id INT AUTO_INCREMENT PRIMARY KEY,
            station_name VARCHAR(400) NOT NULL,
            tagline VARCHAR(500),
            description TEXT,
            genre VARCHAR(200),
            tags VARCHAR(500),
            stream_url VARCHAR(1000) NOT NULL,
            website_url VARCHAR(1000),
            logo_url VARCHAR(1000),
            banner_url VARCHAR(1000),
            country VARCHAR(100),
            country_code VARCHAR(2),
            state VARCHAR(100),
            city VARCHAR(100),
            language VARCHAR(100),
            language_code VARCHAR(10),
            latitude DECIMAL(10,6),
            longitude DECIMAL(10,6),
            contact_email VARCHAR(255),
            radiobrowser_uuid VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        await db.execute(sql`
          INSERT INTO radio_station_profile (
            station_name, tagline, description, genre, tags, stream_url,
            website_url, logo_url, banner_url, country, country_code,
            state, city, language, language_code, latitude, longitude, contact_email
          ) VALUES (
            ${input.stationName}, ${input.tagline ?? null}, ${input.description ?? null},
            ${input.genre ?? null}, ${input.tags ?? null}, ${input.streamUrl},
            ${input.websiteUrl ?? null}, ${input.logoUrl ?? null}, ${input.bannerUrl ?? null},
            ${input.country ?? null}, ${input.countryCode ?? null},
            ${input.state ?? null}, ${input.city ?? null},
            ${input.language ?? null}, ${input.languageCode ?? null},
            ${input.latitude ?? null}, ${input.longitude ?? null},
            ${input.contactEmail ?? null}
          )
        `);
      }
      return { success: true };
    }),

  // Register station on RadioBrowser (programmatic API)
  registerOnRadioBrowser: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(400),
      url: z.string().url(),
      homepage: z.string().url().optional(),
      favicon: z.string().url().optional(),
      countrycode: z.string().max(2).optional(),
      iso_3166_2: z.string().optional(),
      languagecodes: z.string().optional(),
      tags: z.string().optional(),
      geo_lat: z.number().optional(),
      geo_long: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const server = getRandomServer();
      try {
        const params = new URLSearchParams();
        Object.entries(input).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });

        const response = await fetch(`${server}/json/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'CanrynProduction/1.0',
          },
          body: params.toString(),
        });

        const result = await response.json();

        if (result.ok) {
          // Save the UUID to our profile
          const db = await getDb();
          if (db) {
            try {
              await db.execute(sql`
                UPDATE radio_station_profile SET radiobrowser_uuid = ${result.uuid}
                ORDER BY id DESC LIMIT 1
              `);
            } catch { /* non-critical */ }
          }
        }

        return {
          success: result.ok === true,
          uuid: result.uuid,
          message: result.message,
        };
      } catch (error: any) {
        return {
          success: false,
          uuid: null,
          message: `Failed to register: ${error.message}`,
        };
      }
    }),

  // Search RadioBrowser for our station (verify listing)
  searchRadioBrowser: protectedProcedure
    .input(z.object({ name: z.string().optional(), url: z.string().optional() }))
    .query(async ({ input }) => {
      const server = getRandomServer();
      try {
        const params = new URLSearchParams();
        if (input.name) params.append('name', input.name);
        if (input.url) params.append('url', input.url);
        params.append('limit', '10');

        const response = await fetch(`${server}/json/stations/search?${params.toString()}`, {
          headers: { 'User-Agent': 'CanrynProduction/1.0' },
        });

        return await response.json();
      } catch {
        return [];
      }
    }),

  // Get directory submission tracking
  getSubmissionTracking: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    try {
      const rows = await db.execute(
        sql`SELECT * FROM radio_directory_submissions ORDER BY submitted_at DESC`
      );
      return (rows as any)[0] ?? [];
    } catch {
      return [];
    }
  }),

  // Track a directory submission
  trackSubmission: protectedProcedure
    .input(z.object({
      directoryId: z.string(),
      directoryName: z.string(),
      status: z.enum(['pending', 'submitted', 'approved', 'rejected', 'listed']),
      submissionUrl: z.string().optional(),
      listingUrl: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      try {
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS radio_directory_submissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            directory_id VARCHAR(50) NOT NULL,
            directory_name VARCHAR(200) NOT NULL,
            status ENUM('pending','submitted','approved','rejected','listed') DEFAULT 'pending',
            submission_url VARCHAR(1000),
            listing_url VARCHAR(1000),
            notes TEXT,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_directory (directory_id)
          )
        `);
        await db.execute(sql`
          INSERT INTO radio_directory_submissions (directory_id, directory_name, status, submission_url, listing_url, notes)
          VALUES (${input.directoryId}, ${input.directoryName}, ${input.status}, ${input.submissionUrl ?? null}, ${input.listingUrl ?? null}, ${input.notes ?? null})
          ON DUPLICATE KEY UPDATE
            status = VALUES(status),
            listing_url = VALUES(listing_url),
            notes = VALUES(notes),
            updated_at = CURRENT_TIMESTAMP
        `);
      } catch (error: any) {
        throw new Error(`Failed to track submission: ${error.message}`);
      }
      return { success: true };
    }),

  // Stream health check — ping the stream URL
  checkStreamHealth: protectedProcedure
    .input(z.object({ streamUrl: z.string().url() }))
    .query(async ({ input }) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(input.streamUrl, {
          method: 'HEAD',
          signal: controller.signal,
          headers: { 'User-Agent': 'CanrynProduction/1.0' },
        });

        clearTimeout(timeout);

        return {
          isUp: response.ok,
          statusCode: response.status,
          contentType: response.headers.get('content-type'),
          icyName: response.headers.get('icy-name'),
          icyGenre: response.headers.get('icy-genre'),
          icyBitrate: response.headers.get('icy-br'),
          checkedAt: new Date().toISOString(),
        };
      } catch (error: any) {
        return {
          isUp: false,
          statusCode: 0,
          contentType: null,
          icyName: null,
          icyGenre: null,
          icyBitrate: null,
          checkedAt: new Date().toISOString(),
          error: error.message,
        };
      }
    }),

  // Public now-playing metadata endpoint (for directory scrapers)
  getNowPlaying: publicProcedure.query(async () => {
    // This returns the current track info for external consumers
    // In production, this would read from the actual stream metadata
    return {
      station: 'Rockin\' Rockin\' Boogie Radio',
      artist: '',
      title: '',
      album: '',
      genre: 'R&B, Soul, Gospel, Jazz, Blues, Hip-Hop',
      bitrate: '128',
      listeners: 0,
      updatedAt: new Date().toISOString(),
    };
  }),
});
