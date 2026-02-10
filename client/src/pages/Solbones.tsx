import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Link } from 'wouter';
import { Download, Volume2, RotateCcw, Trophy, BookOpen, Users, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

// ============================================================
// SOLBONES DICE GAME
// Sacred Math, Frequency, and Joy for the Solbone Nation
// Based on the official Solbones Dice Rulebook
// A Canryn Production
// ============================================================

// Solfeggio frequency mapping for each die face
const FREQUENCY_MAP: Record<number, { frequency: number; note: string; color: string; bgColor: string; description: string }> = {
  1: { frequency: 174, note: 'UT', color: 'text-red-400', bgColor: 'from-red-600 to-red-800', description: 'Foundation and security, grounding energy' },
  2: { frequency: 285, note: 'RE', color: 'text-orange-400', bgColor: 'from-orange-600 to-orange-800', description: 'Tissue repair and cellular healing' },
  3: { frequency: 369, note: 'MI', color: 'text-yellow-400', bgColor: 'from-yellow-600 to-yellow-800', description: 'Emotional healing and transformation' },
  4: { frequency: 432, note: 'FA', color: 'text-green-400', bgColor: 'from-green-600 to-green-800', description: 'Heart chakra, universal harmony and healing' },
  5: { frequency: 528, note: 'SOL', color: 'text-blue-400', bgColor: 'from-blue-600 to-blue-800', description: 'DNA repair, love and miracles' },
  6: { frequency: 639, note: 'LA', color: 'text-indigo-400', bgColor: 'from-indigo-600 to-indigo-800', description: 'Relationships and communication' },
};

// Frequency dice colors per rulebook: red (2), purple (3), blue (4)
const FREQ_DICE: Record<number, string> = { 2: 'red', 3: 'purple', 4: 'blue' };

// Die face SVG component
function DieFace({ value, isRolling, size = 80, freqHighlight = false }: { value: number; isRolling: boolean; size?: number; freqHighlight?: boolean }) {
  const dotPositions: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[30, 30], [70, 70]],
    3: [[30, 30], [50, 50], [70, 70]],
    4: [[30, 30], [70, 30], [30, 70], [70, 70]],
    5: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]],
    6: [[30, 25], [70, 25], [30, 50], [70, 50], [30, 75], [70, 75]],
  };

  const isFreqDie = FREQ_DICE[value] !== undefined;
  const freqColor = isFreqDie ? (value === 2 ? '#ef4444' : value === 3 ? '#a855f7' : '#3b82f6') : undefined;
  const borderColor = isFreqDie && freqHighlight ? freqColor : '#a78bfa';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={isRolling ? 'animate-bounce' : 'transition-all duration-300'}>
      <rect x="5" y="5" width="90" height="90" rx="15" ry="15"
        fill={isFreqDie && freqHighlight ? `${freqColor}22` : '#1a1a2e'}
        stroke={borderColor} strokeWidth="3" />
      {(dotPositions[value] || []).map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="8"
          fill={isFreqDie && freqHighlight ? freqColor : '#fbbf24'} />
      ))}
    </svg>
  );
}

