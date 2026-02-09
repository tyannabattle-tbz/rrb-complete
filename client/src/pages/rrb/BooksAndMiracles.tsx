/**
 * Books & Miracles - Written Works and Sweet Miracles Initiative
 * Documents written legacy and community impact programs
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Heart, Sparkles, Gift, Users, Star } from 'lucide-react';
import { Link } from 'wouter';

const writtenWorks = [
  {
    title: 'The Legacy Restored',
    type: 'Documentary Narrative',
    description: 'The comprehensive account of Seabrun Candy Hunter\'s life, career, and the systematic omission of his contributions. This work serves as both biography and investigation — documenting not just what happened, but why it matters.',
    status: 'In Development',
  },
  {
    title: 'Songs Unsung',
    type: 'Songwriting Archive',
    description: 'A collection of lyrics, compositions, and musical notes from Seabrun Candy Hunter\'s catalog. This archive preserves the written form of his musical genius — the words and melodies that became the songs the world heard.',
    status: 'Archival Collection',
  },
  {
    title: 'A Voice for the Voiceless',
    type: 'Community Impact Story',
    description: 'The story of Sweet Miracles and its mission to provide community support, grants, and resources. From its roots in Grandma Helen\'s kitchen-table generosity to its formalization as a community impact initiative.',
    status: 'In Development',
  },
];

const sweetMiraclesPrograms = [
  {
    title: 'Community Grants',
    description: 'Financial support for individuals and families in need, continuing the tradition of community care that Grandma Helen practiced throughout her life.',
    icon: Gift,
    impact: 'Direct financial assistance to community members',
  },
  {
    title: 'Artist Support',
    description: 'Resources and mentorship for emerging artists, ensuring that the next generation of creators has the support that was denied to so many in the past.',
    icon: Star,
    impact: 'Mentorship and resources for emerging musicians',
  },
  {
    title: 'Crisis Response',
    description: 'Emergency support during times of crisis, providing essential tools, communication, and resources when communities need them most — embodying the motto "A Voice for the Voiceless."',
    icon: Heart,
    impact: 'Emergency assistance and communication tools',
  },
  {
    title: 'Legacy Preservation',
    description: 'Programs dedicated to preserving the cultural and musical heritage of underrepresented communities, ensuring that stories like Seabrun Candy Hunter\'s are documented and shared.',
    icon: BookOpen,
    impact: 'Cultural preservation and documentation',
  },
];

export default function BooksAndMiracles() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-fuchsia-500/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <BookOpen className="w-12 h-12 text-fuchsia-500" />
            <span className="text-4xl">&</span>
            <Sparkles className="w-12 h-12 text-fuchsia-500" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Books & Miracles</h1>
          <p className="text-xl text-foreground/70 mb-2">
            Written Legacy & Community Impact
          </p>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            The story of Seabrun Candy Hunter lives not only in music but in words — and the miracles 
            that happen when a community comes together to support its own.
          </p>
        </div>
      </section>

      {/* Written Works */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Written Works</h2>
          <div className="space-y-6">
            {writtenWorks.map((work, idx) => (
              <Card key={idx} className="hover:border-fuchsia-500/30 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-1">{work.title}</CardTitle>
                      <p className="text-sm text-foreground/50">{work.type}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-fuchsia-500/20 text-fuchsia-500">
                      {work.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70 leading-relaxed">{work.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sweet Miracles */}
      <section className="py-12 px-4 bg-card/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Heart className="w-12 h-12 text-fuchsia-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-2">Sweet Miracles</h2>
            <p className="text-lg text-foreground/60 max-w-xl mx-auto">
              "A Voice for the Voiceless" — Community support and impact programs 
              continuing the family tradition of service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sweetMiraclesPrograms.map((program, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
                      <program.icon className="w-5 h-5 text-fuchsia-500" />
                    </div>
                    <CardTitle className="text-lg">{program.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70 leading-relaxed text-sm mb-3">{program.description}</p>
                  <div className="bg-fuchsia-500/5 rounded-lg px-3 py-2">
                    <p className="text-xs text-fuchsia-500 font-medium">{program.impact}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-fuchsia-500/20 bg-fuchsia-500/5">
            <CardContent className="pt-6 text-center">
              <Users className="w-12 h-12 text-fuchsia-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-4">The Mission Continues</h3>
              <p className="text-foreground/70 leading-relaxed max-w-2xl mx-auto mb-4">
                Sweet Miracles exists to create generational wealth through Canryn Production and community 
                funding. It is structured for perpetual operation — providing the community with access to 
                essential tools during crises, enabling them to produce their own media, broadcast as they 
                choose, and access information and communication.
              </p>
              <p className="text-foreground/60 italic">
                "A Voice for the Voiceless"
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 px-4 bg-fuchsia-500/5 border-t border-fuchsia-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rrb/canryn-production">
              <span className="inline-flex items-center px-6 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-lg font-medium transition-colors cursor-pointer">
                Canryn Production Inc.
              </span>
            </Link>
            <Link href="/rrb/the-legacy">
              <span className="inline-flex items-center px-6 py-3 border border-fuchsia-500 text-fuchsia-500 hover:bg-fuchsia-500/10 rounded-lg font-medium transition-colors cursor-pointer">
                The Full Legacy
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-foreground/50">
            Written works listed are in various stages of development. Sweet Miracles programs are 
            managed through Canryn Production Inc. For inquiries about community programs or written 
            works, please use the Contact page.
          </p>
        </div>
      </section>
    </div>
  );
}
