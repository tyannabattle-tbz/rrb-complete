import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ChatHeader } from './ChatHeader';
import { Send, Loader, Upload, X, FileIcon, Music, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useState, useRef, useEffect } from 'react';
import VoiceChat from './VoiceChat';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  fileData?: {
    fileName: string;
    fileType: string;
    fileSize: number;
    s3Url?: string;
  }[];
  error?: string;
}

interface FileUploadState {
  files: File[];
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
    files: [],
    progress: 0,
    uploading: false,
    error: null,
  });
  const [dragActive, setDragActive] = useState(false);
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use tRPC mutation for chat with improved error handling
  const chatMutation = trpc.ai.qumusChat.chat.useMutation({
    onSuccess: (data) => {
      if (!data.success) {
        const errorMessage: Message = {
          role: 'assistant',
          content: data.message || 'I encountered an error processing your request.',
          timestamp: Date.now(),
          error: data.error || 'Unknown error',
        };
        setMessages(prev => [...prev, errorMessage]);
        toast.error('Chat error: ' + (data.error || 'Unknown error'));
        return;
      }

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
      toast.success('Response received');
    },
    onError: (error) => {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
        error: error.message || 'Network error',
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Chat failed: ' + (error.message || 'Unknown error'));
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
      setFileUpload(prev => ({
        ...prev,
        files: prev.files.filter(f => f.name !== data.metadata.originalName),
      }));
    },
    onError: (error) => {
      const errorMsg = error.message || 'File upload failed';
      toast.error(errorMsg);
      setFileUpload(prev => ({ ...prev, error: errorMsg, uploading: false }));
    },
  });

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      const newFiles = Array.from(files);
      setFileUpload(prev => ({
        ...prev,
        files: [...prev.files, ...newFiles],
        uploading: true,
        error: null,
      }));

      // Upload all files in parallel
      let uploadedCount = 0;
      const uploadPromises = newFiles.map(async (file) => {
        try {
          const reader = new FileReader();
          return new Promise<void>((resolve, reject) => {
            reader.onload = async (e) => {
              try {
                const base64Data = (e.target?.result as string).split(',')[1];
                await uploadFileMutation.mutateAsync({
                  fileName: file.name,
                  mimeType: file.type,
                  fileSize: file.size,
                  base64Data,
                  description: `File uploaded from QUMUS chat`,
                });
                uploadedCount++;
                setFileUpload(prev => ({
                  ...prev,
                  progress: Math.round((uploadedCount / newFiles.length) * 100),
                }));
                resolve();
              } catch (error) {
                reject(error);
              }
            };
            reader.onerror = () => reject(new Error('File read failed'));
            reader.readAsDataURL(file);
          });
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          throw error;
        }
      });

      await Promise.all(uploadPromises);
      setFileUpload(prev => ({
        ...prev,
        uploading: false,
        progress: 100,
      }));
      toast.success(`All ${newFiles.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to process files');
      setFileUpload(prev => ({ ...prev, uploading: false, error: 'Upload failed' }));
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
      handleFileSelect(files);
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

    try {
      // Call the QUMUS chat API using tRPC with retry logic
      let retries = 3;
      let lastError: Error | null = null;

      while (retries > 0) {
        try {
          await chatMutation.mutateAsync({
            messages: messages.map(m => ({
              role: m.role,
              content: m.content,
            })),
            query: input,
          });
          break;
        } catch (error) {
          lastError = error as Error;
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          }
        }
      }

      if (retries === 0 && lastError) {
        throw lastError;
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('audio')) return <Music className="w-4 h-4" />;
    if (fileType.startsWith('image')) return <ImageIcon className="w-4 h-4" />;
    return <FileIcon className="w-4 h-4" />;
  };

  const removeFile = (index: number) => {
    setFileUpload(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
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
                  : msg.error
                    ? 'bg-red-50 text-red-900 border border-red-200 rounded-bl-none'
                    : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
              }`}
            >
              {msg.error && (
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-semibold">Error</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              {msg.error && (
                <p className="text-xs mt-2 opacity-75">Details: {msg.error}</p>
              )}
              <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-100' : msg.error ? 'text-red-700' : 'text-slate-400'}`}>
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
      {fileUpload.files.length > 0 && (
        <div className="border-t border-slate-200 bg-blue-50 p-3">
          <div className="space-y-2">
            {fileUpload.files.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(idx)}
                  disabled={fileUpload.uploading}
                  className="p-1 hover:bg-blue-100 rounded"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            ))}
          </div>
          {fileUpload.uploading && (
            <div className="mt-3 w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${fileUpload.progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {fileUpload.error && (
        <div className="border-t border-slate-200 bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
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
              handleFileSelect(e.target.files);
            }}
            multiple
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

      {/* Voice Chat Panel */}
      {showVoiceChat && (
        <div className="mt-4">
          <VoiceChat
            onSendMessage={(message) => {
              setInput(message);
              // Send the message directly
              const userMessage: Message = {
                role: 'user',
                content: message,
                timestamp: Date.now(),
              };
              setMessages(prev => [...prev, userMessage]);
              setShowVoiceChat(false);
              // Trigger the chat mutation
              setTimeout(() => {
                chatMutation.mutate({
                  messages: [...messages, userMessage].map(m => ({
                    role: m.role,
                    content: m.content,
                  })),
                  query: message,
                });
              }, 0);
            }}
            onVoiceInput={(transcript) => {
              setInput(transcript);
            }}
          />
        </div>
      )}

      {/* Voice Chat Toggle Button */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => setShowVoiceChat(!showVoiceChat)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
          {showVoiceChat ? 'Hide Voice Chat' : 'Show Voice Chat'}
        </button>
      </div>
    </div>
  );
}
