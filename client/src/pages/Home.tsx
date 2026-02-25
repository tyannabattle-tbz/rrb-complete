import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { getLoginUrl } from "@/const";
import QumusChatPage from "./QumusChatPage";
import QumusHome from "./QumusHome";

export default function Home() {
  const { user, loading, isAuthenticated, error, isCached } = useAuth();
  const [, navigate] = useLocation();

  // Log auth state for debugging
  useEffect(() => {
    console.log("[Home] Auth state:", { loading, isAuthenticated, user: user?.name, error, isCached });
  }, [loading, isAuthenticated, user, error, isCached]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-muted-foreground text-sm">Authenticating...</p>
      </div>
    );
  }

  // Show error state if auth failed and no cached user
  if (error && !isCached && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 max-w-md mx-auto px-4">
        <AlertCircle className="text-destructive" size={40} />
        <h2 className="text-lg font-semibold">Authentication Error</h2>
        <p className="text-muted-foreground text-sm text-center">{error.message || "Failed to authenticate. Please try again."}</p>
        <a
          href={getLoginUrl()}
          className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-all mt-4"
        >
          Try Again
        </a>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6 max-w-md px-4">
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

  // Authenticated user - show QUMUS Home with full capabilities
  return <QumusHome />;
}
