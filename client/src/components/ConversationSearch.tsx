import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, X, Bookmark } from "lucide-react";

export function ConversationSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setResults([
        {
          id: 1,
          sessionId: 1,
          messageId: 1,
          content: query,
          role: "user",
          timestamp: new Date(),
          highlight: query,
        },
      ]);
      setShowResults(true);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handleSaveSearch = async () => {
    if (!query.trim()) return;

    try {
      setSavedSearches([...savedSearches, { query, name: query }]);
    } catch (error) {
      console.error("Failed to save search:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search conversations..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className="flex-1"
        />
        <Button onClick={handleSearch} className="gap-2">
          <Search className="w-4 h-4" />
          Search
        </Button>
        <Button
          onClick={handleSaveSearch}
          variant="outline"
          className="gap-2"
        >
          <Bookmark className="w-4 h-4" />
        </Button>
      </div>

      {showResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Search Results ({results.length})</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowResults(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Found {results.length} matching messages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground">No results found</p>
            ) : (
              results.map((result, idx) => (
                <div
                  key={idx}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                >
                  <p className="text-sm font-medium">Session #{result.sessionId}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {result.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(result.timestamp).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {savedSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Searches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {savedSearches.map((search, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setQuery(search.query);
                  handleSearch();
                }}
              >
                {search.name}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
