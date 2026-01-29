import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Plus } from "lucide-react";
import { useLocation } from "wouter";
import NotificationCenter from "./NotificationCenter";

interface AgentLayoutProps {
  children: React.ReactNode;
  currentSessionId?: number;
  sessions?: Array<{ id: number; sessionName: string }>;
  onNewSession?: () => void;
  onSelectSession?: (sessionId: number) => void;
}

export default function AgentLayout({
  children,
  currentSessionId,
  sessions = [],
  onNewSession,
  onSelectSession,
}: AgentLayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const sidebarClass = sidebarOpen ? "w-64" : "w-20";

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${sidebarClass} bg-card border-r border-border transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-lg font-bold gradient-text">Manus Agent</h1>
          )}
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted/20 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* New Session Button */}
        {sidebarOpen && (
          <div className="p-4 border-b border-border">
            <Button
              onClick={onNewSession}
              className="w-full gap-2"
              size="sm"
            >
              <Plus size={16} />
              New Session
            </Button>
          </div>
        )}

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto scrollbar-elegant p-4 space-y-2">
          {sessions.map((session) => {
            const isActive = currentSessionId === session.id;
            const activeClass = isActive
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted/20 text-foreground";

            return (
              <button
                key={session.id}
                onClick={() => onSelectSession?.(session.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${activeClass}`}
                title={session.sessionName}
              >
                {sidebarOpen ? (
                  <p className="truncate text-sm">{session.sessionName}</p>
                ) : (
                  <div className="w-2 h-2 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* User Profile & Logout */}
        {sidebarOpen && (
          <div className="p-4 border-t border-border space-y-3">
            <div className="px-3 py-2 bg-muted/20 rounded-lg">
              <p className="text-xs text-muted-foreground">Logged in as</p>
              <p className="text-sm font-medium truncate">{user?.name || user?.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full gap-2"
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
