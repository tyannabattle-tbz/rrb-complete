/**
 * Advertising Services — Advertise on RRB Radio
 * 
 * Public-facing page for businesses and individuals to learn about
 * advertising on Rockin' Rockin' Boogie Radio. All pricing inquiries
 * go through Canryn Production directly.
 * 
 * © Canryn Production — All Rights Reserved
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Radio, Megaphone, BarChart3, Users, Clock, Star, CheckCircle,
  Mail, Phone, MessageSquare, Zap, Globe, Heart, ArrowRight,
  Mic, Volume2, TrendingUp, Award, Shield, Headphones
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

const AUDIENCE_STATS = [
  { icon: Users, label: 'Growing Listener Base', value: 'Community-Driven', desc: 'Engaged audience across multiple platforms' },
  { icon: Globe, label: 'Global Reach', value: '10+ Directories', desc: 'Listed on TuneIn, RadioBrowser, and more' },
  { icon: Clock, label: 'Broadcast Hours', value: '24/7', desc: 'Round-the-clock programming' },
  { icon: TrendingUp, label: 'Engagement Rate', value: 'High', desc: 'Loyal, engaged community listeners' },
];

const WHY_ADVERTISE = [
  {
    icon: Headphones,
    title: 'Engaged Audience',
    desc: 'Our listeners are passionate about music, community, and supporting local businesses. Your message reaches people who care.',
  },
  {
    icon: Mic,
    title: 'AI-Crafted Scripts',
    desc: 'Our AI commercial engine generates professional radio scripts tailored to your business, ensuring your ad sounds polished and compelling.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    desc: 'Track your ad performance with play counts, scheduling data, and rotation analytics. Know exactly when and how often your ad airs.',
  },
  {
    icon: Shield,
    title: 'QUMUS Managed',
    desc: 'Our autonomous QUMUS system optimizes ad scheduling for maximum impact, ensuring your spots air at the best times for your audience.',
  },
  {
    icon: Globe,
    title: 'Multi-Platform Reach',
    desc: 'Your ad reaches listeners across internet radio directories, mobile apps, smart speakers, and our web platform.',
  },
  {
    icon: Heart,
    title: 'Community Impact',
    desc: 'Advertising with us supports Sweet Miracles Foundation and community programs. Your business makes a difference.',
  },
];

export default function AdvertisingServices() {
  const { user } = useAuth();
  const [inquiryForm, setInquiryForm] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    businessDescription: '',
    packageInterest: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const packagesQuery = trpc.commercials.getAdvertisingPackages.useQuery();
  const packages = packagesQuery.data || [];

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryForm.businessName || !inquiryForm.email || !inquiryForm.businessDescription) {
      toast.error('Please fill in your business name, email, and description.');
      return;
    }
    // In production this would send to Canryn Production's CRM/email
    toast.success('Inquiry submitted! Canryn Production will contact you within 1-2 business days.');
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-amber-500/15 via-orange-500/5 to-background overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-amber-500 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-orange-500 blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-medium mb-6">
            <Megaphone className="w-4 h-4" /> Advertise on RRB Radio
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
            Reach Our <span className="text-amber-500">Listeners</span>
          </h1>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto mb-4">
            Put your business in front of an engaged, growing audience on Rockin' Rockin' Boogie Radio.
            AI-crafted commercials, 24/7 broadcast rotation, and real-time analytics.
          </p>
          <p className="text-lg text-foreground/50 mb-8">
            Contact Canryn Production for advertising packages and pricing.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#inquiry">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black text-lg px-8">
                <MessageSquare className="w-5 h-5 mr-2" /> Get Started
              </Button>
            </a>
            <a href="#packages">
              <Button size="lg" variant="outline" className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10 text-lg px-8">
                <Radio className="w-5 h-5 mr-2" /> View Packages
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Audience Stats */}
      <section className="py-12 px-4 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {AUDIENCE_STATS.map((stat, i) => (
              <div key={i} className="text-center p-4">
                <stat.icon className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm font-medium text-foreground/70">{stat.label}</div>
                <div className="text-xs text-foreground/50 mt-1">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Advertise With Us */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Why Advertise With RRB Radio?</h2>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              More than just airtime — we're a full-service advertising partner powered by AI and autonomous technology.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {WHY_ADVERTISE.map((item, i) => (
              <Card key={i} className="border-border/50 hover:border-amber-500/30 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-foreground/60">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advertising Packages */}
      <section id="packages" className="py-16 px-4 bg-card/50 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Advertising Packages</h2>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              Choose the package that fits your needs. All pricing is handled directly by Canryn Production —
              contact us for a custom quote.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`border-border/50 hover:border-amber-500/40 transition-all ${
                  pkg.id === 'standard_60' ? 'ring-2 ring-amber-500/30 relative' : ''
                }`}
              >
                {pkg.id === 'standard_60' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-black text-xs font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-amber-500" />
                    {pkg.name}
                  </CardTitle>
                  <p className="text-sm text-foreground/60">{pkg.description}</p>
                  {pkg.duration > 0 && (
                    <div className="text-2xl font-bold text-amber-500 mt-2">{pkg.duration}s</div>
                  )}
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-amber-500 font-medium mb-3">{pkg.contactNote}</p>
                    <a href="#inquiry">
                      <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black" size="sm">
                        <Mail className="w-4 h-4 mr-2" /> Inquire About This Package
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">How It Works</h2>
            <p className="text-foreground/60">From inquiry to on-air in 4 simple steps</p>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { step: 1, icon: MessageSquare, title: 'Contact Us', desc: 'Submit your inquiry below or contact Canryn Production directly' },
              { step: 2, icon: Zap, title: 'AI Script', desc: 'Our AI generates a professional radio script tailored to your business' },
              { step: 3, icon: Mic, title: 'Production', desc: 'Review, approve, and optionally record with professional voice talent' },
              { step: 4, icon: Radio, title: 'On Air', desc: 'Your ad enters the QUMUS-managed rotation and starts reaching listeners' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-6 h-6 text-amber-500" />
                </div>
                <div className="text-xs text-amber-500 font-bold mb-1">STEP {item.step}</div>
                <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                <p className="text-xs text-foreground/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry" className="py-16 px-4 bg-card/50 border-y border-border">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-3">Advertise With Us</h2>
            <p className="text-foreground/60">
              Fill out the form below and Canryn Production will contact you within 1-2 business days
              with pricing and package details.
            </p>
          </div>

          {submitted ? (
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">Inquiry Received!</h3>
                <p className="text-foreground/70 mb-4">
                  Thank you for your interest in advertising on RRB Radio. Canryn Production will
                  review your inquiry and contact you within 1-2 business days.
                </p>
                <Button onClick={() => setSubmitted(false)} variant="outline">
                  Submit Another Inquiry
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-amber-500/20">
              <CardContent className="p-6">
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Business Name *</label>
                      <Input
                        placeholder="Your Business Name"
                        value={inquiryForm.businessName}
                        onChange={(e) => setInquiryForm(f => ({ ...f, businessName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Contact Name</label>
                      <Input
                        placeholder="Your Name"
                        value={inquiryForm.contactName}
                        onChange={(e) => setInquiryForm(f => ({ ...f, contactName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Email *</label>
                      <Input
                        type="email"
                        placeholder="you@business.com"
                        value={inquiryForm.email}
                        onChange={(e) => setInquiryForm(f => ({ ...f, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Phone</label>
                      <Input
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={inquiryForm.phone}
                        onChange={(e) => setInquiryForm(f => ({ ...f, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Business Description *</label>
                    <Textarea
                      placeholder="Tell us about your business, products, or services..."
                      value={inquiryForm.businessDescription}
                      onChange={(e) => setInquiryForm(f => ({ ...f, businessDescription: e.target.value }))}
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Package Interest</label>
                    <div className="flex flex-wrap gap-2">
                      {['Basic 30s', 'Standard 60s', 'Premium 90s', 'Show Sponsorship', 'Custom Campaign'].map(pkg => (
                        <button
                          key={pkg}
                          type="button"
                          onClick={() => setInquiryForm(f => ({ ...f, packageInterest: pkg }))}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            inquiryForm.packageInterest === pkg
                              ? 'bg-amber-500 text-black'
                              : 'bg-card hover:bg-card/80 text-foreground/70 border border-border'
                          }`}
                        >
                          {pkg}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Additional Message</label>
                    <Textarea
                      placeholder="Any specific requirements, target audience, or questions..."
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm(f => ({ ...f, message: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black text-lg py-6">
                    <Mail className="w-5 h-5 mr-2" /> Submit Advertising Inquiry
                  </Button>
                  <p className="text-xs text-foreground/40 text-center">
                    All inquiries are reviewed by Canryn Production. Pricing is customized based on your needs.
                  </p>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Also Support the Mission */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Heart className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">Advertising Supports the Mission</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto mb-6">
            When you advertise on RRB Radio, you're not just reaching listeners — you're supporting
            Sweet Miracles Foundation's "Voice for the Voiceless" mission, community emergency communication,
            and the preservation of Seabrun Candy Hunter's musical legacy.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/donate">
              <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                <Heart className="w-4 h-4 mr-2" /> Donate to Legacy Recovery
              </Button>
            </Link>
            <Link href="/rrb/contact">
              <Button variant="outline" className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10">
                <Phone className="w-4 h-4 mr-2" /> Contact Canryn Production
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-foreground/50">
            All advertising inquiries are handled by Canryn Production Inc.
            Advertising rates and availability are subject to change.
            Sweet Miracles Foundation is a registered 501(c)(3) / 508(c) nonprofit organization.
          </p>
        </div>
      </section>
    </div>
  );
}
