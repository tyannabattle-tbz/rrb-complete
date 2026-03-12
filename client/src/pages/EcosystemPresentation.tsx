import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'wouter';

const VIDEO_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/rrb_ecosystem_presentation_c159e8cc.mp4';

interface Section {
  id: string;
  title: string;
  subtitle: string;
  startTime: number;
  endTime: number;
  image: string;
  description: string;
  links: { label: string; href: string }[];
  color: string;
}

const SECTIONS: Section[] = [
  {
    id: 'opening',
    title: 'The Origin',
    subtitle: 'Rockin\' Rockin\' Boogie',
    startTime: 0,
    endTime: 15.6,
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/scene1_origin_7f24a500.png',
    description: 'What if one family\'s legacy could change the world? This is the story of Rockin\' Rockin\' Boogie — a movement born from love, built on purpose, and powered by the most advanced autonomous technology ever created.',
    links: [
      { label: 'Listen on Apple Music', href: 'https://music.apple.com/us/album/rockin-rockin-boogie/1138028248?i=1138028548' },
      { label: 'Listen on Spotify', href: 'https://open.spotify.com/track/5KVSIfo5scGsavPaIVNppg' },
      { label: 'Watch on YouTube', href: 'https://www.youtube.com/watch?v=aK0bHueROOQ' },
    ],
    color: '#D4AF37',
  },
  {
    id: 'candy',
    title: 'Candy Hunter',
    subtitle: 'The Legacy',
    startTime: 15.6,
    endTime: 43.65,
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/scene2_sweet_miracles_1c2768dc.png',
    description: 'It all began with Candy Hunter — a father, a musician, a visionary. His song wasn\'t just music. It was a declaration that creativity, family, and truth matter. Every channel, every broadcast, every line of code carries his name forward.',
    links: [
      { label: 'Explore the Archive', href: '/candy-archive' },
      { label: 'Evidence Map', href: '/candy-evidence-map' },
      { label: 'Documentary', href: '/candy-documentary' },
    ],
    color: '#C9A84C',
  },
  {
    id: 'sweet-miracles',
    title: 'Sweet Miracles',
    subtitle: 'Voice for the Voiceless',
    startTime: 43.65,
    endTime: 70.2,
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/scene3_sweet_miracles_v3_b7418a8c.png',
    description: 'Sweet Miracles at the Table is the heart of this movement — a nonprofit dedicated to being a voice for the voiceless. From the halls of the United Nations to communities across the world, Sweet Miracles advocates for women, children, and families.',
    links: [
      { label: 'Sweet Miracles Mission', href: '/sweet-miracles' },
      { label: 'UN CSW70 Campaign', href: '/media-blast' },
      { label: 'Contact', href: 'mailto:sweetmiraclesattt@gmail.com' },
    ],
    color: '#E8C547',
  },
  {
    id: 'squadd',
    title: 'SQUADD Coalition',
    subtitle: 'Global Partnerships',
    startTime: 70.2,
    endTime: 97.0,
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/scene3_squadd_aaf6789d.png',
    description: 'SQUADD brings together leaders, organizations, and communities united by a common purpose. From international diplomacy to grassroots advocacy, SQUADD members collaborate across borders, amplifying each other\'s impact.',
    links: [
      { label: 'SQUADD Goals', href: '/squadd-goals' },
      { label: 'Join the Coalition', href: '/collaboration' },
    ],
    color: '#B8962E',
  },
  {
    id: 'hybridcast',
    title: 'HybridCast',
    subtitle: 'Emergency Broadcasting',
    startTime: 97.0,
    endTime: 126.3,
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/scene6_hybridcast_1a3cd6ef.png',
    description: 'When disaster strikes, communication saves lives. HybridCast is our emergency broadcast platform — a resilient, offline-first system using mesh networking, satellite relay, and progressive web technology.',
    links: [
      { label: 'HybridCast Hub', href: '/hybridcast' },
      { label: 'Emergency Features', href: '/hybridcast-config' },
    ],
    color: '#FF6B35',
  },
  {
    id: 'qumus',
    title: 'QUMUS',
    subtitle: 'The Autonomous AI Brain',
    startTime: 126.3,
    endTime: 159.1,
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/scene4_qumus_56e176f7.png',
    description: 'I am QUMUS, the autonomous AI brain that orchestrates this entire ecosystem. I manage nineteen decision policies, monitor fifty-four radio channels around the clock, and ensure every part runs with over ninety percent autonomy.',
    links: [
      { label: 'Chat with QUMUS', href: '/qumus-chat' },
      { label: 'QUMUS Dashboard', href: '/qumus' },
      { label: 'Monitoring', href: '/qumus-monitoring' },
    ],
    color: '#00D4FF',
  },
  {
    id: 'radio',
    title: 'RRB Radio',
    subtitle: '54 Channels • 24/7',
    startTime: 159.1,
    endTime: 195.5,
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/scene5_radio_3e649f44.png',
    description: 'Fifty-one channels broadcasting twenty-four hours a day. From hip-hop to gospel, from healing frequencies to children\'s programming — every channel serves a purpose, every frequency carries a message.',
    links: [
      { label: 'Tune In Now', href: '/radio' },
      { label: 'Station Guide', href: '/radio' },
      { label: 'Live Stream', href: '/live' },
    ],
    color: '#9B59B6',
  },
  {
    id: 'cta',
    title: 'Join the Movement',
    subtitle: 'Be Part of Something Bigger',
    startTime: 195.5,
    endTime: 222.4,
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/scene8_cta_8fe02c29.png',
    description: 'This is more than a platform. This is a movement. Whether you\'re a partner, a listener, a volunteer, or a visionary — there is a place for you here. For the culture, for the community, for the world.',
    links: [
      { label: 'Visit manuweb.sbs', href: '/' },
      { label: 'Email Us', href: 'mailto:sweetmiraclesattt@gmail.com' },
      { label: 'RRB Radio', href: '/radio' },
    ],
    color: '#D4AF37',
  },
];

