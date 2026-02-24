/**
 * Little Richard FAQ Page
 * Comprehensive FAQ about Little Richard's influence on rock and roll
 * and his connection to Rockin' Rockin' Boogie platform
 * SEO-optimized for "Little Richard FAQ", "rock and roll history", "Little Richard influence"
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, Music, HelpCircle, Star, Zap, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { injectBreadcrumbSchema, breadcrumbPaths } from '@/lib/breadcrumbSchema';

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
  category: 'history' | 'influence' | 'collaboration' | 'platform';
}

const faqItems: FAQItem[] = [
  {
    category: 'history',
    question: 'Who was Little Richard?',
    answer: (
      <div className="space-y-3 text-gray-300">
        <p>
          Little Richard (Richard Wayne Penniman, 1932-2020) was an American musician and singer-songwriter who is widely recognized as a founding figure of rock and roll. Born in Macon, Georgia, he revolutionized popular music with his explosive energy, innovative piano playing, and unforgettable vocal style.
        </p>
        <p>
          His 1955 hit "Tutti Frutti" is often cited as one of the first true rock and roll records, and his influence on subsequent generations of musicians — from The Beatles to Jimi Hendrix to modern artists — cannot be overstated.
        </p>
      </div>
    ),
  },
  {
    category: 'history',
    question: 'When was Little Richard born and when did he die?',
    answer: (
      <div className="space-y-3 text-gray-300">
        <p>
          <strong>Born:</strong> December 5, 1932, in Macon, Georgia
        </p>
        <p>
          <strong>Died:</strong> May 9, 2020, at age 87
        </p>
        <p>
          Little Richard had a career spanning nearly 70 years, from his first recordings in the early 1950s until his death in 2020. He remained an active and influential figure in music throughout his life.
        </p>
      </div>
    ),
  },
  {
    category: 'history',
    question: 'What are Little Richard\'s most famous songs?',
    answer: (
      <div className="space-y-3 text-gray-300">
        <p>
          Little Richard released numerous hits that became rock and roll classics:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>"Tutti Frutti"</strong> (1955) — His breakthrough hit and rock and roll anthem</li>
          <li><strong>"Long Tall Sally"</strong> (1956) — A rock and roll standard</li>
          <li><strong>"Good Golly Miss Molly"</strong> (1958) — An energetic rocker</li>
          <li><strong>"Lucille"</strong> (1957) — A classic ballad</li>
          <li><strong>"Keep A-Knockin'"</strong> (1952) — An early rhythm and blues hit</li>
          <li><strong>"Rockin' Rockin' Boogie"</strong> (1971) — Co-written with Seabrun Hunter</li>
        </ul>
      </div>
    ),
  },
  {
    category: 'influence',
    question: 'Why is Little Richard considered the King of Rock and Roll?',
    answer: (
      <div className="space-y-3 text-gray-300">
        <p>
          Little Richard earned the title "King of Rock and Roll" for several revolutionary reasons:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Pioneered the sound:</strong> He combined gospel passion, blues feeling, and unbridled energy to create the template for rock and roll itself</li>
          <li><strong>Revolutionary performance style:</strong> He played piano with both hands and feet, jumped on top of it, and performed with uninhibited passion — setting the standard for rock showmanship</li>
          <li><strong>Broke racial barriers:</strong> As a Black artist in the segregated 1950s, he refused to compromise his artistry or dignity</li>
          <li><strong>Influenced everyone:</strong> The Beatles, Elvis Presley, Jimi Hendrix, and virtually every rock artist who followed cited him as a direct influence</li>
        </ul>
      </div>
    ),
  },
  {
    category: 'influence',
    question: 'How did Little Richard influence The Beatles and other rock legends?',
    answer: (
      <div className="space-y-3 text-gray-300">
        <p>
          Little Richard's influence on rock and roll legends was profound and direct:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>The Beatles:</strong> Paul McCartney cited Little Richard as a major influence on the band's sound and energy. They covered his songs and adopted his approach to combining different musical styles</li>
          <li><strong>Elvis Presley:</strong> Elvis acknowledged Little Richard's pioneering role in rock and roll and incorporated elements of his style into his own performances</li>
          <li><strong>Jimi Hendrix:</strong> Hendrix was influenced by Little Richard's innovative approach to the guitar and his fearless stage presence</li>
          <li><strong>David Bowie, Prince, and others:</strong> Modern artists continue to cite Little Richard as a foundational influence on their approach to music and performance</li>
        </ul>
      </div>
    ),
  },
  {
    category: 'influence',
    question: 'What was Little Richard\'s impact on breaking racial barriers in music?',
    answer: (
      <div className="space-y-3 text-gray-300">
        <p>
          Little Richard was a barrier-breaker in multiple ways:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Racial integration:</strong> In the segregated 1950s, his music appealed to both Black and white audiences, helping to break down racial barriers in the music industry</li>
          <li><strong>Artistic integrity:</strong> He refused to compromise his artistry or dignity for commercial success, setting a standard for Black artists to follow</li>
          <li><strong>Stage presence:</strong> His uninhibited performance style challenged conservative norms and opened doors for more expressive and authentic performances</li>
          <li><strong>Industry respect:</strong> He demanded and received respect from record labels, producers, and audiences, paving the way for future generations of Black artists</li>
        </ul>
      </div>
    ),
  },
  {
    category: 'collaboration',
    question: 'Who was Seabrun Candy Hunter and how did he collaborate with Little Richard?',
    answer: (
      <div className="space-y-3 text-gray-300">
        <p>
          Seabrun Candy Hunter was a talented musician and songwriter from Detroit, Michigan, who became a protégé and close collaborator of Little Richard during the 1970s.
        </p>
        <p>
          According to Candy Hunter's own documentation, Little Richard took Seabrun under his wing as a mentor, manager, and creative partner. The collaboration included:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Worldwide tours and performances together</li>
          <li>Recording sessions where they co-wrote and recorded songs</li>
          <li>Professional guidance and mentorship from the rock and roll pioneer</li>
          <li>Co-writing of "Rockin' Rockin' Boogie," released on Reprise Records in 1971/1972</li>
        </ul>
      </div>
    ),
  },
  {
    category: 'collaboration',
    question: 'What is "Rockin\' Rockin\' Boogie" and why is it significant?',
    answer: (
      <div className="space-y-3 text-gray-300">
        <p>
          "Rockin' Rockin' Boogie" is a song co-written by Little Richard (Richard Penniman) and Seabrun Candy Hunter, released on Reprise Records (K 14343) in 1971/1972.
        </p>
        <p>
          <strong>Significance:</strong>
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Documented collaboration:</strong> The physical vinyl record provides definitive proof of the partnership between Little Richard and Seabrun Hunter</li>
          <li><strong>Major label release:</strong> Released on Reprise Records under Little Richard's name, demonstrating the legitimacy of the collaboration</li>
          <li><strong>Professional production:</strong> Produced by H.B. Barnum (legendary arranger/producer) with Alvin Taylor on drums</li>
          <li><strong>Legacy foundation:</strong> The song became the centerpiece of the Rockin' Rockin' Boogie platform, honoring both artists' contributions to rock and roll</li>
        </ul>
      </div>
    ),
  },
  {
    category: 'collaboration',
    question: 'What years did Little Richard and Seabrun Candy Hunter collaborate?',
    answer: (
      <div className="space-y-3 text-gray-300">
        <p>
          <strong>Primary collaboration period: 1971-1980</strong>
        </p>
        <p>
          This decade represents a crucial intersection of two musical legacies. Key milestones:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>1971:</strong> Little Richard meets Seabrun and begins mentorship; "Rockin' Rockin' Boogie" is written and recorded</li>
          <li><strong>1972-1975:</strong> Worldwide tours and performances together; additional recordings including "I Saw What You Did" and "Standing Right Here"</li>
          <li><strong>1976-1978:</strong> Peak creative period with multiple recordings and performances</li>
          <li><strong>1979-1980:</strong> Legacy solidified; recordings preserved on vinyl and in history</li>
        </ul>
      </div>
    ),
  },
  {
    category: 'platform',
    question: 'What is Rockin\' Rockin\' Boogie and how does it honor Little Richard?',
    answer: (
      <div className="space-y-3 text-gray-300">
        <p>
          Rockin' Rockin' Boogie is a comprehensive digital platform dedicated to honoring the legacy of Seabrun Candy Hunter and his mentor, Little Richard. The platform includes:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>24/7 Radio Broadcasting:</strong> Multiple channels featuring music from the era and contemporary artists influenced by Little Richard</li>
          <li><strong>Legacy Documentation:</strong> Comprehensive pages documenting Little Richard's biography, influence, and collaboration with Seabrun Hunter</li>
          <li><strong>Historical Archives:</strong> Primary source evidence including vinyl records, Facebook posts, and independent verification from session musicians</li>
          <li><strong>Community Platform:</strong> Tools for community engagement, emergency broadcasting, and media production</li>
          <li><strong>Educational Resources:</strong> FAQs, timelines, and biographical information about Little Richard and the 1971-1980 collaboration</li>
        </ul>
      </div>
    ),
  },
  {
    category: 'platform',
    question: 'How can I learn more about Little Richard\'s connection to Rockin\' Rockin\' Boogie?',
    answer: (
      <div className="space-y-3 text-gray-300">
        <p>
          Explore these resources on the Rockin' Rockin' Boogie platform:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>
            <Link href="/rrb/little-richard-biography" className="text-orange-400 hover:text-orange-300 underline">
              Little Richard Biography & Timeline (1971-1980)
            </Link>
          </li>
          <li>
            <Link href="/rrb/little-richard-connection" className="text-orange-400 hover:text-orange-300 underline">
              Little Richard Connection with Primary Source Evidence
            </Link>
          </li>
          <li>
            <Link href="/rrb/candy-through-the-years" className="text-orange-400 hover:text-orange-300 underline">
              Candy Through the Years (Seabrun's Journey)
            </Link>
          </li>
          <li>
            <Link href="/rrb/radio-station" className="text-orange-400 hover:text-orange-300 underline">
              Listen to "Rockin' Rockin' Boogie" and Related Music
            </Link>
          </li>
        </ul>
      </div>
    ),
  },
  {
    category: 'platform',
    question: 'Why is the 1971-1980 timeline important?',
    answer: (
      <div className="space-y-3 text-gray-300">
        <p>
          The 1971-1980 period represents a transformative decade in rock and roll history:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Peak mentorship:</strong> Little Richard was at the height of his influence and actively mentoring the next generation</li>
          <li><strong>Creative collaboration:</strong> The partnership between Richard and Seabrun produced documented recordings and performances</li>
          <li><strong>Legacy continuity:</strong> This era ensured that the spirit and innovation of rock and roll would continue beyond Little Richard's lifetime</li>
          <li><strong>Historical documentation:</strong> Physical records (vinyl), personal documentation (Facebook posts), and independent verification (session musicians) preserve this era for future generations</li>
          <li><strong>Foundation of RRB:</strong> The songs, collaborations, and mentorship from this period form the foundation of the Rockin' Rockin' Boogie platform</li>
        </ul>
      </div>
    ),
  },
];

function FAQAccordion() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const categories = {
    history: { label: 'Little Richard History', icon: BookOpen, color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' },
    influence: { label: 'Musical Influence', icon: Star, color: 'from-orange-500/20 to-red-500/20 border-orange-500/30' },
    collaboration: { label: 'Collaboration (1971-1980)', icon: Music, color: 'from-pink-500/20 to-purple-500/20 border-pink-500/30' },
    platform: { label: 'Rockin\' Rockin\' Boogie Platform', icon: Zap, color: 'from-purple-500/20 to-blue-500/20 border-purple-500/30' },
  };

  const groupedFAQ = Object.entries(categories).reduce((acc, [key, _]) => {
    acc[key as keyof typeof categories] = faqItems.filter(item => item.category === key);
    return acc;
  }, {} as Record<keyof typeof categories, FAQItem[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedFAQ).map(([categoryKey, items]) => {
        const category = categories[categoryKey as keyof typeof categories];
        const IconComponent = category.icon;

        return (
          <div key={categoryKey} className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <IconComponent className="w-6 h-6 text-orange-400" />
              <h2 className="text-2xl font-bold text-white">{category.label}</h2>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <Card
                  key={idx}
                  className={`bg-gradient-to-br ${category.color} cursor-pointer transition-all hover:shadow-lg`}
                  onClick={() => setExpandedId(expandedId === idx ? null : idx)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-lg text-white text-left flex-1">
                        {item.question}
                      </CardTitle>
                      <ChevronDown
                        className={`w-5 h-5 text-orange-400 flex-shrink-0 transition-transform ${
                          expandedId === idx ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </CardHeader>

                  {expandedId === idx && (
                    <CardContent className="pt-0">
                      {item.answer}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function LittleRichardFAQ() {
  useEffect(() => {
    injectBreadcrumbSchema(breadcrumbPaths.littleRichardFAQ);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-orange-950/10 to-gray-950 text-gray-100">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Little Richard FAQ
          </h1>
          <p className="text-xl text-gray-300">
            Frequently Asked Questions about the King of Rock and Roll
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Explore questions about Little Richard's life, influence, collaboration with Seabrun Candy Hunter (1971-1980), and the Rockin' Rockin' Boogie platform.
          </p>
        </div>

        {/* FAQ Accordion */}
        <FAQAccordion />

        {/* Additional Resources */}
        <section className="space-y-6 pt-8 border-t border-gray-800">
          <h2 className="text-3xl font-bold text-white">Additional Resources</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30">
              <CardContent className="pt-6 space-y-3">
                <h3 className="font-bold text-orange-300 text-lg">Little Richard Biography</h3>
                <p className="text-gray-300 text-sm">
                  Read the comprehensive biography of Little Richard with detailed timeline of his 1971-1980 collaboration with Seabrun Candy Hunter.
                </p>
                <Link href="/rrb/little-richard-biography" className="text-orange-400 hover:text-orange-300 underline text-sm">
                  Read Biography →
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30">
              <CardContent className="pt-6 space-y-3">
                <h3 className="font-bold text-pink-300 text-lg">Little Richard Connection</h3>
                <p className="text-gray-300 text-sm">
                  Explore primary source evidence documenting the connection between Little Richard and Seabrun Candy Hunter.
                </p>
                <Link href="/rrb/little-richard-connection" className="text-pink-400 hover:text-pink-300 underline text-sm">
                  View Evidence →
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30">
              <CardContent className="pt-6 space-y-3">
                <h3 className="font-bold text-purple-300 text-lg">Listen to the Music</h3>
                <p className="text-gray-300 text-sm">
                  Stream "Rockin' Rockin' Boogie" and other songs from the 1971-1980 collaboration on our 24/7 radio station.
                </p>
                <Link href="/rrb/radio-station" className="text-purple-400 hover:text-purple-300 underline text-sm">
                  Go to Radio Station →
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30">
              <CardContent className="pt-6 space-y-3">
                <h3 className="font-bold text-blue-300 text-lg">Candy's Journey</h3>
                <p className="text-gray-300 text-sm">
                  Follow Seabrun Candy Hunter's life journey and his transformative years with Little Richard.
                </p>
                <Link href="/rrb/candy-through-the-years" className="text-blue-400 hover:text-blue-300 underline text-sm">
                  Explore Journey →
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm space-y-2 border-t border-gray-800 pt-8">
          <p>
            Have a question that's not answered here? Check out our other resources or contact us through the platform.
          </p>
          <p>
            All information is based on documented primary sources and verified historical records.
          </p>
        </div>
      </div>
    </div>
  );
}
