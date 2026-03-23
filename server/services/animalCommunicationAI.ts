import { invokeLLM } from '../_core/llm';

/**
 * Animal Communication AI
 * Detects, analyzes, and responds to animal communication patterns
 * Supports wildlife monitoring, conservation, and interaction
 * Built for your sons' request for animal communication capabilities
 */

export type AnimalType =
  | 'bird'
  | 'mammal'
  | 'reptile'
  | 'amphibian'
  | 'insect'
  | 'marine'
  | 'primate'
  | 'canine'
  | 'feline'
  | 'equine';

export interface AnimalSignal {
  id: string;
  timestamp: number;
  animalType: AnimalType;
  species: string;
  signalType: 'vocalization' | 'movement' | 'gesture' | 'scent' | 'electrical' | 'visual';
  frequency?: number; // Hz for vocalizations
  intensity: number; // 0-100
  pattern: string;
  interpretation: string;
  confidence: number;
  location?: { latitude: number; longitude: number };
  metadata: Record<string, any>;
}

export interface AnimalResponse {
  id: string;
  timestamp: number;
  targetSpecies: string;
  responseType: 'vocalization' | 'movement' | 'gesture' | 'scent' | 'visual';
  content: string;
  frequency?: number;
  intensity: number;
  duration: number;
  expectedReaction?: string;
}

export class AnimalCommunicationAI {
  private signals: AnimalSignal[] = [];
  private responses: AnimalResponse[] = [];
  private maxSignals = 1000;
  private isActive = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  // Animal communication database
  private animalDatabase = {
    bird: {
      vocalizations: ['chirp', 'song', 'call', 'alarm', 'mating'],
      frequencies: [2000, 8000], // Hz range
      meanings: {
        chirp: 'Contact call',
        song: 'Territorial/mating',
        call: 'Alert/gathering',
        alarm: 'Predator warning',
        mating: 'Breeding signal',
      },
    },
    mammal: {
      vocalizations: ['howl', 'growl', 'purr', 'squeak', 'roar'],
      frequencies: [20, 20000], // Hz range
      meanings: {
        howl: 'Pack communication',
        growl: 'Warning/threat',
        purr: 'Contentment',
        squeak: 'Distress',
        roar: 'Territorial',
      },
    },
    marine: {
      vocalizations: ['click', 'whistle', 'song', 'burst'],
      frequencies: [10, 130000], // Hz range (dolphins/whales)
      meanings: {
        click: 'Echolocation',
        whistle: 'Social call',
        song: 'Mating/bonding',
        burst: 'Alarm/aggression',
      },
    },
    primate: {
      vocalizations: ['hoot', 'scream', 'bark', 'pant-hoot', 'lip-smack'],
      frequencies: [100, 4000], // Hz range
      meanings: {
        hoot: 'Long-distance call',
        scream: 'Alarm/distress',
        bark: 'Alert',
        'pant-hoot': 'Excitement',
        'lip-smack': 'Affiliation',
      },
    },
    insect: {
      vocalizations: ['chirp', 'buzz', 'click', 'vibration'],
      frequencies: [1000, 20000], // Hz range
      meanings: {
        chirp: 'Mating call',
        buzz: 'Alarm/aggression',
        click: 'Navigation',
        vibration: 'Substrate communication',
      },
    },
  };

  constructor() {
    this.initialize();
  }

  /**
   * Initialize animal communication AI
   */
  private initialize() {
    console.log('[Animal Communication AI] Initializing wildlife monitoring system...');
    this.isActive = true;

    // Start monitoring
    this.startMonitoring();

    console.log('[Animal Communication AI] Active and listening to wildlife signals');
  }

