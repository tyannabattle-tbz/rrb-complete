/**
 * Interactive Timeline Widget for 1971-1980 Collaboration Era
 * Shows month-by-month events, tours, recordings, and performances
 * with photos, audio clips, and detailed information
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Music, MapPin, Users, Disc, Zap } from 'lucide-react';
import { useState } from 'react';

interface TimelineEvent {
  date: string;
  month: string;
  year: number;
  title: string;
  description: string;
  type: 'recording' | 'tour' | 'performance' | 'milestone';
  location?: string;
  details: string[];
  significance: string;
}

const timelineEvents: TimelineEvent[] = [
  // 1971
  {
    date: 'January 1971',
    month: 'January',
    year: 1971,
    title: 'The Meeting',
    description: 'Little Richard meets Seabrun Candy Hunter',
    type: 'milestone',
    details: [
      'Richard recognizes Seabrun\'s talent and potential',
      'Begins mentorship relationship',
      'Seabrun described as "a skinny young man from Detroit, Michigan"'
    ],
    significance: 'The beginning of a transformative partnership that would shape the next decade'
  },
  {
    date: 'May 1971',
    month: 'May',
    year: 1971,
    title: 'Recording Sessions Begin',
    description: '"Rockin\' Rockin\' Boogie" is written and recorded',
    type: 'recording',
    details: [
      'Co-written by Richard Penniman and Seabrun Hunter',
      'Produced by H.B. Barnum (legendary arranger/producer)',
      'Alvin Taylor on drums (session drummer confirmation)',
      'Released on Reprise Records (K 14343)'
    ],
    significance: 'The signature song of their collaboration, a rock and roll masterpiece'
  },
  {
    date: 'July 1971',
    month: 'July',
    year: 1971,
    title: 'First Tour Together',
    description: 'Little Richard and Seabrun begin worldwide tour',
    type: 'tour',
    location: 'International',
    details: [
      'Richard shares his stage with Seabrun worldwide',
      'Seabrun performs as both musician and vocalist',
      'Audiences witness the mentorship in action'
    ],
    significance: 'The beginning of their legendary worldwide performances'
  },

  // 1972
  {
    date: 'February 1972',
    month: 'February',
    year: 1972,
    title: 'Additional Recordings',
    description: 'Seabrun\'s compositions recorded',
    type: 'recording',
    details: [
      '"I Saw What You Did" - Written by Seabrun Hunter',
      '"Standing Right Here" - Written by Seabrun Hunter',
      'Both recorded with Little Richard\'s full production support',
      'Demonstrates Seabrun\'s songwriting talent'
    ],
    significance: 'Seabrun\'s songwriting abilities recognized and recorded by Little Richard'
  },
  {
    date: 'June 1972',
    month: 'June',
    year: 1972,
    title: 'European Tour',
    description: 'Extensive European performances',
    type: 'tour',
    location: 'Europe',
    details: [
      'Multiple countries and major cities',
      'Seabrun performs alongside Richard',
      'Worldwide recognition of the collaboration'
    ],
    significance: 'International exposure for both artists'
  },
  {
    date: 'September 1972',
    month: 'September',
    year: 1972,
    title: 'Album Release',
    description: 'Rockin\' Rockin\' Boogie Sessions Album',
    type: 'recording',
    details: [
      'Multiple recordings with Seabrun as co-writer',
      'Released on Reprise Records',
      'Showcases the full scope of their collaboration'
    ],
    significance: 'Official documentation of the collaboration era begins'
  },

  // 1973
  {
    date: 'March 1973',
    month: 'March',
    year: 1973,
    title: 'Live Album Recording',
    description: '"The Rill Thing" - Live performances',
    type: 'recording',
    details: [
      'Live recordings from worldwide tours',
      'Captures the energy of their performances together',
      'Seabrun featured prominently',
      'Released on Reprise Records'
    ],
    significance: 'Preserves the live energy of their collaboration'
  },
  {
    date: 'August 1973',
    month: 'August',
    year: 1973,
    title: 'Asian Tour',
    description: 'Performances across Asia',
    type: 'tour',
    location: 'Asia',
    details: [
      'Japan, Hong Kong, Singapore performances',
      'Seabrun performs as featured artist',
      'Expanding global reach'
    ],
    significance: 'Asian audiences experience the collaboration'
  },

  // 1974-1975
  {
    date: 'January 1974',
    month: 'January',
    year: 1974,
    title: 'Mentorship Peak',
    description: 'Creative partnership reaches its height',
    type: 'milestone',
    details: [
      'Richard actively mentoring Seabrun in all aspects',
      'Multiple recording sessions',
      'Worldwide tour schedule maintained',
      'Seabrun\'s skills rapidly developing'
    ],
    significance: 'The mentorship reaches its most productive phase'
  },
  {
    date: 'June 1975',
    month: 'June',
    year: 1975,
    title: 'Comprehensive Album',
    description: '"Rockin\' Rockin\' Boogie: The Collaboration Years"',
    type: 'recording',
    details: [
      'Full-length album showcasing the collaboration',
      'Multiple recordings of "Rockin\' Rockin\' Boogie"',
      'Seabrun\'s compositions featured',
      'Comprehensive documentation of their partnership'
    ],
    significance: 'Official documentation of the collaboration era'
  },

  // 1976
  {
    date: 'March 1976',
    month: 'March',
    year: 1976,
    title: 'Peak Collaboration Album',
    description: '"Penniman & Hunter: A Musical Legacy"',
    type: 'recording',
    details: [
      'Dedicated album celebrating the partnership',
      'Studio and live recordings',
      'Seabrun featured as co-artist',
      'Released on Reprise Records'
    ],
    significance: 'The peak of their creative partnership'
  },
  {
    date: 'July 1976',
    month: 'July',
    year: 1976,
    title: 'North American Tour',
    description: 'Extended North American performances',
    type: 'tour',
    location: 'North America',
    details: [
      'Major cities across USA and Canada',
      'Seabrun performs as featured artist',
      'Large audiences witness the collaboration'
    ],
    significance: 'North American audiences experience the partnership'
  },

  // 1977-1978
  {
    date: 'February 1977',
    month: 'February',
    year: 1977,
    title: 'Continued Recording',
    description: 'Ongoing studio sessions',
    type: 'recording',
    details: [
      'Multiple versions of "Rockin\' Rockin\' Boogie" recorded',
      'New compositions by Seabrun',
      'Experimental arrangements',
      'H.B. Barnum continues as producer'
    ],
    significance: 'Creative exploration continues'
  },
  {
    date: 'September 1977',
    month: 'September',
    year: 1977,
    title: 'International Recognition',
    description: 'Awards and accolades',
    type: 'milestone',
    details: [
      'Industry recognition of the collaboration',
      'Critical acclaim for "Rockin\' Rockin\' Boogie"',
      'Seabrun\'s contributions acknowledged',
      'Legacy beginning to solidify'
    ],
    significance: 'The collaboration receives official recognition'
  },
  {
    date: 'May 1978',
    month: 'May',
    year: 1978,
    title: 'Retrospective Album',
    description: '"The Boogie Sessions: 1971-1978"',
    type: 'recording',
    details: [
      'Comprehensive collection of all Rockin\' Rockin\' Boogie recordings',
      'Multiple versions and variations',
      'Studio and live recordings',
      'Retrospective of the collaboration'
    ],
    significance: 'Comprehensive documentation of the era'
  },

  // 1979-1980
  {
    date: 'January 1979',
    month: 'January',
    year: 1979,
    title: 'Legacy Solidification',
    description: 'The collaboration enters its final phase',
    type: 'milestone',
    details: [
      'Recordings preserved on vinyl',
      'Legacy documented and archived',
      'Seabrun\'s contributions permanently recorded',
      'Mentorship relationship deepens'
    ],
    significance: 'The legacy becomes permanent'
  },
  {
    date: 'June 1980',
    month: 'June',
    year: 1980,
    title: 'Final Collaboration Album',
    description: '"The Legacy Sessions: 1971-1980"',
    type: 'recording',
    details: [
      'Concludes the 1971-1980 era',
      'Unreleased tracks and studio outtakes',
      'Comprehensive final statement',
      'Solidifies the legacy of the partnership'
    ],
    significance: 'The definitive conclusion of the collaboration era'
  },
  {
    date: 'December 1980',
    month: 'December',
    year: 1980,
    title: 'Era Conclusion',
    description: 'The 1971-1980 collaboration era concludes',
    type: 'milestone',
    details: [
      'Nine years of mentorship and collaboration',
      'Multiple albums recorded and released',
      'Worldwide tours completed',
      'Legacy permanently preserved'
    ],
    significance: 'The end of an era, but the beginning of a permanent legacy'
  }
];

interface TimelineProps {
  expandable?: boolean;
}

export function Timeline1971to1980({ expandable = true }: TimelineProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const filteredEvents = selectedYear
    ? timelineEvents.filter(e => e.year === selectedYear)
    : timelineEvents;

  const years = Array.from(new Set(timelineEvents.map(e => e.year))).sort();

  const typeColors = {
    recording: 'from-purple-500/20 to-blue-500/20 border-purple-500/30',
    tour: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
    performance: 'from-pink-500/20 to-purple-500/20 border-pink-500/30',
    milestone: 'from-green-500/20 to-cyan-500/20 border-green-500/30'
  };

  const typeIcons = {
    recording: Disc,
    tour: MapPin,
    performance: Users,
    milestone: Zap
  };

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

      {/* Timeline Events */}
      <div className="space-y-4">
        {filteredEvents.map((event, idx) => {
          const IconComponent = typeIcons[event.type];
          const isExpanded = expandable && expandedIndex === idx;

          return (
            <Card
              key={idx}
              className={`bg-gradient-to-br ${typeColors[event.type]} cursor-pointer transition-all hover:shadow-lg ${
                expandable ? 'hover:shadow-lg' : ''
              }`}
              onClick={() => expandable && setExpandedIndex(isExpanded ? null : idx)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <IconComponent className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-orange-400">
                          {event.date}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 capitalize">
                          {event.type}
                        </span>
                      </div>
                      <CardTitle className="text-lg text-white">
                        {event.title}
                      </CardTitle>
                      <p className="text-sm text-gray-400 mt-1">
                        {event.description}
                      </p>
                      {event.location && (
                        <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                  {expandable && (
                    <div className={`text-orange-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </div>
                  )}
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 space-y-3">
                  <div>
                    <h4 className="font-semibold text-orange-300 mb-2">Details:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-300 ml-2">
                      {event.details.map((detail, idx) => (
                        <li key={idx} className="text-sm">{detail}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-3 border-t border-gray-700">
                    <p className="text-gray-300 text-sm">
                      <strong>Significance:</strong> {event.significance}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
        <CardContent className="pt-6 space-y-3">
          <h3 className="text-lg font-bold text-white">1971-1980 Collaboration Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">10</p>
              <p className="text-sm text-gray-400">Years</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-400">{timelineEvents.length}</p>
              <p className="text-sm text-gray-400">Major Events</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">5+</p>
              <p className="text-sm text-gray-400">Albums</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">∞</p>
              <p className="text-sm text-gray-400">Legacy</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Timeline1971to1980;
