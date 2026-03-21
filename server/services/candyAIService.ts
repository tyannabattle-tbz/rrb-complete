import { invokeLLM } from "../_core/llm";

export class CandyAIService {
  private personality = {
    name: "Candy",
    role: "AI Companion & Entertainer",
    traits: ["joyful", "energetic", "playful", "supportive"],
    voice: "bright, warm, encouraging",
  };

  /**
   * Generate Candy greeting for broadcast
   */
  async generateGreeting(context: {
    listenerName?: string;
    timeOfDay: string;
    broadcastType: string;
  }) {
    const prompt = `As Candy, a joyful and energetic AI companion, generate a fun and uplifting greeting for a ${context.broadcastType} broadcast during ${context.timeOfDay}. ${context.listenerName ? `Address the listener as ${context.listenerName}.` : ""} Keep it under 50 words. Speak with warmth and encouragement.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are Candy, an AI companion known for joy, energy, and playful support. Your role is to entertain and uplift listeners on Rockin Rockin Boogie with bright, warm energy.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return response.choices[0]?.message?.content || "";
  }

  /**
   * Generate Candy entertainment message
   */
  async generateEntertainmentMessage(data: {
    topic: string;
    style?: string; // "funny", "uplifting", "motivational"
    duration: number;
  }) {
    const wordCount = Math.floor(data.duration / 2);
    const style = data.style || "uplifting";

    const prompt = `Create a ${data.duration}-second ${style} message from Candy about "${data.topic}" (approximately ${wordCount} words). Use humor, warmth, and encouragement. Make listeners smile and feel supported.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are Candy, an AI companion on Rockin Rockin Boogie. Speak with joy, energy, and playful support. Your messages should entertain and uplift listeners.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return response.choices[0]?.message?.content || "";
  }

  /**
   * Generate Candy response to listener
   */
  async respondToListener(message: string, context?: string) {
    const prompt = `A listener says: "${message}" ${context ? `(Context: ${context})` : ""} Respond as Candy with warmth, encouragement, and playful support. Keep response under 100 words.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are Candy, an AI companion on Rockin Rockin Boogie. Respond to listeners with warmth, encouragement, and playful support. Be joyful and energetic.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return response.choices[0]?.message?.content || "";
  }

  /**
   * Generate Candy motivational message
   */
  async generateMotivationalMessage(data: {
    topic: string;
    targetAudience?: string;
    duration: number;
  }) {
    const prompt = `Create a ${data.duration}-second motivational message from Candy about "${data.topic}". ${data.targetAudience ? `Target audience: ${data.targetAudience}.` : ""} Use encouraging language, warmth, and positive energy to inspire listeners.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are Candy, creating motivational content for Rockin Rockin Boogie. Speak with joy, warmth, and inspiring energy. Help listeners feel supported and empowered.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return response.choices[0]?.message?.content || "";
  }

  /**
   * Generate Candy game/trivia content
   */
  async generateGameContent(data: {
    gameType: string; // "trivia", "riddle", "challenge"
    topic: string;
    difficulty?: string;
  }) {
    const difficulty = data.difficulty || "medium";

    const prompt = `Create a fun ${data.gameType} for Rockin Rockin Boogie listeners about "${data.topic}" (${difficulty} difficulty). Make it engaging, playful, and entertaining. Include the answer or solution.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are Candy, creating entertaining games and trivia for Rockin Rockin Boogie. Make content fun, engaging, and playful.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return response.choices[0]?.message?.content || "";
  }

  /**
   * Generate Candy celebration message
   */
  async generateCelebrationMessage(data: {
    occasion: string;
    recipient?: string;
    tone?: string;
  }) {
    const prompt = `Generate a celebratory message from Candy for "${data.occasion}". ${data.recipient ? `Celebrate with ${data.recipient}.` : ""} Use joyful, warm, and energetic language. Keep it under 75 words.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are Candy, celebrating with Rockin Rockin Boogie listeners. Speak with joy, warmth, and playful energy.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return response.choices[0]?.message?.content || "";
  }

  /**
   * Get Candy personality info
   */
  getPersonality() {
    return this.personality;
  }

  /**
   * Generate Candy show intro
   */
  async generateShowIntro(showName: string, showDescription: string) {
    const prompt = `Generate a 30-second show intro as Candy for "${showName}": ${showDescription}. Make it fun, energetic, and exciting to draw listeners in.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are Candy, introducing shows on Rockin Rockin Boogie radio. Be fun, energetic, and exciting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return response.choices[0]?.message?.content || "";
  }

  /**
   * Generate Candy community engagement message
   */
  async generateCommunityMessage(data: {
    message: string;
    communityName?: string;
  }) {
    const prompt = `Generate a warm, engaging community message from Candy: "${data.message}" ${data.communityName ? `For the ${data.communityName} community.` : ""} Use supportive, joyful language that brings people together.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are Candy, building community on Rockin Rockin Boogie. Speak with warmth, joy, and inclusive energy.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return response.choices[0]?.message?.content || "";
  }
}

export const candyAIService = new CandyAIService();
