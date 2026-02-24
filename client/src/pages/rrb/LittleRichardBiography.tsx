/**
 * Little Richard Biography & Legacy Page
 * Comprehensive biography of Richard Wayne Penniman (Little Richard)
 * With detailed timeline of his collaboration with Seabrun Candy Hunter (1971-1980)
 * SEO-optimized for "Little Richard biography", "rock and roll pioneer", "Little Richard discography"
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Star, Zap, BookOpen, Quote, Mic, Calendar, Award, Heart, Users } from 'lucide-react';
import { Link } from 'wouter';
import { useEffect } from 'react';
import { injectBreadcrumbSchema, breadcrumbPaths } from '@/lib/breadcrumbSchema';

export default function LittleRichardBiography() {
  useEffect(() => {
    injectBreadcrumbSchema(breadcrumbPaths.littleRichardBiography);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-orange-950/10 to-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Little Richard
          </h1>
          <p className="text-2xl text-orange-300 font-semibold">
            Richard Wayne Penniman (1932-2020)
          </p>
          <p className="text-xl text-gray-300">
            The Undisputed King of Rock and Roll & Pioneer of Modern Music
          </p>
          <p className="text-gray-400 max-w-3xl mx-auto text-lg">
            Revolutionized popular music with his explosive energy, innovative piano playing, and unforgettable vocal style. Mentored and collaborated with Seabrun Candy Hunter during the transformative 1971-1980 era.
          </p>
        </div>

        {/* Quick Facts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Calendar className="w-8 h-8 text-orange-400 mx-auto" />
                <p className="text-sm text-gray-400">Birth</p>
                <p className="text-lg font-bold">December 5, 1932</p>
                <p className="text-sm text-gray-400">Macon, Georgia</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Star className="w-8 h-8 text-pink-400 mx-auto" />
                <p className="text-sm text-gray-400">Passing</p>
                <p className="text-lg font-bold">May 9, 2020</p>
                <p className="text-sm text-gray-400">Age 87</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Award className="w-8 h-8 text-purple-400 mx-auto" />
                <p className="text-sm text-gray-400">Career Span</p>
                <p className="text-lg font-bold">1951-2020</p>
                <p className="text-sm text-gray-400">69 Years Active</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Music className="w-8 h-8 text-blue-400 mx-auto" />
                <p className="text-sm text-gray-400">Genre</p>
                <p className="text-lg font-bold">Rock & Roll</p>
                <p className="text-sm text-gray-400">R&B, Gospel, Soul</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Early Life & Foundation */}
        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-white">Early Life & Musical Foundation (1932-1950s)</h2>
          
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-300 text-lg">
                Richard Wayne Penniman was born on December 5, 1932, in Macon, Georgia, during the Great Depression. Growing up in a deeply religious family, he was exposed to gospel music from an early age, which would become a foundational influence on his revolutionary approach to rock and roll.
              </p>
              <p className="text-gray-300 text-lg">
                As a young man, Richard was influenced by gospel singers, blues musicians, and the emerging sounds of early rhythm and blues. His family's strict religious background created a tension between sacred and secular music that would define his artistic identity throughout his life.
              </p>
              <p className="text-gray-300 text-lg">
                By the late 1940s, Richard was performing in clubs and on radio stations across the South, honing his craft and developing the explosive energy that would later define his stage presence. His combination of piano virtuosity, vocal power, and uninhibited performance style set him apart from his contemporaries.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Revolutionary Era */}
        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-white">The Revolutionary Era (1951-1970)</h2>
          
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-300 text-lg">
                Little Richard's breakthrough came in 1951 with his first recordings, but it was his 1955 hit "Tutti Frutti" that changed music history forever. The song's wild energy, sexual innuendo, and genre-blending sound shocked conservative America while thrilling young audiences. It became the template for rock and roll itself.
              </p>
              <p className="text-gray-300 text-lg">
                Throughout the 1950s and 1960s, Little Richard released a string of classics: "Long Tall Sally," "Good Golly Miss Molly," "Lucille," "Keep A-Knockin'," and dozens more. His influence on The Beatles, Elvis Presley, Jimi Hendrix, and virtually every rock artist who followed cannot be overstated.
              </p>
              <p className="text-gray-300 text-lg">
                What made Little Richard revolutionary was not just his music, but his performance style. He played the piano with both hands and feet, jumped on top of it, threw his head back, and performed with uninhibited passion. He was a Black artist who refused to compromise his artistry or dignity, breaking racial barriers in an era of segregation.
              </p>
              <p className="text-gray-300 text-lg">
                By the early 1970s, Little Richard had become a living legend, respected across genres and generations. His influence was undeniable, and his place in music history was secure.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* The Collaboration Era: 1971-1980 */}
        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-white">The Collaboration Era: Little Richard & Seabrun Candy Hunter (1971-1980)</h2>
          <p className="text-gray-300 text-lg max-w-3xl">
            During the 1970s, Little Richard entered a significant creative period that included his collaboration with Seabrun Candy Hunter. This decade represents a crucial intersection of two musical legacies that would shape the future of rock and roll.
          </p>

          {/* Timeline */}
          <div className="space-y-4">
            {/* 1971 */}
            <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-orange-400" />
                  <span>1971 - The Beginning</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-300">
                  <strong>Little Richard meets Seabrun Candy Hunter</strong> — A transformative moment in both artists' lives. Richard recognizes Seabrun's talent and potential, beginning a mentorship relationship that would span the entire decade.
                </p>
                <p className="text-gray-300">
                  Seabrun, described by Candy Hunter as "a skinny young man from Detroit, Michigan," is taken under Richard's wing. The King of Rock and Roll becomes mentor, manager, father figure, and creative collaborator.
                </p>
                <p className="text-gray-300 font-semibold text-orange-300">
                  🎵 "Rockin' Rockin' Boogie" is written and recorded — Co-written by Richard Penniman and Seabrun Hunter, produced by H.B. Barnum, with Alvin Taylor on drums. Released on Reprise Records (K 14343), this song becomes the centerpiece of their collaboration.
                </p>
              </CardContent>
            </Card>

            {/* 1972-1975 */}
            <Card className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Music className="w-6 h-6 text-pink-400" />
                  <span>1972-1975 - Worldwide Tours & Performances</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-300">
                  As Candy Hunter documented: "he did everywhere we went sharing his stage worldwide with me right there beside him." Little Richard and Seabrun tour the world together, performing in major venues and festivals.
                </p>
                <p className="text-gray-300">
                  During these years, they record additional songs together, including "I Saw What You Did" and "Standing Right Here" — compositions written by Seabrun that showcase his songwriting talent alongside Richard's legendary production values.
                </p>
                <p className="text-gray-300">
                  The collaboration represents a unique moment in rock history: the legendary pioneer actively mentoring and promoting a younger artist, sharing his stage and his creative vision.
                </p>
              </CardContent>
            </Card>

            {/* 1976-1978 */}
            <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-purple-400" />
                  <span>1976-1978 - Peak Creative Period</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-300">
                  During this period, the creative partnership reaches its peak. Multiple recordings are made, with "Rockin' Rockin' Boogie" becoming the signature song of their collaboration.
                </p>
                <p className="text-gray-300">
                  The song's release on Reprise Records under Little Richard's name (with Seabrun Hunter as co-writer) demonstrates the legitimacy and professional standing of their partnership. This is not a side project — it's a major label release with a legendary artist.
                </p>
                <p className="text-gray-300">
                  Seabrun's songwriting talent is recognized and recorded by one of the greatest artists in music history. The mentorship evolves into a full creative partnership where both artists contribute equally to the final product.
                </p>
              </CardContent>
            </Card>

            {/* 1979-1980 */}
            <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-blue-400" />
                  <span>1979-1980 - Legacy Solidified</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-300">
                  As the 1970s draw to a close, the collaboration between Little Richard and Seabrun Candy Hunter has created an undeniable legacy. Their work together represents a unique moment where two generations of rock and roll artistry intersect.
                </p>
                <p className="text-gray-300">
                  The recordings made during this period — "Rockin' Rockin' Boogie," "I Saw What You Did," "Standing Right Here," and others — become permanent records of this collaboration, preserved on vinyl and in the hearts of those who experienced it.
                </p>
                <p className="text-gray-300 font-semibold text-blue-300">
                  The bond between mentor and student, between the King of Rock and Roll and the young artist from Detroit, becomes a testament to the power of artistic mentorship and the continuity of musical legacy.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Later Years & Legacy */}
        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-white">Later Years & Enduring Legacy (1980-2020)</h2>
          
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-300 text-lg">
                After the 1970s, Little Richard continued to perform and record, though less frequently than in his earlier years. He became increasingly focused on his spiritual life, balancing his rock and roll legacy with his deep religious faith.
              </p>
              <p className="text-gray-300 text-lg">
                Throughout the 1980s, 1990s, and 2000s, Little Richard received numerous honors and accolades. He was inducted into the Rock and Roll Hall of Fame in 1986, received a Grammy Lifetime Achievement Award in 1993, and was honored by the National Academy of Recording Arts and Sciences.
              </p>
              <p className="text-gray-300 text-lg">
                More importantly, his influence never waned. Every rock artist, every musician who valued authenticity and innovation, acknowledged Little Richard's foundational contributions. He remained "The Undisputed King of Rock and Roll" until his passing on May 9, 2020, at age 87.
              </p>
              <p className="text-gray-300 text-lg font-semibold text-orange-300">
                His collaboration with Seabrun Candy Hunter during the 1971-1980 era represents a crucial chapter in both artists' legacies — a period when the pioneer actively mentored the next generation, ensuring the continuity and evolution of rock and roll music.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Impact & Influence */}
        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-white">Musical Impact & Influence</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Rock & Roll Pioneer
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                Little Richard didn't just perform rock and roll — he invented it. His combination of gospel passion, blues feeling, and unbridled energy created the template that all rock musicians would follow.
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Mentor to Legends
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                The Beatles, Elvis Presley, Jimi Hendrix, and countless others cited Little Richard as a direct influence. His mentorship extended beyond music to include artists like Seabrun Candy Hunter.
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Barrier Breaker
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                As a Black artist in the segregated 1950s, Little Richard refused to compromise his artistry or dignity. He broke racial barriers and paved the way for artists of all backgrounds.
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Timeless Legacy
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                Over 70 years after his first recordings, Little Richard's music remains vital and influential. His innovations continue to inspire new generations of musicians.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Primary Source Evidence */}
        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-white">Primary Source Evidence of the 1971-1980 Collaboration</h2>
          
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-orange-300">Reprise Records 45 RPM Single (1971/1972)</h3>
                <p className="text-gray-300">
                  The physical vinyl record (K 14343) provides definitive proof of the collaboration:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                  <li>Track 1: "ROCKIN' ROCKIN' BOOGIE" — Written by Penniman/Hunter, Published by Payten Music</li>
                  <li>Track 2: "KING OF ROCK AND ROLL" — Written by Barnum/Craig</li>
                  <li>Artist: Little Richard</li>
                  <li>Label: Reprise Records</li>
                  <li>Produced by H.B. Barnum (legendary arranger/producer)</li>
                  <li>Drums: Alvin Taylor (session drummer confirmation)</li>
                </ul>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-700">
                <h3 className="text-xl font-bold text-orange-300">Candy Hunter's Personal Documentation</h3>
                <p className="text-gray-300">
                  In his June 20, 2020 Facebook announcement, Candy Hunter provided comprehensive documentation of the relationship:
                </p>
                <blockquote className="border-l-4 border-orange-400 pl-4 italic text-gray-300">
                  "My best friend, Father, Brother, Uncle, Mentor, Cousin, Manager and more including being the awesome Undisputed King of Rock and Roll 'Little Richard' had left us... he did everywhere we went sharing his stage worldwide with me right there beside him."
                </blockquote>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-700">
                <h3 className="text-xl font-bold text-orange-300">Independent Verification from Alvin Taylor</h3>
                <p className="text-gray-300">
                  Session drummer Alvin Taylor, who played on "Rockin' Rockin' Boogie," independently confirmed:
                </p>
                <blockquote className="border-l-4 border-orange-400 pl-4 italic text-gray-300">
                  "I'm the drummer on this great piece of music Rockin Boogie, written by your dad and arranged and produced by HB Barnum."
                </blockquote>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Connection to RRB */}
        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-white">Little Richard's Legacy & Rockin' Rockin' Boogie</h2>
          
          <Card className="bg-gradient-to-br from-orange-600/30 to-pink-600/30 border-orange-500/50">
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-300 text-lg">
                Rockin' Rockin' Boogie — the song at the heart of this entire legacy restoration project — is a direct product of Little Richard's mentorship and collaboration with Seabrun Candy Hunter during the 1970s.
              </p>
              <p className="text-gray-300 text-lg">
                The platform you're exploring right now, Rockin' Rockin' Boogie, honors this legacy by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 text-lg">
                <li>Celebrating Little Richard's revolutionary contributions to rock and roll</li>
                <li>Documenting his mentorship of Seabrun Candy Hunter during 1971-1980</li>
                <li>Preserving the recordings and collaborations from this era</li>
                <li>Continuing the mission of "A Voice for the Voiceless" that both artists embodied</li>
                <li>Ensuring that the next generation understands the roots of rock and roll</li>
              </ul>
              <p className="text-gray-300 text-lg pt-4">
                <Link href="/rrb/little-richard-connection" className="text-orange-400 hover:text-orange-300 underline">
                  Learn more about the documented connection between Little Richard and Seabrun Candy Hunter →
                </Link>
              </p>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="text-center space-y-6 py-8">
          <h2 className="text-3xl font-bold text-white">Explore the Legacy</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/rrb/little-richard-connection" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-pink-600 transition-all">
              Little Richard Connection
            </Link>
            <Link href="/rrb/radio-station" className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all">
              Listen to the Music
            </Link>
            <Link href="/rrb/candy-through-the-years" className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all">
              Candy's Journey
            </Link>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm space-y-2 border-t border-gray-800 pt-8">
          <p>
            This biography is based on documented primary sources, including Candy Hunter's personal Facebook posts, the Reprise Records vinyl single, and independent verification from session musicians.
          </p>
          <p>
            Sources: Wikipedia (Little Richard), Candy Hunter Facebook Posts (2018-2020), Reprise Records Archives, Alvin Taylor Confirmation (2026)
          </p>
        </div>
      </div>
    </div>
  );
}
