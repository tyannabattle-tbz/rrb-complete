import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const userId = 1; // Owner Ty Bat Zan
  
  const destinations = [
    { platform: 'youtube', label: 'RRB YouTube Live', rtmp_url: 'rtmp://a.rtmp.youtube.com/live2', stream_key: '' },
    { platform: 'facebook', label: 'RRB Facebook Live', rtmp_url: 'rtmps://live-api-s.facebook.com:443/rtmp/', stream_key: '' },
    { platform: 'instagram', label: 'RRB Instagram Live', rtmp_url: 'rtmps://live-upload.instagram.com:443/rtmp/', stream_key: '' },
    { platform: 'twitter', label: 'RRB Twitter/X Live', rtmp_url: 'rtmp://prod-ec-us-east-1.pscp.tv:80/x', stream_key: '' },
    { platform: 'tiktok', label: 'RRB TikTok Live', rtmp_url: 'rtmp://push-rtmp-f5-tt.tiktokcdn.com/stage/', stream_key: '' },
    { platform: 'twitch', label: 'RRB Twitch Live', rtmp_url: 'rtmp://live.twitch.tv/app/', stream_key: '' },
    { platform: 'linkedin', label: 'RRB LinkedIn Live', rtmp_url: 'rtmp://1-edge-upload.linkedin.com:1935/rtmp/', stream_key: '' },
  ];
  
  let inserted = 0;
  for (const dest of destinations) {
    const [existing] = await conn.query(
      'SELECT id FROM stream_destinations WHERE user_id = ? AND platform = ?',
      [userId, dest.platform]
    );
    if (existing.length > 0) {
      console.log('  EXISTS:', dest.platform);
      continue;
    }
    await conn.query(
      'INSERT INTO stream_destinations (user_id, platform, label, rtmp_url, stream_key, is_enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, NOW(), NOW())',
      [userId, dest.platform, dest.label, dest.rtmp_url, dest.stream_key]
    );
    console.log('  ADDED:', dest.platform, '-', dest.label);
    inserted++;
  }
  
  console.log('Inserted:', inserted);
  
  const [all] = await conn.query(
    'SELECT platform, label, is_enabled FROM stream_destinations WHERE user_id = ?',
    [userId]
  );
  console.log('All destinations:');
  all.forEach(d => console.log(' ', d.platform, '|', d.label, '| enabled:', d.is_enabled));
  
  await conn.end();
}

main().catch(console.error);
