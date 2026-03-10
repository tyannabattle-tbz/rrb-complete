import { useState } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Globe, Linkedin, MapPin, Mic, Twitter, User, ExternalLink } from "lucide-react";

export default function SpeakerProfile() {
  const params = useParams<{ id: string }>();
  const speakerId = parseInt(params.id || "0");
  const { data: speaker, isLoading } = trpc.conference.getSpeakerProfile.useQuery({ speakerId });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 flex items-center justify-center">
        <div className="animate-pulse text-purple-400">Loading speaker profile...</div>
      </div>
    );
  }

  if (!speaker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Speaker Not Found</h2>
          <p className="text-white/60 mb-4">This speaker profile doesn't exist.</p>
          <Link href="/conference">
            <Button variant="outline" className="border-purple-500 text-purple-400">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Conference Hub
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/conference">
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-1" /> Conference Hub
            </Button>
          </Link>
          <div className="h-4 w-px bg-white/20" />
          <h1 className="text-lg font-semibold text-white">Speaker Profile</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Photo */}
          <div className="shrink-0">
            {speaker.photo_url ? (
              <img
                src={speaker.photo_url}
                alt={speaker.name}
                className="w-48 h-48 rounded-2xl object-cover border-2 border-purple-500/30"
              />
            ) : (
              <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-purple-600/30 to-amber-600/30 border-2 border-purple-500/30 flex items-center justify-center">
                <User className="w-20 h-20 text-purple-400/50" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{speaker.name}</h1>
            {speaker.title && (
              <p className="text-lg text-purple-400 mb-1">{speaker.title}</p>
            )}
            {speaker.organization && (
              <p className="text-white/60 flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4" /> {speaker.organization}
              </p>
            )}

            {/* Social Links */}
            <div className="flex gap-3 mb-6">
              {speaker.social_twitter && (
                <a href={speaker.social_twitter.startsWith('http') ? speaker.social_twitter : `https://twitter.com/${speaker.social_twitter}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-sm">
                  <Twitter className="w-4 h-4" /> Twitter
                </a>
              )}
              {speaker.social_linkedin && (
                <a href={speaker.social_linkedin.startsWith('http') ? speaker.social_linkedin : `https://linkedin.com/in/${speaker.social_linkedin}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-700/10 text-blue-300 hover:bg-blue-700/20 text-sm">
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
              )}
              {speaker.social_website && (
                <a href={speaker.social_website.startsWith('http') ? speaker.social_website : `https://${speaker.social_website}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 text-sm">
                  <Globe className="w-4 h-4" /> Website
                </a>
              )}
            </div>

            {/* Session Topic */}
            {speaker.session_topic && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mb-1">
                  <Mic className="w-4 h-4" /> Session Topic
                </div>
                <p className="text-white">{speaker.session_topic}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {speaker.bio && (
          <Card className="bg-white/5 border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="text-white text-lg">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{speaker.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Session History */}
        {speaker.sessions && speaker.sessions.length > 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                Sessions ({speaker.sessions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {speaker.sessions.map((session: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                    <div>
                      <h4 className="text-white font-medium">{session.conference_title}</h4>
                      <p className="text-white/40 text-sm">
                        {session.session_topic || 'General Session'} &bull;{' '}
                        {session.scheduled_at ? new Date(session.scheduled_at).toLocaleDateString() : 'TBD'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        session.status === 'live' ? 'bg-green-500/20 text-green-400' :
                        session.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                        session.status === 'completed' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {session.status}
                      </span>
                      <Link href={`/conference/room/${session.conference_id}`}>
                        <Button size="sm" variant="ghost" className="text-purple-400 hover:text-purple-300">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* UN CSW70 Badge */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">UN CSW70 Conference Speaker</span>
          </div>
          <p className="text-white/30 text-xs mt-3">
            Powered by QUMUS Autonomous Orchestration | Canryn Production | A Voice for the Voiceless
          </p>
        </div>
      </div>
    </div>
  );
}
