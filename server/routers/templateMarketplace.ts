import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

// In-memory template marketplace
const marketplaceTemplates: any[] = [
  {
    id: "market-1",
    name: "Code Reviewer",
    description: "Expert code review and optimization suggestions",
    author: "System",
    rating: 4.8,
    downloads: 1250,
    tags: ["code", "review", "programming"],
    systemPrompt: "You are an expert code reviewer. Provide detailed feedback on code quality, performance, and best practices.",
    temperature: 65,
    model: "gpt-4-turbo",
    maxSteps: 50,
    createdAt: new Date("2026-01-15"),
  },
  {
    id: "market-2",
    name: "SEO Optimizer",
    description: "Optimize content for search engines",
    author: "System",
    rating: 4.6,
    downloads: 890,
    tags: ["seo", "marketing", "content"],
    systemPrompt: "You are an SEO expert. Help optimize content for search engines while maintaining readability.",
    temperature: 70,
    model: "gpt-4-turbo",
    maxSteps: 40,
    createdAt: new Date("2026-01-10"),
  },
  {
    id: "market-3",
    name: "Data Scientist",
    description: "Analyze data and generate insights",
    author: "System",
    rating: 4.7,
    downloads: 1100,
    tags: ["data", "analysis", "statistics"],
    systemPrompt: "You are a data scientist. Analyze datasets and provide actionable insights.",
    temperature: 55,
    model: "gpt-4-turbo",
    maxSteps: 60,
    createdAt: new Date("2026-01-12"),
  },
  {
    id: "market-4",
    name: "UX Designer",
    description: "Design feedback and UX improvements",
    author: "System",
    rating: 4.5,
    downloads: 750,
    tags: ["design", "ux", "ui"],
    systemPrompt: "You are a UX designer. Provide feedback on user experience and design improvements.",
    temperature: 75,
    model: "gpt-4-turbo",
    maxSteps: 45,
    createdAt: new Date("2026-01-08"),
  },
  {
    id: "market-5",
    name: "Legal Assistant",
    description: "Legal document review and analysis",
    author: "System",
    rating: 4.9,
    downloads: 1500,
    tags: ["legal", "documents", "compliance"],
    systemPrompt: "You are a legal assistant. Review documents and provide legal insights.",
    temperature: 50,
    model: "gpt-4-turbo",
    maxSteps: 55,
    createdAt: new Date("2026-01-20"),
  },
];

export const templateMarketplaceRouter = router({
  // Browse marketplace templates
  browseTemplates: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(12),
        sortBy: z.enum(["rating", "downloads", "recent"]).default("rating"),
        tag: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      let filtered = marketplaceTemplates;

      if (input.tag) {
        filtered = filtered.filter((t) => t.tags.includes(input.tag));
      }

      // Sort
      if (input.sortBy === "rating") {
        filtered.sort((a, b) => b.rating - a.rating);
      } else if (input.sortBy === "downloads") {
        filtered.sort((a, b) => b.downloads - a.downloads);
      } else if (input.sortBy === "recent") {
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      const start = (input.page - 1) * input.limit;
      const end = start + input.limit;
      const templates = filtered.slice(start, end);

      return {
        templates,
        total: filtered.length,
        page: input.page,
        limit: input.limit,
        hasMore: end < filtered.length,
      };
    }),

  // Get template details
  getTemplateDetails: protectedProcedure
    .input(z.object({ templateId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const template = marketplaceTemplates.find((t) => t.id === input.templateId);
      if (!template) {
        throw new Error("Template not found");
      }

      return {
        ...template,
        reviews: [
          {
            id: "review-1",
            author: "User123",
            rating: 5,
            comment: "Excellent template! Very helpful.",
            createdAt: new Date(),
          },
          {
            id: "review-2",
            author: "Developer456",
            rating: 4,
            comment: "Good, but could use more customization.",
            createdAt: new Date(),
          },
        ],
      };
    }),

  // Search marketplace
  searchTemplates: protectedProcedure
    .input(z.object({ query: z.string(), limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const query = input.query.toLowerCase();
      const results = marketplaceTemplates
        .filter(
          (t) =>
            t.name.toLowerCase().includes(query) ||
            t.description.toLowerCase().includes(query) ||
            t.tags.some((tag: string) => tag.toLowerCase().includes(query))
        )
        .slice(0, input.limit);

      return results;
    }),

  // Get trending templates
  getTrendingTemplates: protectedProcedure
    .input(z.object({ limit: z.number().default(5) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      return marketplaceTemplates
        .sort((a, b) => b.downloads - a.downloads)
        .slice(0, input.limit);
    }),

  // Get popular tags
  getPopularTags: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const tagMap = new Map<string, number>();
      marketplaceTemplates.forEach((t) => {
        t.tags.forEach((tag: string) => {
          tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
        });
      });

      return Array.from(tagMap.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);
    }),

  // Rate template
  rateTemplate: protectedProcedure
    .input(z.object({ templateId: z.string(), rating: z.number().min(1).max(5) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const template = marketplaceTemplates.find((t) => t.id === input.templateId);
      if (!template) {
        throw new Error("Template not found");
      }

      return {
        success: true,
        message: `Template rated ${input.rating} stars`,
        newRating: template.rating,
      };
    }),

  // Submit template to marketplace
  submitTemplate: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().min(10),
        systemPrompt: z.string(),
        tags: z.array(z.string()).min(1),
        temperature: z.number().min(0).max(100),
        model: z.string(),
        maxSteps: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const newTemplate = {
        id: `market-${Math.random().toString(36).substr(2, 9)}`,
        ...input,
        author: `User${ctx.user.id}`,
        rating: 0,
        downloads: 0,
        createdAt: new Date(),
      };

      marketplaceTemplates.push(newTemplate);

      return {
        success: true,
        templateId: newTemplate.id,
        message: "Template submitted to marketplace for review",
      };
    }),
});
