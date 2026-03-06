import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Gamepad2, Trophy, Star, Music, Brain, Grid3X3, Dice5, Zap } from 'lucide-react';

// Games Hub — Central portal for all Canryn Production / QUMUS games

interface GameInfo {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  bgGradient: string;
  storageKey: string;
  maxLevels: number;
}

const GAMES: GameInfo[] = [
  {
    id: 'word-frequency',
    title: 'Word Frequency',
    description: 'Unscramble sacred words tied to Solfeggio frequencies. 7 levels of consciousness.',
    icon: <Brain size={32} />,
    path: '/games/word-frequency',
    color: '#8B5CF6',
    bgGradient: 'from-violet-900 to-purple-800',
    storageKey: 'wf_highest_level',
    maxLevels: 7,
  },
  {
    id: 'frequency-match',
    title: 'Frequency Match',
    description: 'Memory card matching through chakra frequencies. Power-ups, combos, and timed rounds.',
    icon: <Grid3X3 size={32} />,
    path: '/games/frequency-match',
    color: '#EC4899',
    bgGradient: 'from-pink-900 to-rose-800',
    storageKey: 'fm_highest_level',
    maxLevels: 7,
  },
  {
    id: 'rhythm-roots',
    title: 'Rhythm Roots',
    description: 'Beat-matching through eras of Black music heritage. Spirituals to Afrobeats.',
    icon: <Music size={32} />,
    path: '/games/rhythm-roots',
    color: '#F59E0B',
    bgGradient: 'from-amber-900 to-orange-800',
    storageKey: 'rr_highest',
    maxLevels: 8,
  },
  {
    id: 'solbones',
    title: 'Solbones 4+3+2',
    description: 'Sacred math dice game with Solfeggio frequencies. The original QUMUS game.',
    icon: <Dice5 size={32} />,
    path: '/solbones',
    color: '#10B981',
    bgGradient: 'from-emerald-900 to-green-800',
    storageKey: 'solbones_level',
    maxLevels: 9,
  },
];

export default function GamesHub() {
  const [gameProgress, setGameProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const progress: Record<string, number> = {};
    GAMES.forEach(game => {
      const val = localStorage.getItem(game.storageKey);
      progress[game.id] = val ? parseInt(val) : 1;
    });
    setGameProgress(progress);
  }, []);

  const totalScore = (() => {
    const wf = parseInt(localStorage.getItem('wf_total_score') || '0');
    const fm = parseInt(localStorage.getItem('fm_total_score') || '0');
    const rr = parseInt(localStorage.getItem('rr_total') || '0');
    return wf + fm + rr;
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-white">
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300">
            <ArrowLeft size={20} /> Home
          </Link>
        </div>

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 mb-4">
            <Gamepad2 size={40} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-3">
            Games Hub
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            Play, learn, and level up through Solfeggio frequencies, Black music heritage, and sacred mathematics
          </p>

          {/* Global Stats */}
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <Trophy size={24} className="text-yellow-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-yellow-400">{totalScore.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Points</p>
            </div>
            <div className="text-center">
              <Star size={24} className="text-green-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-400">{GAMES.length}</p>
              <p className="text-xs text-gray-500">Games</p>
            </div>
            <div className="text-center">
              <Zap size={24} className="text-purple-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-purple-400">
                {Object.values(gameProgress).reduce((a, b) => a + b, 0)}
              </p>
              <p className="text-xs text-gray-500">Levels Reached</p>
            </div>
          </div>
        </div>

        {/* Game Cards */}
        <div className="grid gap-4 sm:grid-cols-2" role="list" aria-label="Available games">
          {GAMES.map(game => {
            const level = gameProgress[game.id] || 1;
            const progressPct = Math.round((level / game.maxLevels) * 100);
            return (
              <Link
                key={game.id}
                href={game.path}
                className={`block p-5 rounded-2xl bg-gradient-to-br ${game.bgGradient} border border-white/10 hover:border-white/30 hover:scale-[1.02] transition-all cursor-pointer`}
                role="listitem"
                aria-label={`${game.title}: ${game.description}. Level ${level} of ${game.maxLevels}`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-white/10" style={{ color: game.color }}>
                    {game.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold mb-1">{game.title}</h3>
                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">{game.description}</p>

                    {/* Level progress */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-black/30 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${progressPct}%`, backgroundColor: game.color }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        Lv {level}/{game.maxLevels}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Powered by */}
        <div className="mt-10 text-center">
          <p className="text-xs text-gray-600">
            Powered by QUMUS Autonomous Orchestration • Canryn Production LLC
          </p>
          <p className="text-xs text-gray-700 mt-1">
            All games feature ADA accessibility, keyboard navigation, and screen reader support
          </p>
        </div>
      </div>
    </div>
  );
}
