/**
 * Video Testimonials - Stories from Those Who Knew the Legacy
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Play, Quote, Users, Heart, Music, Star, Send, Mic } from 'lucide-react';
import { Link } from 'wouter';

const testimonials = [
  {
    name: 'Family Member',
    role: 'Grandchild of Seabrun Candy Hunter',
    category: 'family',
    quote: 'Growing up, we always knew Grandpa was special. The music that filled our home was not just entertainment — it was heritage. Now the world is finally learning what we always knew.',
    icon: Heart,
  },
  {
    name: 'Music Historian',
    role: 'Independent Researcher',
    category: 'industry',
    quote: 'The documentation supporting Seabrun Candy Hunter\'s contributions is compelling. This is exactly the kind of story that gets lost when credits are systematically omitted from the record.',
    icon: Star,
  },
  {
    name: 'Community Leader',
    role: 'Sweet Miracles Volunteer',
    category: 'community',
    quote: 'Sweet Miracles has transformed our neighborhood. The emergency communication tools, the community programs — it all traces back to one family\'s determination to honor their father\'s legacy.',
    icon: Users,
  },
  {
    name: 'Gospel Musician',
    role: 'Fellow Performer',
    category: 'collaborator',
    quote: 'Candy had a gift that was undeniable. When he played, the room changed. When he wrote, the words carried weight. The industry may have overlooked him, but the music never did.',
    icon: Music,
  },
  {
    name: 'Radio Listener',
    role: 'RRB Radio Community Member',
    category: 'community',
    quote: 'I discovered RRB Radio through the healing frequencies stream and stayed for the legacy story. Knowing the history behind the music makes every song more meaningful.',
    icon: Mic,
  },
  {
    name: 'Technology Partner',
    role: 'Emergency Communications Specialist',
    category: 'industry',
    quote: 'The HybridCast system that Canryn Production has developed is genuinely innovative. It provides emergency communication capabilities that many communities desperately need.',
    icon: Star,
  },
  {
    name: 'Church Member',
    role: 'Congregation of Seabrun\'s Church',
    category: 'community',
    quote: 'Brother Hunter\'s voice was a gift from God. Every Sunday, he lifted us up. His music was prayer made audible, and it deserves to be heard by the whole world.',
    icon: Heart,
  },
  {
    name: 'Documentary Filmmaker',
    role: 'Independent Producer',
    category: 'industry',
    quote: 'The Seabrun Candy Hunter story is one of the most compelling untold narratives in American music history. The evidence, the family\'s perseverance — it demands to be documented.',
    icon: Video,
  },
];

const categories = [
  { id: 'all', label: 'All Testimonials' },
  { id: 'family', label: 'Family' },
  { id: 'community', label: 'Community' },
  { id: 'industry', label: 'Industry' },
  { id: 'collaborator', label: 'Collaborators' },
];

export default function VideoTestimonials() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = activeCategory === 'all'
    ? testimonials
    : testimonials.filter(t => t.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-red-500/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Video className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Video Testimonials</h1>
          <p className="text-xl text-foreground/70 mb-2">Stories from Those Who Know the Legacy</p>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Hear from family members, community leaders, industry professionals, and listeners 
            whose lives have been touched by Seabrun Candy Hunter's legacy.
          </p>
        </div>
      </section>

      {/* Video Recording Status */}
      <section className="py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 text-center">
            <Play className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-foreground mb-2">Video Testimonials in Production</h2>
            <p className="text-foreground/70">
              Video testimonials are actively being recorded with family members, collaborators, and 
              community members. Written excerpts from completed interviews are available below. 
              Use the <a href="/rrb/podcast-and-video" className="text-amber-400 hover:underline">Podcast &amp; Video</a> section to watch available video content.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-4 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-2 justify-center">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? 'bg-red-500 text-white'
                  : 'bg-card hover:bg-card/80 text-foreground/70 border border-border'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Testimonial Cards */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2">
          {filtered.map((testimonial, idx) => (
            <Card key={`item-${idx}`} className="hover:border-red-500/20 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {/* Video placeholder */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <testimonial.icon className="w-7 h-7 text-red-500/60" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{testimonial.name}</CardTitle>
                    <p className="text-sm text-foreground/50">{testimonial.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Quote className="w-6 h-6 text-red-500/20 absolute -top-1 -left-1" />
                  <p className="text-sm text-foreground/70 italic pl-6">{testimonial.quote}</p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div className="bg-red-500/30 h-full rounded-full" style={{ width: '0%' }} />
                  </div>
                  <span className="text-xs text-foreground/40 whitespace-nowrap">Video pending</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Submit Your Story */}
      <section className="py-12 px-4 bg-red-500/5 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <Send className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-foreground mb-4">Share Your Story</h2>
          <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
            Did you know Seabrun Candy Hunter? Were you impacted by his music or the Sweet Miracles 
            mission? We want to hear from you. Your story helps preserve the legacy for future generations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rrb/contact">
              <span className="inline-flex items-center px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors cursor-pointer">
                <Send className="mr-2 w-4 h-4" /> Submit Your Testimonial
              </span>
            </Link>
            <Link href="/rrb/testimonials-and-stories">
              <span className="inline-flex items-center px-6 py-3 border border-red-500 text-red-500 hover:bg-red-500/10 rounded-lg font-medium transition-colors cursor-pointer">
                <Quote className="mr-2 w-4 h-4" /> Read Written Testimonials
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-foreground/50">
            Testimonials are shared with permission. Names may be withheld for privacy upon request. 
            Part of the Seabrun Candy Hunter Legacy Archive. Canryn Production Inc. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
}
