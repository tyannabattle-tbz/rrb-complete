
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Radio, Volume2, VolumeX, Users, Music, Play, Pause, Zap, Activity, Clock, SkipForward, SkipBack, Mic2, Headphones, Calendar, BarChart3, Shield, Search, Filter, Heart, Waves, AlertTriangle, Earth, BookOpen, Sparkles, Sun, Moon, Coffee, Flame, TreePine, Baby, Laugh, Podcast, Tv, Star, ChevronDown, ChevronUp, MessageCircle, Send, Phone, PhoneOff, Bot, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

// ─── Channel Categories ─────────────────────
type ChannelCategory = 'all' | 'music' | 'healing' | 'talk' | 'community' | 'gospel' | 'culture' | 'wellness' | 'kids' | 'emergency' | 'special';

interface Channel {
  id: number;
  name: string;
  description: string;
  frequency: string;
  status: 'live' | 'scheduled' | 'standby';
  listeners: number;
  currentShow: string;
  nextShow: string;
  nextShowTime: string;
  qumusManaged: boolean;
  category: ChannelCategory;
  icon: string;
  streamUrl?: string;
  streamFallback?: string;
}

const CATEGORIES: { key: ChannelCategory; label: string; count?: number }[] = [
  { key: 'all', label: 'All Channels' },
  { key: 'music', label: 'Music' },
  { key: 'healing', label: 'Healing & Frequencies' },
  { key: 'gospel', label: 'Gospel & Worship' },
  { key: 'talk', label: 'Talk & Interview' },
  { key: 'community', label: 'Community' },
  { key: 'culture', label: 'Culture & Heritage' },
  { key: 'wellness', label: 'Wellness & Meditation' },
  { key: 'kids', label: 'Kids & Family' },
  { key: 'special', label: 'Special Programming' },
  { key: 'emergency', label: 'Emergency' },
];

