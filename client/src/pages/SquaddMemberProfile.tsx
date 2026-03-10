import { useRoute, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Mail, Shield, Leaf, Home, Radio, Accessibility,
  Scale, Cpu, ChevronRight, ExternalLink, Heart
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Shield: <Shield className="w-8 h-8" />,
  Leaf: <Leaf className="w-8 h-8" />,
  Home: <Home className="w-8 h-8" />,
  Radio: <Radio className="w-8 h-8" />,
  Accessibility: <Accessibility className="w-8 h-8" />,
  Scale: <Scale className="w-8 h-8" />,
  Cpu: <Cpu className="w-8 h-8" />,
};

const missionColors: Record<string, string> = {
  'Elder Protection & Technology': 'from-amber-600 to-yellow-500',
  'Agriculture & Environmental Justice': 'from-green-600 to-emerald-500',
  'Community Development & Housing': 'from-blue-600 to-cyan-500',
  'Media & Communications Justice': 'from-pink-600 to-rose-500',
  'Disability Rights & Advocacy': 'from-purple-600 to-violet-500',
  'Elder Protection & Legal Justice': 'from-red-700 to-orange-500',
  'Justice & Technology Innovation': 'from-indigo-600 to-blue-500',
};

export default function SquaddMemberProfile() {
  const [, params] = useRoute('/squadd/:slug');
  const [, setLocation] = useLocation();
  const slug = params?.slug || '';

  const { data: member, isLoading } = trpc.squaddGoals.getMemberBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D4A843] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#E8E0D0]/60">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-[#D4A843]/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#E8E0D0] mb-2">Member Not Found</h2>
          <p className="text-[#E8E0D0]/60 mb-6">This SQUADD member profile could not be found.</p>
          <Button onClick={() => setLocation('/squadd')} className="bg-[#D4A843] text-[#0A0A0A]">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to SQUADD Goals
          </Button>
        </div>
      </div>
    );
  }

  const gradient = missionColors[member.missionArea] || 'from-amber-600 to-yellow-500';
  const icon = iconMap[member.missionIcon] || <Shield className="w-8 h-8" />;
  const focusAreas = (member.focusAreas as string[]) || [];
  const achievements = (member.achievements as string[]) || [];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0A0A]" />
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#D4A843]/20 to-transparent" />

        <div className="relative container mx-auto px-4 pt-8 pb-16">
          <Button
            onClick={() => setLocation('/squadd')}
            variant="ghost"
            className="text-[#D4A843] hover:bg-[#D4A843]/10 mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to SQUADD Goals
          </Button>

          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Icon / Avatar */}
              <div className={`flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
                {icon}
              </div>

              <div className="flex-1">
                <Badge className="mb-3 bg-[#D4A843]/10 text-[#D4A843] border-[#D4A843]/30">
                  SQUADD Goals Coalition
                </Badge>
                <h1 className="text-3xl md:text-5xl font-bold text-[#E8E0D0] mb-2">
                  {member.name}
                </h1>
                <p className="text-lg text-[#D4A843] font-semibold mb-1">{member.title}</p>
                {member.organization && (
                  <p className="text-base text-[#E8E0D0]/60 mb-4">{member.organization}</p>
                )}
                <Badge className={`bg-gradient-to-r ${gradient} text-white border-0 text-sm px-4 py-1`}>
                  {member.missionArea}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      {member.quote && (
        <section className="border-t border-[#D4A843]/10 bg-[#0D0D0D]">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto text-center">
              <div className="text-5xl text-[#D4A843]/30 mb-4">"</div>
              <blockquote className="text-xl md:text-2xl text-[#E8E0D0]/80 italic leading-relaxed">
                {member.quote}
              </blockquote>
              <div className="mt-4 text-[#D4A843] font-semibold">— {member.name}</div>
            </div>
          </div>
        </section>
      )}

      {/* Biography */}
      <section className="border-t border-[#D4A843]/10">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#D4A843] mb-6">About</h2>
            <p className="text-lg text-[#E8E0D0]/80 leading-relaxed whitespace-pre-line">
              {member.bio}
            </p>
          </div>
        </div>
      </section>

      {/* Focus Areas */}
      {focusAreas.length > 0 && (
        <section className="border-t border-[#D4A843]/10 bg-[#0D0D0D]">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-[#D4A843] mb-8">Focus Areas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {focusAreas.map((area, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-[#111111] border border-[#D4A843]/10 rounded-lg">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient}`} />
                    <span className="text-[#E8E0D0]/80">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <section className="border-t border-[#D4A843]/10">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-[#D4A843] mb-8">Achievements</h2>
              <div className="space-y-3">
                {achievements.map((achievement, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-[#0D0D0D] border border-[#D4A843]/10 rounded-lg">
                    <ChevronRight className="w-5 h-5 text-[#D4A843] flex-shrink-0 mt-0.5" />
                    <span className="text-[#E8E0D0]/80">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact & CTA */}
      <section className="border-t border-[#D4A843]/10 bg-[#0D0D0D]">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-[#D4A843] mb-6">Join the Mission</h2>
            <p className="text-[#E8E0D0]/60 mb-8 max-w-xl mx-auto">
              Support {member.name}'s work in {member.missionArea}. Every contribution strengthens the SQUADD Goals coalition.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                onClick={() => setLocation('/donate')}
                className="bg-gradient-to-r from-[#D4A843] to-[#E8C860] text-[#0A0A0A] hover:opacity-90 font-bold px-8"
                size="lg"
              >
                <Heart className="w-4 h-4 mr-2" /> Support the Mission
              </Button>
              {member.email && (
                <Button
                  onClick={() => window.location.href = `mailto:${member.email}`}
                  variant="outline"
                  className="border-[#D4A843]/50 text-[#D4A843] hover:bg-[#D4A843]/10 px-8"
                  size="lg"
                >
                  <Mail className="w-4 h-4 mr-2" /> Contact
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="border-t border-[#D4A843]/10">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-[#E8E0D0]/40">
            Sweet Miracles 501(c)(3) & 508 | Canryn Production and Its Subsidiaries
          </p>
          <p className="text-xs text-[#E8E0D0]/30 mt-2">
            A Voice for the Voiceless — In Honor of Seabrun Candy Hunter
          </p>
          <p className="text-xs text-purple-400/50 mt-1">
            Founded by Ty Battle (Ty Bat Zan) &bull; Digital Steward &bull; TBZ-OS &bull; QUMUS Powered
          </p>
        </div>
      </section>
    </div>
  );
}