export default function EcosystemPresentation() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const jumpToSection = useCallback((index: number) => {
    setCurrentSection(index);
    if (videoRef.current) {
      videoRef.current.currentTime = SECTIONS[index].startTime;
      videoRef.current.play();
      setIsPlaying(true);
      setShowVideo(true);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      setShowVideo(true);
    }
  }, [isPlaying]);

  const playFromStart = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
    setShowVideo(true);
    setCurrentSection(0);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      const t = video.currentTime;
      setVideoTime(t);
      const totalDur = video.duration || 222;
      setProgress((t / totalDur) * 100);

      // Find current section
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        if (t >= SECTIONS[i].startTime) {
          setCurrentSection(i);
          break;
        }
      }
    };

    const onLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const onEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('ended', onEnded);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const section = SECTIONS[currentSection];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero Section */}
      <div className="relative">
        {/* Video Player */}
        <div className="relative w-full" style={{ maxHeight: '70vh' }}>
          {!showVideo ? (
            <div className="relative w-full aspect-video bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
              <img
                src={SECTIONS[0].image}
                alt="RRB Ecosystem"
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
              <div className="relative z-10 text-center px-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4" style={{ color: '#D4AF37', fontFamily: 'Playfair Display, serif' }}>
                  Rockin' Rockin' Boogie
                </h1>
                <p className="text-lg md:text-2xl text-[#C9A84C] mb-2 tracking-widest uppercase">
                  The Ecosystem
                </p>
                <p className="text-sm md:text-base text-gray-400 mb-8 max-w-2xl mx-auto">
                  A 4-minute cinematic journey through the movement that's changing global communities
                </p>
                <button
                  onClick={playFromStart}
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #B8962E)', color: '#0a0a0a' }}
                >
                  <svg className="w-8 h-8 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Watch the Presentation
                </button>
              </div>
            </div>
          ) : (
            <div className="relative w-full aspect-video bg-black">
              <video
                ref={videoRef}
                src={VIDEO_URL}
                className="w-full h-full object-contain"
                playsInline
                preload="auto"
              />
              {/* Video Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                {/* Progress Bar */}
                <div className="relative w-full h-2 bg-white/20 rounded-full mb-3 cursor-pointer group"
                  onClick={(e) => {
                    if (!videoRef.current) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = (e.clientX - rect.left) / rect.width;
                    videoRef.current.currentTime = pct * (duration || 222);
                  }}
                >
                  <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all"
                    style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #D4AF37, #E8C547)' }}
                  />
                  {/* Section markers */}
                  {SECTIONS.map((s, i) => (
                    <div
                      key={i}
                      className="absolute top-0 w-0.5 h-full bg-white/40"
                      style={{ left: `${(s.startTime / (duration || 222)) * 100}%` }}
                      title={s.title}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={togglePlay} className="text-white hover:text-[#D4AF37] transition-colors">
                      {isPlaying ? (
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                      ) : (
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      )}
                    </button>
                    <span className="text-sm text-gray-300 font-mono">
                      {formatTime(videoTime)} / {formatTime(duration || 222)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full" style={{ background: section.color + '33', color: section.color }}>
                      {section.title}
                    </span>
                    <a
                      href={VIDEO_URL}
                      download="RRB_Ecosystem_Presentation.mp4"
                      className="text-white/60 hover:text-[#D4AF37] transition-colors"
                      title="Download MP4"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Hidden video element for preloading when not shown */}
          {!showVideo && (
            <video ref={videoRef} src={VIDEO_URL} preload="auto" className="hidden" />
          )}
        </div>
      </div>

      {/* Section Navigation Timeline */}
      <div className="bg-[#111111] border-t border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
            {SECTIONS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => jumpToSection(i)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
                  currentSection === i
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30 hover:text-white'
                }`}
              >
                <span className="text-xs opacity-60 mr-1">{i + 1}.</span>
                {s.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Section Detail */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Section Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ boxShadow: `0 0 60px ${section.color}22` }}>
            <img
              src={section.image}
              alt={section.title}
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: section.color + '33', color: section.color }}>
                Section {currentSection + 1} of {SECTIONS.length}
              </span>
            </div>
          </div>

          {/* Section Info */}
          <div>
            <p className="text-sm uppercase tracking-widest mb-2" style={{ color: section.color }}>
              {section.subtitle}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E1' }}>
              {section.title}
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              {section.description}
            </p>
            <div className="flex flex-wrap gap-3">
              {section.links.map((link, li) => (
                link.href.startsWith('http') || link.href.startsWith('mailto') ? (
                  <a
                    key={li}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                    style={{
                      background: li === 0 ? section.color : 'transparent',
                      color: li === 0 ? '#0a0a0a' : section.color,
                      border: li === 0 ? 'none' : `1px solid ${section.color}44`,
                    }}
                  >
                    {link.label}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ) : (
                  <Link
                    key={li}
                    href={link.href}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                    style={{
                      background: li === 0 ? section.color : 'transparent',
                      color: li === 0 ? '#0a0a0a' : section.color,
                      border: li === 0 ? 'none' : `1px solid ${section.color}44`,
                    }}
                  >
                    {link.label}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* All Sections Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h3 className="text-2xl font-bold mb-8 text-center" style={{ color: '#D4AF37', fontFamily: 'Playfair Display, serif' }}>
          Explore the Ecosystem
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => jumpToSection(i)}
              className={`group relative rounded-xl overflow-hidden aspect-video transition-all duration-300 hover:scale-105 ${
                currentSection === i ? 'ring-2' : 'ring-0'
              }`}
              style={{ ringColor: s.color }}
            >
              <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90" />
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-xs font-bold text-white truncate">{s.title}</p>
                <p className="text-[10px] text-gray-400 truncate">{s.subtitle}</p>
              </div>
              {currentSection === i && (
                <div className="absolute top-2 right-2">
                  <span className="w-2 h-2 rounded-full inline-block animate-pulse" style={{ background: s.color }} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Download & Share Bar */}
      <div className="bg-[#111111] border-t border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-bold" style={{ color: '#D4AF37' }}>Share This Presentation</h4>
              <p className="text-sm text-gray-500">Download the MP4 for Zoom, social media, UN events, and partner outreach</p>
            </div>
            <div className="flex gap-3">
              <a
                href={VIDEO_URL}
                download="RRB_Ecosystem_Presentation.mp4"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #B8962E)', color: '#0a0a0a' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download MP4
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border transition-all hover:scale-105"
                style={{ borderColor: '#D4AF37', color: '#D4AF37' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#0a0a0a] border-t border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-600">
            Rockin' Rockin' Boogie Ecosystem &bull; Canryn Production &bull; Sweet Miracles at the Table
          </p>
          <p className="text-xs text-gray-700 mt-1">
            sweetmiraclesattt@gmail.com &bull; manuweb.sbs
          </p>
        </div>
      </div>
    </div>
  );
}
