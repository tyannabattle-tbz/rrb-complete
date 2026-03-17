/**
 * Insert SQUADD Goals Presentation campaign posts across all social media platforms
 * These will be picked up by the QUMUS Social Media Auto-Publisher
 */
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
const now = Date.now();
const videoUrl = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/SQUADD_Goals_Presentation_b7c820da.mp4';
const websiteUrl = 'https://manusweb-eshiamkd.manus.space';

const posts = [
  // Twitter/X - Thread of posts
  {
    platform: 'twitter',
    postType: 'video',
    content: `🌍 SQUADD Goals — UN CSW70 Campaign LIVE

Sisters Questing Unapologetically After Divine Destiny

In partnership with Ghana 🇬🇭 at the United Nations Commission on the Status of Women #CSW70

Watch the full presentation: ${websiteUrl}/csw70

#CSW70 #ForALLWomenAndGirls #AccessToJustice #RockinRockinBoogie #SweetMiracles #SQUADD #CanrynProduction`,
    mediaUrl: videoUrl,
    hashtags: '#CSW70 #ForALLWomenAndGirls #AccessToJustice #RockinRockinBoogie #SweetMiracles #SQUADD',
    scheduledAt: now, // Post immediately
    campaign: 'csw70-squadd-launch',
  },
  {
    platform: 'twitter',
    postType: 'text',
    content: `Three generations. One mission. One voice.

Sweet Miracles & Rockin' Rockin' Boogie present SQUADD Goals at the United Nations CSW70.

"A Voice for the Voiceless" — Building the bridge across the world.

🔗 ${websiteUrl}/squadd

#CSW70 #SQUADD #SweetMiracles #UnitedNations`,
    mediaUrl: null,
    hashtags: '#CSW70 #SQUADD #SweetMiracles #UnitedNations',
    scheduledAt: now + (15 * 60 * 1000), // 15 min after first
    campaign: 'csw70-squadd-launch',
  },
  // Facebook
  {
    platform: 'facebook',
    postType: 'video',
    content: `🌍 SQUADD Goals — UN CSW70 Campaign is LIVE!

Sisters Questing Unapologetically After Divine Destiny — In partnership with Ghana at the United Nations Commission on the Status of Women (CSW70), March 2026, New York.

Three generations. One mission. Sweet Miracles & Rockin' Rockin' Boogie present the SQUADD Coalition — a voice for the voiceless, building the bridge across the world.

Watch the full SQUADD Goals Presentation and join the movement:
🔗 ${websiteUrl}/csw70

Powered by QUMUS Autonomous Orchestration Engine
A Canryn Production and its subsidiaries

#CSW70 #ForALLWomenAndGirls #AccessToJustice #RockinRockinBoogie #SweetMiracles #SQUADD #CanrynProduction #UnitedNations #GenderEquality`,
    mediaUrl: videoUrl,
    hashtags: '#CSW70 #ForALLWomenAndGirls #AccessToJustice #RockinRockinBoogie #SweetMiracles',
    scheduledAt: now,
    campaign: 'csw70-squadd-launch',
  },
  // YouTube
  {
    platform: 'youtube',
    postType: 'video',
    content: `SQUADD Goals — UN CSW70 Campaign | Sweet Miracles & Rockin' Rockin' Boogie

Sisters Questing Unapologetically After Divine Destiny — In partnership with Ghana at the United Nations Commission on the Status of Women (CSW70), March 2026.

Three generations of legacy. One unified mission. The SQUADD Coalition brings together Sweet Miracles, Rockin' Rockin' Boogie, QUMUS, HybridCast, and the entire Canryn Production ecosystem to advocate for women and girls worldwide.

"A Voice for the Voiceless" — Building the bridge across the world.

🔗 Campaign Page: ${websiteUrl}/csw70
🔗 SQUADD Goals: ${websiteUrl}/squadd
🔗 Donate: ${websiteUrl}/donate

A Canryn Production

#CSW70 #ForALLWomenAndGirls #AccessToJustice #SQUADD #SweetMiracles #RockinRockinBoogie #UnitedNations #GenderEquality #CanrynProduction`,
    mediaUrl: videoUrl,
    hashtags: '#CSW70 #ForALLWomenAndGirls #AccessToJustice #SQUADD #SweetMiracles',
    scheduledAt: now,
    campaign: 'csw70-squadd-launch',
  },
  // Instagram
  {
    platform: 'instagram',
    postType: 'video',
    content: `🌍 SQUADD Goals — UN CSW70 Campaign LIVE

Sisters Questing Unapologetically After Divine Destiny

In partnership with Ghana 🇬🇭 at the United Nations Commission on the Status of Women

Three generations. One mission. One voice.

Sweet Miracles & Rockin' Rockin' Boogie present the SQUADD Coalition — building the bridge across the world.

Link in bio for the full campaign 🔗

A Canryn Production

#CSW70 #ForALLWomenAndGirls #AccessToJustice #RockinRockinBoogie #SweetMiracles #SQUADD #CanrynProduction #UnitedNations #GenderEquality #WomenEmpowerment #GhanaToUN #LegacyRestored #AVoiceForTheVoiceless`,
    mediaUrl: videoUrl,
    hashtags: '#CSW70 #ForALLWomenAndGirls #AccessToJustice #RockinRockinBoogie #SweetMiracles #SQUADD #WomenEmpowerment',
    scheduledAt: now,
    campaign: 'csw70-squadd-launch',
  },
  // Discord
  {
    platform: 'discord',
    postType: 'video',
    content: `🌍 **SQUADD Goals — UN CSW70 Campaign is LIVE!**

**Sisters Questing Unapologetically After Divine Destiny**

In partnership with Ghana 🇬🇭 at the United Nations Commission on the Status of Women (CSW70)

Three generations. One mission. Sweet Miracles & Rockin' Rockin' Boogie present the SQUADD Coalition.

🎬 **Watch the SQUADD Goals Presentation:** ${websiteUrl}/csw70
🎯 **SQUADD Goals:** ${websiteUrl}/squadd
💝 **Support the Mission:** ${websiteUrl}/donate

*"A Voice for the Voiceless" — Building the bridge across the world.*

A Canryn Production | Powered by QUMUS`,
    mediaUrl: videoUrl,
    hashtags: '#CSW70 #SQUADD #SweetMiracles',
    scheduledAt: now,
    campaign: 'csw70-squadd-launch',
  },
  // TikTok
  {
    platform: 'tiktok',
    postType: 'video',
    content: `SQUADD Goals at the UN CSW70 🌍🇬🇭

Sisters Questing Unapologetically After Divine Destiny

Three generations. One mission. Building the bridge across the world.

#CSW70 #ForALLWomenAndGirls #SQUADD #SweetMiracles #RockinRockinBoogie #UnitedNations #GenderEquality #WomenEmpowerment #AVoiceForTheVoiceless`,
    mediaUrl: videoUrl,
    hashtags: '#CSW70 #ForALLWomenAndGirls #SQUADD #SweetMiracles #RockinRockinBoogie',
    scheduledAt: now,
    campaign: 'csw70-squadd-launch',
  },
  // LinkedIn
  // Note: LinkedIn is not in the enum, so we'll use facebook as proxy and note it
];

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);
  
  let inserted = 0;
  for (const post of posts) {
    try {
      await conn.execute(
        `INSERT INTO social_media_posts (platform, post_type, content, media_url, hashtags, scheduled_at, status, campaign, qumus_managed, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'scheduled', ?, 1, ?, ?)`,
        [
          post.platform,
          post.postType,
          post.content,
          post.mediaUrl,
          post.hashtags,
          post.scheduledAt,
          post.campaign,
          now,
          now,
        ]
      );
      inserted++;
      console.log(`✅ ${post.platform} post inserted (${post.postType})`);
    } catch (err) {
      console.error(`❌ ${post.platform} insert failed:`, err.message);
    }
  }
  
  console.log(`\n📊 Total: ${inserted}/${posts.length} campaign posts inserted`);
  console.log('🤖 QUMUS Social Media Auto-Publisher will process these within 5 minutes');
  
  // Show current post counts
  const [rows] = await conn.execute(
    `SELECT platform, status, COUNT(*) as cnt FROM social_media_posts WHERE campaign = 'csw70-squadd-launch' GROUP BY platform, status`
  );
  console.log('\n📋 Campaign posts by platform:');
  for (const row of rows) {
    console.log(`  ${row.platform}: ${row.cnt} (${row.status})`);
  }
  
  await conn.end();
}

main().catch(console.error);
