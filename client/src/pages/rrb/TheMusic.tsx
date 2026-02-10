import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowRight, Download, FileText, Headphones } from 'lucide-react';
import AudioPlayer from '@/components/rrb/AudioPlayer';
import ExpertValidationBadge from '@/components/rrb/ExpertValidationBadge';
import { PageMeta } from '@/components/rrb/PageMeta';
import { OpenGraphMeta } from '@/components/rrb/OpenGraphMeta';

export default function TheMusic() {
  const songs = [
    {
      title: 'Rockin\' Rockin\' Boogie',
      year: 1975,
      credits: 'Co-written with Little Richard',
      publisher: 'Payten Music (1972)',
      status: 'Verified - Discogs, BMI, USCO, Payten Music',
      validation: 'verified',
      bmiRegistered: true,
      creationStory: 'Created during a legendary studio session with Little Richard in 1975. This iconic track captures the essence of 1970s rock and funk fusion, showcasing Seabrun Candy Hunters songwriting prowess and collaboration with music legends.',
      inspiration: 'The boogie rhythm was inspired by classic 1970s funk and rock traditions, blended with contemporary soul influences.',
      recordingSession: 'Recorded at a premium Los Angeles studio with session musicians including Alvin Taylor on drums.',
      productionNotes: 'Features a distinctive bass line, layered keyboards, and Hunters signature vocal delivery, creating a timeless piece of music history.'
    },
    {
      title: 'I Saw What You Did',
      year: 'BMI Registered',
      credits: 'Writer / Composer',
      status: 'Verified - BMI Registration',
      validation: 'verified',
      bmiRegistered: true
    },
    {
      title: 'I Want to Be More Than Just Your Friend',
      year: 'BMI Registered',
      credits: 'Writer / Composer',
      status: 'Verified - BMI Registration',
      validation: 'verified',
      bmiRegistered: true
    },
    {
      title: 'Make It Right Tonight',
      year: 'BMI Registered',
      credits: 'Writer / Composer',
      status: 'Verified - BMI Registration',
      validation: 'verified',
      bmiRegistered: true
    },
    {
      title: 'What About Tomorrow',
      year: 'BMI Registered',
      credits: 'Writer / Composer',
      status: 'Verified - BMI Registration',
      validation: 'verified',
      bmiRegistered: true
    },
    {
      title: 'California I\'m Coming',
      year: 1975,
      credits: 'Album Release',
      status: 'Verified - Public Records',
      validation: 'verified'
    }
  ];

  const interviews = [
    {
      title: 'Candy Hunter: Meet Leo Jewells - Jazz & Lizz',
      description: 'An in-depth interview exploring Seabrun Candy Hunter\'s musical influences, collaborations, and the creative process behind his legendary compositions.',
      type: 'Interview',
      file: 'candy-hunter-leo-jewells-interview.pdf',
      icon: '🎤'
    },
    {
      title: 'Phil Silverman Interview - Part 1',
      description: 'Exclusive interview with Phil Silverman discussing his perspective on Seabrun\'s musical contributions and industry recognition.',
      type: 'Interview',
      file: 'phil-silverman-interview-1.pdf',
      icon: '🎤'
    },
    {
      title: 'Phil Silverman Interview - Part 2',
      description: 'Continuation of the Phil Silverman interview series, diving deeper into production details and musical legacy.',
      type: 'Interview',
      file: 'phil-silverman-interview-2.pdf',
      icon: '🎤'
    }
  ];

  const collaborators = [
    {
      name: 'Phil Silverman',
      role: 'Music Critic & AllMusic Expert',
      description: 'Renowned music critic and AllMusic contributor specializing in 1970s rock, funk, and soul music. Phil has provided expert analysis and professional reviews of Seabrun Candy Hunter\'s recordings, including the "California I\'m Coming" album and other Little Richard collaborations.',
      expertise: 'Music Criticism, Album Reviews, 1970s Rock & Soul, Recording History',
      file1: 'phil-silverman-interview-1.pdf',
      file2: 'phil-silverman-interview-2.pdf',
      icon: '⭐'
    },
    {
      name: 'Alvin Taylor',
      role: 'Drummer & Collaborator',
      description: 'Legendary drummer who worked closely with Seabrun Candy Hunter on various recording sessions and performances. Professional reference and collaboration documentation.',
      file1: 'alvin-taylor-message.pdf',
      file2: 'alvin-taylor-referral.pdf',
      icon: '🥁'
    },
    {
      name: 'Spencer Leigh',
      role: 'Music Historian & Expert Witness',
      description: 'Respected music historian and author specializing in Little Richard and 1970s rock and roll history. Validated Candy legacy significance through expert correspondence.',
      expertise: 'Little Richard, 1970s Rock & Roll, Music Archival Research',
      icon: '📚'
    }
  ];

  return (
    <>
      <PageMeta
        title="The Music — Seabrun Candy Hunter's Discography | Rockin' Rockin' Boogie"
        description="Complete discography and music catalog of Seabrun Candy Hunter. Explore songs, albums, recordings, and verified collaborations."
        keywords="Seabrun Candy Hunter music, discography, songs, albums, recordings, music collaborations"
      />
      <OpenGraphMeta
        title="The Music — Seabrun Candy Hunter's Discography"
        description="Explore the complete music catalog of Seabrun Candy Hunter. Songs, albums, and verified collaborations with Little Richard."
        image="/images/the-music-og.jpg"
        type="music.album"
      />
      <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            The Music
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-2xl">
            Songs, recordings, and the complete discography
          </p>
        </div>
      </section>

      {/* Songs Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-3xl">
          <h2 className="text-4xl font-bold mb-12 text-foreground">
            Featured Recordings
          </h2>

          {/* Album Covers - Rockin' Rockin' Boogie & California I'm Coming */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="aspect-square bg-muted">
                <img
                  src="/images/1974RockinRockinBoogieUKRepriseRecordsRelease.JPG"
                  alt="Rockin' Rockin' Boogie - Little Richard Album Cover"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2 text-foreground">🎵 Rockin' Rockin' Boogie</h3>
                <p className="text-sm text-accent font-semibold mb-2">Little Richard | 1974</p>
                <p className="text-foreground/70">The original 1974 UK Reprise Records release of the legendary collaboration between Little Richard and Seabrun Candy Hunter.</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="aspect-square bg-muted">
                <img
                  src="/images/exhibit-j-california-im-coming.png"
                  alt="California I'm Coming - The Little Richard Band Album Cover"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2 text-foreground">📀 California I'm Coming</h3>
                <p className="text-sm text-accent font-semibold mb-2">The Little Richard Band | 1975</p>
                <p className="text-foreground/70">Limited edition unreleased tracks album featuring Seabrun Candy Hunter of Little Richard's 1975 touring band, plus four good Richard vocals.</p>
              </div>
            </div>
          </div>

          {/* Album Documentation */}
          <div className="mb-12 bg-card border border-border rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-4 text-foreground">📋 Album Documentation & Review</h3>
            <div className="space-y-4 text-foreground/70">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Product Description</h4>
                <p className="text-sm">A masterful collection of jazz, funk, blues and rock n roll! This album features Little Richard and his band with incredible songs from the mid-1970s showcasing a fusion of jazz, funk, blues and rock n roll! Little Richard, known as The Architect of Rock and Roll, has had a successful career to say the least! Not to mention, has had amazing artists, like Jimi Hendrix, tour as part of his band throughout the years.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Producer & Credits</h4>
                <p className="text-sm">Producer Keith Winslow brought this project to life with a focus on the amazing band Little Richard was working with in 1970. Notable musicians include Johnny Guitar Watson, San Francisco Sound, Tower Of Power (horn section), Eddie Cornelius, Duane Winslow, Larry Williams, Ernie Watts, Tony Matthews, <strong>Jessie Boyce</strong>, <strong>Freeman Brown</strong>, Bobby (Youngblood) Forte, Melvin Wonder, Blood Sweat and Tears and many more musicians and friends.</p>
              </div>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mt-4">
                <p className="text-sm text-foreground/80">
                  <strong>📌 Musical Connection:</strong> Notable musicians <strong>Jessie Boyce (bass)</strong> and <strong>Freeman Brown (drums)</strong> from the 1975 "California I'm Coming" album also appeared on Little Richard's 1986 "Lifetime Friend" album, demonstrating the enduring relationships and musical partnerships within Little Richard's circle.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Professional Review</h4>
                  <div className="space-y-3">
                    <p className="text-sm">An unreleased 1975 album featuring Candy Seabrun Hunter of Little Richards 1975 touring band, plus four good Richard vocals. Two from 1975 (track 1 and track 18), Dew Drop Inn from 1970 and the unreleased for 33 years title track from 1972. Very impressive collection indeed! — <a href="#phil-silverman" className="text-accent font-semibold hover:underline">Phil Silverman, AllMusic</a></p>
                    <div>
                      <ExpertValidationBadge 
                        level="expert-validated"
                        expert="Phil Silverman"
                        source="AllMusic Review"
                      />
                    </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Little Richard 1986 Lifetime Friend Album */}
          <div className="mb-12 bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-6 text-foreground">📀 Little Richard: Lifetime Friend (1986)</h3>
            <div className="space-y-6 text-foreground/80">
              <p>
                After the 1984 release of his autobiography, "The Quasar Of Rock And Roll," Little Richard decided to come out of retirement. This 1986 album, released on Warner Bros., marked his return to recording with a powerhouse band recorded in London.
              </p>
              
              <div className="bg-background border border-border rounded-lg p-6">
                <h4 className="font-bold text-foreground mb-4">Recording Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-foreground/60 mb-2">Recording Location</p>
                    <p className="font-semibold text-foreground">London, England</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60 mb-2">Label</p>
                    <p className="font-semibold text-foreground">Warner Bros.</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60 mb-2">Release Year</p>
                    <p className="font-semibold text-foreground">1986</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60 mb-2">Producer</p>
                    <p className="font-semibold text-foreground">Stuart Colman</p>
                  </div>
                </div>
              </div>

              <div className="bg-background border border-border rounded-lg p-6">
                <h4 className="font-bold text-foreground mb-4">Featured Musicians</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-3">
                    <span className="text-accent font-bold">•</span>
                    <span><strong>Billy Preston</strong> - Keyboards</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-accent font-bold">•</span>
                    <span><strong>Travis Wammack</strong> - Guitar (Muscle Shoals guitarist)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-accent font-bold">•</span>
                    <span><strong>Jesse Boyce</strong> - Bass</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-accent font-bold">•</span>
                    <span><strong>James Stroud</strong> - Drums</span>
                  </li>
                </ul>
              </div>

              <div className="bg-background border border-border rounded-lg p-6">
                <h4 className="font-bold text-foreground mb-4">Album Highlights</h4>
                <p className="mb-4">
                  The album features ten tracks of rock 'n' roll mixed with spiritual lyrics, showcasing Little Richard's continued creative vitality. Notable tracks include:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-3">
                    <span className="text-accent font-bold">•</span>
                    <span><strong>"Great Gosh A'Mighty"</strong> (co-written with Billy Preston) - Later recut by Richard for the film "Down And Out In Beverly Hills," nearly cracking the Top 40</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-accent font-bold">•</span>
                    <span><strong>"Operator"</strong> - Made chart appearances in the UK</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-accent font-bold">•</span>
                    <span><strong>"Somebody's Comin'"</strong> - Made chart appearances in the UK</span>
                  </li>
                </ul>
              </div>

              <p className="italic text-foreground/70">
                This album represents Little Richard's triumphant return to recording, demonstrating his enduring influence and creative power in the mid-1980s music landscape.
              </p>
            </div>
          </div>

          {/* YouTube Video */}
          <div className="mb-12 bg-card border border-border rounded-lg overflow-hidden">
            <div className="bg-black relative" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/MWXH5JH9y1U?si=mGGRUGHC1m5uEe1d"
                title="Rockin' Rockin' Boogie - Little Richard & Seabrun Candy Hunter"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2 text-foreground">🎬 Rockin' Rockin' Boogie</h3>
              <p className="text-foreground/70">Watch the official music video of the legendary collaboration between Little Richard and Seabrun "Candy" Hunter.</p>
            </div>
          </div>

          {/* Voice Narration */}
          <div className="mb-12 bg-accent/5 border border-accent/20 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4 text-foreground">🎙️ About the Music</h3>
            <p className="text-foreground/70 mb-6">
              Listen to Seabrun Candy Hunter discuss his musical journey and creative process.
            </p>
            <AudioPlayer
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3"
              title="The Creative Process"
              speaker="Seabrun Candy Hunter"
              date="April 2015"
              description="Discussing songwriting, collaboration, and musical legacy"
              duration="5:12"
            />
          </div>

          <div className="space-y-8">
            {songs.map((song, idx) => (
              <div key={idx} className="proof-vault-tile">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {song.title}
                  </h3>
                <p className="text-sm text-accent font-semibold">
                  {song.year} • Seabrun Candy Hunter
                </p>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-sm text-foreground/60">Credits</p>
                    <p className="text-foreground">{song.credits}</p>
                  </div>
                  {song.publisher && (
                    <div>
                      <p className="text-sm text-foreground/60">Publisher</p>
                      <p className="text-foreground">{song.publisher}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-foreground/60">Verification Status</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-foreground font-semibold">{song.status}</p>
                      {song.validation && (
                        <ExpertValidationBadge
                          level={song.validation as any}
                          source="Discogs, BMI, USCO"
                        />
                      )}
                    </div>
                  </div>
                  {song.creationStory && (
                    <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mt-4">
                      <p className="text-sm text-foreground/60 mb-2 font-semibold">Song Creation Story</p>
                      <p className="text-foreground text-sm mb-3">{song.creationStory}</p>
                      {song.inspiration && (
                        <div className="mb-3">
                          <p className="text-xs text-foreground/60 font-semibold">Inspiration</p>
                          <p className="text-sm text-foreground/80">{song.inspiration}</p>
                        </div>
                      )}
                      {song.recordingSession && (
                        <div className="mb-3">
                          <p className="text-xs text-foreground/60 font-semibold">Recording Session</p>
                          <p className="text-sm text-foreground/80">{song.recordingSession}</p>
                        </div>
                      )}
                      {song.productionNotes && (
                        <div>
                          <p className="text-xs text-foreground/60 font-semibold">Production Notes</p>
                          <p className="text-sm text-foreground/80">{song.productionNotes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Link href="/rrb/proof-vault">
                  <Button variant="outline" size="sm">
                    View Proof <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interviews & Press Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3 mb-12">
            <Headphones className="w-8 h-8 text-accent" />
            <h2 className="text-4xl font-bold text-foreground">Interviews & Press</h2>
          </div>

          <p className="text-lg text-foreground/80 mb-12">
            Exclusive interviews and press coverage featuring Seabrun Candy Hunter's musical journey, creative process, and industry recognition.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {interviews.map((interview, idx) => (
              <div key={idx} className="bg-background border border-border rounded-lg p-6 hover:border-accent/50 transition-colors">
                <div className="text-3xl mb-3">{interview.icon}</div>
                <h3 className="text-xl font-bold text-foreground mb-2">{interview.title}</h3>
                <p className="text-sm text-accent font-semibold mb-3">{interview.type}</p>
                <p className="text-foreground/70 text-sm mb-4">{interview.description}</p>
                <a
                  href={`/downloads/${interview.file}`}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded text-accent font-semibold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </a>
              </div>
            ))}
            </div>
          </div>
        </section>

      {/* Collaborators Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-12 text-foreground">Key Collaborators</h2>

          {collaborators.map((collab, idx) => (
            <div key={idx} className="bg-card border border-border rounded-lg p-8 mb-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="text-5xl">{collab.icon}</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground">{collab.name}</h3>
                  <p className="text-accent font-semibold mb-2">{collab.role}</p>
                  <p className="text-foreground/70">{collab.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={`/downloads/${collab.file1}`}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded text-accent font-semibold transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Professional Message
                </a>
                <a
                  href={`/downloads/${collab.file2}`}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded text-accent font-semibold transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Referral Documentation
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Discography Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container max-w-3xl">
          <h2 className="text-4xl font-bold mb-8 text-foreground">
            Complete Discography
          </h2>

          <p className="text-lg text-foreground/80 mb-8">
            Explore the complete discography with verified credits, release dates, and public records.
          </p>

          <Link href="/rrb/the-music">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              View Full Discography
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Credits & Rights */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-3xl">
          <h2 className="text-4xl font-bold mb-8 text-foreground">
            Credits & Rights
          </h2>

          <div className="space-y-6 text-foreground/80">
            <p>
              Every recording credit is documented and verified through multiple sources including:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-bold text-foreground mb-2">Public Records</h4>
                <p className="text-sm">Discogs, BMI, MLC registrations</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-bold text-foreground mb-2">Copyright Office</h4>
                <p className="text-sm">USCO registration and renewal records</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-bold text-foreground mb-2">Rights Systems</h4>
                <p className="text-sm">SoundExchange, royalty documentation</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-bold text-foreground mb-2">Witness Testimony</h4>
                <p className="text-sm">Corroboration from collaborators</p>
              </div>
            </div>

            <p>
              For detailed proof and supporting documentation, visit the <strong>Proof Vault</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Related Sections */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container">
          <h2 className="text-4xl font-bold mb-12 text-foreground">
            Explore More
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/rrb/proof-vault">
              <div className="proof-vault-tile cursor-pointer group">
                <div className="mb-4 text-4xl">📜</div>
                <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-accent transition-colors">
                  Proof Vault
                </h3>
                <p className="text-foreground/70 mb-4">
                  Access verified documentation and archival evidence for all credits.
                </p>
                <div className="flex items-center text-accent font-semibold">
                  Enter <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </div>
            </Link>

            <Link href="/rrb/the-legacy">
              <div className="proof-vault-tile cursor-pointer group">
                <div className="mb-4 text-4xl">📖</div>
                <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-accent transition-colors">
                  The Legacy
                </h3>
                <p className="text-foreground/70 mb-4">
                  Learn the complete story and timeline of the legacy.
                </p>
                <div className="flex items-center text-accent font-semibold">
                  Learn <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>
        </div>
        </section>
      </main>
    </>
  );
}
