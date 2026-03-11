import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Share2, Download, Copy, Calendar, Twitter, Instagram, MessageCircle, Globe, Radio, Megaphone, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const CAMPAIGN_GRAPHICS = [
  {
    id: 'main',
    title: 'From Selma to the United Nations',
    description: 'Main campaign announcement — Instagram Post / Twitter',
    imageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/un-campaign-main-3rYB8GTBED4bxDRpqpcBda.webp',
    downloadUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/un-campaign-main-XYy8uhMGcLKvny8iuFTkwk.png',
    format: '1:1 Square',
    platforms: ['Instagram Post', 'Twitter', 'Facebook', 'LinkedIn'],
  },
  {
    id: 'story',
    title: 'Live From the UN',
    description: 'Story/Reel format — vertical for mobile-first',
    imageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/un-campaign-story1-RA8ePTFPpJAE2bJao5tzYA.webp',
    downloadUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/un-campaign-story1-nksT36BWnVjqXbpkkHwQCY.png',
    format: '9:16 Vertical',
    platforms: ['Instagram Story', 'Instagram Reel', 'TikTok'],
  },
  {
    id: 'squadd',
    title: 'SQUADD Goals',
    description: 'Campaign pillars — Sustainable Development, Quality Education, Unity, Accountability, Diversity, Diplomacy',
    imageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/un-campaign-squadd-PUTLE8YrsDLxCDKCMFTQ6s.webp',
    downloadUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/un-campaign-squadd-STbtbpjpJahrxDmFoqdKf5.png',
    format: '3:2 Landscape',
    platforms: ['Twitter', 'Facebook', 'LinkedIn', 'Website Banner'],
  },
  {
    id: 'ghana',
    title: 'Ghana Partnership',
    description: 'Connecting Cultures, Building Futures — Ghana collaboration spotlight',
    imageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/un-campaign-ghana-mPP6h9acnhjmjug9FkkV4E.webp',
    downloadUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/un-campaign-ghana-PKp9XHSg7DfDMRanCpdRWs.png',
    format: '1:1 Square',
    platforms: ['Instagram Post', 'Twitter', 'Facebook'],
  },
  {
    id: 'radio',
    title: '51 Channels Live',
    description: '24/7 radio coverage across all genres — tune in now',
    imageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/un-campaign-radio-FBCNHEraACLvoGpVKqqPGV.webp',
    downloadUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/un-campaign-radio-J5yHit4Pdjm9VZeJVs5ZPi.png',
    format: '3:2 Landscape',
    platforms: ['Twitter', 'Facebook', 'Discord', 'Website'],
  },
];

