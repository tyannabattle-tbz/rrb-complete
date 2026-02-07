import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import QumusChatPage from "./QumusChatPage";
import { RockinBoogieWidget } from "@/components/RockinBoogieWidget";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

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
        <div className="text-center space-y-6 max-w-md">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">QUMUS</h1>
            <p className="text-muted-foreground">Autonomous Orchestration Engine</p>
          </div>
          <p className="text-foreground">
            The intelligent control center managing HybridCast, Rockin Rockin Boogie, Sweet Miracles, and all subsidiary platforms with 90%+ autonomy.
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

  // Authenticated user - show QUMUS Chat Interface with RRB widget
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-hidden">
        <QumusChatPage />
      </div>
      <div className="w-full max-w-md mx-auto p-4 border-t border-slate-200">
        <RockinBoogieWidget />
      </div>
    </div>
  );
}
