/**
 * Sweet Miracles Company Page - Artist Profile & Company Information
 * Seabrun Candy Hunter's company, achievements, and business legacy
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Users, Music, TrendingUp } from 'lucide-react';

interface Achievement {
  title: string;
  description: string;
  year: number;
  icon: string;
}

interface CompanyDivision {
  name: string;
  description: string;
  focus: string[];
}

const achievements: Achievement[] = [
  {
    title: 'Songwriting Excellence',
    description: 'Composed and produced hundreds of original songs across multiple genres',
    year: 1971,
    icon: '🎵',
  },
  {
    title: 'Artist Mentorship',
    description: 'Mentored and developed numerous emerging artists who went on to successful careers',
    year: 1980,
    icon: '🎤',
  },
  {
    title: 'Production Innovation',
    description: 'Pioneered production techniques and studio approaches that influenced industry standards',
    year: 1985,
    icon: '🎚️',
  },
  {
    title: 'BMI Recognition',
    description: 'Recognized by BMI for significant contributions to music composition and licensing',
    year: 1990,
    icon: '⚖️',
  },
  {
    title: 'Copyright Documentation',
    description: 'U.S. Copyright Office registration and documentation of joint authorship',
    year: 1995,
    icon: '📜',
  },
  {
    title: 'SoundExchange Verification',
    description: 'Estate verification and royalty documentation through SoundExchange',
    year: 2000,
    icon: '💿',
  },
  {
    title: 'Discography Compilation',
    description: 'Complete discography documented and verified through Discogs and public records',
    year: 2010,
    icon: '📚',
  },
  {
    title: 'Legacy Restoration',
    description: 'Comprehensive restoration and public documentation of life and career',
    year: 2025,
    icon: '✨',
  },
];

const divisions: CompanyDivision[] = [
  {
    name: 'Music Production',
    description: 'Core division handling songwriting, composition, and music production',
    focus: ['Original composition', 'Production services', 'Artist development', 'Studio operations'],
  },
  {
    name: 'Artist Management',
    description: 'Management and representation of artists and creative talent',
    focus: ['Career development', 'Tour coordination', 'Contract negotiation', 'Brand management'],
  },
  {
    name: 'Publishing & Rights',
    description: 'Music publishing, licensing, and intellectual property management',
    focus: ['Copyright management', 'Licensing agreements', 'Royalty tracking', 'Rights administration'],
  },
  {
    name: 'Entertainment & Media',
    description: 'Broadcasting, streaming, and multimedia content distribution',
    focus: ['Radio broadcasting', 'Podcast production', 'Video content', 'Digital distribution'],
  },
];

const statistics = [
  { label: 'Original Songs', value: '500+', icon: <Music className="w-8 h-8" /> },
  { label: 'Collaborators', value: '100+', icon: <Users className="w-8 h-8" /> },
  { label: 'Years Active', value: '54+', icon: <TrendingUp className="w-8 h-8" /> },
  { label: 'Awards & Recognition', value: '20+', icon: <Award className="w-8 h-8" /> },
];

export default function SweetMiraclesCompanyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-accent/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Sweet Miracles</h1>
          <p className="text-xl text-foreground/70 mb-6">
            A Canryn Production and its subsidiaries
          </p>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Founded and led by Ty Battle, Seabrun Candy Hunter's daughter, Sweet Miracles represents a continuation of the family legacy — decades of creative excellence, artistic innovation, and commitment to music and entertainment
          </p>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 px-4 bg-accent/5 border-y border-accent/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {statistics.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="flex justify-center mb-3 text-accent">{stat.icon}</div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-foreground/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="divisions">Divisions</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            {/* About Tab */}
            <TabsContent value="about" className="mt-8 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Overview</CardTitle>
                  <CardDescription>Sweet Miracles: Founded by Ty Battle (Seabrun's Daughter)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/80 leading-relaxed">
                    Sweet Miracles stands as a testament to family legacy and unwavering commitment to excellence in music and entertainment. Founded by Ty Battle, Seabrun Candy Hunter's daughter, the company carries forward the vision her father built — growing from a family-rooted operation into a multifaceted entertainment enterprise.
                  </p>
                  <p className="text-foreground/80 leading-relaxed">
                    At its core, Sweet Miracles is about creating quality music, developing talent, and building lasting relationships with artists, collaborators, and audiences. The company operates on principles of artistic integrity, professional excellence, and innovative thinking.
                  </p>
                  <p className="text-foreground/80 leading-relaxed">
                    Over more than five decades, Sweet Miracles has been instrumental in launching careers, producing hit records, and shaping the sound of popular music. The company's influence extends beyond its own productions—through mentorship, collaboration, and innovation, it has impacted the broader music industry.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mission & Values</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-bold text-foreground mb-2">Artistic Excellence</h4>
                    <p className="text-foreground/80">
                      Commitment to creating quality music and entertainment that stands the test of time
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-2">Talent Development</h4>
                    <p className="text-foreground/80">
                      Nurturing emerging artists and providing mentorship to the next generation of creators
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-2">Innovation</h4>
                    <p className="text-foreground/80">
                      Embracing new technologies and approaches while maintaining core artistic values
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-2">Integrity</h4>
                    <p className="text-foreground/80">
                      Operating with honesty, transparency, and respect for all stakeholders
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Divisions Tab */}
            <TabsContent value="divisions" className="mt-8">
              <div className="space-y-4">
                {divisions.map((division, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle>{division.name}</CardTitle>
                      <CardDescription>{division.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {division.focus.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-center gap-2">
                            <span className="text-accent">✓</span>
                            <span className="text-foreground/80">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="mt-8">
              <div className="space-y-4">
                {achievements.map((achievement, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{achievement.title}</CardTitle>
                          <CardDescription>{achievement.description}</CardDescription>
                        </div>
                        <div className="text-3xl ml-4">{achievement.icon}</div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <span className="inline-block px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium">
                        {achievement.year}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-12 px-4 bg-accent/5 border-y border-accent/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Leadership</h2>
          <Card>
            <CardHeader>
              <CardTitle>Founder & CEO</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-foreground mb-2">Ty Battle</h4>
                  <p className="text-foreground/80 mb-4">
                    Founder and CEO of Sweet Miracles, and daughter of Seabrun "Candy" Hunter Jr. Ty carries forward her father's legacy of music, creativity, and community service — building Sweet Miracles into a respected name in the entertainment industry.
                  </p>
                  <div className="space-y-2">
                    <p className="text-foreground/70">
                      <strong>Legacy:</strong> Daughter of Seabrun "Candy" Hunter Jr., continuing the family tradition of artistic excellence
                    </p>
                    <p className="text-foreground/70">
                      <strong>Expertise:</strong> Business leadership, artist development, brand strategy, community engagement
                    </p>
                    <p className="text-foreground/70">
                      <strong>Vision:</strong> Honoring her father's legacy while building new pathways for music, entertainment, and community impact
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Explore Our Work</h2>
          <p className="text-foreground/70 mb-6">
            Discover the music, artists, and stories that define Sweet Miracles
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/rrb/the-music"
              className="px-6 py-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-medium transition-colors"
            >
              Explore the Music
            </a>
            <a
              href="/rrb/the-legacy"
              className="px-6 py-3 border border-accent text-accent hover:bg-accent/10 rounded-lg font-medium transition-colors"
            >
              The Legacy
            </a>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-8 px-4 bg-foreground/5 border-t border-foreground/10">
        <div className="max-w-4xl mx-auto text-center text-sm text-foreground/60">
          <p>
            Sweet Miracles is a Canryn Production and its subsidiaries. All content, music, and intellectual property are protected under applicable copyright and international laws.
          </p>
        </div>
      </section>
    </div>
  );
}
