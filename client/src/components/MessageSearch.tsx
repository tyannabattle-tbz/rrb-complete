import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";

interface SearchResult {
  messageId: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  matchPositions: number[];
}

interface MessageSearchProps {
  messages: Array<{
    id: string;
    content: string;
    role: "user" | "assistant" | "system";
    timestamp: Date;
  }>;
  onSearchResultsChange?: (results: SearchResult[]) => void;
  onClose?: () => void;
}

export default function MessageSearch({
  messages,
  onSearchResultsChange,
  onClose,
}: MessageSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const performSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        onSearchResultsChange?.([]);
        return;
      }

      const lowerQuery = query.toLowerCase();
      const results: SearchResult[] = [];

      messages.forEach((message) => {
        if (message.role === "system") return;

        const lowerContent = message.content.toLowerCase();
        const matches: number[] = [];
        let index = 0;

        while ((index = lowerContent.indexOf(lowerQuery, index)) !== -1) {
          matches.push(index);
          index += lowerQuery.length;
        }

        if (matches.length > 0) {
          results.push({
            messageId: message.id,
            content: message.content,
            role: message.role,
            timestamp: message.timestamp,
            matchPositions: matches,
          });
        }
      });

      setSearchResults(results);
      setSelectedIndex(0);
      onSearchResultsChange?.(results);
    },
    [messages, onSearchResultsChange]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    performSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey && selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1);
      } else if (!e.shiftKey && selectedIndex < searchResults.length - 1) {
        setSelectedIndex(selectedIndex + 1);
      }
    } else if (e.key === "Escape") {
      onClose?.();
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
      <Search size={18} className="text-muted-foreground" />
      <Input
        placeholder="Search messages..."
        value={searchQuery}
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
        className="flex-1 border-0 bg-transparent"
        autoFocus
      />
      {searchResults.length > 0 && (
        <span className="text-xs text-muted-foreground">
          {selectedIndex + 1} / {searchResults.length}
        </span>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-8 w-8 p-0"
      >
        <X size={16} />
      </Button>
    </div>
  );
}
