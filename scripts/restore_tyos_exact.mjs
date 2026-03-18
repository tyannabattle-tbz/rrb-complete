// Restore ALL DB channels to EXACT Ty OS registry stream URLs
// No substitutions, no replacements - use the registry as-is
import mysql from 'mysql2/promise';

const REGISTRY = [
  { numericId: 1, name: "RRB Main Radio", genre: "Soul, Funk, R&B", streamUrl: "https://ice1.somafm.com/groovesalad-128-mp3" },
  { numericId: 2, name: "Soul & R&B Classics", genre: "Soul, R&B, Classics", streamUrl: "https://listen.181fm.com/181-soul_128k.mp3" },
  { numericId: 3, name: "Jazz Lounge", genre: "Jazz, Smooth Jazz, Fusion", streamUrl: "https://ice1.somafm.com/secretagent-128-mp3" },
  { numericId: 4, name: "80s Hits", genre: "80s, Pop, Rock, New Wave", streamUrl: "https://listen.181fm.com/181-awesome80s_128k.mp3" },
  { numericId: 5, name: "Hip-Hop & Rap", genre: "Hip-Hop, Rap, Urban", streamUrl: "https://ice1.somafm.com/illstreet-128-mp3" },
  { numericId: 6, name: "Blues Highway", genre: "Blues, Delta Blues, Chicago Blues", streamUrl: "https://ice1.somafm.com/bootliquor-128-mp3" },
  { numericId: 7, name: "Classical Masterworks", genre: "Classical, Orchestral, Chamber", streamUrl: "https://stream.radioparadise.com/mellow-128" },
  { numericId: 8, name: "Latin Rhythms", genre: "Salsa, Bachata, Reggaeton", streamUrl: "https://listen.181fm.com/181-salsa_128k.mp3" },
  { numericId: 9, name: "Reggae Island", genre: "Reggae, Dancehall, Caribbean", streamUrl: "https://listen.181fm.com/181-reggae_128k.mp3" },
  { numericId: 10, name: "Neo-Soul Vibes", genre: "Neo-Soul, R&B, Alt Soul", streamUrl: "https://ice1.somafm.com/lush-128-mp3" },
  { numericId: 11, name: "Country Roads", genre: "Country, Americana, Folk", streamUrl: "https://listen.181fm.com/181-kickincountry_128k.mp3" },
  { numericId: 12, name: "Electronic Pulse", genre: "EDM, House, Techno", streamUrl: "https://ice1.somafm.com/deepspaceone-128-mp3" },
  { numericId: 13, name: "Funk Factory", genre: "Funk, Disco, Groove", streamUrl: "https://ice1.somafm.com/seventies-128-mp3" },
  { numericId: 14, name: "Afrobeats Global", genre: "Afrobeats, Amapiano, Afropop", streamUrl: "https://ice1.somafm.com/suburbsofgoa-128-mp3" },
  { numericId: 15, name: "Indie & Alternative", genre: "Indie, Alternative, Underground", streamUrl: "https://ice1.somafm.com/indiepop-128-mp3" },
  { numericId: 16, name: "Pop Hits", genre: "Pop, Top 40, Hits", streamUrl: "https://listen.181fm.com/181-beat_128k.mp3" },
  { numericId: 17, name: "Rock Legends", genre: "Rock, Classic Rock, Alternative", streamUrl: "https://ice1.somafm.com/metal-128-mp3" },
  { numericId: 18, name: "World Music", genre: "World, Fusion, Global", streamUrl: "https://ice1.somafm.com/suburbsofgoa-128-mp3" },
  { numericId: 19, name: "Smooth Grooves", genre: "Smooth R&B, Quiet Storm", streamUrl: "https://ice1.somafm.com/sonicuniverse-128-mp3" },
  { numericId: 20, name: "Oldies But Goodies", genre: "Oldies, 60s, 70s Classics", streamUrl: "https://ice1.somafm.com/seventies-128-mp3" },
  { numericId: 21, name: "Acoustic Sessions", genre: "Acoustic, Folk, Singer-Songwriter", streamUrl: "https://ice1.somafm.com/folkfwd-128-mp3" },
  { numericId: 22, name: "Chill & Lo-Fi", genre: "Lo-Fi, Chill, Downtempo", streamUrl: "https://ice1.somafm.com/covers-128-mp3" },
  { numericId: 23, name: "Sports Talk", genre: "Sports, Analysis, Commentary", streamUrl: "https://ice1.somafm.com/sf1033-128-mp3" },
  { numericId: 24, name: "News & Current Events", genre: "News, Commentary, Current Affairs", streamUrl: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service" },
  { numericId: 25, name: "Interview Hour", genre: "Interviews, Talk, Conversations", streamUrl: "https://ice1.somafm.com/fluid-128-mp3" },
  { numericId: 26, name: "Panel Discussions", genre: "Panel, Debate, Discussion", streamUrl: "https://ice1.somafm.com/defcon-128-mp3" },
  { numericId: 27, name: "Community Voices", genre: "Community, Talk, Call-In", streamUrl: "https://ice1.somafm.com/poptron-128-mp3" },
  { numericId: 28, name: "Tech & Innovation", genre: "Technology, Innovation, AI", streamUrl: "https://ice1.somafm.com/sf1033-128-mp3" },
  { numericId: 29, name: "HybridCast Emergency", genre: "Emergency, News, Public Safety", streamUrl: "https://ice1.somafm.com/scanner-128-mp3" },
  { numericId: 30, name: "Special Events", genre: "Live Events, Concerts", streamUrl: "https://ice1.somafm.com/live-128-mp3" },
  { numericId: 31, name: "Anime & Gaming", genre: "Anime, Gaming, J-Pop, Chiptune", streamUrl: "https://ice1.somafm.com/vaporwaves-128-mp3" },
  { numericId: 32, name: "90s R&B", genre: "90s, R&B, New Jack Swing", streamUrl: "https://listen.181fm.com/181-90srnb_128k.mp3" },
  { numericId: 33, name: "432Hz Healing", genre: "Healing, 432Hz, Ambient", streamUrl: "https://ice1.somafm.com/dronezone-128-mp3" },
  { numericId: 34, name: "528Hz Miracle Tone", genre: "528Hz, Healing, Meditation", streamUrl: "https://ice1.somafm.com/dronezone-128-mp3" },
  { numericId: 35, name: "639Hz Connection", genre: "639Hz, Harmony, Ambient", streamUrl: "https://ice1.somafm.com/deepspaceone-128-mp3" },
  { numericId: 36, name: "741Hz Expression", genre: "741Hz, Expression, Ambient", streamUrl: "https://ice1.somafm.com/darkzone-128-mp3" },
  { numericId: 37, name: "852Hz Intuition", genre: "852Hz, Intuition, Ambient", streamUrl: "https://ice1.somafm.com/thistle-128-mp3" },
  { numericId: 38, name: "2000s Hits", genre: "2000s, Pop, R&B, Hip-Hop", streamUrl: "https://ice1.somafm.com/poptron-128-mp3" },
  { numericId: 39, name: "Seraph AI Radio", genre: "AI-Curated, Experimental, Ambient", streamUrl: "https://ice1.somafm.com/dronezone-128-mp3" },
  { numericId: 40, name: "Candy AI Radio", genre: "AI-Curated, 80s, Vaporwave", streamUrl: "https://ice1.somafm.com/u80s-128-mp3" },
  { numericId: 41, name: "QUMUS Selections", genre: "AI-Curated, Eclectic, Discovery", streamUrl: "https://ice1.somafm.com/bagel-128-mp3" },
  { numericId: 42, name: "AI Mashup Lab", genre: "AI-Curated, Electronic, Mashup", streamUrl: "https://ice1.somafm.com/cliqhop-128-mp3" },
  { numericId: 43, name: "Education & Learning", genre: "Education, Learning, Ambient", streamUrl: "https://ice1.somafm.com/brfm-128-mp3" },
  { numericId: 44, name: "Classic Hip-Hop", genre: "Classic Hip-Hop, 90s Rap, Golden Era", streamUrl: "https://ice1.somafm.com/7soul-128-mp3" },
  { numericId: 45, name: "Science & Discovery", genre: "Science, Technology, Discovery", streamUrl: "https://ice1.somafm.com/vaporwaves-128-mp3" },
  { numericId: 46, name: "R&B Slow Jams", genre: "R&B, Slow Jams, Love Songs", streamUrl: "https://listen.181fm.com/181-rnb_128k.mp3" },
  { numericId: 47, name: "Audiobooks", genre: "Audiobooks, Stories, Narration", streamUrl: "https://ice1.somafm.com/illstreet-128-mp3" },
  { numericId: 48, name: "Comedy Hour", genre: "Comedy, Stand-Up, Humor", streamUrl: "https://ice1.somafm.com/beatblender-128-mp3" },
  { numericId: 49, name: "Drama & Stories", genre: "Drama, Radio Drama, Stories", streamUrl: "https://ice1.somafm.com/missioncontrol-128-mp3" },
  { numericId: 50, name: "90s Hip-Hop", genre: "90s Hip-Hop, East Coast, West Coast", streamUrl: "https://ice1.somafm.com/beatblender-128-mp3" },
  { numericId: 51, name: "C.J. Battle Radio", genre: "Hip-Hop, R&B, Live Battles", streamUrl: "https://ice1.somafm.com/digitalis-128-mp3" },
];

// Special channels (900018-900020) mapped to ch-052, ch-053, ch-054
const SPECIAL = [
  { dbId: 900018, name: "SQUADD Coalition Radio", genre: "Empowerment, Talk, Coalition", streamUrl: "https://ice1.somafm.com/doomed-128-mp3" },
  { dbId: 900019, name: "UN Advocacy Radio", genre: "Advocacy, International, News", streamUrl: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service" },
  { dbId: 900020, name: "Canryn Production Radio", genre: "Corporate, Production, Updates", streamUrl: "https://ice1.somafm.com/synphaera-128-mp3" },
];

async function main() {
  const c = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log("=== RESTORING ALL CHANNELS TO EXACT TY OS REGISTRY URLs ===\n");
  
  let updated = 0;
  let skipped = 0;
  
  // Update channels 1-51
  for (const ch of REGISTRY) {
    const [result] = await c.query(
      'UPDATE radio_channels SET name = ?, genre = ?, streamUrl = ? WHERE id = ?',
      [ch.name, ch.genre, ch.streamUrl, ch.numericId]
    );
    if (result.affectedRows > 0) {
      console.log(`✅ #${ch.numericId} ${ch.name} -> ${ch.streamUrl}`);
      updated++;
    } else {
      console.log(`⚠️  #${ch.numericId} ${ch.name} - NOT FOUND IN DB`);
      skipped++;
    }
  }
  
  // Update special channels
  for (const ch of SPECIAL) {
    const [result] = await c.query(
      'UPDATE radio_channels SET name = ?, genre = ?, streamUrl = ? WHERE id = ?',
      [ch.name, ch.genre, ch.streamUrl, ch.dbId]
    );
    if (result.affectedRows > 0) {
      console.log(`✅ #${ch.dbId} ${ch.name} -> ${ch.streamUrl}`);
      updated++;
    } else {
      console.log(`⚠️  #${ch.dbId} ${ch.name} - NOT FOUND IN DB`);
      skipped++;
    }
  }
  
  // Also update streaming_status table
  await c.query("UPDATE streaming_status SET status = 'live' WHERE status != 'live'");
  
  console.log(`\n=== DONE: ${updated} updated, ${skipped} skipped ===`);
  
  // Verify
  const [rows] = await c.query('SELECT id, name, streamUrl FROM radio_channels ORDER BY id');
  console.log(`\n=== VERIFICATION: ${rows.length} channels in DB ===`);
  rows.forEach(r => console.log(`#${r.id} | ${r.name} | ${r.streamUrl.substring(0, 60)}...`));
  
  await c.end();
}

main().catch(console.error);
