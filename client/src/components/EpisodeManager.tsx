/**
 * EpisodeManager — Reusable episode upload/management panel for podcast rooms.
 * Handles episode creation, audio upload to S3, metadata editing, publishing,
 * and auto-distribution to Spotify/Apple/YouTube via QUMUS.
 */
import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import {
  Upload, Mic2, Play, Pause, Trash2, Send, Edit2, Clock, Download,
  CheckCircle, AlertCircle, Loader2, FileAudio, Plus, X, Save, Earth
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface EpisodeManagerProps {
  showId: number;
  showSlug: string;
  accentColor?: string;
}

// ─── Create Episode Dialog ────────────────────────────────
function CreateEpisodeDialog({ showId, onCreated }: { showId: number; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [guests, setGuests] = useState("");
  const { toast } = useToast();

  const createEpisode = trpc.podcastManagement.createEpisode.useMutation({
    onSuccess: (data) => {
      toast({ title: "Episode Created", description: `Episode #${data.episodeNumber} created as draft` });
      setOpen(false);
      setTitle("");
      setDescription("");
      setTags("");
      setGuests("");
      onCreated();
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleCreate = () => {
    if (!title.trim()) return;
    createEpisode.mutate({
      showId,
      title: title.trim(),
      description: description.trim() || undefined,
      tags: tags.trim() ? tags.split(",").map(t => t.trim()) : undefined,
      guestNames: guests.trim() ? guests.split(",").map(g => g.trim()) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4 mr-1" /> New Episode
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-white">
        <DialogHeader>
          <DialogTitle>Create New Episode</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Episode title..."
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Episode description..."
              className="bg-zinc-800 border-zinc-700 text-white"
              rows={3}
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Tags (comma separated)</label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="healing, community, music..."
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Guest Names (comma separated)</label>
            <Input
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              placeholder="Guest 1, Guest 2..."
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || createEpisode.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {createEpisode.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
            ) : (
              <><Plus className="w-4 h-4 mr-2" /> Create Episode</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Episode Card ─────────────────────────────────────────
function EpisodeCard({ episode, onRefresh }: { episode: any; onRefresh: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(episode.title);
  const [editDesc, setEditDesc] = useState(episode.description ?? "");
  const [editNotes, setEditNotes] = useState(episode.showNotes ?? "");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadAudio = trpc.podcastManagement.uploadAudio.useMutation({
    onSuccess: () => {
      toast({ title: "Audio Uploaded", description: "Audio file uploaded to S3 successfully" });
      setUploading(false);
      onRefresh();
    },
    onError: (err) => {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
      setUploading(false);
    },
  });

  const publishEpisode = trpc.podcastManagement.publishEpisode.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Episode Published!",
        description: `Distribution: ${Object.entries(data.distribution).map(([k, v]) => `${k}: ${v}`).join(", ")}`,
      });
      onRefresh();
    },
    onError: (err) => {
      toast({ title: "Publish Failed", description: err.message, variant: "destructive" });
    },
  });

  const updateEpisode = trpc.podcastManagement.updateEpisode.useMutation({
    onSuccess: () => {
      toast({ title: "Updated", description: "Episode metadata saved" });
      setEditing(false);
      onRefresh();
    },
  });

  const deleteEpisode = trpc.podcastManagement.deleteEpisode.useMutation({
    onSuccess: () => {
      toast({ title: "Deleted", description: "Episode removed" });
      onRefresh();
    },
  });

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (16MB limit)
    if (file.size > 16 * 1024 * 1024) {
      toast({ title: "File Too Large", description: "Maximum file size is 16MB", variant: "destructive" });
      return;
    }

    setUploading(true);

    // Get audio duration
    const audio = new Audio(URL.createObjectURL(file));
    const duration = await new Promise<number>((resolve) => {
      audio.addEventListener("loadedmetadata", () => resolve(Math.round(audio.duration)));
      audio.addEventListener("error", () => resolve(0));
    });

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadAudio.mutate({
        episodeId: episode.id,
        fileName: file.name,
        fileData: base64,
        contentType: file.type || "audio/mpeg",
        duration,
        fileSize: file.size,
      });
    };
    reader.readAsDataURL(file);
  }, [episode.id, uploadAudio, toast]);

  const handlePlay = () => {
    if (!episode.audioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(episode.audioUrl);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const statusColors: Record<string, string> = {
    draft: "border-zinc-600 text-zinc-400",
    uploading: "border-yellow-600 text-yellow-400",
    processing: "border-blue-600 text-blue-400",
    ready: "border-cyan-600 text-cyan-400",
    published: "border-green-600 text-green-400",
    scheduled: "border-purple-600 text-purple-400",
    archived: "border-zinc-700 text-zinc-500",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    draft: <Edit2 className="w-3 h-3" />,
    ready: <CheckCircle className="w-3 h-3" />,
    published: <Earth className="w-3 h-3" />,
    scheduled: <Clock className="w-3 h-3" />,
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {editing ? (
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white text-sm mb-1"
            />
          ) : (
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-mono">EP {episode.episodeNumber}</span>
              {episode.title}
            </h4>
          )}
          {editing ? (
            <Textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white text-xs mt-1"
              rows={2}
              placeholder="Description..."
            />
          ) : (
            episode.description && (
              <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{episode.description}</p>
            )
          )}
        </div>
        <div className="flex items-center gap-1.5 ml-3">
          <Badge variant="outline" className={`text-[10px] ${statusColors[episode.status] ?? statusColors.draft}`}>
            {statusIcons[episode.status]} {episode.status}
          </Badge>
        </div>
      </div>

      {/* Audio section */}
      <div className="flex items-center gap-3">
        {episode.audioUrl ? (
          <>
            <button
              onClick={handlePlay}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
            </button>
            <div className="flex-1 flex items-center gap-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(episode.duration)}
              </span>
              <span className="flex items-center gap-1">
                <FileAudio className="w-3 h-3" />
                {episode.fileSize ? `${(episode.fileSize / (1024 * 1024)).toFixed(1)} MB` : "—"}
              </span>
              <span className="flex items-center gap-1">
                <Play className="w-3 h-3" />
                {episode.playCount ?? 0} plays
              </span>
            </div>
          </>
        ) : (
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs"
            >
              {uploading ? (
                <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Audio</>
              )}
            </Button>
            <span className="text-[10px] text-zinc-600 ml-2">Max 16MB — MP3, WAV, OGG, M4A</span>
          </div>
        )}
      </div>

      {/* Distribution status */}
      {episode.distributionStatus && (
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-zinc-500">Distribution:</span>
          {Object.entries(JSON.parse(typeof episode.distributionStatus === 'string' ? episode.distributionStatus : '{}')).map(([platform, status]) => (
            <Badge
              key={platform}
              variant="outline"
              className={`text-[9px] ${
                status === "published" || status === "queued_for_distribution"
                  ? "border-green-800 text-green-500"
                  : status === "queued"
                  ? "border-yellow-800 text-yellow-500"
                  : "border-red-800 text-red-500"
              }`}
            >
              {platform}: {String(status).replace(/_/g, " ")}
            </Badge>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/50">
        {editing ? (
          <>
            <Button
              size="sm"
              onClick={() => {
                updateEpisode.mutate({
                  id: episode.id,
                  title: editTitle,
                  description: editDesc,
                  showNotes: editNotes,
                });
              }}
              disabled={updateEpisode.isPending}
              className="bg-green-600 hover:bg-green-700 text-white text-xs h-7"
            >
              <Save className="w-3 h-3 mr-1" /> Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="text-zinc-400 text-xs h-7">
              <X className="w-3 h-3 mr-1" /> Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditing(true)}
              className="text-zinc-400 hover:text-white text-xs h-7"
            >
              <Edit2 className="w-3 h-3 mr-1" /> Edit
            </Button>
            {(episode.status === "ready" || episode.status === "draft") && episode.audioUrl && (
              <Button
                size="sm"
                onClick={() => publishEpisode.mutate({ episodeId: episode.id })}
                disabled={publishEpisode.isPending}
                className="bg-green-600 hover:bg-green-700 text-white text-xs h-7"
              >
                {publishEpisode.isPending ? (
                  <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Publishing...</>
                ) : (
                  <><Send className="w-3 h-3 mr-1" /> Publish & Distribute</>
                )}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (confirm("Delete this episode?")) {
                  deleteEpisode.mutate({ episodeId: episode.id });
                }
              }}
              className="text-red-400 hover:text-red-300 text-xs h-7 ml-auto"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main EpisodeManager ──────────────────────────────────
export default function EpisodeManager({ showId, showSlug, accentColor = "text-purple-400" }: EpisodeManagerProps) {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const { data, isLoading, refetch } = trpc.podcastManagement.getEpisodes.useQuery(
    { showId, status: statusFilter as any, limit: 50 },
    { enabled: showId > 0 }
  );

  const episodes = data?.episodes ?? [];
  const total = data?.total ?? 0;

  const statuses = ["all", "draft", "ready", "published", "scheduled", "archived"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${accentColor} flex items-center gap-2`}>
          <Mic2 className="w-5 h-5" />
          Episodes ({total})
        </h3>
        <CreateEpisodeDialog showId={showId} onCreated={() => refetch()} />
      </div>

      {/* Status filter */}
      <div className="flex gap-1.5 flex-wrap">
        {statuses.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={(!statusFilter && s === "all") || statusFilter === s ? "default" : "outline"}
            onClick={() => setStatusFilter(s === "all" ? undefined : s)}
            className={`text-xs h-7 ${
              (!statusFilter && s === "all") || statusFilter === s
                ? "bg-purple-600 text-white"
                : "border-zinc-700 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      {/* Episode list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-zinc-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading episodes...
        </div>
      ) : episodes.length > 0 ? (
        <div className="space-y-3">
          {episodes.map((ep: any) => (
            <EpisodeCard key={ep.id} episode={ep} onRefresh={() => refetch()} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-zinc-500">
          <FileAudio className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No episodes yet</p>
          <p className="text-xs mt-1">Click "New Episode" to create your first episode</p>
        </div>
      )}
    </div>
  );
}
