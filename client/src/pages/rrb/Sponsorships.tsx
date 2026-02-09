/**
 * Sponsorships - Sponsor the Legacy
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Radio, Mic, Calendar, Heart, Star, Shield, Crown, Gem, CheckCircle, Mail } from 'lucide-react';
import { Link } from 'wouter';

const sponsorshipAreas = [
  {
    title: 'RRB Radio Station',
    description: 'Sponsor our 24/7 radio broadcasts featuring legacy music, healing frequencies, and community programming.',
    icon: Radio,
    impact: 'Reaches thousands of listeners daily with healing music and legacy content.',
  },
  {
    title: 'Podcast Network',
    description: 'Sponsor podcast episodes covering legacy stories, music history, and community voices.',
    icon: Mic,
    impact: 'Amplifies unheard stories and preserves oral history for future generations.',
  },
  {
    title: 'Community Events',
    description: 'Sponsor legacy tribute concerts, memorial gatherings, and community celebration events.',
    icon: Calendar,
    impact: 'Brings communities together to celebrate legacy and build connections.',
  },
  {
    title: 'Sweet Miracles Programs',
    description: 'Sponsor community outreach programs including emergency communication, creative arts, and crisis support.',
    icon: Heart,
    impact: 'Directly supports underserved communities with essential services and resources.',
  },
];

const tiers = [
  {
    name: 'Bronze',
    icon: Shield,
    color: 'border-orange-700/30 bg-orange-700/5',
    textColor: 'text-orange-700',
    benefits: [
      'Logo on sponsor page',
      'Social media acknowledgment',
      'Quarterly impact newsletter',
      'Certificate of sponsorship',
    ],
  },
  {
    name: 'Silver',
    icon: Star,
    color: 'border-gray-400/30 bg-gray-400/5',
    textColor: 'text-gray-400',
    benefits: [
      'All Bronze benefits',
      'Logo on radio broadcasts',
      'Monthly sponsor spotlight',
      'Event invitation (2 tickets)',
      'Branded content opportunity',
    ],
  },
  {
    name: 'Gold',
    icon: Crown,
    color: 'border-amber-500/30 bg-amber-500/5',
    textColor: 'text-amber-500',
    benefits: [
      'All Silver benefits',
      'Premium logo placement',
      'Podcast sponsor mention',
      'Event VIP access (4 tickets)',
      'Quarterly strategy meeting',
      'Custom impact report',
    ],
  },
  {
    name: 'Platinum',
    icon: Gem,
    color: 'border-purple-500/30 bg-purple-500/5',
    textColor: 'text-purple-500',
    benefits: [
      'All Gold benefits',
      'Naming rights opportunity',
      'Board advisory participation',
      'Annual summit keynote access',
      'Dedicated partnership manager',
      'Co-branded initiative development',
      'First access to all new programs',
    ],
  },
];

export default function Sponsorships() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-amber-500/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Award className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Sponsorships</h1>
          <p className="text-xl text-foreground/70 mb-2">Invest in Legacy, Community & Impact</p>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Your sponsorship directly funds legacy preservation, community empowerment, and the 
            Sweet Miracles mission of being "A Voice for the Voiceless."
          </p>
        </div>
      </section>

      {/* What You Can Sponsor */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">What You Can Sponsor</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {sponsorshipAreas.map((area) => (
              <Card key={area.title} className="hover:border-amber-500/20 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <area.icon className="w-8 h-8 text-amber-500" />
                    <CardTitle className="text-lg">{area.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/70 mb-3">{area.description}</p>
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                    <p className="text-xs text-foreground/60">
                      <span className="font-medium text-amber-500">Impact:</span> {area.impact}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsorship Tiers */}
      <section className="py-12 px-4 bg-card/50 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">Sponsorship Tiers</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier) => (
              <Card key={tier.name} className={`${tier.color}`}>
                <CardHeader className="text-center">
                  <tier.icon className={`w-10 h-10 ${tier.textColor} mx-auto mb-2`} />
                  <CardTitle className={`text-xl ${tier.textColor}`}>{tier.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-foreground/70">
                        <CheckCircle className={`w-4 h-4 ${tier.textColor} flex-shrink-0 mt-0.5`} />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How Funds Are Used */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-6">Where Your Sponsorship Goes</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '35%' }} />
                  </div>
                  <span className="text-sm text-foreground/70 whitespace-nowrap">35% Legacy Preservation</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: '30%' }} />
                  </div>
                  <span className="text-sm text-foreground/70 whitespace-nowrap">30% Sweet Miracles</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '20%' }} />
                  </div>
                  <span className="text-sm text-foreground/70 whitespace-nowrap">20% Platform & Technology</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: '15%' }} />
                  </div>
                  <span className="text-sm text-foreground/70 whitespace-nowrap">15% Operations</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 bg-amber-500/5 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Become a Sponsor</h2>
          <p className="text-foreground/70 mb-6">
            Ready to make a lasting impact? Contact us to discuss sponsorship opportunities.
          </p>
          <Link href="/rrb/contact">
            <span className="inline-flex items-center px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors cursor-pointer">
              <Mail className="mr-2 w-4 h-4" /> Contact Us About Sponsorship
            </span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-foreground/50">
            Sponsorship details and benefits are subject to agreement terms. All sponsorships are reviewed 
            for alignment with the Canryn Production mission. Canryn Production Inc. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
}
