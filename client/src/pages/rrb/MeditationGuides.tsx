/**
 * Meditation Guides - Guided Meditation with Healing Frequencies
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Moon, Sun, Heart, Brain, Clock, Waves, Wind, Coffee, Bed, Sparkles } from 'lucide-react';
import { Link } from 'wouter';

interface MeditationGuide {
  id: string;
  title: string;
  category: string;
  duration: string;
  frequency: string;
  difficulty: string;
  description: string;
  steps: string[];
  benefits: string[];
  icon: typeof Moon;
}

const guides: MeditationGuide[] = [
  {
    id: 'morning-awakening',
    title: 'Top of the Sol Awakening',
    category: 'morning',
    duration: '10 minutes',
    frequency: '528 Hz',
    difficulty: 'Beginner',
    description: 'Start your day with intention and clarity. This morning meditation uses the Love Frequency to set a positive tone for everything that follows.',
    steps: [
      'Find a comfortable seated position. Close your eyes gently.',
      'Take 5 deep breaths — in through the nose, out through the mouth.',
      'Set an intention for your day. What do you want to create?',
      'Visualize golden light filling your body from the crown of your head.',
      'Listen to the 528 Hz tone and feel it resonating in your chest.',
      'Slowly expand your awareness to include the room around you.',
      'When ready, open your eyes and carry your intention forward.',
    ],
    benefits: ['Increased morning energy', 'Mental clarity', 'Positive intention setting', 'Reduced morning anxiety'],
    icon: Sun,
  },
  {
    id: 'stress-relief',
    title: 'Stress Relief & Release',
    category: 'healing',
    duration: '15 minutes',
    frequency: '396 Hz',
    difficulty: 'Beginner',
    description: 'Release accumulated stress and tension using the Liberation frequency. This guide helps you identify where you hold stress and consciously let it go.',
    steps: [
      'Lie down or sit comfortably. Close your eyes.',
      'Begin with 3 rounds of box breathing: inhale 4 counts, hold 4, exhale 4, hold 4.',
      'Scan your body from head to toe. Notice where tension lives.',
      'With each exhale, imagine the tension dissolving into light.',
      'Listen to the 396 Hz tone and feel it vibrating through tense areas.',
      'Visualize each worry as a leaf floating down a stream — acknowledge it, then let it pass.',
      'Return to your breath. Feel the lightness in your body.',
      'Slowly bring awareness back to the room. Open your eyes when ready.',
    ],
    benefits: ['Reduced cortisol levels', 'Muscle tension release', 'Emotional processing', 'Improved sleep quality'],
    icon: Wind,
  },
  {
    id: 'creative-flow',
    title: 'Creative Flow State',
    category: 'creativity',
    duration: '20 minutes',
    frequency: '432 Hz',
    difficulty: 'Intermediate',
    description: 'Enter a state of creative flow using the Universal Harmony frequency. Seabrun Candy Hunter accessed this state naturally — now you can too.',
    steps: [
      'Sit comfortably with a journal or creative tool nearby.',
      'Close your eyes and take 7 slow, deep breaths.',
      'Imagine a door in front of you — this is the door to your creative space.',
      'Step through the door. What do you see? What do you hear?',
      'Let the 432 Hz tone guide you deeper into this creative landscape.',
      'Allow ideas to flow without judgment. There are no wrong answers here.',
      'When an idea feels right, hold it gently. Let it develop.',
      'Slowly return through the door, bringing your creative insight with you.',
      'Open your eyes and immediately capture what came to you.',
    ],
    benefits: ['Enhanced creativity', 'Reduced creative blocks', 'Deeper artistic connection', 'Flow state access'],
    icon: Sparkles,
  },
  {
    id: 'evening-wind-down',
    title: 'Evening Wind-Down',
    category: 'evening',
    duration: '15 minutes',
    frequency: '174 Hz',
    difficulty: 'Beginner',
    description: 'Prepare your body and mind for restful sleep with the Foundation frequency. This gentle meditation eases the transition from wakefulness to rest.',
    steps: [
      'Dim the lights and find a comfortable position in bed.',
      'Close your eyes and take 5 slow breaths.',
      'Reflect on 3 things you are grateful for from today.',
      'Let the 174 Hz tone wash over you like warm water.',
      'Starting from your toes, consciously relax each part of your body.',
      'Imagine yourself sinking gently into a cloud of comfort.',
      'Release any remaining thoughts — they will be there tomorrow.',
      'Continue breathing slowly as you drift toward sleep.',
    ],
    benefits: ['Faster sleep onset', 'Deeper sleep quality', 'Reduced nighttime anxiety', 'Physical relaxation'],
    icon: Moon,
  },
  {
    id: 'heart-opening',
    title: 'Heart Opening Meditation',
    category: 'healing',
    duration: '20 minutes',
    frequency: '639 Hz',
    difficulty: 'Intermediate',
    description: 'Open your heart center using the Connection frequency. This meditation strengthens your capacity for love, compassion, and meaningful relationships.',
    steps: [
      'Sit comfortably with your hands resting on your heart.',
      'Close your eyes and feel your heartbeat beneath your palms.',
      'Breathe into your heart space — imagine your chest expanding with each inhale.',
      'Think of someone you love unconditionally. Feel that warmth.',
      'Let the 639 Hz tone amplify that feeling of love.',
      'Now extend that love outward — to your community, your world.',
      'Visualize green light radiating from your heart in all directions.',
      'Hold this expanded state of love for several minutes.',
      'Slowly return your awareness to your hands on your heart.',
      'Open your eyes, carrying this openness with you.',
    ],
    benefits: ['Increased empathy', 'Stronger relationships', 'Emotional healing', 'Heart chakra activation'],
    icon: Heart,
  },
  {
    id: 'deep-focus',
    title: 'Deep Focus & Clarity',
    category: 'focus',
    duration: '10 minutes',
    frequency: '852 Hz',
    difficulty: 'Advanced',
    description: 'Achieve laser-sharp mental focus using the Intuition frequency. Ideal before important work, study sessions, or decision-making.',
    steps: [
      'Sit upright with your spine straight. Close your eyes.',
      'Take 3 sharp, energizing breaths.',
      'Focus your attention on the point between your eyebrows.',
      'Let the 852 Hz tone sharpen your mental focus.',
      'Visualize a single point of white light at your third eye.',
      'Hold your focus on this point. When thoughts arise, return to the light.',
      'Feel your mind becoming clear, sharp, and ready.',
      'Open your eyes with renewed focus and clarity.',
    ],
    benefits: ['Enhanced concentration', 'Mental clarity', 'Improved decision-making', 'Intuitive insight'],
    icon: Brain,
  },
];

const categories = [
  { id: 'all', label: 'All Guides' },
  { id: 'morning', label: 'Morning' },
  { id: 'healing', label: 'Healing' },
  { id: 'creativity', label: 'Creativity' },
  { id: 'evening', label: 'Evening' },
  { id: 'focus', label: 'Focus' },
];

export default function MeditationGuides() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);

  const filtered = activeCategory === 'all'
    ? guides
    : guides.filter(g => g.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-teal-500/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Moon className="w-16 h-16 text-teal-500 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Meditation Guides</h1>
          <p className="text-xl text-foreground/70 mb-2">Guided Meditation with Healing Frequencies</p>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Combine the power of guided meditation with Solfeggio healing frequencies for a transformative 
            experience that nurtures body, mind, and spirit.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 px-4 border-b border-border">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-2 justify-center">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? 'bg-teal-500 text-white'
                  : 'bg-card hover:bg-card/80 text-foreground/70 border border-border'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Guides */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {filtered.map((guide) => (
            <Card
              key={guide.id}
              className={`cursor-pointer transition-all hover:border-teal-500/30 ${
                expandedGuide === guide.id ? 'ring-2 ring-teal-500/30' : ''
              }`}
              onClick={() => setExpandedGuide(expandedGuide === guide.id ? null : guide.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-teal-500/10">
                      <guide.icon className="w-6 h-6 text-teal-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg mb-1">{guide.title}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-muted text-foreground/60">
                          <Clock className="w-3 h-3" /> {guide.duration}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-muted text-foreground/60">
                          <Waves className="w-3 h-3" /> {guide.frequency}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-muted text-foreground/60">
                          {guide.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-foreground/70 mt-2">{guide.description}</p>
              </CardHeader>

              {expandedGuide === guide.id && (
                <CardContent className="pt-0 space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Step-by-Step Guide</h4>
                    <ol className="space-y-2">
                      {guide.steps.map((step, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-foreground/70">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500/20 text-teal-500 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="bg-teal-500/5 border border-teal-500/20 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Benefits</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {guide.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-foreground/70">
                          <Heart className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 bg-teal-500/5 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Create Your Own Practice</h2>
          <p className="text-foreground/70 mb-6">
            Build a custom meditation session tailored to your needs with our interactive builder.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rrb/custom-meditation-builder">
              <span className="inline-flex items-center px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors cursor-pointer">
                <Sparkles className="mr-2 w-4 h-4" /> Custom Meditation Builder
              </span>
            </Link>
            <Link href="/rrb/frequency-guides">
              <span className="inline-flex items-center px-6 py-3 border border-teal-500 text-teal-500 hover:bg-teal-500/10 rounded-lg font-medium transition-colors cursor-pointer">
                <Waves className="mr-2 w-4 h-4" /> Frequency Guides
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-foreground/50">
            Meditation guides are presented for wellness and educational purposes. They are not a substitute 
            for professional medical or psychological treatment. Part of the Seabrun Candy Hunter Legacy Archive.
          </p>
        </div>
      </section>
    </div>
  );
}
