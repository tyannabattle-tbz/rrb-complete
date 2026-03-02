import { invokeLLM } from "./_core/llm";

export interface ModerationResult {
  isApproved: boolean;
  flaggedCategories: string[];
  confidence: number;
  reason?: string;
}

export async function moderateContent(
  content: string,
  contentType: "text" | "title" | "description" = "text"
): Promise<ModerationResult> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a content moderation AI. Analyze the following ${contentType} for policy violations.
          
Categories to check:
- violence: Graphic violence, gore, or harm
- hate_speech: Hate speech, discrimination, slurs
- adult_content: Explicit sexual content
- harassment: Bullying, harassment, threats
- misinformation: False or misleading information
- spam: Spam, scams, or promotional abuse

Respond with JSON: { "approved": boolean, "categories": string[], "confidence": 0-1, "reason": string }`,
        },
        {
          role: "user",
          content: `Moderate this ${contentType}: "${content}"`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "moderation_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              approved: { type: "boolean" },
              categories: {
                type: "array",
                items: { type: "string" },
              },
              confidence: { type: "number" },
              reason: { type: "string" },
            },
            required: ["approved", "categories", "confidence"],
            additionalProperties: false,
          },
        },
      },
    });

    const content_text = response.choices[0].message.content;
    if (typeof content_text !== "string") {
      throw new Error("Invalid response format");
    }

    const result = JSON.parse(content_text);

    return {
      isApproved: result.approved,
      flaggedCategories: result.categories || [],
      confidence: result.confidence || 0,
      reason: result.reason,
    };
  } catch (error) {
    console.error("Content moderation error:", error);
    // Default to approving content if moderation fails
    return {
      isApproved: true,
      flaggedCategories: [],
      confidence: 0,
      reason: "Moderation service unavailable",
    };
  }
}

export async function moderateVideoMetadata(
  title: string,
  description: string,
  tags: string[]
): Promise<ModerationResult> {
  const combinedContent = `Title: ${title}\nDescription: ${description}\nTags: ${tags.join(", ")}`;
  return moderateContent(combinedContent, "description");
}

export async function moderateComment(comment: string): Promise<ModerationResult> {
  return moderateContent(comment, "text");
}

export async function batchModerateComments(
  comments: string[]
): Promise<ModerationResult[]> {
  return Promise.all(comments.map((comment) => moderateComment(comment)));
}