const SOCIAL_COPY = {
  twitter: [
    {
      id: 'tw1',
      title: 'Launch Announcement',
      text: `From Selma to the United Nations. March 17, 2026.

Sweet Miracles and Rockin' Rockin' Boogie — Building the Bridge Across the World.

SQUADD Goals at UN CSW70. 51 channels. 24/7 live coverage. History in the making.

Tune in: [LINK]

#SelmaToTheUN #SQUADDGoals #CSW70 #RRBRadio`,
      timing: 'March 10 — 1 week before launch',
    },
    {
      id: 'tw2',
      title: 'Ghana Partnership',
      text: `Connecting cultures. Building futures.

Our Ghana partnership brings African heritage and American legacy together at the United Nations.

From the Gold Coast to the Big Apple — this is what SQUADD Goals looks like.

#GhanaPartnership #SQUADDGoals #CSW70 #RRBRadio`,
      timing: 'March 12 — 5 days before',
    },
    {
      id: 'tw3',
      title: 'Countdown — 3 Days',
      text: `3 DAYS until we make history.

From Selma, Alabama to the United Nations in New York City.

50 radio channels going LIVE for the UN CSW70 campaign launch.

Your AI DJs Valanna, Seraph & Candy are ready. Are you?

#3DaysOut #SelmaToTheUN #RRBRadio`,
      timing: 'March 14 — 3 days before',
    },
    {
      id: 'tw4',
      title: 'Launch Day',
      text: `IT'S HERE.

From Selma to the United Nations — LIVE NOW.

Sweet Miracles and Rockin' Rockin' Boogie — Building the Bridge Across the World.

51 channels broadcasting from UN CSW70.

Gospel. Jazz. Hip-Hop. Soul. Healing Frequencies. All live. All day.

Tune in NOW: [LINK]

#SelmaToTheUN #SQUADDGoals #LIVE #CSW70`,
      timing: 'March 17 — LAUNCH DAY',
    },
    {
      id: 'tw5',
      title: 'Sweet Miracles CTA',
      text: `Every voice matters. Every donation counts.

Sweet Miracles Foundation is fighting for elder protection, education, and community empowerment.

Support the mission that's taking us from Selma to the United Nations.

Donate: [LINK]

#SweetMiracles #SQUADDGoals #CSW70`,
      timing: 'March 17 — Launch Day afternoon',
    },
  ],
  instagram: [
    {
      id: 'ig1',
      title: 'Main Announcement Post',
      text: `FROM SELMA TO THE UNITED NATIONS 🌍

March 17, 2026 marks a historic moment. Sweet Miracles and Rockin' Rockin' Boogie — Building the Bridge Across the World. SQUADD Goals at UN CSW70 in New York City.

What are SQUADD Goals?
S — Sustainable Development
Q — Quality Education
U — Unity
A — Accountability
D — Diversity
D — Diplomacy

50 radio channels broadcasting LIVE. AI DJs Valanna, Seraph & Candy hosting around the clock.

This is what happens when Selma's legacy meets global diplomacy.

Link in bio to tune in.

#SelmaToTheUN #SQUADDGoals #CSW70 #RockinRockinBoogie #UnitedNations #GhanaPartnership #BlackExcellence #WomenLed #RadioRevolution`,
      timing: 'March 10 — 1 week before',
      graphic: 'main',
    },
    {
      id: 'ig2',
      title: 'Story Countdown Series',
      text: `[STORY 1] 7 DAYS — The countdown begins
[STORY 2] 5 DAYS — Ghana partnership spotlight  
[STORY 3] 3 DAYS — Meet your AI DJs
[STORY 4] 1 DAY — Final preparations
[STORY 5] LIVE NOW — Tune in!

Use countdown sticker. Add "Tune In" link sticker on each.`,
      timing: 'March 10-17 — Daily stories',
      graphic: 'story',
    },
    {
      id: 'ig3',
      title: 'Radio Coverage Post',
      text: `50 CHANNELS. 24/7. LIVE.

Gospel Hour | Jazz Lounge | Soul Kitchen | Hip-Hop Classics | Healing Frequencies | Funk Factory | Rock & Roll | Blues Highway | Classical | Reggae | Country | Latin | Ambient

Every genre. Every mood. Every moment covered.

Rockin' Rockin' Boogie Radio Network — broadcasting the UN CSW70 campaign launch across the globe.

Your DJs: Valanna (6AM-2PM) | Seraph (2PM-6PM) | Candy (6PM-12AM)

#50ChannelsLive #RRBRadio #CSW70 #AIRadio #LiveBroadcast`,
      timing: 'March 15 — 2 days before',
      graphic: 'radio',
    },
  ],
  discord: [
    {
      id: 'dc1',
      title: 'Server Announcement',
      text: `@everyone

**FROM SELMA TO THE UNITED NATIONS — MARCH 17, 2026**

Rockin' Rockin' Boogie is launching our SQUADD Goals campaign at UN CSW70 in New York City.

**What's happening:**
- 50 radio channels going LIVE with 24/7 coverage
- AI DJs Valanna, Seraph & Candy hosting all day
- Commercial breaks featuring the full campaign story
- Live listener analytics and engagement tracking

**How to tune in:**
Visit [LINK] and pick your channel. Gospel, Jazz, Hip-Hop, Soul, Healing Frequencies — we've got it all.

**SQUADD Goals:**
Sustainable Development | Quality Education | Unity | Accountability | Diversity | Diplomacy

This is history. Be part of it.`,
      timing: 'March 14 — 3 days before',
    },
    {
      id: 'dc2',
      title: 'Launch Day Ping',
      text: `@everyone

**WE ARE LIVE.**

From Selma to the United Nations — the broadcast has begun.

**Tune in NOW:** [LINK]

51 channels. Real streams. Real impact.

Drop a reaction if you're listening!`,
      timing: 'March 17 — LAUNCH DAY',
    },
  ],
};

