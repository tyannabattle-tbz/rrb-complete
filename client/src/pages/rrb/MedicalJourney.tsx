/**
 * Medical Journey - Health Challenges & Perseverance
 * Documents the health challenges Seabrun Candy Hunter faced with dignity
 */

import { Card, CardContent } from '@/components/ui/card';
import { Heart, Shield, Star, Music, BookOpen } from 'lucide-react';
import { Link } from 'wouter';

const journeyChapters = [
  {
    title: 'The Artist\'s Resilience',
    text: 'Throughout his life, Seabrun Candy Hunter faced health challenges that would have stopped many people in their tracks. But his commitment to his art and his family meant that he continued creating, performing, and mentoring even when his body was working against him. His resilience in the face of medical adversity is as much a part of his legacy as his music.',
  },
  {
    title: 'Music as Medicine',
    text: 'For Seabrun, music was not just a career — it was therapy, expression, and connection. During his most difficult health periods, he turned to songwriting as both an outlet and a source of strength. Some of his most emotionally powerful compositions came from these periods of physical challenge.',
  },
  {
    title: 'Family as Foundation',
    text: 'The family that Grandma Helen built proved its strength during Seabrun\'s health challenges. Family members provided care, support, and encouragement, ensuring that he could continue his creative work even as his health declined. Their dedication during these difficult times is a testament to the family values that Helen instilled.',
  },
  {
    title: 'The Impact on Legacy',
    text: 'Seabrun\'s health challenges had a direct impact on his ability to advocate for his own legacy. During periods when he should have been fighting for proper credit and compensation, he was instead fighting for his health. This vulnerability was, in some cases, exploited by those who benefited from the omission of his contributions.',
  },
  {
    title: 'Dignity in Adversity',
    text: 'What stands out most in the accounts of those who knew Seabrun during his health challenges is his dignity. He never used his health as an excuse, never sought pity, and never stopped believing in the importance of his work. He faced each challenge with the same integrity that defined his artistic career.',
  },
];

export default function MedicalJourney() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-teal-500/10 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Heart className="w-16 h-16 text-teal-500 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Medical Journey</h1>
          <p className="text-xl text-foreground/70 mb-2">
            Strength Through Adversity
          </p>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            The health challenges that Seabrun Candy Hunter faced are part of his story — not as a 
            limitation, but as a testament to the extraordinary resilience that defined his character.
          </p>
        </div>
      </section>

      {/* Privacy Notice */}
      <section className="py-4 px-4 bg-teal-500/5 border-y border-teal-500/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-start">
            <Shield className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/60">
              <strong className="text-foreground">Privacy Note:</strong> This page shares general information 
              about the health challenges Seabrun Candy Hunter faced, with the consent of the family. Specific 
              medical details are kept private out of respect for his dignity and the family's wishes.
            </p>
          </div>
        </div>
      </section>

      {/* Journey Chapters */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {journeyChapters.map((chapter, idx) => (
            <Card key={idx} className="hover:border-teal-500/20 transition-colors">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-foreground mb-3">{chapter.title}</h3>
                <p className="text-foreground/70 leading-relaxed">{chapter.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Reflection */}
      <section className="py-12 px-4 bg-card/50">
        <div className="max-w-4xl mx-auto">
          <Card className="border-teal-500/20 bg-teal-500/5">
            <CardContent className="pt-6 text-center">
              <Star className="w-12 h-12 text-teal-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-4">The Measure of a Man</h3>
              <p className="text-foreground/70 leading-relaxed max-w-2xl mx-auto mb-4">
                The medical journey is included in this archive not to diminish Seabrun Candy Hunter, 
                but to honor the full scope of his strength. A man who creates beauty in the midst of 
                suffering, who mentors others while fighting his own battles, who never loses his dignity 
                or his vision — that is a man whose legacy deserves to be told completely.
              </p>
              <p className="text-foreground/60 leading-relaxed max-w-2xl mx-auto">
                His health challenges also provide important context for understanding why the systematic 
                omission of his credits went unchallenged for so long. When you are fighting for your life, 
                fighting for your credits takes a back seat. The family's restoration effort honors both 
                battles.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 px-4 bg-teal-500/5 border-t border-teal-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rrb/obituary">
              <span className="inline-flex items-center px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors cursor-pointer">
                <Heart className="mr-2 w-4 h-4" />
                In Memoriam
              </span>
            </Link>
            <Link href="/rrb/family-tree">
              <span className="inline-flex items-center px-6 py-3 border border-teal-500 text-teal-500 hover:bg-teal-500/10 rounded-lg font-medium transition-colors cursor-pointer">
                The Family
              </span>
            </Link>
            <Link href="/rrb/the-legacy">
              <span className="inline-flex items-center px-6 py-3 border border-teal-500 text-teal-500 hover:bg-teal-500/10 rounded-lg font-medium transition-colors cursor-pointer">
                <BookOpen className="mr-2 w-4 h-4" />
                The Full Legacy
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-foreground/50">
            This page is shared with the consent of the family. Medical details are kept general out of 
            respect for privacy. This page is part of the Seabrun Candy Hunter Legacy Archive, presented 
            for historical preservation and educational purposes.
          </p>
        </div>
      </section>
    </div>
  );
}
