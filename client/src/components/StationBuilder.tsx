import React, { useState } from 'react';
import { Plus, X, Edit2, Trash2, Share2, Heart, Radio, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';

type ContentType = 'talk' | 'music' | 'news' | 'meditation' | 'healing' | 'entertainment' | 'educational' | 'sports' | 'comedy' | 'mixed';

interface Station {
  id: number;
  name: string;
  description?: string;
  contentTypes: ContentType[];
  icon?: string;
  color?: string;
  isPublic: boolean;
  currentListeners: number;
}

const CONTENT_TYPE_OPTIONS: { value: ContentType; label: string; icon: string; color: string }[] = [
  { value: 'talk', label: 'Talk', icon: '🎙️', color: 'bg-blue-500' },
  { value: 'music', label: 'Music', icon: '🎵', color: 'bg-purple-500' },
  { value: 'news', label: 'News', icon: '📰', color: 'bg-red-500' },
  { value: 'meditation', label: 'Meditation', icon: '🧘', color: 'bg-green-500' },
  { value: 'healing', label: 'Healing', icon: '💚', color: 'bg-emerald-500' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬', color: 'bg-pink-500' },
  { value: 'educational', label: 'Educational', icon: '📚', color: 'bg-yellow-500' },
  { value: 'sports', label: 'Sports', icon: '⚽', color: 'bg-orange-500' },
  { value: 'comedy', label: 'Comedy', icon: '😄', color: 'bg-cyan-500' },
  { value: 'mixed', label: 'Mixed', icon: '🎪', color: 'bg-indigo-500' },
];

const STATION_ICONS = ['📻', '🎙️', '🎵', '🎧', '🔊', '📡', '🎼', '🎸', '🎹', '🎺'];
const STATION_COLORS = ['from-pink-600 to-orange-600', 'from-blue-600 to-cyan-600', 'from-purple-600 to-pink-600', 'from-green-600 to-emerald-600', 'from-yellow-600 to-orange-600'];

export const StationBuilder: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contentTypes: [] as ContentType[],
    icon: STATION_ICONS[0],
    color: STATION_COLORS[0],
    isPublic: false,
  });

  const utils = trpc.useUtils();
  const { data: stations, isLoading } = trpc.customStationBuilder.getUserStations.useQuery();
  const { data: templates } = trpc.customStationBuilder.getTemplates.useQuery();

  const createStationMutation = trpc.customStationBuilder.createStation.useMutation({
    onSuccess: () => {
      utils.customStationBuilder.getUserStations.invalidate();
      setIsCreateDialogOpen(false);
      resetForm();
    },
  });

  const updateStationMutation = trpc.customStationBuilder.updateStation.useMutation({
    onSuccess: () => {
      utils.customStationBuilder.getUserStations.invalidate();
      setIsEditMode(false);
      setSelectedStation(null);
      resetForm();
    },
  });

  const deleteStationMutation = trpc.customStationBuilder.deleteStation.useMutation({
    onSuccess: () => {
      utils.customStationBuilder.getUserStations.invalidate();
      setSelectedStation(null);
    },
  });

  const toggleFavoriteMutation = trpc.customStationBuilder.toggleFavorite.useMutation({
    onSuccess: () => {
      utils.customStationBuilder.getUserStations.invalidate();
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      contentTypes: [],
      icon: STATION_ICONS[0],
      color: STATION_COLORS[0],
      isPublic: false,
    });
  };

  const handleCreateStation = async () => {
    if (!formData.name || formData.contentTypes.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    createStationMutation.mutate({
      name: formData.name,
      description: formData.description,
      contentTypes: formData.contentTypes,
      icon: formData.icon,
      color: formData.color,
      isPublic: formData.isPublic,
    });
  };

  const handleUpdateStation = async () => {
    if (!selectedStation || !formData.name || formData.contentTypes.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    updateStationMutation.mutate({
      stationId: selectedStation.id,
      name: formData.name,
      description: formData.description,
      contentTypes: formData.contentTypes,
      icon: formData.icon,
      color: formData.color,
      isPublic: formData.isPublic,
    });
  };

  const handleDeleteStation = async () => {
    if (!selectedStation) return;
    if (confirm('Are you sure you want to delete this station?')) {
      deleteStationMutation.mutate({ stationId: selectedStation.id });
    }
  };

  const toggleContentType = (contentType: ContentType) => {
    setFormData({
      ...formData,
      contentTypes: formData.contentTypes.includes(contentType)
        ? formData.contentTypes.filter((ct) => ct !== contentType)
        : [...formData.contentTypes, contentType],
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-background">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Radio className="w-8 h-8 text-pink-500" />
              Station Builder
            </h1>
            <p className="text-muted-foreground mt-2">Create custom radio stations with your preferred content mix</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Station
          </Button>
        </div>

        {/* Templates Section */}
        {templates && templates.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Station Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template: any) => (
                <Card key={template.id} className="cursor-pointer hover:border-pink-500/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-3xl">{template.icon}</div>
                      <Badge variant="outline">{template.contentTypes.length} types</Badge>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.contentTypes.map((ct: ContentType) => {
                        const option = CONTENT_TYPE_OPTIONS.find((o) => o.value === ct);
                        return (
                          <Badge key={ct} variant="secondary" className="text-xs">
                            {option?.icon} {option?.label}
                          </Badge>
                        );
                      })}
                    </div>
                    <Button size="sm" className="w-full" variant="outline">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* User Stations */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Your Stations</h2>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading stations...</div>
          ) : stations && stations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stations.map((station: Station) => (
                <Card
                  key={station.id}
                  className="cursor-pointer hover:border-pink-500/50 transition-colors"
                  onClick={() => {
                    setSelectedStation(station);
                    setFormData({
                      name: station.name,
                      description: station.description || '',
                      contentTypes: station.contentTypes,
                      icon: station.icon || STATION_ICONS[0],
                      color: station.color || STATION_COLORS[0],
                      isPublic: station.isPublic,
                    });
                  }}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-3xl">{station.icon || '📻'}</div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavoriteMutation.mutate({
                              stationId: station.id,
                              isFavorite: true,
                            });
                          }}
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{station.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{station.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {station.contentTypes.map((ct) => {
                        const option = CONTENT_TYPE_OPTIONS.find((o) => o.value === ct);
                        return (
                          <Badge key={ct} variant="secondary" className="text-xs">
                            {option?.icon} {option?.label}
                          </Badge>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{station.currentListeners} listeners</span>
                      {station.isPublic && <Badge variant="outline">Public</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/50">
              <CardContent className="pt-6 text-center">
                <Radio className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No stations yet. Create your first station!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create/Edit Station Dialog */}
      <Dialog open={isCreateDialogOpen || isEditMode} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditMode(false);
          setSelectedStation(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Station' : 'Create New Station'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Station Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Station Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Morning Talk Show"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your station..."
                rows={3}
              />
            </div>

            {/* Content Types */}
            <div>
              <label className="block text-sm font-medium mb-3">Content Types *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {CONTENT_TYPE_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={formData.contentTypes.includes(option.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleContentType(option.value)}
                    className="justify-start"
                  >
                    <span className="mr-2">{option.icon}</span>
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Station Icon</label>
              <div className="flex gap-2 flex-wrap">
                {STATION_ICONS.map((icon) => (
                  <Button
                    key={icon}
                    variant={formData.icon === icon ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, icon })}
                    className="text-xl"
                  >
                    {icon}
                  </Button>
                ))}
              </div>
            </div>

            {/* Visibility */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isPublic" className="text-sm font-medium cursor-pointer">
                Make this station public (others can discover it)
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              {isEditMode && selectedStation ? (
                <>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteStation}
                    disabled={deleteStationMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsEditMode(false);
                    setSelectedStation(null);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateStation}
                    disabled={updateStationMutation.isPending}
                  >
                    {updateStationMutation.isPending ? 'Updating...' : 'Update Station'}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateStation}
                    disabled={createStationMutation.isPending}
                  >
                    {createStationMutation.isPending ? 'Creating...' : 'Create Station'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StationBuilder;
