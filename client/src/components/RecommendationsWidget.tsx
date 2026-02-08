import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Play, Share2 } from 'lucide-react';

interface RecommendationsWidgetProps {
  userId: string;
  limit?: number;
}

export function RecommendationsWidget({
  userId,
  limit = 5,
}: RecommendationsWidgetProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const { data: recommendations, isLoading } = trpc.recommendations.getPersonalized.useQuery({
    userId,
    limit,
  });

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-700 rounded" />
          ))}
        </div>
      </Card>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700 p-6 text-center">
        <Star className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-slate-400">No recommendations yet</p>
        <p className="text-sm text-slate-500 mt-1">
          Start listening to get personalized recommendations
        </p>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          Recommended For You
        </h3>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <div
            key={rec.contentId}
            className="group p-3 bg-slate-700/50 rounded hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-amber-500 font-bold text-sm">#{index + 1}</span>
                  <span className="text-xs text-slate-400 px-2 py-1 bg-slate-600 rounded">
                    {Math.round(rec.score * 100)}% match
                  </span>
                </div>
                <h4 className="font-semibold text-white text-sm">
                  {rec.contentId}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {rec.reason}
                </p>
              </div>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 hover:bg-slate-600 rounded transition-colors">
                  <Play className="w-4 h-4 text-amber-500" />
                </button>
                <button className="p-2 hover:bg-slate-600 rounded transition-colors">
                  <Share2 className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        className="w-full mt-4 border-slate-600 text-slate-300 hover:text-white"
      >
        View All Recommendations
      </Button>
    </Card>
  );
}
