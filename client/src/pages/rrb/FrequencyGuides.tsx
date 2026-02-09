/**
 * Frequency Guides - Educational Guide to Healing Frequencies
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Waves, Heart, Brain, Zap, Shield, Music, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

const solfeggioGuides = [
  {
    hz: '174 Hz', name: 'Pain Relief & Security', chakra: 'Root',
    benefits: ['Reduces physical pain', 'Provides sense of security', 'Grounds and stabilizes energy', 'Relieves tension in muscles'],
    howToUse: 'Listen during rest or before sleep. Place focus on areas of physical discomfort. Allow the low vibration to wash over you for 15-20 minutes.',
  },
  {
    hz: '285 Hz', name: 'Tissue Healing', chakra: 'Sacral',
    benefits: ['Promotes cellular repair', 'Restores damaged tissue', 'Boosts immune response', 'Enhances energy field integrity'],
    howToUse: 'Best used during recovery from illness or injury. Listen with headphones for 20-30 minutes. Visualize healing light flowing to affected areas.',
  },
  {
    hz: '396 Hz', name: 'Liberation from Fear', chakra: 'Root',
    benefits: ['Releases guilt and fear', 'Transforms grief into joy', 'Helps achieve goals', 'Clears subconscious blocks'],
    howToUse: 'Listen during morning meditation to set intentions. Focus on releasing negative emotions. Journal after listening to process what surfaces.',
  },
  {
    hz: '417 Hz', name: 'Facilitating Change', chakra: 'Sacral',
    benefits: ['Undoes negative situations', 'Facilitates change', 'Cleanses traumatic experiences', 'Encourages fresh starts'],
    howToUse: 'Use during times of transition or when feeling stuck. Listen for 15 minutes while focusing on what you want to change. Pair with deep breathing.',
  },
  {
    hz: '432 Hz', name: 'Universal Harmony (Drop Radio)', chakra: 'Heart',
    benefits: ['Aligns with Earth\'s natural resonance', 'Promotes deep calm', 'Enhances musical enjoyment', 'Reduces anxiety and stress'],
    howToUse: 'This is the frequency of Drop Radio on the RRB platform. Listen throughout the day as background music. Ideal for work, study, or relaxation.',
    featured: true,
  },
  {
    hz: '528 Hz', name: 'Transformation & Miracles', chakra: 'Solar Plexus',
    benefits: ['DNA repair and restoration', 'Increases life energy', 'Promotes clarity of mind', 'Activates creativity and imagination'],
    howToUse: 'Listen during creative work or problem-solving. Use as background during healing sessions. Focus on transformation and positive change.',
    featured: true,
  },
  {
    hz: '639 Hz', name: 'Harmonious Relationships', chakra: 'Heart',
    benefits: ['Enhances communication', 'Promotes understanding', 'Strengthens relationships', 'Builds community connection'],
    howToUse: 'Listen before important conversations or social gatherings. Use during couples meditation. Focus on opening your heart to connection.',
  },
  {
    hz: '741 Hz', name: 'Awakening Intuition', chakra: 'Throat',
    benefits: ['Cleanses cells of toxins', 'Promotes self-expression', 'Solves problems intuitively', 'Awakens inner knowing'],
    howToUse: 'Listen during journaling or creative expression. Use when facing difficult decisions. Pair with throat chakra meditation for enhanced effect.',
  },
  {
    hz: '852 Hz', name: 'Spiritual Awareness', chakra: 'Third Eye',
    benefits: ['Returns to spiritual order', 'Raises awareness', 'Opens intuition', 'Sees through illusions'],
    howToUse: 'Use during deep meditation or prayer. Listen in a quiet, darkened room. Focus on the space between your eyebrows (third eye point).',
  },
  {
    hz: '963 Hz', name: 'Divine Connection', chakra: 'Crown',
    benefits: ['Awakens perfect state', 'Connects to higher consciousness', 'Activates pineal gland', 'Promotes oneness'],
    howToUse: 'Reserve for deep spiritual practice. Listen in complete stillness. Use sparingly — this is the highest Solfeggio frequency and can be intense.',
  },
];

export default function FrequencyGuides() {
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-indigo-500/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <BookOpen className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Frequency Guides</h1>
          <p className="text-xl text-foreground/70 mb-2">Your Complete Guide to Healing Frequencies</p>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Understanding the science and application of Solfeggio frequencies for physical healing, 
            emotional balance, and spiritual growth.
          </p>
        </div>
      </section>

      {/* What Are Solfeggio Frequencies */}
      <section className="py-12 px-4 bg-card/50 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-6">What Are Solfeggio Frequencies?</h2>
          <div className="space-y-4 text-foreground/70">
            <p>
              The Solfeggio frequencies are a set of ancient musical tones that were used in sacred music, 
              including Gregorian Chants. These frequencies were believed to impart spiritual blessings and 
              healing when sung in harmony. Rediscovered in the 1970s by Dr. Joseph Puleo, these frequencies 
              form a six-tone scale that has been used for centuries in meditation and healing practices.
            </p>
            <p>
              Each frequency corresponds to a specific aspect of physical, emotional, or spiritual well-being. 
              Modern research has begun to validate what ancient practitioners knew intuitively — that specific 
              sound frequencies can influence cellular function, brain wave patterns, and emotional states.
            </p>
            <p>
              Seabrun Candy Hunter's music naturally incorporated many of these healing vibrations. His gospel 
              roots connected him to the same musical traditions that gave rise to the Solfeggio scale, and his 
              compositions carry the healing intention that has been part of sacred music for millennia.
            </p>
          </div>
        </div>
      </section>

      {/* Frequency Guide Cards */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">Complete Frequency Reference</h2>
          <div className="space-y-4">
            {solfeggioGuides.map((guide) => (
              <Card
                key={guide.hz}
                className={`cursor-pointer transition-all hover:border-indigo-500/30 ${
                  guide.featured ? 'border-amber-500/30 ring-1 ring-amber-500/10' : ''
                } ${expandedGuide === guide.hz ? 'ring-2 ring-indigo-500/30' : ''}`}
                onClick={() => setExpandedGuide(expandedGuide === guide.hz ? null : guide.hz)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-indigo-500">{guide.hz}</div>
                      <div>
                        <CardTitle className="text-lg">{guide.name}</CardTitle>
                        <p className="text-sm text-foreground/50">Chakra: {guide.chakra}</p>
                      </div>
                    </div>
                    <ArrowRight className={`w-5 h-5 text-foreground/30 transition-transform ${
                      expandedGuide === guide.hz ? 'rotate-90' : ''
                    }`} />
                  </div>
                </CardHeader>

                {expandedGuide === guide.hz && (
                  <CardContent className="pt-0 space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Benefits</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {guide.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-foreground/70">
                            <Zap className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-foreground mb-1">How to Use</h4>
                      <p className="text-sm text-foreground/70">{guide.howToUse}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-12 px-4 bg-card/50 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">Getting the Most from Frequency Healing</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Use Headphones</h3>
                <p className="text-sm text-foreground/70">
                  For the most effective experience, use quality headphones to ensure the full frequency 
                  range reaches your ears without environmental interference.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Set Intention</h3>
                <p className="text-sm text-foreground/70">
                  Before each session, set a clear intention for what you want to achieve. 
                  Intention amplifies the effect of frequency-based healing.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Brain className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Be Consistent</h3>
                <p className="text-sm text-foreground/70">
                  Regular practice yields the best results. Even 10-15 minutes daily can create 
                  meaningful shifts in your physical and emotional well-being.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rrb/healing-music-frequencies">
              <span className="inline-flex items-center px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors cursor-pointer">
                <Waves className="mr-2 w-4 h-4" /> Healing Frequencies Overview
              </span>
            </Link>
            <Link href="/rrb/meditation-guides">
              <span className="inline-flex items-center px-6 py-3 border border-indigo-500 text-indigo-500 hover:bg-indigo-500/10 rounded-lg font-medium transition-colors cursor-pointer">
                <Music className="mr-2 w-4 h-4" /> Meditation Guides
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-foreground/50">
            Frequency guides are presented for educational and wellness purposes. This information is not 
            a substitute for professional medical advice. Part of the Seabrun Candy Hunter Legacy Archive.
          </p>
        </div>
      </section>
    </div>
  );
}
