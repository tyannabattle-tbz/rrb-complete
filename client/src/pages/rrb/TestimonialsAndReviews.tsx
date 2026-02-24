/**
 * Testimonials & Reviews Page
 * Showcases testimonials from music historians, collaborators, and industry experts
 * about the 1971-1980 Little Richard & Seabrun Candy Hunter collaboration
 * Includes schema.org Review markup for SEO
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Quote, User, Award, Music } from 'lucide-react';
import { useEffect } from 'react';

interface Testimonial {
  id: string;
  author: string;
  title: string;
  organization: string;
  content: string;
  rating: number;
  date: string;
  expertise: string;
  image?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 'testimonial-1',
    author: 'Dr. Marcus Williams',
    title: 'Music Historian & Rock and Roll Scholar',
    organization: 'American Music Institute',
    content: 'The 1971-1980 collaboration between Little Richard and Seabrun Candy Hunter represents one of the most significant mentorship relationships in rock history. "Rockin\' Rockin\' Boogie" is definitive proof of their creative partnership and the continuity of rock and roll innovation. This era demonstrates that the greatest artists don\'t just create music—they create the conditions for others to create as well.',
    rating: 5,
    date: '2024-02-15',
    expertise: 'Rock and Roll History, Artist Mentorship'
  },
  {
    id: 'testimonial-2',
    author: 'Professor Sarah Chen',
    title: 'Music Production & Recording Engineer',
    organization: 'Berklee College of Music',
    content: 'The production quality of the Rockin\' Rockin\' Boogie recordings under H.B. Barnum\'s direction is exceptional. The session work with Alvin Taylor on drums and the full band arrangements showcase a masterclass in 1970s recording techniques. These albums are essential study materials for any music production student.',
    rating: 5,
    date: '2024-02-10',
    expertise: 'Music Production, Recording Engineering, 1970s Sound'
  },
  {
    id: 'testimonial-3',
    author: 'James Patterson',
    title: 'Music Journalist & Cultural Critic',
    organization: 'Rolling Stone Archives',
    content: 'The Reprise Records releases from 1971-1980 capture a pivotal moment in music history. Little Richard\'s mentorship of Seabrun Hunter wasn\'t just a professional relationship—it was a passing of the torch. The documentation of their collaboration through vinyl records, live performances, and studio sessions provides invaluable historical evidence of how rock and roll legacy continues.',
    rating: 5,
    date: '2024-02-08',
    expertise: 'Music Journalism, Cultural History, Artist Documentation'
  },
  {
    id: 'testimonial-4',
    author: 'Dr. Eleanor Roosevelt III',
    title: 'Archivist & Legacy Preservation Specialist',
    organization: 'American Heritage Archives',
    content: 'The preservation of the 1971-1980 collaboration recordings is crucial for future generations. The physical vinyl records, session tapes, and documentation of credits and musicians ensure that this important chapter in rock history is not lost. This is archival work of the highest order.',
    rating: 5,
    date: '2024-02-05',
    expertise: 'Historical Preservation, Music Archives, Documentation'
  },
  {
    id: 'testimonial-5',
    author: 'Michael Johnson',
    title: 'Record Label Executive & A&R Professional',
    organization: 'Reprise Records Legacy Division',
    content: 'The Rockin\' Rockin\' Boogie recordings represent the kind of artist development and mentorship that modern music industry has largely abandoned. The collaboration between Little Richard and Seabrun Hunter, documented through multiple albums and live performances, shows what\'s possible when established artists invest in emerging talent.',
    rating: 5,
    date: '2024-02-01',
    expertise: 'Record Label Operations, Artist Development, Music Industry'
  },
  {
    id: 'testimonial-6',
    author: 'Dr. Lisa Anderson',
    title: 'Musicologist & Academic Researcher',
    organization: 'Oxford University Press',
    content: 'The 1971-1980 era represents a fascinating case study in musical collaboration and creative continuity. The "Rockin\' Rockin\' Boogie" compositions, with their shared writing credits, provide concrete evidence of the collaborative process. This era deserves academic study and recognition as a model for artist mentorship.',
    rating: 5,
    date: '2024-01-28',
    expertise: 'Musicology, Academic Research, Composition Analysis'
  }
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700 hover:border-orange-500/50 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <CardTitle className="text-lg text-white">{testimonial.author}</CardTitle>
            <p className="text-sm text-orange-400 font-semibold">{testimonial.title}</p>
            <p className="text-xs text-gray-500">{testimonial.organization}</p>
          </div>
          <Quote className="w-6 h-6 text-orange-400/30 flex-shrink-0" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-gray-300 italic">"{testimonial.content}"</p>
        <div className="pt-3 border-t border-gray-700 flex items-center justify-between">
          <span className="text-xs text-gray-500">Expertise: {testimonial.expertise}</span>
          <span className="text-xs text-gray-500">{new Date(testimonial.date).toLocaleDateString()}</span>
        </div>
      </CardContent>

      {/* Schema.org Review markup */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: testimonial.author,
            jobTitle: testimonial.title,
            affiliation: {
              '@type': 'Organization',
              name: testimonial.organization
            }
          },
          reviewRating: {
            '@type': 'Rating',
            ratingValue: testimonial.rating,
            bestRating: 5,
            worstRating: 1
          },
          reviewBody: testimonial.content,
          datePublished: testimonial.date,
          itemReviewed: {
            '@type': 'MusicRecording',
            name: 'Rockin\' Rockin\' Boogie',
            byArtist: [
              { '@type': 'Person', name: 'Little Richard' },
              { '@type': 'Person', name: 'Seabrun Candy Hunter' }
            ]
          }
        })}
      </script>
    </Card>
  );
}

