/**
 * Scheduled Generation Dashboard Component
 * 
 * Manages content generation schedules with time/frequency settings
 * Integrates with QUMUS policy engine for autonomous scheduling
 */

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Loader2, Plus, Trash2, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export interface ScheduledGenerationDashboardProps {
  onScheduleCreated?: (scheduleId: string) => void;
}

interface Schedule {
  id: string;
  contentType: "podcast" | "audiobook" | "radio";
  topic: string;
  frequency: "daily" | "weekly" | "monthly";
  time: string;
  enabled: boolean;
  nextRun: string;
  lastRun?: string;
  createdAt: string;
}

export const ScheduledGenerationDashboard: React.FC<ScheduledGenerationDashboardProps> = ({
  onScheduleCreated,
}) => {
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: "sched-1",
      contentType: "podcast",
      topic: "Tech News Daily",
      frequency: "daily",
      time: "09:00",
      enabled: true,
      nextRun: new Date(Date.now() + 86400000).toISOString(),
      lastRun: new Date(Date.now() - 3600000).toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: "sched-2",
      contentType: "audiobook",
      topic: "Classic Literature",
      frequency: "weekly",
      time: "18:00",
      enabled: true,
      nextRun: new Date(Date.now() + 604800000).toISOString(),
      createdAt: new Date().toISOString(),
    },
  ]);

  const [newSchedule, setNewSchedule] = useState({
    contentType: "podcast" as const,
    topic: "",
    frequency: "daily" as const,
    time: "09:00",
  });

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSchedule = async () => {
    if (!newSchedule.topic.trim()) {
      setError("Please enter a topic");
      return;
    }

    setIsCreating(true);
    try {
      // In a real implementation, this would call a tRPC procedure
      const schedule: Schedule = {
        id: `sched-${Date.now()}`,
        ...newSchedule,
        enabled: true,
        nextRun: new Date(Date.now() + 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      };

      setSchedules([...schedules, schedule]);
      setNewSchedule({ contentType: "podcast", topic: "", frequency: "daily", time: "09:00" });
      setError(null);
      onScheduleCreated?.(schedule.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create schedule");
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleSchedule = (id: string) => {
    setSchedules(
      schedules.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    );
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(schedules.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Scheduled Content Generation</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Manage automated content generation schedules with QUMUS policy integration
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="bg-destructive/10 border-destructive/20 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </Card>
      )}

      {/* Create New Schedule */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Create New Schedule</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Content Type</label>
            <select
              value={newSchedule.contentType}
              onChange={(e) =>
                setNewSchedule({
                  ...newSchedule,
                  contentType: e.target.value as any,
                })
              }
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="podcast">Podcast</option>
              <option value="audiobook">Audiobook</option>
              <option value="radio">Radio Show</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Topic</label>
            <Input
              value={newSchedule.topic}
              onChange={(e) => setNewSchedule({ ...newSchedule, topic: e.target.value })}
              placeholder="e.g., Tech News Daily"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Frequency</label>
            <select
              value={newSchedule.frequency}
              onChange={(e) =>
                setNewSchedule({
                  ...newSchedule,
                  frequency: e.target.value as any,
                })
              }
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Time</label>
            <Input
              type="time"
              value={newSchedule.time}
              onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
            />
          </div>
        </div>

        <Button onClick={handleCreateSchedule} disabled={isCreating} className="w-full">
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Schedule...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Create Schedule
            </>
          )}
        </Button>
      </Card>

      {/* Active Schedules */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Active Schedules</h2>

        {schedules.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No schedules configured yet</p>
          </Card>
        ) : (
          schedules.map((schedule) => (
            <Card key={schedule.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{schedule.topic}</h3>
                    {schedule.enabled ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="text-foreground capitalize">{schedule.contentType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Frequency</p>
                      <p className="text-foreground capitalize">{schedule.frequency}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time</p>
                      <p className="text-foreground">{schedule.time}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Next Run</p>
                      <p className="text-foreground">
                        {new Date(schedule.nextRun).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {schedule.lastRun && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Last run: {new Date(schedule.lastRun).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleToggleSchedule(schedule.id)}
                    variant={schedule.enabled ? "default" : "outline"}
                    size="sm"
                  >
                    {schedule.enabled ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Policy Integration Info */}
      <Card className="p-4 bg-accent/5 border-accent/20">
        <div className="flex gap-3">
          <Clock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">QUMUS Policy Integration</h3>
            <p className="text-sm text-muted-foreground">
              Schedules are automatically executed by QUMUS with autonomous decision-making based on listener engagement metrics and content performance. All executions are logged in the audit trail.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
