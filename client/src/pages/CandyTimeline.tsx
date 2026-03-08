import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Music, Mic2, FileText, Film } from 'lucide-react';

const TIMELINE_EVENTS = [
  { era: 'Early 1970s', title: 'Candy Enters Richard\'s World', description: 'Seabrun "Candy" Hunter Jr. joins Little Richard\'s touring organization, taking on multiple roles including bandleader, songwriter, and engineer.', type: 'milestone', icon: Music },
  { era: '1970s', title: 'Touring Era', description: 'Candy serves as bandleader, singing the opening of shows and managing the band. He becomes a trusted member of Richard\'s inner circle.', type: 'period', icon: Mic2 },
  { era: '1970s', title: 'Rockin\' Rockin\' Boogie Co-Written', description: 'Candy and Richard co-write Rockin\' Rockin\' Boogie. The song is later registered with BMI as a reconciled 50/50 split between Seabrun Whitney Hunter and Richard W. Penniman.', type: 'milestone', icon: Music },
  { era: '1970s', title: 'Nashville Recording Session', description: 'Candy describes a recording session at Pete Drake\'s Nashville studio where "I Saw What You Did" and "Standing Right Here" were recorded. Alvin Taylor played drums.', type: 'session', icon: Music },
  { era: '1970s', title: 'Lost Masters', description: 'According to Candy\'s writings, the master recordings from the Nashville session were lost while touring. Candy wrote that they "had a good idea where it was."', type: 'event', icon: FileText },
  { era: 'Post-Touring', title: 'BMI Registration', description: 'Rockin\' Rockin\' Boogie is registered with BMI under Payten Music as publisher. The registration shows the reconciled co-write status.', type: 'milestone', icon: FileText },
  { era: '2020', title: 'Candy\'s Personal Announcement', description: 'Candy makes a personal announcement describing his roles and contributions within Little Richard\'s world, providing detailed written accounts of the collaboration.', type: 'event', icon: FileText },
  { era: '2020s', title: 'Witness Confirmation', description: 'Alvin Taylor independently confirms he played drums on Rockin\' Rockin\' Boogie and identifies Candy as the writer, corroborating Candy\'s account.', type: 'milestone', icon: Mic2 },
  { era: 'Present', title: 'Archive Established', description: 'The Candy Hunter Archive is created to document and preserve the evidence of Candy\'s collaboration with Little Richard, making primary sources accessible to researchers, journalists, and rights investigators.', type: 'milestone', icon: Film },
  { era: 'In Development', title: 'Documentary Project', description: 'A documentary project is in development to tell Candy\'s story, using the archive\'s evidence base as the factual foundation.', type: 'future', icon: Film },
];

export default function CandyTimeline() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a1a] via-[#1a1025] to-[#0f0a1a]">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0f0a1a]/85 border-b border-purple-900/30">
        <div className="container flex items-center justify-between py-3">
          <div>
            <span className="font-bold text-lg text-amber-400">Candy Hunter Archive</span>
            <span className="text-sm text-purple-300/70 ml-2 hidden sm:inline">Timeline</span>
          </div>
          <nav className="flex gap-3 text-sm">
            <Link href="/archive" className="text-purple-300/80 hover:text-amber-400 transition">Home</Link>
            <Link href="/archive/rrb-sessions" className="text-purple-300/80 hover:text-amber-400 transition">RRB Sessions</Link>
            <Link href="/archive/evidence-map" className="text-purple-300/80 hover:text-amber-400 transition">Evidence</Link>
            <Link href="/archive/documentary" className="text-purple-300/80 hover:text-amber-400 transition">Documentary</Link>
          </nav>
        </div>
      </header>

      <main className="py-12">
        <div className="container max-w-3xl">
          <Link href="/archive">
            <Button variant="ghost" className="text-purple-300/60 hover:text-amber-400 mb-6 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Archive
            </Button>
          </Link>

          <p className="text-amber-400 uppercase tracking-[0.16em] text-xs font-semibold mb-3">Chronological Record</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Collaboration Timeline
          </h1>
          <p className="text-purple-200/70 text-base leading-relaxed mb-10">
            A chronological view of Candy's collaboration within Little Richard's world, from entry into the touring organization through the present-day archive work.
          </p>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[18px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-amber-500/40 via-purple-500/30 to-amber-500/10" />

            <div className="space-y-6">
              {TIMELINE_EVENTS.map((event, i) => (
                <div key={i} className="relative pl-12">
                  {/* Dot */}
                  <div className={`absolute left-[9px] top-1 w-[20px] h-[20px] rounded-full border-2 ${
                    event.type === 'milestone' ? 'bg-amber-500 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]' :
                    event.type === 'session' ? 'bg-purple-500 border-purple-400' :
                    event.type === 'future' ? 'bg-transparent border-amber-500/40' :
                    'bg-purple-900 border-purple-600'
                  }`} />

                  <div className={`p-4 rounded-xl border ${
                    event.type === 'milestone' ? 'bg-amber-500/[0.06] border-amber-500/20' :
                    event.type === 'future' ? 'bg-purple-500/[0.04] border-dashed border-purple-500/20' :
                    'bg-white/[0.03] border-purple-800/15'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={`text-xs ${
                        event.type === 'milestone' ? 'border-amber-500/40 text-amber-300' :
                        event.type === 'future' ? 'border-purple-500/30 text-purple-300' :
                        'border-purple-500/20 text-purple-400'
                      }`}>
                        <Clock className="w-3 h-3 mr-1" /> {event.era}
                      </Badge>
                      <event.icon className="w-3.5 h-3.5 text-amber-400/60" />
                    </div>
                    <h3 className="text-white font-bold text-sm mb-1">{event.title}</h3>
                    <p className="text-purple-200/60 text-xs leading-relaxed">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-10 p-4 border border-dashed border-purple-500/30 rounded-xl bg-purple-500/[0.04] text-purple-300/50 text-xs leading-relaxed">
            <strong className="text-purple-200/70">Note:</strong> This timeline is constructed from Candy's personal writings, BMI records, and witness testimony. Exact dates for some events are approximated based on the available evidence. The archive will be updated as additional documentation becomes available. &copy; {new Date().getFullYear()} Canryn Production.
          </div>
        </div>
      </main>

      <footer className="py-6 border-t border-purple-900/20">
        <div className="container text-center text-purple-300/50 text-xs">
          <Link href="/archive" className="text-amber-400/60 hover:text-amber-400 transition">Back to archive home</Link>
        </div>
      </footer>
    </div>
  );
}
