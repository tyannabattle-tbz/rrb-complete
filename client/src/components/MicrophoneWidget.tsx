import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Upload } from "lucide-react";

interface MicrophoneWidgetProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
}

export const MicrophoneWidget: React.FC<MicrophoneWidgetProps> = ({
  onRecordingComplete,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Timer for recording duration
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2">
      {isRecording ? (
        <>
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-red-600">
              Recording: {formatTime(recordingTime)}
            </span>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={stopRecording}
            className="gap-2"
          >
            <Square className="w-4 h-4" />
            Stop
          </Button>
        </>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={startRecording}
          disabled={disabled}
          className="gap-2"
        >
          <Mic className="w-4 h-4" />
          Record
        </Button>
      )}
    </div>
  );
};
