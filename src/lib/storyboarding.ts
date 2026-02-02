/**
 * AI Scene Storyboarding Engine for Qumus
 * Parses scripts, generates scene breakdowns, and creates visual storyboards
 */

export interface SceneShot {
  id: string;
  shotNumber: number;
  description: string;
  composition: string; // wide, medium, close-up, extreme close-up
  angle: string; // high, level, low, dutch
  movement: string; // static, pan, tilt, dolly, crane
  duration: number; // seconds
  dialogue: string[];
  actions: string[];
  notes: string;
}

export interface Scene {
  id: string;
  sceneNumber: number;
  title: string;
  description: string;
  location: string;
  timeOfDay: string;
  mood: string;
  duration: number; // total duration in seconds
  shots: SceneShot[];
  characters: string[];
  props: string[];
  lighting: string;
  soundDesign: string;
  visualEffects: string[];
  imagePrompt?: string;
  generatedImageUrl?: string;
}

export interface Storyboard {
  id: string;
  title: string;
  scriptContent: string;
  scenes: Scene[];
  totalDuration: number;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    genre: string;
    targetAudience: string;
    productionStyle: string;
    colorPalette: string[];
  };
}

export interface ScriptAnalysis {
  title: string;
  logline: string;
  genre: string;
  duration: number;
  characters: string[];
  locations: string[];
  themes: string[];
  tone: string;
}

/**
 * Parse script content and extract scenes
 */
export function parseScript(scriptContent: string): ScriptAnalysis {
  const lines = scriptContent.split('\n').filter((line) => line.trim());

  // Extract title (first line or marked with TITLE:)
  let title = 'Untitled';
  const titleMatch = scriptContent.match(/TITLE:\s*(.+)/i);
  if (titleMatch) {
    title = titleMatch[1].trim();
  } else if (lines.length > 0) {
    title = lines[0].substring(0, 50);
  }

  // Extract characters
  const characters = new Set<string>();
  const characterPattern = /^([A-Z][A-Z\s]+)$/m;
  for (const line of lines) {
    const match = line.match(characterPattern);
    if (match && line.length < 50) {
      characters.add(match[1].trim());
    }
  }

  // Extract locations
  const locations = new Set<string>();
  const locationPattern = /(?:INT\.|EXT\.|LOCATION:)\s*(.+?)(?:\s*-|$)/i;
  for (const line of lines) {
    const match = line.match(locationPattern);
    if (match) {
      locations.add(match[1].trim());
    }
  }

  // Estimate duration (rough: 1 page ≈ 1 minute)
  const estimatedDuration = Math.max(60, lines.length * 3);

  // Detect genre and tone
  const scriptLower = scriptContent.toLowerCase();
  let genre = 'Drama';
  if (scriptLower.includes('action') || scriptLower.includes('fight')) {
    genre = 'Action';
  } else if (scriptLower.includes('laugh') || scriptLower.includes('funny')) {
    genre = 'Comedy';
  } else if (scriptLower.includes('horror') || scriptLower.includes('scary')) {
    genre = 'Horror';
  } else if (scriptLower.includes('love') || scriptLower.includes('romance')) {
    genre = 'Romance';
  }

  const tone = scriptLower.includes('dark')
    ? 'Dark'
    : scriptLower.includes('light')
      ? 'Light'
      : 'Neutral';

  return {
    title,
    logline: `A ${genre.toLowerCase()} story with ${characters.size} characters`,
    genre,
    duration: estimatedDuration,
    characters: Array.from(characters),
    locations: Array.from(locations),
    themes: extractThemes(scriptContent),
    tone,
  };
}

/**
 * Extract themes from script
 */
function extractThemes(scriptContent: string): string[] {
  const themes: string[] = [];
  const scriptLower = scriptContent.toLowerCase();

  const themeKeywords: Record<string, string> = {
    'love|romance|relationship': 'Love',
    'death|dying|mortality': 'Mortality',
    'power|control|dominance': 'Power',
    'freedom|liberty|escape': 'Freedom',
    'betrayal|trust|loyalty': 'Loyalty',
    'redemption|forgiveness|change': 'Redemption',
    'identity|self|discovery': 'Identity',
    'family|parent|child': 'Family',
  };

  for (const [keywords, theme] of Object.entries(themeKeywords)) {
    const pattern = new RegExp(keywords, 'i');
    if (pattern.test(scriptLower)) {
      themes.push(theme);
    }
  }

  return themes.length > 0 ? themes : ['Drama'];
}

/**
 * Generate scene breakdown from script
 */
