import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, BookOpen, Mic, Clock, Calendar, Heart, Feather, Volume2, Users, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ─── Poetry Collections ──────────────────────────────────────────────────────

interface Poem {
  id: string;
  title: string;
  collection: string;
  excerpt: string;
  theme: string;
  year?: string;
}

interface ScheduleSlot {
  time: string;
  title: string;
  description: string;
  days: string;
  icon: typeof BookOpen;
}

const FEATURED_POEMS: Poem[] = [
  {
    id: 'miracles-1',
    title: 'From "Miracles"',
    collection: 'Miracles — A Collection of Poems',
    excerpt: 'Words that heal, words that reveal the truth hidden in plain sight. Seabrun Candy Hunter wrote poetry that touched the soul and preserved the spirit.',
    theme: 'Faith & Healing',
    year: '1990s',
  },
  {
    id: 'miracles-2',
    title: 'From "Miracles One"',
    collection: 'Miracles One — Continued Reflections',
    excerpt: 'A continuation of the Miracles journey — deeper reflections on life, love, loss, and the enduring power of family bonds.',
    theme: 'Family & Legacy',
    year: '2000s',
  },
  {
    id: 'love-poems-1',
    title: 'From "50 Love Poems"',
    collection: 'A Collection of 50 Love Poems',
    excerpt: 'Fifty expressions of love in its many forms — romantic, familial, spiritual, and the love of music that defined a lifetime.',
    theme: 'Love & Devotion',
    year: '2000s',
  },
  {
    id: 'goodbye-1',
    title: '"Good-bye" Poems',
    collection: 'Miracles One',
    excerpt: 'The Good-bye poems — reflections on departure, remembrance, and the things left unsaid. Poetry that speaks across the divide.',
    theme: 'Remembrance',
  },
  {
    id: 'community-1',
    title: 'Community Open Mic',
    collection: 'Community Submissions',
    excerpt: 'Your voice matters. The Poetry Hour Open Mic welcomes original poetry from the community — stories of resilience, hope, and truth.',
    theme: 'Community Voices',
  },
];

const SCHEDULE: ScheduleSlot[] = [
  {
    time: '12:00 AM – 6:00 AM',
    title: 'Midnight Verses',
    description: 'Reflective poetry for the quiet hours. Ambient readings from the Miracles collections.',
    days: 'Every Day',
    icon: Star,
  },
  {
    time: '6:00 AM – 9:00 AM',
    title: 'Morning Words',
    description: 'Poetry and affirmations to start the day. Uplifting verses and spoken word.',
    days: 'Mon – Fri',
    icon: Feather,
  },
  {
    time: '9:00 AM – 12:00 PM',
    title: 'Miracles Hour',
    description: 'Featured readings from Candy Hunter\'s poetry collections — Miracles, Miracles One, and 50 Love Poems.',
    days: 'Mon – Fri',
    icon: BookOpen,
  },
  {
    time: '12:00 PM – 3:00 PM',
    title: '50 Love Poems',
    description: 'Afternoon readings from the love poetry collection. Romantic, familial, and spiritual love.',
    days: 'Mon – Fri',
    icon: Heart,
  },
  {
    time: '3:00 PM – 6:00 PM',
    title: 'Community Voices — Open Mic',
    description: 'Original poetry from the community. Submit your work to be featured on air.',
    days: 'Every Day',
    icon: Mic,
  },
  {
    time: '6:00 PM – 9:00 PM',
    title: 'Evening Spoken Word',
    description: 'Featured poets and spoken word artists. Long-form pieces and performances.',
    days: 'Every Day',
    icon: Users,
  },
  {
    time: '9:00 PM – 12:00 AM',
    title: 'Good-bye Poems',
    description: 'Nighttime reflections from the Good-bye series. Poetry for remembrance and peace.',
    days: 'Every Day',
    icon: Star,
  },
];

