import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MediaPlayer } from '@/components/MediaPlayer';
import { SearchBar } from '@/components/SearchBar';
import { FilterBar } from '@/components/FilterBar';
import { Radio } from 'lucide-react';

// Sample radio station data
const SAMPLE_STATIONS = [
  {
    id: '1',
    name: 'Rockin Classics',
    description: 'The best of 70s and 80s rock',
    genre: 'Rock',
    year: 1975,
    streamUrl: 'https://example.com/stream/rockin-classics',
    listeners: 1250,
    isLive: true,
  },
  {
    id: '2',
    name: 'Soul & Funk Station',
    description: 'Smooth soul and funk grooves',
    genre: 'Soul',
    year: 1970,
    streamUrl: 'https://example.com/stream/soul-funk',
    listeners: 890,
    isLive: true,
  },
  {
    id: '3',
    name: 'Jazz Heritage',
    description: 'Classic jazz and improvisation',
    genre: 'Jazz',
    year: 1960,
    streamUrl: 'https://example.com/stream/jazz-heritage',
    listeners: 650,
    isLive: false,
  },
  {
    id: '4',
    name: 'Blues Legends',
    description: 'Traditional and modern blues',
    genre: 'Blues',
    year: 1950,
    streamUrl: 'https://example.com/stream/blues-legends',
    listeners: 520,
    isLive: true,
  },
  {
    id: '5',
    name: 'Boogie Nights',
    description: 'High-energy boogie and rhythm',
    genre: 'Boogie',
    year: 1972,
    streamUrl: 'https://example.com/stream/boogie-nights',
    listeners: 1100,
    isLive: true,
  },
];

const SAMPLE_TRACKS: Record<string, any> = {
  '1': {
    id: 'track_1',
    title: 'Rockin Rockin Boogie',
    artist: 'Seabrun Candy Hunter & Little Richard',
    album: 'Legacy Restored',
    duration: 180,
    streamUrl: 'https://example.com/tracks/rockin-rockin-boogie.mp3',
  },
  '2': {
    id: 'track_2',
    title: 'Soul Serenade',
    artist: 'Seabrun Candy Hunter',
    album: 'Soul Collection',
    duration: 240,
    streamUrl: 'https://example.com/tracks/soul-serenade.mp3',
  },
  '3': {
    id: 'track_3',
    title: 'Jazz Improvisation #3',
    artist: 'Seabrun Candy Hunter Quartet',
    album: 'Live at the Blue Note',
    duration: 420,
    streamUrl: 'https://example.com/tracks/jazz-improv-3.mp3',
  },
  '4': {
    id: 'track_4',
    title: 'Delta Blues',
    artist: 'Seabrun Candy Hunter',
    album: 'Blues Roots',
    duration: 300,
    streamUrl: 'https://example.com/tracks/delta-blues.mp3',
  },
  '5': {
    id: 'track_5',
    title: 'Boogie Woogie Piano',
    artist: 'Seabrun Candy Hunter',
    album: 'Piano Sessions',
    duration: 200,
    streamUrl: 'https://example.com/tracks/boogie-woogie.mp3',
  },
};

export default function RadioStationPage() {
  const [stations] = useState(SAMPLE_STATIONS);
  const [currentStation, setCurrentStation] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  // Update current track when station changes
  useEffect(() => {
    if (currentStation) {
      setCurrentTrack(SAMPLE_TRACKS[currentStation] || null);
    }
  }, [currentStation]);

  // Filter stations based on search and filters
  const filteredStations = stations.filter((station) => {
    const matchesSearch =
      !searchQuery ||
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = !selectedGenre || station.genre === selectedGenre;
    const matchesYear =
      !selectedYear || station.year?.toString() === selectedYear;
    return matchesSearch && matchesGenre && matchesYear;
  });

  // Get unique genres and years from stations
  const genres = Array.from(
    new Set(stations.map((s) => s.genre).filter(Boolean))
  );
  const years = Array.from(
    new Set(stations.map((s) => s.year).filter(Boolean))
  )
    .sort((a, b) => (b as number) - (a as number))
    .map((y) => y?.toString());

  const handlePlay = (stationId: string) => {
    setCurrentStation(stationId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Radio className="w-8 h-8 text-amber-500" />
            <h1 className="text-4xl font-bold text-white">
              Rockin Radio Station
            </h1>
          </div>
          <p className="text-slate-300">Stream your favorite music and shows</p>
        </div>

        {/* Now Playing */}
        {currentStation && currentTrack && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Now Playing</h2>
            <MediaPlayer
              src={currentTrack.streamUrl || ''}
              title={currentTrack.title}
              artist={currentTrack.artist}
              type="audio"
            />
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search stations by name or description..."
          />
          <FilterBar
            filters={[
              {
                label: 'Genre',
                options: [
                  { label: 'All Genres', value: '' },
                  ...genres.map((g) => ({ label: g || 'Unknown', value: g || '' })),
                ],
                onSelect: (value) => setSelectedGenre(value || null),
                selected: selectedGenre,
              },
              {
                label: 'Year',
                options: [
                  { label: 'All Years', value: '' },
                  ...years.map((y) => ({ label: y || 'Unknown', value: y || '' })),
                ],
                onSelect: (value) => setSelectedYear(value || null),
                selected: selectedYear,
              },
            ]}
          />
        </div>

        {/* Stations Grid */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">
            Available Stations ({filteredStations.length})
          </h3>
          {filteredStations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStations.map((station) => (
                <Card
                  key={station.id}
                  className={`cursor-pointer transition-all border-2 p-4 ${
                    currentStation === station.id
                      ? 'bg-amber-500 border-amber-600 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-amber-500'
                  }`}
                  onClick={() => handlePlay(station.id)}
                >
                  <h4 className="font-bold text-lg mb-2">{station.name}</h4>
                  <p className="text-sm opacity-80 mb-3">{station.description}</p>
                  {station.genre && (
                    <p className="text-xs opacity-60 mb-3">
                      Genre: {station.genre}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4" />
                      <span className="text-sm">
                        {currentStation === station.id ? 'Now Playing' : 'Tune In'}
                      </span>
                    </div>
                    {station.isLive && (
                      <span className="text-xs bg-red-500 px-2 py-1 rounded">
                        LIVE
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-800 border-slate-700 p-12 text-center">
              <p className="text-slate-400">
                No stations found matching your filters.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
