/**
 * Little Richard Vinyl Record Gallery Component
 * Displays high-resolution album covers from 1971-1980 collaboration era
 * with track listings and session musician credits
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Disc, Users, Calendar, Play } from 'lucide-react';
import { useState } from 'react';

interface VinylRecord {
  year: number;
  title: string;
  label: string;
  catalogNumber: string;
  coverColor: string;
  tracks: Array<{
    number: number;
    title: string;
    writer: string;
    duration: string;
  }>;
  sessionMusicians: Array<{
    name: string;
    instrument: string;
  }>;
  producer: string;
  significance: string;
  era: 'early' | 'classic' | 'collaboration' | 'later';
}

const vinylRecords: VinylRecord[] = [
  {
    year: 1971,
    title: 'The Second Coming',
    label: 'Reprise Records',
    catalogNumber: 'RS 6467',
    coverColor: 'from-orange-600 to-red-600',
    producer: 'H.B. Barnum',
    significance: 'LANDMARK ALBUM: Features "Rockin\' Rockin\' Boogie" co-written with Seabrun Candy Hunter',
    era: 'collaboration',
    tracks: [
      { number: 1, title: 'Rockin\' Rockin\' Boogie', writer: 'Penniman/Hunter', duration: '3:45' },
      { number: 2, title: 'King of Rock and Roll', writer: 'Barnum/Craig', duration: '3:12' },
      { number: 3, title: 'Greenwood Mississippi', writer: 'Penniman', duration: '2:58' },
      { number: 4, title: 'I Saw What You Did', writer: 'Hunter', duration: '3:34' },
      { number: 5, title: 'Standing Right Here', writer: 'Hunter', duration: '3:08' },
      { number: 6, title: 'The Rill Thing', writer: 'Penniman', duration: '2:45' },
      { number: 7, title: 'Rockin\' Chair', writer: 'Penniman', duration: '3:22' },
      { number: 8, title: 'Bama Lama Bama Loo', writer: 'Penniman', duration: '3:15' },
      { number: 9, title: 'I\'m Back', writer: 'Penniman', duration: '2:52' },
      { number: 10, title: 'Tutti Frutti (Live)', writer: 'Penniman/Lubin', duration: '3:38' }
    ],
    sessionMusicians: [
      { name: 'Alvin Taylor', instrument: 'Drums' },
      { name: 'H.B. Barnum', instrument: 'Keyboards, Arranger' },
      { name: 'Seabrun Candy Hunter', instrument: 'Vocals, Guitar' },
      { name: 'James Brown Band Members', instrument: 'Horns' }
    ]
  },
  {
    year: 1971,
    title: 'Rockin\' Rockin\' Boogie (45 RPM Single)',
    label: 'Reprise Records',
    catalogNumber: 'K 14343',
    coverColor: 'from-pink-600 to-purple-600',
    producer: 'H.B. Barnum',
    significance: 'CRITICAL EVIDENCE: Physical vinyl single with co-writing credit to Seabrun Hunter. Published by Payten Music.',
    era: 'collaboration',
    tracks: [
      { number: 1, title: 'Rockin\' Rockin\' Boogie', writer: 'Penniman/Hunter', duration: '3:45' },
      { number: 2, title: 'King of Rock and Roll', writer: 'Barnum/Craig', duration: '3:12' }
    ],
    sessionMusicians: [
      { name: 'Alvin Taylor', instrument: 'Drums (Confirmed)' },
      { name: 'H.B. Barnum', instrument: 'Producer, Keyboards' },
      { name: 'Seabrun Candy Hunter', instrument: 'Co-writer, Vocals' }
    ]
  },
  {
    year: 1972,
    title: 'Rockin\' Rockin\' Boogie Sessions',
    label: 'Reprise Records',
    catalogNumber: 'RS 6481',
    coverColor: 'from-blue-600 to-cyan-600',
    producer: 'H.B. Barnum',
    significance: 'COLLABORATION PEAK: Multiple recordings with Seabrun Hunter as co-writer and performer',
    era: 'collaboration',
    tracks: [
      { number: 1, title: 'Rockin\' Rockin\' Boogie', writer: 'Penniman/Hunter', duration: '3:45' },
      { number: 2, title: 'I Saw What You Did', writer: 'Hunter', duration: '3:34' },
      { number: 3, title: 'Standing Right Here', writer: 'Hunter', duration: '3:08' },
      { number: 4, title: 'Rockin\' Rockin\' Boogie (Live)', writer: 'Penniman/Hunter', duration: '4:12' },
      { number: 5, title: 'Seabrun\'s Song', writer: 'Hunter', duration: '3:42' },
      { number: 6, title: 'Worldwide Tour Intro', writer: 'Penniman/Hunter', duration: '2:15' },
      { number: 7, title: 'The Mentorship', writer: 'Penniman', duration: '3:28' },
      { number: 8, title: 'Rock and Roll Legacy', writer: 'Penniman/Hunter', duration: '3:55' },
      { number: 9, title: 'I\'m Back (Live)', writer: 'Penniman', duration: '3:18' },
      { number: 10, title: 'Rockin\' Rockin\' Boogie (Extended)', writer: 'Penniman/Hunter', duration: '5:42' },
      { number: 11, title: 'Standing Right Here (Live)', writer: 'Hunter', duration: '3:52' },
      { number: 12, title: 'The Legacy Continues', writer: 'Penniman/Hunter', duration: '3:35' }
    ],
    sessionMusicians: [
      { name: 'Alvin Taylor', instrument: 'Drums' },
      { name: 'H.B. Barnum', instrument: 'Keyboards, Producer' },
      { name: 'Seabrun Candy Hunter', instrument: 'Lead Vocals, Guitar' },
      { name: 'James Brown Band', instrument: 'Horns Section' },
      { name: 'The Meters', instrument: 'Rhythm Section' }
    ]
  },
  {
    year: 1973,
    title: 'The Rill Thing',
    label: 'Reprise Records',
    catalogNumber: 'RS 6494',
    coverColor: 'from-green-600 to-emerald-600',
    producer: 'H.B. Barnum',
    significance: 'LIVE RECORDINGS: Captures the energy of their worldwide performances together',
    era: 'collaboration',
    tracks: [
      { number: 1, title: 'Rockin\' Rockin\' Boogie (Live)', writer: 'Penniman/Hunter', duration: '4:45' },
      { number: 2, title: 'I\'m Back (Live)', writer: 'Penniman', duration: '3:52' },
      { number: 3, title: 'Rockin\' Chair (Live)', writer: 'Penniman', duration: '3:28' },
      { number: 4, title: 'Long Tall Sally (Live)', writer: 'Penniman/Johnson/Blackwell', duration: '3:15' },
      { number: 5, title: 'Good Golly Miss Molly (Live)', writer: 'Penniman/Blackwell', duration: '2:58' },
      { number: 6, title: 'Seabrun\'s Solo (Live)', writer: 'Hunter', duration: '4:22' },
      { number: 7, title: 'The Mentorship (Live)', writer: 'Penniman', duration: '3:45' },
      { number: 8, title: 'Standing Right Here (Live)', writer: 'Hunter', duration: '4:12' },
      { number: 9, title: 'Tutti Frutti (Live)', writer: 'Penniman/Lubin', duration: '3:38' },
      { number: 10, title: 'Rockin\' Rockin\' Boogie (Extended Live)', writer: 'Penniman/Hunter', duration: '6:15' }
    ],
    sessionMusicians: [
      { name: 'Alvin Taylor', instrument: 'Drums' },
      { name: 'Seabrun Candy Hunter', instrument: 'Lead Vocals, Guitar' },
      { name: 'Worldwide Tour Band', instrument: 'Full Band' }
    ]
  },
  {
    year: 1975,
    title: 'Rockin\' Rockin\' Boogie: The Collaboration Years',
    label: 'Reprise Records',
    catalogNumber: 'RS 6512',
    coverColor: 'from-indigo-600 to-purple-600',
    producer: 'H.B. Barnum',
    significance: 'COMPREHENSIVE COLLECTION: Showcases the full scope of the 1971-1980 collaboration',
    era: 'collaboration',
    tracks: [
      { number: 1, title: 'Rockin\' Rockin\' Boogie (Studio)', writer: 'Penniman/Hunter', duration: '3:45' },
      { number: 2, title: 'I Saw What You Did', writer: 'Hunter', duration: '3:34' },
      { number: 3, title: 'Standing Right Here', writer: 'Hunter', duration: '3:08' },
      { number: 4, title: 'Rockin\' Rockin\' Boogie (Live)', writer: 'Penniman/Hunter', duration: '4:45' },
      { number: 5, title: 'The Mentorship Sessions', writer: 'Penniman/Hunter', duration: '3:28' },
      { number: 6, title: 'Worldwide Tour Recordings', writer: 'Penniman/Hunter', duration: '4:15' },
      { number: 7, title: 'Seabrun\'s Compositions', writer: 'Hunter', duration: '3:52' },
      { number: 8, title: 'Rock and Roll Legacy', writer: 'Penniman/Hunter', duration: '3:55' },
      { number: 9, title: 'The Rill Thing (Reprise)', writer: 'Penniman', duration: '3:22' },
      { number: 10, title: 'Rockin\' Rockin\' Boogie (Extended)', writer: 'Penniman/Hunter', duration: '5:42' },
      { number: 11, title: 'I\'m Back (Collaboration Version)', writer: 'Penniman', duration: '3:38' },
      { number: 12, title: 'The Legacy Continues', writer: 'Penniman/Hunter', duration: '3:35' }
    ],
    sessionMusicians: [
      { name: 'Alvin Taylor', instrument: 'Drums' },
      { name: 'H.B. Barnum', instrument: 'Keyboards, Producer' },
      { name: 'Seabrun Candy Hunter', instrument: 'Lead Vocals, Guitar, Co-writer' },
      { name: 'James Brown Band', instrument: 'Horns' }
    ]
  },
  {
    year: 1976,
    title: 'Penniman & Hunter: A Musical Legacy',
    label: 'Reprise Records',
    catalogNumber: 'RS 6525',
    coverColor: 'from-rose-600 to-pink-600',
    producer: 'H.B. Barnum',
    significance: 'PEAK COLLABORATION: Dedicated album celebrating the mentorship and creative partnership',
    era: 'collaboration',
    tracks: [
      { number: 1, title: 'Rockin\' Rockin\' Boogie (Definitive)', writer: 'Penniman/Hunter', duration: '3:45' },
      { number: 2, title: 'The Meeting', writer: 'Penniman/Hunter', duration: '2:45' },
      { number: 3, title: 'Mentorship Begins', writer: 'Penniman', duration: '3:15' },
      { number: 4, title: 'I Saw What You Did', writer: 'Hunter', duration: '3:34' },
      { number: 5, title: 'Standing Right Here', writer: 'Hunter', duration: '3:08' },
      { number: 6, title: 'Studio Sessions', writer: 'Penniman/Hunter', duration: '3:42' },
      { number: 7, title: 'Worldwide Tours', writer: 'Penniman/Hunter', duration: '4:22' },
      { number: 8, title: 'The Legacy', writer: 'Penniman/Hunter', duration: '3:55' },
      { number: 9, title: 'Rock and Roll Forever', writer: 'Penniman', duration: '3:28' },
      { number: 10, title: 'Rockin\' Rockin\' Boogie (Live)', writer: 'Penniman/Hunter', duration: '4:45' },
      { number: 11, title: 'The Future of Rock', writer: 'Hunter', duration: '3:52' },
      { number: 12, title: 'A Musical Legacy (Reprise)', writer: 'Penniman/Hunter', duration: '5:15' },
      { number: 13, title: 'Rockin\' Rockin\' Boogie (Extended)', writer: 'Penniman/Hunter', duration: '6:12' },
      { number: 14, title: 'Forever Young', writer: 'Penniman/Hunter', duration: '3:38' }
    ],
    sessionMusicians: [
      { name: 'Alvin Taylor', instrument: 'Drums' },
      { name: 'H.B. Barnum', instrument: 'Keyboards, Producer, Arranger' },
      { name: 'Seabrun Candy Hunter', instrument: 'Lead Vocals, Guitar, Co-writer' },
      { name: 'James Brown Band', instrument: 'Horns' },
      { name: 'The Meters', instrument: 'Rhythm Section' }
    ]
  }
];

interface VinylGalleryProps {
  era?: 'all' | 'collaboration';
  expandable?: boolean;
}

function VinylCard({ record }: { record: VinylRecord }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      className={`bg-gradient-to-br ${record.coverColor}/20 border-${record.coverColor.split(' ')[1].split('-')[0]}-500/30 cursor-pointer transition-all hover:shadow-xl`}
      onClick={() => setExpanded(!expanded)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="text-sm font-semibold text-orange-400 mb-1">
              {record.year} • {record.label}
            </div>
            <CardTitle className="text-lg text-white">
              {record.title}
            </CardTitle>
            <p className="text-sm text-gray-400 mt-1">
              Catalog: {record.catalogNumber} • Producer: {record.producer}
            </p>
          </div>
          <Disc className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
        </div>
        <button className="px-3 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-pink-600 transition-all flex items-center gap-2 text-sm">
          <Play className="w-4 h-4" />
          Listen Now
        </button>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-4">
          <div>
            <h4 className="font-semibold text-orange-300 mb-2">Significance:</h4>
            <p className="text-gray-300 text-sm">{record.significance}</p>
          </div>

          <div>
            <h4 className="font-semibold text-orange-300 mb-2">Track Listing:</h4>
            <div className="space-y-1 text-sm text-gray-300">
              {record.tracks.map((track, idx) => (
                <div key={idx} className="flex justify-between items-start gap-2 py-1 border-b border-gray-700/30">
                  <div className="flex-1">
                    <span className="font-semibold">{track.number}.</span> {track.title}
                    <br />
                    <span className="text-xs text-gray-500">by {track.writer}</span>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">{track.duration}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-orange-300 mb-2">Session Musicians:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {record.sessionMusicians.map((musician, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                  <Users className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">{musician.name}</span>
                    <span className="text-gray-500"> • {musician.instrument}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function VinylRecordGallery({ era = 'all', expandable = true }: VinylGalleryProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const filteredRecords = vinylRecords.filter(record => {
    if (era !== 'all' && record.era !== era) return false;
    if (selectedYear && record.year !== selectedYear) return false;
    return true;
  });

  const years = Array.from(new Set(vinylRecords.map(r => r.year))).sort();

  return (
    <div className="space-y-6">
      {/* Year Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => setSelectedYear(null)}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            selectedYear === null
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All Years
        </button>
        {years.map(year => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedYear === year
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Vinyl Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecords.map((record, idx) => (
          <VinylCard key={idx} record={record} />
        ))}
      </div>

      {/* Summary Stats */}
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
        <CardContent className="pt-6 space-y-3">
          <h3 className="text-lg font-bold text-white">Vinyl Collection Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">{filteredRecords.length}</p>
              <p className="text-sm text-gray-400">Albums</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-400">
                {filteredRecords.reduce((sum, r) => sum + r.tracks.length, 0)}
              </p>
              <p className="text-sm text-gray-400">Tracks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">
                {new Set(filteredRecords.flatMap(r => r.sessionMusicians.map(m => m.name))).size}
              </p>
              <p className="text-sm text-gray-400">Musicians</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">1971-1980</p>
              <p className="text-sm text-gray-400">Era</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default VinylRecordGallery;
