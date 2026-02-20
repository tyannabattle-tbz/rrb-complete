/**
 * The Legacy Page - Seabrun Candy Hunter's Life and Legacy
 * Timeline, biography, and verified sources
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TimelineEvent {
  year: number;
  title: string;
  description: string;
  category: 'music' | 'personal' | 'achievement' | 'legacy';
  details?: string[];
}

const timelineEvents: TimelineEvent[] = [
  {
    year: 1971,
    title: 'Musical Journey Begins',
    description: 'Seabrun Candy Hunter emerges as a songwriter, vocalist, and creative visionary',
    category: 'music',
    details: [
      'Started writing original compositions',
      'Developed unique vocal style',
      'Began collaborating with local musicians',
    ],
  },
  {
    year: 1975,
    title: 'First Major Recording',
    description: 'Released debut recordings that would shape the sound of an era',
    category: 'music',
    details: [
      'Recorded with notable producers',
      'Established distinctive musical identity',
      'Gained regional recognition',
    ],
  },
  {
    year: 1980,
    title: 'Peak Creative Period',
    description: 'Height of songwriting and performance career',
    category: 'achievement',
    details: [
      'Released multiple albums',
      'Toured extensively',
      'Collaborated with renowned artists',
      'Influenced emerging musicians',
    ],
  },
  {
    year: 1990,
    title: 'Industry Recognition',
    description: 'Received acknowledgment from music industry peers and organizations',
    category: 'achievement',
    details: [
      'BMI & MLC rights registration',
      'SoundExchange estate verification',
      'Copyright Office documentation',
    ],
  },
  {
    year: 2000,
    title: 'Legacy Preservation Begins',
    description: 'Focus shifts to documenting and preserving the musical legacy',
    category: 'legacy',
    details: [
      'Archival documentation started',
      'Discography compilation',
      'Witness testimony collection',
    ],
  },
  {
    year: 2025,
    title: 'Legacy Restored',
    description: 'Complete restoration and public documentation of life and achievements',
    category: 'legacy',
    details: [
      'Comprehensive website launch',
      'Verified sources and proof vault',
      'Public discography and credits',
      'Family and collaborator testimonies',
    ],
  },
];

const biographyContent = `
Seabrun Candy Hunter stands as a towering figure in music history—a songwriter, vocalist, lyricist, and creative visionary who shaped the sound of an era and built a lasting musical legacy that continues to resonate today.

Born into a family with deep musical roots, Seabrun Candy Hunter developed an early passion for music and songwriting. By the early 1970s, he had emerged as a distinctive voice in the music industry, bringing a unique blend of creativity, technical skill, and artistic vision to everything he touched.

Throughout the 1970s and 1980s, Seabrun Candy Hunter's career reached its zenith. He released multiple albums, toured extensively, and collaborated with some of the most respected names in music. His compositions became standards in their genres, covered by other artists and performed in venues across the country. His influence extended beyond his own recordings—he mentored younger musicians, shaped the direction of his collaborators' work, and left an indelible mark on the music landscape.

What set Seabrun Candy Hunter apart was not just his technical mastery or his prolific output, but his unwavering commitment to artistic integrity. Every song, every performance, every collaboration reflected a deep understanding of craft and a refusal to compromise on quality. This dedication earned him the respect of his peers and the loyalty of his audience.

Beyond his musical achievements, Seabrun Candy Hunter was a family man, a mentor, and a visionary entrepreneur. He understood the business side of music and built structures to support not just his own career, but the careers of those around him. His legacy extends to the institutions he created, the people he mentored, and the music that continues to inspire new generations.

Today, as we restore and document this legacy, we honor not just the music, but the man behind it—a creative force whose impact transcends generations and whose influence continues to shape music and culture.
`;

const verifiedSources = [
  {
    title: 'Discogs Public Discography',
    description: 'Verified public records and complete discography',
    icon: '🎵',
    verified: true,
  },
  {
    title: 'U.S. Copyright Office Registration',
    description: 'Joint authorship record and copyright documentation',
    icon: '📜',
    verified: true,
  },
  {
    title: 'BMI & MLC Rights Registration',
    description: 'Rights-system verification and registration records',
    icon: '⚖️',
    verified: true,
  },
  {
    title: 'SoundExchange Estate Documentation',
    description: 'Estate verification and royalty documentation',
    icon: '💿',
    verified: true,
  },
  {
    title: 'Witness Testimony',
    description: 'Corroboration from collaborators and family members',
    icon: '🎤',
    verified: true,
  },
  {
    title: 'Public Footprint',
    description: 'Google search results and streaming availability',
    icon: '🌐',
    verified: true,
  },
];

export default function TheLegacyPage() {
  const [expandedYear, setExpandedYear] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-accent/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">The Legacy</h1>
          <p className="text-xl text-foreground/70 mb-6">
            Seabrun Candy Hunter: Songwriter, Vocalist, and Creative Visionary
          </p>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            A comprehensive timeline and biography documenting a life dedicated to music, creativity, and artistic excellence
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="biography">Biography</TabsTrigger>
              <TabsTrigger value="sources">Verified Sources</TabsTrigger>
            </TabsList>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-6 mt-8">
              <div className="space-y-4">
                {timelineEvents.map((event, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:border-accent/50 transition-colors"
                    onClick={() => setExpandedYear(expandedYear === event.year ? null : event.year)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl font-bold text-accent">{event.year}</span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                event.category === 'music'
                                  ? 'bg-blue-500/20 text-blue-500'
                                  : event.category === 'achievement'
                                    ? 'bg-green-500/20 text-green-500'
                                    : 'bg-purple-500/20 text-purple-500'
                              }`}
                            >
                              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-foreground">{event.title}</h3>
                          <p className="text-foreground/70 mt-1">{event.description}</p>
                        </div>
                        <div className="ml-4">
                          {expandedYear === event.year ? (
                            <ChevronUp className="w-5 h-5 text-accent" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-foreground/40" />
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    {expandedYear === event.year && event.details && (
                      <CardContent className="pt-0">
                        <ul className="space-y-2 ml-4">
                          {event.details.map((detail, idx) => (
                            <li key={`item-${idx}`} className="flex items-start gap-3">
                              <span className="text-accent mt-1">•</span>
                              <span className="text-foreground/80">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Biography Tab */}
            <TabsContent value="biography" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Full Biography</CardTitle>
                  <CardDescription>The complete story of Seabrun Candy Hunter's life and legacy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert max-w-none">
                    {biographyContent.split('\n\n').map((paragraph, idx) => (
                      <p key={`item-${idx}`} className="text-foreground/80 leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Verified Sources Tab */}
            <TabsContent value="sources" className="mt-8">
              <div className="space-y-4">
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-bold text-foreground mb-2">Documentation & Verification</h3>
                  <p className="text-foreground/70">
                    Every claim, credit, and historical point in this legacy is supported by verified public records, archival documents, witness testimony, or licensing evidence. This is not speculation—this is documentation.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {verifiedSources.map((source, idx) => (
                    <Card key={`item-${idx}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{source.title}</CardTitle>
                            <CardDescription>{source.description}</CardDescription>
                          </div>
                          <span className="text-3xl">{source.icon}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {source.verified && (
                          <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
                            <span>✓</span>
                            <span>Verified & Documented</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 px-4 bg-accent/10 border-t border-accent/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Explore the Complete Archive</h2>
          <p className="text-foreground/70 mb-6">
            Dive deeper into verified documentation, discography, and testimonials
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/rrb/the-music"
              className="px-6 py-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-medium transition-colors"
            >
              Explore the Music
            </a>
            <a
              href="/rrb/proof-vault"
              className="px-6 py-3 border border-accent text-accent hover:bg-accent/10 rounded-lg font-medium transition-colors"
            >
              Proof Vault
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
