import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, Gamepad2, MessageCircle, Zap } from 'lucide-react';

interface PodcastEpisode {
  episodeId: string;
  title: string;
  description: string;
  audioUrl: string;
  videoUrl?: string;
  duration: number;
  transcript: string;
  aiAssistant: 'seraph' | 'candy' | 'none';
  gameEnabled: boolean;
  callInEnabled: boolean;
}

export function InteractivePodcastPlayer() {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [showGameScreen, setShowGameScreen] = useState(false);
  const [showCallIn, setShowCallIn] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Interactive Podcast Player</h1>
        <p className="text-lg text-muted-foreground">
          Watch, play games, call in, and interact with AI personalities
        </p>
      </div>

      {selectedEpisode ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Player */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video/Audio Player */}
            <Card className="bg-black">
              <CardContent className="p-0">
                {selectedEpisode.videoUrl ? (
                  <video
                    src={selectedEpisode.videoUrl}
                    className="w-full aspect-video bg-black rounded-lg"
                    controls
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                ) : (
                  <div className="w-full aspect-video bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <Zap className="w-16 h-16 mx-auto mb-4" />
                      <p className="text-xl font-semibold">{selectedEpisode.title}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Player Controls */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(selectedEpisode.duration)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(currentTime / selectedEpisode.duration) * 100}%`
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-24"
                    />
                  </div>
                </div>

                {/* Episode Info */}
                <div className="space-y-2">
                  <h2 className="text-xl font-bold">{selectedEpisode.title}</h2>
                  <p className="text-sm text-muted-foreground">{selectedEpisode.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {selectedEpisode.gameEnabled && (
                <Button
                  onClick={() => setShowGameScreen(!showGameScreen)}
                  className="w-full"
                  variant={showGameScreen ? 'default' : 'outline'}
                >
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Game Screen
                </Button>
              )}

              {selectedEpisode.callInEnabled && (
                <Button
                  onClick={() => setShowCallIn(!showCallIn)}
                  className="w-full"
                  variant={showCallIn ? 'default' : 'outline'}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Call In
                </Button>
              )}

              {selectedEpisode.aiAssistant !== 'none' && (
                <Button
                  onClick={() => setShowAIAssistant(!showAIAssistant)}
                  className="w-full"
                  variant={showAIAssistant ? 'default' : 'outline'}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {selectedEpisode.aiAssistant === 'seraph' ? 'Seraph AI' : 'Candy AI'}
                </Button>
              )}
            </div>

            {/* Game Screen */}
            {showGameScreen && (
              <Card>
                <CardHeader>
                  <CardTitle>Interactive Game</CardTitle>
                  <CardDescription>Test your knowledge about this episode</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="font-semibold">Question 1: What was the main topic?</p>
                    <div className="space-y-2">
                      {['Option A', 'Option B', 'Option C', 'Option D'].map((option) => (
                        <Button key={option} variant="outline" className="w-full justify-start">
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Call In */}
            {showCallIn && (
              <Card>
                <CardHeader>
                  <CardTitle>Call In Live</CardTitle>
                  <CardDescription>Join the conversation with the host</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <textarea
                    placeholder="Your question or comment"
                    className="w-full px-3 py-2 border rounded-lg h-24"
                  />
                  <Button className="w-full">Join Call Queue</Button>
                </CardContent>
              </Card>
            )}

            {/* AI Assistant */}
            {showAIAssistant && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedEpisode.aiAssistant === 'seraph' ? 'Seraph Wisdom' : 'Candy Fun'}
                  </CardTitle>
                  <CardDescription>AI-powered insights about this episode</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p>
                      {selectedEpisode.aiAssistant === 'seraph'
                        ? 'Seraph is analyzing this episode with wisdom and compassion...'
                        : 'Candy is generating fun facts and trivia about this episode...'}
                    </p>
                  </div>
                  <input
                    type="text"
                    placeholder="Ask a question..."
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Transcript */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transcript</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground max-h-96 overflow-y-auto">
                  {selectedEpisode.transcript.substring(0, 500)}...
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedEpisode.gameEnabled && (
                  <Badge variant="secondary">Game Screen</Badge>
                )}
                {selectedEpisode.callInEnabled && (
                  <Badge variant="secondary">Call In</Badge>
                )}
                {selectedEpisode.aiAssistant !== 'none' && (
                  <Badge variant="secondary">
                    {selectedEpisode.aiAssistant === 'seraph' ? 'Seraph AI' : 'Candy AI'}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Select an episode to start playing</p>
          </CardContent>
        </Card>
      )}

      {/* Back Button */}
      {selectedEpisode && (
        <Button variant="outline" onClick={() => setSelectedEpisode(null)}>
          Back to Episodes
        </Button>
      )}
    </div>
  );
}
