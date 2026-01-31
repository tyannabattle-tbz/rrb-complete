import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileJson, FileText, Download, Copy, Check } from "lucide-react";

interface SessionExportProps {
  sessionId: number;
  sessionName: string;
  messages: Array<{ role: string; content: string; timestamp: Date }>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SessionExport({
  sessionId,
  sessionName,
  messages,
  open = false,
  onOpenChange,
}: SessionExportProps) {
  const [isOpen, setIsOpen] = useState(open);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const exportAsJSON = () => {
    const data = {
      sessionId,
      sessionName,
      exportDate: new Date().toISOString(),
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
      })),
    };
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, `${sessionName}-${sessionId}.json`, "application/json");
  };

  const exportAsMarkdown = () => {
    let markdown = `# ${sessionName}\n\n`;
    markdown += `**Exported:** ${new Date().toLocaleString()}\n\n`;
    markdown += `---\n\n`;

    messages.forEach((msg) => {
      markdown += `### ${msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}\n\n`;
      markdown += `${msg.content}\n\n`;
      markdown += `*${msg.timestamp.toLocaleString()}*\n\n`;
      markdown += `---\n\n`;
    });

    downloadFile(markdown, `${sessionName}-${sessionId}.md`, "text/markdown");
  };

  const exportAsCSV = () => {
    let csv = "Role,Content,Timestamp\n";
    messages.forEach((msg) => {
      const content = msg.content.replace(/"/g, '""');
      csv += `"${msg.role}","${content}","${msg.timestamp.toISOString()}"\n`;
    });

    downloadFile(csv, `${sessionName}-${sessionId}.csv`, "text/csv");
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const copyToClipboard = (format: string) => {
    let content = "";
    if (format === "json") {
      content = JSON.stringify(
        {
          sessionId,
          sessionName,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp.toISOString(),
          })),
        },
        null,
        2
      );
    } else if (format === "markdown") {
      content = `# ${sessionName}\n\n${messages.map((m) => `**${m.role}:** ${m.content}`).join("\n\n")}`;
    }

    navigator.clipboard.writeText(content);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Session</DialogTitle>
          <DialogDescription>
            Export "{sessionName}" in your preferred format
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="download" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="download">Download</TabsTrigger>
            <TabsTrigger value="copy">Copy to Clipboard</TabsTrigger>
          </TabsList>

          <TabsContent value="download" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileJson className="w-5 h-5" />
                  JSON Format
                </CardTitle>
                <CardDescription>
                  Complete session data with metadata and timestamps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={exportAsJSON} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download as JSON
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Markdown Format
                </CardTitle>
                <CardDescription>
                  Human-readable format perfect for documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={exportAsMarkdown} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download as Markdown
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  CSV Format
                </CardTitle>
                <CardDescription>
                  Spreadsheet-compatible format for analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={exportAsCSV} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download as CSV
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="copy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>JSON</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => copyToClipboard("json")}
                  variant="outline"
                  className="w-full"
                >
                  {copiedFormat === "json" ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy JSON
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Markdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => copyToClipboard("markdown")}
                  variant="outline"
                  className="w-full"
                >
                  {copiedFormat === "markdown" ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Markdown
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-xs text-muted-foreground">
          <p>
            <strong>Session ID:</strong> {sessionId}
          </p>
          <p>
            <strong>Messages:</strong> {messages.length}
          </p>
          <p>
            <strong>Exported:</strong> {new Date().toLocaleString()}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
