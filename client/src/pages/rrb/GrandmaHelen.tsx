/**
 * Grandma Helen - Family History & Matriarch of the Legacy
 * Celebrates the family foundation that shaped Seabrun Candy Hunter
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, Home, Star, BookOpen } from 'lucide-react';
import { Link } from 'wouter';

const familyValues = [
  {
    title: 'Faith & Resilience',
    description: 'Helen instilled a deep sense of faith and resilience in her family. Through every hardship, she taught her children and grandchildren that perseverance and belief in something greater would carry them through.',
    icon: Star,
  },
  {
    title: 'Music as Heritage',
    description: 'Music was never just entertainment in Helen\'s household — it was heritage. She encouraged every child to find their voice, whether through singing, playing instruments, or simply appreciating the power of a well-crafted song.',
    icon: BookOpen,
  },
  {
    title: 'Family Unity',
    description: 'Helen believed that family was the foundation of everything. She kept her family connected through gatherings, traditions, and an unwavering commitment to being there for one another, no matter the circumstances.',
    icon: Users,
  },
  {
    title: 'Community Service',
    description: 'Long before "Sweet Miracles" became a formal organization, Helen practiced its principles — feeding neighbors, caring for the sick, and ensuring no one in her community went without help when she could provide it.',
    icon: Heart,
  },
];

const familyMemories = [
  {
    title: 'The Kitchen Table',
    text: 'Helen\'s kitchen table was where decisions were made, songs were first hummed, and family bonds were strengthened. It was around that table that Seabrun Candy Hunter first shared his musical ideas with his family, receiving the encouragement that would fuel a lifetime of creativity.',
  },
  {
    title: 'Sunday Gatherings',
    text: 'Every Sunday, Helen\'s home became a gathering place. Family members from across the community would come together for food, fellowship, and music. These gatherings were the incubator for the musical traditions that Seabrun would carry forward into his professional career.',
  },
  {
    title: 'Lessons in Dignity',
    text: 'Helen taught her family to carry themselves with dignity regardless of circumstances. She believed that how you treated people and how you presented yourself to the world mattered more than material wealth. This lesson shaped Seabrun\'s approach to both his art and his business dealings.',
  },
  {
    title: 'A Legacy of Love',
    text: 'Above all, Helen\'s legacy is one of unconditional love. She created a safe space where creativity could flourish, where dreams were nurtured rather than dismissed, and where every family member knew they had a champion in their corner.',
  },
];

export default function GrandmaHelen() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-rose-500/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">👵</div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Grandma Helen</h1>
          <p className="text-xl text-foreground/70 mb-2">
            The Matriarch Who Built the Foundation
          </p>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Behind every great legacy stands a family, and behind this family stood Helen — a woman whose love, 
            wisdom, and unwavering faith created the foundation upon which Seabrun Candy Hunter built his life's work.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-rose-500/20">
            <CardContent className="pt-6">
              <div className="prose prose-invert max-w-none">
                <p className="text-foreground/80 leading-relaxed text-lg mb-4">
                  Helen was more than a grandmother — she was the cornerstone of a family that would produce one of 
                  music's most underrecognized creative forces. Her home was the first stage, her encouragement was 
                  the first applause, and her values became the guiding principles that Seabrun Candy Hunter carried 
                  throughout his entire career.
                </p>
                <p className="text-foreground/80 leading-relaxed text-lg mb-4">
                  In an era when opportunities were scarce and obstacles were abundant, Helen created an environment 
                  where her family could dream beyond their circumstances. She understood that music was not just a 
                  talent to be developed — it was a gift to be shared, a legacy to be preserved, and a bridge to a 
                  better future.
                </p>
                <p className="text-foreground/80 leading-relaxed text-lg">
                  The story of Seabrun Candy Hunter cannot be told without first understanding the woman who planted 
                  the seeds. This page honors Helen's contribution to the legacy — not as a footnote, but as the 
                  opening chapter of a story that continues to unfold.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Family Values */}
      <section className="py-12 px-4 bg-card/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Values She Instilled</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {familyValues.map((value, idx) => (
              <Card key={idx} className="hover:border-rose-500/30 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                      <value.icon className="w-5 h-5 text-rose-500" />
                    </div>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Family Memories */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Family Memories</h2>
          <div className="space-y-6">
            {familyMemories.map((memory, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold text-foreground mb-3">{memory.title}</h3>
                  <p className="text-foreground/70 leading-relaxed">{memory.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Connection to Legacy */}
      <section className="py-12 px-4 bg-gradient-to-b from-rose-500/5 to-background">
        <div className="max-w-4xl mx-auto">
          <Card className="border-rose-500/20 bg-rose-500/5">
            <CardContent className="pt-6 text-center">
              <Home className="w-12 h-12 text-rose-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-4">From Her Home to the World</h3>
              <p className="text-foreground/70 leading-relaxed max-w-2xl mx-auto mb-6">
                The music that Seabrun Candy Hunter brought to the world was first nurtured in Helen's home. 
                Every song carries echoes of her encouragement, every lyric reflects the values she taught, 
                and every performance honors the foundation she built. The legacy continues because she made 
                sure it had roots deep enough to endure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/rrb/family-tree">
                  <span className="inline-flex items-center px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium transition-colors cursor-pointer">
                    <Users className="mr-2 w-4 h-4" />
                    View Family Tree
                  </span>
                </Link>
                <Link href="/rrb/the-legacy">
                  <span className="inline-flex items-center px-6 py-3 border border-rose-500 text-rose-500 hover:bg-rose-500/10 rounded-lg font-medium transition-colors cursor-pointer">
                    <BookOpen className="mr-2 w-4 h-4" />
                    Read the Full Legacy
                  </span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-foreground/50">
            This page is part of the Seabrun Candy Hunter Legacy Archive. All content is presented for 
            historical preservation and educational purposes. Family stories are shared with the consent 
            and participation of surviving family members.
          </p>
        </div>
      </section>
    </div>
  );
}
