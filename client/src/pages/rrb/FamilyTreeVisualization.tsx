/**
 * Family Tree Visualization - Hunter Family Lineage & Business Affiliations
 * Shows Seabrun Whitney Hunter Sr. → Seabrun Candy Hunter → Children with company roles
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Building2, Music, Briefcase, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'wouter';

export default function FamilyTreeVisualization() {
  const [expandedNode, setExpandedNode] = useState<string | null>('candy');

  const toggleNode = (nodeId: string) => {
    setExpandedNode(expandedNode === nodeId ? null : nodeId);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-rose-950/40 via-stone-950 to-stone-950 border-b border-rose-900/30 py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-900/15 via-transparent to-transparent" />
        <div className="relative container mx-auto px-4">
          <div className="text-center">
            <Badge className="bg-rose-700 text-white mb-4 text-sm px-4 py-1 inline-flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              Family Lineage & Business Structure
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-rose-100 mb-4">
              The Hunter Family Tree
            </h1>
            <p className="text-lg text-rose-200/80 max-w-2xl mx-auto">
              Three generations of vision, leadership, and entrepreneurship
            </p>
          </div>
        </div>
      </section>

      {/* Family Tree Visualization */}
      <section className="bg-stone-950 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Generation 1: Seabrun Whitney Hunter Sr. */}
          <div className="mb-12">
            <div className="flex justify-center mb-8">
              <Card className="bg-stone-900/60 border-amber-700/50 w-full max-w-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Badge className="bg-amber-700 text-white mb-3 inline-block">Generation 1 — Patriarch</Badge>
                    <h2 className="text-2xl font-bold text-amber-100 mb-2">Seabrun Whitney Hunter Sr.</h2>
                    <p className="text-amber-200/70 text-sm mb-4">October 13, 1924 — February 8, 1978</p>
                    <p className="text-stone-300 text-sm mb-4">
                      Founder of the Hunter family business ecosystem. Industrial worker, civic duty advocate, and family foundation builder.
                    </p>
                    <Link href="/rrb/seabrun-whitney-hunter-sr">
                      <Button variant="outline" className="w-full">
                        View Full Biography
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Connector line */}
            <div className="flex justify-center mb-8">
              <div className="w-1 h-12 bg-gradient-to-b from-amber-600 to-rose-600"></div>
            </div>
          </div>

          {/* Generation 2: Seabrun Candy Hunter */}
          <div className="mb-12">
            <div className="flex justify-center mb-8">
              <Card className="bg-stone-900/60 border-rose-700/50 w-full max-w-sm cursor-pointer hover:border-rose-600 transition-colors" onClick={() => toggleNode('candy')}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Badge className="bg-rose-700 text-white mb-3 inline-block">Generation 2 — Visionary</Badge>
                    <h2 className="text-2xl font-bold text-rose-100 mb-2">Seabrun "Candy" Hunter</h2>
                    <p className="text-rose-200/70 text-sm mb-4">Hall of Fame Songwriter, Singer, Author</p>
                    <p className="text-stone-300 text-sm mb-4">
                      Founded Canryn Production Inc. and seven subsidiary companies. Built the RRB ecosystem with QUMUS autonomous orchestration.
                    </p>
                    <div className="flex gap-2 justify-center mb-4">
                      <Badge variant="secondary" className="text-xs">Founder</Badge>
                      <Badge variant="secondary" className="text-xs">Visionary</Badge>
                      <Badge variant="secondary" className="text-xs">Entrepreneur</Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleNode('candy');
                      }}
                    >
                      {expandedNode === 'candy' ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-2" />
                          Hide Children
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-2" />
                          Show Children & Companies
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Connector line */}
            {expandedNode === 'candy' && (
              <div className="flex justify-center mb-8">
                <div className="w-1 h-12 bg-gradient-to-b from-rose-600 to-sky-600"></div>
              </div>
            )}
          </div>

          {/* Generation 3: Children & Companies */}
          {expandedNode === 'candy' && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-sky-100 text-center mb-8">Generation 3 — Operators & Leaders</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sean Hunter - Sean's Music */}
                <Card className="bg-stone-900/60 border-sky-700/50">
                  <CardHeader>
                    <CardTitle className="text-sky-100 flex items-center gap-2">
                      <Music className="w-5 h-5 text-sky-400" />
                      Sean Hunter
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-stone-800/50 rounded-lg p-4">
                      <p className="text-sky-300 font-semibold mb-2 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Sean's Music
                      </p>
                      <p className="text-stone-300 text-sm">Music Production & Recording</p>
                      <p className="text-stone-400 text-xs mt-2">Founded by Seabrun Candy Hunter</p>
                      <p className="text-stone-400 text-xs">Operated by Sean Hunter</p>
                    </div>
                    <Link href="/rrb/seans-music">
                      <Button variant="outline" className="w-full text-xs">
                        View Company
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Jaelon Hunter - Jaelon Enterprises */}
                <Card className="bg-stone-900/60 border-sky-700/50">
                  <CardHeader>
                    <CardTitle className="text-sky-100 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-sky-400" />
                      Jaelon Hunter
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-stone-800/50 rounded-lg p-4">
                      <p className="text-sky-300 font-semibold mb-2 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Jaelon Enterprises
                      </p>
                      <p className="text-stone-300 text-sm">Business Development & Ventures</p>
                      <p className="text-stone-400 text-xs mt-2">Founded by Seabrun Candy Hunter</p>
                      <p className="text-stone-400 text-xs">Operated by Jaelon Hunter</p>
                    </div>
                    <Link href="/rrb/jaelon-enterprises">
                      <Button variant="outline" className="w-full text-xs">
                        View Company
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Anna's (Tyanna & LaShanna) */}
                <Card className="bg-stone-900/60 border-sky-700/50">
                  <CardHeader>
                    <CardTitle className="text-sky-100 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-sky-400" />
                      Tyanna & LaShanna
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-stone-800/50 rounded-lg p-4">
                      <p className="text-sky-300 font-semibold mb-2 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Anna's
                      </p>
                      <p className="text-stone-300 text-sm">Community & Wellness</p>
                      <p className="text-stone-400 text-xs mt-2">Founded by Seabrun Candy Hunter</p>
                      <p className="text-stone-400 text-xs">Operated by Tyanna Battle & LaShanna Russell</p>
                    </div>
                    <Link href="/rrb/annas">
                      <Button variant="outline" className="w-full text-xs">
                        View Company
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Little C Recording */}
                <Card className="bg-stone-900/60 border-sky-700/50">
                  <CardHeader>
                    <CardTitle className="text-sky-100 flex items-center gap-2">
                      <Music className="w-5 h-5 text-sky-400" />
                      Little C Recording
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-stone-800/50 rounded-lg p-4">
                      <p className="text-sky-300 font-semibold mb-2 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Little C Recording
                      </p>
                      <p className="text-stone-300 text-sm">Youth & Education Initiatives</p>
                      <p className="text-stone-400 text-xs mt-2">Founded by Seabrun Candy Hunter</p>
                    </div>
                    <Link href="/rrb/little-c">
                      <Button variant="outline" className="w-full text-xs">
                        View Company
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>

              {/* Supporting Companies */}
              <div className="mt-8 bg-stone-900/40 rounded-lg p-6 border border-stone-800/50">
                <h4 className="text-lg font-semibold text-sky-100 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Supporting Companies (Founded by Seabrun Candy Hunter)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-stone-800/50 rounded p-4">
                    <p className="text-sky-300 font-semibold mb-1">Canryn Publishing Co.</p>
                    <p className="text-stone-300 text-sm">Music Publishing & Rights Administration</p>
                  </div>
                  <div className="bg-stone-800/50 rounded p-4">
                    <p className="text-sky-300 font-semibold mb-1">Seasha Distribution Co.</p>
                    <p className="text-stone-300 text-sm">Physical & Digital Distribution</p>
                  </div>
                  <div className="bg-stone-800/50 rounded p-4">
                    <p className="text-sky-300 font-semibold mb-1">Honest Promotion</p>
                    <p className="text-stone-300 text-sm">Promotion & Marketing</p>
                  </div>
                  <div className="bg-stone-800/50 rounded p-4">
                    <p className="text-sky-300 font-semibold mb-1">Canryn Production Inc.</p>
                    <p className="text-stone-300 text-sm">Parent Company & Ecosystem Hub</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Summary Section */}
      <section className="bg-stone-900/50 py-16 border-t border-stone-800/50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-rose-100 mb-8 text-center">The Hunter Family Legacy Structure</h2>
          
          <div className="space-y-6 text-stone-300">
            <p>
              The Hunter family business ecosystem represents three generations of vision and entrepreneurship. Seabrun Whitney Hunter Sr. established the foundation of family values and work ethic. His son, Seabrun "Candy" Hunter, transformed that foundation into a thriving business ecosystem with seven subsidiary companies.
            </p>

            <p>
              Each child operates their own company, built on the vision and structure their father created. This model ensures that the Hunter family legacy continues to grow while maintaining the core values of quality, integrity, and community service.
            </p>

            <div className="bg-stone-800/40 rounded-lg p-6 border border-stone-800/50">
              <p className="text-rose-200 font-semibold mb-3">Key Principle:</p>
              <p className="text-stone-300">
                All companies were <strong>founded by Seabrun Candy Hunter</strong>. The children are the current <strong>operators and leaders</strong> of their respective enterprises, continuing the legacy of excellence and innovation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
