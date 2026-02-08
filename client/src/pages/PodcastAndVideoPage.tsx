import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Calendar, User, Eye } from 'lucide-react';

export default function PodcastAndVideoPage() {
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null);

  const { data: podcasts } = trpc.podcastPlayback.getPodcasts.useQuery();
  const { data: videos } = trpc.podcastPlayback.getVideos.useQuery();
  const { data: episodeDetails } = trpc.podcastPlayback.getEpisodeDetails.useQuery(
    { episodeId: selectedEpisode || '' },
    { enabled: !!selectedEpisode }
  );

  const playMutation = trpc.podcastPlayback.playEpisode.useMutation();

  const handlePlay = async (episodeId: string) => {
    setSelectedEpisode(episodeId);
    await playMutation.mutateAsync({ episodeId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Podcasts & Videos</h1>
          <p className="text-slate-300">Discover and stream your favorite content</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="podcasts" className="w-full">
          <TabsList className="bg-slate-800 border-slate-700 mb-6">
            <TabsTrigger value="podcasts" className="text-slate-300 data-[state=active]:text-white">
              Podcasts
            </TabsTrigger>
            <TabsTrigger value="videos" className="text-slate-300 data-[state=active]:text-white">
              Videos
            </TabsTrigger>
          </TabsList>

          {/* Podcasts Tab */}
          <TabsContent value="podcasts" className="space-y-6">
            {selectedEpisode && episodeDetails && (
              <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
                <div className="flex gap-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {episodeDetails.title}
                    </h2>
                    <p className="text-slate-300 mb-4">{episodeDetails.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{episodeDetails.host}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(episodeDetails.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button className="mt-4 bg-purple-500 hover:bg-purple-600">
                      <Play className="w-4 h-4 mr-2" />
                      Play Episode
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {podcasts?.map((podcast) => (
                <Card
                  key={podcast.id}
                  className="bg-slate-800 border-slate-700 hover:border-purple-500 cursor-pointer transition-all overflow-hidden group"
                  onClick={() => handlePlay(podcast.id)}
                >
                  <div className="relative h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all flex items-center justify-center">
                      <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white mb-2 line-clamp-2">{podcast.title}</h3>
                    <p className="text-sm text-slate-400 mb-3 line-clamp-2">{podcast.description}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{podcast.duration} min</span>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{podcast.views || 0}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos?.map((video) => (
                <Card
                  key={video.id}
                  className="bg-slate-800 border-slate-700 hover:border-blue-500 cursor-pointer transition-all overflow-hidden group"
                >
                  <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all flex items-center justify-center">
                      <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white mb-2 line-clamp-2">{video.title}</h3>
                    <p className="text-sm text-slate-400 mb-3 line-clamp-2">{video.description}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{video.duration} min</span>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{video.views || 0}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
