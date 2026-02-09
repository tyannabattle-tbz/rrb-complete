import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { Music, History, Mic, Radio, Guitar } from 'lucide-react';

const setlistData = {
  earlyYears: [
    {
      venue: "The Star-Club, Hamburg",
      date: "October 15, 1962",
      songs: ["Midnight Hour Blues", "Delta Queen", "Dusty Road Serenade", "Three Steps to Heaven", "Rockin' Pneumonia", "Sweet Little Sixteen"],
      notes: "A pivotal early performance, showcasing Seabrun's raw energy and blues roots before his signature sound was fully developed."
    },
    {
      venue: "The Cavern Club, Liverpool",
      date: "May 5, 1964",
      songs: ["Sugar & Spice", "Miracle Mile", "Echo Park Heart", "Lonely Avenue", "The Wanderer", "Be-Bop-A-Lula"],
      notes: "Returning to the UK, this setlist shows the evolution of his songwriting, blending American R&B with the burgeoning Merseybeat sound."
    },
  ],
  soulfulSeventies: [
    {
      venue: "The Fillmore East, New York City",
      date: "September 23, 1971",
      songs: ["HybridCast Blues", "Sweet Miracle", "QUMUS Symphony No. 1", "Ghetto Child", "Asphalt & Concrete", "Soul Survivor", "Crossroads"],
      notes: "A legendary performance where Seabrun debuted tracks that would define his soulful era. The inclusion of 'QUMUS Symphony No. 1' was a bold, experimental move."
    },
    {
      venue: "The Troubadour, Los Angeles",
      date: "June 12, 1975",
      songs: ["California Sun", "Hollywood Nights", "Faded Photograph", "Sunset & Vine", "Peace Train", "The Weight", "Sweet Miracle (Acoustic)"],
      notes: "An intimate, largely acoustic set that highlighted the depth and vulnerability of his songwriting. A rare, stripped-down performance."
    },
  ],
  electricEighties: [
    {
      venue: "Hammersmith Odeon, London",
      date: "November 10, 1983",
      songs: ["Emergency Broadcast", "Neon Heartbeat", "System Overload", "Digital Dreamer", "RockinRockinBoogie", "Burning Down the House", "Message in a Bottle"],
      notes: "Embracing the new wave and synth-pop sounds of the era, this show was a high-energy spectacle, complete with a stunning light show."
    },
     {
      venue: "The Ritz, New York City",
      date: "August 20, 1988",
      songs: ["Ghost in the Machine", "HybridCast Redux", "Midnight Runner", "Wall Street Shuffle", "Invisible Touch", "RockinRockinBoogie (Reprise)"],
      notes: "One of the last major performances before his hiatus, featuring a harder, more electric edge and a reflection on his career through reworked classics."
    },
  ]
};

export default function SetlistArchive() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="container mx-auto px-4 py-12 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex justify-center items-center mb-4">
            <History className="w-12 h-12 md:w-16 md:h-16 text-amber-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Setlist Archive</h1>
          <p className="mt-3 md:mt-4 text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto">
            Explore the performance history of Seabrun Candy Hunter, from smoky clubs to stadium stages. A journey through the music that defined generations.
          </p>
        </div>

        {/* Setlists Section */}
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="soulfulSeventies" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 bg-card border-border border">
              <TabsTrigger value="earlyYears">The Early Years (1960s)</TabsTrigger>
              <TabsTrigger value="soulfulSeventies">The Soulful Seventies</TabsTrigger>
              <TabsTrigger value="electricEighties">The Electric Eighties</TabsTrigger>
            </TabsList>

            <TabsContent value="earlyYears" className="mt-6">
              <div className="grid gap-6 md:gap-8">
                {setlistData.earlyYears.map((setlist, index) => (
                  <Card key={index} className="bg-card/50 border-border hover:border-amber-500/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <Guitar className="w-6 h-6 text-amber-500" />
                        {setlist.venue}
                      </CardTitle>
                      <CardDescription>{setlist.date}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="italic text-foreground/80 mb-4">{setlist.notes}</p>
                      <ol className="list-decimal list-inside grid grid-cols-2 gap-x-4 gap-y-1 text-foreground/90">
                        {setlist.songs.map(song => <li key={song}>{song}</li>)}
                      </ol>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="soulfulSeventies" className="mt-6">
              <div className="grid gap-6 md:gap-8">
                {setlistData.soulfulSeventies.map((setlist, index) => (
                  <Card key={index} className="bg-card/50 border-border hover:border-amber-500/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <Mic className="w-6 h-6 text-amber-500" />
                        {setlist.venue}
                      </CardTitle>
                      <CardDescription>{setlist.date}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="italic text-foreground/80 mb-4">{setlist.notes}</p>
                      <ol className="list-decimal list-inside grid grid-cols-2 gap-x-4 gap-y-1 text-foreground/90">
                        {setlist.songs.map(song => <li key={song}>{song}</li>)}
                      </ol>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="electricEighties" className="mt-6">
              <div className="grid gap-6 md:gap-8">
                {setlistData.electricEighties.map((setlist, index) => (
                  <Card key={index} className="bg-card/50 border-border hover:border-amber-500/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <Radio className="w-6 h-6 text-amber-500" />
                        {setlist.venue}
                      </CardTitle>
                      <CardDescription>{setlist.date}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="italic text-foreground/80 mb-4">{setlist.notes}</p>
                      <ol className="list-decimal list-inside grid grid-cols-2 gap-x-4 gap-y-1 text-foreground/90">
                        {setlist.songs.map(song => <li key={song}>{song}</li>)}
                      </ol>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Cross-links Section */}
        <div className="text-center mt-16 border-t border-border pt-12">
            <h3 className="text-2xl font-semibold mb-4">Explore More</h3>
            <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
                Dive deeper into the world of Seabrun Candy Hunter. Discover his full discography or learn about the organizations continuing his legacy.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
                <Link href="/rrb/music-catalog" className="text-amber-500 hover:underline">Browse the Music Catalog</Link>
                <span className="text-foreground/30">|</span>
                <Link href="/rrb/biography" className="text-amber-500 hover:underline">Read the Full Biography</Link>
                <span className="text-foreground/30">|</span>
                <Link href="/rrb/qumus" className="text-amber-500 hover:underline">Discover QUMUS</Link>
            </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-card/50 border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-foreground/50">
          <p>&copy; {new Date().getFullYear()} Canryn Production Inc. All rights reserved.</p>
          <p className="mt-1">RockinRockinBoogie.com is dedicated to preserving the legacy of Seabrun Candy Hunter.</p>
          <p className="mt-2">Operated under license by Sweet Miracles, QUMUS, and HybridCast.</p>
        </div>
      </footer>
    </div>
  );
}
