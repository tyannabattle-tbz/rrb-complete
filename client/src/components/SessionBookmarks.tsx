import { useState } from "react";
import { Star, Trash2, Folder, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Bookmark {
  id: number;
  sessionId: number;
  name: string;
  description?: string;
  collectionId?: number;
  createdAt: Date;
  isFavorite: boolean;
}

interface Collection {
  id: number;
  name: string;
  description?: string;
  bookmarkCount: number;
}

interface SessionBookmarksProps {
  onSelectBookmark?: (bookmarkId: number) => void;
}

export default function SessionBookmarks({
  onSelectBookmark,
}: SessionBookmarksProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([
    {
      id: 1,
      sessionId: 42,
      name: "Data Analysis Session",
      description: "Important customer data analysis",
      collectionId: 1,
      createdAt: new Date(Date.now() - 86400000),
      isFavorite: true,
    },
    {
      id: 2,
      sessionId: 38,
      name: "API Integration Test",
      description: "Testing new API endpoints",
      collectionId: 2,
      createdAt: new Date(Date.now() - 172800000),
      isFavorite: false,
    },
    {
      id: 3,
      sessionId: 51,
      name: "Performance Optimization",
      description: "Optimizing agent performance",
      collectionId: 1,
      createdAt: new Date(Date.now() - 259200000),
      isFavorite: true,
    },
  ]);

  const [collections, setCollections] = useState<Collection[]>([
    {
      id: 1,
      name: "Production",
      description: "Production sessions",
      bookmarkCount: 2,
    },
    {
      id: 2,
      name: "Testing",
      description: "Test and development sessions",
      bookmarkCount: 1,
    },
  ]);

  const [newCollectionName, setNewCollectionName] = useState("");
  const [showNewCollection, setShowNewCollection] = useState(false);

  const favorites = bookmarks.filter((b) => b.isFavorite);

  const handleToggleFavorite = (id: number) => {
    setBookmarks(
      bookmarks.map((b) =>
        b.id === id ? { ...b, isFavorite: !b.isFavorite } : b
      )
    );
    toast.success("Bookmark updated");
  };

  const handleDeleteBookmark = (id: number) => {
    setBookmarks(bookmarks.filter((b) => b.id !== id));
    toast.success("Bookmark deleted");
  };

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) {
      toast.error("Collection name is required");
      return;
    }

    const newCollection: Collection = {
      id: Math.max(...collections.map((c) => c.id), 0) + 1,
      name: newCollectionName,
      bookmarkCount: 0,
    };

    setCollections([...collections, newCollection]);
    setNewCollectionName("");
    setShowNewCollection(false);
    toast.success("Collection created");
  };

  const handleSelectBookmark = (bookmarkId: number) => {
    if (onSelectBookmark) {
      onSelectBookmark(bookmarkId);
    }
    toast.success("Bookmark selected");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Session Bookmarks</h1>
        <p className="text-muted-foreground mt-1">
          Save and organize your favorite sessions
        </p>
      </div>

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Star size={18} className="text-yellow-500" />
            Favorites
          </h3>
          <div className="space-y-2">
            {favorites.map((bookmark) => (
              <div
                key={bookmark.id}
                className="flex items-center justify-between p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                onClick={() => handleSelectBookmark(bookmark.sessionId)}
              >
                <div className="flex-1">
                  <h4 className="font-medium">{bookmark.name}</h4>
                  {bookmark.description && (
                    <p className="text-sm text-muted-foreground">
                      {bookmark.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Session #{bookmark.sessionId} •{" "}
                    {bookmark.createdAt.toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(bookmark.id);
                    }}
                    className="p-2 hover:bg-background rounded"
                  >
                    <Star
                      size={16}
                      className="fill-yellow-500 text-yellow-500"
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBookmark(bookmark.id);
                    }}
                    className="p-2 hover:bg-background rounded"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Collections */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Folder size={18} />
            Collections
          </h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowNewCollection(!showNewCollection)}
            className="gap-1"
          >
            <Plus size={14} />
            New Collection
          </Button>
        </div>

        {showNewCollection && (
          <Card className="p-4 mb-4">
            <div className="flex gap-2">
              <Input
                placeholder="Collection name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && handleCreateCollection()
                }
              />
              <Button onClick={handleCreateCollection} size="sm">
                Create
              </Button>
              <Button
                onClick={() => setShowNewCollection(false)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {collections.map((collection) => (
            <Card key={collection.id} className="p-4 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    <Folder size={16} />
                    {collection.name}
                  </h4>
                  {collection.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {collection.description}
                    </p>
                  )}
                </div>
              </div>
              <Badge variant="secondary">
                {collection.bookmarkCount} bookmarks
              </Badge>
            </Card>
          ))}
        </div>
      </div>

      {/* All Bookmarks */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">All Bookmarks</h3>
        <div className="space-y-2">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="flex items-center justify-between p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
              onClick={() => handleSelectBookmark(bookmark.sessionId)}
            >
              <div className="flex-1">
                <h4 className="font-medium">{bookmark.name}</h4>
                {bookmark.description && (
                  <p className="text-sm text-muted-foreground">
                    {bookmark.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Session #{bookmark.sessionId} •{" "}
                  {bookmark.createdAt.toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(bookmark.id);
                  }}
                  className="p-2 hover:bg-background rounded"
                >
                  <Star
                    size={16}
                    className={
                      bookmark.isFavorite
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-muted-foreground"
                    }
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBookmark(bookmark.id);
                  }}
                  className="p-2 hover:bg-background rounded"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
