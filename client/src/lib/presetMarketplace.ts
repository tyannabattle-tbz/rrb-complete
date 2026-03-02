/**
 * Preset Marketplace System
 * Upload, browse, rate, and purchase custom animation presets
 */

export interface PresetMetadata {
  id: string;
  name: string;
  description: string;
  category: 'animation' | 'transition' | 'effect' | 'template' | 'film';
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  thumbnail?: string;
  price: number;
  rating: number;
  reviewCount: number;
  downloads: number;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  license: 'free' | 'paid' | 'premium';
}

export interface PresetContent {
  id: string;
  metadata: PresetMetadata;
  data: Record<string, unknown>;
  preview?: {
    videoUrl?: string;
    imageUrl?: string;
  };
}

export interface PresetReview {
  id: string;
  presetId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface MarketplaceStats {
  totalPresets: number;
  totalDownloads: number;
  totalRevenue: number;
  topPresets: PresetMetadata[];
  topAuthors: Array<{
    id: string;
    name: string;
    presetCount: number;
    totalEarnings: number;
  }>;
}

export class PresetMarketplace {
  private presets: Map<string, PresetContent> = new Map();
  private reviews: Map<string, PresetReview[]> = new Map();
  private userLibrary: Map<string, Set<string>> = new Map();
  private stats: MarketplaceStats = {
    totalPresets: 0,
    totalDownloads: 0,
    totalRevenue: 0,
    topPresets: [],
    topAuthors: [],
  };

  uploadPreset(preset: PresetContent, userId: string): string {
    const id = preset.metadata.id || `preset-${Date.now()}`;
    preset.metadata.id = id;
    preset.metadata.author.id = userId;
    preset.metadata.createdAt = new Date();
    preset.metadata.updatedAt = new Date();

    this.presets.set(id, preset);
    this.stats.totalPresets++;

    return id;
  }

  publishPreset(presetId: string, userId: string): boolean {
    const preset = this.presets.get(presetId);

    if (!preset || preset.metadata.author.id !== userId) {
      return false;
    }

    preset.metadata.isPublished = true;
    preset.metadata.updatedAt = new Date();
    return true;
  }

  unpublishPreset(presetId: string, userId: string): boolean {
    const preset = this.presets.get(presetId);

    if (!preset || preset.metadata.author.id !== userId) {
      return false;
    }

    preset.metadata.isPublished = false;
    preset.metadata.updatedAt = new Date();
    return true;
  }

  searchPresets(
    query: string,
    filters?: { category?: string; minRating?: number; maxPrice?: number }
  ): PresetMetadata[] {
    const results: PresetMetadata[] = [];

    const presetsArray: PresetContent[] = [];
    this.presets.forEach((p) => presetsArray.push(p));

    presetsArray.forEach((preset) => {
      if (!preset.metadata.isPublished) return;

      const matchesQuery =
        query === '' ||
        preset.metadata.name.toLowerCase().includes(query.toLowerCase()) ||
        preset.metadata.description.toLowerCase().includes(query.toLowerCase()) ||
        preset.metadata.tags.some((tag: string) =>
          tag.toLowerCase().includes(query.toLowerCase())
        );

      if (!matchesQuery) return;

      if (filters?.category && preset.metadata.category !== filters.category) return;
      if (filters?.minRating && preset.metadata.rating < filters.minRating) return;
      if (filters?.maxPrice && preset.metadata.price > filters.maxPrice) return;

      results.push(preset.metadata);
    });

    results.sort((a, b) => {
      const ratingDiff = b.rating - a.rating;
      if (ratingDiff !== 0) return ratingDiff;
      return b.downloads - a.downloads;
    });

    return results;
  }

  getPreset(presetId: string): PresetContent | undefined {
    return this.presets.get(presetId);
  }

  downloadPreset(presetId: string, userId: string): boolean {
    const preset = this.presets.get(presetId);

    if (!preset || !preset.metadata.isPublished) {
      return false;
    }

    if (!this.userLibrary.has(userId)) {
      this.userLibrary.set(userId, new Set());
    }
    this.userLibrary.get(userId)!.add(presetId);

    preset.metadata.downloads++;
    this.stats.totalDownloads++;

    return true;
  }

