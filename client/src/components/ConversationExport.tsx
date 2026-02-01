import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, File } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ConversationExportProps {
  messages: Message[];
  sessionName?: string;
  onClose?: () => void;
}

export default function ConversationExport({
  messages,
  sessionName = "conversation",
  onClose,
}: ConversationExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const generateMarkdown = (): string => {
    let markdown = `# ${sessionName}\n\n`;
    markdown += `*Exported on ${new Date().toLocaleString()}*\n\n`;

    messages.forEach((msg) => {
      if (msg.role === "system") return;

      const roleEmoji = msg.role === "user" ? "👤" : "🤖";
      const time = msg.timestamp.toLocaleTimeString();

      markdown += `## ${roleEmoji} ${msg.role.charAt(0).toUpperCase() + msg.role.slice(1)} - ${time}\n\n`;
      markdown += `${msg.content}\n\n`;
      markdown += "---\n\n";
    });

    return markdown;
  };

  const generatePlainText = (): string => {
    let text = `${sessionName}\n`;
    text += `Exported on ${new Date().toLocaleString()}\n`;
    text += "=".repeat(50) + "\n\n";

    messages.forEach((msg) => {
      if (msg.role === "system") return;

      const time = msg.timestamp.toLocaleTimeString();
      const role = msg.role.charAt(0).toUpperCase() + msg.role.slice(1);

      text += `[${time}] ${role}:\n`;
      text += `${msg.content}\n`;
      text += "-".repeat(50) + "\n\n";
    });

    return text;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = async () => {
    setIsExporting(true);
    try {
      const content = generateMarkdown();
      const filename = `${sessionName.replace(/\s+/g, "-")}-${Date.now()}.md`;
      downloadFile(content, filename, "text/markdown");
      toast.success("Conversation exported as Markdown");
      onClose?.();
    } catch (error) {
      toast.error("Failed to export conversation");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportText = async () => {
    setIsExporting(true);
    try {
      const content = generatePlainText();
      const filename = `${sessionName.replace(/\s+/g, "-")}-${Date.now()}.txt`;
      downloadFile(content, filename, "text/plain");
      toast.success("Conversation exported as Text");
      onClose?.();
    } catch (error) {
      toast.error("Failed to export conversation");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-muted rounded-lg border border-border">
      <h3 className="font-semibold text-sm">Export Conversation</h3>
      <p className="text-xs text-muted-foreground">
        {messages.length} messages will be exported
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleExportMarkdown}
          disabled={isExporting || messages.length === 0}
          className="flex-1"
        >
          <FileText size={16} className="mr-2" />
          Markdown
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleExportText}
          disabled={isExporting || messages.length === 0}
          className="flex-1"
        >
          <File size={16} className="mr-2" />
          Text
        </Button>
      </div>
    </div>
  );
}
