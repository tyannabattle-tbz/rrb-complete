import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2, Play, Radio, Users, Zap } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { FeaturedHybridCastChannels } from "@/components/FeaturedHybridCastChannels";
import { Link } from "wouter";

export default function LandingPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/agent");
    }
  }, [isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-20" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          {/* Logo/Brand */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm font-medium text-primary">
            <Radio size={16} />
            HybridCast Enabled
          </div>

          {/* Main Heading */}
          <div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-4 leading-tight">
              Experience the Future of
              <span className="block bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Audio Broadcasting
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stream live channels, discover podcasts, and connect with a global community of listeners and creators powered by HybridCast technology.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a href={getLoginUrl()}>
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 w-full sm:w-auto">
                <Play size={18} />
                Get Started
              </Button>
            </a>
            <Link href="/hybridcast">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 w-full sm:w-auto"
              >
                <Radio size={18} />
                Explore Channels
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
            <div>
              <div className="text-2xl font-bold text-primary">50K+</div>
              <p className="text-sm text-muted-foreground">Active Listeners</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">200+</div>
              <p className="text-sm text-muted-foreground">Live Channels</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">24/7</div>
              <p className="text-sm text-muted-foreground">Streaming</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Channels Section */}
      <FeaturedHybridCastChannels />

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-12">
            Why Choose HybridCast
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Radio,
                title: "Live Streaming",
                description: "Real-time broadcasting with crystal-clear audio quality",
              },
              {
                icon: Users,
                title: "Community Driven",
                description: "Connect with millions of listeners worldwide",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Ultra-low latency streaming technology",
              },
              {
                icon: Play,
                title: "On-Demand Content",
                description: "Access thousands of podcasts and recordings",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:border-primary/50 transition-colors"
                >
                  <Icon className="text-primary mb-4" size={32} />
                  <h3 className="font-bold text-lg text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Join the Community?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Sign up today and get instant access to all HybridCast channels and exclusive content.
          </p>
          <a href={getLoginUrl()}>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Sign In Now
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8 bg-slate-950/50">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground text-sm">
          <p>© 2026 HybridCast. All rights reserved. Powered by QUMUS.</p>
        </div>
      </footer>
    </div>
  );
}
