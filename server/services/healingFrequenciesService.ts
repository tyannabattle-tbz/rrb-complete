/**
 * Healing Frequencies Service
 * Solfeggio frequencies with binaural beats and healing sessions
 */

export interface SolfeggioFrequency {
  hz: number;
  name: string;
  description: string;
  benefits: string[];
  chakra?: string;
}

export interface HealingSession {
  id: string;
  name: string;
  duration: number;
  frequencies: number[];
  backgroundSound: string;
  instructions: string;
}

class HealingFrequenciesService {
  private frequencies: Map<number, SolfeggioFrequency> = new Map();
  private sessions: Map<string, HealingSession> = new Map();

  constructor() {
    this.initializeFrequencies();
    this.initializeSessions();
  }

  private initializeFrequencies(): void {
    const solfeggioFrequencies: SolfeggioFrequency[] = [
      {
        hz: 174,
        name: 'Root Chakra',
        description: 'Foundation and grounding',
        benefits: ['Grounding', 'Safety', 'Stability'],
        chakra: 'Root',
      },
      {
        hz: 285,
        name: 'Sacral Chakra',
        description: 'Creativity and sexuality',
        benefits: ['Creativity', 'Sexuality', 'Vitality'],
        chakra: 'Sacral',
      },
      {
        hz: 396,
        name: 'Solar Plexus',
        description: 'Liberation from fear',
        benefits: ['Courage', 'Confidence', 'Power'],
        chakra: 'Solar Plexus',
      },
      {
        hz: 417,
        name: 'Transformation',
        description: 'Facilitating change',
        benefits: ['Change', 'Transformation', 'Renewal'],
      },
      {
        hz: 528,
        name: 'Love Frequency',
        description: 'Healing and miracles',
        benefits: ['Love', 'Healing', 'Miracles', 'DNA Repair'],
        chakra: 'Heart',
      },
      {
        hz: 639,
        name: 'Heart Chakra',
        description: 'Relationships and harmony',
        benefits: ['Harmony', 'Communication', 'Relationships'],
        chakra: 'Heart',
      },
      {
        hz: 741,
        name: 'Throat Chakra',
        description: 'Expression and truth',
        benefits: ['Expression', 'Truth', 'Communication'],
        chakra: 'Throat',
      },
      {
        hz: 852,
        name: 'Third Eye',
        description: 'Intuition and insight',
        benefits: ['Intuition', 'Insight', 'Clarity'],
        chakra: 'Third Eye',
      },
      {
        hz: 963,
        name: 'Crown Chakra',
        description: 'Spiritual connection',
        benefits: ['Spirituality', 'Connection', 'Enlightenment'],
        chakra: 'Crown',
      },
    ];

    solfeggioFrequencies.forEach((freq) => {
      this.frequencies.set(freq.hz, freq);
    });
  }

  private initializeSessions(): void {
    this.sessions.set('meditation', {
      id: 'meditation',
      name: 'Deep Meditation',
      duration: 30,
      frequencies: [432, 528],
      backgroundSound: 'nature-ambience',
      instructions: 'Find a quiet place, sit comfortably, and let the frequencies guide your meditation.',
    });

    this.sessions.set('sleep', {
      id: 'sleep',
      name: 'Healing Sleep',
      duration: 60,
      frequencies: [174, 285],
      backgroundSound: 'rain-sounds',
      instructions: 'Listen before bed for deep, restorative sleep.',
    });

    this.sessions.set('focus', {
      id: 'focus',
      name: 'Deep Focus',
      duration: 45,
      frequencies: [741, 852],
      backgroundSound: 'binaural-beats',
      instructions: 'Use during work or study for enhanced concentration.',
    });

    this.sessions.set('healing', {
      id: 'healing',
      name: 'Full Healing',
      duration: 90,
      frequencies: [396, 417, 528, 639],
      backgroundSound: 'crystal-bowls',
      instructions: 'Complete healing session for body, mind, and spirit.',
    });
  }

  async getFrequencies(): Promise<SolfeggioFrequency[]> {
    return Array.from(this.frequencies.values());
  }

  async getFrequency(hz: number): Promise<SolfeggioFrequency | null> {
    return this.frequencies.get(hz) || null;
  }

  async getSessions(): Promise<HealingSession[]> {
    return Array.from(this.sessions.values());
  }

  async getSession(id: string): Promise<HealingSession | null> {
    return this.sessions.get(id) || null;
  }

  async generateBinauralBeat(frequency: number, duration: number): Promise<{
    audioUrl: string;
    duration: number;
    frequency: number;
  }> {
    return {
      audioUrl: `http://localhost:8080/audio/binaural-${frequency}hz-${duration}min.mp3`,
      duration,
      frequency,
    };
  }
}

export const healingFrequenciesService = new HealingFrequenciesService();
