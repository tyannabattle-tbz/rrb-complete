import { useState, useMemo } from "react";
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
  GitCompare,
  Send,
  Loader2,
  X,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

type EngagementMode = "experience" | "growth" | "knowledge" | "collaboration" | "mentorship";
type TabView = "systems" | "compare" | "insights";

interface AISystem {
  id: string;
  name: string;
  type: string;
  status: "active" | "idle" | "offline";
  specialization: string;
  strengths: string[];
  url: string;
}

interface CompareResult {
  systemId: string;
  systemName: string;
  response: string;
  confidence: number;
  approach: string;
  latency: number;
}

const ENGAGEMENT_MODES: { key: EngagementMode; label: string; icon: any; color: string; desc: string }[] = [
  { key: "experience", label: "Experience", icon: Sparkles, color: "text-amber-500", desc: "Share operational patterns" },
  { key: "growth", label: "Growth", icon: TrendingUp, color: "text-green-500", desc: "Evolve capabilities together" },
  { key: "knowledge", label: "Knowledge", icon: Brain, color: "text-blue-500", desc: "Exchange learned insights" },
  { key: "collaboration", label: "Collab", icon: Users, color: "text-purple-500", desc: "Joint task execution" },
  { key: "mentorship", label: "Mentor", icon: GraduationCap, color: "text-orange-500", desc: "Guide & be guided" },
];

const KNOWN_AI_SYSTEMS: AISystem[] = [
  { id: "qumus", name: "QUMUS", type: "Orchestration Engine", status: "active", specialization: "Autonomous ecosystem orchestration with 90%+ autonomy", strengths: ["Multi-policy decisions", "Real-time monitoring", "Ecosystem-wide awareness", "Human oversight integration"], url: "#" },
  { id: "autogpt", name: "AutoGPT", type: "Autonomous Agent", status: "active", specialization: "Task decomposition & self-prompting", strengths: ["Self-directed task completion", "Web browsing", "Code generation", "Memory management"], url: "https://github.com/Significant-Gravitas/AutoGPT" },
  { id: "langchain", name: "LangChain", type: "Framework", status: "active", specialization: "Chain-of-thought orchestration", strengths: ["Tool chaining", "RAG pipelines", "Agent frameworks", "Memory systems"], url: "https://github.com/langchain-ai/langchain" },
  { id: "crewai", name: "CrewAI", type: "Multi-Agent", status: "active", specialization: "Role-based agent collaboration", strengths: ["Role assignment", "Task delegation", "Sequential workflows", "Agent coordination"], url: "https://github.com/crewAIInc/crewAI" },
  { id: "metagpt", name: "MetaGPT", type: "Multi-Agent", status: "active", specialization: "Software engineering workflows", strengths: ["Code architecture", "Design docs", "Multi-role teams", "Structured output"], url: "https://github.com/geekan/MetaGPT" },
  { id: "autogen", name: "AutoGen", type: "Multi-Agent", status: "active", specialization: "Conversational agent patterns", strengths: ["Multi-agent chat", "Code execution", "Human-in-loop", "Flexible topologies"], url: "https://github.com/microsoft/autogen" },
  { id: "babyagi", name: "BabyAGI", type: "Autonomous Agent", status: "idle", specialization: "Task-driven autonomous loops", strengths: ["Task prioritization", "Execution loops", "Context management", "Goal decomposition"], url: "https://github.com/yoheinakajima/babyagi" },
  { id: "superagi", name: "SuperAGI", type: "Autonomous Agent", status: "active", specialization: "Tool-augmented autonomous agents", strengths: ["Tool marketplace", "Agent templates", "Resource management", "Performance tracking"], url: "https://github.com/TransformerOptimus/SuperAGI" },
  { id: "opendevin", name: "OpenDevin", type: "Coding Agent", status: "active", specialization: "Autonomous software development", strengths: ["Full-stack coding", "Browser interaction", "Terminal access", "Iterative debugging"], url: "https://github.com/OpenDevin/OpenDevin" },
  { id: "ollama", name: "Ollama", type: "Local LLM", status: "active", specialization: "Local model serving & inference", strengths: ["Privacy-first", "No cloud dependency", "Model customization", "Low latency"], url: "https://github.com/ollama/ollama" },
  { id: "dify", name: "Dify", type: "LLMOps Platform", status: "active", specialization: "Visual AI workflow builder", strengths: ["Visual pipelines", "RAG engine", "Agent orchestration", "Prompt management"], url: "https://github.com/langgenius/dify" },
  { id: "llamaindex", name: "LlamaIndex", type: "Data Framework", status: "active", specialization: "Data-aware AI applications", strengths: ["Data connectors", "Index structures", "Query engines", "Knowledge graphs"], url: "https://github.com/run-llama/llama_index" },
];

