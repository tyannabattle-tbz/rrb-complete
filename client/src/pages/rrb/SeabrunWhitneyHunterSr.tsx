/**
 * Seabrun Whitney Hunter Sr. - Patriarch & Foundation of the Legacy
 * Celebrates the father who shaped Seabrun Candy Hunter and the Hunter family legacy
 * Features primary source documents from Ancestry.com WWII and Korean War Era Draft Cards
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Users, Home, Star, BookOpen, Award, Sparkles, Quote, X, ChevronLeft, ChevronRight, Camera, FileText, ExternalLink, Landmark } from 'lucide-react';
import { Link } from 'wouter';

// Primary Source Documents from Ancestry.com
const primarySourceDocuments = {
  wwiiDraftCard: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/wwii-draft-card.jpg',
  koreanWarDraftCard: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/korean-war-draft-card.jpg',
};

const familyValues = [
  {
    title: 'Civic Responsibility',
    description: 'Seabrun answered the call to register for military service during WWII and the Korean War Era, embodying duty to country and community.',
    icon: Landmark,
  },
  {
    title: 'Provider & Protector',
    description: 'Working in steel mills and automotive manufacturing, he built a stable foundation for his family during post-Depression America.',
    icon: Home,
  },
  {
    title: 'Family Foundation',
    description: 'His partnership with Helen Mildred Warren created the bedrock upon which the entire Hunter family legacy was built.',
    icon: Users,
  },
  {
    title: 'Strength & Resilience',
    description: 'Standing 6\'2" with quiet determination, Seabrun embodied the strength that would define generations of Hunters.',
    icon: Star,
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
    era: 'Early Life & Roots',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    events: [
      { year: '1924', event: 'Born October 13 in Bulloch County, Georgia — a child of the American South during the post-WWI era', icon: Star },
      { year: '1942', event: 'Registered for WWII Draft (December 22, 1942 in Detroit, Michigan) — age 18, standing 6\'2" tall, ready to serve', highlight: true, icon: Landmark },
      { year: '1942', event: 'Employed at Ford Motor Co., Detroit — beginning his career in American manufacturing during wartime', icon: Home },
    ],
  },
  {
    era: 'Marriage & Family',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    events: [
      { year: '1946', event: 'Married Helen Mildred Warren in Buffalo, New York — the union that would create the Hunter family legacy', highlight: true, icon: Heart },
      { year: '1946–1950s', event: 'Fathered children including Seabrun "Candy" Hunter, who would become a Hall of Fame Songwriter, Singer, and Author', highlight: true, icon: Users },
      { year: 'c. 1948', event: 'Registered for Korean War Era Draft (September 14, 1948) — continued civic duty during post-WWII tensions', icon: Landmark },
    ],
  },
  {
    era: 'Industrial Career',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    events: [
      { year: '1948', event: 'Working in Lackawanna, New York at Betheleham Steel Co. — backbone of American industrial strength', icon: Award },
      { year: '1950s–1970s', event: 'Sustained employment in heavy industry — providing stability and security for his growing family during the post-war economic boom', highlight: true, icon: Home },
      { year: 'c. 1960s', event: 'Relocated family to Detroit, Michigan — supporting Helen\'s nursing career and Candy\'s early musical pursuits', icon: Users },
    ],
  },
  {
    era: 'Legacy & Remembrance',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    events: [
      { year: '1978', event: 'Passed away February 8, 1978 in Detroit, Wayne, Michigan — age 53', icon: Heart },
      { year: 'Post-1978', event: 'His legacy lives on through his son Seabrun "Candy" Hunter and the entire Hunter family ecosystem', highlight: true, icon: Star },
      { year: '2024+', event: 'Remembered through primary source documentation and family tribute — Seabrun Whitney Hunter Sr., Patriarch and Foundation', highlight: true, icon: Landmark },
    ],
  },
];

export default function SeabrunWhitneyHunterSr() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const documentGallery = [
    { 
      src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/IMG_6832.PNG', 
      title: 'WWII Draft Registration Card', 
      caption: 'Seabrun Whitney Hunter, Age 18, registered December 22, 1942 in Detroit, Michigan. Height: 6\'2", Weight: 184 lbs. Employer: Ford Motor Co.' 
    },
    { 
      src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/IMG_6833.PNG', 
      title: 'WWII Draft Card Details', 
      caption: 'Draft Registration Place: Buffalo, New York. Physical Build: Scar on Inner Right Thumb. Rejection Date: 1942 — Rejected for Service.' 
    },
    { 
      src: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/IMG_6834.PNG', 
      title: 'Korean War Era Draft Card', 
      caption: 'Seabrun Hunter registered again September 14, 1948 for Korean War Era Draft. Employer: Betheleham Steel Co., Lackawanna, New York. Occupation: Brick Helper.' 
    },
  ];

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const goNext = () => { if (lightboxIndex !== null) setLightboxIndex((lightboxIndex + 1) % documentGallery.length); };
  const goPrev = () => { if (lightboxIndex !== null) setLightboxIndex((lightboxIndex - 1 + documentGallery.length) % documentGallery.length); };
  const currentImage = lightboxIndex !== null ? documentGallery[lightboxIndex] : null;

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-amber-950/40 via-stone-950 to-stone-950 border-b border-amber-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/15 via-transparent to-transparent" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="bg-amber-700 text-white mb-4 text-sm px-4 py-1">
                <Landmark className="w-3.5 h-3.5 mr-2" />
                Family Patriarch
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-amber-100 mb-2">
                Seabrun Whitney Hunter Sr.
              </h1>
              <p className="text-xl text-amber-200/80 mb-2">
                October 13, 1924 — February 8, 1978
              </p>
              <p className="text-lg text-stone-300 mb-6 max-w-lg">
                The foundation upon which the Hunter family legacy was built. A man of civic duty, industrial strength, and unwavering commitment to family.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/rrb/the-legacy">
                  <Button variant="default" className="bg-amber-600 hover:bg-amber-700">
                    ← Back to The Legacy
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="w-64 h-80 bg-gradient-to-br from-amber-900/30 to-stone-900/50 rounded-lg border border-amber-800/50 flex items-center justify-center">
                <div className="text-center">
                  <Landmark className="w-24 h-24 text-amber-400 mx-auto mb-4 opacity-50" />
                  <p className="text-amber-200/60 text-sm">Patriarch of the Hunter Legacy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Family Values Grid */}
      <section className="bg-stone-900/50 border-b border-stone-800/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-amber-100 mb-12 text-center">
            The Values He Embodied
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {familyValues.map((value, idx) => {
              const Icon = value.icon;
              return (
                <Card key={idx} className="bg-stone-900/60 border-stone-800/50 hover:border-amber-700/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Icon className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-amber-100 mb-2">{value.title}</h3>
                        <p className="text-stone-300 text-sm">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Biography Section */}
      <section className="bg-stone-950 py-16 border-b border-stone-800/50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-amber-100 mb-8">Biography</h2>
          
          <div className="space-y-6 text-stone-300 leading-relaxed">
            <p>
              Seabrun Whitney Hunter Sr. was born on October 13, 1924, in Bulloch County, Georgia, during a transformative period in American history. He came of age during the Great Depression and World War II, formative experiences that shaped his character and values.
            </p>

            <p>
              In December 1942, at the age of 18, Seabrun registered for the World War II Draft in Detroit, Michigan. Standing 6 feet 2 inches tall and weighing 184 pounds, he was physically ready to serve his country. Though he was ultimately rejected for military service in 1942, his willingness to answer the call to duty reflected the civic responsibility that would define his life.
            </p>

            <p>
              Seabrun's early career was rooted in American industrial strength. He worked for Ford Motor Company in Detroit during the war years, contributing to the automotive industry that powered the nation. Later, he worked at Betheleham Steel Company in Lackawanna, New York, as a brick helper—honest, essential work that built America's infrastructure during the post-war economic boom.
            </p>

            <p>
              In 1946, Seabrun married Helen Mildred Warren in Buffalo, New York. This union became the foundation of the Hunter family legacy. Together, they raised children who would go on to achieve remarkable things, most notably their son Seabrun "Candy" Hunter, who became a Hall of Fame Songwriter, Singer, and successful Author. Helen's determination and Seabrun's steady provision created the environment in which their children could flourish.
            </p>

            <p>
              Even during the Korean War Era, Seabrun registered again for military service in September 1948, demonstrating his continued commitment to civic duty and national defense. His life embodied the values of the post-war American working man—responsibility, provision, and unwavering support for family.
            </p>

            <p>
              Seabrun Whitney Hunter Sr. passed away on February 8, 1978, in Detroit, Michigan, at the age of 53. Though his life was not long, his impact was profound. He laid the foundation upon which the entire Hunter family legacy was built. His strength, his work ethic, and his commitment to family continue to resonate through his descendants and through the Canryn Production ecosystem that his son Seabrun "Candy" Hunter would create.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="bg-stone-900/50 py-16 border-b border-stone-800/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-amber-100 mb-12 text-center">Life Timeline</h2>
          
          {timelineEras.map((era, eraIdx) => (
            <div key={eraIdx} className="mb-12">
              <div className={`${era.bgColor} ${era.borderColor} border rounded-lg p-6 mb-8`}>
                <h3 className={`${era.color} text-xl font-semibold mb-2`}>{era.era}</h3>
              </div>

              <div className="space-y-8">
                {era.events.map((evt, evtIdx) => {
                  const Icon = evt.icon;
                  const isLeft = evtIdx % 2 === 0;
                  return (
                    <div key={evtIdx} className="relative">
                      <div className={`flex ${isLeft ? 'flex-row' : 'flex-row-reverse'} gap-6 items-start`}>
                        <div className="flex-1">
                          <Card className={`${evt.highlight ? 'bg-stone-800/80 border-amber-700/50' : 'bg-stone-900/60 border-stone-800/50'} hover:border-amber-600/50 transition-colors`}>
                            <CardContent className="pt-6">
                              <div className="flex items-start gap-3 mb-2">
                                <span className="text-amber-400 font-bold text-lg min-w-fit">{evt.year}</span>
                                {evt.highlight && <Sparkles className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />}
                              </div>
                              <p className="text-stone-200">{evt.event}</p>
                            </CardContent>
                          </Card>
                        </div>
                        <div className="flex justify-center">
                          <div className="w-12 h-12 rounded-full bg-amber-900/50 border-2 border-amber-600 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-amber-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Primary Source Documents */}
      <section className="bg-stone-950 py-16 border-b border-stone-800/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-amber-100 mb-4">In Their Own Words</h2>
          <p className="text-stone-300 mb-12">Primary Source Documents from Ancestry.com</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documentGallery.map((doc, idx) => (
              <Card 
                key={idx}
                className="bg-stone-900/60 border-stone-800/50 hover:border-amber-700/50 transition-all cursor-pointer group"
                onClick={() => openLightbox(idx)}
              >
                <CardContent className="p-0 overflow-hidden">
                  <div className="relative h-64 bg-stone-800/50 flex items-center justify-center group-hover:bg-stone-800 transition-colors">
                    <img 
                      src={doc.src} 
                      alt={doc.title}
                      className="w-full h-full object-contain p-4"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Camera className="w-8 h-8 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-amber-100 mb-2">{doc.title}</h3>
                    <p className="text-sm text-stone-300">{doc.caption}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Connection to Legacy */}
      <section className="bg-stone-900/50 py-16 border-b border-stone-800/50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-amber-100 mb-8">Connection to the Legacy</h2>
          
          <div className="space-y-6 text-stone-300 leading-relaxed">
            <p>
              Seabrun Whitney Hunter Sr. is the patriarch upon whose shoulders the entire Hunter family legacy rests. While his son Seabrun "Candy" Hunter became the public face of the family—the Hall of Fame Songwriter, Singer, and Author—it was Seabrun Sr. who provided the foundation.
            </p>

            <p>
              His partnership with Helen Mildred Warren created a household where music was heritage, where education was valued, and where civic duty was understood as a fundamental responsibility. The values he embodied—strength, provision, resilience, and unwavering commitment to family—flow through every member of the Hunter family and every initiative under the Canryn Production umbrella.
            </p>

            <p>
              The seven subsidiaries of Canryn Production Inc.—Sean's Music, Jaelon Enterprises, Little C Recording, Canryn Publishing Co., Seasha Distribution Co., Honest Promotion, and the parent company itself—all trace their roots back to the foundation laid by Seabrun Whitney Hunter Sr. His legacy is not just in his children, but in the entire ecosystem of platforms, services, and autonomous intelligence that his son Seabrun "Candy" Hunter created.
            </p>

            <p>
              In honoring Seabrun Whitney Hunter Sr., we honor the quiet strength that built America, the industrial workers who powered the nation, and the fathers who sacrificed to give their children opportunities they themselves never had.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-stone-950 py-12 border-t border-stone-800/50">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="bg-stone-900/60 border-stone-800/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-amber-100 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Source Documentation & Legal Notice
              </h3>
              <div className="text-sm text-stone-300 space-y-3">
                <p>
                  This tribute page is based on primary source documents from Ancestry.com, including:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>U.S., World War II Draft Cards Young Men, 1940-1947 (Seabrun Whitney Hunter, registered December 22, 1942)</li>
                  <li>U.S., Korean War Era Draft Cards, 1948-1959 (Seabrun Whitney Hunter, registered September 14, 1948)</li>
                  <li>Family records and genealogical documentation</li>
                </ul>
                <p className="mt-4">
                  All biographical information has been sourced from authenticated historical records. This page serves historical preservation and educational purposes as part of the Rockin' Rockin' Boogie legacy archive.
                </p>
                <p className="text-xs text-stone-400 mt-4">
                  © 2024 Canryn Production Inc. All rights reserved. This content is for historical preservation and educational purposes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Lightbox Modal */}
      {currentImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={closeLightbox}>
          <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeLightbox}
              className="absolute -top-10 right-0 text-white hover:text-amber-400 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            <img
              src={currentImage.src}
              alt={currentImage.title}
              className="w-full h-full object-contain"
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
              <h3 className="text-white font-semibold mb-2">{currentImage.title}</h3>
              <p className="text-stone-200 text-sm">{currentImage.caption}</p>
            </div>

            <button
              onClick={goPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={goNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded text-sm">
              {lightboxIndex! + 1} / {documentGallery.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
