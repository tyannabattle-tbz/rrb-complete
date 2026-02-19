import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Download, Share2, Volume2, Clock, User, Calendar, Radio, ChevronDown, ChevronUp, Youtube, Apple, Music as SpotifyIcon, Radio as RadioIcon, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { FrequencyPresetButtons } from '@/components/rrb/FrequencyPresetButtons';
import { FrequencyIndicatorBadge } from '@/components/rrb/FrequencyIndicatorBadge';
import { FrequencyModal } from '@/components/rrb/FrequencyModal';
import { FrequencyEQFilter } from '@/lib/frequencyEQFilter';
import { Music } from 'lucide-react';

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  publishedAt: Date;
  author: string;
  episodeNumber: number;
  season: number;
  thumbnailUrl?: string;
  transcript?: string;
  chapters?: { time: number; title: string }[];
  downloadUrl?: string;
  videoUrl?: string;
}

interface PodcastSeries {
  id: string;
  title: string;
  description: string;
  author: string;
  episodes: PodcastEpisode[];
  rssUrl?: string;
  thumbnailUrl?: string;
  subscriberCount: number;
}

interface Channel {
  id: string;
  name: string;
  listeners: number;
  isLive: boolean;
  color: string;
  logo?: string;
  logoUrl?: string;
}

