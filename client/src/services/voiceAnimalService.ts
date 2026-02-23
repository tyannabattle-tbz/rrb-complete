export interface VoiceTranscription {
  text: string;
  confidence: number;
  language: string;
  timestamp: number;
}

export class VoiceAnimalService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.start();
      this.isRecording = true;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      throw new Error("Unable to access microphone. Please check permissions.");
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("No recording in progress"));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/wav" });
        this.isRecording = false;
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    });
  }

  async transcribeAudio(audioBlob: Blob): Promise<VoiceTranscription> {
    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");
      formData.append("language", "en");

      // Send to backend for transcription
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const data = await response.json();

      return {
        text: data.text || "",
        confidence: data.confidence || 0.9,
        language: data.language || "en",
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Transcription error:", error);
      // Fallback: return empty transcription
      return {
        text: "",
        confidence: 0,
        language: "en",
        timestamp: Date.now(),
      };
    }
  }

  async recordAndTranscribe(
    onProgress?: (status: string) => void
  ): Promise<VoiceTranscription> {
    try {
      onProgress?.("Starting recording...");
      await this.startRecording();

      onProgress?.("Recording... (speak now)");

      // Auto-stop after 10 seconds or manual stop
      await new Promise((resolve) => {
        setTimeout(resolve, 10000);
      });

      onProgress?.("Processing audio...");
      const audioBlob = await this.stopRecording();

      onProgress?.("Transcribing...");
      const transcription = await this.transcribeAudio(audioBlob);

      onProgress?.("Complete");
      return transcription;
    } catch (error) {
      console.error("Record and transcribe error:", error);
      throw error;
    }
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  async synthesizeSpeech(text: string, language: string = "en"): Promise<void> {
    try {
      // Use Web Speech API for text-to-speech
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      } else {
        console.warn("Speech synthesis not supported");
      }
    } catch (error) {
      console.error("Speech synthesis error:", error);
    }
  }

  stopSynthesis(): void {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      // Simple language detection based on character patterns
      if (/[\u4E00-\u9FFF]/.test(text)) return "zh";
      if (/[\u0400-\u04FF]/.test(text)) return "ru";
      if (/[\u0600-\u06FF]/.test(text)) return "ar";
      if (/[àâäéèêëïîôöùûüç]/i.test(text)) return "fr";
      if (/[äöüß]/i.test(text)) return "de";
      if (/[áéíóúñ]/i.test(text)) return "es";

      return "en";
    } catch (error) {
      console.error("Language detection error:", error);
      return "en";
    }
  }

  getAvailableLanguages(): Array<{ code: string; name: string }> {
    return [
      { code: "en", name: "English" },
      { code: "es", name: "Spanish" },
      { code: "fr", name: "French" },
      { code: "de", name: "German" },
      { code: "it", name: "Italian" },
      { code: "pt", name: "Portuguese" },
      { code: "ru", name: "Russian" },
      { code: "zh", name: "Chinese" },
    ];
  }
}

export const voiceAnimalService = new VoiceAnimalService();
