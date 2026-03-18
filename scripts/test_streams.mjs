import mysql from 'mysql2/promise';
import http from 'http';
import https from 'https';

async function testUrl(url) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      const ct = res.headers['content-type'] || '';
      const code = res.statusCode;
      let gotData = false;
      let bytes = 0;
      res.on('data', (chunk) => {
        bytes += chunk.length;
        if (!gotData) {
          gotData = true;
        }
        if (bytes > 1000) {
          res.destroy();
        }
      });
      res.on('end', () => resolve({ code, ct, gotData, bytes }));
      res.on('error', () => resolve({ code, ct, gotData, bytes }));
      res.on('close', () => resolve({ code, ct, gotData, bytes }));
      setTimeout(() => { res.destroy(); resolve({ code, ct, gotData, bytes }); }, 5000);
    });
    req.on('error', (e) => resolve({ code: 0, ct: '', gotData: false, bytes: 0, err: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ code: 0, ct: '', gotData: false, bytes: 0, err: 'timeout' }); });
  });
}

const c = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await c.query('SELECT id, name, genre, streamUrl FROM radio_channels ORDER BY id');

let dead = 0, alive = 0;
const results = [];
for (const r of rows) {
  const result = await testUrl(r.streamUrl);
  const isAudio = result.ct && (result.ct.includes('audio') || result.ct.includes('mpeg') || result.ct.includes('ogg'));
  const status = (result.code >= 200 && result.code < 400 && result.gotData && isAudio) ? 'LIVE' : 'DEAD';
  if (status === 'DEAD') dead++;
  else alive++;
  results.push({ status, id: r.id, name: r.name, genre: r.genre, code: result.code, ct: result.ct, bytes: result.bytes, err: result.err });
  console.log(`${status} | ${r.id} | ${r.name} | ${r.genre} | HTTP ${result.code} | ${(result.ct || 'none').substring(0,30)} | ${result.bytes}b | ${result.err || ''}`);
}
console.log('---');
console.log(`ALIVE: ${alive} DEAD: ${dead} TOTAL: ${rows.length}`);

// Show dead ones specifically
console.log('\n=== DEAD CHANNELS ===');
results.filter(r => r.status === 'DEAD').forEach(r => {
  console.log(`  #${r.id} ${r.name} (${r.genre}) - HTTP ${r.code} ${r.ct} ${r.bytes}b ${r.err || ''}`);
});

await c.end();
