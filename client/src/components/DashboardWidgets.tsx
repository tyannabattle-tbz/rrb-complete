import { useState } from "react";
import { GripVertical, X, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

interface Widget {
  id: string;
  type: "recent_sessions" | "performance" | "team_activity" | "quick_stats" | "trending_tools";
  title: string;
  position: number;
  isVisible: boolean;
}

interface DashboardWidgetsProps {
  onWidgetChange?: (widgets: Widget[]) => void;
}

export default function DashboardWidgets({
  onWidgetChange,
}: DashboardWidgetsProps) {
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: "widget-1",
      type: "quick_stats",
      title: "Quick Stats",
      position: 0,
      isVisible: true,
    },
    {
      id: "widget-2",
      type: "recent_sessions",
      title: "Recent Sessions",
      position: 1,
      isVisible: true,
    },
    {
      id: "widget-3",
      type: "performance",
      title: "Performance",
      position: 2,
      isVisible: true,
    },
    {
      id: "widget-4",
      type: "team_activity",
      title: "Team Activity",
      position: 3,
      isVisible: false,
    },
    {
      id: "widget-5",
      type: "trending_tools",
      title: "Trending Tools",
      position: 4,
      isVisible: false,
    },
  ]);

  const [editMode, setEditMode] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  const visibleWidgets = widgets.filter((w) => w.isVisible).sort((a, b) => a.position - b.position);

  const handleToggleWidget = (id: string) => {
    const updatedWidgets = widgets.map((w) =>
      w.id === id ? { ...w, isVisible: !w.isVisible } : w
    );
    setWidgets(updatedWidgets);
    if (onWidgetChange) {
      onWidgetChange(updatedWidgets);
    }
    toast.success("Widget updated");
  };

  const handleRemoveWidget = (id: string) => {
    const updatedWidgets = widgets.map((w) =>
      w.id === id ? { ...w, isVisible: false } : w
    );
    setWidgets(updatedWidgets);
    if (onWidgetChange) {
      onWidgetChange(updatedWidgets);
    }
    toast.success("Widget removed");
  };

  const handleDragStart = (id: string) => {
    setDraggedWidget(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedWidget || draggedWidget === targetId) return;

    const draggedIndex = visibleWidgets.findIndex((w) => w.id === draggedWidget);
    const targetIndex = visibleWidgets.findIndex((w) => w.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newWidgets = [...widgets];
    const draggedWidget_ = newWidgets.find((w) => w.id === draggedWidget)!;
    const targetWidget = newWidgets.find((w) => w.id === targetId)!;

    [draggedWidget_.position, targetWidget.position] = [
      targetWidget.position,
      draggedWidget_.position,
    ];

    setWidgets(newWidgets);
    setDraggedWidget(null);
    if (onWidgetChange) {
      onWidgetChange(newWidgets);
    }
    toast.success("Widget reordered");
  };

  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case "quick_stats":
        return (
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Sessions</p>
                <p className="text-2xl font-bold">142</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">92%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Time</p>
                <p className="text-2xl font-bold">2.3s</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tools Used</p>
                <p className="text-2xl font-bold">28</p>
              </div>
            </div>
          </Card>
        );

      case "recent_sessions":
        return (
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Recent Sessions</h3>
            <div className="space-y-2">
              {[
                { id: 42, name: "Data Analysis", time: "2h ago" },
                { id: 41, name: "API Testing", time: "4h ago" },
                { id: 40, name: "Performance Check", time: "1d ago" },
              ].map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-2 hover:bg-muted rounded"
                >
                  <div>
                    <p className="text-sm font-medium">{session.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Session #{session.id}
                    </p>
                  </div>
                  <Badge variant="secondary">{session.time}</Badge>
                </div>
              ))}
            </div>
          </Card>
        );

      case "performance":
        return (
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Performance Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={[
                  { day: "Mon", time: 2.1 },
                  { day: "Tue", time: 2.3 },
                  { day: "Wed", time: 2.0 },
                  { day: "Thu", time: 2.5 },
                  { day: "Fri", time: 2.2 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="time" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        );

      case "team_activity":
        return (
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Team Activity</h3>
            <div className="space-y-2">
              {[
                { user: "Alice", action: "Created session", time: "10m ago" },
                { user: "Bob", action: "Shared session", time: "25m ago" },
                { user: "Carol", action: "Commented", time: "1h ago" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-2">
                  <div>
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.action}
                    </p>
                  </div>
                  <Badge variant="outline">{activity.time}</Badge>
                </div>
              ))}
            </div>
          </Card>
        );

      case "trending_tools":
        return (
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Trending Tools</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={[
                  { name: "API", usage: 45 },
                  { name: "DB", usage: 38 },
                  { name: "Search", usage: 28 },
                  { name: "Files", usage: 15 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <Button
          onClick={() => setEditMode(!editMode)}
          variant={editMode ? "default" : "outline"}
          size="sm"
          className="gap-2"
        >
          <Settings size={14} />
          {editMode ? "Done" : "Customize"}
        </Button>
      </div>

      {/* Edit Mode */}
      {editMode && (
        <Card className="p-4 bg-muted/50">
          <h3 className="font-semibold mb-3">Available Widgets</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {widgets.map((widget) => (
              <Button
                key={widget.id}
                variant={widget.isVisible ? "default" : "outline"}
                size="sm"
                onClick={() => handleToggleWidget(widget.id)}
                className="justify-start"
              >
                <Plus size={14} className="mr-1" />
                {widget.title}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {visibleWidgets.map((widget) => (
          <div
            key={widget.id}
            draggable={editMode}
            onDragStart={() => handleDragStart(widget.id)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(widget.id)}
            className={`relative ${editMode ? "cursor-move opacity-75 hover:opacity-100" : ""}`}
          >
            {editMode && (
              <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
                <GripVertical size={16} className="text-muted-foreground" />
                <button
                  onClick={() => handleRemoveWidget(widget.id)}
                  className="p-1 hover:bg-red-100 rounded"
                >
                  <X size={14} className="text-red-600" />
                </button>
              </div>
            )}
            {renderWidget(widget)}
          </div>
        ))}
      </div>

      {visibleWidgets.length === 0 && (
        <Card className="p-8 text-center">
          <Settings size={32} className="mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No widgets selected</p>
          <p className="text-sm text-muted-foreground mt-1">
            Click "Customize" to add widgets
          </p>
        </Card>
      )}
    </div>
  );
}
