import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  Shield,
  Globe,
  Users,
  TrendingUp,
  Briefcase,
  BookOpen,
  Gamepad2,
  DollarSign,
  Scale,
  Landmark,
  ChevronRight,
  Play,
  ExternalLink,
} from "lucide-react";

const LAWS_VIDEO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/UN_CSW70_TightTiming_d8c2e738.mp4";

const sdgGoals = [
  { number: 8, title: "Decent Work & Economic Growth", color: "bg-red-600" },
  { number: 10, title: "Reduced Inequalities", color: "bg-pink-600" },
  { number: 17, title: "Partnerships for the Goals", color: "bg-blue-800" },
];

const systemComponents = [
  {
    icon: <Scale size={24} />,
    title: "L.A.W.S. Framework",
    subtitle: "Land · Air · Water · Self",
    description: "Human development pillars for generational prosperity",
  },
  {
    icon: <GraduationCap size={24} />,
    title: "The Academy",
    subtitle: "Youth → Leadership",
    description: "Education pathway for entrepreneurship and financial literacy (K-12 through Adulthood)",
  },
  {
    icon: <Briefcase size={24} />,
    title: "Business Simulator",
    subtitle: "Idea → Operations",
    description: "AI-assisted entrepreneurship pipeline with USPTO search, SWOT, entity formation",
  },
  {
    icon: <Shield size={24} />,
    title: "LuvLedger Engine",
    subtitle: "227 Safeguards",
    description: "Human-supervised AI decision infrastructure — the LuvLedger illuminates, the human decides",
  },
  {
    icon: <Building2 size={24} />,
    title: "House-Trust System",
    subtitle: "Generational Wealth",
    description: "Asset ownership, property infrastructure, and blockchain-recorded transactions",
  },
  {
    icon: <Users size={24} />,
    title: "19 Department Dashboards",
    subtitle: "Real Operations",
    description: "Live data feeds, compliance tools, team management — not mockups",
  },
];

const careerStages = [
  { stage: "01", title: "W-2 Employee", subtitle: "Foundation & Training", details: "Full benefits, mentorship, skill certification, 90/10 salary structure" },
  { stage: "02", title: "Contractor", subtitle: "Independence & Premium", details: "Independent operation, premium rates, quality-verified status" },
  { stage: "03", title: "Business Owner", subtitle: "Entity Formation", details: "Own LLC or S-Corp, revenue generation, community reinvestment" },
  { stage: "04", title: "House Member", subtitle: "Generational Wealth", details: "Trust governance, collective investment pools, heir designation" },
];

const platformStats = [
  { value: "1,100+", label: "Tests Passing" },
  { value: "350+", label: "Database Tables" },
  { value: "120+", label: "API Routes" },
  { value: "118+", label: "Application Pages" },
  { value: "19", label: "Department Dashboards" },
  { value: "40+", label: "Educational Games" },
];

