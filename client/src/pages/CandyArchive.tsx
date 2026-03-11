import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RRBSongBadge } from '@/components/RRBSongBadge';
import { BookOpen, FileText, Clock, Map, Film, Music, ExternalLink, Quote, Shield } from 'lucide-react';

const ARCHIVE_PAGES = [
  { title: 'Who Was Candy?', description: 'Biography, roles, and why Candy mattered in Richard\'s world.', href: '/archive/who-was-candy', icon: BookOpen, badge: 'Biography' },
  { title: 'Rockin\' Rockin\' Boogie Sessions', description: 'The main investigative page tying together BMI, Candy\'s writings, the Nashville session, and Alvin Taylor.', href: '/archive/rrb-sessions', icon: Music, badge: 'Investigation' },
  { title: 'Collaboration Timeline', description: 'A chronological timeline of Candy\'s collaboration within Little Richard\'s world.', href: '/archive/timeline', icon: Clock, badge: 'Timeline' },
  { title: 'Evidence Map', description: 'A clean visual proof chain for researchers, journalists, publishers, and producers.', href: '/archive/evidence-map', icon: Map, badge: 'Evidence' },
  { title: 'Documentary Project', description: 'Story spine and production notes for the documentary in development.', href: '/archive/documentary', icon: Film, badge: 'In Development' },
];

const SONGS = [
  { title: 'Rockin\' Rockin\' Boogie', note: 'Official BMI co-write: Hunter / Penniman, reconciled.' },
  { title: 'I Saw What You Did', note: 'Identified by Candy as one of the songs recorded at Pete Drake\'s Nashville studio.' },
  { title: 'Standing Right Here', note: 'Paired with I Saw What You Did in Candy\'s session account.' },
  { title: 'Lost Masters', note: 'Candy wrote that the master recordings were lost while touring.' },
];

const EVIDENCE_CHAIN = [
  { step: 1, title: 'Candy\'s own writings', detail: 'He described his roles, the co-write of Rockin\' Rockin\' Boogie, the Nashville session, and the lost masters.' },
  { step: 2, title: 'BMI songwriter registration', detail: 'BMI shows Rockin\' Rockin\' Boogie as a reconciled co-write split 50/50 between Seabrun Whitney Hunter and Richard W. Penniman.' },
  { step: 3, title: 'Witness testimony', detail: 'Alvin Taylor confirmed he played drums on Rockin\' Rockin\' Boogie and identified Candy as the writer.' },
  { step: 4, title: 'Publishing context', detail: 'Payten Music appears as the publisher in the same BMI ecosystem that includes Little Richard-related works.' },
];

