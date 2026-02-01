/**
 * Short Film Production System
 * Complete system for creating cinematic short films like "A Dragon in da Hood"
 */

export interface FilmScene {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  duration: number;
  animations: Array<{
    effect: string;
    duration: number;
    intensity: number;
  }>;
  voiceOver?: {
    text: string;
    duration: number;
    startTime: number;
  };
  soundEffects?: Array<{
    name: string;
    startTime: number;
    duration: number;
    volume: number;
  }>;
  transitions?: {
    type: 'fade' | 'crossfade' | 'wipeLeft' | 'wipeRight' | 'slideUp' | 'slideDown';
    duration: number;
  };
}

export interface FilmProduction {
  id: string;
  title: string;
  description: string;
  director: string;
  genre: string;
  scenes: FilmScene[];
  backgroundMusic?: {
    url: string;
    volume: number;
    fadeIn: number;
    fadeOut: number;
  };
  credits?: {
    title: string;
    duration: number;
    music?: string;
  };
  totalDuration: number;
  status: 'draft' | 'in-production' | 'completed' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * "A Dragon in da Hood" - Epic Short Film
 * A tale of a majestic dragon discovering the urban jungle
 */
export function createDragonInDaHoodFilm(
  dragonImage1: string,
  dragonImage2: string
): FilmProduction {
  const film: FilmProduction = {
    id: `film-dragon-hood-${Date.now()}`,
    title: 'A Dragon in da Hood',
    description:
      'An epic tale of a majestic dragon discovering the urban jungle. A journey through ancient magic and modern streets.',
    director: 'Qumus Productions',
    genre: 'Fantasy / Adventure',
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    scenes: [
      // Scene 1: Opening - Ancient Forest
      {
        id: 'scene-1',
        title: 'The Ancient Forest',
        description: 'A majestic dragon awakens in the ancient forest, surrounded by mystical energy',
        imageUrl: dragonImage1,
        duration: 8,
        animations: [
          { effect: 'kenBurns', duration: 8, intensity: 0.7 },
          { effect: 'particles', duration: 8, intensity: 0.8 },
        ],
        voiceOver: {
          text: 'In a realm where magic flows through ancient roots, a dragon stirs from eternal slumber...',
          duration: 6,
          startTime: 1,
        },
        transitions: {
          type: 'fade',
          duration: 1,
        },
      },

      // Scene 2: The Journey Begins
      {
        id: 'scene-2',
        title: 'The Journey Begins',
        description: 'The dragon spreads its wings and prepares for an epic journey',
        imageUrl: dragonImage2,
        duration: 10,
        animations: [
          { effect: 'panLeft', duration: 10, intensity: 0.6 },
          { effect: 'zoomIn', duration: 10, intensity: 0.4 },
        ],
        voiceOver: {
          text: 'Drawn by an unknown force, it ventures beyond the forest, seeking something lost in time...',
          duration: 6,
          startTime: 2,
        },
        soundEffects: [
          {
            name: 'dragon_roar',
            startTime: 3,
            duration: 2,
            volume: 0.8,
          },
          {
            name: 'wind_whoosh',
            startTime: 5,
            duration: 3,
            volume: 0.6,
          },
        ],
        transitions: {
          type: 'wipeRight',
          duration: 1,
        },
      },

      // Scene 3: Urban Discovery
      {
        id: 'scene-3',
        title: 'Urban Discovery',
        description: 'The dragon arrives at the edge of the urban jungle',
        imageUrl: dragonImage1,
        duration: 12,
        animations: [
          { effect: 'rotate', duration: 12, intensity: 0.3 },
          { effect: 'particles', duration: 12, intensity: 0.6 },
        ],
        voiceOver: {
          text: 'The city rises before it like a fortress of glass and steel. A new world. A new beginning.',
          duration: 7,
          startTime: 2,
        },
        soundEffects: [
          {
            name: 'city_ambience',
            startTime: 0,
            duration: 12,
            volume: 0.4,
          },
          {
            name: 'dragon_breath',
            startTime: 8,
            duration: 2,
            volume: 0.7,
          },
        ],
        transitions: {
          type: 'crossfade',
          duration: 2,
        },
      },

      // Scene 4: The Climax
      {
        id: 'scene-4',
        title: 'The Climax',
        description: 'The dragon stands triumphant, bridging two worlds',
        imageUrl: dragonImage2,
        duration: 10,
        animations: [
          { effect: 'kenBurns', duration: 10, intensity: 0.9 },
          { effect: 'particles', duration: 10, intensity: 1 },
        ],
        voiceOver: {
          text: 'In this moment, ancient magic and modern world collide. The dragon has found its place.',
          duration: 6,
          startTime: 2,
        },
        soundEffects: [
          {
            name: 'epic_music_swell',
            startTime: 0,
            duration: 10,
            volume: 0.9,
          },
          {
            name: 'magical_shimmer',
            startTime: 5,
            duration: 5,
            volume: 0.8,
          },
        ],
        transitions: {
          type: 'fade',
          duration: 2,
        },
      },

      // Scene 5: Ending Credits
      {
        id: 'scene-5',
        title: 'Credits Roll',
        description: 'The final scene with credits',
        imageUrl: dragonImage1,
        duration: 8,
        animations: [
          { effect: 'fade', duration: 8, intensity: 0.5 },
        ],
        transitions: {
          type: 'fade',
          duration: 1,
        },
      },
    ],
    backgroundMusic: {
      url: 'epic-orchestral-music.mp3',
      volume: 0.6,
      fadeIn: 2,
      fadeOut: 3,
    },
    credits: {
      title: 'A Dragon in da Hood',
      duration: 8,
      music: 'Epic Orchestral Composition',
    },
    totalDuration: 0, // Will be calculated
  };

  // Calculate total duration
  film.totalDuration = film.scenes.reduce((sum, scene) => sum + scene.duration, 0);

  return film;
}

/**
 * Film production utilities
 */
export class FilmProducer {
  private film: FilmProduction;

