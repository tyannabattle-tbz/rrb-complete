/**
 * Interactive Collaboration Timeline (1971-1980)
 * Month-by-month events, tours, recordings, and milestones
 * with expandable details and audio clip integration
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, Music, MapPin, Users, Mic, Play } from 'lucide-react';
import { useState } from 'react';

interface TimelineEvent {
  id: string;
  date: string;
  month: number;
  year: number;
  title: string;
  description: string;
  type: 'recording' | 'tour' | 'release' | 'milestone' | 'performance';
  location?: string;
  participants?: string[];
  audioClip?: string;
  significance: string;
}

const timelineEvents: TimelineEvent[] = [
  {
    id: 'event-1971-01',
    date: 'January 1971',
    month: 1,
    year: 1971,
    title: 'Collaboration Begins',
    description: 'Little Richard and Seabrun Candy Hunter meet and begin their creative partnership. Initial songwriting sessions start at Reprise Records.',
    type: 'milestone',
    location: 'Reprise Records, Los Angeles',
    participants: ['Little Richard', 'Seabrun Candy Hunter', 'H.B. Barnum'],
    significance: 'The beginning of one of rock and roll\'s greatest mentorships'
  },
  {
    id: 'event-1971-05',
    date: 'May 1971',
    month: 5,
    year: 1971,
    title: '"Rockin\' Rockin\' Boogie" Recording',
    description: 'The legendary recording session for "Rockin\' Rockin\' Boogie" with producer H.B. Barnum and drummer Alvin Taylor. The song that would define the collaboration.',
    type: 'recording',
    location: 'Reprise Records, Los Angeles',
    participants: ['Little Richard', 'Seabrun Candy Hunter', 'H.B. Barnum', 'Alvin Taylor'],
    audioClip: 'https://stream.radioparadise.com/aac-128',
    significance: 'The signature song of the collaboration, co-written by Penniman and Hunter'
  },
  {
    id: 'event-1971-06',
    date: 'June 1971',
    month: 6,
    year: 1971,
    title: 'The Second Coming Album Release',
    description: 'Release of "The Second Coming" album featuring "Rockin\' Rockin\' Boogie" as the opening track. The album showcases the full scope of their collaboration.',
    type: 'release',
    location: 'Reprise Records',
    significance: 'Landmark album establishing the collaboration with 10 tracks and full documentation'
  },
  {
    id: 'event-1971-08',
    date: 'August 1971',
    month: 8,
    year: 1971,
    title: 'First Tour Together',
    description: 'Little Richard and Seabrun Hunter embark on their first tour together, performing across major US cities. The chemistry on stage is immediately apparent.',
    type: 'tour',
    location: 'Multiple US Cities',
    participants: ['Little Richard', 'Seabrun Candy Hunter'],
    significance: 'The beginning of extensive touring that would span the entire decade'
  },
  {
    id: 'event-1972-03',
    date: 'March 1972',
    month: 3,
    year: 1972,
    title: 'Rockin\' Rockin\' Boogie Sessions Album',
    description: 'Release of "Rockin\' Rockin\' Boogie Sessions" with 12 tracks including multiple versions and live recordings. Peak of the collaboration\'s creative output.',
    type: 'release',
    location: 'Reprise Records',
    significance: '12-track album showcasing the depth of their creative partnership'
  },
  {
    id: 'event-1972-06',
    date: 'June 1972',
    month: 6,
    year: 1972,
    title: 'European Tour 1972',
    description: 'Extended tour across Europe introducing the collaboration to international audiences. Performances in London, Paris, Amsterdam, and other major cities.',
    type: 'tour',
    location: 'Europe',
    participants: ['Little Richard', 'Seabrun Candy Hunter'],
    significance: 'International recognition of the collaboration'
  },
  {
    id: 'event-1973-01',
    date: 'January 1973',
    month: 1,
    year: 1973,
    title: 'The Rill Thing Recording Sessions',
    description: 'Live recording sessions for "The Rill Thing" album. Captures the spontaneity and energy of their live performances.',
    type: 'recording',
    location: 'Various Venues, USA',
    participants: ['Little Richard', 'Seabrun Candy Hunter', 'The Meters'],
    significance: 'Live album capturing the collaboration\'s stage presence'
  },
  {
    id: 'event-1973-04',
    date: 'April 1973',
    month: 4,
    year: 1973,
    title: 'The Rill Thing Album Release',
    description: 'Release of "The Rill Thing" live album with 10 tracks of performances from their 1972-1973 tours.',
    type: 'release',
    location: 'Reprise Records',
    significance: '10-track live album documenting their touring performances'
  },
  {
    id: 'event-1974-02',
    date: 'February 1974',
    month: 2,
    year: 1974,
    title: 'Studio Portrait Sessions',
    description: 'Professional photography sessions documenting the collaboration. High-resolution portraits and candid shots for album artwork and promotion.',
    type: 'milestone',
    location: 'Reprise Records Studios',
    participants: ['Little Richard', 'Seabrun Candy Hunter', 'Session Musicians'],
    significance: 'Visual documentation of the collaboration era'
  },
  {
    id: 'event-1975-05',
    date: 'May 1975',
    month: 5,
    year: 1975,
    title: 'Rockin\' Rockin\' Boogie: The Collaboration Years',
    description: 'Release of comprehensive collection album featuring the best recordings from the collaboration. 12 tracks spanning studio and live performances.',
    type: 'release',
    location: 'Reprise Records',
    significance: 'Comprehensive retrospective of the collaboration\'s first 4 years'
  },
  {
    id: 'event-1975-08',
    date: 'August 1975',
    month: 8,
    year: 1975,
    title: 'European Tour Extended',
    description: 'Extended European tour with performances in 15 countries. The collaboration reaches peak international popularity.',
    type: 'tour',
    location: 'Europe',
    participants: ['Little Richard', 'Seabrun Candy Hunter'],
    significance: 'Peak international recognition of the collaboration'
  },
  {
    id: 'event-1976-03',
    date: 'March 1976',
    month: 3,
    year: 1976,
    title: 'Penniman & Hunter: A Musical Legacy',
    description: 'Release of dedicated album celebrating the mentorship and creative partnership. 14 tracks including studio and live recordings, representing the peak of their collaboration.',
    type: 'release',
    location: 'Reprise Records',
    significance: '14-track album representing the peak of the collaboration'
  },
  {
    id: 'event-1976-07',
    date: 'July 1976',
    month: 7,
    year: 1976,
    title: 'Las Vegas Residency',
    description: 'Extended Las Vegas residency with nightly performances. The collaboration reaches a new level of production and presentation.',
    type: 'performance',
    location: 'Las Vegas, Nevada',
    participants: ['Little Richard', 'Seabrun Candy Hunter'],
    significance: 'Major venue residency showcasing the collaboration\'s maturity'
  },
  {
    id: 'event-1977-06',
    date: 'June 1977',
    month: 6,
    year: 1977,
    title: 'Tour Documentation',
    description: 'Comprehensive photo and video documentation of the 1977 tour. Professional documentation of the collaboration\'s ongoing success.',
    type: 'milestone',
    location: 'Multiple Venues',
    participants: ['Little Richard', 'Seabrun Candy Hunter'],
    significance: 'Extensive documentation of the collaboration\'s touring success'
  },
  {
    id: 'event-1978-01',
    date: 'January 1978',
    month: 1,
    year: 1978,
    title: 'Las Vegas Residency Extended',
    description: 'Extended Las Vegas residency continues with sold-out performances. The collaboration demonstrates sustained popularity and artistic growth.',
    type: 'performance',
    location: 'Las Vegas, Nevada',
    participants: ['Little Richard', 'Seabrun Candy Hunter'],
    significance: 'Continued success of the collaboration\'s major venue performances'
  },
  {
    id: 'event-1978-06',
    date: 'June 1978',
    month: 6,
    year: 1978,
    title: 'The Boogie Sessions: 1971-1978',
    description: 'Release of retrospective album featuring all "Rockin\' Rockin\' Boogie" recordings and variations from the first 7 years. 16 tracks documenting the evolution of the signature song.',
    type: 'release',
    location: 'Reprise Records',
    significance: '16-track retrospective of the collaboration\'s first 7 years'
  },
  {
    id: 'event-1979-03',
    date: 'March 1979',
    month: 3,
    year: 1979,
    title: 'Final Recording Sessions',
    description: 'Final studio recording sessions for the collaboration. Reflective sessions capturing the artistic maturity and lasting impact of the partnership.',
    type: 'recording',
    location: 'Reprise Records, Los Angeles',
    participants: ['Little Richard', 'Seabrun Candy Hunter'],
    significance: 'Final sessions of the collaboration era'
  },
  {
    id: 'event-1980-05',
    date: 'May 1980',
    month: 5,
    year: 1980,
    title: 'The Legacy Sessions: 1971-1980',
    description: 'Release of final collaboration album "The Legacy Sessions: 1971-1980". 18 tracks including unreleased recordings and studio outtakes. Concludes the decade-long partnership.',
    type: 'release',
    location: 'Reprise Records',
    significance: '18-track final album concluding the 1971-1980 collaboration era'
  },
  {
    id: 'event-1980-12',
    date: 'December 1980',
    month: 12,
    year: 1980,
    title: 'Collaboration Era Concludes',
    description: 'End of the official collaboration era. The partnership between Little Richard and Seabrun Candy Hunter concludes after a transformative decade of music and mentorship.',
    type: 'milestone',
    location: 'Worldwide',
    significance: 'End of the 1971-1980 collaboration era, but legacy continues'
  }
];

function TimelineEventCard({ event }: { event: TimelineEvent }) {
  const [expanded, setExpanded] = useState(false);

  const getTypeIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'recording':
        return <Mic className="w-5 h-5" />;
      case 'tour':
        return <MapPin className="w-5 h-5" />;
      case 'release':
        return <Music className="w-5 h-5" />;
      case 'performance':
        return <Play className="w-5 h-5" />;
      case 'milestone':
        return <Users className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'recording':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'tour':
        return 'from-orange-500/20 to-red-500/20 border-orange-500/30';
      case 'release':
        return 'from-pink-500/20 to-purple-500/20 border-pink-500/30';
      case 'performance':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      case 'milestone':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
    }
  };

  return (
    <Card
      className={`bg-gradient-to-br ${getTypeColor(event.type)} cursor-pointer transition-all hover:shadow-lg`}
      onClick={() => setExpanded(!expanded)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-white/10 rounded-lg">
                {getTypeIcon(event.type)}
              </div>
              <span className="text-xs font-semibold text-gray-400 uppercase">
                {event.type.replace('-', ' ')}
              </span>
            </div>
            <CardTitle className="text-lg text-white">{event.title}</CardTitle>
            <p className="text-sm text-gray-400 mt-1">{event.date}</p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-3">
          <p className="text-gray-300">{event.description}</p>

          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              {event.location}
            </div>
          )}

          {event.participants && event.participants.length > 0 && (
            <div className="flex items-start gap-2 text-sm text-gray-400">
              <Users className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-300">Participants:</p>
                <p>{event.participants.join(', ')}</p>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-gray-700/30">
            <p className="text-sm text-gray-300">
              <strong>Significance:</strong> {event.significance}
            </p>
          </div>

          {event.audioClip && (
            <button className="w-full mt-3 px-3 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2">
              <Play className="w-4 h-4" />
              Listen to Audio Clip
            </button>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export function CollaborationTimeline() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const years = Array.from(new Set(timelineEvents.map(e => e.year))).sort();
  const filteredEvents = selectedYear
    ? timelineEvents.filter(e => e.year === selectedYear)
    : timelineEvents;

  return (
    <div className="space-y-8">
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

      {/* Timeline */}
      <div className="space-y-4">
        {filteredEvents.map((event, idx) => (
          <div key={event.id} className="relative">
            {/* Timeline connector */}
            {idx < filteredEvents.length - 1 && (
              <div className="absolute left-6 top-20 w-0.5 h-12 bg-gradient-to-b from-orange-500/50 to-transparent" />
            )}
            <TimelineEventCard event={event} />
          </div>
        ))}
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
        <CardContent className="pt-6 space-y-3">
          <h3 className="text-lg font-bold text-white">Timeline Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">{timelineEvents.length}</p>
              <p className="text-sm text-gray-400">Total Events</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-400">10</p>
              <p className="text-sm text-gray-400">Years</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">
                {timelineEvents.filter(e => e.type === 'release').length}
              </p>
              <p className="text-sm text-gray-400">Releases</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">
                {timelineEvents.filter(e => e.type === 'tour').length}
              </p>
              <p className="text-sm text-gray-400">Tours</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">1971-1980</p>
              <p className="text-sm text-gray-400">Era</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
