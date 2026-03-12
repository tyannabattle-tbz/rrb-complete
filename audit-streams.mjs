// Full Stream Audit — Tests every channel URL for playability
import mysql from 'mysql2/promise';
import http from 'http';
import https from 'https';
import { config } from 'dotenv';
config();

function testStream(url, timeoutMs = 8000) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const startTime = Date.now();
    
    try {
      const req = protocol.get(url, { 
        timeout: timeoutMs,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RRBRadio/1.0)',
          'Accept': '*/*',
          'Icy-MetaData': '1',
        }
      }, (res) => {
        const elapsed = Date.now() - startTime;
        const contentType = res.headers['content-type'] || '';
        const icyName = res.headers['icy-name'] || '';
        const icyGenre = res.headers['icy-genre'] || '';
        const icyBr = res.headers['icy-br'] || '';
        const icyDescription = res.headers['icy-description'] || '';
        
        // Collect first few bytes to verify it's audio data
        let bytesReceived = 0;
        let dataReceived = false;
        
        res.on('data', (chunk) => {
          bytesReceived += chunk.length;
          dataReceived = true;
          if (bytesReceived > 1024) {
            res.destroy(); // Got enough data, stop
          }
        });
        
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            contentType,
            icyName: icyName || null,
            icyGenre: icyGenre || null,
            icyBitrate: icyBr || null,
            icyDescription: icyDescription || null,
            responseTime: elapsed,
            bytesReceived,
            dataReceived,
            playable: (res.statusCode === 200 || res.statusCode === 302) && dataReceived,
            error: null,
          });
        });
        
        res.on('error', () => {
          resolve({
            status: res.statusCode,
            contentType,
            icyName: icyName || null,
            icyGenre: icyGenre || null,
            icyBitrate: icyBr || null,
            icyDescription: icyDescription || null,
            responseTime: elapsed,
            bytesReceived,
            dataReceived,
            playable: (res.statusCode === 200 || res.statusCode === 302) && bytesReceived > 0,
            error: null,
          });
        });
        
        // If redirect, follow it
        if (res.statusCode === 301 || res.statusCode === 302) {
          res.destroy();
          const redirectUrl = res.headers.location;
          if (redirectUrl) {
            testStream(redirectUrl, timeoutMs - elapsed).then(resolve);
          } else {
            resolve({
              status: res.statusCode,
              contentType,
              icyName: null, icyGenre: null, icyBitrate: null, icyDescription: null,
              responseTime: elapsed, bytesReceived: 0, dataReceived: false,
              playable: false,
              error: 'Redirect with no location header',
            });
          }
          return;
        }
        
        // Timeout for data
        setTimeout(() => {
          res.destroy();
          if (!dataReceived) {
            resolve({
              status: res.statusCode,
              contentType,
              icyName: icyName || null,
              icyGenre: icyGenre || null,
              icyBitrate: icyBr || null,
              icyDescription: icyDescription || null,
              responseTime: elapsed,
              bytesReceived: 0,
              dataReceived: false,
              playable: false,
              error: 'Connected but no data received',
            });
          }
        }, 5000);
      });
      
      req.on('error', (err) => {
        resolve({
          status: 0,
          contentType: '',
          icyName: null, icyGenre: null, icyBitrate: null, icyDescription: null,
          responseTime: Date.now() - startTime,
          bytesReceived: 0,
          dataReceived: false,
          playable: false,
          error: err.message,
        });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({
          status: 0,
          contentType: '',
          icyName: null, icyGenre: null, icyBitrate: null, icyDescription: null,
          responseTime: timeoutMs,
          bytesReceived: 0,
          dataReceived: false,
          playable: false,
          error: 'Connection timeout',
        });
      });
    } catch (err) {
      resolve({
        status: 0,
        contentType: '',
        icyName: null, icyGenre: null, icyBitrate: null, icyDescription: null,
        responseTime: 0,
        bytesReceived: 0,
        dataReceived: false,
        playable: false,
        error: err.message,
      });
    }
  });
}

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const [channels] = await conn.execute('SELECT id, name, genre, frequency, streamUrl, metadata FROM radio_channels ORDER BY id');
  
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║          FULL STREAM AUDIT — RRB Radio 54 Channels         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  const results = [];
  let playable = 0;
  let dead = 0;
  let mislabeled = [];
  
  for (const ch of channels) {
    process.stdout.write(`  Testing [${ch.id}] ${ch.name.padEnd(30)} ... `);
    const result = await testStream(ch.streamUrl);
    results.push({ ...ch, ...result });
    
    if (result.playable) {
      playable++;
      // Check for mislabeling
      if (result.icyName) {
        const icyLower = result.icyName.toLowerCase();
        const nameLower = ch.name.toLowerCase();
        const genreLower = (ch.genre || '').toLowerCase();
        
        // Check if the ICY name has any relation to the channel name/genre
        const nameWords = nameLower.split(/[\s,&-]+/).filter(w => w.length > 2);
        const hasMatch = nameWords.some(w => icyLower.includes(w));
        
        if (!hasMatch && result.icyName !== 'Unspecified name') {
          mislabeled.push({
            id: ch.id,
            name: ch.name,
            genre: ch.genre,
            icyName: result.icyName,
            icyGenre: result.icyGenre,
          });
        }
      }
      console.log(`✅ LIVE (${result.icyName || 'no ICY'}) ${result.icyBitrate ? result.icyBitrate + 'kbps' : ''} [${result.responseTime}ms]`);
    } else {
      dead++;
      console.log(`❌ DEAD — ${result.error || `HTTP ${result.status}`} [${result.responseTime}ms]`);
    }
  }
  
  console.log('\n' + '═'.repeat(70));
  console.log(`\n📊 AUDIT SUMMARY`);
  console.log(`   Total channels: ${channels.length}`);
  console.log(`   ✅ Playable:    ${playable}`);
  console.log(`   ❌ Dead/Error:  ${dead}`);
  console.log(`   ⚠️  Mislabeled:  ${mislabeled.length}`);
  
  if (dead > 0) {
    console.log(`\n❌ DEAD CHANNELS (need replacement):`);
    results.filter(r => !r.playable).forEach(r => {
      console.log(`   [${r.id}] ${r.name} — ${r.error || `HTTP ${r.status}`}`);
      console.log(`       URL: ${r.streamUrl}`);
    });
  }
  
  if (mislabeled.length > 0) {
    console.log(`\n⚠️  MISLABELED CHANNELS (ICY name doesn't match channel name):`);
    mislabeled.forEach(m => {
      console.log(`   [${m.id}] "${m.name}" (genre: ${m.genre})`);
      console.log(`       Actually playing: "${m.icyName}" (ICY genre: ${m.icyGenre || 'unknown'})`);
    });
  }
  
  // Check for duplicate URLs
  const urlMap = {};
  channels.forEach(ch => {
    if (!urlMap[ch.streamUrl]) urlMap[ch.streamUrl] = [];
    urlMap[ch.streamUrl].push(ch.name);
  });
  const dupes = Object.entries(urlMap).filter(([, names]) => names.length > 1);
  if (dupes.length > 0) {
    console.log(`\n🔄 DUPLICATE URLs (channels sharing same stream):`);
    dupes.forEach(([url, names]) => {
      console.log(`   ${url.substring(0, 60)}...`);
      names.forEach(n => console.log(`     → ${n}`));
    });
  }
  
  // Output JSON for programmatic use
  const auditReport = {
    timestamp: new Date().toISOString(),
    totalChannels: channels.length,
    playable,
    dead,
    mislabeled: mislabeled.length,
    duplicateUrls: dupes.length,
    deadChannels: results.filter(r => !r.playable).map(r => ({ id: r.id, name: r.name, url: r.streamUrl, error: r.error })),
    mislabeledChannels: mislabeled,
    duplicateChannels: dupes.map(([url, names]) => ({ url, channels: names })),
    allResults: results.map(r => ({
      id: r.id, name: r.name, genre: r.genre, url: r.streamUrl,
      playable: r.playable, icyName: r.icyName, icyGenre: r.icyGenre,
      icyBitrate: r.icyBitrate, responseTime: r.responseTime, error: r.error,
    })),
  };
  
  const fs = await import('fs');
  fs.writeFileSync('/home/ubuntu/audit-report.json', JSON.stringify(auditReport, null, 2));
  console.log('\n📄 Full audit report saved to /home/ubuntu/audit-report.json');
  
  await conn.end();
}

main().catch(console.error);
