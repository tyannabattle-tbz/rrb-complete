
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { BrainCircuit, Clock, Waves, Target, Trees, Music, Info } from 'lucide-react';

const durations = [5, 10, 15, 20, 30];
const frequencies = ['432Hz', '528Hz', '639Hz', '741Hz', '852Hz'];
const focusAreas = ['Relaxation', 'Healing', 'Creativity', 'Sleep'];
const backgroundSounds = ['Nature', 'Ambient', 'Silence'];

export default function CustomMeditationBuilder() {
  const [duration, setDuration] = useState<number>(10);
  const [frequency, setFrequency] = useState<string>('432Hz');
  const [focus, setFocus] = useState<string>('Relaxation');
  const [sound, setSound] = useState<string>('Nature');

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-12">
          <div className="inline-block bg-red-500/10 p-4 rounded-full mb-4">
            <BrainCircuit className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Custom Meditation Builder</h1>
          <p className="mt-4 text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto">
            Craft your unique meditation experience. Tailor every aspect of your session to perfectly suit your needs and intentions for a deeper, more effective practice.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Build Your Session</CardTitle>
                <CardDescription>Select your preferences from the options below.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="duration" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="duration"><Clock className="w-4 h-4 mr-2"/>Duration</TabsTrigger>
                    <TabsTrigger value="frequency"><Waves className="w-4 h-4 mr-2"/>Frequency</TabsTrigger>
                    <TabsTrigger value="focus"><Target className="w-4 h-4 mr-2"/>Focus</TabsTrigger>
                    <TabsTrigger value="sound"><Trees className="w-4 h-4 mr-2"/>Sound</TabsTrigger>
                  </TabsList>

                  <TabsContent value="duration">
                    <p className="text-sm text-foreground/70 mb-4">Choose the length of your meditation session. Shorter sessions are great for a quick reset, while longer ones allow for deeper immersion.</p>
                    <div className="flex flex-wrap gap-2">
                      {durations.map(d => (
                        <button key={d} onClick={() => setDuration(d)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${duration === d ? 'bg-red-500 text-white' : 'bg-background hover:bg-card'}`}>
                          {d} min
                        </button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="frequency">
                     <p className="text-sm text-foreground/70 mb-4">Select a Solfeggio frequency to tune your mind. Each frequency is associated with specific spiritual and healing benefits.</p>
                    <div className="flex flex-wrap gap-2">
                      {frequencies.map(f => (
                        <button key={f} onClick={() => setFrequency(f)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${frequency === f ? 'bg-amber-500 text-white' : 'bg-background hover:bg-card'}`}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="focus">
                    <p className="text-sm text-foreground/70 mb-4">Define the primary intention for your practice. This will help guide your thoughts and energy during the session.</p>
                    <div className="flex flex-wrap gap-2">
                      {focusAreas.map(fa => (
                        <button key={fa} onClick={() => setFocus(fa)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${focus === fa ? 'bg-orange-500 text-white' : 'bg-background hover:bg-card'}`}>
                          {fa}
                        </button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="sound">
                    <p className="text-sm text-foreground/70 mb-4">Choose a background soundscape to accompany your meditation. This can help mask distractions and deepen your state of relaxation.</p>
                    <div className="flex flex-wrap gap-2">
                      {backgroundSounds.map(s => (
                        <button key={s} onClick={() => setSound(s)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${sound === s ? 'bg-red-500 text-white' : 'bg-background hover:bg-card'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="bg-card border-border sticky top-8">
              <CardHeader>
                <CardTitle>Your Custom Session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-foreground/80 flex items-center"><Clock className="w-4 h-4 mr-2"/>Duration</span>
                  <span className="font-semibold text-red-500">{duration} minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/80 flex items-center"><Waves className="w-4 h-4 mr-2"/>Frequency</span>
                  <span className="font-semibold text-amber-500">{frequency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/80 flex items-center"><Target className="w-4 h-4 mr-2"/>Focus Area</span>
                  <span className="font-semibold text-orange-500">{focus}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/80 flex items-center"><Trees className="w-4 h-4 mr-2"/>Background</span>
                  <span className="font-semibold text-red-500">{sound}</span>
                </div>
                <button className="w-full mt-4 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors font-semibold">
                  Begin Session (UI Only)
                </button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="flex items-center"><Info className="w-5 h-5 mr-2 text-amber-500"/>Related Platforms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <a href="https://sweetmiraclesattt.wixsite.com/sweet-miracles" target="_blank" rel="noopener noreferrer" className="block text-red-500 hover:underline">Sweet Miracles Community</a>
                    <p className="text-sm text-foreground/70">Explore our outreach programs and community initiatives.</p>
                    <Link href="/rrb/qumus/monitoring" className="block text-red-500 hover:underline">QUMUS Orchestration</Link>
                    <p className="text-sm text-foreground/70">Discover the future of autonomous music creation.</p>
                    <Link href="/rrb/hybridcast" className="block text-red-500 hover:underline">HybridCast Broadcasts</Link>
                    <p className="text-sm text-foreground/70">Tune into our emergency broadcast and public information system.</p>
                </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 border-t border-border mt-12">
        <p className="text-sm text-foreground/60">
          &copy; {new Date().getFullYear()} Canryn Production Inc. All Rights Reserved.
        </p>
        <p className="text-xs text-foreground/50 mt-1">
          In memory of Seabrun Candy Hunter, a voice for the voiceless.
        </p>
      </footer>
    </div>
  );
}
