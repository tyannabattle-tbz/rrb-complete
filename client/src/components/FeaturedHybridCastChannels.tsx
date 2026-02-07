import { HybridCastChannelCard, type HybridCastChannel } from "./HybridCastChannelCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const FEATURED_CHANNELS: HybridCastChannel[] = [
  {
    id: "meditation-hub",
    name: "Meditation Hub",
    description: "Guided meditations, healing frequencies, and mindfulness sessions for inner peace",
    icon: "🧘",
    category: "Wellness",
    listeners: 12500,
    isLive: true,
    href: "/meditation-hub",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "rockin-boogie",
    name: "Rockin' Rockin' Boogie",
    description: "Classic music, live performances, and the legendary Rockin' Rockin' Boogie legacy",
    icon: "🎵",
    category: "Music",
    listeners: 8300,
    isLive: true,
    href: "/rockin-boogie-content-manager",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "emergency-broadcast",
    name: "Emergency Broadcast",
    description: "Real-time emergency alerts, safety updates, and critical information distribution",
    icon: "🚨",
    category: "Emergency",
    listeners: 5600,
    isLive: false,
    href: "/emergency-alert-system",
    color: "from-red-500 to-rose-600",
  },
  {
    id: "podcast-discovery",
    name: "Podcast Discovery",
    description: "Discover trending podcasts, exclusive interviews, and audio content from creators",
    icon: "🎙️",
    category: "Audio",
    listeners: 15200,
    isLive: true,
    href: "/podcast-discovery",
    color: "from-purple-500 to-indigo-600",
  },
  {
    id: "studio-sessions",
    name: "Studio Sessions",
    description: "Live studio recordings, production insights, and behind-the-scenes content creation",
    icon: "🎬",
    category: "Production",
    listeners: 4100,
    isLive: true,
    href: "/studio",
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: "community-hub",
    name: "Community Hub",
    description: "Connect with listeners, share stories, and build meaningful community connections",
    icon: "👥",
    category: "Community",
    listeners: 9800,
    isLive: true,
    href: "/community",
    color: "from-pink-500 to-rose-600",
  },
];

export function FeaturedHybridCastChannels() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-slate-950/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Featured HybridCast Channels
            </h2>
            <p className="text-muted-foreground text-lg">
              Explore our curated collection of live channels and premium content
            </p>
          </div>
          <Link href="/hybridcast">
            <Button variant="outline" className="hidden sm:flex gap-2">
              View All <ArrowRight size={16} />
            </Button>
          </Link>
        </div>

        {/* Channel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {FEATURED_CHANNELS.map((channel) => (
            <HybridCastChannelCard key={channel.id} channel={channel} />
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-3">
            Discover More Channels
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Access hundreds of live channels, on-demand content, and exclusive broadcasts. 
            Join our growing community of listeners and creators.
          </p>
          <Link href="/hybridcast">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Explore HybridCast Hub
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-12 border-t border-border">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {FEATURED_CHANNELS.reduce((sum, ch) => sum + (ch.listeners || 0), 0).toLocaleString()}
            </div>
            <p className="text-muted-foreground">Active Listeners</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {FEATURED_CHANNELS.filter((ch) => ch.isLive).length}
            </div>
            <p className="text-muted-foreground">Live Channels</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
            <p className="text-muted-foreground">Streaming Available</p>
          </div>
        </div>
      </div>
    </section>
  );
}
