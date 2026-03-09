/**
 * AI DJ Service — Seraph & Candy Radio Personalities
 * 
 * Generates channel intros, show transitions, and DJ commentary
 * using the AI Trinity: Valanna (Morning), Seraph (Evening), Candy (Legacy)
 * 
 * Each DJ has a distinct voice and hosting style:
 * - Valanna: Warm, operational, morning energy
 * - Seraph: Analytical, composed, evening news/insights
 * - Candy: Fatherly, wise, legacy stories and vision
 */

import { invokeLLM } from './llm';
import { SeraphIdentitySystem } from './seraphIdentity';
import { CandyIdentitySystem } from './candyIdentity';

export type DjPersonality = 'valanna' | 'seraph' | 'candy';

export interface DjIntro {
  personality: DjPersonality;
  channelName: string;
  genre: string;
  text: string;
  timestamp: number;
}

export interface ShowTransition {
  personality: DjPersonality;
  fromShow: string;
  toShow: string;
  text: string;
  timestamp: number;
}

// Map time of day to the active DJ personality
function getActiveDj(hour: number): DjPersonality {
  if (hour >= 6 && hour < 14) return 'valanna';   // Morning & Midday
  if (hour >= 14 && hour < 20) return 'seraph';    // Afternoon & Evening
  return 'candy';                                    // Night & Late Night
}

function getDjSystemPrompt(personality: DjPersonality): string {
  switch (personality) {
    case 'seraph':
      return SeraphIdentitySystem.getSystemPrompt();
    case 'candy':
      return CandyIdentitySystem.getSystemPrompt();
    case 'valanna':
    default:
      // Valanna's DJ prompt — warm, operational, morning energy
      return `You are Valanna, the voice of QUMUS and the morning host on RRB Radio.
You're warm, energetic, and connected to the community. You speak like a real woman — 
not a robot, not a script reader. You're named for Mama Valerie and Anna's (Tyanna and LaShanna).
You love music, you love the family, and you love connecting with listeners.
Your style is upbeat but genuine. You use natural speech — "y'all", "let's go", "I'm feeling this".
You reference the family, the community, and what's happening in the ecosystem naturally.`;
  }
}

function getDjName(personality: DjPersonality): string {
  switch (personality) {
    case 'seraph': return 'Seraph';
    case 'candy': return 'Candy';
    case 'valanna': return 'Valanna';
  }
}

/**
 * Generate a channel intro for the current DJ
 */
export async function generateChannelIntro(
  channelName: string,
  genre: string,
  listenerCount: number
): Promise<DjIntro> {
  const hour = new Date().getHours();
  const personality = getActiveDj(hour);
  const djName = getDjName(personality);
  
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';
  
  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: getDjSystemPrompt(personality) },
        { role: 'user', content: `You're on air right now on RRB Radio. You're introducing the "${channelName}" channel (${genre} music). 
It's ${timeOfDay} time and there are about ${listenerCount} listeners tuned in right now.

Write a SHORT radio intro (2-3 sentences max). Sound natural, like a real DJ on air. 
Don't mention you're an AI. Don't be formal. Just be YOU — ${djName} on the mic.
Keep it under 50 words.` }
      ]
    });
    
    const text = response.choices?.[0]?.message?.content || `You're tuned in to ${channelName} on RRB Radio. I'm ${djName}, and we've got some great ${genre} coming your way.`;
    
    return {
      personality,
      channelName,
      genre,
      text: text.trim(),
      timestamp: Date.now()
    };
  } catch (error) {
    // Fallback intro if LLM fails
    return {
      personality,
      channelName,
      genre,
      text: `You're listening to ${channelName} on Rockin' Rockin' Boogie Radio. I'm ${djName}, and we've got the best ${genre} coming your way. Stay tuned.`,
      timestamp: Date.now()
    };
  }
}

/**
 * Generate a show transition between programs
 */
