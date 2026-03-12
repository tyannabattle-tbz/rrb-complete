import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radio, Music, Heart, Earth, BookOpen, Users, Shield, FileText, Mic, Headphones } from 'lucide-react';
import { RRBHeaderEnhanced } from '@/components/RRBHeaderEnhanced';
import { BreadcrumbNavigation } from '@/components/BreadcrumbNavigation';

export default function RRBLegacySite() {
  const [isSpinning, setIsSpinning] = useState(true);
  const [, setLocation] = useLocation();
  const [audioStarted, setAudioStarted] = useState(false);

  // Auto-play audio on page load with low volume
  useEffect(() => {
    if (!audioStarted) {
      const audio = new Audio('https://ice5.somafm.com/groovesalad-128-mp3');
      audio.volume = 0.2; // Low volume (20%)
      audio.play().catch(err => {
        console.log('Auto-play prevented by browser policy:', err);
        // Browser policy prevents auto-play without user interaction
      });
      setAudioStarted(true);
    }
  }, [audioStarted]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* RRB Header */}
      <RRBHeaderEnhanced />
      
      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation />
      
      {/* UN Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Earth className="w-5 h-5" />
          <p className="text-sm font-semibold">United Nations Sustainable Development Goals</p>
        </div>
      </div>

      {/* Legacy Info Header */}
      <header className="border-b border-pink-500/20 bg-slate-900/50 backdrop-blur-sm sticky top-32 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Radio className="w-8 h-8 text-pink-400 animate-pulse" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                  Rockin Rockin Boogie
                </h1>
                <p className="text-sm text-pink-300">Seabrun Candy Hunter Legacy &bull; A Voice for the Voiceless</p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
              Legacy Active
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
          {/* Spinning Vinyl */}
          <div className="flex justify-center">
            <div className="relative w-64 h-64">
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-br from-gray-900 via-black to-gray-800 shadow-2xl flex items-center justify-center ${
                  isSpinning ? 'animate-spin' : ''
                }`}
                style={{
                  animationDuration: isSpinning ? '8s' : '0s',
                  boxShadow: '0 0 60px rgba(236, 72, 153, 0.5), inset 0 0 40px rgba(0, 0, 0, 0.9)',
                }}
              >
                <div className="absolute inset-4 rounded-full border-8 border-gray-700 opacity-30"></div>
                <div className="absolute inset-8 rounded-full border-4 border-gray-600 opacity-20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-600 to-orange-600 flex items-center justify-center shadow-lg">
                    <Music className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legacy Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Seabrun Candy Hunter Legacy
              </h2>
              <h3 className="text-xl text-pink-300 mb-4">
                Music, Broadcasting & Community by Canryn Production
              </h3>
              <p className="text-gray-300 mb-4">
                Preserving the legacy of Seabrun Candy Hunter through verified documentation,
                live radio broadcasting, healing music frequencies, and community empowerment.
                Powered by Canryn Production and Sweet Miracles &mdash; A Voice for the Voiceless.
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() => setIsSpinning(!isSpinning)}
                className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700"
              >
                {isSpinning ? '⏸ Pause Record' : '▶ Play Record'}
              </Button>
              <Button
                onClick={() => {
                  const audio = new Audio('https://ice5.somafm.com/groovesalad-128-mp3');
                  audio.volume = 0.2;
                  audio.play();
                }}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
              >
                🎙 Start Broadcast
              </Button>
              <Button
                onClick={() => window.open('https://www.rockinrockinboogie.com', '_blank')}
                variant="outline"
                className="border-pink-500 text-pink-400 hover:bg-pink-500/10"
              >
                <Radio className="w-4 h-4 mr-2" />
                Listen Live
              </Button>
            </div>
          </div>
        </div>

        {/* Legacy Restored Section */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold text-white mb-2 text-center">
            Legacy Restored
          </h3>
          <p className="text-center text-pink-300 mb-8">Content related to the primary subject &mdash; preserving what came before</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-slate-800/50 border-pink-500/20 hover:border-pink-500/50 transition-all">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-pink-400" />
                  <CardTitle className="text-2xl text-white">The Founder's Vision</CardTitle>
                </div>
                <CardDescription className="text-pink-300">
                  Building a legacy of music and community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-br from-pink-600/20 to-orange-600/20 rounded-lg p-6 border border-pink-500/20">
                  <p className="text-gray-300 mb-4">
                    Our founder envisioned a platform where music could heal, inspire, and unite communities.
                    This vision lives on through every broadcast, every song, and every listener who finds solace
                    in our programming.
                  </p>
                  <p className="text-sm text-pink-300 font-semibold">
                    Upcoming: The Complete Story &mdash; A comprehensive book documenting the journey, vision, and impact
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-pink-500/20 hover:border-pink-500/50 transition-all">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-pink-400" />
                  <CardTitle className="text-2xl text-white">Verified Documentation</CardTitle>
                </div>
                <CardDescription className="text-pink-300">
                  Authenticated records and source materials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-br from-pink-600/20 to-orange-600/20 rounded-lg p-6 border border-pink-500/20">
                  <p className="text-gray-300 mb-4">
                    All legacy content is fully sourced and verified for continual existence.
                    Documents are preserved through the Proof Vault system with authenticated
                    records and archival-grade storage.
                  </p>
                  <Button
                    onClick={() => setLocation('/proof-vault')}
                    variant="outline"
                    className="border-pink-500 text-pink-400 hover:bg-pink-500/10 w-full"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Access Proof Vault
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Legacy Media */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">
            Legacy Media
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 border-pink-500/20 hover:border-pink-500/50 transition-all cursor-pointer"
              onClick={() => window.open('https://www.rockinrockinboogie.com', '_blank')}>
              <CardContent className="pt-6 text-center">
                <Radio className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-white mb-2">Radio Station</h4>
                <p className="text-sm text-gray-300 mb-3">24/7 broadcasting with curated content, healing frequencies, and live shows</p>
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/50">Live Now</Badge>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-pink-500/20 hover:border-pink-500/50 transition-all cursor-pointer"
              onClick={() => setLocation('/podcast')}>
              <CardContent className="pt-6 text-center">
                <Mic className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-white mb-2">Podcast</h4>
                <p className="text-sm text-gray-300 mb-3">Stories, interviews, and community voices preserving the legacy narrative</p>
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/50">Episodes Available</Badge>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-pink-500/20 hover:border-pink-500/50 transition-all cursor-pointer"
              onClick={() => setLocation('/meditation')}>
              <CardContent className="pt-6 text-center">
                <Headphones className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-white mb-2">Healing Frequencies</h4>
                <p className="text-sm text-gray-300 mb-3">432Hz and Solfeggio frequencies for wellness, meditation, and healing</p>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/50">432Hz Default</Badge>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Community Impact */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">
            Community Impact
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-800/50 border-pink-500/20 text-center">
              <CardContent className="pt-6">
                <p className="text-3xl font-bold text-pink-400">24/7</p>
                <p className="text-sm text-gray-300">Broadcasting</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-pink-500/20 text-center">
              <CardContent className="pt-6">
                <p className="text-3xl font-bold text-orange-400">432Hz</p>
                <p className="text-sm text-gray-300">Default Frequency</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-pink-500/20 text-center">
              <CardContent className="pt-6">
                <p className="text-3xl font-bold text-purple-400">90%</p>
                <p className="text-sm text-gray-300">Autonomous</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-pink-500/20 text-center">
              <CardContent className="pt-6">
                <p className="text-3xl font-bold text-green-400">501(c)(3)</p>
                <p className="text-sm text-gray-300">Sweet Miracles</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-800/50 border-pink-500/20">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-pink-400" />
                    Canryn Production & Subsidiaries
                  </h4>
                  <div className="space-y-2">
                    {[
                      { name: "Little C", owner: "Carlos Kembrel" },
                      { name: "Sean's Music", owner: "Sean Hunter" },
                      { name: "Anna's", owner: "Tyanna Battle & LaShanna Russell" },
                      { name: "Jaelon Enterprises", owner: "Jaelon Hunter" },
                      { name: "Payten Music (BMI)", owner: "RRB Registration" },
                    ].map((sub, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-700/50 rounded-lg px-4 py-2 border border-pink-500/10">
                        <span className="font-semibold text-white text-sm">{sub.name}</span>
                        <span className="text-xs text-pink-300">{sub.owner}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-400" />
                    Sweet Miracles Mission
                  </h4>
                  <p className="text-gray-300 mb-4">
                    Sweet Miracles is a 501(c)(3) and 508 organization dedicated to being
                    "A Voice for the Voiceless." Through grants and donations, we provide
                    communities with access to essential tools, enabling them to produce their
                    own media, broadcast as they choose, and access information and communication.
                  </p>
                  <Button
                    onClick={() => setLocation('/donate')}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Support Sweet Miracles
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* What We Offer */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">
            What We Offer
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '📻', title: '24/7 Radio', description: 'Continuous broadcasting with curated content and live shows' },
              { icon: '🎵', title: 'Healing Frequencies', description: '432Hz and other therapeutic frequencies for wellness' },
              { icon: '🎮', title: 'Solbones Game', description: '4+3+2 sacred math dice game with frequency audio', path: '/solbones' },
              { icon: '❤️', title: 'Community Support', description: 'Sweet Miracles donations supporting vulnerable populations', path: '/donate' },
              { icon: '🌍', title: 'Global Reach', description: 'Connecting communities across continents' },
              { icon: '🔊', title: 'Autonomous Control', description: 'QUMUS orchestration for 24/7 seamless operation' },
            ].map((feature, idx) => (
              <Card
                key={idx}
                className="bg-slate-800/50 border-pink-500/20 hover:border-pink-500/50 transition-all cursor-pointer"
                onClick={() => feature.path && setLocation(feature.path)}
              >
                <CardContent className="pt-6">
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-pink-600/20 to-orange-600/20 rounded-xl border border-pink-500/20 p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Join Our Mission
          </h3>
          <p className="text-lg text-pink-300 mb-8 max-w-2xl mx-auto">
            Be part of a global community dedicated to healing, empowerment, and positive change.
            Support our mission through donations, participation, or simply by listening.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              onClick={() => setLocation('/donate')}
              className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700"
              size="lg"
            >
              <Heart className="w-4 h-4 mr-2" />
              Donate Now
            </Button>
            <Button
              onClick={() => window.open('https://www.rockinrockinboogie.com', '_blank')}
              variant="outline"
              className="border-pink-500 text-pink-400 hover:bg-pink-500/10"
              size="lg"
            >
              Listen Live
            </Button>
            <Button
              onClick={() => setLocation('/')}
              variant="outline"
              className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
              size="lg"
            >
              Back to Ecosystem
            </Button>
          </div>
        </section>
      </main>

      {/* Legal Disclaimer */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-6">
          <p className="text-xs text-gray-500 text-center">
            <strong className="text-gray-400">Legal Disclaimer:</strong> All content on this site is presented for informational
            and legacy preservation purposes. All rights reserved. Rockin Rockin Boogie is registered through
            Payten Music in BMI. Sweet Miracles is a registered 501(c)(3) and 508 organization.
            &copy; {new Date().getFullYear()} Canryn Production and its subsidiaries. All rights reserved.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-pink-500/20 bg-slate-900/50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="mb-2">
            Rockin Rockin Boogie &bull; "A Voice for the Voiceless"
          </p>
          <p className="text-sm">
            A Canryn Production and its subsidiaries &bull; Sweet Miracles 501(c)(3) & 508
          </p>
        </div>
      </footer>
    </div>
  );
}