const CHANNELS: Channel[] = [
  { id: 'rrb-main', name: 'RRB Main', listeners: 1240, isLive: true, color: 'orange', logo: '🎵', logoUrl: 'https://private-us-east-1.manuscdn.com/sessionFile/wafgVPVdlnvPQBXp1jPZAF/sandbox/4d24kIeZ3UYIemOIdhY4Iy-img-1_1771528533000_na1fn_cnJiLW1haW4tbG9nbw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvd2FmZ1ZQVmRsbnZQUUJYcDFqUFpBRi9zYW5kYm94LzRkMjRrSWVaM1VZSWVtT0lkaFk0SXktaW1nLTFfMTc3MTUyODUzMzAwMF9uYTFmbl9jbkppTFcxaGFXNHRiRzluYncucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=fEntFIj69h7ZbJXk6fcTNOIj7fPT0EbmrxoaBuqrBkWuDNpm6cxT2c~Tgbyq6Lv0L2OPGC7Ii-ycKyno9i3ccf3LG7Oj5iqV8s2YhjERoENTtFrBKixMFjC29eeyqLgK3GTuwNzww4R2yd6JhaXxJCvpo80HcYvEK8OuHUI6m2XvAD~p6ydA6cHLlYHhes3HoJmDt7ztBolK4CLNN~KD3ij~IyY0Uy0oSGexCa-4GS3ypsTY3tiUxcAoC877QpC4jJW4~eWId2qInAG8ucPImmDfvogVSc3pkxMpAYtYbkqL-BvKB1gCD8wA2y-Wn7nIfnhqgbkysGo21Lfnqm6lNw__' },
  { id: 'sean-music', name: "Sean's Music", listeners: 342, isLive: true, color: 'blue', logo: '🎸', logoUrl: 'https://private-us-east-1.manuscdn.com/sessionFile/wafgVPVdlnvPQBXp1jPZAF/sandbox/4d24kIeZ3UYIemOIdhY4Iy-img-2_1771528536000_na1fn_c2VhbnMtbXVzaWMtbG9nbw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvd2FmZ1ZQVmRsbnZQUUJYcDFqUFpBRi9zYW5kYm94LzRkMjRrSWVaM1VZSWVtT0lkaFk0SXktaW1nLTJfMTc3MTUyODUzNjAwMF9uYTFmbl9jMlZoYm5NdGJYVnphV010Ykc5bmJ3LnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=JusZcTit5KnRufnOyFtinqTWOED5vOkUOSk8MLVGwOMJKYrRPDCQya8VMx359a5xQHFTKsMKifLkiGz1ziO5UiT0UyLtSP7Z-gse2hVkiSRE7odDRU2X2EG2EPoiwCfAvnHxO9-LPu7zeNJZYM0en9kha4VV79Rld4l1sU9D6u4Nwz9u736WlXpkT4Gj3oqJWE2V5LRz~grZX3Hro6MAttXqQjukObts3~FionuL0DJG4nzGBw7mTWapnOeJ5~3g79FOnssfB6Uai7m1UtO4~uql-sCPx3VYPX6yKjDPrMFTQ1RgAY5-B35-SCk-3fNnk10qmJhljWTnoKVAqh30ig__' },
  { id: 'anna-promotion', name: 'Anna Promotion Co.', listeners: 156, isLive: true, color: 'purple', logo: '🎭', logoUrl: 'https://private-us-east-1.manuscdn.com/sessionFile/wafgVPVdlnvPQBXp1jPZAF/sandbox/4d24kIeZ3UYIemOIdhY4Iy-img-3_1771528533000_na1fn_YW5uYXMtY29tcGFueS1sb2dv.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvd2FmZ1ZQVmRsbnZQUUJYcDFqUFpBRi9zYW5kYm94LzRkMjRrSWVaM1VZSWVtT0lkaFk0SXktaW1nLTNfMTc3MTUyODUzMzAwMF9uYTFmbl9ZVzV1WVhNdFkyOXRjR0Z1ZVMxc2IyZHYucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=r95yLvK~u4VyJ1N6apSaL3qu5EGr-FL6hp8VFwx7BBqCfKHuqJqrYiciEcrQrf9yXEjPwbtQPZgs4CFNyz12xxcXTb~anrn33r1AvXIEcgA-bpXFnZcXB6wEu55Jj1d4D9UGXJPoOmaYkhsne4GjpYreDG-OkaJmzjccfV0OVKndE6p0uG9~n8cm-ByEoEBGykzfF5~fco2JO41b0UB4BMvzEX0EpFWjcrSDY~9OuXnYfb300DBsvYBFZDwlLCKfG9f3Rdgx2VNoD1Sl2IaQOXY8f7rrMr5xrEGsEVDAQK98smqNfvMbqjsmVlSD5ou-B8riyLJmw0zN2HQfYg0mEQ__' },
  { id: 'jaelon-enterprises', name: 'Jaelon Enterprises', listeners: 89, isLive: true, color: 'pink', logo: '🚀', logoUrl: 'https://private-us-east-1.manuscdn.com/sessionFile/wafgVPVdlnvPQBXp1jPZAF/sandbox/4d24kIeZ3UYIemOIdhY4Iy-img-4_1771528560000_na1fn_amFlbG9uLWVudGVycHJpc2VzLWxvZ28.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvd2FmZ1ZQVmRsbnZQUUJYcDFqUFpBRi9zYW5kYm94LzRkMjRrSWVaM1VZSWVtT0lkaFk0SXktaW1nLTRfMTc3MTUyODU2MDAwMF9uYTFmbl9hbUZsYkc5dUxXVnVkR1Z5Y0hKcGMyVnpMV3h2WjI4LnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=iObz2AIaMohlYQ5g2LpT8FwW5978vXqWzuoA6vINKoA16wUDQ41WFPkwmwTOeDhJ4DqrDBj7SO3RD-OwmkJ3nXqgjeIQHSNuIVu-YnF27i3dkfcBmDTND72-41ViE2vNvpOIoNr9lh0olo9E1dirUSoulVrb0cfBKsM~sc3gOoSWlJ7YpbakYcm0RmIDuNHolNZhFxoSpeBvMacKVBt7V7pmrFGCTNJgheXeHgszJIxceof-P3NiIiy7~T2NtFB2Bro~X9wLXphjniUdAMtKxfLQhhuk7sEaQzJzcOaFa7akT3xZcM4GxL2DFKgCbPnnFNw7notNvZ4WPlmA2tnDqQ__' },
  { id: 'little-c', name: 'Little C Recording Co.', listeners: 203, isLive: true, color: 'green', logo: '⭐', logoUrl: 'https://private-us-east-1.manuscdn.com/sessionFile/wafgVPVdlnvPQBXp1jPZAF/sandbox/4d24kIeZ3UYIemOIdhY4Iy-img-5_1771528535000_na1fn_bGl0dGxlLWMtcHJvZHVjdGlvbnMtbG9nbw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvd2FmZ1ZQVmRsbnZQUUJYcDFqUFpBRi9zYW5kYm94LzRkMjRrSWVaM1VZSWVtT0lkaFk0SXktaW1nLTVfMTc3MTUyODUzNTAwMF9uYTFmbl9iR2wwZEd4bExXTXRjSEp2WkhWamRHbHZibk10Ykc5bmJ3LnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=cJdR6RhPp9BWot~~AsilZweG0W-kbQtBnYzDWfFLjv8e2qzqcQ~RGxG5dONT2yAvvxiSjuGLb2Xqc8uyUrT2GHvOq~cxAOMZ~65Z~M8Ai~ICgb~n6HliWgIPk0hEOq6RD-AjBKQ41WVjBFoojiuuQ8iXCBHXJMym34FggSxv8SCqs8sVdzCku-ktZTwTlagw9slXUVt5GiS~ZHwe4BNs3UzBZzgqZbyqiu9TVvS5v78O9X1~IH5v9lTuslYEQ3Po7mMalItzPZPKJxtG6XN~0FnJZ4uf6H662LV5Z8vJWF~PucmRCLvjIkhN0DyFL34rTGou9SzZDCHuFpnU2RZo2Q__' },
  { id: 'poetry-station', name: 'Poetry Station', listeners: 127, isLive: true, color: 'indigo', logo: '📖', logoUrl: undefined },
];

