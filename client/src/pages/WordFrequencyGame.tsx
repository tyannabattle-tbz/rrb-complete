import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Trophy, Star, Zap, Heart, Volume2, VolumeX, RotateCcw, ChevronRight, Lock, Award, Target } from 'lucide-react';
import { toast } from 'sonner';

// Word Frequency — A word puzzle game themed around healing frequencies & community empowerment
// Each level unlocks at a higher frequency tier with harder words

interface Level {
  id: number;
  name: string;
  frequency: string;
  color: string;
  bgGradient: string;
  words: string[];
  timeLimit: number; // seconds
  minWordLength: number;
  pointsPerLetter: number;
  requiredScore: number; // to unlock next
  unlocked: boolean;
}

const LEVELS: Level[] = [
  { id: 1, name: 'Foundation', frequency: '174 Hz', color: '#e74c3c', bgGradient: 'from-red-900 to-red-700', words: ['LOVE', 'HOPE', 'HEAL', 'SOUL', 'RISE', 'GRIT', 'BOND', 'CARE', 'GIFT', 'WARM', 'SAFE', 'HOME', 'BOLD', 'TRUE', 'PURE'], timeLimit: 90, minWordLength: 3, pointsPerLetter: 10, requiredScore: 80, unlocked: true },
  { id: 2, name: 'Liberation', frequency: '285 Hz', color: '#e67e22', bgGradient: 'from-orange-900 to-orange-700', words: ['UNITY', 'PEACE', 'GRACE', 'POWER', 'FAITH', 'VOICE', 'DREAM', 'LIGHT', 'BRAVE', 'HONOR', 'PRIDE', 'QUEEN', 'CROWN', 'REIGN', 'BLESS'], timeLimit: 80, minWordLength: 4, pointsPerLetter: 15, requiredScore: 150, unlocked: false },
  { id: 3, name: 'Transformation', frequency: '396 Hz', color: '#f1c40f', bgGradient: 'from-yellow-900 to-yellow-700', words: ['LEGACY', 'SPIRIT', 'WISDOM', 'BRIDGE', 'SELMA', 'GOSPEL', 'SACRED', 'PRAYER', 'PRAISE', 'DIVINE', 'UPLIFT', 'EMERGE', 'THRIVE', 'BEACON', 'IGNITE'], timeLimit: 70, minWordLength: 5, pointsPerLetter: 20, requiredScore: 250, unlocked: false },
  { id: 4, name: 'Harmony', frequency: '432 Hz', color: '#2ecc71', bgGradient: 'from-green-900 to-green-700', words: ['FREEDOM', 'JUSTICE', 'HEALING', 'MIRACLE', 'DESTINY', 'TRIUMPH', 'WARRIOR', 'BLESSED', 'EMPOWER', 'HARMONY', 'COURAGE', 'SHELTER', 'DEVOTED', 'RADIANT', 'PIONEER'], timeLimit: 60, minWordLength: 5, pointsPerLetter: 25, requiredScore: 400, unlocked: false },
  { id: 5, name: 'Love Frequency', frequency: '528 Hz', color: '#3498db', bgGradient: 'from-blue-900 to-blue-700', words: ['COMMUNITY', 'RESILIENT', 'ANCESTRAL', 'BEAUTIFUL', 'SANCTUARY', 'ELEVATION', 'FREQUENCY', 'GRATITUDE', 'ABUNDANCE', 'SOVEREIGN', 'LIBERATOR', 'MATRIARCH', 'PROTECTOR', 'VISIONARY', 'TRAILBLAZE'], timeLimit: 50, minWordLength: 6, pointsPerLetter: 30, requiredScore: 600, unlocked: false },
  { id: 6, name: 'Connection', frequency: '639 Hz', color: '#9b59b6', bgGradient: 'from-purple-900 to-purple-700', words: ['SISTERHOOD', 'COLLECTIVE', 'GENERATION', 'REVOLUTION', 'FOUNDATION', 'COMPASSION', 'REDEMPTION', 'FELLOWSHIP', 'STRENGTHEN', 'ILLUMINATE', 'TRAILBLAZE', 'LEADERSHIP', 'EMPOWERING', 'OVERCOMING', 'UNSHAKABLE'], timeLimit: 45, minWordLength: 7, pointsPerLetter: 40, requiredScore: 800, unlocked: false },
  { id: 7, name: 'Awakening', frequency: '741 Hz', color: '#1abc9c', bgGradient: 'from-teal-900 to-teal-700', words: ['TRANSFORMATION', 'UNAPOLOGETIC', 'EXTRAORDINARY', 'RIGHTEOUSNESS', 'MANIFESTATION', 'DETERMINATION', 'CONSCIOUSNESS', 'TRANSCENDENCE', 'REVOLUTIONARY', 'PERSEVERANCE'], timeLimit: 40, minWordLength: 8, pointsPerLetter: 50, requiredScore: 1000, unlocked: false },
];

