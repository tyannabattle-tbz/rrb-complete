/**
 * Avatar Panel Podcast — The Tournament Talk Show
 * 
 * A podcast room where avatars gather before and after contests.
 * Integrated with the Avatar Arena and RRB Radio for Ty OS tournaments.
 * Players can join the podcast pre-contest for strategy and hype,
 * and post-contest for recaps, highlights, and community interaction.
 * 
 * Features: Avatar panel, tournament brackets, call-in, game screen,
 * live participants, AI hosts, Zoom streaming, radio simulcast
 * 
 * Canryn Production LLC — Powered by QUMUS
 */
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  ArrowLeft, Trophy, Gamepad2, Users, Radio, Mic, Video,
  Swords, Crown, Star, Zap, Timer, Play, Pause, Volume2,
  MessageSquare, Phone, Share2, Eye, Heart, ChevronRight,
  Dice5, Music, Shield, Target, Award
} from 'lucide-react';
import PodcastRoom from '@/components/PodcastRoom';
import type { PodcastShowConfig } from '@/components/PodcastRoom';

// ─── Tournament Status Types ───
interface TournamentInfo {
  id: string;
  name: string;
  game: string;
  status: 'upcoming' | 'pre-show' | 'live' | 'post-show' | 'completed';
  players: number;
  maxPlayers: number;
  prize: string;
  startTime: string;
  currentRound?: number;
  totalRounds?: number;
}

// ─── Avatar Panel Podcast Config ───
const AVATAR_PANEL_CONFIG: PodcastShowConfig = {
  id: 'avatar-panel-podcast',
  title: 'Avatar Panel',
  subtitle: 'The Tournament Talk Show — Powered by Ty OS',
  description: 'The official pre-game and post-game show for all Canryn Production tournaments. Avatars gather here to strategize, trash-talk, recap victories, and break down the plays. From Solbones sacred math showdowns to Rhythm Roots beat battles — this is where champions are made and legends are born. Simulcast live on RRB Radio.',
  host: {
    name: 'TBZ-OS',
    persona: 'valanna',
    role: 'Tournament Director & Host',
    bio: 'Ty Bat Zan Operating System — the autonomous tournament orchestrator. TBZ-OS manages brackets, seeds players, calls plays, and keeps the energy high. Powered by QUMUS with full arena control.',
  },
  coHosts: [
    { name: 'Valanna', persona: 'valanna', role: 'Lead Commentator & AI Strategist' },
    { name: 'Seraph', persona: 'seraph', role: 'Stats Analyst & Play-by-Play' },
    { name: 'Candy AI', persona: 'candy', role: 'Community Host & Fan Engagement' },
  ],
  theme: {
    primary: '#f59e0b',
    secondary: '#d97706',
    accent: '#fbbf24',
    gradient: 'linear-gradient(135deg, #78350f 0%, #f59e0b 50%, #fde68a 100%)',
  },
  features: {
    callIn: true,
    gameScreen: true,
    guestAi: true,
    liveParticipants: true,
    healingFrequencies: false,
    solbonesGame: true,
  },
  schedule: {
    day: 'Daily during tournaments',
    time: 'Pre & Post Contest',
    timezone: 'CT',
    frequency: 'Event-driven',
  },
  socialLinks: {
    youtube: 'https://youtube.com/@rockinrockinboogie',
  },
  zoomRoomUrl: import.meta.env.VITE_ZOOM_URL || undefined,
  streamingUrl: 'https://studio.restream.io/enk-osex-pju',
};

// ─── Active Tournaments ───
const ACTIVE_TOURNAMENTS: TournamentInfo[] = [
  {
    id: 'solbones-championship',
    name: 'Solbones Sacred Math Championship',
    game: 'Solbones 4+3+2',
    status: 'pre-show',
    players: 16,
    maxPlayers: 32,
    prize: 'Champion Crown + 10,000 QUMUS Points',
    startTime: '2026-03-17T19:00:00Z',
    currentRound: 0,
    totalRounds: 5,
  },
  {
    id: 'rhythm-roots-battle',
    name: 'Rhythm Roots Beat Battle Royale',
    game: 'Rhythm Roots',
    status: 'upcoming',
    players: 8,
    maxPlayers: 16,
    prize: 'Beat Master Title + RRB Radio Feature',
    startTime: '2026-03-18T20:00:00Z',
    currentRound: 0,
    totalRounds: 4,
  },
  {
    id: 'frequency-match-sprint',
    name: 'Frequency Match Speed Sprint',
    game: 'Frequency Match',
    status: 'upcoming',
    players: 24,
    maxPlayers: 64,
    prize: 'Frequency Master Badge + Podcast Guest Spot',
    startTime: '2026-03-19T18:00:00Z',
    currentRound: 0,
    totalRounds: 6,
  },
  {
    id: 'word-frequency-scholars',
    name: 'Word Frequency Scholars Cup',
    game: 'Word Frequency',
    status: 'upcoming',
    players: 12,
    maxPlayers: 32,
    prize: 'Scholar Crown + SQUADD Shoutout',
    startTime: '2026-03-20T19:00:00Z',
    currentRound: 0,
    totalRounds: 7,
  },
];