// Channel-specific episode data
const CHANNEL_EPISODES: Record<string, PodcastEpisode[]> = {
  'rrb-main': [
    {
      id: '1',
      title: "Episode 1: The Beginning - Seabrun's Journey",
      description: "In this inaugural episode, we explore the early life of Seabrun Candy Hunter and how he became involved with Little Richard.",
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 330,
      publishedAt: new Date('2024-01-15'),
      author: "Rockin' Rockin' Boogie",
      episodeNumber: 1,
      season: 1,
      videoUrl: 'https://www.youtube.com/embed/Gsbw8XkT5z0',
    },
    {
      id: '2',
      title: 'Episode 2: The Music - Recordings & Performances',
      description: "Deep dive into the recordings, performances, and musical contributions of Seabrun Candy Hunter.",
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 372,
      publishedAt: new Date('2024-01-22'),
      author: "Rockin' Rockin' Boogie",
      episodeNumber: 2,
      season: 1,
      videoUrl: 'https://www.youtube.com/embed/Gsbw8XkT5z0',
    },
    {
      id: '3',
      title: 'Episode 3: The Archive - Proof & Documentation',
      description: "Exploring the archival evidence, documentation, and verification of Seabrun's contributions to music history.",
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 600,
      publishedAt: new Date('2024-01-29'),
      author: "Rockin' Rockin' Boogie",
      episodeNumber: 3,
      season: 1,
      videoUrl: 'https://www.youtube.com/embed/Gsbw8XkT5z0',
    },
    {
      id: '4',
      title: 'Episode 4: The Legacy - Impact & Influence',
      description: "Examining how Seabrun's work continues to influence modern music and culture.",
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 420,
      publishedAt: new Date('2024-02-05'),
      author: "Rockin' Rockin' Boogie",
      episodeNumber: 4,
      season: 1,
      videoUrl: 'https://www.youtube.com/embed/Gsbw8XkT5z0',
    },
    {
      id: '5',
      title: 'Episode 5: The Collaborations - Working with Legends',
      description: "Exploring Seabrun's collaborations with other legendary musicians and artists.",
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 480,
      publishedAt: new Date('2024-02-12'),
      author: "Rockin' Rockin' Boogie",
      episodeNumber: 5,
      season: 1,
      videoUrl: 'https://www.youtube.com/embed/Gsbw8XkT5z0',
    },
    {
      id: '6',
      title: 'Episode 6: The Performances - Live Recordings',
      description: "A collection of live performances and concert recordings from Seabrun's career.",
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 540,
      publishedAt: new Date('2024-02-19'),
      author: "Rockin' Rockin' Boogie",
      episodeNumber: 6,
      season: 1,
      videoUrl: 'https://www.youtube.com/embed/Gsbw8XkT5z0',
    },
  ],
  'sean-music': [
    {
      id: 'sean-1',
      title: "Sean's Session 1: Musical Foundations",
      description: "Sean explores the foundations of music theory and composition.",
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 360,
      publishedAt: new Date('2024-01-20'),
      author: "Sean's Music",
      episodeNumber: 1,
      season: 1,
      videoUrl: 'https://www.youtube.com/embed/Gsbw8XkT5z0',
    },
    {
      id: 'sean-2',
      title: "Sean's Session 2: Production Techniques",
      description: "Advanced production techniques and studio workflows.",
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 420,
      publishedAt: new Date('2024-02-03'),
      author: "Sean's Music",
      episodeNumber: 2,
      season: 1,
      videoUrl: 'https://www.youtube.com/embed/Gsbw8XkT5z0',
    },
    {
      id: 'sean-3',
      title: "Sean's Session 3: Artist Interviews",
      description: "In-depth conversations with emerging and established artists.",
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 480,
      publishedAt: new Date('2024-02-17'),
      author: "Sean's Music",
      episodeNumber: 3,
      season: 1,
      videoUrl: 'https://www.youtube.com/embed/Gsbw8XkT5z0',
    },
  ],
  'anna-promotion': [
    {
      id: 'anna-1',
      title: "Anna's Talk 1: Creative Conversations",
      description: "Anna discusses creativity and artistic expression.",
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 350,
      publishedAt: new Date('2024-01-25'),
      author: 'Anna Promotion Co.',
      episodeNumber: 1,
      season: 1,
      videoUrl: 'https://www.youtube.com/embed/Gsbw8XkT5z0',
    },
    {
      id: 'anna-2',
      title: "Anna's Talk 2: Business & Entrepreneurship",
      description: "Insights into building creative businesses and ventures.",
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 400,
      publishedAt: new Date('2024-02-08'),
      author: 'Anna Promotion Co.',
      episodeNumber: 2,
      season: 1,
      videoUrl: 'https://www.youtube.com/embed/Gsbw8XkT5z0',
    },
  ],
  'jaelon-enterprises': [
    {
      id: 'jaelon-1',
      title: "Jaelon's Insights 1: Industry Trends",
      description: "Jaelon analyzes current trends in entertainment and media.",
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 380,
      publishedAt: new Date('2024-01-28'),
      author: "Jaelon Enterprises",
      episodeNumber: 1,
      season: 1,
      videoUrl: 'https://www.youtube.com/embed/Gsbw8XkT5z0',
    },
    {
      id: 'jaelon-2',
      title: "Jaelon's Insights 2: Strategic Planning",
      description: "Strategic approaches to growth and development.",
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 420,
      publishedAt: new Date('2024-02-11'),
      author: "Jaelon Enterprises",
      episodeNumber: 2,
      season: 1,
      videoUrl: 'https://www.youtube.com/embed/Gsbw8XkT5z0',
    },
  ],
  'poetry-station': [
    {
      id: 'poetry-1',
      title: 'Poetry Reading 1: Voices of the Heart',
      description: 'Beautiful poetry readings exploring themes of love, loss, and transformation.',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 420,
      publishedAt: new Date('2024-02-10'),
      author: 'Poetry Station',
      episodeNumber: 1,
      season: 1,
      videoUrl: 'https://www.youtube.com/embed/Gsbw8XkT5z0',
    },
    {
      id: 'poetry-2',
      title: 'Poetry Reading 2: Nature & Reflection',
      description: 'Contemplative poetry celebrating the beauty of nature and inner peace.',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 380,
      publishedAt: new Date('2024-02-15'),
      author: 'Poetry Station',
      episodeNumber: 2,
      season: 1,
      videoUrl: 'https://www.youtube.com/embed/Gsbw8XkT5z0',
    },
    {
      id: 'poetry-3',
      title: 'Poetry Reading 3: Stories & Dreams',
      description: 'Narrative poetry and spoken word exploring imagination and possibilities.',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 450,
      publishedAt: new Date('2024-02-18'),
      author: 'Poetry Station',
      episodeNumber: 3,
      season: 1,
      videoUrl: 'https://www.youtube.com/embed/Gsbw8XkT5z0',
    },
  ],
  'little-c': [
    {
      id: 'littlec-1',
      title: "Little C's Corner 1: Young Voices",
      description: "Fresh perspectives from the next generation of creators.",
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 320,
      publishedAt: new Date('2024-02-01'),
      author: 'Little C Recording Co.',
      episodeNumber: 1,
      season: 1,
      videoUrl: 'https://www.youtube.com/embed/Gsbw8XkT5z0',
    },
    {
      id: 'littlec-2',
      title: "Little C's Corner 2: Creative Experiments",
      description: "Experimental projects and creative explorations.",
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 360,
      publishedAt: new Date('2024-02-14'),
      author: 'Little C Recording Co.',
      episodeNumber: 2,
      season: 1,
      videoUrl: 'https://www.youtube.com/embed/Gsbw8XkT5z0',
    },
  ],
};

