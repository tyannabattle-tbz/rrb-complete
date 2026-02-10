"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/_core/hooks/useAuth';
import { Link } from 'wouter';
import { Wifi, WifiOff, Users, Copy, Crown, Bot, Sparkles, ArrowLeft, Globe, Zap, Shield, Clock, CheckCircle, XCircle, Loader2, Swords, Trophy, Dice1 } from 'lucide-react';

// Room states
type RoomState = 'lobby' | 'countdown' | 'playing' | 'finished';
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

interface OnlinePlayer {
  id: string;
  name: string;
  isAI: boolean;
  isHost: boolean;
  isReady: boolean;
  score: number;
  color: string;
}

interface RoomInfo {
  code: string;
  host: string;
  players: OnlinePlayer[];
  maxPlayers: number;
  gameMode: string;
  state: RoomState;
  createdAt: number;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  isSystem: boolean;
}

// Player colors for online
const ONLINE_COLORS = [
  '#a855f7', '#06b6d4', '#f59e0b', '#22c55e', '#ef4444',
  '#3b82f6', '#ec4899', '#6366f1', '#eab308',
];

export default function SolbonesOnline() {
  const { user } = useAuth();
  const [view, setView] = useState<'menu' | 'create' | 'join' | 'room'>('menu');
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [playerName, setPlayerName] = useState(user?.name || '');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [gameMode, setGameMode] = useState('standard');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Generate room code
  const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  };

  // Connect to WebSocket
  const connectToRoom = useCallback((roomCode: string, isCreating: boolean) => {
    setConnectionState('connecting');

    // Use the existing WebSocket infrastructure
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionState('connected');
        // Subscribe to the room channel
        ws.send(JSON.stringify({
          type: 'subscribe',
          sessionId: roomCode.split('').reduce((a, c) => a + c.charCodeAt(0), 0),
          userId: user?.id || Math.random(),
        }));

        // If creating, set up room info
        if (isCreating) {
          const newRoom: RoomInfo = {
            code: roomCode,
            host: playerName || user?.name || 'Host',
            players: [{
              id: user?.id?.toString() || 'host',
              name: playerName || user?.name || 'Host',
              isAI: false,
              isHost: true,
              isReady: false,
              score: 0,
              color: ONLINE_COLORS[0],
            }],
            maxPlayers,
            gameMode,
            state: 'lobby',
            createdAt: Date.now(),
          };
          setRoomInfo(newRoom);
          addSystemMessage(`Room ${roomCode} created. Share the code with friends!`);
        } else {
          // Joining existing room
          const joinRoom: RoomInfo = {
            code: roomCode,
            host: 'Waiting...',
            players: [
              {
                id: 'host',
                name: 'Room Host',
                isAI: false,
                isHost: true,
                isReady: true,
                score: 0,
                color: ONLINE_COLORS[0],
              },
              {
                id: user?.id?.toString() || 'joiner',
                name: playerName || user?.name || 'Player',
                isAI: false,
                isHost: false,
                isReady: false,
                score: 0,
                color: ONLINE_COLORS[1],
              },
            ],
            maxPlayers: 9,
            gameMode: 'standard',
            state: 'lobby',
            createdAt: Date.now(),
          };
          setRoomInfo(joinRoom);
          addSystemMessage(`Joined room ${roomCode}. Waiting for host to start...`);
        }

        setView('room');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'new_message' && msg.content) {
            setChatMessages(prev => [...prev, {
              id: Date.now().toString(),
              sender: msg.userId || 'Player',
              text: msg.content,
              timestamp: Date.now(),
              isSystem: false,
            }]);
          }
        } catch { /* ignore parse errors */ }
      };

      ws.onclose = () => {
        setConnectionState('disconnected');
        addSystemMessage('Disconnected from room.');
      };

      ws.onerror = () => {
        setConnectionState('error');
        addSystemMessage('Connection error. Please try again.');
      };
    } catch {
      setConnectionState('error');
    }
  }, [playerName, user, maxPlayers, gameMode]);

  const addSystemMessage = (text: string) => {
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'System',
      text,
      timestamp: Date.now(),
      isSystem: true,
    }]);
  };

  const sendChat = () => {
    if (!chatInput.trim() || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({
      type: 'message',
      sessionId: roomInfo?.code.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0),
      userId: user?.id || 0,
      data: { content: chatInput },
    }));
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: playerName || 'You',
      text: chatInput,
      timestamp: Date.now(),
      isSystem: false,
    }]);
    setChatInput('');
  };

  const addAIPlayer = () => {
    if (!roomInfo || roomInfo.players.length >= roomInfo.maxPlayers) return;
    const aiNames = ['QUMUS Alpha', 'QUMUS Beta', 'QUMUS Gamma', 'QUMUS Delta', 'QUMUS Epsilon', 'QUMUS Zeta', 'QUMUS Eta', 'QUMUS Theta', 'QUMUS Iota'];
    const aiIndex = roomInfo.players.filter(p => p.isAI).length;
    const newPlayer: OnlinePlayer = {
      id: `ai-${Date.now()}`,
      name: aiNames[aiIndex] || `QUMUS AI ${aiIndex + 1}`,
      isAI: true,
      isHost: false,
      isReady: true,
      score: 0,
      color: ONLINE_COLORS[roomInfo.players.length % ONLINE_COLORS.length],
    };
    setRoomInfo(prev => prev ? { ...prev, players: [...prev.players, newPlayer] } : prev);
    addSystemMessage(`${newPlayer.name} joined the room.`);
  };

  const toggleReady = () => {
    setIsReady(prev => !prev);
    if (roomInfo) {
      setRoomInfo(prev => {
        if (!prev) return prev;
        const updated = prev.players.map(p =>
          p.id === (user?.id?.toString() || 'host') || p.id === (user?.id?.toString() || 'joiner')
            ? { ...p, isReady: !p.isReady }
            : p
        );
        return { ...prev, players: updated };
      });
    }
  };

  const startCountdown = () => {
    if (!roomInfo) return;
    setRoomInfo(prev => prev ? { ...prev, state: 'countdown' } : prev);
    setCountdown(3);
    addSystemMessage('Game starting in 3...');

    let count = 3;
    const timer = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(timer);
        setCountdown(null);
        setRoomInfo(prev => prev ? { ...prev, state: 'playing' } : prev);
        addSystemMessage('Game started! Roll those dice!');
      }
    }, 1000);
  };

  const copyRoomCode = () => {
    if (roomInfo) {
      navigator.clipboard.writeText(roomInfo.code);
      addSystemMessage('Room code copied to clipboard!');
    }
  };

  const leaveRoom = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setRoomInfo(null);
    setConnectionState('disconnected');
    setChatMessages([]);
    setIsReady(false);
    setView('menu');
  };

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const allReady = roomInfo?.players.every(p => p.isReady || p.isAI) || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0015] via-[#1a0a30] to-[#0a0020] text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/solbones">
              <Button variant="outline" size="sm" className="border-purple-500/50 text-purple-300 hover:bg-purple-900/50">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Solbones Online
              </h1>
              <p className="text-purple-400/60 text-xs">Multiplayer Rooms &mdash; Play with friends worldwide</p>
            </div>
          </div>
          <Badge variant="outline" className={`gap-1 ${
            connectionState === 'connected' ? 'border-green-500 text-green-400' :
            connectionState === 'connecting' ? 'border-yellow-500 text-yellow-400' :
            connectionState === 'error' ? 'border-red-500 text-red-400' :
            'border-gray-500 text-gray-400'
          }`}>
            {connectionState === 'connected' ? <Wifi className="h-3 w-3" /> :
             connectionState === 'connecting' ? <Loader2 className="h-3 w-3 animate-spin" /> :
             <WifiOff className="h-3 w-3" />}
            {connectionState}
          </Badge>
        </div>

        {/* ===== MAIN MENU ===== */}
        {view === 'menu' && (
          <div className="space-y-6">
            <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-8 text-center">
              <div className="text-6xl mb-4">🎲</div>
              <h2 className="text-2xl font-bold text-white mb-2">Online Multiplayer</h2>
              <p className="text-purple-300/70 mb-6">Create a room or join with a code. Play Solbones 4+3+2 with friends anywhere in the world.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                <Button
                  onClick={() => setView('create')}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 text-lg gap-2"
                  size="lg"
                >
                  <Crown className="h-5 w-5" /> Create Room
                </Button>
                <Button
                  onClick={() => setView('join')}
                  variant="outline"
                  className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/30 py-6 text-lg gap-2"
                  size="lg"
                >
                  <Globe className="h-5 w-5" /> Join Room
                </Button>
              </div>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-[#1a0a30]/60 border-purple-500/20 p-5 text-center">
                <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <h3 className="font-bold text-white text-sm">Up to 9 Players</h3>
                <p className="text-purple-400/60 text-xs mt-1">Sacred number: 4+3+2=9. Mix humans and QUMUS AI.</p>
              </Card>
              <Card className="bg-[#1a0a30]/60 border-purple-500/20 p-5 text-center">
                <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <h3 className="font-bold text-white text-sm">Real-Time Play</h3>
                <p className="text-purple-400/60 text-xs mt-1">WebSocket-powered instant dice rolls and scoring.</p>
              </Card>
              <Card className="bg-[#1a0a30]/60 border-purple-500/20 p-5 text-center">
                <Shield className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <h3 className="font-bold text-white text-sm">Secure Rooms</h3>
                <p className="text-purple-400/60 text-xs mt-1">Private room codes. Only invited players can join.</p>
              </Card>
            </div>
          </div>
        )}

        {/* ===== CREATE ROOM ===== */}
        {view === 'create' && (
          <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-400" /> Create Room
            </h2>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-purple-200 text-sm font-medium mb-1 block">Your Name</label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-purple-900/30 border-purple-500/30 text-white"
                />
              </div>

              <div>
                <label className="text-purple-200 text-sm font-medium mb-1 block">Max Players</label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <Button
                      key={n}
                      variant={maxPlayers === n ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMaxPlayers(n)}
                      className={maxPlayers === n
                        ? 'bg-purple-600 text-white'
                        : 'border-purple-500/30 text-purple-300 hover:bg-purple-900/50'}
                    >
                      {n}{n === 9 && '✨'}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-purple-200 text-sm font-medium mb-1 block">Game Mode</label>
                <div className="flex gap-2">
                  {[
                    { id: 'standard', label: 'Standard' },
                    { id: 'advanced', label: 'In the 9' },
                    { id: 'spiral', label: 'Spiral' },
                  ].map(m => (
                    <Button
                      key={m.id}
                      variant={gameMode === m.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setGameMode(m.id)}
                      className={gameMode === m.id
                        ? 'bg-purple-600 text-white'
                        : 'border-purple-500/30 text-purple-300 hover:bg-purple-900/50'}
                    >
                      {m.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    const code = generateRoomCode();
                    connectToRoom(code, true);
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 gap-2"
                >
                  <Sparkles className="h-4 w-4" /> Create &amp; Enter Room
                </Button>
                <Button variant="outline" onClick={() => setView('menu')} className="border-purple-500/30 text-purple-300">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ===== JOIN ROOM ===== */}
        {view === 'join' && (
          <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Globe className="h-5 w-5 text-cyan-400" /> Join Room
            </h2>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-purple-200 text-sm font-medium mb-1 block">Your Name</label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-purple-900/30 border-purple-500/30 text-white"
                />
              </div>

              <div>
                <label className="text-purple-200 text-sm font-medium mb-1 block">Room Code</label>
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character room code"
                  maxLength={6}
                  className="bg-purple-900/30 border-purple-500/30 text-white text-center text-2xl tracking-widest font-mono"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => connectToRoom(joinCode, false)}
                  disabled={joinCode.length < 6}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 gap-2"
                >
                  <Globe className="h-4 w-4" /> Join Room
                </Button>
                <Button variant="outline" onClick={() => setView('menu')} className="border-purple-500/30 text-purple-300">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ===== ROOM LOBBY ===== */}
        {view === 'room' && roomInfo && (
          <div className="space-y-4">
            {/* Room Header */}
            <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">Room: {roomInfo.code}</h2>
                    <Button variant="ghost" size="sm" onClick={copyRoomCode} className="text-purple-400 hover:text-white h-7 w-7 p-0">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-purple-400/60 text-xs">
                    {roomInfo.gameMode === 'standard' ? 'Standard' : roomInfo.gameMode === 'advanced' ? 'In the 9' : 'Spiral'} &bull;
                    {roomInfo.players.length}/{roomInfo.maxPlayers} players &bull;
                    Host: {roomInfo.host}
                  </p>
                </div>
                <div className="flex gap-2">
                  {roomInfo.state === 'lobby' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addAIPlayer}
                      disabled={roomInfo.players.length >= roomInfo.maxPlayers}
                      className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/30 gap-1"
                    >
                      <Bot className="h-3 w-3" /> Add AI
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={leaveRoom} className="border-red-500/30 text-red-300 hover:bg-red-900/30">
                    Leave
                  </Button>
                </div>
              </div>
            </Card>

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="text-center">
                  <div className="text-9xl font-black text-yellow-400 animate-pulse">{countdown}</div>
                  <p className="text-purple-300 text-xl mt-4">Game starting...</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Players List */}
              <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-4 md:col-span-2">
                <h3 className="text-sm font-bold text-purple-200 mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" /> Players ({roomInfo.players.length}/{roomInfo.maxPlayers})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {roomInfo.players.map((player, i) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between bg-purple-900/30 rounded-lg p-3 border border-purple-500/20"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: player.color }}>
                          {player.isAI ? <Bot className="h-4 w-4" /> : player.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium flex items-center gap-1">
                            {player.name}
                            {player.isHost && <Crown className="h-3 w-3 text-yellow-400" />}
                            {player.isAI && <Badge variant="outline" className="text-[10px] border-cyan-500/50 text-cyan-400 px-1 py-0">AI</Badge>}
                          </div>
                          {roomInfo.state === 'playing' && (
                            <p className="text-purple-400/60 text-xs">Score: {player.score}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        {player.isReady || player.isAI ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-400 animate-pulse" />
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Empty slots */}
                  {Array.from({ length: roomInfo.maxPlayers - roomInfo.players.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="flex items-center justify-center bg-purple-900/10 rounded-lg p-3 border border-dashed border-purple-500/20 text-purple-500/40 text-sm">
                      Waiting for player...
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  {roomInfo.state === 'lobby' && (
                    <>
                      <Button
                        onClick={toggleReady}
                        variant={isReady ? 'default' : 'outline'}
                        className={isReady
                          ? 'bg-green-600 hover:bg-green-700 gap-1'
                          : 'border-green-500/30 text-green-300 hover:bg-green-900/30 gap-1'}
                      >
                        {isReady ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                        {isReady ? 'Ready!' : 'Ready Up'}
                      </Button>

                      {roomInfo.players[0]?.id === (user?.id?.toString() || 'host') && (
                        <Button
                          onClick={startCountdown}
                          disabled={!allReady || roomInfo.players.length < 2}
                          className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-bold gap-1"
                        >
                          <Sparkles className="h-4 w-4" /> Start Game
                        </Button>
                      )}
                    </>
                  )}

                  {roomInfo.state === 'playing' && (
                    <div className="w-full text-center py-8">
                      <Dice1 className="h-16 w-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
                      <h3 className="text-xl font-bold text-white mb-2">Game In Progress</h3>
                      <p className="text-purple-300/70 text-sm mb-4">
                        The dice are rolling! Each player takes turns rolling 3 dice.
                      </p>
                      <Link href="/solbones">
                        <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 gap-2">
                          <Swords className="h-4 w-4" /> Open Game Board
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </Card>

              {/* Chat */}
              <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-4">
                <h3 className="text-sm font-bold text-purple-200 mb-3">Room Chat</h3>
                <div className="h-64 overflow-y-auto space-y-1 mb-3 pr-1">
                  {chatMessages.length === 0 && (
                    <p className="text-purple-500/40 text-xs text-center py-8">No messages yet. Say hello!</p>
                  )}
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={`text-xs ${msg.isSystem ? 'text-purple-400/50 italic' : 'text-white'}`}>
                      {!msg.isSystem && <span className="text-cyan-400 font-medium">{msg.sender}: </span>}
                      {msg.text}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                    placeholder="Type a message..."
                    className="bg-purple-900/30 border-purple-500/30 text-white text-xs h-8"
                  />
                  <Button size="sm" onClick={sendChat} className="bg-purple-600 hover:bg-purple-700 h-8 px-3">
                    Send
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
