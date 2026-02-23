import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AnimalResponse {
  interpretation: string;
  meaning: string;
  emotion: string;
  recommendations: string[];
  confidence: number;
}

const ANIMAL_SPECIES = ['dog', 'cat', 'bird', 'horse', 'elephant', 'dolphin', 'parrot', 'rabbit'];

const EMOTIONS = [
  'Happy',
  'Anxious',
  'Playful',
  'Scared',
  'Curious',
  'Tired',
  'Hungry',
  'Stressed',
  'Calm',
  'Excited',
];

export function AnimalCommunication() {
  const [animalName, setAnimalName] = useState('');
  const [species, setSpecies] = useState('dog');
  const [behavior, setBehavior] = useState('');
  const [emotion, setEmotion] = useState('');
  const [location, setLocation] = useState('');
  const [response, setResponse] = useState<AnimalResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInterpret = async () => {
    if (!animalName || !behavior) {
      setError('Please provide animal name and behavior');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API call to animal communication service
      const mockResponse: AnimalResponse = {
        interpretation: `${animalName} is showing signs of ${emotion || 'normal'} behavior.`,
        meaning: `This behavior typically indicates that ${animalName} is ${emotion?.toLowerCase() || 'feeling normal'}.`,
        emotion: emotion || 'Neutral',
        recommendations: [
          `Provide ${animalName} with a comfortable space`,
          'Engage in interactive play or activities',
          'Ensure proper hydration and nutrition',
          'Monitor for any changes in behavior',
        ],
        confidence: Math.floor(Math.random() * 40) + 60, // 60-100
      };

      setResponse(mockResponse);
    } catch (err) {
      setError('Failed to interpret animal behavior. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-orange-500 mb-2">🐾 Animal Communication</h1>
        <p className="text-gray-400">Understand what your animal friends are trying to tell you</p>
      </div>

      <Card className="bg-gray-900 border-orange-500/30 p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Animal Name</label>
              <Input
                value={animalName}
                onChange={(e) => setAnimalName(e.target.value)}
                placeholder="e.g., Buddy, Whiskers, Polly"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Species</label>
              <Select value={species} onValueChange={setSpecies}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {ANIMAL_SPECIES.map((s) => (
                    <SelectItem key={s} value={s} className="text-white">
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Observed Behavior
            </label>
            <Textarea
              value={behavior}
              onChange={(e) => setBehavior(e.target.value)}
              placeholder="Describe what your animal is doing... (e.g., pacing back and forth, meowing loudly, tail wagging)"
              className="bg-gray-800 border-gray-700 text-white min-h-24"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Apparent Emotion (Optional)
              </label>
              <Select value={emotion} onValueChange={setEmotion}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select emotion..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {EMOTIONS.map((e) => (
                    <SelectItem key={e} value={e} className="text-white">
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location (Optional)
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Living room, Garden, Bedroom"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <Button
            onClick={handleInterpret}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2"
          >
            {loading ? 'Interpreting...' : '🎯 Interpret Behavior'}
          </Button>
        </div>
      </Card>

      {response && (
        <Card className="bg-gray-900 border-green-500/30 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-green-500">✨ Interpretation</h2>
              <div className="text-right">
                <div className="text-sm text-gray-400">Confidence</div>
                <div className="text-2xl font-bold text-green-500">{response.confidence}%</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 uppercase">What it means</h3>
                <p className="text-gray-200 mt-1">{response.meaning}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-300 uppercase">Emotion detected</h3>
                <p className="text-gray-200 mt-1">{response.emotion}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-300 uppercase mb-2">
                  Recommendations
                </h3>
                <ul className="space-y-2">
                  {response.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-200">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="bg-gray-900 border-purple-500/30 p-6">
        <h3 className="text-lg font-bold text-purple-500 mb-3">💡 Tips for Better Communication</h3>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li>• Observe your animal's body language carefully</li>
          <li>• Note changes in routine or environment</li>
          <li>• Consider recent events that might affect behavior</li>
          <li>• If behavior persists or worsens, consult a veterinarian</li>
          <li>• Use these insights to strengthen your bond</li>
        </ul>
      </Card>
    </div>
  );
}
