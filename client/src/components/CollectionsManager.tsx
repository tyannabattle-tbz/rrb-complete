import { useState } from "react";
import { Plus, Trash2, Lock, Earth, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Collection {
  id: string;
  name: string;
  description?: string;
  videoCount: number;
  thumbnail: string;
  isPublic: boolean;
  likes: number;
  createdAt: Date;
}

interface CollectionsManagerProps {
  collections?: Collection[];
  onCreateCollection?: (name: string, description?: string, isPublic?: boolean) => void;
  onDeleteCollection?: (id: string) => void;
  onViewCollection?: (id: string) => void;
}

export default function CollectionsManager({
  collections = [],
  onCreateCollection,
  onDeleteCollection,
  onViewCollection,
}: CollectionsManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: false,
  });

  const handleCreateCollection = () => {
    if (!formData.name.trim()) {
      toast.error("Collection name is required");
      return;
    }

    onCreateCollection?.(formData.name, formData.description, formData.isPublic);
    setFormData({ name: "", description: "", isPublic: false });
    setIsOpen(false);
    toast.success("Collection created successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Collections</h2>
          <p className="text-muted-foreground">Organize your videos into custom collections</p>
        </div>

        {/* Create Collection Button */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
              <DialogDescription>
                Create a collection to organize and group your videos together
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Collection Name</label>
                <Input
                  placeholder="e.g., My Favorites, Cinematic Videos"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe what this collection is about"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isPublic" className="text-sm font-medium cursor-pointer">
                  Make this collection public
                </label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCollection}>Create Collection</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-2">
            <p className="text-muted-foreground">No collections yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first collection to start organizing videos
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <Card key={collection.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-muted overflow-hidden group cursor-pointer">
                <img
                  src={collection.thumbnail}
                  alt={collection.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onClick={() => onViewCollection?.(collection.id)}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onViewCollection?.(collection.id)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </div>

                {/* Video Count Badge */}
                <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
                  {collection.videoCount} videos
                </div>

                {/* Privacy Badge */}
                <div className="absolute top-2 left-2">
                  {collection.isPublic ? (
                    <Earth className="w-4 h-4 text-white" />
                  ) : (
                    <Lock className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold line-clamp-1">{collection.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {collection.description || "No description"}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <span>Created {formatDate(collection.createdAt)}</span>
                  {collection.likes > 0 && <span>❤️ {collection.likes}</span>}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onViewCollection?.(collection.id)}
                  >
                    Open
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onDeleteCollection?.(collection.id);
                      toast.success("Collection deleted");
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}m ago`;
}