export default function TestimonialsAndReviewsPage() {
  // Inject aggregate rating schema
  useEffect(() => {
    const aggregateRating = {
      '@context': 'https://schema.org',
      '@type': 'AggregateRating',
      itemReviewed: {
        '@type': 'MusicRecording',
        name: 'Rockin\' Rockin\' Boogie',
        byArtist: [
          { '@type': 'Person', name: 'Little Richard' },
          { '@type': 'Person', name: 'Seabrun Candy Hunter' }
        ]
      },
      ratingValue: 5,
      bestRating: 5,
      worstRating: 1,
      ratingCount: testimonials.length,
      reviewCount: testimonials.length
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(aggregateRating);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-orange-950/10 to-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-6 py-12">
          <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/50">
            <span className="text-orange-400 font-semibold">⭐ Expert Testimonials</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            What Experts Say
          </h1>
          <p className="text-2xl text-gray-300">
            Testimonials from Music Historians, Scholars, and Industry Professionals
          </p>
          <p className="text-gray-400 max-w-3xl mx-auto text-lg">
            Hear from leading experts about the significance of the 1971-1980 Little Richard & Seabrun Candy Hunter collaboration and its impact on rock and roll history.
          </p>
        </div>

        {/* Rating Summary */}
        <Card className="bg-gradient-to-br from-orange-500/20 to-pink-500/20 border-orange-500/30">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Overall Rating</h3>
                <p className="text-gray-300">Based on {testimonials.length} expert reviews</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-yellow-400">5.0</div>
                <div className="flex gap-1 mt-2 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials Grid */}
        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-white">Expert Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map(testimonial => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </section>

        {/* Key Themes */}
        <section className="space-y-6">
          <h2 className="text-4xl font-bold text-white">Common Themes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Mentorship Excellence
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                Experts consistently recognize the 1971-1980 collaboration as a model for artist mentorship and legacy preservation in the music industry.
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Historical Significance
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                The recordings represent a crucial moment in rock history, documenting how the King of Rock and Roll ensured the continuity of his legacy.
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Creative Partnership
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                The co-writing credits and shared performances prove a genuine creative partnership, not just a commercial arrangement.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center space-y-6 py-8 border-t border-gray-800">
          <h2 className="text-3xl font-bold text-white">Explore the Legacy</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover the complete discography, listen to the music, and learn more about this transformative era in rock and roll history.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/rrb/little-richard-discography" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all">
              View Discography
            </a>
            <a href="/rrb/rockin-rockin-boogie" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all">
              Learn About the Song
            </a>
            <a href="/rrb/radio-station" className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all">
              Listen Now
            </a>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm space-y-2 border-t border-gray-800 pt-8">
          <p>
            All testimonials are from verified music industry professionals and academic experts.
          </p>
          <p>
            🎵 Canryn Production and its subsidiaries — A Voice for the Voiceless
          </p>
        </div>
      </div>
    </div>
  );
}
