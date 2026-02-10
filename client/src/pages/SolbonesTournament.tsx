"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/_core/hooks/useAuth';
import { Link } from 'wouter';
import { Trophy, Users, Crown, Bot, Sparkles, ArrowLeft, Swords, ChevronRight, Star, Zap, Shield, RotateCcw } from 'lucide-react';

// Tournament types
type BracketSize = 4 | 8 | 9;
type MatchStatus = 'pending' | 'playing' | 'completed';

interface TournamentPlayer {
  id: string;
  name: string;
  isAI: boolean;
  seed: number;
}

interface Match {
  id: string;
  round: number;
  position: number;
  player1: TournamentPlayer | null;
  player2: TournamentPlayer | null;
  winner: TournamentPlayer | null;
  score1: number;
  score2: number;
  status: MatchStatus;
}

interface Tournament {
  id: string;
  name: string;
  bracketSize: BracketSize;
  players: TournamentPlayer[];
  matches: Match[];
  currentRound: number;
  totalRounds: number;
  champion: TournamentPlayer | null;
}

const AI_NAMES = [
  'QUMUS Alpha', 'QUMUS Beta', 'QUMUS Gamma', 'QUMUS Delta',
  'QUMUS Epsilon', 'QUMUS Zeta', 'QUMUS Eta', 'QUMUS Theta', 'QUMUS Iota',
];

const BRACKET_CONFIGS: { size: BracketSize; label: string; rounds: number; icon: string }[] = [
  { size: 4, label: '4-Player', rounds: 2, icon: '🏆' },
  { size: 8, label: '8-Player', rounds: 3, icon: '⚔️' },
  { size: 9, label: 'Sacred 9', rounds: 4, icon: '✨' },
];

function generateBracket(players: TournamentPlayer[], bracketSize: BracketSize): Match[] {
  const matches: Match[] = [];
  let matchId = 0;

  if (bracketSize === 9) {
    // Sacred 9: First round has 1 match (2 players), giving 1 player a bye to make 8
    // Round 1: Play-in match (players 8 & 9)
    matches.push({
      id: `m${matchId++}`,
      round: 1,
      position: 0,
      player1: players[7] || null,
      player2: players[8] || null,
      winner: null,
      score1: 0,
      score2: 0,
      status: 'pending',
    });

    // Round 2: Quarterfinals (4 matches)
    for (let i = 0; i < 4; i++) {
      matches.push({
        id: `m${matchId++}`,
        round: 2,
        position: i,
        player1: i < 3 ? (players[i * 2] || null) : null, // Last slot filled by play-in winner
        player2: i < 3 ? (players[i * 2 + 1] || null) : (players[6] || null),
        winner: null,
        score1: 0,
        score2: 0,
        status: i < 3 ? 'pending' : 'pending',
      });
    }

    // Round 3: Semifinals (2 matches)
    for (let i = 0; i < 2; i++) {
      matches.push({
        id: `m${matchId++}`,
        round: 3,
        position: i,
        player1: null,
        player2: null,
        winner: null,
        score1: 0,
        score2: 0,
        status: 'pending',
      });
    }

    // Round 4: Final
    matches.push({
      id: `m${matchId++}`,
      round: 4,
      position: 0,
      player1: null,
      player2: null,
      winner: null,
      score1: 0,
      score2: 0,
      status: 'pending',
    });
  } else {
    // Standard bracket (4 or 8)
    const totalRounds = bracketSize === 4 ? 2 : 3;
    let roundMatches = bracketSize / 2;

    for (let round = 1; round <= totalRounds; round++) {
      for (let pos = 0; pos < roundMatches; pos++) {
        const isFirstRound = round === 1;
        matches.push({
          id: `m${matchId++}`,
          round,
          position: pos,
          player1: isFirstRound ? (players[pos * 2] || null) : null,
          player2: isFirstRound ? (players[pos * 2 + 1] || null) : null,
          winner: null,
          score1: 0,
          score2: 0,
          status: 'pending',
        });
      }
      roundMatches = Math.floor(roundMatches / 2);
    }
  }

  return matches;
}

