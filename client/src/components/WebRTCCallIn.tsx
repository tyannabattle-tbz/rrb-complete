/**
 * WebRTC Call-In Component
 * A Canryn Production
 */
import { useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface CallSession {
  id: string;
  status: 'pending' | 'active' | 'ended';
  callerName: string;
  topic?: string;
  duration?: number;
}

export function WebRTCCallIn({ channelId }: { channelId: string }) {
  const [callerName, setCallerName] = useState('');
  const [topic, setTopic] = useState('');
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const initiateCallMutation = trpc.webrtcCallIn.initiateCall.useMutation();
  const getQueueQuery = trpc.webrtcCallIn.getCallQueue.useQuery({ channelId });

  const handleInitiateCall = async () => {
    if (!callerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      const result = await initiateCallMutation.mutateAsync({
        callerId: `caller-${Date.now()}`,
        callerName,
        channelId,
        topic: topic || undefined,
      });

      setActiveCall({
        id: result.sessionId,
        status: result.status as 'pending' | 'active' | 'ended',
        callerName,
        topic,
      });

      toast.success('Call initiated! You are in the queue.');
      setCallerName('');
      setTopic('');
    } catch (error) {
      toast.error('Failed to initiate call');
    }
  };

  const handleEndCall = async () => {
    if (!activeCall) return;
    setActiveCall(null);
    setCallDuration(0);
    toast.success('Call ended');
  };

  const queue = getQueueQuery.data;
  const queuePosition = queue?.totalWaiting || 0;
  const avgWaitTime = queue?.averageWaitTime || 0;

  if (activeCall) {
    return (
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {activeCall.status === 'active' ? '🎙️ Live Call' : '⏳ Waiting'}
              </h3>
              <p className="text-sm text-gray-600">{activeCall.callerName}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{Math.floor(callDuration / 60)}:{String(callDuration % 60).padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          {activeCall.topic && (
            <div className="bg-white p-3 rounded border border-orange-200">
              <p className="text-sm font-semibold text-gray-700">Topic: {activeCall.topic}</p>
            </div>
          )}

          <Button
            onClick={handleEndCall}
            variant="destructive"
            className="w-full"
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            End Call
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📞 Call Into RRB Live</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Name
            </label>
            <Input
              placeholder="Enter your name"
              value={callerName}
              onChange={(e) => setCallerName(e.target.value)}
              className="border-2 border-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Topic (Optional)
            </label>
            <Textarea
              placeholder="What would you like to talk about?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="border-2 border-blue-200 resize-none"
              rows={3}
            />
          </div>

          <Button
            onClick={handleInitiateCall}
            disabled={initiateCallMutation.isPending || !callerName.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
          >
            <Phone className="w-4 h-4 mr-2" />
            {initiateCallMutation.isPending ? 'Connecting...' : 'Join Queue'}
          </Button>
        </div>
      </Card>

      {queue && (
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-purple-600 font-bold text-lg">
                <Users className="w-5 h-5" />
                {queuePosition}
              </div>
              <p className="text-sm text-gray-600">In Queue</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-pink-600 font-bold text-lg">
                <Clock className="w-5 h-5" />
                ~{avgWaitTime}m
              </div>
              <p className="text-sm text-gray-600">Avg Wait</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
