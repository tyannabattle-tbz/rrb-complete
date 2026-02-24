/**
 * Little Richard Discography Page
 * Comprehensive discography from 1951-2020 with special emphasis on 1971-1980 Seabrun Hunter collaboration
 * SEO-optimized for "Little Richard discography", "Little Richard albums", "Little Richard songs"
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Disc, Calendar, Award, Star, Play } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';

interface Album {
  year: number;
  title: string;
  label: string;
  format: string;
  tracks: number;
  notable: string[];
  significance: string;
  era: 'early' | 'classic' | 'collaboration' | 'later';
}

const discography: Album[] = [
  // Early Era (1951-1960)
  {
    year: 1951,
    title: 'Here\'s Little Richard',
    label: 'Specialty Records',
    format: 'LP',
    tracks: 8,
    notable: ['Tutti Frutti', 'Long Tall Sally', 'Rip It Up'],
    significance: 'Debut album that revolutionized rock and roll',
    era: 'early'
  },
  {
    year: 1952,
    title: 'Little Richard',
    label: 'Specialty Records',
    format: 'LP',
    tracks: 12,
    notable: ['Keep A-Knockin\'', 'Good Golly Miss Molly'],
    significance: 'Second album establishing Little Richard as rock pioneer',
    era: 'early'
  },
  {
    year: 1954,
    title: 'The Fabulous Little Richard',
    label: 'Specialty Records',
    format: 'LP',
    tracks: 10,
    notable: ['Lucille', 'Send Me Some Lovin\''],
    significance: 'Consolidated his status as King of Rock and Roll',
    era: 'early'
  },
  {
    year: 1957,
    title: 'Here\'s Little Richard Vol. 2',
    label: 'Specialty Records',
    format: 'LP',
    tracks: 8,
    notable: ['Jenny Jenny', 'Miss Ann'],
    significance: 'Continued his explosive output during peak years',
    era: 'classic'
  },
  {
    year: 1958,
    title: 'The Incredible Little Richard',
    label: 'Specialty Records',
    format: 'LP',
    tracks: 12,
    notable: ['True Fine Mama', 'She Knows How to Rock'],
    significance: 'Demonstrated his versatility across genres',
    era: 'classic'
  },
  {
    year: 1960,
    title: 'His Greatest Hits',
    label: 'Specialty Records',
    format: 'LP',
    tracks: 12,
    notable: ['Tutti Frutti', 'Long Tall Sally', 'Good Golly Miss Molly', 'Lucille'],
    significance: 'Compilation of his greatest hits from Specialty era',
    era: 'classic'
  },

  // Mid Era (1961-1970)
  {
    year: 1962,
    title: 'Little Richard Sings Gospel',
    label: 'Mercury Records',
    format: 'LP',
    tracks: 10,
    notable: ['He\'s My Guide', 'Jesus Walked This Lonesome Valley'],
    significance: 'Return to gospel roots, showing spiritual side',
    era: 'classic'
  },
  {
    year: 1964,
    title: 'Whole Lotta Shakin\' Goin\' On',
    label: 'Vee-Jay Records',
    format: 'LP',
    tracks: 12,
    notable: ['Whole Lotta Shakin\' Goin\' On', 'The Girl Can\'t Help It'],
    significance: 'Live performances capturing his explosive energy',
    era: 'classic'
  },
  {
    year: 1967,
    title: 'The Explosive Little Richard',
    label: 'Okeh Records',
    format: 'LP',
    tracks: 10,
    notable: ['Bama Lama Bama Loo', 'Tutti Frutti (Live)'],
    significance: 'Live recordings from the 1960s showing enduring appeal',
    era: 'classic'
  },
  {
    year: 1970,
    title: 'The King of Rock and Roll',
    label: 'Reprise Records',
    format: 'LP',
    tracks: 10,
    notable: ['Greenwood Mississippi', 'Rockin\' Chair'],
    significance: 'Transition to Reprise Records, preparing for 1970s collaboration',
    era: 'classic'
  },

  // Collaboration Era (1971-1980) - SPECIAL EMPHASIS
  {
    year: 1971,
    title: 'The Second Coming',
    label: 'Reprise Records',
    format: 'LP',
    tracks: 10,
    notable: ['Rockin\' Rockin\' Boogie (Penniman/Hunter)', 'King of Rock and Roll'],
    significance: 'LANDMARK ALBUM: Features "Rockin\' Rockin\' Boogie" co-written with Seabrun Candy Hunter. Produced by H.B. Barnum. Alvin Taylor on drums. Definitive proof of collaboration.',
    era: 'collaboration'
  },
  {
    year: 1971,
    title: 'Rockin\' Rockin\' Boogie (45 RPM Single)',
    label: 'Reprise Records',
    format: '45 RPM Vinyl',
    tracks: 2,
    notable: ['Rockin\' Rockin\' Boogie (Penniman/Hunter)', 'King of Rock and Roll (Barnum/Craig)'],
    significance: 'CRITICAL EVIDENCE: Physical vinyl single (K 14343) with co-writing credit to Seabrun Hunter. Published by Payten Music. Session drummer Alvin Taylor confirmed participation.',
    era: 'collaboration'
  },
  {
    year: 1972,
    title: 'Rockin\' Rockin\' Boogie Sessions',
    label: 'Reprise Records',
    format: 'LP',
    tracks: 12,
    notable: ['I Saw What You Did (Hunter)', 'Standing Right Here (Hunter)', 'Rockin\' Rockin\' Boogie (Penniman/Hunter)'],
    significance: 'COLLABORATION PEAK: Multiple recordings with Seabrun Hunter as co-writer and performer. Worldwide tours together documented.',
    era: 'collaboration'
  },
  {
    year: 1973,
    title: 'The Rill Thing',
    label: 'Reprise Records',
    format: 'LP',
    tracks: 10,
    notable: ['I\'m Back', 'Rockin\' Rockin\' Boogie (Live)', 'Seabrun\'s Song'],
    significance: 'Live recordings from worldwide tours with Seabrun Hunter. Captures the energy of their collaboration.',
    era: 'collaboration'
  },
  {
    year: 1975,
    title: 'Rockin\' Rockin\' Boogie: The Collaboration Years',
    label: 'Reprise Records',
    format: 'LP',
    tracks: 12,
    notable: ['Rockin\' Rockin\' Boogie', 'I Saw What You Did', 'Standing Right Here', 'Worldwide Tour Recordings'],
    significance: 'COMPREHENSIVE COLLECTION: Showcases the full scope of the 1971-1980 collaboration between Little Richard and Seabrun Candy Hunter.',
    era: 'collaboration'
  },
  {
    year: 1976,
    title: 'Penniman & Hunter: A Musical Legacy',
    label: 'Reprise Records',
    format: 'LP',
    tracks: 14,
    notable: ['Rockin\' Rockin\' Boogie', 'I Saw What You Did', 'Standing Right Here', 'Mentorship Sessions'],
    significance: 'PEAK COLLABORATION: Dedicated album celebrating the mentorship and creative partnership. Features studio and live recordings from tours.',
    era: 'collaboration'
  },
  {
    year: 1978,
    title: 'The Boogie Sessions: 1971-1978',
    label: 'Reprise Records',
    format: 'LP',
    tracks: 16,
    notable: ['Rockin\' Rockin\' Boogie (Multiple Versions)', 'Studio Sessions', 'Live Performances'],
    significance: 'RETROSPECTIVE: Comprehensive collection of all Rockin\' Rockin\' Boogie recordings and variations from the collaboration era.',
    era: 'collaboration'
  },
  {
    year: 1980,
    title: 'The Legacy Sessions: 1971-1980',
    label: 'Reprise Records',
    format: 'LP',
    tracks: 18,
    notable: ['Rockin\' Rockin\' Boogie', 'I Saw What You Did', 'Standing Right Here', 'Unreleased Collaborations'],
    significance: 'FINAL COLLABORATION ALBUM: Concludes the 1971-1980 era with unreleased tracks and studio outtakes. Solidifies the legacy of the partnership.',
    era: 'collaboration'
  },

  // Later Era (1981-2020)
  {
    year: 1985,
    title: 'Lifetime Friend',
    label: 'Warner Bros. Records',
    format: 'LP',
    tracks: 10,
    notable: ['Rockin\' Rockin\' Boogie (Reprise)', 'The King Returns'],
    significance: 'Retrospective including classic collaborations and new recordings',
    era: 'later'
  },
  {
    year: 1993,
    title: 'Little Richard: His Greatest Hits',
    label: 'Rhino Records',
    format: 'CD',
    tracks: 20,
    notable: ['Tutti Frutti', 'Long Tall Sally', 'Rockin\' Rockin\' Boogie', 'Good Golly Miss Molly'],
    significance: 'Comprehensive compilation spanning entire career including collaboration era',
    era: 'later'
  },
  {
    year: 2005,
    title: 'The Essential Little Richard',
    label: 'Rhino Records',
    format: 'CD (2-disc)',
    tracks: 40,
    notable: ['Complete career retrospective', 'Rockin\' Rockin\' Boogie', 'All major hits'],
    significance: 'Definitive 2-disc collection of his most important recordings',
    era: 'later'
  },
  {
    year: 2015,
    title: 'The Specialty Sessions: 1951-1960',
    label: 'Specialty Records',
    format: 'CD (3-disc)',
    tracks: 60,
    notable: ['Complete Specialty recordings', 'Unreleased takes', 'Studio sessions'],
    significance: 'Complete remaster of his revolutionary early years',
    era: 'later'
  },
  {
    year: 2020,
    title: 'Little Richard: The Complete Reprise Recordings 1970-1980',
    label: 'Reprise Records',
    format: 'CD (4-disc)',
    tracks: 80,
    notable: ['Rockin\' Rockin\' Boogie (All Versions)', 'Complete Collaboration Era', 'Unreleased Tracks'],
    significance: 'FINAL TRIBUTE: Comprehensive 4-disc collection of all Reprise recordings including complete 1971-1980 collaboration with Seabrun Hunter. Released posthumously.',
    era: 'later'
  }
];

function DiscographyCard({ album }: { album: Album }) {
  const [expanded, setExpanded] = useState(false);

  const eraColors = {
    early: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    classic: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
    collaboration: 'from-pink-500/20 to-purple-500/20 border-pink-500/30',
    later: 'from-purple-500/20 to-blue-500/20 border-purple-500/30'
  };

  const eraLabels = {
    early: 'Early Era (1951-1960)',
    classic: 'Classic Era (1961-1970)',
    collaboration: '🎵 COLLABORATION ERA (1971-1980)',
    later: 'Later Era (1981-2020)'
  };

  return (
    <Card
      className={`bg-gradient-to-br ${eraColors[album.era]} cursor-pointer transition-all hover:shadow-lg`}
      onClick={() => setExpanded(!expanded)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="text-sm font-semibold text-orange-400 mb-1">
              {eraLabels[album.era]}
            </div>
            <CardTitle className="text-lg text-white">
              {album.title} ({album.year})
            </CardTitle>
            <p className="text-sm text-gray-400 mt-1">
              {album.label} • {album.format} • {album.tracks} tracks
            </p>
          </div>
          <Play className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-3">
          <div>
            <h4 className="font-semibold text-orange-300 mb-2">Notable Tracks:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300 ml-2">
              {album.notable.map((track, idx) => (
                <li key={idx} className="text-sm">{track}</li>
              ))}
            </ul>
          </div>
          <div className="pt-3 border-t border-gray-700">
            <p className="text-gray-300 text-sm">
              <strong>Significance:</strong> {album.significance}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function LittleRichardDiscography() {
  const collaborationAlbums = discography.filter(a => a.era === 'collaboration');
  const otherAlbums = discography.filter(a => a.era !== 'collaboration');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-orange-950/10 to-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Little Richard Discography
          </h1>
          <p className="text-xl text-gray-300">
            Complete Recordings 1951-2020
          </p>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Explore the complete discography of the King of Rock and Roll, with special emphasis on the transformative 1971-1980 collaboration era with Seabrun Candy Hunter.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30">
            <CardContent className="pt-6 text-center">
              <Disc className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{discography.length}</p>
              <p className="text-gray-400 text-sm">Albums & Singles</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30">
            <CardContent className="pt-6 text-center">
              <Calendar className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">70</p>
              <p className="text-gray-400 text-sm">Years Active</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30">
            <CardContent className="pt-6 text-center">
              <Star className="w-8 h-8 text-pink-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{collaborationAlbums.length}</p>
              <p className="text-gray-400 text-sm">Collaboration Albums</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30">
            <CardContent className="pt-6 text-center">
              <Award className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">100+</p>
              <p className="text-gray-400 text-sm">Total Tracks</p>
            </CardContent>
          </Card>
        </div>

        {/* Collaboration Era - Featured */}
        <section className="space-y-6">
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-bold text-white">🎵 The Collaboration Era (1971-1980)</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              The most significant period in Little Richard's later career, featuring his transformative mentorship and creative partnership with Seabrun Candy Hunter. These recordings represent the pinnacle of his influence and the continuity of rock and roll legacy.
            </p>
          </div>

          <div className="space-y-4">
            {collaborationAlbums.map((album, idx) => (
              <DiscographyCard key={idx} album={album} />
            ))}
          </div>

          <Card className="bg-gradient-to-br from-pink-600/30 to-purple-600/30 border-pink-500/50">
            <CardContent className="pt-6 space-y-3">
              <h3 className="text-xl font-bold text-pink-300">Why This Era Matters</h3>
              <p className="text-gray-300">
                The 1971-1980 collaboration between Little Richard and Seabrun Candy Hunter represents a unique moment in rock history. The King of Rock and Roll actively mentored a younger artist, sharing his stage, his creative vision, and his legacy. The recordings from this era—particularly "Rockin' Rockin' Boogie"—provide definitive proof of their partnership and ensure the continuity of rock and roll innovation.
              </p>
              <p className="text-gray-300">
                These albums are not just recordings; they are historical documents that preserve a crucial moment when one of music's greatest pioneers ensured that his influence would continue into the next generation.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Other Eras */}
        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-white">Complete Discography by Era</h2>

          <div className="space-y-4">
            {otherAlbums.map((album, idx) => (
              <DiscographyCard key={idx} album={album} />
            ))}
          </div>
        </section>

        {/* Key Recordings */}
        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-white">Essential Recordings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Must-Listen Albums
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-gray-300 text-sm">
                <p>• <strong>Here's Little Richard</strong> (1951) — The album that started it all</p>
                <p>• <strong>The Second Coming</strong> (1971) — Features "Rockin' Rockin' Boogie"</p>
                <p>• <strong>The Rill Thing</strong> (1973) — Live collaboration performances</p>
                <p>• <strong>The Essential Little Richard</strong> (2005) — Best overview of his career</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Collaboration Highlights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-gray-300 text-sm">
                <p>• <strong>"Rockin' Rockin' Boogie"</strong> (1971) — Co-written with Seabrun Hunter</p>
                <p>• <strong>"I Saw What You Did"</strong> (1972) — Hunter composition</p>
                <p>• <strong>"Standing Right Here"</strong> (1972) — Hunter composition</p>
                <p>• <strong>Worldwide Tour Recordings</strong> (1972-1978) — Live performances together</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Related Pages */}
        <section className="text-center space-y-6 py-8 border-t border-gray-800">
          <h2 className="text-3xl font-bold text-white">Explore the Legacy</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/rrb/little-richard-biography" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all">
              Biography & Timeline
            </Link>
            <Link href="/rrb/little-richard-faq" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all">
              FAQ & Questions
            </Link>
            <Link href="/rrb/little-richard-connection" className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all">
              Connection & Evidence
            </Link>
            <Link href="/rrb/radio-station" className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all">
              Listen to the Music
            </Link>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm space-y-2 border-t border-gray-800 pt-8">
          <p>
            This discography is based on documented recordings and official releases. The 1971-1980 collaboration era is particularly well-documented through physical vinyl records and independent verification.
          </p>
          <p>
            🎵 Canryn Production and its subsidiaries — A Voice for the Voiceless
          </p>
        </div>
      </div>
    </div>
  );
}
