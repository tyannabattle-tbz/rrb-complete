import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { RRBSongBadge } from '@/components/RRBSongBadge';
import { RRB_SONG_LINKS } from '@/lib/rrbSongLinks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Music, Award, Users, BookOpen } from 'lucide-react';

export default function Legacy() {
  const [, setLocation] = useLocation();
  const [expandedYear, setExpandedYear] = useState<number | null>(null);

  const timelineEvents = [
    {
      year: 1971,
      title: 'Musical Journey Begins',
      description: 'Seabrun Candy Hunter signs first recording contract with Rockin Records',
      details: 'Beginning of a legendary career in music production and broadcasting',
      icon: '🎵',
    },
    {
      year: 1975,
      title: 'Payten Music Publishing',
      description: 'Establishes Payten Music (BMI) for publishing and royalty management',
      details: 'Formal registration with Broadcast Music Inc. for all compositions',
      icon: '📝',
    },
    {
      year: 1978,
      title: 'Studio Sessions Peak',
      description: 'Conducts extensive studio recording sessions with multiple artists',
      details: 'Complete documentation of all studio work and production credits',
      icon: '🎙️',
    },
    {
      year: 1980,
      title: 'Radio Broadcasting',
      description: 'Begins radio broadcasting career with extensive airplay',
      details: '5+ years of continuous broadcast logs and listener records',
      icon: '📻',
    },
    {
      year: 1990,
      title: 'Copyright Registration',
      description: 'All compositions registered with U.S. Copyright Office',
      details: 'Complete protection and documentation of intellectual property',
      icon: '©️',
    },
    {
      year: 2024,
      title: 'Legacy Restoration Project',
      description: 'Rockin Rockin Boogie project launches to preserve and restore legacy',
      details: 'Comprehensive archival of all music, documentation, and family history',
      icon: '🏛️',
    },
    {
      year: 2025,
      title: 'Complete Documentation',
      description: 'Full Proof Vault and Legacy site launch with verified records',
      details: 'All documents verified, authenticated, and made publicly accessible',
      icon: '✓',
    },
  ];

  const familyMembers = [
    {
      name: 'Seabrun Candy Hunter',
      role: 'Founder & Musical Legacy',
      description: 'Pioneer musician and broadcaster',
      company: 'Rockin Records / Payten Music',
    },
    {
      name: 'Carlos Kembrel',
      role: 'Son & Business Partner',
      description: 'Managing Little C enterprises',
      company: 'Little C',
    },
    {
      name: 'Sean Hunter',
      role: 'Son & Music Producer',
      description: 'Continuing musical legacy',
      company: "Sean's Music",
    },
    {
      name: 'Tyanna Battle & Luv Russell',
      role: 'Daughters & Entrepreneurs',
      description: 'Building family business empire',
      company: "Anna's",
    },
    {
      name: 'Jaelon Hunter',
      role: 'Son & Enterprise Manager',
      description: 'Managing enterprise operations',
      company: 'Jaelon Enterprises',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-indigo-500/20 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BookOpen className="w-8 h-8 text-indigo-500" />
              <div>
                <h1 className="text-3xl font-bold text-white">Legacy Biography</h1>
                <p className="text-sm text-indigo-300">Complete Timeline & Family History (1971–2025)</p>
              </div>
            </div>
            <Button
              onClick={() => setLocation('/')}
              variant="outline"
              className="border-indigo-500 text-indigo-400"
            >
              ← Back Home
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <Card className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-500/30 mb-12">
          <CardContent className="pt-8">
            <h2 className="text-3xl font-bold text-white mb-4">Seabrun Candy Hunter</h2>
            <p className="text-lg text-indigo-100 mb-6">
              A pioneering musician, broadcaster, and visionary who shaped the landscape of American music from 1971 to the present day. This comprehensive biography documents every milestone, achievement, and contribution to the musical and broadcasting industries.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-indigo-400">54+</div>
                <p className="text-sm text-slate-400">Years of Legacy</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">1000+</div>
                <p className="text-sm text-slate-400">Compositions</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-pink-400">100%</div>
                <p className="text-sm text-slate-400">Documented</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">5</div>
                <p className="text-sm text-slate-400">Children</p>
              </div>
            </div>
            <div className="mt-6">
              <RRBSongBadge variant="full" showTitle />
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
            <Music className="w-6 h-6 text-indigo-500" />
            Complete Timeline
          </h2>

          <div className="space-y-4">
            {timelineEvents.map((event, idx) => (
              <Card
                key={idx}
                className="bg-slate-800/50 border-indigo-500/20 hover:border-indigo-500/50 transition-all cursor-pointer"
                onClick={() => setExpandedYear(expandedYear === event.year ? null : event.year)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-3xl flex-shrink-0">{event.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-indigo-600/30 border-indigo-500 text-indigo-300">
                            {event.year}
                          </Badge>
                          <h3 className="font-semibold text-white">{event.title}</h3>
                        </div>
                        <p className="text-sm text-slate-300">{event.description}</p>
                        {expandedYear === event.year && (
                          <div className="mt-4 p-4 bg-slate-700/30 rounded-lg border border-indigo-500/20">
                            <p className="text-sm text-slate-200">{event.details}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {expandedYear === event.year ? (
                        <ChevronUp className="w-5 h-5 text-indigo-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Family & Business */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Family & Canryn Production Subsidiaries
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {familyMembers.map((member, idx) => (
              <Card key={idx} className="bg-slate-800/50 border-indigo-500/20 hover:border-indigo-500/50 transition-all">
                <CardHeader>
                  <CardTitle className="text-white">{member.name}</CardTitle>
                  <CardDescription className="text-indigo-300">{member.role}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-300">{member.description}</p>
                  <Badge className="bg-indigo-600/30 border-indigo-500 text-indigo-300 w-fit">
                    {member.company}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Key Achievements */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-500" />
            Key Achievements & Milestones
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white">Recording Industry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-300">
                <p>✓ 1000+ original compositions</p>
                <p>✓ Multiple platinum records</p>
                <p>✓ BMI publishing registration</p>
                <p>✓ Copyright protection (1972–1990)</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white">Broadcasting Legacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-300">
                <p>✓ 24/7 radio broadcasting</p>
                <p>✓ 5+ years of continuous airplay</p>
                <p>✓ Solfeggio frequency innovation</p>
                <p>✓ 54-channel streaming platform</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white">Community Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-300">
                <p>✓ Sweet Miracles 501(c)(3) & 508</p>
                <p>✓ Emergency broadcast systems</p>
                <p>✓ Community healing frequencies</p>
                <p>✓ Solbones game development</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white">Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-300">
                <p>✓ 100% verified records</p>
                <p>✓ Wayback Machine archival</p>
                <p>✓ Blockchain authentication</p>
                <p>✓ Complete proof vault</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border-indigo-500/30">
          <CardContent className="pt-8">
            <h3 className="text-xl font-bold text-white mb-4">Explore the Complete Legacy</h3>
            <p className="text-slate-300 mb-6">
              Every aspect of Seabrun Candy Hunter's musical and broadcasting legacy is documented and verified in the Proof Vault. Access all original contracts, recordings, broadcast logs, and family documentation.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => setLocation('/proof')}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                View Proof Vault
              </Button>
              <Button
                onClick={() => setLocation('/music')}
                variant="outline"
                className="border-indigo-500 text-indigo-400"
              >
                Listen to Music
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-indigo-500/20 bg-slate-900/50 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p className="text-sm">A Canryn Production and its subsidiaries</p>
          <p className="text-xs mt-2">"A Voice for the Voiceless" — Sweet Miracles 501(c)(3) & 508</p>
        </div>
      </footer>
    </div>
  );
}
