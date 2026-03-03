import React, { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { SearchBox } from '@/components/SearchBox';

export default function SearchResults() {
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [category, setCategory] = useState<'all' | 'rrb' | 'qumus'>('all');

  // Get search query from URL
  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get('q') || '';
  const urlCategory = (params.get('category') as 'all' | 'rrb' | 'qumus') || 'all';

  // Fetch search results
  const { data: searchData, isLoading } = trpc.search.search.useQuery(
    {
      query: searchQuery,
      category: urlCategory || category,
      limit: 50,
    },
    { enabled: searchQuery.length > 0 }
  );

  const results = searchData?.results || [];

  const handleCategoryChange = (newCategory: 'all' | 'rrb' | 'qumus') => {
    setCategory(newCategory);
    setLocation(
      `/search?q=${encodeURIComponent(searchQuery)}&category=${newCategory}`
    );
  };

  const handleNewSearch = (query: string) => {
    setLocation(`/search?q=${encodeURIComponent(query)}&category=${category}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Search Results
          </h1>
          <p className="text-pink-300 mb-6">
            {searchQuery && `Results for "${searchQuery}"`}
          </p>

          {/* Search Box */}
          <SearchBox
            className="mb-8"
            onSearch={handleNewSearch}
            category={category}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => handleCategoryChange('all')}
              variant={category === 'all' ? 'default' : 'outline'}
              className={
                category === 'all'
                  ? 'bg-gradient-to-r from-pink-600 to-orange-600'
                  : 'border-pink-500/30 text-pink-300 hover:bg-pink-500/10'
              }
            >
              <Filter className="w-4 h-4 mr-2" />
              All
            </Button>
            <Button
              onClick={() => handleCategoryChange('rrb')}
              variant={category === 'rrb' ? 'default' : 'outline'}
              className={
                category === 'rrb'
                  ? 'bg-gradient-to-r from-pink-600 to-orange-600'
                  : 'border-pink-500/30 text-pink-300 hover:bg-pink-500/10'
              }
            >
              RRB Radio
            </Button>
            <Button
              onClick={() => handleCategoryChange('qumus')}
              variant={category === 'qumus' ? 'default' : 'outline'}
              className={
                category === 'qumus'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600'
                  : 'border-blue-500/30 text-blue-300 hover:bg-blue-500/10'
              }
            >
              QUMUS
            </Button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              onClick={() => setViewMode('grid')}
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              className={
                viewMode === 'grid'
                  ? 'bg-pink-600 hover:bg-pink-700'
                  : 'border-pink-500/30 text-pink-300'
              }
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setViewMode('list')}
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              className={
                viewMode === 'list'
                  ? 'bg-pink-600 hover:bg-pink-700'
                  : 'border-pink-500/30 text-pink-300'
              }
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Results */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-pink-300">
              <div className="w-4 h-4 rounded-full border-2 border-pink-300 border-t-transparent animate-spin" />
              Searching...
            </div>
          </div>
        )}

        {!isLoading && results.length === 0 && searchQuery && (
          <Card className="bg-slate-800/50 border-pink-500/20 text-center py-12">
            <Search className="w-12 h-12 text-pink-300 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No results found
            </h3>
            <p className="text-gray-400">
              Try searching for different keywords or browse all content
            </p>
          </Card>
        )}

        {!isLoading && results.length > 0 && (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-pink-300">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((result) => (
                  <Card
                    key={result.id}
                    className="bg-slate-800/50 border-pink-500/20 hover:border-pink-500/50 transition-all cursor-pointer group"
                    onClick={() => setLocation(result.url)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="text-lg text-white group-hover:text-pink-300 transition-colors line-clamp-2">
                          {result.title}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className={
                            result.category === 'rrb'
                              ? 'border-pink-500/50 text-pink-300'
                              : 'border-blue-500/50 text-blue-300'
                          }
                        >
                          {result.category === 'rrb' ? 'RRB' : 'QUMUS'}
                        </Badge>
                      </div>
                      <CardDescription className="text-gray-400 line-clamp-3">
                        {result.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {result.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-slate-700/50 text-gray-300 text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-3">
                {results.map((result) => (
                  <Card
                    key={result.id}
                    className="bg-slate-800/50 border-pink-500/20 hover:border-pink-500/50 transition-all cursor-pointer"
                    onClick={() => setLocation(result.url)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-white">
                              {result.title}
                            </CardTitle>
                            <Badge
                              variant="outline"
                              className={
                                result.category === 'rrb'
                                  ? 'border-pink-500/50 text-pink-300'
                                  : 'border-blue-500/50 text-blue-300'
                              }
                            >
                              {result.category === 'rrb' ? 'RRB' : 'QUMUS'}
                            </Badge>
                          </div>
                          <CardDescription className="text-gray-400 mb-3">
                            {result.description}
                          </CardDescription>
                          <div className="flex flex-wrap gap-2">
                            {result.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="bg-slate-700/50 text-gray-300 text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
