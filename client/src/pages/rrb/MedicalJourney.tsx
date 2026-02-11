/**
 * Medical Journey - Health Challenges & Perseverance
 * Documents the health challenges Seabrun Candy Hunter faced with dignity
 * Features the verified Saint Luke's KC article about the MitraClip procedure
 */

import { Card, CardContent } from '@/components/ui/card';
import { Heart, Shield, Star, Music, BookOpen, ExternalLink, Activity, Stethoscope, Clock, Quote } from 'lucide-react';
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

      {/* ===== FEATURED: Saint Luke's Article ===== */}
      <section className="py-16 px-4 bg-gradient-to-b from-blue-500/5 to-background">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Stethoscope className="w-8 h-8 text-blue-500" />
            <div>
              <h2 className="text-3xl font-bold text-foreground">Featured: Verified Medical Report</h2>
              <p className="text-foreground/60">Published by Saint Luke's Health System — January 15, 2018</p>
            </div>
          </div>

          <Card className="border-blue-500/30 bg-blue-500/5 overflow-hidden">
            <CardContent className="p-0">
              {/* Article Header */}
              <div className="p-6 md:p-8 border-b border-blue-500/20 bg-blue-500/10">
                <div className="flex items-start gap-2 mb-3">
                  <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                    Verified Source
                  </span>
                  <span className="px-3 py-1 bg-teal-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                    Medical Record
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  New Device Helps Musician's Congestive Heart Failure
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/60">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    January 15, 2018
                  </span>
                  <span className="flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    Saint Luke's Mid America Heart Institute
                  </span>
                </div>
              </div>

              {/* Article Body */}
              <div className="p-6 md:p-8 space-y-6">
                <p className="text-foreground/80 leading-relaxed text-lg">
                  The hallway to Seabrun "Candy" Hunter's apartment seemed to get longer every day. The 68-year-old 
                  musician had to stop midway to recover his breath and strength to finish the journey.
                </p>

                <p className="text-foreground/80 leading-relaxed">
                  A series of heart attacks and strokes since 2001 had weakened his heart and caused congestive heart 
                  failure. It robbed energy from the musician who used to tour the world performing with Little Richard 
                  and stay up nights composing songs like "Rockin' Rockin' Boogie."
                </p>

                <p className="text-foreground/80 leading-relaxed">
                  Heart failure had not only enlarged Candy's heart and diminished its pumping capacity, but also kept 
                  his mitral valve from closing properly. Blood leaked back into his lungs instead of going out to 
                  energize his body. This mitral regurgitation worsened the heart failure in a destructive cycle.
                </p>

                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-foreground/70 text-sm">
                    <strong className="text-red-400">Context:</strong> About half of people with congestive heart failure 
                    die within five years of diagnosis, according to the American Heart Association. The 10-year survival 
                    is less than 25 percent.
                  </p>
                </div>

                <p className="text-foreground/80 leading-relaxed">
                  Candy was so down that he started composing a letter for his friends and family to read after his death. 
                  His doctors, however, weren't quite ready to give up on their patient.
                </p>

                {/* The Procedure Section */}
                <div className="border-l-4 border-blue-500 pl-6 py-2">
                  <h4 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    A Good Gig — The MitraClip® Procedure
                  </h4>
                  <p className="text-foreground/80 leading-relaxed mb-3">
                    Dr. Andrew Kao, a cardiologist at Saint Luke's Mid America Heart Institute, told Candy about a 
                    clinical trial under way at Saint Luke's just for people like him — too weak to undergo open heart 
                    surgery to replace or repair the mitral valve.
                  </p>
                  <p className="text-foreground/80 leading-relaxed mb-3">
                    Saint Luke's is one of 100 sites around the United States and Canada participating in the 
                    Cardiovascular Outcomes Assessment of the MitraClip® Percutaneous Therapy (COAPT) trial.
                  </p>
                  <p className="text-foreground/80 leading-relaxed">
                    Dr. Adnan Chhatriwalla, an interventional cardiologist at the Heart Institute, performed the 
                    procedure — inserting a catheter into a vein in Candy's groin to guide the MitraClip device to 
                    the mitral valve. Candy received three clips in total to reduce the degree of mitral regurgitation 
                    from severe to mild. He was discharged home just one day after the procedure.
                  </p>
                </div>

                {/* Doctor Quote */}
                <div className="bg-foreground/5 rounded-xl p-6 border border-foreground/10">
                  <Quote className="w-8 h-8 text-blue-500/50 mb-3" />
                  <blockquote className="text-lg text-foreground/80 italic leading-relaxed">
                    "The procedure causes much less trauma than going through the chest wall."
                  </blockquote>
                  <p className="text-foreground/50 mt-2 text-sm">— Dr. Adnan Chhatriwalla, Interventional Cardiologist</p>
                </div>

                {/* Results Section */}
                <div className="border-l-4 border-teal-500 pl-6 py-2">
                  <h4 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-teal-500" />
                    Dandy Candy — The Recovery
                  </h4>
                  <p className="text-foreground/80 leading-relaxed mb-3">
                    It took Candy only a week to start feeling better. The procedure reduced blood pooling by 75 percent. 
                    That figure translated into a remarkable expansion of what Candy could now enjoy in life.
                  </p>
                  <p className="text-foreground/80 leading-relaxed">
                    He became a regular at Margaret's Place, a community center where he used the exercise bike, played 
                    Spades, and went on outings around town. He could practice his guitar for two hours now, up from 
                    30 minutes. Although not quite up to performing as a musician again, he read from the books he'd 
                    written on miracles, including the ones in his own life.
                  </p>
                </div>

                {/* Candy's Quote */}
                <div className="bg-amber-500/10 rounded-xl p-6 border border-amber-500/20">
                  <Quote className="w-8 h-8 text-amber-500/50 mb-3" />
                  <blockquote className="text-xl text-foreground italic leading-relaxed font-medium">
                    "God has put together the best team at Saint Luke's, bringing doctors from around the world to work 
                    on my case. Thanks to them, I'm back to being Candy Hunter. I don't feel like I want to die anymore."
                  </blockquote>
                  <p className="text-foreground/50 mt-3 text-sm">— Seabrun "Candy" Hunter</p>
                </div>

                <p className="text-foreground/80 leading-relaxed">
                  Instead of working on his last words, he was writing marriage vows for his upcoming wedding — because 
                  now he had the strength to walk down the aisle without a stop.
                </p>

                {/* Procedure Summary Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-foreground/20">
                        <th className="text-left py-3 px-4 text-foreground font-bold">Detail</th>
                        <th className="text-left py-3 px-4 text-foreground font-bold">Information</th>
                      </tr>
                    </thead>
                    <tbody className="text-foreground/70">
                      <tr className="border-b border-foreground/10">
                        <td className="py-3 px-4 font-medium">Patient</td>
                        <td className="py-3 px-4">Seabrun "Candy" Hunter, age 68</td>
                      </tr>
                      <tr className="border-b border-foreground/10">
                        <td className="py-3 px-4 font-medium">Condition</td>
                        <td className="py-3 px-4">Congestive heart failure with severe mitral regurgitation</td>
                      </tr>
                      <tr className="border-b border-foreground/10">
                        <td className="py-3 px-4 font-medium">Device</td>
                        <td className="py-3 px-4">MitraClip® (transcatheter mitral valve repair)</td>
                      </tr>
                      <tr className="border-b border-foreground/10">
                        <td className="py-3 px-4 font-medium">Clinical Trial</td>
                        <td className="py-3 px-4">COAPT Trial (100 sites across US & Canada)</td>
                      </tr>
                      <tr className="border-b border-foreground/10">
                        <td className="py-3 px-4 font-medium">Hospital</td>
                        <td className="py-3 px-4">Saint Luke's Mid America Heart Institute, Kansas City</td>
                      </tr>
                      <tr className="border-b border-foreground/10">
                        <td className="py-3 px-4 font-medium">Physicians</td>
                        <td className="py-3 px-4">Dr. Andrew Kao (Cardiologist), Dr. Adnan Chhatriwalla (Interventional Cardiologist)</td>
                      </tr>
                      <tr className="border-b border-foreground/10">
                        <td className="py-3 px-4 font-medium">Clips Placed</td>
                        <td className="py-3 px-4">3 clips — reduced regurgitation from severe to mild</td>
                      </tr>
                      <tr className="border-b border-foreground/10">
                        <td className="py-3 px-4 font-medium">Result</td>
                        <td className="py-3 px-4">75% reduction in blood pooling, discharged 1 day post-procedure</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">Recovery</td>
                        <td className="py-3 px-4">Felt better within 1 week; guitar practice 30 min → 2 hours</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Source Link */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-foreground/10">
                  <a
                    href="https://www.saintlukeskc.org/news/new-device-helps-musicians-congestive-heart-failure"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Read Full Article at Saint Luke's
                  </a>
                  <Link href="/rrb/proof-vault">
                    <span className="inline-flex items-center gap-2 px-5 py-3 border border-blue-500 text-blue-500 hover:bg-blue-500/10 rounded-lg font-medium transition-colors cursor-pointer">
                      <Shield className="w-4 h-4" />
                      View in Proof Vault
                    </span>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attribution */}
          <p className="text-xs text-foreground/40 mt-4 text-center">
            Article content reproduced from Saint Luke's Health System (saintlukeskc.org) for archival and educational purposes. 
            Original article published January 15, 2018. © BJC Health System. All rights reserved.
          </p>
        </div>
      </section>

      {/* Journey Chapters */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
            <Music className="w-8 h-8 text-teal-500" />
            The Full Journey
          </h2>
          <div className="space-y-6">
            {journeyChapters.map((chapter, idx) => (
              <Card key={idx} className="hover:border-teal-500/20 transition-colors">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold text-foreground mb-3">{chapter.title}</h3>
                  <p className="text-foreground/70 leading-relaxed">{chapter.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
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
            This page is shared with the consent of the family. The Saint Luke's article is reproduced for archival 
            and educational purposes with proper attribution. This page is part of the Seabrun Candy Hunter Legacy 
            Archive, presented for historical preservation and educational purposes.
          </p>
        </div>
      </section>
    </div>
  );
}
