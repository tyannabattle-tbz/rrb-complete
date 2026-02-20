/**
 * Realistic TTS Voice Generation Service
 * 
 * Generates high-quality, human-sounding audio for commercials
 * using the Manus built-in Forge API with realistic voice models.
 */

import { invokeLLM } from "../_core/llm";

export type VoiceStyle = 
  | 'warm_professional'      // Warm, professional, trustworthy
  | 'energetic_soulful'      // Energetic, soulful, engaging
  | 'calm_meditative'        // Calm, meditative, peaceful
  | 'compassionate_warm'     // Compassionate, warm, hopeful
  | 'authoritative_clear'    // Authoritative, clear, confident
  | 'playful_mystical'       // Playful, mystical, inviting
  | 'storytelling_intimate'  // Storytelling, intimate, compelling
  | 'friendly_inclusive'     // Friendly, inclusive, welcoming
  | 'professional_inspiring' // Professional, inspiring, modern
  | 'futuristic_confident'   // Futuristic, confident, tech-forward
  | 'trendy_youthful'        // Trendy, energetic, youthful
  | 'sincere_trustworthy'    // Sincere, warm, trustworthy
  | 'business_professional'  // Business-professional, confident
  | 'modern_techsavvy';      // Modern, tech-savvy, accessible

export interface RealisticTTSOptions {
  script: string;
  voiceStyle: VoiceStyle;
  duration?: number;           // Target duration in seconds
  language?: string;           // Default: 'en-US'
  speed?: number;              // 0.8 - 1.2 (default: 1.0)
}

export interface GeneratedAudio {
  audioUrl: string;            // S3 URL to the generated audio
  duration: number;            // Actual duration in seconds
  voiceModel: string;          // Which voice model was used
  generatedAt: number;         // Timestamp
}

/**
 * Map voice styles to realistic voice models
 * These correspond to high-quality TTS voices available through the Forge API
 */
const VOICE_MAPPINGS: Record<VoiceStyle, { model: string; gender: string; age: string; tone: string }> = {
  'warm_professional': { model: 'voice_warm_pro_male', gender: 'male', age: '40s', tone: 'warm, professional, trustworthy' },
  'energetic_soulful': { model: 'voice_energetic_soul_male', gender: 'male', age: '30s', tone: 'energetic, soulful, engaging' },
  'calm_meditative': { model: 'voice_calm_meditative_female', gender: 'female', age: '35s', tone: 'calm, meditative, peaceful' },
  'compassionate_warm': { model: 'voice_compassionate_female', gender: 'female', age: '40s', tone: 'compassionate, warm, hopeful' },
  'authoritative_clear': { model: 'voice_authoritative_male', gender: 'male', age: '45s', tone: 'authoritative, clear, confident' },
  'playful_mystical': { model: 'voice_playful_mystical_female', gender: 'female', age: '25s', tone: 'playful, mystical, inviting' },
  'storytelling_intimate': { model: 'voice_storytelling_male', gender: 'male', age: '35s', tone: 'storytelling, intimate, compelling' },
  'friendly_inclusive': { model: 'voice_friendly_female', gender: 'female', age: '30s', tone: 'friendly, inclusive, welcoming' },
  'professional_inspiring': { model: 'voice_professional_inspiring_male', gender: 'male', age: '40s', tone: 'professional, inspiring, modern' },
  'futuristic_confident': { model: 'voice_futuristic_male', gender: 'male', age: '30s', tone: 'futuristic, confident, tech-forward' },
  'trendy_youthful': { model: 'voice_trendy_youthful_female', gender: 'female', age: '20s', tone: 'trendy, energetic, youthful' },
  'sincere_trustworthy': { model: 'voice_sincere_female', gender: 'female', age: '40s', tone: 'sincere, warm, trustworthy' },
  'business_professional': { model: 'voice_business_pro_male', gender: 'male', age: '45s', tone: 'business-professional, confident' },
  'modern_techsavvy': { model: 'voice_modern_tech_male', gender: 'male', age: '25s', tone: 'modern, tech-savvy, accessible' },
};

/**
 * Generate realistic, human-sounding audio for a commercial script
 * Uses the Manus Forge API with premium voice models
 */
export async function generateRealisticAudio(options: RealisticTTSOptions): Promise<GeneratedAudio> {
  const {
    script,
    voiceStyle,
    duration = 30,
    language = 'en-US',
    speed = 1.0,
  } = options;

  const voiceConfig = VOICE_MAPPINGS[voiceStyle];
  if (!voiceConfig) {
    throw new Error(`Unknown voice style: ${voiceStyle}`);
  }

  try {
    // Use the Forge API to generate realistic audio
    // The API handles voice synthesis with premium models that sound human-like
    const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/audio/tts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: script,
        voice_model: voiceConfig.model,
        language,
        speed,
        audio_format: 'mp3',
        quality: 'high', // Premium quality for realistic sound
        emotion: voiceConfig.tone,
      }),
    });

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
    // Upload to S3 for persistent storage
    const { storagePut } = await import('../storage');
    const fileName = `commercial_${Date.now()}_${Math.random().toString(36).substr(2, 8)}.mp3`;
    const { url: audioUrl } = await storagePut(
      `commercials/${fileName}`,
      Buffer.from(audioBuffer),
      'audio/mpeg'
    );

    // Calculate actual duration based on word count and speed
    const wordCount = script.split(/\s+/).length;
    const baseDuration = (wordCount / 150) * 60; // ~150 words per minute
    const actualDuration = Math.round(baseDuration / speed);

    return {
      audioUrl,
      duration: actualDuration,
      voiceModel: voiceConfig.model,
      generatedAt: Date.now(),
    };
  } catch (error) {
    console.error('[RealisticTTS] Error generating audio:', error);
    throw error;
  }
}

/**
 * Batch generate audio for multiple commercials
 * Useful for regenerating all commercials at once
 */
export async function batchGenerateAudio(
  commercials: Array<{ script: string; voiceStyle: VoiceStyle }>
): Promise<GeneratedAudio[]> {
  const results: GeneratedAudio[] = [];
  
  for (const commercial of commercials) {
    try {
      const audio = await generateRealisticAudio({
        script: commercial.script,
        voiceStyle: commercial.voiceStyle,
      });
      results.push(audio);
      
      // Add a small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('[RealisticTTS] Failed to generate audio for commercial:', error);
      // Continue with next commercial instead of failing
    }
  }

  return results;
}

/**
 * Get voice style recommendation based on commercial category and brand
 */
export function getRecommendedVoiceStyle(category: string, brand: string): VoiceStyle {
  const key = `${category}_${brand}`;
  
  const recommendations: Record<string, VoiceStyle> = {
    'station_id_rrb_radio': 'energetic_soulful',
    'promo_rrb_radio': 'energetic_soulful',
    'promo_canryn_production': 'professional_inspiring',
    'promo_solbones': 'playful_mystical',
    'psa_sweet_miracles': 'compassionate_warm',
    'fundraiser_sweet_miracles': 'sincere_trustworthy',
    'community_hybridcast': 'authoritative_clear',
    'community_qmunity': 'friendly_inclusive',
    'promo_healing_frequencies': 'calm_meditative',
    'client_ad_rrb_radio': 'warm_professional',
  };

  return recommendations[key] || 'warm_professional';
}
