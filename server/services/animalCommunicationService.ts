import { invokeLLM } from '../_core/llm';

export interface AnimalMessage {
  animal: string;
  species: 'dog' | 'cat' | 'bird' | 'horse' | 'elephant' | 'dolphin' | 'parrot' | 'rabbit' | 'other';
  behavior: string;
  emotion?: string;
  location?: string;
  timestamp: number;
}

export interface AnimalResponse {
  interpretation: string;
  meaning: string;
  emotion: string;
  recommendations: string[];
  confidence: number;
}

export interface CommunicationSession {
  sessionId: string;
  animal: string;
  species: string;
  messages: AnimalMessage[];
  responses: AnimalResponse[];
  startTime: number;
  lastUpdated: number;
}

class AnimalCommunicationService {
  private sessions: Map<string, CommunicationSession> = new Map();

  /**
   * Interpret animal behavior and communicate meaning
   */
  async interpretAnimalBehavior(
    animal: string,
    species: string,
    behavior: string,
    emotion?: string,
    location?: string
  ): Promise<AnimalResponse> {
    const prompt = `You are an expert animal behaviorist and animal communication specialist. 
    
An animal needs interpretation and communication:
- Animal Name: ${animal}
- Species: ${species}
- Observed Behavior: ${behavior}
${emotion ? `- Apparent Emotion: ${emotion}` : ''}
${location ? `- Location: ${location}` : ''}

Please provide:
1. A clear interpretation of what this behavior means
2. The likely emotion or need the animal is expressing
3. Specific recommendations for how to respond or help
4. Your confidence level (0-100) in this interpretation

Format your response as JSON with keys: interpretation, meaning, emotion, recommendations (array), confidence (number)`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content:
              'You are an expert animal behaviorist specializing in animal communication and understanding animal emotions and needs. Provide accurate, compassionate, and scientifically-grounded interpretations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'animal_interpretation',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                interpretation: {
                  type: 'string',
                  description: 'Clear interpretation of the animal behavior',
                },
                meaning: {
                  type: 'string',
                  description: 'What the behavior means',
                },
                emotion: {
                  type: 'string',
                  description: 'The likely emotion or need',
                },
                recommendations: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Specific recommendations for response',
                },
                confidence: {
                  type: 'number',
                  description: 'Confidence level 0-100',
                },
              },
              required: ['interpretation', 'meaning', 'emotion', 'recommendations', 'confidence'],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0].message.content;
      if (typeof content === 'string') {
        const parsed = JSON.parse(content);
        return {
          interpretation: parsed.interpretation,
          meaning: parsed.meaning,
          emotion: parsed.emotion,
          recommendations: parsed.recommendations,
          confidence: parsed.confidence,
        };
      }

      return {
        interpretation: 'Unable to interpret',
        meaning: 'Communication error',
        emotion: 'Unknown',
        recommendations: [],
        confidence: 0,
      };
    } catch (error) {
      console.error('Animal communication error:', error);
      return {
        interpretation: 'Error during interpretation',
        meaning: 'Service temporarily unavailable',
        emotion: 'Unknown',
        recommendations: ['Please try again later'],
        confidence: 0,
      };
    }
  }

  /**
   * Create a new communication session
   */
  createSession(animal: string, species: string): CommunicationSession {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: CommunicationSession = {
      sessionId,
      animal,
      species,
      messages: [],
      responses: [],
      startTime: Date.now(),
      lastUpdated: Date.now(),
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Add a message to a session
   */
  async addMessage(
    sessionId: string,
    behavior: string,
    emotion?: string,
    location?: string
  ): Promise<{ message: AnimalMessage; response: AnimalResponse }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const message: AnimalMessage = {
      animal: session.animal,
      species: session.species as any,
      behavior,
      emotion,
      location,
      timestamp: Date.now(),
    };

    const response = await this.interpretAnimalBehavior(
      session.animal,
      session.species,
      behavior,
      emotion,
      location
    );

    session.messages.push(message);
    session.responses.push(response);
    session.lastUpdated = Date.now();

    return { message, response };
  }

  /**
   * Get session history
   */
  getSession(sessionId: string): CommunicationSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all sessions
   */
  getAllSessions(): CommunicationSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Generate animal wellness report
   */
  async generateWellnessReport(sessionId: string): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const summary = session.responses
      .map((r) => `- ${r.meaning}: ${r.recommendations[0]}`)
      .join('\n');

    const prompt = `Based on these animal communication observations:
${summary}

Generate a brief wellness report for ${session.animal} (${session.species}) including:
1. Overall emotional state
2. Key needs identified
3. Recommended care actions
4. When to contact a veterinarian`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content:
              'You are a compassionate animal care specialist. Provide practical, caring wellness recommendations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      return response.choices[0].message.content as string;
    } catch (error) {
      console.error('Wellness report error:', error);
      return 'Unable to generate wellness report at this time.';
    }
  }

  /**
   * Clear old sessions (older than 24 hours)
   */
  clearOldSessions(): number {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    let cleared = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.startTime > oneDayMs) {
        this.sessions.delete(sessionId);
        cleared++;
      }
    }

    return cleared;
  }
}

export const animalCommunicationService = new AnimalCommunicationService();
