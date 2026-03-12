/**
 * COMMERCIAL AUDIO CDN URLs
 * Generated audio commercials for each family member / subsidiary.
 * These are hosted on the CDN and available for playback on each member's page.
 */

export const COMMERCIAL_AUDIO: Record<string, string> = {
  // Carlos Kembrel — Little C
  'comm_littlec_brand': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/carlos_littlec_brand_9846a1f3.wav',

  // Sean Hunter — Sean's Music
  'comm_seans_legacy': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/sean_legacy_continues_0434dada.wav',

  // Tyanna Battle — Anna's Promotions
  'comm_annas_vision': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/tyanna_annas_vision_4e2070be.wav',

  // Luv Russell — Sweet Miracles / Anna's Promotions
  'comm_voice_voiceless': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/lashanna_voice_voiceless_e662ca63.wav',

  // Jaelon Hunter — Jaelon Enterprises
  'comm_building_tomorrow': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/jaelon_building_tomorrow_22fd62c7.wav',
};

/**
 * Get the audio URL for a commercial by its ID.
 * Returns undefined if no audio has been generated for that commercial.
 */
export function getCommercialAudioUrl(commercialId: string): string | undefined {
  return COMMERCIAL_AUDIO[commercialId];
}

/**
 * Check if a commercial has an audio file available.
 */
export function hasCommercialAudio(commercialId: string): boolean {
  return commercialId in COMMERCIAL_AUDIO;
}
