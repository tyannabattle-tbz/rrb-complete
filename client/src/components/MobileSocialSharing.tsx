import React, { useState } from 'react';
import { Share2, Copy, Check, QrCode, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MobileSocialSharingProps {
  title: string;
  description: string;
  url: string;
  hashtags?: string[];
  onShare?: (platform: string) => void;
}

export default function MobileSocialSharing({
  title,
  description,
  url,
  hashtags = [],
  onShare,
}: MobileSocialSharingProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const platforms = [
    {
      name: 'Twitter',
      icon: '𝕏',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}&hashtags=${hashtags.join(',')}`,
      color: 'bg-black',
    },
    {
      name: 'Facebook',
      icon: 'f',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'bg-blue-600',
    },
    {
      name: 'WhatsApp',
      icon: 'W',
      url: `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
      color: 'bg-green-500',
    },
    {
      name: 'Telegram',
      icon: '✈',
      url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      color: 'bg-blue-400',
    },
    {
      name: 'Email',
      icon: '✉',
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + '\n\n' + url)}`,
      color: 'bg-gray-600',
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleShare = (platform: string, platformUrl: string) => {
    if (onShare) onShare(platform);
    window.open(platformUrl, '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-slate-700 rounded-lg transition"
        >
          <Share2 className="w-5 h-5 text-purple-400" />
        </button>
      </div>

      {/* Share Menu */}
      {showMenu && (
        <Card className="bg-slate-800 border-purple-500 border mx-4 mb-4 p-4 space-y-3">
          {/* Native Share Button */}
          {navigator.share && (
            <Button
              onClick={handleNativeShare}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share via System
            </Button>
          )}

          {/* Social Platform Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {platforms.map((platform) => (
              <button
                key={platform.name}
                onClick={() => handleShare(platform.name, platform.url)}
                className={`${platform.color} hover:opacity-80 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center text-sm`}
              >
                <span className="text-lg">{platform.icon}</span>
              </button>
            ))}
          </div>

          {/* Copy Link Button */}
          <button
            onClick={handleCopy}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Link
              </>
            )}
          </button>

          {/* QR Code Button */}
          <button
            onClick={() => setShowQR(!showQR)}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
          >
            <QrCode className="w-4 h-4" />
            {showQR ? 'Hide QR' : 'Show QR'}
          </button>

          {/* QR Code Display */}
          {showQR && (
            <div className="flex justify-center bg-white p-3 rounded-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`}
                alt="QR Code"
                className="w-32 h-32"
              />
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={() => setShowMenu(false)}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
          >
            <X className="w-4 h-4" />
            Close
          </button>
        </Card>
      )}

      {/* Description */}
      <p className="text-purple-200 text-sm px-4 line-clamp-2">{description}</p>
    </div>
  );
}
