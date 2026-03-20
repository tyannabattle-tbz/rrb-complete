import { db } from '../db';
import { sql } from 'drizzle-orm';

export interface EpisodeMetrics {
  episodeId: string;
  title: string;
  downloads: number;
  listens: number;
  completionRate: number;
  averageListenTime: number;
  topCountries: Array<{ country: string; count: number }>;
  topDevices: Array<{ device: string; count: number }>;
  publishDate: Date;
  duration: number;
}

export interface PodcastStats {
  totalEpisodes: number;
  totalDownloads: number;
  totalListens: number;
  averageCompletionRate: number;
  subscriberGrowth: Array<{ date: Date; count: number }>;
  topEpisodes: EpisodeMetrics[];
  recentEpisodes: EpisodeMetrics[];
}

export class PodcastAnalytics {
  async getEpisodeMetrics(episodeId: string): Promise<EpisodeMetrics | null> {
    try {
      // Query episode data from database
      const episode = await db.query.episodes.findFirst({
        where: (episodes, { eq }) => eq(episodes.id, episodeId),
      });

      if (!episode) return null;

      // Calculate metrics
      const downloads = await this.getDownloadCount(episodeId);
      const listens = await this.getListenCount(episodeId);
      const completionRate = await this.getCompletionRate(episodeId);
      const averageListenTime = await this.getAverageListenTime(episodeId);
      const topCountries = await this.getTopCountries(episodeId);
      const topDevices = await this.getTopDevices(episodeId);

      return {
        episodeId,
        title: episode.title,
        downloads,
        listens,
        completionRate,
        averageListenTime,
        topCountries,
        topDevices,
        publishDate: episode.createdAt,
        duration: episode.duration || 0,
      };
    } catch (error) {
      console.error('Failed to get episode metrics:', error);
      return null;
    }
  }

  async getPodcastStats(podcastId: string): Promise<PodcastStats | null> {
    try {
      const episodes = await db.query.episodes.findMany({
        where: (episodes, { eq }) => eq(episodes.podcastId, podcastId),
        limit: 100,
      });

      const totalEpisodes = episodes.length;
      let totalDownloads = 0;
      let totalListens = 0;
      let totalCompletionRate = 0;

      const episodeMetrics: EpisodeMetrics[] = [];

      for (const episode of episodes) {
        const metrics = await this.getEpisodeMetrics(episode.id);
        if (metrics) {
          episodeMetrics.push(metrics);
          totalDownloads += metrics.downloads;
          totalListens += metrics.listens;
          totalCompletionRate += metrics.completionRate;
        }
      }

      const averageCompletionRate = totalEpisodes > 0 ? totalCompletionRate / totalEpisodes : 0;

      // Get subscriber growth
      const subscriberGrowth = await this.getSubscriberGrowth(podcastId);

      // Sort by downloads
      const topEpisodes = episodeMetrics.sort((a, b) => b.downloads - a.downloads).slice(0, 5);
      const recentEpisodes = episodeMetrics.sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime()).slice(0, 5);

      return {
        totalEpisodes,
        totalDownloads,
        totalListens,
        averageCompletionRate,
        subscriberGrowth,
        topEpisodes,
        recentEpisodes,
      };
    } catch (error) {
      console.error('Failed to get podcast stats:', error);
      return null;
    }
  }

  private async getDownloadCount(episodeId: string): Promise<number> {
    try {
      const result = await db.query.downloads.findMany({
        where: (downloads, { eq }) => eq(downloads.episodeId, episodeId),
      });
      return result.length;
    } catch {
      return 0;
    }
  }

  private async getListenCount(episodeId: string): Promise<number> {
    try {
      const result = await db.query.listens.findMany({
        where: (listens, { eq }) => eq(listens.episodeId, episodeId),
      });
      return result.length;
    } catch {
      return 0;
    }
  }

  private async getCompletionRate(episodeId: string): Promise<number> {
    try {
      const listens = await db.query.listens.findMany({
        where: (listens, { eq }) => eq(listens.episodeId, episodeId),
      });

      if (listens.length === 0) return 0;

      const completed = listens.filter((l: any) => l.completionPercentage >= 90).length;
      return (completed / listens.length) * 100;
    } catch {
      return 0;
    }
  }

  private async getAverageListenTime(episodeId: string): Promise<number> {
    try {
      const listens = await db.query.listens.findMany({
        where: (listens, { eq }) => eq(listens.episodeId, episodeId),
      });

      if (listens.length === 0) return 0;

      const totalTime = listens.reduce((sum: number, l: any) => sum + (l.listenTime || 0), 0);
      return totalTime / listens.length;
    } catch {
      return 0;
    }
  }

  private async getTopCountries(episodeId: string, limit: number = 5): Promise<Array<{ country: string; count: number }>> {
    try {
      const listens = await db.query.listens.findMany({
        where: (listens, { eq }) => eq(listens.episodeId, episodeId),
      });

      const countryMap = new Map<string, number>();
      listens.forEach((l: any) => {
        const country = l.country || 'Unknown';
        countryMap.set(country, (countryMap.get(country) || 0) + 1);
      });

      return Array.from(countryMap.entries())
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch {
      return [];
    }
  }

  private async getTopDevices(episodeId: string, limit: number = 5): Promise<Array<{ device: string; count: number }>> {
    try {
      const listens = await db.query.listens.findMany({
        where: (listens, { eq }) => eq(listens.episodeId, episodeId),
      });

      const deviceMap = new Map<string, number>();
      listens.forEach((l: any) => {
        const device = l.device || 'Unknown';
        deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
      });

      return Array.from(deviceMap.entries())
        .map(([device, count]) => ({ device, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch {
      return [];
    }
  }

  private async getSubscriberGrowth(podcastId: string): Promise<Array<{ date: Date; count: number }>> {
    try {
      const subscribers = await db.query.subscribers.findMany({
        where: (subscribers, { eq }) => eq(subscribers.podcastId, podcastId),
      });

      // Group by date
      const dateMap = new Map<string, number>();
      subscribers.forEach((s: any) => {
        const date = new Date(s.subscribedAt).toISOString().split('T')[0];
        dateMap.set(date, (dateMap.get(date) || 0) + 1);
      });

      return Array.from(dateMap.entries())
        .map(([date, count]) => ({ date: new Date(date), count }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch {
      return [];
    }
  }

  async exportAnalytics(podcastId: string, format: 'csv' | 'json' = 'csv'): Promise<string> {
    const stats = await this.getPodcastStats(podcastId);
    if (!stats) return '';

    if (format === 'json') {
      return JSON.stringify(stats, null, 2);
    }

    // CSV format
    let csv = 'Metric,Value\n';
    csv += `Total Episodes,${stats.totalEpisodes}\n`;
    csv += `Total Downloads,${stats.totalDownloads}\n`;
    csv += `Total Listens,${stats.totalListens}\n`;
    csv += `Average Completion Rate,${stats.averageCompletionRate.toFixed(2)}%\n`;
    csv += '\nTop Episodes\n';
    csv += 'Title,Downloads,Listens,Completion Rate\n';

    stats.topEpisodes.forEach((ep) => {
      csv += `"${ep.title}",${ep.downloads},${ep.listens},${ep.completionRate.toFixed(2)}%\n`;
    });

    return csv;
  }
}

export const podcastAnalytics = new PodcastAnalytics();
