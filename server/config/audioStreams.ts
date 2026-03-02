/**
 * Audio Streaming Configuration
 * RRB Radio - 24/7 Broadcasting with Healing Frequencies
 * 
 * Canryn Production & Subsidiaries
 * Mission: "A Voice for the Voiceless"
 */

export interface AudioStream {
  id: string;
  name: string;
  description: string;
  url: string;
  format: 'mp3' | 'ogg' | 'aac' | 'flac';
  bitrate: number;
  frequency?: number; // Hz for healing frequencies
  category: 'radio' | 'healing' | 'meditation' | 'community';
  active: boolean;
  fallbackUrl?: string;
}

/**
 * Primary Radio Channels - SomaFM Integration
 * 24/7 continuous broadcasting
 */
export const radioChannels: AudioStream[] = [
  {
    id: 'somafm-drone-zone',
    name: 'Drone Zone',
    description: 'Ethereal ambient music for deep focus and meditation',
    url: 'https://ice1.somafm.com/dronezone-128-mp3',
    format: 'mp3',
    bitrate: 128,
    category: 'meditation',
    active: true,
  },
  {
    id: 'somafm-space-station',
    name: 'Space Station Soma',
    description: 'Ambient space music and cosmic soundscapes',
    url: 'https://ice1.somafm.com/spacestation-128-mp3',
    format: 'mp3',
    bitrate: 128,
    category: 'meditation',
    active: true,
  },
  {
    id: 'somafm-groove-salad',
    name: 'Groove Salad',
    description: 'Downtempo electronic beats and smooth grooves',
    url: 'https://ice1.somafm.com/groovesalad-128-mp3',
    format: 'mp3',
    bitrate: 128,
    category: 'radio',
    active: true,
  },
  {
    id: 'somafm-secret-agent',
    name: 'Secret Agent',
    description: 'Spy jazz, lounge, and exotica music',
    url: 'https://ice1.somafm.com/secretagent-128-mp3',
    format: 'mp3',
    bitrate: 128,
    category: 'radio',
    active: true,
  },
  {
    id: 'somafm-metal-detector',
    name: 'Metal Detector',
    description: 'Heavy metal and hard rock',
    url: 'https://ice1.somafm.com/metaldetector-128-mp3',
    format: 'mp3',
    bitrate: 128,
    category: 'radio',
    active: true,
  },
  {
    id: 'somafm-indie-pop-rocks',
    name: 'Indie Pop Rocks',
    description: 'Independent and alternative pop music',
    url: 'https://ice1.somafm.com/indiepop-128-mp3',
    format: 'mp3',
    bitrate: 128,
    category: 'radio',
    active: true,
  },
  {
    id: 'somafm-cliqhop-idm',
    name: 'Cliqhop IDM',
    description: 'Intelligent dance music and electronic beats',
    url: 'https://ice1.somafm.com/cliqhop-128-mp3',
    format: 'mp3',
    bitrate: 128,
    category: 'radio',
    active: true,
  },
  {
    id: 'somafm-fluid',
    name: 'Fluid',
    description: 'Smooth jazz and contemporary jazz',
    url: 'https://ice1.somafm.com/fluid-128-mp3',
    format: 'mp3',
    bitrate: 128,
    category: 'radio',
    active: true,
  },
];

/**
 * Healing Frequencies - Solfeggio & 432Hz
 * Scientifically tuned for wellness and meditation
 */
