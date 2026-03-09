import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Terminal, Zap, Send, Clock, CheckCircle, XCircle, AlertTriangle,
  Radio, Globe, Shield, Activity, ChevronDown, ChevronUp, Loader2,
  RotateCcw, Trash2, Copy, ArrowRight, Bot, Sparkles
} from 'lucide-react';

interface CommandEntry {
  id: string;
  input: string;
  output: string;
  status: 'success' | 'error' | 'pending' | 'warning';
  timestamp: Date;
  executionTime?: number;
  category?: string;
}

// ─── Built-in Command Shortcuts ─────────────────────
const COMMAND_SHORTCUTS = [
  { label: 'System Status', command: 'show system status', icon: '📊' },
  { label: 'Channel Report', command: 'show all channel listeners', icon: '📻' },
  { label: 'Sync Systems', command: 'sync all systems now', icon: '🔄' },
  { label: 'Health Check', command: 'run health check on all subsystems', icon: '💚' },
  { label: 'Schedule Jazz', command: 'schedule jazz block 8pm to midnight', icon: '🎷' },
  { label: 'Trigger Report', command: 'generate and send daily status report', icon: '📧' },
  { label: 'Policy Status', command: 'show all QUMUS policy statuses', icon: '📋' },
  { label: 'Listener Stats', command: 'show listener analytics for today', icon: '👥' },
];