  constructor(film: FilmProduction) {
    this.film = film;
  }

  /**
   * Add a scene to the film
   */
  addScene(scene: FilmScene): void {
    this.film.scenes.push(scene);
    this.updateTotalDuration();
  }

  /**
   * Remove a scene from the film
   */
  removeScene(sceneId: string): boolean {
    const index = this.film.scenes.findIndex((s) => s.id === sceneId);
    if (index === -1) return false;

    this.film.scenes.splice(index, 1);
    this.updateTotalDuration();
    return true;
  }

  /**
   * Reorder scenes
   */
  reorderScenes(sceneIds: string[]): boolean {
    const newScenes: FilmScene[] = [];

    for (const id of sceneIds) {
      const scene = this.film.scenes.find((s) => s.id === id);
      if (!scene) return false;
      newScenes.push(scene);
    }

    this.film.scenes = newScenes;
    return true;
  }

  /**
   * Update a scene
   */
  updateScene(sceneId: string, updates: Partial<FilmScene>): boolean {
    const scene = this.film.scenes.find((s) => s.id === sceneId);
    if (!scene) return false;

    Object.assign(scene, updates);
    this.updateTotalDuration();
    return true;
  }

  /**
   * Get film duration
   */
  getDuration(): number {
    return this.film.totalDuration;
  }

  /**
   * Get scene timeline
   */
  getTimeline(): Array<{
    sceneId: string;
    title: string;
    startTime: number;
    endTime: number;
    duration: number;
  }> {
    let currentTime = 0;
    return this.film.scenes.map((scene) => {
      const startTime = currentTime;
      const endTime = currentTime + scene.duration;
      currentTime = endTime;

      return {
        sceneId: scene.id,
        title: scene.title,
        startTime,
        endTime,
        duration: scene.duration,
      };
    });
  }

  /**
   * Export film as JSON
   */
  export(): string {
    return JSON.stringify(this.film, null, 2);
  }

  /**
   * Get film metadata
   */
  getMetadata() {
    return {
      title: this.film.title,
      description: this.film.description,
      director: this.film.director,
      genre: this.film.genre,
      sceneCount: this.film.scenes.length,
      totalDuration: this.film.totalDuration,
      status: this.film.status,
      createdAt: this.film.createdAt,
      updatedAt: this.film.updatedAt,
    };
  }

  /**
   * Update total duration
   */
  private updateTotalDuration(): void {
    this.film.totalDuration = this.film.scenes.reduce((sum, scene) => sum + scene.duration, 0);
    this.film.updatedAt = new Date();
  }
}

/**
 * Create a film producer instance
 */
export function createFilmProducer(film: FilmProduction): FilmProducer {
  return new FilmProducer(film);
}
