"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/_core/hooks/useAuth';
import { Link } from 'wouter';
import { Wifi, WifiOff, Users, Copy, Crown, Bot, Sparkles, ArrowLeft, Globe, Zap, Shield, Clock, CheckCircle, Loader2, Swords, Dice1, Dice3, Dice5, RotateCcw, Trophy } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────
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
  rollsThisTurn: number;
  lastRoll: number[] | null;
  lastResult: RollResult | null;
}

interface RollResult {
  name: string;
  points: number;
  tallies: number;
  description: string;
}

interface RoomInfo {
  code: string;
  host: string;
  players: OnlinePlayer[];
  maxPlayers: number;
  gameMode: string;
  state: RoomState;
  createdAt: number;
  currentTurnIndex: number;
  winScore: number;
  round: number;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  isSystem: boolean;
}

// Game message types sent over WebSocket
type GameAction =
  | { action: 'join'; player: OnlinePlayer }
  | { action: 'ready'; playerId: string; isReady: boolean }
  | { action: 'start'; room: RoomInfo }
  | { action: 'roll'; playerId: string; dice: number[]; result: RollResult; rollsUsed: number }
  | { action: 'keep'; playerId: string; score: number; nextTurnIndex: number }
  | { action: 'ai_turn'; playerId: string; dice: number[]; result: RollResult; score: number; nextTurnIndex: number }
  | { action: 'win'; playerId: string; finalScore: number }
  | { action: 'chat'; sender: string; text: string }
  | { action: 'leave'; playerId: string };

// ─── Constants ───────────────────────────────────────────────
const ONLINE_COLORS = [
  '#a855f7', '#06b6d4', '#f59e0b', '#22c55e', '#ef4444',
  '#3b82f6', '#ec4899', '#6366f1', '#eab308',
];

const FREQUENCY_MAP: Record<number, { hz: number; color: string }> = {
  1: { hz: 174, color: '#94a3b8' },
  2: { hz: 285, color: '#ef4444' },
  3: { hz: 396, color: '#a855f7' },
  4: { hz: 432, color: '#3b82f6' },
  5: { hz: 528, color: '#22c55e' },
  6: { hz: 639, color: '#f59e0b' },
};

// ─── Scoring Logic (same as main Solbones) ───────────────────
function scoreRoll(dice: number[], gameMode: string): RollResult {
  const sorted = [...dice].sort((a, b) => a - b);
  const freqDice = [2, 3, 4];

  // Zan Zone: dice are exactly [2,3,4]
  if (sorted[0] === 2 && sorted[1] === 3 && sorted[2] === 4) {
    return { name: 'Zan Zone', points: 18, tallies: 2, description: 'Sacred frequency alignment! 2+3+4 = 9' };
  }

  // Tribing Up: three of a kind
  if (dice[0] === dice[1] && dice[1] === dice[2]) {
    const base = dice[0] * 3;
    const isFreq = freqDice.includes(dice[0]);
    return {
      name: 'Tribing Up',
      points: isFreq ? base * 2 : base,
      tallies: 1,
      description: `Three ${dice[0]}s${isFreq ? ' (frequency doubled!)' : ''}`,
    };
  }

  // Vibing Up: pair of frequency dice
  const freqCount = dice.filter(d => freqDice.includes(d)).length;
  if (freqCount >= 2) {
    const sum = dice.reduce((a, b) => a + b, 0);
    return { name: 'Vibing Up', points: sum * 2, tallies: 0, description: `Frequency pair! Score doubled` };
  }

  // Sequence: three consecutive
  if (sorted[2] - sorted[1] === 1 && sorted[1] - sorted[0] === 1) {
    const sum = dice.reduce((a, b) => a + b, 0);
    return { name: 'Sequence', points: sum, tallies: 0, description: `Run of ${sorted.join('-')}` };
  }

  // In the 9 bonus
  const sum = dice.reduce((a, b) => a + b, 0);
  if (gameMode === 'advanced' && sum === 9) {
    return { name: 'In the 9', points: Math.max(...dice) + 9, tallies: 1, description: 'Dice sum = 9! Sacred bonus!' };
  }

  // Default: highest die
  return { name: 'Single', points: Math.max(...dice), tallies: 0, description: `Highest die: ${Math.max(...dice)}` };
}

function rollDice(): number[] {
  return [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];
}