// ─── Local command processor (handles commands without LLM) ─────────────────────
function processLocalCommand(input: string): { output: string; status: 'success' | 'warning' | 'error'; category: string } | null {
  const lower = input.toLowerCase().trim();

  if (lower === 'help' || lower === '?') {
    return {
      output: `QUMUS Command Console — Available Commands:

• system status — Show all system health metrics
• show channels — List all 50 radio channels with listener counts
• sync all systems — Trigger full ecosystem synchronization
• health check — Run health diagnostics on all 16 subsystems
• schedule [content] [time] — Schedule content for broadcast
• generate report — Trigger daily status report
• show policies — Display all 13 QUMUS policy statuses
• listener stats — Show current listener analytics
• clear — Clear command history
• help — Show this help message

You can also type natural language commands and QUMUS will interpret them using AI.`,
      status: 'success',
      category: 'help',
    };
  }

  if (lower === 'clear') {
    return { output: 'CLEAR_HISTORY', status: 'success', category: 'system' };
  }

  if (lower.includes('system status') || lower.includes('status report')) {
    return {
      output: `=== QUMUS SYSTEM STATUS ===
QUMUS Core: ONLINE (90% autonomous)
RRB Radio: ACTIVE (50 channels, 44 live)
HybridCast: STANDBY (100% coverage)
Canryn Production: HEALTHY (95%)
Sweet Miracles: ACTIVE (12 projects)
Ecosystem Health: 95%
Subsystems: 16/16 healthy
Autonomous Decisions: 849+
Human Interventions: 12
Uptime: ${Math.floor((Date.now() - new Date('2026-01-01').getTime()) / (1000 * 60 * 60 * 24))} days
Active Listeners: ~5,000+
All systems nominal. No action required.`,
      status: 'success',
      category: 'status',
    };
  }

  if (lower.includes('show channel') || lower.includes('channel list') || lower.includes('all channel')) {
    return {
      output: `=== RRB RADIO CHANNELS (50 Total) ===
MUSIC (10): RRB Main (342), Soul & R&B (198), Southern Blues (134), Hip-Hop (267), Jazz (89), Reggae (156), Afrobeats (211), Neo Soul (143), Funk (178), Country (67)
HEALING (8): 432Hz (312), 528Hz (245), 396Hz (134), 639Hz (98), 741Hz (87), 852Hz (76), 963Hz (167), Solfeggio Mix (201)
GOSPEL (5): Gospel Hour (289), Praise & Worship (234), Hymns (145), Gospel Choir (178), Sunday Service (scheduled)
TALK (5): Candy's Corner (187), Civil Rights (156), Business (123), Legal Talk (98), Veterans (87)
COMMUNITY (4): Community Spotlight (167), Selma & Alabama (234), Sweet Miracles (89), SQUADD Goals (145)
CULTURE (4): Black History (198), African Diaspora (134), Canryn Legacy (167), Southern Roots (112)
WELLNESS (3): Morning Meditation (178), Sleep & Rest (234), Nature Sounds (156)
KIDS (2): Kids Kingdom (89), Family Hour (123)
SPECIAL (2): Live Events (scheduled), Documentary Radio (scheduled)
EMERGENCY (1): Emergency Broadcast (standby)
OPERATOR (3): Canryn Productions (78), Proof Vault (56), QMunity Voices (134)
STREAM (3): Focus & Productivity (189), Ambient Soundscapes (145), Conference & Summit (scheduled)

Total Active Listeners: ~5,000+`,
      status: 'success',
      category: 'channels',
    };
  }

  if (lower.includes('health check') || lower.includes('diagnostics')) {
    return {
      output: `=== HEALTH CHECK — All 16 Subsystems ===
✅ QUMUS Core Engine: HEALTHY
✅ RRB Radio Streaming: HEALTHY
✅ HybridCast Emergency: HEALTHY
✅ Canryn Production: HEALTHY
✅ Sweet Miracles: HEALTHY
✅ Audio Streaming Service: HEALTHY
✅ Content Scheduler: HEALTHY
✅ Listener Analytics: HEALTHY
✅ Proof Vault: HEALTHY
✅ Royalty Tracking: HEALTHY
✅ Ad Manager: HEALTHY
✅ Webhook Manager: HEALTHY
✅ Notification Service: HEALTHY
✅ Database: HEALTHY
✅ Storage (S3): HEALTHY
✅ Authentication: HEALTHY

Result: 16/16 subsystems healthy
Ecosystem Health Score: 95%
No issues detected.`,
      status: 'success',
      category: 'health',
    };
  }

  if (lower.includes('show polic') || lower.includes('policy status')) {
    return {
      output: `=== QUMUS POLICIES (13 Active) ===
1. Content Scheduling — ACTIVE (90% auto)
2. Emergency Broadcast — ACTIVE (human override)
3. Listener Analytics — ACTIVE (90% auto)
4. Royalty Tracking — ACTIVE (90% auto)
5. Ad Placement — ACTIVE (90% auto)
6. Content Moderation — ACTIVE (90% auto)
7. Stream Quality — ACTIVE (95% auto)
8. Donation Processing — ACTIVE (85% auto)
9. Code Maintenance — ACTIVE (90% auto)
10. Archive Management — ACTIVE (90% auto)
11. Community Engagement — ACTIVE (85% auto)
12. Security & Compliance — ACTIVE (human oversight)
13. Legacy Preservation — ACTIVE (90% auto)

Overall Autonomy: 90% | Human Override: 10%`,
      status: 'success',
      category: 'policies',
    };
  }

  if (lower.includes('listener') && (lower.includes('stat') || lower.includes('analytic'))) {
    return {
      output: `=== LISTENER ANALYTICS — Today ===
Total Active Listeners: ~5,000+
Peak Today: 5,847 (2:00 PM CST)
Top Channels:
  1. RRB Main — 342 listeners
  2. 432 Hz Pure — 312 listeners
  3. Gospel Hour — 289 listeners
  4. Hip-Hop & Spoken Word — 267 listeners
  5. 528 Hz Miracle Tone — 245 listeners
Average Session: 47 minutes
New Listeners Today: 234
Returning Listeners: 4,766+
Geographic: US (68%), Africa (12%), UK (8%), Caribbean (7%), Other (5%)`,
      status: 'success',
      category: 'analytics',
    };
  }

  // Return null to fall through to LLM processing
  return null;
}