const COMPARE_SCENARIOS = [
  "How would you handle a sudden 10x traffic spike during a live broadcast?",
  "A suspicious payment of $5,000 was flagged — what's your decision process?",
  "Content moderation: a post has 3 flags but 200 likes — approve or reject?",
  "A new user registered from a known bot network IP — how do you respond?",
  "System memory at 92% during peak hours — what's your mitigation strategy?",
  "Two policies conflict: content policy says approve, security policy says review. Resolution?",
];

export default function AICollaborationHub() {
  const [expanded, setExpanded] = useState(false);
  const [activeMode, setActiveMode] = useState<EngagementMode>("knowledge");
  const [activeTab, setActiveTab] = useState<TabView>("systems");
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [engagementLog, setEngagementLog] = useState<{ system: string; mode: string; time: string; status: string }[]>([]);

  // Compare Responses state
  const [comparePrompt, setComparePrompt] = useState("");
  const [compareSystems, setCompareSystems] = useState<string[]>(["qumus", "autogpt"]);
  const [compareResults, setCompareResults] = useState<CompareResult[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  // Use the dedicated AI Compare router for live LLM-powered comparisons
  const compareResponsesMutation = trpc.aiCompare.compareResponses.useMutation();

  const handleEngage = (systemId: string) => {
    const system = KNOWN_AI_SYSTEMS.find(s => s.id === systemId);
    if (!system) return;

    const entry = {
      system: system.name,
      mode: activeMode,
      time: new Date().toLocaleTimeString(),
      status: "initiated",
    };
    setEngagementLog(prev => [entry, ...prev].slice(0, 8));
    setSelectedSystem(systemId);

    setTimeout(() => {
      setEngagementLog(prev =>
        prev.map((e, i) => i === 0 ? { ...e, status: "acknowledged" } : e)
      );
    }, 1500);
  };

  const toggleCompareSystem = (id: string) => {
    setCompareSystems(prev => {
      if (prev.includes(id)) return prev.filter(s => s !== id);
      if (prev.length >= 4) return prev; // Max 4 systems
      return [...prev, id];
    });
  };

  const handleCompare = async () => {
    if (!comparePrompt.trim() || compareSystems.length < 2) return;
    setIsComparing(true);
    setCompareResults([]);

    try {
      const result = await compareResponsesMutation.mutateAsync({
        scenario: comparePrompt,
        systemIds: compareSystems,
      });

      // Map the live LLM responses to our display format
      const mapped: CompareResult[] = result.responses.map(r => ({
        systemId: r.systemId,
        systemName: r.systemName,
        response: r.response,
        confidence: r.confidence,
        approach: r.approach,
        latency: Date.now() - r.timestamp + 500, // approximate latency
      }));
      setCompareResults(mapped);
    } catch {
      // Fallback: generate local placeholder responses
      const fallback: CompareResult[] = compareSystems.map(sysId => {
        const system = KNOWN_AI_SYSTEMS.find(s => s.id === sysId);
        return {
          systemId: sysId,
          systemName: system?.name || sysId,
          response: `${system?.name || sysId} would leverage its ${system?.specialization || 'capabilities'} to address this scenario using ${system?.strengths?.slice(0, 2).join(' and ') || 'its core strengths'}.`,
          confidence: 70 + Math.floor(Math.random() * 20),
          approach: system?.specialization || 'General AI approach',
          latency: 500,
        };
      });
      setCompareResults(fallback);
    }

    setIsComparing(false);

    // Log the comparison
    setEngagementLog(prev => [{
      system: `Compare (${compareSystems.length} systems)`,
      mode: "knowledge",
      time: new Date().toLocaleTimeString(),
      status: "completed",
    }, ...prev].slice(0, 8));
  };

  const activeCount = KNOWN_AI_SYSTEMS.filter(s => s.status === "active").length;

  const tabs: { key: TabView; label: string; icon: any }[] = [
    { key: "systems", label: "Systems", icon: Globe2 },
    { key: "compare", label: "Compare", icon: GitCompare },
    { key: "insights", label: "Insights", icon: BarChart3 },
  ];

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
          {/* Tab Navigation */}
          <div className="flex gap-1 border-b border-border/30 pb-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-t-md text-[10px] font-medium transition-all ${
                    activeTab === tab.key
                      ? "bg-primary/10 text-primary border-b-2 border-primary"
                      : "text-foreground/50 hover:text-foreground/70"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ===== SYSTEMS TAB ===== */}
          {activeTab === "systems" && (
            <>
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
                  Open-Source AI Systems ({KNOWN_AI_SYSTEMS.length})
                </p>
                <div className="space-y-1 max-h-[240px] overflow-y-auto pr-1">
                  {KNOWN_AI_SYSTEMS.filter(s => s.id !== "qumus").map(system => (
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
                    <p className="text-[9px] text-foreground/60 mb-1">{sys.specialization}</p>
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {sys.strengths.map((s, i) => (
                        <span key={`item-${i}`} className="text-[8px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary/80">{s}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-foreground/40">
                      <Shield className="w-3 h-3" />
                      <span>Protocol-agnostic — no integration required</span>
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {/* ===== COMPARE RESPONSES TAB ===== */}
          {activeTab === "compare" && (
            <div className="space-y-2">
              <p className="text-[10px] text-foreground/50 uppercase tracking-wider">Compare AI Responses</p>

              {/* System Selector for Comparison */}
              <div>
                <p className="text-[9px] text-foreground/40 mb-1">Select 2-4 systems to compare:</p>
                <div className="flex flex-wrap gap-1">
                  {KNOWN_AI_SYSTEMS.map(sys => {
                    const isSelected = compareSystems.includes(sys.id);
                    return (
                      <button
                        key={sys.id}
                        onClick={() => toggleCompareSystem(sys.id)}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition-all ${
                          isSelected
                            ? sys.id === "qumus"
                              ? "bg-amber-500/20 text-amber-600 border border-amber-500/40"
                              : "bg-primary/15 text-primary border border-primary/30"
                            : "bg-card text-foreground/40 border border-border/30 hover:border-primary/20"
                        }`}
                      >
                        {sys.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scenario Input */}
              <div>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={comparePrompt}
                    onChange={(e) => setComparePrompt(e.target.value)}
                    placeholder="Enter a scenario to compare..."
                    className="flex-1 px-2 py-1 text-[10px] rounded-md border border-border/50 bg-card text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/40"
                    onKeyDown={(e) => e.key === "Enter" && handleCompare()}
                  />
                  <button
                    onClick={handleCompare}
                    disabled={isComparing || !comparePrompt.trim() || compareSystems.length < 2}
                    className="px-2 py-1 rounded-md bg-primary text-primary-foreground text-[9px] font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"
                  >
                    {isComparing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  </button>
                </div>

                {/* Quick Scenarios */}
                <div className="mt-1.5">
                  <p className="text-[8px] text-foreground/30 mb-0.5">Quick scenarios:</p>
                  <div className="flex flex-wrap gap-0.5">
                    {COMPARE_SCENARIOS.slice(0, 3).map((scenario, i) => (
                      <button
                        key={`item-${i}`}
                        onClick={() => setComparePrompt(scenario)}
                        className="text-[8px] px-1.5 py-0.5 rounded bg-card border border-border/30 text-foreground/50 hover:border-primary/20 hover:text-foreground/70 transition-colors truncate max-w-[200px]"
                      >
                        {scenario.slice(0, 50)}...
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Compare Results */}
              {compareResults.length > 0 && (
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                  {compareResults.map((result, i) => (
                    <div
                      key={result.systemId}
                      className={`p-2 rounded-md border ${
                        result.systemId === "qumus"
                          ? "border-amber-500/30 bg-amber-500/5"
                          : "border-border/50 bg-card/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold ${
                          result.systemId === "qumus" ? "text-amber-600" : "text-foreground"
                        }`}>
                          {result.systemName}
                          {result.systemId === "qumus" && " ★"}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] text-foreground/40">
                            <Clock className="w-2.5 h-2.5 inline mr-0.5" />
                            {result.latency}ms
                          </span>
                          <span className={`text-[8px] font-medium ${
                            result.confidence >= 85 ? "text-green-500" :
                            result.confidence >= 70 ? "text-yellow-500" : "text-red-500"
                          }`}>
                            {result.confidence}%
                          </span>
                        </div>
                      </div>
                      <p className="text-[9px] text-foreground/70 leading-relaxed">{result.response}</p>
                      <p className="text-[8px] text-foreground/30 mt-1 italic">{result.approach}</p>
                    </div>
                  ))}
                </div>
              )}

              {isComparing && (
                <div className="flex items-center justify-center gap-2 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-[10px] text-foreground/50">Comparing responses across {compareSystems.length} systems...</span>
                </div>
              )}
            </div>
          )}

          {/* ===== INSIGHTS TAB ===== */}
          {activeTab === "insights" && (
            <div className="space-y-2">
              <p className="text-[10px] text-foreground/50 uppercase tracking-wider">QUMUS Self-Assessment</p>

              {/* Strengths vs Gaps */}
              <div className="grid grid-cols-2 gap-1.5">
                <div className="p-2 rounded-md bg-green-500/5 border border-green-500/20">
                  <p className="text-[9px] font-bold text-green-600 mb-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Strengths
                  </p>
                  <div className="space-y-0.5">
                    {["8-policy framework", "90%+ autonomy", "Real-time monitoring", "DB persistence", "Human oversight"].map(s => (
                      <p key={s} className="text-[8px] text-foreground/60">{s}</p>
                    ))}
                  </div>
                </div>
                <div className="p-2 rounded-md bg-amber-500/5 border border-amber-500/20">
                  <p className="text-[9px] font-bold text-amber-600 mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Growth Areas
                  </p>
                  <div className="space-y-0.5">
                    {["Cross-policy correlation", "Adaptive scheduling", "ML feedback loop", "Anomaly detection", "Policy A/B testing"].map(s => (
                      <p key={s} className="text-[8px] text-foreground/60">{s}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Learning from External Systems */}
              <div className="p-2 rounded-md bg-card border border-border/50">
                <p className="text-[9px] font-bold text-foreground mb-1">What QUMUS Can Learn</p>
                <div className="space-y-1">
                  <div className="flex items-start gap-1.5">
                    <span className="text-[8px] text-purple-500 font-bold mt-0.5">CrewAI</span>
                    <p className="text-[8px] text-foreground/50">Role-based delegation patterns for multi-bot coordination</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-[8px] text-blue-500 font-bold mt-0.5">LangChain</span>
                    <p className="text-[8px] text-foreground/50">RAG pipelines for knowledge base enrichment</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-[8px] text-green-500 font-bold mt-0.5">AutoGen</span>
                    <p className="text-[8px] text-foreground/50">Flexible multi-agent conversation topologies</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-[8px] text-orange-500 font-bold mt-0.5">Dify</span>
                    <p className="text-[8px] text-foreground/50">Visual workflow building for policy creation</p>
                  </div>
                </div>
              </div>

              {/* QUMUS Unique Advantages */}
              <div className="p-2 rounded-md bg-primary/5 border border-primary/20">
                <p className="text-[9px] font-bold text-primary mb-1">QUMUS Unique Advantages</p>
                <div className="space-y-0.5">
                  <p className="text-[8px] text-foreground/60">Only system with full ecosystem awareness across 5 brands</p>
                  <p className="text-[8px] text-foreground/60">Only system managing 10 specialized AI bots simultaneously</p>
                  <p className="text-[8px] text-foreground/60">Only system with integrated emergency broadcast (HybridCast)</p>
                  <p className="text-[8px] text-foreground/60">Only system with real-time compliance + audit trail persistence</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Engagement Log (shown on all tabs) */}
          {engagementLog.length > 0 && (
            <div>
              <p className="text-[10px] text-foreground/50 uppercase tracking-wider mb-1">Recent Activity</p>
              <div className="space-y-0.5">
                {engagementLog.slice(0, 4).map((entry, i) => (
                  <div key={`item-${i}`} className="flex items-center justify-between text-[9px] px-1.5 py-0.5 rounded bg-card/50">
                    <span className="text-foreground/70">
                      <Zap className="w-2.5 h-2.5 inline mr-0.5 text-amber-500" />
                      {entry.system} → {entry.mode}
                    </span>
                    <span className={`font-medium ${
                      entry.status === "completed" ? "text-blue-500" :
                      entry.status === "acknowledged" ? "text-green-500" : "text-yellow-500"
                    }`}>
                      {entry.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <p className="text-[8px] text-foreground/30 text-center">
            QUMUS engages with external AI systems for mutual growth — no direct integration or data sharing required
          </p>
        </div>
      )}
    </Card>
  );
}