const ACHIEVEMENTS = [
  { id: 'first_word', name: 'First Word', description: 'Find your first word', icon: '🌱', condition: (stats: GameStats) => stats.totalWordsFound >= 1 },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Find 5 words in 30 seconds', icon: '⚡', condition: (stats: GameStats) => stats.fastestFiveWords <= 30 },
  { id: 'level_3', name: 'Frequency Climber', description: 'Reach Level 3', icon: '📡', condition: (stats: GameStats) => stats.highestLevel >= 3 },
  { id: 'level_5', name: 'Love Frequency', description: 'Reach Level 5 (528 Hz)', icon: '💜', condition: (stats: GameStats) => stats.highestLevel >= 5 },
  { id: 'level_7', name: 'Fully Awakened', description: 'Complete all 7 levels', icon: '👑', condition: (stats: GameStats) => stats.highestLevel >= 7 },
  { id: 'perfect_round', name: 'Perfect Round', description: 'Find all words in a level', icon: '🏆', condition: (stats: GameStats) => stats.perfectRounds >= 1 },
  { id: 'word_master', name: 'Word Master', description: 'Find 100 total words', icon: '📚', condition: (stats: GameStats) => stats.totalWordsFound >= 100 },
  { id: 'streak_5', name: 'On Fire', description: 'Get a 5-word streak', icon: '🔥', condition: (stats: GameStats) => stats.bestStreak >= 5 },
];

interface GameStats {
  totalWordsFound: number;
  fastestFiveWords: number;
  highestLevel: number;
  perfectRounds: number;
  bestStreak: number;
  totalScore: number;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateGrid(words: string[], size: number): { grid: string[][]; placements: { word: string; cells: [number, number][] }[] } {
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  const placements: { word: string; cells: [number, number][] }[] = [];
  const directions: [number, number][] = [[0, 1], [1, 0], [1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1], [-1, 1]];

  const sortedWords = [...words].sort((a, b) => b.length - a.length);

  for (const word of sortedWords) {
    if (word.length > size) continue;
    let placed = false;
    for (let attempt = 0; attempt < 100 && !placed; attempt++) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const startR = Math.floor(Math.random() * size);
      const startC = Math.floor(Math.random() * size);
      const cells: [number, number][] = [];
      let valid = true;

      for (let i = 0; i < word.length; i++) {
        const r = startR + dir[0] * i;
        const c = startC + dir[1] * i;
        if (r < 0 || r >= size || c < 0 || c >= size) { valid = false; break; }
        if (grid[r][c] !== '' && grid[r][c] !== word[i]) { valid = false; break; }
        cells.push([r, c]);
      }

      if (valid) {
        cells.forEach(([r, c], i) => { grid[r][c] = word[i]; });
        placements.push({ word, cells });
        placed = true;
      }
    }
  }

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') grid[r][c] = letters[Math.floor(Math.random() * 26)];
    }
  }

  return { grid, placements };
}

