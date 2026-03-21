import { invokeLLM } from "../_core/llm";

export interface PodcastSEOMetadata {
  episodeId: string;
  episodeTitle: string;
  description: string;
  keywords: string[];
  showNotes: string;
  transcript: string;
  schemaMarkup: Record<string, unknown>;
  sitemapEntry: {
    url: string;
    lastmod: string;
    priority: number;
    changefreq: string;
  };
}

export class PodcastSEOService {
  async generateShowNotes(
    episodeTitle: string,
    transcript: string,
    duration: number
  ): Promise<string> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are a podcast show notes generator. Create detailed, SEO-optimized show notes from the episode transcript. Include timestamps, key topics, guest information, and relevant links.",
          },
          {
            role: "user",
            content: `Episode: ${episodeTitle}\nDuration: ${duration} minutes\n\nTranscript:\n${transcript}`,
          },
        ],
      });

      const showNotes =
        typeof response.choices[0].message.content === "string"
          ? response.choices[0].message.content
          : "";

      console.log(`[SEO] Generated show notes for episode: ${episodeTitle}`);

      return showNotes;
    } catch (error) {
      console.error(`[SEO] Failed to generate show notes:`, error);
      throw error;
    }
  }

  async extractKeywords(transcript: string, title: string): Promise<string[]> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "Extract 10-15 relevant SEO keywords from the podcast episode. Return as a JSON array of strings.",
          },
          {
            role: "user",
            content: `Title: ${title}\n\nTranscript:\n${transcript}`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "keywords",
            strict: true,
            schema: {
              type: "object",
              properties: {
                keywords: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of SEO keywords",
                },
              },
              required: ["keywords"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0].message.content;
      const parsed = typeof content === "string" ? JSON.parse(content) : content;
      const keywords = parsed.keywords || [];

      console.log(`[SEO] Extracted ${keywords.length} keywords`);

      return keywords;
    } catch (error) {
      console.error(`[SEO] Failed to extract keywords:`, error);
      return [];
    }
  }

  generateSchemaMarkup(
    episodeTitle: string,
    description: string,
    audioUrl: string,
    duration: number,
    publishDate: string,
    podcastName: string
  ): Record<string, unknown> {
    const schema = {
      "@context": "https://schema.org",
      "@type": "PodcastEpisode",
      name: episodeTitle,
      description,
      url: audioUrl,
      duration: `PT${Math.floor(duration / 60)}M${duration % 60}S`,
      datePublished: publishDate,
      potentialAction: {
        "@type": "ListenAction",
        target: audioUrl,
      },
      partOfSeries: {
        "@type": "PodcastSeries",
        name: podcastName,
      },
    };

    console.log(`[SEO] Generated schema markup for episode: ${episodeTitle}`);

    return schema;
  }

  generateSitemapEntry(
    episodeId: string,
    episodeUrl: string,
    publishDate: string,
    priority: number = 0.8
  ): Record<string, unknown> {
    return {
      url: episodeUrl,
      lastmod: new Date(publishDate).toISOString().split("T")[0],
      priority,
      changefreq: "weekly",
    };
  }

  async generateSitemap(episodes: Array<{ id: string; url: string; publishDate: string }>): Promise<string> {
    const entries = episodes.map((ep) => this.generateSitemapEntry(ep.id, ep.url, ep.publishDate));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <priority>${entry.priority}</priority>
    <changefreq>${entry.changefreq}</changefreq>
  </url>`).join("\n")}
</urlset>`;

    console.log(`[SEO] Generated sitemap with ${entries.length} entries`);

    return xml;
  }

  async generateMetadata(
    episodeId: string,
    episodeTitle: string,
    transcript: string,
    audioUrl: string,
    duration: number,
    publishDate: string,
    podcastName: string
  ): Promise<PodcastSEOMetadata> {
    const showNotes = await this.generateShowNotes(episodeTitle, transcript, duration);
    const keywords = await this.extractKeywords(transcript, episodeTitle);
    const schemaMarkup = this.generateSchemaMarkup(
      episodeTitle,
      `${episodeTitle} - ${podcastName}`,
      audioUrl,
      duration,
      publishDate,
      podcastName
    );
    const sitemapEntry = this.generateSitemapEntry(episodeId, audioUrl, publishDate);

    const description = `${episodeTitle} - ${podcastName}. ${keywords.slice(0, 3).join(", ")}`;

    console.log(`[SEO] Generated complete metadata for episode: ${episodeTitle}`);

    return {
      episodeId,
      episodeTitle,
      description,
      keywords,
      showNotes,
      transcript,
      schemaMarkup,
      sitemapEntry,
    };
  }
}

export const podcastSEOService = new PodcastSEOService();
