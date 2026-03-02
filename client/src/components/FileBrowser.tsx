import { useState, useMemo } from "react";
import {
  File,
  Folder,
  Download,
  Trash2,
  Search,
  ChevronRight,
  ChevronDown,
  FileText,
  Image,
  Code,
  Music,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: number;
  modified: Date;
  path: string;
  children?: FileItem[];
}

interface FileBrowserProps {
  sessionId: number;
  onFileSelect?: (file: FileItem) => void;
}

export default function FileBrowser({
  sessionId,
  onFileSelect,
}: FileBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["/"])
  );
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Mock file structure - replace with real API call
  const mockFiles: FileItem[] = [
    {
      id: "1",
      name: "outputs",
      type: "folder",
      path: "/outputs",
      modified: new Date(),
      children: [
        {
          id: "1-1",
          name: "report.md",
          type: "file",
          size: 2048,
          path: "/outputs/report.md",
          modified: new Date(Date.now() - 3600000),
        },
        {
          id: "1-2",
          name: "data.json",
          type: "file",
          size: 4096,
          path: "/outputs/data.json",
          modified: new Date(Date.now() - 7200000),
        },
      ],
    },
    {
      id: "2",
      name: "logs",
      type: "folder",
      path: "/logs",
      modified: new Date(),
      children: [
        {
          id: "2-1",
          name: "execution.log",
          type: "file",
          size: 8192,
          path: "/logs/execution.log",
          modified: new Date(Date.now() - 1800000),
        },
      ],
    },
    {
      id: "3",
      name: "config.yaml",
      type: "file",
      size: 512,
      path: "/config.yaml",
      modified: new Date(Date.now() - 86400000),
    },
  ];

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const filteredFiles = useMemo(() => {
    const filterItems = (items: FileItem[]): FileItem[] => {
      return items
        .filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((item) => ({
          ...item,
          children: item.children ? filterItems(item.children) : undefined,
        }));
    };

    return filterItems(mockFiles);
  }, [searchQuery]);

  const getFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();

    switch (ext) {
      case "md":
      case "txt":
        return <FileText size={16} className="text-blue-500" />;
      case "json":
      case "yaml":
      case "yml":
      case "py":
      case "js":
      case "ts":
        return <Code size={16} className="text-green-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <Image size={16} className="text-purple-500" />;
      case "mp3":
      case "wav":
      case "m4a":
        return <Music size={16} className="text-pink-500" />;
      case "zip":
      case "tar":
      case "gz":
        return <Archive size={16} className="text-orange-500" />;
      default:
        return <File size={16} className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const FileTreeItem = ({ item, level = 0 }: { item: FileItem; level?: number }) => {
    const isExpanded = expandedFolders.has(item.path);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <div
          className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 rounded cursor-pointer transition-colors"
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={() => {
            if (item.type === "folder") {
              toggleFolder(item.path);
            } else {
              setSelectedFile(item);
              onFileSelect?.(item);
            }
          }}
        >
          {item.type === "folder" ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(item.path);
                }}
                className="p-0 hover:bg-muted rounded"
              >
                {hasChildren ? (
                  isExpanded ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )
                ) : (
                  <ChevronRight size={16} className="opacity-0" />
                )}
              </button>
              <Folder size={16} className="text-yellow-500" />
              <span className="flex-1 font-medium text-sm">{item.name}</span>
              {hasChildren && (
                <Badge variant="outline" className="text-xs">
                  {item.children?.length}
                </Badge>
              )}
            </>
          ) : (
            <>
              <div className="w-4" />
              {getFileIcon(item.name)}
              <span className="flex-1 text-sm">{item.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatFileSize(item.size)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewOpen(true);
                }}
                className="opacity-0 group-hover:opacity-100"
              >
                <Download size={14} />
              </Button>
            </>
          )}
        </div>

        {item.type === "folder" && isExpanded && hasChildren && (
          <div className="group">
            {item.children?.map((child) => (
              <FileTreeItem key={child.id} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
        <Input
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* File Tree */}
      <Card className="p-4 max-h-96 overflow-y-auto">
        {filteredFiles.length > 0 ? (
          <div className="space-y-1">
            {filteredFiles.map((item) => (
              <FileTreeItem key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Folder size={32} className="mx-auto mb-2 opacity-50" />
            <p>No files found</p>
          </div>
        )}
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Total Files</p>
          <p className="text-lg font-semibold">
            {filteredFiles.reduce(
              (count, item) =>
                count +
                (item.type === "file" ? 1 : 0) +
                (item.children?.length || 0),
              0
            )}
          </p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Total Size</p>
          <p className="text-lg font-semibold">
            {formatFileSize(
              filteredFiles.reduce(
                (size, item) =>
                  size +
                  (item.size || 0) +
                  (item.children?.reduce((s, c) => s + (c.size || 0), 0) || 0),
                0
              )
            )}
          </p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Folders</p>
          <p className="text-lg font-semibold">
            {filteredFiles.filter((item) => item.type === "folder").length}
          </p>
        </Card>
      </div>

      {/* File Preview Dialog */}
      {selectedFile && (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getFileIcon(selectedFile.name)}
                {selectedFile.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* File Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Path</p>
                  <p className="font-mono text-xs">{selectedFile.path}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Size</p>
                  <p>{formatFileSize(selectedFile.size)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Modified</p>
                  <p>{selectedFile.modified.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p>{selectedFile.name.split(".").pop()?.toUpperCase()}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="default" size="sm">
                  <Download size={14} className="mr-2" />
                  Download
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 size={14} className="mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
