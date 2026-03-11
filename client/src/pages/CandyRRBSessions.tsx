import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Music, FileText, Users, Building2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { RRBSongBadge } from '@/components/RRBSongBadge';

const SESSION_EVIDENCE = [
  { category: 'BMI Registration', icon: FileText, status: 'verified', items: [
    { label: 'Work Title', value: 'Rockin\' Rockin\' Boogie' },
    { label: 'Writers', value: 'Seabrun Whitney Hunter / Richard W. Penniman' },
    { label: 'Split', value: '50% / 50% — Reconciled' },
    { label: 'Publisher', value: 'Payten Music' },
    { label: 'Status', value: 'Active BMI registration' },
  ]},
  { category: 'Nashville Session', icon: Building2, status: 'documented', items: [
    { label: 'Studio', value: 'Pete Drake\'s Nashville studio' },
    { label: 'Songs Recorded', value: 'I Saw What You Did, Standing Right Here' },
    { label: 'Source', value: 'Candy\'s personal written account' },
    { label: 'Drums', value: 'Alvin Taylor (confirmed)' },
    { label: 'Masters', value: 'Lost while touring (per Candy\'s account)' },
  ]},
  { category: 'Witness Testimony', icon: Users, status: 'confirmed', items: [
    { label: 'Witness', value: 'Alvin Taylor' },
    { label: 'Role', value: 'Drummer on Rockin\' Rockin\' Boogie session' },
    { label: 'Confirmation', value: 'Identified Candy as the writer' },
    { label: 'Medium', value: 'Direct communication (text/Instagram)' },
    { label: 'Significance', value: 'Independent corroboration of Candy\'s account' },
  ]},
];

const SONGS_TABLE = [
  { title: 'Rockin\' Rockin\' Boogie', bmi: 'Yes — reconciled', session: 'Unknown studio', status: 'BMI Verified', writers: 'Hunter / Penniman' },
  { title: 'I Saw What You Did', bmi: 'Not found', session: 'Pete Drake\'s Nashville', status: 'Candy\'s Account', writers: 'Attributed by Candy' },
  { title: 'Standing Right Here', bmi: 'Not found', session: 'Pete Drake\'s Nashville', status: 'Candy\'s Account', writers: 'Attributed by Candy' },
];

