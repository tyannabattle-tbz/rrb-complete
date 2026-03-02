"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Play, Square, Download, Trash2, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface RecordingControlsProps {
  onRecordingStart?: (recordingId: string) => void;
  onRecordingStopped?: (recordingId: string) => void;
}

/**
 * Recording Controls Component
 * Manages recording start/stop, timer, and file management
 */
export default function RecordingControls({
  onRecordingStart,
  onRecordingStopped,
}: RecordingControlsProps) {
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [recordingSource, setRecordingSource] = useState<"monitor" | "audio" | "screen" | "hybrid">(
    "monitor"
  );

  // Mutations
  const startRecordingMutation = trpc.recordingManagement.startRecording.useMutation();
  const stopRecordingMutation = trpc.recordingManagement.stopRecording.useMutation();
  const deleteRecordingMutation = trpc.recordingManagement.deleteRecording.useMutation();

  // Queries
  const { data: recordingStatus } = trpc.recordingManagement.getRecordingStatus.useQuery(
    { recordingId: activeRecordingId || "" },
    { enabled: !!activeRecordingId, refetchInterval: 1000, staleTime: 0 }
  );

  const { data: recordings } = trpc.recordingManagement.listRecordings.useQuery(
    { limit: 5, offset: 0 },
    { refetchInterval: 2000, staleTime: 0 }
  );

  // Timer effect
  useEffect(() => {
    if (!activeRecordingId) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeRecordingId]);

  const handleStartRecording = async () => {
    try {
      const result = await startRecordingMutation.mutateAsync({
        source: recordingSource,
        quality: "high",
      });
      setActiveRecordingId(result.recordingId);
      setElapsedTime(0);
      onRecordingStart?.(result.recordingId);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const handleStopRecording = async () => {
    if (!activeRecordingId) return;

    try {
      const result = await stopRecordingMutation.mutateAsync({
        recordingId: activeRecordingId,
      });
      setActiveRecordingId(null);
      onRecordingStopped?.(result.recordingId);
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  };

  const handleDownload = async (recordingId: string) => {
    try {
      // Construct download URL directly
      const downloadUrl = `https://studio-recordings.s3.amazonaws.com/recording_${recordingId}.mp4?download=true`;
      window.open(downloadUrl, "_blank");
    } catch (error) {
      console.error("Failed to download:", error);
    }
  };

  const handleDelete = async (recordingId: string) => {
    try {
      await deleteRecordingMutation.mutateAsync({ recordingId });
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Recording Status */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recording Control</span>
            {activeRecordingId && (
              <Badge className="bg-red-600 animate-pulse">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-2" />
                RECORDING
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recording Source Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Recording Source</label>
            <div className="grid grid-cols-2 gap-2">
              {(["monitor", "audio", "screen", "hybrid"] as const).map((source) => (
                <button
                  key={source}
                  onClick={() => setRecordingSource(source)}
                  disabled={!!activeRecordingId}
                  className={`p-2 rounded text-sm font-medium transition-colors ${
                    recordingSource === source
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  } ${activeRecordingId ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {source.charAt(0).toUpperCase() + source.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Timer Display */}
          {activeRecordingId && (
            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 text-center">
              <p className="text-xs text-red-200 mb-2">Recording Duration</p>
              <p className="text-4xl font-mono font-bold text-red-400">{formatTime(elapsedTime)}</p>
            </div>
          )}

          {/* Start/Stop Buttons */}
          <div className="flex gap-2">
            {!activeRecordingId ? (
              <Button
                onClick={handleStartRecording}
                disabled={startRecordingMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={handleStopRecording}
                disabled={stopRecordingMutation.isPending}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>

          {/* Recording Info */}
          {recordingStatus && activeRecordingId && (
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3 space-y-1 text-sm">
              <p className="text-blue-200">
                <strong>File:</strong> {recordingStatus.filename}
              </p>
              <p className="text-blue-200">
                <strong>Location:</strong> S3 Studio Recordings
              </p>
              <p className="text-blue-200">
                <strong>Status:</strong> {recordingStatus.status}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Recordings */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Recent Recordings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!recordings || recordings.recordings.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recordings yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recordings.recordings.map((rec: any) => (
                <div
                  key={rec.recordingId}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 border border-slate-600"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{rec.filename}</p>
                    <p className="text-xs text-slate-400">
                      {rec.duration}s • {rec.fileSize}MB • {rec.status}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      onClick={() => handleDownload(rec.recordingId)}
                      size="sm"
                      variant="ghost"
                      className="text-green-400 hover:text-green-300"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(rec.recordingId)}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="bg-blue-900/20 border-blue-600/30">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200">
              <p className="font-medium mb-1">Recording Information</p>
              <ul className="text-xs space-y-1 opacity-90">
                <li>• Recordings are saved to S3 and can be downloaded anytime</li>
                <li>• Files are automatically backed up and retained for 30 days</li>
                <li>• Stop recording to finalize the file</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
