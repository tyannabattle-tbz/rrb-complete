import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface Template {
  id: string;
  title: string;
  prompt: string;
  icon: string;
  category: string;
}

interface ConversationTemplatesProps {
  onSelectTemplate: (prompt: string) => void;
}

const TEMPLATES: Template[] = [
  {
    id: "creative",
    title: "Creative Writing",
    prompt: "Help me write a creative story about...",
    icon: "✍️",
    category: "Writing",
  },
  {
    id: "brainstorm",
    title: "Brainstorming",
    prompt: "Let's brainstorm ideas for...",
    icon: "💡",
    category: "Ideation",
  },
  {
    id: "analysis",
    title: "Data Analysis",
    prompt: "Analyze this data and provide insights about...",
    icon: "📊",
    category: "Analysis",
  },
  {
    id: "coding",
    title: "Coding Help",
    prompt: "Help me write code to...",
    icon: "💻",
    category: "Programming",
  },
  {
    id: "learning",
    title: "Learning",
    prompt: "Explain the concept of... in simple terms",
    icon: "📚",
    category: "Education",
  },
  {
    id: "planning",
    title: "Planning",
    prompt: "Help me plan and organize...",
    icon: "📋",
    category: "Productivity",
  },
];

export default function ConversationTemplates({
  onSelectTemplate,
}: ConversationTemplatesProps) {
  const categories = Array.from(new Set(TEMPLATES.map((t) => t.category)));

  return (
    <div className="space-y-4 p-4 bg-muted rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} />
        <h3 className="font-semibold text-sm">Quick Start Templates</h3>
      </div>

      {categories.map((category) => (
        <div key={category} className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            {category}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.filter((t) => t.category === category).map((template) => (
              <Button
                key={template.id}
                variant="outline"
                size="sm"
                onClick={() => onSelectTemplate(template.prompt)}
                className="justify-start text-left h-auto py-2 px-3"
              >
                <span className="mr-2">{template.icon}</span>
                <span className="text-xs">{template.title}</span>
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
