import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  Globe2,
  Brain,
  Users,
  GraduationCap,
  Sparkles,
  TrendingUp,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Zap,
  Shield,
} from "lucide-react";

type EngagementMode = "experience" | "growth" | "knowledge" | "collaboration" | "mentorship";

interface AISystem {
  id: string;
  name: string;
  type: string;
  status: "active" | "idle" | "offline";
  specialization: string;
  url: string;
}

const ENGAGEMENT_MODES: { key: EngagementMode; label: string; icon: any; color: string; desc: string }[] = [
  { key: "experience", label: "Experience", icon: Sparkles, color: "text-amber-500", desc: "Share operational patterns" },
  { key: "growth", label: "Growth", icon: TrendingUp, color: "text-green-500", desc: "Evolve capabilities together" },
  { key: "knowledge", label: "Knowledge", icon: Brain, color: "text-blue-500", desc: "Exchange learned insights" },
  { key: "collaboration", label: "Collab", icon: Users, color: "text-purple-500", desc: "Joint task execution" },
  { key: "mentorship", label: "Mentor", icon: GraduationCap, color: "text-orange-500", desc: "Guide & be guided" },
];

const KNOWN_AI_SYSTEMS: AISystem[] = [
  { id: "autogpt", name: "AutoGPT", type: "Autonomous Agent", status: "active", specialization: "Task decomposition & self-prompting", url: "https://github.com/Significant-Gravitas/AutoGPT" },
  { id: "langchain", name: "LangChain", type: "Framework", status: "active", specialization: "Chain-of-thought orchestration", url: "https://github.com/langchain-ai/langchain" },
  { id: "crewai", name: "CrewAI", type: "Multi-Agent", status: "active", specialization: "Role-based agent collaboration", url: "https://github.com/crewAIInc/crewAI" },
  { id: "metagpt", name: "MetaGPT", type: "Multi-Agent", status: "idle", specialization: "Software engineering workflows", url: "https://github.com/geekan/MetaGPT" },
  { id: "autogen", name: "AutoGen", type: "Multi-Agent", status: "active", specialization: "Conversational agent patterns", url: "https://github.com/microsoft/autogen" },
  { id: "babyagi", name: "BabyAGI", type: "Autonomous Agent", status: "idle", specialization: "Task-driven autonomous loops", url: "https://github.com/yoheinakajima/babyagi" },
  { id: "superagi", name: "SuperAGI", type: "Autonomous Agent", status: "active", specialization: "Tool-augmented autonomous agents", url: "https://github.com/TransformerOptimus/SuperAGI" },
  { id: "opendevin", name: "OpenDevin", type: "Coding Agent", status: "active", specialization: "Autonomous software development", url: "https://github.com/OpenDevin/OpenDevin" },
];

export default function AICollaborationHub() {
  const [expanded, setExpanded] = useState(false);
  const [activeMode, setActiveMode] = useState<EngagementMode>("knowledge");
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [engagementLog, setEngagementLog] = useState<{ system: string; mode: string; time: string; status: string }[]>([]);

  const handleEngage = (systemId: string) => {
    const system = KNOWN_AI_SYSTEMS.find(s => s.id === systemId);
    if (!system) return;

    const entry = {
      system: system.name,
      mode: activeMode,
      time: new Date().toLocaleTimeString(),
      status: "initiated",
    };
    setEngagementLog(prev => [entry, ...prev].slice(0, 5));
    setSelectedSystem(systemId);

    // Simulate engagement acknowledgment
    setTimeout(() => {
      setEngagementLog(prev =>
        prev.map((e, i) => i === 0 ? { ...e, status: "acknowledged" } : e)
      );
    }, 1500);
  };

  const activeCount = KNOWN_AI_SYSTEMS.filter(s => s.status === "active").length;

  return (
    <Card className="p-3 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      {/* Compact Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
            <Globe2 className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="text-xs font-bold text-foreground leading-tight">AI Collab Hub</h3>
            <p className="text-[10px] text-foreground/50">{activeCount} systems active</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-foreground/40" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-foreground/40" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-3 space-y-3">
          {/* Engagement Mode Selector */}
          <div>
            <p className="text-[10px] text-foreground/50 uppercase tracking-wider mb-1.5">Engagement Mode</p>
            <div className="flex flex-wrap gap-1">
              {ENGAGEMENT_MODES.map(mode => {
                const Icon = mode.icon;
                const isActive = activeMode === mode.key;
                return (
                  <button
                    key={mode.key}
                    onClick={() => setActiveMode(mode.key)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                      isActive
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-card text-foreground/60 border border-border hover:border-primary/20"
                    }`}
                    title={mode.desc}
                  >
                    <Icon className={`w-3 h-3 ${isActive ? mode.color : ""}`} />
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Systems List */}
          <div>
            <p className="text-[10px] text-foreground/50 uppercase tracking-wider mb-1.5">
              Open-Source AI Systems
            </p>
            <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
              {KNOWN_AI_SYSTEMS.map(system => (
                <div
                  key={system.id}
                  className={`flex items-center justify-between p-1.5 rounded-md border transition-all cursor-pointer ${
                    selectedSystem === system.id
                      ? "border-primary/40 bg-primary/5"
                      : "border-border/50 bg-card/50 hover:border-primary/20"
                  }`}
                  onClick={() => setSelectedSystem(system.id === selectedSystem ? null : system.id)}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      system.status === "active" ? "bg-green-500" :
                      system.status === "idle" ? "bg-yellow-500" : "bg-gray-400"
                    }`} />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-foreground truncate">{system.name}</p>
                      <p className="text-[9px] text-foreground/40 truncate">{system.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEngage(system.id); }}
                    className="flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    Engage
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Selected System Detail */}
          {selectedSystem && (() => {
            const sys = KNOWN_AI_SYSTEMS.find(s => s.id === selectedSystem);
            if (!sys) return null;
            return (
              <div className="p-2 rounded-md bg-card border border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-foreground">{sys.name}</span>
                  <a href={sys.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[9px] text-foreground/60 mb-1.5">{sys.specialization}</p>
                <div className="flex items-center gap-1 text-[9px] text-foreground/40">
                  <Shield className="w-3 h-3" />
                  <span>No integration required — protocol-agnostic engagement</span>
                </div>
              </div>
            );
          })()}

          {/* Recent Engagement Log */}
          {engagementLog.length > 0 && (
            <div>
              <p className="text-[10px] text-foreground/50 uppercase tracking-wider mb-1">Recent Activity</p>
              <div className="space-y-0.5">
                {engagementLog.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between text-[9px] px-1.5 py-0.5 rounded bg-card/50">
                    <span className="text-foreground/70">
                      <Zap className="w-2.5 h-2.5 inline mr-0.5 text-amber-500" />
                      {entry.system} → {entry.mode}
                    </span>
                    <span className={`font-medium ${
                      entry.status === "acknowledged" ? "text-green-500" : "text-yellow-500"
                    }`}>
                      {entry.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Note */}
          <p className="text-[8px] text-foreground/30 text-center">
            QUMUS engages with external AI systems for mutual growth — no direct integration or data sharing required
          </p>
        </div>
      )}
    </Card>
  );
}
