import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, AlertCircle, FileText, Users, Music, Building2, Shield, ArrowRight } from 'lucide-react';

const EVIDENCE_NODES = [
  {
    id: 'bmi',
    title: 'BMI Registration',
    icon: FileText,
    status: 'verified',
    strength: 'Institutional',
    summary: 'Rockin\' Rockin\' Boogie registered as reconciled 50/50 co-write: Seabrun Whitney Hunter / Richard W. Penniman. Publisher: Payten Music.',
    details: [
      'BMI is a performing rights organization — registrations are legal records',
      '"Reconciled" status means the split was reviewed and confirmed',
      'Payten Music appears as publisher in the BMI ecosystem',
    ],
  },
  {
    id: 'writings',
    title: 'Candy\'s Personal Writings',
    icon: FileText,
    status: 'primary',
    strength: 'Primary Source',
    summary: 'Candy described his roles (bandleader, songwriter, engineer), the Nashville session at Pete Drake\'s studio, and the lost masters.',
    details: [
      'First-person account of the collaboration relationship',
      'Named specific studios, musicians, and songs',
      'Described circumstances of lost master recordings',
      '"I wore many hats… bandleader singing the opening of the show, songwriter and engineer"',
    ],
  },
  {
    id: 'witness',
    title: 'Alvin Taylor Testimony',
    icon: Users,
    status: 'confirmed',
    strength: 'Independent Witness',
    summary: 'Drummer Alvin Taylor confirmed he played on Rockin\' Rockin\' Boogie and identified Candy as the writer.',
    details: [
      'Independent corroboration — Taylor was not prompted by Candy\'s family',
      'Confirmed via text message and Instagram communication',
      'Taylor is a known session drummer with verifiable career history',
      'His testimony matches Candy\'s written account',
    ],
  },
  {
    id: 'session',
    title: 'Nashville Session Evidence',
    icon: Building2,
    status: 'documented',
    strength: 'Contextual',
    summary: 'Pete Drake\'s Nashville studio identified as the recording location. Songs: "I Saw What You Did" and "Standing Right Here."',
    details: [
      'Pete Drake\'s studio is a real, verifiable Nashville recording facility',
      'The session account is consistent with 1970s Nashville recording practices',
      'Multiple songs recorded in a single session matches era norms',
    ],
  },
  {
    id: 'publishing',
    title: 'Publishing Chain',
    icon: Shield,
    status: 'verified',
    strength: 'Institutional',
    summary: 'Payten Music appears as publisher in the BMI ecosystem connected to Little Richard-related works.',
    details: [
      'Publishing entities create paper trails that survive decades',
      'Payten Music\'s presence in the BMI system is independently verifiable',
      'The publishing chain connects Candy\'s work to the broader Richard catalog',
    ],
  },
];

const PROOF_CHAIN = [
  { from: 'Candy\'s Writings', to: 'BMI Registration', connection: 'Candy claimed co-write → BMI confirms it' },
  { from: 'Candy\'s Writings', to: 'Alvin Taylor', connection: 'Candy named Taylor → Taylor confirms independently' },
  { from: 'BMI Registration', to: 'Publishing Chain', connection: 'BMI lists Payten Music → verifiable publisher' },
  { from: 'Alvin Taylor', to: 'Nashville Session', connection: 'Taylor confirms drumming → matches session account' },
];

