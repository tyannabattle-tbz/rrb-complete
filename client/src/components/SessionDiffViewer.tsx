import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Copy, Download } from "lucide-react";

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  lineNumber: number;
}

interface DiffSection {
  title: string;
  lines: DiffLine[];
  additions: number;
  deletions: number;
}

interface SessionDiffViewerProps {
  version1: {
    id: string;
    timestamp: Date;
    label?: string;
  };
  version2: {
    id: string;
    timestamp: Date;
    label?: string;
  };
  diffs: DiffSection[];
}

export const SessionDiffViewer: React.FC<SessionDiffViewerProps> = ({
  version1,
  version2,
  diffs,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(diffs.map((_, i) => `section-${i}`))
  );
  const [viewMode, setViewMode] = useState<"split" | "unified">("unified");

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const totalAdditions = diffs.reduce((sum, d) => sum + d.additions, 0);
  const totalDeletions = diffs.reduce((sum, d) => sum + d.deletions, 0);

  const copyDiffToClipboard = () => {
    const diffText = diffs
      .map((section) => {
        return [
          `\n${section.title}`,
          `+${section.additions} -${section.deletions}`,
          section.lines
            .map((line) => {
              const prefix =
                line.type === "added" ? "+" : line.type === "removed" ? "-" : " ";
              return `${prefix} ${line.content}`;
            })
            .join("\n"),
        ].join("\n");
      })
      .join("\n");

    navigator.clipboard.writeText(diffText);
  };

  const downloadDiff = () => {
    const diffText = diffs
      .map((section) => {
        return [
          `\n${section.title}`,
          `+${section.additions} -${section.deletions}`,
          section.lines
            .map((line) => {
              const prefix =
                line.type === "added" ? "+" : line.type === "removed" ? "-" : " ";
              return `${prefix} ${line.content}`;
            })
            .join("\n"),
        ].join("\n");
      })
      .join("\n");

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      `data:text/plain;charset=utf-8,${encodeURIComponent(diffText)}`
    );
    element.setAttribute("download", `diff-${Date.now()}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Session Diff Viewer</CardTitle>
          <CardDescription>
            Compare changes between two session versions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-semibold">Version 1</div>
              <div className="text-xs text-muted-foreground">
                {version1.label || version1.id}
              </div>
              <div className="text-xs text-muted-foreground">
                {version1.timestamp.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-semibold">Version 2</div>
              <div className="text-xs text-muted-foreground">
                {version2.label || version2.id}
              </div>
              <div className="text-xs text-muted-foreground">
                {version2.timestamp.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-green-50">
                +{totalAdditions} additions
              </Badge>
              <Badge variant="outline" className="bg-red-50">
                -{totalDeletions} deletions
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyDiffToClipboard}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={downloadDiff}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "split" | "unified")}>
            <TabsList>
              <TabsTrigger value="unified">Unified View</TabsTrigger>
              <TabsTrigger value="split">Split View</TabsTrigger>
            </TabsList>

            <TabsContent value="unified" className="space-y-4">
              {diffs.map((section, idx) => {
                const sectionId = `section-${idx}`;
                const isExpanded = expandedSections.has(sectionId);

                return (
                  <Card key={sectionId}>
                    <div
                      className="p-4 cursor-pointer hover:bg-muted/50 flex items-center justify-between"
                      onClick={() => toggleSection(sectionId)}
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                        <span className="font-semibold">{section.title}</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-green-50 text-xs">
                          +{section.additions}
                        </Badge>
                        <Badge variant="outline" className="bg-red-50 text-xs">
                          -{section.deletions}
                        </Badge>
                      </div>
                    </div>

                    {isExpanded && (
                      <CardContent className="p-0 border-t">
                        <div className="font-mono text-sm bg-muted/30 overflow-x-auto">
                          {section.lines.map((line, lineIdx) => (
                            <div
                              key={lineIdx}
                              className={`px-4 py-1 border-l-4 ${
                                line.type === "added"
                                  ? "bg-green-50 border-green-500 text-green-900"
                                  : line.type === "removed"
                                    ? "bg-red-50 border-red-500 text-red-900"
                                    : "bg-white border-transparent text-gray-700"
                              }`}
                            >
                              <span className="inline-block w-8 text-right mr-2 text-muted-foreground">
                                {line.type === "added"
                                  ? "+"
                                  : line.type === "removed"
                                    ? "-"
                                    : " "}
                              </span>
                              <span className="break-words">{line.content}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="split" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Split view showing side-by-side comparison of changes
              </div>
              {diffs.map((section, idx) => {
                const sectionId = `section-${idx}`;
                const isExpanded = expandedSections.has(sectionId);

                return (
                  <Card key={sectionId}>
                    <div
                      className="p-4 cursor-pointer hover:bg-muted/50 flex items-center justify-between"
                      onClick={() => toggleSection(sectionId)}
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                        <span className="font-semibold">{section.title}</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-green-50 text-xs">
                          +{section.additions}
                        </Badge>
                        <Badge variant="outline" className="bg-red-50 text-xs">
                          -{section.deletions}
                        </Badge>
                      </div>
                    </div>

                    {isExpanded && (
                      <CardContent className="p-0 border-t">
                        <div className="grid grid-cols-2 gap-0 font-mono text-sm bg-muted/30 overflow-x-auto">
                          <div className="border-r">
                            {section.lines
                              .filter((l) => l.type !== "added")
                              .map((line, lineIdx) => (
                                <div
                                  key={lineIdx}
                                  className={`px-4 py-1 border-l-4 ${
                                    line.type === "removed"
                                      ? "bg-red-50 border-red-500 text-red-900"
                                      : "bg-white border-transparent text-gray-700"
                                  }`}
                                >
                                  <span className="inline-block w-8 text-right mr-2 text-muted-foreground">
                                    {line.type === "removed" ? "-" : " "}
                                  </span>
                                  <span className="break-words">{line.content}</span>
                                </div>
                              ))}
                          </div>
                          <div>
                            {section.lines
                              .filter((l) => l.type !== "removed")
                              .map((line, lineIdx) => (
                                <div
                                  key={lineIdx}
                                  className={`px-4 py-1 border-l-4 ${
                                    line.type === "added"
                                      ? "bg-green-50 border-green-500 text-green-900"
                                      : "bg-white border-transparent text-gray-700"
                                  }`}
                                >
                                  <span className="inline-block w-8 text-right mr-2 text-muted-foreground">
                                    {line.type === "added" ? "+" : " "}
                                  </span>
                                  <span className="break-words">{line.content}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionDiffViewer;
