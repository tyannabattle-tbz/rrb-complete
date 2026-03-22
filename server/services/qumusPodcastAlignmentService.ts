/**
 * QUMUS Podcast Alignment Service
 * Aligns QUMUS podcast components with Ty OS standards
 */

import { tyOSPodcastStudioService } from './tyOSPodcastStudioService';

export interface PodcastAlignment {
  showId: string;
  showName: string;
  alignmentStatus: 'aligned' | 'partial' | 'misaligned';
  issues: string[];
  recommendations: string[];
}

class QumusPodcastAlignmentService {
  /**
   * Align QUMUS podcasts with Ty OS standards
   */
  async alignPodcasts(): Promise<PodcastAlignment[]> {
    const tyOSShows = tyOSPodcastStudioService.getAllPodcastShows();
    const alignments: PodcastAlignment[] = [];

    for (const show of tyOSShows) {
      const alignment = await this.alignSinglePodcast(show);
      alignments.push(alignment);
    }

    return alignments;
  }

  /**
   * Align a single podcast with Ty OS standards
   */
  private async alignSinglePodcast(show: any): Promise<PodcastAlignment> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Validate podcast configuration
    const validation = tyOSPodcastStudioService.validatePodcastConfig(show);
    if (!validation.valid) {
      issues.push(...validation.errors);
    }

    // Check platform availability
    const requiredPlatforms = ['Spotify', 'Apple Podcasts', 'YouTube', 'RSS'];
    const missingPlatforms = requiredPlatforms.filter(p => !show.platforms.includes(p));
    if (missingPlatforms.length > 0) {
      issues.push(`Missing platforms: ${missingPlatforms.join(', ')}`);
      recommendations.push(`Add distribution to: ${missingPlatforms.join(', ')}`);
    }

    // Check stream URL
    if (!show.streamUrl || !show.streamUrl.startsWith('https://')) {
      issues.push('Stream URL must be HTTPS');
      recommendations.push('Update stream URL to use HTTPS protocol');
    }

    // Check episode length
    if (show.episodeLength < 20 || show.episodeLength > 120) {
      issues.push(`Episode length ${show.episodeLength}min is outside recommended range (20-120min)`);
      recommendations.push('Adjust episode length to 20-120 minutes');
    }

    // Check artwork
    if (!show.artworkUrl) {
      issues.push('Podcast artwork is missing');
      recommendations.push('Add high-quality podcast artwork (3000x3000px minimum)');
    }

    // Check frequency
    const validFrequencies = ['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'As-needed'];
    if (!validFrequencies.includes(show.frequency)) {
      issues.push(`Invalid frequency: ${show.frequency}`);
      recommendations.push(`Set frequency to one of: ${validFrequencies.join(', ')}`);
    }

    const alignmentStatus = issues.length === 0 ? 'aligned' : issues.length <= 2 ? 'partial' : 'misaligned';

    return {
      showId: show.id,
      showName: show.name,
      alignmentStatus,
      issues,
      recommendations
    };
  }

  /**
   * Get alignment summary
   */
  async getAlignmentSummary(): Promise<{
    totalPodcasts: number;
    alignedCount: number;
    partialCount: number;
    misalignedCount: number;
    alignmentPercentage: number;
  }> {
    const alignments = await this.alignPodcasts();
    const alignedCount = alignments.filter(a => a.alignmentStatus === 'aligned').length;
    const partialCount = alignments.filter(a => a.alignmentStatus === 'partial').length;
    const misalignedCount = alignments.filter(a => a.alignmentStatus === 'misaligned').length;

    return {
      totalPodcasts: alignments.length,
      alignedCount,
      partialCount,
      misalignedCount,
      alignmentPercentage: (alignedCount / alignments.length) * 100
    };
  }

  /**
   * Apply Ty OS standards to QUMUS podcasts
   */
  async applyTyOSStandards(): Promise<{
    success: boolean;
    message: string;
    alignments: PodcastAlignment[];
  }> {
    try {
      const alignments = await this.alignPodcasts();
      const summary = await this.getAlignmentSummary();

      return {
        success: true,
        message: `Applied Ty OS standards to ${summary.totalPodcasts} podcasts. Alignment: ${summary.alignmentPercentage.toFixed(1)}%`,
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
}

export const qumusPodcastAlignmentService = new QumusPodcastAlignmentService();