export const healingFrequencies: AudioStream[] = [
  {
    id: 'healing-432hz',
    name: '432Hz Healing Frequency',
    description: 'Universal healing frequency - promotes relaxation and balance',
    url: 'https://www.youtube.com/watch?v=432Hz', // Placeholder - use local generation
    format: 'mp3',
    bitrate: 192,
    frequency: 432,
    category: 'healing',
    active: true,
  },
  {
    id: 'solfeggio-174hz',
    name: 'Solfeggio 174Hz',
    description: 'Pain relief and cellular repair frequency',
    url: 'https://www.youtube.com/watch?v=174Hz', // Placeholder
    format: 'mp3',
    bitrate: 192,
    frequency: 174,
    category: 'healing',
    active: true,
  },
  {
    id: 'solfeggio-285hz',
    name: 'Solfeggio 285Hz',
    description: 'Tissue and organ repair frequency',
    url: 'https://www.youtube.com/watch?v=285Hz', // Placeholder
    format: 'mp3',
    bitrate: 192,
    frequency: 285,
    category: 'healing',
    active: true,
  },
  {
    id: 'solfeggio-396hz',
    name: 'Solfeggio 396Hz',
    description: 'Liberating guilt and fear frequency',
    url: 'https://www.youtube.com/watch?v=396Hz', // Placeholder
    format: 'mp3',
    bitrate: 192,
    frequency: 396,
    category: 'healing',
    active: true,
  },
  {
    id: 'solfeggio-417hz',
    name: 'Solfeggio 417Hz',
    description: 'Facilitating change and transformation frequency',
    url: 'https://www.youtube.com/watch?v=417Hz', // Placeholder
    format: 'mp3',
    bitrate: 192,
    frequency: 417,
    category: 'healing',
    active: true,
  },
  {
    id: 'solfeggio-528hz',
    name: 'Solfeggio 528Hz',
    description: 'Love and DNA repair frequency - "Miracle Tone"',
    url: 'https://www.youtube.com/watch?v=528Hz', // Placeholder
    format: 'mp3',
    bitrate: 192,
    frequency: 528,
    category: 'healing',
    active: true,
  },
  {
    id: 'solfeggio-639hz',
    name: 'Solfeggio 639Hz',
    description: 'Relationship and communication frequency',
    url: 'https://www.youtube.com/watch?v=639Hz', // Placeholder
    format: 'mp3',
    bitrate: 192,
    frequency: 639,
    category: 'healing',
    active: true,
  },
  {
    id: 'solfeggio-741hz',
    name: 'Solfeggio 741Hz',
    description: 'Intuition and spiritual awakening frequency',
    url: 'https://www.youtube.com/watch?v=741Hz', // Placeholder
    format: 'mp3',
    bitrate: 192,
    frequency: 741,
    category: 'healing',
    active: true,
  },
  {
    id: 'solfeggio-852hz',
    name: 'Solfeggio 852Hz',
    description: 'Third eye activation and spiritual awareness frequency',
    url: 'https://www.youtube.com/watch?v=852Hz', // Placeholder
    format: 'mp3',
    bitrate: 192,
    frequency: 852,
    category: 'healing',
    active: true,
  },
  {
    id: 'solfeggio-963hz',
    name: 'Solfeggio 963Hz',
    description: 'Crown chakra and divine connection frequency',
    url: 'https://www.youtube.com/watch?v=963Hz', // Placeholder
    format: 'mp3',
    bitrate: 192,
    frequency: 963,
    category: 'healing',
    active: true,
  },
];

/**
 * Community Programming Channels
 * User-generated and curated content
 */
export const communityChannels: AudioStream[] = [
  {
    id: 'community-news',
    name: 'Community News & Updates',
    description: 'Local news, announcements, and community spotlights',
    url: 'https://stream.example.com/community-news',
    format: 'mp3',
    bitrate: 128,
    category: 'community',
    active: true,
    fallbackUrl: 'https://stream.example.com/community-news-backup',
  },
  {
    id: 'community-voices',
    name: 'Community Voices',
    description: 'Stories, interviews, and community perspectives',
    url: 'https://stream.example.com/community-voices',
    format: 'mp3',
    bitrate: 128,
    category: 'community',
    active: true,
    fallbackUrl: 'https://stream.example.com/community-voices-backup',
  },
  {
    id: 'sweet-miracles-updates',
    name: 'Sweet Miracles Updates',
    description: 'Grant announcements and nonprofit news',
    url: 'https://stream.example.com/sweet-miracles',
    format: 'mp3',
    bitrate: 128,
    category: 'community',
    active: true,
  },
];

/**
 * Get all available streams
 */
export function getAllStreams(): AudioStream[] {
  return [...radioChannels, ...healingFrequencies, ...communityChannels];
}

/**
 * Get streams by category
 */
export function getStreamsByCategory(category: AudioStream['category']): AudioStream[] {
  return getAllStreams().filter(stream => stream.category === category && stream.active);
}

/**
 * Get active streams only
 */
export function getActiveStreams(): AudioStream[] {
  return getAllStreams().filter(stream => stream.active);
}

/**
 * Stream health check
 */
export async function checkStreamHealth(stream: AudioStream): Promise<boolean> {
  try {
    const response = await fetch(stream.url, { method: 'HEAD', timeout: 5000 });
    return response.ok;
  } catch (error) {
    console.error(`[Stream Health] ${stream.name} failed:`, error);
    return false;
  }
}

/**
 * Get fallback stream if primary fails
 */
export function getFallbackStream(stream: AudioStream): AudioStream | null {
  if (stream.fallbackUrl) {
    return { ...stream, url: stream.fallbackUrl };
  }
  return null;
}