export default function WordFrequencyGame() {
  const [levels, setLevels] = useState<Level[]>(() => {
    const saved = localStorage.getItem('wf_levels');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return LEVELS.map((l, i) => ({ ...l, unlocked: parsed[i]?.unlocked ?? l.unlocked }));
      } catch { return LEVELS; }
    }
    return LEVELS;
  });

  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [grid, setGrid] = useState<string[][]>([]);
  const [placements, setPlacements] = useState<{ word: string; cells: [number, number][] }[]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showLevelSelect, setShowLevelSelect] = useState(true);
  const [showAchievements, setShowAchievements] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('wf_stats');
    return saved ? JSON.parse(saved) : { totalWordsFound: 0, fastestFiveWords: Infinity, highestLevel: 1, perfectRounds: 0, bestStreak: 0, totalScore: 0 };
  });
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const roundStartRef = useRef<number>(0);
  const wordsThisRoundRef = useRef<number>(0);

  const gridSize = currentLevel !== null ? (currentLevel < 3 ? 8 : currentLevel < 5 ? 10 : 12) : 8;

  useEffect(() => {
    localStorage.setItem('wf_levels', JSON.stringify(levels));
  }, [levels]);

  useEffect(() => {
    localStorage.setItem('wf_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timerRef.current);
    }
    if (timeLeft === 0 && gameActive) {
      endRound();
    }
  }, [gameActive, timeLeft]);

  const playSound = useCallback((type: 'found' | 'wrong' | 'levelup' | 'achievement') => {
    if (!soundOn) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.value = 0.15;
      if (type === 'found') { osc.frequency.value = 528; osc.type = 'sine'; gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3); osc.start(); osc.stop(ctx.currentTime + 0.3); }
      else if (type === 'wrong') { osc.frequency.value = 200; osc.type = 'sawtooth'; gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2); osc.start(); osc.stop(ctx.currentTime + 0.2); }
      else if (type === 'levelup') { osc.frequency.value = 432; osc.type = 'sine'; setTimeout(() => { const o2 = ctx.createOscillator(); o2.connect(gain); o2.frequency.value = 528; o2.type = 'sine'; o2.start(); o2.stop(ctx.currentTime + 0.6); }, 200); osc.start(); osc.stop(ctx.currentTime + 0.3); }
      else if (type === 'achievement') { osc.frequency.value = 639; osc.type = 'triangle'; gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5); osc.start(); osc.stop(ctx.currentTime + 0.5); }
    } catch {}
  }, [soundOn]);

  const startLevel = (levelId: number) => {
    const level = levels[levelId];
    if (!level || !level.unlocked) return;
    const selectedWords = shuffleArray(level.words).slice(0, Math.min(8, level.words.length));
    const size = levelId < 3 ? 8 : levelId < 5 ? 10 : 12;
    const { grid: newGrid, placements: newPlacements } = generateGrid(selectedWords, size);
    setGrid(newGrid);
    setPlacements(newPlacements);
    setFoundWords(new Set());
    setSelectedCells([]);
    setHighlightedCells(new Set());
    setScore(0);
    setTimeLeft(level.timeLimit);
    setStreak(0);
    setCurrentLevel(levelId);
    setGameActive(true);
    setShowLevelSelect(false);
    roundStartRef.current = Date.now();
    wordsThisRoundRef.current = 0;
  };

  const endRound = () => {
    setGameActive(false);
    clearInterval(timerRef.current);
    const level = levels[currentLevel!];
    const isPerfect = foundWords.size === placements.length;

    const newStats = { ...stats, totalScore: stats.totalScore + score };
    if (isPerfect) newStats.perfectRounds++;
    if (streak > newStats.bestStreak) newStats.bestStreak = streak;

    // Unlock next level
    if (score >= level.requiredScore && currentLevel! < levels.length - 1) {
      const newLevels = [...levels];
      newLevels[currentLevel! + 1] = { ...newLevels[currentLevel! + 1], unlocked: true };
      setLevels(newLevels);
      newStats.highestLevel = Math.max(newStats.highestLevel, currentLevel! + 2);
      playSound('levelup');
      toast.success(`Level ${currentLevel! + 2} Unlocked! 🎉`);
    }

    setStats(newStats);

    // Check achievements
    ACHIEVEMENTS.forEach(a => {
      const earned = localStorage.getItem(`wf_ach_${a.id}`);
      if (!earned && a.condition(newStats)) {
        localStorage.setItem(`wf_ach_${a.id}`, 'true');
        playSound('achievement');
        toast.success(`Achievement Unlocked: ${a.icon} ${a.name}`);
      }
    });
  };

  const cellKey = (r: number, c: number) => `${r},${c}`;

  const handleCellDown = (r: number, c: number) => {
    if (!gameActive) return;
    setIsSelecting(true);
    setSelectedCells([[r, c]]);
  };

  const handleCellEnter = (r: number, c: number) => {
    if (!isSelecting || !gameActive) return;
    const last = selectedCells[selectedCells.length - 1];
    if (!last) return;
    const alreadySelected = selectedCells.some(([sr, sc]) => sr === r && sc === c);
    if (alreadySelected) return;
    // Only allow adjacent cells
    const dr = Math.abs(r - last[0]);
    const dc = Math.abs(c - last[1]);
    if (dr <= 1 && dc <= 1) {
      setSelectedCells([...selectedCells, [r, c]]);
    }
  };

  const handleCellUp = () => {
    if (!isSelecting || !gameActive) return;
    setIsSelecting(false);
    const selectedWord = selectedCells.map(([r, c]) => grid[r][c]).join('');

    const match = placements.find(p => p.word === selectedWord && !foundWords.has(p.word));
    if (match) {
      const newFound = new Set(foundWords);
      newFound.add(match.word);
      setFoundWords(newFound);
      const level = levels[currentLevel!];
      const points = selectedWord.length * level.pointsPerLetter * (1 + streak * 0.1);
      setScore(s => s + Math.round(points));
      setStreak(s => s + 1);
      wordsThisRoundRef.current++;

      // Track time for 5 words
      if (wordsThisRoundRef.current === 5) {
        const elapsed = (Date.now() - roundStartRef.current) / 1000;
        if (elapsed < stats.fastestFiveWords) {
          setStats(s => ({ ...s, fastestFiveWords: elapsed }));
        }
      }

      setStats(s => ({ ...s, totalWordsFound: s.totalWordsFound + 1 }));

      // Highlight found cells
      const newHighlighted = new Set(highlightedCells);
      match.cells.forEach(([r, c]) => newHighlighted.add(cellKey(r, c)));
      setHighlightedCells(newHighlighted);

      playSound('found');

      if (newFound.size === placements.length) {
        toast.success('All words found! 🎉');
        setTimeout(endRound, 500);
      }
    } else {
      setStreak(0);
      if (selectedWord.length >= 3) playSound('wrong');
    }
    setSelectedCells([]);
  };

  if (showAchievements) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setShowAchievements(false)} className="flex items-center gap-2 text-yellow-400 mb-6 hover:text-yellow-300" aria-label="Back to game">
            <ArrowLeft size={20} /> Back
          </button>
          <h1 className="text-3xl font-bold text-yellow-400 mb-6 flex items-center gap-3"><Award size={32} /> Achievements</h1>
          <div className="grid gap-3">
            {ACHIEVEMENTS.map(a => {
              const earned = localStorage.getItem(`wf_ach_${a.id}`);
              return (
                <div key={a.id} className={`p-4 rounded-lg border ${earned ? 'bg-yellow-900/30 border-yellow-600' : 'bg-gray-800/50 border-gray-700 opacity-60'}`} role="listitem" aria-label={`${a.name}: ${a.description}${earned ? ' - Earned' : ' - Locked'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{a.icon}</span>
                    <div>
                      <p className="font-bold">{a.name}</p>
                      <p className="text-sm text-gray-400">{a.description}</p>
                    </div>
                    {earned && <Star className="ml-auto text-yellow-400" size={20} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (showLevelSelect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300">
              <ArrowLeft size={20} /> Home
            </Link>
            <div className="flex gap-3">
              <button onClick={() => setShowAchievements(true)} className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300" aria-label="View achievements">
                <Award size={18} /> Achievements
              </button>
              <button onClick={() => setSoundOn(!soundOn)} className="text-gray-400 hover:text-white" aria-label={soundOn ? 'Mute sounds' : 'Unmute sounds'}>
                {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-2">Word Frequency</h1>
            <p className="text-gray-400">Find hidden words of empowerment at every frequency level</p>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <span className="text-yellow-400"><Trophy size={14} className="inline mr-1" />{stats.totalScore} pts</span>
              <span className="text-blue-400"><Target size={14} className="inline mr-1" />{stats.totalWordsFound} words</span>
              <span className="text-green-400"><Zap size={14} className="inline mr-1" />Level {stats.highestLevel}</span>
            </div>
          </div>

          <div className="grid gap-3" role="list" aria-label="Game levels">
            {levels.map((level, i) => (
              <button
                key={level.id}
                onClick={() => level.unlocked && startLevel(i)}
                disabled={!level.unlocked}
                className={`p-4 rounded-xl border text-left transition-all ${level.unlocked ? `bg-gradient-to-r ${level.bgGradient} border-white/20 hover:scale-[1.02] hover:border-white/40 cursor-pointer` : 'bg-gray-800/50 border-gray-700 cursor-not-allowed'}`}
                role="listitem"
                aria-label={`Level ${level.id}: ${level.name} - ${level.frequency}${level.unlocked ? '' : ' - Locked'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {level.unlocked ? <Zap size={20} style={{ color: level.color }} /> : <Lock size={20} className="text-gray-500" />}
                    <div>
                      <p className="font-bold text-lg">{level.name}</p>
                      <p className="text-sm opacity-70">{level.frequency} • {level.timeLimit}s • {level.pointsPerLetter}pts/letter</p>
                    </div>
                  </div>
                  {level.unlocked ? <ChevronRight size={20} /> : <Lock size={16} className="text-gray-500" />}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link href="/solbones" className="text-yellow-400 hover:text-yellow-300 text-sm">
              Play Solbones →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const level = currentLevel !== null ? levels[currentLevel] : null;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${level?.bgGradient || 'from-gray-900 to-gray-800'} text-white p-2 sm:p-4`}>
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => { setGameActive(false); clearInterval(timerRef.current); setShowLevelSelect(true); }} className="text-yellow-400 hover:text-yellow-300" aria-label="Back to levels">
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <p className="text-xs opacity-70">{level?.name} • {level?.frequency}</p>
            <p className="font-bold text-yellow-400">{score} pts</p>
          </div>
          <div className="flex items-center gap-2">
            {streak > 1 && <span className="text-orange-400 text-sm font-bold">🔥{streak}x</span>}
            <button onClick={() => setSoundOn(!soundOn)} className="text-gray-400" aria-label={soundOn ? 'Mute' : 'Unmute'}>
              {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>

        {/* Timer */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>{foundWords.size}/{placements.length} words</span>
            <span className={timeLeft <= 10 ? 'text-red-400 font-bold animate-pulse' : ''}>{timeLeft}s</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000" style={{ width: `${level ? (timeLeft / level.timeLimit) * 100 : 0}%` }} />
          </div>
        </div>

        {/* Grid */}
        <div
          className="select-none touch-none mb-4"
          onMouseUp={handleCellUp}
          onTouchEnd={handleCellUp}
          role="grid"
          aria-label="Word search grid"
        >
          <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
            {grid.map((row, r) =>
              row.map((letter, c) => {
                const isSelected = selectedCells.some(([sr, sc]) => sr === r && sc === c);
                const isFound = highlightedCells.has(cellKey(r, c));
                return (
                  <div
                    key={cellKey(r, c)}
                    className={`aspect-square flex items-center justify-center font-bold text-sm sm:text-base rounded cursor-pointer transition-colors ${isSelected ? 'bg-yellow-500 text-black scale-110' : isFound ? 'bg-green-600/60 text-white' : 'bg-white/10 hover:bg-white/20'}`}
                    onMouseDown={() => handleCellDown(r, c)}
                    onMouseEnter={() => handleCellEnter(r, c)}
                    onTouchStart={() => handleCellDown(r, c)}
                    onTouchMove={(e) => {
                      const touch = e.touches[0];
                      const el = document.elementFromPoint(touch.clientX, touch.clientY);
                      if (el) {
                        const row = el.getAttribute('data-row');
                        const col = el.getAttribute('data-col');
                        if (row && col) handleCellEnter(parseInt(row), parseInt(col));
                      }
                    }}
                    data-row={r}
                    data-col={c}
                    role="gridcell"
                    aria-label={`${letter}${isFound ? ' (found)' : ''}`}
                  >
                    {letter}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Word List */}
        <div className="flex flex-wrap gap-2 mb-4" role="list" aria-label="Words to find">
          {placements.map(p => (
            <span key={p.word} className={`px-2 py-1 rounded text-xs font-mono ${foundWords.has(p.word) ? 'bg-green-600/40 line-through opacity-60' : 'bg-white/10'}`} role="listitem">
              {foundWords.has(p.word) ? p.word : p.word.replace(/./g, '_')}
            </span>
          ))}
        </div>

        {/* Game Over */}
        {!gameActive && currentLevel !== null && (
          <div className="bg-black/60 backdrop-blur rounded-xl p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">{score >= (level?.requiredScore || 0) ? '🎉 Level Complete!' : '⏰ Time\'s Up!'}</h2>
            <p className="text-yellow-400 text-xl mb-1">{score} points</p>
            <p className="text-sm text-gray-400 mb-4">{foundWords.size}/{placements.length} words found</p>
            {score >= (level?.requiredScore || 0) && currentLevel < levels.length - 1 && (
              <p className="text-green-400 mb-4">Next level unlocked! 🔓</p>
            )}
            <div className="flex gap-3 justify-center">
              <button onClick={() => startLevel(currentLevel)} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg flex items-center gap-2" aria-label="Replay level">
                <RotateCcw size={16} /> Replay
              </button>
              {score >= (level?.requiredScore || 0) && currentLevel < levels.length - 1 && (
                <button onClick={() => startLevel(currentLevel + 1)} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg flex items-center gap-2" aria-label="Next level">
                  Next Level <ChevronRight size={16} />
                </button>
              )}
              <button onClick={() => setShowLevelSelect(true)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg" aria-label="Back to level select">
                Levels
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
