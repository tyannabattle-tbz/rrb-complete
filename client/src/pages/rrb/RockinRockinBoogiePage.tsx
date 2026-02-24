/**
 * "Rockin' Rockin' Boogie" Dedicated Page
 * The signature song of the 1971-1980 collaboration between Little Richard and Seabrun Candy Hunter
 * Showcases creation story, production details, and cultural significance
 * SEO-optimized for "Rockin' Rockin' Boogie", "Little Richard Seabrun Hunter", "rock and roll collaboration"
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Disc, Users, Zap, Award, Heart, BookOpen, Play } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';

export default function RockinRockinBoogiePage() {
  const [selectedTab, setSelectedTab] = useState<'story' | 'production' | 'lyrics' | 'legacy'>('story');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-orange-950/10 to-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-6 py-12">
          <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/50">
            <span className="text-orange-400 font-semibold">🎵 The Signature Song</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Rockin' Rockin' Boogie
          </h1>
          <p className="text-2xl text-gray-300">
            A Collaboration Between Little Richard & Seabrun Candy Hunter
          </p>
          <p className="text-gray-400 max-w-3xl mx-auto text-lg">
            The definitive proof of mentorship, creative partnership, and the continuity of rock and roll legacy. Written, recorded, and performed together in 1971.
          </p>
        </div>

        {/* Key Facts */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30">
            <CardContent className="pt-6 text-center">
              <Music className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400 mb-1">Written By</p>
              <p className="text-lg font-bold text-white">Penniman/Hunter</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30">
            <CardContent className="pt-6 text-center">
              <Disc className="w-8 h-8 text-pink-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400 mb-1">Released</p>
              <p className="text-lg font-bold text-white">May 1971</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30">
            <CardContent className="pt-6 text-center">
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400 mb-1">Producer</p>
              <p className="text-lg font-bold text-white">H.B. Barnum</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30">
            <CardContent className="pt-6 text-center">
              <Award className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400 mb-1">Label</p>
              <p className="text-lg font-bold text-white">Reprise Records</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 justify-center border-b border-gray-800 pb-4">
          {[
            { id: 'story' as const, label: 'Creation Story' },
            { id: 'production' as const, label: 'Production Details' },
            { id: 'lyrics' as const, label: 'Lyrics & Meaning' },
            { id: 'legacy' as const, label: 'Cultural Legacy' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                selectedTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        {selectedTab === 'story' && (
          <section className="space-y-6">
            <h2 className="text-4xl font-bold text-white">The Creation Story</h2>

            <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  January 1971: The Meeting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300">
                <p>
                  Little Richard, the King of Rock and Roll, meets Seabrun Candy Hunter, a talented young musician from Detroit, Michigan. Richard immediately recognizes Seabrun's potential and decides to mentor him personally.
                </p>
                <p>
                  This wasn't just a casual meeting—it was the beginning of a transformative nine-year partnership that would produce some of the most important recordings of the 1970s.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  May 1971: The Recording
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300">
                <p>
                  Just four months after meeting, Richard and Seabrun enter the studio with legendary producer H.B. Barnum. Together, they create "Rockin' Rockin' Boogie"—a song that would become the signature of their collaboration.
                </p>
                <p>
                  The song is co-written by both Richard Penniman and Seabrun Hunter, with H.B. Barnum handling production. Session drummer Alvin Taylor provides the powerful rhythm that drives the track.
                </p>
                <p className="font-semibold text-orange-300">
                  This is the definitive proof of their creative partnership—both names appear on the writing credits.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  July 1971: The First Tour
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300">
                <p>
                  Little Richard and Seabrun begin their first worldwide tour together. Richard shares his stage with Seabrun, allowing him to perform as both a musician and vocalist. This is mentorship in action—not just in the studio, but on the road.
                </p>
                <p>
                  For the next nine years, they will tour together, record together, and create together. The world witnesses the King of Rock and Roll actively passing his legacy to the next generation.
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {selectedTab === 'production' && (
          <section className="space-y-6">
            <h2 className="text-4xl font-bold text-white">Production Details</h2>

            <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30">
              <CardHeader>
                <CardTitle>Recording Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-2">Song Details</h4>
                    <ul className="space-y-1 text-sm">
                      <li><strong>Title:</strong> Rockin' Rockin' Boogie</li>
                      <li><strong>Writers:</strong> Richard Penniman, Seabrun Hunter</li>
                      <li><strong>Duration:</strong> 3:45</li>
                      <li><strong>Key:</strong> E Major</li>
                      <li><strong>Tempo:</strong> 120 BPM</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-2">Release Information</h4>
                    <ul className="space-y-1 text-sm">
                      <li><strong>Release Date:</strong> May 1971</li>
                      <li><strong>Label:</strong> Reprise Records</li>
                      <li><strong>Catalog:</strong> K 14343 (45 RPM)</li>
                      <li><strong>Format:</strong> 7" Vinyl Single</li>
                      <li><strong>Publisher:</strong> Payten Music</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
              <CardHeader>
                <CardTitle>Session Musicians & Credits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300">
                <div className="space-y-2">
                  <p className="flex items-center gap-2"><Users className="w-4 h-4 text-pink-400" /> <strong>Alvin Taylor</strong> — Drums (Session Drummer Confirmation)</p>
                  <p className="flex items-center gap-2"><Users className="w-4 h-4 text-pink-400" /> <strong>H.B. Barnum</strong> — Producer, Keyboards, Arranger</p>
                  <p className="flex items-center gap-2"><Users className="w-4 h-4 text-pink-400" /> <strong>Richard Penniman</strong> — Lead Vocals, Co-writer</p>
                  <p className="flex items-center gap-2"><Users className="w-4 h-4 text-pink-400" /> <strong>Seabrun Candy Hunter</strong> — Vocals, Guitar, Co-writer</p>
                  <p className="flex items-center gap-2"><Users className="w-4 h-4 text-pink-400" /> <strong>James Brown Band</strong> — Horns Section</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30">
              <CardHeader>
                <CardTitle>Physical Evidence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300">
                <p>
                  The original 45 RPM vinyl single (Reprise K 14343) exists as physical evidence of the collaboration. The label clearly shows:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Song title: "Rockin' Rockin' Boogie"</li>
                  <li>Writing credits: Penniman/Hunter</li>
                  <li>Label: Reprise Records</li>
                  <li>Publisher: Payten Music</li>
                  <li>Release date: 1971</li>
                </ul>
                <p className="font-semibold text-orange-300 mt-4">
                  This physical vinyl record is the definitive proof of the collaboration and Seabrun Hunter's creative contributions.
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {selectedTab === 'lyrics' && (
          <section className="space-y-6">
            <h2 className="text-4xl font-bold text-white">Lyrics & Meaning</h2>

            <Card className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  The Message
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-300">
                <p>
                  "Rockin' Rockin' Boogie" is more than just a song—it's a statement about rock and roll itself. The title itself is a play on words, combining "Rockin'" (the act of performing rock and roll) with "Boogie" (the rhythm and soul of the music).
                </p>
                <p>
                  The song celebrates the energy, passion, and continuity of rock and roll. It's about keeping the spirit of the music alive, passing it from one generation to the next—which is exactly what Richard and Seabrun were doing.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30">
              <CardHeader>
                <CardTitle>Musical Style</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300">
                <p>
                  The song features the classic rock and roll sound that Little Richard pioneered—driving rhythm, powerful vocals, and infectious energy. But it also incorporates Seabrun's contributions, creating a fresh take on the classic sound.
                </p>
                <p>
                  The arrangement by H.B. Barnum is masterful, blending Richard's vocal power with Seabrun's guitar work and the tight rhythm section. The result is a song that honors the past while looking toward the future.
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {selectedTab === 'legacy' && (
          <section className="space-y-6">
            <h2 className="text-4xl font-bold text-white">Cultural Legacy</h2>

            <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Why This Song Matters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-300">
                <p>
                  "Rockin' Rockin' Boogie" is historically significant for several reasons:
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li><strong>Proof of Collaboration:</strong> The song's writing credits (Penniman/Hunter) provide definitive evidence of the creative partnership between Little Richard and Seabrun Candy Hunter.</li>
                  <li><strong>Mentorship in Action:</strong> The song represents mentorship at its finest—the King of Rock and Roll actively passing his knowledge and legacy to the next generation.</li>
                  <li><strong>Continuity of Legacy:</strong> The song ensures that the rock and roll legacy continues. It's not just Richard's music; it's Richard's music filtered through Seabrun's perspective.</li>
                  <li><strong>Historical Documentation:</strong> The physical vinyl records, recording sessions, and tour documentation preserve this moment in rock history for future generations.</li>
                </ol>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30">
              <CardHeader>
                <CardTitle>The Broader Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300">
                <p>
                  The 1971-1980 collaboration between Little Richard and Seabrun Candy Hunter represents a unique moment in rock history. It shows that the greatest artists don't just create music—they create the conditions for others to create as well.
                </p>
                <p>
                  "Rockin' Rockin' Boogie" and the other recordings from this era demonstrate that rock and roll is not a solo endeavor. It's a collaborative art form that thrives when experienced musicians mentor and elevate emerging talent.
                </p>
                <p className="font-semibold text-orange-300">
                  This is the legacy that "Rockin' Rockin' Boogie" represents: the continuity, the mentorship, and the eternal spirit of rock and roll.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30">
              <CardHeader>
                <CardTitle>Preserved for Posterity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300">
                <p>
                  The recordings from the 1971-1980 collaboration era have been preserved and documented:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Original vinyl records (45 RPM singles and LPs)</li>
                  <li>Studio recordings and session tapes</li>
                  <li>Live performance recordings from worldwide tours</li>
                  <li>Comprehensive discography documentation</li>
                  <li>Session musician credits and production notes</li>
                </ul>
                <p className="mt-4">
                  This preservation ensures that future generations can study, appreciate, and learn from this important moment in rock history.
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Related Pages */}
        <section className="text-center space-y-6 py-8 border-t border-gray-800">
          <h2 className="text-3xl font-bold text-white">Explore More</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/rrb/little-richard-discography" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all">
              Full Discography
            </Link>
            <Link href="/rrb/little-richard-biography" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all">
              Little Richard Biography
            </Link>
            <Link href="/rrb/radio-station" className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all">
              Listen to the Music
            </Link>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm space-y-2 border-t border-gray-800 pt-8">
          <p>
            "Rockin' Rockin' Boogie" — A collaboration between Little Richard (Richard Penniman) and Seabrun Candy Hunter, produced by H.B. Barnum, released on Reprise Records in 1971.
          </p>
          <p>
            🎵 Canryn Production and its subsidiaries — A Voice for the Voiceless
          </p>
        </div>
      </div>
    </div>
  );
}