function aiDecision(score: number, result: RollResult | null, rollsUsed: number, maxRolls: number): 'roll' | 'keep' {
  if (!result) return 'roll';
  if (rollsUsed >= maxRolls) return 'keep';
  if (result.points >= 8) return 'keep';
  if (result.points >= 5 && rollsUsed >= 2) return 'keep';
  if (score >= 55 && result.points >= 3) return 'keep';
  return 'roll';
}

// ─── Audio ───────────────────────────────────────────────────
function playFrequencyTone(die: number) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = FREQUENCY_MAP[die]?.hz || 432;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch { /* audio not available */ }
}

// ─── Component ───────────────────────────────────────────────
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
  const [aiThinking, setAiThinking] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const myId = useMemo(() => user?.id?.toString() || `anon-${Date.now()}`, [user]);

  const roomSessionId = useCallback((code: string) => {
    // Convert room code to a stable numeric session ID
    return code.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 0) & 0x7fffffff;
  }, []);

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  };

  const addSystemMessage = useCallback((text: string) => {
    setChatMessages(prev => [...prev, {
      id: `sys-${Date.now()}-${Math.random()}`,
      sender: 'System',
      text,
      timestamp: Date.now(),
      isSystem: true,
    }]);
  }, []);

  // Send a game action over WebSocket
  const sendGameAction = useCallback((roomCode: string, gameAction: GameAction) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'game',
        sessionId: roomSessionId(roomCode),
        ...gameAction,
      }));
    }
  }, [roomSessionId]);

  // ─── WebSocket Connection ──────────────────────────────────
  const connectToRoom = useCallback((roomCode: string, isCreating: boolean) => {
    setConnectionState('connecting');
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionState('connected');
        const sid = roomSessionId(roomCode);
        ws.send(JSON.stringify({ type: 'subscribe', sessionId: sid, userId: myId }));

        const winScore = gameMode === 'spiral' ? 36 : 63;

        if (isCreating) {
          const newRoom: RoomInfo = {
            code: roomCode,
            host: playerName || user?.name || 'Host',
            players: [{
              id: myId,
              name: playerName || user?.name || 'Host',
              isAI: false, isHost: true, isReady: false,
              score: 0, color: ONLINE_COLORS[0],
              rollsThisTurn: 0, lastRoll: null, lastResult: null,
            }],
            maxPlayers, gameMode, state: 'lobby',
            createdAt: Date.now(), currentTurnIndex: 0, winScore, round: 1,
          };
          setRoomInfo(newRoom);
          addSystemMessage(`Room ${roomCode} created. Share the code with friends!`);
        } else {
          const joinerPlayer: OnlinePlayer = {
            id: myId,
            name: playerName || user?.name || 'Player',
            isAI: false, isHost: false, isReady: false,
            score: 0, color: ONLINE_COLORS[1],
            rollsThisTurn: 0, lastRoll: null, lastResult: null,
          };
          // Send join action to other players
          sendGameAction(roomCode, { action: 'join', player: joinerPlayer });
          const joinRoom: RoomInfo = {
            code: roomCode, host: 'Waiting...', players: [joinerPlayer],
            maxPlayers: 9, gameMode: 'standard', state: 'lobby',
            createdAt: Date.now(), currentTurnIndex: 0, winScore, round: 1,
          };
          setRoomInfo(joinRoom);
          addSystemMessage(`Joined room ${roomCode}. Waiting for host to start...`);
        }
        setView('room');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'game') {
            handleGameMessage(msg as GameAction & { type: string; sessionId: number });
          }
        } catch { /* ignore */ }
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
  }, [playerName, user, maxPlayers, gameMode, myId, roomSessionId, addSystemMessage, sendGameAction]);

  // ─── Handle incoming game messages ─────────────────────────
  const handleGameMessage = useCallback((msg: any) => {
    const { action } = msg;

    if (action === 'join') {
      setRoomInfo(prev => {
        if (!prev) return prev;
        const exists = prev.players.some(p => p.id === msg.player.id);
        if (exists) return prev;
        const newPlayer = { ...msg.player, color: ONLINE_COLORS[prev.players.length % ONLINE_COLORS.length] };
        addSystemMessage(`${newPlayer.name} joined the room.`);
        return { ...prev, players: [...prev.players, newPlayer] };
      });
    } else if (action === 'ready') {
      setRoomInfo(prev => {
        if (!prev) return prev;
        return { ...prev, players: prev.players.map(p => p.id === msg.playerId ? { ...p, isReady: msg.isReady } : p) };
      });
    } else if (action === 'start') {
      setRoomInfo(msg.room);
      addSystemMessage('Game started! Roll those dice!');
    } else if (action === 'roll') {
      setRoomInfo(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map(p => p.id === msg.playerId
            ? { ...p, lastRoll: msg.dice, lastResult: msg.result, rollsThisTurn: msg.rollsUsed }
            : p),
        };
      });
      playFrequencyTone(Math.max(...msg.dice));
      addSystemMessage(`${msg.playerId} rolled [${msg.dice.join(', ')}] — ${msg.result.name} (${msg.result.points} pts)`);
    } else if (action === 'keep') {
      setRoomInfo(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          currentTurnIndex: msg.nextTurnIndex,
          players: prev.players.map(p => p.id === msg.playerId
            ? { ...p, score: msg.score, rollsThisTurn: 0, lastRoll: null, lastResult: null }
            : p),
        };
      });
    } else if (action === 'ai_turn') {
      setRoomInfo(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          currentTurnIndex: msg.nextTurnIndex,
          players: prev.players.map(p => p.id === msg.playerId
            ? { ...p, score: msg.score, lastRoll: msg.dice, lastResult: msg.result, rollsThisTurn: 0 }
            : p),
        };
      });
      playFrequencyTone(Math.max(...msg.dice));
      addSystemMessage(`AI rolled [${msg.dice.join(', ')}] — ${msg.result.name} (${msg.result.points} pts)`);
    } else if (action === 'win') {
      setRoomInfo(prev => prev ? { ...prev, state: 'finished' } : prev);
      addSystemMessage(`🏆 ${msg.playerId} wins with ${msg.finalScore} points!`);
    } else if (action === 'chat') {
      setChatMessages(prev => [...prev, {
        id: `chat-${Date.now()}-${Math.random()}`,
        sender: msg.sender,
        text: msg.text,
        timestamp: Date.now(),
        isSystem: false,
      }]);
    } else if (action === 'leave') {
      setRoomInfo(prev => {
        if (!prev) return prev;
        addSystemMessage(`${msg.playerId} left the room.`);
        return { ...prev, players: prev.players.filter(p => p.id !== msg.playerId) };
      });
    }
  }, [addSystemMessage]);

  // ─── Game Actions ──────────────────────────────────────────
  const handleRoll = useCallback(() => {
    if (!roomInfo || roomInfo.state !== 'playing') return;
    const currentPlayer = roomInfo.players[roomInfo.currentTurnIndex];
    if (!currentPlayer || currentPlayer.id !== myId) return;
    if (currentPlayer.rollsThisTurn >= 3) return;

    const dice = rollDice();
    const result = scoreRoll(dice, roomInfo.gameMode);
    const rollsUsed = currentPlayer.rollsThisTurn + 1;

    playFrequencyTone(Math.max(...dice));

    setRoomInfo(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        players: prev.players.map(p => p.id === myId
          ? { ...p, lastRoll: dice, lastResult: result, rollsThisTurn: rollsUsed }
          : p),
      };
    });

    sendGameAction(roomInfo.code, { action: 'roll', playerId: myId, dice, result, rollsUsed });
    addSystemMessage(`You rolled [${dice.join(', ')}] — ${result.name} (${result.points} pts)`);
  }, [roomInfo, myId, sendGameAction, addSystemMessage]);

  const handleKeep = useCallback(() => {
    if (!roomInfo || roomInfo.state !== 'playing') return;
    const currentPlayer = roomInfo.players[roomInfo.currentTurnIndex];
    if (!currentPlayer || currentPlayer.id !== myId || !currentPlayer.lastResult) return;

    const newScore = currentPlayer.score + currentPlayer.lastResult.points;
    const nextTurnIndex = (roomInfo.currentTurnIndex + 1) % roomInfo.players.length;

    // Check for win
    if (newScore >= roomInfo.winScore) {
      setRoomInfo(prev => prev ? {
        ...prev, state: 'finished',
        players: prev.players.map(p => p.id === myId ? { ...p, score: newScore } : p),
      } : prev);
      sendGameAction(roomInfo.code, { action: 'win', playerId: currentPlayer.name, finalScore: newScore });
      addSystemMessage(`🏆 You win with ${newScore} points!`);
      return;
    }

    setRoomInfo(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        currentTurnIndex: nextTurnIndex,
        players: prev.players.map(p => p.id === myId
          ? { ...p, score: newScore, rollsThisTurn: 0, lastRoll: null, lastResult: null }
          : p),
      };
    });

    sendGameAction(roomInfo.code, { action: 'keep', playerId: myId, score: newScore, nextTurnIndex });
  }, [roomInfo, myId, sendGameAction, addSystemMessage]);

  // ─── AI Turn Handler ───────────────────────────────────────
  useEffect(() => {
    if (!roomInfo || roomInfo.state !== 'playing') return;
    const currentPlayer = roomInfo.players[roomInfo.currentTurnIndex];
    if (!currentPlayer?.isAI) return;

    // Only the host runs AI turns to avoid duplicates
    const isHost = roomInfo.players.find(p => p.isHost)?.id === myId;
    if (!isHost) return;

    setAiThinking(true);
    const timer = setTimeout(() => {
      let aiScore = currentPlayer.score;
      let finalDice = rollDice();
      let finalResult = scoreRoll(finalDice, roomInfo.gameMode);
      let rolls = 1;

      // AI may re-roll
      while (rolls < 3 && aiDecision(aiScore, finalResult, rolls, 3) === 'roll') {
        finalDice = rollDice();
        finalResult = scoreRoll(finalDice, roomInfo.gameMode);
        rolls++;
      }

      aiScore += finalResult.points;
      const nextTurnIndex = (roomInfo.currentTurnIndex + 1) % roomInfo.players.length;

      // Check win
      if (aiScore >= roomInfo.winScore) {
        setRoomInfo(prev => prev ? {
          ...prev, state: 'finished',
          players: prev.players.map(p => p.id === currentPlayer.id ? { ...p, score: aiScore, lastRoll: finalDice, lastResult: finalResult } : p),
        } : prev);
        sendGameAction(roomInfo.code, { action: 'win', playerId: currentPlayer.name, finalScore: aiScore });
        addSystemMessage(`🏆 ${currentPlayer.name} wins with ${aiScore} points!`);
      } else {
        setRoomInfo(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            currentTurnIndex: nextTurnIndex,
            players: prev.players.map(p => p.id === currentPlayer.id
              ? { ...p, score: aiScore, lastRoll: finalDice, lastResult: finalResult, rollsThisTurn: 0 }
              : p),
          };
        });
        sendGameAction(roomInfo.code, {
          action: 'ai_turn', playerId: currentPlayer.id,
          dice: finalDice, result: finalResult, score: aiScore, nextTurnIndex,
        });
        addSystemMessage(`${currentPlayer.name} rolled [${finalDice.join(', ')}] — ${finalResult.name} (${finalResult.points} pts)`);
      }

      playFrequencyTone(Math.max(...finalDice));
      setAiThinking(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [roomInfo?.currentTurnIndex, roomInfo?.state, myId]);

  // ─── Lobby Actions ─────────────────────────────────────────
  const addAIPlayer = () => {
    if (!roomInfo || roomInfo.players.length >= roomInfo.maxPlayers) return;
    const aiNames = ['QUMUS Alpha', 'QUMUS Beta', 'QUMUS Gamma', 'QUMUS Delta', 'QUMUS Epsilon', 'QUMUS Zeta', 'QUMUS Eta', 'QUMUS Theta', 'QUMUS Iota'];
    const aiIndex = roomInfo.players.filter(p => p.isAI).length;
    const newPlayer: OnlinePlayer = {
      id: `ai-${Date.now()}`, name: aiNames[aiIndex] || `QUMUS AI ${aiIndex + 1}`,
      isAI: true, isHost: false, isReady: true, score: 0,
      color: ONLINE_COLORS[roomInfo.players.length % ONLINE_COLORS.length],
      rollsThisTurn: 0, lastRoll: null, lastResult: null,
    };
    setRoomInfo(prev => prev ? { ...prev, players: [...prev.players, newPlayer] } : prev);
    sendGameAction(roomInfo.code, { action: 'join', player: newPlayer });
    addSystemMessage(`${newPlayer.name} joined the room.`);
  };

  const toggleReady = () => {
    const newReady = !isReady;
    setIsReady(newReady);
    if (roomInfo) {
      setRoomInfo(prev => {
        if (!prev) return prev;
        return { ...prev, players: prev.players.map(p => p.id === myId ? { ...p, isReady: newReady } : p) };
      });
      sendGameAction(roomInfo.code, { action: 'ready', playerId: myId, isReady: newReady });
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
        const startedRoom: RoomInfo = { ...roomInfo, state: 'playing', currentTurnIndex: 0 };
        setRoomInfo(startedRoom);
        sendGameAction(roomInfo.code, { action: 'start', room: startedRoom });
        addSystemMessage('Game started! Roll those dice!');
      }
    }, 1000);
  };

  const sendChat = () => {
    if (!chatInput.trim() || !roomInfo) return;
    const name = playerName || 'You';
    sendGameAction(roomInfo.code, { action: 'chat', sender: name, text: chatInput });
    setChatMessages(prev => [...prev, {
      id: `chat-${Date.now()}`,
      sender: name, text: chatInput, timestamp: Date.now(), isSystem: false,
    }]);
    setChatInput('');
  };

  const copyRoomCode = () => {
    if (roomInfo) {
      navigator.clipboard.writeText(roomInfo.code);
      addSystemMessage('Room code copied to clipboard!');
    }
  };

  const leaveRoom = () => {
    if (roomInfo) sendGameAction(roomInfo.code, { action: 'leave', playerId: myId });
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    setRoomInfo(null); setConnectionState('disconnected');
    setChatMessages([]); setIsReady(false); setView('menu');
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);
  useEffect(() => { return () => { if (wsRef.current) wsRef.current.close(); }; }, []);

  const allReady = roomInfo?.players.every(p => p.isReady || p.isAI) || false;
  const isMyTurn = roomInfo?.state === 'playing' && roomInfo.players[roomInfo.currentTurnIndex]?.id === myId;
  const currentPlayer = roomInfo?.players[roomInfo.currentTurnIndex];

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0015] via-[#1a0a30] to-[#0a0020] text-white p-4">
      <div className="max-w-5xl mx-auto">
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
              <p className="text-purple-400/60 text-xs">Real-Time Multiplayer &mdash; Synced dice rolls across devices</p>
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
              <p className="text-purple-300/70 mb-6">Create a room or join with a code. Real-time dice rolls synced between all players.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                <Button onClick={() => setView('create')} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 text-lg gap-2" size="lg">
                  <Crown className="h-5 w-5" /> Create Room
                </Button>
                <Button onClick={() => setView('join')} variant="outline" className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/30 py-6 text-lg gap-2" size="lg">
                  <Globe className="h-5 w-5" /> Join Room
                </Button>
              </div>
            </Card>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-[#1a0a30]/60 border-purple-500/20 p-5 text-center">
                <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <h3 className="font-bold text-white text-sm">Up to 9 Players</h3>
                <p className="text-purple-400/60 text-xs mt-1">Sacred number: 4+3+2=9. Mix humans and QUMUS AI.</p>
              </Card>
              <Card className="bg-[#1a0a30]/60 border-purple-500/20 p-5 text-center">
                <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <h3 className="font-bold text-white text-sm">Real-Time Sync</h3>
                <p className="text-purple-400/60 text-xs mt-1">WebSocket-powered. Every roll, score, and turn synced instantly.</p>
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
                <Input value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Enter your name" className="bg-purple-900/30 border-purple-500/30 text-white" />
              </div>
              <div>
                <label className="text-purple-200 text-sm font-medium mb-1 block">Max Players</label>
                <div className="flex gap-2 flex-wrap">
                  {[2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <Button key={n} variant={maxPlayers === n ? 'default' : 'outline'} size="sm" onClick={() => setMaxPlayers(n)}
                      className={maxPlayers === n ? 'bg-purple-600 text-white' : 'border-purple-500/30 text-purple-300 hover:bg-purple-900/50'}>
                      {n}{n === 9 && '✨'}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-purple-200 text-sm font-medium mb-1 block">Game Mode</label>
                <div className="flex gap-2">
                  {[{ id: 'standard', label: 'Standard' }, { id: 'advanced', label: 'In the 9' }, { id: 'spiral', label: 'Spiral' }].map(m => (
                    <Button key={m.id} variant={gameMode === m.id ? 'default' : 'outline'} size="sm" onClick={() => setGameMode(m.id)}
                      className={gameMode === m.id ? 'bg-purple-600 text-white' : 'border-purple-500/30 text-purple-300 hover:bg-purple-900/50'}>
                      {m.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={() => connectToRoom(generateRoomCode(), true)} className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 gap-2">
                  <Sparkles className="h-4 w-4" /> Create &amp; Enter Room
                </Button>
                <Button variant="outline" onClick={() => setView('menu')} className="border-purple-500/30 text-purple-300">Cancel</Button>
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
                <Input value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Enter your name" className="bg-purple-900/30 border-purple-500/30 text-white" />
              </div>
              <div>
                <label className="text-purple-200 text-sm font-medium mb-1 block">Room Code</label>
                <Input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="Enter 6-character room code" maxLength={6}
                  className="bg-purple-900/30 border-purple-500/30 text-white text-center text-2xl tracking-widest font-mono" />
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={() => connectToRoom(joinCode, false)} disabled={joinCode.length < 6}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 gap-2">
                  <Globe className="h-4 w-4" /> Join Room
                </Button>
                <Button variant="outline" onClick={() => setView('menu')} className="border-purple-500/30 text-purple-300">Cancel</Button>
              </div>
            </div>
          </Card>
        )}

        {/* ===== ROOM (LOBBY + GAME) ===== */}
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
                    {roomInfo.state === 'playing' && (
                      <Badge className="bg-green-600/80 text-white text-xs">LIVE</Badge>
                    )}
                  </div>
                  <p className="text-purple-400/60 text-xs">
                    {roomInfo.gameMode === 'standard' ? 'Standard' : roomInfo.gameMode === 'advanced' ? 'In the 9' : 'Spiral'} &bull;
                    {roomInfo.players.length}/{roomInfo.maxPlayers} players &bull;
                    Target: {roomInfo.winScore} pts
                  </p>
                </div>
                <div className="flex gap-2">
                  {roomInfo.state === 'lobby' && (
                    <Button variant="outline" size="sm" onClick={addAIPlayer} disabled={roomInfo.players.length >= roomInfo.maxPlayers}
                      className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/30 gap-1">
                      <Bot className="h-3 w-3" /> Add AI
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={leaveRoom} className="border-red-500/30 text-red-300 hover:bg-red-900/30">Leave</Button>
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

            {/* Winner Banner */}
            {roomInfo.state === 'finished' && (
              <Card className="bg-gradient-to-r from-yellow-600/30 via-amber-500/30 to-yellow-600/30 border-yellow-500/50 p-6 text-center">
                <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-3 animate-bounce" />
                <h2 className="text-2xl font-black text-yellow-300 mb-1">Game Over!</h2>
                <p className="text-yellow-200/80">
                  Winner: {roomInfo.players.reduce((best, p) => p.score > best.score ? p : best, roomInfo.players[0]).name} with {Math.max(...roomInfo.players.map(p => p.score))} points
                </p>
                <Button onClick={leaveRoom} className="mt-4 bg-purple-600 hover:bg-purple-700 gap-2">
                  <RotateCcw className="h-4 w-4" /> Back to Menu
                </Button>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Players + Game Board */}
              <Card className="bg-[#1a0a30]/80 border-purple-500/30 p-4 md:col-span-2">
                <h3 className="text-sm font-bold text-purple-200 mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" /> Players ({roomInfo.players.length}/{roomInfo.maxPlayers})
                </h3>

                {/* Scoreboard Grid */}
                <div className={`grid gap-2 ${roomInfo.players.length <= 4 ? 'grid-cols-2' : roomInfo.players.length <= 6 ? 'grid-cols-3' : 'grid-cols-3'}`}>
                  {roomInfo.players.map((player, i) => {
                    const isTurn = roomInfo.state === 'playing' && roomInfo.currentTurnIndex === i;
                    return (
                      <div key={player.id}
                        className={`relative bg-purple-900/30 rounded-lg p-3 border transition-all ${
                          isTurn ? 'border-yellow-400 ring-1 ring-yellow-400/50 bg-yellow-900/20' : 'border-purple-500/20'
                        }`}>
                        {isTurn && <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[10px] px-1.5">Turn</Badge>}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: player.color }}>
                            {player.isAI ? <Bot className="h-3 w-3" /> : player.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-white text-xs font-medium truncate flex items-center gap-1">
                              {player.name}
                              {player.isHost && <Crown className="h-3 w-3 text-yellow-400 flex-shrink-0" />}
                            </div>
                            <div className="text-yellow-400 font-bold text-sm">{player.score} pts</div>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="h-1.5 bg-purple-900/50 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{
                            width: `${Math.min(100, (player.score / roomInfo.winScore) * 100)}%`,
                            backgroundColor: player.color,
                          }} />
                        </div>
                        {/* Last roll display */}
                        {player.lastRoll && roomInfo.state === 'playing' && (
                          <div className="mt-2 flex items-center gap-1">
                            {player.lastRoll.map((d, di) => (
                              <div key={di} className="w-6 h-6 rounded bg-purple-800/50 flex items-center justify-center text-xs font-bold" style={{ color: FREQUENCY_MAP[d]?.color }}>
                                {d}
                              </div>
                            ))}
                            <span className="text-[10px] text-purple-400/60 ml-1">{player.lastResult?.name}</span>
                          </div>
                        )}
                        {/* Ready indicator (lobby) */}
                        {roomInfo.state === 'lobby' && (
                          <div className="mt-2 flex justify-end">
                            {player.isReady || player.isAI ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-400 animate-pulse" />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Empty slots */}
                  {roomInfo.state === 'lobby' && Array.from({ length: roomInfo.maxPlayers - roomInfo.players.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="flex items-center justify-center bg-purple-900/10 rounded-lg p-3 border border-dashed border-purple-500/20 text-purple-500/40 text-xs">
                      Waiting...
                    </div>
                  ))}
                </div>

                {/* Game Controls */}
                <div className="mt-4">
                  {roomInfo.state === 'lobby' && (
                    <div className="flex gap-3">
                      <Button onClick={toggleReady} variant={isReady ? 'default' : 'outline'}
                        className={isReady ? 'bg-green-600 hover:bg-green-700 gap-1' : 'border-green-500/30 text-green-300 hover:bg-green-900/30 gap-1'}>
                        {isReady ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                        {isReady ? 'Ready!' : 'Ready Up'}
                      </Button>
                      {roomInfo.players.find(p => p.isHost)?.id === myId && (
                        <Button onClick={startCountdown} disabled={!allReady || roomInfo.players.length < 2}
                          className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-bold gap-1">
                          <Sparkles className="h-4 w-4" /> Start Game
                        </Button>
                      )}
                    </div>
                  )}

                  {roomInfo.state === 'playing' && isMyTurn && (
                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                      <p className="text-yellow-300 text-sm font-bold mb-3 flex items-center gap-2">
                        <Dice3 className="h-4 w-4" /> Your Turn! Roll {currentPlayer?.rollsThisTurn || 0}/3
                      </p>
                      <div className="flex gap-3">
                        <Button onClick={handleRoll} disabled={(currentPlayer?.rollsThisTurn || 0) >= 3}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 gap-2 flex-1">
                          <Dice5 className="h-4 w-4" /> Roll Dice
                        </Button>
                        {currentPlayer?.lastResult && (
                          <Button onClick={handleKeep}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 gap-2 flex-1">
                            <CheckCircle className="h-4 w-4" /> Keep {currentPlayer.lastResult.points} pts
                          </Button>
                        )}
                      </div>
                      {currentPlayer?.lastResult && (
                        <p className="text-purple-300/70 text-xs mt-2">
                          {currentPlayer.lastResult.name}: {currentPlayer.lastResult.description}
                        </p>
                      )}
                    </div>
                  )}

                  {roomInfo.state === 'playing' && !isMyTurn && (
                    <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-4 text-center">
                      {aiThinking ? (
                        <div className="flex items-center justify-center gap-2 text-cyan-300">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">{currentPlayer?.name} is thinking...</span>
                        </div>
                      ) : (
                        <p className="text-purple-400/70 text-sm">
                          Waiting for <span className="text-white font-medium">{currentPlayer?.name}</span> to roll...
                        </p>
                      )}
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
                  <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                    placeholder="Type a message..."
                    className="bg-purple-900/30 border-purple-500/30 text-white text-xs h-8" />
                  <Button size="sm" onClick={sendChat} className="bg-purple-600 hover:bg-purple-700 h-8 px-3">Send</Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
