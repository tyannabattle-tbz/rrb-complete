/**
 * Healing Music Frequencies - The Science & Spirit of Sound
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Music, Heart, Brain, Waves, Zap, Sun, Moon, Sparkles } from 'lucide-react';
import { Link } from 'wouter';

const frequencies = [
  {
    hz: '174 Hz',
    name: 'Foundation',
    description: 'The lowest of the Solfeggio frequencies, 174 Hz acts as a natural anesthetic. It tends to reduce pain physically and energetically, giving organs a sense of security and comfort.',
    color: 'from-red-500/20 to-red-500/5',
    border: 'border-red-500/30',
    icon: Heart,
  },
  {
    hz: '285 Hz',
    name: 'Restoration',
    description: 'This frequency helps return tissue to its original form. It influences energy fields, sending a message to restructure damaged organs and tissue.',
    color: 'from-orange-500/20 to-orange-500/5',
    border: 'border-orange-500/30',
    icon: Zap,
  },
  {
    hz: '396 Hz',
    name: 'Liberation',
    description: 'This frequency liberates the energy of guilt and fear. It is used to awaken and turn grief into joy, helping to achieve goals in the most direct way.',
    color: 'from-yellow-500/20 to-yellow-500/5',
    border: 'border-yellow-500/30',
    icon: Sun,
  },
  {
    hz: '432 Hz',
    name: 'Drop Radio',
    description: 'Known as the natural frequency of the universe, 432 Hz resonates with the Schumann Resonance of the Earth. Music tuned to this frequency is said to be more harmonious and pleasant, promoting emotional calm and physical healing. This is the frequency behind Drop Radio on the RRB platform.',
    color: 'from-amber-500/20 to-amber-500/5',
    border: 'border-amber-500/30',
    icon: Waves,
    featured: true,
  },
  {
    hz: '528 Hz',
    name: 'Love Frequency',
    description: 'Known as the "Love Frequency" or "Miracle Tone," 528 Hz is central to the musical mathematical matrix of creation. It has been used by biochemists to repair DNA and is associated with transformation and miracles.',
    color: 'from-green-500/20 to-green-500/5',
    border: 'border-green-500/30',
    icon: Heart,
    featured: true,
  },
  {
    hz: '639 Hz',
    name: 'Connection',
    description: 'This frequency enables the creation of harmonious interpersonal relationships. It enhances communication, understanding, tolerance, and love — the building blocks of community.',
    color: 'from-teal-500/20 to-teal-500/5',
    border: 'border-teal-500/30',
    icon: Activity,
  },
  {
    hz: '741 Hz',
    name: 'Expression',
    description: 'Used for solving problems and awakening intuition, 741 Hz cleans cells of toxins and electromagnetic radiation. It promotes a healthier, simpler life and encourages self-expression.',
    color: 'from-blue-500/20 to-blue-500/5',
    border: 'border-blue-500/30',
    icon: Sparkles,
  },
  {
    hz: '852 Hz',
    name: 'Intuition',
    description: 'This frequency is linked to the ability to see through illusions and return to spiritual order. It raises awareness and opens the person to spiritual experiences.',
    color: 'from-indigo-500/20 to-indigo-500/5',
    border: 'border-indigo-500/30',
    icon: Brain,
  },
  {
    hz: '963 Hz',
    name: 'Divine Connection',
    description: 'Known as the frequency of the Gods, 963 Hz awakens any system to its original, perfect state. It enables a return to oneness and connection with the spiritual world.',
    color: 'from-purple-500/20 to-purple-500/5',
    border: 'border-purple-500/30',
    icon: Moon,
  },
];

export default function HealingMusicFrequencies() {
  const [selectedFreq, setSelectedFreq] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-purple-500/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Waves className="w-16 h-16 text-purple-500 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Healing Music Frequencies</h1>
          <p className="text-xl text-foreground/70 mb-2">The Science & Spirit of Sound</p>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Music is more than melody — it is vibration. Every frequency carries energy that can heal, restore, 
            and transform. Seabrun Candy Hunter understood this instinctively, weaving healing frequencies into 
            compositions that touched both body and soul.
          </p>
        </div>
      </section>

      {/* Connection to Legacy */}
      <section className="py-12 px-4 bg-card/50 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-amber-500/10 to-purple-500/10 border-amber-500/20">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">The Seabrun Candy Hunter Connection</h2>
              <p className="text-foreground/70 mb-4">
                Long before the modern wellness movement embraced healing frequencies, Seabrun Candy Hunter was 
                creating music that naturally resonated at these transformative vibrations. His gospel roots taught 
                him that music was medicine for the soul — and his compositions proved it.
              </p>
              <p className="text-foreground/70">
                The RRB platform's Drop Radio stream broadcasts at 432 Hz, honoring the tradition of natural tuning 
                that Seabrun championed throughout his career. Every broadcast carries the healing intention that was 
                embedded in the original recordings.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Frequency Grid */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">The Solfeggio Scale & Beyond</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {frequencies.map((freq) => (
              <Card
                key={freq.hz}
                className={`cursor-pointer transition-all hover:scale-[1.02] ${freq.border} ${
                  freq.featured ? 'ring-1 ring-amber-500/30' : ''
                } ${selectedFreq === freq.hz ? 'ring-2 ring-purple-500/50' : ''}`}
                onClick={() => setSelectedFreq(selectedFreq === freq.hz ? null : freq.hz)}
              >
                <CardHeader className={`bg-gradient-to-b ${freq.color} rounded-t-lg`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{freq.hz}</p>
                      <CardTitle className="text-lg">{freq.name}</CardTitle>
                    </div>
                    <freq.icon className="w-8 h-8 text-foreground/50" />
                  </div>
                  {freq.featured && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-500 w-fit">
                      <Sparkles className="w-3 h-3" /> Featured on RRB
                    </span>
                  )}
                </CardHeader>
                {(selectedFreq === freq.hz || freq.featured) && (
                  <CardContent className="pt-4">
                    <p className="text-sm text-foreground/70">{freq.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="py-12 px-4 bg-card/50 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">How to Experience Healing Frequencies</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <Music className="w-8 h-8 text-purple-500 mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Listen to Drop Radio</h3>
                <p className="text-sm text-foreground/70">
                  Tune into the RRB Radio Station's Drop Radio stream for continuous 432 Hz healing music, 
                  curated from Seabrun Candy Hunter's catalog and complementary healing compositions.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Brain className="w-8 h-8 text-indigo-500 mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Guided Meditation</h3>
                <p className="text-sm text-foreground/70">
                  Combine healing frequencies with guided meditation for deeper relaxation and spiritual 
                  connection. Our meditation guides are designed to work with specific frequencies.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Heart className="w-8 h-8 text-red-500 mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Daily Wellness</h3>
                <p className="text-sm text-foreground/70">
                  Incorporate frequency-based music into your daily routine — during work, exercise, sleep, 
                  or relaxation — to experience cumulative healing benefits over time.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Activity className="w-8 h-8 text-green-500 mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Build Your Session</h3>
                <p className="text-sm text-foreground/70">
                  Use our Custom Meditation Builder to create personalized healing sessions with your 
                  preferred frequency, duration, and focus area.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 bg-gradient-to-b from-purple-500/5 to-background border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Start Your Healing Journey</h2>
          <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
            Whether you are seeking physical healing, emotional balance, or spiritual connection, 
            the power of frequency-based music is available to you right now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rrb/radio-station">
              <span className="inline-flex items-center px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors cursor-pointer">
                <Music className="mr-2 w-4 h-4" /> Listen to Drop Radio
              </span>
            </Link>
            <Link href="/rrb/frequency-guides">
              <span className="inline-flex items-center px-6 py-3 border border-purple-500 text-purple-500 hover:bg-purple-500/10 rounded-lg font-medium transition-colors cursor-pointer">
                <Waves className="mr-2 w-4 h-4" /> Frequency Guides
              </span>
            </Link>
            <Link href="/rrb/custom-meditation-builder">
              <span className="inline-flex items-center px-6 py-3 border border-purple-500 text-purple-500 hover:bg-purple-500/10 rounded-lg font-medium transition-colors cursor-pointer">
                <Brain className="mr-2 w-4 h-4" /> Build a Session
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-foreground/50">
            Information about healing frequencies is presented for educational and wellness purposes. 
            Frequency-based music is not a substitute for professional medical treatment. 
            Content is part of the Seabrun Candy Hunter Legacy Archive.
          </p>
        </div>
      </section>
    </div>
  );
}