// ─── Avatar Panel Wrapper ───
export default function AvatarPanelPodcast() {
  const [, navigate] = useLocation();
  const [showTournaments, setShowTournaments] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<TournamentInfo | null>(null);
  const [isSimulcasting, setIsSimulcasting] = useState(true);

  const getStatusColor = (status: TournamentInfo['status']) => {
    switch (status) {
      case 'pre-show': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'live': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'post-show': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'upcoming': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/50';
    }
  };

  const getStatusLabel = (status: TournamentInfo['status']) => {
    switch (status) {
      case 'pre-show': return 'PRE-SHOW LIVE';
      case 'live': return 'TOURNAMENT LIVE';
      case 'post-show': return 'POST-GAME SHOW';
      case 'upcoming': return 'UPCOMING';
      case 'completed': return 'COMPLETED';
    }
  };

  const getGameIcon = (game: string) => {
    if (game.includes('Solbones')) return <Dice5 className="w-4 h-4" />;
    if (game.includes('Rhythm')) return <Music className="w-4 h-4" />;
    if (game.includes('Frequency Match')) return <Target className="w-4 h-4" />;
    if (game.includes('Word')) return <Star className="w-4 h-4" />;
    return <Gamepad2 className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-amber-950/20 to-gray-950">
      {/* Tournament Overlay Panel */}
      {showTournaments && (
        <div className="bg-gradient-to-r from-amber-900/40 via-orange-900/30 to-amber-900/40 border-b border-amber-500/30">
          <div className="max-w-7xl mx-auto px-4 py-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-amber-300">Ty OS Tournament Hub</h2>
                  <p className="text-[10px] text-amber-400/60">Avatar Arena — Join before & after contests</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isSimulcasting && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-[10px] animate-pulse">
                    <Radio className="w-3 h-3 mr-1" /> SIMULCAST ON RRB RADIO
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowTournaments(false)}
                  className="text-amber-400/60 hover:text-amber-300 text-xs h-7"
                >
                  Minimize
                </Button>
              </div>
            </div>

            {/* Tournament Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {ACTIVE_TOURNAMENTS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTournament(t)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    selectedTournament?.id === t.id
                      ? 'border-amber-400 bg-amber-500/10'
                      : 'border-amber-500/20 bg-black/20 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      {getGameIcon(t.game)}
                      <span className="text-[11px] font-semibold text-white truncate">{t.name}</span>
                    </div>
                    <Badge className={`${getStatusColor(t.status)} text-[8px] px-1.5 py-0`}>
                      {getStatusLabel(t.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {t.players}/{t.maxPlayers}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-400" /> {t.prize.split('+')[0]}
                    </span>
                  </div>
                  {t.status === 'pre-show' && (
                    <div className="mt-2 flex gap-1">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/games');
                          toast.success('Joining tournament lobby...');
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-black text-[10px] h-6 px-2 flex-1"
                      >
                        <Swords className="w-3 h-3 mr-1" /> Enter Arena
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info('Call-in queue joined — you\'re #3');
                        }}
                        className="border-amber-500/50 text-amber-400 text-[10px] h-6 px-2"
                      >
                        <Phone className="w-3 h-3 mr-1" /> Call In
                      </Button>
                    </div>
                  )}
                  {t.status === 'upcoming' && (
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.success(`Registered for ${t.name}!`);
                        }}
                        className="border-amber-500/50 text-amber-400 text-[10px] h-6 px-2 w-full"
                      >
                        <Shield className="w-3 h-3 mr-1" /> Register ({t.players}/{t.maxPlayers})
                      </Button>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-amber-500/20">
              <Button
                size="sm"
                onClick={() => navigate('/games')}
                className="bg-amber-600 hover:bg-amber-700 text-[10px] h-7"
              >
                <Gamepad2 className="w-3 h-3 mr-1" /> Avatar Arena
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/solbones')}
                className="bg-emerald-600 hover:bg-emerald-700 text-[10px] h-7"
              >
                <Dice5 className="w-3 h-3 mr-1" /> Solbones
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/radio')}
                className="border-purple-500/50 text-purple-400 text-[10px] h-7"
              >
                <Radio className="w-3 h-3 mr-1" /> RRB Radio
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/conference')}
                className="border-blue-500/50 text-blue-400 text-[10px] h-7"
              >
                <Video className="w-3 h-3 mr-1" /> Conference Hub
              </Button>
              <div className="ml-auto flex items-center gap-1 text-[10px] text-gray-500">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>QUMUS Orchestrated</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Minimized Tournament Bar */}
      {!showTournaments && (
        <button
          type="button"
          onClick={() => setShowTournaments(true)}
          className="w-full bg-amber-900/30 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between hover:bg-amber-900/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-300 font-semibold">Ty OS Tournament Hub</span>
            <Badge className="bg-amber-500/20 text-amber-400 text-[9px]">
              {ACTIVE_TOURNAMENTS.filter(t => t.status === 'pre-show' || t.status === 'live').length} Active
            </Badge>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-400/60 rotate-90" />
        </button>
      )}

      {/* Podcast Room */}
      <PodcastRoom
        config={AVATAR_PANEL_CONFIG}
        onBack={() => navigate('/podcasts')}
      />
    </div>
  );
}
