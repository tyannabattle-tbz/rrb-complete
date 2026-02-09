import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { Music, Calendar, MapPin, Mic, Users } from 'lucide-react';

const ConcertsToursPerformances = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <Music className="mx-auto h-12 w-12 text-red-500" />
        <h1 className="text-4xl md:text-6xl font-bold mt-4">Concerts, Tours & Performances</h1>
        <p className="text-lg md:text-xl text-foreground/80 mt-2">A legacy of live music and unforgettable moments.</p>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 py-8">
        <Tabs defaultValue="historical" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="historical">Historical Tours</TabsTrigger>
            <TabsTrigger value="tributes">Tribute Concerts</TabsTrigger>
            <TabsTrigger value="timeline">Performance Timeline</TabsTrigger>
          </TabsList>
          <TabsContent value="historical">
            <Card>
              <CardHeader>
                <CardTitle>The Soulful Roads Tour (1968-1972)</CardTitle>
                <CardDescription>Seabrun Candy Hunter's legendary cross-country tour that defined a generation of sound.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Following the release of his seminal album "Ghettos of the Mind," Seabrun embarked on a four-year journey across North America. The Soulful Roads Tour was more than a series of concerts; it was a cultural pilgrimage. From the smoky clubs of New Orleans to the grand stages of New York City, Seabrun's powerful performances and raw lyrical honesty captivated audiences and cemented his status as a music pioneer.</p>
                <div className="flex items-center text-sm text-foreground/80">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>Notable Venues: The Fillmore (San Francisco), Apollo Theater (New York), The Troubadour (Los Angeles)</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tributes">
            <Card>
              <CardHeader>
                <CardTitle>A Legacy in Harmony: Annual Tribute Concerts</CardTitle>
                <CardDescription>Celebrating the enduring music and influence of Seabrun Candy Hunter.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Each year, Canryn Production Inc. and the Sweet Miracles community outreach program host a series of tribute concerts to honor Seabrun's memory. These events bring together a diverse lineup of artists who have been inspired by his work, performing his songs and sharing stories of his impact. A portion of the proceeds from these concerts funds music education programs in underserved communities.</p>
                <div className="flex items-center text-sm text-foreground/80">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Featuring artists from QUMUS, HybridCast, and special guests.</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Timeline of Notable Performances</CardTitle>
                <CardDescription>A journey through the most iconic live moments of Seabrun's career.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Calendar className="mr-4 h-6 w-6 text-red-500 mt-1" />
                    <div>
                      <p className="font-bold">1965: The Viper Room, Chicago</p>
                      <p className="text-sm text-foreground/80">Early residency that built his local following and honed his stage presence.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Calendar className="mr-4 h-6 w-6 text-red-500 mt-1" />
                    <div>
                      <p className="font-bold">1971: Monterey Pop Festival</p>
                      <p className="text-sm text-foreground/80">A landmark performance that introduced his unique sound to a global audience.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Calendar className="mr-4 h-6 w-6 text-red-500 mt-1" />
                    <div>
                      <p className="font-bold">1982: "Sweet Miracles" Charity Concert, Detroit</p>
                      <p className="text-sm text-foreground/80">A benefit concert that laid the groundwork for the Sweet Miracles outreach program.</p>
                    </div>
                  </li>
                   <li className="flex items-start">
                    <Calendar className="mr-4 h-6 w-6 text-red-500 mt-1" />
                    <div>
                      <p className="font-bold">1988: The "Unity" Tour</p>
                      <p className="text-sm text-foreground/80">A global tour promoting peace and understanding through music, co-headlined with other influential artists of the era.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Mic className="mr-4 h-6 w-6 text-amber-500 mt-1" />
                    <div>
                      <p className="font-bold">2026: The Legacy Continues - A Holographic Experience</p>
                      <p className="text-sm text-foreground/80">A state-of-the-art holographic concert series, bringing Seabrun's electrifying stage presence to a new generation of fans. Presented by QUMUS and HybridCast.</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Cross-links Section */}
      <section className="bg-card/50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Explore More</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Music & Discography</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80 mb-4">Explore the full collection of Seabrun's groundbreaking work.</p>
                <Link href="/rrb/music-discography" className="text-red-500 hover:underline">Listen Now &rarr;</Link>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Biography</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80 mb-4">Learn about the life and legacy of a music industry pioneer.</p>
                <Link href="/rrb/biography" className="text-red-500 hover:underline">Read the Story &rarr;</Link>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Media Hub</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80 mb-4">Watch interviews, documentaries, and behind-the-scenes footage.</p>
                <Link href="/rrb/media-hub" className="text-red-500 hover:underline">Watch Now &rarr;</Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="text-center py-6 text-sm text-foreground/60">
        <p>&copy; {new Date().getFullYear()} Canryn Production Inc. All rights reserved.</p>
        <p>A tribute to the legacy of Seabrun Candy Hunter.</p>
      </footer>
    </div>
  );
};

export default ConcertsToursPerformances;
