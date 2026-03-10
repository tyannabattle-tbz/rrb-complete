import { trpc } from '@/lib/trpc';
import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Video, Download, Play, Clock, Users, Calendar, Radio, Shield, Cpu, Archive, FileText, Loader2, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const platformLabels: Record<string, string> = {
  jitsi: 'RRB Built-in',
  zoom: 'Zoom',
  meet: 'Google Meet',
  discord: 'Discord',
  skype: 'Skype',
  'rrb-live': 'RRB Broadcast',
};

export default function ConferenceRecordings() {
  const { data: recordings, isLoading, refetch } = trpc.conference.getRecordings.useQuery({ limit: 50 });
  const { data: stats } = trpc.conference.getStats.useQuery();
  const { user } = useAuth();
  const { toast } = useToast();
  const [viewingTranscript, setViewingTranscript] = useState<number | null>(null);
  const { data: transcript } = trpc.conference.getTranscript.useQuery(
    { conferenceId: viewingTranscript! },
    { enabled: viewingTranscript !== null }
  );
  const transcribeMutation = trpc.conference.triggerTranscription.useMutation({
    onSuccess: (data) => {
      toast({ title: `Transcription ${data.status}`, description: `${data.transcriptLength} characters transcribed` });
      refetch();
    },
    onError: (err) => toast({ title: 'Transcription failed', description: err.message, variant: 'destructive' }),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-purple-500/20 bg-gray-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/conference">
                <button className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors">
                  <ArrowLeft className="w-5 h-5 text-purple-400" />
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">
                  Conference Recordings
                </h1>
                <p className="text-sm text-gray-400">S3-Backed Archive &bull; Canryn Production</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-amber-400"><Radio className="w-3 h-3" /> RRB</span>
              <span className="flex items-center gap-1 text-xs text-purple-400"><Cpu className="w-3 h-3" /> TBZ-OS</span>
              <span className="flex items-center gap-1 text-xs text-red-400"><Shield className="w-3 h-3" /> HybridCast</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats bar */}
        <div className="flex items-center gap-6 mb-6 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <Archive className="w-4 h-4 text-purple-400" />
            <strong className="text-white">{stats?.recordings || 0}</strong> recordings available
          </span>
          <span className="flex items-center gap-1.5">
            <Video className="w-4 h-4 text-amber-400" />
            <strong className="text-white">{stats?.completed || 0}</strong> completed conferences
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading recordings...</p>
          </div>
        ) : recordings && recordings.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recordings.map((rec: any) => (
              <div key={rec.id} className="bg-gray-900/50 border border-purple-500/20 rounded-xl overflow-hidden hover:border-purple-500/40 transition-colors">
                {/* Thumbnail area */}
                <div className="relative bg-gradient-to-br from-purple-900/40 to-gray-900/40 h-40 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Play className="w-8 h-8 text-purple-400 ml-1" />
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 rounded text-xs text-gray-300">
                    {rec.duration_minutes}m
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-xs text-gray-300">
                    {platformLabels[rec.platform] || rec.platform}
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-white truncate mb-2">{rec.title}</h3>
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3" /> {rec.host_name}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> {new Date(rec.created_at).toLocaleDateString()}
                    </div>
                    {rec.actual_attendees > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3 h-3" /> {rec.actual_attendees} attendees
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    {rec.recording_url && (
                      <>
                        <a href={rec.recording_url} target="_blank" rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg text-sm hover:bg-purple-500/30 transition-colors">
                          <Play className="w-3.5 h-3.5" /> Replay
                        </a>
                        <a href={rec.recording_url} download
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-800/50 text-gray-300 rounded-lg text-sm hover:bg-gray-700/50 transition-colors">
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </>
                    )}
                    <button
                      onClick={() => setViewingTranscript(rec.id)}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" /> Transcript
                    </button>
                    {user && rec.recording_url && rec.recording_status !== 'available' && (
                      <button
                        onClick={() => transcribeMutation.mutate({ conferenceId: rec.id, recordingUrl: rec.recording_url })}
                        disabled={transcribeMutation.isPending}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-300 rounded-lg text-sm hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                      >
                        {transcribeMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                        Transcribe
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Archive className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No Recordings Yet</h3>
            <p className="text-gray-500 mb-4">Conference recordings will appear here once conferences with recording enabled are completed.</p>
            <Link href="/conference">
              <button className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors">
                Go to Conference Hub
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Transcript Viewer Modal */}
      {viewingTranscript !== null && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setViewingTranscript(null)}>
          <div className="bg-gray-900 border border-purple-500/30 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div>
                <h3 className="text-lg font-bold text-white">{transcript?.title || 'Transcript'}</h3>
                <p className="text-xs text-gray-400">
                  Status: <span className={transcript?.recordingStatus === 'available' ? 'text-green-400' : 'text-yellow-400'}>{transcript?.recordingStatus || 'unknown'}</span>
                </p>
              </div>
              <button onClick={() => setViewingTranscript(null)} className="p-2 hover:bg-gray-800 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {transcript?.hasTranscript ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans leading-relaxed">{transcript.transcript}</pre>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No transcript available yet</p>
                  <p className="text-xs text-gray-500">Use the "Transcribe" button on the recording card to auto-generate a transcript via Whisper AI</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-purple-500/10 mt-8 py-4 text-center text-xs text-gray-600">
        Canryn Production Recording Archive &bull; S3-Backed Storage &bull; Powered by QUMUS &bull; Ty Bat Zan, Digital Steward
      </div>
    </div>
  );
}
