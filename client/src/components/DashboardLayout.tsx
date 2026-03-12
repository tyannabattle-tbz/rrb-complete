import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard, LogOut, PanelLeft, Users, Monitor, MessageSquare, Music, Radio,
  Headphones, Calendar, Zap, Eye, Heart, Earth, Gamepad2, BookOpen, MapPin, Settings,
  Shield, BarChart3, FileText, Bell, Search, ChevronDown, ChevronRight, Video, Mic,
  Newspaper, GitBranch, Webhook, Megaphone, Play, Target, AlertTriangle, Cpu, Wrench,
  Home as HomeIcon, X, Terminal, Phone
} from "lucide-react";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { useRestreamUrl } from '@/hooks/useRestreamUrl';

interface NavItem {
  icon: any;
  label: string;
  path: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

const navSections: NavSection[] = [
  {
    title: "Core",
    defaultOpen: true,
    items: [
      { icon: HomeIcon, label: "Home", path: "/" },
      { icon: Monitor, label: "QUMUS Control", path: "/qumus" },
      { icon: Terminal, label: "Command Console", path: "/command-console" },
      { icon: MessageSquare, label: "AI Chat", path: "/qumus-chat" },
      { icon: Earth, label: "Ecosystem Dashboard", path: "/ecosystem-dashboard" },
      { icon: Cpu, label: "System Health", path: "/health" },
    ],
  },
  {
    title: "Broadcasting",
    defaultOpen: true,
    items: [
      { icon: Radio, label: "RRB Radio", path: "/rrb-radio" },
      { icon: Eye, label: "Live Stream", path: "/live" },
      { icon: Zap, label: "Broadcast Hub", path: "/broadcast-hub" },
      { icon: Radio, label: "HybridCast", path: "/hybridcast" },
      { icon: Megaphone, label: "Broadcast Manager", path: "/rrb/broadcast-manager" },
      { icon: Play, label: "Content Scheduler", path: "/scheduler" },
      { icon: BarChart3, label: "Stream Analytics", path: "/stream-analytics" },
    ],
  },
  {
    title: "Production Studio",
    items: [
      { icon: Headphones, label: "Studio Control Room", path: "/studio" },
      { icon: Video, label: "Video Production", path: "/video-production" },
      { icon: Phone, label: "Conference Hub", path: "/conference" },
      { icon: Mic, label: "Podcast Discovery", path: "/podcast-discovery" },
      { icon: Music, label: "Music Library", path: "/music" },
    ],
  },
  {
    title: "Events & Community",
    items: [
      { icon: Calendar, label: "Convention Hub", path: "/convention-hub" },
      { icon: MapPin, label: "Selma Jubilee", path: "/selma" },
      { icon: Earth, label: "SQUADD Goals", path: "/squadd" },
      { icon: Users, label: "Community", path: "/community" },
      { icon: Users, label: "Community Forums", path: "/community-forums" },
    ],
  },
  {
    title: "Sweet Miracles",
    items: [
      { icon: Heart, label: "Donate", path: "/donate" },
      { icon: Heart, label: "Sweet Miracles", path: "/sweet-miracles" },
      { icon: Target, label: "Donor Campaigns", path: "/donor-campaigns" },
      { icon: BarChart3, label: "Impact Dashboard", path: "/impact-dashboard" },
    ],
  },
  {
    title: "Analytics",
    items: [
      { icon: BarChart3, label: "Listener Analytics", path: "/listener-analytics" },
      { icon: BarChart3, label: "Live Analytics", path: "/listener-analytics-live" },
      { icon: BarChart3, label: "Advanced Analytics", path: "/analytics-advanced" },
      { icon: BarChart3, label: "Feature Analytics", path: "/feature-analytics" },
    ],
  },
  {
    title: "Legacy & Archive",
    items: [
      { icon: BookOpen, label: "Legacy", path: "/legacy" },
      { icon: BookOpen, label: "Candy Archive", path: "/archive" },
      { icon: GitBranch, label: "Family Tree", path: "/family" },
      { icon: Newspaper, label: "News", path: "/news" },
      { icon: FileText, label: "Documentation", path: "/docs" },
    ],
  },
  {
    title: "Games & Explore",
    items: [
      { icon: Gamepad2, label: "Games Hub", path: "/games" },
      { icon: Gamepad2, label: "Solbones", path: "/solbones" },
      { icon: MapPin, label: "GPS Radar", path: "/gps-radar" },
      { icon: Target, label: "Meditation Hub", path: "/meditation" },
    ],
  },
  {
    title: "Management",
    items: [
      { icon: Shield, label: "Canryn Production", path: "/canryn" },
      { icon: Webhook, label: "Webhook Manager", path: "/webhook-manager" },
      { icon: Megaphone, label: "Ad Manager", path: "/ad-manager" },
      { icon: Users, label: "Team Updates", path: "/rrb-team-updates" },
      { icon: Wrench, label: "RRB Update", path: "/rrb-update" },
    ],
  },
  {
    title: "Admin",
    items: [
      { icon: Shield, label: "Admin Panel", path: "/admin" },
      { icon: Shield, label: "Policies", path: "/policies" },
      { icon: FileText, label: "Audit Trail", path: "/audit" },
      { icon: AlertTriangle, label: "Emergency Drills", path: "/emergency-drills" },
      { icon: Bell, label: "Notifications", path: "/notifications" },
      { icon: Settings, label: "Settings", path: "/settings" },
    ],
  },
];

// Flatten all items for search
const allMenuItems = navSections.flatMap(s => s.items);

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const SIDEBAR_SECTIONS_KEY = "sidebar-sections";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              Sign in to continue
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Access to this dashboard requires authentication. Continue to launch the login flow.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { openRestream } = useRestreamUrl();

