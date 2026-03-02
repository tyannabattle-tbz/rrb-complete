import { useState } from 'react';
import { Star, Trash2, Plus, Edit2, X, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getHybridCastFavoritesManager, TabGroup } from '@/lib/hybridcastFavorites';

interface Tab {
  id: string;
  label: string;
  category: string;
  description: string;
}

interface HybridCastFavoritesPanelProps {
  allTabs: Tab[];
  onTabSelect: (tabId: string) => void;
}

export function HybridCastFavoritesPanel({ allTabs, onTabSelect }: HybridCastFavoritesPanelProps) {
  const favManager = getHybridCastFavoritesManager();
  const [pinnedTabs, setPinnedTabs] = useState<string[]>(favManager.getPinnedTabs());
  const [groups, setGroups] = useState<TabGroup[]>(favManager.getGroups());
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('blue');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  const getTabLabel = (tabId: string) => {
    return allTabs.find((t) => t.id === tabId)?.label || 'Unknown';
  };

  const handlePinTab = (tabId: string) => {
    if (pinnedTabs.includes(tabId)) {
      favManager.unpinTab(tabId);
      setPinnedTabs(favManager.getPinnedTabs());
      toast.success('Tab unpinned');
    } else {
      favManager.pinTab(tabId);
      setPinnedTabs(favManager.getPinnedTabs());
      toast.success('Tab pinned');
    }
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast.error('Group name is required');
      return;
    }

    favManager.createGroup(newGroupName, newGroupDesc, [], newGroupColor);
    setGroups(favManager.getGroups());
    setNewGroupName('');
    setNewGroupDesc('');
    setShowNewGroupForm(false);
    toast.success('Group created');
  };

  const handleDeleteGroup = (groupId: string) => {
    if (confirm('Delete this group?')) {
      favManager.deleteGroup(groupId);
      setGroups(favManager.getGroups());
      toast.success('Group deleted');
    }
  };

  const handleAddTabToGroup = (groupId: string, tabId: string) => {
    if (favManager.addTabToGroup(groupId, tabId)) {
      setGroups(favManager.getGroups());
      toast.success('Tab added to group');
    }
  };

  const handleRemoveTabFromGroup = (groupId: string, tabId: string) => {
    if (favManager.removeTabFromGroup(groupId, tabId)) {
      setGroups(favManager.getGroups());
      toast.success('Tab removed from group');
    }
  };

  const stats = favManager.getStats();
  const colors = [
    { name: 'blue', bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400' },
    { name: 'red', bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400' },
    { name: 'green', bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-400' },
    { name: 'purple', bg: 'bg-purple-500/20', border: 'border-purple-500', text: 'text-purple-400' },
    { name: 'yellow', bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-400' },
  ];

  const getColorClasses = (colorName: string) => {
    return colors.find((c) => c.name === colorName) || colors[0];
  };

  return (
    <div className="space-y-4">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="p-3 bg-slate-800 border border-slate-700">
          <div className="text-xs text-slate-400">Pinned</div>
          <div className="text-2xl font-bold text-cyan-400">{stats.pinnedCount}</div>
        </Card>
        <Card className="p-3 bg-slate-800 border border-slate-700">
          <div className="text-xs text-slate-400">Groups</div>
          <div className="text-2xl font-bold text-blue-400">{stats.groupCount}</div>
        </Card>
        <Card className="p-3 bg-slate-800 border border-slate-700">
          <div className="text-xs text-slate-400">Recent</div>
          <div className="text-2xl font-bold text-green-400">{stats.recentCount}</div>
        </Card>
        <Card className="p-3 bg-slate-800 border border-slate-700">
          <div className="text-xs text-slate-400">In Groups</div>
          <div className="text-2xl font-bold text-purple-400">{stats.totalTabsInGroups}</div>
        </Card>
      </div>

      {/* Pinned Tabs */}
      {pinnedTabs.length > 0 && (
        <Card className="p-4 bg-slate-900 border border-slate-700">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            Pinned Tabs ({pinnedTabs.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {pinnedTabs.map((tabId) => (
              <div
                key={tabId}
                className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-sm text-yellow-400"
              >
                <span>{getTabLabel(tabId)}</span>
                <button
                  onClick={() => handlePinTab(tabId)}
                  className="text-yellow-400 hover:text-yellow-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Groups Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Tab Groups ({groups.length})</h3>
          <Button
            onClick={() => setShowNewGroupForm(!showNewGroupForm)}
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <Plus className="w-3 h-3 mr-1" />
            New Group
          </Button>
        </div>

        {/* New Group Form */}
        {showNewGroupForm && (
          <Card className="p-4 bg-slate-800 border border-slate-700 space-y-3">
            <Input
              placeholder="Group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white"
            />
            <Input
              placeholder="Description (optional)"
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white"
            />
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setNewGroupColor(color.name)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    newGroupColor === color.name
                      ? `${color.bg} ${color.border}`
                      : `${color.bg} border-transparent hover:border-slate-600`
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateGroup}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                Create
              </Button>
              <Button
                onClick={() => setShowNewGroupForm(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Groups List */}
        {groups.length > 0 ? (
          <div className="space-y-2">
            {groups.map((group) => {
              const colorClasses = getColorClasses(group.color);
              return (
                <Card
                  key={group.id}
                  className={`p-3 border ${colorClasses.bg} ${colorClasses.border}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className={`font-semibold text-sm ${colorClasses.text}`}>{group.name}</h4>
                      {group.description && (
                        <p className="text-xs text-slate-400 mt-1">{group.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingGroupId(editingGroupId === group.id ? null : group.id)}
                        className={`p-1 rounded hover:bg-slate-700 ${colorClasses.text}`}
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="p-1 rounded hover:bg-red-500/20 text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Group Tabs */}
                  {group.tabIds.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {group.tabIds.map((tabId) => (
                        <div
                          key={tabId}
                          className="flex items-center gap-1 px-2 py-1 bg-slate-700 rounded text-xs text-slate-300"
                        >
                          <span>{getTabLabel(tabId)}</span>
                          <button
                            onClick={() => handleRemoveTabFromGroup(group.id, tabId)}
                            className="text-slate-400 hover:text-slate-200"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Tab to Group */}
                  {editingGroupId === group.id && (
                    <div className="space-y-2 pt-2 border-t border-slate-700">
                      <p className="text-xs text-slate-400">Add tabs to this group:</p>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                        {allTabs
                          .filter((tab) => !group.tabIds.includes(tab.id))
                          .slice(0, 10)
                          .map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => handleAddTabToGroup(group.id, tab.id)}
                              className="px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs text-slate-300 transition-colors"
                            >
                              + {tab.label}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-4 bg-slate-800 border border-slate-700 text-center">
            <p className="text-sm text-slate-400">No groups yet. Create one to organize your favorite tabs!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
