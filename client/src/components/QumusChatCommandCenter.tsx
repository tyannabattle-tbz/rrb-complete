import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Zap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  autonomyLevel?: number;
  status?: 'pending' | 'executing' | 'completed' | 'failed';
  decisionId?: string;
}

export function QumusChatCommandCenter() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to QUMUS Command Center! I can help you control all subsystems. Try commands like:\n• "Publish a new track to Rockin Rockin Boogie"\n• "Send emergency alert on HybridCast"\n• "Process donation for Sweet Miracles"\n• "Start meditation session on Canryn"',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('');

  const executeCommandMutation = trpc.qumusCommand.executeCommand.useMutation();
  const suggestionsQuery = trpc.qumusCommand.getSuggestions.useQuery(
    { subsystem: selectedSubsystem, input },
    { enabled: selectedSubsystem.length > 0 && input.length > 0 }
  );

  useEffect(() => {
    if (suggestionsQuery.data) {
      setSuggestions(suggestionsQuery.data);
    }
  }, [suggestionsQuery.data]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  const detectSubsystem = (text: string): string => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('hybridcast') || lowerText.includes('broadcast') || lowerText.includes('emergency')) {
      return 'HybridCast';
    }
    if (lowerText.includes('rockin') || lowerText.includes('music') || lowerText.includes('track')) {
      return 'Rockin Rockin Boogie';
    }
    if (lowerText.includes('donation') || lowerText.includes('sweet miracles') || lowerText.includes('fundrais')) {
      return 'Sweet Miracles';
    }
    if (lowerText.includes('meditation') || lowerText.includes('canryn') || lowerText.includes('wellness')) {
      return 'Canryn';
    }
    return '';
  };

  const handleSendCommand = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const subsystem = detectSubsystem(input);
      if (!subsystem) {
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-response`,
          role: 'assistant',
          content: 'I couldn\'t detect which subsystem to use. Please specify: HybridCast, Rockin Rockin Boogie, Sweet Miracles, or Canryn.',
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        setLoading(false);
        return;
      }

      const result = await executeCommandMutation.mutateAsync({
        command: input,
        subsystem: subsystem as any,
        parameters: {},
      });

      if (result.requiresApproval) {
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-response`,
          role: 'system',
          content: `⚠️ Command requires approval (Autonomy: ${result.autonomyLevel}%)\n\nThis is a high-impact action that needs human review before execution.`,
          timestamp: Date.now(),
          autonomyLevel: result.autonomyLevel,
          status: 'pending',
          decisionId: result.decisionId,
        };
        setMessages(prev => [...prev, assistantMessage]);
        toast.warning('Approval required for this command');
      } else {
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-response`,
          role: 'assistant',
          content: `✅ ${result.message}\n\n${result.data ? JSON.stringify(result.data, null, 2) : ''}`,
          timestamp: Date.now(),
          autonomyLevel: result.autonomyLevel,
          status: 'completed',
          decisionId: result.decisionId,
        };
        setMessages(prev => [...prev, assistantMessage]);
        toast.success('Command executed successfully');
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'system',
        content: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
        status: 'failed',
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Command execution failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl rounded-lg p-4 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : msg.role === 'system'
                  ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/50'
                  : 'bg-slate-700 text-slate-100'
              }`}
            >
              <div className="flex items-start gap-2">
                {msg.status === 'pending' && <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />}
                {msg.status === 'completed' && <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-400" />}
                {msg.status === 'failed' && <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-400" />}
                <div className="flex-1">
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  {msg.autonomyLevel !== undefined && (
                    <div className="mt-2 pt-2 border-t border-current/20">
                      <Badge className="bg-slate-600 text-slate-200 text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        Autonomy: {msg.autonomyLevel}%
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              <span className="text-xs opacity-70 mt-2 block">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-6 pb-2 space-y-2">
          <p className="text-xs text-slate-400">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, idx) => (
              <Button
                key={idx}
                size="sm"
                variant="outline"
                onClick={() => handleSuggestion(suggestion)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-6 border-t border-slate-700 space-y-3">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => {
              setInput(e.target.value);
              setSelectedSubsystem(detectSubsystem(e.target.value));
            }}
            onKeyPress={e => e.key === 'Enter' && handleSendCommand()}
            placeholder="Type a command... (e.g., 'Publish new track to Rockin Rockin Boogie')"
            className="bg-slate-700 border-slate-600 text-white flex-1"
            disabled={loading}
          />
          <Button
            onClick={handleSendCommand}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        {selectedSubsystem && (
          <p className="text-xs text-slate-400">
            Detected subsystem: <span className="text-blue-400 font-semibold">{selectedSubsystem}</span>
          </p>
        )}
      </div>
    </div>
  );
}
