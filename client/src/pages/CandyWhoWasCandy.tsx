import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Music, Mic2, Wrench, Users, ArrowLeft } from 'lucide-react';
import { RRBSongBadge } from '@/components/RRBSongBadge';

const ROLES = [
  { icon: Music, title: 'Songwriter', description: 'Co-wrote Rockin\' Rockin\' Boogie with Richard W. Penniman (Little Richard). BMI-registered, reconciled 50/50 split.' },
  { icon: Mic2, title: 'Bandleader', description: 'Led the opening of shows during the touring era, managing the band and setting the stage for Richard\'s performances.' },
  { icon: Wrench, title: 'Engineer', description: 'Worked in studio sessions including the Nashville recordings at Pete Drake\'s studio, handling engineering duties.' },
  { icon: Users, title: 'Creative Collaborator', description: 'A trusted member of Little Richard\'s inner circle during the 1970s touring and recording period.' },
];

export default function CandyWhoWasCandy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a1a] via-[#1a1025] to-[#0f0a1a]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0f0a1a]/85 border-b border-purple-900/30">
        <div className="container flex items-center justify-between py-3">
          <div>
            <span className="font-bold text-lg text-amber-400">Candy Hunter Archive</span>
            <span className="text-sm text-purple-300/70 ml-2 hidden sm:inline">Who Was Candy?</span>
          </div>
          <nav className="flex gap-3 text-sm">
            <Link href="/archive" className="text-purple-300/80 hover:text-amber-400 transition">Home</Link>
            <Link href="/archive/rrb-sessions" className="text-purple-300/80 hover:text-amber-400 transition">RRB Sessions</Link>
            <Link href="/archive/timeline" className="text-purple-300/80 hover:text-amber-400 transition">Timeline</Link>
            <Link href="/archive/evidence-map" className="text-purple-300/80 hover:text-amber-400 transition">Evidence</Link>
          </nav>
        </div>
      </header>

      <main className="py-12">
        <div className="container max-w-4xl">
          <Link href="/archive">
            <Button variant="ghost" className="text-purple-300/60 hover:text-amber-400 mb-6 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Archive
            </Button>
          </Link>

          <p className="text-amber-400 uppercase tracking-[0.16em] text-xs font-semibold mb-3">Biography</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Who Was Seabrun "Candy" Hunter Jr.?
          </h1>
          <p className="text-purple-200/70 text-lg leading-relaxed mb-4">
            Seabrun "Candy" Hunter Jr. was a musician, songwriter, bandleader, and studio engineer who worked within Little Richard's touring and recording circle during the 1970s. His contributions span stage performance, songwriting, studio engineering, and organizational leadership within the band.
          </p>
          <div className="mb-8">
            <RRBSongBadge variant="compact" showTitle />
          </div>

          {/* Roles Grid */}
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" /> The Many Hats of Candy
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            {ROLES.map(role => (
              <Card key={role.title} className="bg-gradient-to-b from-purple-900/30 to-purple-950/50 border-purple-700/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <role.icon className="w-4 h-4 text-amber-400" /> {role.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-200/60 text-xs leading-relaxed">{role.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Key Quote */}
          <div className="bg-gradient-to-r from-purple-900/40 to-purple-950/60 border border-purple-700/30 rounded-2xl p-6 mb-10">
            <h3 className="text-amber-400 font-bold mb-3">In Candy's Own Words</h3>
            <blockquote className="border-l-4 border-amber-500 pl-4 py-2 italic text-amber-100/80 text-base leading-relaxed mb-4">
              "I wore many hats… bandleader singing the opening of the show, songwriter and engineer."
            </blockquote>
            <p className="text-purple-300/50 text-xs">
              This statement from Candy's personal writings frames the breadth of his involvement in Little Richard's professional world. He was not a single-role contributor but a multi-faceted collaborator.
            </p>
          </div>

          {/* Why Candy Matters */}
          <h2 className="text-xl font-bold text-white mb-4">Why Candy Matters to Music History</h2>
          <div className="space-y-4 text-purple-200/70 text-sm leading-relaxed mb-10">
            <p>
              Candy's story is significant because it represents a pattern common in music history: the unrecognized collaborator. While Little Richard's genius is well-documented and celebrated, the people who worked alongside him — writing songs, leading bands, engineering sessions — often remain unnamed in the historical record.
            </p>
            <p>
              The BMI registration of <strong className="text-white">Rockin' Rockin' Boogie</strong> as a reconciled 50/50 co-write between Seabrun Whitney Hunter and Richard W. Penniman provides the kind of institutional evidence that is rare in disputes over musical credit. Combined with Candy's own detailed writings and the witness testimony of drummer Alvin Taylor, the archive builds a verifiable chain of evidence.
            </p>
            <p>
              The lost masters — recordings that Candy described as having been lost while touring — represent an ongoing mystery. If recovered, they could provide additional confirmation of the collaborative relationship and potentially reveal unreleased music from the era.
            </p>
          </div>

          {/* Connection to the Archive */}
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            <Link href="/archive/rrb-sessions">
              <Card className="bg-gradient-to-b from-purple-900/30 to-purple-950/50 border-purple-700/20 hover:border-amber-500/40 transition cursor-pointer h-full">
                <CardContent className="pt-6">
                  <Badge className="bg-amber-500/20 text-amber-300 mb-2">Next</Badge>
                  <h3 className="text-white text-sm font-bold mb-1">RRB Sessions</h3>
                  <p className="text-purple-200/60 text-xs">The full investigative page</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/archive/evidence-map">
              <Card className="bg-gradient-to-b from-purple-900/30 to-purple-950/50 border-purple-700/20 hover:border-amber-500/40 transition cursor-pointer h-full">
                <CardContent className="pt-6">
                  <Badge className="bg-amber-500/20 text-amber-300 mb-2">Evidence</Badge>
                  <h3 className="text-white text-sm font-bold mb-1">Evidence Map</h3>
                  <p className="text-purple-200/60 text-xs">Visual proof chain</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/archive/timeline">
              <Card className="bg-gradient-to-b from-purple-900/30 to-purple-950/50 border-purple-700/20 hover:border-amber-500/40 transition cursor-pointer h-full">
                <CardContent className="pt-6">
                  <Badge className="bg-amber-500/20 text-amber-300 mb-2">History</Badge>
                  <h3 className="text-white text-sm font-bold mb-1">Timeline</h3>
                  <p className="text-purple-200/60 text-xs">Chronological view</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Legal Disclaimer */}
          <div className="p-4 border border-dashed border-purple-500/30 rounded-xl bg-purple-500/[0.04] text-purple-300/50 text-xs leading-relaxed">
            <strong className="text-purple-200/70">Disclaimer:</strong> This archive presents historical documentation and primary-source materials related to Seabrun "Candy" Hunter Jr.'s collaboration with Little Richard. All claims are supported by cited evidence including BMI records, personal writings, and witness testimony. This site does not make legal claims but presents evidence for researchers, journalists, and rights investigators. &copy; {new Date().getFullYear()} Canryn Production. All rights reserved.
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
