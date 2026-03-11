/**
 * RRBSongBadge — Reusable component to display "Rockin' Rockin' Boogie" song links
 * 
 * Variants:
 *  - "inline"  → small inline badge with platform icons (for embedding in text)
 *  - "compact" → single-line row of small buttons
 *  - "full"    → larger buttons with labels (for dedicated sections)
 */
import { RRB_SONG_LINKS, RRB_SONG_TITLE } from '@/lib/rrbSongLinks';
import { ExternalLink, Music } from 'lucide-react';

type Variant = 'inline' | 'compact' | 'full';

interface RRBSongBadgeProps {
  variant?: Variant;
  className?: string;
  showTitle?: boolean;
}

export function RRBSongBadge({ variant = 'compact', className = '', showTitle = false }: RRBSongBadgeProps) {
  const links = [
    { label: 'Apple Music', url: RRB_SONG_LINKS.appleMusic, emoji: '🍎', bg: 'bg-pink-600/80 hover:bg-pink-600', border: 'border-pink-500/30' },
    { label: 'Spotify', url: RRB_SONG_LINKS.spotify, emoji: '🎵', bg: 'bg-green-600/80 hover:bg-green-600', border: 'border-green-500/30' },
    { label: 'YouTube', url: RRB_SONG_LINKS.youtube, emoji: '▶️', bg: 'bg-red-600/80 hover:bg-red-600', border: 'border-red-500/30' },
  ];

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1 ${className}`}>
        {showTitle && <span className="text-amber-300 font-semibold text-xs mr-0.5">🎶 {RRB_SONG_TITLE}</span>}
        {links.map((l) => (
          <a
            key={l.label}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Listen on ${l.label}`}
            className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${l.bg} text-white transition-colors`}
          >
            {l.emoji}
          </a>
        ))}
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
        {showTitle && (
          <span className="flex items-center gap-1 text-amber-300 text-xs font-semibold mr-1">
            <Music className="w-3 h-3" />
            {RRB_SONG_TITLE}
          </span>
        )}
        {links.map((l) => (
          <a
            key={l.label}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-white ${l.bg} border ${l.border} transition-colors`}
          >
            <span>{l.emoji}</span>
            <span className="hidden sm:inline">{l.label}</span>
          </a>
        ))}
      </div>
    );
  }

  // variant === 'full'
  return (
    <div className={`${className}`}>
      {showTitle && (
        <div className="flex items-center gap-2 mb-2">
          <Music className="w-4 h-4 text-amber-400" />
          <span className="text-amber-300 font-bold text-sm">{RRB_SONG_TITLE}</span>
          <span className="text-white/40 text-xs">— Listen Now</span>
        </div>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white ${l.bg} border ${l.border} transition-all hover:scale-105`}
          >
            <span>{l.emoji}</span>
            <span>{l.label}</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        ))}
      </div>
    </div>
  );
}

export default RRBSongBadge;
