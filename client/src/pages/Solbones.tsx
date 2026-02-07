import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

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
  const { user } = useAuth();
  const [rolls, setRolls] = useState<DiceRoll[]>([]);
  const [currentRoll, setCurrentRoll] = useState<DiceRoll | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<number>(432);

  // tRPC queries and mutations
  const rollDiceMutation = trpc.solbones.rollDice.useMutation();
  const historyQuery = trpc.solbones.getHistory.useQuery({ limit: 20 });
  const statsQuery = trpc.solbones.getStats.useQuery();
  const leaderboardQuery = trpc.solbones.getLeaderboard.useQuery({ limit: 10 });

  useEffect(() => {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(context);
  }, []);

  const rollDice = async () => {
    if (!user) return;
    
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

      if (rollCount >= 10) {
        clearInterval(rollInterval);
        
        // Call backend to record the roll
        rollDiceMutation.mutate({
          notes: `Rolled ${currentRoll?.note}`,
        }, {
          onSuccess: () => {
            historyQuery.refetch();
            statsQuery.refetch();
          }
        });
        
        setIsRolling(false);
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

  const frequencyDescriptions: { [key: string]: string } = {
    'UT': 'Foundation and security, grounding energy',
    'RE': 'Tissue repair and cellular healing',
    'MI': 'Emotional healing and transformation',
    'FA': 'Heart chakra, universal harmony and healing',
    'SOL': 'DNA repair, love and miracles',
    'LA': 'Relationships and communication',
    'TI': 'Intuition and spiritual awakening',
    'DO': 'Return to spiritual order and enlightenment',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">⚡ Solbones</h1>
          <p className="text-xl text-purple-200">
            Frequency Dice Game - Discover healing frequencies through the ancient Solfeggio scale
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dice Rolling Section */}
          <Card className="bg-gray-900 border-purple-500 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Roll the Frequency Dice</h2>
            
            <div className="flex flex-col items-center justify-center space-y-8">
              <div className="text-6xl">🎲</div>
              <p className="text-purple-300 text-center">
                Roll to discover your frequency
              </p>

              {currentRoll && (
                <div className={`bg-gradient-to-r ${FREQUENCY_MAP[Object.keys(FREQUENCY_MAP).find(k => FREQUENCY_MAP[parseInt(k)].frequency === currentRoll.frequency) as any]?.color || 'from-purple-500 to-pink-500'} p-8 rounded-lg w-full text-center`}>
                  <div className="text-white">
                    <div className="text-4xl font-bold mb-2">{currentRoll.note}</div>
                    <div className="text-2xl">{currentRoll.frequency} Hz</div>
                  </div>
                </div>
              )}

              <Button
                onClick={rollDice}
                disabled={isRolling || !user}
                className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-lg text-lg"
              >
                {isRolling ? 'Rolling...' : 'Roll Dice'}
              </Button>

              {currentRoll && (
                <Button
                  onClick={() => playFrequency(currentRoll.frequency)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
                >
                  🔊 Play Frequency
                </Button>
              )}
            </div>
          </Card>

          {/* Solfeggio Frequencies Display */}
          <Card className="bg-gray-900 border-purple-500 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Solfeggio Frequencies</h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Object.entries(FREQUENCY_MAP).map(([key, data]) => (
                <div
                  key={key}
                  className={`bg-gradient-to-r ${data.color} p-4 rounded-lg cursor-pointer hover:shadow-lg transition-shadow`}
                  onClick={() => playFrequency(data.frequency)}
                >
                  <div className="flex justify-between items-center text-white">
                    <div>
                      <div className="font-bold">Dice {key}: {data.note}</div>
                      <div className="text-sm opacity-90">{data.frequency} Hz</div>
                    </div>
                    <div className="text-2xl">🔊</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Frequency Information */}
        <Card className="bg-gray-900 border-purple-500 p-8 mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">About Solfeggio Frequencies</h2>
          
          <p className="text-purple-200 mb-6">
            The Solfeggio frequencies are a set of musical tones that have been used for centuries in sacred music and meditation practices. Each frequency is believed to have unique healing and spiritual properties.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(frequencyDescriptions).map(([note, description]) => (
              <div key={note} className="bg-gray-800 p-4 rounded-lg border border-purple-500">
                <div className="font-bold text-purple-300 mb-2">{note}</div>
                <div className="text-sm text-gray-300">{description}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* User Stats */}
        {user && statsQuery.data && (
          <Card className="bg-gray-900 border-purple-500 p-8 mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Your Stats</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-purple-300 text-sm">Total Rolls</div>
                <div className="text-3xl font-bold text-white">{statsQuery.data.totalRolls}</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-purple-300 text-sm">Favorite Frequency</div>
                <div className="text-3xl font-bold text-white">{statsQuery.data.favoriteFrequency || 'N/A'}</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-purple-300 text-sm">Score</div>
                <div className="text-3xl font-bold text-white">{statsQuery.data.score}</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
