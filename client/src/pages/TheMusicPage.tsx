import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Music, Award, Users } from 'lucide-react';

const SAMPLE_ALBUMS = [
  {
    id: 'album_1',
    title: 'Rockin Rockin Boogie',
    releaseYear: 1972,
  },
  {
    id: 'album_2',
    title: 'Soul Collection',
    releaseYear: 1974,
  },
  {
    id: 'album_3',
    title: 'Jazz Sessions',
    releaseYear: 1975,
  },
  {
    id: 'album_4',
    title: 'Blues Roots',
    releaseYear: 1976,
  },
];

const SAMPLE_SONGS = [
  {
    id: 'song_1',
    title: 'Rockin Rockin Boogie',
    artist: 'Seabrun Candy Hunter & Little Richard',
    duration: '3:00',
    releaseYear: 1972,
  },
  {
    id: 'song_2',
    title: 'Soul Serenade',
    artist: 'Seabrun Candy Hunter',
    duration: '4:00',
    releaseYear: 1974,
  },
  {
    id: 'song_3',
    title: 'Midnight Blues',
    artist: 'Seabrun Candy Hunter',
    duration: '5:00',
    releaseYear: 1976,
  },
  {
    id: 'song_4',
    title: 'Jazz Improvisation #1',
    artist: 'Seabrun Candy Hunter Quartet',
    duration: '7:00',
    releaseYear: 1975,
  },
  {
    id: 'song_5',
    title: 'Boogie Woogie Piano',
    artist: 'Seabrun Candy Hunter',
    duration: '3:20',
    releaseYear: 1972,
  },
  {
    id: 'song_6',
    title: 'Love Song',
    artist: 'Seabrun Candy Hunter',
    duration: '4:40',
    releaseYear: 1974,
  },
];

const SAMPLE_CREDITS = [
  {
    role: 'Lead Vocals',
    name: 'Seabrun Candy Hunter',
    description: 'Primary vocalist and composer',
  },
  {
    role: 'Piano & Keys',
    name: 'Seabrun Candy Hunter',
    description: 'Keyboard arrangements and production',
  },
  {
    role: 'Guest Artist',
    name: 'Little Richard',
    description: 'Featured on Rockin Rockin Boogie',
  },
  {
    role: 'Producer',
    name: 'Canryn Production',
    description: 'Album production and engineering',
  },
];

const SAMPLE_AWARDS = [
  {
    title: 'Best Soul Album',
    organization: 'Music Heritage Awards',
    year: '1975',
    description: 'Recognition for Soul Collection',
  },
  {
    title: 'Legacy Achievement',
    organization: 'Rockin Music Foundation',
    year: '2024',
    description: 'Lifetime contribution to music',
  },
];

export default function TheMusicPage() {
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const filteredSongs = SAMPLE_SONGS.filter((song) => {
    const matchesSearch =
      !searchQuery ||
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = !selectedYear || song.releaseYear.toString() === selectedYear;
    return matchesSearch && matchesYear;
  });

  const years = Array.from(
    new Set(SAMPLE_SONGS.map((s) => s.releaseYear))
  )
    .sort((a, b) => b - a)
    .map((y) => y.toString());

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Music className="w-8 h-8 text-amber-500" />
            <h1 className="text-5xl font-bold text-white">The Music</h1>
          </div>
          <p className="text-xl text-slate-300">
            Complete discography, songs, and credits
          </p>
        </div>

        {/* Albums Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Albums & Releases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SAMPLE_ALBUMS.map((album) => (
              <Card
                key={album.id}
                className={`cursor-pointer transition-all border-2 overflow-hidden group ${
                  selectedAlbum === album.id
                    ? 'bg-amber-500 border-amber-600'
                    : 'bg-slate-800 border-slate-700 hover:border-amber-500'
                }`}
                onClick={() => setSelectedAlbum(album.id)}
              >
                <div className="aspect-square bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center overflow-hidden relative">
                  <Music className="w-16 h-16 text-white/50" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-white line-clamp-2">
                    {album.title}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {album.releaseYear}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <input
            type="text"
            placeholder="Search songs by title or artist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
          <div>
            <label className="text-sm text-slate-300 block mb-2">Year</label>
            <select
              value={selectedYear || ''}
              onChange={(e) => setSelectedYear(e.target.value || null)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Songs Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">
            Songs ({filteredSongs.length})
          </h2>
          {filteredSongs.length > 0 ? (
            <div className="space-y-2">
              {filteredSongs.map((song, index) => (
                <Card
                  key={song.id}
                  className="bg-slate-800 border-slate-700 p-4 hover:bg-slate-700/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-slate-500 font-mono w-8 text-right">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors">
                        {song.title}
                      </h3>
                      <p className="text-sm text-slate-400">{song.artist}</p>
                    </div>
                    <div className="text-slate-400 text-sm">{song.duration}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-800 border-slate-700 p-8 text-center">
              <p className="text-slate-400">No songs found matching your filters.</p>
            </Card>
          )}
        </div>

        {/* Credits Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-8 h-8" />
            Credits & Contributors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SAMPLE_CREDITS.map((credit, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700 p-6">
                <h3 className="font-bold text-white mb-2">{credit.role}</h3>
                <p className="text-slate-300">{credit.name}</p>
                {credit.description && (
                  <p className="text-sm text-slate-400 mt-2">
                    {credit.description}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Awards Section */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
            <Award className="w-8 h-8" />
            Awards & Recognition
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SAMPLE_AWARDS.map((award, index) => (
              <Card
                key={index}
                className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 border-amber-700/50 p-6"
              >
                <h3 className="font-bold text-amber-400 mb-2">{award.title}</h3>
                <p className="text-slate-300">{award.organization}</p>
                <p className="text-sm text-slate-400 mt-2">{award.year}</p>
                {award.description && (
                  <p className="text-sm text-slate-400 mt-3">
                    {award.description}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