const POSTING_SCHEDULE = [
  { date: 'March 10', platform: 'All', action: 'Launch announcement + main graphic', type: 'Post' },
  { date: 'March 11', platform: 'Instagram', action: 'Story countdown begins (7 days)', type: 'Story' },
  { date: 'March 12', platform: 'Twitter + Instagram', action: 'Ghana Partnership spotlight', type: 'Post' },
  { date: 'March 13', platform: 'Instagram', action: 'Story: Meet your AI DJs', type: 'Story' },
  { date: 'March 14', platform: 'All + Discord', action: '3-day countdown + server announcement', type: 'Post + Announcement' },
  { date: 'March 15', platform: 'Twitter + Instagram', action: '51 Channels Live graphic + copy', type: 'Post' },
  { date: 'March 16', platform: 'Instagram', action: 'Story: Final preparations, 1 day out', type: 'Story' },
  { date: 'March 17 AM', platform: 'All', action: 'LAUNCH DAY — "We are LIVE" across all platforms', type: 'Post + Story + Announcement' },
  { date: 'March 17 PM', platform: 'Twitter', action: 'Sweet Miracles donation CTA', type: 'Post' },
  { date: 'March 17 Eve', platform: 'Instagram', action: 'Day 1 recap story + listener stats', type: 'Story' },
  { date: 'March 18+', platform: 'All', action: 'Daily highlights, listener milestones, DJ moments', type: 'Ongoing' },
];

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  twitter: <Twitter className="h-4 w-4" />,
  instagram: <Instagram className="h-4 w-4" />,
  discord: <MessageCircle className="h-4 w-4" />,
  facebook: <Globe className="h-4 w-4" />,
  tiktok: <Radio className="h-4 w-4" />,
  youtube: <Globe className="h-4 w-4" />,
};

const PLATFORM_COLORS: Record<string, string> = {
  twitter: 'text-blue-400 bg-blue-500/10',
  instagram: 'text-pink-400 bg-pink-500/10',
  discord: 'text-indigo-400 bg-indigo-500/10',
  facebook: 'text-blue-500 bg-blue-600/10',
  tiktok: 'text-white bg-gray-700/50',
  youtube: 'text-red-400 bg-red-500/10',
};

