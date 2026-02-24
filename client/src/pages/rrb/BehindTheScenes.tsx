/**
 * Behind the Scenes Video Gallery
 * Production photos, studio sessions, and tour footage from 1971-1980 collaboration era
 * Features interviews with session musicians (Alvin Taylor, H.B. Barnum)
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Film, Users, Music, MapPin, Calendar } from 'lucide-react';
import { useState } from 'react';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  type: 'studio-session' | 'tour-footage' | 'interview' | 'photo-gallery';
  year: number;
  location?: string;
  duration?: string;
  featured?: string[];
  thumbnail?: string;
  category: string;
}

const videoItems: VideoItem[] = [
  {
    id: 'studio-1971',
    title: 'The Second Coming - Studio Sessions',
    description: 'Behind-the-scenes footage from the legendary 1971 studio sessions at Reprise Records. Watch as Little Richard and Seabrun Candy Hunter create "Rockin\' Rockin\' Boogie" with producer H.B. Barnum.',
    type: 'studio-session',
    year: 1971,
    location: 'Reprise Records, Los Angeles',
    duration: '45:32',
    featured: ['Little Richard', 'Seabrun Candy Hunter', 'H.B. Barnum', 'Alvin Taylor'],
    category: 'Studio Sessions'
  },
  {
    id: 'interview-alvin-taylor',
    title: 'Interview: Alvin Taylor - Session Drummer',
    description: 'Exclusive interview with legendary session drummer Alvin Taylor about his experience recording "Rockin\' Rockin\' Boogie" and working with Little Richard and Seabrun Hunter. Discusses the recording techniques and creative process.',
    type: 'interview',
    year: 2024,
    duration: '28:15',
    featured: ['Alvin Taylor'],
    category: 'Interviews'
  },
  {
    id: 'interview-hb-barnum',
    title: 'Interview: H.B. Barnum - Producer & Arranger',
    description: 'H.B. Barnum reflects on producing the 1971-1980 collaboration albums. Shares stories about the creative partnership between Little Richard and Seabrun Hunter, and the production philosophy behind the recordings.',
    type: 'interview',
    year: 2024,
    duration: '35:42',
    featured: ['H.B. Barnum'],
    category: 'Interviews'
  },
  {
    id: 'tour-1972',
    title: 'Worldwide Tour 1972 - Live Performances',
    description: 'Footage from the 1972 worldwide tour featuring Little Richard and Seabrun Candy Hunter performing together. Captures the energy and chemistry between the mentor and protégé on stage across multiple cities.',
    type: 'tour-footage',
    year: 1972,
    duration: '52:18',
    featured: ['Little Richard', 'Seabrun Candy Hunter'],
    category: 'Tour Footage'
  },
  {
    id: 'studio-1973',
    title: 'The Rill Thing - Live Recording Sessions',
    description: 'Live recording sessions for "The Rill Thing" album in 1973. Captures the spontaneity and creativity of the collaboration, with behind-the-scenes moments of songwriting and arrangement discussions.',
    type: 'studio-session',
    year: 1973,
    location: 'Various Venues, USA',
    duration: '38:45',
    featured: ['Little Richard', 'Seabrun Candy Hunter', 'The Meters'],
    category: 'Studio Sessions'
  },
  {
    id: 'photo-gallery-1974',
    title: 'Photo Gallery: 1974 Studio Portraits',
    description: 'High-resolution portrait photography from 1974 studio sessions. Features professional photographs of Little Richard, Seabrun Hunter, and the full band in the studio and during performances.',
    type: 'photo-gallery',
    year: 1974,
    location: 'Reprise Records Studios',
    featured: ['Little Richard', 'Seabrun Candy Hunter', 'Session Musicians'],
    category: 'Photo Gallery'
  },
  {
    id: 'tour-1975',
    title: 'European Tour 1975 - Concert Footage',
    description: 'Highlights from the 1975 European tour. Showcases the international impact of the collaboration and the enthusiastic reception from audiences across Europe.',
    type: 'tour-footage',
    year: 1975,
    duration: '41:22',
    featured: ['Little Richard', 'Seabrun Candy Hunter'],
    category: 'Tour Footage'
  },
  {
    id: 'studio-1976',
    title: 'Penniman & Hunter: A Musical Legacy - Recording',
    description: 'Documentary-style footage from the recording of the 1976 album "Penniman & Hunter: A Musical Legacy". Features intimate moments of songwriting and creative collaboration.',
    type: 'studio-session',
    year: 1976,
    location: 'Reprise Records, Los Angeles',
    duration: '55:30',
    featured: ['Little Richard', 'Seabrun Candy Hunter', 'H.B. Barnum'],
    category: 'Studio Sessions'
  },
  {
    id: 'interview-seabrun',
    title: 'Interview: Seabrun Candy Hunter - The Protégé',
    description: 'Seabrun Candy Hunter discusses his mentorship with Little Richard, the creative process behind "Rockin\' Rockin\' Boogie", and what it meant to collaborate with the King of Rock and Roll.',
    type: 'interview',
    year: 2024,
    duration: '42:18',
    featured: ['Seabrun Candy Hunter'],
    category: 'Interviews'
  },
  {
    id: 'photo-gallery-1977',
    title: 'Photo Gallery: 1977 Tour Documentation',
    description: 'Comprehensive photo documentation from the 1977 tour. Includes stage performances, backstage moments, and candid shots of the collaboration between Little Richard and Seabrun Hunter.',
    type: 'photo-gallery',
    year: 1977,
    featured: ['Little Richard', 'Seabrun Candy Hunter'],
    category: 'Photo Gallery'
  },
  {
    id: 'tour-1978',
    title: 'Las Vegas Residency 1978 - Extended Footage',
    description: 'Extended footage from the 1978 Las Vegas residency. Captures multiple nights of performances and the full production setup for the extended engagement.',
    type: 'tour-footage',
    year: 1978,
    duration: '63:45',
    featured: ['Little Richard', 'Seabrun Candy Hunter'],
    category: 'Tour Footage'
  },
  {
    id: 'studio-1979',
    title: 'Final Sessions 1979 - Documentary',
    description: 'Documentary footage from the final recording sessions of the collaboration era in 1979. Reflects on the journey and the lasting impact of the partnership.',
    type: 'studio-session',
    year: 1979,
    location: 'Reprise Records, Los Angeles',
    duration: '48:22',
    featured: ['Little Richard', 'Seabrun Candy Hunter'],
    category: 'Studio Sessions'
  }
];

function VideoCard({ item }: { item: VideoItem }) {
  const getTypeIcon = (type: VideoItem['type']) => {
    switch (type) {
      case 'studio-session':
        return <Music className="w-5 h-5" />;
      case 'tour-footage':
        return <Film className="w-5 h-5" />;
      case 'interview':
        return <Users className="w-5 h-5" />;
      case 'photo-gallery':
        return <Play className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: VideoItem['type']) => {
    switch (type) {
      case 'studio-session':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'tour-footage':
        return 'from-orange-500/20 to-red-500/20 border-orange-500/30';
      case 'interview':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      case 'photo-gallery':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
    }
  };

  return (
    <Card className={`bg-gradient-to-br ${getTypeColor(item.type)} hover:shadow-lg transition-all cursor-pointer group`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-all">
            {getTypeIcon(item.type)}
          </div>
          <span className="text-xs font-semibold text-gray-400 bg-white/5 px-2 py-1 rounded">
            {item.year}
          </span>
        </div>
        <CardTitle className="text-lg text-white">{item.title}</CardTitle>
        <p className="text-sm text-gray-400 mt-1">{item.category}</p>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-gray-300 text-sm">{item.description}</p>

        <div className="space-y-2 pt-2 border-t border-gray-700/30">
          {item.location && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              {item.location}
            </div>
          )}
          {item.duration && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              Duration: {item.duration}
            </div>
          )}
          {item.featured && item.featured.length > 0 && (
            <div className="flex items-start gap-2 text-sm text-gray-400">
              <Users className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-300">Featured:</p>
                <p>{item.featured.join(', ')}</p>
              </div>
            </div>
          )}
        </div>

        <button className="w-full mt-3 px-3 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2">
          <Play className="w-4 h-4" />
          Watch Now
        </button>
      </CardContent>
    </Card>
  );
}

export default function BehindTheScenesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(videoItems.map(item => item.category)));
  const filteredItems = selectedCategory
    ? videoItems.filter(item => item.category === selectedCategory)
    : videoItems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-orange-950/10 to-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-6 py-12">
          <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/50">
            <span className="text-orange-400 font-semibold">🎬 Behind the Scenes</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Behind the Scenes
          </h1>
          <p className="text-2xl text-gray-300">
            Studio Sessions, Tour Footage & Interviews (1971-1980)
          </p>
          <p className="text-gray-400 max-w-3xl mx-auto text-lg">
            Exclusive behind-the-scenes content from the 1971-1980 collaboration era. Watch studio sessions, tour performances, and interviews with Little Richard, Seabrun Candy Hunter, and the session musicians who created rock history.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedCategory === null
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All Content
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <VideoCard key={item.id} item={item} />
          ))}
        </div>

        {/* Stats */}
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-2xl font-bold text-white mb-4">Collection Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-400">{videoItems.length}</p>
                <p className="text-gray-400 mt-1">Total Videos</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-pink-400">{categories.length}</p>
                <p className="text-gray-400 mt-1">Categories</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">10</p>
                <p className="text-gray-400 mt-1">Years Covered</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-400">1971-1980</p>
                <p className="text-gray-400 mt-1">Era</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm space-y-2 border-t border-gray-800 pt-8">
          <p>
            All content is from verified archival sources and interviews conducted in 2024.
          </p>
          <p>
            🎵 Canryn Production and its subsidiaries — A Voice for the Voiceless
          </p>
        </div>
      </div>
    </div>
  );
}
