/**
 * Content Type Filter Component
 * Provides advanced filtering and display options for multi-format content
 * 
 * Supports:
 * - Audio (podcasts, music, broadcasts)
 * - Documents (PDFs, articles, evidence)
 * - Videos (recordings, tutorials, testimonials)
 * - Transcripts (searchable text with timestamps)
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Play, FileText, Video, BookOpen, Filter, X } from "lucide-react";

export type ContentType = "audio" | "document" | "video" | "transcript";

interface ContentTypeFilterProps {
  selectedTypes: ContentType[];
  onTypeChange: (types: ContentType[]) => void;
  contentStats?: {
    audio: number;
    document: number;
    video: number;
    transcript: number;
  };
}

const CONTENT_TYPES: Array<{
  id: ContentType;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
}> = [
  {
    id: "audio",
    label: "Audio",
    icon: <Play className="w-4 h-4" />,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
    description: "Podcasts, music, and broadcasts",
  },
  {
    id: "document",
    label: "Documents",
    icon: <FileText className="w-4 h-4" />,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
    description: "PDFs, articles, and evidence",
  },
  {
    id: "video",
    label: "Videos",
    icon: <Video className="w-4 h-4" />,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 border-purple-500/20",
    description: "Recordings, tutorials, and testimonials",
  },
  {
    id: "transcript",
    label: "Transcripts",
    icon: <BookOpen className="w-4 h-4" />,
    color: "text-green-400",
    bgColor: "bg-green-500/10 border-green-500/20",
    description: "Searchable text with timestamps",
  },
];

export function ContentTypeFilter({
  selectedTypes,
  onTypeChange,
  contentStats,
}: ContentTypeFilterProps) {
  const handleToggle = (type: ContentType) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    onTypeChange(newTypes);
  };

  const handleClearAll = () => {
    onTypeChange([]);
  };

  const handleSelectAll = () => {
    onTypeChange(["audio", "document", "video", "transcript"]);
  };

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-white">Content Types</h3>
        </div>
        {selectedTypes.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-xs text-slate-400 hover:text-white"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Content Type Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {CONTENT_TYPES.map((type) => (
          <Button
            key={type.id}
            variant={selectedTypes.includes(type.id) ? "default" : "outline"}
            size="sm"
            onClick={() => handleToggle(type.id)}
            className={`flex flex-col items-center justify-center h-auto py-3 px-2 rounded-lg transition-all ${
              selectedTypes.includes(type.id)
                ? "bg-accent text-white"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
            }`}
          >
            <div className="mb-1">{type.icon}</div>
            <span className="text-xs font-medium">{type.label}</span>
            {contentStats && (
              <span className="text-xs text-slate-500 mt-1">
                {contentStats[type.id]}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
          className="text-xs flex-1"
        >
          Select All
        </Button>
        {selectedTypes.length > 0 && (
          <div className="flex items-center gap-1 px-3 py-1 bg-slate-800 rounded text-xs text-slate-400">
            <span>{selectedTypes.length} selected</span>
            <X className="w-3 h-3 cursor-pointer" onClick={handleClearAll} />
          </div>
        )}
      </div>

      {/* Selected Types Display */}
      {selectedTypes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTypes.map((type) => {
            const typeInfo = CONTENT_TYPES.find((t) => t.id === type);
            return (
              <Badge
                key={type}
                className={`${typeInfo?.bgColor} border flex items-center gap-1`}
              >
                {typeInfo?.icon}
                {typeInfo?.label}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Content Type Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
        {CONTENT_TYPES.map((type) => (
          <Card
            key={type.id}
            className={`bg-slate-800 border cursor-pointer transition-all ${
              selectedTypes.includes(type.id)
                ? "border-accent bg-accent/5"
                : "border-slate-700 hover:border-slate-600"
            }`}
            onClick={() => handleToggle(type.id)}
          >
            <CardContent className="pt-3 pb-3">
              <div className="flex items-start gap-2">
                <div className={`${type.color} mt-1`}>{type.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{type.label}</p>
                  <p className="text-xs text-slate-400">{type.description}</p>
                  {contentStats && (
                    <p className="text-xs text-slate-500 mt-1">
                      {contentStats[type.id]} items
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
