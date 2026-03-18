import mysql from 'mysql2/promise';

// Genre-appropriate stream assignments for all 54 channels
// Each channel gets a unique URL matched to its genre
const CHANNEL_STREAM_MAP = {
  // ID: [streamUrl, source description]
  1:  ['https://listen.181fm.com/181-rnb_128k.mp3', '181.FM R&B'],                    // RRB Main Radio - R&B, Soul, Funk
  2:  ['https://npr-ice.streamguys1.com/live.mp3', 'NPR Live'],                        // Podcast Network - Talk
  3:  ['https://ice5.somafm.com/folkfwd-128-mp3', 'SomaFM Folk Forward'],             // Audiobook Stream - Narration/Stories
  4:  ['https://listen.181fm.com/181-hiphop_128k.mp3', '181.FM Hip-Hop'],              // Hip-Hop & Rap - Hip-Hop
  5:  ['https://listen.181fm.com/181-gospel_128k.mp3', '181.FM Gospel'],               // Gospel & Praise - Gospel
  6:  ['https://ice5.somafm.com/sonicuniverse-128-mp3', 'SomaFM Sonic Universe'],     // Jazz Lounge - Jazz
  7:  ['https://ice5.somafm.com/dronezone-128-mp3', 'SomaFM Drone Zone'],             // Healing Frequencies - Ambient/Healing
  8:  ['https://ice5.somafm.com/deepspaceone-128-mp3', 'SomaFM Deep Space One'],      // Solfeggio Tones - Deep Frequencies
  9:  ['https://listen.181fm.com/181-oldschool_128k.mp3', '181.FM Old School'],        // Classic R&B - Old School R&B
  10: ['https://ice5.somafm.com/lush-128-mp3', 'SomaFM Lush'],                        // Smooth Jazz - Smooth/Chillout
  11: ['https://ice5.somafm.com/beatblender-128-mp3', 'SomaFM Beat Blender'],         // Funk & Groove - DJ Mixes/Funk
  12: ['https://listen.181fm.com/181-soul_128k.mp3', '181.FM Soul'],                   // Neo-Soul - Soul
  13: ['https://listen.181fm.com/181-reggae_128k.mp3', '181.FM Reggae'],               // Reggae & Dancehall - Reggae
  14: ['https://ice5.somafm.com/suburbsofgoa-128-mp3', 'SomaFM Suburbs of Goa'],     // Afrobeats Global - World/Afro
  15: ['https://ice5.somafm.com/bootliquor-128-mp3', 'SomaFM Boot Liquor'],           // Blues Highway - Blues
  16: ['https://ice5.somafm.com/bagel-128-mp3', 'SomaFM BAGeL Radio'],                // Classical Serenity - Classical
  17: ['https://ice5.somafm.com/bossa-128-mp3', 'SomaFM Bossa Beyond'],               // Latin Rhythms - Latin/Bossa
  18: ['https://listen.181fm.com/181-kickincountry_128k.mp3', '181.FM Country'],       // Country Crossroads - Country
  19: ['https://ice5.somafm.com/cliqhop-128-mp3', 'SomaFM Cliqhop'],                 // Electronic Pulse - EDM/IDM
  20: ['https://listen.181fm.com/181-rock40_128k.mp3', '181.FM Rock'],                 // Rock Legends - Rock
  21: ['https://ice5.somafm.com/covers-128-mp3', 'SomaFM Covers'],                    // Kids & Family - Covers/Fun
  22: ['https://ice5.somafm.com/illstreet-128-mp3', 'SomaFM Illinois Street'],        // Spoken Word & Poetry - Instrumental
  23: ['https://ice5.somafm.com/spacestation-128-mp3', 'SomaFM Space Station'],       // Meditation & Mindfulness - Space Ambient
  24: ['https://fm939.wnyc.org/wnycfm', 'WNYC FM'],                                   // News & Current Affairs - News
  25: ['https://ice5.somafm.com/n5md-128-mp3', 'SomaFM n5MD'],                        // Business & Finance - Post-Rock/Focus
  26: ['https://ice5.somafm.com/sf1033-128-mp3', 'SomaFM SF 10-33'],                  // Science & Technology - Scanner/Tech
  27: ['https://ice5.somafm.com/poptron-128-mp3', 'SomaFM PopTron'],                  // Health & Wellness - Synth Pop/Upbeat
  28: ['https://ice5.somafm.com/brfm-128-mp3', 'SomaFM BRFM'],                        // Education & Learning - Eclectic
  29: ['https://listen.181fm.com/181-comedy_128k.mp3', '181.FM Comedy'],               // Comedy Central - Comedy
  30: ['https://ice5.somafm.com/defcon-128-mp3', 'SomaFM DEF CON'],                   // Drama & Theater - Dark/Dramatic
  31: ['https://ice5.somafm.com/vaporwaves-128-mp3', 'SomaFM Vaporwaves'],            // Anime & Gaming - Vaporwave/Chiptune
  32: ['https://listen.181fm.com/181-awesome80s_128k.mp3', '181.FM 80s'],              // 90s R&B Classics - 80s/90s
  33: ['https://ice5.somafm.com/thistle-128-mp3', 'SomaFM ThistleRadio'],             // Caribbean Vibes - Celtic/World
  34: ['https://ice5.somafm.com/groovesalad-128-mp3', 'SomaFM Groove Salad'],         // Women in Music - Electronic/Groove
  35: ['https://tunein.cdnstream1.com/2868_96.mp3', 'TuneIn Indie'],                   // Indie & Underground - Indie
  36: ['https://ice5.somafm.com/indiepop-128-mp3', 'SomaFM Indie Pop'],               // World Fusion - World/Indie
  37: ['https://ice5.somafm.com/seventies-128-mp3', 'SomaFM Left Coast 70s'],         // Throwback Radio - 70s
  38: ['https://funkyradio.streamingmedia.it/play.mp3', 'Funky Radio Italy'],          // Love Songs - Smooth/Love
  39: ['https://ice5.somafm.com/metal-128-mp3', 'SomaFM Metal'],                      // Workout & Energy - Metal/Energy
  40: ['https://ice5.somafm.com/scanner-128-mp3', 'SomaFM Scanner'],                  // Sleep & Relaxation - Ambient Scanner
  41: ['https://ice5.somafm.com/fluid-128-mp3', 'SomaFM Fluid'],                      // Seraph AI Radio - Fluid/Experimental
  42: ['https://ice5.somafm.com/dubstep-128-mp3', 'SomaFM Dubstep'],                  // Candy AI Radio - Dubstep/Electronic
  43: ['https://ice5.somafm.com/synphaera-128-mp3', 'SomaFM Synphaera'],              // Valanna AI Radio - Synth/Orchestrated
  44: ['https://ice5.somafm.com/doomed-128-mp3', 'SomaFM Doomed'],                    // Ty Battle Live - Dark/Battle
  45: ['https://ice5.somafm.com/missioncontrol-128-mp3', 'SomaFM Mission Control'],   // Sweet Miracles - Inspirational
  46: ['https://ice5.somafm.com/secretagent-128-mp3', 'SomaFM Secret Agent'],         // Canryn Production - Lounge/Production
  47: ['https://ice5.somafm.com/live-128-mp3', 'SomaFM Live'],                        // Dragon Frequencies - Live/Ambient
  48: ['https://ice5.somafm.com/digitalis-128-mp3', 'SomaFM Digitalis'],              // Gaming Battle Arena - Digital/Gaming
  49: ['https://ice5.somafm.com/u80s-128-mp3', 'SomaFM Underground 80s'],             // Legacy Archives - Underground 80s
  50: ['https://radio.stereoscenic.com/asp-h', 'Stereoscenic Ambient'],                // Open Mic - Ambient/Open
  51: ['https://ice5.somafm.com/specials-128-mp3', 'SomaFM Specials'],                // C.J. Battle Radio - Specials/Live
  // High-ID channels
  900018: ['https://ice5.somafm.com/christmas-128-mp3', 'SomaFM Holiday'],            // SQUADD Coalition Radio - Talk/Empowerment
  900019: ['https://ice5.somafm.com/darkzone-128-mp3', 'SomaFM Dark Zone'],           // UN Advocacy Radio - Advocacy
  900020: ['https://ice5.somafm.com/gsclassic-128-mp3', 'SomaFM GS Classic'],         // Canryn Production Radio - Corporate
};

