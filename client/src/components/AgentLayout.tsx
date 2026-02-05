import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, X, LogOut, Plus, Edit2, Check } from "lucide-react";
import { useLocation } from "wouter";
import NotificationCenter from "./NotificationCenter";
import KeyboardShortcutsHelp from "./KeyboardShortcutsHelp";
import ThemeToggle from "./ThemeToggle";
import SessionComparison from "./SessionComparison";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useEffect } from "react";

interface AgentLayoutProps {
  children: React.ReactNode;
  currentSessionId?: number;
  sessions?: Array<{ id: number; sessionName: string }>;
  onNewSession?: () => void;
  onSelectSession?: (sessionId: number) => void;
  onRenameSession?: (sessionId: number, newName: string) => Promise<void>;
}

export default function AgentLayout({
  children,
  currentSessionId,
  sessions = [],
  onNewSession,
  onSelectSession,
  onRenameSession,
}: AgentLayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [, navigate] = useLocation();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleRename = async (sessionId: number) => {
    if (editingName.trim() && onRenameSession) {
      try {
        await onRenameSession(sessionId, editingName);
        setEditingId(null);
      } catch (error) {
        console.error("Failed to rename session:", error);
      }
    }
  };

  const sidebarClass = sidebarOpen ? "w-64" : "w-20";
  const sidebarOverlay = isMobile && sidebarOpen ? "fixed inset-0 bg-black/50 z-40" : "";

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Overlay */}
      {sidebarOverlay && (
        <div
          className={sidebarOverlay}
          onClick={() => setSidebarOpen(false)}
          style={{ zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${sidebarClass} bg-card border-r border-border transition-all duration-300 flex flex-col ${isMobile ? `fixed left-0 top-0 h-screen z-50 ${!sidebarOpen ? '-translate-x-full' : ''}` : ''}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-lg font-bold gradient-text">Qumus</h1>
          )}
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <KeyboardShortcutsHelp />
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted/20 rounded-lg transition-colors md:hidden"
              title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            {!isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-muted/20 rounded-lg transition-colors hidden md:block"
                title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
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
            const isEditing = editingId === session.id;

            return (
              <div key={session.id} className="group">
                {isEditing ? (
                  <div className="flex gap-2 px-2 py-1">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      placeholder="Session name"
                      className="h-8 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRename(session.id);
                        } else if (e.key === "Escape") {
                          setEditingId(null);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleRename(session.id)}
                      className="p-1 hover:bg-green-500/20 rounded transition-colors"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => onSelectSession?.(session.id)}
                      className={`flex-1 text-left px-3 py-2 rounded-lg transition-colors ${activeClass}`}
                      title={session.sessionName}
                    >
                      {sidebarOpen ? (
                        <p className="truncate text-sm">{session.sessionName}</p>
                      ) : (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </button>
                    {sidebarOpen && isActive && (
                      <button
                        onClick={() => {
                          setEditingId(session.id);
                          setEditingName(session.sessionName);
                        }}
                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-muted/20 rounded transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* User Profile & Logout */}
        {sidebarOpen && (
          <div className="p-4 border-t border-border space-y-3">
            <ThemeToggle />
            <SessionComparison />
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
      <main className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'w-full' : ''}`}>
        {children}
      </main>
    </div>
  );
}
