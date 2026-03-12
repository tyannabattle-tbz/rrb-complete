import React, { useState, useRef, useEffect, useMemo } from 'react';
import { RRBSongBadge } from '@/components/RRBSongBadge';
import { useLocation } from 'wouter';
import {
  Play, Pause, SkipForward, Volume2, VolumeX, Radio, Heart,
  Share2, Users, Music, Headphones, Wifi, Earth, ArrowRight,
  Calendar, MapPin, Phone, FileText, Search, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRestreamUrl } from '@/hooks/useRestreamUrl';

// Genre categories for filtering
const GENRE_FILTERS = [
  'All', 'Music', 'Talk', 'AI-Curated', 'Wellness',
  'Education', 'Entertainment', 'Specialty', 'Community'
];

// RRB Radio — 54 Channels: Official Station List | Canryn Production | QUMUS Orchestrated
const channels = [
  // === MUSIC (22 Stations) ===
  { id: 1, name: 'RRB Main Radio', icon: '📻', genre: 'Soul, Funk, R&B', frequency: '432 Hz', color: 'from-purple-600 to-blue-600', description: 'Soul, funk, R&B, and legacy music — the heartbeat of Canryn Production.', streamUrl: 'https://funkyradio.streamingmedia.it/play.mp3', listeners: 127, nowPlaying: 'Community Hour with Sweet Miracles', category: 'Music' },
  { id: 5, name: 'Music Discovery', icon: '🔍', genre: 'Indie, Emerging', frequency: '432 Hz', color: 'from-violet-500 to-purple-600', description: 'New artists and deep cuts from emerging talent.', streamUrl: 'https://premium.shoutcastsolutions.com/radio/8050/256.mp3', listeners: 83, nowPlaying: 'Fresh Finds Friday', category: 'Music' },
  { id: 9, name: 'Gospel & Praise', icon: '🙏', genre: 'Gospel, Worship', frequency: '432 Hz', color: 'from-pink-600 to-rose-600', description: 'Gospel music, worship, and praise.', streamUrl: 'https://s3.radio.co/s97f38db97/listen', listeners: 84, nowPlaying: 'Sunday Morning Praise', category: 'Music' },
  { id: 10, name: 'Smooth Jazz Lounge', icon: '🎷', genre: 'Jazz, Bebop, Fusion', frequency: '432 Hz', color: 'from-indigo-600 to-violet-600', description: 'Smooth jazz, bebop, and fusion.', streamUrl: 'http://ice-the.musicradio.com/ClassicFMMP3', listeners: 108, nowPlaying: 'Smooth Sax Sessions', category: 'Music' },
  { id: 11, name: 'Hip-Hop Classics', icon: '🎤', genre: 'Hip-Hop, Rap, Conscious', frequency: '440 Hz', color: 'from-red-600 to-orange-600', description: 'Golden era hip-hop and conscious rap.', streamUrl: 'https://streams.fluxfm.de/hiphop/mp3-320/audio/', listeners: 142, nowPlaying: 'Conscious Hip-Hop Hour', category: 'Music' },
  { id: 12, name: 'Neo-Soul', icon: '🛋️', genre: 'Neo-Soul, Alt R&B', frequency: '432 Hz', color: 'from-fuchsia-600 to-purple-700', description: 'Contemporary soul and neo-soul artists.', streamUrl: 'https://listen.181fm.com/181-soul_128k.mp3', listeners: 76, nowPlaying: 'Neo Soul Essentials', category: 'Music' },
  { id: 13, name: 'Reggae & Dancehall', icon: '🦁', genre: 'Reggae, Dancehall, Ska', frequency: '432 Hz', color: 'from-yellow-600 to-green-700', description: 'Roots reggae, dancehall, and island vibes.', streamUrl: 'https://stream.zeno.fm/0r0xa792kwzuv', listeners: 87, nowPlaying: 'One Love Sessions', category: 'Music' },
  { id: 14, name: 'Afrobeats Global', icon: '🥁', genre: 'Afrobeats, Amapiano', frequency: '432 Hz', color: 'from-green-500 to-emerald-600', description: 'Afrobeats, Amapiano, and African pop.', streamUrl: 'https://radio.gotright.net/radio/8000/radio.mp3', listeners: 178, nowPlaying: 'Afrobeats Top Hits', category: 'Music' },
  { id: 15, name: 'Blues Highway', icon: '🎸', genre: 'Blues, Delta, Chicago', frequency: '432 Hz', color: 'from-blue-800 to-indigo-900', description: 'Delta blues, Chicago blues, and modern blues.', streamUrl: 'http://jazzblues.ice.infomaniak.ch/jazzblues-high.mp3', listeners: 54, nowPlaying: 'Mississippi Delta Blues', category: 'Music' },
  { id: 16, name: 'Classical Serenity', icon: '🎻', genre: 'Classical, Orchestral', frequency: '432 Hz', color: 'from-amber-300 to-yellow-500', description: 'Classical orchestral and chamber music.', streamUrl: 'http://ice-the.musicradio.com/ClassicFMMP3', listeners: 62, nowPlaying: 'Evening Concerto', category: 'Music' },
  { id: 17, name: 'Latin Rhythms', icon: '💃', genre: 'Salsa, Bachata, Reggaeton', frequency: '432 Hz', color: 'from-red-500 to-orange-500', description: 'Salsa, bachata, reggaeton, and Latin jazz.', streamUrl: 'http://streaming5.elitecomunicacion.es:8082/live.mp3', listeners: 95, nowPlaying: 'Salsa Caliente', category: 'Music' },
  { id: 18, name: 'Country Crossroads', icon: '🤠', genre: 'Country, Americana, Folk', frequency: '432 Hz', color: 'from-amber-600 to-yellow-700', description: 'Country, Americana, and folk roots.', streamUrl: 'http://26343.live.streamtheworld.com/977_COUNTRY_SC', listeners: 41, nowPlaying: 'Country Chapel Hour', category: 'Music' },
  { id: 19, name: 'Electronic Pulse', icon: '⚡', genre: 'EDM, House, Techno', frequency: '440 Hz', color: 'from-cyan-400 to-blue-500', description: 'EDM, house, techno, and ambient.', streamUrl: 'http://novazz.ice.infomaniak.ch/novazz-128.mp3', listeners: 134, nowPlaying: 'Deep House Sessions', category: 'Music' },
  { id: 20, name: 'Rock Legends', icon: '🎸', genre: 'Rock, Alternative, Indie', frequency: '440 Hz', color: 'from-red-700 to-gray-800', description: 'Classic rock, alternative, and indie rock.', streamUrl: 'https://cast1.torontocast.com:4610/stream', listeners: 97, nowPlaying: 'Rock Anthems', category: 'Music' },
  { id: 32, name: 'Worship & Devotional', icon: '⛪', genre: 'Worship, Devotional', frequency: '432 Hz', color: 'from-sky-600 to-blue-700', description: 'Multi-faith worship music and devotionals.', streamUrl: 'https://listen.christianrock.net/stream/13/', listeners: 48, nowPlaying: 'Morning Devotional', category: 'Music' },
  { id: 33, name: 'Caribbean Vibes', icon: '🏝️', genre: 'Soca, Calypso, Zouk', frequency: '432 Hz', color: 'from-cyan-500 to-green-500', description: 'Soca, calypso, zouk, and island music.', streamUrl: 'https://stream.zeno.fm/0r0xa792kwzuv', listeners: 73, nowPlaying: 'Island Vibes', category: 'Music' },
  { id: 34, name: 'Women in Music', icon: '👩‍🎤', genre: 'Women Artists, All Genres', frequency: '432 Hz', color: 'from-fuchsia-500 to-pink-600', description: 'Celebrating women artists across all genres.', streamUrl: 'https://fm939.wnyc.org/wnycfm', listeners: 95, nowPlaying: 'Queens of Music', category: 'Music' },
  { id: 35, name: 'Indie & Underground', icon: '🎵', genre: 'Indie, Underground', frequency: '440 Hz', color: 'from-zinc-600 to-slate-700', description: 'Independent artists and underground scenes.', streamUrl: 'https://wdr-wdr5-live.icecastssl.wdr.de/wdr/wdr5/live/mp3/128/stream.mp3', listeners: 67, nowPlaying: 'Underground Discoveries', category: 'Music' },
  { id: 36, name: 'World Fusion', icon: '🌐', genre: 'World Music, Fusion', frequency: '432 Hz', color: 'from-teal-500 to-green-600', description: 'Global music fusion and cross-cultural sounds.', streamUrl: 'https://tv.radiohosting.online:9484/stream', listeners: 53, nowPlaying: 'Global Fusion Mix', category: 'Music' },
  { id: 37, name: 'Throwback Radio', icon: '📼', genre: '70s, 80s, 90s, 2000s', frequency: '440 Hz', color: 'from-orange-500 to-amber-600', description: "70s, 80s, 90s, and 2000s hits.", streamUrl: 'https://icecast.walmradio.com:8443/classic', listeners: 143, nowPlaying: '90s Throwback Jams', category: 'Music' },
  { id: 38, name: 'Love Songs', icon: '💕', genre: 'Love Songs, Ballads', frequency: '432 Hz', color: 'from-rose-500 to-pink-600', description: 'Romantic ballads and love songs across eras.', streamUrl: 'https://maggie.torontocast.com:2020/stream/rdmixlovesongs', listeners: 112, nowPlaying: 'Love Ballads Hour', category: 'Music' },
  { id: 51, name: 'C.J. Battle Radio', icon: '🎤', genre: 'Hip-Hop, Alternative', frequency: '432 Hz', color: 'from-blue-600 to-cyan-500', description: 'C.J. Battle — OLD SOUL, Searching, TRIGONOMETRY and more. Most.High.Ova.Everything.', streamUrl: 'https://streams.fluxfm.de/hiphop/mp3-320/audio/', listeners: 89, nowPlaying: 'C.J. Battle — OLD SOUL', category: 'Music', appleMusicUrl: 'https://music.apple.com/us/artist/c-j-battle/1438716457', spotifyUrl: 'https://open.spotify.com/artist/2kFnLPBd40yxliDHZZpAPy', isArtistStation: true, soundcloudUrl: 'https://soundcloud.com/cjbttle', tidalUrl: 'https://tidal.com/artist/10464604', deezerUrl: 'https://www.deezer.com/en/artist/52608732', youtubeUrl: 'https://www.youtube.com/channel/UCR_UZEE4FkpCR9THocyutkQ', instagramUrl: 'https://www.instagram.com/c.j.battle/' },
  // === TALK (3 Stations) ===
  { id: 2, name: 'Podcast Network', icon: '🎙️', genre: 'Podcast, Interviews', frequency: '432 Hz', color: 'from-red-500 to-pink-600', description: 'Original podcasts and interviews — In Battle Tyme and more.', streamUrl: 'https://premium.shoutcastsolutions.com/radio/8050/256.mp3', listeners: 58, nowPlaying: 'In Battle Tyme', category: 'Talk' },
  { id: 8, name: 'Sports Talk', icon: '🏈', genre: 'Sports, Analysis', frequency: '440 Hz', color: 'from-green-600 to-teal-600', description: 'Live scores, analysis, and game day coverage.', streamUrl: 'http://playerservices.streamtheworld.com/api/livestream-redirect/CADENASER.mp3', listeners: 67, nowPlaying: 'Game Day Live', category: 'Talk' },
  { id: 24, name: 'News & Current Affairs', icon: '📰', genre: 'News, Commentary', frequency: '440 Hz', color: 'from-gray-600 to-slate-700', description: 'Breaking news, analysis, and commentary.', streamUrl: 'https://tunein.cdnstream1.com/2868_96.mp3', listeners: 67, nowPlaying: 'Evening News Roundup', category: 'Talk' },
  // === AI-CURATED (3 Stations) ===
  { id: 41, name: 'Seraph AI Radio', icon: '🤖', genre: 'AI-Curated, Eclectic', frequency: '432 Hz', color: 'from-violet-600 to-purple-700', description: 'AI-curated music by Seraph intelligence.', streamUrl: 'http://s1.voscast.com:8652/stream', listeners: 183, nowPlaying: 'Seraph Selection', category: 'AI-Curated' },
  { id: 42, name: 'Candy AI Radio', icon: '🍬', genre: 'AI-Curated, Legacy, Soul', frequency: '432 Hz', color: 'from-pink-500 to-fuchsia-600', description: 'AI-curated playlists by Candy guardian.', streamUrl: 'https://stream.nightride.fm/nightride.mp3', listeners: 156, nowPlaying: 'Candy Legacy Mix', category: 'AI-Curated' },
  { id: 43, name: 'Valanna AI Radio', icon: '🧠', genre: 'AI-Curated, Orchestrated', frequency: '432 Hz', color: 'from-indigo-500 to-blue-600', description: 'QUMUS brain-curated intelligent programming.', streamUrl: 'https://pub0201.101.ru/stream/trust/mp3/128/24?', listeners: 215, nowPlaying: "Valanna's Evening Selection", category: 'AI-Curated' },
  // === WELLNESS (5 Stations) ===
  { id: 7, name: 'Drop Radio 432Hz', icon: '🧘', genre: 'Healing, Solfeggio', frequency: '432 Hz', color: 'from-green-600 to-emerald-600', description: 'Solfeggio healing frequencies — Crystal Essentials.', streamUrl: 'http://radio.stereoscenic.com/asp-h', listeners: 203, nowPlaying: '432 Hz Deep Healing Session', category: 'Wellness' },
  { id: 23, name: 'Meditation & Mindfulness', icon: '🕉️', genre: 'Meditation, Guided', frequency: '432 Hz', color: 'from-emerald-500 to-teal-600', description: 'Guided meditation and mindfulness sessions.', streamUrl: 'https://icecast.multhielemedia.de/listen/kontrafunk/radio.mp3', listeners: 145, nowPlaying: 'Guided Mindfulness', category: 'Wellness' },
  { id: 27, name: 'Health & Wellness', icon: '💚', genre: 'Health, Fitness, Nutrition', frequency: '432 Hz', color: 'from-teal-500 to-cyan-600', description: 'Holistic health, fitness, and nutrition.', streamUrl: 'https://stream.nightride.fm/nightride.mp3', listeners: 78, nowPlaying: 'Wellness Hour', category: 'Wellness' },
  { id: 39, name: 'Workout & Energy', icon: '💪', genre: 'Workout, Energy, Motivation', frequency: '440 Hz', color: 'from-orange-500 to-red-500', description: 'High-energy music for fitness and motivation.', streamUrl: 'https://workout-high.rautemusik.fm/?ref=radiobrowser', listeners: 167, nowPlaying: 'Power Hour', category: 'Wellness' },
  { id: 40, name: 'Sleep & Relaxation', icon: '🌙', genre: 'Sleep, Ambient, ASMR', frequency: '432 Hz', color: 'from-indigo-700 to-purple-800', description: 'Ambient sounds, sleep music, and ASMR.', streamUrl: 'http://radio.stereoscenic.com/asp-h', listeners: 134, nowPlaying: 'Deep Sleep Sounds', category: 'Wellness' },
  // === EDUCATION (3 Stations) ===
  { id: 25, name: 'Business & Finance', icon: '💼', genre: 'Business, Entrepreneurship', frequency: '440 Hz', color: 'from-slate-600 to-gray-700', description: 'Markets, entrepreneurship, and wealth building.', streamUrl: 'https://fm939.wnyc.org/wnycfm', listeners: 45, nowPlaying: 'Market Watch', category: 'Education' },
  { id: 26, name: 'Science & Technology', icon: '🔬', genre: 'Science, Technology, AI', frequency: '440 Hz', color: 'from-blue-500 to-cyan-600', description: 'Tech trends, science discoveries, and innovation.', streamUrl: 'http://radio.stereoscenic.com/asp-h', listeners: 38, nowPlaying: 'Tech Trends Today', category: 'Education' },
  { id: 28, name: 'Education & Learning', icon: '📚', genre: 'Education, Skills', frequency: '440 Hz', color: 'from-green-500 to-teal-500', description: 'Educational content and skill building.', streamUrl: 'https://pub0201.101.ru/stream/trust/mp3/128/24?', listeners: 33, nowPlaying: 'Learning Hour', category: 'Education' },
  // === ENTERTAINMENT (7 Stations) ===
  { id: 3, name: 'Audiobook Stream', icon: '📖', genre: 'Audiobooks, Stories', frequency: '432 Hz', color: 'from-amber-400 to-orange-500', description: 'Narrated books and stories.', streamUrl: 'http://bookradio.hostingradio.ru:8069/fm', listeners: 56, nowPlaying: 'Story Hour', category: 'Entertainment' },
  { id: 21, name: 'Kids & Family', icon: '👨‍👩‍👧‍👦', genre: 'Kids, Family, Educational', frequency: '432 Hz', color: 'from-pink-400 to-purple-400', description: 'Family-friendly music and storytelling.', streamUrl: 'http://stream01.zogl.net:8906/stream', listeners: 44, nowPlaying: 'Storytime Adventures', category: 'Entertainment' },
  { id: 22, name: 'Spoken Word & Poetry', icon: '📝', genre: 'Spoken Word, Poetry', frequency: '432 Hz', color: 'from-slate-600 to-gray-700', description: 'Poetry slams, spoken word, and literary arts.', streamUrl: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service', listeners: 33, nowPlaying: 'Open Mic Poetry', category: 'Entertainment' },
  { id: 29, name: 'Comedy Central', icon: '😂', genre: 'Comedy, Stand-Up, Humor', frequency: '440 Hz', color: 'from-yellow-400 to-orange-400', description: 'Stand-up comedy, sketches, and humor.', streamUrl: 'https://icecast.walmradio.com:8443/otr', listeners: 67, nowPlaying: 'Comedy Hour', category: 'Entertainment' },
  { id: 30, name: 'Drama & Theater', icon: '🎭', genre: 'Drama, Radio Drama', frequency: '432 Hz', color: 'from-red-700 to-rose-800', description: 'Radio dramas, audio theater, and storytelling.', streamUrl: 'https://icecast.walmradio.com:8443/otr', listeners: 29, nowPlaying: 'Evening Drama', category: 'Entertainment' },
  { id: 31, name: 'Anime & Gaming', icon: '🎮', genre: 'Anime, Gaming, J-Pop', frequency: '440 Hz', color: 'from-purple-500 to-pink-500', description: 'Anime OSTs, gaming soundtracks, and J-pop.', streamUrl: 'https://stream.zeno.fm/qpn8mkt8c4duv', listeners: 89, nowPlaying: 'Anime Hits', category: 'Entertainment' },
  { id: 48, name: 'Gaming Battle Arena', icon: '🕹️', genre: 'Esports, Gaming, Tournaments', frequency: '440 Hz', color: 'from-green-600 to-cyan-600', description: 'Gaming tournaments, esports, and battle commentary.', streamUrl: 'https://listen.reyfm.de/gaming_192kbps.mp3', listeners: 72, nowPlaying: 'Battle Arena Live', category: 'Entertainment' },
  // === SPECIALTY (5 Stations) ===
  { id: 4, name: 'HybridCast Emergency', icon: '🚨', genre: 'Emergency, Public Safety', frequency: '440 Hz', color: 'from-red-700 to-red-900', description: '24/7 standby — emergency alerts and public safety.', streamUrl: 'http://jking.cdnstream1.com/b22139_128mp3', listeners: 22, nowPlaying: 'All Clear — No Active Alerts', category: 'Specialty' },
  { id: 44, name: 'Ty Battle Live', icon: '🎙️', genre: 'Live, Events, Broadcast', frequency: '432 Hz', color: 'from-orange-600 to-amber-600', description: 'Live broadcasts and special events from Ty Battle.', streamUrl: 'https://broadcastify.cdnstream1.com/8705', listeners: 56, nowPlaying: 'Live Broadcast', category: 'Specialty' },
  { id: 46, name: 'Canryn Production', icon: '🎬', genre: 'Production, Studio', frequency: '432 Hz', color: 'from-amber-500 to-orange-600', description: 'Behind-the-scenes production and studio sessions.', streamUrl: 'https://listen.181fm.com/181-soul_128k.mp3', listeners: 31, nowPlaying: 'Studio Sessions', category: 'Specialty' },
  { id: 47, name: 'Dragon Frequencies', icon: '🐉', genre: 'Frequencies, Elemental', frequency: '432 Hz', color: 'from-emerald-600 to-teal-700', description: "Wisdom's Dragon elemental frequency broadcasts.", streamUrl: 'https://stream.drugradio.ru:8020/stream128', listeners: 45, nowPlaying: 'Dragon Healing Tones', category: 'Specialty' },
  { id: 49, name: 'Legacy Archives', icon: '🏛️', genre: 'Archives, History', frequency: '432 Hz', color: 'from-yellow-600 to-orange-600', description: 'Historical recordings, interviews, and family archives.', streamUrl: 'https://tunein.cdnstream1.com/2868_96.mp3', listeners: 29, nowPlaying: 'Voices of the Past', category: 'Specialty' },
  // === COMMUNITY (3 Stations) ===
  { id: 6, name: 'Community Voice', icon: '📞', genre: 'Community, Call-In', frequency: '432 Hz', color: 'from-blue-600 to-indigo-700', description: 'Listener stories and call-ins.', streamUrl: 'https://tunein.cdnstream1.com/2868_96.mp3', listeners: 38, nowPlaying: 'Listener Stories', category: 'Community' },
  { id: 45, name: 'Sweet Miracles', icon: '🍬', genre: 'Nonprofit, Charity', frequency: '528 Hz', color: 'from-pink-500 to-fuchsia-600', description: 'Nonprofit awareness, fundraising, and community impact (501c/508).', streamUrl: 'https://streams.fluxfm.de/hiphop/mp3-320/audio/', listeners: 38, nowPlaying: 'Elder Advocacy Hour', category: 'Community' },
  { id: 50, name: 'Open Mic', icon: '🎤', genre: 'Open Mic, Freestyle', frequency: '432 Hz', color: 'from-amber-400 to-yellow-500', description: 'Community open mic, freestyle, and live performances.', streamUrl: 'https://s3.radio.co/s97f38db97/listen', listeners: 28, nowPlaying: 'Open Mic Night', category: 'Community' },
  // === NEW CHANNELS (52-54) ===
  { id: 52, name: 'SQUADD Coalition Radio', icon: '👑', genre: 'Empowerment, Talk', frequency: '432 Hz', color: 'from-purple-600 to-fuchsia-700', description: 'SQUADD Coalition programming — Sisters Questing Unapologetically After Divine Destiny.', streamUrl: 'https://tunein.cdnstream1.com/2868_96.mp3', listeners: 42, nowPlaying: 'SQUADD Empowerment Hour', category: 'Community', coverImage: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/ch52_squadd_coalition_radio-NR3GhZyxLVQoHdGHN6Lso8.webp' },
  { id: 53, name: 'UN Advocacy Radio', icon: '🌍', genre: 'Advocacy, International', frequency: '528 Hz', color: 'from-blue-700 to-indigo-800', description: 'United Nations advocacy, CSW70 coverage, and international human rights programming.', streamUrl: 'https://fm939.wnyc.org/wnycfm', listeners: 35, nowPlaying: 'CSW70 Coverage', category: 'Community', coverImage: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/ch53_un_advocacy_radio-QaoRfuZ5ywAyd7KzLfNzUR.webp' },
  { id: 54, name: 'Canryn Production Radio', icon: '🏢', genre: 'Corporate, Updates', frequency: '432 Hz', color: 'from-amber-600 to-orange-700', description: 'Official Canryn Production updates, ecosystem news, and subsidiary highlights.', streamUrl: 'https://listen.181fm.com/181-soul_128k.mp3', listeners: 31, nowPlaying: 'Ecosystem Update', category: 'Specialty', coverImage: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/ch54_canryn_production_radio-kozFcvbMZTksygAHNvcFfq.webp' },
];

export const RRBRadioIntegration: React.FC = () => {
  const [, navigate] = useLocation();
  const { openRestream } = useRestreamUrl();
  const [selectedChannel, setSelectedChannel] = useState(channels[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [streamStatus, setStreamStatus] = useState<'connected' | 'reconnecting' | 'failover'>('connected');
  const [totalListeners, setTotalListeners] = useState(3847);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showAllFilters, setShowAllFilters] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const failoverAttemptsRef = useRef(0);
  const isRetryingRef = useRef(false);

  // Filtered channels
  const filteredChannels = useMemo(() => {
    return channels.filter(ch => {
      const matchesFilter = activeFilter === 'All' || ch.category === activeFilter;
      const matchesSearch = searchQuery === '' ||
        ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  // Backup stream pool for failover — QUMUS auto-recovery
  const backupStreams = useMemo(() => [
    'https://funkyradio.streamingmedia.it/play.mp3',
    'https://listen.181fm.com/181-soul_128k.mp3',
    'https://npr-ice.streamguys1.com/live.mp3',
    'https://fm939.wnyc.org/wnycfm',
    'https://tunein.cdnstream1.com/2868_96.mp3',
    'https://stream.0nlineradio.com/soul',
    'https://stream.zeno.fm/yn65fsaurfhvv',
  ], []);

  // Create audio element with auto-failover — stable ref, no re-creation
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'none';
    audioRef.current = audio;

    audio.addEventListener('error', () => {
      // Guard against concurrent retries
      if (isRetryingRef.current) return;
      
      failoverAttemptsRef.current += 1;
      const attempt = failoverAttemptsRef.current;
      
      if (attempt <= 3) {
        isRetryingRef.current = true;
        setStreamStatus('reconnecting');
        setAudioError(`Reconnecting... (attempt ${attempt}/3)`);
        const backup = backupStreams[Math.floor(Math.random() * backupStreams.length)];
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.src = backup;
            audioRef.current.play().then(() => {
              setStreamStatus('failover');
              setAudioError('Playing backup stream — primary stream recovering');
              setIsPlaying(true);
              isRetryingRef.current = false;
            }).catch(() => {
              isRetryingRef.current = false;
              // Don't trigger error handler again — we already counted this attempt
              if (failoverAttemptsRef.current >= 3) {
                setAudioError('Stream temporarily unavailable. Try another channel.');
                setIsPlaying(false);
                setStreamStatus('connected');
                failoverAttemptsRef.current = 0;
              }
            });
          } else {
            isRetryingRef.current = false;
          }
        }, 1500 * attempt); // Exponential backoff: 1.5s, 3s, 4.5s
      } else {
        setAudioError('All streams unavailable. QUMUS is working to restore service.');
        setIsPlaying(false);
        setStreamStatus('connected');
        failoverAttemptsRef.current = 0;
      }
    });
    
    audio.addEventListener('playing', () => {
      setAudioError(null);
      setStreamStatus(failoverAttemptsRef.current > 0 ? 'failover' : 'connected');
      failoverAttemptsRef.current = 0;
      isRetryingRef.current = false;
    });
    
    audio.addEventListener('canplay', () => {
      // Stream is ready to play — clear any reconnection state
      isRetryingRef.current = false;
    });

    return () => { audio.pause(); audio.src = ''; };
  }, [backupStreams]); // Removed streamStatus dependency to prevent audio element recreation

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Listener count simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalListeners(prev => Math.max(2500, prev + Math.floor(Math.random() * 21) - 10));
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleChannelSelect = (channel: typeof channels[0]) => {
    const wasPlaying = isPlaying;
    // Reset retry state on channel switch
    failoverAttemptsRef.current = 0;
    isRetryingRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = ''; // Clear source to prevent stale error events
    }
    setSelectedChannel(channel);
    setAudioError(null);
    setStreamStatus('connected');
    if (wasPlaying && audioRef.current) {
      audioRef.current.src = channel.streamUrl;
      audioRef.current.play().catch(() => {
        setAudioError('Tap play to start streaming');
        setIsPlaying(false);
      });
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Reset retry state on fresh play
      failoverAttemptsRef.current = 0;
      isRetryingRef.current = false;
      setAudioError(null);
      setStreamStatus('connected');
      audioRef.current.src = selectedChannel.streamUrl;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
        setAudioError('Unable to connect. Please try again.');
        setIsPlaying(false);
      });
    }
  };

  const handleNextChannel = () => {
    const currentIndex = channels.findIndex(c => c.id === selectedChannel.id);
    const nextChannel = channels[(currentIndex + 1) % channels.length];
    handleChannelSelect(nextChannel);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E8E0D0]">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-[#D4A843]/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A2E] via-[#0A0A0A] to-[#1A3A5C]/20" />
        <div className="relative container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <Radio className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#D4A843]">RRB Radio</h1>
              <p className="text-[#E8E0D0]/60">Rockin' Rockin' Boogie • Payten Music (BMI) • Canryn Production</p>
              <div className="mt-1"><RRBSongBadge variant="inline" /></div>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#E8E0D0]/50 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-[#D4A843]" /> {channels.length} Channels
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#D4A843]" /> {totalListeners.toLocaleString()} Listeners
            </span>
            <span className="flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-green-500" /> 24/7 Live
            </span>
            <span className="flex items-center gap-1.5">
              <Music className="w-4 h-4 text-[#D4A843]" /> 432 Hz Default
            </span>
          </div>
        </div>
      </div>

      {/* Now Playing Bar */}
      <div className="bg-[#111] border-b border-[#D4A843]/10 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayPause}
                className="w-14 h-14 rounded-full bg-[#D4A843] hover:bg-[#E8C860] transition-colors flex items-center justify-center text-[#0A0A0A] flex-shrink-0"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </button>
              <button onClick={handleNextChannel} className="w-10 h-10 rounded-full bg-[#222] hover:bg-[#333] flex items-center justify-center text-[#E8E0D0]/60" aria-label="Next channel">
                <SkipForward className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  {(selectedChannel as any).coverImage ? (
                    <img src={(selectedChannel as any).coverImage} alt={selectedChannel.name} className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <span className="text-2xl">{selectedChannel.icon}</span>
                  )}
                  <h2 className="text-xl font-bold text-[#E8E0D0]">{selectedChannel.name}</h2>
                  {isPlaying && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse text-xs">
                      LIVE
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-[#E8E0D0]/50">
                  {selectedChannel.genre} • {selectedChannel.frequency} • {selectedChannel.nowPlaying}
                </p>
                {audioError && <p className="text-xs text-amber-400 mt-1">{audioError}</p>}
                {(selectedChannel as any).isArtistStation && (
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {(selectedChannel as any).appleMusicUrl && (
                      <a href={(selectedChannel as any).appleMusicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity">
                        <Music className="w-3.5 h-3.5" /> Apple Music
                      </a>
                    )}
                    {(selectedChannel as any).spotifyUrl && (
                      <a href={(selectedChannel as any).spotifyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity">
                        <Headphones className="w-3.5 h-3.5" /> Spotify
                      </a>
                    )}
                    {(selectedChannel as any).soundcloudUrl && (
                      <a href={(selectedChannel as any).soundcloudUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity">
                        <Wifi className="w-3.5 h-3.5" /> SoundCloud
                      </a>
                    )}
                    {(selectedChannel as any).tidalUrl && (
                      <a href={(selectedChannel as any).tidalUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-gradient-to-r from-slate-700 to-slate-800 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity">
                        <Music className="w-3.5 h-3.5" /> TIDAL
                      </a>
                    )}
                    {(selectedChannel as any).deezerUrl && (
                      <a href={(selectedChannel as any).deezerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-violet-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity">
                        <Music className="w-3.5 h-3.5" /> Deezer
                      </a>
                    )}
                    {(selectedChannel as any).youtubeUrl && (
                      <a href={(selectedChannel as any).youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity">
                        <Play className="w-3.5 h-3.5" /> YouTube
                      </a>
                    )}
                    {(selectedChannel as any).instagramUrl && (
                      <a href={(selectedChannel as any).instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity">
                        <Heart className="w-3.5 h-3.5" /> Instagram
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setIsMuted(!isMuted)} className="text-[#E8E0D0]/60 hover:text-[#E8E0D0]">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range" min="0" max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => { setVolume(parseInt(e.target.value)); setIsMuted(false); }}
                  className="w-24 h-1 accent-[#D4A843]"
                />
              </div>
              <span className="text-xs text-[#E8E0D0]/40 flex items-center gap-1">
                <Headphones className="w-3.5 h-3.5" /> {selectedChannel.listeners}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#0D0D0D] border-b border-[#D4A843]/10">
        <div className="container mx-auto px-4 py-4">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E8E0D0]/30" />
            <input
              type="text"
              placeholder="Search 54 channels by name, genre, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#111] border border-[#222] rounded-lg text-[#E8E0D0] placeholder-[#E8E0D0]/30 focus:border-[#D4A843]/50 focus:outline-none"
            />
          </div>
          {/* Genre Filters */}
          <div className="flex flex-wrap gap-2">
            {(showAllFilters ? GENRE_FILTERS : GENRE_FILTERS.slice(0, 6)).map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-[#D4A843] text-[#0A0A0A]'
                    : 'bg-[#111] text-[#E8E0D0]/60 border border-[#222] hover:border-[#D4A843]/30'
                }`}
              >
                {filter}
              </button>
            ))}
            <button
              onClick={() => setShowAllFilters(!showAllFilters)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#111] text-[#D4A843] border border-[#D4A843]/30 hover:bg-[#D4A843]/10 flex items-center gap-1"
            >
              {showAllFilters ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> {GENRE_FILTERS.length - 6} More</>}
            </button>
          </div>
        </div>
      </div>

      {/* Channel Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#D4A843]">
            {activeFilter === 'All' ? 'All Channels' : activeFilter}
            <span className="text-sm font-normal text-[#E8E0D0]/40 ml-2">({filteredChannels.length})</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChannels.map(channel => (
            <button
              key={channel.id}
              onClick={() => handleChannelSelect(channel)}
              className={`text-left p-5 rounded-lg border transition-all ${
                selectedChannel.id === channel.id
                  ? 'bg-[#D4A843]/10 border-[#D4A843]/50'
                  : 'bg-[#111] border-[#222] hover:border-[#D4A843]/30'
              }`}
            >
              <div className="flex items-start gap-3">
                {(channel as any).coverImage ? (
                  <img src={(channel as any).coverImage} alt={channel.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${channel.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {channel.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[#E8E0D0]">{channel.name}</h3>
                    {selectedChannel.id === channel.id && isPlaying && (
                      <div className="flex gap-0.5">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-1 bg-[#D4A843] rounded-full animate-pulse" style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[#D4A843]/70 mb-1">{channel.genre} • {channel.frequency}</p>
                  <p className="text-xs text-[#E8E0D0]/40 line-clamp-2">{channel.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[#E8E0D0]/30">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {channel.listeners}</span>
                    <span className="italic truncate">{channel.nowPlaying}</span>
                  </div>
                  {(channel as any).isArtistStation && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {(channel as any).appleMusicUrl && (
                        <a href={(channel as any).appleMusicUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs bg-gradient-to-r from-pink-500 to-red-500 text-white px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity flex items-center gap-1">
                          <Music className="w-3 h-3" /> Apple
                        </a>
                      )}
                      {(channel as any).spotifyUrl && (
                        <a href={(channel as any).spotifyUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity flex items-center gap-1">
                          <Music className="w-3 h-3" /> Spotify
                        </a>
                      )}
                      {(channel as any).soundcloudUrl && (
                        <a href={(channel as any).soundcloudUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity flex items-center gap-1">
                          SC
                        </a>
                      )}
                      {(channel as any).tidalUrl && (
                        <a href={(channel as any).tidalUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs bg-slate-700 text-white px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity">
                          TIDAL
                        </a>
                      )}
                      {(channel as any).deezerUrl && (
                        <a href={(channel as any).deezerUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity">
                          Deezer
                        </a>
                      )}
                      {(channel as any).youtubeUrl && (
                        <a href={(channel as any).youtubeUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity">
                          YT
                        </a>
                      )}
                      {(channel as any).instagramUrl && (
                        <a href={(channel as any).instagramUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs bg-fuchsia-600 text-white px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity">
                          IG
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
        {filteredChannels.length === 0 && (
          <div className="text-center py-12">
            <Radio className="w-12 h-12 text-[#E8E0D0]/20 mx-auto mb-4" />
            <p className="text-[#E8E0D0]/40">No channels match your search. Try a different filter or keyword.</p>
          </div>
        )}
      </div>

      {/* Frequency Info */}
      <div className="border-t border-[#D4A843]/10 bg-[#111]/50">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-[#D4A843] mb-6">Healing Frequencies</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { hz: '432 Hz', name: 'Universal Harmony', desc: 'Natural tuning — reduces anxiety, promotes calm' },
              { hz: '528 Hz', name: 'Love Frequency', desc: 'DNA repair, transformation, miracles' },
              { hz: '639 Hz', name: 'Connection', desc: 'Harmonizing relationships, communication' },
              { hz: '741 Hz', name: 'Awakening', desc: 'Intuition, problem solving, self-expression' },
            ].map(freq => (
              <div key={freq.hz} className="p-4 bg-[#0A0A0A] border border-[#D4A843]/10 rounded-lg">
                <p className="text-2xl font-bold text-[#D4A843] mb-1">{freq.hz}</p>
                <p className="text-sm font-semibold text-[#E8E0D0]/80 mb-1">{freq.name}</p>
                <p className="text-xs text-[#E8E0D0]/40">{freq.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Valanna & Call-In Section */}
      <div className="border-t border-[#D4A843]/10 bg-gradient-to-r from-purple-900/20 to-[#0A0A0A]">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-[#111] border border-purple-500/20 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm">V</div>
                <div>
                  <h3 className="font-bold text-[#E8E0D0]">Valanna AI</h3>
                  <p className="text-xs text-purple-400">QUMUS-Powered Voice Assistant</p>
                </div>
              </div>
              <p className="text-sm text-[#E8E0D0]/60 mb-4">
                Valanna guides your experience across the entire Canryn Production ecosystem — from RRB Radio to HybridCast emergency broadcasts. She speaks, she listens, she delivers.
              </p>
              <Button className="bg-purple-600 hover:bg-purple-500 text-white w-full" onClick={() => navigate('/flyer')}>
                <FileText className="w-4 h-4 mr-2" /> Open Interactive Flyer
              </Button>
            </div>
            <div className="p-6 bg-[#111] border border-[#D4A843]/20 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="w-8 h-8 text-[#D4A843]" />
                <div>
                  <h3 className="font-bold text-[#E8E0D0]">Call-In Line</h3>
                  <p className="text-xs text-[#D4A843]/70">Live Feedback & Interaction</p>
                </div>
              </div>
              <p className="text-sm text-[#E8E0D0]/60 mb-4">
                Join the conversation live during broadcasts. Share your story, ask questions, or send a shout-out to the community. Your voice matters.
              </p>
              <Button variant="outline" className="border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/10 w-full" onClick={openRestream}>
                <Wifi className="w-4 h-4 mr-2" /> Join Live Broadcast
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="border-t border-[#D4A843]/10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button className="bg-[#D4A843] text-[#0A0A0A] hover:bg-[#E8C860]" onClick={openRestream}>
              <Radio className="w-4 h-4 mr-2" /> Live Stream
            </Button>
            <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10" onClick={() => navigate('/flyer')}>
              <Share2 className="w-4 h-4 mr-2" /> Interactive Flyer
            </Button>
            <Button variant="outline" className="border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/10" onClick={() => navigate('/selma')}>
              <MapPin className="w-4 h-4 mr-2" /> Selma Event
            </Button>
            <Button variant="outline" className="border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/10" onClick={() => navigate('/squadd')}>
              <Earth className="w-4 h-4 mr-2" /> SQUADD Goals
            </Button>
            <Button variant="outline" className="border-[#E8E0D0]/20 text-[#E8E0D0]/60 hover:bg-[#E8E0D0]/10" onClick={() => navigate('/')}>
              <ArrowRight className="w-4 h-4 mr-2" /> Ecosystem Home
            </Button>
          </div>
          <p className="text-center text-xs text-[#E8E0D0]/30 mt-6">
            Payten Music (BMI) • Canryn Production • QUMUS Autonomous Engine • In Honor of Seabrun Candy Hunter
          </p>
          <p className="text-center text-xs text-[#E8E0D0]/20 mt-2">
            All content is protected under applicable copyright laws. Unauthorized reproduction or distribution is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RRBRadioIntegration;
