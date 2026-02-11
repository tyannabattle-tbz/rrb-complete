
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { Building2, Music, Radio, Cpu, HeartHandshake, BookOpen, Shirt } from 'lucide-react';

export default function Divisions() {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <header className="text-center mb-12">
          <div className="inline-block bg-card p-4 rounded-lg border border-border">
            <Building2 className="h-12 w-12 text-amber-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mt-4">Our Divisions</h1>
          <p className="text-lg md:text-xl text-foreground/80 mt-2 max-w-3xl mx-auto">
            Canryn Production Inc. is a multifaceted organization dedicated to preserving legacy and fostering innovation across music, technology, and community.
          </p>
        </header>

        {/* Divisions Tabs Section */}
        <section>
          <Tabs defaultValue="music" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 bg-card border-border border rounded-lg">
              <TabsTrigger value="music"><Music className="h-4 w-4 mr-2"/>Music</TabsTrigger>
              <TabsTrigger value="broadcasting"><Radio className="h-4 w-4 mr-2"/>Broadcasting</TabsTrigger>
              <TabsTrigger value="technology"><Cpu className="h-4 w-4 mr-2"/>Technology</TabsTrigger>
              <TabsTrigger value="community"><HeartHandshake className="h-4 w-4 mr-2"/>Community</TabsTrigger>
              <TabsTrigger value="publishing"><BookOpen className="h-4 w-4 mr-2"/>Publishing</TabsTrigger>
              <TabsTrigger value="merchandise"><Shirt className="h-4 w-4 mr-2"/>Merchandise</TabsTrigger>
            </TabsList>

            <TabsContent value="music" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center"><Music className="h-6 w-6 mr-3 text-red-500"/>Music Production</CardTitle>
                  <CardDescription>Honoring the past, composing the future.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>The heart of our origin, the Music Production division is committed to the creation, preservation, and promotion of authentic musical works. We manage the extensive catalog of Seabrun Candy Hunter and nurture new talent that aligns with our core values.</p>
                  <div>
                    <h4 className="font-semibold">Mission:</h4>
                    <p className="text-foreground/80">To ensure that timeless music finds its audience and that artists receive the recognition and compensation they deserve, correcting historical oversights and building a fair ecosystem.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Key Initiatives:</h4>
                    <ul className="list-disc list-inside text-foreground/80">
                      <li>Digital restoration of Seabrun Candy Hunter's master tapes.</li>
                      <li>Collaborative projects between emerging artists and the QUMUS orchestration engine.</li>
                      <li>Advocacy for transparent and equitable crediting in the music industry.</li>
                    </ul>
                  </div>
                  <Link href="/rrb/the-music" className="text-amber-500 hover:underline">Explore our Music & Legacy →</Link>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="broadcasting" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center"><Radio className="h-6 w-6 mr-3 text-red-500"/>Broadcasting (RRB Radio)</CardTitle>
                  <CardDescription>The voice of the unheard.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>RRB Radio is our independent broadcasting arm, providing a platform for underrepresented artists and stories. It serves as a cultural hub, blending music, interviews, and community news, powered by our innovative HybridCast technology for reliability.</p>
                  <div>
                    <h4 className="font-semibold">Mission:</h4>
                    <p className="text-foreground/80">To deliver diverse, high-quality programming that informs, entertains, and connects our community, free from mainstream constraints.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Key Initiatives:</h4>
                    <ul className="list-disc list-inside text-foreground/80">
                      <li>24/7 streaming of curated playlists and original shows.</li>
                      <li>"Credit Where It's Due": A series highlighting unsung heroes of the music industry.</li>
                      <li>Integration with HybridCast for emergency broadcast capabilities during local crises.</li>
                    </ul>
                  </div>
                  <Link href="/rrb/radio-station" className="text-amber-500 hover:underline">Tune into RRB Radio →</Link>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="technology" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center"><Cpu className="h-6 w-6 mr-3 text-red-500"/>Technology</CardTitle>
                  <CardDescription>Innovating for impact.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Our Technology division is the engine driving our future. It develops groundbreaking solutions like QUMUS, our autonomous orchestration system, and HybridCast, a resilient emergency broadcast network. We believe in technology that serves creativity and community safety.</p>
                  <div>
                    <h4 className="font-semibold">Mission:</h4>
                    <p className="text-foreground/80">To pioneer autonomous and resilient systems that empower creators, protect communities, and solve complex challenges in media and communication.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Key Initiatives:</h4>
                    <ul className="list-disc list-inside text-foreground/80">
                      <li><strong className="text-foreground">QUMUS:</strong> Expanding its compositional capabilities and API for public use.</li>
                      <li><strong className="text-foreground">HybridCast:</strong> Partnering with municipalities to deploy our robust emergency broadcast system.</li>
                      <li>Research into AI-driven music rights management and royalty tracking.</li>
                    </ul>
                  </div>
                   <Link href="/rrb/divisions" className="text-amber-500 hover:underline">Discover our Tech →</Link>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="community" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center"><HeartHandshake className="h-6 w-6 mr-3 text-red-500"/>Community Outreach (Sweet Miracles)</CardTitle>
                  <CardDescription>Music as a force for good.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Sweet Miracles is our non-profit community outreach initiative. Inspired by the generosity of Seabrun Candy Hunter, it uses the power of music and the arts to support and uplift underserved communities, particularly focusing on youth education and creative expression.</p>
                  <div>
                    <h4 className="font-semibold">Mission:</h4>
                    <p className="text-foreground/80">To create positive social change through arts education, mentorship programs, and community-building events that provide resources and opportunities.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Key Initiatives:</h4>
                    <ul className="list-disc list-inside text-foreground/80">
                      <li>After-school music and coding workshops for young people.</li>
                      <li>Funding for local arts projects and community centers.</li>
                      <li>Annual "Seabrun's Spirit" benefit concert.</li>
                    </ul>
                  </div>
                  <Link href="/rrb/canryn-production" className="text-amber-500 hover:underline">Learn about Sweet Miracles →</Link>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="publishing" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center"><BookOpen className="h-6 w-6 mr-3 text-red-500"/>Publishing</CardTitle>
                  <CardDescription>Securing the legacy.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>The Publishing division is the legal and administrative backbone for our creative assets. It manages the rights, licenses, and royalties for Seabrun Candy Hunter's catalog and other affiliated works, ensuring every note and word is protected and properly monetized.</p>
                  <div>
                    <h4 className="font-semibold">Mission:</h4>
                    <p className="text-foreground/80">To provide meticulous, transparent, and artist-centric administration of intellectual property, maximizing value and ensuring fair compensation for creators.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Key Initiatives:</h4>
                    <ul className="list-disc list-inside text-foreground/80">
                      <li>Aggressive pursuit of uncredited and misappropriated works.</li>
                      <li>Developing simplified licensing models for independent filmmakers and creators.</li>
                      <li>Global royalty collection and auditing.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="merchandise" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center"><Shirt className="h-6 w-6 mr-3 text-red-500"/>Merchandise</CardTitle>
                  <CardDescription>Wear the legacy.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Our Merchandise division creates high-quality apparel, accessories, and collectibles that celebrate the legacy of Seabrun Candy Hunter and the spirit of RockinRockinBoogie.com. Each item is designed to tell a story and connect fans to the music.</p>
                  <div>
                    <h4 className="font-semibold">Mission:</h4>
                    <p className="text-foreground/80">To offer thoughtfully designed, premium merchandise that allows fans to express their connection to the music and its history, with proceeds supporting our community initiatives.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Key Initiatives:</h4>
                    <ul className="list-disc list-inside text-foreground/80">
                      <li>Limited-edition vinyl reissues and box sets.</li>
                      <li>Vintage-inspired apparel line based on concert posters and album art.</li>
                      <li>Collaborations with artists for unique merchandise designs.</li>
                    </ul>
                  </div>
                  <Link href="/rrb/merchandise-shop" className="text-amber-500 hover:underline">Shop the Collection →</Link>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Subsidiary Logos Showcase */}
        <section className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground">Our Family of Companies</h2>
            <p className="text-foreground/60 mt-2">The subsidiaries and divisions that make up the Canryn Production ecosystem</p>
          </div>

          {/* Main Logo */}
          <div className="flex justify-center mb-10">
            <div className="bg-card border border-amber-500/30 rounded-xl p-6 shadow-lg shadow-amber-500/5 max-w-sm w-full text-center">
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/eSIjztuNImvhgWiE.jpeg"
                alt="Canryn Production Inc."
                className="w-full h-auto rounded-lg mb-3"
              />
              <h3 className="text-lg font-bold text-amber-500">Canryn Production Inc.</h3>
              <p className="text-sm text-foreground/60">Parent Company — Est. by LaShanna Hunter</p>
            </div>
          </div>

          {/* Subsidiary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              {
                name: 'Canryn Publishing Co.',
                logo: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/mTiGfPFFlpHcvZTm.jpeg',
                desc: 'Music Publishing & Rights Administration',
              },
              {
                name: 'Canryn Promo',
                logo: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/giQvuyIzYStoLwtj.jpeg',
                desc: 'Promotion & Marketing',
              },
              {
                name: 'Little C',
                logo: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/jAGbowmiNIBjqruW.jpeg',
                desc: 'Youth & Education Initiatives',
              },
              {
                name: "Anna's Promotion Co.",
                logo: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/NOXrVGzekgvevsQT.jpeg',
                desc: 'Artist Promotion & Events',
              },
              {
                name: 'Candy Worldwide',
                logo: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/vGJdwZhZCGKBYxZs.jpeg',
                desc: 'Global Distribution & Licensing',
              },
              {
                name: 'Jaelon Enterprises',
                logo: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/jcgFmBvwKebLhriU.jpeg',
                desc: 'Business Development & Ventures',
              },
              {
                name: 'Sean Music',
                logo: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/pFmKZSoKEyjfghpL.jpeg',
                desc: 'Music Production & Recording',
              },
              {
                name: 'Seasha Distribution Co.',
                logo: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xdhjNQYMyvMBSdks.jpeg',
                desc: 'Physical & Digital Distribution',
              },
            ].map((sub) => (
              <Card key={sub.name} className="bg-card border-border hover:border-amber-500/30 transition-colors group overflow-hidden">
                <div className="aspect-square overflow-hidden bg-white/5">
                  <img
                    src={sub.logo}
                    alt={sub.name}
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-3 text-center">
                  <h4 className="font-semibold text-sm text-foreground">{sub.name}</h4>
                  <p className="text-xs text-foreground/50 mt-0.5">{sub.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* All Logos Combined */}
          <div className="mt-8 text-center">
            <Card className="bg-card border-border inline-block">
              <CardContent className="p-4">
                <img
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/TskQDmeWoFOCaDQq.jpeg"
                  alt="All Canryn Production Company Logos"
                  className="max-w-full md:max-w-2xl h-auto rounded-lg"
                />
                <p className="text-sm text-foreground/50 mt-2">The complete Canryn Production family of companies</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Interconnectivity Section */}
        <section className="mt-16">
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle>A Symphony of Synergy</CardTitle>
                    <CardDescription>How our divisions work in concert.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-foreground/80">No division at Canryn Production Inc. operates in a silo. Our strength lies in the seamless integration of our efforts. Music from our <strong className="text-foreground">Publishing</strong> catalog is revived by the <strong className="text-foreground">Music Production</strong> team, broadcast on <strong className="text-foreground">RRB Radio</strong>, and orchestrated by <strong className="text-foreground">QUMUS</strong>. Proceeds from <strong className="text-foreground">Merchandise</strong> directly fund <strong className="text-foreground">Sweet Miracles</strong>, our community outreach. This interconnected ecosystem ensures that the legacy of Seabrun Candy Hunter is not just preserved, but is a living, breathing force for creativity and positive change.</p>
                </CardContent>
            </Card>
        </section>

      </main>

      {/* Footer */}
      <footer className="text-center py-4 px-4 bg-card border-t border-border">
        <p className="text-sm text-foreground/60">
          Copyright © {new Date().getFullYear()} Canryn Production Inc. All Rights Reserved.<br />
          RockinRockinBoogie.com is dedicated to the memory and legacy of Seabrun Candy Hunter.
        </p>
      </footer>
    </div>
  );
}