export default function CandyRRBSessions() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a1a] via-[#1a1025] to-[#0f0a1a]">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0f0a1a]/85 border-b border-purple-900/30">
        <div className="container flex items-center justify-between py-3">
          <div>
            <span className="font-bold text-lg text-amber-400">Candy Hunter Archive</span>
            <span className="text-sm text-purple-300/70 ml-2 hidden sm:inline">RRB Sessions</span>
          </div>
          <nav className="flex gap-3 text-sm">
            <Link href="/archive" className="text-purple-300/80 hover:text-amber-400 transition">Home</Link>
            <Link href="/archive/who-was-candy" className="text-purple-300/80 hover:text-amber-400 transition">Who Was Candy</Link>
            <Link href="/archive/evidence-map" className="text-purple-300/80 hover:text-amber-400 transition">Evidence</Link>
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

          <p className="text-amber-400 uppercase tracking-[0.16em] text-xs font-semibold mb-3">Investigation</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Rockin' Rockin' Boogie Sessions
          </h1>
          <p className="text-purple-200/70 text-lg leading-relaxed mb-6">
            This page ties together the BMI registration, Candy's personal writings, the Nashville session account, and Alvin Taylor's witness confirmation into a single investigative view.
          </p>
          <div className="mb-10">
            <RRBSongBadge variant="full" showTitle />
          </div>

          {/* Evidence Sections */}
          <div className="space-y-6 mb-12">
            {SESSION_EVIDENCE.map(section => (
              <Card key={section.category} className="bg-gradient-to-b from-purple-900/30 to-purple-950/50 border-purple-700/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <section.icon className="w-5 h-5 text-amber-400" /> {section.category}
                    </CardTitle>
                    <Badge className={section.status === 'verified' ? 'bg-green-500/20 text-green-300' : section.status === 'confirmed' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'}>
                      {section.status === 'verified' ? <><CheckCircle2 className="w-3 h-3 mr-1" /> Verified</> : section.status === 'confirmed' ? <><CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed</> : <><AlertCircle className="w-3 h-3 mr-1" /> Documented</>}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {section.items.map(item => (
                      <div key={item.label} className="flex items-start gap-3 text-sm">
                        <span className="text-purple-300/50 w-28 shrink-0">{item.label}</span>
                        <span className="text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Songs Comparison Table */}
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Music className="w-5 h-5 text-amber-400" /> Songs Comparison
          </h2>
          <div className="overflow-x-auto border border-purple-700/20 rounded-xl mb-10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-purple-700/20 bg-purple-900/20">
                  <th className="text-left p-3 text-amber-400 font-semibold">Song</th>
                  <th className="text-left p-3 text-amber-400 font-semibold">BMI</th>
                  <th className="text-left p-3 text-amber-400 font-semibold">Session</th>
                  <th className="text-left p-3 text-amber-400 font-semibold">Writers</th>
                  <th className="text-left p-3 text-amber-400 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {SONGS_TABLE.map(song => (
                  <tr key={song.title} className="border-b border-purple-800/10">
                    <td className="p-3 text-white font-medium">{song.title}</td>
                    <td className="p-3 text-purple-200/70">{song.bmi}</td>
                    <td className="p-3 text-purple-200/70">{song.session}</td>
                    <td className="p-3 text-purple-200/70">{song.writers}</td>
                    <td className="p-3">
                      <Badge variant="outline" className={song.status === 'BMI Verified' ? 'border-green-500/40 text-green-300' : 'border-amber-500/40 text-amber-300'}>
                        {song.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Candy's Written Account */}
          <div className="bg-gradient-to-r from-purple-900/40 to-purple-950/60 border border-purple-700/30 rounded-2xl p-6 mb-10">
            <h3 className="text-amber-400 font-bold mb-3">Candy's Session Account</h3>
            <p className="text-purple-200/70 text-sm leading-relaxed mb-3">
              In his personal writings, Candy described the Nashville recording session in detail. He named Pete Drake's studio as the location, listed the participating musicians, and identified the songs recorded during the session. He also described the circumstances under which the master recordings were lost.
            </p>
            <blockquote className="border-l-4 border-amber-500 pl-4 py-2 bg-white/[0.03] rounded-r-lg italic text-amber-100/80 text-sm leading-relaxed">
              "The master was lost while touring, but we had a good idea where it was."
            </blockquote>
          </div>

          {/* Screenshot Placement Checklist */}
          <div className="p-4 border border-dashed border-amber-500/40 rounded-xl bg-amber-500/[0.04] text-amber-200/80 text-sm mb-10">
            <h4 className="font-bold text-amber-300 mb-2">Evidence Screenshot Placement Checklist</h4>
            <ul className="space-y-1 text-xs">
              <li className="flex items-center gap-2"><AlertCircle className="w-3 h-3 text-amber-400" /> BMI publisher page for Payten Music showing Rockin' Rockin' Boogie</li>
              <li className="flex items-center gap-2"><AlertCircle className="w-3 h-3 text-amber-400" /> BMI detail page showing 50/50 Hunter / Penniman split</li>
              <li className="flex items-center gap-2"><AlertCircle className="w-3 h-3 text-amber-400" /> Alvin Taylor text confirmation</li>
              <li className="flex items-center gap-2"><AlertCircle className="w-3 h-3 text-amber-400" /> Alvin Taylor Instagram message screenshot</li>
              <li className="flex items-center gap-2"><AlertCircle className="w-3 h-3 text-amber-400" /> Candy email describing Nashville session</li>
              <li className="flex items-center gap-2"><AlertCircle className="w-3 h-3 text-amber-400" /> Candy 2020 personal announcement</li>
            </ul>
          </div>

          {/* Legal */}
          <div className="p-4 border border-dashed border-purple-500/30 rounded-xl bg-purple-500/[0.04] text-purple-300/50 text-xs leading-relaxed">
            <strong className="text-purple-200/70">Disclaimer:</strong> This page presents factual evidence from BMI records, personal writings, and witness testimony. It does not constitute legal advice or make legal claims. All evidence is presented for historical documentation purposes. &copy; {new Date().getFullYear()} Canryn Production. All rights reserved.
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
