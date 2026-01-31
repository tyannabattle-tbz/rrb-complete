import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Activity, Clock, Share2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ActiveUser {
  id: number;
  name: string;
  email: string;
  role: "viewer" | "editor" | "owner";
  lastActiveAt: Date;
  isTyping?: boolean;
  cursorPosition?: { x: number; y: number };
}

interface RealtimeCollaborationUIProps {
  sessionId: number;
}

export default function RealtimeCollaborationUI({ sessionId }: RealtimeCollaborationUIProps) {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Mock WebSocket connection
  useEffect(() => {
    setIsConnected(true);
    
    // Simulate receiving active users
    const mockUsers: ActiveUser[] = [
      {
        id: 1,
        name: "You",
        email: "user@example.com",
        role: "owner",
        lastActiveAt: new Date(),
        isTyping: false,
      },
      {
        id: 2,
        name: "Collaborator",
        email: "collab@example.com",
        role: "editor",
        lastActiveAt: new Date(Date.now() - 5000),
        isTyping: true,
      },
    ];
    
    setActiveUsers(mockUsers);
    
    return () => {
      setIsConnected(false);
    };
  }, [sessionId]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800";
      case "editor":
        return "bg-blue-100 text-blue-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className={`w-4 h-4 ${isConnected ? "text-green-500" : "text-red-500"}`} />
            <span className="text-sm font-medium">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          <Badge variant="outline">{activeUsers.length} active</Badge>
        </div>
      </Card>

      {/* Active Users */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Active Collaborators
        </h3>
        
        <div className="space-y-2">
          {activeUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {user.isTyping && (
                  <span className="text-xs text-blue-600 font-medium animate-pulse">
                    typing...
                  </span>
                )}
                <Badge className={getRoleColor(user.role)}>
                  {user.role}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {getTimeAgo(user.lastActiveAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Share Session */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Share Session
        </h3>
        
        <div className="space-y-2">
          <input
            type="text"
            value={`https://manus.agent/session/${sessionId}`}
            readOnly
            className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-sm"
          />
          <Button
            onClick={() => {
              navigator.clipboard.writeText(`https://manus.agent/session/${sessionId}`);
            }}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Copy Link
          </Button>
        </div>
      </Card>

      {/* Presence Indicators */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Presence Indicators</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Active (editing)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span>Typing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <span>Idle</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
