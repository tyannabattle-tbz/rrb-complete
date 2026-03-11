import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Film, BookOpen, Mic2, Music, Clock, Camera, FileText } from 'lucide-react';
import { RRBSongBadge } from '@/components/RRBSongBadge';

const STORY_SPINE = [
  { act: 'Act I', title: 'The Collaborator', description: 'Introduce Candy — musician, songwriter, bandleader, engineer. Establish his entry into Little Richard\'s world and the multiple roles he played.', beats: ['Candy\'s background and musical roots', 'Entry into Richard\'s touring organization', '"I wore many hats" — the breadth of his contributions'] },
  { act: 'Act II', title: 'The Sessions', description: 'The creative work — co-writing Rockin\' Rockin\' Boogie, the Nashville session at Pete Drake\'s studio, and the songs recorded there.', beats: ['Rockin\' Rockin\' Boogie co-write with Richard', 'Nashville session: I Saw What You Did, Standing Right Here', 'The studio environment and working relationship'] },
  { act: 'Act III', title: 'The Lost Masters', description: 'The mystery — master recordings lost while touring. What happened, what Candy knew, and the ongoing search.', beats: ['Candy\'s account of the lost recordings', '"We had a good idea where it was"', 'The significance of lost masters in music history'] },
  { act: 'Act IV', title: 'The Evidence', description: 'The proof chain — BMI registration, Alvin Taylor\'s confirmation, and the institutional records that survived.', beats: ['BMI reconciled 50/50 split — institutional proof', 'Alvin Taylor\'s independent witness confirmation', 'Payten Music and the publishing trail'] },
  { act: 'Act V', title: 'The Legacy', description: 'What Candy\'s story means — for music history, for unrecognized collaborators, and for the family preserving his legacy.', beats: ['The pattern of unrecognized collaborators in music', 'The family\'s mission to document and preserve', 'Canryn Production and the archive\'s future'] },
];

const PRODUCTION_NOTES = [
  { category: 'Source Material', items: ['Candy\'s personal writings and correspondence', 'BMI registration records and screenshots', 'Alvin Taylor witness communications', 'Historical photographs and session-era documentation'] },
  { category: 'Interview Targets', items: ['Family members with direct knowledge', 'Alvin Taylor (drummer, witness)', 'Music historians specializing in Little Richard era', 'BMI/publishing rights researchers'] },
  { category: 'Visual Assets Needed', items: ['Session-era photographs', 'BMI registration page captures', 'Pete Drake\'s Nashville studio (historical/current)', 'Touring-era documentation and memorabilia'] },
  { category: 'Music Rights', items: ['Rockin\' Rockin\' Boogie — BMI registered, Payten Music', 'I Saw What You Did — attribution pending', 'Standing Right Here — attribution pending', 'Any recovered master recordings'] },
];

export default function CandyDocumentary() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a1a] via-[#1a1025] to-[#0f0a1a]">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0f0a1a]/85 border-b border-purple-900/30">
        <div className="container flex items-center justify-between py-3">
          <div>
            <span className="font-bold text-lg text-amber-400">Candy Hunter Archive</span>
            <span className="text-sm text-purple-300/70 ml-2 hidden sm:inline">Documentary</span>
          </div>
          <nav className="flex gap-3 text-sm">
            <Link href="/archive" className="text-purple-300/80 hover:text-amber-400 transition">Home</Link>
            <Link href="/archive/who-was-candy" className="text-purple-300/80 hover:text-amber-400 transition">Biography</Link>
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

          <div className="flex items-center gap-3 mb-3">
            <p className="text-amber-400 uppercase tracking-[0.16em] text-xs font-semibold">Documentary Project</p>
            <Badge className="bg-amber-500/20 text-amber-300 text-xs">In Development</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Candy's Story — Documentary
          </h1>
          <p className="text-purple-200/70 text-lg leading-relaxed mb-6">
            Story spine and production notes for the documentary in development. This page serves as the creative and factual foundation for telling Candy's story on screen.
          </p>
          <div className="mb-10">
            <RRBSongBadge variant="compact" showTitle />
          </div>

          {/* Story Spine */}
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Film className="w-5 h-5 text-amber-400" /> Story Spine
          </h2>
          <div className="space-y-4 mb-12">
            {STORY_SPINE.map(act => (
              <Card key={act.act} className="bg-gradient-to-b from-purple-900/30 to-purple-950/50 border-purple-700/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-amber-500/20 text-amber-300 text-xs">{act.act}</Badge>
                    <CardTitle className="text-white text-base">{act.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-200/70 text-sm mb-3">{act.description}</p>
                  <div className="space-y-1">
                    {act.beats.map((beat, i) => (
                      <div key={i} className="text-purple-300/50 text-xs flex items-start gap-2">
                        <span className="text-amber-400/60 mt-0.5">{i + 1}.</span> {beat}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Production Notes */}
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" /> Production Notes
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            {PRODUCTION_NOTES.map(note => (
              <Card key={note.category} className="bg-gradient-to-b from-purple-900/30 to-purple-950/50 border-purple-700/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-amber-400 text-sm">{note.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {note.items.map((item, i) => (
                      <li key={i} className="text-purple-200/60 text-xs flex items-start gap-2">
                        <span className="text-amber-400/40">-</span> {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tone & Approach */}
          <div className="bg-gradient-to-r from-purple-900/40 to-purple-950/60 border border-purple-700/30 rounded-2xl p-6 mb-10">
            <h3 className="text-amber-400 font-bold mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Tone & Approach</h3>
            <div className="space-y-3 text-purple-200/70 text-sm leading-relaxed">
              <p>
                The documentary should be <strong className="text-white">evidence-first</strong>. Every claim should be supported by visible documentation — BMI screenshots, written correspondence, witness statements. The tone should be respectful, measured, and focused on letting the evidence speak.
              </p>
              <p>
                The narrative should avoid sensationalism. Candy's story is compelling because the evidence is real and verifiable. The documentary's strength comes from the institutional records (BMI), the independent witness (Alvin Taylor), and Candy's own detailed writings.
              </p>
              <p>
                The lost masters angle provides narrative tension and an ongoing mystery, but the documentary should be clear about what is known vs. what is still being investigated.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="p-4 border border-dashed border-amber-500/40 rounded-xl bg-amber-500/[0.04] text-amber-200/80 text-sm mb-10">
            <h4 className="font-bold text-amber-300 mb-2">For Producers & Filmmakers</h4>
            <p className="text-xs leading-relaxed">
              This documentary project is in active development by Canryn Production. If you are a producer, filmmaker, or distributor interested in this story, contact Canryn Production through the main site. The archive provides the factual foundation; the documentary will bring it to life.
            </p>
          </div>

          {/* Disclaimer */}
          <div className="p-4 border border-dashed border-purple-500/30 rounded-xl bg-purple-500/[0.04] text-purple-300/50 text-xs leading-relaxed">
            <strong className="text-purple-200/70">Disclaimer:</strong> This documentary project page presents the creative and factual framework for a documentary in development. All factual claims are supported by the evidence documented elsewhere in this archive. &copy; {new Date().getFullYear()} Canryn Production. All rights reserved.
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
