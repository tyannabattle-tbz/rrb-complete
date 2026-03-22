/**
 * QUMUS Recording Studio Alignment Service
 * Aligns QUMUS recording studio components with Ty OS standards
 */

import { tyOSPodcastStudioService } from './tyOSPodcastStudioService';

export interface StudioAlignment {
  studioId: string;
  studioName: string;
  studioType: string;
  alignmentStatus: 'aligned' | 'partial' | 'misaligned';
  issues: string[];
  recommendations: string[];
  equipmentGaps: string[];
}

class QumusStudioAlignmentService {
  /**
   * Align QUMUS studios with Ty OS standards
   */
  async alignStudios(): Promise<StudioAlignment[]> {
    const tyOSStudios = tyOSPodcastStudioService.getAllRecordingStudios();
    const alignments: StudioAlignment[] = [];

    for (const studio of tyOSStudios) {
      const alignment = await this.alignSingleStudio(studio);
      alignments.push(alignment);
    }

    return alignments;
  }

  /**
   * Align a single studio with Ty OS standards
   */
  private async alignSingleStudio(studio: any): Promise<StudioAlignment> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const equipmentGaps: string[] = [];

    // Validate studio configuration
    const validation = tyOSPodcastStudioService.validateStudioConfig(studio);
    if (!validation.valid) {
      issues.push(...validation.errors);
    }

    // Check equipment
    const requiredEquipment = this.getRequiredEquipmentForType(studio.type);
    const missingEquipment = requiredEquipment.filter(e => !studio.equipment.includes(e));
    if (missingEquipment.length > 0) {
      equipmentGaps.push(...missingEquipment);
      recommendations.push(`Add missing equipment: ${missingEquipment.join(', ')}`);
    }

    // Check bitrate standards
    const bitrateStandards: Record<string, { min: number; max: number }> = {
      'podcast': { min: 128, max: 256 },
      'audiobook': { min: 128, max: 192 },
      'music': { min: 256, max: 320 },
      'voiceover': { min: 128, max: 256 },
      'interview': { min: 192, max: 256 },
      'radio': { min: 128, max: 192 }
    };

    const standard = bitrateStandards[studio.type];
    if (standard && (studio.bitrate < standard.min || studio.bitrate > standard.max)) {
      issues.push(`Bitrate ${studio.bitrate}kbps outside recommended range (${standard.min}-${standard.max}kbps)`);
      recommendations.push(`Adjust bitrate to ${standard.min}-${standard.max}kbps for ${studio.type}`);
    }

    // Check sample rate
    if (studio.sampleRate < 44100 || studio.sampleRate > 96000) {
      issues.push(`Sample rate ${studio.sampleRate}Hz should be 44100-96000Hz`);
      recommendations.push('Adjust sample rate to 44100Hz, 48000Hz, or 96000Hz');
    }

    // Check format
    const validFormats = ['WAV', 'MP3', 'AAC', 'FLAC'];
    if (!validFormats.includes(studio.format)) {
      issues.push(`Format ${studio.format} not in standard formats`);
      recommendations.push(`Use one of: ${validFormats.join(', ')}`);
    }

    // Check features
    const requiredFeatures = this.getRequiredFeaturesForType(studio.type);
    const missingFeatures = requiredFeatures.filter(f => !studio.features.includes(f));
    if (missingFeatures.length > 0) {
      issues.push(`Missing features: ${missingFeatures.join(', ')}`);
      recommendations.push(`Enable features: ${missingFeatures.join(', ')}`);
    }

    // Check capacity
    const capacityStandards: Record<string, number> = {
      'podcast': 4,
      'audiobook': 1,
      'music': 8,
      'voiceover': 2,
      'interview': 6,
      'radio': 2
    };

    const recommendedCapacity = capacityStandards[studio.type];
    if (studio.capacity < recommendedCapacity) {
      recommendations.push(`Consider increasing capacity to ${recommendedCapacity} for ${studio.type}`);
    }

