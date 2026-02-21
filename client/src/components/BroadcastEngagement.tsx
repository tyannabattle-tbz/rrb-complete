import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, HelpCircle, BarChart3, Send, Heart, Flag } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface ChatMessage {
  id: string;
  username: string;
  content: string;
  timestamp: Date;
  likes: number;
  isModerated: boolean;
  isPinned: boolean;
}

interface Question {
  id: string;
  username: string;
  question: string;
  timestamp: Date;
  votes: number;
  answered: boolean;
}

interface Poll {
  id: string;
  question: string;
  options: Array<{ id: string; text: string; votes: number }>;
  totalVotes: number;
  isActive: boolean;
}

interface BroadcastEngagementProps {
  broadcastId: string;
}

export default function BroadcastEngagement({ broadcastId }: BroadcastEngagementProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'qa' | 'polls'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [username, setUsername] = useState('Anonymous');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat messages
  const { data: chatData } = trpc.broadcast.getChatMessages.useQuery({
    broadcastId,
    limit: 50,
  });

  // Add chat message mutation
  const addMessageMutation = trpc.broadcast.addChatMessage.useMutation({
    onSuccess: (data) => {
      setNewMessage('');
      // Refetch messages
    },
  });

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update messages from API
  useEffect(() => {
    if (chatData) {
      setMessages(chatData as ChatMessage[]);
    }
  }, [chatData]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    await addMessageMutation.mutateAsync({
      broadcastId,
      username,
      content: newMessage,
      language: 'en',
    });
  };

  const handleAskQuestion = () => {
    if (!newQuestion.trim()) return;

    const question: Question = {
      id: Date.now().toString(),
      username,
      question: newQuestion,
      timestamp: new Date(),
      votes: 0,
      answered: false,
    };

    setQuestions([question, ...questions]);
    setNewQuestion('');
  };

  const handleVoteQuestion = (questionId: string) => {
    setQuestions(
      questions.map(q =>
        q.id === questionId ? { ...q, votes: q.votes + 1 } : q
      )
    );
  };

  const handleVotePoll = (pollId: string, optionId: string) => {
    setPolls(
      polls.map(poll =>
        poll.id === pollId
          ? {
              ...poll,
              options: poll.options.map(opt =>
                opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
              ),
              totalVotes: poll.totalVotes + 1,
            }
          : poll
      )
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'chat'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <MessageCircle className="w-4 h-4 inline mr-2" />
          Chat
        </button>
        <button
          onClick={() => setActiveTab('qa')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'qa'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <HelpCircle className="w-4 h-4 inline mr-2" />
          Q&A
        </button>
        <button
          onClick={() => setActiveTab('polls')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'polls'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Polls
        </button>
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Live Chat</CardTitle>
            <CardDescription className="text-slate-400">
              {messages.length} messages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages Display */}
            <div className="h-96 overflow-y-auto space-y-3 bg-slate-900 p-4 rounded-lg">
              {messages.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No messages yet. Be the first to chat!</p>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className="text-sm">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-blue-400">{msg.username}</span>
                          {msg.isPinned && <Badge className="bg-yellow-600 text-xs">Pinned</Badge>}
                          {msg.isModerated && <Badge className="bg-red-600 text-xs">Moderated</Badge>}
                        </div>
                        <p className="text-slate-300 mt-1">{msg.content}</p>
                      </div>
                      <button className="text-slate-500 hover:text-red-400 transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Your name (optional)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Q&A Tab */}
      {activeTab === 'qa' && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Questions & Answers</CardTitle>
            <CardDescription className="text-slate-400">
              {questions.length} questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Questions Display */}
            <div className="h-96 overflow-y-auto space-y-3 bg-slate-900 p-4 rounded-lg">
              {questions.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No questions yet. Ask something!</p>
              ) : (
                questions
                  .sort((a, b) => b.votes - a.votes)
                  .map(q => (
                    <div key={q.id} className="p-3 bg-slate-800 rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-green-400">{q.username}</p>
                          <p className="text-slate-300 mt-1">{q.question}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVoteQuestion(q.id)}
                          className="border-slate-600 text-slate-400 hover:text-green-400"
                        >
                          👍 {q.votes}
                        </Button>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Question Input */}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Ask a question..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Button
                onClick={handleAskQuestion}
                disabled={!newQuestion.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Polls Tab */}
      {activeTab === 'polls' && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Live Polls</CardTitle>
            <CardDescription className="text-slate-400">
              {polls.length} active polls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {polls.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No active polls</p>
            ) : (
              polls
                .filter(p => p.isActive)
                .map(poll => (
                  <div key={poll.id} className="space-y-3">
                    <h3 className="font-semibold text-white">{poll.question}</h3>
                    <div className="space-y-2">
                      {poll.options.map(option => {
                        const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0;
                        return (
                          <div key={option.id}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-slate-300">{option.text}</span>
                              <span className="text-sm font-semibold text-purple-400">{percentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                              <div
                                className="bg-purple-500 h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleVotePoll(poll.id, option.id)}
                              className="text-xs mt-1 text-slate-400 hover:text-purple-400"
                            >
                              Vote ({option.votes})
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-slate-500">Total votes: {poll.totalVotes}</p>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