function ScheduledPostsDashboard() {
  const { data: posts } = trpc.contentScheduler.getSocialMediaPosts.useQuery();
  const { data: stats } = trpc.contentScheduler.getSocialMediaStats.useQuery();

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const now = Date.now();
  const upcoming = posts?.filter(p => p.status === 'scheduled' && p.scheduledAt > now) || [];
  const past = posts?.filter(p => p.scheduledAt <= now || p.status === 'published') || [];

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-amber-400" />
        Scheduled Posts — QUMUS Managed
      </h2>
      <p className="text-gray-400 mb-4">12 posts scheduled across Twitter, Instagram, and Discord for the March 10-18 campaign window. All managed by QUMUS.</p>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="bg-gray-900/60 border-gray-700/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats?.totalPosts || 0}</p>
            <p className="text-xs text-gray-400">Total Posts</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/60 border-gray-700/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats?.byPlatform?.twitter || 0}</p>
            <p className="text-xs text-gray-400">Twitter</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/60 border-gray-700/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-pink-400">{stats?.byPlatform?.instagram || 0}</p>
            <p className="text-xs text-gray-400">Instagram</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/60 border-gray-700/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-indigo-400">{stats?.byPlatform?.discord || 0}</p>
            <p className="text-xs text-gray-400">Discord</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Posts */}
      <div className="space-y-2 mb-4">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Upcoming ({upcoming.length})</h3>
        {upcoming.map((post) => (
          <Card key={post.id} className="bg-gray-900/40 border-gray-700/20">
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded ${PLATFORM_COLORS[post.platform] || 'bg-gray-700/30 text-gray-400'}`}>
                  {PLATFORM_ICONS[post.platform] || <Globe className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(post.scheduledAt)} at {formatTime(post.scheduledAt)}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">{post.platform}</Badge>
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">{post.postType}</Badge>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2">{post.content}</p>
                  {post.hashtags && <p className="text-xs text-amber-400/70 mt-1">{post.hashtags}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Past/Published Posts */}
      {past.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Past ({past.length})</h3>
          {past.map((post) => (
            <Card key={post.id} className="bg-gray-900/20 border-gray-800/20 opacity-60">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded ${PLATFORM_COLORS[post.platform] || 'bg-gray-700/30 text-gray-400'}`}>
                    {PLATFORM_ICONS[post.platform] || <Globe className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {post.status === 'published' ? 'Published' : formatDate(post.scheduledAt)}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-gray-700 text-gray-500">{post.platform}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{post.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

export default function SocialMediaKit() {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: 'Copied to clipboard', description: 'Ready to paste into your social media platform' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const daysUntilLaunch = Math.max(0, Math.ceil((new Date('2026-03-17').getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/20 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Megaphone className="h-6 w-6 text-amber-400" />
              <div>
                <h1 className="text-xl font-bold">UN Campaign Social Media Kit</h1>
                <p className="text-sm text-amber-400/80">Sweet Miracles & Rockin' Rockin' Boogie — Building the Bridge Across the World</p>
                <p className="text-xs text-gray-500">From Selma to the United Nations — March 17, 2026</p>
                <p className="text-xs text-purple-400/70">Created by Ty Battle (Ty Bat Zan) — Digital Steward, Canryn Production</p>
              </div>
            </div>
            <Badge variant="outline" className="border-amber-500/50 text-amber-400 text-lg px-4 py-1">
              {daysUntilLaunch > 0 ? `${daysUntilLaunch} Days to Launch` : 'LAUNCHED'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Campaign Graphics */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-purple-400" />
            Campaign Graphics
          </h2>
          <p className="text-gray-400 mb-6">Download and share across all platforms. Each graphic is optimized for its target format.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CAMPAIGN_GRAPHICS.map((graphic) => (
              <Card key={graphic.id} className="bg-gray-900/50 border-gray-800 overflow-hidden">
                <div className="aspect-video bg-gray-800 overflow-hidden">
                  <img 
                    src={graphic.imageUrl} 
                    alt={graphic.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white">{graphic.title}</CardTitle>
                  <CardDescription className="text-gray-400">{graphic.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {graphic.platforms.map((p) => (
                      <Badge key={p} variant="secondary" className="text-xs bg-gray-800 text-gray-300">{p}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{graphic.format}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                      onClick={() => window.open(graphic.downloadUrl, '_blank')}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download PNG
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Social Copy */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Copy className="h-5 w-5 text-blue-400" />
            Pre-Written Copy
          </h2>
          <p className="text-gray-400 mb-6">Ready-to-post copy for each platform. Click to copy, then paste directly.</p>

          <Tabs defaultValue="twitter" className="w-full">
            <TabsList className="bg-gray-900 border border-gray-800">
              <TabsTrigger value="twitter" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                <Twitter className="h-4 w-4 mr-1" /> Twitter/X ({SOCIAL_COPY.twitter.length})
              </TabsTrigger>
              <TabsTrigger value="instagram" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
                <Instagram className="h-4 w-4 mr-1" /> Instagram ({SOCIAL_COPY.instagram.length})
              </TabsTrigger>
              <TabsTrigger value="discord" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">
                <MessageCircle className="h-4 w-4 mr-1" /> Discord ({SOCIAL_COPY.discord.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="twitter" className="space-y-4 mt-4">
              {SOCIAL_COPY.twitter.map((post) => (
                <Card key={post.id} className="bg-gray-900/50 border-gray-800">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base text-white">{post.title}</CardTitle>
                      <Badge variant="outline" className="border-blue-500/50 text-blue-400 text-xs">{post.timing}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm text-gray-300 bg-gray-800/50 p-4 rounded-lg mb-3 font-sans">{post.text}</pre>
                    <Button 
                      size="sm" 
                      variant={copiedId === post.id ? 'default' : 'outline'}
                      className={copiedId === post.id ? 'bg-green-600' : 'border-gray-700 text-gray-300'}
                      onClick={() => copyToClipboard(post.text, post.id)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {copiedId === post.id ? 'Copied!' : 'Copy to Clipboard'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="instagram" className="space-y-4 mt-4">
              {SOCIAL_COPY.instagram.map((post) => (
                <Card key={post.id} className="bg-gray-900/50 border-gray-800">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base text-white">{post.title}</CardTitle>
                      <Badge variant="outline" className="border-pink-500/50 text-pink-400 text-xs">{post.timing}</Badge>
                    </div>
                    {post.graphic && (
                      <p className="text-xs text-gray-500">Pair with: {CAMPAIGN_GRAPHICS.find(g => g.id === post.graphic)?.title} graphic</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm text-gray-300 bg-gray-800/50 p-4 rounded-lg mb-3 font-sans">{post.text}</pre>
                    <Button 
                      size="sm" 
                      variant={copiedId === post.id ? 'default' : 'outline'}
                      className={copiedId === post.id ? 'bg-green-600' : 'border-gray-700 text-gray-300'}
                      onClick={() => copyToClipboard(post.text, post.id)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {copiedId === post.id ? 'Copied!' : 'Copy to Clipboard'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="discord" className="space-y-4 mt-4">
              {SOCIAL_COPY.discord.map((post) => (
                <Card key={post.id} className="bg-gray-900/50 border-gray-800">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base text-white">{post.title}</CardTitle>
                      <Badge variant="outline" className="border-indigo-500/50 text-indigo-400 text-xs">{post.timing}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm text-gray-300 bg-gray-800/50 p-4 rounded-lg mb-3 font-sans">{post.text}</pre>
                    <Button 
                      size="sm" 
                      variant={copiedId === post.id ? 'default' : 'outline'}
                      className={copiedId === post.id ? 'bg-green-600' : 'border-gray-700 text-gray-300'}
                      onClick={() => copyToClipboard(post.text, post.id)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {copiedId === post.id ? 'Copied!' : 'Copy to Clipboard'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </section>

        {/* Posting Schedule */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-400" />
            Posting Schedule
          </h2>
          <p className="text-gray-400 mb-6">Recommended posting timeline for maximum campaign impact.</p>

          <Card className="bg-gray-900/50 border-gray-800 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800 bg-gray-900/80">
                      <th className="text-left p-3 text-sm font-semibold text-gray-300">Date</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-300">Platform</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-300">Action</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-300">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {POSTING_SCHEDULE.map((item, i) => (
                      <tr key={i} className={`border-b border-gray-800/50 ${item.date.includes('17') ? 'bg-amber-500/5' : ''}`}>
                        <td className="p-3 text-sm font-medium text-white whitespace-nowrap">
                          {item.date}
                          {item.date.includes('17') && <Badge className="ml-2 bg-red-600 text-white text-xs">LAUNCH</Badge>}
                        </td>
                        <td className="p-3 text-sm text-gray-300">{item.platform}</td>
                        <td className="p-3 text-sm text-gray-300">{item.action}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">{item.type}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Links */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-purple-900/30 to-gray-900 border-purple-500/20">
            <CardContent className="p-6 text-center">
              <Radio className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <h3 className="font-bold text-white mb-2">Live Radio</h3>
              <p className="text-sm text-gray-400 mb-3">51 channels broadcasting 24/7</p>
              <Button size="sm" variant="outline" className="border-purple-500/50 text-purple-400" onClick={() => window.location.href = '/live'}>
                Go to /live
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-900/30 to-gray-900 border-amber-500/20">
            <CardContent className="p-6 text-center">
              <Megaphone className="h-8 w-8 text-amber-400 mx-auto mb-3" />
              <h3 className="font-bold text-white mb-2">Commercial Analytics</h3>
              <p className="text-sm text-gray-400 mb-3">Track campaign impressions and CTR</p>
              <Button size="sm" variant="outline" className="border-amber-500/50 text-amber-400" onClick={() => window.location.href = '/commercial-analytics'}>
                View Analytics
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-900/30 to-gray-900 border-blue-500/20">
            <CardContent className="p-6 text-center">
              <Globe className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-bold text-white mb-2">Campaign Page</h3>
              <p className="text-sm text-gray-400 mb-3">Full Selma to UN campaign story</p>
              <Button size="sm" variant="outline" className="border-blue-500/50 text-blue-400" onClick={() => window.location.href = '/selma-jubilee'}>
                View Campaign
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Scheduled Posts Dashboard */}
        <ScheduledPostsDashboard />

        {/* Campaign Video */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-amber-400" />
            Campaign Video
          </h2>
          <p className="text-gray-400 mb-4">Official promotional videos for the UN CSW70 campaign launch. Narrated by AI DJs Valanna & Candy. Share across all platforms.</p>
          
          {/* Narrated Version - Valanna & Candy */}
          <Card className="bg-gray-900/80 border-amber-500/20 overflow-hidden mb-4">
            <CardContent className="p-0">
              <video
                controls
                className="w-full aspect-video"
                poster="https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/frame3-bridge-theme-v2-MD2HJ9zFDZMH44DK8wTL28.webp"
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/RRB-Campaign-Narrated-Valanna-Candy_2630011e.mp4"
              />
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded">NARRATED</span>
                  <span className="text-xs text-purple-400">Voiced by Valanna & Candy</span>
                </div>
                <h3 className="font-bold text-amber-400 text-lg">Sweet Miracles & Rockin' Rockin' Boogie — Building the Bridge Across the World</h3>
                <p className="text-sm text-gray-400 mt-1">32-second narrated campaign video • From Selma to the United Nations • March 17, 2026</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="border-amber-500/50 text-amber-400" onClick={() => {
                    const a = document.createElement('a');
                    a.href = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/RRB-Campaign-Narrated-Valanna-Candy_2630011e.mp4';
                    a.download = 'RRB-Campaign-Narrated-Valanna-Candy.mp4';
                    a.click();
                  }}>
                    <Download className="h-4 w-4 mr-1" /> Download Narrated
                  </Button>
                  <Button size="sm" variant="outline" className="border-purple-500/50 text-purple-400" onClick={() => {
                    navigator.clipboard.writeText('https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/RRB-Campaign-Narrated-Valanna-Candy_2630011e.mp4');
                    toast({ title: 'Narrated video URL copied!' });
                  }}>
                    <Copy className="h-4 w-4 mr-1" /> Copy Link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instrumental Version */}
          <Card className="bg-gray-900/60 border-gray-700/30 overflow-hidden">
            <CardContent className="p-0">
              <video
                controls
                className="w-full aspect-video"
                poster="https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/frame3-bridge-theme-v2-MD2HJ9zFDZMH44DK8wTL28.webp"
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/RRB-UN-Campaign-Building-The-Bridge-Across-The-World_697e578a.mp4"
              />
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-gray-700/50 text-gray-300 text-xs font-bold px-2 py-0.5 rounded">INSTRUMENTAL</span>
                </div>
                <h3 className="font-bold text-gray-300 text-lg">Campaign Video — Instrumental Version</h3>
                <p className="text-sm text-gray-500 mt-1">Music-only version for background playback or custom voiceover overlay</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="border-gray-600/50 text-gray-400" onClick={() => {
                    const a = document.createElement('a');
                    a.href = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/RRB-UN-Campaign-Building-The-Bridge-Across-The-World_697e578a.mp4';
                    a.download = 'RRB-UN-Campaign-Instrumental.mp4';
                    a.click();
                  }}>
                    <Download className="h-4 w-4 mr-1" /> Download Instrumental
                  </Button>
                  <Button size="sm" variant="outline" className="border-gray-600/50 text-gray-400" onClick={() => {
                    navigator.clipboard.writeText('https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/RRB-UN-Campaign-Building-The-Bridge-Across-The-World_697e578a.mp4');
                    toast({ title: 'Instrumental video URL copied!' });
                  }}>
                    <Copy className="h-4 w-4 mr-1" /> Copy Link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Legal */}
        <div className="text-center text-xs text-gray-600 py-4 border-t border-gray-800">
          <p>All campaign materials are property of Canryn Production LLC / Rockin' Rockin' Boogie.</p>
          <p>Graphics and copy may be shared for promotional purposes related to the UN CSW70 campaign.</p>
          <p>For press inquiries, contact the Canryn Production media team.</p>
        </div>
      </div>
    </div>
  );
}
