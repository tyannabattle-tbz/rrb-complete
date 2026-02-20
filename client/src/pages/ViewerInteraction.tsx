import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  PieChart,
  HelpCircle,
  Zap,
  Trophy,
  Send,
  Heart,
  Share2,
  TrendingUp,
} from 'lucide-react';

interface Poll {
  id: string;
  question: string;
  options: { text: string; votes: number }[];
  totalVotes: number;
  endsAt: Date;
  active: boolean;
}

interface QAItem {
  id: string;
  question: string;
  askedBy: string;
  timestamp: Date;
  likes: number;
  answered: boolean;
  answer?: string;
}

interface SuperChat {
  id: string;
  userName: string;
  message: string;
  amount: number;
  color: string;
  timestamp: Date;
  highlighted: boolean;
}

interface LeaderboardEntry {
  rank: number;
  userName: string;
  superChats: number;
  totalSpent: number;
  badge: string;
}

const ACTIVE_POLL: Poll = {
  id: 'poll_1',
  question: 'What should be the next episode topic?',
  options: [
    { text: 'AI and Entertainment', votes: 245 },
    { text: 'Music Production', votes: 189 },
    { text: 'Streaming Technology', votes: 156 },
    { text: 'Community Building', votes: 203 },
  ],
  totalVotes: 793,
  endsAt: new Date(Date.now() + 5 * 60 * 1000),
  active: true,
};

const QA_ITEMS: QAItem[] = [
  {
    id: 'qa_1',
    question: 'How do you manage multiple streams simultaneously?',
    askedBy: 'StreamEnthusiast',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    likes: 45,
    answered: true,
    answer: 'We use a custom orchestration system that handles multi-platform sync...',
  },
  {
    id: 'qa_2',
    question: 'What audio equipment do you recommend?',
    askedBy: 'AudioNerd',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    likes: 32,
    answered: false,
  },
  {
    id: 'qa_3',
    question: 'How can I get verified on the platform?',
    askedBy: 'NewCreator',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    likes: 28,
    answered: true,
    answer: 'Complete identity verification and meet engagement requirements...',
  },
];

const SUPER_CHATS: SuperChat[] = [
  {
    id: 'sc_1',
    userName: 'GoldenSupporter',
    message: 'Amazing content! Keep it up! 🔥',
    amount: 50,
    color: 'bg-yellow-600',
    timestamp: new Date(Date.now() - 1 * 60 * 1000),
    highlighted: true,
  },
  {
    id: 'sc_2',
    userName: 'PlatinumFan',
    message: 'This is exactly what I needed to hear!',
    amount: 100,
    color: 'bg-blue-600',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    highlighted: true,
  },
  {
    id: 'sc_3',
    userName: 'RegularViewer',
    message: 'Thanks for the stream!',
    amount: 5,
    color: 'bg-green-600',
    timestamp: new Date(Date.now() - 3 * 60 * 1000),
    highlighted: false,
  },
];

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userName: 'PlatinumFan', superChats: 245, totalSpent: 12450, badge: '👑' },
  { rank: 2, userName: 'GoldenSupporter', superChats: 189, totalSpent: 8920, badge: '⭐' },
  { rank: 3, userName: 'DiamondMember', superChats: 156, totalSpent: 7840, badge: '💎' },
  { rank: 4, userName: 'TopContributor', superChats: 134, totalSpent: 6720, badge: '🏆' },
  { rank: 5, userName: 'CommunityHero', superChats: 98, totalSpent: 4920, badge: '❤️' },
];

