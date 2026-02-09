/**
 * Producer & Mentor - Seabrun Candy Hunter's Role Behind the Scenes
 * Documents his work as a producer, mentor, and creative guide
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Users, Star, Music, Lightbulb, Award, BookOpen } from 'lucide-react';
import { Link } from 'wouter';

const producerRoles = [
  {
    title: 'Songwriter\'s Songwriter',
    description: 'Seabrun Candy Hunter was known among his peers as a "songwriter\'s songwriter" — an artist whose compositions were studied, admired, and sought after by other musicians. His ability to craft melodies that were both commercially appealing and artistically meaningful set him apart in an industry that often forced artists to choose between the two.',
    icon: Music,
  },
  {
    title: 'Studio Architect',
    description: 'In the studio, Seabrun was more than a performer — he was an architect of sound. He understood arrangement, production, and the technical aspects of recording in ways that many artists of his era did not. His input shaped not just his own recordings, but the recordings of those he collaborated with.',
    icon: Mic,
  },
  {
    title: 'Creative Director',
    description: 'Beyond individual songs, Seabrun had a vision for how music should be presented to the world. He thought in terms of albums, not just singles — in terms of artistic statements, not just commercial products. This creative vision influenced everyone who worked with him.',
    icon: Lightbulb,
  },
  {
    title: 'Mentor to Emerging Artists',
    description: 'Perhaps Seabrun\'s most lasting contribution beyond his own music was his role as a mentor. He invested time, knowledge, and creative energy in emerging artists, helping them develop their craft and navigate the complexities of the music industry.',
    icon: Users,
  },
];

const mentorshipLegacy = [
  {
    title: 'Teaching by Example',
    text: 'Seabrun didn\'t just tell younger artists what to do — he showed them. By maintaining his own standards of excellence and integrity, he provided a living example of what it meant to be a professional musician who never compromised on quality.',
  },
  {
    title: 'Sharing Industry Knowledge',
    text: 'Having navigated the music industry\'s complexities — including its darker side — Seabrun was uniquely positioned to advise younger artists on contracts, credits, and the business realities that could make or break a career.',
  },
  {
    title: 'Encouraging Authenticity',
    text: 'In an industry that often pressures artists to conform, Seabrun encouraged those he mentored to find and develop their own voice. He believed that authenticity was the foundation of lasting art.',
  },
  {
    title: 'Building Community',
    text: 'Seabrun understood that music was not a solo endeavor. He fostered a sense of community among the artists he worked with, creating networks of support and collaboration that extended beyond any single project.',
  },
];

export default function ProducerMentor() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-cyan-500/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Mic className="w-16 h-16 text-cyan-500 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Producer & Mentor</h1>
          <p className="text-xl text-foreground/70 mb-2">
            The Man Behind the Music
          </p>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Seabrun Candy Hunter's influence extended far beyond his own recordings. As a producer, 
            creative director, and mentor, he shaped the careers and artistry of everyone he worked with.
          </p>
        </div>
      </section>

      {/* Producer Roles */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Creative Roles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {producerRoles.map((role, idx) => (
              <Card key={idx} className="hover:border-cyan-500/30 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <role.icon className="w-5 h-5 text-cyan-500" />
                    </div>
                    <CardTitle className="text-lg">{role.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70 leading-relaxed text-sm">{role.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mentorship Legacy */}
      <section className="py-12 px-4 bg-card/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">The Mentorship Legacy</h2>
          <div className="space-y-6">
            {mentorshipLegacy.map((item, idx) => (
              <Card key={idx} className="border-l-4 border-l-cyan-500">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-foreground/70 leading-relaxed">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Statement */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-cyan-500/20 bg-cyan-500/5">
            <CardContent className="pt-6 text-center">
              <Award className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-4">Impact Beyond Measure</h3>
              <p className="text-foreground/70 leading-relaxed max-w-2xl mx-auto mb-4">
                The true measure of a producer and mentor is not in their own achievements, but in the 
                success and growth of those they guide. Seabrun Candy Hunter's influence lives on in every 
                artist he mentored, every song he helped shape, and every career he helped launch.
              </p>
              <p className="text-foreground/60 leading-relaxed max-w-2xl mx-auto">
                While many of these contributions went uncredited — part of the systematic omission documented 
                elsewhere on this site — the people who were there know the truth. And through this platform, 
                that truth is being preserved for history.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 px-4 bg-cyan-500/5 border-t border-cyan-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rrb/the-music">
              <span className="inline-flex items-center px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors cursor-pointer">
                <Music className="mr-2 w-4 h-4" />
                Listen to the Music
              </span>
            </Link>
            <Link href="/rrb/testimonials-and-stories">
              <span className="inline-flex items-center px-6 py-3 border border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 rounded-lg font-medium transition-colors cursor-pointer">
                <BookOpen className="mr-2 w-4 h-4" />
                Read Testimonials
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-foreground/50">
            Information about Seabrun Candy Hunter's production and mentorship roles is compiled from 
            verified records, collaborator testimony, and family documentation. This page is part of the 
            Legacy Archive, presented for historical preservation and educational purposes.
          </p>
        </div>
      </section>
    </div>
  );
}