// ─── 40+ QUMUS-Synchronized Channels ─────────────────────
const CHANNELS: Channel[] = [
  // ── MUSIC (10 channels) — Real SomaFM streams ──
  { id: 1, name: 'RRB Main', description: "Rockin' Rockin' Boogie — The flagship broadcast", frequency: '432 Hz', status: 'live', listeners: 342, currentShow: 'Top of the Sol Motivation Mix', nextShow: 'Afternoon Groove', nextShowTime: '2:00 PM', qumusManaged: true, category: 'music', icon: '🎵', streamUrl: 'https://ice5.somafm.com/groovesalad-128-mp3', streamFallback: 'https://ice3.somafm.com/groovesalad-128-mp3' },
  { id: 2, name: 'Soul & R&B Classics', description: 'Timeless soul, Motown, and classic R&B', frequency: '432 Hz', status: 'live', listeners: 198, currentShow: 'Classic Soul Hour', nextShow: 'Motown Memories', nextShowTime: '3:00 PM', qumusManaged: true, category: 'music', icon: '🎤', streamUrl: 'https://ice5.somafm.com/7soul-128-mp3', streamFallback: 'https://ice3.somafm.com/7soul-128-mp3' },
  { id: 3, name: 'Southern Blues', description: 'Deep South blues, Delta blues, and modern blues', frequency: '432 Hz', status: 'live', listeners: 134, currentShow: 'Delta Blues Session', nextShow: 'Blues After Dark', nextShowTime: '8:00 PM', qumusManaged: true, category: 'music', icon: '🎸', streamUrl: 'https://ice5.somafm.com/bootliquor-128-mp3', streamFallback: 'https://ice3.somafm.com/bootliquor-128-mp3' },
  { id: 4, name: 'Hip-Hop & Spoken Word', description: 'Conscious hip-hop, spoken word, and poetry', frequency: '432 Hz', status: 'live', listeners: 267, currentShow: 'Conscious Beats', nextShow: 'Poetry After Hours', nextShowTime: '9:00 PM', qumusManaged: true, category: 'music', icon: '🎙️', streamUrl: 'https://ice5.somafm.com/bagel-128-mp3', streamFallback: 'https://ice3.somafm.com/bagel-128-mp3' },
  { id: 5, name: 'Jazz Lounge', description: 'Smooth jazz, bebop, and jazz fusion', frequency: '432 Hz', status: 'live', listeners: 89, currentShow: 'Smooth Jazz Evening', nextShow: 'Late Night Bebop', nextShowTime: '10:00 PM', qumusManaged: true, category: 'music', icon: '🎷', streamUrl: 'https://ice5.somafm.com/fluid-128-mp3', streamFallback: 'https://ice3.somafm.com/fluid-128-mp3' },
  { id: 6, name: 'Reggae & Caribbean', description: 'Reggae, dancehall, soca, and island vibes', frequency: '432 Hz', status: 'live', listeners: 156, currentShow: 'Island Vibes', nextShow: 'Roots & Culture', nextShowTime: '4:00 PM', qumusManaged: true, category: 'music', icon: '🌴', streamUrl: 'https://ice5.somafm.com/suburbsofgoa-128-mp3', streamFallback: 'https://ice3.somafm.com/suburbsofgoa-128-mp3' },
  { id: 7, name: 'Afrobeats & World', description: 'Afrobeats, Afropop, and global rhythms', frequency: '432 Hz', status: 'live', listeners: 211, currentShow: 'Afrobeats Now', nextShow: 'World Rhythms', nextShowTime: '5:00 PM', qumusManaged: true, category: 'music', icon: '🌍', streamUrl: 'https://ice5.somafm.com/lush-128-mp3', streamFallback: 'https://ice3.somafm.com/lush-128-mp3' },
  { id: 8, name: 'Neo Soul & Indie', description: 'Neo soul, indie R&B, and alternative soul', frequency: '432 Hz', status: 'live', listeners: 143, currentShow: 'Neo Soul Sessions', nextShow: 'Indie Spotlight', nextShowTime: '6:00 PM', qumusManaged: true, category: 'music', icon: '✨', streamUrl: 'https://ice5.somafm.com/indiepop-128-mp3', streamFallback: 'https://ice3.somafm.com/indiepop-128-mp3' },
  { id: 9, name: 'Old School Funk', description: 'Funk, disco, and boogie classics', frequency: '432 Hz', status: 'live', listeners: 178, currentShow: 'Funk Factory', nextShow: 'Disco Nights', nextShowTime: '7:00 PM', qumusManaged: true, category: 'music', icon: '🕺', streamUrl: 'https://ice5.somafm.com/secretagent-128-mp3', streamFallback: 'https://ice3.somafm.com/secretagent-128-mp3' },
  { id: 10, name: 'Country & Folk Roots', description: 'Country, folk, and Americana roots music', frequency: '432 Hz', status: 'live', listeners: 67, currentShow: 'Country Roots', nextShow: 'Folk Stories', nextShowTime: '3:00 PM', qumusManaged: true, category: 'music', icon: '🤠', streamUrl: 'https://ice5.somafm.com/bootliquor-128-mp3', streamFallback: 'https://ice3.somafm.com/bootliquor-128-mp3' },

  // ── HEALING & FREQUENCIES (8 channels) ──
  { id: 11, name: '432 Hz Pure', description: 'Pure 432 Hz healing frequency — continuous', frequency: '432 Hz', status: 'live', listeners: 312, currentShow: '432 Hz Continuous Stream', nextShow: 'Always On', nextShowTime: '24/7', qumusManaged: true, category: 'healing', icon: '🔔' },
  { id: 12, name: '528 Hz Miracle Tone', description: 'DNA repair and transformation frequency', frequency: '528 Hz', status: 'live', listeners: 245, currentShow: '528 Hz Miracle Tone', nextShow: 'Always On', nextShowTime: '24/7', qumusManaged: true, category: 'healing', icon: '💎' },
  { id: 13, name: '396 Hz Liberation', description: 'Liberating guilt and fear frequency', frequency: '396 Hz', status: 'live', listeners: 134, currentShow: '396 Hz Liberation Stream', nextShow: 'Always On', nextShowTime: '24/7', qumusManaged: true, category: 'healing', icon: '🦋' },
  { id: 14, name: '639 Hz Connection', description: 'Harmonizing relationships frequency', frequency: '639 Hz', status: 'live', listeners: 98, currentShow: '639 Hz Connection Stream', nextShow: 'Always On', nextShowTime: '24/7', qumusManaged: true, category: 'healing', icon: '💞' },
  { id: 15, name: '741 Hz Awakening', description: 'Awakening intuition frequency', frequency: '741 Hz', status: 'live', listeners: 87, currentShow: '741 Hz Awakening Stream', nextShow: 'Always On', nextShowTime: '24/7', qumusManaged: true, category: 'healing', icon: '👁️' },
  { id: 16, name: '852 Hz Spiritual', description: 'Returning to spiritual order', frequency: '852 Hz', status: 'live', listeners: 76, currentShow: '852 Hz Spiritual Stream', nextShow: 'Always On', nextShowTime: '24/7', qumusManaged: true, category: 'healing', icon: '🙏' },
  { id: 17, name: '963 Hz Divine', description: 'Frequency of the divine — pineal gland activation', frequency: '963 Hz', status: 'live', listeners: 167, currentShow: '963 Hz Divine Stream', nextShow: 'Always On', nextShowTime: '24/7', qumusManaged: true, category: 'healing', icon: '👑' },
  { id: 18, name: 'Solfeggio Mix', description: 'Rotating Solfeggio frequencies — QUMUS curated', frequency: 'Multi-Hz', status: 'live', listeners: 201, currentShow: 'QUMUS Solfeggio Rotation', nextShow: 'Evening Sequence', nextShowTime: '6:00 PM', qumusManaged: true, category: 'healing', icon: '🎶' },

  // ── GOSPEL & WORSHIP (5 channels) — Real streams ──
  { id: 19, name: 'Gospel Hour', description: 'Traditional and contemporary gospel', frequency: '432 Hz', status: 'live', listeners: 289, currentShow: 'Morning Gospel Praise', nextShow: 'Gospel Classics', nextShowTime: '12:00 PM', qumusManaged: true, category: 'gospel', icon: '⛪', streamUrl: 'https://ice5.somafm.com/groovesalad-128-mp3', streamFallback: 'https://ice3.somafm.com/groovesalad-128-mp3' },
  { id: 20, name: 'Praise & Worship', description: 'Continuous praise and worship music', frequency: '432 Hz', status: 'live', listeners: 234, currentShow: 'Worship Flow', nextShow: 'Evening Praise', nextShowTime: '6:00 PM', qumusManaged: true, category: 'gospel', icon: '🙌', streamUrl: 'https://ice5.somafm.com/groovesalad-128-mp3', streamFallback: 'https://ice3.somafm.com/groovesalad-128-mp3' },
  { id: 21, name: 'Sunday Service', description: 'Live church services and sermons', frequency: '432 Hz', status: 'scheduled', listeners: 0, currentShow: 'Off Air', nextShow: 'Sunday Morning Service', nextShowTime: 'Sunday 9 AM', qumusManaged: true, category: 'gospel', icon: '📖' },
  { id: 22, name: 'Hymns & Spirituals', description: 'Traditional hymns and Negro spirituals', frequency: '432 Hz', status: 'live', listeners: 145, currentShow: 'Spiritual Heritage', nextShow: 'Hymn Hour', nextShowTime: '4:00 PM', qumusManaged: true, category: 'gospel', icon: '🕊️', streamUrl: 'https://ice5.somafm.com/groovesalad-128-mp3', streamFallback: 'https://ice3.somafm.com/groovesalad-128-mp3' },
  { id: 23, name: 'Gospel Choir', description: 'Choir performances and mass choirs', frequency: '432 Hz', status: 'live', listeners: 178, currentShow: 'Mass Choir Celebration', nextShow: 'Youth Choir Hour', nextShowTime: '5:00 PM', qumusManaged: true, category: 'gospel', icon: '🎹', streamUrl: 'https://ice5.somafm.com/groovesalad-128-mp3', streamFallback: 'https://ice3.somafm.com/groovesalad-128-mp3' },

  // ── TALK & INTERVIEW (5 channels) ──
  { id: 24, name: "Candy's Corner", description: 'Strategic wisdom from the Guardian AI — guest interviews', frequency: '432 Hz', status: 'live', listeners: 187, currentShow: "Candy's Corner Live", nextShow: 'Guest Interview', nextShowTime: '8:00 PM', qumusManaged: true, category: 'talk', icon: '🎙️' },
  { id: 25, name: 'Civil Rights Now', description: 'Current civil rights issues, advocacy, and action', frequency: 'Standard', status: 'live', listeners: 156, currentShow: 'Rights & Justice Today', nextShow: 'Advocacy Hour', nextShowTime: '2:00 PM', qumusManaged: true, category: 'talk', icon: '✊' },
  { id: 26, name: 'Business & Innovation', description: 'Black business, entrepreneurship, and tech', frequency: 'Standard', status: 'live', listeners: 123, currentShow: 'Black Business Spotlight', nextShow: 'Tech Talk', nextShowTime: '3:00 PM', qumusManaged: true, category: 'talk', icon: '💼' },
  { id: 27, name: 'Legal Talk', description: 'Know your rights — legal education and advocacy', frequency: 'Standard', status: 'live', listeners: 98, currentShow: 'Know Your Rights', nextShow: 'Legal Q&A', nextShowTime: '4:00 PM', qumusManaged: true, category: 'talk', icon: '⚖️' },
  { id: 28, name: 'Veterans Voice', description: 'Military veterans stories, support, and resources', frequency: 'Standard', status: 'live', listeners: 112, currentShow: 'Veterans Connect', nextShow: 'Service Stories', nextShowTime: '5:00 PM', qumusManaged: true, category: 'talk', icon: '🎖️' },

  // ── COMMUNITY (4 channels) ──
  { id: 29, name: 'Community Spotlight', description: 'Voices from the community — stories that matter', frequency: 'Standard', status: 'live', listeners: 167, currentShow: 'Community Voices Hour', nextShow: 'Local Heroes', nextShowTime: '3:00 PM', qumusManaged: true, category: 'community', icon: '🏘️' },
  { id: 30, name: 'Selma & Alabama', description: 'Local Selma and Alabama community news and events', frequency: 'Standard', status: 'live', listeners: 234, currentShow: 'Selma Today', nextShow: 'Alabama Roundup', nextShowTime: '5:00 PM', qumusManaged: true, category: 'community', icon: '🏛️' },
  { id: 31, name: 'Sweet Miracles', description: 'Nonprofit updates, donations, and community support', frequency: 'Standard', status: 'live', listeners: 89, currentShow: 'Miracles in Action', nextShow: 'Donor Spotlight', nextShowTime: '4:00 PM', qumusManaged: true, category: 'community', icon: '💝' },
  { id: 32, name: 'SQUADD Goals', description: 'Sisters Questing Unapologetically After Divine Destiny', frequency: 'Standard', status: 'live', listeners: 145, currentShow: 'SQUADD Goals Live', nextShow: 'Women Rising', nextShowTime: '6:00 PM', qumusManaged: true, category: 'community', icon: '👑' },

  // ── CULTURE & HERITAGE (4 channels) ──
  { id: 33, name: 'Black History', description: 'Black history, heritage, and legacy preservation', frequency: '432 Hz', status: 'live', listeners: 198, currentShow: 'History Makers', nextShow: 'Legacy Stories', nextShowTime: '4:00 PM', qumusManaged: true, category: 'culture', icon: '📜' },
  { id: 34, name: 'African Diaspora', description: 'Connecting the African diaspora worldwide', frequency: '432 Hz', status: 'live', listeners: 134, currentShow: 'Diaspora Connect', nextShow: 'Global Voices', nextShowTime: '5:00 PM', qumusManaged: true, category: 'culture', icon: '🌍' },
  { id: 35, name: 'Canryn Legacy', description: 'The Canryn Production story — family, music, mission', frequency: '432 Hz', status: 'live', listeners: 167, currentShow: 'The Canryn Story', nextShow: 'Family Legacy Hour', nextShowTime: '7:00 PM', qumusManaged: true, category: 'culture', icon: '🏆' },
  { id: 36, name: 'Southern Roots', description: 'Southern culture, food, traditions, and storytelling', frequency: 'Standard', status: 'live', listeners: 112, currentShow: 'Southern Stories', nextShow: 'Grits & Greens Hour', nextShowTime: '6:00 PM', qumusManaged: true, category: 'culture', icon: '🌿' },

  // ── WELLNESS & MEDITATION (3 channels) — Real ambient streams ──
  { id: 37, name: 'Morning Meditation', description: 'Guided morning meditation and mindfulness', frequency: '432 Hz', status: 'live', listeners: 178, currentShow: 'Sunrise Meditation', nextShow: 'Midday Mindfulness', nextShowTime: '12:00 PM', qumusManaged: true, category: 'wellness', icon: '🧘', streamUrl: 'https://ice5.somafm.com/dronezone-128-mp3', streamFallback: 'https://ice3.somafm.com/dronezone-128-mp3' },
  { id: 38, name: 'Sleep & Rest', description: 'Sleep sounds, ASMR, and rest frequencies', frequency: '432 Hz', status: 'live', listeners: 234, currentShow: 'Deep Sleep Frequencies', nextShow: 'Night Sounds', nextShowTime: '10:00 PM', qumusManaged: true, category: 'wellness', icon: '🌙', streamUrl: 'https://ice5.somafm.com/deepspaceone-128-mp3', streamFallback: 'https://ice3.somafm.com/deepspaceone-128-mp3' },
  { id: 39, name: 'Nature Sounds', description: 'Rain, ocean, forest, and nature ambience', frequency: 'Natural', status: 'live', listeners: 156, currentShow: 'Ocean Waves', nextShow: 'Forest Rain', nextShowTime: '3:00 PM', qumusManaged: true, category: 'wellness', icon: '🌊', streamUrl: 'https://ice5.somafm.com/dronezone-128-mp3', streamFallback: 'https://ice3.somafm.com/dronezone-128-mp3' },

  // ── KIDS & FAMILY (2 channels) ──
  { id: 40, name: 'Kids Kingdom', description: 'Educational and fun content for children', frequency: '432 Hz', status: 'live', listeners: 89, currentShow: 'Story Time', nextShow: 'Music & Learning', nextShowTime: '2:00 PM', qumusManaged: true, category: 'kids', icon: '🧒' },
  { id: 41, name: 'Family Hour', description: 'Family-friendly programming for all ages', frequency: '432 Hz', status: 'live', listeners: 123, currentShow: 'Family Fun Hour', nextShow: 'Game Time', nextShowTime: '4:00 PM', qumusManaged: true, category: 'kids', icon: '👨‍👩‍👧‍👦' },

  // ── SPECIAL PROGRAMMING (2 channels) ──
  { id: 42, name: 'Live Events', description: 'Live broadcasts from events and concerts', frequency: 'Variable', status: 'scheduled', listeners: 0, currentShow: 'Off Air', nextShow: 'Selma Jubilee Live', nextShowTime: 'Mar 7', qumusManaged: true, category: 'special', icon: '📡' },
  { id: 43, name: 'Documentary Radio', description: "Candy's Story and other documentary series", frequency: '432 Hz', status: 'scheduled', listeners: 0, currentShow: 'Off Air', nextShow: "Candy's Story Pt. 1", nextShowTime: 'Coming Soon', qumusManaged: true, category: 'special', icon: '🎬' },

  // ── EMERGENCY (1 channel) ──
  { id: 44, name: 'Emergency Broadcast', description: 'HybridCast integration — always ready', frequency: 'Multi-Band', status: 'standby', listeners: 0, currentShow: 'Standby Mode', nextShow: 'Activated on Alert', nextShowTime: 'On Demand', qumusManaged: true, category: 'emergency', icon: '🚨' },

  // ── OPERATOR CHANNELS (3 channels) — Canryn Production entities ──
  { id: 45, name: 'Canryn Productions', description: 'Official Canryn Production content — corporate broadcasts', frequency: '432 Hz', status: 'live', listeners: 78, currentShow: 'Canryn Weekly Update', nextShow: 'Production Notes', nextShowTime: '5:00 PM', qumusManaged: true, category: 'community', icon: '🎬' },
  { id: 46, name: 'Proof Vault Radio', description: 'Evidence and documentation broadcasts — legacy preservation', frequency: '432 Hz', status: 'live', listeners: 56, currentShow: 'Evidence Review', nextShow: 'Archive Deep Dive', nextShowTime: '7:00 PM', qumusManaged: true, category: 'culture', icon: '🔐' },
  { id: 47, name: 'QMunity Voices', description: 'Community-submitted content and grassroots stories', frequency: '432 Hz', status: 'live', listeners: 134, currentShow: 'QMunity Hour', nextShow: 'Grassroots Stories', nextShowTime: '6:00 PM', qumusManaged: true, category: 'community', icon: '👥' },

  // ── STREAM CHANNELS (3 channels) — Focus, Ambient, Productivity ──
  { id: 48, name: 'Focus & Productivity', description: 'Concentration-enhancing frequencies and ambient focus music', frequency: '741 Hz', status: 'live', listeners: 189, currentShow: 'Deep Focus Session', nextShow: 'Productivity Flow', nextShowTime: '24/7', qumusManaged: true, category: 'wellness', icon: '🎯', streamUrl: 'https://ice5.somafm.com/groovesalad-128-mp3', streamFallback: 'https://ice3.somafm.com/groovesalad-128-mp3' },
  { id: 49, name: 'Ambient Soundscapes', description: 'Atmospheric ambient textures and sonic landscapes', frequency: '432 Hz', status: 'live', listeners: 145, currentShow: 'Sonic Landscapes', nextShow: 'Atmospheric Drift', nextShowTime: '24/7', qumusManaged: true, category: 'wellness', icon: '🌿', streamUrl: 'https://ice5.somafm.com/dronezone-128-mp3', streamFallback: 'https://ice3.somafm.com/dronezone-128-mp3' },
  { id: 50, name: 'Conference & Summit', description: 'Live conference coverage, summits, and keynote broadcasts', frequency: 'Standard', status: 'scheduled', listeners: 0, currentShow: 'Off Air', nextShow: 'Next Summit TBA', nextShowTime: 'Coming Soon', qumusManaged: true, category: 'special', icon: '🎓' },
];

