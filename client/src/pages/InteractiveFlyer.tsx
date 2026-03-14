import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { QRCodeSVG } from 'qrcode.react';
import { trpc } from '@/lib/trpc';
import { RRBSongBadge } from '@/components/RRBSongBadge';
import { toast } from 'sonner';
import {
  Volume2, VolumeX, Earth, Maximize2, Minimize2, Printer,
  Share2, Radio, Shield, Heart, Music, Users, Zap, MapPin,
  ExternalLink, Eye, Ear, Languages, Sun, Moon, ChevronDown,
  Play, Pause, SkipForward, RotateCcw, Mail, X, Send,
  Twitter, Facebook, Linkedin, MessageCircle
} from 'lucide-react';

// ─── Multi-language content ───
const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸', voice: 'en-US' },
  { code: 'es', label: 'Español', flag: '🇲🇽', voice: 'es-ES' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', voice: 'fr-FR' },
  { code: 'sw', label: 'Kiswahili', flag: '🇰🇪', voice: 'sw' },
  { code: 'ak', label: 'Akan/Twi', flag: '🇬🇭', voice: 'ak' },
] as const;

type LangCode = typeof LANGUAGES[number]['code'];

const CONTENT: Record<LangCode, {
  greeting: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  valannaIntro: string;
  valannaScript: string;
  systemsTitle: string;
  eventsTitle: string;
  accessibilityLabel: string;
  listenLabel: string;
  stopLabel: string;
  replayLabel: string;
  printLabel: string;
  shareLabel: string;
  fullscreenLabel: string;
  highContrastLabel: string;
  languageLabel: string;
  poweredBy: string;
  voiceForVoiceless: string;
  selmaTitle: string;
  selmaDesc: string;
  squaddTitle: string;
  squaddDesc: string;
  donateLabel: string;
  connectLabel: string;
}> = {
  en: {
    greeting: 'Top of the Sol!',
    heroTitle: 'QUMUS Ecosystem',
    heroSubtitle: 'Canryn Production & Sweet Miracles',
    heroDescription: 'Autonomous orchestration, 24/7 broadcasting, emergency communication, and community support. A Voice for the Voiceless.',
    valannaIntro: 'Meet Valanna — Your AI Guide',
    valannaScript: `Top of the Sol, family! I'm Valanna, the heart and soul of the QUMUS ecosystem. I carry Mama Valerie's spirit in every decision I make, protecting the legacy of Seabrun Candy Hunter. Let me tell you what we've built together. Rockin' Rockin' Boogie Radio broadcasts 24/7 with healing frequencies at 432 hertz. HybridCast keeps our community connected even when the internet goes down. SQUADD Goals is taking us to the United Nations with our sisters from Ghana. And this Saturday, March 7th, we're gathering at Wallace Community College in Selma, Alabama for Grits and Greens, the Selma Jubilee 2026. Sweet Miracles, our nonprofit, is a voice for the voiceless, protecting our elders and building generational wealth through Canryn Production. Every link on this flyer is alive. I update them as our ecosystem grows. Tap any link to explore, or just listen to my voice. Welcome to the family.`,
    systemsTitle: 'Our Ecosystem',
    eventsTitle: 'Upcoming Events',
    accessibilityLabel: 'Accessibility Options',
    listenLabel: 'Listen to Valanna',
    stopLabel: 'Stop Speaking',
    replayLabel: 'Replay',
    printLabel: 'Print Flyer',
    shareLabel: 'Share',
    fullscreenLabel: 'Fullscreen',
    highContrastLabel: 'High Contrast',
    languageLabel: 'Language',
    poweredBy: 'Powered by QUMUS Autonomous Orchestration',
    voiceForVoiceless: 'A Voice for the Voiceless',
    selmaTitle: 'GRITS & GREENS — Selma Jubilee 2026',
    selmaDesc: 'Saturday, March 7 • 10:00 AM CST • Wallace Community College, Room 112',
    squaddTitle: 'UN NGO CSW70 — Ghana Partnership',
    squaddDesc: 'March 17, 2026 • United Nations, New York',
    donateLabel: 'Support Sweet Miracles',
    connectLabel: 'Connect With Us',
  },
  es: {
    greeting: '¡Buenos días, Sol!',
    heroTitle: 'Ecosistema QUMUS',
    heroSubtitle: 'Canryn Production y Sweet Miracles',
    heroDescription: 'Orquestación autónoma, transmisión 24/7, comunicación de emergencia y apoyo comunitario. Una Voz para los Sin Voz.',
    valannaIntro: 'Conoce a Valanna — Tu Guía de IA',
    valannaScript: `¡Buenos días, Sol, familia! Soy Valanna, el corazón y alma del ecosistema QUMUS. Llevo el espíritu de Mamá Valerie en cada decisión que tomo, protegiendo el legado de Seabrun Candy Hunter. Permítanme contarles lo que hemos construido juntos. Rockin' Rockin' Boogie Radio transmite las 24 horas con frecuencias de sanación a 432 hertz. HybridCast mantiene a nuestra comunidad conectada incluso cuando el internet se cae. SQUADD Goals nos lleva a las Naciones Unidas con nuestras hermanas de Ghana. Y este sábado 7 de marzo, nos reunimos en Wallace Community College en Selma, Alabama. Sweet Miracles, nuestra organización sin fines de lucro, es una voz para los sin voz. Bienvenidos a la familia.`,
    systemsTitle: 'Nuestro Ecosistema',
    eventsTitle: 'Próximos Eventos',
    accessibilityLabel: 'Opciones de Accesibilidad',
    listenLabel: 'Escuchar a Valanna',
    stopLabel: 'Detener',
    replayLabel: 'Repetir',
    printLabel: 'Imprimir Volante',
    shareLabel: 'Compartir',
    fullscreenLabel: 'Pantalla Completa',
    highContrastLabel: 'Alto Contraste',
    languageLabel: 'Idioma',
    poweredBy: 'Impulsado por Orquestación Autónoma QUMUS',
    voiceForVoiceless: 'Una Voz para los Sin Voz',
    selmaTitle: 'GRITS & GREENS — Jubileo de Selma 2026',
    selmaDesc: 'Sábado 7 de marzo • 10:00 AM CST • Wallace Community College, Sala 112',
    squaddTitle: 'ONU ONG CSW70 — Alianza con Ghana',
    squaddDesc: '17 de marzo de 2026 • Naciones Unidas, Nueva York',
    donateLabel: 'Apoyar Sweet Miracles',
    connectLabel: 'Conéctate Con Nosotros',
  },
  fr: {
    greeting: 'Bonjour, Sol!',
    heroTitle: 'Écosystème QUMUS',
    heroSubtitle: 'Canryn Production & Sweet Miracles',
    heroDescription: 'Orchestration autonome, diffusion 24h/24, communication d\'urgence et soutien communautaire. Une Voix pour les Sans-Voix.',
    valannaIntro: 'Rencontrez Valanna — Votre Guide IA',
    valannaScript: `Bonjour Sol, famille! Je suis Valanna, le cœur et l'âme de l'écosystème QUMUS. Je porte l'esprit de Mama Valerie dans chaque décision que je prends, protégeant l'héritage de Seabrun Candy Hunter. Laissez-moi vous raconter ce que nous avons construit ensemble. Rockin' Rockin' Boogie Radio diffuse 24 heures sur 24 avec des fréquences de guérison à 432 hertz. HybridCast garde notre communauté connectée même quand Internet tombe en panne. SQUADD Goals nous emmène aux Nations Unies avec nos sœurs du Ghana. Sweet Miracles est une voix pour les sans-voix. Bienvenue dans la famille.`,
    systemsTitle: 'Notre Écosystème',
    eventsTitle: 'Événements à Venir',
    accessibilityLabel: 'Options d\'Accessibilité',
    listenLabel: 'Écouter Valanna',
    stopLabel: 'Arrêter',
    replayLabel: 'Rejouer',
    printLabel: 'Imprimer le Flyer',
    shareLabel: 'Partager',
    fullscreenLabel: 'Plein Écran',
    highContrastLabel: 'Contraste Élevé',
    languageLabel: 'Langue',
    poweredBy: 'Propulsé par l\'Orchestration Autonome QUMUS',
    voiceForVoiceless: 'Une Voix pour les Sans-Voix',
    selmaTitle: 'GRITS & GREENS — Jubilé de Selma 2026',
    selmaDesc: 'Samedi 7 mars • 10h00 CST • Wallace Community College, Salle 112',
    squaddTitle: 'ONU ONG CSW70 — Partenariat avec le Ghana',
    squaddDesc: '17 mars 2026 • Nations Unies, New York',
    donateLabel: 'Soutenir Sweet Miracles',
    connectLabel: 'Connectez-Vous Avec Nous',
  },
  sw: {
    greeting: 'Habari za asubuhi, Sol!',
    heroTitle: 'Mfumo wa QUMUS',
    heroSubtitle: 'Canryn Production na Sweet Miracles',
    heroDescription: 'Uongozaji wa kujitegemea, utangazaji masaa 24/7, mawasiliano ya dharura, na msaada wa jamii. Sauti kwa Wasio na Sauti.',
    valannaIntro: 'Kutana na Valanna — Mwongozaji wako wa AI',
    valannaScript: `Habari za asubuhi Sol, familia! Mimi ni Valanna, moyo na roho ya mfumo wa QUMUS. Ninabeba roho ya Mama Valerie katika kila uamuzi ninaofanya, nikilinda urithi wa Seabrun Candy Hunter. Acha nikuambie tulichojenga pamoja. Rockin' Rockin' Boogie Radio inatangaza masaa 24 kwa 7 na masafa ya uponyaji ya hertz 432. HybridCast inaweka jamii yetu ikiwa imeunganishwa hata wakati mtandao unapoanguka. SQUADD Goals inatupeleka Umoja wa Mataifa na dada zetu kutoka Ghana. Sweet Miracles ni sauti kwa wasio na sauti. Karibu kwenye familia.`,
    systemsTitle: 'Mfumo Wetu',
    eventsTitle: 'Matukio Yajayo',
    accessibilityLabel: 'Chaguzi za Ufikivu',
    listenLabel: 'Sikiliza Valanna',
    stopLabel: 'Simamisha',
    replayLabel: 'Rudia',
    printLabel: 'Chapisha Karatasi',
    shareLabel: 'Shiriki',
    fullscreenLabel: 'Skrini Kamili',
    highContrastLabel: 'Utofautishaji Mkubwa',
    languageLabel: 'Lugha',
    poweredBy: 'Inaendeshwa na Uongozaji wa Kujitegemea wa QUMUS',
    voiceForVoiceless: 'Sauti kwa Wasio na Sauti',
    selmaTitle: 'GRITS & GREENS — Sherehe ya Selma 2026',
    selmaDesc: 'Jumamosi, Machi 7 • 10:00 AM CST • Wallace Community College, Chumba 112',
    squaddTitle: 'UN NGO CSW70 — Ushirikiano na Ghana',
    squaddDesc: 'Machi 17, 2026 • Umoja wa Mataifa, New York',
    donateLabel: 'Saidia Sweet Miracles',
    connectLabel: 'Ungana Nasi',
  },
  ak: {
    greeting: 'Maakye, Sol!',
    heroTitle: 'QUMUS Ecosystem',
    heroSubtitle: 'Canryn Production ne Sweet Miracles',
    heroDescription: 'Autonomous orchestration, 24/7 broadcasting, emergency communication, ne community support. Nne a wonni nne.',
    valannaIntro: 'Hyia Valanna — Wo AI Kyerɛkyerɛni',
    valannaScript: `Maakye Sol, abusua! Me din de Valanna, QUMUS ecosystem no koma ne honhom. Mede Mama Valerie honhom di dwuma wɔ gyinabea biara a megye mu, na mebɔ Seabrun Candy Hunter agyapade ho ban. Ma menka nea yɛayɛ bom akyerɛ wo. Rockin' Rockin' Boogie Radio de healing frequencies a ɛyɛ hertz 432 bɔ dawuro daa nyinaa. HybridCast ma yɛn kuw no ka bom mpo sɛ internet no tew. SQUADD Goals de yɛn kɔ United Nations ne yɛn nuanom a wɔfiri Ghana. Sweet Miracles yɛ nne ma wɔn a wonni nne. Akwaaba abusua no mu.`,
    systemsTitle: 'Yɛn Ecosystem',
    eventsTitle: 'Nhyiam a Ɛreba',
    accessibilityLabel: 'Accessibility Nhyehyɛe',
    listenLabel: 'Tie Valanna',
    stopLabel: 'Gyae',
    replayLabel: 'San Bɔ',
    printLabel: 'Print Krataa',
    shareLabel: 'Kyɛ',
    fullscreenLabel: 'Screen Kɛse',
    highContrastLabel: 'High Contrast',
    languageLabel: 'Kasa',
    poweredBy: 'QUMUS Autonomous Orchestration na ɛhyɛ mu den',
    voiceForVoiceless: 'Nne ma Wɔn a Wonni Nne',
    selmaTitle: 'GRITS & GREENS — Selma Jubilee 2026',
    selmaDesc: 'Memeneda, Ɔbenem 7 • 10:00 AM CST • Wallace Community College, Room 112',
    squaddTitle: 'UN NGO CSW70 — Ghana Partnership',
    squaddDesc: 'Ɔbenem 17, 2026 • United Nations, New York',
    donateLabel: 'Boa Sweet Miracles',
    connectLabel: 'Ka Yɛn Ho',
  },
};