export default function CandyArchive() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a1a] via-[#1a1025] to-[#0f0a1a]">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0f0a1a]/85 border-b border-purple-900/30">
        <div className="container flex items-center justify-between py-3">
          <div>
            <span className="font-bold text-lg text-amber-400">Candy Hunter Archive</span>
            <span className="text-sm text-purple-300/70 ml-2 hidden sm:inline">Legacy &bull; Evidence &bull; Music History</span>
          </div>
          <nav className="flex gap-3 text-sm">
            <Link href="/archive" className="text-white hover:text-amber-400 transition">Home</Link>
            <Link href="/archive/evidence-map" className="text-purple-300/80 hover:text-amber-400 transition">Evidence</Link>
            <Link href="/archive/timeline" className="text-purple-300/80 hover:text-amber-400 transition">Timeline</Link>
            <Link href="/rrb" className="text-purple-300/80 hover:text-amber-400 transition">RRB Main</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 border-b border-purple-900/20">
        <div className="container grid md:grid-cols-[1.3fr_1fr] gap-8 items-start">
          <div>
            <p className="text-amber-400 uppercase tracking-[0.16em] text-xs font-semibold mb-3">Historical Music Archive</p>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
              Seabrun "Candy" Hunter Jr. — Collaborator in the Musical World of Little Richard
            </h1>
            <p className="text-purple-200/70 text-lg leading-relaxed mb-6">
              Musician, songwriter, bandleader, and trusted creative collaborator within Little Richard's touring and recording circle during the 1970s.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/archive/evidence-map">
                <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
                  <Map className="w-4 h-4 mr-2" /> Explore the Evidence
                </Button>
              </Link>
              <Link href="/archive/documentary">
                <Button variant="outline" className="border-purple-500/40 text-purple-200 hover:bg-purple-900/30">
                  <Film className="w-4 h-4 mr-2" /> Documentary Project
                </Button>
              </Link>
            </div>
          </div>
          <Card className="bg-gradient-to-b from-purple-900/40 to-purple-950/60 border-purple-700/30">
            <CardHeader>
              <CardTitle className="text-amber-400 text-lg">Archive Focus</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-200/70 text-sm leading-relaxed mb-4">
                This archive presents primary-source writings by Candy, witness testimony, BMI registration records, historical references, and session-era documentation tied to songs such as <strong className="text-white">Rockin' Rockin' Boogie</strong>, <strong className="text-white">I Saw What You Did</strong>, and <strong className="text-white">Standing Right Here</strong>.
              </p>
              <div className="mt-3">
                <RRBSongBadge variant="compact" showTitle />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-amber-500/40 text-amber-300">Primary Sources</Badge>
                <Badge variant="outline" className="border-amber-500/40 text-amber-300">BMI Evidence</Badge>
                <Badge variant="outline" className="border-amber-500/40 text-amber-300">Witness Testimony</Badge>
                <Badge variant="outline" className="border-amber-500/40 text-amber-300">Lost Masters</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* What This Archive Establishes */}
      <section className="py-14">
        <div className="container grid md:grid-cols-[1.3fr_1fr] gap-8 items-start">
          <div>
            <p className="text-amber-400 uppercase tracking-[0.16em] text-xs font-semibold mb-3">Archive Position</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">What this archive establishes</h2>
            <p className="text-purple-200/70 text-base leading-relaxed mb-6">
              The site positions Candy primarily as a collaborator in Little Richard's musical world and documents the songs, sessions, and publishing evidence connected to that working relationship.
            </p>
            <div className="space-y-3">
              {EVIDENCE_CHAIN.map(e => (
                <div key={e.step} className="flex gap-3 items-start p-3 bg-white/[0.03] border border-purple-800/20 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold shrink-0">{e.step}</div>
                  <div>
                    <strong className="text-white text-sm block">{e.title}</strong>
                    <span className="text-purple-300/60 text-xs">{e.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-b from-purple-900/40 to-purple-950/60 border border-purple-700/30 rounded-2xl p-6">
            <h3 className="text-amber-400 font-bold mb-3 flex items-center gap-2"><Quote className="w-4 h-4" /> Anchor Quote</h3>
            <blockquote className="border-l-4 border-amber-500 pl-4 py-2 bg-white/[0.03] rounded-r-lg italic text-amber-100/80 text-sm leading-relaxed">
              "I wore many hats… bandleader singing the opening of the show, songwriter and engineer."
            </blockquote>
            <p className="text-purple-300/50 text-xs mt-3">
              Candy's personal statement frames why his contributions appear across stage performance, organization, songwriting, and studio work.
            </p>
          </div>
        </div>
      </section>

      {/* Core Pages */}
      <section className="py-14 bg-white/[0.02] border-y border-purple-900/20">
        <div className="container">
          <p className="text-amber-400 uppercase tracking-[0.16em] text-xs font-semibold mb-3">Core Pages</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Archive Navigation</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ARCHIVE_PAGES.map(page => (
              <Link key={page.href} href={page.href}>
                <Card className="bg-gradient-to-b from-purple-900/30 to-purple-950/50 border-purple-700/20 hover:border-amber-500/40 transition-all cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <page.icon className="w-5 h-5 text-amber-400" />
                      <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-xs">{page.badge}</Badge>
                    </div>
                    <CardTitle className="text-white text-base">{page.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-purple-200/60 text-sm">{page.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Songs From the Collaboration Era */}
      <section className="py-14">
        <div className="container">
          <p className="text-amber-400 uppercase tracking-[0.16em] text-xs font-semibold mb-3">Songs From the Collaboration Era</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Works tied to the archive</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SONGS.map(song => (
              <Card key={song.title} className="bg-gradient-to-b from-purple-900/30 to-purple-950/50 border-purple-700/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Music className="w-4 h-4 text-amber-400" /> {song.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-200/60 text-xs">{song.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How to Use This Archive */}
      <section className="py-14 bg-white/[0.02] border-y border-purple-900/20">
        <div className="container">
          <p className="text-amber-400 uppercase tracking-[0.16em] text-xs font-semibold mb-3">Documentation Strategy</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">How to use this archive</h2>
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 text-purple-200/70 text-sm">
              <FileText className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <span>For <strong className="text-white">journalists</strong>: start with the <Link href="/archive/evidence-map" className="text-amber-400 hover:underline">Evidence Map</Link> and the <Link href="/archive/timeline" className="text-amber-400 hover:underline">collaboration timeline</Link>.</span>
            </div>
            <div className="flex items-start gap-3 text-purple-200/70 text-sm">
              <Shield className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <span>For <strong className="text-white">rights inquiries</strong>: use the <Link href="/archive/rrb-sessions" className="text-amber-400 hover:underline">RRB Sessions page</Link> and the BMI screenshots.</span>
            </div>
            <div className="flex items-start gap-3 text-purple-200/70 text-sm">
              <Film className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <span>For <strong className="text-white">documentary planning</strong>: use the <Link href="/archive/documentary" className="text-amber-400 hover:underline">documentary page</Link> and the witness summary.</span>
            </div>
          </div>
          <div className="p-4 border border-dashed border-amber-500/40 rounded-xl bg-amber-500/[0.04] text-amber-200/80 text-sm">
            This archive is structured as a historical evidence site. It is designed to be updated with screenshots, scans, book pages, emails, and media assets as they are added to the system.
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-purple-900/20">
        <div className="container flex items-center justify-between text-purple-300/50 text-xs">
          <span>&copy; {new Date().getFullYear()} Candy Hunter Archive &bull; A Canryn Production</span>
          <Link href="/" className="text-amber-400/60 hover:text-amber-400 transition">Back to Main</Link>
        </div>
      </footer>
    </div>
  );
}