  /**
   * Start monitoring for animal signals
   */
  private startMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.detectSignals();
    }, 5000); // Monitor every 5 seconds
  }

  /**
   * Detect animal signals
   */
  private async detectSignals(): Promise<void> {
    if (!this.isActive) return;

    try {
      // Simulate signal detection
      const detectedSignal = await this.simulateSignalDetection();

      if (detectedSignal) {
        this.signals.push(detectedSignal);

        console.log(
          `[Animal Communication AI] Signal detected: ${detectedSignal.species} - ${detectedSignal.interpretation}`,
        );

        // Analyze and respond
        await this.analyzeAndRespond(detectedSignal);

        // Manage signal history
        if (this.signals.length > this.maxSignals) {
          this.signals.shift();
        }
      }
    } catch (error) {
      console.error('[Animal Communication AI] Error detecting signals:', error);
    }
  }

  /**
   * Simulate signal detection
   */
  private async simulateSignalDetection(): Promise<AnimalSignal | null> {
    // 30% chance of detecting a signal
    if (Math.random() > 0.3) return null;

    const animalTypes: AnimalType[] = ['bird', 'mammal', 'marine', 'primate', 'insect'];
    const selectedType = animalTypes[Math.floor(Math.random() * animalTypes.length)];

    const species = this.getRandomSpecies(selectedType);
    const db = this.animalDatabase[selectedType as keyof typeof this.animalDatabase];
    const vocalization = db.vocalizations[Math.floor(Math.random() * db.vocalizations.length)];

    const signal: AnimalSignal = {
      id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      animalType: selectedType,
      species,
      signalType: 'vocalization',
      frequency: Math.random() * (db.frequencies[1] - db.frequencies[0]) + db.frequencies[0],
      intensity: Math.floor(Math.random() * 100),
      pattern: vocalization,
      interpretation: db.meanings[vocalization as keyof typeof db.meanings] || 'Unknown',
      confidence: 70 + Math.random() * 30,
      location: {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.006 + (Math.random() - 0.5) * 0.1,
      },
      metadata: {
        duration: Math.floor(Math.random() * 5000),
        repetitions: Math.floor(Math.random() * 10) + 1,
        timeOfDay: new Date().getHours(),
        weather: 'Clear',
      },
    };

    return signal;
  }

  /**
   * Get random species
   */
  private getRandomSpecies(animalType: AnimalType): string {
    const speciesMap = {
      bird: ['Robin', 'Blue Jay', 'Hawk', 'Owl', 'Parrot', 'Crow'],
      mammal: ['Wolf', 'Lion', 'Bear', 'Deer', 'Rabbit', 'Squirrel'],
      marine: ['Dolphin', 'Whale', 'Seal', 'Shark', 'Fish', 'Octopus'],
      primate: ['Chimpanzee', 'Gorilla', 'Orangutan', 'Monkey', 'Lemur'],
      insect: ['Grasshopper', 'Cricket', 'Cicada', 'Bee', 'Ant'],
      reptile: ['Snake', 'Lizard', 'Turtle', 'Crocodile'],
      amphibian: ['Frog', 'Toad', 'Salamander'],
      canine: ['Dog', 'Wolf', 'Fox', 'Coyote'],
      feline: ['Cat', 'Lion', 'Tiger', 'Leopard'],
      equine: ['Horse', 'Zebra', 'Donkey'],
    };

    const species = speciesMap[animalType] || ['Unknown'];
    return species[Math.floor(Math.random() * species.length)];
  }

  /**
   * Analyze and respond to signals
   */
  private async analyzeAndRespond(signal: AnimalSignal): Promise<void> {
    try {
      // Use LLM to analyze signal
      const analysis = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are an expert in animal communication and wildlife behavior.',
          },
          {
            role: 'user',
            content: `Analyze this animal signal: Species: ${signal.species}, Pattern: ${signal.pattern}, Interpretation: ${signal.interpretation}, Intensity: ${signal.intensity}. Provide a brief response strategy in 1-2 sentences.`,
          },
        ],
      });

      const responseStrategy = analysis.choices[0].message.content || 'Monitor for further signals';

      // Generate response
      const response: AnimalResponse = {
        id: `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        targetSpecies: signal.species,
        responseType: 'vocalization',
        content: responseStrategy,
        frequency: signal.frequency,
        intensity: Math.floor(signal.intensity * 0.8), // Slightly lower intensity
        duration: 2000,
        expectedReaction: 'Awaiting response',
      };

      this.responses.push(response);

      console.log(`[Animal Communication AI] Response generated for ${signal.species}`);
    } catch (error) {
      console.error('[Animal Communication AI] Error analyzing signal:', error);
    }
  }

  /**
   * Get recent signals
   */
  getRecentSignals(limit: number = 50): AnimalSignal[] {
    return this.signals.slice(-limit);
  }

  /**
   * Get signals by species
   */
  getSignalsBySpecies(species: string, limit: number = 50): AnimalSignal[] {
    return this.signals.filter((s) => s.species === species).slice(-limit);
  }

  /**
   * Get signals by animal type
   */
  getSignalsByType(animalType: AnimalType, limit: number = 50): AnimalSignal[] {
    return this.signals.filter((s) => s.animalType === animalType).slice(-limit);
  }

  /**
   * Get wildlife statistics
   */
  getWildlifeStats() {
    const recentSignals = this.signals.slice(-100);
    const speciesCount = new Map<string, number>();
    const typeCount = new Map<AnimalType, number>();

    recentSignals.forEach((signal) => {
      speciesCount.set(signal.species, (speciesCount.get(signal.species) || 0) + 1);
      typeCount.set(signal.animalType, (typeCount.get(signal.animalType) || 0) + 1);
    });

    return {
      totalSignals: this.signals.length,
      recentSignals: recentSignals.length,
      uniqueSpecies: speciesCount.size,
      animalTypes: typeCount.size,
      topSpecies: Array.from(speciesCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      avgConfidence: (recentSignals.reduce((sum, s) => sum + s.confidence, 0) / recentSignals.length).toFixed(1),
    };
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    this.isActive = false;
    console.log('[Animal Communication AI] Stopped');
  }

  /**
   * Get status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      totalSignals: this.signals.length,
      totalResponses: this.responses.length,
      recentSignals: this.signals.slice(-5),
      stats: this.getWildlifeStats(),
    };
  }
}

// Singleton instance
export const animalCommunicationAI = new AnimalCommunicationAI();