  // Collapsible section state - persisted to localStorage
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_SECTIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default: open sections that have defaultOpen or contain the active route
    const defaults: Record<string, boolean> = {};
    navSections.forEach(section => {
      const hasActiveItem = section.items.some(item => item.path === location);
      defaults[section.title] = section.defaultOpen || hasActiveItem;
    });
    return defaults;
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_SECTIONS_KEY, JSON.stringify(openSections));
  }, [openSections]);

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  // Filter items by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return navSections;
    const q = searchQuery.toLowerCase();
    return navSections
      .map(section => ({
        ...section,
        items: section.items.filter(
          item =>
            item.label.toLowerCase().includes(q) ||
            item.path.toLowerCase().includes(q) ||
            section.title.toLowerCase().includes(q)
        ),
      }))
      .filter(section => section.items.length > 0);
  }, [searchQuery]);

  // Find active menu item label
  const activeMenuItem = allMenuItems.find(item => item.path === location);

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  // Keyboard shortcut: Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold tracking-tight truncate">
                    QUMUS Navigation
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          {/* Search Bar */}
          {!isCollapsed && (
            <div className="px-3 pb-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search... (Ctrl+K)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-8 text-xs rounded-md border border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          <SidebarContent className="gap-0 overflow-y-auto">
            {filteredSections.map((section) => {
              const isOpen = searchQuery ? true : openSections[section.title] !== false;
              return (
                <div key={section.title} className="mb-1">
                  {/* Section Header */}
                  {!isCollapsed && (
                    <button
                      onClick={() => !searchQuery && toggleSection(section.title)}
                      className="flex items-center gap-1.5 px-4 py-1.5 w-full text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {searchQuery ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : isOpen ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                      {section.title}
                      <span className="ml-auto text-[9px] text-muted-foreground/60">
                        {section.items.length}
                      </span>
                    </button>
                  )}

                  {/* Section Items */}
                  {(isOpen || isCollapsed) && (
                    <SidebarMenu className="px-2 py-0">
                      {section.items.map(item => {
                        const isActive = location === item.path;
                        return (
                          <SidebarMenuItem key={item.path}>
                            <SidebarMenuButton
                              isActive={isActive}
                              onClick={() => {
                                if (item.path === '/live') {
                                  openRestream();
                                  setSearchQuery("");
                                  return;
                                }
                                setLocation(item.path);
                                setSearchQuery("");
                              }}
                              tooltip={item.label}
                              className="h-9 transition-all font-normal"
                            >
                              <item.icon
                                className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                              />
                              <span className={isActive ? "font-medium" : ""}>{item.label}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  )}
                </div>
              );
            })}

            {/* No results message */}
            {searchQuery && filteredSections.length === 0 && !isCollapsed && (
              <div className="px-4 py-6 text-center">
                <Search className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">No pages found for "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-primary mt-1 hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </SidebarContent>

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-foreground">
                    {activeMenuItem?.label ?? "Menu"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </>
  );
}
