/**
 * Family Achievements - Accomplishments Across Generations
 * Documents the achievements of the Hunter family across generations
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Music, Building2, Heart, Zap, Globe, Star, BookOpen } from 'lucide-react';
import { Link } from 'wouter';

const achievements = [
  {
    title: 'Musical Legacy Creation',
    category: 'Creative',
    description: 'Seabrun Candy Hunter created a catalog of compositions spanning multiple genres and decades. His songwriting, vocal performances, and creative direction shaped the sound of an era and influenced countless artists who followed.',
    icon: Music,
    color: 'amber',
  },
  {
    title: 'Canryn Production Inc.',
    category: 'Business',
    description: 'The establishment of Canryn Production Inc. represents the family\'s commitment to building generational wealth through creative enterprise. This company serves as the organizational backbone for the legacy restoration and continuation efforts.',
    icon: Building2,
    color: 'blue',
  },
  {
    title: 'Sweet Miracles Initiative',
    category: 'Community',
    description: 'The Sweet Miracles community impact initiative embodies the family\'s commitment to giving back. Following in Grandma Helen\'s tradition of community service, Sweet Miracles provides grants, support, and resources — "A Voice for the Voiceless."',
    icon: Heart,
    color: 'rose',
  },
  {
    title: 'RockinRockinBoogie.com Platform',
    category: 'Technology',
    description: 'The development of a comprehensive digital platform featuring radio streaming, podcast network, proof vault, and autonomous content management. This platform represents a fusion of legacy preservation and cutting-edge technology.',
    icon: Globe,
    color: 'purple',
  },
  {
    title: 'QUMUS Autonomous System',
    category: 'Innovation',
    description: 'The creation of the QUMUS (Quantum Universal Management & Utility System) autonomous orchestration engine — an AI-powered system managing content scheduling, trending analysis, and platform operations with 90%+ autonomy.',
    icon: Zap,
    color: 'cyan',
  },
  {
    title: 'Legacy Restoration',
    category: 'Justice',
    description: 'The systematic documentation and restoration of Seabrun Candy Hunter\'s songwriting credits, performance recognition, and rightful compensation. This ongoing effort has resulted in corrected registrations with BMI, MLC, SoundExchange, and the U.S. Copyright Office.',
    icon: Award,
    color: 'green',
  },
  {
    title: 'HybridCast Emergency System',
    category: 'Community Safety',
    description: 'Development of the HybridCast emergency broadcast system with offline mesh networking capabilities, ensuring community access to critical communication tools during emergencies.',
    icon: Star,
    color: 'red',
  },
  {
    title: 'Multi-Platform Broadcasting',
    category: 'Media',
    description: 'Establishment of a multi-channel broadcasting network including RRB Legacy Radio, Sweet Miracles Lounge, Drop Radio, C.J. Battle, and Voice of the Voiceless — bringing the family\'s music and message to listeners 24/7.',
    icon: Music,
    color: 'orange',
  },
];

export default function FamilyAchievements() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-amber-500/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Award className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Family Achievements</h1>
          <p className="text-xl text-foreground/70 mb-2">
            Accomplishments Across Generations
          </p>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            From Grandma Helen's kitchen table to a global digital platform, the Hunter family's 
            achievements span music, business, technology, and community service.
          </p>
        </div>
      </section>

      {/* Achievements Grid */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((achievement, idx) => {
              const colorMap: Record<string, string> = {
                amber: 'bg-amber-500/20 text-amber-500',
                blue: 'bg-blue-500/20 text-blue-500',
                rose: 'bg-rose-500/20 text-rose-500',
                purple: 'bg-purple-500/20 text-purple-500',
                cyan: 'bg-cyan-500/20 text-cyan-500',
                green: 'bg-green-500/20 text-green-500',
                red: 'bg-red-500/20 text-red-500',
                orange: 'bg-orange-500/20 text-orange-500',
              };
              const badgeMap: Record<string, string> = {
                amber: 'bg-amber-500/10 text-amber-500',
                blue: 'bg-blue-500/10 text-blue-500',
                rose: 'bg-rose-500/10 text-rose-500',
                purple: 'bg-purple-500/10 text-purple-500',
                cyan: 'bg-cyan-500/10 text-cyan-500',
                green: 'bg-green-500/10 text-green-500',
                red: 'bg-red-500/10 text-red-500',
                orange: 'bg-orange-500/10 text-orange-500',
              };

              return (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorMap[achievement.color] || ''}`}>
                        <achievement.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{achievement.title}</CardTitle>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${badgeMap[achievement.color] || ''}`}>
                          {achievement.category}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/70 leading-relaxed text-sm">{achievement.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="py-12 px-4 bg-card/50">
        <div className="max-w-4xl mx-auto">
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="pt-6 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">Building for Generations</h3>
              <p className="text-foreground/70 leading-relaxed max-w-2xl mx-auto">
                The achievements listed here are not just individual accomplishments — they are building 
                blocks of a generational legacy. Each achievement builds on the one before it, creating 
                a foundation that will support the family and community for generations to come. From 
                music to technology, from community service to business enterprise, the Hunter family 
                continues to grow, create, and give back.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 px-4 bg-amber-500/5 border-t border-amber-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rrb/family-tree">
              <span className="inline-flex items-center px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors cursor-pointer">
                The Family Tree
              </span>
            </Link>
            <Link href="/rrb/the-legacy">
              <span className="inline-flex items-center px-6 py-3 border border-amber-500 text-amber-500 hover:bg-amber-500/10 rounded-lg font-medium transition-colors cursor-pointer">
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
            Achievements documented here are verified through public records, organizational filings, 
            and family documentation. This page is part of the Seabrun Candy Hunter Legacy Archive.
          </p>
        </div>
      </section>
    </div>
  );
}
