/**
 * Content Card Component
 * Displays multi-format content with appropriate metadata and actions
 * 
 * Supports:
 * - Audio (duration, format, file size)
 * - Documents (pages, format, file size)
 * - Videos (duration, resolution, file size)
 * - Transcripts (word count, format, file size)
 */

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, FileText, Video, BookOpen, Heart, Share2, Download, Clock, FileSize } from "lucide-react";

export type ContentType = "audio" | "document" | "video" | "transcript";

interface ContentCardProps {
  id: string;
  title: string;
  channel: string;
  type: ContentType;
  topic?: string;
  plays?: number;
  rating?: number;
  date?: Date;
  duration?: number; // seconds
  pages?: number;
  words?: number;
  resolution?: string;
  fileSize?: string;
  format?: string;
  onPlay?: (id: string) => void;
  onBookmark?: (id: string) => void;
  onShare?: (id: string) => void;
  isBookmarked?: boolean;
}

const CONTENT_TYPE_INFO = {
  audio: {
    icon: <Play className="w-4 h-4" />,
    label: "Audio",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  document: {
    icon: <FileText className="w-4 h-4" />,
    label: "Document",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  video: {
    icon: <Video className="w-4 h-4" />,
    label: "Video",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  transcript: {
    icon: <BookOpen className="w-4 h-4" />,
    label: "Transcript",
    color: "bg-green-500/10 text-green-400 border-green-500/20",
  },
};

const formatDuration = (seconds?: number) => {
  if (!seconds) return null;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const formatDate = (date?: Date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export function ContentCard({
  id,
  title,
  channel,
  type,
  topic,
  plays,
  rating,
  date,
  duration,
  pages,
  words,
  resolution,
  fileSize,
  format,
  onPlay,
  onBookmark,
  onShare,
  isBookmarked,
}: ContentCardProps) {
  const typeInfo = CONTENT_TYPE_INFO[type];

  return (
    <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors overflow-hidden group">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          {/* Content Info */}
          <div className="flex-1 min-w-0">
            {/* Type and Channel Badges */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge className={`${typeInfo.color} border`}>
                {typeInfo.icon}
                <span className="ml-1">{typeInfo.label}</span>
              </Badge>
              <Badge variant="outline" className="text-xs">
                {channel}
              </Badge>
              {topic && (
                <Badge variant="secondary" className="text-xs">
                  {topic}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-accent transition-colors">
              {title}
            </h3>

            {/* Metadata */}
            <div className="flex flex-wrap gap-3 text-sm text-slate-400 mb-3">
              {/* Duration/Pages/Words */}
              {duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(duration)}
                </span>
              )}
              {pages && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {pages} pages
                </span>
              )}
              {words && (
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {words.toLocaleString()} words
                </span>
              )}
              {resolution && (
                <span className="flex items-center gap-1">
                  <Video className="w-3 h-3" />
                  {resolution}
                </span>
              )}

              {/* Plays and Rating */}
              {plays !== undefined && (
                <span className="flex items-center gap-1">
                  <Play className="w-3 h-3" />
                  {plays.toLocaleString()} plays
                </span>
              )}
              {rating !== undefined && (
                <span className="flex items-center gap-1">
                  ⭐ {rating.toFixed(1)}
                </span>
              )}

              {/* Date */}
              {date && (
                <span className="text-xs text-slate-500">
                  {formatDate(date)}
                </span>
              )}
            </div>

            {/* File Info */}
            {(fileSize || format) && (
              <div className="flex gap-2 text-xs text-slate-500">
                {format && <span>{format}</span>}
                {fileSize && <span>•</span>}
                {fileSize && <span>{fileSize}</span>}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {onPlay && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPlay(id)}
                className="text-accent hover:bg-accent/10"
                title="Play"
              >
                <Play className="w-4 h-4" />
              </Button>
            )}
            {onBookmark && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onBookmark(id)}
                className={isBookmarked ? "text-red-400" : "text-slate-400"}
                title="Bookmark"
              >
                <Heart className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
              </Button>
            )}
            {onShare && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onShare(id)}
                className="text-slate-400"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
