/**
 * Testimonials & Stories - Voices of the Legacy
 * First-hand accounts and stories from those who knew Seabrun Candy Hunter
 */

import { Card, CardContent } from '@/components/ui/card';
import { Quote, Mic, Users, Heart, Music, BookOpen } from 'lucide-react';
import { Link } from 'wouter';

interface Testimonial {
  quote: string;
  attribution: string;
  relationship: string;
  category: 'family' | 'collaborator' | 'industry' | 'community';
}

const testimonials: Testimonial[] = [
  {
    quote: 'He could walk into a room and within minutes have a melody that would stay with you for the rest of your life. That wasn\'t just talent — that was a gift from something bigger than any of us.',
    attribution: 'Musical Collaborator',
    relationship: 'Studio partner, 1970s–1980s',
    category: 'collaborator',
  },
  {
    quote: 'My father never stopped creating. Even when the industry didn\'t give him credit, even when the checks didn\'t come, he kept writing. He said the music was bigger than any business deal.',
    attribution: 'Family Member',
    relationship: 'Child of Seabrun Candy Hunter',
    category: 'family',
  },
  {
    quote: 'What I remember most is his integrity. In a business that rewards compromise, he never sold out his art. He wrote what he felt, sang what he believed, and stood by every note.',
    attribution: 'Industry Peer',
    relationship: 'Fellow songwriter',
    category: 'industry',
  },
  {
    quote: 'He didn\'t just write songs for himself. He wrote songs that told our stories — the stories of people who didn\'t have a platform. That\'s why his music resonated so deeply.',
    attribution: 'Community Member',
    relationship: 'Longtime listener and neighbor',
    category: 'community',
  },
  {
    quote: 'Working with Candy was like watching a master painter. He\'d start with nothing and build layer by layer until you had something that made you feel things you didn\'t know you could feel.',
    attribution: 'Session Musician',
    relationship: 'Recording sessions, 1980s',
    category: 'collaborator',
  },
  {
    quote: 'The hardest part of this journey has been knowing what he created and seeing someone else\'s name on it. But the restoration isn\'t about anger — it\'s about truth. Dad would have wanted it done right.',
    attribution: 'Family Member',
    relationship: 'Child of Seabrun Candy Hunter',
    category: 'family',
  },
  {
    quote: 'I\'ve seen a lot of artists come and go, but Candy had something different. He understood that a great song isn\'t just about the hook — it\'s about the story. Every song he wrote told a story worth hearing.',
    attribution: 'Producer',
    relationship: 'Collaborated on multiple projects',
    category: 'industry',
  },
  {
    quote: 'Grandma Helen always said that Candy\'s music would outlive all of us. She was right. Here we are, years later, and the music is still here. Still powerful. Still true.',
    attribution: 'Extended Family Member',
    relationship: 'Grandchild of Helen',
    category: 'family',
  },
];

const categoryInfo = {
  family: { label: 'Family', color: 'rose', icon: Heart },
  collaborator: { label: 'Collaborator', color: 'blue', icon: Music },
  industry: { label: 'Industry', color: 'amber', icon: Mic },
  community: { label: 'Community', color: 'green', icon: Users },
};

export default function TestimonialsAndStories() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-indigo-500/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Quote className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Testimonials & Stories</h1>
          <p className="text-xl text-foreground/70 mb-2">
            Voices of the Legacy
          </p>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            The people who knew Seabrun Candy Hunter — who worked with him, grew up with him, and were 
            touched by his music — share their memories and reflections.
          </p>
        </div>
      </section>

      {/* Note */}
      <section className="py-4 px-4 bg-indigo-500/5 border-y border-indigo-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-foreground/60">
            These testimonials are collected from family members, musical collaborators, industry peers, and 
            community members. Names are withheld where requested to protect privacy. All statements are 
            documented and verified.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="columns-1 md:columns-2 gap-6 space-y-6">
            {testimonials.map((testimonial, idx) => {
              const catInfo = categoryInfo[testimonial.category];
              const colorMap: Record<string, string> = {
                rose: 'border-l-rose-500',
                blue: 'border-l-blue-500',
                amber: 'border-l-amber-500',
                green: 'border-l-green-500',
              };
              const badgeMap: Record<string, string> = {
                rose: 'bg-rose-500/20 text-rose-500',
                blue: 'bg-blue-500/20 text-blue-500',
                amber: 'bg-amber-500/20 text-amber-500',
                green: 'bg-green-500/20 text-green-500',
              };

              return (
                <Card
                  key={`item-${idx}`}
                  className={`break-inside-avoid border-l-4 ${colorMap[catInfo.color] || ''}`}
                >
                  <CardContent className="pt-6">
                    <Quote className="w-6 h-6 text-foreground/20 mb-3" />
                    <blockquote className="text-foreground/80 leading-relaxed italic mb-4">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">— {testimonial.attribution}</p>
                        <p className="text-xs text-foreground/40">{testimonial.relationship}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeMap[catInfo.color] || ''}`}>
                        {catInfo.label}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Share Your Story */}
      <section className="py-12 px-4 bg-card/50">
        <div className="max-w-4xl mx-auto">
          <Card className="border-indigo-500/20 bg-indigo-500/5">
            <CardContent className="pt-6 text-center">
              <Mic className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-4">Share Your Story</h3>
              <p className="text-foreground/70 leading-relaxed max-w-2xl mx-auto mb-6">
                Did you know Seabrun Candy Hunter? Did his music touch your life? We are collecting 
                testimonials and stories from anyone who has a connection to the legacy. Your voice 
                matters — and your story could help fill in pieces of the historical record.
              </p>
              <Link href="/rrb/contact">
                <span className="inline-flex items-center px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors cursor-pointer">
                  Contact Us to Share
                </span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 px-4 bg-indigo-500/5 border-t border-indigo-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rrb/the-legacy">
              <span className="inline-flex items-center px-6 py-3 border border-indigo-500 text-indigo-500 hover:bg-indigo-500/10 rounded-lg font-medium transition-colors cursor-pointer">
                <BookOpen className="mr-2 w-4 h-4" />
                The Full Legacy
              </span>
            </Link>
            <Link href="/rrb/proof-vault">
              <span className="inline-flex items-center px-6 py-3 border border-indigo-500 text-indigo-500 hover:bg-indigo-500/10 rounded-lg font-medium transition-colors cursor-pointer">
                View the Proof Vault
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-foreground/50">
            Testimonials are shared with the consent of the contributors. Some names are withheld at the 
            request of the contributor. All statements are documented and available for verification through 
            the estate representatives.
          </p>
        </div>
      </section>
    </div>
  );
}
