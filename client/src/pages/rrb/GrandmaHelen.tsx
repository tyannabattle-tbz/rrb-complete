/**
 * Grandma Helen - Family History & Matriarch of the Legacy
 * Celebrates the family foundation that shaped Seabrun Candy Hunter
 * Features the Life Care Leader 2014 magazine article "Beauty More Than Skin Deep"
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Users, Home, Star, BookOpen, Award, Sparkles, Quote, X, ChevronLeft, ChevronRight, Camera, FileText, ExternalLink, Landmark } from 'lucide-react';
import { Link } from 'wouter';

// Life Care Leader Magazine Images
const magazineImages = {
  cover: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/nFVxQsUswNIAulPd.JPG',
  articleSpread: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/FUNFfoBCLSCFUdqP.JPG',
  tableOfContents: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/qpUARnnfvqjtRBVZ.JPG',
  articleLeft: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/UztbWQFsfodEdIxB.JPG',
  articleMary: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/ukYQqMSuGAoWwljQ.JPG',
  articleEnd: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/sKuIEivEwSPsZkuB.JPG',
  portraitCloseup: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/HEmHnfUqncOWGCeQ.JPG',
};

// Family Photos
const familyPhotos = {
  facebookLeaderPost: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/NpmdhBkNyNlkalAw.jpeg',
  polaroids1989_1990: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/PNkKRfFeHtZLHQDr.jpeg',
  candyTributeText: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/kFAuntHHpEwLMLqd.jpeg',
  district1Pageant: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/sQhWRErPXxuwthGb.png',
};

const magazineGallery = [
  { src: magazineImages.cover, title: 'Life Care Leader Cover, 2014 Edition', caption: 'Helen Hunter graces the cover of Life Care Leader magazine' },
  { src: magazineImages.tableOfContents, title: 'Table of Contents', caption: 'Helen\'s story "Beauty More Than Skin Deep" featured on page 14' },
  { src: magazineImages.articleSpread, title: 'Article Spread', caption: 'The full two-page spread of Helen\'s feature article' },
  { src: magazineImages.articleLeft, title: 'Beauty More Than Skin Deep', caption: 'The article opening with Helen\'s life story from Campbell, Ohio' },
  { src: magazineImages.portraitCloseup, title: 'Helen Hunter Portrait', caption: 'Close-up portrait of Helen Hunter, photo by Matilda McIntyre' },
  { src: magazineImages.articleMary, title: 'The Mary Kay Journey', caption: 'Helen\'s rise to become the first Black senior director at Mary Kay' },
  { src: magazineImages.articleEnd, title: 'A Legacy of Inspiration', caption: 'The conclusion of Helen\'s remarkable story' },
  { src: familyPhotos.facebookLeaderPost, title: 'Candy\'s Facebook Post — Nov 7, 2018', caption: 'Candy Hunter shared the Life Care Leader cover on Facebook: "CANRYN PRODUCTION INC. LEADER MAGAZINE HELEN HUNTER LIFE STORY"' },
  { src: familyPhotos.polaroids1989_1990, title: 'Helen Logan Hunter (1990) & David Lee Logan (1989)', caption: 'Polaroid photos of Helen Logan Hunter and David Lee Logan — family archive' },
  { src: familyPhotos.candyTributeText, title: 'Candy\'s Mother\'s Day Tribute \u2014 May 30, 2015', caption: 'Candy\'s tribute to Helen: "Her son: Seabrun Candy Hunter a well known Hall of Fame Songwriter, Singer and successful Author!" \u2014 describing all of Helen\'s children and their achievements' },
  { src: familyPhotos.district1Pageant, title: 'Ms. District 1 Beauty Pageant \u2014 Age 86', caption: 'Helen Logan Hunter, District 1 contestant at Life Care Center of Grandview. "86 Year Young" \u2014 Pageant Coordinator: Shannon Wakeman, Edgewood Manor Nursing' },
];

const familyValues = [
  {
    title: 'Faith & Resilience',
    description: 'Helen survived polio at age 9 and overcame every obstacle life threw at her. She instilled that same unbreakable spirit in her family.',
    icon: Star,
  },
  {
    title: 'Music as Heritage',
    description: 'Music was never just entertainment in Helen\'s household — it was heritage. She encouraged every child to find their voice and share their gift.',
    icon: BookOpen,
  },
  {
    title: 'Family Unity',
    description: '"We all sacrificed to make it work together because we were all we had," said Seabrun Hunter, her son. Family was everything.',
    icon: Users,
  },
  {
    title: 'Community Service',
    description: 'Helen served women at Life Care Center of Grandview, Missouri with Mary Kay products and encouragement — always helping others feel beautiful.',
    icon: Heart,
  },
];

type TimelineEra = {
  era: string;
  color: string;
  bgColor: string;
  borderColor: string;
  events: { year: string; event: string; highlight?: boolean; icon: typeof Heart }[];
};

const timelineEras: TimelineEra[] = [
  {
    era: 'Early Life & Resilience',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    events: [
      { year: '1929', event: 'Helen Mildred Warren born April 17 in Campbell, Ohio — one of two children, arriving just before the stock market crash', icon: Star },
      { year: '1938', event: 'Contracted polio at age 9 — fought back with determination and her brother\'s support to fully recover', highlight: true, icon: Heart },
      { year: '1946', event: 'At age 17, married Seabrun Whitney Hunter, Sr. in Buffalo, N.Y. and soon had three children — putting high school on hold', icon: Home },
    ],
  },
  {
    era: 'Detroit: Model, Student, Mother',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    events: [
      { year: '1954', event: 'Family relocated to Detroit, Michigan; began career as a fashion model', icon: Sparkles },
      { year: '1961', event: 'Enrolled at Commerce High School while still modeling; her three children helped her study and graduate', highlight: true, icon: BookOpen },
      { year: 'c. 1965', event: 'Earned LPN certification with Pharmacology training; worked two jobs to send children to private church school', highlight: true, icon: Award },
    ],
  },
  {
    era: 'Mary Kay Pioneer',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    events: [
      { year: '1971', event: 'Joined Mary Kay Cosmetics as a second job alongside nursing', icon: Sparkles },
      { year: '1972', event: 'Mary Kay Ash personally handed Helen the keys to her first pink Cadillac at the annual Seminar conference', highlight: true, icon: Star },
      { year: '1970s–90s', event: 'First Black Senior Director at Mary Kay — held the position for 23 years; won highest honors including 2 Pink Cadillacs, 2 Buick Regals, and a Pontiac Grand Am', highlight: true, icon: Award },
      { year: 'c. 1994', event: 'Health issues forced retirement from Mary Kay, but she never retired from helping others — "not from society"', icon: Heart },
    ],
  },
  {
    era: 'Legacy & Recognition',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    events: [
      { year: '2013', event: 'First runner-up in beauty pageant at Life Care Center of Grandview; wrote letter to Richard Rogers (Mary Kay Ash\'s son) advocating for Candy\'s books', icon: Star },
      { year: '2014', event: 'Featured on the cover of Life Care Leader magazine — "Beauty More Than Skin Deep"', highlight: true, icon: Camera },
      { year: 'c. 2015', event: 'District 1 beauty pageant contestant at age 86; President of the Resident Council at Life Care Center of Grandview', highlight: true, icon: Award },
      { year: '2015', event: 'Candy Hunter published Mother\'s Day tribute on Facebook: "YOU ARE REALLY ARE MY QUEEN!"', icon: Heart },
      { year: '2016', event: 'Honored by the Missouri Senate — Senate Resolution No. 1462, adopted February 17, 2016', highlight: true, icon: Landmark },
      { year: '2018', event: 'Candy shared Life Care Leader cover on Facebook via Canryn Production Inc.', icon: Users },
    ],
  },
];

export default function GrandmaHelen() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const goNext = () => { if (lightboxIndex !== null) setLightboxIndex((lightboxIndex + 1) % magazineGallery.length); };
  const goPrev = () => { if (lightboxIndex !== null) setLightboxIndex((lightboxIndex - 1 + magazineGallery.length) % magazineGallery.length); };
  const currentImage = lightboxIndex !== null ? magazineGallery[lightboxIndex] : null;

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Hero Section with Magazine Cover */}
      <section className="relative bg-gradient-to-b from-rose-950/40 via-stone-950 to-stone-950 border-b border-rose-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-900/15 via-transparent to-transparent" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="bg-rose-700 text-white mb-4 text-sm px-4 py-1">
                <Heart className="w-3.5 h-3.5 mr-2" />
                Family Matriarch
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-rose-100 mb-2">
                Helen Hunter
              </h1>
              <p className="text-sm text-rose-400/60 mb-4 font-medium tracking-wide">
                Born Helen Mildred Warren &middot; April 17, 1929 &middot; Campbell, Ohio
              </p>
              <p className="text-xl md:text-2xl text-rose-300/80 mb-2 italic">
                "Beauty More Than Skin Deep"
              </p>
              <p className="text-lg text-stone-400 max-w-xl leading-relaxed mb-6">
                Born Helen Mildred Warren in Campbell, Ohio on April 17, 1929. Polio survivor. Runway model. 
                Commerce High School graduate. Licensed Practical Nurse with Pharmacology training. 
                The first Black Senior Director at Mary Kay Cosmetics — a position she held for 23 years. 
                Winner of Mary Kay's highest honors: two Pink Cadillacs, two Buick Regals, and a Pontiac Grand Am. 
                Wife of Seabrun Whitney Hunter, Sr. Mother of three. Blessed with 7 grandchildren, 
                17 great grandchildren, and 4 great great grandchildren. The foundation of the Hunter legacy.
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Badge variant="outline" className="border-rose-700/50 text-rose-300 px-3 py-1">
                  <Award className="w-3 h-3 mr-1.5" />
                  Life Care Leader Cover, 2014
                </Badge>
                <Badge variant="outline" className="border-rose-700/50 text-rose-300 px-3 py-1">
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  Mary Kay Pioneer
                </Badge>
              </div>
            </div>
            <div className="flex justify-center">
              <div 
                className="relative cursor-pointer group"
                onClick={() => openLightbox(0)}
              >
                <img
                  src={magazineImages.cover}
                  alt="Helen Hunter on the cover of Life Care Leader magazine, 2014 Edition"
                  className="w-80 md:w-96 rounded-xl shadow-2xl shadow-rose-900/30 group-hover:shadow-rose-900/50 transition-shadow duration-300"
                />
                <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute -bottom-3 -right-3 bg-rose-700 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg">
                  Life Care Leader, 2014
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inspirational Quote */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Quote className="w-10 h-10 text-rose-500/40 mx-auto mb-4" />
          <blockquote className="text-2xl md:text-3xl font-light text-rose-200/90 italic leading-relaxed mb-4">
            "Don't limit yourself. Many people limit themselves to what they think they can do. 
            You can go as far as your mind lets you. What you believe, remember, you can achieve."
          </blockquote>
          <p className="text-stone-500 text-sm">
            — Mary Kay Ash, Founder of Mary Kay Cosmetics, Inc. (quoted in Helen's article)
          </p>
        </div>
      </section>

      {/* Life Story from the Article */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-rose-100 mb-8 text-center">Her Remarkable Story</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-stone-900/60 border-stone-800/50">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold text-rose-200 mb-3">From Campbell, Ohio to the World</h3>
                  <p className="text-stone-300 leading-relaxed mb-4">
                    Helen Mildred Warren was born in Campbell, Ohio on April 17, 1929 — one of two children, 
                    arriving shortly before the crash of the stock market. As a young child, her family moved to 
                    Buffalo, New York, but an absent father left Helen, along with her half-brother and mother, 
                    struggling to survive. As she later wrote in her own resume: she "didn't have aspirations of 
                    achieving any goals, only to survive." This struggle was quickly compounded when she contracted 
                    polio at 9 years old, a disease that often left children paralyzed or crippled, if they survived at all.
                  </p>
                  <p className="text-stone-300 leading-relaxed">
                    It was the determination in her heart and the support of her brother, especially, that gave her 
                    the strength to fully recover from polio, eventually regaining full mobility. As Helen regained 
                    her strength, she finished grade school in Buffalo, N.Y. and continued her education until 1946, 
                    when she fell in love with Seabrun Whitney Hunter, Sr., got married at age 17 in Buffalo, and soon had three children.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-stone-900/60 border-stone-800/50">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold text-rose-200 mb-3">Model, Nurse, Mother</h3>
                  <p className="text-stone-300 leading-relaxed mb-4">
                    In 1954, the young family relocated to Detroit, Michigan, where Helen began a career as a 
                    fashion model. Over the next several years, her modeling career kept her busy, but the desire to 
                    finish high school never left her mind. In 1961, she began classes at <strong className="text-rose-300">Commerce High School</strong> while 
                    still modeling, and enlisted her three children to help her graduate. They stayed up late after 
                    school and quizzed her so she could pass her exams. The family's efforts and hard work paid off, 
                    and she graduated.
                  </p>
                  <p className="text-stone-300 leading-relaxed">
                    The rocky marriage ended in divorce — something she admits was the most difficult experience of 
                    her life. "The hardest thing was to find a way to rear my children the way I wanted to," shared 
                    Helen. "I had to work two jobs to pay for church school and to take care of everything that you 
                    have to take care of to live in this world." She worked two jobs to send her children to a 
                    <strong className="text-rose-300">private church school</strong>. The hardship couldn't stop her drive. She earned her Licensed 
                    Practical Nurse certification, took classes in <strong className="text-rose-300">Pharmacology</strong>, and continued to model — 
                    again with the help of her children.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-stone-900/60 border-stone-800/50">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold text-rose-200 mb-3">The Mary Kay Revolution</h3>
                  <p className="text-stone-300 leading-relaxed mb-4">
                    After becoming a nurse at 39 years old, Helen followed her daughter, Gloria Walker, to Houston, 
                    then to Texas, where a neighbor told her she would be great for a direct sales cosmetic company 
                    called Mary Kay. Drawn to the idea of making more money, she joined in 1971, using it as a second 
                    job alongside nursing.
                  </p>
                  <p className="text-stone-300 leading-relaxed mb-4">
                    "I came into a white world, and it was a little bit difficult there," said Helen. "I had a lot of 
                    obstacles to overcome." But Mary Kay Ash worked with her personally to encourage and develop her 
                    business. Within a year of joining, Helen became the second Black director in the company. She 
                    set her sights on being the <strong className="text-rose-300">first Black Senior Director</strong> at 
                    Mary Kay Cosmetics — and she achieved it, holding that position for <strong className="text-rose-300">23 years</strong>.
                  </p>
                  <p className="text-stone-300 leading-relaxed">
                    Helen's proudest moment came when Mary Kay Ash personally handed her the keys to her first pink 
                    Cadillac at the 1972 annual conference. Throughout her career, she won Mary Kay's highest honors 
                    for achievement, earning <strong className="text-rose-300">two Pink Cadillacs, two Buick Regals, and a 
                    Pontiac Grand Am</strong> — five cars in total — and kept close to her mentor. "She was just like the 
                    girl next door," Helen said of Mary Kay Ash. "She was like a mom to me... giving me a pink 
                    Cadillac, mink coat and lots of diamonds along the way."
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar with portrait */}
            <div className="space-y-6">
              <div 
                className="cursor-pointer group"
                onClick={() => openLightbox(4)}
              >
                <img
                  src={magazineImages.portraitCloseup}
                  alt="Helen Hunter close-up portrait, photo by Matilda McIntyre"
                  className="w-full rounded-xl shadow-lg group-hover:shadow-rose-900/30 transition-shadow"
                />
                <p className="text-xs text-stone-600 mt-2 text-center">Photo by Matilda McIntyre</p>
              </div>

              <Card className="bg-rose-950/30 border-rose-900/30">
                <CardContent className="pt-6 text-center">
                  <Quote className="w-6 h-6 text-rose-400 mx-auto mb-3" />
                  <p className="text-rose-200 italic leading-relaxed text-sm mb-3">
                    "Don't accept 'no' if you don't want it to be your answer. If you try hard enough 
                    and you believe hard enough and you pray hard enough, you can overcome. You can succeed. 
                    And don't let yourself hold yourself back."
                  </p>
                  <p className="text-stone-500 text-xs">— Helen Hunter</p>
                </CardContent>
              </Card>

              <Card className="bg-rose-950/30 border-rose-900/30">
                <CardContent className="pt-6 text-center">
                  <Quote className="w-6 h-6 text-rose-400 mx-auto mb-3" />
                  <p className="text-rose-200 italic leading-relaxed text-sm mb-3">
                    "Once she had a goal in her mind that she set, there was nothing to stop her from doing it. 
                    With all of our help and the help of our family ties, there was no way she could miss being successful."
                  </p>
                  <p className="text-stone-500 text-xs">— Seabrun Hunter, her son</p>
                </CardContent>
              </Card>

              <Card className="bg-rose-950/30 border-rose-900/30">
                <CardContent className="pt-6 text-center">
                  <p className="text-rose-200 italic leading-relaxed text-sm mb-3">
                    "I knew I would be [successful] because Mary Kay told me I would! That there's nowhere 
                    I can't go, and being black had nothing to do with it. And she was right."
                  </p>
                  <p className="text-stone-500 text-xs">— Helen Hunter</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Visualization */}
      <section className="py-16 px-4 bg-stone-900/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-rose-100 mb-2 text-center">Life Timeline</h2>
          <p className="text-stone-400 text-center mb-12">A journey of resilience, reinvention, and recognition</p>
          
          <div className="relative">
            {/* Central vertical line */}
            <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/40 via-pink-500/40 to-rose-500/40" />
            
            {timelineEras.map((era, eraIdx) => (
              <div key={eraIdx} className="mb-12 last:mb-0">
                {/* Era Header */}
                <div className="relative flex items-center mb-6">
                  <div className="absolute left-[20px] md:left-1/2 md:-translate-x-1/2 w-[18px] h-[18px] rounded-full bg-stone-950 border-2 border-current z-10" style={{ borderColor: era.color === 'text-amber-400' ? '#fbbf24' : era.color === 'text-sky-400' ? '#38bdf8' : era.color === 'text-pink-400' ? '#f472b6' : '#fb7185' }} />
                  <div className={`ml-16 md:ml-0 md:mx-auto ${era.bgColor} ${era.borderColor} border rounded-full px-6 py-2 relative z-10`}>
                    <span className={`text-sm font-bold ${era.color}`}>{era.era}</span>
                  </div>
                </div>
                
                {/* Events */}
                <div className="space-y-4">
                  {era.events.map((event, eventIdx) => {
                    const isRight = (eraIdx * 4 + eventIdx) % 2 === 0;
                    return (
                      <div key={eventIdx} className="relative flex items-start">
                        {/* Dot on the line */}
                        <div className={`absolute left-[22px] md:left-1/2 md:-translate-x-1/2 w-[13px] h-[13px] rounded-full z-10 mt-1 ${
                          event.highlight 
                            ? 'ring-4 ring-current/20 bg-current' 
                            : 'bg-stone-700 border-2 border-stone-500'
                        }`} style={event.highlight ? { backgroundColor: era.color === 'text-amber-400' ? '#fbbf24' : era.color === 'text-sky-400' ? '#38bdf8' : era.color === 'text-pink-400' ? '#f472b6' : '#fb7185', boxShadow: `0 0 12px ${era.color === 'text-amber-400' ? '#fbbf2440' : era.color === 'text-sky-400' ? '#38bdf840' : era.color === 'text-pink-400' ? '#f472b640' : '#fb718540'}` } : {}} />
                        
                        {/* Mobile: always right */}
                        <div className="md:hidden ml-16 flex-1">
                          <div className={`rounded-lg p-4 ${event.highlight ? `${era.bgColor} ${era.borderColor} border` : 'bg-stone-900/60 border border-stone-800/50'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <event.icon className={`w-4 h-4 ${event.highlight ? era.color : 'text-stone-500'}`} />
                              <span className={`text-sm font-bold ${event.highlight ? era.color : 'text-stone-400'}`}>{event.year}</span>
                            </div>
                            <p className={`text-sm leading-relaxed ${event.highlight ? 'text-stone-200' : 'text-stone-400'}`}>{event.event}</p>
                          </div>
                        </div>
                        
                        {/* Desktop: alternating left/right */}
                        <div className="hidden md:flex w-full items-start">
                          <div className={`w-[calc(50%-24px)] ${isRight ? 'pr-6' : ''}`}>
                            {isRight && (
                              <div className={`rounded-lg p-4 text-right ${event.highlight ? `${era.bgColor} ${era.borderColor} border` : 'bg-stone-900/60 border border-stone-800/50'}`}>
                                <div className="flex items-center gap-2 justify-end mb-1">
                                  <span className={`text-sm font-bold ${event.highlight ? era.color : 'text-stone-400'}`}>{event.year}</span>
                                  <event.icon className={`w-4 h-4 ${event.highlight ? era.color : 'text-stone-500'}`} />
                                </div>
                                <p className={`text-sm leading-relaxed ${event.highlight ? 'text-stone-200' : 'text-stone-400'}`}>{event.event}</p>
                              </div>
                            )}
                          </div>
                          <div className="w-12 shrink-0" />
                          <div className={`w-[calc(50%-24px)] ${!isRight ? 'pl-6' : ''}`}>
                            {!isRight && (
                              <div className={`rounded-lg p-4 ${event.highlight ? `${era.bgColor} ${era.borderColor} border` : 'bg-stone-900/60 border border-stone-800/50'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <event.icon className={`w-4 h-4 ${event.highlight ? era.color : 'text-stone-500'}`} />
                                  <span className={`text-sm font-bold ${event.highlight ? era.color : 'text-stone-400'}`}>{event.year}</span>
                                </div>
                                <p className={`text-sm leading-relaxed ${event.highlight ? 'text-stone-200' : 'text-stone-400'}`}>{event.event}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* In Her Own Words — Resume */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-rose-100 mb-2 text-center">In Her Own Words</h2>
          <p className="text-stone-400 text-center mb-8">From Helen's personal resume, written circa 2013</p>
          
          <Card className="bg-gradient-to-br from-rose-950/30 via-stone-900/60 to-stone-900/60 border-rose-800/40">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-rose-200 mb-1">Resume</h3>
                  <p className="text-stone-400 text-sm">Helen Mildred Warren AKA Helen Logan Hunter</p>
                </div>
              </div>
              
              <div className="bg-stone-950/50 rounded-lg p-6 border border-rose-900/20 space-y-4">
                <p className="text-rose-100/90 leading-relaxed italic">
                  "She came from very humble beginnings during the aftermath of WW1 being born in Campbell Ohio 
                  April 17 1929 one of two children. Helen didn't have aspirations of achieving any goals, only to survive."
                </p>
                <p className="text-rose-100/90 leading-relaxed italic">
                  "She joined Mary Kay Cosmetics as a beauty consultant, set her sights on being the first Black 
                  Senior Director and held that position for 23 years winning Mary Kay's highest honors for achievement, 
                  2 Pink Cadillacs, 2 Buick Regals and a Pontiac Grand Am!"
                </p>
                <p className="text-rose-100/90 leading-relaxed italic">
                  "Health issues made it physically unable for her to continue so she retired from the Company, 
                  but not from society."
                </p>
                <p className="text-rose-100/90 leading-relaxed italic">
                  "Today Helen Is 84 years young and is still a mighty motivating force sharing her experiences, 
                  her love and being a great role model for everyone she meets!"
                </p>
                <p className="text-rose-100/90 leading-relaxed italic font-semibold">
                  "Not bad coming from humble beginnings, HUH?"
                </p>
              </div>
              
              <div className="mt-4 flex items-center gap-2">
                <Badge className="bg-green-900/50 text-green-300 border-green-700/50 px-3 py-1">
                  <FileText className="w-3 h-3 mr-1.5" />
                  Primary Source Document
                </Badge>
                <span className="text-stone-500 text-xs">Personal resume, circa 2013 (Helen age 84)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Letter to Richard Rogers */}
      <section className="py-12 px-4 bg-stone-900/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-rose-100 mb-2 text-center">A Mother's Advocacy</h2>
          <p className="text-stone-400 text-center mb-8">Letter to Richard Rogers, son of Mary Kay Ash — July 10, 2013</p>
          
          <Card className="bg-gradient-to-br from-amber-950/20 via-stone-900/60 to-stone-900/60 border-amber-800/30">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-200 mb-1">Letter to Mr. Richard Rogers</h3>
                  <p className="text-stone-400 text-sm">Mary Kay Cosmetics, Inc. &middot; From Life Care Center of Grandview, MO</p>
                </div>
              </div>
              
              <div className="bg-stone-950/50 rounded-lg p-6 border border-amber-900/20 space-y-4">
                <p className="text-stone-300 leading-relaxed">
                  In this remarkable letter, Helen — at age 84 and living at the Life Care Center of Grandview — 
                  wrote directly to <strong className="text-amber-200">Richard Rogers, the son of Mary Kay Ash</strong>, 
                  to advocate for her son Candy's literary career. She reported that all of Candy's books had been 
                  accepted by Barnes &amp; Noble, with four books being uploaded to B&amp;N E-books, Google Books, and Amazon.
                </p>
                <blockquote className="border-l-2 border-amber-500/40 pl-4 text-rose-100/90 italic">
                  "His belief in the fact that God is still doing Miracles is an understatement in the way that how 
                  God has even touched my life and I've been given a second chance to promote Mary Kay at this age 
                  and under these conditions by letting me be selected to represent my nursing home, being chosen 
                  as first runner up in this beauty pageant."
                </blockquote>
                <p className="text-stone-300 leading-relaxed">
                  Helen described Candy as "trying to stay in the background" to let her light shine, comparing 
                  their mother-son bond to Rogers' own relationship with his mother, Mary Kay Ash. She called 
                  Mary Kay Ash <strong className="text-amber-200">"one of the most fascinating ladies I've ever had 
                  the pleasure of calling my friend."</strong>
                </p>
                <blockquote className="border-l-2 border-amber-500/40 pl-4 text-rose-100/90 italic">
                  "I wish you could do something to help get his books to reach the best sellers list by perhaps 
                  asking all of the consultants coast to coast to at least purchase a book or more to help make 
                  his dream come true. Just a few words from you could help prove that Miracles are still happening today!"
                </blockquote>
              </div>
              
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge className="bg-green-900/50 text-green-300 border-green-700/50 px-3 py-1">
                  <FileText className="w-3 h-3 mr-1.5" />
                  Primary Source Document
                </Badge>
                <span className="text-stone-500 text-xs">Personal letter, July 10, 2013 — Life Care Center of Grandview, MO 64030</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Magazine Gallery */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-rose-100 mb-3 text-center">Life Care Leader Magazine Feature</h2>
          <p className="text-stone-400 text-center mb-8 max-w-2xl mx-auto">
            Helen Hunter was featured on the cover and in a multi-page spread of Life Care Leader magazine, 
            2014 Edition — a publication of Life Care Centers of America. Article by Christina Fullerton.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {magazineGallery.map((img, idx) => (
              <div
                key={idx}
                className="group cursor-pointer relative aspect-[3/4] overflow-hidden rounded-lg bg-stone-800"
                onClick={() => openLightbox(idx)}
              >
                <img
                  src={img.src}
                  alt={img.title}
                  className="w-full h-full object-contain bg-black group-hover:scale-[1.02] transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <p className="text-white text-xs font-medium">{img.title}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-stone-600 text-center mt-4 italic">
            Life Care Leader is a publication of Life Care Centers of America. Magazine images reproduced with 
            family authorization for biographical and historical documentation purposes. &copy; 2014 Life Care Centers of America.
          </p>
        </div>
      </section>

      {/* Missouri Senate Resolution */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-rose-100 mb-3 text-center flex items-center justify-center gap-3">
            <Landmark className="w-8 h-8 text-amber-400" />
            Missouri Senate Resolution
          </h2>
          <p className="text-stone-400 text-center mb-8 max-w-2xl mx-auto">
            Official recognition from the Missouri State Senate — a verified government record honoring Helen Logan Hunter.
          </p>
          <Card className="bg-gradient-to-br from-amber-950/30 via-stone-900/60 to-stone-900/60 border-amber-800/40">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                  <FileText className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-200 mb-1">Senate Resolution No. 1462</h3>
                  <p className="text-stone-400 text-sm">98th General Assembly, Second Regular Session</p>
                </div>
              </div>
              
              <div className="bg-stone-950/50 rounded-lg p-6 mb-6 border border-amber-900/20">
                <p className="text-amber-100/90 text-lg leading-relaxed italic">
                  "Senator Holsman offered Senate Resolution No. 1462, regarding Helen Logan Hunter, Grandview, which was adopted."
                </p>
                <p className="text-stone-500 text-sm mt-3">
                  — Journal of the Senate, Twenty-Fourth Day, Wednesday, February 17, 2016
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-stone-900/50 rounded-lg p-4">
                  <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Resolution Number</p>
                  <p className="text-amber-200 font-bold">SR 1462</p>
                </div>
                <div className="bg-stone-900/50 rounded-lg p-4">
                  <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Date Adopted</p>
                  <p className="text-amber-200 font-bold">February 17, 2016</p>
                </div>
                <div className="bg-stone-900/50 rounded-lg p-4">
                  <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Sponsor</p>
                  <p className="text-amber-200 font-bold">Senator Jason Holsman</p>
                  <p className="text-stone-500 text-xs">District 7 — Kansas City Metro Area</p>
                </div>
                <div className="bg-stone-900/50 rounded-lg p-4">
                  <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Subject</p>
                  <p className="text-amber-200 font-bold">Helen Logan Hunter, Grandview</p>
                </div>
              </div>

              <p className="text-stone-400 text-sm leading-relaxed mb-4">
                Missouri Senate Resolutions are official legislative acts adopted by the full chamber. They are typically used to 
                honor individuals for extraordinary community service, lifetime achievements, or significant milestones. The fact that 
                the Missouri State Senate formally recognized Helen Logan Hunter speaks to the depth of her impact — not just on her 
                family, but on the broader Grandview, Missouri community.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://www.senate.mo.gov/16info/pdf-jrnl/DAY24.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-5 py-2.5 bg-amber-700 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Official Senate Journal (PDF)
                </a>
                <Badge className="bg-green-900/50 text-green-300 border-green-700/50 self-start px-3 py-2">
                  <Award className="w-3.5 h-3.5 mr-1.5" />
                  Verified Government Record
                </Badge>
              </div>
            </CardContent>
          </Card>

          <p className="text-[10px] text-stone-600 text-center mt-4 italic">
            Source: Journal of the Senate, Missouri General Assembly, 98th Session, Second Regular Session, 
            Twenty-Fourth Day — Wednesday, February 17, 2016, Page 334. Public record available at senate.mo.gov.
          </p>
        </div>
      </section>

      {/* Family Values */}
      <section className="py-12 px-4 bg-stone-900/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-rose-100 mb-8 text-center">Values She Instilled</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {familyValues.map((value, idx) => (
              <Card key={idx} className="bg-stone-900/60 border-stone-800/50 hover:border-rose-700/30 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                      <value.icon className="w-5 h-5 text-rose-400" />
                    </div>
                    <CardTitle className="text-lg text-rose-200">{value.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-stone-400 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Daughter's Tribute */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-rose-950/20 border-rose-900/30">
            <CardContent className="pt-8 pb-8">
              <Quote className="w-8 h-8 text-rose-400/40 mx-auto mb-4" />
              <blockquote className="text-lg text-rose-200/90 italic leading-relaxed text-center mb-4">
                "Mother was a little shy as a person — even though she was a model — and less confident 
                because her education wasn't as up to par with some of her peers. She felt a little insecure, 
                but she dropped that along the way as she discovered she could do more things. Like a butterfly 
                coming out of that cocoon, she blossomed."
              </blockquote>
              <p className="text-stone-500 text-sm text-center">
                — Gloria Walker, Helen's daughter
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Family Photos & Candy's Tribute */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-rose-100 mb-2 text-center">Family Archive</h2>
          <p className="text-stone-400 text-center mb-8">Photos and tributes from the Hunter family collection</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Polaroids */}
            <Card className="bg-stone-900/60 border-stone-800/50 overflow-hidden">
              <img 
                src={familyPhotos.polaroids1989_1990}
                alt="Polaroid photos: Helen Logan Hunter (1990) and David Lee Logan (1989)"
                className="w-full h-64 object-contain bg-black"
              />
              <CardContent className="pt-4 pb-4">
                <h3 className="text-lg font-bold text-rose-200 mb-1">Helen Logan Hunter & David Lee Logan</h3>
                <p className="text-stone-400 text-sm">Polaroid photos from the family archive — Helen (1990) and David Lee Logan (1989)</p>
              </CardContent>
            </Card>

            {/* Facebook Leader Post */}
            <Card className="bg-stone-900/60 border-stone-800/50 overflow-hidden">
              <img 
                src={familyPhotos.facebookLeaderPost}
                alt="Candy Hunter's Facebook post sharing Helen's Life Care Leader magazine cover, November 7, 2018"
                className="w-full h-64 object-contain bg-black"
              />
              <CardContent className="pt-4 pb-4">
                <h3 className="text-lg font-bold text-rose-200 mb-1">Candy's Facebook Post — Nov 7, 2018</h3>
                <p className="text-stone-400 text-sm">Candy Hunter shared the Life Care Leader cover: "CANRYN PRODUCTION INC. LEADER MAGAZINE HELEN HUNTER LIFE STORY PT 4"</p>
              </CardContent>
            </Card>
            {/* District 1 Beauty Pageant */}
            <Card className="bg-stone-900/60 border-stone-800/50 overflow-hidden">
              <img 
                src={familyPhotos.district1Pageant}
                alt="Helen Logan Hunter, Ms. District 1 beauty pageant contestant at age 86, Life Care Center of Grandview"
                className="w-full h-64 object-contain bg-black"
              />
              <CardContent className="pt-4 pb-4">
                <h3 className="text-lg font-bold text-rose-200 mb-1">Ms. District 1 Beauty Pageant — Age 86</h3>
                <p className="text-stone-400 text-sm">Helen Logan Hunter, District 1 contestant at Life Care Center of Grandview. Escorted by Lonnie Craig. Pageant Coordinator: Shannon Wakeman.</p>
              </CardContent>
            </Card>
          </div>

          {/* Candy's Mother's Day Tribute */}
          <Card className="bg-rose-950/20 border-rose-900/30">
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <img 
                  src={familyPhotos.candyTributeText}
                  alt="Candy Hunter's Mother's Day tribute to Helen Hunter on Facebook, May 30, 2015"
                  className="w-full md:w-1/3 rounded-lg border border-stone-800"
                />
                <div className="flex-1">
                  <Badge className="bg-rose-600/20 text-rose-300 border-rose-700/30 mb-3">Candy's Mother's Day Tribute — May 30, 2015</Badge>
                  <h3 className="text-xl font-bold text-rose-200 mb-3">"YOU ARE REALLY ARE MY 'QUEEN'!"</h3>
                  <p className="text-stone-400 leading-relaxed mb-3">
                    In this Facebook tribute, Candy described Helen winning the beauty pageant at Life Care Center: 
                    "HELEN HUNTER continues to raise the bar for, 'those that want it, go get it'!"
                  </p>
                  <p className="text-stone-400 leading-relaxed mb-3">
                    He listed each of Helen's children and their achievements — Gloria Walker (flight attendant for 20 years, 
                    then became an RN), "Her son: Seabrun Candy Hunter a well known Hall of Fame Songwriter, Singer and 
                    successful Author!" and Linda Hunter.
                  </p>
                  <p className="text-stone-500 text-sm italic">
                    "All of them contribute their success to having a Mom that never quit striving to reach her goals 
                    and demanding them to never quit just like she didn't."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Connection to Legacy */}
      <section className="py-12 px-4 bg-gradient-to-b from-rose-950/20 to-stone-950">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-stone-900/60 border-rose-900/30">
            <CardContent className="pt-8 pb-8 text-center">
              <Home className="w-12 h-12 text-rose-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-rose-100 mb-4">From Her Home to the World</h3>
              <p className="text-stone-400 leading-relaxed max-w-2xl mx-auto mb-4">
                Helen and Seabrun Whitney Hunter, Sr. built a family that would change the world. The same determination 
                that carried her through polio, through raising three children as a single mother, through breaking barriers at Mary Kay — 
                that same fire burns in the Hunter family today. The music that their son Seabrun "Candy" Hunter brought to 
                the world was first nurtured in Helen's home. Every song carries echoes of her encouragement.
              </p>
              <p className="text-stone-500 text-sm max-w-xl mx-auto mb-6">
                Today Helen's legacy extends through 3 children, 7 grandchildren, 17 great grandchildren, 
                and 4 great great grandchildren — loved by family and by thousands of friends worldwide.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/rrb/family-tree">
                  <span className="inline-flex items-center px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium transition-colors cursor-pointer">
                    <Users className="mr-2 w-4 h-4" />
                    View Family Tree
                  </span>
                </Link>
                <Link href="/rrb/the-legacy">
                  <span className="inline-flex items-center px-6 py-3 border border-rose-600 text-rose-400 hover:bg-rose-600/10 rounded-lg font-medium transition-colors cursor-pointer">
                    <BookOpen className="mr-2 w-4 h-4" />
                    Read the Full Legacy
                  </span>
                </Link>
                <Link href="/rrb/photo-gallery">
                  <span className="inline-flex items-center px-6 py-3 border border-rose-600 text-rose-400 hover:bg-rose-600/10 rounded-lg font-medium transition-colors cursor-pointer">
                    <Camera className="mr-2 w-4 h-4" />
                    Photo Gallery
                  </span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-4 border-t border-stone-800/50">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <p className="text-xs text-stone-600">
            This page is part of the Seabrun "Candy" Hunter Jr. Legacy Archive. All content is presented for 
            historical preservation and educational purposes. Family stories, photographs, and personal documents 
            (including Helen's resume, her 2013 letter to Richard Rogers, and the District 1 beauty pageant profile) are shared with the authorization of the Hunter family. Magazine content from 
            Life Care Leader (2014 Edition) is reproduced for biographical documentation purposes. &copy; 2014 Life 
            Care Centers of America. All rights reserved by their respective owners.
          </p>
          <p className="text-xs text-stone-700">
            A Canryn Production and its subsidiaries.
          </p>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && currentImage && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="max-w-5xl w-full mx-4 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={currentImage.src}
              alt={currentImage.title}
              className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl"
            />
            <div className="mt-4 text-center">
              <h3 className="text-lg font-bold text-rose-200 mb-1">{currentImage.title}</h3>
              <p className="text-sm text-stone-400">{currentImage.caption}</p>
              <p className="text-[10px] text-stone-600 mt-2">{lightboxIndex + 1} of {magazineGallery.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