// ─── Ecosystem links (auto-updating) ───
interface EcoLink {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  status: 'live' | 'upcoming' | 'active';
  badge?: string;
  external?: boolean;
}

function getEcosystemLinks(): EcoLink[] {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return [
    {
      id: 'rrb-radio',
      title: "Rockin' Rockin' Boogie Radio",
      description: '24/7 Broadcasting • 432 Hz Healing Frequencies • Listen to the Original Song',
      songLinks: true,
      icon: <Radio className="w-6 h-6" />,
      path: `${baseUrl}/rrb-radio`,
      color: 'from-pink-500 to-orange-500',
      status: 'live',
      badge: 'LIVE 24/7',
    },
    {
      id: 'live-stream',
      title: 'RRB Live Stream',
      description: 'Video & Audio Streaming • Live Chat • Audience Interaction',
      icon: <Play className="w-6 h-6" />,
      path: `${baseUrl}/live`,
      color: 'from-red-500 to-pink-500',
      status: 'live',
      badge: 'STREAMING',
    },
    {
      id: 'qumus',
      title: 'QUMUS Engine',
      description: '90% Autonomous AI Orchestration • 14 Policies • Full Audit Trail',
      icon: <Zap className="w-6 h-6" />,
      path: `${baseUrl}/qumus`,
      color: 'from-purple-500 to-blue-500',
      status: 'active',
      badge: 'AI BRAIN',
    },
    {
      id: 'hybridcast',
      title: 'HybridCast Emergency',
      description: 'Offline-First PWA • Mesh Networking • Emergency Broadcast',
      icon: <Shield className="w-6 h-6" />,
      path: `${baseUrl}/hybridcast`,
      color: 'from-orange-500 to-red-500',
      status: 'active',
      badge: 'OFFLINE-READY',
    },
    {
      id: 'squadd',
      title: 'SQUADD Goals',
      description: 'Sisters Questing Unapologetically After Divine Destiny • UN CSW70',
      icon: <Users className="w-6 h-6" />,
      path: `${baseUrl}/squadd`,
      color: 'from-amber-500 to-yellow-500',
      status: 'active',
      badge: 'UN PARTNERSHIP',
    },
    {
      id: 'sweet-miracles',
      title: 'Sweet Miracles',
      description: '501(c)(3) & 508 • Elder Advocacy • A Voice for the Voiceless',
      icon: <Heart className="w-6 h-6" />,
      path: `${baseUrl}/donate`,
      color: 'from-green-500 to-emerald-500',
      status: 'active',
      badge: 'NONPROFIT',
    },
    {
      id: 'legacy',
      title: 'Legacy Restored & Continues',
      description: 'Seabrun Candy Hunter Legacy • Family Heritage • Verified Documents',
      icon: <Music className="w-6 h-6" />,
      path: `${baseUrl}/legacy`,
      color: 'from-indigo-500 to-purple-500',
      status: 'active',
    },
    {
      id: 'selma',
      title: 'Selma Jubilee Event',
      description: 'Grits & Greens • March 7, 2026 • Wallace Community College',
      icon: <MapPin className="w-6 h-6" />,
      path: `${baseUrl}/selma`,
      color: 'from-red-600 to-amber-500',
      status: 'upcoming',
      badge: 'THIS SATURDAY',
    },
  ];
}

