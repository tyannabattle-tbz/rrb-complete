'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, TrendingUp, BarChart3, Send } from 'lucide-react';

interface Survey {
  id: string;
  question: string;
  type: 'rating' | 'text' | 'multiple-choice';
  options?: string[];
  responses: number;
  averageScore?: number;
}

interface EpisodeFeedback {
  episodeId: string;
  episodeTitle: string;
  averageRating: number;
  totalRatings: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  topComments: string[];
}

const mockSurveys: Survey[] = [
  {
    id: '1',
    question: 'How would you rate this episode?',
    type: 'rating',
    responses: 1240,
    averageScore: 4.6,
  },
  {
    id: '2',
    question: 'What was your favorite part?',
    type: 'text',
    responses: 856,
  },
  {
    id: '3',
    question: 'Would you recommend this podcast?',
    type: 'multiple-choice',
    options: ['Definitely', 'Probably', 'Maybe', 'Unlikely', 'No'],
    responses: 1100,
  },
];

const mockEpisodeFeedback: EpisodeFeedback[] = [
  {
    episodeId: '42',
    episodeTitle: 'The Future of AI in Music Production',
    averageRating: 4.7,
    totalRatings: 2340,
    sentiment: 'positive',
    sentimentScore: 0.89,
    topComments: [
      'Absolutely loved this episode!',
      'Great insights on AI and creativity',
      'Best episode yet!',
    ],
  },
  {
    episodeId: '41',
    episodeTitle: 'Behind the Scenes of Studio Production',
    averageRating: 4.5,
    totalRatings: 1890,
    sentiment: 'positive',
    sentimentScore: 0.82,
    topComments: [
      'Very informative',
      'Loved the production tips',
      'More episodes like this please',
    ],
  },
];

export default function ListenerFeedbackLoop() {
  const [activeTab, setActiveTab] = useState<'surveys' | 'feedback' | 'analytics'>('surveys');
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Listener Feedback Loop</h1>
          <p className="text-slate-400">
            Gather listener insights, improve content, and drive engagement through feedback
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-700">
          {['surveys', 'feedback', 'analytics'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-semibold transition ${
                activeTab === tab
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Surveys Tab */}
        {activeTab === 'surveys' && (
          <div className="space-y-6">
            {/* Active Surveys */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Active Surveys</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockSurveys.map(survey => (
                  <Card key={survey.id} className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">{survey.question}</CardTitle>
                      <CardDescription>{survey.responses.toLocaleString()} responses</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {survey.type === 'rating' && survey.averageScore && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  className={`w-5 h-5 ${
                                    star <= Math.round(survey.averageScore!)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-slate-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-white font-bold">{survey.averageScore.toFixed(1)}/5</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full"
                              style={{ width: `${(survey.averageScore / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {survey.type === 'multiple-choice' && survey.options && (
                        <div className="space-y-2">
                          {survey.options.map(option => (
                            <div key={option} className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-700 rounded h-8 flex items-center px-3">
                                <span className="text-slate-300 text-sm">{option}</span>
                              </div>
                              <span className="text-slate-400 text-sm w-12 text-right">
                                {Math.floor(Math.random() * 30)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        View Detailed Results
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Create New Survey */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Create New Survey</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-semibold mb-2">Survey Question</label>
                  <input
                    type="text"
                    placeholder="What would you like to ask your listeners?"
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-semibold mb-2">Survey Type</label>
                  <select className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-purple-500 outline-none">
                    <option>Rating (1-5 stars)</option>
                    <option>Multiple Choice</option>
                    <option>Open Text</option>
                    <option>Yes/No</option>
                  </select>
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Create Survey
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            {mockEpisodeFeedback.map(episode => (
              <Card key={episode.episodeId} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white">{episode.episodeTitle}</CardTitle>
                      <CardDescription>Episode #{episode.episodeId}</CardDescription>
                    </div>
                    <Badge
                      className={`${
                        episode.sentiment === 'positive'
                          ? 'bg-green-900/30 text-green-300 border-green-500'
                          : episode.sentiment === 'neutral'
                            ? 'bg-yellow-900/30 text-yellow-300 border-yellow-500'
                            : 'bg-red-900/30 text-red-300 border-red-500'
                      }`}
                    >
                      {episode.sentiment.charAt(0).toUpperCase() + episode.sentiment.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Rating Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Average Rating</p>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= Math.round(episode.averageRating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-white font-bold">{episode.averageRating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Total Ratings</p>
                      <p className="text-white font-bold text-lg">{episode.totalRatings.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Sentiment Score */}
                  <div>
                    <p className="text-slate-400 text-sm mb-2">Sentiment Score</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full"
                          style={{ width: `${episode.sentimentScore * 100}%` }}
                        />
                      </div>
                      <span className="text-white font-bold">{(episode.sentimentScore * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Top Comments */}
                  <div>
                    <p className="text-white font-semibold mb-3">Top Comments</p>
                    <div className="space-y-2">
                      {episode.topComments.map((comment, idx) => (
                        <div key={idx} className="bg-slate-700 rounded p-3">
                          <p className="text-slate-300 text-sm">"{comment}"</p>
                          <p className="text-slate-500 text-xs mt-1">👍 234 likes</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Feedback', value: '12,450', icon: MessageSquare, color: 'blue' },
              { label: 'Avg Rating', value: '4.6/5', icon: Star, color: 'yellow' },
              { label: 'Positive Sentiment', value: '87%', icon: TrendingUp, color: 'green' },
              { label: 'Response Rate', value: '34%', icon: BarChart3, color: 'purple' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card key={idx} className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">{stat.label}</p>
                        <p className="text-white text-2xl font-bold mt-1">{stat.value}</p>
                      </div>
                      <Icon className={`w-8 h-8 text-${stat.color}-400`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
