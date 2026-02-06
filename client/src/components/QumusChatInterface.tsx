import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ChatHeader } from './ChatHeader';
import { Send, Loader, Upload, X, FileIcon, Music, Image as ImageIcon } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  fileData?: {
    fileName: string;
    fileType: string;
    fileSize: number;
    s3Url?: string;
  };
}

interface FileUploadState {
  file: File | null;
  progress: number;
  uploading: boolean;
  error: string | null;
}

export function QumusChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Welcome to Qumus! I\'m QUMUS, your autonomous orchestration engine. I operate at 90%+ autonomy managing 8 decision policies and 11+ service integrations. I can help you with video generation, watermarking, batch processing, HybridCast widgets, analytics, and more. What would you like to know?',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [fileUpload, setFileUpload] = useState<FileUploadState>({
    file: null,
    progress: 0,
    uploading: false,
    error: null,
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use tRPC mutation for chat
  const chatMutation = trpc.ai.qumusChat.chat.useMutation({
    onSuccess: (data) => {
      const messageContent = typeof data.message === 'string' 
        ? data.message 
        : Array.isArray(data.message) 
          ? JSON.stringify(data.message)
          : 'I encountered an error processing your request.';
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: messageContent,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const uploadFileMutation = trpc.qumusFileUpload.uploadFile.useMutation({
    onSuccess: (data) => {
      toast.success(`File uploaded: ${data.metadata.originalName}`);
      const fileMessage: Message = {
        role: 'user',
        content: `Uploaded file: ${data.metadata.originalName}`,
        timestamp: Date.now(),
        fileData: {
          fileName: data.metadata.originalName,
          fileType: data.metadata.fileType,
          fileSize: data.metadata.size,
          s3Url: data.s3Url,
        },
      };
      setMessages(prev => [...prev, fileMessage]);
      setFileUpload({ file: null, progress: 0, uploading: false, error: null });
    },
    onError: (error) => {
      const errorMsg = error.message || 'File upload failed';
      toast.error(errorMsg);
      setFileUpload(prev => ({ ...prev, error: errorMsg, uploading: false }));
    },
  });

  const handleFileSelect = async (file: File) => {
    try {
      // Validate file - queries are synchronous in tRPC
      // We'll skip validation for now and let the server handle it
      setFileUpload({ file, progress: 0, uploading: true, error: null });

      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = (e.target?.result as string).split(',')[1];
        await uploadFileMutation.mutateAsync({
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          base64Data,
          description: `File uploaded from QUMUS chat`,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to process file');
      setFileUpload(prev => ({ ...prev, uploading: false }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Call the QUMUS chat API using tRPC
    await chatMutation.mutateAsync({
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      query: input,
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'audio') return <Music className="w-4 h-4" />;
    if (fileType === 'image') return <ImageIcon className="w-4 h-4" />;
    return <FileIcon className="w-4 h-4" />;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <ChatHeader />

      {/* Messages Container */}
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
              <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-900 border border-slate-200 rounded-bl-none px-4 py-3 rounded-lg">
              <Loader className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* File Upload Display */}
      {fileUpload.file && (
        <div className="border-t border-slate-200 bg-blue-50 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getFileIcon(fileUpload.file.type)}
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{fileUpload.file.name}</p>
              <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${fileUpload.progress}%` }}
                />
              </div>
            </div>
          </div>
          <button
            onClick={() => setFileUpload({ file: null, progress: 0, uploading: false, error: null })}
            disabled={fileUpload.uploading}
            className="p-1 hover:bg-blue-100 rounded"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      )}

      {/* Error Display */}
      {fileUpload.error && (
        <div className="border-t border-slate-200 bg-red-50 p-3 text-sm text-red-700">
          {fileUpload.error}
        </div>
      )}

      {/* Input Area */}
      <div
        className={`border-t border-slate-200 bg-white p-4 transition-colors ${
          dragActive ? 'bg-blue-50' : ''
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.mp3,.wav,.ogg,.webm,.m4a"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={fileUpload.uploading || chatMutation.isPending}
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
            placeholder="Type your message or drag files here..."
            disabled={chatMutation.isPending || fileUpload.uploading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={chatMutation.isPending || !input.trim() || fileUpload.uploading}
            className="gap-2"
          >
            {chatMutation.isPending ? (
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
