import { useState, useMemo } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Zap,
  MessageCircle,
  Clock,
  ChevronDown,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

interface ReplayEvent {
  id: string;
  timestamp: Date;
  type: "message" | "tool" | "task" | "status";
  content: string;
  details?: Record<string, unknown>;
}

interface SessionReplayProps {
  sessionId: number;
  events?: ReplayEvent[];
}

export default function SessionReplay({
  sessionId,
  events: providedEvents,
}: SessionReplayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  // Mock events - replace with real data from API
  const mockEvents: ReplayEvent[] = [
    {
      id: "1",
      timestamp: new Date(Date.now() - 300000),
      type: "message",
      content: "User: What is the weather today?",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 280000),
      type: "status",
      content: "Agent: Thinking...",
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 260000),
      type: "tool",
      content: "Tool: Web Search - Searching weather data",
      details: { tool: "Web Search", duration: 2.5 },
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 240000),
      type: "message",
      content: "Agent: The weather today is sunny with a high of 72°F",
    },
    {
      id: "5",
      timestamp: new Date(Date.now() - 200000),
      type: "task",
      content: "Task: Weather query completed successfully",
      details: { status: "completed", duration: 100 },
    },
  ];

  const events = providedEvents || mockEvents;
  const currentEvent = events[currentEventIndex];

  // Auto-play functionality
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentEventIndex < events.length - 1) {
      setCurrentEventIndex(currentEventIndex + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrevious = () => {
    if (currentEventIndex > 0) {
      setCurrentEventIndex(currentEventIndex - 1);
    }
  };

  const handleSeek = (index: number) => {
    setCurrentEventIndex(Math.min(index, events.length - 1));
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageCircle size={16} className="text-blue-500" />;
      case "tool":
        return <Zap size={16} className="text-yellow-500" />;
      case "task":
        return <CheckCircle size={16} className="text-green-500" />;
      case "status":
        return <Clock size={16} className="text-gray-500" />;
      default:
        return <MessageCircle size={16} />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "message":
        return "bg-blue-50 border-blue-200";
      case "tool":
        return "bg-yellow-50 border-yellow-200";
      case "task":
        return "bg-green-50 border-green-200";
      case "status":
        return "bg-gray-50 border-gray-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  const progressPercent = (currentEventIndex / (events.length - 1)) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Session Replay</h2>
        <p className="text-sm text-muted-foreground">
          Session {sessionId} - {events.length} events
        </p>
      </div>

      {/* Current Event Display */}
      {currentEvent && (
        <Card className={`p-6 border-2 ${getEventColor(currentEvent.type)}`}>
          <div className="flex items-start gap-4">
            <div className="mt-1">{getEventIcon(currentEvent.type)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="capitalize">
                  {currentEvent.type}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatTime(currentEvent.timestamp)}
                </span>
              </div>
              <p className="text-lg font-semibold">{currentEvent.content}</p>
              {currentEvent.details && (
                <div className="mt-3 text-sm text-muted-foreground">
                  {Object.entries(currentEvent.details).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium">{key}:</span> {String(value)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Playback Controls */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Event {currentEventIndex + 1} of {events.length}
              </span>
              <span className="text-muted-foreground">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <Slider
              value={[currentEventIndex]}
              onValueChange={(value) => handleSeek(value[0])}
              max={events.length - 1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentEventIndex === 0}
            >
              <SkipBack size={16} />
            </Button>

            <Button
              size="sm"
              onClick={handlePlayPause}
              className="min-w-32"
            >
              {isPlaying ? (
                <>
                  <Pause size={16} className="mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play size={16} className="mr-2" />
                  Play
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentEventIndex === events.length - 1}
            >
              <SkipForward size={16} />
            </Button>

            {/* Speed Control */}
            <div className="ml-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Speed:</span>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="px-2 py-1 text-sm border rounded bg-background"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Timeline</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {events.map((event, idx) => (
            <div key={event.id}>
              <button
                onClick={() => {
                  handleSeek(idx);
                  setExpandedEvent(
                    expandedEvent === event.id ? null : event.id
                  );
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  idx === currentEventIndex
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-muted/50 border-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  {getEventIcon(event.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {event.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(event.timestamp)}
                    </p>
                  </div>
                  {expandedEvent === event.id && (
                    <ChevronDown size={16} className="flex-shrink-0" />
                  )}
                </div>
              </button>

              {expandedEvent === event.id && event.details && (
                <div className="ml-9 mt-2 p-2 bg-muted/30 rounded text-sm space-y-1">
                  {Object.entries(event.details).map(([key, value]) => (
                    <div key={key} className="text-muted-foreground">
                      <span className="font-medium">{key}:</span> {String(value)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Total Duration</p>
          <p className="text-2xl font-bold">
            {(
              (new Date(events[events.length - 1]?.timestamp).getTime() -
                new Date(events[0]?.timestamp).getTime()) /
              1000
            ).toFixed(1)}
            s
          </p>
        </Card>

        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Tool Executions</p>
          <p className="text-2xl font-bold">
            {events.filter((e) => e.type === "tool").length}
          </p>
        </Card>

        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Messages</p>
          <p className="text-2xl font-bold">
            {events.filter((e) => e.type === "message").length}
          </p>
        </Card>
      </div>
    </div>
  );
}


