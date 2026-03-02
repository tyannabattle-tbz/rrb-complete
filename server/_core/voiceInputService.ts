export interface VoiceConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
}

export class VoiceInputService {
  static getDefaultConfig(): VoiceConfig {
    return {
      language: 'en-US',
      continuous: false,
      interimResults: true,
    };
  }

  static getSupportedLanguages(): string[] {
    return [
      'en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE',
      'it-IT', 'pt-BR', 'ja-JP', 'zh-CN', 'ko-KR',
    ];
  }

  static validateAudio(audioData: Uint8Array): boolean {
    return audioData && audioData.length > 0;
  }

  static getAudioConstraints() {
    return {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    };
  }

  static formatTranscription(text: string): string {
    return text.trim().charAt(0).toUpperCase() + text.trim().slice(1);
  }
}
