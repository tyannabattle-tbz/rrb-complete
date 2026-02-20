/**
 * Commercial Audio File Mapper
 * 
 * Maps commercials to real audio files stored in S3
 * Manages audio file metadata and playback URLs
 */

import { storagePut, storageGet } from "../storage";

export interface CommercialAudioFile {
  id: string;
  commercialId: string;
  filename: string;
  s3Key: string;
  s3Url: string;
  duration: number;           // Seconds
  bitrate: number;            // kbps
  codec: 'mp3' | 'aac' | 'opus';
  fileSize: number;           // Bytes
  uploadedAt: number;
  voiceStyle?: string;        // e.g., "male_professional", "female_warm", "narrator"
  language: string;           // e.g., "en-US"
  isActive: boolean;
}

export interface CommercialAudioMapping {
  commercialId: string;
  title: string;
  description: string;
  audioFiles: CommercialAudioFile[];
  defaultBitrate: number;
  category: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Commercial Audio Mapper — manages audio file mappings
 */
export class CommercialAudioMapper {
  private mappings: Map<string, CommercialAudioMapping> = new Map();
  private audioFiles: Map<string, CommercialAudioFile> = new Map();

  constructor() {
    this.initializeDefaultMappings();
  }

  /**
   * Initialize default commercial audio mappings
   */
  private initializeDefaultMappings() {
    // Station IDs
    this.addMapping({
      commercialId: 'station_id_1',
      title: 'RRB Radio Station ID',
      description: 'Official RRB Radio station identification',
      audioFiles: [],
      defaultBitrate: 192,
      category: 'station_id',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // PSAs
    this.addMapping({
      commercialId: 'psa_sweet_miracles_1',
      title: 'Sweet Miracles Foundation PSA',
      description: 'Public service announcement for Sweet Miracles',
      audioFiles: [],
      defaultBitrate: 128,
      category: 'psa',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Promos
    this.addMapping({
      commercialId: 'promo_rrb_radio',
      title: 'RRB Radio Promo',
      description: 'Promotional spot for RRB Radio',
      audioFiles: [],
      defaultBitrate: 192,
      category: 'promo',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Division Commercials
    const divisions = [
      { id: 'annas_promotions', name: "Anna's Promotions", desc: 'Promotional services by Tyanna Battle & LaShanna Russell' },
      { id: 'little_c', name: 'Little C', desc: 'Entertainment services by Carlos Kembrel' },
      { id: 'seans_music', name: "Sean's Music", desc: 'Music services by Sean Hunter' },
      { id: 'jaelon_enterprises', name: 'Jaelon Enterprises', desc: 'Business services by Jaelon Hunter' },
      { id: 'canryn_publishing', name: 'Canryn Publishing', desc: 'Publishing and media services' },
      { id: 'seasha_distribution', name: 'Seasha Distribution', desc: 'Distribution and logistics services' },
    ];

    for (const division of divisions) {
      this.addMapping({
        commercialId: `division_${division.id}`,
        title: `${division.name} Commercial`,
        description: division.desc,
        audioFiles: [],
        defaultBitrate: 192,
        category: 'division',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    console.log(`[CommercialAudioMapper] Initialized ${this.mappings.size} commercial mappings`);
  }

  /**
   * Add a commercial mapping
   */
  addMapping(mapping: CommercialAudioMapping) {
    this.mappings.set(mapping.commercialId, mapping);
  }

  /**
   * Get a commercial mapping
   */
  getMapping(commercialId: string): CommercialAudioMapping | undefined {
    return this.mappings.get(commercialId);
  }

  /**
   * Get all commercial mappings
   */
  getAllMappings(): CommercialAudioMapping[] {
    return Array.from(this.mappings.values());
  }

  /**
   * Add an audio file to a commercial
   */
  async addAudioFile(
    commercialId: string,
    filename: string,
    audioBuffer: Buffer,
    options: {
      duration: number;
      bitrate: number;
      codec: 'mp3' | 'aac' | 'opus';
      voiceStyle?: string;
      language?: string;
    }
  ): Promise<CommercialAudioFile> {
    const mapping = this.mappings.get(commercialId);
    if (!mapping) {
      throw new Error(`Commercial not found: ${commercialId}`);
    }

    // Upload to S3
    const s3Key = `commercials/${commercialId}/${filename}`;
    const mimeType = this.getMimeType(options.codec);
    const { url: s3Url } = await storagePut(s3Key, audioBuffer, mimeType);

    // Create audio file record
    const audioFile: CommercialAudioFile = {
      id: `audio_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      commercialId,
      filename,
      s3Key,
      s3Url,
      duration: options.duration,
      bitrate: options.bitrate,
      codec: options.codec,
      fileSize: audioBuffer.length,
      uploadedAt: Date.now(),
      voiceStyle: options.voiceStyle,
      language: options.language || 'en-US',
      isActive: true,
    };

    // Add to mapping
    mapping.audioFiles.push(audioFile);
    mapping.updatedAt = Date.now();

    // Store in cache
    this.audioFiles.set(audioFile.id, audioFile);

    console.log(`[CommercialAudioMapper] Added audio file: ${audioFile.id} for commercial ${commercialId}`);
    return audioFile;
  }

  /**
   * Get audio file for a commercial at a specific bitrate
   */
  getAudioFile(commercialId: string, bitrate?: number): CommercialAudioFile | undefined {
    const mapping = this.mappings.get(commercialId);
    if (!mapping || mapping.audioFiles.length === 0) {
      return undefined;
    }

    const targetBitrate = bitrate || mapping.defaultBitrate;

    // Try to find exact bitrate match
    let audioFile = mapping.audioFiles.find(
      af => af.bitrate === targetBitrate && af.isActive
    );

    // Fall back to default bitrate
    if (!audioFile) {
      audioFile = mapping.audioFiles.find(
        af => af.bitrate === mapping.defaultBitrate && af.isActive
      );
    }

    // Fall back to any active audio file
    if (!audioFile) {
      audioFile = mapping.audioFiles.find(af => af.isActive);
    }

    return audioFile;
  }

  /**
   * Get all audio files for a commercial
   */
  getAudioFiles(commercialId: string): CommercialAudioFile[] {
    const mapping = this.mappings.get(commercialId);
    return mapping ? mapping.audioFiles : [];
  }

  /**
   * Get presigned URL for streaming
   */
  async getStreamingUrl(commercialId: string, bitrate?: number, expiresIn: number = 3600): Promise<string> {
    const audioFile = this.getAudioFile(commercialId, bitrate);
    if (!audioFile) {
      throw new Error(`No audio file found for commercial: ${commercialId}`);
    }

    const { url } = await storageGet(audioFile.s3Key, expiresIn);
    return url;
  }

  /**
   * Deactivate an audio file
   */
  deactivateAudioFile(audioFileId: string) {
    const audioFile = this.audioFiles.get(audioFileId);
    if (audioFile) {
      audioFile.isActive = false;
      const mapping = this.mappings.get(audioFile.commercialId);
      if (mapping) {
        mapping.updatedAt = Date.now();
      }
    }
  }

  /**
   * Get commercials by category
   */
  getCommercialsByCategory(category: string): CommercialAudioMapping[] {
    return Array.from(this.mappings.values()).filter(m => m.category === category);
  }

  /**
   * Get commercials by voice style
   */
  getCommercialsByVoiceStyle(voiceStyle: string): CommercialAudioMapping[] {
    return Array.from(this.mappings.values()).filter(m =>
      m.audioFiles.some(af => af.voiceStyle === voiceStyle && af.isActive)
    );
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const totalMappings = this.mappings.size;
    const totalAudioFiles = this.audioFiles.size;
    const totalDuration = Array.from(this.audioFiles.values()).reduce(
      (sum, af) => sum + af.duration,
      0
    );
    const totalFileSize = Array.from(this.audioFiles.values()).reduce(
      (sum, af) => sum + af.fileSize,
      0
    );

    return {
      totalMappings,
      totalAudioFiles,
      totalDuration,
      totalFileSize,
      averageFileDuration: totalAudioFiles > 0 ? totalDuration / totalAudioFiles : 0,
      averageFileSize: totalAudioFiles > 0 ? totalFileSize / totalAudioFiles : 0,
    };
  }

  /**
   * Get MIME type for codec
   */
  private getMimeType(codec: 'mp3' | 'aac' | 'opus'): string {
    switch (codec) {
      case 'mp3':
        return 'audio/mpeg';
      case 'aac':
        return 'audio/aac';
      case 'opus':
        return 'audio/opus';
      default:
        return 'audio/mpeg';
    }
  }

  /**
   * Export all mappings
   */
  exportMappings() {
    return {
      mappings: Array.from(this.mappings.values()),
      audioFiles: Array.from(this.audioFiles.values()),
      statistics: this.getStatistics(),
      exportedAt: Date.now(),
    };
  }
}

// Singleton instance
let mapperInstance: CommercialAudioMapper | null = null;

export function getCommercialAudioMapper(): CommercialAudioMapper {
  if (!mapperInstance) {
    mapperInstance = new CommercialAudioMapper();
  }
  return mapperInstance;
}
