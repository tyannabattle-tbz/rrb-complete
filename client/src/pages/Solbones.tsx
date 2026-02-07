import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DiceRoll {
  id: string;
  frequency: number;
  note: string;
  timestamp: Date;
}

const FREQUENCY_MAP: { [key: number]: { frequency: number; note: string; color: string } } = {
  1: { frequency: 174, note: 'UT', color: 'from-red-500 to-red-600' },
  2: { frequency: 285, note: 'RE', color: 'from-orange-500 to-orange-600' },
  3: { frequency: 369, note: 'MI', color: 'from-yellow-500 to-yellow-600' },
  4: { frequency: 432, note: 'FA', color: 'from-green-500 to-green-600' },
  5: { frequency: 528, note: 'SOL', color: 'from-blue-500 to-blue-600' },
  6: { frequency: 639, note: 'LA', color: 'from-indigo-500 to-indigo-600' },
  7: { frequency: 741, note: 'TI', color: 'from-purple-500 to-purple-600' },
  8: { frequency: 852, note: 'DO', color: 'from-pink-500 to-pink-600' },
};

export default function Solbones() {
  const [rolls, setRolls] = useState<DiceRoll[]>([]);
  const [currentRoll, setCurrentRoll] = useState<DiceRoll | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<number>(432);

  useEffect(() => {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(context);
  }, []);

  const rollDice = () => {
    setIsRolling(true);
    
    // Animate dice rolling
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      const randomDice = Math.floor(Math.random() * 8) + 1;
      const freqData = FREQUENCY_MAP[randomDice];
      setCurrentRoll({
        id: `roll-${Date.now()}-${rollCount}`,
        frequency: freqData.frequency,
        note: freqData.note,
        timestamp: new Date(),
      });
      rollCount++;

      if (rollCount > 15) {
        clearInterval(rollInterval);
        const finalDice = Math.floor(Math.random() * 8) + 1;
        const finalFreqData = FREQUENCY_MAP[finalDice];
        const finalRoll: DiceRoll = {
          id: `roll-${Date.now()}`,
          frequency: finalFreqData.frequency,
          note: finalFreqData.note,
          timestamp: new Date(),
        };
        setCurrentRoll(finalRoll);
        setRolls([finalRoll, ...rolls]);
        setSelectedFrequency(finalFreqData.frequency);
        setIsRolling(false);
        playFrequency(finalFreqData.frequency);
      }
    }, 100);
  };

  const playFrequency = (frequency: number) => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 2);
  };

  const playCustomFrequency = (frequency: number) => {
    playFrequency(frequency);
  };

  const getDiceColor = (frequency: number) => {
    for (const [, data] of Object.entries(FREQUENCY_MAP)) {
      if (data.frequency === frequency) {
        return data.color;
      }
    }
    return 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            ⚡ Solbones
          </h1>
          <p className="text-gray-300 text-lg">
            Frequency Dice Game - Discover healing frequencies through the ancient Solfeggio scale
          </p>
        </div>

        {/* Main Game Area */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Dice Rolling Section */}
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/50 p-8 flex flex-col items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-purple-300 mb-8">Roll the Frequency Dice</h2>
              
              {/* Current Roll Display */}
              {currentRoll && (
                <div className={`bg-gradient-to-br ${getDiceColor(currentRoll.frequency)} rounded-lg p-8 mb-8 transform transition-transform`}>
                  <div className="text-6xl font-bold text-white mb-2">
                    {Math.floor(currentRoll.frequency)}
                  </div>
                  <div className="text-2xl text-white/80 mb-2">Hz</div>
                  <div className="text-xl text-white/60">{currentRoll.note} Note</div>
                </div>
              )}

              {!currentRoll && (
                <div className="bg-slate-700/50 rounded-lg p-8 mb-8 border-2 border-dashed border-purple-500/50">
                  <div className="text-4xl text-gray-400 mb-2">🎲</div>
                  <div className="text-gray-400">Roll to discover your frequency</div>
                </div>
              )}

              <Button
                onClick={rollDice}
                disabled={isRolling}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-lg text-lg"
              >
                {isRolling ? 'Rolling...' : 'Roll Dice'}
              </Button>
            </div>
          </Card>

          {/* Frequency Guide */}
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/50 p-8">
            <h2 className="text-2xl font-bold text-purple-300 mb-6">Solfeggio Frequencies</h2>
            <div className="space-y-3">
              {Object.entries(FREQUENCY_MAP).map(([dice, data]) => (
                <button
                  key={dice}
                  onClick={() => playCustomFrequency(data.frequency)}
                  className={`w-full bg-gradient-to-r ${data.color} hover:opacity-80 transition-opacity rounded-lg p-4 text-white text-left`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold">Dice {dice}: {data.note}</div>
                      <div className="text-sm opacity-80">{data.frequency} Hz</div>
                    </div>
                    <span className="text-2xl">🔊</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Roll History */}
        {rolls.length > 0 && (
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/50 p-8">
            <h2 className="text-2xl font-bold text-purple-300 mb-6">Roll History</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {rolls.map((roll) => (
                <div
                  key={roll.id}
                  className={`bg-gradient-to-r ${getDiceColor(roll.frequency)} rounded-lg p-4 flex justify-between items-center`}
                >
                  <div className="text-white">
                    <div className="font-bold">{roll.frequency} Hz - {roll.note}</div>
                    <div className="text-sm opacity-75">
                      {roll.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <button
                    onClick={() => playCustomFrequency(roll.frequency)}
                    className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors"
                  >
                    🔊
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Information Section */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-purple-500/50 p-8 mt-8">
          <h2 className="text-2xl font-bold text-purple-300 mb-4">About Solfeggio Frequencies</h2>
          <div className="text-gray-300 space-y-4">
            <p>
              The Solfeggio frequencies are a set of musical tones that have been used for centuries in sacred music and meditation practices. Each frequency is believed to have unique healing and spiritual properties.
            </p>
            <p>
              <strong>174 Hz (UT):</strong> Foundation and security, grounding energy
            </p>
            <p>
              <strong>285 Hz (RE):</strong> Tissue repair and cellular healing
            </p>
            <p>
              <strong>369 Hz (MI):</strong> Emotional healing and transformation
            </p>
            <p>
              <strong>432 Hz (FA):</strong> Heart chakra, universal harmony and healing
            </p>
            <p>
              <strong>528 Hz (SOL):</strong> DNA repair, love and miracles
            </p>
            <p>
              <strong>639 Hz (LA):</strong> Relationships and communication
            </p>
            <p>
              <strong>741 Hz (TI):</strong> Intuition and spiritual awakening
            </p>
            <p>
              <strong>852 Hz (DO):</strong> Return to spiritual order and enlightenment
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
