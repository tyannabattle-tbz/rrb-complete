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
  { src: familyPhotos.candyTributeText, title: 'Candy\'s Mother\'s Day Tribute — May 30, 2015', caption: 'Candy\'s tribute to Helen: "Her son: Seabrun Candy Hunter a well known Hall of Fame Songwriter, Singer and successful Author!" — describing all of Helen\'s children and their achievements' },
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

const timelineEvents = [
  { year: '1929', event: 'Born in Campbell, Ohio, shortly before the stock market crash' },
  { year: '1938', event: 'Contracted polio at age 9 — fought back with determination and her brother\'s support to fully recover' },
  { year: '1946', event: 'Put education on hold to get married and start a family' },
  { year: '1954', event: 'Family relocated to Detroit; began career as a runway model for a designer' },
  { year: '1961', event: 'Returned to school while still modeling; her three children helped her study and graduate' },
  { year: 'c. 1965', event: 'Earned Licensed Practical Nurse (LPN) certification while continuing to model' },
  { year: '1971', event: 'Joined Mary Kay Cosmetics as a second job alongside nursing' },
  { year: '1972', event: 'Mary Kay Ash personally handed Helen the keys to her first pink Cadillac at the annual Seminar conference' },
  { year: 'Career', event: 'Became the second Black director, then the first Black senior director at Mary Kay; earned five cars total including two pink Cadillacs' },
  { year: '1994', event: 'Gave up directorship due to illness but continued helping women with skincare' },
  { year: '2014', event: 'Featured on the cover of Life Care Leader magazine — "Beauty More Than Skin Deep"' },
  { year: '2016', event: 'Honored by the Missouri Senate — Senator Holsman offered Senate Resolution No. 1462, regarding Helen Logan Hunter, Grandview, which was adopted by the full Senate on February 17, 2016' },
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
              <h1 className="text-4xl md:text-6xl font-bold text-rose-100 mb-4">
                Helen Hunter
              </h1>
              <p className="text-xl md:text-2xl text-rose-300/80 mb-2 italic">
                "Beauty More Than Skin Deep"
              </p>
              <p className="text-lg text-stone-400 max-w-xl leading-relaxed mb-6">
                Born in Campbell, Ohio in 1929. Polio survivor. Runway model. Licensed Practical Nurse. 
                The first Black senior director at Mary Kay Cosmetics. Five-time pink Cadillac earner. 
                Mother. Grandmother. The foundation of the Hunter legacy.
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
                    Helen Hunter was born in Campbell, Ohio, shortly before the crash of the stock market in 1929. 
                    As a young child, her family moved to Buffalo, New York, but an absent father left Helen, along 
                    with her half-brother and mother, struggling to survive. This struggle was quickly compounded when 
                    she contracted polio at 9 years old, a disease that often left children paralyzed or crippled, 
                    if they survived at all.
                  </p>
                  <p className="text-stone-300 leading-relaxed">
                    It was the determination in her heart and the support of her brother, especially, that gave her 
                    the strength to fully recover from polio, eventually regaining full mobility. As Helen regained 
                    her strength, she finished grade school and continued her education until 1946, when she put a 
                    hold on high school to get married and start a family.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-stone-900/60 border-stone-800/50">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold text-rose-200 mb-3">Model, Nurse, Mother</h3>
                  <p className="text-stone-300 leading-relaxed mb-4">
                    In 1954, the young family was relocated to Detroit, where Helen began a career as a runway model 
                    for a designer. Over the next eight years, her modeling career kept her busy, but the desire to 
                    finish high school never left her mind. In 1961, she began classes while still modeling, and 
                    enlisted her three children to help her graduate. They stayed up late after school and quizzed 
                    her so she could pass her exams. The family's efforts and hard work paid off, and one year later, 
                    she graduated.
                  </p>
                  <p className="text-stone-300 leading-relaxed">
                    After graduating, Helen's life was thrown into disarray when she went through a divorce, something 
                    she admits was the most difficult experience of her life. "The hardest thing was to find a way to 
                    rear my children the way I wanted to," shared Helen. "I had to work two jobs to pay for church 
                    school and to take care of everything that you have to take care of to live in this world." 
                    The hardship couldn't stop her drive. She earned her Licensed Practical Nurse certification while 
                    continuing to model, again with the help of her children.
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
                    eventually became the <strong className="text-rose-300">first Black senior director</strong> at 
                    Mary Kay Cosmetics.
                  </p>
                  <p className="text-stone-300 leading-relaxed">
                    Helen's proudest moment came when Mary Kay Ash personally handed her the keys to her first pink 
                    Cadillac at the 1972 annual conference. Throughout her career, she earned <strong className="text-rose-300">five 
                    cars, including two pink Cadillacs</strong>, and kept close to her mentor. "She was just like the 
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

      {/* Timeline */}
      <section className="py-12 px-4 bg-stone-900/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-rose-100 mb-8 text-center">Life Timeline</h2>
          <div className="space-y-4">
            {timelineEvents.map((event, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="w-20 shrink-0 text-right">
                  <span className="text-sm font-bold text-rose-400">{event.year}</span>
                </div>
                <div className="w-3 h-3 rounded-full bg-rose-500 mt-1.5 shrink-0 ring-4 ring-rose-500/20" />
                <p className="text-stone-300 text-sm leading-relaxed">{event.event}</p>
              </div>
            ))}
          </div>
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
              <p className="text-stone-400 leading-relaxed max-w-2xl mx-auto mb-6">
                Helen Hunter's legacy lives on through her children and grandchildren. The same determination 
                that carried her through polio, through single motherhood, through breaking barriers at Mary Kay — 
                that same fire burns in the Hunter family today. The music that Seabrun "Candy" Hunter brought to 
                the world was first nurtured in Helen's home. Every song carries echoes of her encouragement.
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
            historical preservation and educational purposes. Family stories and photographs are shared with the 
            authorization of the Hunter family. Magazine content from Life Care Leader (2014 Edition) is reproduced 
            for biographical documentation purposes. &copy; 2014 Life Care Centers of America. All rights reserved by 
            their respective owners.
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
