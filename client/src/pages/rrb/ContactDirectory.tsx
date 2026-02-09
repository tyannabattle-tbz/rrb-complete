/**
 * Contact Directory - Comprehensive Contact Information
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, Building2, Scale, Music, Heart, Cpu, Radio, Newspaper, HelpCircle, Shield, Users } from 'lucide-react';
import { Link } from 'wouter';

const contactDepartments = [
  {
    name: 'General Inquiries',
    description: 'For general questions about Canryn Production, the RRB platform, or the Seabrun Candy Hunter legacy.',
    icon: HelpCircle,
    method: 'Use the Contact form on our main Contact page',
    response: 'Within 2-3 business days',
    color: 'text-blue-500',
  },
  {
    name: 'Media & Press',
    description: 'For journalists, bloggers, and content creators seeking interviews, press materials, or media access.',
    icon: Newspaper,
    method: 'Visit our Media Hub for press kit and contact information',
    response: 'Within 1-2 business days',
    color: 'text-purple-500',
  },
  {
    name: 'Legal Department',
    description: 'For legal inquiries regarding intellectual property, estate matters, rights management, and documentation requests.',
    icon: Scale,
    method: 'Contact through the main Contact page with "Legal" in subject',
    response: 'Within 5 business days',
    color: 'text-red-500',
  },
  {
    name: 'Music Licensing',
    description: 'For licensing Seabrun Candy Hunter\'s music catalog for film, television, advertising, or other commercial use.',
    icon: Music,
    method: 'Contact through the main Contact page with "Licensing" in subject',
    response: 'Within 3-5 business days',
    color: 'text-amber-500',
  },
  {
    name: 'Partnership Inquiries',
    description: 'For businesses and organizations interested in partnering with Canryn Production or sponsoring our initiatives.',
    icon: Building2,
    method: 'Visit our Business Partnerships page for details',
    response: 'Within 3 business days',
    color: 'text-green-500',
  },
  {
    name: 'Sweet Miracles / Community',
    description: 'For community outreach, volunteer opportunities, grant inquiries, and Sweet Miracles program information.',
    icon: Heart,
    method: 'Contact through the main Contact page with "Sweet Miracles" in subject',
    response: 'Within 2-3 business days',
    color: 'text-pink-500',
  },
  {
    name: 'Technical Support',
    description: 'For issues with the RRB platform, radio streaming, HybridCast, or any technical functionality.',
    icon: Cpu,
    method: 'Contact through the main Contact page with "Technical" in subject',
    response: 'Within 1 business day',
    color: 'text-cyan-500',
  },
  {
    name: 'Broadcasting & Radio',
    description: 'For inquiries about RRB Radio, broadcast scheduling, content submission, or radio partnership opportunities.',
    icon: Radio,
    method: 'Contact through the main Contact page with "Broadcasting" in subject',
    response: 'Within 2-3 business days',
    color: 'text-orange-500',
  },
  {
    name: 'Privacy & Security',
    description: 'For data privacy requests, security concerns, or questions about how we handle your information.',
    icon: Shield,
    method: 'Contact through the main Contact page with "Privacy" in subject',
    response: 'Within 2 business days',
    color: 'text-indigo-500',
  },
  {
    name: 'Testimonials & Stories',
    description: 'To share your story, submit a testimonial, or contribute to the legacy archive with personal accounts.',
    icon: Users,
    method: 'Visit our Testimonials page or use the Contact form',
    response: 'Within 5 business days',
    color: 'text-teal-500',
  },
];

export default function ContactDirectory() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-blue-500/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Phone className="w-16 h-16 text-blue-500 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Contact Directory</h1>
          <p className="text-xl text-foreground/70 mb-2">Find the Right Department</p>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Whether you have a question, a partnership proposal, or a story to share, 
            this directory will help you reach the right team at Canryn Production.
          </p>
        </div>
      </section>

      {/* Directory Grid */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-4 md:grid-cols-2">
            {contactDepartments.map((dept) => (
              <Card key={dept.name} className="hover:border-blue-500/20 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <dept.icon className={`w-6 h-6 ${dept.color}`} />
                    <CardTitle className="text-lg">{dept.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/70 mb-3">{dept.description}</p>
                  <div className="space-y-1">
                    <p className="text-sm text-foreground/60">
                      <span className="font-medium text-foreground/80">How to reach us:</span> {dept.method}
                    </p>
                    <p className="text-sm text-foreground/60">
                      <span className="font-medium text-foreground/80">Response time:</span> {dept.response}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 px-4 bg-card/50 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Quick Links</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/rrb/contact">
              <span className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors cursor-pointer">
                <Mail className="mr-2 w-4 h-4" /> Main Contact Form
              </span>
            </Link>
            <Link href="/rrb/media-hub">
              <span className="inline-flex items-center px-6 py-3 border border-blue-500 text-blue-500 hover:bg-blue-500/10 rounded-lg font-medium transition-colors cursor-pointer">
                <Newspaper className="mr-2 w-4 h-4" /> Media Hub
              </span>
            </Link>
            <Link href="/rrb/business-partnerships">
              <span className="inline-flex items-center px-6 py-3 border border-blue-500 text-blue-500 hover:bg-blue-500/10 rounded-lg font-medium transition-colors cursor-pointer">
                <Building2 className="mr-2 w-4 h-4" /> Partnerships
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-foreground/50">
            All inquiries are handled by the Canryn Production team. Response times are estimates and may 
            vary during high-volume periods. Canryn Production Inc. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
}
