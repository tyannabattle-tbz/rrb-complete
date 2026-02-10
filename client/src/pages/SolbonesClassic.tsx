import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'wouter';
import { RotateCcw, Trophy, Sparkles, Dice1 } from 'lucide-react';

// ============================================================
// SOLBONES CLASSIC — The Original Dice Game
// Pure gameplay, no frequency overlays
// A Canryn Production
// ============================================================

// Classic die face SVG
function ClassicDie({ value, isRolling, size = 90 }: { value: number; isRolling: boolean; size?: number }) {
  const dots: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[30, 30], [70, 70]],
    3: [[30, 30], [50, 50], [70, 70]],
    4: [[30, 30], [70, 30], [30, 70], [70, 70]],
    5: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]],
    6: [[30, 25], [70, 25], [30, 50], [70, 50], [30, 75], [70, 75]],
  };
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 100 100" className={isRolling ? 'animate-bounce' : 'transition-all duration-300'}>
        <rect x="5" y="5" width="90" height="90" rx="15" ry="15" fill="#fefce8" stroke="#92400e" strokeWidth="3" />
        {(dots[value] || []).map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="8" fill="#1c1917" />
        ))}
      </svg>
    </div>
  );
}

// Simple scoring: sum of dice, with bonuses
function scoreClassic(dice: number[]): { points: number; label: string; bonus?: string } {
  const sorted = [...dice].sort();
  const sum = dice.reduce((a, b) => a + b, 0);

  // Three of a kind
  if (dice[0] === dice[1] && dice[1] === dice[2]) {
    return { points: sum * 2, label: `Triple ${dice[0]}s!`, bonus: `Three of a kind — double score!` };
  }

  // Straight (1-2-3, 2-3-4, 3-4-5, 4-5-6)
  if ((sorted[0] + 1 === sorted[1]) && (sorted[1] + 1 === sorted[2])) {
    return { points: sum + 5, label: `Run ${sorted.join('-')}!`, bonus: `Straight — +5 bonus!` };
  }

  // Pair
  if (dice[0] === dice[1] || dice[1] === dice[2] || dice[0] === dice[2]) {
    const pairVal = dice[0] === dice[1] ? dice[0] : dice[1] === dice[2] ? dice[1] : dice[0];
    return { points: sum + 2, label: `Pair of ${pairVal}s`, bonus: `Pair — +2 bonus` };
  }

  // High card
  return { points: Math.max(...dice), label: `High: ${Math.max(...dice)}` };
}

