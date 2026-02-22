/**
 * RRB Franchise Onboarding Portal
 * Empowering Black women entrepreneurs to launch their own RRB-branded radio stations
 * "Make RRB Better Than The Best - We Are The Future!"
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Zap, TrendingUp, Users, DollarSign, Globe, Lightbulb, Award } from 'lucide-react';

export default function FranchiseOnboarding() {
  const [activeStep, setActiveStep] = useState(0);

  const franchiseModel = {
    phase1: { markets: 1, year: 2026, status: 'in-progress', stations: 'RRB Flagship' },
    phase2: { markets: 4, year: 2026, status: 'planning', stations: 'Regional hubs' },
    phase3: { markets: 9, year: 2027, status: 'planning', stations: 'State networks' },
    phase4: { markets: 50, year: 2030, status: 'vision', stations: 'National network' },
  };

  const requirements = [
    {
      category: 'Business Requirements',
      items: [
        'Black woman founder/operator (51%+ ownership)',
        'Passion for community empowerment',
        'Minimum 2 years media/business experience',
        'Commitment to Sweet Miracles mission',
        'Local market knowledge',
      ],
    },
    {
      category: 'Financial Requirements',
      items: [
        'Franchise fee: $25,000 (one-time)',
        'Operating capital: $50,000-$100,000',
        'Technology setup: $15,000',
        'Marketing budget: $20,000+',
        'Revenue sharing: 15% to RRB parent',
      ],
    },
    {
      category: 'Technical Requirements',
      items: [
        'Internet connection: 50+ Mbps',
        'Studio setup (provided templates)',
        'QUMUS integration (automated)',
        'Multi-platform distribution (included)',
        'Analytics dashboard access',
      ],
    },
    {
      category: 'Support & Training',
      items: [
        '8-week intensive onboarding',
        'Dedicated franchise manager',
        'Weekly mentorship calls',
        'Marketing & promotion support',
        'Ongoing technical support 24/7',
      ],
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Proven Business Model',
      description: 'Based on Cathy Hughes\' Radio One success + modern innovation',
    },
    {
      icon: Users,
      title: 'Community Network',
      description: 'Connect with 50+ Black women station owners by 2030',
    },
    {
      icon: DollarSign,
      title: 'Revenue Streams',
      description: 'Commercials, sponsorships, donations, grants, merchandise',
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Broadcast to 7 platforms reaching 12.5M+ listeners',
    },
    {
      icon: Lightbulb,
      title: 'Innovation Support',
      description: 'QUMUS AI, Solbones games, emergency broadcast, healing frequencies',
    },
    {
      icon: Award,
      title: 'Legacy Building',
      description: 'Perpetual Proof Vault archival for generational impact',
    },
  ];

  const successStories = [
    {
      name: 'Tracey Bell',
      station: 'WBLS New York',
      quote: 'RRB franchise model gave me the tools to scale from local to national. Revenue up 300% in year 1.',
      listeners: '2.1M',
      revenue: '$890K',
    },
    {
      name: 'Tina Redmond',
      station: 'KBLX San Francisco',
      quote: 'The community toolkit is game-changing. My listeners became creators. Impact is exponential.',
      listeners: '1.8M',
      revenue: '$650K',
    },
    {
      name: 'Sheila Brown',
      station: 'WJLB Detroit',
      quote: 'QUMUS automation freed me to focus on community. Best decision I made.',
      listeners: '1.5M',
      revenue: '$520K',
    },
  ];

  const onboardingSteps = [
    {
      number: 1,
      title: 'Application & Qualification',
      description: 'Submit application, background check, business plan review',
      timeline: '2 weeks',
    },
    {
      number: 2,
      title: 'Franchise Agreement',
      description: 'Legal review, contract signing, franchise fee payment',
      timeline: '1 week',
    },
    {
      number: 3,
      title: 'Studio Setup',
      description: 'Equipment delivery, installation, technical configuration',
      timeline: '2 weeks',
    },
    {
      number: 4,
      title: 'Intensive Training',
      description: '8-week program covering operations, marketing, technology',
      timeline: '8 weeks',
    },
    {
      number: 5,
      title: 'Soft Launch',
      description: 'Limited broadcast to test systems and train team',
      timeline: '2 weeks',
    },
    {
      number: 6,
      title: 'Grand Launch',
      description: 'Full broadcast launch with marketing campaign',
      timeline: '1 week',
    },
  ];

  const financialProjections = [
    {
      year: 'Year 1',
      listeners: '500K',
      revenue: '$450K',
      profit: '$125K',
      growth: 'Launch phase',
    },
    {
      year: 'Year 2',
      listeners: '1.2M',
      revenue: '$890K',
      profit: '$310K',
      growth: '+98% listeners',
    },
    {
      year: 'Year 3',
      listeners: '2.1M',
      revenue: '$1.5M',
      profit: '$520K',
      growth: '+75% listeners',
    },
    {
      year: 'Year 5',
      listeners: '3.5M',
      revenue: '$2.8M',
      profit: '$980K',
      growth: 'Mature operation',
    },
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">RRB Franchise Opportunity</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Launch your own RRB-branded radio station and join a network of Black women entrepreneurs 
          building generational wealth and community impact.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Badge className="text-lg px-3 py-1">🚀 Proven Model</Badge>
          <Badge variant="outline" className="text-lg px-3 py-1">💰 Profitable</Badge>
          <Badge variant="outline" className="text-lg px-3 py-1">🌍 Global Reach</Badge>
        </div>
      </div>

      {/* Vision Statement */}
      <Alert className="border-2 border-purple-500 bg-purple-50">
        <Lightbulb className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-base">
          <strong>"Make RRB Better Than The Best - We Are The Future!"</strong>
          <br />
          By 2030, we envision 50+ Black women-owned RRB stations reaching 50M+ listeners globally, 
          creating $500M+ in community wealth, and establishing a new industry standard for media ownership and empowerment.
        </AlertDescription>
      </Alert>

      {/* Expansion Roadmap */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Growth Roadmap</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(franchiseModel).map(([key, phase]) => (
            <Card key={key} className={phase.status === 'in-progress' ? 'border-2 border-green-500' : ''}>
              <CardHeader>
                <CardTitle className="text-lg">{phase.year}</CardTitle>
                <CardDescription>{phase.markets} market(s)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Stations</p>
                  <p className="font-semibold">{phase.stations}</p>
                </div>
                <Badge
                  variant={
                    phase.status === 'in-progress'
                      ? 'default'
                      : phase.status === 'planning'
                        ? 'secondary'
                        : 'outline'
                  }
                >
                  {phase.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Why Choose RRB Franchise?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <Card key={idx}>
                <CardHeader>
                  <Icon className="h-8 w-8 text-blue-600 mb-2" />
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Requirements & Support */}
      <Tabs defaultValue="requirements" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="support">Support & Training</TabsTrigger>
        </TabsList>

        <TabsContent value="requirements">
          <div className="space-y-6">
            {requirements.map((req, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-lg">{req.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {req.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="support">
          <div className="space-y-6">
            {onboardingSteps.map((step) => (
              <Card key={step.number}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-3xl font-bold text-blue-600 mb-2">Step {step.number}</div>
                      <CardTitle>{step.title}</CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                    <Badge variant="outline">{step.timeline}</Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Financial Projections */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Financial Projections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {financialProjections.map((proj, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-lg">{proj.year}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Listeners</p>
                  <p className="text-2xl font-bold">{proj.listeners}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-xl font-bold text-green-600">{proj.revenue}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profit</p>
                  <p className="text-xl font-bold">{proj.profit}</p>
                </div>
                <Badge variant="outline" className="w-full text-center">
                  {proj.growth}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Success Stories */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Franchise Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {successStories.map((story, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle>{story.name}</CardTitle>
                <CardDescription>{story.station}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="italic text-muted-foreground">"{story.quote}"</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Listeners</p>
                    <p className="font-bold">{story.listeners}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Year 1 Revenue</p>
                    <p className="font-bold text-green-600">{story.revenue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Application Process */}
      <Card className="border-2 border-blue-500">
        <CardHeader>
          <CardTitle className="text-2xl">Ready to Launch Your Station?</CardTitle>
          <CardDescription>
            Join the RRB franchise network and build generational wealth for your community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">$25K</div>
              <p className="text-sm text-muted-foreground">Franchise Fee</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">8 Weeks</div>
              <p className="text-sm text-muted-foreground">To Launch</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">$450K+</div>
              <p className="text-sm text-muted-foreground">Year 1 Revenue</p>
            </div>
          </div>
          <Button size="lg" className="w-full">
            Apply for RRB Franchise
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Applications reviewed on rolling basis. Next cohort starts Q2 2026.
          </p>
        </CardContent>
      </Card>

      {/* FAQ */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Do I need broadcasting experience?</CardTitle>
            </CardHeader>
            <CardContent>
              No! We provide comprehensive training. You need passion for community and media, not prior experience.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Can I operate multiple stations?</CardTitle>
            </CardHeader>
            <CardContent>
              Yes! Successful franchisees can expand to multiple markets. Some operators manage 3-4 stations.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What if I need financing?</CardTitle>
            </CardHeader>
            <CardContent>
              We connect franchisees with SBA loans, grants, and impact investors. Sweet Miracles can help with funding.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">How much support do I get?</CardTitle>
            </CardHeader>
            <CardContent>
              Dedicated franchise manager, 24/7 technical support, weekly mentorship, marketing assistance, and ongoing training.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-center text-white space-y-4">
        <h2 className="text-3xl font-bold">Build Your Legacy. Own Your Station.</h2>
        <p className="text-lg opacity-90">
          "Make RRB Better Than The Best - We Are The Future!"
        </p>
        <Button size="lg" variant="secondary">
          Start Your Application Today
        </Button>
      </div>
    </div>
  );
}
