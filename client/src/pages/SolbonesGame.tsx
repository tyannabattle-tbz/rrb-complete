import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dices, Volume2, RotateCcw } from 'lucide-react';

export default function SolbonesGame() {
  const [gameState, setGameState] = useState({
    dice1: 0,
    dice2: 0,
    dice3: 0,
    total: 0,
    isRolling: false,
    score: 0,
    rolls: 0,
  });

  const [frequencyActive, setFrequencyActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Generate 432Hz sine wave audio
  const generate432HzTone = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 432; // 432Hz healing frequency
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const rollDice = () => {
    setGameState(prev => ({ ...prev, isRolling: true }));

    // Animate rolling
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        dice1: Math.floor(Math.random() * 4) + 1,
        dice2: Math.floor(Math.random() * 3) + 1,
        dice3: Math.floor(Math.random() * 2) + 1,
      }));
      rollCount++;

      if (rollCount > 15) {
        clearInterval(rollInterval);

        const d1 = Math.floor(Math.random() * 4) + 1;
        const d2 = Math.floor(Math.random() * 3) + 1;
        const d3 = Math.floor(Math.random() * 2) + 1;
        const total = d1 + d2 + d3;

        setGameState(prev => ({
          ...prev,
          dice1: d1,
          dice2: d2,
          dice3: d3,
          total,
          isRolling: false,
          score: prev.score + total,
          rolls: prev.rolls + 1,
        }));

        // Play 432Hz tone
        generate432HzTone();
        setFrequencyActive(true);
        setTimeout(() => setFrequencyActive(false), 500);
      }
    }, 50);
  };

  const resetGame = () => {
    setGameState({
      dice1: 0,
      dice2: 0,
      dice3: 0,
      total: 0,
      isRolling: false,
      score: 0,
      rolls: 0,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Dices className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">Solbones 4+3+2</h1>
                <p className="text-sm text-purple-300">Sacred Math Dice Game • 432Hz Healing Frequency</p>
              </div>
            </div>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
              🎮 Active
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Game Rules */}
        <Card className="bg-slate-800/50 border-purple-500/20 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">How to Play</CardTitle>
            <CardDescription className="text-purple-300">
              Roll the sacred math dice and harness the healing power of 432Hz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/20">
                <p className="text-lg font-bold text-purple-400 mb-2">4-Sided Die</p>
                <p className="text-sm text-gray-300">Roll 1-4 • Represents the 4 elements</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/20">
                <p className="text-lg font-bold text-purple-400 mb-2">3-Sided Die</p>
                <p className="text-sm text-gray-300">Roll 1-3 • Represents the trinity</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/20">
                <p className="text-lg font-bold text-purple-400 mb-2">2-Sided Die</p>
                <p className="text-sm text-gray-300">Roll 1-2 • Represents duality</p>
              </div>
            </div>
            <p className="text-gray-300">
              Each roll triggers a 432Hz healing frequency tone. Accumulate points and track your spiritual journey 
              through the sacred geometry of numbers.
            </p>
          </CardContent>
        </Card>

        {/* Game Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Dice Display */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-500/50">
              <CardHeader>
                <CardTitle className="text-2xl">Roll the Dice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Dice */}
                <div className="flex justify-center gap-8 py-12">
                  {/* 4-Sided Die */}
                  <div
                    className={`w-20 h-20 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-4xl font-bold text-white shadow-lg border-2 border-purple-400 ${
                      gameState.isRolling ? 'animate-spin' : ''
                    }`}
                  >
                    {gameState.dice1 || '?'}
                  </div>

                  {/* 3-Sided Die */}
                  <div
                    className={`w-20 h-20 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-4xl font-bold text-white shadow-lg border-2 border-blue-400 ${
                      gameState.isRolling ? 'animate-bounce' : ''
                    }`}
                  >
                    {gameState.dice2 || '?'}
                  </div>

                  {/* 2-Sided Die */}
                  <div
                    className={`w-20 h-20 rounded-lg bg-gradient-to-br from-cyan-600 to-cyan-800 flex items-center justify-center text-4xl font-bold text-white shadow-lg border-2 border-cyan-400 ${
                      gameState.isRolling ? 'animate-pulse' : ''
                    }`}
                  >
                    {gameState.dice3 || '?'}
                  </div>
                </div>

                {/* Total */}
                {gameState.total > 0 && (
                  <div className="bg-slate-800/50 rounded-lg p-6 border border-purple-500/20 text-center">
                    <p className="text-sm text-purple-300 mb-2">Total Points</p>
                    <p className="text-5xl font-bold text-purple-400">{gameState.total}</p>
                  </div>
                )}

                {/* 432Hz Indicator */}
                {frequencyActive && (
                  <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/50 flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-green-400 animate-pulse" />
                    <p className="text-green-300 font-semibold">432Hz Healing Frequency Activated</p>
                  </div>
                )}

                {/* Controls */}
                <div className="flex gap-4">
                  <Button
                    onClick={rollDice}
                    disabled={gameState.isRolling}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    size="lg"
                  >
                    {gameState.isRolling ? 'Rolling...' : 'Roll Dice'}
                  </Button>
                  <Button
                    onClick={resetGame}
                    variant="outline"
                    className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                    size="lg"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-lg">Game Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-purple-300 mb-1">Total Score</p>
                  <p className="text-3xl font-bold text-purple-400">{gameState.score}</p>
                </div>
                <div>
                  <p className="text-sm text-purple-300 mb-1">Rolls</p>
                  <p className="text-3xl font-bold text-blue-400">{gameState.rolls}</p>
                </div>
                <div>
                  <p className="text-sm text-purple-300 mb-1">Average</p>
                  <p className="text-3xl font-bold text-cyan-400">
                    {gameState.rolls > 0 ? (gameState.score / gameState.rolls).toFixed(1) : '0'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-lg">432Hz Frequency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300 mb-4">
                  The healing frequency of the universe. Each roll triggers a therapeutic tone for wellness and balance.
                </p>
                <div className="flex items-center gap-2 text-purple-400">
                  <Volume2 className="w-4 h-4" />
                  <span className="text-sm font-semibold">432 Hz</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Leaderboard */}
        <Card className="bg-slate-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-2xl">Spiritual Journey</CardTitle>
            <CardDescription className="text-purple-300">
              Track your progress through sacred geometry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { level: 'Initiate', score: '1-10', color: 'text-gray-400' },
                { level: 'Seeker', score: '11-30', color: 'text-blue-400' },
                { level: 'Harmonizer', score: '31-60', color: 'text-purple-400' },
                { level: 'Resonator', score: '61-100', color: 'text-pink-400' },
                { level: 'Ascended', score: '100+', color: 'text-yellow-400' },
              ].map((tier, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-purple-500/10">
                  <span className={`font-semibold ${tier.color}`}>{tier.level}</span>
                  <span className="text-sm text-gray-400">{tier.score} points</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
