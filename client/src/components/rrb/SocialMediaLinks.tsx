import { Facebook, Instagram, Twitter, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SOCIAL_PROFILES = {
  facebook: {
    url: 'https://www.facebook.com/seabrun.hunter/',
    icon: Facebook,
    label: 'Facebook',
    color: 'hover:text-blue-600',
  },
  instagram: {
    url: 'https://www.instagram.com/seabrunhunter/',
    icon: Instagram,
    label: 'Instagram',
    color: 'hover:text-pink-600',
  },
  twitter: {
    url: 'https://x.com/HunterSeabrun',
    icon: Twitter,
    label: 'Twitter/X',
    color: 'hover:text-black dark:hover:text-white',
  },
};

interface SocialMediaLinksProps {
  variant?: 'icons' | 'buttons' | 'compact';
  showLabels?: boolean;
  className?: string;
}

export default function SocialMediaLinks({
  variant = 'icons',
  showLabels = false,
  className = '',
}: SocialMediaLinksProps) {
  if (variant === 'buttons') {
    return (
      <div className={`flex flex-wrap gap-3 ${className}`}>
        {Object.entries(SOCIAL_PROFILES).map(([key, profile]) => {
          const Icon = profile.icon;
          return (
            <a
              key={key}
              href={profile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {showLabels && profile.label}
              </Button>
            </a>
          );
        })}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {Object.entries(SOCIAL_PROFILES).map(([key, profile]) => {
          const Icon = profile.icon;
          return (
            <a
              key={key}
              href={profile.url}
              target="_blank"
              rel="noopener noreferrer"
              title={profile.label}
              className="inline-block"
            >
              <Icon className={`w-5 h-5 text-foreground/60 ${profile.color} transition-colors`} />
            </a>
          );
        })}
      </div>
    );
  }

  // Default: icons variant
  return (
    <div className={`flex gap-4 ${className}`}>
      {Object.entries(SOCIAL_PROFILES).map(([key, profile]) => {
        const Icon = profile.icon;
        return (
          <a
            key={key}
            href={profile.url}
            target="_blank"
            rel="noopener noreferrer"
            title={profile.label}
            className="inline-block"
          >
            <Icon className={`w-6 h-6 text-foreground/70 ${profile.color} transition-colors`} />
          </a>
        );
      })}
    </div>
  );
}

// Utility function to share content on social media
export function shareOnSocial(platform: keyof typeof SOCIAL_PROFILES, options: {
  title?: string;
  text?: string;
  url?: string;
}) {
  const { title = '', text = '', url = window.location.href } = options;
  
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    instagram: url, // Instagram doesn't have a direct share URL, just open the profile
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  };

  const shareUrl = shareUrls[platform];
  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }
}
