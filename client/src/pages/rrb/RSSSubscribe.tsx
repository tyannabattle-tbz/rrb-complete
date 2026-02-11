import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rss, Headphones, Radio, Newspaper, Copy, Check, ExternalLink, Podcast, Music, Globe } from 'lucide-react';
import { toast } from 'sonner';

const feeds = [
  {
    id: 'podcast',
    title: "Rockin' Rockin' Boogie Podcast",
    description: 'Exploring the legacy of Seabrun Candy Hunter and Little Richard through music, history, and archival stories.',
    url: '/api/rss/podcast',
    icon: Headphones,
    color: 'from-orange-500 to-amber-600',
    categories: ['Music', 'Music History', 'Society & Culture', 'Documentary'],
    episodes: 6,
    directories: [
      { name: 'Apple Podcasts', url: 'https://podcasts.apple.com/submit', icon: '🍎' },
      { name: 'Spotify', url: 'https://podcasters.spotify.com/', icon: '🎵' },
      { name: 'Google Podcasts', url: 'https://podcastsmanager.google.com/', icon: '🔍' },
      { name: 'iHeartRadio', url: 'https://www.iheart.com/content/submit-your-podcast/', icon: '❤️' },
    ]
  },
  {
    id: 'radio',
    title: 'RRB Radio Programming',
    description: '7-channel 24/7 radio broadcasting — gospel, jazz, blues, R&B, talk shows, healing frequencies, and emergency alerts.',
    url: '/api/rss/radio',
    icon: Radio,
    color: 'from-purple-500 to-violet-600',
    categories: ['Radio', 'Broadcasting', 'Music', 'Talk'],
    episodes: 7,
    directories: [
      { name: 'TuneIn', url: 'https://help.tunein.com/contact/add-a-station-S19TR3Sdf', icon: '📻' },
      { name: 'RadioBrowser', url: 'https://www.radio-browser.info/', icon: '🌐' },
    ]
  },
  {
    id: 'news',
    title: 'RRB News & Updates',
    description: 'Latest news from the Canryn Production ecosystem — platform updates, legacy discoveries, community stories, and Sweet Miracles Foundation updates.',
    url: '/api/rss/news',
    icon: Newspaper,
    color: 'from-blue-500 to-cyan-600',
    categories: ['News', 'Music', 'Culture', 'Community'],
    episodes: 5,
    directories: [
      { name: 'Feedly', url: 'https://feedly.com/', icon: '📰' },
      { name: 'Google News', url: 'https://publishercenter.google.com/', icon: '🔍' },
    ]
  }
];

export default function RSSSubscribe() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyFeedUrl = (feedId: string, url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedId(feedId);
      toast.success('RSS feed URL copied to clipboard');
      setTimeout(() => setCopiedId(null), 3000);
    });
  };

  const openRawFeed = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-900/30 via-background to-purple-900/20 py-16 px-4">
        <div className="container max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-6">
            <Rss className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-orange-300 font-medium">Subscribe to Our Feeds</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            RSS Feeds & Podcast Distribution
          </h1>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto mb-8">
            Subscribe to Rockin' Rockin' Boogie content across all major platforms. 
            Copy the RSS feed URL and paste it into your favorite podcast app or news reader.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outline" onClick={() => window.open('/api/rss/opml', '_blank')} className="gap-2">
              <Globe className="w-4 h-4" />
              Download OPML (All Feeds)
            </Button>
          </div>
        </div>
      </div>

      {/* Feed Cards */}
      <div className="container max-w-5xl mx-auto px-4 py-12 space-y-8">
        {feeds.map((feed) => {
          const Icon = feed.icon;
          const isCopied = copiedId === feed.id;
          const fullUrl = `${window.location.origin}${feed.url}`;

          return (
            <Card key={feed.id} className="overflow-hidden border-foreground/10">
              <div className={`h-2 bg-gradient-to-r ${feed.color}`} />
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feed.color} text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{feed.title}</CardTitle>
                      <CardDescription className="mt-1">{feed.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {feed.episodes} {feed.id === 'radio' ? 'channels' : feed.id === 'news' ? 'articles' : 'episodes'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  {feed.categories.map((cat) => (
                    <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
                  ))}
                </div>

                {/* Feed URL Copy Box */}
                <div className="bg-foreground/5 rounded-lg p-4 space-y-3">
                  <label className="text-sm font-medium text-foreground/70">Feed URL</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-background border border-foreground/10 rounded-md px-3 py-2 text-sm font-mono text-foreground/80 overflow-x-auto whitespace-nowrap">
                      {fullUrl}
                    </div>
                    <Button
                      size="sm"
                      variant={isCopied ? 'default' : 'outline'}
                      onClick={() => copyFeedUrl(feed.id, feed.url)}
                      className="gap-1.5 shrink-0"
                    >
                      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {isCopied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openRawFeed(feed.url)}
                      className="gap-1.5 shrink-0"
                      title="View raw XML feed"
                    >
                      <ExternalLink className="w-4 h-4" />
                      XML
                    </Button>
                  </div>
                </div>

                {/* Directory Links */}
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-3 block">
                    Submit to Directories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {feed.directories.map((dir) => (
                      <Button
                        key={dir.name}
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(dir.url, '_blank')}
                        className="gap-2"
                      >
                        <span>{dir.icon}</span>
                        {dir.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* How to Subscribe */}
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                    How to subscribe →
                  </summary>
                  <div className="mt-3 text-sm text-foreground/60 space-y-2 pl-4 border-l-2 border-foreground/10">
                    <p><strong>Apple Podcasts:</strong> Open Apple Podcasts → File → Add a Show by URL → Paste the feed URL</p>
                    <p><strong>Spotify:</strong> Go to podcasters.spotify.com → Submit your RSS feed URL</p>
                    <p><strong>Any RSS Reader:</strong> Copy the feed URL above and paste it into your RSS reader's "Add Feed" option</p>
                    <p><strong>Overcast / Pocket Casts:</strong> Tap "+" → "Add URL" → Paste the feed URL</p>
                  </div>
                </details>
              </CardContent>
            </Card>
          );
        })}

        {/* Owner Info */}
        <Card className="border-foreground/10 bg-foreground/5">
          <CardContent className="py-8 text-center">
            <Podcast className="w-10 h-10 text-orange-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Produced by Canryn Production and its subsidiaries</h3>
            <p className="text-foreground/60 text-sm max-w-lg mx-auto">
              Supporting the Sweet Miracles Foundation — a 501(c)(3) / 508(c) nonprofit. 
              "A Voice for the Voiceless." All content is for historical preservation and educational purposes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
