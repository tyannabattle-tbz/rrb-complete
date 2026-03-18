import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Check current failed posts
  const [failed] = await conn.query(
    "SELECT id, platform, status, content FROM social_media_posts WHERE status = 'failed' ORDER BY id"
  );
  console.log(`Found ${failed.length} failed posts:`);
  failed.forEach(p => console.log(`  #${p.id} [${p.platform}] ${p.content.substring(0, 60)}...`));
  
  // Re-queue all failed posts to scheduled
  const [result] = await conn.query(
    "UPDATE social_media_posts SET status = 'scheduled', updated_at = NOW() WHERE status = 'failed'"
  );
  console.log(`\nRe-queued ${result.affectedRows} posts to 'scheduled' status`);
  
  // Verify
  const [scheduled] = await conn.query(
    "SELECT id, platform, status FROM social_media_posts WHERE status = 'scheduled' ORDER BY id"
  );
  console.log(`\nNow ${scheduled.length} posts in 'scheduled' status:`);
  scheduled.forEach(p => console.log(`  #${p.id} [${p.platform}] → ${p.status}`));
  
  // Show overall stats
  const [stats] = await conn.query(
    "SELECT status, COUNT(*) as count FROM social_media_posts GROUP BY status"
  );
  console.log('\nPost statistics:');
  stats.forEach(s => console.log(`  ${s.status}: ${s.count}`));
  
  await conn.end();
}

main().catch(console.error);