const SPECIAL_PROGRAMMING: { title: string; time: string; description: string }[] = [
  {
    title: 'Saturday Poetry Marathon',
    time: 'Saturdays 10:00 AM – 4:00 PM',
    description: 'Full collection readings — complete works from Miracles, Miracles One, and 50 Love Poems performed back to back.',
  },
  {
    title: 'Sunday Devotional Poetry',
    time: 'Sundays 8:00 AM – 12:00 PM',
    description: 'Faith-based poetry and devotional readings. Spiritual reflections from the Miracles collections.',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function PoetryHour() {
  const [activeTab, setActiveTab] = useState('about');

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-4">
          <Link href="/rrb/radio-station" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Radio Station
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 via-background to-amber-950/20" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <Feather className="w-8 h-8 text-purple-400" />
              </div>
              <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                Channel 8 · 174 Hz
              </Badge>
              <Badge variant="outline" className="border-green-500/30 text-green-400 animate-pulse">
                LIVE
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Poetry Hour
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Dedicated to the poetry of Seabrun "Candy" Hunter — author of <em>Miracles</em>, <em>Miracles One</em>, and <em>A Collection of 50 Love Poems</em>. Featuring community open mic, spoken word performances, and 24/7 poetry programming on Channel 8.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/rrb/radio-station">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Listen Live on Channel 8
                </Button>
              </Link>
              <Link href="/rrb/the-legacy">
                <Button variant="outline">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Read About the Poetry
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Poetry Collections', value: '3', icon: BookOpen },
              { label: 'Daily Programs', value: '7', icon: Clock },
              { label: 'Broadcast Hours', value: '24/7', icon: Volume2 },
              { label: 'Solfeggio Frequency', value: '174 Hz', icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="open-mic">Open Mic</TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Feather className="w-5 h-5 text-purple-400" />
                  About Poetry Hour
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Poetry Hour is Channel 8 of the Rockin' Rockin' Boogie radio network — a 24/7 station dedicated to the spoken word, poetry readings, and community voices. The station is anchored by the poetry of <strong className="text-foreground">Seabrun "Candy" Hunter</strong>, whose three published collections form the foundation of the programming.
                </p>
                <p>
                  Candy Hunter was more than a musician. He was a poet, a philosopher, and a storyteller. His <em>Miracles</em> series and <em>A Collection of 50 Love Poems</em> capture decades of lived experience — faith, love, loss, family, and the enduring power of truth. These works are preserved here as part of the legacy restoration mission.
                </p>
                <p>
                  The station broadcasts at <strong className="text-foreground">174 Hz</strong>, the Solfeggio frequency associated with pain relief and healing — fitting for poetry that was written to heal, to remember, and to speak truth.
                </p>
                <p>
                  Poetry Hour also features a daily <strong className="text-foreground">Community Open Mic</strong> segment (3:00 PM – 6:00 PM daily), where community members can submit original poetry to be read on air. This is your station. Your voice matters.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  Special Programming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {SPECIAL_PROGRAMMING.map((prog) => (
                    <div key={prog.title} className="p-4 rounded-lg bg-muted/50 border border-border/40">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{prog.title}</h3>
                        <Badge variant="outline" className="text-xs">{prog.time}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{prog.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  Daily Programming Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {SCHEDULE.map((slot) => (
                    <div key={slot.time} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border/40 hover:border-purple-500/30 transition-colors">
                      <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 mt-0.5">
                        <slot.icon className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-foreground">{slot.title}</h3>
                          <Badge variant="outline" className="text-xs shrink-0 ml-2">{slot.days}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{slot.description}</p>
                        <p className="text-xs text-purple-400 font-mono">{slot.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {FEATURED_POEMS.filter(p => p.collection !== 'Community Submissions').map((poem) => (
                <Card key={poem.id} className="hover:border-purple-500/30 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                        {poem.theme}
                      </Badge>
                      {poem.year && (
                        <span className="text-xs text-muted-foreground">{poem.year}</span>
                      )}
                    </div>
                    <CardTitle className="text-lg">{poem.title}</CardTitle>
                    <p className="text-sm text-amber-400">{poem.collection}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                      "{poem.excerpt}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-muted/30">
              <CardContent className="py-6">
                <p className="text-sm text-muted-foreground text-center">
                  Full poetry collections are available through the Canryn Production archive. These excerpts represent the spirit of each collection as featured on Poetry Hour programming.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Open Mic Tab */}
          <TabsContent value="open-mic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-purple-400" />
                  Community Open Mic
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Poetry Hour's Open Mic segment runs <strong className="text-foreground">every day from 3:00 PM to 6:00 PM</strong>. This is your space to share original poetry, spoken word, and creative expression with the community.
                </p>
                <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                  <h3 className="font-semibold text-foreground mb-3">How to Submit</h3>
                  <ol className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-purple-400 shrink-0">1.</span>
                      Write your original poem or spoken word piece
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-purple-400 shrink-0">2.</span>
                      Record yourself reading it (audio or video)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-purple-400 shrink-0">3.</span>
                      Submit through the Community Voices section or contact Canryn Production
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-purple-400 shrink-0">4.</span>
                      Selected pieces air during the Open Mic block with full credit to the author
                    </li>
                  </ol>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <h3 className="font-semibold text-foreground mb-2">Guidelines</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Original work only — no copyrighted material</li>
                    <li>• All themes welcome — love, faith, struggle, hope, truth</li>
                    <li>• Keep submissions under 5 minutes for readings</li>
                    <li>• Family-friendly content preferred</li>
                    <li>• Include your name and how you'd like to be credited</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Footer */}
      <section className="border-t border-border/40 bg-muted/20">
        <div className="container py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Poetry Hour — Channel 8 · 174 Hz · A Canryn Production Station
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            Preserving the poetry of Seabrun "Candy" Hunter for future generations.
          </p>
        </div>
      </section>
    </div>
  );
}
