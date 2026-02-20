/**
 * Family Tree - The Hunter Family Legacy
 * Visual family tree and genealogical documentation
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Heart, Music, Star, BookOpen, Crown } from 'lucide-react';
import { Link } from 'wouter';

interface FamilyMember {
  name: string;
  role: string;
  description: string;
  connection: string;
  icon: typeof Users;
  color: string;
}

const familyMembers: FamilyMember[] = [
  {
    name: 'Grandma Helen',
    role: 'Matriarch',
    description: 'The foundation of the family. Helen\'s home was where music first took root, where values were instilled, and where the seeds of a legacy were planted. Her faith, resilience, and unconditional love created the environment that made everything possible.',
    connection: 'Grandmother of Seabrun Candy Hunter',
    icon: Crown,
    color: 'rose',
  },
  {
    name: 'Seabrun Candy Hunter',
    role: 'Songwriter, Vocalist & Creative Visionary',
    description: 'The heart of this legacy. A prolific songwriter, gifted vocalist, and creative visionary who shaped the sound of an era. His compositions, performances, and artistic vision left an indelible mark on music history — a mark that this platform exists to restore and preserve.',
    connection: 'Central figure of the Legacy',
    icon: Music,
    color: 'amber',
  },
  {
    name: 'The Children',
    role: 'Legacy Carriers',
    description: 'Seabrun Candy Hunter\'s children carry forward both the musical talent and the determination to see their father\'s legacy properly recognized. They are the driving force behind the restoration effort, combining their father\'s creative spirit with modern tools and platforms.',
    connection: 'Children of Seabrun Candy Hunter',
    icon: Star,
    color: 'blue',
  },
  {
    name: 'C.J. Battle',
    role: 'Legacy Continued — Producer & Visionary',
    description: 'Continuing the family\'s creative legacy through Canryn Production Inc. and the broader ecosystem of platforms that make up RockinRockinBoogie.com. C.J. Battle represents the "Legacy Continued" — taking the foundation built by previous generations and building something that will endure for generations to come.',
    connection: 'Family — Canryn Production Inc.',
    icon: Star,
    color: 'purple',
  },
  {
    name: 'Extended Family',
    role: 'Witnesses & Supporters',
    description: 'The broader family network provides crucial witness testimony, historical context, and ongoing support for the legacy restoration effort. Their memories, stories, and documentation help fill gaps in the official record.',
    connection: 'Extended Hunter Family',
    icon: Users,
    color: 'green',
  },
  {
    name: 'Musical Collaborators',
    role: 'Creative Partners',
    description: 'The musicians, producers, and industry professionals who worked alongside Seabrun Candy Hunter throughout his career. Their testimony and recollections provide independent verification of his contributions and creative role.',
    connection: 'Professional collaborators and witnesses',
    icon: Music,
    color: 'cyan',
  },
];

const familyLegacyPoints = [
  {
    title: 'Generational Talent',
    description: 'Music runs through the Hunter family like a river. From Grandma Helen\'s encouragement to Seabrun\'s mastery to the next generation\'s continuation, each generation has carried the torch forward while adding their own voice to the chorus.',
  },
  {
    title: 'Resilience Through Adversity',
    description: 'The family\'s story is one of resilience. Despite systematic omission of credits, financial hardship, and institutional barriers, the family has persevered in their mission to restore and preserve the legacy.',
  },
  {
    title: 'Unity of Purpose',
    description: 'What sets this family apart is their unity of purpose. The restoration of Seabrun Candy Hunter\'s legacy is not just one person\'s project — it is a family mission that draws on the strengths, memories, and determination of every member.',
  },
  {
    title: 'Legacy as Living Thing',
    description: 'For the Hunter family, legacy is not a museum piece to be preserved under glass. It is a living, breathing thing that grows with each generation. The platforms, music, and community built around RockinRockinBoogie.com are proof that the legacy continues to evolve.',
  },
];

export default function FamilyTree() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-emerald-500/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Users className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Family Tree</h1>
          <p className="text-xl text-foreground/70 mb-2">
            The Roots That Hold the Legacy
          </p>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Behind every great artist is a family. This page honors the people who shaped Seabrun Candy Hunter, 
            carried his legacy forward, and continue to build upon the foundation he laid.
          </p>
        </div>
      </section>

      {/* Family Members */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">The Family</h2>
          <div className="space-y-6">
            {familyMembers.map((member, idx) => {
              const colorMap: Record<string, string> = {
                rose: 'border-rose-500/30 hover:border-rose-500/50',
                amber: 'border-amber-500/30 hover:border-amber-500/50',
                blue: 'border-blue-500/30 hover:border-blue-500/50',
                purple: 'border-purple-500/30 hover:border-purple-500/50',
                green: 'border-green-500/30 hover:border-green-500/50',
                cyan: 'border-cyan-500/30 hover:border-cyan-500/50',
              };
              const iconColorMap: Record<string, string> = {
                rose: 'bg-rose-500/20 text-rose-500',
                amber: 'bg-amber-500/20 text-amber-500',
                blue: 'bg-blue-500/20 text-blue-500',
                purple: 'bg-purple-500/20 text-purple-500',
                green: 'bg-green-500/20 text-green-500',
                cyan: 'bg-cyan-500/20 text-cyan-500',
              };

              return (
                <Card key={`item-${idx}`} className={`transition-colors ${colorMap[member.color] || ''}`}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${iconColorMap[member.color] || ''}`}>
                        <member.icon className="w-7 h-7" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1">{member.name}</CardTitle>
                        <p className="text-sm font-medium text-foreground/60">{member.role}</p>
                        <p className="text-xs text-foreground/40 mt-1">{member.connection}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-foreground/70 leading-relaxed">{member.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Visual Tree Connector */}
      <section className="py-12 px-4 bg-card/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">The Thread That Connects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {familyLegacyPoints.map((point, idx) => (
              <Card key={`item-${idx}`}>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold text-foreground mb-2">{point.title}</h3>
                  <p className="text-foreground/70 leading-relaxed text-sm">{point.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Connection to Other Pages */}
      <section className="py-12 px-4 bg-emerald-500/5 border-t border-emerald-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <Heart className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-foreground mb-4">Roots Run Deep</h2>
          <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
            The family tree is not just names and dates — it is the living network of love, talent, and 
            determination that makes the restoration of this legacy possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rrb/grandma-helen">
              <span className="inline-flex items-center px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors cursor-pointer">
                <Crown className="mr-2 w-4 h-4" />
                Grandma Helen's Story
              </span>
            </Link>
            <Link href="/rrb/the-legacy">
              <span className="inline-flex items-center px-6 py-3 border border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 rounded-lg font-medium transition-colors cursor-pointer">
                <BookOpen className="mr-2 w-4 h-4" />
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
            Family information is shared with the consent and participation of surviving family members. 
            This page is part of the Seabrun Candy Hunter Legacy Archive, presented for historical 
            preservation and educational purposes.
          </p>
        </div>
      </section>
    </div>
  );
}