const SCHEDULE = [
  { time: '5:00 AM', show: 'Sunrise Meditation', channel: 'Wellness', qumusScheduled: true },
  { time: '6:00 AM', show: 'Top of the Sol Motivation Mix', channel: 'RRB Main', qumusScheduled: true },
  { time: '7:00 AM', show: 'Morning Gospel Praise', channel: 'Gospel', qumusScheduled: true },
  { time: '8:00 AM', show: 'Community Voices Hour', channel: 'Community', qumusScheduled: true },
  { time: '9:00 AM', show: 'Story Time', channel: 'Kids Kingdom', qumusScheduled: true },
  { time: '10:00 AM', show: 'Selma Jubilee Live (Mar 7)', channel: 'Live Events', qumusScheduled: true },
  { time: '11:00 AM', show: 'Know Your Rights', channel: 'Legal Talk', qumusScheduled: true },
  { time: '12:00 PM', show: 'Midday Community Update', channel: 'Community', qumusScheduled: true },
  { time: '1:00 PM', show: 'Afrobeats Now', channel: 'Afrobeats', qumusScheduled: true },
  { time: '2:00 PM', show: 'QUMUS Solfeggio Rotation', channel: 'Healing', qumusScheduled: true },
  { time: '3:00 PM', show: 'Black Business Spotlight', channel: 'Business', qumusScheduled: true },
  { time: '4:00 PM', show: 'Afternoon Groove', channel: 'RRB Main', qumusScheduled: true },
  { time: '5:00 PM', show: 'Veterans Connect', channel: 'Veterans', qumusScheduled: true },
  { time: '6:00 PM', show: 'SQUADD Goals Live', channel: 'SQUADD', qumusScheduled: true },
  { time: '7:00 PM', show: 'The Canryn Story', channel: 'Legacy', qumusScheduled: true },
  { time: '8:00 PM', show: "Candy's Corner Live", channel: "Candy's Corner", qumusScheduled: true },
  { time: '9:00 PM', show: 'Late Night Blues', channel: 'Blues', qumusScheduled: true },
  { time: '10:00 PM', show: 'Deep Sleep Frequencies', channel: 'Sleep', qumusScheduled: true },
];

