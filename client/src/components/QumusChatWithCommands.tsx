import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  command?: any;
  executionResult?: any;
}

export function QumusChatWithCommands() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Welcome to QUMUS! I can help you manage music, broadcasts, donations, and meditation. Try commands like:\n\n• "Play music from rockin rockin boogie"\n• "Start emergency broadcast"\n• "Donate $500 to sweet miracles"\n• "Start meditation session"',
      timestamp: Date.now(),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const commandMutation = trpc.commands.executeCommand.useMutation();
  const suggestionQuery = trpc.commands.getSuggestions.useQuery(
    { message: input },
    { enabled: input.length > 0 }
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Execute command
      const result = await commandMutation.mutateAsync({
        userMessage: input,
      });

      if (result.command.requiresApproval && result.command.autonomyLevel < 80) {
        // High-impact command requiring approval
        const approvalMsg: ChatMessage = {
          id: `msg-${Date.now()}-approval`,
          role: 'system',
          content: `⚠️ This ${result.command.impact} impact command requires human approval.\n\nCommand: ${result.command.type}\nSubsystem: ${result.command.subsystem}\nAutonomy Level: ${result.command.autonomyLevel}%\n\nWaiting for admin approval...`,
          timestamp: Date.now(),
          command: result.command,
        };
        setMessages(prev => [...prev, approvalMsg]);
        toast.warning('Command requires approval');
      } else {
        // Auto-execute low-impact command
        const executionMsg: ChatMessage = {
          id: `msg-${Date.now()}-execution`,
          role: 'assistant',
          content: `✅ Executing ${result.command.type} on ${result.command.subsystem}\n\nAutonomy Level: ${result.command.autonomyLevel}%\nImpact: ${result.command.impact}`,
          timestamp: Date.now(),
          command: result.command,
          executionResult: {
            status: 'executing',
            subsystem: result.command.subsystem,
          },
        };
        setMessages(prev => [...prev, executionMsg]);
        toast.success(`Command executed on ${result.command.subsystem}`);
      }
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your command. Please try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
      toast.error('Command execution failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <Card
              className={`max-w-2xl p-4 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : msg.role === 'system'
                  ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-100'
                  : 'bg-slate-700 text-slate-100'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {msg.command && (
                <div className="mt-3 pt-3 border-t border-current border-opacity-20 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        msg.command.impact === 'high'
                          ? 'bg-red-500/20 text-red-300'
                          : msg.command.impact === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-green-500/20 text-green-300'
                      }
                    >
                      {msg.command.impact} impact
                    </Badge>
                    <Badge className="bg-blue-500/20 text-blue-300">
                      {msg.command.autonomyLevel}% autonomy
                    </Badge>
                  </div>
                  <p className="text-xs opacity-75">
                    Subsystem: {msg.command.subsystem}
                  </p>
                </div>
              )}

              {msg.executionResult && (
                <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                  <div className="flex items-center gap-2">
                    {msg.executionResult.status === 'executing' ? (
                      <>
                        <Zap className="w-4 h-4 animate-pulse" />
                        <span className="text-sm">Executing...</span>
                      </>
                    ) : msg.executionResult.status === 'success' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm">Completed</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">Failed</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              <p className="text-xs opacity-50 mt-2">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </Card>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestionQuery.data?.suggestions && suggestionQuery.data.suggestions.length > 0 && (
        <div className="px-6 py-3 border-t border-slate-700 bg-slate-800/50">
          <p className="text-xs text-slate-400 mb-2">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestionQuery.data.suggestions.slice(0, 3).map((suggestion, idx) => (
              <Button
                key={idx}
                size="sm"
                variant="outline"
                onClick={() => {
                  setInput(suggestion);
                }}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-6 border-t border-slate-700 bg-slate-800/50">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask me to play music, broadcast, donate, or meditate..."
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
