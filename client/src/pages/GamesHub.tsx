import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Gamepad2, Trophy, Star, Music, Brain, Grid3X3, Dice5, Zap, Swords, Radio, Mic, Crown, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

  // Tournament data for Avatar Arena
  const tournaments = [
    { id: 't1', name: 'Solbones Championship', game: 'Sacred Math Showdown', players: 16, status: 'pre-show' as const, time: 'Today 3:00 PM EST', bracket: 'Round 1 of 4', icon: <Crown size={16} className="text-amber-400" /> },
    { id: 't2', name: 'Rhythm Roots Battle', game: 'Beat Battle Royale', players: 8, status: 'upcoming' as const, time: 'Today 5:00 PM EST', bracket: 'Seeding', icon: <Music size={16} className="text-pink-400" /> },
    { id: 't3', name: 'Frequency Sprint', game: 'Speed Match Challenge', players: 24, status: 'upcoming' as const, time: 'Tomorrow 2:00 PM EST', bracket: 'Qualifier', icon: <Grid3X3 size={16} className="text-purple-400" /> },
  ];

  const bracketMatches = [
    { p1: 'Avatar_X', p2: 'SacredOne', time: '3:00 PM' },
    { p1: 'FreqMaster', p2: 'BoneRoller', time: '3:15 PM' },
    { p1: 'TyPlayer1', p2: 'DivineMath', time: '3:30 PM' },
    { p1: 'SolChamp', p2: 'RhythmKing', time: '3:45 PM' },
  ];

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

        {/* Avatar Arena — Tournament Hub */}
        <div className="mt-10 p-5 rounded-2xl bg-gradient-to-r from-amber-900/40 via-orange-900/30 to-amber-900/40 border border-amber-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Swords size={24} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-amber-300">Avatar Arena</h2>
              <p className="text-xs text-amber-400/60">Ty OS Tournament System — Compete, Stream, Win</p>
            </div>
            <Badge className="ml-auto bg-red-500/20 text-red-400 border-red-500/50 text-[10px] animate-pulse">
              <Radio size={12} className="mr-1" /> LIVE
            </Badge>
          </div>

          {/* Active Tournaments */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {tournaments.map(t => (
              <div key={t.id} className={`p-3 rounded-lg bg-black/30 border ${t.status === 'live' ? 'border-red-500/40' : 'border-amber-500/20'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {t.icon}
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                </div>
                <p className="text-[10px] text-gray-400">{t.game} • {t.players} players</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={`text-[9px] ${t.status === 'live' ? 'bg-red-500/20 text-red-400 animate-pulse' : t.status === 'pre-show' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {t.status.toUpperCase().replace('-', ' ')}
                  </Badge>
                  <span className="text-[9px] text-gray-500">{t.time}</span>
                </div>
                {t.bracket && (
                  <div className="mt-2 pt-2 border-t border-white/5">
                    <p className="text-[9px] text-amber-400/80 font-semibold">Bracket: {t.bracket}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tournament Bracket Preview */}
          <div className="mb-4 p-3 rounded-lg bg-black/40 border border-amber-500/10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-amber-300 flex items-center gap-2">
                <Trophy size={14} /> Solbones Championship Bracket
              </h3>
              <Badge className="bg-amber-500/20 text-amber-400 text-[8px]">ROUND 1 OF 4</Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {bracketMatches.map((match, i) => (
                <div key={i} className="p-2 rounded bg-black/30 border border-white/5">
                  <p className="text-[9px] text-gray-500 mb-1">Match {i + 1}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white">{match.p1}</span>
                    <span className="text-[8px] text-gray-600">vs</span>
                    <span className="text-[10px] text-white">{match.p2}</span>
                  </div>
                  <p className="text-[8px] text-amber-400/60 mt-1 text-center">{match.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pre/Post Show Flow */}
          <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-purple-900/20 to-amber-900/20 border border-purple-500/20">
            <h3 className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
              <Mic size={14} /> Tournament Show Flow
            </h3>
            <div className="flex items-center gap-1 overflow-x-auto">
              {['Pre-Show Podcast', 'Player Intros', 'Round 1', 'Round 2', 'Semi-Finals', 'Finals', 'Post-Show Interview'].map((phase, i) => (
                <div key={i} className="flex items-center">
                  <div className={`px-2 py-1 rounded text-[9px] whitespace-nowrap ${i === 0 ? 'bg-purple-500/30 text-purple-300 font-semibold' : 'bg-black/30 text-gray-400'}`}>
                    {phase}
                  </div>
                  {i < 6 && <Zap size={10} className="text-amber-500/40 mx-0.5 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/podcast/avatar-panel">
              <Button className="bg-amber-600 hover:bg-amber-700 text-sm">
                <Mic size={16} className="mr-1" /> Avatar Panel Podcast
              </Button>
            </Link>
            <Link href="/conference">
              <Button variant="outline" className="border-amber-500/50 text-amber-400 text-sm">
                <Users size={16} className="mr-1" /> Join Conference
              </Button>
            </Link>
            <Link href="/solbones">
              <Button variant="outline" className="border-purple-500/50 text-purple-400 text-sm">
                <Dice5 size={16} className="mr-1" /> Play Solbones
              </Button>
            </Link>
          </div>
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
