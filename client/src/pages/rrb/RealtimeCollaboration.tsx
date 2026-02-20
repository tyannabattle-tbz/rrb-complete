import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Radio, MessageSquare, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface CollaborationSession {
  id: string;
  title: string;
  participants: string[];
  isLive: boolean;
  startTime: Date;
  frequency: number;
}

export default function RealtimeCollaboration() {
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [activeSession, setActiveSession] = useState<CollaborationSession | null>(null);
  const [messages, setMessages] = useState<Array<{ user: string; text: string; time: Date }>>([]);
  const [messageInput, setMessageInput] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws/collaboration`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected for real-time collaboration');
        toast.success('Connected to collaboration server');
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'session_update') {
          setSessions(data.sessions);
        } else if (data.type === 'message') {
          setMessages(prev => [...prev, {
            user: data.user,
            text: data.text,
            time: new Date(data.timestamp)
          }]);
        } else if (data.type === 'participant_joined') {
          if (activeSession) {
            setActiveSession({
              ...activeSession,
              participants: [...activeSession.participants, data.user]
            });
            toast.info(`${data.user} joined the session`);
          }
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error - retrying...');
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        // Attempt reconnection after 3 seconds
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      toast.error('Failed to connect to collaboration server');
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleStartSession = () => {
    const newSession: CollaborationSession = {
      id: `session-${Date.now()}`,
      title: `Co-Host Session ${new Date().toLocaleTimeString()}`,
      participants: ['You'],
      isLive: true,
      startTime: new Date(),
      frequency: 528
    };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'start_session',
        session: newSession
      }));
      setActiveSession(newSession);
      toast.success('Live collaboration session started');
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeSession) return;

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        sessionId: activeSession.id,
        text: messageInput,
        user: 'You'
      }));
      setMessageInput('');
    }
  };

  const handleJoinSession = (session: CollaborationSession) => {
    setActiveSession(session);
    setMessages([]);
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'join_session',
        sessionId: session.id
      }));
    }
    
    toast.success(`Joined: ${session.title}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Radio className="w-10 h-10 text-blue-400" />
            Real-Time Collaboration
          </h1>
          <p className="text-slate-400">Co-host broadcasts across all divisions with live chat</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Session */}
          {activeSession && (
            <div className="lg:col-span-2">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    {activeSession.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Participants */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Participants ({activeSession.participants.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {activeSession.participants.map((participant, idx) => (
                        <span key={`item-${idx}`} className="px-3 py-1 bg-blue-600/20 border border-blue-500/50 rounded-full text-sm text-blue-300">
                          {participant}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Frequency Display */}
                  <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <p className="text-slate-400 text-sm mb-1">Current Frequency</p>
                    <p className="text-2xl font-bold text-blue-400">{activeSession.frequency} Hz</p>
                  </div>

                  {/* Chat Messages */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Live Chat
                    </h3>
                    <div className="bg-slate-700/30 rounded-lg p-4 h-64 overflow-y-auto space-y-2 border border-slate-600">
                      {messages.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-8">No messages yet</p>
                      ) : (
                        messages.map((msg, idx) => (
                          <div key={`item-${idx}`} className="text-sm">
                            <span className="font-semibold text-blue-400">{msg.user}:</span>
                            <span className="text-slate-300 ml-2">{msg.text}</span>
                            <span className="text-slate-600 text-xs ml-2">{msg.time.toLocaleTimeString()}</span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <Button
                        onClick={handleSendMessage}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Available Sessions */}
          <div>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Available Sessions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sessions.length === 0 ? (
                  <p className="text-slate-400 text-sm">No active sessions</p>
                ) : (
                  sessions.map(session => (
                    <div
                      key={session.id}
                      className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-blue-500 cursor-pointer transition"
                      onClick={() => handleJoinSession(session)}
                    >
                      <p className="font-semibold text-white text-sm">{session.title}</p>
                      <p className="text-slate-400 text-xs">{session.participants.length} participants</p>
                      <p className="text-blue-400 text-xs mt-1">{session.frequency} Hz</p>
                    </div>
                  ))
                )}

                <Button
                  onClick={handleStartSession}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Radio className="w-4 h-4 mr-2" />
                  Start New Session
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
