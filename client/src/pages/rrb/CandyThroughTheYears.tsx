/**
 * Candy Through the Years - Era-by-Era Journey
 * A chronological journey through Seabrun Candy Hunter's life and career
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Music, Star, Heart, Mic, Award, BookOpen, Radio } from 'lucide-react';
import { Link } from 'wouter';

interface Era {
  id: string;
  period: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  musicalStyle: string;
  icon: typeof Music;
  color: string;
}

const eras: Era[] = [
  {
    id: 'early-years',
    period: '1950s – 1960s',
    title: 'The Early Years',
    subtitle: 'Where It All Began',
    description: 'Growing up in a household filled with music, young Seabrun Candy Hunter absorbed the sounds of gospel, blues, and early rock and roll. Grandma Helen\'s home was the first classroom, and the family\'s musical traditions were the first curriculum. By his teenage years, it was clear that music was not just a hobby — it was a calling.',
    highlights: [
      'First exposure to songwriting through family musical traditions',
      'Developed ear for melody and harmony through gospel music',
      'Began writing original compositions as a teenager',
      'Influenced by the golden age of R&B and soul music',
    ],
    musicalStyle: 'Gospel roots, early R&B influences',
    icon: Heart,
    color: 'rose',
  },
  {
    id: 'emergence',
    period: '1970s',
    title: 'The Emergence',
    subtitle: 'A Voice Finds Its Stage',
    description: 'The 1970s marked Seabrun Candy Hunter\'s emergence as a serious creative force. He began recording, collaborating with established musicians, and developing the distinctive songwriting style that would become his signature. This was the decade when talent met opportunity — and the results were extraordinary.',
    highlights: [
      'First professional recordings and studio sessions',
      'Established collaborations with notable producers and musicians',
      'Developed signature songwriting approach combining soul, funk, and pop',
      'Built reputation as both a vocalist and a songwriter\'s songwriter',
    ],
    musicalStyle: 'Soul, funk, early disco influences',
    icon: Mic,
    color: 'amber',
  },
  {
    id: 'peak',
    period: '1980s',
    title: 'The Peak Years',
    subtitle: 'At the Height of Creative Power',
    description: 'The 1980s represented the peak of Seabrun Candy Hunter\'s creative output. Albums were released, tours were undertaken, and collaborations with some of the biggest names in music cemented his place in the industry. This was also the period when the systematic omission of his credits began — even as his contributions were at their most prolific.',
    highlights: [
      'Released multiple albums showcasing songwriting range',
      'Toured extensively across the country',
      'Collaborated with renowned artists and producers',
      'Compositions covered by other artists, expanding influence',
      'Height of creative productivity and artistic innovation',
    ],
    musicalStyle: 'R&B, pop-soul, contemporary funk',
    icon: Star,
    color: 'blue',
  },
  {
    id: 'recognition',
    period: '1990s',
    title: 'The Recognition Era',
    subtitle: 'Industry Acknowledgment & Rights',
    description: 'As the industry evolved, so did the recognition of Seabrun Candy Hunter\'s contributions — at least in official records. BMI registration, Copyright Office filings, and SoundExchange documentation began to create the paper trail that would later prove essential to the legacy restoration effort.',
    highlights: [
      'BMI songwriter registration formalized',
      'Copyright Office filings documenting joint authorship',
      'SoundExchange estate verification initiated',
      'Industry peers acknowledged contributions through testimony',
    ],
    musicalStyle: 'Mature songwriting, genre-spanning compositions',
    icon: Award,
    color: 'green',
  },
  {
    id: 'preservation',
    period: '2000s – 2010s',
    title: 'The Preservation Period',
    subtitle: 'Protecting What Was Built',
    description: 'The digital revolution transformed the music industry, and with it came both challenges and opportunities for legacy preservation. As physical records gave way to digital databases, the family began the critical work of ensuring that Seabrun Candy Hunter\'s contributions would not be lost in the transition.',
    highlights: [
      'Digital archiving of original recordings and documentation',
      'Transition of rights management to digital platforms',
      'Family-led effort to compile and verify historical records',
      'Preparation for comprehensive public documentation',
    ],
    musicalStyle: 'Catalog preservation and digital remastering',
    icon: BookOpen,
    color: 'purple',
  },
  {
    id: 'restoration',
    period: '2020s',
    title: 'The Restoration',
    subtitle: 'Legacy Restored & Continued',
    description: 'The current era represents the culmination of decades of work. Through RockinRockinBoogie.com, the QUMUS platform, and the broader Canryn Production ecosystem, the legacy of Seabrun Candy Hunter is being restored, documented, and shared with the world. This is not just preservation — it is resurrection.',
    highlights: [
      'Launch of RockinRockinBoogie.com comprehensive platform',
      'QUMUS autonomous orchestration managing legacy content',
      'Radio station broadcasting Seabrun\'s music 24/7',
      'Proof Vault documenting verified evidence',
      'Sweet Miracles community impact initiative',
      'Canryn Production Inc. continuing the creative legacy',
    ],
    musicalStyle: 'Full catalog streaming, new productions, legacy broadcasts',
    icon: Radio,
    color: 'cyan',
  },
];

export default function CandyThroughTheYears() {
  const [selectedEra, setSelectedEra] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-amber-500/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Clock className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Candy Through the Years</h1>
          <p className="text-xl text-foreground/70 mb-2">
            A Journey Through Time
          </p>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            From the early days of gospel-infused songwriting to the digital restoration of a legacy, 
            follow the era-by-era journey of Seabrun Candy Hunter's life and career.
          </p>
        </div>
      </section>

      {/* Era Navigation */}
      <section className="py-6 px-4 border-b border-border bg-card/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {eras.map(era => (
              <button
                key={era.id}
                onClick={() => {
                  setSelectedEra(era.id);
                  document.getElementById(era.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedEra === era.id
                    ? 'bg-amber-500 text-white'
                    : 'bg-muted hover:bg-muted/80 text-foreground/70'
                }`}
              >
                {era.period}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Eras */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {eras.map((era, idx) => {
            const colorMap: Record<string, string> = {
              rose: 'border-l-rose-500',
              amber: 'border-l-amber-500',
              blue: 'border-l-blue-500',
              green: 'border-l-green-500',
              purple: 'border-l-purple-500',
              cyan: 'border-l-cyan-500',
            };
            const bgMap: Record<string, string> = {
              rose: 'bg-rose-500/20 text-rose-500',
              amber: 'bg-amber-500/20 text-amber-500',
              blue: 'bg-blue-500/20 text-blue-500',
              green: 'bg-green-500/20 text-green-500',
              purple: 'bg-purple-500/20 text-purple-500',
              cyan: 'bg-cyan-500/20 text-cyan-500',
            };

            return (
              <Card
                key={era.id}
                id={era.id}
                className={`border-l-4 ${colorMap[era.color] || 'border-l-amber-500'}`}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${bgMap[era.color] || ''}`}>
                      <era.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground/50 mb-1">{era.period}</p>
                      <CardTitle className="text-2xl mb-1">{era.title}</CardTitle>
                      <p className="text-foreground/60 italic">{era.subtitle}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/80 leading-relaxed">{era.description}</p>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Key Moments</h4>
                    <ul className="space-y-1.5">
                      {era.highlights.map((highlight, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2 text-sm text-foreground/70">
                          <span className="text-amber-500 mt-0.5">&#9679;</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-muted/50 rounded-lg px-4 py-3">
                    <p className="text-xs text-foreground/50">
                      <strong>Musical Style:</strong> {era.musicalStyle}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 px-4 bg-amber-500/5 border-t border-amber-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">The Story Continues</h2>
          <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
            Every era built upon the last. Every song carried forward the lessons of the one before. 
            The journey of Seabrun Candy Hunter is not just history — it is a living legacy that 
            continues to grow with each new chapter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rrb/the-music">
              <span className="inline-flex items-center px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors cursor-pointer">
                <Music className="mr-2 w-4 h-4" />
                Listen to the Music
              </span>
            </Link>
            <Link href="/rrb/the-legacy">
              <span className="inline-flex items-center px-6 py-3 border border-amber-500 text-amber-500 hover:bg-amber-500/10 rounded-lg font-medium transition-colors cursor-pointer">
                <BookOpen className="mr-2 w-4 h-4" />
                Read the Full Legacy
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-foreground/50">
            Timeline information is compiled from verified records, family accounts, and documented sources. 
            This page is part of the Seabrun Candy Hunter Legacy Archive, presented for historical 
            preservation and educational purposes.
          </p>
        </div>
      </section>
    </div>
  );
}