export default function LAWSCollective() {
  const [, navigate] = useLocation();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0a0a1a]/95 backdrop-blur border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-amber-400 hover:text-amber-300">
              <ArrowLeft size={16} className="mr-1" /> Back
            </Button>
            <div className="h-6 w-px bg-amber-500/30" />
            <h1 className="text-lg font-bold text-amber-400">L.A.W.S. Collective</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">System Under Construction</Badge>
            <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-400" onClick={() => navigate("/csw70")}>
              CSW70 Campaign <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 mb-6">
            Presented to the United Nations
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <span className="text-amber-400">L</span>·<span className="text-amber-400">A</span>·<span className="text-amber-400">W</span>·<span className="text-amber-400">S</span>
          </h1>
          <p className="text-2xl text-gray-300 mb-2">Land · Air · Water · Self</p>
          <p className="text-lg text-purple-300 mb-8">A Complete Sovereign Wealth Operating System</p>
          <p className="text-sm text-gray-400 mb-8">LuvOnPurpose Outreach Temple and Academy Society</p>

          {/* SDG Goals */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            {sdgGoals.map((sdg) => (
              <div key={sdg.number} className={`${sdg.color} px-4 py-2 rounded-lg text-white text-sm font-semibold`}>
                SDG {sdg.number}: {sdg.title}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-xl overflow-hidden border border-amber-500/30 bg-black">
            <video
              controls
              className="w-full aspect-video"
              poster=""
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
            >
              <source src={LAWS_VIDEO_URL} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <p className="text-center text-gray-500 text-xs mt-2">
            L.A.W.S. Collective Presentation — LuvOnPurpose Outreach Temple and Academy Society — A Canryn Production
          </p>
        </div>
      </section>

      {/* The Challenge */}
      <section className="py-16 px-4 bg-gradient-to-r from-red-900/20 to-transparent">
        <div className="max-w-6xl mx-auto">
          <Badge className="bg-red-500/20 text-red-400 border-red-500/50 mb-4">THE CHALLENGE</Badge>
          <h2 className="text-4xl font-bold text-white mb-6">300 Million Jobs at Risk</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-black/40 rounded-xl p-6 border border-red-500/20">
              <p className="text-4xl font-bold text-red-400 mb-2">300M+</p>
              <p className="text-gray-300">Jobs exposed to AI automation globally</p>
              <p className="text-xs text-gray-500 mt-2">Goldman Sachs, 2023</p>
            </div>
            <div className="bg-black/40 rounded-xl p-6 border border-red-500/20">
              <p className="text-4xl font-bold text-red-400 mb-2">80%</p>
              <p className="text-gray-300">Of US workforce will have tasks affected by AI</p>
              <p className="text-xs text-gray-500 mt-2">Brookings Institution</p>
            </div>
            <div className="bg-black/40 rounded-xl p-6 border border-red-500/20">
              <p className="text-4xl font-bold text-red-400 mb-2">$0</p>
              <p className="text-gray-300">Platforms connecting employment to collective wealth</p>
              <p className="text-xs text-gray-500 mt-2">Market gap identified</p>
            </div>
          </div>
          <blockquote className="border-l-4 border-amber-500 pl-4 text-lg text-amber-300 italic">
            "We didn't just identify the problem — we built the solution."
          </blockquote>
        </div>
      </section>

      {/* Employment-First AI Vision */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 mb-4">OUR VISION</Badge>
          <h2 className="text-4xl font-bold text-white mb-12">Employment-First AI</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={28} className="text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-amber-400 mb-2">AI Enhances</h3>
              <p className="text-gray-300">Technology amplifies human capability, not replaces it. AI handles complexity; humans make decisions.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Users size={28} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-purple-400 mb-2">Humans Decide</h3>
              <p className="text-gray-300">Every significant decision remains with people. AI illuminates options; humans choose the path.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Globe size={28} className="text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2">Systems Serve</h3>
              <p className="text-gray-300">Infrastructure exists to create jobs, build wealth, and serve communities — not extract value.</p>
            </div>
          </div>
        </div>
      </section>

      {/* System Components */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-900/20 to-transparent">
        <div className="max-w-6xl mx-auto">
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 mb-4">WHAT IS THE L.A.W.S. COLLECTIVE</Badge>
          <h2 className="text-4xl font-bold text-white mb-4">A Human-Centered Economic Operating System</h2>
          <p className="text-gray-400 mb-12">Not a concept. A complete economic operating system.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemComponents.map((comp, i) => (
              <div key={i} className="bg-black/40 rounded-xl p-6 border border-purple-500/20 hover:border-amber-500/40 transition-colors">
                <div className="text-amber-400 mb-3">{comp.icon}</div>
                <h3 className="text-lg font-bold text-white mb-1">{comp.title}</h3>
                <p className="text-amber-400 text-sm mb-2">{comp.subtitle}</p>
                <p className="text-gray-400 text-sm">{comp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Pipeline */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 mb-4">CAREER PIPELINE</Badge>
          <h2 className="text-4xl font-bold text-white mb-12">W-2 → Contractor → Business Owner → House Member</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {careerStages.map((stage) => (
              <div key={stage.stage} className="relative bg-black/40 rounded-xl p-6 border border-blue-500/20">
                <div className="text-3xl font-bold text-blue-400/30 mb-2">STAGE {stage.stage}</div>
                <h3 className="text-lg font-bold text-white mb-1">{stage.title}</h3>
                <p className="text-amber-400 text-sm mb-2">{stage.subtitle}</p>
                <p className="text-gray-400 text-xs">{stage.details}</p>
                {stage.stage !== "04" && (
                  <ChevronRight size={20} className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400/30 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-16 px-4 bg-gradient-to-r from-amber-900/20 to-transparent">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 mb-4">WHAT WE BUILT</Badge>
          <h2 className="text-4xl font-bold text-white mb-4">A Complete Operating System</h2>
          <p className="text-gray-400 mb-12">This is not a concept deck — this is a production-grade platform.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {platformStats.map((stat, i) => (
              <div key={i} className="bg-black/40 rounded-xl p-4 border border-amber-500/20">
                <p className="text-2xl font-bold text-amber-400">{stat.value}</p>
                <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 flex-wrap">
            {["REACT", "tRPC", "DRIZZLE", "STRIPE", "BLOCKCHAIN"].map((tech) => (
              <Badge key={tech} className="bg-purple-500/20 text-purple-300 border-purple-500/50">{tech}</Badge>
            ))}
          </div>
          <p className="text-lg text-amber-400 font-semibold mt-8">Not a prototype. A sovereign operating system.</p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Building Wealth. Creating Jobs. Serving Humanity.</h2>
          <p className="text-lg text-gray-300 mb-8">
            This is a movement — not a product. We are seeking partners — governments, institutions, organizations, and communities — 
            to join us in building the infrastructure for employment-first AI and generational wealth creation.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => navigate("/csw70")}>
              <Globe size={16} className="mr-2" /> CSW70 Campaign
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => navigate("/donate")}>
              <DollarSign size={16} className="mr-2" /> Support the Mission
            </Button>
            <Button variant="outline" className="border-amber-500/30 text-amber-400" onClick={() => navigate("/squadd")}>
              <Users size={16} className="mr-2" /> SQUADD Goals
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-amber-500/20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} LuvOnPurpose Outreach Temple and Academy Society — A Canryn Production and its subsidiaries
          </p>
          <p className="text-gray-600 text-xs mt-2">
            All content is protected under applicable copyright laws. Employment-First AI — The LuvLedger illuminates, the human decides.
          </p>
        </div>
      </footer>
    </div>
  );
}
