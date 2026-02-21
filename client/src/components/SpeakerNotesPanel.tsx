import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';

interface SpeakerNote {
  id: string;
  title: string;
  content: string;
  duration: number; // in seconds
  order: number;
}

interface SpeakerNotesPanelProps {
  notes: SpeakerNote[];
  onNotesUpdate?: (notes: SpeakerNote[]) => void;
  isLive?: boolean;
}

export const SpeakerNotesPanel: React.FC<SpeakerNotesPanelProps> = ({
  notes,
  onNotesUpdate,
  isLive = false,
}) => {
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showTeleprompter, setShowTeleprompter] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const teleprompterRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  const currentNote = notes[currentNoteIndex];
  const totalDuration = currentNote?.duration || 0;
  const progress = totalDuration > 0 ? (elapsedTime / totalDuration) * 100 : 0;

  // Timer effect
  useEffect(() => {
    if (isPlaying && currentNote) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => {
          if (prev >= totalDuration) {
            // Move to next note
            if (currentNoteIndex < notes.length - 1) {
              setCurrentNoteIndex(prev => prev + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return prev;
            }
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentNoteIndex, totalDuration, notes.length]);

  // Auto-scroll teleprompter
  useEffect(() => {
    if (showTeleprompter && teleprompterRef.current && isPlaying) {
      const scrollAmount = scrollSpeed * 0.5;
      teleprompterRef.current.scrollTop += scrollAmount;
    }
  }, [elapsedTime, showTeleprompter, scrollSpeed, isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setElapsedTime(0);
    setIsPlaying(false);
  };

  const handleNextNote = () => {
    if (currentNoteIndex < notes.length - 1) {
      setCurrentNoteIndex(prev => prev + 1);
      setElapsedTime(0);
    }
  };

  const handlePreviousNote = () => {
    if (currentNoteIndex > 0) {
      setCurrentNoteIndex(prev => prev - 1);
      setElapsedTime(0);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentNote) {
    return (
      <Card className="p-6 bg-slate-50">
        <p className="text-slate-500">No speaker notes available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Teleprompter View */}
      {showTeleprompter && (
        <div
          ref={teleprompterRef}
          className="bg-black text-white p-8 rounded-lg h-96 overflow-y-auto text-4xl leading-relaxed font-light"
          style={{
            scrollBehavior: 'smooth',
          }}
        >
          <div className="text-center">
            <h2 className="text-5xl font-bold mb-8">{currentNote.title}</h2>
            <p className="whitespace-pre-wrap">{currentNote.content}</p>
          </div>
        </div>
      )}

      {/* Speaker Notes Card */}
      <Card className="p-6 bg-white border-2 border-orange-200">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Note {currentNoteIndex + 1} of {notes.length}
              </h3>
              <p className="text-sm text-slate-600">{currentNote.title}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTeleprompter(!showTeleprompter)}
              className="gap-2"
            >
              {showTeleprompter ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Show
                </>
              )}
            </Button>
          </div>

          {/* Timer and Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-mono text-orange-600 font-bold">
                {formatTime(elapsedTime)}
              </span>
              <span className="text-slate-600">/ {formatTime(totalDuration)}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-orange-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Content Preview */}
          <Textarea
            value={currentNote.content}
            readOnly
            className="h-32 bg-slate-50 text-slate-700 resize-none"
            placeholder="Speaker notes will appear here"
          />

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePlayPause}
              variant={isPlaying ? 'destructive' : 'default'}
              size="sm"
              className="gap-2"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Play
                </>
              )}
            </Button>

            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>

            <Button
              onClick={handlePreviousNote}
              variant="outline"
              size="sm"
              disabled={currentNoteIndex === 0}
              className="gap-2"
            >
              <ChevronUp className="w-4 h-4" />
              Prev
            </Button>

            <Button
              onClick={handleNextNote}
              variant="outline"
              size="sm"
              disabled={currentNoteIndex === notes.length - 1}
              className="gap-2"
            >
              <ChevronDown className="w-4 h-4" />
              Next
            </Button>

            {/* Scroll Speed Control */}
            <div className="ml-auto flex items-center gap-2">
              <label className="text-xs text-slate-600">Scroll Speed:</label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.5"
                value={scrollSpeed}
                onChange={e => setScrollSpeed(parseFloat(e.target.value))}
                className="w-20"
              />
              <span className="text-xs text-slate-600 w-8">{scrollSpeed.toFixed(1)}x</span>
            </div>
          </div>

          {/* Live Status */}
          {isLive && (
            <div className="bg-red-50 border border-red-200 rounded p-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-red-700">LIVE</span>
            </div>
          )}
        </div>
      </Card>

      {/* Notes Navigation */}
      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
        {notes.map((note, idx) => (
          <button
            key={note.id}
            onClick={() => {
              setCurrentNoteIndex(idx);
              setElapsedTime(0);
            }}
            className={`p-2 rounded text-left text-sm transition-colors ${
              idx === currentNoteIndex
                ? 'bg-orange-500 text-white font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <div className="font-semibold">{note.title}</div>
            <div className="text-xs opacity-75">{formatTime(note.duration)}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpeakerNotesPanel;
