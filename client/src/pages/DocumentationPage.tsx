import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowLeft, FileText, Search, ChevronRight, Folder } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';

export default function DocumentationPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPage, setSelectedPage] = useState<number | null>(null);

  const { data: pages = [], isLoading } = trpc.chunk5.documentation.list.useQuery(
    selectedCategory ? { category: selectedCategory } : undefined
  );
  const { data: categories = [] } = trpc.chunk5.documentation.categories.useQuery();

  const filteredPages = searchQuery
    ? pages.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.content && p.content.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : pages;

  const selectedDoc = selectedPage !== null ? pages.find(p => p.id === selectedPage) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a1a] via-[#1a1025] to-[#0f0a1a]">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0f0a1a]/85 border-b border-purple-900/30">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-lg text-white">Documentation</span>
            <span className="text-sm text-purple-300/70 hidden sm:inline">Canryn Production Knowledge Base</span>
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
          {/* Hero */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Legacy Documentation
            </h1>
            <p className="text-purple-200/60 text-base">
              Comprehensive documentation for the Canryn Production ecosystem — past, protection, presentation, and preservation.
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/40" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 bg-purple-900/20 border-purple-700/30 text-white placeholder:text-purple-400/30"
            />
          </div>

          <div className="grid md:grid-cols-[240px_1fr] gap-6">
            {/* Sidebar Categories */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-purple-300/50 uppercase tracking-wider mb-3">Categories</h3>
              <Button
                variant={!selectedCategory ? 'default' : 'ghost'}
                size="sm"
                className={!selectedCategory ? 'bg-purple-600 text-white w-full justify-start' : 'text-purple-300/60 hover:text-amber-400 w-full justify-start'}
                onClick={() => { setSelectedCategory(undefined); setSelectedPage(null); }}
              >
                <Folder className="w-3 h-3 mr-2" /> All Docs
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'ghost'}
                  size="sm"
                  className={selectedCategory === cat ? 'bg-purple-600 text-white w-full justify-start' : 'text-purple-300/60 hover:text-amber-400 w-full justify-start'}
                  onClick={() => { setSelectedCategory(cat ?? undefined); setSelectedPage(null); }}
                >
                  <Folder className="w-3 h-3 mr-2" /> {(cat ?? 'General').charAt(0).toUpperCase() + (cat ?? 'general').slice(1)}
                </Button>
              ))}
            </div>

            {/* Content Area */}
            <div>
              {selectedDoc ? (
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-purple-300/60 hover:text-amber-400 mb-4"
                    onClick={() => setSelectedPage(null)}
                  >
                    <ArrowLeft className="w-3 h-3 mr-1" /> Back to list
                  </Button>
                  <Card className="bg-gradient-to-b from-purple-900/20 to-purple-950/40 border-purple-700/15">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-1">
                        {selectedDoc.category && (
                          <Badge className="bg-purple-500/20 text-purple-300 text-xs">{selectedDoc.category}</Badge>
                        )}
                      </div>
                      <CardTitle className="text-white text-xl">{selectedDoc.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-invert prose-sm max-w-none text-purple-200/70 leading-relaxed whitespace-pre-wrap">
                        {selectedDoc.content || 'Content is being prepared.'}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : isLoading ? (
                <div className="space-y-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-16 bg-purple-900/20 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredPages.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
                  <p className="text-purple-200/50 text-lg mb-2">No documentation pages yet</p>
                  <p className="text-purple-300/30 text-sm">Documentation will appear here as pages are published by the editorial team.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPages.map(page => (
                    <Card
                      key={page.id}
                      className="bg-gradient-to-r from-purple-900/20 to-purple-950/40 border-purple-700/15 hover:border-purple-600/30 transition cursor-pointer"
                      onClick={() => setSelectedPage(page.id)}
                    >
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-purple-400/40 shrink-0" />
                            <div>
                              <h3 className="text-white font-medium text-sm">{page.title}</h3>
                              {page.category && (
                                <span className="text-purple-300/40 text-xs">{page.category}</span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-purple-400/30" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-10 p-4 border border-dashed border-purple-500/20 rounded-xl text-purple-300/40 text-xs">
            <strong className="text-purple-200/60">Copyright Notice:</strong> All documentation content is the intellectual property of Canryn Production and its subsidiaries. 
            Unauthorized reproduction, distribution, or modification is strictly prohibited. 
            Content is provided for informational and archival purposes — past, protection, presentation, and preservation. 
            &copy; {new Date().getFullYear()} Canryn Production. All rights reserved.
          </div>
        </div>
      </main>
    </div>
  );
}
