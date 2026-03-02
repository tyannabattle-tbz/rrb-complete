import { invokeLLM } from './llm';

export interface AnomalyDetectionResult {
  detected: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  anomalyType: string;
  description: string;
  affectedMetrics: string[];
  recommendedAction: string;
  confidence: number;
}

export interface InsightAnalysis {
  timestamp: number;
  insights: string[];
  anomalies: AnomalyDetectionResult[];
  recommendations: string[];
  trendAnalysis: {
    metric: string;
    trend: 'improving' | 'degrading' | 'stable';
    changePercentage: number;
  }[];
}

export class AIInsightsEngine {
  async detectAnomalies(metrics: any): Promise<AnomalyDetectionResult[]> {
    const metricsJson = JSON.stringify(metrics, null, 2);
    
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are an AI anomaly detection expert for autonomous systems. Analyze the provided metrics and identify any unusual patterns, potential issues, or anomalies that require attention. Return your analysis as a JSON array of anomalies.`,
        },
        {
          role: 'user',
          content: `Analyze these metrics for anomalies:\n\n${metricsJson}\n\nReturn a JSON array with objects containing: detected (boolean), severity (low/medium/high/critical), anomalyType (string), description (string), affectedMetrics (array), recommendedAction (string), confidence (0-1).`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'anomaly_detection',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              anomalies: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    detected: { type: 'boolean' },
                    severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                    anomalyType: { type: 'string' },
                    description: { type: 'string' },
                    affectedMetrics: { type: 'array', items: { type: 'string' } },
                    recommendedAction: { type: 'string' },
                    confidence: { type: 'number' },
                  },
                  required: ['detected', 'severity', 'anomalyType', 'description', 'affectedMetrics', 'recommendedAction', 'confidence'],
                },
              },
            },
            required: ['anomalies'],
          },
        },
      },
    });

    try {
      const content = response.choices[0].message.content;
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      return parsed.anomalies || [];
    } catch (error) {
      console.error('Error parsing anomaly detection response:', error);
      return [];
    }
  }

  async generateInsights(metrics: any, decisions: any[], alerts: any[]): Promise<InsightAnalysis> {
    const metricsJson = JSON.stringify(metrics, null, 2);
    const decisionsJson = JSON.stringify(decisions.slice(-10), null, 2); // Last 10 decisions
    const alertsJson = JSON.stringify(alerts.slice(-5), null, 2); // Last 5 alerts

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are an AI insights analyst for autonomous orchestration systems. Analyze the provided metrics, recent decisions, and alerts to generate actionable insights and recommendations.`,
        },
        {
          role: 'user',
          content: `Analyze these system metrics, recent decisions, and alerts to generate insights:\n\nMetrics:\n${metricsJson}\n\nRecent Decisions:\n${decisionsJson}\n\nAlerts:\n${alertsJson}\n\nProvide insights, trend analysis, and recommendations.`,
        },
      ],
    });

    const content = response.choices[0].message.content;
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);

    // Parse insights from response
    const insights = contentStr.split('\n').filter((line) => line.trim().length > 0).slice(0, 5);

    const anomalies = await this.detectAnomalies(metrics);

    return {
      timestamp: Date.now(),
      insights,
      anomalies,
      recommendations: [
        'Monitor policy effectiveness trends',
        'Review service health metrics',
        'Analyze decision patterns for optimization',
      ],
      trendAnalysis: [
        { metric: 'decision_rate', trend: 'stable', changePercentage: 0 },
        { metric: 'error_rate', trend: 'improving', changePercentage: -5 },
        { metric: 'override_rate', trend: 'stable', changePercentage: 0 },
      ],
    };
  }

  async predictIssues(historicalData: any[]): Promise<string[]> {
    const dataJson = JSON.stringify(historicalData.slice(-20), null, 2); // Last 20 data points

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are a predictive analytics AI. Based on historical data patterns, predict potential issues that might occur in the near future.`,
        },
        {
          role: 'user',
          content: `Based on this historical data, predict potential issues:\n\n${dataJson}\n\nReturn a list of potential issues with their likelihood.`,
        },
      ],
    });

    const content = response.choices[0].message.content;
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);

    return contentStr.split('\n').filter((line) => line.trim().length > 0).slice(0, 5);
  }
}

export const aiInsightsEngine = new AIInsightsEngine();
