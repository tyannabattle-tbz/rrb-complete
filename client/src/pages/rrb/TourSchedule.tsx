import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { Calendar, Ticket, MapPin, Archive } from 'lucide-react';

const upcomingEvents = [
  {
    date: 'October 26, 2024',
    venue: 'The Grand Ole Opry',
    city: 'Nashville, TN',
    tickets: 'https://www.opry.com/events/a-tribute-to-seabrun-candy-hunter',
  },
  {
    date: 'November 15, 2024',
    venue: 'The Fillmore',
    city: 'San Francisco, CA',
    tickets: 'https://www.thefillmore.com/event/seabrun-candy-hunter-legacy-concert',
  },
  {
    date: 'December 12, 2024',
    venue: 'TBA',
    city: 'Los Angeles, CA',
    tickets: null,
  },
];

const pastEvents = [
  {
    date: 'August 1, 2024',
    venue: 'Apollo Theater',
    city: 'New York, NY',
  },
  {
    date: 'July 15, 2024',
    venue: 'Ryman Auditorium',
    city: 'Nashville, TN',
  },
];

export default function TourSchedule() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="py-12 md:py-20 border-b border-border">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <Calendar className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="text-4xl md:text-5xl font-bold mt-4">Tour Schedule</h1>
          <p className="mt-2 text-lg md:text-xl text-muted-foreground">Upcoming tribute events and community gatherings.</p>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-12">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="past">Past Events Archive</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            <div className="grid gap-8 mt-8">
              {upcomingEvents.map((event, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-amber-500" />
                      {event.date}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-2">
                      <MapPin className="h-4 w-4" /> {event.venue}, {event.city}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {event.tickets ? (
                      <a href={event.tickets} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-red-500 hover:underline">
                        <Ticket className="h-5 w-5" />
                        Get Tickets
                      </a>
                    ) : (
                      <p className="text-muted-foreground">Ticket information TBA</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="past">
            <div className="grid gap-8 mt-8">
              {pastEvents.map((event, index) => (
                <Card key={index} className="bg-card border-border opacity-70">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Archive className="h-5 w-5 text-orange-500" />
                      {event.date}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-2">
                      <MapPin className="h-4 w-4" /> {event.venue}, {event.city}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <section className="mt-16 text-center">
            <h2 className="text-2xl font-semibold">Explore More</h2>
            <div className="flex justify-center gap-4 mt-4">
                <Link href="/rrb/the-music" className="text-red-500 hover:underline">Music Legacy</Link>
                <Link href="/rrb/the-legacy" className="text-red-500 hover:underline">About Seabrun</Link>
                <Link href="/rrb/contact" className="text-red-500 hover:underline">Contact Us</Link>
            </div>
        </section>
      </main>

      <footer className="py-6 border-t border-border mt-12">
        <div className="container mx-auto px-4 md:px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Canryn Production Inc. All Rights Reserved.</p>
          <p className="mt-1">RockinRockinBoogie.com is a tribute to the legacy of Seabrun Candy Hunter.</p>
        </div>
      </footer>
    </div>
  );
}
