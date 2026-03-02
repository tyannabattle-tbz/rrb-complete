import { invokeLLM } from '../_core/llm';
import { db } from '../db';
import { broadcastSchedule } from '../../drizzle/schema-rrb-radio';

/**
 * 24/7 Content Scheduling Engine
 * Qumus autonomously populates airwaves with radio, podcasts, video, and commercials
 * Default frequency: 432 Hz (healing frequency)
 */

export interface ScheduledContent {
  id: string;
  type: 'radio' | 'podcast' | 'video' | 'commercial' | 'healing_frequency';
  title: string;
  duration: number; // minutes
  startTime: Date;
  endTime: Date;
  frequency?: number; // Hz
  aiGenerated: boolean;
  successProbability: number;
}

export interface ContentSchedule {
  date: Date;
  schedule: ScheduledContent[];
  totalDuration: number;
  coverage: number; // percentage of 24 hours
}

export class ContentSchedulingEngine {
  private defaultFrequency = 432; // Hz (healing frequency)
  private contentTypes = ['radio', 'podcast', 'video', 'commercial', 'healing_frequency'];
  private minContentDuration = 15; // minutes
  private maxContentDuration = 120; // minutes

  /**
   * Generate 24-hour content schedule using Qumus AI
   */
  async generateDailySchedule(date: Date): Promise<ContentSchedule> {
    console.log(`[Scheduling] Generating 24-hour schedule for ${date.toDateString()}`);

    const schedule: ScheduledContent[] = [];
    let currentTime = new Date(date);
    currentTime.setHours(0, 0, 0, 0);
    const endOfDay = new Date(currentTime);
    endOfDay.setHours(23, 59, 59, 999);

    let totalDuration = 0;

    // Use LLM to generate content plan
    const contentPlan = await this.generateContentPlanWithLLM(date);

    for (const contentItem of contentPlan) {
      if (currentTime >= endOfDay) break;

      const startTime = new Date(currentTime);
      const duration = Math.min(contentItem.duration, this.maxContentDuration);
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

      const content: ScheduledContent = {
        id: `content_${Date.now()}_${Math.random()}`,
        type: contentItem.type,
        title: contentItem.title,
        duration,
        startTime,
        endTime,
        frequency: contentItem.frequency || this.defaultFrequency,
        aiGenerated: true,
        successProbability: contentItem.successProbability,
      };

      schedule.push(content);
      totalDuration += duration;
      currentTime = endTime;
    }

    // Fill remaining time with healing frequencies
    while (currentTime < endOfDay) {
      const remainingMinutes = (endOfDay.getTime() - currentTime.getTime()) / (1000 * 60);
      if (remainingMinutes < 5) break;

      const duration = Math.min(30, remainingMinutes);
      const endTime = new Date(currentTime.getTime() + duration * 60 * 1000);

      schedule.push({
        id: `healing_${Date.now()}_${Math.random()}`,
        type: 'healing_frequency',
        title: `Healing Frequency ${this.defaultFrequency} Hz`,
        duration,
        startTime: new Date(currentTime),
        endTime,
        frequency: this.defaultFrequency,
        aiGenerated: true,
        successProbability: 0.95,
      });

      totalDuration += duration;
      currentTime = endTime;
    }

    const coverage = (totalDuration / (24 * 60)) * 100;

    console.log(`[Scheduling] Generated ${schedule.length} content items, ${coverage.toFixed(1)}% coverage`);

    return {
      date,
      schedule,
      totalDuration,
      coverage,
    };
  }

