import mysql from 'mysql2/promise';
import fs from 'fs';

// Load the full stream data
const allStreams = JSON.parse(fs.readFileSync('/home/ubuntu/radio_streams_full.json', 'utf8'));

// Build a lookup by genre
const byGenre = {};
for (const s of allStreams) {
  if (!byGenre[s.genre]) byGenre[s.genre] = [];
  byGenre[s.genre].push(s);
}

// Pick best stream for a genre (highest votes, prefer MP3, prefer US/UK)
function pickBest(genre, exclude = new Set()) {
  const candidates = (byGenre[genre] || []).filter(s => !exclude.has(s.url));
  if (candidates.length === 0) return null;
  // Prefer US/UK stations, then by votes
  candidates.sort((a, b) => {
    const aUS = a.country.includes('United States') || a.country.includes('United Kingdom') ? 1 : 0;
    const bUS = b.country.includes('United States') || b.country.includes('United Kingdom') ? 1 : 0;
    if (aUS !== bUS) return bUS - aUS;
    return b.votes - a.votes;
  });
  return candidates[0];
}

// Define 50 branded RRB channels with genre mappings
const channelDefs = [
  // === GOSPEL & FAITH (6 channels) ===
  { name: "RRB Gospel Hour", genre: "gospel", category: "Gospel & Faith", freq: 432, desc: "Traditional and contemporary gospel music 24/7" },
  { name: "RRB Praise & Worship", genre: "praise", category: "Gospel & Faith", freq: 432, desc: "Uplifting praise and worship music" },
  { name: "RRB Christian Hits", genre: "christian", category: "Gospel & Faith", freq: 432, desc: "Top Christian contemporary hits" },
  { name: "RRB Sunday Morning", genre: "worship", category: "Gospel & Faith", freq: 432, desc: "Sunday morning worship experience" },
  { name: "RRB Spoken Word", genre: "spoken word", category: "Gospel & Faith", freq: 432, desc: "Inspirational spoken word and sermons" },
  { name: "RRB Faith Talk", genre: "talk radio", category: "Gospel & Faith", freq: 432, desc: "Faith-based talk and discussion" },

  // === JAZZ & SOUL (7 channels) ===
  { name: "RRB Smooth Jazz", genre: "smooth jazz", category: "Jazz & Soul", freq: 432, desc: "Smooth jazz for relaxation and focus" },
  { name: "RRB Classic Jazz", genre: "jazz", category: "Jazz & Soul", freq: 432, desc: "Classic jazz standards and legends" },
  { name: "RRB Acid Jazz", genre: "acid jazz", category: "Jazz & Soul", freq: 432, desc: "Acid jazz, jazz fusion, and experimental" },
  { name: "RRB Neo Soul", genre: "neo soul", category: "Jazz & Soul", freq: 432, desc: "Neo soul vibes and modern R&B" },
  { name: "RRB Soul Classics", genre: "soul", category: "Jazz & Soul", freq: 432, desc: "Classic soul from the golden era" },
  { name: "RRB R&B Hits", genre: "r&b", category: "Jazz & Soul", freq: 432, desc: "Contemporary R&B hits and classics" },
  { name: "RRB Blues Station", genre: "blues", category: "Jazz & Soul", freq: 432, desc: "Delta blues to modern electric blues" },

  // === HIP-HOP & URBAN (5 channels) ===
  { name: "RRB Hip-Hop Central", genre: "hip hop", category: "Hip-Hop & Urban", freq: 432, desc: "Hip-hop classics and new releases" },
  { name: "RRB Trap & Bass", genre: "trap", category: "Hip-Hop & Urban", freq: 432, desc: "Trap beats and heavy bass" },
  { name: "RRB Lo-Fi Beats", genre: "lo-fi", category: "Hip-Hop & Urban", freq: 432, desc: "Lo-fi hip-hop beats to study and relax" },
  { name: "RRB Chillhop", genre: "chillhop", category: "Hip-Hop & Urban", freq: 432, desc: "Chillhop and jazzy hip-hop instrumentals" },
  { name: "RRB Urban Mix", genre: "pop", category: "Hip-Hop & Urban", freq: 432, desc: "Urban pop and crossover hits" },

  // === FUNK & DANCE (5 channels) ===
  { name: "RRB Funk Factory", genre: "funk", category: "Funk & Dance", freq: 432, desc: "Pure funk from the 60s to today" },
  { name: "RRB Disco Nights", genre: "disco", category: "Funk & Dance", freq: 432, desc: "Disco classics and dance floor fillers" },
  { name: "RRB House Music", genre: "house", category: "Funk & Dance", freq: 432, desc: "Deep house and soulful house music" },
  { name: "RRB Electronic", genre: "electronic", category: "Funk & Dance", freq: 432, desc: "Electronic music and EDM" },
  { name: "RRB Techno Underground", genre: "techno", category: "Funk & Dance", freq: 432, desc: "Underground techno and minimal" },

  // === ROCK & ALTERNATIVE (5 channels) ===
  { name: "RRB Rock Legends", genre: "rock", category: "Rock & Alternative", freq: 432, desc: "Classic rock legends and anthems" },
  { name: "RRB Alternative", genre: "alternative", category: "Rock & Alternative", freq: 432, desc: "Alternative and indie rock" },
  { name: "RRB Metal Forge", genre: "metal", category: "Rock & Alternative", freq: 432, desc: "Heavy metal and hard rock" },
  { name: "RRB Punk Radio", genre: "punk", category: "Rock & Alternative", freq: 432, desc: "Punk rock and hardcore" },
  { name: "RRB Indie Vibes", genre: "indie", category: "Rock & Alternative", freq: 432, desc: "Independent music and emerging artists" },

  // === WORLD & CULTURE (6 channels) ===
  { name: "RRB Reggae Island", genre: "reggae", category: "World & Culture", freq: 432, desc: "Reggae, dancehall, and island vibes" },
  { name: "RRB Afrobeat", genre: "afrobeat", category: "World & Culture", freq: 432, desc: "Afrobeat, Afropop, and African rhythms" },
  { name: "RRB Latin Heat", genre: "latin", category: "World & Culture", freq: 432, desc: "Latin music, salsa, and reggaeton" },
  { name: "RRB Caribbean Vibes", genre: "caribbean", category: "World & Culture", freq: 432, desc: "Caribbean music and tropical sounds" },
  { name: "RRB World Music", genre: "world", category: "World & Culture", freq: 432, desc: "Music from around the globe" },
  { name: "RRB Ska & Rocksteady", genre: "ska", category: "World & Culture", freq: 432, desc: "Ska, rocksteady, and two-tone" },

  // === HEALING & WELLNESS (5 channels) ===
  { name: "RRB Healing Frequencies", genre: "healing", category: "Healing & Wellness", freq: 432, desc: "432Hz healing frequencies and sound therapy" },
  { name: "RRB Meditation", genre: "meditation", category: "Healing & Wellness", freq: 432, desc: "Guided meditation and mindfulness" },
  { name: "RRB Ambient", genre: "ambient", category: "Healing & Wellness", freq: 432, desc: "Ambient soundscapes and atmospheric music" },
  { name: "RRB New Age", genre: "new age", category: "Healing & Wellness", freq: 432, desc: "New age music for relaxation" },
  { name: "RRB Yoga & Chill", genre: "meditation", category: "Healing & Wellness", freq: 528, desc: "Music for yoga practice and deep relaxation" },

  // === CLASSICS & HERITAGE (6 channels) ===
  { name: "RRB Oldies Gold", genre: "oldies", category: "Classics & Heritage", freq: 432, desc: "Golden oldies from the 50s, 60s, and 70s" },
  { name: "RRB Classical", genre: "classical", category: "Classics & Heritage", freq: 432, desc: "Classical masterpieces and orchestral music" },
  { name: "RRB Country Roads", genre: "country", category: "Classics & Heritage", freq: 432, desc: "Country music classics and modern country" },
  { name: "RRB Folk & Acoustic", genre: "folk", category: "Classics & Heritage", freq: 432, desc: "Folk music and acoustic performances" },
  { name: "RRB DnB Station", genre: "drum and bass", category: "Classics & Heritage", freq: 432, desc: "Drum and bass, jungle, and breakbeat" },
  { name: "RRB African Heritage", genre: "african", category: "Classics & Heritage", freq: 432, desc: "African music heritage and traditions" },

  // === SPECIAL CHANNELS (5 channels) ===
  { name: "RRB Selma Jubilee", genre: "gospel", category: "Special", freq: 432, desc: "Celebrating the Selma to Montgomery legacy" },
  { name: "RRB Little Richard Tribute", genre: "rock", category: "Special", freq: 432, desc: "Honoring the Architect of Rock & Roll" },
  { name: "RRB Ghana Connect", genre: "afrobeat", category: "Special", freq: 432, desc: "Connecting the diaspora through African music" },
  { name: "RRB Sweet Miracles", genre: "praise", category: "Special", freq: 432, desc: "A Voice for the Voiceless - charity radio" },
  { name: "RRB SQUADD Goals", genre: "hip hop", category: "Special", freq: 432, desc: "Community empowerment through music" },
];

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Clear existing channels
  await conn.execute('DELETE FROM listener_analytics');
  await conn.execute('DELETE FROM radio_channels');
  
  const usedUrls = new Set();
  let inserted = 0;
  
  for (const ch of channelDefs) {
    const stream = pickBest(ch.genre, usedUrls);
    if (!stream) {
      console.log(`WARNING: No stream found for ${ch.name} (genre: ${ch.genre})`);
      continue;
    }
    usedUrls.add(stream.url);
    
    const now = Date.now();
    // Random baseline listeners between 5-200
    const baseListeners = Math.floor(Math.random() * 195) + 5;
    
    const metadata = JSON.stringify({
      bitrate: stream.bitrate,
      codec: stream.codec,
      source: stream.name,
      description: ch.desc,
      category: ch.category,
    });
    
    await conn.execute(
      `INSERT INTO radio_channels (stationId, name, genre, streamUrl, frequency, status, currentListeners, totalListeners, metadata, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, NOW(), NOW())`,
      [870003, ch.name, ch.category, stream.url, String(ch.freq), baseListeners, baseListeners * 50, metadata]
    );
    inserted++;
    console.log(`✓ ${ch.name} → ${stream.name} (${stream.codec}/${stream.bitrate}kbps) [${baseListeners} listeners]`);
  }
  
  console.log(`\n=== Inserted ${inserted} channels ===`);
  
  // Now seed listener_analytics with 7 days of data for all channels
  const [channels] = await conn.execute('SELECT id, name, genre FROM radio_channels');
  console.log(`\nSeeding listener_analytics for ${channels.length} channels...`);
  
  const now = Date.now();
  let analyticsCount = 0;
  
  for (const channel of channels) {
    // 7 days * 24 hours = 168 data points per channel
    for (let day = 6; day >= 0; day--) {
      for (let hour = 0; hour < 24; hour++) {
        const timestamp = now - (day * 86400000) - ((23 - hour) * 3600000);
        
        // Realistic listener patterns: peak at evening, low at night
        let basePeak;
        if (hour >= 6 && hour <= 9) basePeak = 40;      // morning
        else if (hour >= 10 && hour <= 16) basePeak = 60; // midday
        else if (hour >= 17 && hour <= 22) basePeak = 100; // prime time
        else basePeak = 15;                                // late night
        
        // Genre multiplier
        const genreMultiplier = {
          'Gospel & Faith': 1.3,
          'Jazz & Soul': 1.2,
          'Hip-Hop & Urban': 1.5,
          'Funk & Dance': 1.1,
          'Rock & Alternative': 1.0,
          'World & Culture': 0.9,
          'Healing & Wellness': 0.8,
          'Classics & Heritage': 0.7,
          'Special': 1.4,
        }[channel.genre] || 1.0;
        
        const listeners = Math.max(1, Math.floor(basePeak * genreMultiplier * (0.7 + Math.random() * 0.6)));
        const peak = Math.floor(listeners * (1.1 + Math.random() * 0.3));
        const duration = Math.floor(300 + Math.random() * 3300); // 5-60 min sessions
        const devices = ['desktop', 'mobile', 'tablet', 'smart_speaker'];
        const regions = ['North America', 'Europe', 'Africa', 'Asia', 'South America', 'Caribbean'];
        
        await conn.execute(
          `INSERT INTO listener_analytics (channel_id, channel_name, listener_count, peak_listeners, geo_region, device_type, session_duration_seconds, timestamp, hour_of_day, day_of_week, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            channel.id,
            channel.name,
            listeners,
            peak,
            regions[Math.floor(Math.random() * regions.length)],
            devices[Math.floor(Math.random() * devices.length)],
            duration,
            timestamp,
            hour,
            new Date(timestamp).getDay(),
            timestamp
          ]
        );
        analyticsCount++;
      }
    }
  }
  
  console.log(`✓ Seeded ${analyticsCount} listener_analytics rows`);
  
  // Verify
  const [countResult] = await conn.execute('SELECT COUNT(*) as cnt FROM radio_channels');
  const [analyticsResult] = await conn.execute('SELECT COUNT(*) as cnt FROM listener_analytics');
  console.log(`\nFinal counts: ${countResult[0].cnt} channels, ${analyticsResult[0].cnt} analytics rows`);
  
  await conn.end();
}

main().catch(console.error);