export default function SolbonesClassic() {
  const [dice, setDice] = useState([1, 1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [score, setScore] = useState(0);
  const [targetScore] = useState(63);
  const [rollsThisTurn, setRollsThisTurn] = useState(0);
  const [maxRolls] = useState(3);
  const [roundResult, setRoundResult] = useState<{ points: number; label: string; bonus?: string } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [roundHistory, setRoundHistory] = useState<{ dice: number[]; points: number; label: string }[]>([]);

  const rollDice = useCallback(() => {
    if (isRolling || gameOver) return;
    setIsRolling(true);
    setRoundResult(null);

    // Animate
    const interval = setInterval(() => {
      setDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      const finalDice = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ];
      setDice(finalDice);
      setIsRolling(false);

      const result = scoreClassic(finalDice);
      setRoundResult(result);
      setRollsThisTurn(prev => prev + 1);
    }, 600);
  }, [isRolling, gameOver]);

  const keepScore = useCallback(() => {
    if (!roundResult) return;
    const newScore = score + roundResult.points;
    setScore(newScore);
    setRoundHistory(prev => [...prev, { dice: [...dice], points: roundResult.points, label: roundResult.label }]);
    setRollsThisTurn(0);
    setRoundResult(null);
    if (newScore >= targetScore) {
      setGameOver(true);
    }
  }, [roundResult, score, dice, targetScore]);

  const newGame = useCallback(() => {
    setDice([1, 1, 1]);
    setScore(0);
    setRollsThisTurn(0);
    setRoundResult(null);
    setGameOver(false);
    setRoundHistory([]);
  }, []);

  return (
    <div className="min-h-screen bg-amber-50 text-stone-900">
      {/* Header */}
      <div className="bg-gradient-to-b from-amber-100 to-amber-50 border-b border-amber-200">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <Link href="/" className="text-amber-700 hover:text-amber-600 text-sm mb-4 inline-block">&larr; Back to Home</Link>
          <h1 className="text-5xl md:text-6xl font-bold text-stone-800 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Solbones
          </h1>
          <p className="text-lg text-amber-800 italic mb-1">The Classic Dice Game</p>
          <p className="text-amber-600 text-sm">Roll three dice. Score points. First to 63 wins.</p>
          <div className="mt-3">
            <Link href="/solbones" className="text-amber-700 hover:text-amber-900 text-xs underline">
              Play Solbones 4+3+2 (Frequency Edition) &rarr;
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Game Area */}
          <div className="md:col-span-2">
            <Card className="bg-white border-amber-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                  <Dice1 className="h-5 w-5 text-amber-700" /> Roll the Bones
                </h2>
                <span className="text-sm text-amber-700">Roll {rollsThisTurn}/{maxRolls}</span>
              </div>

              {/* Dice Display */}
              <div className="flex justify-center gap-6 my-8">
                {dice.map((d, i) => (
                  <ClassicDie key={i} value={d} isRolling={isRolling} />
                ))}
              </div>

              {/* Result */}
              {roundResult && (
                <div className="text-center mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xl font-bold text-stone-800">{roundResult.label}</p>
                  <p className="text-amber-700 text-sm">{roundResult.bonus || `${roundResult.points} points`}</p>
                  <p className="text-2xl font-black text-amber-800 mt-1">+{roundResult.points}</p>
                </div>
              )}

              {/* Controls */}
              <div className="flex justify-center gap-3">
                {!gameOver && (
                  <>
                    <Button
                      onClick={rollDice}
                      disabled={isRolling || rollsThisTurn >= maxRolls}
                      className="bg-amber-700 hover:bg-amber-800 text-white px-6"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {rollsThisTurn === 0 ? 'Roll Dice' : 'Re-Roll'}
                    </Button>
                    {roundResult && (
                      <Button onClick={keepScore} variant="outline" className="border-amber-700 text-amber-800 hover:bg-amber-100">
                        Keep +{roundResult.points}
                      </Button>
                    )}
                  </>
                )}
                <Button onClick={newGame} variant="outline" className="border-stone-300 text-stone-600 hover:bg-stone-100">
                  <RotateCcw className="h-4 w-4 mr-2" /> New Game
                </Button>
              </div>

              {/* Win State */}
              {gameOver && (
                <div className="mt-6 text-center p-6 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl border-2 border-amber-400">
                  <Trophy className="h-12 w-12 text-amber-600 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-stone-800">You Win!</h3>
                  <p className="text-amber-700">Final Score: {score} in {roundHistory.length} rounds</p>
                </div>
              )}
            </Card>

            {/* Rules */}
            <Card className="bg-white border-amber-200 p-6 mt-6">
              <h3 className="text-lg font-bold text-stone-800 mb-3">How to Play</h3>
              <div className="space-y-2 text-sm text-stone-600">
                <p><strong className="text-stone-800">Goal:</strong> Be the first to reach 63 points.</p>
                <p><strong className="text-stone-800">Each Turn:</strong> Roll 3 dice up to 3 times. Keep your best result.</p>
                <p><strong className="text-stone-800">Triple:</strong> Three of a kind scores double the sum.</p>
                <p><strong className="text-stone-800">Straight:</strong> Three in a row (e.g. 2-3-4) scores the sum +5 bonus.</p>
                <p><strong className="text-stone-800">Pair:</strong> Two matching dice scores the sum +2 bonus.</p>
                <p><strong className="text-stone-800">High Card:</strong> No matches scores only the highest die.</p>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Score */}
            <Card className="bg-white border-amber-200 p-4">
              <h3 className="font-bold text-stone-800 mb-2">Score</h3>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-black text-amber-800">{score}</span>
                <span className="text-stone-500 text-sm mb-1">/ {targetScore}</span>
              </div>
              <div className="mt-2 w-full bg-amber-100 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-700 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((score / targetScore) * 100, 100)}%` }}
                />
              </div>
            </Card>

            {/* Round History */}
            <Card className="bg-white border-amber-200 p-4">
              <h3 className="font-bold text-stone-800 mb-2">History</h3>
              {roundHistory.length === 0 ? (
                <p className="text-stone-400 text-sm italic">Roll the dice to begin...</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {roundHistory.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm p-2 bg-amber-50 rounded">
                      <div>
                        <span className="text-stone-600">R{i + 1}:</span>{' '}
                        <span className="font-mono text-stone-800">[{r.dice.join(', ')}]</span>
                      </div>
                      <span className="font-bold text-amber-800">+{r.points}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Link to 4+3+2 */}
            <Card className="bg-gradient-to-br from-purple-900 to-indigo-900 border-purple-500/30 p-4 text-white">
              <h3 className="font-bold mb-2">Ready for More?</h3>
              <p className="text-purple-200 text-sm mb-3">
                Try <strong>Solbones 4+3+2</strong> — the frequency edition with Solfeggio tones, sacred math, AI opponents, dice skins, and the Zakar Youth Challenges.
              </p>
              <Link href="/solbones">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Play Solbones 4+3+2 &rarr;
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-amber-600 text-xs border-t border-amber-200">
        <p>Solbones Classic — A Canryn Production</p>
        <p className="mt-1 text-amber-500">Laughing is healing. Numbers are sacred. We roll in code.</p>
      </div>
    </div>
  );
}
