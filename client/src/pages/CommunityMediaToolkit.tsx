/**
 * Community Media Production Toolkit
 * Free tools for community members to create and broadcast their own content
 * "A Voice for the Voiceless" - Sweet Miracles mission
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, Video, Music, FileText, Radio, Share2, Heart, Download } from 'lucide-react';

export default function CommunityMediaToolkit() {
  const [selectedTool, setSelectedTool] = useState('podcast');

  const tools = [
    {
      id: 'podcast',
      name: 'Podcast Studio',
      description: 'Record, edit, and publish your own podcast episodes',
      icon: Mic,
      features: [
        'Multi-track recording',
        'Built-in audio editing',
        'Auto-publish to RRB network',
        'Royalty-free music library',
        'Listener analytics',
      ],
      status: 'free',
      users: 2340,
    },
    {
      id: 'video',
      name: 'Video Creator',
      description: 'Create and broadcast video content live or on-demand',
      icon: Video,
      features: [
        'Live streaming to 7 platforms',
        'Video editing suite',
        'Green screen support',
        'Real-time captions',
        'Multi-camera support',
      ],
      status: 'free',
      users: 1890,
    },
    {
      id: 'radio',
      name: 'Radio Show Builder',
      description: 'Build and schedule your own radio show on RRB',
      icon: Radio,
      features: [
        '24/7 scheduling',
        'Commercial insertion',
        'Listener call-in',
        'Remote guest integration',
        'Show archival',
      ],
      status: 'free',
      users: 1240,
    },
    {
      id: 'music',
      name: 'Music Producer',
      description: 'Compose, produce, and share original music',
      icon: Music,
      features: [
        'DAW integration',
        'Virtual instruments',
        'Mixing & mastering',
        'Distribution to streaming',
        'Royalty tracking',
      ],
      status: 'free',
      users: 890,
    },
    {
      id: 'blog',
      name: 'Blog & Articles',
      description: 'Write and publish articles on RRB platform',
      icon: FileText,
      features: [
        'Rich text editor',
        'Image galleries',
        'SEO optimization',
        'Comment moderation',
        'Social sharing',
      ],
      status: 'free',
      users: 3450,
    },
    {
      id: 'community',
      name: 'Community Hub',
      description: 'Connect with other creators and share resources',
      icon: Share2,
      features: [
        'Creator directory',
        'Collaboration tools',
        'Resource library',
        'Mentorship program',
        'Community events',
      ],
      status: 'free',
      users: 5670,
    },
  ];

  const testimonials = [
    {
      name: 'Maria Johnson',
      role: 'Community Activist',
      quote: 'RRB gave me a voice when no one else would listen. Now I reach 50K people weekly.',
      avatar: '👩‍💼',
    },
    {
      name: 'James Williams',
      role: 'Independent Musician',
      quote: 'From my bedroom to 5M listeners. The toolkit is incredibly powerful and free.',
      avatar: '🎤',
    },
    {
      name: 'Keisha Davis',
      role: 'Youth Educator',
      quote: 'My students use RRB to share their stories. It changed their lives.',
      avatar: '👩‍🏫',
    },
  ];

  const resources = [
    {
      title: 'Getting Started Guide',
      description: 'Learn the basics of content creation',
      type: 'PDF',
      downloads: 12450,
    },
    {
      title: 'Audio Production Tips',
      description: 'Professional audio recording and editing',
      type: 'Video',
      downloads: 8920,
    },
    {
      title: 'Content Strategy Playbook',
      description: 'Build an audience and grow your reach',
      type: 'PDF',
      downloads: 6780,
    },
    {
      title: 'Community Standards',
      description: 'Guidelines for respectful content',
      type: 'PDF',
      downloads: 5430,
    },
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Community Media Toolkit</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Free tools for everyone to create, produce, and broadcast their own content. 
          <br />
          <strong>"A Voice for the Voiceless"</strong> — Sweet Miracles
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Badge className="text-lg px-3 py-1">100% Free</Badge>
          <Badge variant="outline" className="text-lg px-3 py-1">No Ads</Badge>
          <Badge variant="outline" className="text-lg px-3 py-1">Community Owned</Badge>
        </div>
      </div>

      {/* Mission Statement */}
      <Alert className="border-2 border-blue-500 bg-blue-50">
        <Heart className="h-4 w-4 text-red-500" />
        <AlertDescription className="text-base">
          <strong>Our Mission:</strong> Empower every voice in our community. Whether you're an activist, artist, 
          educator, or just someone with a story to tell, RRB gives you the tools to be heard by millions.
        </AlertDescription>
      </Alert>

      {/* Tools Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Available Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedTool(tool.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Icon className="h-8 w-8 text-blue-600" />
                    <Badge>{tool.status}</Badge>
                  </div>
                  <CardTitle className="mt-2">{tool.name}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {tool.users.toLocaleString()} creators using this tool
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tool Details */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Tool Features</h2>
        {tools.map((tool) => (
          <div key={tool.id} className={selectedTool === tool.id ? '' : 'hidden'}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {React.createElement(tool.icon, { className: 'h-8 w-8 text-blue-600' })}
                  <div>
                    <CardTitle>{tool.name}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Key Features</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {tool.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button size="lg" className="w-full">
                  Start Creating with {tool.name}
                </Button>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started in 3 Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="text-4xl font-bold text-blue-600">1</div>
              <h3 className="font-semibold">Create Account</h3>
              <p className="text-sm text-muted-foreground">Sign up with email or social media (takes 2 minutes)</p>
            </div>
            <div className="text-center space-y-3">
              <div className="text-4xl font-bold text-blue-600">2</div>
              <h3 className="font-semibold">Choose Your Tool</h3>
              <p className="text-sm text-muted-foreground">Pick from podcast, video, radio, music, or blog</p>
            </div>
            <div className="text-center space-y-3">
              <div className="text-4xl font-bold text-blue-600">3</div>
              <h3 className="font-semibold">Go Live</h3>
              <p className="text-sm text-muted-foreground">Publish to RRB and reach millions of listeners</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Learning Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((resource, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </div>
                  <Badge variant="outline">{resource.type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {resource.downloads.toLocaleString()} downloads
                  </p>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Creator Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((testimonial, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <p className="italic text-muted-foreground">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-center text-white space-y-4">
        <h2 className="text-3xl font-bold">Ready to Share Your Voice?</h2>
        <p className="text-lg opacity-90">Join 15,000+ creators building community on RRB</p>
        <Button size="lg" variant="secondary">
          Start Creating Now (It's Free!)
        </Button>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Is it really free?</CardTitle>
            </CardHeader>
            <CardContent>
              Yes! All tools are completely free. RRB is community-owned and funded through Sweet Miracles donations.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Can I monetize my content?</CardTitle>
            </CardHeader>
            <CardContent>
              Yes! Creators can earn through sponsorships, donations, and affiliate programs. RRB takes 0% commission.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">How do I reach listeners?</CardTitle>
            </CardHeader>
            <CardContent>
              Your content is automatically distributed to RRB Radio, YouTube, Spotify, Apple Podcasts, and 4 other platforms.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What if I need help?</CardTitle>
            </CardHeader>
            <CardContent>
              Join our community mentorship program. Experienced creators help new creators succeed.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
