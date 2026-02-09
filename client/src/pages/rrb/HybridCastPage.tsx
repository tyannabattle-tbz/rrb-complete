import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { Radio, Wifi, Users, ShieldCheck } from 'lucide-react';

const HybridCastPage = () => {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <section className="text-center mb-12 md:mb-16">
          <Radio className="mx-auto h-16 w-16 text-amber-500 mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">HybridCast Emergency Broadcast</h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">A decentralized, resilient communication system giving a voice to the voiceless when it matters most.</p>
        </section>

        {/* Content Sections */}
        <div className="grid gap-8 md:gap-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Wifi className="h-6 w-6 text-red-500" />What is HybridCast?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                HybridCast is a decentralized, resilient communication system designed to provide a voice for the voiceless during emergencies and network outages. It operates independently of traditional cellular or internet infrastructure, creating a peer-to-peer mesh network that empowers communities to stay connected when it matters most. As a core component of the RockinRockinBoogie platform, HybridCast embodies the mission of ensuring that every voice can be heard, even in the most challenging circumstances.
              </p>
            </CardContent>
          </Card>

          <Tabs defaultValue="how-it-works" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
              <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
              <TabsTrigger value="mission">Our Mission</TabsTrigger>
            </TabsList>
            <TabsContent value="how-it-works">
              <Card>
                <CardHeader>
                  <CardTitle>The Technology Behind HybridCast</CardTitle>
                  <CardDescription>Leveraging cutting-edge tech for off-grid communication.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Mesh Networking</h4>
                    <p className="text-muted-foreground">Devices running HybridCast connect directly with one another, forming a self-healing mesh network. Data hops from node to node, extending the network's reach far beyond the range of a single device.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Offline-First Progressive Web App (PWA)</h4>
                    <p className="text-muted-foreground">The HybridCast interface is an offline-first PWA, meaning it can be installed on any device and functions without an active internet connection. All core features are available locally, ensuring access even when the grid is down.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">LoRa & Meshtastic Integration</h4>
                    <p className="text-muted-foreground">For long-range communication, HybridCast integrates with LoRa (Long Range) hardware and the Meshtastic protocol. This enables text-based messaging and data transfer over several kilometers, creating a robust backbone for the community network.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="capabilities">
              <Card>
                <CardHeader>
                  <CardTitle>Emergency & Community Features</CardTitle>
                  <CardDescription>Tools for crisis communication and community support.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Emergency Broadcasts</h4>
                    <p className="text-muted-foreground">Authorized users can send vital alerts and updates that are rapidly propagated throughout the entire network, ensuring timely and accurate information during a crisis.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Community Resilience</h4>
                    <p className="text-muted-foreground">Features include secure one-to-one and group messaging, location sharing, and community forums. These tools enable neighbors to coordinate, share resources, and support one another during an emergency.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="mission">
              <Card>
                <CardHeader>
                  <CardTitle>A Voice for the Voiceless</CardTitle>
                  <CardDescription>Empowering communities through decentralized communication.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">True to the mission of Seabrun Candy Hunter and Canryn Production Inc., HybridCast is designed to empower marginalized communities. By providing a free, open, and decentralized communication platform, it gives a voice to those who are often silenced or ignored by mainstream media and infrastructure.</p>
                  <p className="text-muted-foreground">It is a modern-day implementation of the core principle behind <Link href="/rrb/sweet-miracles" className="text-orange-500 hover:underline">Sweet Miracles</Link>: providing essential tools for communication and self-expression.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-6 w-6 text-amber-500" />Integration with the RRB Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                HybridCast is seamlessly integrated into the RockinRockinBoogie ecosystem. It is controlled and orchestrated by the <Link href="/rrb/qumus" className="text-orange-500 hover:underline">QUMUS</Link> autonomous system, ensuring reliability and interoperability with other platform services. Users can access a high-level overview of the network status directly from the main RRB dashboard.
              </p>
              <Link href="#" className="font-semibold text-red-500 hover:underline">
                Go to HybridCast Dashboard &rarr;
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Canryn Production Inc. All Rights Reserved.</p>
          <p className="text-xs text-muted-foreground mt-1">A tribute to the legacy of Seabrun Candy Hunter. A Voice for the Voiceless.</p>
          <div className="mt-2 space-x-4 text-sm">
            <Link href="/rrb/sweet-miracles" className="text-muted-foreground hover:text-foreground">Sweet Miracles</Link>
            <Link href="/rrb/qumus" className="text-muted-foreground hover:text-foreground">QUMUS</Link>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default HybridCastPage;
