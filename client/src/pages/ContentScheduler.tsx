import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import {
  Radio, Clock, Zap, AlertTriangle, Play,
  Calendar, Users, Activity, Volume2, ChevronRight,
  RefreshCw, Shield, Wifi, GripVertical, ArrowUpDown,
  Check, X, Edit2, Trash2, Plus,
} from 'lucide-react';
import { toast } from 'sonner';

import { QumusStreamScheduler } from '@/components/QumusStreamScheduler';

import { TrendingPromotionPanel } from '@/components/TrendingPromotionPanel';
import { TrendingUp } from 'lucide-react';

type TabId = 'channels' | 'schedule' | 'emergency' | 'audio-streams' | 'trending';

interface DragState {
  draggedId: string | null;
  dragOverId: string | null;
  dragStartY: number;
}

export default function ContentScheduler() {
  const [activeTab, setActiveTab] = useState<TabId>('channels');
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [dragState, setDragState] = useState<DragState>({
    draggedId: null,
    dragOverId: null,
    dragStartY: 0,
  });
  const dragRef = useRef<HTMLDivElement | null>(null);

  const statusQuery = trpc.contentScheduler.getStatus.useQuery(undefined, {
    refetchInterval: 10000,
  });
  const channelsQuery = trpc.contentScheduler.getChannels.useQuery();
  const slotsQuery = trpc.contentScheduler.getSlots.useQuery();
  const currentSlotsQuery = trpc.contentScheduler.getCurrentSlots.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const rotateMutation = trpc.contentScheduler.rotateContent.useMutation({
    onSuccess: (data) => {
      toast.success(`Content Rotated: ${data.rotated} channel(s) updated`, {
        description: data.channels.join(', ') || 'No changes needed',
      });
      channelsQuery.refetch();
    },
  });

  const emergencyMutation = trpc.contentScheduler.emergencyOverride.useMutation({
    onSuccess: () => {
      toast.error('Emergency Override Active', {
        description: 'Emergency broadcast has been triggered on the selected channel.',
      });
      channelsQuery.refetch();
    },
  });

  const moveSlotMutation = trpc.contentScheduler.moveSlot.useMutation({
    onSuccess: (data) => {
      toast.success('Schedule Updated', {
        description: `"${data.title}" moved to ${data.startTime} - ${data.endTime}`,
      });
      slotsQuery.refetch();
      setEditingSlot(null);
    },
    onError: (err) => {
      toast.error('Failed to move slot', { description: err.message });
    },
  });

  const reorderMutation = trpc.contentScheduler.reorderSlots.useMutation({
    onSuccess: () => {
      toast.success('Priority Reordered', {
        description: 'Schedule priorities updated via drag-and-drop',
      });
      slotsQuery.refetch();
    },
  });

  const deleteSlotMutation = trpc.contentScheduler.deleteSlot.useMutation({
    onSuccess: () => {
      toast.success('Slot Deleted');
      slotsQuery.refetch();
    },
  });

  const status = statusQuery.data;
  const channels = channelsQuery.data || [];
  const slots = slotsQuery.data || [];
  const currentSlots = currentSlotsQuery.data || [];

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'channels', label: 'Channels', icon: <Radio className="w-4 h-4" /> },
    { id: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
    { id: 'emergency', label: 'Emergency', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'audio-streams', label: 'Audio Streams', icon: <Volume2 className="w-4 h-4" /> },
    { id: 'trending', label: 'Trending Promotions', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const formatUptime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${mins}m`;
  };

  const getContentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      radio: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      podcast: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      audiobook: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      commercial: 'bg-green-500/20 text-green-400 border-green-500/30',
      emergency: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getChannelStatusColor = (s: string) => {
    if (s === 'active') return 'bg-emerald-500/20 text-emerald-400';
    if (s === 'maintenance') return 'bg-amber-500/20 text-amber-400';
    return 'bg-gray-500/20 text-gray-400';
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Drag-and-drop handlers
  const handleDragStart = useCallback((slotId: string, e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragState({ draggedId: slotId, dragOverId: null, dragStartY: clientY });
  }, []);

  const handleDragOver = useCallback((slotId: string) => {
    setDragState(prev => {
      if (prev.draggedId && prev.draggedId !== slotId) {
        return { ...prev, dragOverId: slotId };
      }
      return prev;
    });
  }, []);

  const handleDragEnd = useCallback((blockSlots: typeof slots) => {
    if (dragState.draggedId && dragState.dragOverId) {
      const slotIds = blockSlots.map(s => s.id);
      const fromIndex = slotIds.indexOf(dragState.draggedId);
      const toIndex = slotIds.indexOf(dragState.dragOverId);
      if (fromIndex !== -1 && toIndex !== -1) {
        const reordered = [...slotIds];
        const [moved] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, moved);
        reorderMutation.mutate(reordered);
      }
    }
    setDragState({ draggedId: null, dragOverId: null, dragStartY: 0 });
  }, [dragState, reorderMutation]);

  const startEditing = (slot: { id: string; startTime: string; endTime: string }) => {
    setEditingSlot(slot.id);
    setEditStartTime(slot.startTime);
    setEditEndTime(slot.endTime);
  };

  const saveEdit = (slotId: string) => {
    moveSlotMutation.mutate({
      slotId,
      newStartTime: editStartTime,
      newEndTime: editEndTime,
    });
  };

  const getTimeBlockSlots = (block: string) => {
    return slots.filter(s => {
      const hour = parseInt(s.startTime.split(':')[0]);
      if (block === 'topOfTheSol') return hour >= 6 && hour < 12 && s.daysOfWeek.some(d => d >= 1 && d <= 5);
      if (block === 'afternoon') return hour >= 12 && hour < 18;
      if (block === 'evening') return hour >= 18;
      if (block === 'overnight') return hour >= 0 && hour < 6;
      if (block === 'weekend') return s.daysOfWeek.includes(0) || s.daysOfWeek.includes(6);
      return false;
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const timeBlocks = [
    { key: 'topOfTheSol', label: 'Top of the Sol (6-12)', icon: '🌅' },
    { key: 'afternoon', label: 'Afternoon (12-18)', icon: '☀️' },
    { key: 'evening', label: 'Evening (18-24)', icon: '🌙' },
    { key: 'overnight', label: 'Overnight (0-6)', icon: '🌃' },
    { key: 'weekend', label: 'Weekend Specials', icon: '🎉' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-lg border-b border-white/10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold">Content Scheduler</h1>
                <p className="text-[10px] text-gray-400">QUMUS 24/7 Automation</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {status?.isRunning && (
                <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] border-emerald-500/30">
                  <Wifi className="w-3 h-3 mr-1" /> LIVE
                </Badge>
              )}
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-white/20"
                onClick={() => rotateMutation.mutate()}
                disabled={rotateMutation.isPending}
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${rotateMutation.isPending ? 'animate-spin' : ''}`} />
                Rotate
              </Button>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        {status && (
          <div className="px-4 py-2 border-t border-white/5 flex gap-4 text-[10px] text-gray-400 overflow-x-auto">
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Activity className="w-3 h-3 text-cyan-400" />
              {status.activeChannels} channels
            </span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Calendar className="w-3 h-3 text-purple-400" />
              {status.totalSlots} slots
            </span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Clock className="w-3 h-3 text-amber-400" />
              {formatUptime(status.uptime)}
            </span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Shield className="w-3 h-3 text-emerald-400" />
              {status.autonomyLevel}% auto
            </span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-t border-white/5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 pb-24">
        {/* Channels Tab */}
        {activeTab === 'channels' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-300">Active Channels</h2>
              <Badge variant="outline" className="text-[10px] border-white/20 text-gray-400">
                {channels.filter(c => c.status === 'active').length} / {channels.length}
              </Badge>
            </div>

            {/* Now Playing */}
            {currentSlots.length > 0 && (
              <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-xs text-cyan-400 flex items-center gap-1">
                    <Play className="w-3 h-3" /> Now Playing
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 space-y-2">
                  {currentSlots.map(slot => (
                    <div key={slot.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-medium">{slot.title}</span>
                      </div>
                      <Badge className={`text-[10px] ${getContentTypeColor(slot.contentType)}`}>
                        {slot.contentType}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {channels.map(channel => (
              <Card key={channel.id} className="bg-gray-900/50 border-white/10 hover:border-white/20 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        channel.type === 'radio' ? 'bg-blue-500/20' :
                        channel.type === 'podcast' ? 'bg-purple-500/20' :
                        channel.type === 'emergency' ? 'bg-red-500/20' :
                        'bg-cyan-500/20'
                      }`}>
                        {channel.type === 'radio' ? <Radio className="w-5 h-5 text-blue-400" /> :
                         channel.type === 'podcast' ? <Volume2 className="w-5 h-5 text-purple-400" /> :
                         channel.type === 'emergency' ? <AlertTriangle className="w-5 h-5 text-red-400" /> :
                         <Play className="w-5 h-5 text-cyan-400" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{channel.name}</h3>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {channel.currentContent || 'No content scheduled'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={`text-[10px] ${getChannelStatusColor(channel.status)}`}>
                        {channel.status}
                      </Badge>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {channel.listeners.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Schedule Tab with Drag-and-Drop */}
        {activeTab === 'schedule' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-300">Schedule Slots</h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] border-white/20 text-gray-400">
                  <ArrowUpDown className="w-3 h-3 mr-1" />
                  Drag to reorder
                </Badge>
                <Badge variant="outline" className="text-[10px] border-white/20 text-gray-400">
                  {slots.filter(s => s.isActive).length} active
                </Badge>
              </div>
            </div>

            {timeBlocks.map(block => {
              const blockSlots = getTimeBlockSlots(block.key);
              if (blockSlots.length === 0) return null;

              return (
                <div key={block.key}>
                  <h3 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                    <span>{block.icon}</span>
                    <Clock className="w-3 h-3" /> {block.label}
                  </h3>

                  <div className="space-y-2" ref={dragRef}>
                    {blockSlots.map(slot => {
                      const isDragged = dragState.draggedId === slot.id;
                      const isDragOver = dragState.dragOverId === slot.id;
                      const isEditing = editingSlot === slot.id;

                      return (
                        <Card
                          key={slot.id}
                          className={`bg-gray-900/50 border-white/10 transition-all duration-200 ${
                            isDragged ? 'opacity-50 scale-95 border-cyan-500/50' : ''
                          } ${isDragOver ? 'border-cyan-400/60 bg-cyan-500/5 scale-[1.02]' : ''}`}
                          onMouseEnter={() => handleDragOver(slot.id)}
                          onTouchMove={(e) => {
                            const touch = e.touches[0];
                            const el = document.elementFromPoint(touch.clientX, touch.clientY);
                            const card = el?.closest('[data-slot-id]');
                            if (card) {
                              const id = card.getAttribute('data-slot-id');
                              if (id) handleDragOver(id);
                            }
                          }}
                          data-slot-id={slot.id}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                              {/* Drag Handle */}
                              <div
                                className="cursor-grab active:cursor-grabbing touch-none p-1 -ml-1 rounded hover:bg-white/10 transition-colors"
                                onMouseDown={(e) => handleDragStart(slot.id, e)}
                                onMouseUp={() => handleDragEnd(blockSlots)}
                                onTouchStart={(e) => handleDragStart(slot.id, e)}
                                onTouchEnd={() => handleDragEnd(blockSlots)}
                                role="button"
                                aria-label={`Drag to reorder ${slot.title}`}
                                tabIndex={0}
                              >
                                <GripVertical className="w-4 h-4 text-gray-600" />
                              </div>

                              {/* Active indicator */}
                              <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${
                                slot.isActive ? 'bg-emerald-500' : 'bg-gray-600'
                              }`} />

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                {isEditing ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="time"
                                      value={editStartTime}
                                      onChange={(e) => setEditStartTime(e.target.value)}
                                      className="bg-gray-800 border border-white/20 rounded px-2 py-1 text-xs w-24 text-white"
                                    />
                                    <span className="text-gray-500 text-xs">-</span>
                                    <input
                                      type="time"
                                      value={editEndTime}
                                      onChange={(e) => setEditEndTime(e.target.value)}
                                      className="bg-gray-800 border border-white/20 rounded px-2 py-1 text-xs w-24 text-white"
                                    />
                                    <Button
                                      size="sm"
                                      className="h-6 w-6 p-0 bg-emerald-600 hover:bg-emerald-700"
                                      onClick={() => saveEdit(slot.id)}
                                      disabled={moveSlotMutation.isPending}
                                    >
                                      <Check className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 text-gray-400"
                                      onClick={() => setEditingSlot(null)}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-xs font-medium truncate">{slot.title}</p>
                                    <p className="text-[10px] text-gray-500">
                                      {slot.startTime} - {slot.endTime} | {slot.daysOfWeek.map(d => dayNames[d]).join(', ')}
                                    </p>
                                  </>
                                )}
                              </div>

                              {/* Actions */}
                              {!isEditing && (
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <Badge className={`text-[10px] ${getContentTypeColor(slot.contentType)}`}>
                                    {slot.contentType}
                                  </Badge>
                                  <span className="text-[10px] text-gray-500 font-mono">P{slot.priority}</span>
                                  <button
                                    onClick={() => startEditing(slot)}
                                    className="p-1 rounded hover:bg-white/10 transition-colors text-gray-500 hover:text-cyan-400"
                                    aria-label={`Edit ${slot.title}`}
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Delete "${slot.title}"?`)) {
                                        deleteSlotMutation.mutate(slot.id);
                                      }
                                    }}
                                    className="p-1 rounded hover:bg-red-500/20 transition-colors text-gray-500 hover:text-red-400"
                                    aria-label={`Delete ${slot.title}`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Emergency Tab */}
        {activeTab === 'emergency' && (
          <div className="space-y-4">
            <Card className="bg-red-500/5 border-red-500/20">
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-sm text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Emergency Broadcast Override
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <p className="text-[11px] text-gray-400">
                  Trigger an emergency override on any channel. This will immediately replace the current content
                  with the emergency broadcast message.
                </p>

                {channels.filter(c => c.status === 'active').map(channel => (
                  <div key={channel.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-900/50 border border-white/5">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-gray-400" />
                      <span className="text-xs">{channel.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-6 text-[10px] px-2"
                      onClick={() => emergencyMutation.mutate({
                        channelId: channel.id,
                        message: 'Emergency Alert - Stand By for Important Information',
                      })}
                      disabled={emergencyMutation.isPending}
                    >
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Override
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-white/10">
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-xs text-gray-400">Emergency Levels</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {[
                  { level: 'Low', color: 'bg-blue-500/20 text-blue-400', desc: 'Information advisory' },
                  { level: 'Medium', color: 'bg-amber-500/20 text-amber-400', desc: 'Weather warning, service disruption' },
                  { level: 'High', color: 'bg-orange-500/20 text-orange-400', desc: 'Severe weather, evacuation notice' },
                  { level: 'Critical', color: 'bg-red-500/20 text-red-400', desc: 'Immediate danger, all-channel override' },
                ].map(item => (
                  <div key={item.level} className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50">
                    <Badge className={`text-[10px] ${item.color}`}>{item.level}</Badge>
                    <span className="text-[10px] text-gray-400">{item.desc}</span>
                    <ChevronRight className="w-3 h-3 text-gray-600 ml-auto" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Audio Streams Tab — QUMUS Autonomous Stream Scheduler */}
        {activeTab === 'audio-streams' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Volume2 className="w-5 h-5 text-cyan-400" />
              <div>
                <h2 className="text-lg font-bold text-white">QUMUS Audio Stream Scheduler</h2>
                <p className="text-xs text-gray-400">24/7 autonomous channel rotation across all Canryn Production subsidiaries</p>
              </div>
            </div>
            <QumusStreamScheduler />
          </div>
        )}

        {activeTab === 'trending' && (
          <TrendingPromotionPanel />
        )}
      </div>
    </div>
  );
}
