import React, { useState } from 'react';
import { Phone, PhoneOff, Users, Clock, CheckCircle, AlertCircle, Gamepad2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';

export const CallInInterface: React.FC<{ stationId: number }> = ({ stationId }) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'queue' | 'active' | 'history' | 'stats'>('queue');
  const [formData, setFormData] = useState({
    callerName: '',
    callerEmail: '',
    topic: '',
    question: '',
  });

  // Fetch data
  const { data: queue } = trpc.callIn.getCallQueue.useQuery({ stationId });
  const { data: activeCall } = trpc.callIn.getActiveCall.useQuery({ stationId });
  const { data: history } = trpc.callIn.getCallHistory.useQuery({ stationId });
  const { data: stats } = trpc.callIn.getCallStatistics.useQuery({ stationId });
  const { data: gameStatus } = trpc.callIn.getMobileGameStatus.useQuery({ stationId });
  const { data: suggestions } = trpc.callIn.getCallScreeningSuggestions.useQuery({
    stationId,
    topic: formData.topic || 'general',
  });

  // Mutations
  const submitCall = trpc.callIn.submitCallRequest.useMutation();
  const getNextCall = trpc.callIn.getNextCall.useMutation();
  const endCall = trpc.callIn.endCall.useMutation();

  const handleSubmitCall = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitCall.mutateAsync({
      stationId,
      callerId: `caller-${Date.now()}`,
      callerName: formData.callerName,
      callerEmail: formData.callerEmail,
      topic: formData.topic,
      question: formData.question,
    });
    setFormData({ callerName: '', callerEmail: '', topic: '', question: '' });
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Live Call-In System</h2>
          <p className="text-muted-foreground">Interactive radio with AI moderation</p>
        </div>
        <Badge variant={activeCall ? 'default' : 'secondary'} className="text-base px-4 py-2">
          {activeCall ? '🔴 LIVE' : '⚪ STANDBY'}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {(['submit', 'queue', 'active', 'history', 'stats'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'submit' && 'Submit Call'}
            {tab === 'queue' && 'Queue'}
            {tab === 'active' && 'On Air'}
            {tab === 'history' && 'History'}
            {tab === 'stats' && 'Statistics'}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'submit' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Submit Your Call</CardTitle>
              <CardDescription>Join our live show and share your thoughts</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitCall} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Name</label>
                    <Input
                      value={formData.callerName}
                      onChange={(e) => setFormData({ ...formData, callerName: e.target.value })}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input
                      type="email"
                      value={formData.callerEmail}
                      onChange={(e) => setFormData({ ...formData, callerEmail: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Topic</label>
                  <Input
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="What's your topic?"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Question/Comment</label>
                  <Textarea
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="What would you like to say?"
                    rows={4}
                    required
                  />
                </div>

                <Button type="submit" className="w-full gap-2" disabled={submitCall.isPending}>
                  <Phone className="w-4 h-4" />
                  {submitCall.isPending ? 'Submitting...' : 'Submit Call Request'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Screening Tips */}
          {suggestions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Screening Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Good Questions:</p>
                  <ul className="space-y-1">
                    {suggestions.suggestedQuestions.slice(0, 3).map((q, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex gap-2">
                        <span className="text-primary">•</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium text-foreground mb-2">Watch For:</p>
                  <ul className="space-y-1">
                    {suggestions.potentialIssues.slice(0, 3).map((issue, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex gap-2">
                        <AlertCircle className="w-3 h-3 text-yellow-600 flex-shrink-0 mt-0.5" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'queue' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Call Queue ({queue?.calls.length || 0} waiting)
            </CardTitle>
            <CardDescription>Average wait time: {Math.round(queue?.averageWaitTime || 0)} minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {queue?.calls && queue.calls.length > 0 ? (
                queue.calls.map((call, idx) => (
                  <div key={call.id} className="p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-foreground">#{idx + 1} - {call.callerName}</p>
                        <p className="text-sm text-muted-foreground">{call.topic}</p>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.round(
                          (new Date().getTime() - new Date(call.timestamp).getTime()) / 1000 / 60
                        )}{' '}
                        min
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{call.question}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        Score: {call.moderationScore?.toFixed(0) || 'N/A'}
                      </Badge>
                      {call.moderationScore && call.moderationScore > 80 && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No calls in queue</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeCall ? (
            <>
              <Card className="border-green-500/50 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-green-600 animate-pulse" />
                    Currently On Air
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Caller</p>
                    <p className="text-2xl font-bold text-foreground">{activeCall.callerName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Topic</p>
                      <p className="font-semibold text-foreground">{activeCall.topic}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Moderation Score</p>
                      <p className="font-semibold text-foreground">{activeCall.moderationScore?.toFixed(0) || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Question</p>
                    <p className="text-foreground">{activeCall.question}</p>
                  </div>

                  <Button variant="destructive" className="w-full gap-2" onClick={() => endCall.mutate({ stationId })}>
                    <PhoneOff className="w-4 h-4" />
                    End Call
                  </Button>
                </CardContent>
              </Card>

              {/* Mobile Game */}
              {gameStatus && gameStatus.isActive && (
                <Card className="border-purple-500/50 bg-purple-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gamepad2 className="w-5 h-5 text-purple-600" />
                      Mobile Game Active
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Game Type</span>
                        <span className="font-semibold">{gameStatus.gameType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Participants</span>
                        <span className="font-semibold">{gameStatus.participants}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground py-8">No active calls</p>
                <Button className="w-full gap-2" onClick={() => getNextCall.mutate({ stationId })}>
                  <Zap className="w-4 h-4" />
                  Get Next Call
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Call History</CardTitle>
            <CardDescription>Recent calls from today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history && history.length > 0 ? (
                history.map((call) => (
                  <div key={call.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-foreground">{call.callerName}</p>
                        <p className="text-sm text-muted-foreground">{call.topic}</p>
                      </div>
                      <Badge variant="secondary">{call.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{call.question}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No call history</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Call Volume</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Received</span>
                    <span className="font-semibold">{stats.totalCallsReceived}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">In Queue</span>
                    <span className="font-semibold">{stats.callsInQueue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Duration</span>
                    <span className="font-semibold">{stats.averageCallDuration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Approval Rate</span>
                    <span className="font-semibold">{(stats.approvalRate * 100).toFixed(0)}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sentiment Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Positive</span>
                      <span className="text-sm font-semibold">{(stats.callSentiment.positive * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${stats.callSentiment.positive * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Neutral</span>
                      <span className="text-sm font-semibold">{(stats.callSentiment.neutral * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${stats.callSentiment.neutral * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Negative</span>
                      <span className="text-sm font-semibold">{(stats.callSentiment.negative * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${stats.callSentiment.negative * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Top Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.topTopics.map((topic: any) => (
                      <div key={topic.topic} className="flex items-center justify-between">
                        <span className="text-foreground">{topic.topic}</span>
                        <Badge variant="secondary">{topic.count} calls</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CallInInterface;
