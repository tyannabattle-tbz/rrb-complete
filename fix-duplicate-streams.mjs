// Fix duplicate stream URLs in the database
// 7 channels share 2 URLs — each needs a unique stream

import mysql from 'mysql2/promise';
import { config } from 'dotenv';
config();

const fixes = [
  // URL: https://listen.181fm.com/181-rnb_128k.mp3 (3 channels sharing)
  // Keep ID 42 (Candy AI Radio) on 181-rnb
  { id: 900020, name: 'Canryn Production Radio', newUrl: 'https://listen.181fm.com/181-awesome80s_128k.mp3' },
  { id: 900018, name: 'SQUADD Coalition Radio', newUrl: 'https://listen.181fm.com/181-kickin_128k.mp3' },
  
  // URL: https://listen.181fm.com/181-soul_128k.mp3 (4 channels sharing)
  // Keep ID 1 (RRB Main Radio) on 181-soul
  { id: 35, name: 'Indie & Underground', newUrl: 'https://listen.181fm.com/181-punk_128k.mp3' },
  { id: 41, name: 'Seraph AI Radio', newUrl: 'https://listen.181fm.com/181-party_128k.mp3' },
  { id: 900019, name: 'UN Advocacy Radio', newUrl: 'https://listen.181fm.com/181-classical_128k.mp3' },
];

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('=== Fixing Duplicate Stream URLs ===\n');
  
  for (const fix of fixes) {
    console.log(`Updating ${fix.name} (ID ${fix.id}) → ${fix.newUrl}`);
    await conn.execute(
      'UPDATE radio_channels SET streamUrl = ? WHERE id = ?',
      [fix.newUrl, fix.id]
    );
  }
  
  // Verify no more duplicates
  const [rows] = await conn.execute(`
    SELECT streamUrl, COUNT(*) as cnt 
    FROM radio_channels 
    GROUP BY streamUrl 
    HAVING cnt > 1
  `);
  
  if (rows.length === 0) {
    console.log('\n✅ All 54 channels now have unique stream URLs!');
  } else {
    console.log('\n⚠️ Still have duplicates:');
    rows.forEach(r => console.log(`  ${r.cnt}x: ${r.streamUrl}`));
  }
  
  // Print total unique count
  const [total] = await conn.execute('SELECT COUNT(DISTINCT streamUrl) as unique_urls, COUNT(*) as total FROM radio_channels');
  console.log(`\nTotal: ${total[0].total} channels, ${total[0].unique_urls} unique URLs`);
  
  await conn.end();
}

main().catch(console.error);
