/**
 * Business Partnerships - Partnership Opportunities with Canryn Production
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake, Building2, Music, Radio, Heart, Globe, Cpu, BookOpen, ArrowRight, Mail } from 'lucide-react';
import { Link } from 'wouter';

const partnershipTypes = [
  {
    title: 'Media & Broadcasting',
    description: 'Partner with RRB Radio and our broadcasting network to reach audiences through legacy music, healing frequencies, and community-focused content.',
    icon: Radio,
    opportunities: ['Co-branded radio programming', 'Content syndication', 'Cross-platform promotion', 'Podcast collaboration'],
  },
  {
    title: 'Music Industry',
    description: 'Collaborate on music production, distribution, licensing, and rights management to ensure fair recognition for all artists.',
    icon: Music,
    opportunities: ['Music licensing agreements', 'Catalog distribution', 'Artist rights advocacy', 'Joint production ventures'],
  },
  {
    title: 'Technology',
    description: 'Work with our QUMUS autonomous orchestration platform and HybridCast emergency broadcast system to build resilient community infrastructure.',
    icon: Cpu,
    opportunities: ['QUMUS integration partnerships', 'HybridCast deployment', 'Emergency broadcast networks', 'Platform development'],
  },
  {
    title: 'Community & Nonprofit',
    description: 'Join Sweet Miracles in providing essential services to underserved communities — from emergency communication to creative arts programs.',
    icon: Heart,
    opportunities: ['Community outreach programs', 'Grant collaboration', 'Volunteer coordination', 'Educational initiatives'],
  },
  {
    title: 'Publishing & Education',
    description: 'Partner on educational content, books, documentaries, and archival projects that preserve and share the legacy.',
    icon: BookOpen,
    opportunities: ['Documentary co-production', 'Educational curriculum', 'Book publishing', 'Archival partnerships'],
  },
  {
    title: 'Corporate & Brand',
    description: 'Align your brand with a mission of legacy preservation, community empowerment, and cultural justice.',
    icon: Building2,
    opportunities: ['Brand sponsorship', 'Corporate social responsibility', 'Event sponsorship', 'Cause marketing'],
  },
];

const tiers = [
  {
    name: 'Community Partner',
    color: 'border-blue-500/30 bg-blue-500/5',
    badge: 'text-blue-500',
    features: ['Logo on partner page', 'Newsletter mention', 'Community event access', 'Quarterly impact report'],
  },
  {
    name: 'Legacy Partner',
    color: 'border-amber-500/30 bg-amber-500/5',
    badge: 'text-amber-500',
    features: ['All Community benefits', 'Co-branded content opportunities', 'Priority event access', 'Monthly strategy calls', 'Social media features'],
  },
  {
    name: 'Founding Partner',
    color: 'border-red-500/30 bg-red-500/5',
    badge: 'text-red-500',
    features: ['All Legacy benefits', 'Custom integration support', 'Board advisory access', 'Annual summit invitation', 'Dedicated partnership manager', 'First access to new initiatives'],
  },
];

export default function BusinessPartnerships() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-blue-500/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Handshake className="w-16 h-16 text-blue-500 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Business Partnerships</h1>
          <p className="text-xl text-foreground/70 mb-2">Build Something Meaningful Together</p>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Canryn Production Inc. is building more than a platform — we are building a movement. 
            Partner with us to preserve legacy, empower communities, and create lasting impact.
          </p>
        </div>
      </section>

      {/* Partnership Types */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">Partnership Opportunities</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {partnershipTypes.map((type) => (
              <Card key={type.title} className="hover:border-blue-500/30 transition-colors">
                <CardHeader>
                  <type.icon className="w-8 h-8 text-blue-500 mb-2" />
                  <CardTitle className="text-lg">{type.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/70 mb-4">{type.description}</p>
                  <ul className="space-y-1">
                    {type.opportunities.map((opp, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-foreground/60">
                        <ArrowRight className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        {opp}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Tiers */}
      <section className="py-12 px-4 bg-card/50 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">Partnership Tiers</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {tiers.map((tier) => (
              <Card key={tier.name} className={`${tier.color}`}>
                <CardHeader>
                  <CardTitle className={`text-xl ${tier.badge}`}>{tier.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-foreground/70">
                        <div className={`w-1.5 h-1.5 rounded-full ${tier.badge.replace('text-', 'bg-')}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Partner */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">Why Partner with Canryn Production?</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <Globe className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Mission-Driven Impact</h3>
                <p className="text-sm text-foreground/70">
                  Every partnership directly supports legacy preservation, community empowerment, 
                  and the Sweet Miracles initiative — creating real, measurable impact.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Cpu className="w-8 h-8 text-purple-500 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Cutting-Edge Technology</h3>
                <p className="text-sm text-foreground/70">
                  Access QUMUS autonomous orchestration and HybridCast emergency broadcast technology 
                  — systems designed for resilience and community service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 bg-blue-500/5 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Partner?</h2>
          <p className="text-foreground/70 mb-6">
            We are always looking for partners who share our vision of legacy preservation and community empowerment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rrb/contact">
              <span className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors cursor-pointer">
                <Mail className="mr-2 w-4 h-4" /> Contact Us
              </span>
            </Link>
            <Link href="/rrb/divisions">
              <span className="inline-flex items-center px-6 py-3 border border-blue-500 text-blue-500 hover:bg-blue-500/10 rounded-lg font-medium transition-colors cursor-pointer">
                <Building2 className="mr-2 w-4 h-4" /> View Our Divisions
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-foreground/50">
            Partnership inquiries are reviewed by the Canryn Production team. All partnerships are subject 
            to alignment with our mission and values. Canryn Production Inc. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
}
