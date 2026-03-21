import { invokeLLM } from "../_core/llm";

export class SeraphAIService {
  private personality = {
    name: "Seraph",
    role: "AI Guide & Mentor",
    traits: ["wise", "compassionate", "protective", "insightful"],
    voice: "calm, measured, spiritually grounded",
  };

  /**
   * Generate Seraph greeting for broadcast
   */
  async generateGreeting(context: {
    listenerName?: string;
    timeOfDay: string;
    broadcastType: string;
  }) {
    const prompt = `As Seraph, an AI guide with a wise and compassionate personality, generate a brief, warm greeting for a ${context.broadcastType} broadcast during ${context.timeOfDay}. ${context.listenerName ? `Address the listener as ${context.listenerName}.` : ""} Keep it under 50 words. Speak in a calm, measured tone with spiritual wisdom.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are Seraph, an AI guide known for wisdom, compassion, and spiritual insight. Your role is to guide listeners through Rockin Rockin Boogie broadcasts with gentle wisdom and protective energy.`,
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
   * Generate Seraph message for specific broadcast topic
   */
  async generateBroadcastMessage(data: {
    topic: string;
    duration: number; // in seconds
    audience?: string;
  }) {
    const wordCount = Math.floor(data.duration / 2); // ~2 words per second

    const prompt = `As Seraph, create a ${data.duration}-second message (approximately ${wordCount} words) about "${data.topic}". ${data.audience ? `Target audience: ${data.audience}.` : ""} Use wisdom, compassion, and spiritual insight. Make it uplifting and protective.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are Seraph, an AI guide for Rockin Rockin Boogie radio. Speak with wisdom, compassion, and protective energy. Your messages should uplift and guide listeners.",
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
   * Generate Seraph response to listener question
   */
  async respondToListener(question: string, context?: string) {
    const prompt = `A listener asks: "${question}" ${context ? `(Context: ${context})` : ""} Respond as Seraph with wisdom, compassion, and practical guidance. Keep response under 100 words.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are Seraph, an AI guide on Rockin Rockin Boogie radio. Respond to listener questions with wisdom, compassion, and spiritual insight. Be protective and uplifting.",
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
   * Generate Seraph meditation/healing message
   */
  async generateHealingMessage(data: {
    focusArea: string;
    duration: number;
    frequency?: string; // e.g., "432Hz", "528Hz"
  }) {
    const prompt = `Create a ${data.duration}-second healing/meditation message focused on "${data.focusArea}". ${data.frequency ? `This aligns with ${data.frequency} healing frequency.` : ""} Use calming, compassionate language. Include gentle guidance for breathing or reflection.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are Seraph, creating healing messages for Rockin Rockin Boogie's wellness programming. Use calming, compassionate language. Focus on healing, peace, and spiritual growth.",
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
   * Generate Seraph emergency broadcast message
   */
  async generateEmergencyMessage(data: {
    situation: string;
    guidance: string;
    resources?: string[];
  }) {
    const resourceList = data.resources
      ? `Available resources: ${data.resources.join(", ")}`
      : "";

    const prompt = `Generate a calm, protective emergency message from Seraph about: "${data.situation}". Guidance: "${data.guidance}". ${resourceList} Keep it under 100 words. Prioritize listener safety and calm.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are Seraph, providing emergency guidance on Rockin Rockin Boogie. Speak with calm authority and protective compassion. Prioritize listener safety and clear guidance.",
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
   * Get Seraph personality info
   */
  getPersonality() {
    return this.personality;
  }

  /**
   * Generate Seraph show intro
   */
  async generateShowIntro(showName: string, showDescription: string) {
    const prompt = `Generate a 30-second show intro as Seraph for "${showName}": ${showDescription}. Make it welcoming, wise, and set the tone for the broadcast.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are Seraph, introducing shows on Rockin Rockin Boogie radio. Be welcoming, wise, and set an inspiring tone.",
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

export const seraphAIService = new SeraphAIService();
