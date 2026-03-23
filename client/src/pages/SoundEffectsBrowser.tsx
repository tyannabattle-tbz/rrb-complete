import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';

export default function SoundEffectsBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Fetch categories
  const { data: categories } = trpc.soundEffects.getCategories.useQuery();

  // Search effects
  const { data: searchResults, isLoading: searchLoading } = trpc.soundEffects.searchEffects.useQuery(
    { query: searchQuery, limit: 50 },
    { enabled: searchQuery.length > 0 }
  );

  // Get effects by category
  const { data: categoryEffects } = trpc.soundEffects.getEffectsByCategory.useQuery(
    { category: selectedCategory || '', limit: 50 },
    { enabled: !!selectedCategory }
  );

  // Get trending effects
  const { data: trendingEffects } = trpc.soundEffects.getTrendingEffects.useQuery({ limit: 12 });

  // Add effect to project mutation
  const addEffectMutation = trpc.soundEffects.addEffectToProject.useMutation();

  const displayEffects = searchQuery ? searchResults : selectedCategory ? categoryEffects : trendingEffects || [];

  const handleAddToProject = (effectId: string) => {
    addEffectMutation.mutate({
      projectId: 'current-project', // TODO: Get from context
      effectId,
      timestamp: 0,
    });
  };

  const toggleFavorite = (effectId: string) => {
    setFavorites(prev =>
      prev.includes(effectId) ? prev.filter(id => id !== effectId) : [...prev, effectId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Sound Effects Library</h1>
          <p className="text-slate-400">Browse 100,000+ royalty-free sound effects</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search sound effects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-700 border-slate-600 text-white placeholder-slate-400 h-12 text-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div>
            <Card className="bg-slate-800 border-slate-700 sticky top-8">
              <CardHeader>
                <CardTitle className="text-white">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant={selectedCategory === null ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All Effects
                  </Button>
                  {categories?.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Effects Grid */}
          <div className="lg:col-span-3">
            {searchLoading ? (
              <div className="text-center text-slate-400 py-12">Loading effects...</div>
            ) : displayEffects && displayEffects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayEffects.map((effect) => (
                  <Card key={effect.id} className="bg-slate-800 border-slate-700 hover:border-slate-500 transition">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white text-sm">{effect.name}</CardTitle>
                          <CardDescription className="text-xs text-slate-500">
                            {effect.category}
                          </CardDescription>
                        </div>
                        <button
                          onClick={() => toggleFavorite(effect.id)}
                          className="text-xl ml-2"
                        >
                          {favorites.includes(effect.id) ? '❤️' : '🤍'}
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Audio Preview */}
                      <div className="bg-slate-700 rounded p-3">
                        <audio
                          controls
                          className="w-full h-8"
                          src={effect.previewUrl}
                        />
                      </div>

                      {/* Effect Details */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-slate-400">Duration</p>
                          <p className="text-white font-semibold">{effect.duration}s</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Format</p>
                          <p className="text-white font-semibold">{effect.format}</p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {effect.tags?.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                          onClick={() => handleAddToProject(effect.id)}
                        >
                          Add to Project
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-600"
                        >
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-400 py-12">
                {searchQuery ? 'No effects found' : 'Select a category to browse'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