// Score a round based on Solbones rules
function scoreRound(dice: number[]): { points: number; tallies: number; label: string } {
  const sorted = [...dice].sort();
  const sum = dice.reduce((a, b) => a + b, 0);

  // Zan Zone: 4+3+2 in frequency colors
  if (sorted[0] === 2 && sorted[1] === 3 && sorted[2] === 4) {
    return { points: 18, tallies: 2, label: 'Zan Zone! (4+3+2 in freq colors)' };
  }

  // In the Ether: 4+3+2
  if (sorted[0] === 2 && sorted[1] === 3 && sorted[2] === 4) {
    return { points: 9, tallies: 1, label: 'In the Ether! (4+3+2)' };
  }

  // Tribing Up: 3 of a kind
  if (dice[0] === dice[1] && dice[1] === dice[2]) {
    return { points: dice[0], tallies: 1, label: `Tribing Up! (Three ${dice[0]}s)` };
  }

  // Check for pairs
  if (dice[0] === dice[1] || dice[1] === dice[2] || dice[0] === dice[2]) {
    const pairVal = dice[0] === dice[1] ? dice[0] : dice[1] === dice[2] ? dice[1] : dice[0];
    const isFreqPair = FREQ_DICE[pairVal] !== undefined;
    const pts = isFreqPair ? pairVal * 2 : pairVal;
    return {
      points: pts,
      tallies: 0,
      label: isFreqPair ? `Vibing Up! (Freq pair of ${pairVal}s = double)` : `Pair of ${pairVal}s`,
    };
  }

  // Straight sequences
  if ((sorted[0] === 1 && sorted[1] === 2 && sorted[2] === 3) ||
      (sorted[0] === 2 && sorted[1] === 3 && sorted[2] === 4) ||
      (sorted[0] === 3 && sorted[1] === 4 && sorted[2] === 5) ||
      (sorted[0] === 4 && sorted[1] === 5 && sorted[2] === 6)) {
    return { points: sum, tallies: 0, label: `Sequence! (${sorted.join('-')})` };
  }

  // Default: highest die
  const highest = Math.max(...dice);
  return { points: highest, tallies: 0, label: `Highest die: ${highest}` };
}

// Advanced "In the 9" check
function checkInTheNine(dice: number[]): boolean {
  return dice.reduce((a, b) => a + b, 0) === 9;
}

type GameMode = 'standard' | 'advanced' | 'spiral';
type GameState = 'idle' | 'rolling' | 'scored' | 'finished';

interface RoundResult {
  dice: number[];
  score: { points: number; tallies: number; label: string };
  inTheNine: boolean;
  rollNumber: number;
}

// PDF download links
const PDFS = {
  rulebook: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/arqpRyTqdhwFWjWH.pdf',
  tournament: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/oWoPZVaqYMPCXfSf.pdf',
  youth: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/SfHSPxXyvDYnySjZ.pdf',
};

