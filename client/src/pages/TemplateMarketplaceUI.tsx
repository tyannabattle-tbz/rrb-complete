import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star, Download, Search } from "lucide-react";
import { toast } from "sonner";

export default function TemplateMarketplaceUI() {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"rating" | "downloads" | "recent">("rating");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | undefined>();

  const { data: templates, isLoading } = trpc.templateMarketplace.browseTemplates.useQuery({
    page,
    limit: 12,
    sortBy,
    tag: selectedTag,
  });

  const { data: tags } = trpc.templateMarketplace.getPopularTags.useQuery();
  const { data: trending } = trpc.templateMarketplace.getTrendingTemplates.useQuery({ limit: 5 });

  const searchMutation = trpc.templateMarketplace.searchTemplates.useQuery(
    { query: searchQuery, limit: 10 },
    { enabled: false }
  );
  const rateMutation = trpc.templateMarketplace.rateTemplate.useMutation();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    toast.success("Search completed");
  };

  const handleRate = async (templateId: string, rating: number) => {
    try {
      await rateMutation.mutateAsync({ templateId, rating });
      toast.success(`Template rated ${rating} stars`);
    } catch (error) {
      toast.error("Failed to rate template");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Template Marketplace</h1>
        <p className="text-muted-foreground">Discover and use pre-built agent templates</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={searchMutation.isPending}>
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </form>

      {/* Trending Templates */}
      {trending && trending.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Trending Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {trending.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                  <CardDescription className="text-xs">{template.author}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-semibold">{template.rating}</span>
                    <span className="text-xs text-muted-foreground">({template.downloads} downloads)</span>
                  </div>
                  <Button size="sm" className="w-full" variant="outline">
                    <Download className="w-3 h-3 mr-1" />
                    Use
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Sort By</h3>
          <div className="flex gap-2">
            {(["rating", "downloads", "recent"] as const).map((sort) => (
              <Button
                key={sort}
                variant={sortBy === sort ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy(sort)}
              >
                {sort.charAt(0).toUpperCase() + sort.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {tags && tags.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 10).map(({ tag, count }: any) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTag(selectedTag === tag ? undefined : tag)}
                >
                  {tag} ({count})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Available Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates?.templates.map((template: any) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.author}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <p className="text-sm text-muted-foreground">{template.description}</p>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{template.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">({template.downloads} downloads)</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag: any) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-2 pt-2">
                    <Button className="w-full" variant="default">
                      <Download className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleRate(template.id, rating)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              rating <= Math.round(template.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {templates && templates.hasMore && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">Page {page}</span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={!templates.hasMore}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