export default function CandyEvidenceMap() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a1a] via-[#1a1025] to-[#0f0a1a]">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0f0a1a]/85 border-b border-purple-900/30">
        <div className="container flex items-center justify-between py-3">
          <div>
            <span className="font-bold text-lg text-amber-400">Candy Hunter Archive</span>
            <span className="text-sm text-purple-300/70 ml-2 hidden sm:inline">Evidence Map</span>
          </div>
          <nav className="flex gap-3 text-sm">
            <Link href="/archive" className="text-purple-300/80 hover:text-amber-400 transition">Home</Link>
            <Link href="/archive/who-was-candy" className="text-purple-300/80 hover:text-amber-400 transition">Biography</Link>
            <Link href="/archive/rrb-sessions" className="text-purple-300/80 hover:text-amber-400 transition">RRB Sessions</Link>
          </nav>
        </div>
      </header>

      <main className="py-12">
        <div className="container max-w-5xl">
          <Link href="/archive">
            <Button variant="ghost" className="text-purple-300/60 hover:text-amber-400 mb-6 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Archive
            </Button>
          </Link>

          <p className="text-amber-400 uppercase tracking-[0.16em] text-xs font-semibold mb-3">Evidence Chain</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Evidence Map
          </h1>
          <p className="text-purple-200/70 text-base leading-relaxed mb-10">
            A clean visual proof chain for researchers, journalists, publishers, and producers. Each evidence node is independently verifiable and cross-references other nodes in the chain.
          </p>

          {/* Evidence Nodes */}
          <div className="space-y-4 mb-12">
            {EVIDENCE_NODES.map(node => (
              <Card key={node.id} className="bg-gradient-to-b from-purple-900/30 to-purple-950/50 border-purple-700/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-white text-base flex items-center gap-2">
                      <node.icon className="w-5 h-5 text-amber-400" /> {node.title}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge className={
                        node.status === 'verified' ? 'bg-green-500/20 text-green-300' :
                        node.status === 'confirmed' ? 'bg-blue-500/20 text-blue-300' :
                        node.status === 'primary' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-purple-500/20 text-purple-300'
                      }>
                        {node.status === 'verified' || node.status === 'confirmed' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                        {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
                      </Badge>
                      <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-xs">{node.strength}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-200/70 text-sm mb-3">{node.summary}</p>
                  <ul className="space-y-1">
                    {node.details.map((d, i) => (
                      <li key={i} className="text-purple-300/50 text-xs flex items-start gap-2">
                        <span className="text-amber-400/60 mt-0.5">-</span> {d}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cross-Reference Chain */}
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Music className="w-5 h-5 text-amber-400" /> Cross-Reference Chain
          </h2>
          <p className="text-purple-200/60 text-sm mb-4">
            Each connection below shows how one piece of evidence independently corroborates another.
          </p>
          <div className="space-y-3 mb-10">
            {PROOF_CHAIN.map((link, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.03] border border-purple-800/15 rounded-xl text-sm">
                <Badge variant="outline" className="border-amber-500/30 text-amber-300 shrink-0 text-xs">{link.from}</Badge>
                <ArrowRight className="w-4 h-4 text-purple-400/40 shrink-0" />
                <Badge variant="outline" className="border-amber-500/30 text-amber-300 shrink-0 text-xs">{link.to}</Badge>
                <span className="text-purple-200/60 text-xs ml-2">{link.connection}</span>
              </div>
            ))}
          </div>

          {/* For Researchers */}
          <div className="bg-gradient-to-r from-purple-900/40 to-purple-950/60 border border-purple-700/30 rounded-2xl p-6 mb-10">
            <h3 className="text-amber-400 font-bold mb-3">For Researchers & Journalists</h3>
            <p className="text-purple-200/70 text-sm leading-relaxed mb-3">
              This evidence map is designed to be independently verifiable. Each node can be checked against public records (BMI), personal archives (Candy's writings), and living witnesses (Alvin Taylor). The cross-reference chain shows that no single source depends on another for its validity — they corroborate each other independently.
            </p>
            <p className="text-purple-300/50 text-xs">
              For rights inquiries or documentary licensing, contact Canryn Production through the main site.
            </p>
          </div>

          {/* Disclaimer */}
          <div className="p-4 border border-dashed border-purple-500/30 rounded-xl bg-purple-500/[0.04] text-purple-300/50 text-xs leading-relaxed">
            <strong className="text-purple-200/70">Disclaimer:</strong> This evidence map presents factual documentation from institutional records, primary sources, and witness testimony. It does not constitute legal advice. All evidence is presented for historical documentation and research purposes. &copy; {new Date().getFullYear()} Canryn Production. All rights reserved.
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
