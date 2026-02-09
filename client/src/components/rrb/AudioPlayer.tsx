'use client';

import { useState, useEffect } from 'react';
import { Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioPlayerProps {
  src: string;
  title?: string;
  artist?: string;
  compact?: boolean;
  description?: string;
  speaker?: string;
  date?: string;
  duration?: string;
  showTranscript?: boolean;
  transcript?: string;
}

export default function AudioPlayer({ 
  src, 
  title = 'Rockin\' Rockin\' Boogie', 
  artist = 'Seabrun Candy Hunter',
  compact = false,
  description,
  speaker,
  date,
  duration,
  showTranscript = false,
  transcript
}: AudioPlayerProps) {
  const [showTranscriptText, setShowTranscriptText] = useState(false);

  // Track audio engagement
  useEffect(() => {
    const trackAudioEvent = (eventType: string) => {
      try {
        if (window.gtag) {
          window.gtag('event', `audio_${eventType}`, {
            audio_title: title,
            audio_artist: artist,
            timestamp: new Date().toISOString()
          });
        }
        console.log(`[Audio Analytics] ${eventType}: ${title}`);
      } catch (err) {
        console.error('Error tracking audio event:', err);
      }
    };
    trackAudioEvent('loaded');
  }, [title, artist]);

  const handleDownload = async () => {
    if (window.gtag) {
      window.gtag('event', 'audio_download', {
        audio_title: title,
        audio_artist: artist,
        timestamp: new Date().toISOString()
      });
    }
    console.log(`[Audio Analytics] download: ${title}`);
    
    try {
      // Fetch the audio file as a blob
      const response = await fetch(src);
      if (!response.ok) throw new Error('Failed to download audio');
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title}.mp3`;
      link.style.display = 'none';
      
      // Append and trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download audio. Please try again.');
    }
  };

  const handleShare = async () => {
    if (window.gtag) {
      window.gtag('event', 'audio_share', {
        audio_title: title,
        audio_artist: artist,
        timestamp: new Date().toISOString()
      });
    }
    console.log(`[Audio Analytics] share: ${title}`);
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Listen to "${title}" by ${artist}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
      });
    }
  };

  if (compact) {
  return (
    <div className="w-full bg-background rounded-lg p-4">
      <audio src={src} controls className="w-full" />
    </div>
  );
  }

  return (
    <div className="w-full bg-gradient-to-br from-accent/10 via-background to-background border border-accent/20 rounded-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground mb-1">🎙️ {title}</h3>
        {description && (
          <p className="text-sm text-foreground/70 mb-2">{description}</p>
        )}
        {speaker && (
          <p className="text-sm font-semibold text-foreground mb-1">{speaker}</p>
        )}
        {date && (
          <p className="text-xs text-accent font-semibold">{speaker} • {date}</p>
        )}
      </div>

      {/* Audio Player */}
      <div className="mb-6 bg-background/50 rounded-lg p-4">
        <audio src={src} controls className="w-full" />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center mb-6">
        <Button
          onClick={handleDownload}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
        <Button
          onClick={handleShare}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>

      {/* Transcript Section */}
      {showTranscript && transcript && (
        <div className="border-t border-accent/20 pt-4">
          <button
            onClick={() => {
              setShowTranscriptText(!showTranscriptText);
              if (window.gtag) {
                window.gtag('event', 'audio_transcript_view', {
                  audio_title: title,
                  audio_artist: artist,
                  transcript_opened: !showTranscriptText,
                  timestamp: new Date().toISOString()
                });
              }
              console.log(`[Audio Analytics] transcript_view: ${title}`);
            }}
            className="text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
          >
            {showTranscriptText ? '▼ Hide Transcript' : '▶ Show Transcript'}
          </button>
          {showTranscriptText && (
            <div className="mt-3 p-3 bg-background/50 rounded text-sm text-foreground/70 max-h-64 overflow-y-auto">
              {transcript}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
