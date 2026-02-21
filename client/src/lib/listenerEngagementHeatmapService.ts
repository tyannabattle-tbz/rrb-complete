/**
 * Listener Engagement Heatmap Service
 * Generates heatmap data showing peak listening times by day/hour
 */

export interface HeatmapDataPoint {
  day: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
  listeners: number;
  engagement: number; // 0-100
  trend: 'up' | 'down' | 'stable';
}

export interface ChannelHeatmapData {
  channelId: string;
  channelName: string;
  data: HeatmapDataPoint[];
  peakDay: number;
  peakHour: number;
  avgEngagement: number;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

/**
 * Generate heatmap data for a channel
 */
export function generateChannelHeatmap(
  channelId: string,
  channelName: string,
  historicalData: Array<{
    timestamp: number;
    listeners: number;
  }>
): ChannelHeatmapData {
  // Initialize 7x24 grid
  const grid: HeatmapDataPoint[][] = Array(7).fill(null).map(() =>
    Array(24).fill(null).map(() => ({
      day: 0,
      hour: 0,
      listeners: 0,
      engagement: 0,
      trend: 'stable' as const
    }))
  );

  // Count listeners by day/hour
  const counts: number[][] = Array(7).fill(null).map(() => Array(24).fill(0));
  const totals: number[][] = Array(7).fill(null).map(() => Array(24).fill(0));

  historicalData.forEach(point => {
    const date = new Date(point.timestamp);
    const day = date.getDay();
    const hour = date.getHours();

    counts[day][hour] += point.listeners;
    totals[day][hour]++;
  });

  // Calculate averages and engagement
  const allListeners: number[] = [];

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const avg = totals[day][hour] > 0 ? counts[day][hour] / totals[day][hour] : 0;
      allListeners.push(avg);

      grid[day][hour] = {
        day,
        hour,
        listeners: Math.round(avg),
        engagement: 0, // Will calculate below
        trend: 'stable'
      };
    }
  }

  // Calculate engagement as percentage of max
  const maxListeners = Math.max(...allListeners, 1);
  const minListeners = Math.min(...allListeners, 0);
  const range = maxListeners - minListeners || 1;

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const listeners = grid[day][hour].listeners;
      grid[day][hour].engagement = Math.round(((listeners - minListeners) / range) * 100);

      // Calculate trend
      if (hour > 0) {
        const prevListeners = grid[day][hour - 1].listeners;
        if (listeners > prevListeners * 1.1) grid[day][hour].trend = 'up';
        else if (listeners < prevListeners * 0.9) grid[day][hour].trend = 'down';
      }
    }
  }

  // Find peak day and hour
  let peakListeners = 0;
  let peakDay = 0;
  let peakHour = 0;

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      if (grid[day][hour].listeners > peakListeners) {
        peakListeners = grid[day][hour].listeners;
        peakDay = day;
        peakHour = hour;
      }
    }
  }

  // Calculate average engagement
  const avgEngagement = Math.round(
    grid.flat().reduce((sum, p) => sum + p.engagement, 0) / (7 * 24)
  );

  return {
    channelId,
    channelName,
    data: grid.flat(),
    peakDay,
    peakHour,
    avgEngagement
  };
}

/**
 * Get heatmap color based on engagement level
 */
export function getHeatmapColor(engagement: number): string {
  if (engagement < 20) return '#1f2937'; // Gray
  if (engagement < 40) return '#3b82f6'; // Blue
  if (engagement < 60) return '#10b981'; // Green
  if (engagement < 80) return '#f59e0b'; // Amber
  return '#ef4444'; // Red
}

/**
 * Format heatmap data for visualization
 */
export function formatHeatmapForVisualization(heatmap: ChannelHeatmapData) {
  return {
    channel: heatmap.channelName,
    peakTime: `${DAYS[heatmap.peakDay]} ${HOURS[heatmap.peakHour]}`,
    avgEngagement: heatmap.avgEngagement,
    grid: Array(7).fill(null).map((_, day) =>
      Array(24).fill(null).map((_, hour) => {
        const point = heatmap.data.find(p => p.day === day && p.hour === hour);
        return {
          day: DAYS[day],
          hour: HOURS[hour],
          listeners: point?.listeners || 0,
          engagement: point?.engagement || 0,
          color: point ? getHeatmapColor(point.engagement) : '#1f2937',
          trend: point?.trend || 'stable'
        };
      })
    )
  };
}

