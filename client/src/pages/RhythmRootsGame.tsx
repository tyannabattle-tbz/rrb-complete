import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Trophy, Zap, Volume2, VolumeX, RotateCcw, ChevronRight, Lock, Music, Star } from 'lucide-react';
import { toast } from 'sonner';

// Rhythm Roots — A beat-matching rhythm game celebrating Black music heritage
// Tap the beats in time to progress through music eras

interface Beat {
  id: number;
  lane: number; // 0-3
  time: number; // ms from start
  hit: boolean;
  missed: boolean;
}

interface Level {
  id: number;
  name: string;
  era: string;
  bpm: number;
  color: string;
  bgGradient: string;
  pattern: number[][]; // each sub-array is a measure, numbers are lane indices
  unlocked: boolean;
  requiredScore: number;
}

const LANES = [
  { key: 'a', label: '🥁', color: 'bg-red-500', name: 'Drum' },
  { key: 's', label: '🎸', color: 'bg-blue-500', name: 'Bass' },
  { key: 'd', label: '🎹', color: 'bg-green-500', name: 'Keys' },
  { key: 'f', label: '🎷', color: 'bg-yellow-500', name: 'Horn' },
];

const GAME_LEVELS: Level[] = [
  { id: 1, name: 'Spirituals', era: '1800s', bpm: 70, color: '#8B4513', bgGradient: 'from-amber-900 to-yellow-900', pattern: [[0], [2], [0], [2], [0, 2], [1], [0], [3]], unlocked: true, requiredScore: 500 },
  { id: 2, name: 'Blues', era: '1920s', bpm: 80, color: '#1a3a5c', bgGradient: 'from-blue-900 to-slate-900', pattern: [[0, 1], [2], [0], [3], [1, 2], [0], [3], [0, 1]], unlocked: false, requiredScore: 800 },
  { id: 3, name: 'Gospel', era: '1940s', bpm: 90, color: '#8B0000', bgGradient: 'from-red-900 to-rose-900', pattern: [[0, 2], [1, 3], [0], [2, 3], [0, 1], [3], [0, 2], [1, 3]], unlocked: false, requiredScore: 1200 },
  { id: 4, name: 'Jazz', era: '1950s', bpm: 100, color: '#4B0082', bgGradient: 'from-indigo-900 to-purple-900', pattern: [[0], [1, 2, 3], [0, 2], [1], [3, 0], [2, 1], [0, 3], [1, 2]], unlocked: false, requiredScore: 1600 },
  { id: 5, name: 'Soul & Motown', era: '1960s', bpm: 110, color: '#FF6347', bgGradient: 'from-orange-900 to-red-900', pattern: [[0, 1], [2, 3], [0, 2], [1, 3], [0, 1, 2], [3], [0, 1], [2, 3]], unlocked: false, requiredScore: 2000 },
  { id: 6, name: 'Funk', era: '1970s', bpm: 115, color: '#FF1493', bgGradient: 'from-pink-900 to-fuchsia-900', pattern: [[0, 1, 2], [3], [0, 2], [1, 3], [0], [1, 2, 3], [0, 2], [1, 3, 0]], unlocked: false, requiredScore: 2500 },
  { id: 7, name: 'Hip-Hop', era: '1990s', bpm: 95, color: '#FFD700', bgGradient: 'from-yellow-900 to-amber-900', pattern: [[0, 1], [2], [0, 3], [1, 2], [0], [1, 2, 3], [0, 3], [1, 2, 0]], unlocked: false, requiredScore: 3000 },
  { id: 8, name: 'Neo-Soul & Afrobeats', era: '2020s', bpm: 120, color: '#00CED1', bgGradient: 'from-teal-900 to-cyan-900', pattern: [[0, 1, 2, 3], [0, 2], [1, 3], [0, 1, 2], [3, 0], [1, 2, 3], [0, 1], [2, 3, 0, 1]], unlocked: false, requiredScore: 4000 },
];