function MatchCard({ match, onSimulate }: { match: Match; onSimulate: (matchId: string) => void }) {
  const roundLabels: Record<number, string> = { 1: 'Play-in', 2: 'Quarter', 3: 'Semi', 4: 'Final' };

  return (
    <div className={`relative rounded-lg border p-3 min-w-[180px] transition-all ${
      match.status === 'completed' ? 'bg-green-900/20 border-green-500/30' :
      match.status === 'playing' ? 'bg-yellow-900/20 border-yellow-500/30 animate-pulse' :
      'bg-purple-900/20 border-purple-500/20'
    }`}>
      {/* Player 1 */}
      <div className={`flex items-center justify-between py-1 px-2 rounded mb-1 ${
        match.winner?.id === match.player1?.id ? 'bg-green-900/30' : 'bg-purple-900/20'
      }`}>
        <div className="flex items-center gap-1.5">
          {match.player1?.isAI && <Bot className="h-3 w-3 text-cyan-400" />}
          <span className={`text-xs font-medium ${
            match.player1 ? 'text-white' : 'text-purple-500/40'
          }`}>
            {match.player1?.name || 'TBD'}
          </span>
        </div>
        <span className={`text-xs font-bold ${
          match.winner?.id === match.player1?.id ? 'text-green-400' : 'text-purple-400'
        }`}>
          {match.status !== 'pending' ? match.score1 : '-'}
        </span>
      </div>

      {/* VS divider */}
      <div className="text-center text-[10px] text-purple-500/40 my-0.5">vs</div>

      {/* Player 2 */}
      <div className={`flex items-center justify-between py-1 px-2 rounded ${
        match.winner?.id === match.player2?.id ? 'bg-green-900/30' : 'bg-purple-900/20'
      }`}>
        <div className="flex items-center gap-1.5">
          {match.player2?.isAI && <Bot className="h-3 w-3 text-cyan-400" />}
          <span className={`text-xs font-medium ${
            match.player2 ? 'text-white' : 'text-purple-500/40'
          }`}>
            {match.player2?.name || 'TBD'}
          </span>
        </div>
        <span className={`text-xs font-bold ${
          match.winner?.id === match.player2?.id ? 'text-green-400' : 'text-purple-400'
        }`}>
          {match.status !== 'pending' ? match.score2 : '-'}
        </span>
      </div>

      {/* Simulate button */}
      {match.status === 'pending' && match.player1 && match.player2 && (
        <Button
          size="sm"
          onClick={() => onSimulate(match.id)}
          className="w-full mt-2 bg-purple-600/50 hover:bg-purple-600 text-white text-[10px] h-6"
        >
          <Swords className="h-3 w-3 mr-1" /> Play Match
        </Button>
      )}

      {match.status === 'completed' && match.winner && (
        <div className="text-center mt-1">
          <Badge variant="outline" className="text-[10px] border-green-500/50 text-green-400">
            <Crown className="h-2.5 w-2.5 mr-0.5" /> {match.winner.name} wins!
          </Badge>
        </div>
      )}
    </div>
  );
}

