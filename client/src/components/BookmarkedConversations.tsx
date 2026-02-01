import React, { useState, useEffect } from 'react';
import { Star, Trash2, MessageSquare, Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BookmarkedConversation {
  id: string;
  sessionId: string;
  title: string;
  preview: string;
  bookmarkedAt: string;
  topic?: string;
  engagementLevel?: 'low' | 'medium' | 'high';
}

export const BookmarkedConversations: React.FC<{
  onSelectBookmark?: (sessionId: string) => void;
}> = ({ onSelectBookmark }) => {
  const [bookmarks, setBookmarks] = useState<BookmarkedConversation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedEngagement, setSelectedEngagement] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = () => {
    const saved = localStorage.getItem('qumus_bookmarks');
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  };

  const removeBookmark = (id: string) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    localStorage.setItem('qumus_bookmarks', JSON.stringify(updated));
  };

  const addBookmark = (sessionId: string, title: string, preview: string, topic?: string) => {
    const newBookmark: BookmarkedConversation = {
      id: `bookmark_${Date.now()}`,
      sessionId,
      title,
      preview,
      bookmarkedAt: new Date().toISOString(),
      topic,
      engagementLevel: 'medium',
    };
    const updated = [...bookmarks, newBookmark];
    setBookmarks(updated);
    localStorage.setItem('qumus_bookmarks', JSON.stringify(updated));
  };

  const filterBookmarks = () => {
    let filtered = bookmarks;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((b) =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.preview.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Topic filter
    if (selectedTopic) {
      filtered = filtered.filter((b) => b.topic === selectedTopic);
    }

    // Engagement filter
    if (selectedEngagement) {
      filtered = filtered.filter((b) => b.engagementLevel === selectedEngagement);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();

      switch (dateRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter((b) => new Date(b.bookmarkedAt) >= cutoffDate);
    }

    return filtered;
  };

  const filteredBookmarks = filterBookmarks();
  const uniqueTopics = Array.from(new Set(bookmarks.map((b) => b.topic).filter(Boolean))) as string[];
  const hasActiveFilters = searchQuery || selectedTopic || selectedEngagement || dateRange !== 'all';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold">
          <Star className="h-4 w-4" />
          Bookmarked Conversations
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? 'Hide' : 'Show'}
        </Button>
      </div>

      {isOpen && (
        <div className="space-y-3 rounded-lg border border-border bg-card p-3">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 w-8 p-0"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="space-y-3 rounded-lg border border-border/50 bg-background p-3">
              {/* Date Range */}
              <div className="space-y-2">
                <p className="text-xs font-medium">Date Range</p>
                <div className="flex gap-2">
                  {(['all', 'week', 'month', 'year'] as const).map((range) => (
                    <Button
                      key={range}
                      variant={dateRange === range ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDateRange(range)}
                      className="text-xs h-7"
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Topic Filter */}
              {uniqueTopics.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium">Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {uniqueTopics.map((topic) => (
                      <Button
                        key={topic}
                        variant={selectedTopic === topic ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTopic(selectedTopic === topic ? null : topic)}
                        className="text-xs h-7"
                      >
                        {topic}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Engagement Filter */}
              <div className="space-y-2">
                <p className="text-xs font-medium">Engagement Level</p>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <Button
                      key={level}
                      variant={selectedEngagement === level ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedEngagement(selectedEngagement === level ? null : level)}
                      className="text-xs h-7"
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTopic(null);
                    setSelectedEngagement(null);
                    setDateRange('all');
                  }}
                  className="w-full text-xs h-7"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          )}

          {/* Results */}
          {bookmarks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No bookmarked conversations yet. Click the star icon on any conversation to bookmark it.
            </p>
          ) : filteredBookmarks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No bookmarks match your filters. Try adjusting your search criteria.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Showing {filteredBookmarks.length} of {bookmarks.length} bookmarks
              </p>
              {filteredBookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="flex items-start justify-between gap-2 rounded-lg border border-border/50 bg-background p-2 hover:bg-accent"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      onSelectBookmark?.(bookmark.sessionId);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium line-clamp-1">{bookmark.title}</p>
                      {bookmark.topic && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {bookmark.topic}
                        </span>
                      )}
                      {bookmark.engagementLevel && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          bookmark.engagementLevel === 'high' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          bookmark.engagementLevel === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {bookmark.engagementLevel}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{bookmark.preview}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(bookmark.bookmarkedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBookmark(bookmark.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
