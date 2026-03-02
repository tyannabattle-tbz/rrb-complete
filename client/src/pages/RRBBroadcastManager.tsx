/**
 * RRB Broadcast Manager
 * 
 * Complete broadcast management system:
 * - Schedule broadcasts 24/7
 * - Content upload and management
 * - Real-time streaming controls
 * - Broadcast templates
 * - Emergency broadcast capabilities
 */

import { useState } from "react";
import {
  FuturisticHeader,
  FuturisticGrid,
  FuturisticCard,
  FuturisticButton,
  FuturisticSection,
  FuturisticDivider,
  FuturisticBadge,
} from "@/components/FuturisticDesignSystem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Radio,
  Upload,
  Play,
  Square,
  Settings,
  AlertCircle,
  CheckCircle,
  Zap,
} from "lucide-react";

export default function RRBBroadcastManager() {
  const [activeTab, setActiveTab] = useState("schedule");
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastDescription, setBroadcastDescription] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [broadcastType, setBroadcastType] = useState("regular");
  const [contentFile, setContentFile] = useState<File | null>(null);

  const handleScheduleBroadcast = () => {
    console.log("Scheduling broadcast:", {
      title: broadcastTitle,
      date: scheduleDate,
      time: scheduleTime,
      duration,
      type: broadcastType,
    });
  };

  const handleContentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setContentFile(file);
    }
  };

  const upcomingBroadcasts = [
    {
      id: 1,
      title: "Morning Motivation Mix",
      date: "Today",
      time: "06:00 AM",
      duration: "2h",
      status: "scheduled",
    },
    {
      id: 2,
      title: "Healing Frequencies",
      date: "Today",
      time: "12:00 PM",
      duration: "1h",
      status: "scheduled",
    },
    {
      id: 3,
      title: "Evening Vibes",
      date: "Today",
      time: "06:00 PM",
      duration: "3h",
      status: "scheduled",
    },
  ];

  const broadcastTemplates = [
    { id: 1, name: "Morning Show", duration: "2h", description: "High energy morning content" },
    { id: 2, name: "Meditation Session", duration: "1h", description: "Healing frequencies" },
    { id: 3, name: "Community Spotlight", duration: "1.5h", description: "Local stories" },
    { id: 4, name: "Music Mix", duration: "3h", description: "Curated playlist" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <FuturisticHeader
          title="Broadcast Manager"
          subtitle="Schedule, manage, and broadcast 24/7 content"
          icon={<Radio className="w-8 h-8" />}
        />

        {/* Quick Stats */}
        <FuturisticGrid columns={3}>
          <FuturisticCard glow="cyan">
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Scheduled Today</p>
              <div className="text-3xl font-bold text-cyan-400">3</div>
              <FuturisticBadge variant="success">On Track</FuturisticBadge>
            </div>
          </FuturisticCard>

          <FuturisticCard glow="magenta">
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Content Files</p>
              <div className="text-3xl font-bold text-magenta-400">24</div>
              <FuturisticBadge variant="success">Ready</FuturisticBadge>
            </div>
          </FuturisticCard>

          <FuturisticCard glow="cyan">
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Broadcast Hours</p>
              <div className="text-3xl font-bold text-emerald-400">168</div>
              <FuturisticBadge variant="success">24/7 Coverage</FuturisticBadge>
            </div>
          </FuturisticCard>
        </FuturisticGrid>

        <FuturisticDivider animated />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-5 bg-slate-800/50 border border-slate-700 rounded-lg p-1">
            <TabsTrigger value="schedule" className="text-xs md:text-sm">
              <Calendar size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="text-xs md:text-sm">
              <Clock size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Upcoming</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs md:text-sm">
              <Radio size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="text-xs md:text-sm">
              <Upload size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs md:text-sm">
              <Settings size={16} className="mr-1 md:mr-2" />
              <span className="hidden md:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4">
            <FuturisticSection title="Schedule New Broadcast">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300">Broadcast Title</label>
                  <Input
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g., Morning Motivation Mix"
                    className="mt-2 bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300">Description</label>
                  <Textarea
                    value={broadcastDescription}
                    onChange={(e) => setBroadcastDescription(e.target.value)}
                    placeholder="Describe your broadcast content..."
                    className="mt-2 bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300">Date</label>
                    <Input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="mt-2 bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300">Time</label>
                    <Input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="mt-2 bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300">Duration (minutes)</label>
                    <Input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="60"
                      className="mt-2 bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300">Broadcast Type</label>
                    <Select value={broadcastType} onValueChange={setBroadcastType}>
                      <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="special">Special Event</SelectItem>
                        <SelectItem value="recurring">Recurring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <FuturisticButton
                  onClick={handleScheduleBroadcast}
                  variant="primary"
                  glow
                  className="w-full"
                >
                  <Calendar size={16} className="mr-2" />
                  Schedule Broadcast
                </FuturisticButton>
              </div>
            </FuturisticSection>
          </TabsContent>

          {/* Upcoming Tab */}
          <TabsContent value="upcoming" className="space-y-4">
            <FuturisticSection title="Upcoming Broadcasts">
              <div className="space-y-3">
                {upcomingBroadcasts.map((broadcast) => (
                  <FuturisticCard key={broadcast.id} glow="cyan">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-white">{broadcast.title}</p>
                        <p className="text-sm text-slate-400 mt-1">
                          {broadcast.date} at {broadcast.time} • {broadcast.duration}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <FuturisticButton variant="secondary" size="sm">
                          <Play size={14} />
                        </FuturisticButton>
                        <FuturisticButton variant="secondary" size="sm">
                          <Settings size={14} />
                        </FuturisticButton>
                      </div>
                    </div>
                  </FuturisticCard>
                ))}
              </div>
            </FuturisticSection>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <FuturisticSection title="Broadcast Templates">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {broadcastTemplates.map((template) => (
                  <FuturisticCard key={template.id} glow="magenta">
                    <div className="space-y-2">
                      <p className="font-semibold text-white">{template.name}</p>
                      <p className="text-sm text-slate-400">{template.description}</p>
                      <p className="text-xs text-slate-500">Duration: {template.duration}</p>
                      <FuturisticButton variant="secondary" className="w-full mt-2">
                        <Radio size={14} className="mr-2" />
                        Use Template
                      </FuturisticButton>
                    </div>
                  </FuturisticCard>
                ))}
              </div>
            </FuturisticSection>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <FuturisticSection title="Upload Content">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-cyan-400 transition-colors">
                  <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-slate-300 mb-2">Drag and drop your content here</p>
                  <p className="text-sm text-slate-500 mb-4">or</p>
                  <label>
                    <input
                      type="file"
                      onChange={handleContentUpload}
                      className="hidden"
                      accept="audio/*,video/*"
                    />
                    <Button className="bg-cyan-600 hover:bg-cyan-700">
                      <Upload size={16} className="mr-2" />
                      Browse Files
                    </Button>
                  </label>
                </div>

                {contentFile && (
                  <FuturisticCard glow="cyan">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-white">{contentFile.name}</p>
                        <p className="text-sm text-slate-400">
                          {(contentFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <CheckCircle className="text-green-400" size={24} />
                    </div>
                  </FuturisticCard>
                )}
              </div>
            </FuturisticSection>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <FuturisticSection title="Broadcast Settings">
              <p className="text-slate-400">Advanced broadcast settings coming soon...</p>
            </FuturisticSection>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