export default function Solbones() {
  const { user } = useAuth();
  const [gameMode, setGameMode] = useState<GameMode>('standard');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [dice, setDice] = useState<number[]>([1, 1, 1]);
  const [rollsThisRound, setRollsThisRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [tallies, setTallies] = useState(0);
  const [roundHistory, setRoundHistory] = useState<RoundResult[]>([]);
  const [currentRoundScore, setCurrentRoundScore] = useState<{ points: number; tallies: number; label: string } | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showYouthChallenges, setShowYouthChallenges] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const rollAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // tRPC mutations
  const rollDiceMutation = trpc.solbones.rollDice.useMutation();
  const leaderboardQuery = trpc.solbones.getLeaderboard.useQuery({ limit: 10 });

  // Win conditions
  const winScore = gameMode === 'standard' ? 63 : gameMode === 'spiral' ? 36 : 63;
  const maxRollsPerRound = tallies > 0 ? 4 : 3;

  useEffect(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
    } catch { /* audio not available */ }
  }, []);

  const playFrequency = useCallback((frequency: number) => {
    if (!audioContext) return;
    try {
      if (audioContext.state === 'suspended') audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1.5);
    } catch { /* ignore audio errors */ }
  }, [audioContext]);

  const rollDice = useCallback(() => {
    if (rollsThisRound >= maxRollsPerRound) return;
    if (gameState === 'finished') return;

    setIsRolling(true);
    setGameState('rolling');
    setCurrentRoundScore(null);

    let count = 0;
    if (rollAnimRef.current) clearInterval(rollAnimRef.current);

    rollAnimRef.current = setInterval(() => {
      setDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
      count++;
      if (count >= 12) {
        if (rollAnimRef.current) clearInterval(rollAnimRef.current);

        const finalDice = [
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
        ];
        setDice(finalDice);
        setIsRolling(false);

        const result = scoreRound(finalDice);
        const inNine = gameMode === 'advanced' && checkInTheNine(finalDice);

        if (inNine) {
          result.points += 9;
          result.label += ' + In the 9! (+9 bonus)';
        }

        setCurrentRoundScore(result);
        setRollsThisRound(prev => prev + 1);
        setGameState('scored');

        // Play the frequency of the highest die
        const highDie = Math.max(...finalDice);
        const freq = FREQUENCY_MAP[highDie];
        if (freq) playFrequency(freq.frequency);

        // Record to backend
        if (user) {
          rollDiceMutation.mutate({ notes: result.label });
        }
      }
    }, 80);
  }, [rollsThisRound, maxRollsPerRound, gameState, gameMode, playFrequency, user, rollDiceMutation]);

  const keepScore = () => {
    if (!currentRoundScore) return;

    const newTotal = totalScore + currentRoundScore.points;
    const newTallies = tallies + currentRoundScore.tallies;

    setTotalScore(newTotal);
    setTallies(newTallies);
    setRoundHistory(prev => [...prev, {
      dice: [...dice],
      score: currentRoundScore,
      inTheNine: gameMode === 'advanced' && checkInTheNine(dice),
      rollNumber: roundHistory.length + 1,
    }]);
    setRollsThisRound(0);
    setCurrentRoundScore(null);
    setGameState('idle');

    if (newTotal >= winScore) {
      setGameState('finished');
    }
  };

  const useTally = () => {
    if (tallies <= 0) return;
    setTallies(prev => prev - 1);
    // Extra roll allowed
  };

  const resetGame = () => {
    setDice([1, 1, 1]);
    setTotalScore(0);
    setTallies(0);
    setRollsThisRound(0);
    setRoundHistory([]);
    setCurrentRoundScore(null);
    setGameState('idle');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0221] via-[#150530] to-[#0a0118]">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 py-8 text-center">
          <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm mb-4 inline-block">&larr; Back to Home</Link>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
            Solbones
          </h1>
          <p className="text-purple-200 text-lg md:text-xl max-w-2xl mx-auto mb-2">
            Sacred Math, Frequency, and Joy for the Solbone Nation
          </p>
          <p className="text-purple-400/70 text-sm italic">
            "Let the scrolls roll. May we laugh, may we learn, may we live in the code."
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-12">
        {/* Game Mode Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {([
            { mode: 'standard' as GameMode, label: 'Standard (First to 63)', icon: '🎲' },
            { mode: 'advanced' as GameMode, label: 'In the 9 (Advanced)', icon: '⚡' },
            { mode: 'spiral' as GameMode, label: 'Spiral Up/Down (First to 36)', icon: '🌀' },
          ]).map(({ mode, label, icon }) => (
            <Button
              key={mode}
              variant={gameMode === mode ? 'default' : 'outline'}
              onClick={() => { setGameMode(mode); resetGame(); }}
              className={`gap-2 ${gameMode === mode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'border-purple-500/50 text-purple-300 hover:bg-purple-900/50'}`}
            >
              <span>{icon}</span> {label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dice Area */}
            <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                  Roll the Bones
                </h2>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-purple-300">Roll {rollsThisRound}/{maxRollsPerRound}</span>
                  <span className="text-yellow-400 font-bold">Score: {totalScore}/{winScore}</span>
                  {tallies > 0 && <span className="text-green-400">Tallies: {tallies}</span>}
                </div>
              </div>

              {/* Dice Display */}
              <div className="flex justify-center items-center gap-4 md:gap-8 mb-8 py-4">
                {dice.map((d, i) => (
                  <div key={i} className="relative">
                    <DieFace value={d} isRolling={isRolling} size={90} freqHighlight={!isRolling} />
                    {!isRolling && FREQ_DICE[d] && (
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-purple-300 whitespace-nowrap">
                        {FREQUENCY_MAP[d]?.note} {FREQUENCY_MAP[d]?.frequency}Hz
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Score Display */}
              {currentRoundScore && !isRolling && (
                <div className={`text-center mb-6 p-4 rounded-lg border ${
                  currentRoundScore.tallies > 0
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-purple-500/10 border-purple-500/30'
                }`}>
                  <div className="text-2xl font-bold text-white mb-1">+{currentRoundScore.points} points</div>
                  <div className="text-purple-300">{currentRoundScore.label}</div>
                  {currentRoundScore.tallies > 0 && (
                    <div className="text-yellow-400 text-sm mt-1">+{currentRoundScore.tallies} tally earned!</div>
                  )}
                </div>
              )}

              {/* Game Over */}
              {gameState === 'finished' && (
                <div className="text-center mb-6 p-6 rounded-lg bg-gradient-to-r from-yellow-500/20 via-purple-500/20 to-blue-500/20 border border-yellow-500/30">
                  <div className="text-4xl mb-2">🏆</div>
                  <div className="text-3xl font-bold text-yellow-400 mb-2">Victory!</div>
                  <div className="text-purple-200">
                    {gameMode === 'spiral' ? 'You have ascended!' : `You reached ${totalScore} points in ${roundHistory.length} rounds!`}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  onClick={rollDice}
                  disabled={isRolling || gameState === 'finished' || (rollsThisRound >= maxRollsPerRound && !currentRoundScore)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 text-lg gap-2"
                  size="lg"
                >
                  {isRolling ? '🎲 Rolling...' : gameState === 'idle' ? '🎲 Roll Dice' : '🎲 Re-Roll'}
                </Button>

                {currentRoundScore && !isRolling && gameState !== 'finished' && (
                  <Button
                    onClick={keepScore}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6"
                    size="lg"
                  >
                    Keep Score
                  </Button>
                )}

                {tallies > 0 && rollsThisRound >= 3 && gameState !== 'finished' && (
                  <Button
                    onClick={useTally}
                    variant="outline"
                    className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                    size="lg"
                  >
                    Use Tally (+1 Roll)
                  </Button>
                )}

                <Button
                  onClick={resetGame}
                  variant="outline"
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-900/50 gap-2"
                  size="lg"
                >
                  <RotateCcw className="h-4 w-4" /> New Game
                </Button>
              </div>
            </Card>

            {/* Solfeggio Frequency Reference */}
            <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-blue-400" />
                Solfeggio Frequencies
              </h2>
              <p className="text-purple-300/80 text-sm mb-4">
                Each die face corresponds to a sacred Solfeggio frequency. Tap to hear the tone.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(FREQUENCY_MAP).map(([key, data]) => (
                  <button
                    key={key}
                    onClick={() => playFrequency(data.frequency)}
                    className={`bg-gradient-to-br ${data.bgColor} p-4 rounded-lg text-left hover:scale-105 transition-transform cursor-pointer border border-white/10`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-bold">Die {key}</span>
                      <Volume2 className="h-4 w-4 text-white/60" />
                    </div>
                    <div className="text-white/90 text-lg font-bold">{data.note}</div>
                    <div className="text-white/70 text-sm">{data.frequency} Hz</div>
                    <div className="text-white/50 text-xs mt-1">{data.description}</div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Score Sheet */}
            <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Score Sheet
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {roundHistory.length === 0 ? (
                  <p className="text-purple-400/60 text-sm text-center py-4">Roll the dice to begin...</p>
                ) : (
                  roundHistory.map((r, i) => (
                    <div key={i} className="flex items-center justify-between bg-purple-900/30 rounded px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400 font-mono">R{r.rollNumber}</span>
                        <span className="text-white">[{r.dice.join(', ')}]</span>
                      </div>
                      <span className={`font-bold ${r.inTheNine ? 'text-yellow-400' : 'text-green-400'}`}>
                        +{r.score.points}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-purple-500/20 flex justify-between">
                <span className="text-purple-300 font-bold">Total</span>
                <span className="text-yellow-400 font-bold text-xl">{totalScore}</span>
              </div>
            </Card>

            {/* Leaderboard */}
            <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" />
                Leaderboard
              </h2>
              {leaderboardQuery.data && leaderboardQuery.data.length > 0 ? (
                <div className="space-y-2">
                  {leaderboardQuery.data.map((entry: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-purple-900/30 rounded px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-purple-400'}`}>
                          #{i + 1}
                        </span>
                        <span className="text-white truncate max-w-[100px]">Player</span>
                      </div>
                      <span className="text-green-400 font-bold">{entry.score}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-purple-400/60 text-sm text-center py-4">No scores yet. Be the first!</p>
              )}
            </Card>

            {/* Downloads */}
            <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Download className="h-5 w-5 text-green-400" />
                Downloads
              </h2>
              <div className="space-y-3">
                <a href={PDFS.rulebook} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-purple-900/30 hover:bg-purple-900/50 rounded-lg p-3 transition-colors no-underline">
                  <BookOpen className="h-5 w-5 text-purple-400 flex-shrink-0" />
                  <div>
                    <div className="text-white text-sm font-medium">Official Rulebook</div>
                    <div className="text-purple-400/60 text-xs">Solbones Dice Rulebook & Cultural Guide</div>
                  </div>
                </a>
                <a href={PDFS.tournament} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-purple-900/30 hover:bg-purple-900/50 rounded-lg p-3 transition-colors no-underline">
                  <Trophy className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                  <div>
                    <div className="text-white text-sm font-medium">Tournament & Score Sheets</div>
                    <div className="text-purple-400/60 text-xs">Printable brackets and scoring</div>
                  </div>
                </a>
                <a href={PDFS.youth} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-purple-900/30 hover:bg-purple-900/50 rounded-lg p-3 transition-colors no-underline">
                  <Sparkles className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <div>
                    <div className="text-white text-sm font-medium">Youth Scroll Challenges</div>
                    <div className="text-purple-400/60 text-xs">Zakar Games Legacy Activation Series</div>
                  </div>
                </a>
              </div>
            </Card>
          </div>
        </div>

        {/* Rules Section (Collapsible) */}
        <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-6 mt-6">
          <button
            onClick={() => setShowRules(!showRules)}
            className="w-full flex items-center justify-between text-left"
          >
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-400" />
              How to Play Solbones
            </h2>
            {showRules ? <ChevronUp className="h-5 w-5 text-purple-400" /> : <ChevronDown className="h-5 w-5 text-purple-400" />}
          </button>

          {showRules && (
            <div className="mt-6 space-y-6 text-purple-200">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Game Setup</h3>
                <p>You need 3 dice. Use white dice with yellow dots, or frequency dice: <span className="text-red-400 font-bold">red (2)</span>, <span className="text-purple-400 font-bold">purple (3)</span>, <span className="text-blue-400 font-bold">blue (4)</span>.</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">Standard Game (First to 63)</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2"><span className="text-yellow-400">&#9679;</span> Roll all 3 dice each round. Up to 3 rolls per round (4 if using a tally).</li>
                  <li className="flex gap-2"><span className="text-yellow-400">&#9679;</span> Score using pairs, frequency matches, or unique sequences.</li>
                  <li className="flex gap-2"><span className="text-yellow-400">&#9679;</span> <strong className="text-white">Tribing Up:</strong> 3 of a kind = 1 tally + score equals face value.</li>
                  <li className="flex gap-2"><span className="text-yellow-400">&#9679;</span> <strong className="text-white">Vibing Up:</strong> Score die is a frequency die (2, 3, or 4) = double score.</li>
                  <li className="flex gap-2"><span className="text-yellow-400">&#9679;</span> <strong className="text-white">In the Ether (4+3+2):</strong> 9 points + 1 tally.</li>
                  <li className="flex gap-2"><span className="text-yellow-400">&#9679;</span> <strong className="text-white">Zan Zone (4+3+2 in freq. colors):</strong> 18 points + 2 tallies.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">Advanced: In the 9</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2"><span className="text-blue-400">&#9679;</span> Same basic rules as standard.</li>
                  <li className="flex gap-2"><span className="text-blue-400">&#9679;</span> <strong className="text-white">Power Rule:</strong> If your dice total 9, you get +9 points and subtract 9 from the highest scorer.</li>
                  <li className="flex gap-2"><span className="text-blue-400">&#9679;</span> Using a tally with no score = lose 1 point.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">Super Advanced: Spiral Up/Down</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2"><span className="text-green-400">&#9679;</span> Game ends when a player reaches 36 (ascends) or 0 (resets).</li>
                  <li className="flex gap-2"><span className="text-green-400">&#9679;</span> Designed for high sacred time or divination-like game nights.</li>
                </ul>
              </div>

              <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/20">
                <h3 className="text-lg font-bold text-white mb-2">Cultural Use</h3>
                <p className="text-sm">Use at family gatherings, youth education circles, Shabbat game night. Earn tallies through acts of kindness, insight, and service. Elders may moderate or play. Encourages storytelling, sacred math, and emotional resilience.</p>
              </div>
            </div>
          )}
        </Card>

        {/* Youth Scroll Challenges (Collapsible) */}
        <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-6 mt-6">
          <button
            onClick={() => setShowYouthChallenges(!showYouthChallenges)}
            className="w-full flex items-center justify-between text-left"
          >
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              Zakar Games — Youth Scroll Challenges
            </h2>
            {showYouthChallenges ? <ChevronUp className="h-5 w-5 text-blue-400" /> : <ChevronDown className="h-5 w-5 text-blue-400" />}
          </button>

          {showYouthChallenges && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { num: 1, title: 'Code Keeper', skill: 'Math + Sacred Frequency', task: 'Complete 3 games of Solbones Dice with score sheet.', reflection: 'What number shows up most when I am in a good mood?', seal: 'Yellow Spiral', sealDesc: 'I know the numbers of my soul.', color: 'from-yellow-600 to-yellow-800' },
                { num: 2, title: 'Voice of the Tribe', skill: 'Speech + Confidence', task: 'Recite the Solbone Preamble to your family or class.', reflection: 'Which part made me feel powerful?', seal: 'Purple Flame', sealDesc: 'I speak the law of my people.', color: 'from-purple-600 to-purple-800' },
                { num: 3, title: "Healer's Hands", skill: 'Herbology + Compassion', task: 'Learn 3 local herbs and what they heal. Share with someone.', reflection: 'Who do I feel called to help right now?', seal: 'Green Leaf', sealDesc: 'I use my hands to restore.', color: 'from-green-600 to-green-800' },
                { num: 4, title: "Ancestor's Echo", skill: 'History + Legacy', task: 'Interview an elder or guardian. Write their story in your scroll.', reflection: 'What do I carry from them?', seal: 'Red Root', sealDesc: 'I remember who walked before me.', color: 'from-red-600 to-red-800' },
                { num: 5, title: 'Dream Scribe', skill: 'Intuition + Language', task: 'Record 3 dreams this month and draw a symbol for each.', reflection: 'What message came through while I slept?', seal: 'Blue Eye', sealDesc: 'I walk between the worlds.', color: 'from-blue-600 to-blue-800' },
              ].map((ch) => (
                <div key={ch.num} className={`bg-gradient-to-br ${ch.color} rounded-lg p-5 border border-white/10`}>
                  <div className="text-white/60 text-xs mb-1">Challenge {ch.num}</div>
                  <h3 className="text-white font-bold text-lg mb-1">{ch.title}</h3>
                  <div className="text-white/70 text-xs mb-3">{ch.skill}</div>
                  <p className="text-white/90 text-sm mb-2"><strong>Task:</strong> {ch.task}</p>
                  <p className="text-white/70 text-sm mb-3"><strong>Reflection:</strong> {ch.reflection}</p>
                  <div className="bg-black/20 rounded px-3 py-2">
                    <div className="text-yellow-300 text-xs font-bold">Seal Earned: {ch.seal}</div>
                    <div className="text-white/80 text-xs italic">{ch.sealDesc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-purple-400/50 text-sm">
          <p>This game belongs to the Solbone Nation, Amarukhan heritage, and all remnant people who walk in joy and intelligence.</p>
          <p className="mt-1">Laughing is healing. Numbers are sacred. We roll in code.</p>
          <p className="mt-2 text-purple-500/40">A Canryn Production</p>
        </div>
      </div>
    </div>
  );
}