export default function SolbonesTournament() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<'setup' | 'bracket'>('setup');
  const [bracketSize, setBracketSize] = useState<BracketSize>(8);
  const [tournamentName, setTournamentName] = useState('Solbones Championship');
  const [playerNames, setPlayerNames] = useState<{ name: string; isAI: boolean }[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);

  // Initialize player names when bracket size changes
  const initPlayers = (size: BracketSize) => {
    setBracketSize(size);
    const names = Array.from({ length: size }, (_, i) => ({
      name: i === 0 ? (user?.name || 'Player 1') : (i < 4 ? `Player ${i + 1}` : AI_NAMES[i - 4] || `QUMUS AI ${i - 3}`),
      isAI: i >= 4,
    }));
    setPlayerNames(names);
  };

  // Start tournament
  const startTournament = () => {
    const players: TournamentPlayer[] = playerNames.map((p, i) => ({
      id: `p${i}`,
      name: p.name || `Player ${i + 1}`,
      isAI: p.isAI,
      seed: i + 1,
    }));

    const matches = generateBracket(players, bracketSize);
    const totalRounds = bracketSize === 9 ? 4 : bracketSize === 8 ? 3 : 2;

    setTournament({
      id: `t-${Date.now()}`,
      name: tournamentName,
      bracketSize,
      players,
      matches,
      currentRound: bracketSize === 9 ? 1 : 1,
      totalRounds,
      champion: null,
    });
    setPhase('bracket');
  };

  // Simulate a match
  const simulateMatch = (matchId: string) => {
    if (!tournament) return;

    setTournament(prev => {
      if (!prev) return prev;
      const matches = [...prev.matches];
      const matchIdx = matches.findIndex(m => m.id === matchId);
      if (matchIdx === -1) return prev;

      const match = { ...matches[matchIdx] };
      if (!match.player1 || !match.player2) return prev;

      // Simulate scores (random game to win score)
      const s1 = Math.floor(Math.random() * 40) + 20;
      const s2 = Math.floor(Math.random() * 40) + 20;
      match.score1 = Math.max(s1, s2) === s1 ? s1 : s1;
      match.score2 = s1 === s2 ? s2 + 3 : s2; // No ties
      match.winner = match.score1 > match.score2 ? match.player1 : match.player2;
      match.status = 'completed';
      matches[matchIdx] = match;

      // Advance winner to next round
      const nextRound = match.round + 1;
      const nextPosition = Math.floor(match.position / 2);
      const nextMatch = matches.find(m => m.round === nextRound && m.position === nextPosition);

      if (nextMatch) {
        const nextIdx = matches.indexOf(nextMatch);
        const updatedNext = { ...matches[nextIdx] };
        if (match.position % 2 === 0) {
          updatedNext.player1 = match.winner;
        } else {
          updatedNext.player2 = match.winner;
        }
        matches[nextIdx] = updatedNext;
      }

      // Check if tournament is complete
      const finalMatch = matches.find(m => m.round === prev.totalRounds);
      const champion = finalMatch?.status === 'completed' ? finalMatch.winner : null;

      return {
        ...prev,
        matches,
        champion,
      };
    });
  };

  // Group matches by round
  const matchesByRound = useMemo(() => {
    if (!tournament) return {};
    const grouped: Record<number, Match[]> = {};
    tournament.matches.forEach(m => {
      if (!grouped[m.round]) grouped[m.round] = [];
      grouped[m.round].push(m);
    });
    return grouped;
  }, [tournament]);

  const roundNames = (round: number, totalRounds: number): string => {
    if (round === totalRounds) return 'Final';
    if (round === totalRounds - 1) return 'Semifinals';
    if (round === totalRounds - 2) return 'Quarterfinals';
    return `Round ${round}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0015] via-[#1a0a30] to-[#0a0020] text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/solbones">
            <Button variant="outline" size="sm" className="border-purple-500/50 text-purple-300 hover:bg-purple-900/50">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              Tournament Brackets
            </h1>
            <p className="text-purple-400/60 text-xs">Elimination brackets for Solbones 4+3+2</p>
          </div>
        </div>

        {/* ===== SETUP ===== */}
        {phase === 'setup' && (
          <div className="space-y-6">
            <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" /> Create Tournament
              </h2>

              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="text-purple-200 text-sm font-medium mb-1 block">Tournament Name</label>
                  <Input
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    placeholder="Enter tournament name"
                    className="bg-purple-900/30 border-purple-500/30 text-white"
                  />
                </div>

                <div>
                  <label className="text-purple-200 text-sm font-medium mb-3 block">Bracket Size</label>
                  <div className="grid grid-cols-3 gap-3">
                    {BRACKET_CONFIGS.map(config => (
                      <Card
                        key={config.size}
                        className={`p-4 cursor-pointer transition-all text-center ${
                          bracketSize === config.size
                            ? 'bg-purple-600/30 border-purple-400 ring-1 ring-purple-400'
                            : 'bg-purple-900/20 border-purple-500/20 hover:border-purple-500/40'
                        }`}
                        onClick={() => initPlayers(config.size)}
                      >
                        <div className="text-3xl mb-1">{config.icon}</div>
                        <h3 className="font-bold text-white text-sm">{config.label}</h3>
                        <p className="text-purple-400/60 text-xs">{config.rounds} rounds</p>
                      </Card>
                    ))}
                  </div>
                </div>

                {playerNames.length > 0 && (
                  <div>
                    <label className="text-purple-200 text-sm font-medium mb-2 block">
                      Players ({playerNames.length})
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {playerNames.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 bg-purple-900/20 rounded-lg p-2 border border-purple-500/20">
                          <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400 w-6 h-6 flex items-center justify-center p-0">
                            {i + 1}
                          </Badge>
                          <Input
                            value={p.name}
                            onChange={(e) => {
                              const updated = [...playerNames];
                              updated[i] = { ...updated[i], name: e.target.value };
                              setPlayerNames(updated);
                            }}
                            className="bg-transparent border-none text-white text-sm h-7 p-0"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updated = [...playerNames];
                              updated[i] = {
                                ...updated[i],
                                isAI: !updated[i].isAI,
                                name: !updated[i].isAI ? (AI_NAMES[i] || `QUMUS AI ${i + 1}`) : `Player ${i + 1}`,
                              };
                              setPlayerNames(updated);
                            }}
                            className={`h-7 px-2 ${p.isAI ? 'text-cyan-400' : 'text-purple-400/40'}`}
                          >
                            <Bot className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={startTournament}
                  disabled={playerNames.length < 2}
                  className="w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:from-yellow-600 hover:via-amber-600 hover:to-orange-600 text-black font-black text-lg py-5 gap-2 mt-4"
                  size="lg"
                >
                  <Trophy className="h-5 w-5" /> Start Tournament
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ===== BRACKET VIEW ===== */}
        {phase === 'bracket' && tournament && (
          <div className="space-y-4">
            {/* Tournament Header */}
            <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-400" /> {tournament.name}
                  </h2>
                  <p className="text-purple-400/60 text-xs">
                    {tournament.bracketSize} players &bull; {tournament.totalRounds} rounds &bull;
                    {tournament.champion ? ' Complete!' : ` Round ${tournament.currentRound}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPhase('setup');
                      setTournament(null);
                    }}
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-900/50 gap-1"
                  >
                    <RotateCcw className="h-3 w-3" /> New Tournament
                  </Button>
                </div>
              </div>
            </Card>

            {/* Champion Banner */}
            {tournament.champion && (
              <Card className="bg-gradient-to-r from-yellow-900/40 via-amber-900/40 to-yellow-900/40 border-yellow-500/50 p-6 text-center">
                <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-2" />
                <h2 className="text-2xl font-black text-yellow-400 mb-1">Champion!</h2>
                <p className="text-white text-lg font-bold">{tournament.champion.name}</p>
                <p className="text-yellow-400/60 text-sm">Winner of {tournament.name}</p>
              </Card>
            )}

            {/* Bracket Visualization */}
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-6 min-w-max">
                {Object.entries(matchesByRound)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([round, matches]) => (
                    <div key={round} className="flex flex-col gap-4">
                      <h3 className="text-sm font-bold text-purple-300 text-center mb-2">
                        {roundNames(Number(round), tournament.totalRounds)}
                      </h3>
                      <div className="flex flex-col gap-4 justify-center" style={{
                        paddingTop: `${(Number(round) - 1) * 40}px`,
                        gap: `${Math.pow(2, Number(round) - 1) * 16}px`,
                      }}>
                        {matches.map(match => (
                          <MatchCard key={match.id} match={match} onSimulate={simulateMatch} />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quick Actions */}
            <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-4">
              <h3 className="text-sm font-bold text-purple-200 mb-3">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Simulate all pending matches in current round
                    if (!tournament) return;
                    const pendingInRound = tournament.matches.filter(
                      m => m.status === 'pending' && m.player1 && m.player2
                    );
                    pendingInRound.forEach(m => simulateMatch(m.id));
                  }}
                  className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-900/30 gap-1"
                >
                  <Zap className="h-3 w-3" /> Simulate All Pending
                </Button>
                <Link href="/solbones">
                  <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-300 hover:bg-purple-900/50 gap-1">
                    <Swords className="h-3 w-3" /> Play Manual Match
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
