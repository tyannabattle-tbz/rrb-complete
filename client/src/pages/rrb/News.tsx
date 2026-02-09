
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { Newspaper, Megaphone, Milestone, Users, Calendar, Music, Building } from 'lucide-react';

const newsItems = {
  latest: [
    {
      id: 1,
      category: 'Platform Launch',
      date: '2026-02-08',
      title: 'RockinRockinBoogie.com is Live!',
      description: 'The official platform dedicated to the legacy of Seabrun Candy Hunter is now live. Explore the music, stories, and impact of a true industry pioneer.',
      link: '/rrb/about',
      icon: Megaphone
    },
    {
      id: 2,
      category: 'Legacy Restoration',
      date: '2026-01-20',
      title: 'New Songwriting Credits Uncovered',
      description: 'Our research team has successfully verified three previously uncredited songs written by Seabrun Candy Hunter. They have been added to the official discography.',
      link: '/rrb/music',
      icon: Music
    },
  ],
  milestones: [
    {
      id: 3,
      category: 'QUMUS',
      date: '2025-12-15',
      title: 'QUMUS Autonomous Orchestration Completes First Full Symphony',
      description: 'The QUMUS system successfully generated a full-length symphonic piece based on Seabrun\'s melodic fragments, showcasing its powerful capabilities.',
      link: '/rrb/qumus',
      icon: Milestone
    },
    {
      id: 4,
      category: 'Archive',
      date: '2025-11-01',
      title: 'Over 1,000 Archival Documents Digitized',
      description: 'Our archival project has reached a major milestone, with over a thousand personal letters, scores, and photographs of Seabrun Candy Hunter now digitized and preserved.',
      link: '/rrb/archive',
      icon: Building
    },
  ],
  community: [
    {
      id: 5,
      category: 'Sweet Miracles',
      date: '2026-01-30',
      title: 'Sweet Miracles Initiative Launches Music Program for Youth',
      description: 'In partnership with local schools, the Sweet Miracles outreach program has launched a new initiative to provide music education to underserved youth.',
      link: '/rrb/community',
      icon: Users
    },
    {
      id: 6,
      category: 'HybridCast',
      date: '2025-10-22',
      title: 'HybridCast Technology Aids in Emergency Broadcast Drill',
      description: 'The HybridCast system was successfully utilized in a statewide emergency broadcast drill, proving its reliability and effectiveness in critical situations.',
      link: '/rrb/hybridcast',
      icon: Megaphone
    },
  ],
  events: [
    {
      id: 7,
      category: 'Tribute Concert',
      date: '2026-04-15',
      title: 'A Tribute to Seabrun: A Night of Music',
      description: 'Join us for a special tribute concert celebrating the life and music of Seabrun Candy Hunter. More details and ticket information to be announced soon.',
      link: '#',
      icon: Calendar
    },
  ],
};

export default function News() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        {/* Hero Section */}
        <section className="text-center mb-12 md:mb-16">
          <Newspaper className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">News & Updates</h1>
          <p className="mt-4 text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto">
            Stay informed on platform announcements, legacy milestones, and community initiatives from the world of Seabrun Candy Hunter.
          </p>
        </section>

        {/* News Content */}
        <Tabs defaultValue="latest" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-card border-border border rounded-lg">
            <TabsTrigger value="latest">Latest Updates</TabsTrigger>
            <TabsTrigger value="milestones">Platform Milestones</TabsTrigger>
            <TabsTrigger value="community">Community Impact</TabsTrigger>
            <TabsTrigger value="events">Upcoming Events</TabsTrigger>
          </TabsList>

          <TabsContent value="latest" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {newsItems.latest.map(item => (
                <Card key={item.id} className="bg-card border-border hover:border-red-500/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <item.icon className="h-5 w-5 text-red-500" />
                        <CardTitle>{item.title}</CardTitle>
                    </div>
                    <CardDescription className="text-sm text-foreground/60">{item.category} - {item.date}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{item.description}</p>
                    <Link href={item.link} className="text-red-500 hover:underline font-semibold">
                      Learn More &rarr;
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="milestones" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {newsItems.milestones.map(item => (
                <Card key={item.id} className="bg-card border-border hover:border-amber-500/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <item.icon className="h-5 w-5 text-amber-500" />
                        <CardTitle>{item.title}</CardTitle>
                    </div>
                    <CardDescription className="text-sm text-foreground/60">{item.category} - {item.date}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{item.description}</p>
                    <Link href={item.link} className="text-amber-500 hover:underline font-semibold">
                      Discover More &rarr;
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="community" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {newsItems.community.map(item => (
                <Card key={item.id} className="bg-card border-border hover:border-orange-500/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <item.icon className="h-5 w-5 text-orange-500" />
                        <CardTitle>{item.title}</CardTitle>
                    </div>
                    <CardDescription className="text-sm text-foreground/60">{item.category} - {item.date}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{item.description}</p>
                    <Link href={item.link} className="text-orange-500 hover:underline font-semibold">
                      Get Involved &rarr;
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
             <div className="grid gap-6 md:grid-cols-2">
              {newsItems.events.map(item => (
                <Card key={item.id} className="bg-card border-border hover:border-red-500/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <item.icon className="h-5 w-5 text-red-500" />
                        <CardTitle>{item.title}</CardTitle>
                    </div>
                    <CardDescription className="text-sm text-foreground/60">{item.category} - {item.date}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Cross-links Section */}
        <section className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-4">Explore More</h3>
            <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
                <Link href="/rrb/the-legacy" className="text-red-500 hover:underline">About the Project</Link>
                <Link href="/rrb/the-music" className="text-red-500 hover:underline">Music & Legacy</Link>
                <Link href="/rrb/canryn-production" className="text-red-500 hover:underline">Community Initiatives</Link>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-foreground/60">
          <p>&copy; {new Date().getFullYear()} Canryn Production Inc. All Rights Reserved.</p>
          <p className="text-sm mt-2">
            RockinRockinBoogie.com is a platform dedicated to the artistic legacy of Seabrun Candy Hunter. 
            <Link href="/rrb/faq" className="underline hover:text-foreground">Legal & Privacy</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
