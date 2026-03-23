import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/lib/trpc';
import { Heart, Download, Play, Plus, Folder, TrendingUp, Clock, BarChart3 } from 'lucide-react';

export default function SoundEffectsBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'analytics'>('grid');

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

  // Get collections
  const { data: collections } = trpc.soundEffects.getCollections?.useQuery?.();

  // Get usage analytics
  const { data: usageAnalytics } = trpc.soundEffects.getUsageAnalytics?.useQuery?.();

  // Add effect to project mutation
  const addEffectMutation = trpc.soundEffects.addEffectToProject.useMutation();

  const displayEffects = searchQuery ? searchResults : selectedCategory ? categoryEffects : trendingEffects || [];

  const handleAddToProject = (effectId: string) => {
    addEffectMutation.mutate({
      projectId: 'current-project',
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
          <p className="text-slate-400">Browse 100,000+ royalty-free sound effects with collections and analytics</p>
        </div>

        {/* View Mode Tabs */}
        <div className="mb-8 flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            className={viewMode === 'grid' ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-600 text-white hover:bg-slate-700'}
            onClick={() => setViewMode('grid')}
          >
            Grid View
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            className={viewMode === 'list' ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-600 text-white hover:bg-slate-700'}
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Button
            variant={viewMode === 'analytics' ? 'default' : 'outline'}
            className={viewMode === 'analytics' ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-600 text-white hover:bg-slate-700'}
            onClick={() => setViewMode('analytics')}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
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

        {viewMode === 'analytics' ? (
          // Analytics View
          <div className="space-y-8">
            {/* Usage Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Effects Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{usageAnalytics?.totalUsed || 0}</div>
                  <p className="text-xs text-slate-500 mt-1">across all projects</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Most Used Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{usageAnalytics?.mostUsedCategory || 'N/A'}</div>
                  <p className="text-xs text-slate-500 mt-1">{usageAnalytics?.categoryUsageCount || 0} uses</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Avg. Duration Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{usageAnalytics?.averageDuration || 0}s</div>
                  <p className="text-xs text-slate-500 mt-1">per effect</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Favorites Count</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{favorites.length}</div>
                  <p className="text-xs text-slate-500 mt-1">saved effects</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Effects Chart */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Top 10 Most Used Effects
                </CardTitle>
                <CardDescription>Usage frequency across all projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usageAnalytics?.topEffects?.map((effect, index) => (
                    <div key={effect.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white font-medium">#{index + 1} {effect.name}</span>
                        <span className="text-xs text-slate-400">{effect.usageCount} uses</span>
                      </div>
                      <Progress value={(effect.usageCount / (usageAnalytics?.topEffects?.[0]?.usageCount || 1)) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Effects by Category</CardTitle>
                <CardDescription>Distribution of used effects across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {usageAnalytics?.categoryDistribution?.map((cat) => (
                    <div key={cat.category} className="p-3 bg-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-white">{cat.category}</p>
                        <Badge className="bg-purple-600 text-white">{cat.count}</Badge>
                      </div>
                      <Progress value={(cat.count / (usageAnalytics?.totalUsed || 1)) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="space-y-4">
              {/* Collections */}
              <Card className="bg-slate-800 border-slate-700 sticky top-8">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Folder className="w-5 h-5" />
                    Collections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant={selectedCollection === null ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setSelectedCollection(null)}
                    >
                      All Effects
                    </Button>
                    <Button
                      variant={selectedCollection === 'favorites' ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setSelectedCollection('favorites')}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Favorites ({favorites.length})
                    </Button>
                    {collections?.map((collection) => (
                      <Button
                        key={collection.id}
                        variant={selectedCollection === collection.id ? 'default' : 'outline'}
                        className="w-full justify-start text-left"
                        onClick={() => setSelectedCollection(collection.id)}
                      >
                        <Folder className="w-4 h-4 mr-2" />
                        {collection.name}
                      </Button>
                    ))}
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 mt-2">
                      <Plus className="w-4 h-4 mr-2" />
                      New Collection
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card className="bg-slate-800 border-slate-700">
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

            {/* Effects Grid/List */}
            <div className="lg:col-span-3">
              {searchLoading ? (
                <div className="text-center text-slate-400 py-12">Loading effects...</div>
              ) : displayEffects && displayEffects.length > 0 ? (
                viewMode === 'grid' ? (
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
                              className="text-xl ml-2 transition"
                            >
                              {favorites.includes(effect.id) ? (
                                <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                              ) : (
                                <Heart className="w-5 h-5 text-slate-400 hover:text-red-500" />
                              )}
                            </button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="bg-slate-700 rounded p-3">
                            <audio controls className="w-full h-8" src={effect.previewUrl} />
                          </div>

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

                          <div className="flex flex-wrap gap-1">
                            {effect.tags?.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-purple-600 hover:bg-purple-700"
                              onClick={() => handleAddToProject(effect.id)}
                            >
                              Add to Project
                            </Button>
                            <Button size="sm" variant="outline" className="border-slate-600">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  // List View
                  <div className="space-y-2">
                    {displayEffects.map((effect) => (
                      <Card key={effect.id} className="bg-slate-800 border-slate-700 hover:border-slate-500 transition">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <h3 className="text-white font-semibold">{effect.name}</h3>
                              <p className="text-sm text-slate-400">{effect.category}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-400">{effect.duration}s</span>
                            </div>
                            <audio controls className="w-40 h-6" src={effect.previewUrl} />
                            <button onClick={() => toggleFavorite(effect.id)}>
                              {favorites.includes(effect.id) ? (
                                <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                              ) : (
                                <Heart className="w-5 h-5 text-slate-400 hover:text-red-500" />
                              )}
                            </button>
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                              onClick={() => handleAddToProject(effect.id)}
                            >
                              Add
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center text-slate-400 py-12">
                  {searchQuery ? 'No effects found' : 'Select a category to browse'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