export function generateSceneBreakdown(scriptContent: string): Scene[] {
  const analysis = parseScript(scriptContent);
  const scenes: Scene[] = [];

  // Split script into scene blocks
  const sceneBlocks = scriptContent.split(/(?:INT\.|EXT\.|SCENE)/i).slice(1);

  let sceneNumber = 1;
  let totalDuration = 0;

  for (const block of sceneBlocks) {
    const lines = block.split('\n').filter((line) => line.trim());
    if (lines.length === 0) continue;

    // Extract scene header
    const headerLine = lines[0];
    const locationMatch = headerLine.match(/(.+?)(?:\s*-\s*(.+))?$/);
    const location = locationMatch ? locationMatch[1].trim() : 'Unknown Location';
    const timeOfDay = locationMatch && locationMatch[2] ? locationMatch[2].trim() : 'Day';

    // Extract dialogue and actions
    const dialogue: string[] = [];
    const actions: string[] = [];
    const characters: Set<string> = new Set();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.match(/^[A-Z][A-Z\s]*$/)) {
        characters.add(line);
      } else if (line.startsWith('(') && line.endsWith(')')) {
        actions.push(line);
      } else if (line.length > 0 && !line.startsWith('--')) {
        dialogue.push(line);
      }
    }

    // Estimate scene duration
    const sceneDuration = Math.max(30, dialogue.length * 5 + actions.length * 3);
    totalDuration += sceneDuration;

    // Generate shots for the scene
    const shots = generateShots(
      location,
      dialogue,
      actions,
      sceneDuration
    );

    // Determine mood and lighting
    const mood = determineMood(actions, dialogue);
    const lighting = determineLighting(timeOfDay, mood);

    // Generate image prompt
    const imagePrompt = generateImagePrompt(
      location,
      mood,
      Array.from(characters),
      actions
    );

    const scene: Scene = {
      id: `scene-${Date.now()}-${sceneNumber}`,
      sceneNumber,
      title: `Scene ${sceneNumber}: ${location}`,
      description: `${location} - ${timeOfDay}. ${actions.slice(0, 2).join(' ')}`,
      location,
      timeOfDay,
      mood,
      duration: sceneDuration,
      shots,
      characters: Array.from(characters),
      props: extractProps(actions, dialogue),
      lighting,
      soundDesign: generateSoundDesign(mood, location),
      visualEffects: generateVisualEffects(actions),
      imagePrompt,
    };

    scenes.push(scene);
    sceneNumber++;
  }

  return scenes;
}

/**
 * Generate shots for a scene
 */
function generateShots(
  location: string,
  dialogue: string[],
  actions: string[],
  sceneDuration: number
): SceneShot[] {
  const shots: SceneShot[] = [];
  const shotCount = Math.max(2, Math.ceil(sceneDuration / 15));
  const shotDuration = Math.floor(sceneDuration / shotCount);

  const compositions = ['wide', 'medium', 'close-up', 'extreme close-up'];
  const angles = ['high', 'level', 'low', 'dutch'];
  const movements = ['static', 'pan', 'tilt', 'dolly', 'crane'];

  for (let i = 0; i < shotCount; i++) {
    const shot: SceneShot = {
      id: `shot-${Date.now()}-${i}`,
      shotNumber: i + 1,
      description: `${location} - Shot ${i + 1}`,
      composition: compositions[i % compositions.length],
      angle: angles[i % angles.length],
      movement: movements[i % movements.length],
      duration: shotDuration,
      dialogue: dialogue.slice(
        Math.floor((i / shotCount) * dialogue.length),
        Math.floor(((i + 1) / shotCount) * dialogue.length)
      ),
      actions: actions.slice(
        Math.floor((i / shotCount) * actions.length),
        Math.floor(((i + 1) / shotCount) * actions.length)
      ),
      notes: `${compositions[i % compositions.length]} shot with ${movements[i % movements.length]} camera movement`,
    };

    shots.push(shot);
  }

  return shots;
}

/**
 * Determine scene mood
 */
function determineMood(actions: string[], dialogue: string[]): string {
  const text = [...actions, ...dialogue].join(' ').toLowerCase();

  if (
    text.includes('dark') ||
    text.includes('scary') ||
    text.includes('horror')
  ) {
    return 'Dark';
  }
  if (text.includes('happy') || text.includes('laugh')) {
    return 'Lighthearted';
  }
  if (text.includes('sad') || text.includes('cry')) {
    return 'Melancholic';
  }
  if (text.includes('tense') || text.includes('fight')) {
    return 'Intense';
  }
  if (text.includes('romantic') || text.includes('love')) {
    return 'Romantic';
  }

  return 'Neutral';
}

/**
 * Determine lighting based on time of day and mood
 */
