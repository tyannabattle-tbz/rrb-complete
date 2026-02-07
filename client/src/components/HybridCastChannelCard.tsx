import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Radio, Users, Clock } from "lucide-react";
import { Link } from "wouter";

export interface HybridCastChannel {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  listeners?: number;
  isLive?: boolean;
  href: string;
  color?: string;
}

interface HybridCastChannelCardProps {
  channel: HybridCastChannel;
}

export function HybridCastChannelCard({ channel }: HybridCastChannelCardProps) {
  return (
    <Link href={channel.href}>
      <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
        <div className="relative h-40 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.3),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.3),transparent_50%)]" />
          </div>

          {/* Icon */}
          <div className="relative z-10 text-5xl group-hover:scale-110 transition-transform duration-300">
            {channel.icon}
          </div>

          {/* Live indicator */}
          {channel.isLive && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full" />
              LIVE
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          {/* Channel name and category */}
          <div>
            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
              {channel.name}
            </h3>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {channel.category}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {channel.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
            {channel.listeners !== undefined && (
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>{channel.listeners.toLocaleString()} listeners</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Radio size={14} />
              <span>HybridCast</span>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              // Navigation handled by Link wrapper
            }}
          >
            Tune In
          </Button>
        </div>
      </Card>
    </Link>
  );
}