  purchasePreset(presetId: string, userId: string, amount: number): boolean {
    const preset = this.presets.get(presetId);

    if (!preset || !preset.metadata.isPublished || preset.metadata.price === 0) {
      return false;
    }

    if (!this.userLibrary.has(userId)) {
      this.userLibrary.set(userId, new Set());
    }
    this.userLibrary.get(userId)!.add(presetId);

    preset.metadata.downloads++;
    this.stats.totalDownloads++;
    this.stats.totalRevenue += amount;

    return true;
  }

  getUserLibrary(userId: string): PresetContent[] {
    const presetIds = this.userLibrary.get(userId) || new Set();
    const library: PresetContent[] = [];

    presetIds.forEach((id) => {
      const preset = this.presets.get(id);
      if (preset) {
        library.push(preset);
      }
    });

    return library;
  }

  addReview(
    presetId: string,
    review: Omit<PresetReview, 'id' | 'createdAt'>
  ): string {
    const preset = this.presets.get(presetId);
    if (!preset) return '';

    const reviewId = `review-${Date.now()}`;
    const fullReview: PresetReview = {
      ...review,
      id: reviewId,
      presetId,
      createdAt: new Date(),
    };

    if (!this.reviews.has(presetId)) {
      this.reviews.set(presetId, []);
    }
    this.reviews.get(presetId)!.push(fullReview);

    const allReviews = this.reviews.get(presetId)!;
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    preset.metadata.rating = Math.round(avgRating * 10) / 10;
    preset.metadata.reviewCount = allReviews.length;

    return reviewId;
  }

  getReviews(presetId: string): PresetReview[] {
    return this.reviews.get(presetId) || [];
  }

  getStats(): MarketplaceStats {
    const allPresetsArray: PresetContent[] = [];
    this.presets.forEach((p) => allPresetsArray.push(p));

    const topPresets = allPresetsArray
      .filter((p) => p.metadata.isPublished)
      .sort((a, b) => b.metadata.downloads - a.metadata.downloads)
      .slice(0, 10)
      .map((p) => p.metadata);

    this.stats.topPresets = topPresets;

    const authorStatsMap = new Map<
      string,
      { name: string; presetCount: number; totalEarnings: number }
    >();

    allPresetsArray.forEach((preset) => {
      if (!preset.metadata.isPublished) return;

      const authorId = preset.metadata.author.id;
      const authorName = preset.metadata.author.name;

      if (!authorStatsMap.has(authorId)) {
        authorStatsMap.set(authorId, { name: authorName, presetCount: 0, totalEarnings: 0 });
      }

      const stats = authorStatsMap.get(authorId)!;
      stats.presetCount++;
      stats.totalEarnings += preset.metadata.price * preset.metadata.downloads;
    });

    const topAuthorsArray: Array<{
      id: string;
      name: string;
      presetCount: number;
      totalEarnings: number;
    }> = [];

    authorStatsMap.forEach((stats, id) => {
      topAuthorsArray.push({ id, ...stats });
    });

    this.stats.topAuthors = topAuthorsArray
      .sort((a, b) => b.totalEarnings - a.totalEarnings)
      .slice(0, 10);

    return { ...this.stats };
  }

  getFeaturedPresets(limit: number = 6): PresetMetadata[] {
    const allPresetsArray: PresetContent[] = [];
    this.presets.forEach((p) => allPresetsArray.push(p));

    return allPresetsArray
      .filter((p) => p.metadata.isPublished)
      .sort((a, b) => {
        const scoreDiff =
          b.metadata.rating * b.metadata.downloads -
          (a.metadata.rating * a.metadata.downloads);
        if (scoreDiff !== 0) return scoreDiff;
        return b.metadata.downloads - a.metadata.downloads;
      })
      .slice(0, limit)
      .map((p) => p.metadata);
  }

  getByCategory(category: string, limit: number = 10): PresetMetadata[] {
    const allPresetsArray: PresetContent[] = [];
    this.presets.forEach((p) => allPresetsArray.push(p));

    return allPresetsArray
      .filter((p) => p.metadata.isPublished && p.metadata.category === category)
      .sort((a, b) => b.metadata.downloads - a.metadata.downloads)
      .slice(0, limit)
      .map((p) => p.metadata);
  }

  getByAuthor(authorId: string): PresetMetadata[] {
    const allPresetsArray: PresetContent[] = [];
    this.presets.forEach((p) => allPresetsArray.push(p));

    return allPresetsArray
      .filter((p) => p.metadata.author.id === authorId && p.metadata.isPublished)
      .sort((a, b) => b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime())
      .map((p) => p.metadata);
  }
}

export function createMarketplace(): PresetMarketplace {
  return new PresetMarketplace();
}
