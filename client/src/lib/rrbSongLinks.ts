/**
 * Rockin' Rockin' Boogie — Official Song Links
 * 
 * Written by Seabrun Whitney Hunter & Richard W. Penniman (Little Richard)
 * Registered with BMI through Payten Music
 * Reconciled 50/50 co-write split
 * 
 * These links point to the verified streaming platform entries for the song.
 */

export const RRB_SONG_LINKS = {
  appleMusic: 'https://music.apple.com/us/song/rockin-rockin-boogie/335850412',
  spotify: 'https://open.spotify.com/track/6vmu5hZHazgoa2BwPiSswD',
  youtube: 'https://www.youtube.com/watch?v=MWXH5JH9y1U',
  shazam: 'https://www.shazam.com/en-us/song/335850412/rockin-rockin-boogie',
} as const;

export const RRB_SONG_TITLE = "Rockin' Rockin' Boogie";
export const RRB_SONG_WRITERS = 'Seabrun Whitney Hunter & Richard W. Penniman';
export const RRB_SONG_PUBLISHER = 'Payten Music (BMI)';
export const RRB_SONG_YEAR = 1972;

/**
 * Reusable component-friendly link data for rendering song link buttons
 */
export const RRB_SONG_LINK_BUTTONS = [
  { label: 'Apple Music', url: RRB_SONG_LINKS.appleMusic, icon: '🍎', color: 'bg-pink-600 hover:bg-pink-700' },
  { label: 'Spotify', url: RRB_SONG_LINKS.spotify, icon: '🎵', color: 'bg-green-600 hover:bg-green-700' },
  { label: 'YouTube', url: RRB_SONG_LINKS.youtube, icon: '▶️', color: 'bg-red-600 hover:bg-red-700' },
] as const;
