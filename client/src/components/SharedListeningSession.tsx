import React, { useState, useEffect, useCallback } from 'react';
import { Users, Music, Share2, X, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export interface SessionParticipant {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  joinedAt: number;
  currentTrackPosition: number;
}

export interface SharedListeningSession {
  id: string;
  name: string;
  host: SessionParticipant;
  participants: SessionParticipant[];
  currentTrack?: {
    id: string;
    title: string;
    artist: string;
    duration: number;
  };
  isPlaying: boolean;
  createdAt: number;
  inviteCode: string;
}

interface SharedListeningSessionProps {
  session: SharedListeningSession;
  currentUserId: string;
  onPlayPause?: (isPlaying: boolean) => void;
  onSkipTrack?: () => void;
  onRemoveParticipant?: (participantId: string) => void;
  onLeaveSession?: () => void;
  onInviteParticipant?: (email: string) => void;
}

export function SharedListeningSession({
  session,
  currentUserId,
  onPlayPause,
  onSkipTrack,
  onRemoveParticipant,
  onLeaveSession,
  onInviteParticipant,
}: SharedListeningSessionProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'out-of-sync'>('synced');
  const isHost = session.host.id === currentUserId;

  // Simulate sync check
  useEffect(() => {
    const checkSync = setInterval(() => {
      const maxTimeDrift = 500; // 500ms tolerance
      const timeDrifts = session.participants.map(p => Math.abs(p.currentTrackPosition - session.host.currentTrackPosition));
      const maxDrift = Math.max(...timeDrifts);

      if (maxDrift > maxTimeDrift) {
        setSyncStatus('out-of-sync');
      } else if (maxDrift > 100) {
        setSyncStatus('syncing');
      } else {
        setSyncStatus('synced');
      }
    }, 1000);

    return () => clearInterval(checkSync);
  }, [session.participants, session.host]);

  const handleInvite = useCallback(() => {
    if (inviteEmail && onInviteParticipant) {
      onInviteParticipant(inviteEmail);
      setInviteEmail('');
      setShowInviteModal(false);
    }
  }, [inviteEmail, onInviteParticipant]);

  const handleCopyInviteCode = useCallback(() => {
    navigator.clipboard.writeText(session.inviteCode);
  }, [session.inviteCode]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      {/* Session Header */}
      <Card className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">{session.name}</h2>
              <p className="text-sm opacity-90">
                {session.participants.length + 1} listener{session.participants.length !== 0 ? 's' : ''}
              </p>
            </div>
          </div>
          {!isHost && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLeaveSession}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>

      {/* Current Track */}
      {session.currentTrack && (
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Music className="w-12 h-12 text-blue-500" />
            <div className="flex-1">
              <h3 className="font-semibold">{session.currentTrack.title}</h3>
              <p className="text-sm text-gray-600">{session.currentTrack.artist}</p>
              <div className="mt-2 text-xs text-gray-500">
                {Math.floor(session.host.currentTrackPosition / 1000)}s / {Math.floor(session.currentTrack.duration / 1000)}s
              </div>
            </div>
            {isHost && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onPlayPause?.(!session.isPlaying)}
                  variant="outline"
                >
                  {session.isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button
                  size="sm"
                  onClick={onSkipTrack}
                  variant="outline"
                >
                  Skip
                </Button>
              </div>
            )}
          </div>

          {/* Sync Status */}
          <div className="mt-3 flex items-center gap-2 text-xs">
            <div
              className={`w-2 h-2 rounded-full ${
                syncStatus === 'synced'
                  ? 'bg-green-500'
                  : syncStatus === 'syncing'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
            />
            <span className="capitalize">{syncStatus}</span>
          </div>
        </Card>
      )}

      {/* Participants */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Listeners ({session.participants.length + 1})</h3>
        <div className="space-y-2">
          {/* Host */}
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                {session.host.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-sm">{session.host.name}</p>
                <p className="text-xs text-gray-600">Host</p>
              </div>
            </div>
          </div>

          {/* Other Participants */}
          {session.participants.map(participant => (
            <div key={participant.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-bold">
                  {participant.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm">{participant.name}</p>
                  <p className="text-xs text-gray-600">
                    Joined {Math.floor((Date.now() - participant.joinedAt) / 1000)}s ago
                  </p>
                </div>
              </div>
              {isHost && participant.id !== currentUserId && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveParticipant?.(participant.id)}
                  className="text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Invite Section */}
      {isHost && (
        <Card className="p-4">
          <div className="flex gap-2">
            <Button
              onClick={() => setShowInviteModal(true)}
              className="flex-1"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Invite Participant
            </Button>
            <Button
              onClick={handleCopyInviteCode}
              variant="outline"
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Copy Invite Code
            </Button>
          </div>

          {showInviteModal && (
            <div className="mt-4 p-4 border rounded bg-gray-50">
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleInvite}
                    className="flex-1"
                    size="sm"
                  >
                    Send Invite
                  </Button>
                  <Button
                    onClick={() => setShowInviteModal(false)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