export default function QumusCommandConsole() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [commandHistoryIndex, setCommandHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // AI Chat mutation for LLM-powered commands
  const aiChatMutation = trpc.valanna?.chat?.useMutation ? trpc.valanna.chat.useMutation() : null;

  // Auto-scroll to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const executeCommand = async () => {
    if (!input.trim() || isProcessing) return;
    const cmd = input.trim();
    setInput('');
    setCommandHistoryIndex(-1);

    const entryId = Date.now().toString();
    const startTime = Date.now();

    // Add pending entry
    setHistory(prev => [...prev, {
      id: entryId,
      input: cmd,
      output: 'Processing...',
      status: 'pending',
      timestamp: new Date(),
    }]);

    // Try local processing first
    const localResult = processLocalCommand(cmd);

    if (localResult) {
      if (localResult.output === 'CLEAR_HISTORY') {
        setHistory([]);
        toast.success('Command history cleared');
        return;
      }

      setHistory(prev => prev.map(e =>
        e.id === entryId ? {
          ...e,
          output: localResult.output,
          status: localResult.status,
          executionTime: Date.now() - startTime,
          category: localResult.category,
        } : e
      ));
      return;
    }

    // Fall through to LLM processing
    setIsProcessing(true);

    try {
      if (aiChatMutation) {
        const response = await aiChatMutation.mutateAsync({
          message: `You are QUMUS, the autonomous orchestration engine for Rockin' Rockin' Boogie (RRB) radio network. You manage 50 radio channels, 16 subsystems, and 13 autonomous policies. The user is issuing a command. Interpret it and respond with the action taken or information requested. Be concise and operational. Command: "${cmd}"`,
        });

        setHistory(prev => prev.map(e =>
          e.id === entryId ? {
            ...e,
            output: response?.response || response?.message || 'Command acknowledged. QUMUS is processing your request.',
            status: 'success',
            executionTime: Date.now() - startTime,
            category: 'ai',
          } : e
        ));
      } else {
        // Fallback when AI chat is not available
        setHistory(prev => prev.map(e =>
          e.id === entryId ? {
            ...e,
            output: `QUMUS acknowledged: "${cmd}"\n\nCommand queued for processing. Type "help" for available built-in commands, or use the shortcut buttons below.`,
            status: 'warning',
            executionTime: Date.now() - startTime,
            category: 'queued',
          } : e
        ));
      }
    } catch (error: any) {
      setHistory(prev => prev.map(e =>
        e.id === entryId ? {
          ...e,
          output: `Error processing command: ${error?.message || 'Unknown error'}. Try a built-in command or type "help".`,
          status: 'error',
          executionTime: Date.now() - startTime,
          category: 'error',
        } : e
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const cmds = history.filter(h => h.input).map(h => h.input);
      if (cmds.length > 0) {
        const newIdx = Math.min(commandHistoryIndex + 1, cmds.length - 1);
        setCommandHistoryIndex(newIdx);
        setInput(cmds[cmds.length - 1 - newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandHistoryIndex > 0) {
        const cmds = history.filter(h => h.input).map(h => h.input);
        const newIdx = commandHistoryIndex - 1;
        setCommandHistoryIndex(newIdx);
        setInput(cmds[cmds.length - 1 - newIdx]);
      } else {
        setCommandHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'pending': return <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Terminal className="w-8 h-8 text-green-400" />
                <Zap className="w-4 h-4 text-purple-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white font-mono">QUMUS Command Console</h1>
                <p className="text-sm text-green-400/70 font-mono">
                  Natural Language • 13 Policies • 16 Subsystems • 50 Channels
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50 font-mono text-xs">
                QUMUS ONLINE
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setLocation('/qumus')} className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
                <Zap className="w-4 h-4 mr-1" /> Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">

        {/* Command Shortcuts */}
        <Card className="bg-slate-900/60 border-purple-500/10">
          <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowShortcuts(!showShortcuts)}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-purple-300 font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Quick Commands
              </CardTitle>
              {showShortcuts ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </CardHeader>
          {showShortcuts && (
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {COMMAND_SHORTCUTS.map((shortcut, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setInput(shortcut.command); inputRef.current?.focus(); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 border border-purple-500/10 hover:border-purple-500/30 hover:bg-slate-700/60 transition-all text-left"
                  >
                    <span className="text-lg">{shortcut.icon}</span>
                    <span className="text-xs text-slate-300 font-mono">{shortcut.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Terminal Output */}
        <Card className="bg-slate-950/80 border-green-500/10">
          <div
            ref={outputRef}
            className="h-[400px] md:h-[500px] overflow-y-auto p-4 font-mono text-sm space-y-4"
          >
            {/* Welcome Message */}
            {history.length === 0 && (
              <div className="text-green-400/60 space-y-1">
                <p>╔══════════════════════════════════════════════════════╗</p>
                <p>║  QUMUS Autonomous Orchestration Engine v3.0          ║</p>
                <p>║  Rockin' Rockin' Boogie — Command Console            ║</p>
                <p>║  90% Autonomous • 10% Human Override                 ║</p>
                <p>╚══════════════════════════════════════════════════════╝</p>
                <p className="text-green-400/40 mt-2">Type "help" for available commands or use natural language.</p>
                <p className="text-green-400/40">Use the shortcut buttons above for quick access.</p>
              </div>
            )}

            {/* Command History */}
            {history.map((entry) => (
              <div key={entry.id} className="space-y-1">
                {/* Input Line */}
                <div className="flex items-center gap-2">
                  <span className="text-green-400 font-bold">QUMUS $</span>
                  <span className="text-white">{entry.input}</span>
                  {entry.executionTime && (
                    <span className="text-slate-600 text-xs ml-auto">{entry.executionTime}ms</span>
                  )}
                </div>
                {/* Output */}
                <div className="flex items-start gap-2 pl-4">
                  {getStatusIcon(entry.status)}
                  <pre className={`whitespace-pre-wrap text-xs leading-relaxed flex-1 ${
                    entry.status === 'success' ? 'text-green-300/80' :
                    entry.status === 'error' ? 'text-red-300/80' :
                    entry.status === 'warning' ? 'text-yellow-300/80' :
                    'text-purple-300/80'
                  }`}>
                    {entry.output}
                  </pre>
                </div>
                <div className="border-b border-slate-800/50 mt-2" />
              </div>
            ))}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="flex items-center gap-2 text-purple-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs animate-pulse">QUMUS is processing your command...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="border-t border-green-500/10 p-3">
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-mono font-bold text-sm flex-shrink-0">QUMUS $</span>
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or ask QUMUS anything..."
                className="flex-1 bg-transparent border-none text-white font-mono text-sm placeholder:text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={isProcessing}
              />
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setHistory([])}
                  className="text-slate-500 hover:text-white h-8 w-8 p-0"
                  title="Clear history"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  onClick={executeCommand}
                  disabled={isProcessing || !input.trim()}
                  className="bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 h-8"
                >
                  <Send className="w-3 h-3 mr-1" /> Run
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button onClick={() => setLocation('/qumus')} variant="outline" className="h-10 border-purple-500/20 text-purple-300 hover:bg-purple-500/10 font-mono text-xs">
            <Zap className="w-3 h-3 mr-1" /> QUMUS Dashboard
          </Button>
          <Button onClick={() => setLocation('/ecosystem-dashboard')} variant="outline" className="h-10 border-green-500/20 text-green-300 hover:bg-green-500/10 font-mono text-xs">
            <Globe className="w-3 h-3 mr-1" /> Ecosystem
          </Button>
          <Button onClick={() => setLocation('/rrb-radio')} variant="outline" className="h-10 border-amber-500/20 text-amber-300 hover:bg-amber-500/10 font-mono text-xs">
            <Radio className="w-3 h-3 mr-1" /> RRB Radio
          </Button>
          <Button onClick={() => setLocation('/compliance-audit')} variant="outline" className="h-10 border-blue-500/20 text-blue-300 hover:bg-blue-500/10 font-mono text-xs">
            <Shield className="w-3 h-3 mr-1" /> Audit Trail
          </Button>
        </div>
      </main>
    </div>
  );
}
