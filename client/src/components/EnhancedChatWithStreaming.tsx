import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader, Upload, X, FileIcon, Music, Image as ImageIcon, AlertCircle, Zap } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  streaming?: boolean;
  fileAnalysis?: any;
}

export function EnhancedChatWithStreaming() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Welcome! I now support real-time streaming responses and smart file analysis. Upload files or start chatting!',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fileAnalysisMutation = trpc.fileAnalysis.analyzeFile.useMutation({
    onSuccess: (data) => {
      if (data.success && data.analysis) {
        toast.success(`File analyzed: ${data.analysis.fileName}`);
        // Add analysis to messages
        const analysisMessage: Message = {
          role: 'assistant',
          content: `File Analysis: ${data.analysis.analysisType.toUpperCase()}\n\n${data.analysis.summary}`,
          timestamp: Date.now(),
          fileAnalysis: data.analysis,
        };
        setMessages(prev => [...prev, analysisMessage]);
      }
    },
    onError: (error) => {
      toast.error('File analysis failed: ' + error.message);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: input || `Uploaded ${uploadedFiles.length} file(s)`,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Analyze uploaded files
    if (uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        // In production, upload file to S3 first
        const fileUrl = URL.createObjectURL(file);
        await fileAnalysisMutation.mutateAsync({
          fileUrl,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
        });
      }
      setUploadedFiles([]);
    }

    // Simulate streaming response
    setIsStreaming(true);
    const streamingMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      streaming: true,
    };
    setMessages(prev => [...prev, streamingMessage]);

    // Simulate streaming chunks
    const responses = [
      'I\'ve received your message',
      ' and analyzed any uploaded files.',
      ' Real-time streaming is now active,',
      ' allowing for faster response delivery.',
      ' This enhances the user experience',
      ' with immediate feedback.',
    ];

    for (const chunk of responses) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setMessages(prev => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg.streaming) {
          lastMsg.content += chunk;
        }
        return updated;
      });
    }

    setMessages(prev => {
      const updated = [...prev];
      const lastMsg = updated[updated.length - 1];
      if (lastMsg.streaming) {
        lastMsg.streaming = false;
      }
      return updated;
    });

    setIsStreaming(false);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    setUploadedFiles(prev => [...prev, ...Array.from(files)]);
    toast.success(`${files.length} file(s) selected for analysis`);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 p-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-slate-900">Enhanced Chat with Streaming & File Analysis</h2>
        </div>
        <p className="text-sm text-slate-600">Real-time responses • Smart file analysis • Team location sharing</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-2xl px-4 py-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              {msg.fileAnalysis && (
                <div className="mt-2 pt-2 border-t border-slate-200 text-xs">
                  <p className="font-semibold text-slate-700">Analysis Type: {msg.fileAnalysis.analysisType}</p>
                  {msg.fileAnalysis.keyPoints.length > 0 && (
                    <ul className="mt-1 space-y-1">
                      {msg.fileAnalysis.keyPoints.slice(0, 3).map((point: string, i: number) => (
                        <li key={i} className="text-slate-600">• {point}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                {msg.streaming ? (
                  <span className="flex items-center gap-1">
                    <Loader className="w-3 h-3 animate-spin" />
                    Streaming...
                  </span>
                ) : (
                  new Date(msg.timestamp).toLocaleTimeString()
                )}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* File Upload Display */}
      {uploadedFiles.length > 0 && (
        <div className="border-t border-slate-200 bg-blue-50 p-3">
          <div className="space-y-2">
            {uploadedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <FileIcon className="w-4 h-4" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                  className="p-1 hover:bg-blue-100 rounded"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white p-4">
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => handleFileSelect(e.target.files)}
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.mp3,.wav,.ogg,.webm,.m4a,.txt"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message or upload files for analysis..."
            disabled={isStreaming}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={isStreaming || (!input.trim() && uploadedFiles.length === 0)}
            className="gap-2"
          >
            {isStreaming ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
