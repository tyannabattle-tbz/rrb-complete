"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Terminal, Send, Trash2, Activity, Zap, Radio, Shield,
  Heart, Users, Brain, ChevronRight, Clock, AlertTriangle,
  CheckCircle, XCircle, Loader2, ArrowUp, ArrowDown,
} from "lucide-react";

interface OutputLine {
  id: string;
  type: 'command' | 'response' | 'system' | 'error' | 'info';
  text: string;
  timestamp: number;
  agent?: string;
}

const AGENT_COLORS: Record<string, string> = {
  'QUMUS': 'text-cyan-400',
  "Rockin' Rockin' Boogie": 'text-amber-400',
  'HybridCast': 'text-red-400',
  'Canryn Production': 'text-purple-400',
  'Sweet Miracles': 'text-pink-400',
  'QumUnity': 'text-green-400',
};

const AGENT_ICONS: Record<string, any> = {
  'QUMUS': Brain,
  "Rockin' Rockin' Boogie": Radio,
  'HybridCast': Shield,
  'Canryn Production': Zap,
  'Sweet Miracles': Heart,
  'QumUnity': Users,
};

export default function QumusCommandConsole() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<OutputLine[]>([
    {
      id: 'welcome',
      type: 'system',
      text: '╔══════════════════════════════════════════════════════════╗\n║           QUMUS COMMAND CONSOLE v2.0                     ║\n║   Autonomous Ecosystem Control Interface                 ║\n║   "Past, Protection, Presentation, Preservation"         ║\n╚══════════════════════════════════════════════════════════╝\n\nType a command or use agent prefix (e.g., "RRB: play blues")\nType "help" for available commands.',
      timestamp: Date.now(),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistoryLocal, setCommandHistoryLocal] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const executeCmd = trpc.commands.executeCommand.useMutation();
  const suggestionsQuery = trpc.commands.getSuggestions.useQuery(
    { message: input },
    { enabled: input.length > 0, refetchOnWindowFocus: false }
  );
  const statsQuery = trpc.commands.getConsoleStats.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 30000,
  });
  const agentCmdsQuery = trpc.commands.getAgentCommands.useQuery(undefined, { enabled: !!user });
  const historyQuery = trpc.commands.getHistory.useQuery({ limit: 50 }, { enabled: !!user });
  const clearHistoryMut = trpc.commands.clearHistory.useMutation();

  useEffect(() => {
    if (suggestionsQuery.data?.suggestions) {
      setSuggestions(suggestionsQuery.data.suggestions);
    }
  }, [suggestionsQuery.data]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const addOutput = useCallback((line: Omit<OutputLine, 'id'>) => {
    setOutput(prev => [...prev, { ...line, id: `out_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` }]);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isProcessing) return;
    const cmd = input.trim();
    setInput("");
    setHistoryIndex(-1);
    setShowSuggestions(false);
    setCommandHistoryLocal(prev => [cmd, ...prev.slice(0, 99)]);

    // Handle local commands
    if (cmd.toLowerCase() === 'help') {
      addOutput({ type: 'command', text: `> ${cmd}`, timestamp: Date.now() });
      addOutput({
        type: 'info',
        text: `📖 QUMUS Command Console — Available Commands\n\n` +
          `Agent Prefixes (target specific systems):\n` +
          `  QUMUS:          Central brain commands\n` +
          `  RRB:            Radio & entertainment\n` +
          `  HybridCast:     Emergency broadcast\n` +
          `  Canryn:         Production & studio\n` +
          `  Sweet Miracles: Fundraising & grants\n` +
          `  QumUnity:       Community platform\n\n` +
          `Quick Commands:\n` +
          `  health check    — System health report\n` +
          `  list channels   — Show all radio channels\n` +
          `  play [channel]  — Tune to a channel\n` +
          `  broadcast status — Emergency system status\n` +
          `  donation report — Fundraising summary\n` +
          `  grant search    — Find matching grants\n` +
          `  studio status   — Production studio info\n` +
          `  code scan       — Run code maintenance scan\n` +
          `  code health     — Code health grade & issues\n` +
          `  code scheduler  — Scan scheduler status\n` +
          `  archive scan    — Run content archival scan\n` +
          `  archive status  — Archival health summary\n` +
          `  archive wayback — Check Wayback Machine\n` +
          `  archive linkrot — List dead links\n` +
          `  archive scheduler — Archival scheduler status\n` +
          `  clear           — Clear console output\n` +
          `  help            — Show this message`,
        timestamp: Date.now(),
      });
      return;
    }

    if (cmd.toLowerCase() === 'clear') {
      setOutput([{
        id: 'cleared',
        type: 'system',
        text: '🗑️ Console cleared.',
        timestamp: Date.now(),
      }]);
      return;
    }

    addOutput({ type: 'command', text: `> ${cmd}`, timestamp: Date.now() });
    setIsProcessing(true);

    try {
      const result = await executeCmd.mutateAsync({ userMessage: cmd });
      if (result.response) {
        const r = result.response;
        addOutput({
          type: r.status === 'error' ? 'error' : r.status === 'requires_approval' ? 'info' : 'response',
          text: `${r.agentResponse || r.message}\n\n⏱️ ${r.executionTime}ms | Status: ${r.status}`,
          timestamp: Date.now(),
          agent: result.command?.subsystem,
        });
      }
    } catch (err) {
      addOutput({
        type: 'error',
        text: `❌ Error: ${err instanceof Error ? err.message : 'Command failed'}`,
        timestamp: Date.now(),
      });
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  }, [input, isProcessing, executeCmd, addOutput]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistoryLocal.length > 0) {
        const newIndex = Math.min(historyIndex + 1, commandHistoryLocal.length - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistoryLocal[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistoryLocal[newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    } else if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault();
      setInput(suggestions[0]);
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const stats = statsQuery.data;
  const agents = agentCmdsQuery.data?.agents || {};

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <Card className="bg-gray-900 border-cyan-500/30 p-8 text-center max-w-md">
          <Terminal className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">QUMUS Command Console</h2>
          <p className="text-gray-400 mb-4">Authentication required to access the command console.</p>
          <Button className="bg-cyan-600 hover:bg-cyan-700">Sign In</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Terminal className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">QUMUS Command Console</h1>
              <p className="text-xs text-gray-500">Autonomous Ecosystem Control Interface</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {stats && (
              <>
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-green-400" />
                  {stats.last24h} commands today
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-cyan-400" />
                  {stats.successRate}% success
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  {stats.avgExecutionTime}ms avg
                </span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Console */}
          <div className="lg:col-span-3 space-y-2">
            {/* Terminal Output */}
            <Card className="bg-gray-900 border-gray-800 overflow-hidden">
              <div
                ref={outputRef}
                className="h-[500px] overflow-y-auto p-4 font-mono text-sm space-y-1"
                onClick={() => inputRef.current?.focus()}
              >
                {output.map(line => (
                  <div key={line.id} className={`whitespace-pre-wrap ${
                    line.type === 'command' ? 'text-cyan-300 font-semibold' :
                    line.type === 'error' ? 'text-red-400' :
                    line.type === 'system' ? 'text-gray-500' :
                    line.type === 'info' ? 'text-amber-300' :
                    line.agent ? (AGENT_COLORS[line.agent] || 'text-green-400') : 'text-green-400'
                  }`}>
                    {line.agent && line.type === 'response' && (
                      <span className="text-gray-600 text-xs">
                        [{new Date(line.timestamp).toLocaleTimeString()}]
                      </span>
                    )}{' '}
                    {line.text}
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="animate-pulse">Processing command...</span>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-800 p-3 relative">
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 bg-gray-800 border border-gray-700 rounded-t-lg p-2 space-y-1">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 rounded font-mono"
                        onClick={() => { setInput(s); setShowSuggestions(false); inputRef.current?.focus(); }}
                      >
                        <ChevronRight className="w-3 h-3 inline mr-2 text-cyan-400" />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-mono font-bold text-sm">QUMUS &gt;</span>
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={e => { setInput(e.target.value); setShowSuggestions(e.target.value.length > 0); }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => input.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Enter command (e.g., 'RRB: play blues' or 'health check')..."
                    className="flex-1 bg-transparent border-none text-green-400 font-mono text-sm placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                    disabled={isProcessing}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={isProcessing || !input.trim()}
                    className="bg-cyan-600 hover:bg-cyan-700 h-8"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-4 mt-1 text-[10px] text-gray-600">
                  <span><ArrowUp className="w-2.5 h-2.5 inline" />/<ArrowDown className="w-2.5 h-2.5 inline" /> History</span>
                  <span>Tab: Autocomplete</span>
                  <span>Enter: Execute</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Tabs defaultValue="agents" className="w-full">
              <TabsList className="w-full bg-gray-900 border border-gray-800">
                <TabsTrigger value="agents" className="flex-1 text-xs">Agents</TabsTrigger>
                <TabsTrigger value="history" className="flex-1 text-xs">History</TabsTrigger>
                <TabsTrigger value="stats" className="flex-1 text-xs">Stats</TabsTrigger>
              </TabsList>

              <TabsContent value="agents" className="mt-2 space-y-2">
                {Object.entries(agents).map(([key, agent]) => {
                  const Icon = AGENT_ICONS[agent.name] || Brain;
                  return (
                    <Card
                      key={key}
                      className="bg-gray-900 border-gray-800 p-3 cursor-pointer hover:border-cyan-500/30 transition-colors"
                      onClick={() => { setInput(`${agent.name}: `); inputRef.current?.focus(); }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${AGENT_COLORS[agent.name] || 'text-gray-400'}`} />
                        <span className="text-xs font-semibold text-white">{agent.name}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mb-2">{agent.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {agent.commands.slice(0, 3).map((cmd: string) => (
                          <button
                            key={cmd}
                            className="text-[9px] px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 hover:text-white transition-colors"
                            onClick={(e) => { e.stopPropagation(); setInput(`${agent.name}: ${cmd}`); inputRef.current?.focus(); }}
                          >
                            {cmd}
                          </button>
                        ))}
                        {agent.commands.length > 3 && (
                          <span className="text-[9px] text-gray-600">+{agent.commands.length - 3} more</span>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </TabsContent>

              <TabsContent value="history" className="mt-2 space-y-1">
                {historyQuery.data?.history?.slice(0, 20).map((h: any) => (
                  <button
                    key={h.id}
                    className="w-full text-left p-2 bg-gray-900 border border-gray-800 rounded text-xs hover:border-gray-700 transition-colors"
                    onClick={() => { setInput(h.command); inputRef.current?.focus(); }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 font-mono truncate flex-1">{h.command}</span>
                      {h.response?.status === 'executed' ? (
                        <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                      ) : h.response?.status === 'error' ? (
                        <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-600">
                      {new Date(h.timestamp).toLocaleTimeString()} • {h.response?.executionTime}ms
                    </span>
                  </button>
                )) || (
                  <p className="text-xs text-gray-600 text-center py-4">No command history yet</p>
                )}
                {(historyQuery.data?.total || 0) > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs border-gray-800 text-gray-500 hover:text-red-400"
                    onClick={() => clearHistoryMut.mutate()}
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Clear History
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="stats" className="mt-2 space-y-2">
                {stats ? (
                  <>
                    <Card className="bg-gray-900 border-gray-800 p-3">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Commands</p>
                      <p className="text-2xl font-bold text-white">{stats.totalCommands}</p>
                    </Card>
                    <Card className="bg-gray-900 border-gray-800 p-3">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Success Rate</p>
                      <p className="text-2xl font-bold text-green-400">{stats.successRate}%</p>
                    </Card>
                    <Card className="bg-gray-900 border-gray-800 p-3">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Avg Response</p>
                      <p className="text-2xl font-bold text-cyan-400">{stats.avgExecutionTime}ms</p>
                    </Card>
                    {Object.keys(stats.byAgent).length > 0 && (
                      <Card className="bg-gray-900 border-gray-800 p-3">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">By Agent</p>
                        {Object.entries(stats.byAgent).map(([agent, count]) => (
                          <div key={agent} className="flex justify-between text-xs mb-1">
                            <span className={AGENT_COLORS[agent] || 'text-gray-400'}>{agent}</span>
                            <span className="text-gray-500">{count as number}</span>
                          </div>
                        ))}
                      </Card>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-gray-600 text-center py-4">Loading stats...</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