export default function Podcasts() {
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [selectedChannelId, setSelectedChannelId] = useState('rrb-main');
  const [selectedFrequency, setSelectedFrequency] = useState(432);
  const [isFrequencyModalOpen, setIsFrequencyModalOpen] = useState(false);
  const [showFrequencyControls, setShowFrequencyControls] = useState(false);
  const [audioQuality, setAudioQuality] = useState<'128' | '192' | '320'>('192');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentlyPlayed, setRecentlyPlayed] = useState<PodcastEpisode[]>([]);
  const [showTranscript, setShowTranscript] = useState(false);
  const eqFilterRef = useRef<FrequencyEQFilter | null>(null);
  const { user } = useAuth();

  // Initialize EQ filter on component mount
  useEffect(() => {
    const initializeEQ = async () => {
      if (audioRef.current && !eqFilterRef.current) {
        try {
          eqFilterRef.current = new FrequencyEQFilter(audioRef.current);
          await eqFilterRef.current.initialize();
          console.log('Frequency EQ Filter initialized successfully');
        } catch (error) {
          console.error('Failed to initialize EQ filter:', error);
        }
      }
    };
    initializeEQ();

    return () => {
      if (eqFilterRef.current) {
        eqFilterRef.current.destroy();
        eqFilterRef.current = null;
      }
    };
  }, []);

  // Apply frequency filter when selected frequency changes and audio is playing
  useEffect(() => {
    if (eqFilterRef.current && isPlaying && audioRef.current) {
      try {
        eqFilterRef.current.setFrequency(selectedFrequency);
        console.log(`Frequency changed to ${selectedFrequency} Hz`);
      } catch (error) {
        console.error('Error applying frequency:', error);
      }
    }
  }, [selectedFrequency, isPlaying]);

  // Get episodes for selected channel
  const currentChannelEpisodes = CHANNEL_EPISODES[selectedChannelId] || CHANNEL_EPISODES['rrb-main'];

  // Set initial episode when channel changes
  useEffect(() => {
    if (currentChannelEpisodes.length > 0) {
      setSelectedEpisode(currentChannelEpisodes[0]);
      setIsPlaying(false);
    }
  }, [selectedChannelId]);

  const handlePlayPause = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        if (eqFilterRef.current && eqFilterRef.current['audioContext']) {
          const ctx = eqFilterRef.current['audioContext'] as AudioContext;
          if (ctx.state === 'suspended') {
            await ctx.resume();
          }
        }
        audioRef.current.crossOrigin = 'anonymous';
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err: any) {
        console.error('Play error:', err?.name, err?.message);
        setIsPlaying(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentChannel = CHANNELS.find(c => c.id === selectedChannelId) || CHANNELS[0];

  const handleEpisodeSelect = (episode: PodcastEpisode) => {
    setSelectedEpisode(episode);
    setIsPlaying(false);
    // Add to recently played
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(e => e.id !== episode.id);
      return [episode, ...filtered].slice(0, 3);
    });
  };

  const filteredEpisodes = currentChannelEpisodes.filter(ep =>
    ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ep.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold mb-2">Podcast & Video</h1>
          <p className="text-sm text-foreground/60">A Canryn Production — QUMUS Orchestrated</p>
        </div>
      </div>

      {/* Channel Selector */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <Radio className="w-5 h-5 text-orange-500" />
          <span className="text-sm font-semibold">Current Channel:</span>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {CHANNELS.map(channel => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannelId(channel.id)}
              className={`p-3 rounded-lg border-2 transition-all text-left flex flex-col items-center gap-2 ${
                selectedChannelId === channel.id
                  ? `border-${channel.color}-500 bg-${channel.color}-500/10`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {channel.logoUrl ? (
                <img src={channel.logoUrl} alt={channel.name} className="w-12 h-12 object-cover rounded" />
              ) : (
                <div className="text-3xl">{channel.logo}</div>
              )}
              <div className="font-semibold text-sm text-center">{channel.name}</div>
              <div className="text-xs text-foreground/60 text-center">{channel.listeners.toLocaleString()} listeners</div>
            </button>
          ))}
        </div>
      </div>

      {/* Currently Playing */}
      {selectedEpisode && (
        <div className="container mx-auto px-4 py-6">
          <Card className="p-6 bg-gradient-to-br from-amber-500/5 to-purple-500/5 border-amber-500/20">
            {/* Video Player */}
            {selectedEpisode.videoUrl && (
              <div className="mb-6 rounded-lg overflow-hidden bg-black aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={selectedEpisode.videoUrl}
                  title={selectedEpisode.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold mb-1">{selectedEpisode.title}</h2>
                <div className="flex items-center gap-4 text-sm text-foreground/60">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {selectedEpisode.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(selectedEpisode.duration)}
                  </span>
                </div>
              </div>
              <FrequencyIndicatorBadge frequency={selectedFrequency} />
            </div>

            {/* Audio Player */}
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={audioDuration}
                  value={currentTime}
                  onChange={(e) => {
                    const newTime = parseFloat(e.target.value);
                    setCurrentTime(newTime);
                    if (audioRef.current) {
                      audioRef.current.currentTime = newTime;
                    }
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-foreground/60">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handlePlayPause}
                    className="rounded-full w-12 h-12 p-0 bg-orange-500 hover:bg-orange-600"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-1" />
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      if (!isPlaying) {
                        handlePlayPause().catch(console.error);
                      }
                      toast.success(`🎵 Tuned to ${selectedFrequency} Hz`);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white gap-2"
                  >
                    <Music className="w-4 h-4" />
                    Tune In @ {selectedFrequency} Hz
                  </Button>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-foreground/60" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => {
                          setVolume(parseFloat(e.target.value));
                          if (audioRef.current) {
                            audioRef.current.volume = parseFloat(e.target.value) / 100;
                          }
                        }}
                        className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-xs text-foreground/60 w-8">{volume}%</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-foreground/60">Quality:</span>
                      <select
                        value={audioQuality}
                        onChange={(e) => {
                          setAudioQuality(e.target.value as '128' | '192' | '320');
                          toast.success(`Audio quality set to ${e.target.value} kbps`);
                        }}
                        className="text-xs bg-gray-800 text-white rounded px-2 py-1 border border-gray-700 focus:border-orange-500 outline-none"
                      >
                        <option value="128">128 kbps</option>
                        <option value="192">192 kbps</option>
                        <option value="320">320 kbps</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => toast.success('Download started')}>
                    <Download className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => toast.success('Copied to clipboard')}>
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <Button 
                    className="bg-red-500 hover:bg-red-600 text-white gap-2"
                    onClick={() => {
                      if (audioRef.current) {
                        if (eqFilterRef.current && eqFilterRef.current['audioContext']) {
                          const ctx = eqFilterRef.current['audioContext'] as AudioContext;
                          if (ctx.state === 'suspended') {
                            ctx.resume().catch(err => console.error('Failed to resume audio context:', err));
                          }
                        }
                        audioRef.current.play().catch(err => console.error('Failed to play audio:', err));
                        setIsPlaying(true);
                      }
                      toast.success('🔴 LIVE: Broadcasting started! You are now on air.');
                      window.location.href = '/rrb/broadcast';
                    }}
                  >
                    <Zap className="w-4 h-4" />
                    Go Live
                  </Button>
                </div>
              </div>
            </div>

            {/* Hidden audio element */}
            <audio
              ref={audioRef}
              src={selectedEpisode.audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              crossOrigin="anonymous"
              onError={(e: any) => {
                console.error('Audio error for URL:', selectedEpisode.audioUrl);
                console.error('Error code:', e?.target?.error?.code);
                console.error('Error message:', e?.target?.error?.message);
                toast.error(`Failed to load audio: ${selectedEpisode.audioUrl}`);
              }}
              onCanPlay={() => {
                console.log('Audio ready to play:', selectedEpisode.audioUrl);
              }}
              onLoadStart={() => {
                console.log('Loading audio:', selectedEpisode.audioUrl, `Quality: ${audioQuality} kbps`);
              }}
            />
          </Card>
        </div>
      )}

      {/* RSS Feeds & Frequency Controls */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* RSS Feeds */}
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <RadioIcon className="w-5 h-5" />
              Subscribe on Your Platform
            </h3>
            <div className="space-y-2">
              <Button className="w-full justify-start gap-2 bg-red-600 hover:bg-red-700" asChild>
                <a href="https://www.youtube.com/channel/UCrockinrockinboogie" target="_blank" rel="noopener noreferrer">
                  <Youtube className="w-5 h-5" />
                  YouTube
                </a>
              </Button>
              <Button className="w-full justify-start gap-2 bg-black hover:bg-gray-800" asChild>
                <a href="https://podcasts.apple.com/us/podcast/rockin-rockin-boogie/id1234567890" target="_blank" rel="noopener noreferrer">
                  <Apple className="w-5 h-5" />
                  Apple Podcasts
                </a>
              </Button>
              <Button className="w-full justify-start gap-2 bg-green-600 hover:bg-green-700" asChild>
                <a href="https://open.spotify.com/show/rockinrockinboogie" target="_blank" rel="noopener noreferrer">
                  <SpotifyIcon className="w-5 h-5" />
                  Spotify
                </a>
              </Button>
              <Button className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700" asChild>
                <a href="https://podcasts.google.com/feed/rockinrockinboogie" target="_blank" rel="noopener noreferrer">
                  <RadioIcon className="w-5 h-5" />
                  Google Podcasts
                </a>
              </Button>
            </div>
          </div>

          {/* Frequency Controls */}
          <div>
            <button
              onClick={() => setShowFrequencyControls(!showFrequencyControls)}
              className="flex items-center gap-2 text-lg font-bold mb-3 text-orange-500 hover:text-orange-600 w-full"
            >
              <Music className="w-5 h-5" />
              Frequency Tuning
              {showFrequencyControls ? (
                <ChevronUp className="w-5 h-5 ml-auto" />
              ) : (
                <ChevronDown className="w-5 h-5 ml-auto" />
              )}
            </button>

            {showFrequencyControls && (
              <Card className="p-4 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20">
                <FrequencyPresetButtons
                  selectedFrequency={selectedFrequency}
                  onFrequencySelect={(frequency: number) => {
                    setSelectedFrequency(frequency);
                    if (eqFilterRef.current) {
                      try {
                        eqFilterRef.current.setFrequency(frequency);
                        console.log(`Frequency set to ${frequency} Hz`);
                      } catch (err) {
                        console.error('Failed to set frequency:', err);
                        toast.info(`Frequency ${frequency} Hz selected (filter unavailable)`);
                      }
                    }
                  }}
                />
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <div className="container mx-auto px-4 py-6">
          <h3 className="text-lg font-bold mb-4">Recently Played</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentlyPlayed.map(episode => (
              <Card key={episode.id} className="p-4 cursor-pointer hover:bg-accent transition-colors" onClick={() => handleEpisodeSelect(episode)}>
                <h4 className="font-semibold text-sm mb-2 line-clamp-2">{episode.title}</h4>
                <p className="text-xs text-foreground/60 mb-3 line-clamp-2">{episode.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span>{formatTime(episode.duration)}</span>
                  <span className="text-foreground/40">{new Date(episode.publishedAt).toLocaleDateString()}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Search Episodes */}
      <div className="container mx-auto px-4 py-6">
        <input
          type="text"
          placeholder="Search episodes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* All Episodes */}
      <div className="container mx-auto px-4 py-6">
        <h3 className="text-lg font-bold mb-4">All Episodes ({filteredEpisodes.length})</h3>
        <div className="space-y-4">
          {filteredEpisodes.map(episode => (
            <Card
              key={episode.id}
              className="p-4 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => handleEpisodeSelect(episode)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">{episode.title}</h4>
                  <p className="text-sm text-foreground/60 mb-3">{episode.description}</p>
                  <div className="flex items-center gap-4 text-xs text-foreground/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(episode.duration)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(episode.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEpisodeSelect(episode);
                    setIsPlaying(true);
                  }}
                >
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