export function ViewerInteraction() {
  const [selectedTab, setSelectedTab] = useState<'polls' | 'qa' | 'superchat' | 'leaderboard'>('polls');
  const [userVote, setUserVote] = useState<number | null>(null);
  const [qaQuestion, setQaQuestion] = useState('');
  const [superChatMessage, setSuperChatMessage] = useState('');
  const [superChatAmount, setSuperChatAmount] = useState(5);
  const [superChats, setSuperChats] = useState(SUPER_CHATS);

  const handleVote = (optionIndex: number) => {
    setUserVote(optionIndex);
  };

  const handleAskQuestion = () => {
    if (qaQuestion.trim()) {
      // Handle question submission
      setQaQuestion('');
    }
  };

  const handleSuperChat = () => {
    if (superChatMessage.trim()) {
      const newChat: SuperChat = {
        id: `sc_${Date.now()}`,
        userName: 'CurrentUser',
        message: superChatMessage,
        amount: superChatAmount,
        color: 'bg-purple-600',
        timestamp: new Date(),
        highlighted: superChatAmount >= 50,
      };
      setSuperChats([newChat, ...superChats]);
      setSuperChatMessage('');
    }
  };

  const getTotalVotes = () => ACTIVE_POLL.options.reduce((sum, opt) => sum + opt.votes, 0);
  const totalVotes = getTotalVotes();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-black bg-opacity-50 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-blue-500" /> Viewer Interaction
          </h1>
          <p className="text-gray-400 mt-2">Engage with your audience in real-time</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'polls', label: 'Polls', icon: PieChart },
            { id: 'qa', label: 'Q&A', icon: HelpCircle },
            { id: 'superchat', label: 'Super Chat', icon: Zap },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              variant={selectedTab === tab.id ? 'default' : 'outline'}
              className="gap-2 whitespace-nowrap"
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </Button>
          ))}
        </div>

        {/* Polls Tab */}
        {selectedTab === 'polls' && (
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">{ACTIVE_POLL.question}</h2>
            <div className="space-y-3 mb-6">
              {ACTIVE_POLL.options.map((option, idx) => {
                const percentage = (option.votes / totalVotes) * 100;
                const isSelected = userVote === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => handleVote(idx)}
                    className={`p-4 rounded border-2 transition cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-900 bg-opacity-30'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">{option.text}</span>
                      <span className="text-gray-400 text-sm">{option.votes} votes</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-right text-gray-400 text-sm mt-1">{percentage.toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Submit Vote</Button>
          </Card>
        )}

        {/* Q&A Tab */}
        {selectedTab === 'qa' && (
          <div className="space-y-6">
            {/* Ask Question */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Ask a Question</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={qaQuestion}
                  onChange={(e) => setQaQuestion(e.target.value)}
                  placeholder="What would you like to ask?"
                  className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2"
                />
                <Button onClick={handleAskQuestion} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4" /> Ask
                </Button>
              </div>
            </Card>

            {/* Questions List */}
            <div className="space-y-3">
              {QA_ITEMS.map((item) => (
                <Card key={item.id} className="bg-gray-800 border-gray-700 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-semibold">{item.question}</p>
                      <p className="text-gray-400 text-sm">
                        Asked by {item.askedBy} • {item.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Heart className="w-4 h-4" /> {item.likes}
                    </Button>
                  </div>
                  {item.answered && (
                    <div className="mt-3 p-3 bg-green-900 bg-opacity-30 border border-green-700 rounded">
                      <p className="text-green-300 text-sm font-semibold mb-1">Answered:</p>
                      <p className="text-gray-300 text-sm">{item.answer}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Super Chat Tab */}
        {selectedTab === 'superchat' && (
          <div className="space-y-6">
            {/* Send Super Chat */}
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Send a Super Chat</h3>
              <div className="space-y-3">
                <textarea
                  value={superChatMessage}
                  onChange={(e) => setSuperChatMessage(e.target.value)}
                  placeholder="Send a message with your Super Chat..."
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 h-24"
                />
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-gray-400 text-sm">Amount ($)</label>
                    <select
                      value={superChatAmount}
                      onChange={(e) => setSuperChatAmount(Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 mt-1"
                    >
                      <option value={1}>$1</option>
                      <option value={5}>$5</option>
                      <option value={10}>$10</option>
                      <option value={50}>$50</option>
                      <option value={100}>$100</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleSuperChat} className="gap-2 bg-purple-600 hover:bg-purple-700">
                      <Zap className="w-4 h-4" /> Send
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Super Chats Feed */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Live Super Chats</h3>
              {superChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 rounded border-l-4 ${chat.color} ${
                    chat.highlighted ? 'scale-105 origin-left' : ''
                  } transition`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white font-bold">{chat.userName}</p>
                      <p className="text-gray-300 text-sm">{chat.message}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">${chat.amount}</p>
                      <p className="text-gray-400 text-xs">{chat.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {selectedTab === 'leaderboard' && (
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" /> Top Supporters
            </h2>
            <div className="space-y-2">
              {LEADERBOARD.map((entry) => (
                <div key={entry.rank} className="p-4 bg-gray-700 rounded flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-yellow-400 w-8 text-center">{entry.badge}</div>
                    <div>
                      <p className="text-white font-semibold">#{entry.rank} {entry.userName}</p>
                      <p className="text-gray-400 text-sm">{entry.superChats} Super Chats</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold">${entry.totalSpent.toLocaleString()}</p>
                    <p className="text-gray-400 text-sm">Total Spent</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
