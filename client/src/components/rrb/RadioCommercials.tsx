import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, BarChart3, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Commercial {
  id: number;
  title: string;
  bookTitle: string;
  duration: number;
  audioUrl: string;
  description: string;
  script: string; // The actual script text for TTS fallback
  bookLink: string;
  playCount?: number;
  clickCount?: number;
  seasonal?: boolean;
  seasonalPeriod?: string;
}

// Check if a URL is a real CDN/remote URL (not a local placeholder)
function isRealAudioUrl(url: string): boolean {
  return url.startsWith('https://') || url.startsWith('http://');
}

export default function RadioCommercials() {
  const [currentCommercialIndex, setCurrentCommercialIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTTS, setIsTTS] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [commercialStats, setCommercialStats] = useState<Record<number, { plays: number; clicks: number }>>({});
  const audioRef = useRef<HTMLAudioElement>(null);
  const rotationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const ttsRef = useRef<SpeechSynthesisUtterance | null>(null);
  const ttsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const commercials: Commercial[] = [
    {
      id: 1,
      title: 'The Legacy Restored',
      bookTitle: "Rockin' Rockin' Boogie: The Legacy Restored",
      duration: 60,
      audioUrl: '/audio/commercials/rockin-rockin-boogie-commercial.wav',
      script: "Rockin' Rockin' Boogie — The Legacy Restored. The definitive autobiography documenting the creative journey and cultural impact of Seabrun Candy Hunter. From the streets of Georgia to the stages of the world, this is the story that changed music history. Available now at rockinrockinboogie.com. A Canryn Production.",
      description: 'The definitive autobiography documenting the creative journey and cultural impact of the Rockin\' Rockin\' Boogie legacy.',
      bookLink: '/rrb/books',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 2,
      title: 'The Miracles Series',
      bookTitle: 'Miracles Books 1-7',
      duration: 45,
      audioUrl: '/audio/commercials/miracles-series-commercial.wav',
      script: "The Miracles Series — seven volumes of inspiration, hope, and transformation. From the first miracle to the seventh, each book takes you deeper into a journey of faith and discovery. The complete Miracles collection — available now. A Canryn Production.",
      description: 'A complete spiritual journey through seven volumes of inspiration, hope, and transformation.',
      bookLink: '/rrb/books',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 3,
      title: 'A Woman\'s Instinct',
      bookTitle: "A Woman's Instinct",
      duration: 45,
      audioUrl: '/audio/commercials/womans-instinct-commercial.wav',
      script: "A Woman's Instinct — a celebration of the strength and wisdom of women everywhere. Trust your instinct. Trust your power. Trust your voice. Available now from Canryn Production.",
      description: 'A celebration of the strength and wisdom of women everywhere.',
      bookLink: '/rrb/books',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 4,
      title: 'Just Imagine',
      bookTitle: 'Just Imagine',
      duration: 30,
      audioUrl: '/audio/commercials/just-imagine-commercial.wav',
      script: "Just Imagine — unlock your creative potential and explore infinite possibilities. What would you do if you knew you couldn't fail? Just imagine. Available now. A Canryn Production.",
      description: 'Unlock your creative potential and explore infinite possibilities.',
      bookLink: '/rrb/books',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 5,
      title: 'It Animal Poetry Time',
      bookTitle: 'It Animal Poetry Time',
      duration: 30,
      audioUrl: '/audio/commercials/animal-poetry-commercial.wav',
      script: "It's Animal Poetry Time! Poetry that celebrates the beauty and wisdom of our natural world. From the eagle's flight to the whale's song, discover nature through verse. Perfect for all ages. Available now. A Canryn Production.",
      description: 'Poetry that celebrates the beauty and wisdom of our natural world.',
      bookLink: '/rrb/books',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 6,
      title: 'King Richard and I',
      bookTitle: 'King Richard and I',
      duration: 45,
      audioUrl: '/audio/commercials/king-richard-commercial.wav',
      script: "King Richard and I — the untold story of a legendary partnership that changed music history. Seabrun Candy Hunter and Little Richard — two voices, one legacy. The story you've never heard, told by the one who lived it. Available now. A Canryn Production.",
      description: 'The untold story of a legendary partnership that changed music history.',
      bookLink: '/rrb/books',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 7,
      title: 'All About Candy',
      bookTitle: 'All About Candy',
      duration: 30,
      audioUrl: '/audio/commercials/all-about-candy-commercial.wav',
      script: "All About Candy — the personal memoir behind the legacy. Get to know the man, the music, and the mission. All About Candy. Available now. A Canryn Production.",
      description: 'The personal memoir behind the legacy.',
      bookLink: '/rrb/books',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 8,
      title: 'Drawn to Danger',
      bookTitle: 'Drawn to Danger',
      duration: 45,
      audioUrl: '/audio/commercials/drawn-to-danger-commercial.wav',
      script: "Drawn to Danger — stories of risk, courage, and transformation. When life pulls you toward the edge, what do you do? You face it. Drawn to Danger. Available now. A Canryn Production.",
      description: 'Stories of risk, courage, and transformation.',
      bookLink: '/rrb/books',
      playCount: 0,
      clickCount: 0,
      seasonal: true,
      seasonalPeriod: 'New Year Campaign'
    },
    {
      id: 9,
      title: 'RRB Ecosystem Explainer',
      bookTitle: 'The Complete Canryn Production Platform',
      duration: 30,
      audioUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/cfWvEqBGZbBnvEIe.mp4',
      script: "Welcome to the Rockin' Rockin' Boogie ecosystem — a Canryn Production. Five platforms. One autonomous brain. QUMUS coordinates everything.",
      description: 'Five platforms. One autonomous brain. QUMUS coordinates everything — from radio broadcasting to emergency communication, from charitable giving to entertainment. A Canryn Production.',
      bookLink: '/',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 10,
      title: 'RRB Radio — 7 Channels 24/7',
      bookTitle: 'Seven Channels of Legacy',
      duration: 30,
      audioUrl: '/audio/commercials/rrb-7channel.wav',
      script: "Seven channels. Twenty-four hours a day. Seven days a week. RRB Radio brings you the sound of a legacy restored — from classic funk and soul to gospel, R&B, jazz, and the original recordings of Seabrun Candy Hunter. Every channel curated by QUMUS autonomous intelligence. Tune in now at rockinrockinboogie.com.",
      description: 'Seven channels. Twenty-four seven. From classic funk and soul to gospel, R&B, jazz, and the original recordings of Seabrun Candy Hunter. Every channel curated by QUMUS.',
      bookLink: '/rrb/radio-station',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 11,
      title: 'QUMUS — The Brain Behind the Boogie',
      bookTitle: 'Autonomous Intelligence',
      duration: 30,
      audioUrl: '/audio/commercials/qumus-brain.wav',
      script: "QUMUS — the autonomous brain behind it all. Ninety percent autonomous. Ten percent human oversight. QUMUS manages radio scheduling, podcast distribution, commercial rotation, emergency broadcasting, and real-time analytics. The future of media is autonomous. The future is QUMUS. A Canryn Production.",
      description: 'Ninety percent autonomous. Ten percent human oversight. QUMUS manages radio scheduling, podcast distribution, commercial rotation, emergency broadcasting, and real-time analytics.',
      bookLink: '/rrb/ecosystem',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 12,
      title: 'RRB Podcast Network',
      bookTitle: 'Stories That Matter',
      duration: 30,
      audioUrl: '/audio/commercials/podcast-network.wav',
      script: "The RRB Podcast Network — stories that matter. Dive deep into the untold history of Seabrun Candy Hunter. Video participation, live call-ins, and QUMUS AI-powered episode recommendations. Subscribe now. A Canryn Production.",
      description: 'Dive deep into the untold history of Seabrun Candy Hunter. Video participation, live call-ins, and QUMUS AI-powered episode recommendations.',
      bookLink: '/rrb/podcasts',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 13,
      title: 'Call In Live — Your Voice on RRB',
      bookTitle: 'Live Audience Interaction',
      duration: 25,
      audioUrl: '/audio/commercials/callin-promo.wav',
      script: "Your voice matters. Call in live to RRB Radio. Join by video — Skype, Zoom, Google Meet, or right from your browser. Call in by phone. Send a voice message. Be part of the conversation. A Canryn Production.",
      description: 'Join by video — Skype, Zoom, Google Meet, or right from your browser. Call in by phone. Send a voice message. Be part of the conversation.',
      bookLink: '/rrb/radio-station',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 14,
      title: 'The Legacy of Seabrun Candy Hunter',
      bookTitle: 'Legacy Restored, Legacy Continued',
      duration: 30,
      audioUrl: '/audio/commercials/seabrun-legacy.wav',
      script: "Before the world knew rock and roll, there was Seabrun Candy Hunter. A voice that shaped an era. A talent that inspired legends. The legacy restored. The legacy continued. Explore the Proof Vault at rockinrockinboogie.com. A Canryn Production.",
      description: 'Before the world knew rock and roll, there was Seabrun Candy Hunter. A voice that shaped an era. A talent that inspired legends. Explore the Proof Vault.',
      bookLink: '/rrb/the-legacy',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 15,
      title: 'Healing Frequencies — Solfeggio Therapy',
      bookTitle: 'Find Your Frequency',
      duration: 30,
      audioUrl: '/audio/commercials/healing-frequencies.wav',
      script: "Find your frequency. Ancient Solfeggio tones for relaxation, focus, and spiritual alignment. Three ninety-six hertz for liberation. Five twenty-eight hertz for transformation. Eight fifty-two hertz for awakening. Stream twenty-four seven on RRB Radio. A Canryn Production.",
      description: 'Ancient Solfeggio tones for relaxation, focus, and spiritual alignment. 396Hz liberation. 528Hz transformation. 852Hz awakening. Stream 24/7.',
      bookLink: '/rrb/healing-frequencies',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 16,
      title: 'The Proof Vault',
      bookTitle: 'Archival Documentation',
      duration: 25,
      audioUrl: '/audio/commercials/proof-vault.wav',
      script: "The Proof Vault — original recordings, legal documents, photographs, and historical evidence preserving the legacy. Every document authenticated. Every recording preserved. The truth is in the vault. Visit rockinrockinboogie.com. A Canryn Production.",
      description: 'Original recordings, legal documents, photographs, and historical evidence preserving the legacy. Every document authenticated. Every recording preserved.',
      bookLink: '/rrb/proof-vault',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 17,
      title: 'RRB Merchandise — Wear the Legacy',
      bookTitle: 'Official Merchandise',
      duration: 25,
      audioUrl: '/audio/commercials/merch-shop.wav',
      script: "Wear the legacy. RRB Merchandise — t-shirts, hoodies, hats, and exclusive collectibles. Every purchase supports the Sweet Miracles Foundation. Limited edition drops. Shop now at rockinrockinboogie.com. A Canryn Production.",
      description: 'T-shirts, hoodies, hats, and exclusive collectibles. Every purchase supports the Sweet Miracles Foundation. Limited edition drops.',
      bookLink: '/rrb/merchandise',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 18,
      title: 'Sweet Miracles — Tax-Deductible Giving',
      bookTitle: '501(c)(3) / 508(c) Nonprofit',
      duration: 30,
      audioUrl: '/audio/commercials/donate-501c.wav',
      script: "Every voice deserves to be heard. The Sweet Miracles Foundation — a five oh one c three and five oh eight c nonprofit. Your donation is fully tax-deductible. Every dollar goes to emergency communication tools, community wellness programs, and crisis support. Donate today. A Voice for the Voiceless.",
      description: 'Your donation is fully tax-deductible. Every dollar goes to emergency communication tools, community wellness programs, and crisis support.',
      bookLink: '/rrb/sweet-miracles',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 19,
      title: 'HybridCast Emergency Broadcast',
      bookTitle: 'When Every Second Counts',
      duration: 25,
      audioUrl: '/audio/commercials/hybridcast-promo.wav',
      script: "Are you prepared? HybridCast Emergency Broadcast keeps you connected when it matters most. Offline-first mesh networking — your device becomes part of a resilient communication network, even without internet or cell service. Download HybridCast today. When every second counts. A Canryn Production.",
      description: 'Offline-first mesh networking keeps you connected when it matters most. Your device becomes part of a resilient communication network.',
      bookLink: '/hybridcast',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 20,
      title: 'RRB Studio Suite',
      bookTitle: 'Create, Produce, Broadcast',
      duration: 30,
      audioUrl: '/audio/commercials/studio-suite.wav',
      script: "RRB Studio Suite — create, produce, broadcast. Audio production tools, content scheduling, commercial generation, and direct broadcast to seven radio channels. Let QUMUS handle the rest. The studio is open. A Canryn Production.",
      description: 'Audio production tools, content scheduling, commercial generation, and direct broadcast to seven radio channels. Let QUMUS handle the rest.',
      bookLink: '/rrb/studio',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 21,
      title: 'QMunity — Join the Movement',
      bookTitle: 'Community Powered by QUMUS',
      duration: 25,
      audioUrl: '/audio/commercials/qmunity.wav',
      script: "QMunity — join the movement. Connect with fellow music lovers, legacy supporters, and community builders. Share your story. Discover new music. Join free at rockinrockinboogie.com. A Canryn Production.",
      description: 'Connect with fellow music lovers, legacy supporters, and community builders. Share your story. Discover new music. Join free.',
      bookLink: '/rrb/community',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 22,
      title: 'Advertise on RRB Radio',
      bookTitle: 'Reach Our Audience',
      duration: 30,
      audioUrl: '/audio/commercials/advertise-with-us.wav',
      script: "Advertise on RRB Radio. Thirty, sixty, or ninety-second spots. AI-generated scripts. Professional voice production. Reach engaged listeners who care about community and culture. Contact us at rockinrockinboogie.com. A Canryn Production.",
      description: 'Thirty, sixty, or ninety-second spots. AI-generated scripts. Professional voice production. Reach engaged listeners who care about community and culture.',
      bookLink: '/rrb/advertising',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 23,
      title: 'Solbones 4+3+2 — Sacred Math',
      bookTitle: 'The Sacred Dice Game',
      duration: 25,
      audioUrl: '/audio/commercials/solbones-promo.wav',
      script: "Ready to roll? Solbones four plus three plus two — the sacred math dice game. Solfeggio healing frequencies meet multiplayer competition. Play solo, challenge friends, or face QUMUS AI opponents. Every roll resonates with ancient frequencies. Play now at rockinrockinboogie.com. A Canryn Production.",
      description: 'Solfeggio healing frequencies meet multiplayer competition. Play solo, challenge friends, or face QUMUS AI opponents. Every roll resonates with ancient frequencies.',
      bookLink: '/solbones',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 24,
      title: 'RRB Mobile — Take the Boogie Everywhere',
      bookTitle: 'Works on Every Device',
      duration: 25,
      audioUrl: '/audio/commercials/mobile-pwa.wav',
      script: "Take the boogie everywhere. RRB Mobile works on every device — phone, tablet, desktop, smart TV. Install as an app from your browser. Stream radio. Listen to podcasts. Play Solbones. Chat with QUMUS. The boogie never stops. A Canryn Production.",
      description: 'Phone, tablet, desktop, smart TV. Install as an app from your browser. Stream radio. Listen to podcasts. Play Solbones. Chat with QUMUS.',
      bookLink: '/',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 25,
      title: "Sean's Music",
      bookTitle: "Sean's Music - Music Production & Recording",
      duration: 30,
      audioUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/IamuJPuONwVFErdS.wav',
      script: "Sean's Music - founded by Seabrun Candy Hunter, operated by Sean Hunter. Professional music production and recording services. From composition to mastering, we bring your vision to life. Contact Sean's Music at rockinrockinboogie.com. A Canryn Production.",
      description: "Music Production & Recording - Founded by Seabrun Candy Hunter, Operated by Sean Hunter",
      bookLink: '/rrb/seans-music',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 26,
      title: 'Jaelon Enterprises',
      bookTitle: 'Jaelon Enterprises - Business Development & Ventures',
      duration: 30,
      audioUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/dHgmXrfyaEkQvkkn.wav',
      script: "Jaelon Enterprises - founded by Seabrun Candy Hunter, operated by Jaelon Hunter. Strategic business development and venture partnerships. Growing the Canryn Production ecosystem. Learn more at rockinrockinboogie.com. A Canryn Production.",
      description: 'Business Development & Ventures - Founded by Seabrun Candy Hunter, Operated by Jaelon Hunter',
      bookLink: '/rrb/jaelon-enterprises',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 27,
      title: 'Little C Recording',
      bookTitle: 'Little C Recording - Youth & Education Initiatives',
      duration: 30,
      audioUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/SpdPIWKgjUAuIIBv.wav',
      script: "Little C Recording - founded by Seabrun Candy Hunter. Youth and education initiatives bringing music and creativity to the next generation. Mentorship, workshops, and recording opportunities. Join us at rockinrockinboogie.com. A Canryn Production.",
      description: 'Youth & Education Initiatives - Founded by Seabrun Candy Hunter',
      bookLink: '/rrb/little-c',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 28,
      title: 'Canryn Publishing Co.',
      bookTitle: 'Canryn Publishing Co. - Music Publishing & Rights Administration',
      duration: 30,
      audioUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/YTfWkRcDokGRCvGE.wav',
      script: "Canryn Publishing Company - founded by Seabrun Candy Hunter. Music publishing and rights administration for the modern era. Protecting artists. Maximizing royalties. Ensuring fair compensation. Learn more at rockinrockinboogie.com. A Canryn Production.",
      description: 'Music Publishing & Rights Administration - Founded by Seabrun Candy Hunter',
      bookLink: '/rrb/divisions',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 29,
      title: 'Seasha Distribution Co.',
      bookTitle: 'Seasha Distribution Co. - Physical & Digital Distribution',
      duration: 30,
      audioUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/CwvOeGLIrPEFwCLc.wav',
      script: "Seasha Distribution Company - founded by Seabrun Candy Hunter. Physical and digital distribution solutions for music and media. Getting your content to listeners worldwide. Partner with us at rockinrockinboogie.com. A Canryn Production.",
      description: 'Physical & Digital Distribution - Founded by Seabrun Candy Hunter',
      bookLink: '/rrb/divisions',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 30,
      title: "Anna's Promotion",
      bookTitle: "Anna's Promotion - Promotion & Marketing",
      duration: 30,
      audioUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/irDHZkZATjneTQXg.wav',
      script: "Anna's Promotion - founded by Anna Battle. Strategic promotion and marketing for artists and brands. Authentic storytelling. Real results. Reach your audience. Contact us at rockinrockinboogie.com. A Canryn Production.",
      description: 'Promotion & Marketing - Founded by Anna Battle',
      bookLink: '/rrb/anna-promotion',
      playCount: 0,
      clickCount: 0
    },
    {
      id: 31,
      title: 'Canryn Production Inc.',
      bookTitle: 'Canryn Production Inc. - The Parent Company',
      duration: 30,
      audioUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/YzalNImCfBbqgokl.wav',
      script: "Canryn Production Inc. - founded by Seabrun Candy Hunter. The unified ecosystem of platforms, services, and autonomous intelligence. Seven subsidiaries. One vision. The future of independent media. Learn more at rockinrockinboogie.com. A Canryn Production.",
      description: 'The Parent Company - Founded by Seabrun Candy Hunter',
      bookLink: '/rrb/divisions',
      playCount: 0,
      clickCount: 0
    }
  ];

  const currentCommercial = commercials[currentCommercialIndex];
  const hasRealAudio = isRealAudioUrl(currentCommercial.audioUrl);

  // Stop TTS
  const stopTTS = useCallback(() => {
    window.speechSynthesis?.cancel();
    ttsRef.current = null;
    if (ttsIntervalRef.current) {
      clearInterval(ttsIntervalRef.current);
      ttsIntervalRef.current = null;
    }
    setIsTTS(false);
  }, []);

  // Play via TTS
  const playTTS = useCallback((script: string, duration: number) => {
    stopTTS();
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    // Try to find a good voice
    const voices = window.speechSynthesis?.getVoices() || [];
    const preferred = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'))
      || voices.find(v => v.lang.startsWith('en-US'))
      || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;

    ttsRef.current = utterance;
    setIsTTS(true);
    setIsPlaying(true);
    setCurrentTime(0);

    // Simulate progress
    const startTime = Date.now();
    ttsIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setCurrentTime(elapsed);
    }, 200);

    utterance.onend = () => {
      setIsPlaying(false);
      setIsTTS(false);
      setCurrentTime(0);
      if (ttsIntervalRef.current) {
        clearInterval(ttsIntervalRef.current);
        ttsIntervalRef.current = null;
      }
      trackCommercialPlay(currentCommercial.id);
      if (autoRotate) handleNext();
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsTTS(false);
      if (ttsIntervalRef.current) {
        clearInterval(ttsIntervalRef.current);
        ttsIntervalRef.current = null;
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [currentCommercial.id, autoRotate]);

  const handlePlayPause = () => {
    if (hasRealAudio) {
      // Use HTML audio element for real audio files
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    } else {
      // Use TTS for commercials without real audio
      if (isPlaying) {
        stopTTS();
        setIsPlaying(false);
      } else {
        playTTS(currentCommercial.script, currentCommercial.duration);
      }
    }
  };

  const handleNext = useCallback(() => {
    stopTTS();
    if (audioRef.current) audioRef.current.pause();
    setCurrentCommercialIndex((prev) => (prev + 1) % commercials.length);
    setCurrentTime(0);
    setIsPlaying(false);
  }, [commercials.length, stopTTS]);

  const handlePrevious = () => {
    stopTTS();
    if (audioRef.current) audioRef.current.pause();
    setCurrentCommercialIndex((prev) => (prev - 1 + commercials.length) % commercials.length);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    trackCommercialPlay(currentCommercial.id);
    if (autoRotate) {
      setCurrentCommercialIndex((prev) => (prev + 1) % commercials.length);
      setCurrentTime(0);
    }
  };

  const trackCommercialPlay = (commercialId: number) => {
    setCommercialStats(prev => ({
      ...prev,
      [commercialId]: {
        plays: (prev[commercialId]?.plays || 0) + 1,
        clicks: prev[commercialId]?.clicks || 0
      }
    }));
  };

  const trackCommercialClick = (commercialId: number) => {
    setCommercialStats(prev => ({
      ...prev,
      [commercialId]: {
        plays: prev[commercialId]?.plays || 0,
        clicks: (prev[commercialId]?.clicks || 0) + 1
      }
    }));
  };

  // Auto-rotate commercials every 5 minutes
  useEffect(() => {
    if (autoRotate && !isPlaying) {
      rotationIntervalRef.current = setInterval(() => {
        setCurrentCommercialIndex((prev) => (prev + 1) % commercials.length);
        setCurrentTime(0);
        setIsPlaying(false);
      }, 300000); // 5 minutes
    }

    return () => {
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current);
      }
    };
  }, [autoRotate, isPlaying, commercials.length]);

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      stopTTS();
    };
  }, [stopTTS]);

  // Stop playback when commercial changes
  useEffect(() => {
    stopTTS();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentTime(0);
    setIsPlaying(false);
  }, [currentCommercialIndex, stopTTS]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min((currentTime / currentCommercial.duration) * 100, 100);

  // Calculate total stats
  const totalPlays = Object.values(commercialStats).reduce((sum, stat) => sum + stat.plays, 0);
  const totalClicks = Object.values(commercialStats).reduce((sum, stat) => sum + stat.clicks, 0);

  return (
    <section className="py-16 md:py-24 bg-card border-t border-border">
      <div className="container max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Volume2 className="w-8 h-8 text-accent" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">RRB Commercials</h2>
        </div>

        <p className="text-lg text-foreground/80 mb-8">
          Tune in to hear about Seabrun Candy Hunter's published works, the Canryn Production ecosystem, and the mission behind it all. Discover stories of legacy, inspiration, and transformation.
        </p>

        {/* Commercial Player */}
        <div className="bg-background border border-border rounded-lg p-8 mb-8">
          {/* Current Commercial Info */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{currentCommercial.title}</h3>
                <p className="text-accent font-semibold mb-3">{currentCommercial.bookTitle}</p>
                <div className="flex gap-2 flex-wrap">
                  {currentCommercial.seasonal && (
                    <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded inline-block">
                      {currentCommercial.seasonalPeriod}
                    </span>
                  )}
                  {!hasRealAudio && (
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded inline-flex items-center gap-1">
                      <Mic className="w-3 h-3" /> Voice Preview
                    </span>
                  )}
                </div>
              </div>
              <Button
                onClick={() => setShowAnalytics(!showAnalytics)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Button>
            </div>
            <p className="text-foreground/80 mb-4">{currentCommercial.description}</p>
          </div>

          {/* Audio Element (only used for real audio URLs) */}
          {hasRealAudio && (
            <audio
              ref={audioRef}
              src={currentCommercial.audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          )}

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-foreground/60">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(currentCommercial.duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              onClick={handlePrevious}
              variant="outline"
              size="icon"
              className="h-12 w-12"
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button
              onClick={handlePlayPause}
              className="bg-accent hover:bg-accent/90 text-accent-foreground h-14 w-14"
              size="icon"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>

            <Button
              onClick={handleNext}
              variant="outline"
              size="icon"
              className="h-12 w-12"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* TTS indicator when playing */}
          {isTTS && isPlaying && (
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <div className="flex gap-0.5">
                  <div className="w-1 h-3 bg-blue-400 rounded-full animate-pulse" />
                  <div className="w-1 h-4 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1 h-5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                  <div className="w-1 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
                <span className="text-xs text-blue-400">Voice Preview Playing</span>
              </div>
            </div>
          )}

          {/* Auto-Rotate Toggle */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              onClick={() => setAutoRotate(!autoRotate)}
              variant={autoRotate ? 'default' : 'outline'}
              size="sm"
              className={autoRotate ? 'bg-accent hover:bg-accent/90' : ''}
            >
              {autoRotate ? '🔄 Auto-Rotate ON' : '🔄 Auto-Rotate OFF'}
            </Button>
            <p className="text-xs text-foreground/60">
              {autoRotate ? 'Changes every 5 minutes' : 'Manual control'}
            </p>
          </div>

          {/* Commercial Counter */}
          <div className="text-center text-sm text-foreground/60 mb-6">
            Commercial {currentCommercialIndex + 1} of {commercials.length}
          </div>

          {/* Analytics Display */}
          {showAnalytics && (
            <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <h4 className="font-bold text-foreground mb-3">This Commercial Performance</h4>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-foreground/60 mb-1">Plays</p>
                  <p className="text-2xl font-bold text-accent">{commercialStats[currentCommercial.id]?.plays || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60 mb-1">Clicks</p>
                  <p className="text-2xl font-bold text-accent">{commercialStats[currentCommercial.id]?.clicks || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60 mb-1">Engagement</p>
                  <p className="text-2xl font-bold text-accent">
                    {commercialStats[currentCommercial.id]?.plays ? 
                      ((commercialStats[currentCommercial.id]?.clicks || 0) / commercialStats[currentCommercial.id]?.plays * 100).toFixed(1) 
                      : '0'}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Learn More Button */}
          <a href={currentCommercial.bookLink} onClick={() => trackCommercialClick(currentCommercial.id)}>
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              Learn More
            </Button>
          </a>
        </div>

        {/* Overall Analytics Summary */}
        {showAnalytics && (
          <div className="mb-8 p-6 bg-accent/10 border border-accent/20 rounded-lg">
            <h3 className="text-xl font-bold text-foreground mb-4">Overall Campaign Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-foreground/60 mb-2">Total Plays</p>
                <p className="text-3xl font-bold text-accent">{totalPlays}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60 mb-2">Total Clicks</p>
                <p className="text-3xl font-bold text-accent">{totalClicks}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60 mb-2">Overall Engagement</p>
                <p className="text-3xl font-bold text-accent">
                  {totalPlays ? ((totalClicks / totalPlays) * 100).toFixed(1) : '0'}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Commercial List */}
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">All Commercials ({commercials.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commercials.map((commercial, index) => (
              <button
                key={`commercial-${index}-${commercial.id}`}
                onClick={() => {
                  stopTTS();
                  if (audioRef.current) audioRef.current.pause();
                  setCurrentCommercialIndex(index);
                  setCurrentTime(0);
                  setIsPlaying(false);
                }}
                className={`p-4 rounded-lg border transition-all text-left ${
                  index === currentCommercialIndex
                    ? 'bg-accent/20 border-accent'
                    : 'bg-background border-border hover:border-accent/50'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-bold text-foreground">{commercial.title}</h4>
                  <div className="flex gap-1">
                    {commercial.seasonal && (
                      <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                        Seasonal
                      </span>
                    )}
                    {isRealAudioUrl(commercial.audioUrl) ? (
                      <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                        Audio
                      </span>
                    ) : (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                        Voice
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-foreground/70 mb-2">{commercial.bookTitle}</p>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-accent font-semibold">{commercial.duration} seconds</p>
                  {showAnalytics && (
                    <p className="text-xs text-foreground/60">
                      {commercialStats[commercial.id]?.plays || 0} plays
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* About Book Commercials */}
        <div className="mt-12 p-6 bg-accent/10 border border-accent/20 rounded-lg">
          <h3 className="text-lg font-bold text-foreground mb-3">About These Commercials</h3>
          <p className="text-foreground/80 mb-3">
            These radio commercials are designed to introduce listeners to Seabrun Candy Hunter's published works. Each commercial highlights a different book or series, showcasing the themes, inspiration, and impact of Candy's literary legacy.
          </p>
          <p className="text-foreground/80 mb-3">
            <strong>Voice Preview:</strong> Commercials marked with "Voice" use your device's text-to-speech engine to read the script aloud. Commercials with "Audio" play pre-recorded audio files.
          </p>
          <p className="text-foreground/80 mb-3">
            <strong>Auto-Rotation:</strong> Enable auto-rotate to automatically cycle through commercials every 5 minutes, simulating a real radio station experience.
          </p>
          <p className="text-foreground/80">
            <strong>Analytics:</strong> Track performance metrics to see which commercials resonate most with your audience. Whether you're interested in autobiography, poetry, spirituality, or philosophy, there's a book waiting for you.
          </p>
        </div>
      </div>
    </section>
  );
}
