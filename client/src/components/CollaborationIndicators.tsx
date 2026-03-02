import { useEffect, useState } from "react";
import { Users, Dot, Keyboard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface ActiveUser {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "typing" | "idle";
  lastSeen: Date;
  cursorPosition?: { x: number; y: number };
}

interface CollaborationIndicatorsProps {
  activeUsers: ActiveUser[];
  currentUserId: string;
}

export function CollaborationIndicators({
  activeUsers,
  currentUserId,
}: CollaborationIndicatorsProps) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Simulate typing detection (in real implementation, would come from WebSocket)
  useEffect(() => {
    const typingTimeout = setTimeout(() => {
      setTypingUsers([]);
    }, 3000);

    return () => clearTimeout(typingTimeout);
  }, [typingUsers]);

  const otherUsers = activeUsers.filter((u) => u.id !== currentUserId);
  const typingCount = otherUsers.filter((u) => u.status === "typing").length;

  if (otherUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 px-4 py-2 border-t bg-muted/50">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{otherUsers.length} active</span>
      </div>

      <div className="flex items-center gap-1">
        <TooltipProvider>
          {otherUsers.map((user) => (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {/* Status indicator */}
                  <div
                    className={cn(
                      "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                      user.status === "online" && "bg-green-500",
                      user.status === "typing" && "bg-blue-500",
                      user.status === "idle" && "bg-gray-400"
                    )}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {user.status === "typing" ? "Typing..." : user.status}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      {/* Typing indicator */}
      {typingCount > 0 && (
        <div className="flex items-center gap-1 text-sm text-blue-600">
          <Keyboard className="h-4 w-4" />
          <span>
            {typingCount === 1
              ? `${otherUsers.find((u) => u.status === "typing")?.name} is typing`
              : `${typingCount} people typing`}
          </span>
          <div className="flex gap-1 ml-1">
            <Dot className="h-3 w-3 animate-bounce" style={{ animationDelay: "0ms" }} />
            <Dot className="h-3 w-3 animate-bounce" style={{ animationDelay: "150ms" }} />
            <Dot className="h-3 w-3 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Presence Badge - Shows a single user's presence status
 */
interface PresenceBadgeProps {
  user: ActiveUser;
  showName?: boolean;
}

export function PresenceBadge({ user, showName = false }: PresenceBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative inline-block">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-background",
                user.status === "online" && "bg-green-500",
                user.status === "typing" && "bg-blue-500",
                user.status === "idle" && "bg-gray-400"
              )}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-muted-foreground capitalize">
              {user.status === "typing" ? "Typing..." : user.status}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
