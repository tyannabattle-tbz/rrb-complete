import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Loader2, Heart, Radio, Users, Zap, Shield, Sparkles } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import QumusChatPage from "./QumusChatPage";
import { UnWcsCountdownTimer } from "@/components/UnWcsCountdownTimer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { QuickStartGuide } from "@/components/QuickStartGuide";
import { useAnalytics } from "@/services/analyticsService";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const analytics = useAnalytics();
  const [scrollDepth, setScrollDepth] = useState(0);

  useEffect(() => {
    // SEO Title with Little Richard reference
    document.title = "Rockin' Rockin' Boogie - Little Richard Legacy Radio & Emergency Response Platform";
    
    // Set meta description with Little Richard
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Rockin\' Rockin\' Boogie - A Little Richard legacy platform. 24/7 radio broadcasting, emergency response, community empowerment, and autonomous orchestration powered by QUMUS AI. Honoring the voice of rock and roll pioneer Little Richard.');
    
    // Set meta keywords with Little Richard
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'Little Richard, rock and roll, radio broadcasting, emergency response, community platform, QUMUS orchestration, Canryn Production, Sweet Miracles, autonomous AI, live streaming, podcast network, emergency broadcast, music legacy, heritage platform');
    
    // Set Open Graph tags for social sharing
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', "Rockin' Rockin' Boogie - Little Richard Legacy Radio");
    
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', 'A Little Richard legacy platform honoring the pioneer of rock and roll with 24/7 radio broadcasting, emergency response, and community empowerment.');
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const percentage = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      );
      if (percentage > scrollDepth) {
        setScrollDepth(percentage);
        analytics.trackScrollDepth(percentage);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollDepth, analytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 text-gray-100">
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12">
          {/* Header Section */}
          <div className="text-center space-y-4 py-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Radio className="w-10 h-10 text-orange-400" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Rockin' Rockin' Boogie
              </h1>
            </div>
            <p className="text-xl text-gray-300 font-semibold">
              Honoring Little Richard's Legacy — A Voice for the Voiceless
            </p>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              A Little Richard legacy platform restored — unified ecosystem of platforms, services, and autonomous intelligence. Broadcasting, emergency response, community empowerment, and generational wealth through Canryn Production and Sweet Miracles. Celebrating the pioneer of rock and roll.
            </p>
          </div>

          {/* Feature Grid */}
          <h2 className="text-3xl font-bold text-white mb-6">Little Richard Legacy Platform - Core Features & Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 p-6 hover:border-orange-500/60 transition-all cursor-pointer" onClick={() => analytics.trackFeatureCardClick('radio')}>
              <Radio className="w-8 h-8 text-orange-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">24/7 Radio Broadcasting</h3>
              <p className="text-gray-400 text-sm">Live streaming with 10 Solfeggio frequencies, vintage tuner interface, and real-time listener engagement.</p>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/30 p-6 hover:border-red-500/60 transition-all cursor-pointer" onClick={() => analytics.trackFeatureCardClick('emergency')}>
              <Shield className="w-8 h-8 text-red-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Emergency Response</h3>
              <p className="text-gray-400 text-sm">SOS alerts, I'm OK wellness checks, multi-channel notifications, and responder network management.</p>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30 p-6 hover:border-pink-500/60 transition-all cursor-pointer" onClick={() => analytics.trackFeatureCardClick('sweet-miracles')}>
              <Heart className="w-8 h-8 text-pink-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Sweet Miracles Giving</h3>
              <p className="text-gray-400 text-sm">Support legacy recovery, community empowerment, and generational wealth creation through donations.</p>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30 p-6 hover:border-purple-500/60 transition-all cursor-pointer" onClick={() => analytics.trackFeatureCardClick('qumus')}>
              <Zap className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">QUMUS Orchestration</h3>
              <p className="text-gray-400 text-sm">90% autonomous decision-making for content scheduling, listener analytics, and platform control.</p>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 p-6 hover:border-blue-500/60 transition-all cursor-pointer" onClick={() => analytics.trackFeatureCardClick('community')}>
              <Users className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Community Platform</h3>
              <p className="text-gray-400 text-sm">Connect with listeners, share stories, access tools, and participate in the RRB ecosystem.</p>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-500/20 to-green-500/20 border-cyan-500/30 p-6 hover:border-cyan-500/60 transition-all cursor-pointer" onClick={() => analytics.trackFeatureCardClick('production')}>
              <Sparkles className="w-8 h-8 text-cyan-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Production Suite</h3>
              <p className="text-gray-400 text-sm">Canryn Production tools for media creation, broadcast management, and content distribution.</p>
            </Card>
          </div>

          {/* CTA Section */}
          <h2 className="text-3xl font-bold text-white mb-6">Join the Little Richard Legacy</h2>
          <div className="bg-gradient-to-r from-orange-600/30 to-pink-600/30 border border-orange-500/50 rounded-lg p-8 md:p-12 text-center space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Become Part of the RRB Legacy
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Sign in to access the full RRB ecosystem honoring Little Richard's pioneering spirit. Manage broadcasts, respond to emergencies, and support the mission of generational wealth and community empowerment.
              </p>
            </div>
            <a
              href={getLoginUrl()}
              onClick={() => analytics.trackCtaClick('sign-in-main')}
              className="inline-block px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
            >
              Sign In to RRB
            </a>
          </div>

          {/* Quick Start Guide */}
          <h2 className="text-3xl font-bold text-white mb-6">Quick Start Guide</h2>
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-8 md:p-12">
            <QuickStartGuide />
          </div>

          {/* Testimonials Section */}
          <h2 className="text-3xl font-bold text-white mb-6">Community Voices</h2>
          <div className="space-y-8">
            <TestimonialsSection />
          </div>

          {/* Footer Info */}
          <div className="text-center text-gray-500 text-sm space-y-2 border-t border-gray-800 pt-8">
            <p>
              Rockin' Rockin' Boogie — Honoring the Legacy of Little Richard, Pioneer of Rock and Roll
            </p>
            <p>
              Sweet Miracles Foundation 501(c)(3) / 508(c) — Supporting Legacy Recovery & Community Empowerment
            </p>
            <p>
              Powered by QUMUS Autonomous Orchestration Engine | Canryn Production Subsidiary
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated user - show UN WCS countdown and QUMUS Chat Interface
  return (
    <div className="space-y-6 p-4 md:p-6">
      <UnWcsCountdownTimer showLabel={true} />
      <QumusChatPage />
    </div>
  );
}
