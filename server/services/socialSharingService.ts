import { z } from 'zod';

export interface ShareContent {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  hashtags?: string[];
}

export interface ShareResult {
  platform: string;
  success: boolean;
  shareUrl: string;
  message?: string;
}

export class SocialSharingService {
  /**
   * Generate Twitter/X share URL
   */
  static generateTwitterShareUrl(content: ShareContent): string {
    const text = `${content.title} - ${content.description}`;
    const hashtags = content.hashtags?.join(' ') || '';
    const fullText = `${text} ${hashtags}`;
    const params = new URLSearchParams({
      text: fullText,
      url: content.url,
    });
    return `https://twitter.com/intent/tweet?${params.toString()}`;
  }

  /**
   * Generate Facebook share URL
   */
  static generateFacebookShareUrl(content: ShareContent): string {
    const params = new URLSearchParams({
      u: content.url,
      quote: `${content.title} - ${content.description}`,
    });
    return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
  }

  /**
   * Generate LinkedIn share URL
   */
  static generateLinkedInShareUrl(content: ShareContent): string {
    const params = new URLSearchParams({
      url: content.url,
      title: content.title,
      summary: content.description,
    });
    return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
  }

  /**
   * Generate WhatsApp share URL
   */
  static generateWhatsAppShareUrl(content: ShareContent): string {
    const text = `${content.title}\n${content.description}\n${content.url}`;
    const params = new URLSearchParams({
      text: text,
    });
    return `https://wa.me/?${params.toString()}`;
  }

  /**
   * Generate Telegram share URL
   */
  static generateTelegramShareUrl(content: ShareContent): string {
    const params = new URLSearchParams({
      url: content.url,
      text: `${content.title} - ${content.description}`,
    });
    return `https://t.me/share/url?${params.toString()}`;
  }

  /**
   * Generate email share URL
   */
  static generateEmailShareUrl(content: ShareContent): string {
    const subject = content.title;
    const body = `${content.description}\n\n${content.url}`;
    const params = new URLSearchParams({
      subject: subject,
      body: body,
    });
    return `mailto:?${params.toString()}`;
  }

  /**
   * Generate all share URLs for a piece of content
   */
  static generateAllShareUrls(content: ShareContent): Record<string, string> {
    return {
      twitter: this.generateTwitterShareUrl(content),
      facebook: this.generateFacebookShareUrl(content),
      linkedin: this.generateLinkedInShareUrl(content),
      whatsapp: this.generateWhatsAppShareUrl(content),
      telegram: this.generateTelegramShareUrl(content),
      email: this.generateEmailShareUrl(content),
    };
  }

  /**
   * Generate native share data for Web Share API
   */
  static generateNativeShareData(content: ShareContent) {
    return {
      title: content.title,
      text: content.description,
      url: content.url,
    };
  }

  /**
   * Check if Web Share API is available
   */
  static isNativeShareAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return !!navigator.share;
  }

  /**
   * Share using native Web Share API
   */
  static async nativeShare(content: ShareContent): Promise<boolean> {
    if (!this.isNativeShareAvailable()) {
      return false;
    }

    try {
      await navigator.share(this.generateNativeShareData(content));
      return true;
    } catch (error) {
      console.error('Native share failed:', error);
      return false;
    }
  }

  /**
   * Copy share link to clipboard
   */
  static async copyToClipboard(url: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
      return false;
    }
  }

  /**
   * Generate QR code data for URL
   */
  static generateQRCodeUrl(url: string): string {
    const encoded = encodeURIComponent(url);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}`;
  }
}

export const ShareContentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  url: z.string().url(),
  imageUrl: z.string().url().optional(),
  hashtags: z.array(z.string()).optional(),
});

export type ShareContentType = z.infer<typeof ShareContentSchema>;
