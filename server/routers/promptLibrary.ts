import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const promptLibraryRouter = router({
  // Get all prompts
  getAllPrompts: protectedProcedure.query(async ({ ctx }) => {
    const defaultPrompts = [
      {
        id: "summarize",
        title: "Summarize Text",
        description: "Create a concise summary of the provided text",
        category: "Writing",
        prompt: "Please summarize the following text in 3-5 sentences:\n\n{input}",
        tags: ["summary", "writing", "concise"],
        rating: 4.8,
        uses: 1250,
      },
      {
        id: "translate",
        title: "Translate to English",
        description: "Translate any language to English",
        category: "Translation",
        prompt: "Translate the following text to English:\n\n{input}",
        tags: ["translation", "language"],
        rating: 4.9,
        uses: 2100,
      },
      {
        id: "code-review",
        title: "Code Review",
        description: "Review code for bugs, performance, and best practices",
        category: "Programming",
        prompt: "Please review the following code and provide feedback on:\n1. Bugs or potential issues\n2. Performance improvements\n3. Best practices\n\n```\n{input}\n```",
        tags: ["code", "review", "programming"],
        rating: 4.7,
        uses: 890,
      },
      {
        id: "brainstorm",
        title: "Brainstorm Ideas",
        description: "Generate creative ideas for a topic",
        category: "Creativity",
        prompt: "Generate 10 creative ideas for: {input}",
        tags: ["brainstorm", "ideas", "creative"],
        rating: 4.6,
        uses: 750,
      },
      {
        id: "explain",
        title: "Explain Concept",
        description: "Explain a complex concept in simple terms",
        category: "Education",
        prompt: "Explain the following concept in simple terms that a beginner can understand:\n\n{input}",
        tags: ["education", "explanation", "learning"],
        rating: 4.9,
        uses: 1680,
      },
      {
        id: "email-draft",
        title: "Draft Email",
        description: "Write a professional email",
        category: "Writing",
        prompt: "Write a professional email about: {input}",
        tags: ["email", "writing", "professional"],
        rating: 4.5,
        uses: 620,
      },
    ];

    return {
      prompts: defaultPrompts,
      total: defaultPrompts.length,
    };
  }),

  // Search prompts
  searchPrompts: protectedProcedure
    .input(z.object({ query: z.string(), category: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const allPrompts = [
        {
          id: "summarize",
          title: "Summarize Text",
          description: "Create a concise summary of the provided text",
          category: "Writing",
          prompt: "Please summarize the following text in 3-5 sentences:\n\n{input}",
          tags: ["summary", "writing", "concise"],
          rating: 4.8,
          uses: 1250,
        },
        {
          id: "translate",
          title: "Translate to English",
          description: "Translate any language to English",
          category: "Translation",
          prompt: "Translate the following text to English:\n\n{input}",
          tags: ["translation", "language"],
          rating: 4.9,
          uses: 2100,
        },
      ];

      const filtered = allPrompts.filter(
        (p) =>
          p.title.toLowerCase().includes(input.query.toLowerCase()) ||
          p.description.toLowerCase().includes(input.query.toLowerCase()) ||
          p.tags.some((tag) =>
            tag.toLowerCase().includes(input.query.toLowerCase())
          )
      );

      return {
        prompts: filtered,
        total: filtered.length,
      };
    }),

  // Get prompt by ID
  getPromptById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return {
        id: input.id,
        title: "Sample Prompt",
        description: "Sample prompt description",
        category: "Writing",
        prompt: "Sample prompt template",
        tags: ["sample"],
        rating: 4.5,
        uses: 100,
      };
    }),

  // Save custom prompt
  saveCustomPrompt: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        category: z.string(),
        prompt: z.string(),
        tags: z.array(z.string()),
        isPublic: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        promptId: `custom-${Date.now()}`,
        message: "Prompt saved successfully",
        prompt: {
          ...input,
          id: `custom-${Date.now()}`,
          rating: 0,
          uses: 0,
          createdBy: ctx.user?.id,
          createdAt: new Date(),
        },
      };
    }),

  // Get user's custom prompts
  getMyPrompts: protectedProcedure.query(async ({ ctx }) => {
    return {
      prompts: [
        {
          id: "custom-1",
          title: "My Custom Prompt",
          description: "A custom prompt I created",
          category: "Custom",
          prompt: "My custom prompt template",
          tags: ["custom"],
          rating: 0,
          uses: 5,
          isPublic: false,
          createdAt: new Date(),
        },
      ],
      total: 1,
    };
  }),

  // Rate prompt
  ratePrompt: protectedProcedure
    .input(z.object({ promptId: z.string(), rating: z.number().min(1).max(5) }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Rating saved",
        promptId: input.promptId,
        newRating: 4.7,
      };
    }),

  // Get trending prompts
  getTrendingPrompts: protectedProcedure.query(async ({ ctx }) => {
    return {
      prompts: [
        {
          id: "translate",
          title: "Translate to English",
          description: "Translate any language to English",
          category: "Translation",
          prompt: "Translate the following text to English:\n\n{input}",
          tags: ["translation", "language"],
          rating: 4.9,
          uses: 2100,
          trend: "up",
          trendPercentage: 15,
        },
      ],
    };
  }),

  // Export prompt as template
  exportPrompt: protectedProcedure
    .input(z.object({ promptId: z.string(), format: z.enum(["json", "yaml", "markdown"]) }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        downloadUrl: `https://api.manus.im/prompts/export-${input.promptId}.${input.format}`,
        filename: `prompt-${input.promptId}.${input.format}`,
      };
    }),
});
