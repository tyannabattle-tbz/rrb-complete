import { db } from "../db";
import { invokeLLM } from "../_core/llm";

export interface AnimalProfile {
  id: string;
  userId: string;
  name: string;
  species: "dog" | "cat" | "bird" | "horse" | "elephant" | "dolphin" | "parrot" | "rabbit";
  breed?: string;
  age?: number;
  color?: string;
  personality: string[];
  medicalHistory: string[];
  behavioralTraits: string[];
  communicationHistory: Array<{
    date: number;
    message: string;
    interpretation: string;
    confidence: number;
  }>;
  wellnessScore: number;
  lastUpdated: number;
}

export interface WellnessTrend {
  date: number;
  score: number;
  mood: string;
  healthIndicators: string[];
}

export class AnimalProfileService {
  async createProfile(
    userId: string,
    name: string,
    species: string,
    breed?: string,
    age?: number
  ): Promise<AnimalProfile> {
    const profile: AnimalProfile = {
      id: `pet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      name,
      species: species as any,
      breed,
      age,
      personality: [],
      medicalHistory: [],
      behavioralTraits: [],
      communicationHistory: [],
      wellnessScore: 85,
      lastUpdated: Date.now(),
    };
    return profile;
  }

  async updatePersonality(
    profile: AnimalProfile,
    traits: string[]
  ): Promise<AnimalProfile> {
    profile.personality = traits;
    profile.lastUpdated = Date.now();
    return profile;
  }

  async addCommunicationEntry(
    profile: AnimalProfile,
    message: string,
    interpretation: string,
    confidence: number
  ): Promise<AnimalProfile> {
    profile.communicationHistory.push({
      date: Date.now(),
      message,
      interpretation,
      confidence,
    });

    // Keep only last 50 entries
    if (profile.communicationHistory.length > 50) {
      profile.communicationHistory = profile.communicationHistory.slice(-50);
    }

    profile.lastUpdated = Date.now();
    return profile;
  }

  async analyzeWellnessTrends(
    profile: AnimalProfile
  ): Promise<WellnessTrend[]> {
    const trends: WellnessTrend[] = [];
    const last7Days = profile.communicationHistory.filter(
      (entry) => Date.now() - entry.date < 7 * 24 * 60 * 60 * 1000
    );

    // Group by day
    const byDay = new Map<string, typeof last7Days>();
    last7Days.forEach((entry) => {
      const date = new Date(entry.date).toDateString();
      if (!byDay.has(date)) byDay.set(date, []);
      byDay.get(date)!.push(entry);
    });

    // Calculate daily trends
    for (const [date, entries] of byDay) {
      const avgConfidence =
        entries.reduce((sum, e) => sum + e.confidence, 0) / entries.length;
      const score = Math.round(avgConfidence * 100);

      trends.push({
        date: new Date(date).getTime(),
        score,
        mood: score > 80 ? "happy" : score > 60 ? "neutral" : "stressed",
        healthIndicators: entries
          .map((e) => e.interpretation)
          .filter((v, i, a) => a.indexOf(v) === i)
          .slice(0, 3),
      });
    }

    return trends.sort((a, b) => a.date - b.date);
  }

  async generateWellnessReport(profile: AnimalProfile): Promise<string> {
    const trends = await this.analyzeWellnessTrends(profile);
    const recentEntries = profile.communicationHistory.slice(-5);

    const prompt = `Based on this pet's communication history and wellness trends, provide a brief wellness report:

Pet: ${profile.name} (${profile.species})
Breed: ${profile.breed || "Unknown"}
Age: ${profile.age || "Unknown"}

Recent Communications:
${recentEntries.map((e) => `- "${e.message}" → ${e.interpretation}`).join("\n")}

Wellness Trends (last 7 days):
${trends.map((t) => `- ${new Date(t.date).toDateString()}: ${t.mood} (score: ${t.score})`).join("\n")}

Provide a concise wellness summary with recommendations.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a pet wellness advisor. Provide brief, actionable wellness reports.",
        },
        { role: "user", content: prompt },
      ],
    });

    return response.choices[0]?.message.content || "Unable to generate report";
  }

  async predictBehavior(
    profile: AnimalProfile,
    scenario: string
  ): Promise<string> {
    const traits = profile.personality.join(", ");
    const recentBehavior = profile.communicationHistory
      .slice(-3)
      .map((e) => e.interpretation)
      .join("; ");

    const prompt = `Given this pet's profile, predict how they would likely behave:

Pet: ${profile.name} (${profile.species})
Personality Traits: ${traits}
Recent Behavior: ${recentBehavior}

Scenario: ${scenario}

Provide a brief prediction of the pet's likely behavior and any recommendations.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an expert animal behaviorist. Provide accurate behavior predictions.",
        },
        { role: "user", content: prompt },
      ],
    });

    return response.choices[0]?.message.content || "Unable to predict behavior";
  }
}

export const animalProfileService = new AnimalProfileService();