export default function RhythmRootsGame() {
  const [levels, setLevels] = useState<Level[]>(() => {
    const saved = localStorage.getItem('rr_levels');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return GAME_LEVELS.map((l, i) => ({ ...l, unlocked: parsed[i]?.unlocked ?? l.unlocked }));
      } catch { return GAME_LEVELS; }
    }
    return GAME_LEVELS;
  });

  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [beats, setBeats] = useState<Beat[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [hitFeedback, setHitFeedback] = useState<{ lane: number; type: 'perfect' | 'good' | 'miss'; time: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const [totalScore, setTotalScore] = useState(() => parseInt(localStorage.getItem('rr_total') || '0'));
  const [highestLevel, setHighestLevel] = useState(() => parseInt(localStorage.getItem('rr_highest') || '1'));
  const gameTimeRef = useRef(0);
  const animFrameRef = useRef<number>();
  const lastTimeRef = useRef(0);
  const beatsRef = useRef<Beat[]>([]);

  useEffect(() => { localStorage.setItem('rr_levels', JSON.stringify(levels)); }, [levels]);
  useEffect(() => { localStorage.setItem('rr_total', totalScore.toString()); }, [totalScore]);
  useEffect(() => { localStorage.setItem('rr_highest', highestLevel.toString()); }, [highestLevel]);

  const playNote = useCallback((lane: number, type: 'perfect' | 'good' | 'miss') => {
    if (!soundOn) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const freqs = [261.63, 329.63, 392, 523.25]; // C4, E4, G4, C5
      osc.frequency.value = type === 'miss' ? 150 : freqs[lane];
      osc.type = type === 'perfect' ? 'sine' : type === 'good' ? 'triangle' : 'sawtooth';
      gain.gain.value = type === 'miss' ? 0.05 : 0.15;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }, [soundOn]);

  const generateBeats = (level: Level): Beat[] => {
    const beatInterval = 60000 / level.bpm;
    const allBeats: Beat[] = [];
    let id = 0;
    // Repeat pattern 4 times for a full song
    for (let rep = 0; rep < 4; rep++) {
      level.pattern.forEach((measure, mIdx) => {
        measure.forEach(lane => {
          allBeats.push({
            id: id++,
            lane,
            time: 2000 + (rep * level.pattern.length + mIdx) * beatInterval,
            hit: false,
            missed: false,
          });
        });
      });
    }
    return allBeats;
  };

  const startLevel = (levelIdx: number) => {
    const level = levels[levelIdx];
    if (!level?.unlocked) return;
    const newBeats = generateBeats(level);
    setBeats(newBeats);
    beatsRef.current = newBeats;
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setProgress(0);
    setCurrentLevel(levelIdx);
    setGameActive(true);
    setShowLevelSelect(false);
    gameTimeRef.current = 0;
    lastTimeRef.current = performance.now();

    const gameLoop = (timestamp: number) => {
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      gameTimeRef.current += delta;

      const totalDuration = newBeats[newBeats.length - 1].time + 2000;
      setProgress(Math.min(gameTimeRef.current / totalDuration, 1));

      // Check for missed beats
      const updated = beatsRef.current.map(b => {
        if (!b.hit && !b.missed && gameTimeRef.current > b.time + 300) {
          return { ...b, missed: true };
        }
        return b;
      });
      beatsRef.current = updated;
      setBeats([...updated]);

      if (gameTimeRef.current < totalDuration) {
        animFrameRef.current = requestAnimationFrame(gameLoop);
      } else {
        endRound(levelIdx);
      }
    };
    animFrameRef.current = requestAnimationFrame(gameLoop);
  };

  const endRound = (levelIdx: number) => {
    setGameActive(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const level = levels[levelIdx];

    setTotalScore(t => t + score);

    if (score >= level.requiredScore && levelIdx < levels.length - 1) {
      const newLevels = [...levels];
      newLevels[levelIdx + 1] = { ...newLevels[levelIdx + 1], unlocked: true };
      setLevels(newLevels);
      setHighestLevel(h => Math.max(h, levelIdx + 2));
      toast.success(`${levels[levelIdx + 1].name} era unlocked! 🎶`);
    }
  };

  const handleLaneTap = useCallback((lane: number) => {
    if (!gameActive) return;
    const now = gameTimeRef.current;
    const hitWindow = 200; // ms
    const perfectWindow = 80; // ms

    const beatIdx = beatsRef.current.findIndex(b => b.lane === lane && !b.hit && !b.missed && Math.abs(b.time - now) < hitWindow);

    if (beatIdx >= 0) {
      const beat = beatsRef.current[beatIdx];
      const diff = Math.abs(beat.time - now);
      const isPerfect = diff < perfectWindow;
      const type = isPerfect ? 'perfect' : 'good';

      beatsRef.current[beatIdx] = { ...beat, hit: true };
      setBeats([...beatsRef.current]);

      const points = isPerfect ? 100 : 50;
      setScore(s => s + points * (1 + combo * 0.1));
      setCombo(c => {
        const newCombo = c + 1;
        setMaxCombo(m => Math.max(m, newCombo));
        return newCombo;
      });
      setHitFeedback({ lane, type, time: Date.now() });
      playNote(lane, type);
    } else {
      setCombo(0);
      setHitFeedback({ lane, type: 'miss', time: Date.now() });
      playNote(lane, 'miss');
    }
  }, [gameActive, combo, playNote]);

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const laneIdx = LANES.findIndex(l => l.key === e.key.toLowerCase());
      if (laneIdx >= 0) handleLaneTap(laneIdx);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleLaneTap]);

  if (showLevelSelect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-950 to-gray-900 text-white p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300">
              <ArrowLeft size={20} /> Home
            </Link>
            <button onClick={() => setSoundOn(!soundOn)} className="text-gray-400 hover:text-white" aria-label={soundOn ? 'Mute' : 'Unmute'}>
              {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
              <Music className="inline mr-2" size={36} />Rhythm Roots
            </h1>
            <p className="text-gray-400">Tap the beat through the eras of Black music heritage</p>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <span className="text-yellow-400"><Trophy size={14} className="inline mr-1" />{totalScore} pts</span>
              <span className="text-green-400"><Star size={14} className="inline mr-1" />Era {highestLevel}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Keyboard: A S D F • Mobile: Tap the lanes</p>
          </div>

          <div className="grid gap-3" role="list" aria-label="Music eras">
            {levels.map((level, i) => (
              <button
                key={level.id}
                onClick={() => level.unlocked && startLevel(i)}
                disabled={!level.unlocked}
                className={`p-4 rounded-xl border text-left transition-all ${level.unlocked ? `bg-gradient-to-r ${level.bgGradient} border-white/20 hover:scale-[1.02] cursor-pointer` : 'bg-gray-800/50 border-gray-700 cursor-not-allowed'}`}
                role="listitem"
                aria-label={`Era ${level.id}: ${level.name} (${level.era}) - ${level.bpm} BPM${level.unlocked ? '' : ' - Locked'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {level.unlocked ? <Music size={20} style={{ color: level.color }} /> : <Lock size={20} className="text-gray-500" />}
                    <div>
                      <p className="font-bold text-lg">{level.name}</p>
                      <p className="text-sm opacity-70">{level.era} • {level.bpm} BPM • {level.requiredScore} pts to advance</p>
                    </div>
                  </div>
                  {level.unlocked ? <ChevronRight size={20} /> : <Lock size={16} className="text-gray-500" />}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 text-center flex gap-4 justify-center">
            <Link href="/games/word-frequency" className="text-yellow-400 hover:text-yellow-300 text-sm">Play Word Frequency →</Link>
            <Link href="/games/frequency-match" className="text-yellow-400 hover:text-yellow-300 text-sm">Play Frequency Match →</Link>
          </div>
        </div>
      </div>
    );
  }

  const level = currentLevel !== null ? levels[currentLevel] : null;
  const visibleBeats = beats.filter(b => {
    const relTime = b.time - gameTimeRef.current;
    return relTime > -300 && relTime < 3000 && !b.hit;
  });

  return (
    <div className={`min-h-screen bg-gradient-to-br ${level?.bgGradient || 'from-gray-900 to-gray-800'} text-white overflow-hidden`}>
      <div className="max-w-lg mx-auto p-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => { setGameActive(false); if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); setShowLevelSelect(true); }} className="text-yellow-400" aria-label="Back">
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <p className="text-xs opacity-70">{level?.name} • {level?.era}</p>
            <p className="font-bold text-yellow-400">{Math.round(score)} pts</p>
          </div>
          <div className="flex items-center gap-2">
            {combo > 2 && <span className="text-orange-400 text-sm font-bold">🔥{combo}x</span>}
          </div>
        </div>

        {/* Progress */}
        <div className="w-full h-1 bg-gray-800 rounded-full mb-3 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all" style={{ width: `${progress * 100}%` }} />
        </div>

        {/* Rhythm lanes */}
        <div className="relative h-[60vh] mb-4">
          {/* Lane backgrounds */}
          <div className="absolute inset-0 grid grid-cols-4 gap-1">
            {LANES.map((lane, i) => (
              <div key={i} className="bg-white/5 rounded-lg relative overflow-hidden">
                {/* Hit zone indicator */}
                <div className="absolute bottom-16 left-0 right-0 h-1 bg-white/20" />
              </div>
            ))}
          </div>

          {/* Falling beats */}
          {visibleBeats.map(beat => {
            const relTime = beat.time - gameTimeRef.current;
            const topPercent = Math.max(0, Math.min(100, (1 - relTime / 3000) * 85));
            return (
              <div
                key={beat.id}
                className={`absolute w-[23%] h-10 rounded-lg flex items-center justify-center text-lg font-bold transition-opacity ${beat.missed ? 'opacity-20' : ''} ${LANES[beat.lane].color}`}
                style={{
                  left: `${beat.lane * 25 + 1}%`,
                  top: `${topPercent}%`,
                }}
              >
                {LANES[beat.lane].label}
              </div>
            );
          })}

          {/* Hit feedback */}
          {hitFeedback && Date.now() - hitFeedback.time < 500 && (
            <div
              className={`absolute bottom-20 text-center font-bold text-lg animate-bounce ${hitFeedback.type === 'perfect' ? 'text-yellow-400' : hitFeedback.type === 'good' ? 'text-green-400' : 'text-red-400'}`}
              style={{ left: `${hitFeedback.lane * 25 + 5}%` }}
            >
              {hitFeedback.type === 'perfect' ? '✨ PERFECT' : hitFeedback.type === 'good' ? '👍 GOOD' : '❌ MISS'}
            </div>
          )}
        </div>

        {/* Tap buttons */}
        <div className="grid grid-cols-4 gap-2">
          {LANES.map((lane, i) => (
            <button
              key={i}
              onMouseDown={() => handleLaneTap(i)}
              onTouchStart={(e) => { e.preventDefault(); handleLaneTap(i); }}
              className={`py-4 rounded-xl text-xl font-bold ${lane.color} active:scale-95 active:brightness-150 transition-transform`}
              aria-label={`${lane.name} lane (key: ${lane.key.toUpperCase()})`}
            >
              {lane.label}
              <span className="block text-[10px] opacity-60">{lane.key.toUpperCase()}</span>
            </button>
          ))}
        </div>

        {/* Game Over */}
        {!gameActive && currentLevel !== null && progress > 0 && (
          <div className="mt-4 bg-black/70 backdrop-blur rounded-xl p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">{score >= (level?.requiredScore || 0) ? '🎶 Encore!' : '🎵 Song Complete'}</h2>
            <p className="text-yellow-400 text-xl mb-1">{Math.round(score)} points</p>
            <p className="text-sm text-gray-400 mb-1">Max Combo: {maxCombo}x</p>
            <p className="text-sm text-gray-400 mb-4">{beats.filter(b => b.hit).length}/{beats.length} beats hit</p>
            {score >= (level?.requiredScore || 0) && currentLevel < levels.length - 1 && (
              <p className="text-green-400 mb-4">{levels[currentLevel + 1].name} era unlocked! 🔓</p>
            )}
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={() => startLevel(currentLevel)} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg flex items-center gap-2">
                <RotateCcw size={16} /> Replay
              </button>
              {score >= (level?.requiredScore || 0) && currentLevel < levels.length - 1 && (
                <button onClick={() => startLevel(currentLevel + 1)} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg flex items-center gap-2">
                  Next Era <ChevronRight size={16} />
                </button>
              )}
              <button onClick={() => setShowLevelSelect(true)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                Eras
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
