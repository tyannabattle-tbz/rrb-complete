import { useAuth } from "@/_core/hooks/useAuth";
// Mobile-responsive design optimized for iPhone (375px viewport)
// Using mobile-first approach with md: breakpoint for larger screens
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import QumusChatPage from "./QumusChatPage";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Set SEO-optimized document title (30-60 characters)
  useEffect(() => {
    document.title = "QUMUS — Canryn Production Orchestration Platform";
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6 max-w-lg px-4">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">
              QUMUS Autonomous Orchestration Engine
            </h1>
            <p className="text-muted-foreground text-lg">
              Powering Canryn Production's Broadcast Ecosystem
            </p>
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Intelligent Control for RRB Radio, HybridCast &amp; Sweet Miracles
          </h2>
          <p className="text-muted-foreground">
            The intelligent control center managing HybridCast, Rockin Rockin Boogie, Sweet Miracles, and all subsidiary platforms with 90%+ autonomy. Content scheduling, listener analytics, emergency broadcasts, and revenue tracking — all orchestrated by QUMUS.
          </p>
          <a
            href={getLoginUrl()}
            className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Sign In to QUMUS
          </a>
        </div>
      </div>
    );
  }

  // Authenticated user - show QUMUS Chat Interface
  return <QumusChatPage />;
}