  /**
   * Use LLM to generate intelligent content plan
   */
  private async generateContentPlanWithLLM(date: Date) {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const hour = date.getHours();

    const prompt = `You are a radio programming director for RRB (Rockin' Rockin' Boogie), an advanced autonomous radio station.

Generate a content schedule for ${dayOfWeek}, ${date.toDateString()}.

Content types available:
- radio: Talk radio, music, news
- podcast: Interviews, storytelling, educational
- video: Music videos, tutorials, documentaries
- commercial: Promotional content, announcements
- healing_frequency: Solfeggio frequencies (174, 285, 396, 417, 528, 639, 741, 852, 963 Hz)

Requirements:
1. Fill 24 hours with engaging content
2. Mix content types for variety
3. Include healing frequencies during meditation hours (6-9 AM, 8-11 PM)
4. Prioritize listener engagement
5. Include commercials during peak hours (7-9 AM, 12-1 PM, 5-7 PM)

Return a JSON array of content items with this structure:
[
  {
    "type": "radio|podcast|video|commercial|healing_frequency",
    "title": "Content Title",
    "duration": 30,
    "frequency": 432,
    "successProbability": 0.85
  }
]

Generate 24 hours of content (1440 minutes total).`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are a radio programming AI. Return only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'content_schedule',
            strict: true,
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  title: { type: 'string' },
                  duration: { type: 'number' },
                  frequency: { type: 'number' },
                  successProbability: { type: 'number' },
                },
                required: ['type', 'title', 'duration', 'successProbability'],
              },
            },
          },
        },
      });

      const content = response.choices[0].message.content;
      const parsed = JSON.parse(content);
      return parsed;
    } catch (error) {
      console.error('[Scheduling] LLM error, using fallback schedule:', error);
      return this.generateFallbackSchedule();
    }
  }

  /**
   * Fallback schedule if LLM fails
   */
  private generateFallbackSchedule() {
    return [
      { type: 'healing_frequency', title: 'Morning Meditation 432 Hz', duration: 60, frequency: 432, successProbability: 0.95 },
      { type: 'radio', title: 'Morning Drive Show', duration: 120, frequency: 432, successProbability: 0.85 },
      { type: 'podcast', title: 'Daily News & Updates', duration: 30, frequency: 432, successProbability: 0.8 },
      { type: 'commercial', title: 'Featured Announcements', duration: 15, frequency: 432, successProbability: 0.9 },
      { type: 'radio', title: 'Midday Music Mix', duration: 120, frequency: 432, successProbability: 0.85 },
      { type: 'healing_frequency', title: 'Afternoon Healing 528 Hz', duration: 45, frequency: 528, successProbability: 0.95 },
      { type: 'podcast', title: 'Interview Series', duration: 60, frequency: 432, successProbability: 0.8 },
      { type: 'video', title: 'Music Video Premiere', duration: 30, frequency: 432, successProbability: 0.85 },
      { type: 'radio', title: 'Evening Show', duration: 120, frequency: 432, successProbability: 0.85 },
      { type: 'commercial', title: 'Evening Promotions', duration: 15, frequency: 432, successProbability: 0.9 },
      { type: 'healing_frequency', title: 'Night Meditation 639 Hz', duration: 90, frequency: 639, successProbability: 0.95 },
      { type: 'radio', title: 'Late Night Show', duration: 90, frequency: 432, successProbability: 0.8 },
    ];
  }

  /**
   * Save schedule to database
   */
  async saveSchedule(schedule: ContentSchedule) {
    console.log(`[Scheduling] Saving schedule to database`);

    for (const content of schedule.schedule) {
      try {
        await db.insert(broadcastSchedule).values({
          channelId: 'default',
          title: content.title,
          description: `${content.type} - ${content.duration} minutes`,
          scheduledStart: content.startTime,
          scheduledEnd: content.endTime,
          duration: content.duration,
          contentType: content.type,
          frequency: content.frequency,
          status: 'scheduled',
          successProbability: content.successProbability,
        });
      } catch (error) {
        console.error('[Scheduling] Error saving content:', error);
      }
    }
  }

  /**
   * Get current content
   */
  async getCurrentContent(): Promise<ScheduledContent | null> {
    const now = new Date();
    // Query database for current content
    // Implementation depends on your database setup
    return null;
  }

  /**
   * Get next content
   */
  async getNextContent(): Promise<ScheduledContent | null> {
    const now = new Date();
    // Query database for next content
    // Implementation depends on your database setup
    return null;
  }

  /**
   * Update schedule with real-time adjustments
   */
  async updateScheduleWithPredictions(schedule: ContentSchedule) {
    console.log(`[Scheduling] Updating schedule with AI predictions`);

    for (const content of schedule.schedule) {
      // Use LLM to predict if content will be successful
      const prediction = await this.predictContentSuccess(content);
      content.successProbability = prediction;

      // Adjust schedule if success probability is low
      if (prediction < 0.6) {
        console.log(`[Scheduling] Low success probability for ${content.title}, adjusting...`);
        // Swap with alternative content or extend healing frequencies
      }
    }

    return schedule;
  }

  /**
   * Predict content success using LLM
   */
  private async predictContentSuccess(content: ScheduledContent): Promise<number> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are a radio programming AI that predicts content success.',
          },
          {
            role: 'user',
            content: `Predict the success probability (0-1) of this radio content:
Type: ${content.type}
Title: ${content.title}
Duration: ${content.duration} minutes
Time: ${content.startTime.toLocaleTimeString()}

Return only a number between 0 and 1.`,
          },
        ],
      });

      const result = parseFloat(response.choices[0].message.content);
      return Math.min(Math.max(result, 0), 1); // Clamp between 0 and 1
    } catch (error) {
      console.error('[Scheduling] Prediction error:', error);
      return 0.75; // Default middle value
    }
  }

  /**
   * Get schedule statistics
   */
  getScheduleStats(schedule: ContentSchedule) {
    const stats = {
      totalContent: schedule.schedule.length,
      byType: {} as Record<string, number>,
      avgDuration: 0,
      avgSuccessProbability: 0,
      coverage: schedule.coverage,
    };

    for (const content of schedule.schedule) {
      stats.byType[content.type] = (stats.byType[content.type] || 0) + 1;
      stats.avgDuration += content.duration;
      stats.avgSuccessProbability += content.successProbability;
    }

    stats.avgDuration /= schedule.schedule.length;
    stats.avgSuccessProbability /= schedule.schedule.length;

    return stats;
  }
}

export const contentSchedulingEngine = new ContentSchedulingEngine();