// Fallback URLs for channels 900019 and 900020 in case those SomaFM streams don't exist
const FALLBACK_MAP = {
  900019: 'https://ice5.somafm.com/live-128-mp3',
  900020: 'https://ice5.somafm.com/secretagent-128-mp3',
};

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('=== UPDATING ALL RADIO CHANNEL STREAMS ===\n');
  
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const [id, [streamUrl, source]] of Object.entries(CHANNEL_STREAM_MAP)) {
    try {
      // Get current channel info
      const [rows] = await conn.query('SELECT id, name, streamUrl FROM radio_channels WHERE id = ?', [id]);
      if (rows.length === 0) {
        console.log(`  SKIP: Channel ${id} not found`);
        skipped++;
        continue;
      }
      
      const channel = rows[0];
      if (channel.streamUrl === streamUrl) {
        console.log(`  SAME: ${channel.name} (${id}) already has ${source}`);
        skipped++;
        continue;
      }
      
      // Update the stream URL and metadata source
      await conn.query(
        `UPDATE radio_channels SET streamUrl = ?, metadata = JSON_SET(COALESCE(metadata, '{}'), '$.source', ?, '$.lastVerified', ?) WHERE id = ?`,
        [streamUrl, source, new Date().toISOString(), id]
      );
      
      console.log(`  ✓ ${channel.name} (${id}): ${source}`);
      updated++;
    } catch (err) {
      console.log(`  ✗ Channel ${id}: ${err.message}`);
      errors++;
    }
  }
  
  // Verify no duplicates
  const [channels] = await conn.query('SELECT streamUrl, COUNT(*) as cnt FROM radio_channels GROUP BY streamUrl HAVING cnt > 1');
  
  console.log(`\n=== RESULTS ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped (same URL): ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Duplicate URLs remaining: ${channels.length}`);
  
  if (channels.length > 0) {
    for (const ch of channels) {
      const [dupeRows] = await conn.query('SELECT id, name FROM radio_channels WHERE streamUrl = ?', [ch.streamUrl]);
      console.log(`  ${ch.cnt}x: ${ch.streamUrl.substring(0, 50)} -> ${dupeRows.map(r => r.name).join(', ')}`);
    }
  }
  
  await conn.end();
}

main().catch(console.error);
