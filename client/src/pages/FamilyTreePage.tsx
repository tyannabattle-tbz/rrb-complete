import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Star, ArrowLeft, ChevronDown, ChevronRight, Heart, Calendar } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function FamilyTreePage() {
  const [expandedMember, setExpandedMember] = useState<number | null>(null);
  
  const { data: allMembers = [], isLoading } = trpc.chunk5.familyTree.list.useQuery();
  const { data: keyFigures = [] } = trpc.chunk5.familyTree.keyFigures.useQuery();
  const { data: roots = [] } = trpc.chunk5.familyTree.roots.useQuery();

  // Group members by generation
  const generations = allMembers.reduce((acc, member) => {
    const gen = member.generation ?? 0;
    if (!acc[gen]) acc[gen] = [];
    acc[gen].push(member);
    return acc;
  }, {} as Record<number, typeof allMembers>);

  const generationLabels: Record<number, string> = {
    0: 'Founders & Ancestors',
    1: 'First Generation',
    2: 'Second Generation',
    3: 'Third Generation',
    4: 'Fourth Generation',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a1a] via-[#1a1025] to-[#0f0a1a]">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0f0a1a]/85 border-b border-purple-900/30">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-lg text-white">Family Legacy</span>
            <span className="text-sm text-purple-300/70 hidden sm:inline">Canryn Production Heritage</span>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-purple-300/60 hover:text-amber-400">
              <ArrowLeft className="w-4 h-4 mr-1" /> Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="py-8">
        <div className="container max-w-6xl">
          {/* Hero */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              The Family Tree
            </h1>
            <p className="text-purple-200/60 text-base max-w-2xl mx-auto">
              Honoring the legacy of those who came before, celebrating those who carry it forward. 
              Every branch tells a story of resilience, creativity, and love.
            </p>
          </div>

          {/* Key Figures */}
          {keyFigures.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                <Star className="w-4 h-4" /> Key Figures
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {keyFigures.map(member => (
                  <Card key={member.id} className="bg-gradient-to-b from-amber-500/10 to-purple-900/30 border-amber-500/20 hover:border-amber-500/40 transition">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/30 to-purple-600/30 flex items-center justify-center text-amber-400 font-bold text-lg">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <CardTitle className="text-white text-base">{member.name}</CardTitle>
                          {member.nickname && <p className="text-amber-300/60 text-xs">"{member.nickname}"</p>}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {member.relationship && (
                        <Badge className="bg-purple-500/20 text-purple-300 text-xs mb-2">{member.relationship}</Badge>
                      )}
                      <div className="flex items-center gap-2 text-xs text-purple-300/40 mb-2">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {member.birthYear ? `b. ${member.birthYear}` : ''}
                          {member.deathYear ? ` — d. ${member.deathYear}` : ''}
                        </span>
                      </div>
                      {member.bio && <p className="text-purple-200/50 text-xs line-clamp-3">{member.bio}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Generational Tree */}
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-purple-400" /> Family Generations
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-20 bg-purple-900/20 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : allMembers.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
              <p className="text-purple-200/50 text-lg mb-2">Family tree is being assembled</p>
              <p className="text-purple-300/30 text-sm">Family members will appear here as they are added by the administrator.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(generations)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([gen, members]) => (
                  <div key={gen}>
                    <h3 className="text-sm font-semibold text-purple-300/60 mb-3 uppercase tracking-wider">
                      {generationLabels[Number(gen)] || `Generation ${gen}`}
                    </h3>
                    <div className="space-y-2">
                      {members.map(member => (
                        <Card
                          key={member.id}
                          className="bg-gradient-to-r from-purple-900/20 to-purple-950/40 border-purple-700/15 hover:border-purple-600/30 transition cursor-pointer"
                          onClick={() => setExpandedMember(expandedMember === member.id ? null : member.id)}
                        >
                          <CardContent className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-700/30 flex items-center justify-center text-purple-300 font-bold text-sm shrink-0">
                                {member.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-medium text-sm">{member.name}</span>
                                  {member.nickname && <span className="text-purple-300/40 text-xs">"{member.nickname}"</span>}
                                  {member.isKeyFigure && <Star className="w-3 h-3 text-amber-400" />}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-purple-300/40">
                                  {member.relationship && <span>{member.relationship}</span>}
                                  {member.birthYear && <span>b. {member.birthYear}</span>}
                                  {member.deathYear && <span>— d. {member.deathYear}</span>}
                                </div>
                              </div>
                              {expandedMember === member.id ? (
                                <ChevronDown className="w-4 h-4 text-purple-400/40" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-purple-400/40" />
                              )}
                            </div>
                            {expandedMember === member.id && member.bio && (
                              <div className="mt-3 pt-3 border-t border-purple-700/20">
                                <p className="text-purple-200/50 text-xs leading-relaxed">{member.bio}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-10 p-4 border border-dashed border-purple-500/20 rounded-xl text-purple-300/40 text-xs">
            <strong className="text-purple-200/60">Legal Notice:</strong> Family information is maintained with the utmost respect for privacy and accuracy. 
            Content is curated by authorized family members and the Canryn Production editorial team. 
            If you believe any information is inaccurate, please contact the administrator. 
            &copy; {new Date().getFullYear()} Canryn Production. All rights reserved. This content is protected under applicable copyright and privacy laws.
          </div>
        </div>
      </main>
    </div>
  );
}