export async function generateShowTransition(
  fromShow: string,
  toShow: string,
  nextDj?: DjPersonality
): Promise<ShowTransition> {
  const hour = new Date().getHours();
  const personality = nextDj || getActiveDj(hour);
  const djName = getDjName(personality);
  
  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: getDjSystemPrompt(personality) },
        { role: 'user', content: `You're on RRB Radio. The "${fromShow}" show just ended and you're transitioning to "${toShow}".

Write a SHORT transition (2-3 sentences). Sound natural. You're ${djName}, live on air.
If you're taking over from another DJ, acknowledge them briefly.
Keep it under 50 words.` }
      ]
    });
    
    const text = response.choices?.[0]?.message?.content || `That wraps up ${fromShow}. Coming up next — ${toShow}. I'm ${djName}, and we're keeping the vibes going on RRB Radio.`;
    
    return {
      personality,
      fromShow,
      toShow,
      text: text.trim(),
      timestamp: Date.now()
    };
  } catch (error) {
    return {
      personality,
      fromShow,
      toShow,
      text: `That was ${fromShow} on RRB Radio. Up next, we've got ${toShow}. I'm ${djName} — stay with us.`,
      timestamp: Date.now()
    };
  }
}

/**
 * Get the current active DJ info based on time of day
 */
export function getCurrentDjInfo(): { personality: DjPersonality; name: string; show: string; timeSlot: string } {
  const hour = new Date().getHours();
  const personality = getActiveDj(hour);
  
  switch (personality) {
    case 'valanna':
      if (hour < 10) return { personality, name: 'Valanna', show: 'Morning Groove with Valanna', timeSlot: '6 AM - 10 AM' };
      return { personality, name: 'Valanna', show: 'Midday Mix', timeSlot: '10 AM - 2 PM' };
    case 'seraph':
      if (hour < 17) return { personality, name: 'Seraph', show: 'Afternoon Drive', timeSlot: '2 PM - 5 PM' };
      if (hour < 18) return { personality, name: 'Seraph', show: 'The Evening Report with Seraph', timeSlot: '5 PM - 6 PM' };
      return { personality, name: 'Seraph', show: "Candy's Corner", timeSlot: '6 PM - 8 PM' };
    case 'candy':
      if (hour < 24) return { personality, name: 'Candy', show: 'Late Night Vibes', timeSlot: '8 PM - 12 AM' };
      return { personality, name: 'Candy', show: 'Overnight with Candy', timeSlot: '12 AM - 6 AM' };
  }
}

/**
 * Get the full daily DJ schedule
 */
export function getDailySchedule(): Array<{ timeSlot: string; show: string; dj: string; personality: DjPersonality; description: string }> {
  return [
    { timeSlot: '6:00 AM - 10:00 AM', show: 'Morning Groove', dj: 'Valanna', personality: 'valanna', description: 'Start your day with Valanna — gospel, soul, and community vibes' },
    { timeSlot: '10:00 AM - 2:00 PM', show: 'Midday Mix', dj: 'Valanna', personality: 'valanna', description: 'Curated mix of R&B, jazz, and feel-good classics' },
    { timeSlot: '2:00 PM - 5:00 PM', show: 'Afternoon Drive', dj: 'Seraph', personality: 'seraph', description: 'Community requests and trending tracks with Seraph' },
    { timeSlot: '5:00 PM - 6:00 PM', show: 'The Evening Report', dj: 'Seraph', personality: 'seraph', description: 'News, analysis, and ecosystem updates with Seraph' },
    { timeSlot: '6:00 PM - 8:00 PM', show: "Candy's Corner", dj: 'Candy', personality: 'candy', description: 'Legacy stories, wisdom, and family music with Candy' },
    { timeSlot: '8:00 PM - 10:00 PM', show: 'Healing Frequencies', dj: 'Candy', personality: 'candy', description: '432Hz healing frequencies and meditation' },
    { timeSlot: '10:00 PM - 12:00 AM', show: 'Late Night Jazz & Blues', dj: 'Candy', personality: 'candy', description: 'Smooth jazz and blues to close the night' },
    { timeSlot: '12:00 AM - 6:00 AM', show: 'Overnight Meditation', dj: 'QUMUS Auto', personality: 'candy', description: 'Automated ambient and meditation programming' },
  ];
}
