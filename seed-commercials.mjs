import mysql2 from 'mysql2/promise';

const conn = await mysql2.createConnection(process.env.DATABASE_URL);

// Create commercial_impressions table for detailed tracking
await conn.execute(`
  CREATE TABLE IF NOT EXISTS commercial_impressions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    commercial_id VARCHAR(100) NOT NULL,
    commercial_title VARCHAR(255) NOT NULL,
    channel_name VARCHAR(255),
    dj_voice VARCHAR(50),
    category VARCHAR(50),
    impression_type ENUM('view', 'listen', 'click', 'complete') DEFAULT 'view',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_commercial_id (commercial_id),
    INDEX idx_created_at (created_at),
    INDEX idx_channel (channel_name)
  )
`);
console.log('Created commercial_impressions table');

// Seed the 12 UN campaign commercials into the commercials table
const commercials = [
  { advertiser: 'Canryn Production', title: 'From Selma to the United Nations', duration: 60, category: 'promo' },
  { advertiser: 'Canryn Production', title: 'SQUADD Goals: A Global Mission', duration: 45, category: 'promo' },
  { advertiser: 'Sweet Miracles', title: 'A Voice for the Voiceless', duration: 30, category: 'psa' },
  { advertiser: 'Canryn Production', title: 'Ghana Partnership Spotlight', duration: 45, category: 'promo' },
  { advertiser: 'Sweet Miracles', title: 'Elder Protection Initiative', duration: 30, category: 'psa' },
  { advertiser: 'HybridCast', title: 'HybridCast: When Every Second Counts', duration: 30, category: 'promo' },
  { advertiser: 'RRB Radio', title: 'RRB Station Bumper', duration: 15, category: 'bumper' },
  { advertiser: 'Canryn Production', title: 'Sweet Miracles: Healing Through Music', duration: 45, category: 'testimonial' },
  { advertiser: 'Canryn Production', title: 'The Legacy Continues', duration: 30, category: 'promo' },
  { advertiser: 'Canryn Production', title: 'Tech Showcase: QUMUS AI', duration: 30, category: 'promo' },
  { advertiser: 'Canryn Production', title: 'March 17th Countdown', duration: 15, category: 'countdown' },
  { advertiser: 'Canryn Production', title: 'Call to Action: Join the Movement', duration: 30, category: 'promo' },
];

for (const c of commercials) {
  await conn.execute(
    `INSERT INTO commercials (break_id, advertiser, title, file_url, duration, is_active, impressions, clicks) VALUES (1, ?, ?, ?, ?, 1, 0, 0)`,
    [c.advertiser, c.title, `https://rrb-radio.s3.amazonaws.com/commercials/${c.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.mp3`, c.duration]
  );
}
console.log(`Seeded ${commercials.length} commercials`);

// Seed baseline impression data (last 7 days)
const channels = [
  'RRB Gospel Hour', 'RRB Jazz Lounge', 'RRB Soul Kitchen', 'RRB Hip-Hop Classics',
  'RRB Healing Frequencies', 'RRB Funk Factory', 'RRB Rock & Roll Revival'
];
const djVoices = ['valanna', 'seraph', 'candy'];
const categories = ['promo', 'psa', 'bumper', 'countdown', 'testimonial'];
const types = ['view', 'listen', 'click', 'complete'];

let impressionCount = 0;
const now = new Date();

for (let day = 6; day >= 0; day--) {
  for (let hour = 0; hour < 24; hour++) {
    // Each hour, 2-5 impressions across channels
    const numImpressions = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numImpressions; i++) {
      const commercial = commercials[Math.floor(Math.random() * commercials.length)];
      const channel = channels[Math.floor(Math.random() * channels.length)];
      const dj = djVoices[Math.floor(Math.random() * djVoices.length)];
      // Weight toward views (60%), listens (25%), clicks (10%), completes (5%)
      const typeRoll = Math.random();
      const type = typeRoll < 0.6 ? 'view' : typeRoll < 0.85 ? 'listen' : typeRoll < 0.95 ? 'click' : 'complete';
      
      const ts = new Date(now);
      ts.setDate(ts.getDate() - day);
      ts.setHours(hour, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
      
      await conn.execute(
        `INSERT INTO commercial_impressions (commercial_id, commercial_title, channel_name, dj_voice, category, impression_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          commercial.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          commercial.title,
          channel,
          dj,
          commercial.category || 'promo',
          type,
          ts.toISOString().slice(0, 19).replace('T', ' ')
        ]
      );
      impressionCount++;
    }
  }
}

// Also update the commercials table impression counts
const [allComm] = await conn.execute('SELECT id, title FROM commercials');
for (const c of allComm) {
  const [impCount] = await conn.execute(
    'SELECT COUNT(*) as cnt FROM commercial_impressions WHERE commercial_title = ?',
    [c.title]
  );
  await conn.execute('UPDATE commercials SET impressions = ? WHERE id = ?', [impCount[0].cnt, c.id]);
}

console.log(`Seeded ${impressionCount} commercial impressions`);

// Verify
const [verify] = await conn.execute('SELECT COUNT(*) as cnt FROM commercial_impressions');
const [verify2] = await conn.execute('SELECT COUNT(*) as cnt, SUM(impressions) as total FROM commercials');
console.log(`Verification: ${verify[0].cnt} impressions, ${verify2[0].cnt} commercials, ${verify2[0].total} total tracked`);

await conn.end();
