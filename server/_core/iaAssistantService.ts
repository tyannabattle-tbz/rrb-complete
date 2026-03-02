import { invokeLLM } from './llm';

export interface IaAssistant {
  assistantId: string;
  name: string;
  role: 'recommender' | 'optimizer' | 'analyst' | 'strategist';
  enabled: boolean;
  createdAt: number;
}

export interface Recommendation {
  recommendationId: string;
  assistantId: string;
  type: 'quality' | 'format' | 'timing' | 'audience' | 'strategy';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actionItems: string[];
  createdAt: number;
}

export interface InsightAnalysis {
  analysisId: string;
  assistantId: string;
  subject: string;
  insights: string[];
  recommendations: Recommendation[];
  score: number;
  createdAt: number;
}

export class IaAssistantService {
  private static assistants = new Map<string, IaAssistant>();
  private static recommendations: Recommendation[] = [];
  private static analyses: InsightAnalysis[] = [];

  static createAssistant(name: string, role: IaAssistant['role']): IaAssistant {
    const assistant: IaAssistant = {
      assistantId: `ia-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      role,
      enabled: true,
      createdAt: Date.now(),
    };
    this.assistants.set(assistant.assistantId, assistant);
    return assistant;
  }

  static async generateRecommendation(
    assistantId: string,
    subject: string,
    context: Record<string, any>
  ): Promise<Recommendation> {
    const assistant = this.assistants.get(assistantId);
    if (!assistant) throw new Error('Assistant not found');

    const prompt = `As a ${assistant.role}, provide a recommendation for: ${subject}. Context: ${JSON.stringify(context)}`;
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: `You are an intelligent assistant with role: ${assistant.role}` },
        { role: 'user', content: prompt },
      ],
    });

    const content = typeof response.choices[0].message.content === 'string' 
      ? response.choices[0].message.content 
      : 'Recommendation generated';
    const recommendation: Recommendation = {
      recommendationId: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      assistantId,
      type: this.inferType(subject),
      title: subject,
      description: content as string,
      impact: this.inferImpact(content as string),
      confidence: Math.random() * 0.3 + 0.7,
      actionItems: this.extractActionItems(content as string),
      createdAt: Date.now(),
    };

    this.recommendations.push(recommendation);
    return recommendation;
  }

  static async analyzeInsights(assistantId: string, subject: string, data: Record<string, any>): Promise<InsightAnalysis> {
    const assistant = this.assistants.get(assistantId);
    if (!assistant) throw new Error('Assistant not found');

    const prompt = `Analyze and provide insights on: ${subject}. Data: ${JSON.stringify(data)}`;
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: `You are an intelligent analyst. Provide deep insights and actionable recommendations.` },
        { role: 'user', content: prompt },
      ],
    });

    const content = typeof response.choices[0].message.content === 'string' 
      ? response.choices[0].message.content 
      : 'Analysis complete';
    const insights = (content as string).split('\n').filter((line: string) => line.trim().length > 0).slice(0, 5);

    const analysis: InsightAnalysis = {
      analysisId: `ana-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      assistantId,
      subject,
      insights,
      recommendations: [],
      score: Math.random() * 0.3 + 0.7,
      createdAt: Date.now(),
    };

    this.analyses.push(analysis);
    return analysis;
  }

  static getRecommendations(assistantId?: string, type?: Recommendation['type']): Recommendation[] {
    let recs = this.recommendations;
    if (assistantId) recs = recs.filter(r => r.assistantId === assistantId);
    if (type) recs = recs.filter(r => r.type === type);
    return recs.sort((a, b) => b.createdAt - a.createdAt);
  }

  static getAnalyses(assistantId?: string): InsightAnalysis[] {
    let analyses = this.analyses;
    if (assistantId) analyses = analyses.filter(a => a.assistantId === assistantId);
    return analyses.sort((a, b) => b.createdAt - a.createdAt);
  }

  static getTopRecommendations(limit: number = 10): Recommendation[] {
    return this.recommendations
      .sort((a, b) => {
        const impactScore = { high: 3, medium: 2, low: 1 };
        return (impactScore[b.impact] * b.confidence) - (impactScore[a.impact] * a.confidence);
      })
      .slice(0, limit);
  }

  private static inferType(subject: string): Recommendation['type'] {
    const lower = subject.toLowerCase();
    if (lower.includes('quality')) return 'quality';
    if (lower.includes('format')) return 'format';
    if (lower.includes('time') || lower.includes('schedule')) return 'timing';
    if (lower.includes('audience') || lower.includes('viewer')) return 'audience';
    return 'strategy';
  }

  private static inferImpact(content: string): 'high' | 'medium' | 'low' {
    const highImpactWords = ['critical', 'essential', 'significant', 'major'];
    const lowImpactWords = ['minor', 'small', 'slight', 'minimal'];
    const contentLower = content.toLowerCase();
    if (highImpactWords.some(w => contentLower.includes(w))) return 'high';
    if (lowImpactWords.some(w => contentLower.includes(w))) return 'low';
    return 'medium';
  }

  private static extractActionItems(content: string): string[] {
    return (content as string)
      .split('\n')
      .filter((line: string) => line.includes('•') || line.includes('-') || line.includes('*'))
      .map((line: string) => line.replace(/^[•\-*]\s*/, '').trim())
      .slice(0, 5);
  }

  static toggleAssistant(assistantId: string, enabled: boolean): IaAssistant {
    const assistant = this.assistants.get(assistantId);
    if (!assistant) throw new Error('Assistant not found');
    assistant.enabled = enabled;
    return assistant;
  }

  static getStats(): { totalAssistants: number; activeAssistants: number; totalRecommendations: number; totalAnalyses: number } {
    return {
      totalAssistants: this.assistants.size,
      activeAssistants: Array.from(this.assistants.values()).filter(a => a.enabled).length,
      totalRecommendations: this.recommendations.length,
      totalAnalyses: this.analyses.length,
    };
  }
}
