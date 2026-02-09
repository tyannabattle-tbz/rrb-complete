import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { BookOpen, Mic, Clock, List } from 'lucide-react';

const audiobooks = [
  {
    title: 'The Seabrun Candy Hunter Story',
    description: 'A deep dive into the life and legacy of a music industry pioneer whose contributions were unjustly erased from history. This audiobook uncovers the true story behind some of the greatest hits of the 20th century.',
    narrator: 'Canryn Production Inc.',
    duration: '8h 45m',
    chapters: [
      'The Early Years',
      'The Rise of a Ghostwriter',
      'Betrayal and Obscurity',
      'The Fight for Recognition',
      'A Legacy Reclaimed',
    ],
    status: 'Available',
  },
  {
    title: 'Sweet Miracles: A Voice for the Voiceless',
    description: 'The inspiring story of the Sweet Miracles community outreach program, founded on the principles of Seabrun Candy Hunter. Discover how music and art are used to empower marginalized communities.',
    narrator: 'The Sweet Miracles Team',
    duration: '6h 30m',
    chapters: [
      'The Genesis of Sweet Miracles',
      'Music as a Healing Force',
      'Community Heroes',
      'Stories of Transformation',
      'The Future of Outreach',
    ],
    status: 'Available',
  },
  {
    title: "The Music Industry's Hidden History",
    description: 'An investigative look into the systemic issues of credit omission and exploitation in the music industry, using Seabrun Candy Hunter\'s story as a central case study. Features interviews with industry experts and historians.',
    narrator: 'QUMUS Archives',
    duration: '10h 15m',
    chapters: [
      'Contracts and Deception',
      'The Power of Publishers',
      'Unsung Heroes and Stolen Melodies',
      'Legal Battles and Landmark Cases',
      'Towards a More Equitable Future',
    ],
    status: 'Coming Soon',
  },
];

export default function Audiobooks() {
  const [activeTab, setActiveTab] = useState('all');

  const availableAudiobooks = audiobooks.filter(a => a.status === 'Available');
  const comingSoonAudiobooks = audiobooks.filter(a => a.status === 'Coming Soon');

  const renderAudiobookList = (list) => (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {list.map((audiobook) => (
        <Card key={audiobook.title} className="bg-card border-border flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-amber-500" />
              {audiobook.title}
            </CardTitle>
            <CardDescription>{audiobook.status === 'Coming Soon' ? <span className="text-red-500 font-semibold">Coming Soon</span> : 'Now Available'}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col">
            <p className="text-foreground/80 mb-4 flex-grow">{audiobook.description}</p>
            <div className="space-y-3 text-sm text-foreground/90 border-t border-border pt-4 mt-auto">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-amber-500" />
                <span>Narrated by: {audiobook.narrator}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Duration: {audiobook.duration}</span>
              </div>
              <div className="flex items-start gap-2">
                <List className="w-4 h-4 text-amber-500 mt-1" />
                <div>
                  <h4 className="font-semibold">Chapters:</h4>
                  <ul className="list-disc list-inside pl-2">
                    {audiobook.chapters.map(ch => <li key={ch}>{ch}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="py-16 md:py-24 text-center bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <BookOpen className="mx-auto h-16 w-16 text-amber-500 mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Audiobook Catalog</h1>
          <p className="mt-4 text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto">
            Listen to the stories that shaped a legacy. Explore our collection of audiobooks dedicated to the life of Seabrun Candy Hunter and the movements he inspired.
          </p>
        </div>
      </header>

      <main className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-12">
              <TabsTrigger value="all">All Audiobooks</TabsTrigger>
              <TabsTrigger value="available">Available Now</TabsTrigger>
              <TabsTrigger value="coming-soon">Coming Soon</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              {renderAudiobookList(audiobooks)}
            </TabsContent>
            <TabsContent value="available">
              {renderAudiobookList(availableAudiobooks)}
            </TabsContent>
            <TabsContent value="coming-soon">
              {renderAudiobookList(comingSoonAudiobooks)}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <section className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold">Explore More</h2>
          <p className="mt-2 text-foreground/70">Discover other facets of the RockinRockinBoogie platform.</p>
          <div className="mt-6 flex justify-center gap-4 flex-wrap">
            <Link href="/rrb/sweet-miracles" className="text-amber-500 hover:text-red-500 transition-colors">Sweet Miracles</Link>
            <span className="text-foreground/30">|</span>
            <Link href="/rrb/qumus" className="text-amber-500 hover:text-red-500 transition-colors">QUMUS Autonomous Orchestration</Link>
            <span className="text-foreground/30">|</span>
            <Link href="/rrb/hybrid-cast" className="text-amber-500 hover:text-red-500 transition-colors">HybridCast Emergency Broadcast</Link>
          </div>
        </div>
      </section>

      <footer className="py-6 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-foreground/60">
          <p>&copy; {new Date().getFullYear()} Canryn Production Inc. All Rights Reserved.</p>
          <p>The RockinRockinBoogie.com platform is dedicated to preserving the legacy of Seabrun Candy Hunter.</p>
        </div>
      </footer>
    </div>
  );
}
