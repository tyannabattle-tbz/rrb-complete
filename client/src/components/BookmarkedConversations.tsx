import React, { useState, useEffect } from 'react';
import { Star, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookmarkedConversation {
  id: string;
  sessionId: string;
  title: string;
  preview: string;
  bookmarkedAt: string;
}

export const BookmarkedConversations: React.FC<{
  onSelectBookmark?: (sessionId: string) => void;
}> = ({ onSelectBookmark }) => {
  const [bookmarks, setBookmarks] = useState<BookmarkedConversation[]>([]);
  const [isOpen, setIsOpen] = useState(false);

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

  const addBookmark = (sessionId: string, title: string, preview: string) => {
    const newBookmark: BookmarkedConversation = {
      id: `bookmark_${Date.now()}`,
      sessionId,
      title,
      preview,
      bookmarkedAt: new Date().toISOString(),
    };
    const updated = [...bookmarks, newBookmark];
    setBookmarks(updated);
    localStorage.setItem('qumus_bookmarks', JSON.stringify(updated));
  };

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
        <div className="space-y-2 rounded-lg border border-border bg-card p-3">
          {bookmarks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No bookmarked conversations yet. Click the star icon on any conversation to bookmark it.
            </p>
          ) : (
            <div className="space-y-2">
              {bookmarks.map((bookmark) => (
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
                    <p className="text-sm font-medium line-clamp-1">{bookmark.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{bookmark.preview}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBookmark(bookmark.id)}
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
