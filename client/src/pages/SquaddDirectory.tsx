import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Search, Users, Mail, Phone, MapPin, Shield, Heart, Radio,
  Zap, BookOpen, ArrowLeft, ExternalLink, MessageSquare, Copy,
  Video, Activity, Filter, Grid, List
} from 'lucide-react';

const missionColors: Record<string, string> = {
  'Elder Advocacy': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  'Music & Culture': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Emergency Response': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'Technology': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  'Community': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Broadcasting': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Legal & Policy': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const missionIcons: Record<string, React.ReactNode> = {
  shield: <Shield className="w-4 h-4" />,
  heart: <Heart className="w-4 h-4" />,
  radio: <Radio className="w-4 h-4" />,
  zap: <Zap className="w-4 h-4" />,
  book: <BookOpen className="w-4 h-4" />,
  users: <Users className="w-4 h-4" />,
};

export default function SquaddDirectory() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMission, setSelectedMission] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: members, isLoading } = trpc.squaddGoals.getMembers.useQuery();

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    return members.filter((m: any) => {
      const matchesSearch = !searchQuery ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.missionArea?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMission = selectedMission === 'all' || m.missionArea === selectedMission;
      return matchesSearch && matchesMission;
    });
  }, [members, searchQuery, selectedMission]);

  const missionAreas = useMemo(() => {
    if (!members) return [];
    const areas = [...new Set(members.map((m: any) => m.missionArea))];
    return areas.sort();
  }, [members]);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success('Email copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E8E0D0]">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#1A1510] to-[#0A0A0A] border-b border-[#D4A843]/20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/squadd')} className="text-[#D4A843]">
              <ArrowLeft className="w-4 h-4 mr-1" /> SQUADD Goals
            </Button>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4A843] to-[#8B6914] flex items-center justify-center">
              <Users className="w-7 h-7 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#D4A843]">SQUADD Member Directory</h1>
              <p className="text-[#E8E0D0]/60">Coalition members, roles, and contact information</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button size="sm" variant="outline" className="border-[#D4A843]/30 text-[#D4A843]" onClick={() => navigate('/meeting')}>
              <Video className="w-4 h-4 mr-1" /> Join Meeting Room
            </Button>
            <Button size="sm" variant="outline" className="border-cyan-500/30 text-cyan-400" onClick={() => navigate('/status')}>
              <Activity className="w-4 h-4 mr-1" /> System Status
            </Button>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E8E0D0]/40" />
            <Input
              placeholder="Search members by name, role, or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#1A1510] border-[#D4A843]/20 text-[#E8E0D0] placeholder:text-[#E8E0D0]/30"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedMission}
              onChange={(e) => setSelectedMission(e.target.value)}
              className="bg-[#1A1510] border border-[#D4A843]/20 rounded-md px-3 py-2 text-sm text-[#E8E0D0]"
            >
              <option value="all">All Mission Areas</option>
              {missionAreas.map((area: string) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
            <div className="flex border border-[#D4A843]/20 rounded-md overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-[#D4A843]/20 text-[#D4A843]' : 'text-[#E8E0D0]/50'}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-[#D4A843]/20 text-[#D4A843]' : 'text-[#E8E0D0]/50'}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex gap-4 mb-6 text-sm text-[#E8E0D0]/60">
          <span>{filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}</span>
          <span>{missionAreas.length} mission areas</span>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-48 bg-[#1A1510] rounded-xl animate-pulse border border-[#D4A843]/10" />
            ))}
          </div>
        )}

        {/* Grid View */}
        {!isLoading && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member: any) => {
              const colorClass = missionColors[member.missionArea] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
              const icon = missionIcons[member.missionIcon] || <Shield className="w-4 h-4" />;
              return (
                <Card
                  key={member.id}
                  className="bg-[#1A1510] border-[#D4A843]/10 hover:border-[#D4A843]/30 transition-all cursor-pointer group"
                  onClick={() => navigate(`/squadd/${member.slug}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {member.photoUrl ? (
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          className="w-16 h-16 rounded-xl object-cover border-2 border-[#D4A843]/20"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#D4A843]/30 to-[#8B6914]/30 flex items-center justify-center border-2 border-[#D4A843]/20">
                          <span className="text-2xl font-bold text-[#D4A843]">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-[#E8E0D0] group-hover:text-[#D4A843] transition-colors truncate">
                          {member.name}
                        </h3>
                        <p className="text-sm text-[#D4A843] truncate">{member.title}</p>
                        {member.organization && (
                          <p className="text-xs text-[#E8E0D0]/50 truncate">{member.organization}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <Badge className={`${colorClass} border text-xs`}>
                        {icon}
                        <span className="ml-1">{member.missionArea}</span>
                      </Badge>
                    </div>

                    <p className="mt-3 text-sm text-[#E8E0D0]/60 line-clamp-2">
                      {member.bio?.substring(0, 120)}...
                    </p>

                    {/* Contact Actions */}
                    <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {member.email && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-[#D4A843]/70 hover:text-[#D4A843] h-8 px-2"
                          onClick={() => handleCopyEmail(member.email)}
                          title="Copy email"
                        >
                          <Mail className="w-3.5 h-3.5 mr-1" />
                          <span className="text-xs">Email</span>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-cyan-400/70 hover:text-cyan-400 h-8 px-2"
                        onClick={() => navigate(`/squadd/${member.slug}`)}
                        title="View full profile"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        <span className="text-xs">Profile</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* List View */}
        {!isLoading && viewMode === 'list' && (
          <div className="space-y-2">
            {filteredMembers.map((member: any) => {
              const colorClass = missionColors[member.missionArea] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-4 bg-[#1A1510] rounded-lg border border-[#D4A843]/10 hover:border-[#D4A843]/30 transition-all cursor-pointer group"
                  onClick={() => navigate(`/squadd/${member.slug}`)}
                >
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-12 h-12 rounded-lg object-cover border border-[#D4A843]/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#D4A843]/30 to-[#8B6914]/30 flex items-center justify-center border border-[#D4A843]/20">
                      <span className="text-lg font-bold text-[#D4A843]">{member.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#E8E0D0] group-hover:text-[#D4A843] transition-colors">{member.name}</h3>
                      <Badge className={`${colorClass} border text-xs`}>{member.missionArea}</Badge>
                    </div>
                    <p className="text-sm text-[#D4A843]">{member.title}</p>
                    {member.organization && <p className="text-xs text-[#E8E0D0]/40">{member.organization}</p>}
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    {member.email && (
                      <Button size="sm" variant="ghost" className="text-[#D4A843]/50 hover:text-[#D4A843] h-8 w-8 p-0" onClick={() => handleCopyEmail(member.email)}>
                        <Mail className="w-4 h-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-cyan-400/50 hover:text-cyan-400 h-8 w-8 p-0" onClick={() => navigate(`/squadd/${member.slug}`)}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredMembers.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-[#D4A843]/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#E8E0D0]/60">No members found</h3>
            <p className="text-sm text-[#E8E0D0]/40 mt-1">Try adjusting your search or filter</p>
          </div>
        )}

        {/* Meeting Room CTA */}
        <div className="mt-12 p-6 bg-gradient-to-r from-[#1A1510] to-[#0F0D08] rounded-xl border border-[#D4A843]/20">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
              <Video className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-[#E8E0D0]">SQUADD Meeting Room</h3>
              <p className="text-sm text-[#E8E0D0]/60">Daily at 7:00 PM CT — Join the permanent SQUADD Zoom meeting</p>
            </div>
            <Button
              className="bg-gradient-to-r from-[#D4A843] to-[#8B6914] text-black font-bold"
              onClick={() => navigate('/meeting')}
            >
              <Video className="w-4 h-4 mr-2" /> Join Meeting
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
