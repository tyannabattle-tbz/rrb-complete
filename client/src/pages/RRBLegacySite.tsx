import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radio, Music, Heart, Globe } from 'lucide-react';

export default function RRBLegacySite() {
  const [isSpinning, setIsSpinning] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* UN Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Globe className="w-5 h-5" />
          <p className="text-sm font-semibold">United Nations Sustainable Development Goals</p>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-pink-500/20 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Radio className="w-8 h-8 text-pink-400 animate-pulse" />
              <div>
                <h1 className="text-3xl font-bold text-white">Rockin Rockin Boogie</h1>
                <p className="text-sm text-pink-300">Legacy Restored • A Voice for the Voiceless</p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
              🟢 Legacy Active
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Spinning Record Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
          {/* Spinning Vinyl */}
          <div className="flex justify-center">
            <div className="relative w-64 h-64">
              {/* Vinyl Record */}
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-br from-gray-900 via-black to-gray-800 shadow-2xl flex items-center justify-center ${
                  isSpinning ? 'animate-spin' : ''
                }`}
                style={{
                  animationDuration: isSpinning ? '8s' : '0s',
                  boxShadow: '0 0 60px rgba(236, 72, 153, 0.5), inset 0 0 40px rgba(0, 0, 0, 0.9)',
                }}
              >
                {/* Vinyl Grooves */}
                <div className="absolute inset-4 rounded-full border-8 border-gray-700 opacity-30"></div>
                <div className="absolute inset-8 rounded-full border-4 border-gray-600 opacity-20"></div>

                {/* Center Label */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-600 to-orange-600 flex items-center justify-center shadow-lg">
                    <Music className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>

              {/* Needle */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-1 h-16 bg-gray-400 rounded-full origin-bottom"
                style={{
                  transform: 'translateX(-50%) rotate(-15deg)',
                  boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)',
                }}
              ></div>
            </div>
          </div>

          {/* Legacy Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-white mb-4">
                A Legacy of Music & Community
              </h2>
              <p className="text-lg text-pink-300 mb-4">
                Rockin Rockin Boogie stands as a testament to the power of music to unite, inspire, and heal. 
                Founded on principles of community, creativity, and compassion, our legacy continues to resonate 
                through generations.
              </p>
              <p className="text-gray-300">
                "A Voice for the Voiceless" - This mission drives everything we do, from our 24/7 radio broadcasts 
                to our healing frequency programming and community outreach initiatives.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setIsSpinning(!isSpinning)}
                className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700"
              >
                {isSpinning ? '⏸ Pause' : '▶ Play'}
              </Button>
              <Button
                variant="outline"
                className="border-pink-500 text-pink-400 hover:bg-pink-500/10"
              >
                Listen Live
              </Button>
            </div>
          </div>
        </div>

        {/* Family & Heritage Section */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">
            Our Heritage
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Dad's Legacy */}
            <Card className="bg-slate-800/50 border-pink-500/20 hover:border-pink-500/50 transition-all">
              <CardHeader>
                <CardTitle className="text-2xl text-white">The Founder's Vision</CardTitle>
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
                    📚 Upcoming: The Complete Story - A comprehensive book documenting the journey, vision, and impact
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Community Impact */}
            <Card className="bg-slate-800/50 border-pink-500/20 hover:border-pink-500/50 transition-all">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Community Impact</CardTitle>
                <CardDescription className="text-pink-300">
                  Voices amplified, lives changed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-pink-500/20">
                    <p className="text-3xl font-bold text-pink-400">24/7</p>
                    <p className="text-sm text-gray-300">Broadcasting</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-pink-500/20">
                    <p className="text-3xl font-bold text-orange-400">∞</p>
                    <p className="text-sm text-gray-300">Listeners Worldwide</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">
                  Through music, healing frequencies, and community programs, we continue to be 
                  "A Voice for the Voiceless" and create lasting positive change.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">
            What We Offer
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '📻',
                title: '24/7 Radio',
                description: 'Continuous broadcasting with curated content and live shows',
              },
              {
                icon: '🎵',
                title: 'Healing Frequencies',
                description: '432Hz and other therapeutic frequencies for wellness',
              },
              {
                icon: '🎮',
                title: 'Solbones Game',
                description: '4+3+2 sacred math dice game with frequency audio',
              },
              {
                icon: '❤️',
                title: 'Community Support',
                description: 'Sweet Miracles donations supporting vulnerable populations',
              },
              {
                icon: '🌍',
                title: 'Global Reach',
                description: 'Connecting communities across continents',
              },
              {
                icon: '🔊',
                title: 'Autonomous Control',
                description: 'QUMUS orchestration for 24/7 seamless operation',
              },
            ].map((feature, idx) => (
              <Card key={idx} className="bg-slate-800/50 border-pink-500/20 hover:border-pink-500/50 transition-all">
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
        <section className="bg-gradient-to-r from-pink-600/20 to-orange-600/20 rounded-lg border border-pink-500/20 p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Join Our Mission
          </h3>
          <p className="text-lg text-pink-300 mb-8 max-w-2xl mx-auto">
            Be part of a global community dedicated to healing, empowerment, and positive change. 
            Support our mission through donations, participation, or simply by listening.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700">
              <Heart className="w-4 h-4 mr-2" />
              Donate Now
            </Button>
            <Button
              variant="outline"
              className="border-pink-500 text-pink-400 hover:bg-pink-500/10"
            >
              Learn More
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-pink-500/20 bg-slate-900/50 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="mb-2">
            Rockin Rockin Boogie • "A Voice for the Voiceless"
          </p>
          <p className="text-sm">
            Supporting Sweet Miracles 501(c)(3) • Registered with BMI through Payten Music
          </p>
        </div>
      </footer>
    </div>
  );
}