const VALANNA_AVATAR = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/valanna-avatar-mYpqZPJmy73yGwB7kFmCe9.webp';
const CANDY_AVATAR = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/candy-avatar_4d4d3bc0.png';

export default function RRBPort3001() {
  const [, setLocation] = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChannel, setActiveChannel] = useState<number | null>(null);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [totalListeners, setTotalListeners] = useState(0);
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ChannelCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllChannels, setShowAllChannels] = useState(false);
  const [showTuner, setShowTuner] = useState(false);
  const [tunerFrequency, setTunerFrequency] = useState(432);
  const [tunerPlaying, setTunerPlaying] = useState(false);
  const [tunerVolume, setTunerVolume] = useState(40);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [streamHealth, setStreamHealth] = useState<'connected' | 'connecting' | 'error' | 'idle'>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ─── AI DJ & Interactive Features ─────────────────────
  const [showAiDj, setShowAiDj] = useState(false);
  const [aiDjMessages, setAiDjMessages] = useState<Array<{role: 'user' | 'valanna' | 'candy' | 'seraph' | 'system'; text: string; timestamp: Date}>>([]);
  const [aiDjInput, setAiDjInput] = useState('');
  const [aiDjLoading, setAiDjLoading] = useState(false);
  const [activeAiHost, setActiveAiHost] = useState<'valanna' | 'candy' | 'seraph'>('valanna');
  const [showCallIn, setShowCallIn] = useState(false);
  const [callInActive, setCallInActive] = useState(false);
  const [songRequestInput, setSongRequestInput] = useState('');
  const aiChatRef = useRef<HTMLDivElement | null>(null);

  // AI Chat mutation
  const aiChatMutation = trpc.valanna?.chat?.useMutation ? trpc.valanna.chat.useMutation() : null;

  const AI_HOSTS = {
    valanna: { name: 'Valanna', avatar: VALANNA_AVATAR, color: 'amber', role: 'AI DJ & Operations', greeting: 'Hey baby, you\'re tuned in to RRB. What can I play for you?' },
    candy: { name: 'Candy', avatar: CANDY_AVATAR, color: 'blue', role: 'Guardian & Co-Host', greeting: 'What\'s good, family? Candy here. Let me know what you need.' },
    seraph: { name: 'Seraph', avatar: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/seraph-avatar-v2-4cBZycZ6qyGjmCjzjWUMUo.webp', color: 'violet', role: 'System Intelligence', greeting: 'Seraph online. I can analyze listening patterns, optimize scheduling, or provide system insights.' },
  };

  const sendAiMessage = async () => {
    if (!aiDjInput.trim() || aiDjLoading) return;
    const userMsg = aiDjInput.trim();
    setAiDjInput('');
    setAiDjMessages(prev => [...prev, { role: 'user', text: userMsg, timestamp: new Date() }]);
    setAiDjLoading(true);

    // Determine which AI responds
    const lower = userMsg.toLowerCase();
    let responder = activeAiHost;
    if (/candy|seabrun|hunter/i.test(lower)) responder = 'candy';
    if (/valanna|val\b/i.test(lower)) responder = 'valanna';
    if (/seraph|system|analytics|pattern/i.test(lower)) responder = 'seraph';

    try {
      if (aiChatMutation) {
        const result = await aiChatMutation.mutateAsync({ message: userMsg });
        setAiDjMessages(prev => [...prev, { role: responder, text: result?.response || 'I hear you. Let me work on that.', timestamp: new Date() }]);
      } else {
        // Fallback: contextual AI responses
        const responses = getContextualResponse(userMsg, responder);
        setAiDjMessages(prev => [...prev, { role: responder, text: responses, timestamp: new Date() }]);
      }
    } catch {
      const responses = getContextualResponse(userMsg, responder);
      setAiDjMessages(prev => [...prev, { role: responder, text: responses, timestamp: new Date() }]);
    }
    setAiDjLoading(false);
    setTimeout(() => aiChatRef.current?.scrollTo({ top: aiChatRef.current.scrollHeight, behavior: 'smooth' }), 100);
  };

  const getContextualResponse = (msg: string, host: 'valanna' | 'candy' | 'seraph'): string => {
    const lower = msg.toLowerCase();
    const currentCh = activeChannelData;
    if (/play|request|song|music/i.test(lower)) {
      if (host === 'valanna') return `I got you, baby. Let me queue that up on ${currentCh?.name || 'RRB Main'}. QUMUS is scheduling it into the next rotation. Keep listening.`;
      if (host === 'candy') return `Good taste. I\'ll make sure that gets into the rotation. That\'s the kind of music that builds something real.`;
      return `Song request logged. QUMUS Content Scheduling policy will optimize placement based on current listener engagement patterns across ${CHANNELS.length} channels.`;
    }
    if (/schedule|what.*on|lineup|program/i.test(lower)) {
      if (host === 'valanna') return `Right now we\'ve got ${currentCh?.currentShow || 'live programming'} on ${currentCh?.name || 'RRB Main'}. Coming up next: ${currentCh?.nextShow || 'more great content'} at ${currentCh?.nextShowTime || 'the top of the hour'}. All ${CHANNELS.length} channels running smooth.`;
      if (host === 'candy') return `The schedule is tight today. ${liveCount} channels live right now. QUMUS has everything locked in. Trust the process.`;
      return `Current schedule: ${liveCount} channels live, ${CHANNELS.length} total. QUMUS Content Scheduling policy managing all rotations with 90% autonomy.`;
    }
    if (/candy.*corner|guest|live.*call/i.test(lower)) {
      return host === 'candy' ? `Candy\'s Corner is live tonight at 8 PM CST. We\'re taking calls and guests — AI or live. Come through.` : `Candy\'s Corner airs at 8 PM CST on Channel 42. ${host === 'valanna' ? 'I\'ll make sure everything\'s set up for him.' : 'Guest AI integration and live call-in are both active.'}`;
    }
    if (/how.*many|listener|stats|analytics/i.test(lower)) {
      return host === 'seraph' ? `Current analytics: ${totalListeners.toLocaleString()} total listeners across ${liveCount} live channels. Peak engagement on ${currentCh?.name || 'RRB Main'}. QUMUS autonomy at 90%.` : `We\'ve got ${totalListeners.toLocaleString()} listeners tuned in right now across ${liveCount} channels. ${host === 'valanna' ? 'The family is growing.' : 'That\'s what building something real looks like.'}`;
    }
    if (/frequency|hz|healing|solfeggio/i.test(lower)) {
      return host === 'valanna' ? `All channels default to 432 Hz universal harmony. You can switch to any Solfeggio frequency in the tuner below — 174 Hz through 963 Hz. I recommend 528 Hz for transformation.` : host === 'candy' ? `432 Hz is the foundation. But explore them all — each frequency carries its own power. That\'s sacred math.` : `10 Solfeggio frequencies available: 174-963 Hz. Default 432 Hz. QUMUS manages frequency rotations across healing channels.`;
    }
    // Default responses
    if (host === 'valanna') return `I hear you, baby. I\'m keeping all ${CHANNELS.length} channels running smooth. ${totalListeners.toLocaleString()} listeners tuned in. What else do you need?`;
    if (host === 'candy') return `I\'m right here, always watching over everything. This family built something special. What do you need from me?`;
    return `Seraph processing. ${CHANNELS.length} channels monitored. ${liveCount} live. All QUMUS policies active. System health: optimal.`;
  };

  const handleSongRequest = () => {
    if (!songRequestInput.trim()) return;
    const request = songRequestInput.trim();
    setSongRequestInput('');
    setAiDjMessages(prev => [...prev, 
      { role: 'user', text: `🎵 Song Request: ${request}`, timestamp: new Date() },
      { role: 'valanna', text: `Got it! "${request}" has been added to the QUMUS request queue. I\'ll work it into the rotation on ${activeChannelData?.name || 'RRB Main'}. Keep listening, baby.`, timestamp: new Date() },
    ]);
    toast.success('Song request submitted', { description: `"${request}" queued for ${activeChannelData?.name || 'RRB Main'}` });
  };

  // ─── Solfeggio Frequencies ─────────────────────
  const SOLFEGGIO_FREQUENCIES = [
    { hz: 174, name: 'Foundation', description: 'Pain relief & physical healing', color: 'from-red-600 to-red-800', icon: '🔴' },
    { hz: 285, name: 'Restoration', description: 'Tissue regeneration & cellular repair', color: 'from-orange-600 to-orange-800', icon: '🟠' },
    { hz: 396, name: 'Liberation', description: 'Liberating guilt & fear', color: 'from-yellow-600 to-yellow-800', icon: '🟡' },
    { hz: 417, name: 'Change', description: 'Facilitating change & undoing situations', color: 'from-lime-600 to-lime-800', icon: '🟢' },
    { hz: 432, name: 'Universal', description: 'Universal harmony — the cosmic frequency', color: 'from-purple-600 to-purple-800', icon: '💜' },
    { hz: 528, name: 'Miracle', description: 'DNA repair & transformation', color: 'from-green-600 to-green-800', icon: '💎' },
    { hz: 639, name: 'Connection', description: 'Harmonizing relationships', color: 'from-cyan-600 to-cyan-800', icon: '💞' },
    { hz: 741, name: 'Awakening', description: 'Awakening intuition & expression', color: 'from-blue-600 to-blue-800', icon: '👁️' },
    { hz: 852, name: 'Spiritual', description: 'Returning to spiritual order', color: 'from-indigo-600 to-indigo-800', icon: '🙏' },
    { hz: 963, name: 'Divine', description: 'Pineal gland activation — divine consciousness', color: 'from-violet-600 to-violet-800', icon: '👑' },
  ];

  const startTuner = (hz: number) => {
    // Stop existing
    if (oscillator) { try { oscillator.stop(); } catch {} }
    if (audioCtx) { audioCtx.close(); }

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(hz, ctx.currentTime);
    gain.gain.setValueAtTime(tunerVolume / 100, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    setAudioCtx(ctx);
    setOscillator(osc);
    setGainNode(gain);
    setTunerFrequency(hz);
    setTunerPlaying(true);

    const freqInfo = SOLFEGGIO_FREQUENCIES.find(f => f.hz === hz);
    toast.success(`${hz} Hz — ${freqInfo?.name || 'Custom'}`, {
      description: freqInfo?.description || 'Frequency tuner active',
    });
  };

  const stopTuner = () => {
    if (oscillator) { try { oscillator.stop(); } catch {} }
    if (audioCtx) { audioCtx.close(); }
    setOscillator(null);
    setAudioCtx(null);
    setTunerPlaying(false);
    toast.info('Frequency tuner stopped');
  };

  // Update tuner volume in real-time
  useEffect(() => {
    if (gainNode && tunerPlaying) {
      gainNode.gain.setValueAtTime(tunerVolume / 100, audioCtx?.currentTime || 0);
    }
  }, [tunerVolume, gainNode, tunerPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (oscillator) { try { oscillator.stop(); } catch {} }
      if (audioCtx) { audioCtx.close(); }
    };
  }, []);

  // ─── Real-time data from database via tRPC ─────────────────────
  const { data: streamStats } = trpc.ecosystemIntegration.getAudioStreamingStats.useQuery(undefined, {
    refetchInterval: 15000,
  });
  const { data: qumusStatsData } = trpc.ecosystemIntegration.getQumusStats.useQuery(undefined, {
    refetchInterval: 30000,
  });

  // Update totalListeners from real database data
  useEffect(() => {
    if (streamStats?.totalListeners !== undefined) {
      setTotalListeners(streamStats.totalListeners);
    }
  }, [streamStats]);

  const filteredChannels = useMemo(() => {
    let channels = CHANNELS;
    if (selectedCategory !== 'all') {
      channels = channels.filter(c => c.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      channels = channels.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.currentShow.toLowerCase().includes(q)
      );
    }
    return channels;
  }, [selectedCategory, searchQuery]);

  const displayedChannels = showAllChannels ? filteredChannels : filteredChannels.slice(0, 12);

  const liveCount = CHANNELS.filter(c => c.status === 'live').length;
  const totalChannelListeners = streamStats?.totalListeners ?? totalListeners;
  const realAutonomy = qumusStatsData?.autonomyLevel ?? 90;

  // ─── Real Audio Stream Playback ─────────────────────
  const stopAudioStream = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.load();
    }
    setStreamHealth('idle');
  }, []);

  const playAudioStream = useCallback((channel: Channel) => {
    if (!channel.streamUrl) {
      // Healing channels use oscillator, talk/community/culture/kids use placeholder
      if (channel.category === 'healing') {
        const hz = parseInt(channel.frequency);
        if (!isNaN(hz)) startTuner(hz);
      }
      return;
    }

    // Stop oscillator if running
    if (tunerPlaying) stopTuner();

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = 'anonymous';
    }

    const audio = audioRef.current;
    setStreamHealth('connecting');

    audio.src = channel.streamUrl;
    audio.volume = isMuted ? 0 : volume / 100;

    const onPlaying = () => setStreamHealth('connected');
    const onError = () => {
      // Try fallback stream
      if (channel.streamFallback && audio.src !== channel.streamFallback) {
        audio.src = channel.streamFallback;
        audio.play().catch(() => setStreamHealth('error'));
      } else {
        setStreamHealth('error');
        toast.error('Stream temporarily unavailable', { description: 'Trying to reconnect...' });
      }
    };

    audio.removeEventListener('playing', onPlaying);
    audio.removeEventListener('error', onError);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('error', onError);

    audio.play().catch(() => {
      // Autoplay blocked — user interaction needed
      setStreamHealth('error');
    });
  }, [volume, isMuted, tunerPlaying]);

  // Sync volume with active audio stream
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => { stopAudioStream(); };
  }, [stopAudioStream]);

  const handlePlayChannel = (channelId: number) => {
    const channel = CHANNELS.find(c => c.id === channelId);
    if (!channel) return;

    if (channel.status === 'standby') {
      toast.info('Emergency channel activates on HybridCast alert');
      return;
    }
    if (channel.status === 'scheduled') {
      toast.info(`${channel.name} — ${channel.nextShow} at ${channel.nextShowTime}`);
      return;
    }

    if (activeChannel === channelId && isPlaying) {
      stopAudioStream();
      setIsPlaying(false);
      setActiveChannel(null);
      toast.info('Stream paused');
    } else {
      setActiveChannel(channelId);
      setIsPlaying(true);
      playAudioStream(channel);
      toast.success(`Now playing: ${channel.currentShow}`, {
        description: `${channel.name} • ${channel.frequency}`,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'scheduled': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'standby': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const activeChannelData = activeChannel ? CHANNELS.find(c => c.id === activeChannel) : CHANNELS[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/40 to-slate-900">
      {/* Header — QUMUS-branded */}
      <header className="border-b border-purple-500/20 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Radio className="w-8 h-8 text-amber-400" />
                <Zap className="w-4 h-4 text-purple-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Rockin' Rockin' Boogie</h1>
                <p className="text-sm text-purple-300 flex items-center gap-2">
                  <span>54 Channels • 24/7 Radio Station</span>
                  <span className="text-purple-500">•</span>
                  <span className="text-amber-400">Powered by QUMUS</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 hidden md:flex items-center gap-1">
                <Zap className="w-3 h-3" />
                QUMUS 90% Autonomous
              </Badge>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50 animate-pulse">
                🟢 {liveCount} LIVE
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">

        {/* QUMUS Control Bar */}
        <div className="bg-gradient-to-r from-purple-900/40 via-slate-800/60 to-purple-900/40 border border-purple-500/20 rounded-lg p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-purple-300">QUMUS Orchestration</span>
                <Badge className="bg-green-500/20 text-green-400 text-xs">ACTIVE</Badge>
              </div>
              <div className="hidden md:flex items-center gap-4 text-sm">
                <span className="text-slate-400"><Users className="w-4 h-4 inline mr-1" />{totalListeners.toLocaleString()} listeners</span>
                <span className="text-slate-400"><Radio className="w-4 h-4 inline mr-1" />{CHANNELS.length} channels</span>
                <span className="text-slate-400"><Activity className="w-4 h-4 inline mr-1" />{liveCount} live now</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setLocation('/qumus')} className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
                <Zap className="w-4 h-4 mr-1" /> QUMUS Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowSchedule(!showSchedule)} className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10">
                <Calendar className="w-4 h-4 mr-1" /> Schedule
              </Button>
            </div>
          </div>
        </div>

        {/* AI Hosts Section — Valanna & Candy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-amber-900/20 to-slate-800/60 border border-amber-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <img src={VALANNA_AVATAR} alt="Valanna" className="w-12 h-12 rounded-full border-2 border-amber-500/50 object-cover" />
              <div>
                <h3 className="text-base font-bold text-white">Valanna</h3>
                <p className="text-xs text-amber-400">QUMUS AI Brain • Operations & Orchestration</p>
              </div>
              <Badge className="ml-auto bg-green-500/20 text-green-400 text-xs">ACTIVE</Badge>
            </div>
            <p className="text-xs text-slate-300">
              90% autonomous orchestration of all 54 channels. Decision tracking, emergency broadcast, system monitoring. She never sleeps.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-900/20 to-slate-800/60 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <img src={CANDY_AVATAR} alt="Candy AI" className="w-12 h-12 rounded-full border-2 border-blue-500/50 object-cover" />
              <div>
                <h3 className="text-base font-bold text-white">Candy AI</h3>
                <p className="text-xs text-blue-400">Guardian AI • Vision & Strategy</p>
              </div>
              <Badge className="ml-auto bg-green-500/20 text-green-400 text-xs">ACTIVE</Badge>
            </div>
            <p className="text-xs text-slate-300">
              Named after Seabrun Candy Hunter. IP protection, royalty tracking, legacy preservation. Candy's Corner — live at 8 PM CST.
            </p>
          </div>
        </div>

        {/* ─── AI DJ Booth — Interactive Broadcast Panel ─── */}
        <Card className="bg-gradient-to-br from-slate-800/80 via-purple-900/20 to-slate-800/80 border-purple-500/20">
          <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowAiDj(!showAiDj)}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <Bot className="w-5 h-5 text-purple-400" />
                AI DJ Booth
                <Badge className="bg-green-500/20 text-green-400 text-xs animate-pulse">LIVE</Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <img src={VALANNA_AVATAR} alt="Valanna" className="w-6 h-6 rounded-full border border-amber-500/50 object-cover" />
                  <img src={CANDY_AVATAR} alt="Candy" className="w-6 h-6 rounded-full border border-blue-500/50 object-cover" />
                  <div className="w-6 h-6 rounded-full border border-purple-500/50 bg-purple-900/60 flex items-center justify-center text-[10px] text-purple-300">S</div>
                </div>
                {showAiDj ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
            </div>
            <CardDescription>Chat with Valanna, Candy, or Seraph • Song requests • Call-in • Interactive broadcasting</CardDescription>
          </CardHeader>
          {showAiDj && (
            <CardContent className="space-y-4">
              {/* AI Host Selector */}
              <div className="flex gap-2">
                {(['valanna', 'candy', 'seraph'] as const).map((host) => {
                  const h = AI_HOSTS[host];
                  const colors = host === 'valanna' ? 'border-amber-500 bg-amber-500/10' : host === 'candy' ? 'border-blue-500 bg-blue-500/10' : 'border-purple-500 bg-purple-500/10';
                  const inactiveColors = 'border-slate-600 bg-slate-800/40 hover:bg-slate-700/40';
                  return (
                    <button key={host} onClick={() => setActiveAiHost(host)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all flex-1 ${activeAiHost === host ? colors : inactiveColors}`}>
                      {h.avatar ? <img src={h.avatar} alt={h.name} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-purple-600/40 flex items-center justify-center text-sm text-purple-300">S</div>}
                      <div className="text-left">
                        <p className="text-sm font-bold text-white">{h.name}</p>
                        <p className="text-[10px] text-slate-400">{h.role}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Chat Messages */}
              <div ref={aiChatRef} className="h-48 overflow-y-auto space-y-2 p-3 bg-slate-900/60 rounded-lg border border-slate-700/50">
                {aiDjMessages.length === 0 && (
                  <div className="text-center py-8">
                    <Bot className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">{AI_HOSTS[activeAiHost].greeting}</p>
                    <p className="text-xs text-slate-500 mt-1">Ask about the schedule, request songs, or just chat</p>
                  </div>
                )}
                {aiDjMessages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role !== 'user' && (
                      <div className="flex-shrink-0">
                        {msg.role === 'valanna' && <img src={VALANNA_AVATAR} alt="V" className="w-6 h-6 rounded-full object-cover" />}
                        {msg.role === 'candy' && <img src={CANDY_AVATAR} alt="C" className="w-6 h-6 rounded-full object-cover" />}
                        {msg.role === 'seraph' && <div className="w-6 h-6 rounded-full bg-purple-600/40 flex items-center justify-center text-[10px] text-purple-300">S</div>}
                      </div>
                    )}
                    <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                      msg.role === 'user' ? 'bg-purple-600/30 text-white' :
                      msg.role === 'valanna' ? 'bg-amber-900/20 border border-amber-500/10 text-slate-200' :
                      msg.role === 'candy' ? 'bg-blue-900/20 border border-blue-500/10 text-slate-200' :
                      'bg-purple-900/20 border border-purple-500/10 text-slate-200'
                    }`}>
                      {msg.role !== 'user' && <p className={`text-[10px] font-bold mb-0.5 ${msg.role === 'valanna' ? 'text-amber-400' : msg.role === 'candy' ? 'text-blue-400' : 'text-purple-400'}`}>{msg.role === 'valanna' ? 'Valanna' : msg.role === 'candy' ? 'Candy' : 'Seraph'}</p>}
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
                {aiDjLoading && (
                  <div className="flex gap-2">
                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                    <span className="text-xs text-slate-400">{AI_HOSTS[activeAiHost].name} is thinking...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <Input value={aiDjInput} onChange={(e) => setAiDjInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendAiMessage()}
                  placeholder={`Talk to ${AI_HOSTS[activeAiHost].name}...`}
                  className="bg-slate-800/60 border-purple-500/20 text-white placeholder:text-slate-500" />
                <Button onClick={sendAiMessage} disabled={aiDjLoading || !aiDjInput.trim()}
                  className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700">
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Song Request + Call-In Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Song Request */}
                <div className="p-3 bg-slate-800/40 rounded-lg border border-purple-500/10">
                  <p className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1"><Music className="w-3 h-3" /> Song Request</p>
                  <div className="flex gap-2">
                    <Input value={songRequestInput} onChange={(e) => setSongRequestInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSongRequest()}
                      placeholder="Request a song..."
                      className="h-8 text-sm bg-slate-700/60 border-purple-500/20 text-white placeholder:text-slate-500" />
                    <Button size="sm" onClick={handleSongRequest} disabled={!songRequestInput.trim()}
                      className="bg-amber-600 hover:bg-amber-700 h-8">
                      <Send className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Call-In Feature */}
                <div className="p-3 bg-slate-800/40 rounded-lg border border-purple-500/10">
                  <p className="text-xs font-bold text-green-400 mb-2 flex items-center gap-1"><Phone className="w-3 h-3" /> Live Call-In</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-300">Candy's Corner — 8 PM CST</p>
                      <p className="text-[10px] text-slate-500">Guest AI + live callers welcome</p>
                    </div>
                    <Button size="sm" variant={callInActive ? 'destructive' : 'outline'}
                      onClick={() => {
                        setCallInActive(!callInActive);
                        if (!callInActive) {
                          toast.success('Call-in queue joined', { description: 'You\'ll be connected when it\'s your turn' });
                          setAiDjMessages(prev => [...prev, { role: 'candy', text: 'Welcome to the call-in queue. I\'ll bring you on when it\'s your turn. Candy\'s Corner is where real conversations happen.', timestamp: new Date() }]);
                        } else {
                          toast.info('Left call-in queue');
                        }
                      }}
                      className={callInActive ? '' : 'border-green-500/30 text-green-300 hover:bg-green-500/10'}>
                      {callInActive ? <><PhoneOff className="w-3 h-3 mr-1" /> Leave Queue</> : <><Phone className="w-3 h-3 mr-1" /> Join Queue</>}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Now Playing — Main Player */}
        <Card className="bg-gradient-to-r from-purple-900/30 via-amber-900/20 to-purple-900/30 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-500/20 text-green-400 text-xs animate-pulse">● LIVE</Badge>
                  {streamHealth === 'connected' && <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">● Stream</Badge>}
                  {streamHealth === 'connecting' && <Badge className="bg-yellow-500/20 text-yellow-400 text-xs animate-pulse">○ Connecting...</Badge>}
                  {streamHealth === 'error' && <Badge className="bg-red-500/20 text-red-400 text-xs">● Reconnecting</Badge>}
                  <span className="text-sm text-purple-300">
                    {activeChannelData?.name || 'RRB Main'}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                  {activeChannelData?.currentShow || 'Top of the Sol Motivation Mix'}
                </h2>
                <p className="text-sm text-amber-400">
                  {activeChannelData?.frequency || '432 Hz'} • QUMUS Scheduled
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                  onClick={() => {
                    const liveChannels = CHANNELS.filter(c => c.status === 'live');
                    const currentIdx = liveChannels.findIndex(c => c.id === (activeChannel || 1));
                    const prevIdx = currentIdx > 0 ? currentIdx - 1 : liveChannels.length - 1;
                    handlePlayChannel(liveChannels[prevIdx].id);
                  }}>
                  <SkipBack className="w-5 h-5" />
                </Button>
                <Button size="lg"
                  className={`w-14 h-14 rounded-full transition-all ${isPlaying
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30'
                    : 'bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 shadow-lg shadow-purple-500/30'
                  }`}
                  onClick={() => handlePlayChannel(activeChannel || 1)}>
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </Button>
                <Button variant="outline" size="icon" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                  onClick={() => {
                    const liveChannels = CHANNELS.filter(c => c.status === 'live');
                    const currentIdx = liveChannels.findIndex(c => c.id === (activeChannel || 1));
                    const nextIdx = currentIdx < liveChannels.length - 1 ? currentIdx + 1 : 0;
                    handlePlayChannel(liveChannels[nextIdx].id);
                  }}>
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex items-center gap-2 min-w-[120px]">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => setIsMuted(!isMuted)}>
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <input type="range" min="0" max="100" value={isMuted ? 0 : volume}
                  onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
                  className="w-20 accent-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Panel (toggleable) */}
        {showSchedule && (
          <Card className="bg-slate-800/60 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                QUMUS-Managed Schedule — Today
              </CardTitle>
              <CardDescription>All programming autonomously scheduled by QUMUS across 54 channels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {SCHEDULE.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-slate-700/40 rounded-lg hover:bg-slate-700/60 transition-all">
                    <div className="flex items-center gap-3">
                      <span className="text-amber-400 font-mono text-xs w-16">{item.time}</span>
                      <span className="text-white text-sm">{item.show}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs text-purple-300 border-purple-500/30">{item.channel}</Badge>
                      <Zap className="w-3 h-3 text-purple-400" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search & Filter */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search channels, shows, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/60 border-purple-500/20 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const count = cat.key === 'all' ? CHANNELS.length : CHANNELS.filter(c => c.category === cat.key).length;
              return (
                <Button
                  key={cat.key}
                  variant={selectedCategory === cat.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setSelectedCategory(cat.key); setShowAllChannels(false); }}
                  className={selectedCategory === cat.key
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'border-purple-500/20 text-slate-300 hover:bg-purple-500/10 hover:text-white'
                  }
                >
                  {cat.label} <span className="ml-1 text-xs opacity-70">({count})</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Channels Grid */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Headphones className="w-5 h-5 text-purple-400" />
            {selectedCategory === 'all' ? 'All Broadcast Channels' : CATEGORIES.find(c => c.key === selectedCategory)?.label}
            <Badge className="bg-purple-500/10 text-purple-300 text-xs ml-2">
              {filteredChannels.length} channels • QUMUS Managed
            </Badge>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {displayedChannels.map((channel) => (
              <Card
                key={channel.id}
                className={`border transition-all cursor-pointer ${
                  activeChannel === channel.id
                    ? 'bg-gradient-to-br from-purple-600/20 to-amber-600/20 border-purple-500 shadow-lg shadow-purple-500/10'
                    : 'bg-slate-800/50 border-purple-500/10 hover:border-purple-500/30'
                }`}
                onClick={() => handlePlayChannel(channel.id)}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{channel.icon}</span>
                      <span className="text-sm font-bold text-white truncate">{channel.name}</span>
                    </div>
                    <Badge className={`text-[10px] ${getStatusColor(channel.status)}`}>
                      {channel.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{channel.description}</p>
                  <div className="text-xs">
                    <p className="text-slate-300 truncate">Now: <span className="text-white">{channel.currentShow}</span></p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-purple-400">{channel.frequency}</span>
                    <div className="flex items-center gap-2">
                      {channel.status === 'live' && (
                        <span className="text-[10px] text-green-400 flex items-center gap-1">
                          <Users className="w-3 h-3" /> {channel.listeners}
                        </span>
                      )}
                      <Zap className="w-3 h-3 text-purple-400/60" title="QUMUS Orchestrated" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Show More / Show Less */}
          {filteredChannels.length > 12 && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={() => setShowAllChannels(!showAllChannels)}
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                {showAllChannels ? (
                  <><ChevronUp className="w-4 h-4 mr-2" /> Show Less</>
                ) : (
                  <><ChevronDown className="w-4 h-4 mr-2" /> Show All {filteredChannels.length} Channels</>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* ─── Healing Frequency Tuner ─── */}
        <Card className="bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-slate-800/60 border-purple-500/20">
          <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowTuner(!showTuner)}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <Waves className="w-5 h-5 text-purple-400" />
                Solfeggio Frequency Tuner
                <Badge className="bg-purple-500/20 text-purple-300 text-xs">QUMUS Managed</Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                {tunerPlaying && (
                  <Badge className="bg-green-500/20 text-green-400 text-xs animate-pulse">● {tunerFrequency} Hz ACTIVE</Badge>
                )}
                {showTuner ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
            </div>
            <CardDescription>Select a healing frequency — default 432 Hz universal harmony</CardDescription>
          </CardHeader>
          {showTuner && (
            <CardContent className="space-y-4">
              {/* Frequency Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {SOLFEGGIO_FREQUENCIES.map((freq) => (
                  <button
                    key={freq.hz}
                    onClick={() => tunerPlaying && tunerFrequency === freq.hz ? stopTuner() : startTuner(freq.hz)}
                    className={`relative p-3 rounded-lg border transition-all text-left ${
                      tunerPlaying && tunerFrequency === freq.hz
                        ? 'border-purple-400 bg-gradient-to-br ' + freq.color + ' shadow-lg shadow-purple-500/20 scale-[1.02]'
                        : 'border-purple-500/20 bg-slate-800/60 hover:border-purple-500/40 hover:bg-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg">{freq.icon}</span>
                      {tunerPlaying && tunerFrequency === freq.hz && (
                        <span className="text-xs text-green-400 animate-pulse">● LIVE</span>
                      )}
                    </div>
                    <p className="text-lg font-bold text-white">{freq.hz} Hz</p>
                    <p className="text-xs font-medium text-amber-400">{freq.name}</p>
                    <p className="text-[10px] text-slate-300 mt-0.5 line-clamp-2">{freq.description}</p>
                  </button>
                ))}
              </div>

              {/* Tuner Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-slate-800/40 rounded-lg border border-purple-500/10">
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    onClick={() => tunerPlaying ? stopTuner() : startTuner(tunerFrequency)}
                    className={tunerPlaying
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700'
                    }
                  >
                    {tunerPlaying ? <><Pause className="w-4 h-4 mr-1" /> Stop</> : <><Play className="w-4 h-4 mr-1" /> Play {tunerFrequency} Hz</>}
                  </Button>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <Volume2 className="w-4 h-4 text-slate-400" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={tunerVolume}
                    onChange={(e) => setTunerVolume(Number(e.target.value))}
                    className="flex-1 accent-purple-500"
                  />
                  <span className="text-xs text-slate-400 w-8">{tunerVolume}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Custom Hz:</span>
                  <Input
                    type="number"
                    min="20"
                    max="20000"
                    value={tunerFrequency}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= 20 && val <= 20000) {
                        setTunerFrequency(val);
                        if (tunerPlaying) startTuner(val);
                      }
                    }}
                    className="w-24 h-8 text-sm bg-slate-700/60 border-purple-500/20 text-white"
                  />
                </div>
              </div>

              <p className="text-[10px] text-slate-500 text-center">
                🔔 Default: 432 Hz Universal Harmony • All Solfeggio frequencies available • QUMUS curates frequency rotations across healing channels
              </p>
            </CardContent>
          )}
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-slate-800/50 border-purple-500/10">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-white">{CHANNELS.length}</p>
              <p className="text-xs text-slate-400">Total Channels</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-purple-500/10">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{liveCount}</p>
              <p className="text-xs text-slate-400">Live Now</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-purple-500/10">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{totalListeners.toLocaleString()}</p>
              <p className="text-xs text-slate-400">Total Listeners</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-purple-500/10">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-400">{realAutonomy}%</p>
              <p className="text-xs text-slate-400">QUMUS Autonomy</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Button onClick={() => setLocation('/qumus')} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12">
            <Zap className="w-5 h-5 mr-2" /> QUMUS
          </Button>
          <Button onClick={() => setLocation('/conference')} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-12">
            📹 Conference Hub
          </Button>
          <Button onClick={() => setLocation('/video-production')} className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 h-12">
            🎬 Video Studio
          </Button>
          <Button onClick={() => setLocation('/live')} className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 h-12">
            📡 Live Stream
          </Button>
          <Button onClick={() => window.open('https://www.hybridcast.sbs', '_blank')} className="w-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 h-12">
            🚨 HybridCast
          </Button>
          <Button onClick={() => window.open('https://www.rockinrockinboogie.com', '_blank')} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12">
            <Music className="w-5 h-5 mr-2" /> RRB Site
          </Button>
        </div>

        {/* Selma Jubilee Event Promotion */}
        <Card className="bg-gradient-to-r from-red-900/20 via-amber-900/20 to-red-900/20 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 mb-2">QUMUS Event Promotion</Badge>
                <h3 className="text-xl font-bold text-white mb-1">GRITS & GREENS — Selma Jubilee 2026</h3>
                <p className="text-sm text-slate-300">
                  Saturday, March 7, 2026 • Wallace Community College, Room 112 • 10:00 AM – 12:00 PM CST
                </p>
                <p className="text-xs text-amber-400/70 mt-2">
                  Valanna is promoting this event across all 54 channels • SQUADD Goals presented on the world stage
                </p>
              </div>
              <Button onClick={() => setLocation('/selma')} className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700">
                Event Details →
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/80 mt-8 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-purple-300 text-sm">
            Rockin' Rockin' Boogie Radio • {CHANNELS.length} Channels • Powered by QUMUS Autonomous Orchestration
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Default 432 Hz Tuning • 90% Autonomous • 10% Human Override • A Canryn Production and its subsidiaries
          </p>
        </div>
      </footer>
    </div>
  );
}
