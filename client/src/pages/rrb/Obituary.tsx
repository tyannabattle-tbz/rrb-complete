/**
 * Obituary - In Memoriam: Seabrun Candy Hunter
 * A dignified memorial page honoring his life and contributions
 */

import { Card, CardContent } from '@/components/ui/card';
import { Heart, Music, Star, BookOpen, Flower2 } from 'lucide-react';
import { Link } from 'wouter';

const legacyHighlights = [
  'Prolific songwriter whose compositions spanned multiple genres and decades',
  'Gifted vocalist with a distinctive voice that defined an era of music',
  'Creative visionary who mentored emerging artists and shaped careers',
  'Dedicated family man whose love and values live on through his children',
  'Entrepreneur who understood both the art and business of music',
  'Community pillar whose generosity and spirit touched countless lives',
];

const tributes = [
  {
    text: 'His music was more than sound — it was a conversation with the soul. Every note he wrote carried the weight of experience and the lightness of joy.',
    attribution: 'Family Statement',
  },
  {
    text: 'He didn\'t just write songs. He built worlds with words and melody. Working with him was like watching someone paint with sound.',
    attribution: 'Musical Collaborator',
  },
  {
    text: 'What I remember most is his integrity. In an industry that often rewards compromise, he never wavered from his artistic vision or his principles.',
    attribution: 'Industry Peer',
  },
];

export default function Obituary() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Somber, dignified */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-foreground/5 to-background">
        <div className="max-w-3xl mx-auto text-center">
          <Flower2 className="w-12 h-12 text-foreground/30 mx-auto mb-8" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">In Memoriam</h1>
          <div className="w-24 h-0.5 bg-foreground/20 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Seabrun Candy Hunter
          </h2>
          <p className="text-xl text-foreground/60 mb-2">
            Songwriter &middot; Vocalist &middot; Lyricist &middot; Creative Visionary
          </p>
          <p className="text-lg text-foreground/40 italic mt-6">
            "The music lives on."
          </p>
        </div>
      </section>

      {/* Memorial Text */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="border-foreground/10">
            <CardContent className="pt-8 pb-8">
              <div className="prose prose-invert max-w-none space-y-5">
                <p className="text-foreground/80 leading-relaxed text-lg">
                  Seabrun Candy Hunter lived a life defined by music, family, and an unwavering commitment to 
                  creative excellence. As a songwriter, he crafted compositions that moved audiences and shaped 
                  the sound of his era. As a vocalist, he possessed a voice that could convey the full range of 
                  human emotion — from the deepest sorrow to the highest joy. As a creative visionary, he saw 
                  possibilities where others saw limitations.
                </p>
                <p className="text-foreground/80 leading-relaxed text-lg">
                  Born into a family with deep musical roots, Seabrun was encouraged from an early age to pursue 
                  his gifts. Under the loving guidance of his grandmother Helen and surrounded by a family that 
                  valued both faith and creativity, he developed the artistic sensibility that would define his 
                  career. Music was not just what he did — it was who he was.
                </p>
                <p className="text-foreground/80 leading-relaxed text-lg">
                  Throughout his career, Seabrun collaborated with some of the most respected names in music. 
                  His compositions were recorded, performed, and celebrated — though not always under his name. 
                  Despite the challenges he faced in receiving proper credit and recognition, he never stopped 
                  creating, never stopped believing in the power of his art, and never compromised on the quality 
                  of his work.
                </p>
                <p className="text-foreground/80 leading-relaxed text-lg">
                  Beyond the studio and the stage, Seabrun was a devoted family man. He passed on his love of 
                  music, his values of integrity and perseverance, and his vision of a legacy that would endure 
                  beyond any single lifetime. His children carry forward not just his talent, but his spirit — 
                  the determination to see things through, the refusal to accept injustice quietly, and the 
                  belief that music can change the world.
                </p>
                <p className="text-foreground/80 leading-relaxed text-lg">
                  Seabrun Candy Hunter's passing left a void that cannot be filled — but his music, his values, 
                  and his vision continue to resonate. Through the work of his family and the platforms they have 
                  built, his legacy is being restored, preserved, and shared with new generations who will come 
                  to know the man behind the music.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Legacy Highlights */}
      <section className="py-12 px-4 bg-card/50">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">A Life of Achievement</h3>
          <div className="space-y-3">
            {legacyHighlights.map((highlight, idx) => (
              <div key={`item-${idx}`} className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                <Star className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-foreground/70">{highlight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tributes */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Words of Remembrance</h3>
          <div className="space-y-6">
            {tributes.map((tribute, idx) => (
              <Card key={`item-${idx}`} className="border-foreground/10">
                <CardContent className="pt-6">
                  <blockquote className="text-foreground/70 leading-relaxed italic text-lg mb-3">
                    "{tribute.text}"
                  </blockquote>
                  <p className="text-sm text-foreground/40 text-right">— {tribute.attribution}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* The Legacy Lives On */}
      <section className="py-16 px-4 bg-gradient-to-b from-background to-foreground/5">
        <div className="max-w-3xl mx-auto text-center">
          <Music className="w-10 h-10 text-foreground/30 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-foreground mb-4">The Legacy Lives On</h3>
          <p className="text-foreground/60 leading-relaxed mb-8 max-w-xl mx-auto">
            Though Seabrun Candy Hunter is no longer with us in body, his music, his spirit, and his 
            vision continue through the work of his family and the community they have built. 
            This website stands as a testament to a life well-lived and a legacy that will not be forgotten.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rrb/the-legacy">
              <span className="inline-flex items-center px-6 py-3 bg-foreground/10 hover:bg-foreground/20 text-foreground rounded-lg font-medium transition-colors cursor-pointer">
                <BookOpen className="mr-2 w-4 h-4" />
                Read the Full Legacy
              </span>
            </Link>
            <Link href="/rrb/the-music">
              <span className="inline-flex items-center px-6 py-3 bg-foreground/10 hover:bg-foreground/20 text-foreground rounded-lg font-medium transition-colors cursor-pointer">
                <Music className="mr-2 w-4 h-4" />
                Listen to the Music
              </span>
            </Link>
            <Link href="/rrb/family-tree">
              <span className="inline-flex items-center px-6 py-3 bg-foreground/10 hover:bg-foreground/20 text-foreground rounded-lg font-medium transition-colors cursor-pointer">
                <Heart className="mr-2 w-4 h-4" />
                The Family
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-foreground/40">
            This memorial page is part of the Seabrun Candy Hunter Legacy Archive. Content is shared 
            with the consent and participation of the family. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
}