/**
 * Compare heatmaps across multiple channels
 */
export function compareChannelHeatmaps(heatmaps: ChannelHeatmapData[]) {
  return {
    channels: heatmaps.map(h => ({
      name: h.channelName,
      peakTime: `${DAYS[h.peakDay]} ${HOURS[h.peakHour]}`,
      avgEngagement: h.avgEngagement,
      maxListeners: Math.max(...h.data.map(d => d.listeners))
    })),
    overallPeakDay: DAYS[getMostCommonDay(heatmaps)],
    overallPeakHour: getMostCommonHour(heatmaps),
    avgEngagementAcrossChannels: Math.round(
      heatmaps.reduce((sum, h) => sum + h.avgEngagement, 0) / heatmaps.length
    )
  };
}

/**
 * Get most common peak day across channels
 */
function getMostCommonDay(heatmaps: ChannelHeatmapData[]): number {
  const dayCounts = Array(7).fill(0);
  heatmaps.forEach(h => dayCounts[h.peakDay]++);
  return dayCounts.indexOf(Math.max(...dayCounts));
}

/**
 * Get most common peak hour across channels
 */
function getMostCommonHour(heatmaps: ChannelHeatmapData[]): number {
  const hourCounts = Array(24).fill(0);
  heatmaps.forEach(h => hourCounts[h.peakHour]++);
  return hourCounts.indexOf(Math.max(...hourCounts));
}

/**
 * Generate recommendations based on heatmap data
 */
export function generateHeatmapRecommendations(heatmap: ChannelHeatmapData): string[] {
  const recommendations: string[] = [];

  // Peak time recommendation
  recommendations.push(
    `Schedule premium content on ${DAYS[heatmap.peakDay]} at ${HOURS[heatmap.peakHour]} for maximum reach`
  );

  // Engagement recommendation
  if (heatmap.avgEngagement < 40) {
    recommendations.push('Consider promotional campaigns to increase listener engagement');
  } else if (heatmap.avgEngagement > 80) {
    recommendations.push('Excellent engagement! Maintain current content strategy');
  }

  // Low engagement hours
  const lowEngagementHours = heatmap.data
    .filter(p => p.engagement < 20)
    .map(p => HOURS[p.hour])
    .filter((h, i, arr) => arr.indexOf(h) === i)
    .slice(0, 3);

  if (lowEngagementHours.length > 0) {
    recommendations.push(
      `Consider filling low-engagement hours (${lowEngagementHours.join(', ')}) with special programming`
    );
  }

  // Trend analysis
  const upTrends = heatmap.data.filter(p => p.trend === 'up').length;
  const downTrends = heatmap.data.filter(p => p.trend === 'down').length;

  if (upTrends > downTrends) {
    recommendations.push('Listener growth trend detected - capitalize on momentum');
  } else if (downTrends > upTrends) {
    recommendations.push('Declining trend observed - consider content refresh or promotions');
  }

  return recommendations;
}

/**
 * Export heatmap data as CSV
 */
export function exportHeatmapAsCSV(heatmap: ChannelHeatmapData): string {
  const headers = ['Day', 'Hour', 'Avg Listeners', 'Engagement (%)', 'Trend'];
  const rows = heatmap.data.map(p => [
    DAYS[p.day],
    HOURS[p.hour],
    p.listeners.toString(),
    p.engagement.toString(),
    p.trend
  ]);

  const csv = [
    `Channel: ${heatmap.channelName}`,
    `Peak Time: ${DAYS[heatmap.peakDay]} ${HOURS[heatmap.peakHour]}`,
    `Average Engagement: ${heatmap.avgEngagement}%`,
    '',
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csv;
}
