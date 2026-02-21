import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, Send, MessageCircle, Users, Share2, Download, Volume2, VolumeX } from 'lucide-react';

interface ChatMessage {
  id: string;
  author: string;
  message: string;
  timestamp: string;
  likes: number;
}

interface Question {
  id: string;
  author: string;
  question: string;
  votes: number;
  answered: boolean;
}

export default function BroadcastViewer() {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      author: 'Global Viewer',
      message: 'Amazing broadcast! Looking forward to hearing from the panelists.',
      timestamp: '2:34 PM',
      likes: 24,
    },
    {
      id: '2',
      author: 'UN WCS Participant',
      message: 'Great to see this important discussion happening globally.',
      timestamp: '2:33 PM',
      likes: 18,
    },
  ]);

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      author: 'Climate Advocate',
      question: 'What are the most urgent climate actions needed in the next 5 years?',
      votes: 234,
      answered: false,
    },
    {
      id: '2',
      author: 'Policy Expert',
      question: 'How can developing nations access climate financing?',
      votes: 156,
      answered: false,
    },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'qa'>('chat');
  const [viewers, setViewers] = useState(47823);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        author: 'You',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        likes: 0,
      };
      setChatMessages([message, ...chatMessages]);
      setNewMessage('');
    }
  };

  const handleSubmitQuestion = () => {
    if (newQuestion.trim()) {
      const question: Question = {
        id: Date.now().toString(),
        author: 'You',
        question: newQuestion,
        votes: 0,
        answered: false,
      };
      setQuestions([question, ...questions]);
      setNewQuestion('');
    }
  };

  const handleUpvoteQuestion = (questionId: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? { ...q, votes: q.votes + 1 }
          : q
      )
    );
  };

  const handleLikeMessage = (messageId: string) => {
    setChatMessages(prev =>
      prev.map(m =>
        m.id === messageId
          ? { ...m, likes: m.likes + 1 }
          : m
      )
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-4">
        {/* Live Indicator */}
        <div className="mb-4 flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="font-semibold">LIVE NOW</span>
          <span className="text-gray-400 ml-4">
            👥 {viewers.toLocaleString()} watching
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-lg overflow-hidden mb-4">
              {/* Video Player */}
              <div className="aspect-video bg-black relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
                <div className="text-center z-10">
                  <div className="text-6xl mb-4">🎥</div>
                  <p className="text-xl text-gray-300">UN WCS Parallel Event - Live Stream</p>
                  <p className="text-sm text-gray-400 mt-2">March 17, 2026 • Rockin' Rockin' Boogie</p>
                </div>

                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-white hover:bg-white/20"
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </Button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm text-gray-300 w-8">{volume}%</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                        <Share2 className="w-4 h-4 mr-2" /> Share
                      </Button>
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                        <Download className="w-4 h-4 mr-2" /> Record
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Info */}
              <div className="p-4 bg-gray-900">
                <h1 className="text-2xl font-bold mb-2">
                  UN WCS Parallel Event: Global Perspectives on Sustainable Development
                </h1>
                <p className="text-gray-300 mb-4">
                  Join us for an important discussion featuring panelists from around the world discussing
                  climate action, sustainable development, and global cooperation.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge>Climate Action</Badge>
                  <Badge>Sustainable Development</Badge>
                  <Badge>Global Cooperation</Badge>
                  <Badge variant="outline">Live Q&A</Badge>
                </div>
              </div>
            </div>

            {/* Engagement Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-blue-400">{viewers.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Viewers Worldwide</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-green-400">{questions.length}</div>
                  <div className="text-sm text-gray-400">Questions Submitted</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-purple-400">{chatMessages.length}</div>
                  <div className="text-sm text-gray-400">Chat Messages</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar - Chat & Q&A */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-800 h-[600px] flex flex-col">
              <CardHeader className="border-b border-gray-800">
                <div className="flex gap-2">
                  <Button
                    variant={activeTab === 'chat' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('chat')}
                    className="flex-1"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" /> Chat
                  </Button>
                  <Button
                    variant={activeTab === 'qa' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('qa')}
                    className="flex-1"
                  >
                    Q&A
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-3 space-y-3">
                {activeTab === 'chat' ? (
                  <>
                    {chatMessages.map(msg => (
                      <div key={msg.id} className="bg-gray-800 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">{msg.author}</span>
                          <span className="text-xs text-gray-400">{msg.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-200 mb-2">{msg.message}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleLikeMessage(msg.id)}
                          className="text-xs text-gray-400 hover:text-red-400"
                        >
                          <Heart className="w-3 h-3 mr-1" /> {msg.likes}
                        </Button>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {questions.map(q => (
                      <div key={q.id} className="bg-gray-800 p-3 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-semibold text-sm">{q.author}</span>
                          {q.answered && <Badge className="bg-green-600">Answered</Badge>}
                        </div>
                        <p className="text-sm text-gray-200 mb-2">{q.question}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpvoteQuestion(q.id)}
                          className="text-xs text-gray-400 hover:text-blue-400"
                        >
                          👍 {q.votes} votes
                        </Button>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>

              <div className="border-t border-gray-800 p-3">
                {activeTab === 'chat' ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Send a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <Button
                      size="sm"
                      onClick={handleSendMessage}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Input
                      placeholder="Ask a question..."
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmitQuestion()}
                      className="bg-gray-800 border-gray-700 text-white text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={handleSubmitQuestion}
                      className="bg-blue-600 hover:bg-blue-700 w-full"
                    >
                      Submit Question
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
