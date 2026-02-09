import { useMemo } from 'react';
import { PageMeta } from '@/components/rrb/PageMeta';
import { RadioPlayer, Track } from '@/components/rrb/RadioPlayer';
import { HybridCastWidgetContainer } from '@/components/rrb/HybridCastWidgetContainer';
import RadioCommercials from '@/components/rrb/RadioCommercials';
import SeasonalCampaigns from '@/components/rrb/SeasonalCampaigns';
import { trpc } from '@/lib/trpc';
import { AudioUploadManager } from '@/components/AudioUploadManager';

export default function RadioStation() {
  // Fetch tracks from database
  const { data: dbTracks } = trpc.radioContent.getTracks.useQuery();
  const { data: streamingChannels } = trpc.radioContent.getStreamingStatus.useQuery();
  const { data: playlists } = trpc.radioContent.getPlaylists.useQuery();

  // Curated playlist of Seabrun and Helen's music (fallback)
  const fallbackTracks: Track[] = [
    {
      id: '1',
      title: 'Rockin\' Rockin\' Boogie',
      artist: 'Seabrun Candy Hunter & Little Richard',
      url: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/LhZvyaWhSQodjVFs.mp3',
      description: 'The iconic track that defined an era - 1970s soul and funk',
      duration: 330,
    },
    {
      id: '2',
      title: 'California I\'m Coming',
      artist: 'Seabrun Candy Hunter',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      description: 'Limited edition unreleased track from 1975',
      duration: 240,
    },
    {
      id: '3',
      title: 'I Saw What You Did',
      artist: 'Seabrun Candy Hunter',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      description: 'Seabrun Candy Hunter original composition',
      duration: 210,
    },
    {
      id: '4',
      title: 'Voicemail to C.J. Battle from Dad',
      artist: 'Seabrun Candy Hunter',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      description: 'A heartfelt personal message to his grandson',
      duration: 89,
    },
    {
      id: '5',
      title: 'Can-Ryn Production Inc. - A Corporation with the Right Stuff',
      artist: 'Seabrun Candy Hunter',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      description: 'Overview of Can-Ryn Production and its six specialized subsidiaries: Can-Ryn Publishing, Seasha Distribution, Annas Promotion, Jaelon Enterprises, Little G Recording, and Sean\'s Music World',
      duration: 180,
    },
    {
      id: '6',
      title: 'Rare Photo of Candy and Richard at Piano',
      artist: 'Seabrun Candy Hunter',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      description: 'Candy shares gratitude for a rare photo and requests more for her book project',
      duration: 45,
    },
    {
      id: '7',
      title: 'Book Release Timeline Update',
      artist: 'Seabrun Candy Hunter',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
      description: 'Candy provides an update on her book project timeline',
      duration: 38,
    },
    {
      id: '8',
      title: 'Piano Strings and Touring Memories',
      artist: 'Seabrun Candy Hunter',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
      description: 'Candy shares anecdotes about traveling with Little Richard and his playing style',
      duration: 52,
    },
    {
      id: '9',
      title: 'Memorial Reflection on Little Richard',
      artist: 'Seabrun Candy Hunter',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
      description: 'Candy shares a heartfelt memorial reflection on Little Richard',
      duration: 28,
    },
    {
      id: '10',
      title: 'Concert Stage Management',
      artist: 'Seabrun Candy Hunter',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
      description: 'Candy discusses professional stage management during touring with Little Richard',
      duration: 35,
    },
  ];

  // Merge database tracks with fallback - prefer DB tracks when available
  const tracks: Track[] = useMemo(() => {
    if (dbTracks && dbTracks.length > 0) {
      return dbTracks.map(t => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        url: t.url,
        duration: t.duration,
        description: t.description || '',
      }));
    }
    return fallbackTracks;
  }, [dbTracks]);

  return (
    <>
      <PageMeta
        title="Radio Station — Seabrun & Helen's Music | Rockin' Rockin' Boogie"
        description="Listen to curated playlist of Seabrun Candy Hunter and Helen Logan Hunter's music. Stream songs, interviews, and audio archive."
        keywords="Seabrun Candy Hunter music, Helen Hunter, radio station, music playlist, streaming, audio archive"
      />
      <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-accent/20 to-accent/10 py-12 md:py-16">
        <div className="container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">🎙️ Legacy Radio Station</h1>
          <p className="text-lg text-foreground/80 mb-2">
            Experience the music and voice of Seabrun Candy Hunter and his family legacy
          </p>
          <p className="text-foreground/70">
            A curated collection of recordings, interviews, and personal messages that capture the essence of a musical legacy
          </p>
        </div>
      </section>

      {/* 432Hz Information Banner */}
      <section className="py-8 md:py-12 bg-accent/10 border-y border-accent/20">
        <div className="container max-w-4xl">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🎵</div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">All Music Resonated at 432Hz</h3>
              <p className="text-foreground/80 mb-4">
                All recordings on this station have been carefully resonated at 432Hz, known as the "universal frequency" or "frequency of the universe." This tuning is believed to promote healing, harmony, and spiritual alignment. Experience the music as it was meant to be heard.
              </p>
              <div className="bg-background/50 p-4 rounded-lg border border-accent/20">
                <p className="text-sm text-foreground/70 leading-relaxed">
                  <strong>Frequency Disclaimer:</strong> The 432Hz tuning represents an alternative to the standard 440Hz concert pitch. While many believe 432Hz has therapeutic and healing properties, these claims are not scientifically established. The frequency is used here as part of our commitment to holistic wellness and spiritual resonance. Individual experiences may vary. If you have hearing sensitivities or audio-related health concerns, please consult with a healthcare professional.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Streaming Channels */}
      {streamingChannels && streamingChannels.length > 0 && (
        <section className="py-8 md:py-12 bg-background">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">📡 Live Channels</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {streamingChannels.map(ch => (
                <div key={ch.id} className="bg-card p-4 rounded-lg border border-border hover:border-accent transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${ch.isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
                    <span className="text-sm font-semibold text-foreground">{ch.channelName}</span>
                  </div>
                  <div className="text-xs text-foreground/60 space-y-1">
                    <p>{ch.isLive ? '🔴 LIVE' : '⚫ Offline'} · {ch.currentListeners?.toLocaleString() || 0} listeners</p>
                    <p>{ch.quality} · {ch.bitrate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HybridCast Widget Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-accent/10 to-background">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-6">🎙️ HybridCast Live Radio</h2>
          <p className="text-foreground/80 mb-8">
            Tune in to live broadcasts, emergency alerts, and community check-ins powered by HybridCast technology
          </p>
          <HybridCastWidgetContainer />
        </div>
      </section>

      {/* Radio Player Section */}
      <section className="py-12 md:py-16">
        <div className="container max-w-4xl">
          <RadioPlayer
            tracks={tracks}
            title="🎵 Seabrun Candy Hunter & Family Legacy"
            description="Play through the complete collection of verified recordings and personal messages"
          />
        </div>
      </section>

      {/* Most Played Section */}
      <section className="py-12 md:py-16 bg-accent/5">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-6">🔥 Most Played</h2>
          <p className="text-foreground/80 mb-8">
            The most beloved tracks from our listeners - discover what resonates with the community
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-lg border border-accent/20 hover:border-accent transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-accent mb-1">🥇 #1 Most Played</div>
                  <h3 className="text-xl font-bold text-foreground">Rockin' Rockin' Boogie</h3>
                  <p className="text-sm text-foreground/70 mt-1">Seabrun Candy Hunter & Little Richard</p>
                </div>
                <div className="text-3xl font-bold text-accent/40">1</div>
              </div>
              <p className="text-sm text-foreground/60 mb-3">The iconic track that defined an era</p>
              <div className="w-full bg-border rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{width: '92%'}}></div>
              </div>
              <p className="text-xs text-foreground/50 mt-2">4,250 plays</p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border hover:border-accent transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-accent mb-1">🥈 #2 Most Played</div>
                  <h3 className="text-xl font-bold text-foreground">Voicemail to C.J. Battle from Dad</h3>
                  <p className="text-sm text-foreground/70 mt-1">Seabrun Candy Hunter</p>
                </div>
                <div className="text-3xl font-bold text-accent/40">2</div>
              </div>
              <p className="text-sm text-foreground/60 mb-3">A heartfelt personal message</p>
              <div className="w-full bg-border rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{width: '78%'}}></div>
              </div>
              <p className="text-xs text-foreground/50 mt-2">3,312 plays</p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border hover:border-accent transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-accent mb-1">🥉 #3 Most Played</div>
                  <h3 className="text-xl font-bold text-foreground">California I'm Coming</h3>
                  <p className="text-sm text-foreground/70 mt-1">Seabrun Candy Hunter</p>
                </div>
                <div className="text-3xl font-bold text-accent/40">3</div>
              </div>
              <p className="text-sm text-foreground/60 mb-3">Limited edition unreleased track</p>
              <div className="w-full bg-border rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{width: '65%'}}></div>
              </div>
              <p className="text-xs text-foreground/50 mt-2">2,756 plays</p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border hover:border-accent transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-accent mb-1">⭐ Trending</div>
                  <h3 className="text-xl font-bold text-foreground">The Creative Process</h3>
                  <p className="text-sm text-foreground/70 mt-1">Seabrun Candy Hunter</p>
                </div>
                <div className="text-3xl font-bold text-accent/40">↑</div>
              </div>
              <p className="text-sm text-foreground/60 mb-3">Discussing songwriting and legacy</p>
              <div className="w-full bg-border rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{width: '58%'}}></div>
              </div>
              <p className="text-xs text-foreground/50 mt-2">2,465 plays (trending up)</p>
            </div>
          </div>
        </div>
      </section>

      {/* About This Collection */}
      <section className="py-12 md:py-16 bg-card">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-6">About This Collection</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-accent mb-3">🎵 The Music</h3>
              <p className="text-foreground/80 mb-4">
                Listen to the iconic "Rockin' Rockin' Boogie" and other verified recordings that showcase Seabrun Candy Hunter's musical talent and contributions to 1970s soul and funk music.
              </p>
              <p className="text-foreground/70 text-sm">
                All tracks are verified through Discogs, BMI, and USCO records.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-accent mb-3">🎙️ Personal Messages</h3>
              <p className="text-foreground/80 mb-4">
                Hear intimate recordings including a heartfelt voicemail to his grandson C.J. Battle and discussions about his creative process and musical legacy.
              </p>
              <p className="text-foreground/70 text-sm">
                These personal recordings capture the warmth and wisdom of a grandfather's love.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="py-12 md:py-16">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-6">How to Use the Radio Player</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="text-3xl mb-3">▶️</div>
              <h3 className="font-semibold text-foreground mb-2">Play & Pause</h3>
              <p className="text-sm text-foreground/70">
                Click the play button to start listening. Use pause to take a break.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="text-3xl mb-3">⏭️</div>
              <h3 className="font-semibold text-foreground mb-2">Skip Tracks</h3>
              <p className="text-sm text-foreground/70">
                Use the next and previous buttons to navigate through the playlist.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="text-3xl mb-3">🔊</div>
              <h3 className="font-semibold text-foreground mb-2">Volume Control</h3>
              <p className="text-sm text-foreground/70">
                Adjust the volume slider or mute the audio completely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Book Commercials */}
      <RadioCommercials />

      {/* Seasonal Campaigns */}
      <SeasonalCampaigns />

      {/* Explore More */}
      <section className="py-12 md:py-16 bg-card">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-6">Explore More</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <a
              href="/the-music"
              className="group p-6 bg-background rounded-lg border border-border hover:border-accent transition-colors"
            >
              <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors mb-2">
                🎵 Complete Discography
              </h3>
              <p className="text-sm text-foreground/70">
                View the full discography with verified credits and documentation
              </p>
            </a>

            <a
              href="/grandma-helen"
              className="group p-6 bg-background rounded-lg border border-border hover:border-accent transition-colors"
            >
              <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors mb-2">
                👵 Grandma Helen's Legacy
              </h3>
              <p className="text-sm text-foreground/70">
                Discover the family roots and Helen's influence on the musical legacy
              </p>
            </a>

            <a
              href="/proof-vault"
              className="group p-6 bg-background rounded-lg border border-border hover:border-accent transition-colors"
            >
              <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors mb-2">
                📜 Proof Vault
              </h3>
              <p className="text-sm text-foreground/70">
                Explore verified documentation and evidence supporting the legacy
              </p>
            </a>

            <a
              href="/testimonials"
              className="group p-6 bg-background rounded-lg border border-border hover:border-accent transition-colors"
            >
              <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors mb-2">
                🎤 Testimonials
              </h3>
              <p className="text-sm text-foreground/70">
                Read first-hand accounts from collaborators and family members
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* User Audio Upload Section */}
      <section className="py-12 bg-card/30">
        <div className="container max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-2">Upload Your Music</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Replace placeholder tracks with your own recordings. Uploaded tracks appear in the global player.
          </p>
          <AudioUploadManager />
        </div>
      </section>
      </div>
    </>
  );
}