    const alignmentStatus = issues.length === 0 ? 'aligned' : issues.length <= 2 ? 'partial' : 'misaligned';

    return {
      studioId: studio.id,
      studioName: studio.name,
      studioType: studio.type,
      alignmentStatus,
      issues,
      recommendations,
      equipmentGaps
    };
  }

  /**
   * Get required equipment for studio type
   */
  private getRequiredEquipmentForType(type: string): string[] {
    const equipmentMap: Record<string, string[]> = {
      'podcast': ['Microphone', 'Mixer', 'Headphones', 'Monitor speakers'],
      'audiobook': ['Condenser microphone', 'Audio interface', 'Headphones', 'Monitor speakers'],
      'music': ['Multiple microphones', 'Mixing console', 'Studio monitors', 'Headphones', 'Outboard gear'],
      'voiceover': ['Condenser microphone', 'Audio interface', 'Headphones', 'Monitor speakers'],
      'interview': ['Multiple microphones', 'Mixer', 'Headphones', 'Monitor speakers', 'Remote integration'],
      'radio': ['Dynamic microphone', 'Mixer', 'Headphones', 'Monitor speakers', 'Backup power']
    };

    return equipmentMap[type] || [];
  }

  /**
   * Get required features for studio type
   */
  private getRequiredFeaturesForType(type: string): string[] {
    const featuresMap: Record<string, string[]> = {
      'podcast': ['Multi-track recording', 'Real-time monitoring', 'Live streaming'],
      'audiobook': ['Noise reduction', 'Archive-ready', 'Narration optimization'],
      'music': ['Full mixing console', 'Mastering suite', 'Analog warmth processing'],
      'voiceover': ['Real-time voice processing', 'Commercial-grade acoustics', 'Character voice effects'],
      'interview': ['Remote guest integration', 'Multi-camera support', 'Live chat integration'],
      'radio': ['Backup power', 'Emergency protocols', 'Multi-platform streaming']
    };

    return featuresMap[type] || [];
  }

  /**
   * Get alignment summary
   */
  async getAlignmentSummary(): Promise<{
    totalStudios: number;
    alignedCount: number;
    partialCount: number;
    misalignedCount: number;
    alignmentPercentage: number;
    totalEquipmentGaps: number;
  }> {
    const alignments = await this.alignStudios();
    const alignedCount = alignments.filter(a => a.alignmentStatus === 'aligned').length;
    const partialCount = alignments.filter(a => a.alignmentStatus === 'partial').length;
    const misalignedCount = alignments.filter(a => a.alignmentStatus === 'misaligned').length;
    const totalEquipmentGaps = alignments.reduce((sum, a) => sum + a.equipmentGaps.length, 0);

    return {
      totalStudios: alignments.length,
      alignedCount,
      partialCount,
      misalignedCount,
      alignmentPercentage: (alignedCount / alignments.length) * 100,
      totalEquipmentGaps
    };
  }

  /**
   * Apply Ty OS standards to QUMUS studios
   */
  async applyTyOSStandards(): Promise<{
    success: boolean;
    message: string;
    alignments: StudioAlignment[];
  }> {
    try {
      const alignments = await this.alignStudios();
      const summary = await this.getAlignmentSummary();

      return {
        success: true,
        message: `Applied Ty OS standards to ${summary.totalStudios} studios. Alignment: ${summary.alignmentPercentage.toFixed(1)}%. Equipment gaps: ${summary.totalEquipmentGaps}`,
        alignments
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to apply Ty OS standards: ${error instanceof Error ? error.message : 'Unknown error'}`,
        alignments: []
      };
    }
  }

  /**
   * Get studio features and capabilities
   */
  getStudioFeatures() {
    return tyOSPodcastStudioService.getStudioFeatures();
  }
}

export const qumusStudioAlignmentService = new QumusStudioAlignmentService();
