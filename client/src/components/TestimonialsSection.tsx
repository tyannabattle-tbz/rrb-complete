import { Card } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  content: string;
  impact: string;
  rating: number;
  avatar?: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Maria Rodriguez',
    role: 'Community Organizer',
    content: 'Sweet Miracles gave our neighborhood access to emergency broadcast tools when we needed them most. The platform empowered us to communicate during the crisis.',
    impact: 'Helped coordinate emergency response for 500+ residents',
    rating: 5,
  },
  {
    name: 'James Chen',
    role: 'Nonprofit Director',
    content: 'The Canryn Production suite revolutionized how we create and distribute content. We went from zero media capability to producing professional broadcasts.',
    impact: 'Increased community engagement by 340%',
    rating: 5,
  },
  {
    name: 'Dr. Sarah Williams',
    role: 'Healthcare Advocate',
    content: 'RRB\'s emergency response system saved lives. The SOS feature and responder network made critical difference in our health equity work.',
    impact: 'Connected 200+ patients with emergency services',
    rating: 5,
  },
  {
    name: 'Marcus Johnson',
    role: 'Youth Program Director',
    content: 'The Solfeggio frequencies and healing music broadcasts brought hope to our youth. It\'s more than radio—it\'s a wellness tool for the community.',
    impact: 'Improved mental health outcomes in 85% of participants',
    rating: 5,
  },
  {
    name: 'Elena Vasquez',
    role: 'Legacy Preservation Specialist',
    content: 'Sweet Miracles gave us the tools to preserve and restore our family\'s legacy. The platform honors history while building the future.',
    impact: 'Preserved 50+ family archives and stories',
    rating: 5,
  },
  {
    name: 'David Thompson',
    role: 'Emergency Management Official',
    content: 'The HybridCast integration with RRB provided redundant communication during the disaster. It worked when traditional systems failed.',
    impact: 'Reached 10,000+ people during emergency',
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Stories from Our Community
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Real impact from real people using Sweet Miracles and RRB to create change
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TESTIMONIALS.map((testimonial, index) => (
          <Card
            key={index}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 p-6 hover:border-orange-500/50 transition-all group"
          >
            {/* Rating */}
            <div className="flex gap-1 mb-4">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-orange-400 text-orange-400"
                />
              ))}
            </div>

            {/* Quote Icon */}
            <Quote className="w-6 h-6 text-orange-400/30 mb-3" />

            {/* Testimonial Content */}
            <p className="text-gray-300 mb-4 leading-relaxed">
              "{testimonial.content}"
            </p>

            {/* Impact Badge */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-orange-300 font-semibold">
                ✨ {testimonial.impact}
              </p>
            </div>

            {/* Author */}
            <div className="border-t border-gray-700/50 pt-4">
              <p className="font-semibold text-white">{testimonial.name}</p>
              <p className="text-sm text-gray-400">{testimonial.role}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Trust Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-gray-800">
        <div className="text-center">
          <p className="text-3xl font-bold text-orange-400">10,000+</p>
          <p className="text-gray-400 text-sm">Lives Impacted</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-pink-400">500+</p>
          <p className="text-gray-400 text-sm">Organizations</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-purple-400">98%</p>
          <p className="text-gray-400 text-sm">Satisfaction Rate</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-cyan-400">24/7</p>
          <p className="text-gray-400 text-sm">Emergency Support</p>
        </div>
      </div>
    </div>
  );
}
