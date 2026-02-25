import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";

export default function AdvancedSearch() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "sessions" | "messages" | "tools">("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);

  const searchMutation = trpc.analytics.advancedSearch.search.useQuery(
    { query, type: searchType, startDate: startDate ? new Date(startDate) : undefined, endDate: endDate ? new Date(endDate) : undefined, limit: 50 },
    { enabled: false }
  );
  const searchTrigger = trpc.analytics.advancedSearch.search.useQuery;
  const suggestionQuery = trpc.analytics.advancedSearch.getSuggestions.useQuery(
    { query, limit: 5 },
    { enabled: query.length > 0 }
  );

  const handleSearch = async () => {
    if (!query.trim()) return;
    setHasSearched(true);
  };

  const results = searchMutation.data;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Advanced Search</h1>
        <p className="text-gray-600">Search across sessions, messages, and tools with advanced filters</p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Search Filters</CardTitle>
          <CardDescription>Enter your search query and apply filters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Query Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Search Query</label>
            <div className="relative">
              <Input
                placeholder="Search sessions, messages, or tools..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pr-10"
              />
              {suggestionQuery.data && suggestionQuery.data.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md mt-1 shadow-lg z-10">
                  {suggestionQuery.data.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => setQuery(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Search Type</label>
            <div className="flex gap-2">
              {(["all", "sessions", "messages", "tools"] as const).map((type) => (
                <Button
                  key={type}
                  variant={searchType === type ? "default" : "outline"}
                  onClick={() => setSearchType(type)}
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          {/* Search Button */}
          <Button onClick={handleSearch} disabled={!query.trim()} className="w-full">
            Search
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && results && (
        <div className="space-y-4">
          {/* Sessions Results */}
          {results.sessions && results.sessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sessions ({results.sessions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.sessions.map((session: any) => (
                    <div key={session.id} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{session.sessionName}</p>
                          <p className="text-sm text-gray-600">
                            Created: {format(new Date(session.createdAt), "MMM dd, yyyy HH:mm")}
                          </p>
                        </div>
                        <Badge className="bg-blue-500">{session.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Messages Results */}
          {results.messages && results.messages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Messages ({results.messages.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.messages.map((message: any) => (
                    <div key={message.id} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Badge className={message.role === "user" ? "bg-green-500" : "bg-purple-500"}>
                            {message.role}
                          </Badge>
                          <p className="mt-2 text-sm line-clamp-2">{message.content}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {format(new Date(message.createdAt), "MMM dd, yyyy HH:mm")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tools Results */}
          {results.tools && results.tools.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tools ({results.tools.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.tools.map((tool: any) => (
                    <div key={tool.id} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{tool.toolName}</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(tool.createdAt), "MMM dd, yyyy HH:mm")}
                          </p>
                        </div>
                        <Badge className="bg-orange-500">Tool</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Results */}
          {(!results.sessions || results.sessions.length === 0) &&
            (!results.messages || results.messages.length === 0) &&
            (!results.tools || results.tools.length === 0) && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600">No results found for "{query}"</p>
                </CardContent>
              </Card>
            )}
        </div>
      )}
    </div>
  );
}
