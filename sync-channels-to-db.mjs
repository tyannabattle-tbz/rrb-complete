// Sync the hardcoded RRBRadioIntegration channels to the database
// This makes the database the single source of truth with the diverse stream URLs
import mysql from 'mysql2/promise';
import { config } from 'dotenv';
config();

// These are the authoritative channel definitions from RRBRadioIntegration.tsx
const channels = [
  { id: 1, name: 'RRB Main Radio', genre: 'Soul, Funk, R&B', frequency: '432 Hz', streamUrl: 'https://funkyradio.streamingmedia.it/play.mp3', description: 'Soul, funk, R&B, and legacy music — the heartbeat of Canryn Production.', category: 'Music', icon: '📻' },
  { id: 5, name: 'Music Discovery', genre: 'Indie, Emerging', frequency: '432 Hz', streamUrl: 'https://premium.shoutcastsolutions.com/radio/8050/256.mp3', description: 'New artists and deep cuts from emerging talent.', category: 'Music', icon: '🔍' },
  { id: 9, name: 'Gospel & Praise', genre: 'Gospel, Worship', frequency: '432 Hz', streamUrl: 'https://s3.radio.co/s97f38db97/listen', description: 'Gospel music, worship, and praise.', category: 'Music', icon: '🙏' },
  { id: 10, name: 'Smooth Jazz Lounge', genre: 'Jazz, Bebop, Fusion', frequency: '432 Hz', streamUrl: 'http://ice-the.musicradio.com/ClassicFMMP3', description: 'Smooth jazz, bebop, and fusion.', category: 'Music', icon: '🎷' },
  { id: 11, name: 'Hip-Hop Classics', genre: 'Hip-Hop, Rap, Conscious', frequency: '440 Hz', streamUrl: 'https://streams.fluxfm.de/hiphop/mp3-320/audio/', description: 'Golden era hip-hop and conscious rap.', category: 'Music', icon: '🎤' },
  { id: 12, name: 'Neo-Soul', genre: 'Neo-Soul, Alt R&B', frequency: '432 Hz', streamUrl: 'https://listen.181fm.com/181-soul_128k.mp3', description: 'Contemporary soul and neo-soul artists.', category: 'Music', icon: '🛋️' },
  { id: 13, name: 'Reggae & Dancehall', genre: 'Reggae, Dancehall, Ska', frequency: '432 Hz', streamUrl: 'https://stream.zeno.fm/0r0xa792kwzuv', description: 'Roots reggae, dancehall, and island vibes.', category: 'Music', icon: '🦁' },
  { id: 14, name: 'Afrobeats Global', genre: 'Afrobeats, Amapiano', frequency: '432 Hz', streamUrl: 'https://radio.gotright.net/radio/8000/radio.mp3', description: 'Afrobeats, Amapiano, and African pop.', category: 'Music', icon: '🥁' },
  { id: 15, name: 'Blues Highway', genre: 'Blues, Delta, Chicago', frequency: '432 Hz', streamUrl: 'http://jazzblues.ice.infomaniak.ch/jazzblues-high.mp3', description: 'Delta blues, Chicago blues, and modern blues.', category: 'Music', icon: '🎸' },
  { id: 16, name: 'Classical Serenity', genre: 'Classical, Orchestral', frequency: '432 Hz', streamUrl: 'http://ice-the.musicradio.com/ClassicFMMP3', description: 'Classical orchestral and chamber music.', category: 'Music', icon: '🎻' },
  { id: 17, name: 'Latin Rhythms', genre: 'Salsa, Bachata, Reggaeton', frequency: '432 Hz', streamUrl: 'http://streaming5.elitecomunicacion.es:8082/live.mp3', description: 'Salsa, bachata, reggaeton, and Latin jazz.', category: 'Music', icon: '💃' },
  { id: 18, name: 'Country Crossroads', genre: 'Country, Americana, Folk', frequency: '432 Hz', streamUrl: 'http://26343.live.streamtheworld.com/977_COUNTRY_SC', description: 'Country, Americana, and folk roots.', category: 'Music', icon: '🤠' },
  { id: 19, name: 'Electronic Pulse', genre: 'EDM, House, Techno', frequency: '440 Hz', streamUrl: 'http://novazz.ice.infomaniak.ch/novazz-128.mp3', description: 'EDM, house, techno, and ambient.', category: 'Music', icon: '⚡' },
  { id: 20, name: 'Rock Legends', genre: 'Rock, Alternative, Indie', frequency: '440 Hz', streamUrl: 'https://cast1.torontocast.com:4610/stream', description: 'Classic rock, alternative, and indie rock.', category: 'Music', icon: '🎸' },
  { id: 32, name: 'Worship & Devotional', genre: 'Worship, Devotional', frequency: '432 Hz', streamUrl: 'https://listen.christianrock.net/stream/13/', description: 'Multi-faith worship music and devotionals.', category: 'Music', icon: '⛪' },
  { id: 33, name: 'Caribbean Vibes', genre: 'Soca, Calypso, Zouk', frequency: '432 Hz', streamUrl: 'https://stream.zeno.fm/0r0xa792kwzuv', description: 'Soca, calypso, zouk, and island music.', category: 'Music', icon: '🏝️' },
  { id: 34, name: 'Women in Music', genre: 'Women Artists, All Genres', frequency: '432 Hz', streamUrl: 'https://fm939.wnyc.org/wnycfm', description: 'Celebrating women artists across all genres.', category: 'Music', icon: '👩‍🎤' },
  { id: 35, name: 'Indie & Underground', genre: 'Indie, Underground', frequency: '440 Hz', streamUrl: 'https://wdr-wdr5-live.icecastssl.wdr.de/wdr/wdr5/live/mp3/128/stream.mp3', description: 'Independent artists and underground scenes.', category: 'Music', icon: '🎵' },
  { id: 36, name: 'World Fusion', genre: 'World Music, Fusion', frequency: '432 Hz', streamUrl: 'https://tv.radiohosting.online:9484/stream', description: 'Global music fusion and cross-cultural sounds.', category: 'Music', icon: '🌐' },
  { id: 37, name: 'Throwback Radio', genre: '70s, 80s, 90s, 2000s', frequency: '440 Hz', streamUrl: 'https://icecast.walmradio.com:8443/classic', description: '70s, 80s, 90s, and 2000s hits.', category: 'Music', icon: '📼' },
  { id: 38, name: 'Love Songs', genre: 'Love Songs, Ballads', frequency: '432 Hz', streamUrl: 'https://maggie.torontocast.com:2020/stream/rdmixlovesongs', description: 'Romantic ballads and love songs across eras.', category: 'Music', icon: '💕' },
  { id: 51, name: 'C.J. Battle Radio', genre: 'Hip-Hop, Alternative', frequency: '432 Hz', streamUrl: 'https://streams.fluxfm.de/hiphop/mp3-320/audio/', description: 'C.J. Battle — OLD SOUL, Searching, TRIGONOMETRY and more.', category: 'Music', icon: '🎤' },
  { id: 2, name: 'Podcast Network', genre: 'Podcast, Interviews', frequency: '432 Hz', streamUrl: 'https://premium.shoutcastsolutions.com/radio/8050/256.mp3', description: 'Original podcasts and interviews — In Battle Tyme and more.', category: 'Talk', icon: '🎙️' },
  { id: 8, name: 'Sports Talk', genre: 'Sports, Analysis', frequency: '440 Hz', streamUrl: 'http://playerservices.streamtheworld.com/api/livestream-redirect/CADENASER.mp3', description: 'Live scores, analysis, and game day coverage.', category: 'Talk', icon: '🏈' },
  { id: 24, name: 'News & Current Affairs', genre: 'News, Commentary', frequency: '440 Hz', streamUrl: 'https://tunein.cdnstream1.com/2868_96.mp3', description: 'Breaking news, analysis, and commentary.', category: 'Talk', icon: '📰' },
  { id: 41, name: 'Seraph AI Radio', genre: 'AI-Curated, Eclectic', frequency: '432 Hz', streamUrl: 'http://s1.voscast.com:8652/stream', description: 'AI-curated music by Seraph intelligence.', category: 'AI-Curated', icon: '🤖' },
  { id: 42, name: 'Candy AI Radio', genre: 'AI-Curated, Legacy, Soul', frequency: '432 Hz', streamUrl: 'https://stream.nightride.fm/nightride.mp3', description: 'AI-curated playlists by Candy guardian.', category: 'AI-Curated', icon: '🍬' },
  { id: 43, name: 'Valanna AI Radio', genre: 'AI-Curated, Orchestrated', frequency: '432 Hz', streamUrl: 'https://pub0201.101.ru/stream/trust/mp3/128/24?', description: 'QUMUS brain-curated intelligent programming.', category: 'AI-Curated', icon: '🧠' },
  { id: 7, name: 'Drop Radio 432Hz', genre: 'Healing, Solfeggio', frequency: '432 Hz', streamUrl: 'http://radio.stereoscenic.com/asp-h', description: 'Solfeggio healing frequencies — Crystal Essentials.', category: 'Wellness', icon: '🧘' },
  { id: 23, name: 'Meditation & Mindfulness', genre: 'Meditation, Guided', frequency: '432 Hz', streamUrl: 'https://stream.zeno.fm/aaini0b7c4duv', description: 'Guided meditation and mindfulness sessions.', category: 'Wellness', icon: '🕉️' },
  { id: 27, name: 'Health & Wellness', genre: 'Health, Fitness, Nutrition', frequency: '432 Hz', streamUrl: 'https://stream.nightride.fm/nightride.mp3', description: 'Holistic health, fitness, and nutrition.', category: 'Wellness', icon: '💚' },
  { id: 39, name: 'Workout & Energy', genre: 'Workout, Energy, Motivation', frequency: '440 Hz', streamUrl: 'https://workout-high.rautemusik.fm/?ref=radiobrowser', description: 'High-energy music for fitness and motivation.', category: 'Wellness', icon: '💪' },
  { id: 40, name: 'Sleep & Relaxation', genre: 'Sleep, Ambient, ASMR', frequency: '432 Hz', streamUrl: 'http://radio.stereoscenic.com/asp-h', description: 'Ambient sounds, sleep music, and ASMR.', category: 'Wellness', icon: '🌙' },
  { id: 25, name: 'Business & Finance', genre: 'Business, Entrepreneurship', frequency: '440 Hz', streamUrl: 'https://fm939.wnyc.org/wnycfm', description: 'Markets, entrepreneurship, and wealth building.', category: 'Education', icon: '💼' },
  { id: 26, name: 'Science & Technology', genre: 'Science, Technology, AI', frequency: '440 Hz', streamUrl: 'http://radio.stereoscenic.com/asp-h', description: 'Tech trends, science discoveries, and innovation.', category: 'Education', icon: '🔬' },
  { id: 28, name: 'Education & Learning', genre: 'Education, Skills', frequency: '440 Hz', streamUrl: 'https://pub0201.101.ru/stream/trust/mp3/128/24?', description: 'Educational content and skill building.', category: 'Education', icon: '📚' },
  { id: 3, name: 'Audiobook Stream', genre: 'Audiobooks, Stories', frequency: '432 Hz', streamUrl: 'http://bookradio.hostingradio.ru:8069/fm', description: 'Narrated books and stories.', category: 'Entertainment', icon: '📖' },
  { id: 21, name: 'Kids & Family', genre: 'Kids, Family, Educational', frequency: '432 Hz', streamUrl: 'http://stream01.zogl.net:8906/stream', description: 'Family-friendly music and storytelling.', category: 'Entertainment', icon: '👨‍👩‍👧‍👦' },
  { id: 22, name: 'Spoken Word & Poetry', genre: 'Spoken Word, Poetry', frequency: '432 Hz', streamUrl: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service', description: 'Poetry slams, spoken word, and literary arts.', category: 'Entertainment', icon: '📝' },
  { id: 29, name: 'Comedy Central', genre: 'Comedy, Stand-Up, Humor', frequency: '440 Hz', streamUrl: 'https://icecast.walmradio.com:8443/otr', description: 'Stand-up comedy, sketches, and humor.', category: 'Entertainment', icon: '😂' },
  { id: 30, name: 'Drama & Theater', genre: 'Drama, Radio Drama', frequency: '432 Hz', streamUrl: 'https://icecast.walmradio.com:8443/otr', description: 'Radio dramas, audio theater, and storytelling.', category: 'Entertainment', icon: '🎭' },
  { id: 31, name: 'Anime & Gaming', genre: 'Anime, Gaming, J-Pop', frequency: '440 Hz', streamUrl: 'https://stream.zeno.fm/qpn8mkt8c4duv', description: 'Anime OSTs, gaming soundtracks, and J-pop.', category: 'Entertainment', icon: '🎮' },
  { id: 48, name: 'Gaming Battle Arena', genre: 'Esports, Gaming, Tournaments', frequency: '440 Hz', streamUrl: 'https://listen.reyfm.de/gaming_192kbps.mp3', description: 'Gaming tournaments, esports, and battle commentary.', category: 'Entertainment', icon: '🕹️' },
  { id: 4, name: 'HybridCast Emergency', genre: 'Emergency, Public Safety', frequency: '440 Hz', streamUrl: 'http://jking.cdnstream1.com/b22139_128mp3', description: '24/7 standby — emergency alerts and public safety.', category: 'Specialty', icon: '🚨' },
  { id: 44, name: 'Ty Battle Live', genre: 'Live, Events, Broadcast', frequency: '432 Hz', streamUrl: 'https://broadcastify.cdnstream1.com/8705', description: 'Live broadcasts and special events from Ty Battle.', category: 'Specialty', icon: '🎙️' },
  { id: 46, name: 'Canryn Production', genre: 'Production, Studio', frequency: '432 Hz', streamUrl: 'https://listen.181fm.com/181-soul_128k.mp3', description: 'Behind-the-scenes production and studio sessions.', category: 'Specialty', icon: '🎬' },
  { id: 47, name: 'Dragon Frequencies', genre: 'Frequencies, Elemental', frequency: '432 Hz', streamUrl: 'https://stream.drugradio.ru:8020/stream128', description: "Wisdom's Dragon elemental frequency broadcasts.", category: 'Specialty', icon: '🐉' },
  { id: 49, name: 'Legacy Archives', genre: 'Archives, History', frequency: '432 Hz', streamUrl: 'https://tunein.cdnstream1.com/2868_96.mp3', description: 'Historical recordings, interviews, and family archives.', category: 'Specialty', icon: '🏛️' },
  { id: 6, name: 'Community Voice', genre: 'Community, Call-In', frequency: '432 Hz', streamUrl: 'https://tunein.cdnstream1.com/2868_96.mp3', description: 'Listener stories and call-ins.', category: 'Community', icon: '📞' },
  { id: 45, name: 'Sweet Miracles', genre: 'Nonprofit, Charity', frequency: '528 Hz', streamUrl: 'https://streams.fluxfm.de/hiphop/mp3-320/audio/', description: 'Nonprofit awareness, fundraising, and community impact (501c/508).', category: 'Community', icon: '🍬' },
  { id: 50, name: 'Open Mic', genre: 'Open Mic, Freestyle', frequency: '432 Hz', streamUrl: 'https://s3.radio.co/s97f38db97/listen', description: 'Community open mic, freestyle, and live performances.', category: 'Community', icon: '🎤' },
  // Special channels (900000+ IDs in DB)
  { id: 900018, name: 'SQUADD Coalition Radio', genre: 'Empowerment, Talk', frequency: '432 Hz', streamUrl: 'https://listen.181fm.com/181-kickin_128k.mp3', description: 'SQUADD Coalition programming — Sisters Questing Unapologetically After Divine Destiny.', category: 'Community', icon: '👑' },
  { id: 900019, name: 'UN Advocacy Radio', genre: 'Advocacy, International', frequency: '528 Hz', streamUrl: 'https://listen.181fm.com/181-highway_128k.mp3', description: 'United Nations advocacy, CSW70 coverage, and international human rights programming.', category: 'Community', icon: '🌍' },
  { id: 900020, name: 'Canryn Production Radio', genre: 'Corporate, Updates', frequency: '432 Hz', streamUrl: 'https://listen.181fm.com/181-awesome80s_128k.mp3', description: 'Official Canryn Production updates, ecosystem news, and subsidiary highlights.', category: 'Specialty', icon: '🏢' },
];

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('=== Syncing Hardcoded Channels to Database ===\n');
  
  let updated = 0;
  let inserted = 0;
  let skipped = 0;
  
  for (const ch of channels) {
    // Check if channel exists
    const [existing] = await conn.execute('SELECT id, streamUrl, name FROM radio_channels WHERE id = ?', [ch.id]);
    
    if (existing.length > 0) {
      // Update the stream URL, description, genre, frequency, and metadata
      const metadata = JSON.stringify({
        bitrate: 128,
        codec: 'MP3',
        source: ch.streamUrl.includes('181fm') ? '181.fm' : new URL(ch.streamUrl).hostname,
        category: ch.category,
        icon: ch.icon,
        description: ch.description,
        djAssigned: ch.id === 41 ? 'seraph' : ch.id === 42 ? 'candy' : ch.id === 43 ? 'valanna' : 'rotation',
        peakHours: '08:00-22:00',
        targetAudience: ch.genre + ' fans',
      });
      
      await conn.execute(
        'UPDATE radio_channels SET streamUrl = ?, name = ?, genre = ?, frequency = ?, metadata = ? WHERE id = ?',
        [ch.streamUrl, ch.name, ch.genre, ch.frequency, metadata, ch.id]
      );
      updated++;
      console.log(`  Updated: ${ch.name} (ID ${ch.id}) → ${ch.streamUrl.substring(0, 60)}...`);
    } else {
      // Insert new channel
      const metadata = JSON.stringify({
        bitrate: 128,
        codec: 'MP3',
        source: ch.streamUrl.includes('181fm') ? '181.fm' : new URL(ch.streamUrl).hostname,
        category: ch.category,
        icon: ch.icon,
        description: ch.description,
        djAssigned: 'rotation',
        peakHours: '08:00-22:00',
        targetAudience: ch.genre + ' fans',
      });
      
      await conn.execute(
        'INSERT INTO radio_channels (id, name, genre, frequency, streamUrl, status, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [ch.id, ch.name, ch.genre, ch.frequency, ch.streamUrl, 'active', metadata]
      );
      inserted++;
      console.log(`  Inserted: ${ch.name} (ID ${ch.id})`);
    }
  }
  
  // Verify
  const [total] = await conn.execute('SELECT COUNT(*) as cnt, COUNT(DISTINCT streamUrl) as unique_urls FROM radio_channels');
  console.log(`\n✅ Done: ${updated} updated, ${inserted} inserted, ${skipped} skipped`);
  console.log(`   Total: ${total[0].cnt} channels, ${total[0].unique_urls} unique URLs`);
  
  await conn.end();
}

main().catch(console.error);
