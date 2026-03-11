import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RRBSongBadge } from '@/components/RRBSongBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Newspaper, TrendingUp, AlertCircle, Clock, ArrowLeft, ExternalLink, Filter } from 'lucide-react';
import { trpc } from '@/lib/trpc';

const CATEGORIES = ['all', 'music', 'community', 'legacy', 'broadcasting', 'technology', 'events', 'general'];

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const { data: articles = [], isLoading } = trpc.chunk5.news.list.useQuery(
    selectedCategory === 'all' ? undefined : { category: selectedCategory }
  );
  const { data: breakingNews = [] } = trpc.chunk5.news.breaking.useQuery();
  const { data: featuredNews = [] } = trpc.chunk5.news.featured.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a1a] via-[#1a1025] to-[#0f0a1a]">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0f0a1a]/85 border-b border-purple-900/30">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Newspaper className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-lg text-white">RRB News</span>
            <span className="text-sm text-purple-300/70 hidden sm:inline">Canryn Production Network</span>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-purple-300/60 hover:text-amber-400">
              <ArrowLeft className="w-4 h-4 mr-1" /> Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="py-8">
        <div className="container max-w-6xl">
          {/* Breaking News Banner */}
          {breakingNews.length > 0 && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="text-red-400 font-bold text-sm uppercase tracking-wider">Breaking</span>
              </div>
              {breakingNews.map(article => (
                <div key={article.id} className="text-white text-sm mb-1">
                  {article.title}
                  {article.source && <span className="text-red-300/50 ml-2">— {article.source}</span>}
                </div>
              ))}
            </div>
          )}

          {/* Hero Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              News & Updates
            </h1>
            <p className="text-purple-200/60 text-base">
              The latest from Canryn Production, Rockin' Rockin' Boogie, Sweet Miracles, and the broader music and broadcasting community.
            </p>
            <div className="mt-3"><RRBSongBadge variant="inline" /></div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Filter className="w-4 h-4 text-purple-400/60 mt-1.5" />
            {CATEGORIES.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                className={selectedCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'border-purple-700/30 text-purple-300/70 hover:text-amber-400 hover:border-amber-500/30'
                }
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            ))}
          </div>

          {/* Featured Articles */}
          {featuredNews.length > 0 && selectedCategory === 'all' && (
            <div className="mb-10">
              <h2 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Featured
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {featuredNews.slice(0, 4).map(article => (
                  <Card key={article.id} className="bg-gradient-to-b from-amber-500/10 to-purple-900/30 border-amber-500/20 hover:border-amber-500/40 transition">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-amber-500/20 text-amber-300 text-xs">{article.category || 'General'}</Badge>
                        {article.isBreaking && <Badge className="bg-red-500/20 text-red-300 text-xs">Breaking</Badge>}
                      </div>
                      <CardTitle className="text-white text-base leading-tight">{article.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {article.summary && <p className="text-purple-200/60 text-sm mb-2 line-clamp-2">{article.summary}</p>}
                      <div className="flex items-center justify-between text-xs text-purple-300/40">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Recent'}
                        </span>
                        {article.source && <span>{article.source}</span>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Articles */}
          <h2 className="text-lg font-bold text-white mb-4">
            {selectedCategory === 'all' ? 'Latest Articles' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} News`}
          </h2>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-24 bg-purple-900/20 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-16">
              <Newspaper className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
              <p className="text-purple-200/50 text-lg mb-2">No articles yet</p>
              <p className="text-purple-300/30 text-sm">News articles will appear here as they are published by the editorial team.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {articles.map(article => (
                <Card key={article.id} className="bg-gradient-to-r from-purple-900/20 to-purple-950/40 border-purple-700/15 hover:border-purple-600/30 transition">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-xs">{article.category || 'General'}</Badge>
                          {article.isBreaking && <Badge className="bg-red-500/20 text-red-300 text-xs">Breaking</Badge>}
                        </div>
                        <h3 className="text-white font-semibold text-sm mb-1">{article.title}</h3>
                        {article.summary && <p className="text-purple-200/50 text-xs line-clamp-2">{article.summary}</p>}
                        <div className="flex items-center gap-3 mt-2 text-xs text-purple-300/40">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Recent'}
                          </span>
                          {article.source && <span>{article.source}</span>}
                        </div>
                      </div>
                      {article.sourceUrl && (
                        <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-amber-400/60 hover:text-amber-400 transition">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-10 p-4 border border-dashed border-purple-500/20 rounded-xl text-purple-300/40 text-xs">
            <strong className="text-purple-200/60">Disclaimer:</strong> News articles are curated by the Canryn Production editorial team. External sources are cited where applicable. &copy; {new Date().getFullYear()} Canryn Production. All rights reserved.
          </div>
        </div>
      </main>
    </div>
  );
}
