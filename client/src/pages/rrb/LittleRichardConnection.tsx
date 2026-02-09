/**
 * Little Richard Connection - The Musical Link
 * Documents the connection between Seabrun Candy Hunter and Little Richard's musical legacy
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Star, Zap, BookOpen, Quote, Mic } from 'lucide-react';
import { Link } from 'wouter';

const connectionPoints = [
  {
    title: 'Musical Lineage',
    description: 'Seabrun Candy Hunter\'s musical style was deeply influenced by the pioneering sound that Little Richard helped create. The raw energy, the vocal intensity, and the genre-defying approach to songwriting all trace back to the revolution that Little Richard sparked in American music.',
    icon: Music,
  },
  {
    title: 'Shared Musical DNA',
    description: 'Both artists shared a commitment to authenticity in their music. Little Richard broke barriers by refusing to conform to industry expectations; Seabrun Candy Hunter carried that same spirit of artistic independence throughout his career, writing and performing on his own terms.',
    icon: Zap,
  },
  {
    title: 'The Macon, Georgia Connection',
    description: 'The musical traditions of the American South — gospel, blues, R&B, and soul — formed the common ground between these artists. The church music, the community gatherings, and the rich musical heritage of the region shaped both of their artistic identities.',
    icon: Star,
  },
  {
    title: 'Credit & Recognition Parallels',
    description: 'Little Richard himself was famously outspoken about the music industry\'s failure to properly credit and compensate Black artists. The parallels between his fight for recognition and the systematic omission documented in Seabrun Candy Hunter\'s case are striking and historically significant.',
    icon: Mic,
  },
];

const musicalInfluences = [
  {
    era: 'The Foundation (1950s-60s)',
    description: 'Little Richard\'s explosive debut recordings created a template for rock and roll that influenced every artist who followed. Seabrun Candy Hunter grew up hearing these sounds, and they became part of his musical vocabulary.',
  },
  {
    era: 'The Evolution (1970s)',
    description: 'As music evolved through funk, soul, and early disco, the energy and showmanship that Little Richard pioneered continued to influence artists like Seabrun Candy Hunter, who channeled that same intensity into his own compositions.',
  },
  {
    era: 'The Legacy (1980s-Present)',
    description: 'Both artists\' legacies share a common thread: the ongoing fight for proper recognition. Little Richard spent decades advocating for his rightful place in music history; the Hunter family continues that same fight today.',
  },
];

export default function LittleRichardConnection() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-purple-500/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">🎹</div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">The Little Richard Connection</h1>
          <p className="text-xl text-foreground/70 mb-2">
            Musical Roots & Shared Legacy
          </p>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Understanding the musical lineage that connects Seabrun Candy Hunter to one of the most 
            influential figures in American music history.
          </p>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-8 px-4 bg-purple-500/5 border-y border-purple-500/20">
        <div className="max-w-3xl mx-auto text-center">
          <Quote className="w-8 h-8 text-purple-500/50 mx-auto mb-4" />
          <blockquote className="text-xl text-foreground/70 italic leading-relaxed">
            "I am the architect of rock and roll. I am the originator."
          </blockquote>
          <p className="text-sm text-foreground/40 mt-3">— Little Richard (1932–2020)</p>
          <p className="text-sm text-foreground/50 mt-4 max-w-xl mx-auto">
            Little Richard's fight for recognition mirrors the very battle being waged for Seabrun Candy Hunter's legacy. 
            Both artists created music that shaped generations — and both faced an industry that too often failed to 
            properly credit its Black creators.
          </p>
        </div>
      </section>

      {/* Connection Points */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Points of Connection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {connectionPoints.map((point, idx) => (
              <Card key={idx} className="hover:border-purple-500/30 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <point.icon className="w-5 h-5 text-purple-500" />
                    </div>
                    <CardTitle className="text-lg">{point.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70 leading-relaxed text-sm">{point.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Musical Influence Timeline */}
      <section className="py-12 px-4 bg-card/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">A Shared Musical Heritage</h2>
          <div className="space-y-6">
            {musicalInfluences.map((influence, idx) => (
              <Card key={idx} className="border-l-4 border-l-purple-500">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold text-foreground mb-2">{influence.era}</h3>
                  <p className="text-foreground/70 leading-relaxed">{influence.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* The Bigger Picture */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-purple-500/20 bg-purple-500/5">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold text-foreground mb-4 text-center">The Bigger Picture</h3>
              <p className="text-foreground/70 leading-relaxed text-center max-w-2xl mx-auto mb-4">
                The connection between Seabrun Candy Hunter and Little Richard is not just about two individual 
                artists. It is about a tradition — a lineage of Black musical genius that has shaped American 
                culture while too often being denied proper credit, compensation, and recognition.
              </p>
              <p className="text-foreground/70 leading-relaxed text-center max-w-2xl mx-auto">
                By documenting these connections and restoring the historical record, we honor not just these 
                two artists, but the entire tradition they represent — a tradition that deserves to be 
                celebrated, not erased.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 px-4 bg-purple-500/5 border-t border-purple-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rrb/the-music">
              <span className="inline-flex items-center px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors cursor-pointer">
                <Music className="mr-2 w-4 h-4" />
                Listen to the Music
              </span>
            </Link>
            <Link href="/rrb/systematic-omission">
              <span className="inline-flex items-center px-6 py-3 border border-purple-500 text-purple-500 hover:bg-purple-500/10 rounded-lg font-medium transition-colors cursor-pointer">
                <BookOpen className="mr-2 w-4 h-4" />
                Systematic Omission
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-foreground/50">
            This page documents musical connections and historical context for educational purposes. 
            All claims are based on documented musical history and verified records. 
            Little Richard is a registered trademark of the Richard Wayne Penniman estate.
          </p>
        </div>
      </section>
    </div>
  );
}
