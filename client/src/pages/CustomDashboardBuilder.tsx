import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Save, Grid3x3, BarChart3, Bell, Activity } from 'lucide-react';

interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'alert' | 'activity';
  title: string;
  size: 'small' | 'medium' | 'large';
  config: any;
}

export default function CustomDashboardBuilder() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    {
      id: '1',
      type: 'metric',
      title: 'Active Decisions',
      size: 'small',
      config: { metric: 'decision_rate' },
    },
    {
      id: '2',
      type: 'chart',
      title: 'Decision Trends',
      size: 'large',
      config: { chartType: 'line' },
    },
  ]);

  const [editMode, setEditMode] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  const availableWidgets = [
    { type: 'metric', title: 'Metric Widget', icon: BarChart3 },
    { type: 'chart', title: 'Chart Widget', icon: BarChart3 },
    { type: 'alert', title: 'Alert Widget', icon: Bell },
    { type: 'activity', title: 'Activity Widget', icon: Activity },
  ];

  const addWidget = (type: string) => {
    const newWidget: DashboardWidget = {
      id: Date.now().toString(),
      type: type as any,
      title: `New ${type} Widget`,
      size: 'medium',
      config: {},
    };
    setWidgets([...widgets, newWidget]);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id));
  };

  const updateWidget = (id: string, updates: Partial<DashboardWidget>) => {
    setWidgets(widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  };

  const handleDragStart = (id: string) => {
    setDraggedWidget(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (draggedWidget && draggedWidget !== targetId) {
      const draggedIndex = widgets.findIndex((w) => w.id === draggedWidget);
      const targetIndex = widgets.findIndex((w) => w.id === targetId);
      const newWidgets = [...widgets];
      [newWidgets[draggedIndex], newWidgets[targetIndex]] = [newWidgets[targetIndex], newWidgets[draggedIndex]];
      setWidgets(newWidgets);
    }
    setDraggedWidget(null);
  };

  const getWidgetGridClass = (size: string) => {
    switch (size) {
      case 'small':
        return 'col-span-1';
      case 'large':
        return 'col-span-2';
      default:
        return 'col-span-1';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Dashboard Builder</h1>
            <p className="text-slate-600 dark:text-slate-400">Customize your QUMUS monitoring dashboard</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={editMode ? 'default' : 'outline'}
              onClick={() => setEditMode(!editMode)}
              className="gap-2"
            >
              <Grid3x3 className="w-4 h-4" />
              {editMode ? 'Done Editing' : 'Edit Dashboard'}
            </Button>
            <Button className="gap-2">
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>

        {/* Widget Library (Edit Mode) */}
        {editMode && (
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-6 mb-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Available Widgets</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableWidgets.map((widget) => {
                const Icon = widget.icon;
                return (
                  <button
                    key={widget.type}
                    onClick={() => addWidget(widget.type)}
                    className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors flex flex-col items-center gap-2"
                  >
                    <Icon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{widget.title}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className={`${getWidgetGridClass(widget.size)} ${editMode ? 'cursor-move' : ''}`}
              draggable={editMode}
              onDragStart={() => handleDragStart(widget.id)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(widget.id)}
            >
              <Card
                className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4 h-full ${
                  editMode ? 'border-2 border-dashed' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 dark:text-white">{widget.title}</h3>
                  {editMode && (
                    <button
                      onClick={() => removeWidget(widget.id)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Widget Content */}
                {widget.type === 'metric' && (
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">12,847</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">+12% from last week</p>
                  </div>
                )}

                {widget.type === 'chart' && (
                  <div className="h-32 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                    <p className="text-slate-500 dark:text-slate-400">Chart visualization</p>
                  </div>
                )}

                {widget.type === 'alert' && (
                  <div className="space-y-2">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ Service latency high
                    </div>
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded text-sm text-green-800 dark:text-green-200">
                      ✓ All systems operational
                    </div>
                  </div>
                )}

                {widget.type === 'activity' && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-700 dark:text-slate-300">Policy Decision</span>
                      <span className="text-slate-500 dark:text-slate-400">2 min ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700 dark:text-slate-300">Override Request</span>
                      <span className="text-slate-500 dark:text-slate-400">5 min ago</span>
                    </div>
                  </div>
                )}

                {/* Edit Controls */}
                {editMode && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Size</label>
                      <select
                        value={widget.size}
                        onChange={(e) => updateWidget(widget.id, { size: e.target.value as any })}
                        className="w-full mt-1 px-2 py-1 text-sm bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-white"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Title</label>
                      <input
                        type="text"
                        value={widget.title}
                        onChange={(e) => updateWidget(widget.id, { title: e.target.value })}
                        className="w-full mt-1 px-2 py-1 text-sm bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {widgets.length === 0 && (
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">No widgets on your dashboard yet</p>
            <Button onClick={() => setEditMode(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Widget
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
