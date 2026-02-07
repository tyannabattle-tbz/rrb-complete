import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";

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
            <h1 className="text-4xl font-bold gradient-text mb-2">Rockin Rockin Boogie</h1>
            <p className="text-muted-foreground">Your Entertainment & Wellness Platform</p>
          </div>
          <p className="text-foreground">
            Discover healing frequencies, meditation, podcasts, and live streaming all in one place.
          </p>
          <a
            href={getLoginUrl()}
            className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Authenticated user - show dashboard
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center space-y-8 mb-12">
          <div>
            <h1 className="text-5xl font-bold mb-4">Welcome to Rockin Rockin Boogie</h1>
            <p className="text-xl text-muted-foreground">Your complete entertainment and wellness ecosystem</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Solbones */}
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate("/solbones")}>
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-xl font-bold mb-2">Solbones</h3>
            <p className="text-muted-foreground mb-4">Discover healing frequencies through the ancient Solfeggio scale</p>
            <Button variant="outline" className="w-full">Explore Frequencies</Button>
          </div>

          {/* Meditation */}
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate("/meditation")}>
            <div className="text-3xl mb-3">🧘</div>
            <h3 className="text-xl font-bold mb-2">Meditation Hub</h3>
            <p className="text-muted-foreground mb-4">Guided meditation sessions for peace, clarity, and wellness</p>
            <Button variant="outline" className="w-full">Start Meditating</Button>
          </div>

          {/* Podcast */}
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate("/podcast-discovery")}>
            <div className="text-3xl mb-3">🎙️</div>
            <h3 className="text-xl font-bold mb-2">Podcast Discovery</h3>
            <p className="text-muted-foreground mb-4">Find and listen to your favorite podcasts and audio content</p>
            <Button variant="outline" className="w-full">Browse Podcasts</Button>
          </div>

          {/* Radio */}
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate("/radio-station")}>
            <div className="text-3xl mb-3">📻</div>
            <h3 className="text-xl font-bold mb-2">Radio Station</h3>
            <p className="text-muted-foreground mb-4">Stream live radio with curated music channels</p>
            <Button variant="outline" className="w-full">Listen Now</Button>
          </div>

          {/* Studio */}
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate("/studio")}>
            <div className="text-3xl mb-3">🎬</div>
            <h3 className="text-xl font-bold mb-2">Professional Studio</h3>
            <p className="text-muted-foreground mb-4">Stream and produce professional content with advanced tools</p>
            <Button variant="outline" className="w-full">Go to Studio</Button>
          </div>

          {/* Client Portal */}
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate("/client-portal")}>
            <div className="text-3xl mb-3">👥</div>
            <h3 className="text-xl font-bold mb-2">Client Portal</h3>
            <p className="text-muted-foreground mb-4">Manage your account, donations, and content uploads</p>
            <Button variant="outline" className="w-full">My Account</Button>
          </div>

          {/* Reviews */}
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate("/review")}>
            <div className="text-3xl mb-3">👤</div>
            <h3 className="text-xl font-bold mb-2">Community Reviews</h3>
            <p className="text-muted-foreground mb-4">Share your experience and read community feedback</p>
            <Button variant="outline" className="w-full">View Reviews</Button>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Powered by QUMUS</h2>
          <p className="text-muted-foreground mb-4">Advanced autonomous orchestration engine managing 90%+ of platform decisions</p>
          <Button onClick={() => navigate("/chat")} variant="default">Chat with QUMUS AI</Button>
        </div>
      </div>
    </div>
  );
}