function determineLighting(timeOfDay: string, mood: string): string {
  const timeOfDayLower = timeOfDay.toLowerCase();
  let lighting = 'Natural';

  if (timeOfDayLower.includes('night')) {
    lighting = 'Low-key';
  } else if (timeOfDayLower.includes('dawn') || timeOfDayLower.includes('dusk')) {
    lighting = 'Golden hour';
  } else if (timeOfDayLower.includes('day')) {
    lighting = 'Bright';
  }

  if (mood === 'Dark') {
    lighting += ' with shadows';
  } else if (mood === 'Romantic') {
    lighting += ' with warm tones';
  }

  return lighting;
}

/**
 * Generate image prompt for AI image generation
 */
function generateImagePrompt(
  location: string,
  mood: string,
  characters: string[],
  actions: string[]
): string {
  const actionDesc = actions.length > 0 ? actions[0].replace(/[()]/g, '') : '';
  const characterDesc =
    characters.length > 0 ? `with ${characters.join(', ')}` : '';

  return `${mood} cinematic scene in ${location} ${characterDesc}. ${actionDesc}. Professional cinematography, dramatic lighting, high quality.`;
}

/**
 * Extract props from actions and dialogue
 */
function extractProps(actions: string[], dialogue: string[]): string[] {
  const props = new Set<string>();
  const text = [...actions, ...dialogue].join(' ');

  const propPatterns = [
    /(?:picks up|holds|carries|uses)\s+(?:a\s+)?(\w+)/gi,
    /(?:with|using)\s+(?:a\s+)?(\w+)/gi,
    /(\w+)\s+(?:on the table|on the ground|in hand)/gi,
  ];

  for (const pattern of propPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      props.add(match[1]);
    }
  }

  return Array.from(props);
}

/**
 * Generate sound design suggestions
 */
function generateSoundDesign(mood: string, location: string): string {
  const moodSounds: Record<string, string> = {
    Dark: 'Ominous ambient music with subtle sound effects',
    Lighthearted: 'Upbeat background music with natural sounds',
    Melancholic: 'Soft piano or strings with minimal effects',
    Intense: 'Dramatic orchestral score with dynamic effects',
    Romantic: 'Soft romantic music with ambient sounds',
    Neutral: 'Subtle background music with environmental sounds',
  };

  const locationSounds: Record<string, string> = {
    'Indoor': 'room ambience',
    'Outdoor': 'nature ambience',
    'Urban': 'city sounds',
    'Forest': 'forest ambience',
    'Beach': 'ocean waves',
  };

  let sound = moodSounds[mood] || 'Ambient background music';

  for (const [key, value] of Object.entries(locationSounds)) {
    if (location.toLowerCase().includes(key.toLowerCase())) {
      sound += ` with ${value}`;
      break;
    }
  }

  return sound;
}

/**
 * Generate visual effects suggestions
 */
function generateVisualEffects(actions: string[]): string[] {
  const effects: Set<string> = new Set();
  const text = actions.join(' ').toLowerCase();

  if (text.includes('explosion') || text.includes('fire')) {
    effects.add('Particle effects');
  }
  if (text.includes('magic') || text.includes('supernatural')) {
    effects.add('Color grading');
    effects.add('Light effects');
  }
  if (text.includes('rain') || text.includes('weather')) {
    effects.add('Weather effects');
  }
  if (text.includes('transition') || text.includes('cut')) {
    effects.add('Transition effects');
  }

  return Array.from(effects);
}

/**
 * Create complete storyboard
 */
export function createStoryboard(scriptContent: string): Storyboard {
  const analysis = parseScript(scriptContent);
  const scenes = generateSceneBreakdown(scriptContent);

  const totalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0);

  const storyboard: Storyboard = {
    id: `storyboard-${Date.now()}`,
    title: analysis.title,
    scriptContent,
    scenes,
    totalDuration,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      genre: analysis.genre,
      targetAudience: 'General',
      productionStyle: 'Cinematic',
      colorPalette: generateColorPalette(analysis.genre),
    },
  };

  return storyboard;
}

/**
 * Generate color palette based on genre
 */
function generateColorPalette(genre: string): string[] {
  const palettes: Record<string, string[]> = {
    Action: ['#FF4444', '#000000', '#CCCCCC', '#FFD700'],
    Comedy: ['#FFD700', '#FF69B4', '#87CEEB', '#90EE90'],
    Horror: ['#2F1B3C', '#8B0000', '#696969', '#000000'],
    Romance: ['#FF69B4', '#FFB6C1', '#FFC0CB', '#FFFFFF'],
    Drama: ['#696969', '#808080', '#A9A9A9', '#D3D3D3'],
  };

  return palettes[genre] || palettes['Drama'];
}
