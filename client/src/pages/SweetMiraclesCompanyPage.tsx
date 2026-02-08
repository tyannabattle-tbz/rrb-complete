import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Music, Award, MapPin, Mail, Phone } from 'lucide-react';

export default function SweetMiraclesCompanyPage() {
  const { data: artist } = trpc.rockinBoogie.getArtistProfile.useQuery({
    artistId: 'tyanna-battle'
  });

  const { data: projects } = trpc.sweetMiracles.getProjects.useQuery();
  const { data: testimonials } = trpc.sweetMiracles.getTestimonials.useQuery();

  const donateMutation = trpc.sweetMiracles.donate.useMutation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-rose-600 to-rose-700 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.1),transparent)]" />
        </div>
        <div className="relative text-center text-white z-10">
          <h1 className="text-5xl font-bold mb-4">💚 Tyanna Battle</h1>
          <p className="text-xl opacity-90">Sweet Miracles & Wellness Initiative</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Artist Profile */}
        {artist && (
          <Card className="bg-slate-800 border-slate-700 p-8 mb-12 -mt-20 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-3xl font-bold text-white mb-4">{artist.name}</h2>
                <p className="text-slate-300 leading-relaxed mb-6">{artist.bio}</p>
                
                <div className="space-y-3 text-slate-300">
                  {artist.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-rose-400" />
                      <span>{artist.location}</span>
                    </div>
                  )}
                  {artist.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-rose-400" />
                      <a href={`mailto:${artist.email}`} className="hover:text-rose-400">
                        {artist.email}
                      </a>
                    </div>
                  )}
                  {artist.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-rose-400" />
                      <a href={`tel:${artist.phone}`} className="hover:text-rose-400">
                        {artist.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="w-full aspect-square bg-gradient-to-br from-rose-400 to-rose-600 rounded-lg flex items-center justify-center">
                  <Music className="w-24 h-24 text-white/50" />
                </div>
                <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white">
                  <Heart className="w-4 h-4 mr-2" />
                  Support This Artist
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Projects Section */}
        {projects && projects.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Sweet Miracles Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="bg-slate-800 border-slate-700 p-6 hover:border-rose-500 transition-all">
                  <h3 className="text-xl font-bold text-white mb-3">{project.title}</h3>
                  <p className="text-slate-300 mb-4">{project.description}</p>
                  
                  <div className="mb-4 p-3 bg-slate-700/50 rounded">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">Progress</span>
                      <span className="text-rose-400 font-bold">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-rose-400 to-rose-600 h-2 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">
                      ${project.raised?.toLocaleString()} of ${project.goal?.toLocaleString()}
                    </span>
                    <Button
                      size="sm"
                      className="bg-rose-500 hover:bg-rose-600"
                      onClick={() => donateMutation.mutate({ projectId: project.id, amount: 50 })}
                    >
                      Donate
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials Section */}
        {testimonials && testimonials.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Impact Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-slate-800 border-slate-700 p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-white">{testimonial.author}</h4>
                      <p className="text-sm text-slate-400">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-slate-300 italic">"{testimonial.content}"</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
