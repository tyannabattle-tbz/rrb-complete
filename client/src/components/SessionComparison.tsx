import { useState } from "react";
import { GitCompare, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Session {
  id: number;
  name: string;
  duration: number;
  toolsUsed: number;
  successRate: number;
  timestamp: Date;
  status: "completed" | "failed" | "running";
}

interface SessionComparisonProps {
  onCompare?: (session1Id: number, session2Id: number) => void;
}

export default function SessionComparison({
  onCompare,
}: SessionComparisonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<number[]>([]);

  const mockSessions: Session[] = [
    {
      id: 42,
      name: "Data Analysis",
      duration: 2.3,
      toolsUsed: 5,
      successRate: 95,
      timestamp: new Date(Date.now() - 86400000),
      status: "completed",
    },
    {
      id: 41,
      name: "API Testing",
      duration: 1.8,
      toolsUsed: 3,
      successRate: 100,
      timestamp: new Date(Date.now() - 172800000),
      status: "completed",
    },
    {
      id: 40,
      name: "Performance Check",
      duration: 3.1,
      toolsUsed: 7,
      successRate: 85,
      timestamp: new Date(Date.now() - 259200000),
      status: "completed",
    },
    {
      id: 39,
      name: "Data Analysis v2",
      duration: 2.1,
      toolsUsed: 5,
      successRate: 98,
      timestamp: new Date(Date.now() - 345600000),
      status: "completed",
    },
  ];

  const handleSelectSession = (sessionId: number) => {
    if (selectedSessions.includes(sessionId)) {
      setSelectedSessions(selectedSessions.filter((id) => id !== sessionId));
    } else if (selectedSessions.length < 2) {
      setSelectedSessions([...selectedSessions, sessionId]);
    }
  };

  const handleCompare = () => {
    if (selectedSessions.length === 2 && onCompare) {
      onCompare(selectedSessions[0], selectedSessions[1]);
    }
  };

  const session1 = mockSessions.find((s) => s.id === selectedSessions[0]);
  const session2 = mockSessions.find((s) => s.id === selectedSessions[1]);

  const comparisonData = session1 && session2 ? [
    {
      metric: "Duration (s)",
      session1: session1.duration,
      session2: session2.duration,
    },
    {
      metric: "Tools Used",
      session1: session1.toolsUsed,
      session2: session2.toolsUsed,
    },
    {
      metric: "Success Rate (%)",
      session1: session1.successRate,
      session2: session2.successRate,
    },
  ] : [];

  return (
    <>
      {/* Comparison Button */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <GitCompare size={16} />
        Compare
      </Button>

      {/* Comparison Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-96 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <GitCompare size={24} />
                Compare Sessions
              </h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSelectedSessions([]);
                }}
                className="p-1 hover:bg-muted rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Session Selection */}
              <div>
                <h3 className="font-semibold mb-3">Select Sessions to Compare</h3>
                <div className="space-y-2">
                  {mockSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => handleSelectSession(session.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedSessions.includes(session.id)
                          ? "bg-primary/20 border-2 border-primary"
                          : "bg-muted hover:bg-muted/80 border-2 border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{session.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Session #{session.id} •{" "}
                            {session.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {session.duration.toFixed(1)}s
                          </Badge>
                          <Badge variant="secondary">
                            {session.toolsUsed} tools
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison Results */}
              {selectedSessions.length === 2 && session1 && session2 && (
                <div className="space-y-4">
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-4">Comparison Results</h3>

                    {/* Metrics Chart */}
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="metric" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="session1"
                          fill="#3b82f6"
                          name={session1.name}
                        />
                        <Bar
                          dataKey="session2"
                          fill="#8b5cf6"
                          name={session2.name}
                        />
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Detailed Comparison */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <Card className="p-3">
                        <p className="text-sm text-muted-foreground">
                          {session1.name}
                        </p>
                        <div className="space-y-2 mt-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Duration:</span>
                            <span className="font-semibold">
                              {session1.duration.toFixed(1)}s
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Tools:</span>
                            <span className="font-semibold">
                              {session1.toolsUsed}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Success:</span>
                            <span className="font-semibold">
                              {session1.successRate}%
                            </span>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-3">
                        <p className="text-sm text-muted-foreground">
                          {session2.name}
                        </p>
                        <div className="space-y-2 mt-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Duration:</span>
                            <span className="font-semibold">
                              {session2.duration.toFixed(1)}s
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Tools:</span>
                            <span className="font-semibold">
                              {session2.toolsUsed}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Success:</span>
                            <span className="font-semibold">
                              {session2.successRate}%
                            </span>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Insights */}
                    <Card className="p-3 mt-4 bg-muted/50">
                      <p className="text-sm font-semibold mb-2">Insights</p>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>
                          • {session1.name} is{" "}
                          {Math.abs(
                            ((session1.duration - session2.duration) /
                              session2.duration) *
                              100
                          ).toFixed(0)}
                          % {session1.duration < session2.duration ? "faster" : "slower"}
                        </li>
                        <li>
                          • {session2.name} uses{" "}
                          {Math.abs(session2.toolsUsed - session1.toolsUsed)} more
                          tool{Math.abs(session2.toolsUsed - session1.toolsUsed) !== 1 ? "s" : ""}
                        </li>
                        <li>
                          • Success rate difference:{" "}
                          {Math.abs(
                            session1.successRate - session2.successRate
                          )}
                          %
                        </li>
                      </ul>
                    </Card>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-background border-t p-4 flex justify-end gap-2">
              <Button
                onClick={() => {
                  setIsOpen(false);
                  setSelectedSessions([]);
                }}
                variant="outline"
              >
                Close
              </Button>
              <Button
                onClick={handleCompare}
                disabled={selectedSessions.length !== 2}
              >
                <Plus size={16} className="mr-1" />
                Generate Report
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