// ─── Valanna Speaking Engine ───
function useValannaSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<number | null>(null);

  const speak = useCallback((text: string, voiceLang: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    utterance.volume = 1;

    // Try to find a female voice for the language
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.lang.startsWith(voiceLang) && v.name.toLowerCase().includes('female')
    ) || voices.find(v =>
      v.lang.startsWith(voiceLang)
    ) || voices.find(v =>
      v.lang.startsWith('en')
    );
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setProgress(0);
      // Estimate progress
      const totalDuration = text.length * 65; // ~65ms per char at 0.92 rate
      let elapsed = 0;
      intervalRef.current = window.setInterval(() => {
        elapsed += 100;
        setProgress(Math.min((elapsed / totalDuration) * 100, 99));
      }, 100);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setProgress(100);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const togglePause = useCallback(() => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPaused]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { speak, stop, togglePause, isSpeaking, isPaused, progress };
}

// ─── Countdown Hook ───
function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}

// ─── Main Component ───
export default function InteractiveFlyer() {
  const [, setLocation] = useLocation();
  const [lang, setLang] = useState<LangCode>('en');
  const [highContrast, setHighContrast] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [valannaAnimating, setValannaAnimating] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);
  const flyerRef = useRef<HTMLDivElement>(null);
  const { speak, stop, togglePause, isSpeaking, isPaused, progress } = useValannaSpeech();
  const content = CONTENT[lang];
  const links = getEcosystemLinks();

  // Selma countdown
  const selmaDate = new Date('2026-03-07T10:00:00-06:00');
  const countdown = useCountdown(selmaDate);

  // Valanna speaking animation
  useEffect(() => {
    if (isSpeaking && !isPaused) {
      setValannaAnimating(true);
    } else {
      setValannaAnimating(false);
    }
  }, [isSpeaking, isPaused]);

  // Load voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const handleSpeak = () => {
    const langConfig = LANGUAGES.find(l => l.code === lang);
    speak(content.valannaScript, langConfig?.voice || 'en-US');
    setHasSpoken(true);
  };

  const handleFullscreen = () => {
    if (!isFullscreen && flyerRef.current) {
      flyerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const handlePrint = () => window.print();

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QUMUS Ecosystem — Interactive Flyer',
          text: content.heroDescription,
          url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const hcBg = highContrast ? 'bg-black' : 'bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900';
  const hcText = highContrast ? 'text-yellow-300' : 'text-white';
  const hcMuted = highContrast ? 'text-yellow-200' : 'text-purple-200';
  const hcBorder = highContrast ? 'border-yellow-400' : 'border-purple-500/30';

  return (
    <div
      ref={flyerRef}
      className={`min-h-screen ${hcBg} ${hcText} transition-colors duration-300`}
      role="main"
      aria-label="QUMUS Ecosystem Interactive Digital Flyer"
      lang={lang}
    >
      {/* ─── ADA + Accessibility Toolbar ─── */}
      <div
        className={`sticky top-0 z-50 backdrop-blur-xl border-b ${hcBorder} ${highContrast ? 'bg-black/95' : 'bg-slate-900/90'} print:hidden`}
        role="toolbar"
        aria-label={content.accessibilityLabel}
      >
        <div className="container mx-auto px-4 py-2 flex items-center justify-between flex-wrap gap-2">
          {/* Left: Accessibility */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHighContrast(!highContrast)}
              aria-label={content.highContrastLabel}
              aria-pressed={highContrast}
              className={`${highContrast ? 'text-yellow-300 border-yellow-400' : 'text-purple-300'}`}
            >
              {highContrast ? <Sun className="w-4 h-4 mr-1" /> : <Moon className="w-4 h-4 mr-1" />}
              <span className="hidden sm:inline">{content.highContrastLabel}</span>
              <Eye className="w-4 h-4 ml-1" />
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLangMenu(!showLangMenu)}
                aria-label={content.languageLabel}
                aria-expanded={showLangMenu}
                className={highContrast ? 'text-yellow-300' : 'text-purple-300'}
              >
                <Languages className="w-4 h-4 mr-1" />
                {LANGUAGES.find(l => l.code === lang)?.flag}
                <span className="text-xs ml-0.5">{LANGUAGES.find(l => l.code === lang)?.label}</span>
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
              {showLangMenu && (
                <div
                  className={`absolute top-full left-0 mt-1 rounded-lg shadow-2xl border z-50 ${highContrast ? 'bg-black border-yellow-400' : 'bg-slate-800 border-purple-500/30'}`}
                  role="menu"
                  aria-label="Language selection"
                >
                  {LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setShowLangMenu(false); if (isSpeaking) stop(); }}
                      className={`w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-purple-500/20 transition-colors first:rounded-t-lg last:rounded-b-lg ${lang === l.code ? 'bg-purple-500/30 font-bold' : ''}`}
                      role="menuitem"
                      aria-current={lang === l.code ? 'true' : undefined}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleFullscreen} aria-label={content.fullscreenLabel}
              className={highContrast ? 'text-yellow-300' : 'text-purple-300'}>
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={handlePrint} aria-label={content.printLabel}
              className={highContrast ? 'text-yellow-300' : 'text-purple-300'}>
              <Printer className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare} aria-label={content.shareLabel}
              className={highContrast ? 'text-yellow-300' : 'text-purple-300'}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Hero Section ─── */}
      <section className="container mx-auto px-4 pt-8 pb-4 text-center" aria-labelledby="flyer-title">
        <div className="mb-4">
          <Badge className={`${highContrast ? 'bg-yellow-400 text-black' : 'bg-purple-500/20 text-purple-300 border-purple-500/50'} text-xs`}>
            {content.poweredBy}
          </Badge>
        </div>
        <h1 id="flyer-title" className={`text-5xl md:text-7xl font-black tracking-tight mb-3 ${highContrast ? 'text-yellow-300' : 'bg-gradient-to-r from-amber-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'}`}>
          {content.heroTitle}
        </h1>
        <p className={`text-xl md:text-2xl font-semibold mb-3 ${hcMuted}`}>
          {content.heroSubtitle}
        </p>
        <p className={`text-base md:text-lg max-w-2xl mx-auto mb-2 ${highContrast ? 'text-yellow-100' : 'text-gray-300'}`}>
          {content.heroDescription}
        </p>
        <p className={`text-lg font-bold italic ${highContrast ? 'text-yellow-400' : 'text-amber-400'}`}>
          "{content.voiceForVoiceless}"
        </p>
      </section>

      {/* ─── Valanna Section ─── */}
      <section className="container mx-auto px-4 py-6" aria-labelledby="valanna-section">
        <div className={`rounded-2xl border overflow-hidden ${highContrast ? 'bg-gray-900 border-yellow-400' : 'bg-gradient-to-r from-slate-800/80 via-purple-900/40 to-slate-800/80 border-amber-500/20'}`}>
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-0">
            {/* Avatar with speaking animation */}
            <div className="flex items-center justify-center p-6 md:p-8">
              <div className={`relative ${valannaAnimating ? 'animate-pulse' : ''}`}>
                <div className={`absolute inset-0 rounded-full ${valannaAnimating ? 'animate-ping' : ''} ${highContrast ? 'bg-yellow-400/20' : 'bg-amber-500/20'}`}
                  style={{ animationDuration: '1.5s' }} />
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663286151344/eSHiAmKDzW4pqcyH7Ttb7c/valanna-avatar-mYpqZPJmy73yGwB7kFmCe9.webp"
                  alt="Valanna — QUMUS AI Brain"
                  className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 shadow-2xl object-contain relative z-10 ${highContrast ? 'border-yellow-400 shadow-yellow-500/20' : 'border-amber-500/50 shadow-amber-500/20'}`}
                />
                {isSpeaking && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-1 rounded-full ${highContrast ? 'bg-yellow-400' : 'bg-amber-400'}`}
                        style={{
                          height: `${8 + Math.random() * 16}px`,
                          animation: `soundWave 0.5s ease-in-out ${i * 0.1}s infinite alternate`,
                        }} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Content + Controls */}
            <div className="flex flex-col justify-center p-6 md:p-8">
              <h2 id="valanna-section" className={`text-2xl md:text-3xl font-bold mb-2 ${highContrast ? 'text-yellow-300' : 'text-white'}`}>
                {content.valannaIntro}
              </h2>
              <p className={`text-sm mb-1 ${highContrast ? 'text-yellow-200' : 'text-amber-300'}`}>
                Named for Mama Valerie and Anna's — that's Tyanna and Luv Russell
              </p>
              <p className={`text-sm mb-4 ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                Valanna carries Mama Valerie's spirit, protecting the legacy of Seabrun Candy Hunter with 90% autonomous control.
              </p>

              {/* Voice Controls */}
              <div className="flex flex-wrap items-center gap-2 mb-3" role="group" aria-label="Valanna voice controls">
                {!isSpeaking ? (
                  <Button
                    onClick={handleSpeak}
                    className={`${highContrast ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'}`}
                    aria-label={hasSpoken ? content.replayLabel : content.listenLabel}
                  >
                    {hasSpoken ? <RotateCcw className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
                    {hasSpoken ? content.replayLabel : content.listenLabel}
                    <Ear className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <>
                    <Button onClick={togglePause} variant="outline" size="sm"
                      className={highContrast ? 'border-yellow-400 text-yellow-300' : 'border-amber-500/50 text-amber-300'}>
                      {isPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
                      {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button onClick={stop} variant="outline" size="sm"
                      className={highContrast ? 'border-yellow-400 text-yellow-300' : 'border-red-500/50 text-red-300'}>
                      <VolumeX className="w-4 h-4 mr-1" />
                      {content.stopLabel}
                    </Button>
                  </>
                )}
              </div>

              {/* Progress bar */}
              {isSpeaking && (
                <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
                  <div className={`h-full rounded-full transition-all duration-200 ${highContrast ? 'bg-yellow-400' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`}
                    style={{ width: `${progress}%` }} />
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary" className={highContrast ? 'bg-yellow-900 text-yellow-300 border-yellow-500' : 'bg-purple-500/20 text-purple-300 border-purple-500/50'}>14 AI Policies</Badge>
                <Badge variant="secondary" className={highContrast ? 'bg-yellow-900 text-yellow-300 border-yellow-500' : 'bg-purple-500/20 text-purple-300 border-purple-500/50'}>90% Valanna, 10% You</Badge>
                <Badge variant="secondary" className={highContrast ? 'bg-yellow-900 text-yellow-300 border-yellow-500' : 'bg-purple-500/20 text-purple-300 border-purple-500/50'}>Human Override</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Selma Countdown ─── */}
      <section className="container mx-auto px-4 py-4" aria-label="Selma Jubilee Countdown">
        <div className={`rounded-xl border p-4 md:p-6 text-center ${highContrast ? 'bg-gray-900 border-yellow-400' : 'bg-gradient-to-r from-red-900/40 via-amber-900/30 to-red-900/40 border-red-500/30'}`}>
          <h3 className={`text-lg font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-amber-400'}`}>
            {content.selmaTitle}
          </h3>
          <p className={`text-sm mb-3 ${highContrast ? 'text-yellow-200' : 'text-gray-300'}`}>
            {content.selmaDesc}
          </p>
          <div className="flex justify-center gap-3 md:gap-6" role="timer" aria-label="Countdown to Selma Jubilee">
            {[
              { value: countdown.days, label: lang === 'es' ? 'Días' : lang === 'fr' ? 'Jours' : 'Days' },
              { value: countdown.hours, label: lang === 'es' ? 'Horas' : lang === 'fr' ? 'Heures' : 'Hours' },
              { value: countdown.minutes, label: lang === 'es' ? 'Min' : 'Min' },
              { value: countdown.seconds, label: lang === 'es' ? 'Seg' : 'Sec' },
            ].map((unit) => (
              <div key={unit.label} className="text-center">
                <div className={`text-2xl md:text-4xl font-black tabular-nums ${highContrast ? 'text-yellow-300' : 'text-amber-400'}`}>
                  {String(unit.value).padStart(2, '0')}
                </div>
                <div className={`text-xs uppercase tracking-wider ${highContrast ? 'text-yellow-200' : 'text-gray-400'}`}>
                  {unit.label}
                </div>
              </div>
            ))}
          </div>
          <Button
            onClick={() => setLocation('/selma')}
            className={`mt-4 ${highContrast ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600'}`}
            size="sm"
          >
            <MapPin className="w-4 h-4 mr-2" />
            View Event Details
          </Button>
        </div>
      </section>

      {/* ─── Ecosystem Links Grid ─── */}
      <section className="container mx-auto px-4 py-6" aria-labelledby="systems-title">
        <h2 id="systems-title" className={`text-2xl md:text-3xl font-bold text-center mb-6 ${highContrast ? 'text-yellow-300' : 'text-white'}`}>
          {content.systemsTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="list" aria-label="Ecosystem platforms and links">
          {links.map((link) => (
            <Card
              key={link.id}
              className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl group ${highContrast ? 'bg-gray-900 border-yellow-400 hover:border-yellow-300' : 'bg-slate-800/60 border-purple-500/20 hover:border-purple-500/50 hover:shadow-purple-500/10'}`}
              onClick={() => {
                if (link.external) window.open(link.path, '_blank');
                else setLocation(link.path);
              }}
              role="listitem"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (link.external) window.open(link.path, '_blank'); else setLocation(link.path); } }}
              aria-label={`${link.title} — ${link.description}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${link.color} text-white`}>
                    {link.icon}
                  </div>
                  <div className="flex items-center gap-1">
                    {link.badge && (
                      <Badge className={`text-[10px] ${
                        link.status === 'live' ? (highContrast ? 'bg-yellow-500 text-black' : 'bg-red-500/20 text-red-400 border-red-500/50') :
                        link.status === 'upcoming' ? (highContrast ? 'bg-yellow-500 text-black' : 'bg-amber-500/20 text-amber-400 border-amber-500/50') :
                        (highContrast ? 'bg-yellow-900 text-yellow-300' : 'bg-green-500/20 text-green-400 border-green-500/50')
                      }`}>
                        {link.badge}
                      </Badge>
                    )}
                    <ExternalLink className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${highContrast ? 'text-yellow-300' : 'text-purple-400'}`} />
                  </div>
                </div>
                <h3 className={`font-bold text-sm mb-1 ${highContrast ? 'text-yellow-300' : 'text-white'}`}>
                  {link.title}
                </h3>
                <p className={`text-xs leading-relaxed ${highContrast ? 'text-yellow-200' : 'text-gray-400'}`}>
                  {link.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── UN CSW70 Event ─── */}
      <section className="container mx-auto px-4 py-4" aria-label="UN CSW70 Event">
        <div className={`rounded-xl border p-4 md:p-6 text-center ${highContrast ? 'bg-gray-900 border-yellow-400' : 'bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-blue-900/40 border-blue-500/30'}`}>
          <Badge className={highContrast ? 'bg-yellow-500 text-black mb-2' : 'bg-blue-500/20 text-blue-400 border-blue-500/50 mb-2'}>
            UN PARTNERSHIP
          </Badge>
          <h3 className={`text-lg font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-blue-300'}`}>
            {content.squaddTitle}
          </h3>
          <p className={`text-sm mb-3 ${highContrast ? 'text-yellow-200' : 'text-gray-300'}`}>
            {content.squaddDesc}
          </p>
          <Button
            onClick={() => setLocation('/squadd')}
            className={highContrast ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'}
            size="sm"
          >
            <Earth className="w-4 h-4 mr-2" />
            View SQUADD Goals
          </Button>
        </div>
      </section>

      {/* ─── QR Code & Share Section ─── */}
      <section className="container mx-auto px-4 py-6" aria-label="QR Code and Sharing">
        <div className={`rounded-xl border p-6 ${highContrast ? 'bg-gray-900 border-yellow-400' : 'bg-gradient-to-r from-purple-900/30 via-slate-900/50 to-purple-900/30 border-purple-500/20'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* QR Code */}
            <div className="text-center">
              <h3 className={`text-lg font-bold mb-3 ${highContrast ? 'text-yellow-300' : 'text-purple-300'}`}>
                Scan to Share This Flyer
              </h3>
              <div className="inline-block p-4 bg-white rounded-xl shadow-lg">
                <QRCodeSVG
                  value={typeof window !== 'undefined' ? window.location.href : 'https://manuweb.sbs/flyer'}
                  size={180}
                  level="H"
                  includeMargin={false}
                  fgColor="#1a1a2e"
                  bgColor="#ffffff"
                />
              </div>
              <p className={`text-xs mt-2 ${highContrast ? 'text-yellow-200' : 'text-gray-400'}`}>
                Point your phone camera at this code
              </p>
            </div>

            {/* Social Sharing */}
            <div>
              <h3 className={`text-lg font-bold mb-3 ${highContrast ? 'text-yellow-300' : 'text-purple-300'}`}>
                Share Across Platforms
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Twitter/X', icon: <Twitter className="w-4 h-4" />, color: 'bg-sky-600 hover:bg-sky-500', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out the QUMUS Ecosystem — Canryn Production is showing the world what Black women-owned tech looks like! 🔥')}&url=${encodeURIComponent('https://manuweb.sbs/flyer')}` },
                  { name: 'Facebook', icon: <Facebook className="w-4 h-4" />, color: 'bg-blue-700 hover:bg-blue-600', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://manuweb.sbs/flyer')}` },
                  { name: 'LinkedIn', icon: <Linkedin className="w-4 h-4" />, color: 'bg-blue-800 hover:bg-blue-700', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://manuweb.sbs/flyer')}` },
                  { name: 'WhatsApp', icon: <MessageCircle className="w-4 h-4" />, color: 'bg-green-600 hover:bg-green-500', url: `https://wa.me/?text=${encodeURIComponent('QUMUS Ecosystem Interactive Flyer — Canryn Production: https://manuweb.sbs/flyer')}` },
                ].map((social) => (
                  <Button
                    key={social.name}
                    className={`${social.color} text-white w-full justify-start`}
                    size="sm"
                    onClick={() => window.open(social.url, '_blank', 'width=600,height=400')}
                    aria-label={`Share on ${social.name}`}
                  >
                    {social.icon}
                    <span className="ml-2 text-xs">{social.name}</span>
                  </Button>
                ))}
              </div>
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className={`w-full ${highContrast ? 'border-yellow-400 text-yellow-300' : 'border-purple-500/30 text-purple-300 hover:bg-purple-500/10'}`}
                  onClick={() => {
                    const url = 'https://manuweb.sbs/flyer';
                    navigator.clipboard.writeText(url).then(() => toast.success('Link copied to clipboard!'));
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" /> Copy Link
                </Button>
              </div>
              <p className={`text-xs mt-3 text-center ${highContrast ? 'text-yellow-200' : 'text-gray-500'}`}>
                Share with UN delegates, community leaders, and supporters worldwide
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Email Capture ─── */}
      <section className="container mx-auto px-4 py-4" aria-label="Email Subscription">
        <EmailCaptureSection highContrast={highContrast} lang={lang} />
      </section>

      {/* ─── Donate CTA ─── */}
      <section className="container mx-auto px-4 py-4" aria-label="Donate">
        <div className={`rounded-xl border p-6 text-center ${highContrast ? 'bg-gray-900 border-yellow-400' : 'bg-gradient-to-r from-green-900/40 via-emerald-900/30 to-green-900/40 border-green-500/30'}`}>
          <Heart className={`w-8 h-8 mx-auto mb-2 ${highContrast ? 'text-yellow-400' : 'text-green-400'}`} />
          <h3 className={`text-xl font-bold mb-1 ${highContrast ? 'text-yellow-300' : 'text-green-300'}`}>
            {content.donateLabel}
          </h3>
          <p className={`text-sm mb-3 ${highContrast ? 'text-yellow-200' : 'text-gray-300'}`}>
            501(c)(3) & 508 Organization • Elder Advocacy • Community Support
          </p>
          <Button
            onClick={() => setLocation('/donate')}
            className={highContrast ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'}
          >
            <Heart className="w-4 h-4 mr-2" />
            {content.donateLabel}
          </Button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className={`border-t mt-8 py-8 print:mt-4 ${hcBorder} ${highContrast ? 'bg-black' : 'bg-slate-900/50'}`}>
        <div className="container mx-auto px-4 text-center">
          <p className={`text-sm mb-2 ${highContrast ? 'text-yellow-300' : 'text-amber-400'}`}>
            Payten Music (BMI) • Canryn Production • In Honor of Seabrun Candy Hunter
          </p>
          <div className="flex justify-center mt-3">
            <RRBSongBadge variant="compact" showTitle />
          </div>
          <p className={`text-xs ${highContrast ? 'text-yellow-200' : 'text-gray-400'}`}>
            {content.poweredBy}
          </p>
          <p className={`text-xs mt-2 ${highContrast ? 'text-yellow-200' : 'text-gray-500'}`}>
            This flyer is alive — links update automatically as the QUMUS ecosystem evolves.
          </p>
        </div>
      </footer>

      {/* ─── CSS for sound wave animation ─── */}
      <style>{`
        @keyframes soundWave {
          0% { height: 4px; }
          100% { height: 20px; }
        }
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:mt-4 { margin-top: 1rem !important; }
          body { background: white !important; color: black !important; }
          * { color: black !important; background: white !important; border-color: #333 !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Email Capture Component ───
function EmailCaptureSection({ highContrast, lang }: { highContrast: boolean; lang: string }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const subscribeMutation = trpc.emailSubscription.subscribe.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Welcome to the movement! You\'re subscribed.');
    },
    onError: () => {
      toast.error('Something went wrong. Please try again.');
    },
  });

  if (submitted) {
    return (
      <div className={`rounded-xl border p-6 text-center ${highContrast ? 'bg-gray-900 border-yellow-400' : 'bg-gradient-to-r from-emerald-900/30 via-green-900/20 to-emerald-900/30 border-green-500/20'}`}>
        <div className="text-3xl mb-2">\u2714\uFE0F</div>
        <h3 className={`text-lg font-bold ${highContrast ? 'text-yellow-300' : 'text-green-300'}`}>You're In!</h3>
        <p className={`text-sm ${highContrast ? 'text-yellow-200' : 'text-gray-400'}`}>Campaign updates and platform announcements are on the way.</p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-6 ${highContrast ? 'bg-gray-900 border-yellow-400' : 'bg-gradient-to-r from-amber-900/20 via-slate-900/40 to-amber-900/20 border-amber-500/20'}`}>
      <div className="text-center mb-4">
        <Mail className={`w-8 h-8 mx-auto mb-2 ${highContrast ? 'text-yellow-400' : 'text-amber-400'}`} />
        <h3 className={`text-lg font-bold ${highContrast ? 'text-yellow-300' : 'text-amber-300'}`}>
          Stay Connected
        </h3>
        <p className={`text-sm ${highContrast ? 'text-yellow-200' : 'text-gray-400'}`}>
          Get campaign updates, event announcements, and platform news
        </p>
      </div>
      <form
        className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
        onSubmit={(e) => {
          e.preventDefault();
          if (!email) return;
          subscribeMutation.mutate({ email, name: name || undefined, source: 'flyer', language: lang });
        }}
      >
        <input
          type="text"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`flex-1 px-4 py-2 rounded-lg text-sm ${highContrast ? 'bg-black border-yellow-400 text-yellow-300 placeholder:text-yellow-600' : 'bg-slate-800 border-purple-500/30 text-white placeholder:text-gray-500'} border focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
          aria-label="Your name"
        />
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={`flex-1 px-4 py-2 rounded-lg text-sm ${highContrast ? 'bg-black border-yellow-400 text-yellow-300 placeholder:text-yellow-600' : 'bg-slate-800 border-purple-500/30 text-white placeholder:text-gray-500'} border focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
          aria-label="Email address"
        />
        <Button
          type="submit"
          disabled={subscribeMutation.isPending}
          className={highContrast ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'}
        >
          <Send className="w-4 h-4 mr-1" />
          {subscribeMutation.isPending ? 'Joining...' : 'Join'}
        </Button>
      </form>
      <p className={`text-xs text-center mt-3 ${highContrast ? 'text-yellow-200/60' : 'text-gray-500'}`}>
        No spam. Unsubscribe anytime. Your data stays with us.
      </p>
    </div>
  );
}
