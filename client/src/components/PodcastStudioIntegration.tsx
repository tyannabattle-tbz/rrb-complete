import React, { useState, useCallback } from 'react';
import { Mic, Save, Share2, Users, Clock, Volume2, Download, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface PodcastRecording {
  id: string;
  title: string;
  description: string;
  duration: number;
  audioUrl: string;
  waveformData: number[];
  createdAt: Date;
  collaborators: string[];
  isPublished: boolean;
  episodeNumber?: number;
}

export function PodcastStudioIntegration() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordings, setRecordings] = useState<PodcastRecording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<PodcastRecording | null>(null);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');

  const podcastMutation = trpc.podcast.saveRecording.useMutation();
  const publishMutation = trpc.podcast.publishEpisode.useMutation();
  const shareMutation = trpc.podcast.shareProject.useMutation();

  const handleStartRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setRecordingTime(0);
      
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);
        
        const newRecording: PodcastRecording = {
          id: `rec_${Date.now()}`,
          title: `Podcast Recording ${new Date().toLocaleDateString()}`,
          description: '',
          duration: recordingTime,
          audioUrl,
          waveformData: [],
          createdAt: new Date(),
          collaborators: [],
          isPublished: false,
        };

        setRecordings([newRecording, ...recordings]);
        setSelectedRecording(newRecording);
        toast.success('Recording saved');
      };

      mediaRecorder.start();

      // Timer
      const interval = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);

      // Store recorder for stop
      (window as any).currentMediaRecorder = { recorder: mediaRecorder, interval };
    } catch (error) {
      toast.error('Failed to access microphone');
    }
  }, [recordingTime, recordings]);

  const handleStopRecording = useCallback(() => {
    const { recorder, interval } = (window as any).currentMediaRecorder || {};
    if (recorder) {
      recorder.stop();
      clearInterval(interval);
      setIsRecording(false);
      setIsPaused(false);
    }
  }, []);

  const handlePauseRecording = useCallback(() => {
    const { recorder } = (window as any).currentMediaRecorder || {};
    if (recorder) {
      if (isPaused) {
        recorder.resume();
        setIsPaused(false);
      } else {
        recorder.pause();
        setIsPaused(true);
      }
    }
  }, [isPaused]);

  const handlePublishEpisode = useCallback(async () => {
    if (!selectedRecording) return;

    try {
      await publishMutation.mutateAsync({
        recordingId: selectedRecording.id,
        title: selectedRecording.title,
        description: selectedRecording.description,
        episodeNumber: selectedRecording.episodeNumber,
        audioUrl: selectedRecording.audioUrl,
      });

      setSelectedRecording({ ...selectedRecording, isPublished: true });
      toast.success('Episode published to podcast feed');
    } catch (error) {
      toast.error('Failed to publish episode');
    }
  }, [selectedRecording, publishMutation]);

  const handleShareProject = useCallback(async () => {
    if (!collaboratorEmail || !selectedRecording) return;

    try {
      await shareMutation.mutateAsync({
        recordingId: selectedRecording.id,
        collaboratorEmail,
        permission: 'edit',
      });

      toast.success(`Shared with ${collaboratorEmail}`);
      setCollaboratorEmail('');
    } catch (error) {
      toast.error('Failed to share project');
    }
  }, [collaboratorEmail, selectedRecording, shareMutation]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1e] rounded-lg p-6 space-y-6">
      {/* Recording Controls */}
      <div className="bg-[#2a2a3e] rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Mic className="w-5 h-5 text-red-500" />
          Podcast Recording Studio
        </h2>

        <div className="bg-[#1a1a2e] rounded-lg p-4">
          <div className="text-center mb-4">
            <div className="text-4xl font-mono font-bold text-cyan-400">
              {formatTime(recordingTime)}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {isRecording ? (isPaused ? 'Paused' : 'Recording...') : 'Ready to record'}
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            {!isRecording ? (
              <Button
                onClick={handleStartRecording}
                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
              >
                <Mic className="w-4 h-4" />
                Start Recording
              </Button>
            ) : (
              <>
                <Button
                  onClick={handlePauseRecording}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  onClick={handleStopRecording}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Stop
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recordings List */}
      {recordings.length > 0 && (
        <div className="bg-[#2a2a3e] rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Recordings</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recordings.map((rec) => (
              <div
                key={rec.id}
                onClick={() => setSelectedRecording(rec)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedRecording?.id === rec.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-[#1a1a2e] hover:bg-[#252535] text-gray-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{rec.title}</p>
                    <p className="text-xs opacity-75">{formatTime(rec.duration)}</p>
                  </div>
                  {rec.isPublished && <span className="text-xs bg-green-600 px-2 py-1 rounded">Published</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Recording Actions */}
      {selectedRecording && (
        <div className="bg-[#2a2a3e] rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Recording Details</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
              <input
                type="text"
                value={selectedRecording.title}
                onChange={(e) =>
                  setSelectedRecording({ ...selectedRecording, title: e.target.value })
                }
                className="w-full bg-[#1a1a2e] text-white rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                value={selectedRecording.description}
                onChange={(e) =>
                  setSelectedRecording({ ...selectedRecording, description: e.target.value })
                }
                className="w-full bg-[#1a1a2e] text-white rounded px-3 py-2 text-sm h-20 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Episode Number</label>
              <input
                type="number"
                value={selectedRecording.episodeNumber || ''}
                onChange={(e) =>
                  setSelectedRecording({
                    ...selectedRecording,
                    episodeNumber: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="w-full bg-[#1a1a2e] text-white rounded px-3 py-2 text-sm"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handlePublishEpisode}
              disabled={selectedRecording.isPublished}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {selectedRecording.isPublished ? 'Published' : 'Publish Episode'}
            </Button>

            <Button
              onClick={() => setShowCollaborators(!showCollaborators)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              Share ({selectedRecording.collaborators.length})
            </Button>
          </div>

          {showCollaborators && (
            <div className="border-t border-[#3a3a4e] pt-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={collaboratorEmail}
                  onChange={(e) => setCollaboratorEmail(e.target.value)}
                  placeholder="collaborator@example.com"
                  className="flex-1 bg-[#1a1a2e] text-white rounded px-3 py-2 text-sm"
                />
                <Button
                  onClick={handleShareProject}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>

              {selectedRecording.collaborators.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">Collaborators:</p>
                  {selectedRecording.collaborators.map((email) => (
                    <p key={email} className="text-sm text-gray-300">
                      • {email}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
