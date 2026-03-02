/**
 * Video Watermarking Service
 * Handles logo and text overlay watermarking for videos
 */

export interface WatermarkConfig {
  enabled: boolean;
  type: 'logo' | 'text' | 'both';
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number; // 0-1
  scale: number; // 0.1-1.0
}

export interface LogoWatermark extends WatermarkConfig {
  type: 'logo' | 'both';
  logoUrl: string;
  width: number; // pixels
  height: number; // pixels
  padding: number; // pixels from edge
}

export interface TextWatermark extends WatermarkConfig {
  type: 'text' | 'both';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontColor: string; // hex color
  backgroundColor?: string; // hex color
  padding: number;
  rotation?: number; // degrees
}

export interface WatermarkPreset {
  name: string;
  description: string;
  logo?: LogoWatermark;
  text?: TextWatermark;
}

export class VideoWatermarkService {
  private static readonly DEFAULT_PRESETS: Record<string, WatermarkPreset> = {
    copyright: {
      name: 'Copyright',
      description: 'Simple copyright text watermark',
      text: {
        enabled: true,
        type: 'text',
        text: '© 2026 Your Company',
        position: 'bottom-right',
        fontSize: 14,
        fontFamily: 'Arial',
        fontColor: '#FFFFFF',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        opacity: 0.8,
        scale: 1,
        padding: 10,
      },
    },
    branded: {
      name: 'Branded',
      description: 'Logo with company text',
      logo: {
        enabled: true,
        type: 'logo',
        logoUrl: 'https://example.com/logo.png',
        position: 'top-left',
        width: 100,
        height: 50,
        opacity: 0.7,
        scale: 0.8,
        padding: 15,
      },
      text: {
        enabled: true,
        type: 'text',
        text: 'Your Brand',
        position: 'bottom-left',
        fontSize: 16,
        fontFamily: 'Arial',
        fontColor: '#FFFFFF',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        opacity: 0.8,
        scale: 1,
        padding: 10,
      },
    },
    minimal: {
      name: 'Minimal',
      description: 'Subtle corner watermark',
      text: {
        enabled: true,
        type: 'text',
        text: 'Watermark',
        position: 'bottom-right',
        fontSize: 10,
        fontFamily: 'Arial',
        fontColor: '#FFFFFF',
        opacity: 0.4,
        scale: 0.6,
        padding: 5,
      },
    },
    diagonal: {
      name: 'Diagonal',
      description: 'Diagonal text watermark',
      text: {
        enabled: true,
        type: 'text',
        text: 'WATERMARK',
        position: 'center',
        fontSize: 48,
        fontFamily: 'Arial',
        fontColor: '#FFFFFF',
        opacity: 0.2,
        scale: 1,
        padding: 0,
        rotation: -45,
      },
    },
  };

  static getPresets(): Record<string, WatermarkPreset> {
    return this.DEFAULT_PRESETS;
  }

  static createLogoWatermark(
    logoUrl: string,
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' = 'top-right',
    options?: Partial<LogoWatermark>
  ): LogoWatermark {
    return {
      enabled: true,
      type: 'logo',
      logoUrl,
      position,
      width: options?.width || 100,
      height: options?.height || 50,
      opacity: options?.opacity || 0.8,
      scale: options?.scale || 1,
      padding: options?.padding || 10,
    };
  }

  static createTextWatermark(
    text: string,
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' = 'bottom-right',
    options?: Partial<TextWatermark>
  ): TextWatermark {
    return {
      enabled: true,
      type: 'text',
      text,
      position,
      fontSize: options?.fontSize || 14,
      fontFamily: options?.fontFamily || 'Arial',
      fontColor: options?.fontColor || '#FFFFFF',
      backgroundColor: options?.backgroundColor,
      opacity: options?.opacity || 0.8,
      scale: options?.scale || 1,
      padding: options?.padding || 10,
      rotation: options?.rotation,
    };
  }

  static validateWatermark(watermark: LogoWatermark | TextWatermark): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (watermark.opacity < 0 || watermark.opacity > 1) {
      errors.push('Opacity must be between 0 and 1');
    }

    if (watermark.scale < 0.1 || watermark.scale > 1) {
      errors.push('Scale must be between 0.1 and 1');
    }

    if (watermark.type === 'logo' || watermark.type === 'both') {
      const logoWm = watermark as LogoWatermark;
      if (!logoWm.logoUrl) {
        errors.push('Logo URL is required for logo watermarks');
      }
      if (logoWm.width < 10 || logoWm.width > 500) {
        errors.push('Logo width must be between 10 and 500 pixels');
      }
      if (logoWm.height < 10 || logoWm.height > 500) {
        errors.push('Logo height must be between 10 and 500 pixels');
      }
    }

    if (watermark.type === 'text' || watermark.type === 'both') {
      const textWm = watermark as TextWatermark;
      if (!textWm.text) {
        errors.push('Text is required for text watermarks');
      }
      if (textWm.fontSize < 8 || textWm.fontSize > 72) {
        errors.push('Font size must be between 8 and 72');
      }
      if (!/^#[0-9A-F]{6}$/i.test(textWm.fontColor)) {
        errors.push('Font color must be a valid hex color');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static generateWatermarkSVG(watermark: TextWatermark, videoWidth: number, videoHeight: number): string {
    const scaledFontSize = watermark.fontSize * watermark.scale;
    const { x, y } = this.calculatePosition(
      watermark.position,
      videoWidth,
      videoHeight,
      scaledFontSize,
      watermark.padding
    );

    let svg = `<svg width="${videoWidth}" height="${videoHeight}" xmlns="http://www.w3.org/2000/svg">`;

    // Add background if specified
    if (watermark.backgroundColor) {
      const textWidth = watermark.text.length * scaledFontSize * 0.6; // Approximate
      svg += `<rect x="${x - 5}" y="${y - scaledFontSize}" width="${textWidth + 10}" height="${scaledFontSize + 10}" fill="${watermark.backgroundColor}" opacity="${watermark.opacity}"/>`;
    }

    // Add text
    let textElement = `<text x="${x}" y="${y}" font-family="${watermark.fontFamily}" font-size="${scaledFontSize}" fill="${watermark.fontColor}" opacity="${watermark.opacity}"`;

    if (watermark.rotation) {
      textElement += ` transform="rotate(${watermark.rotation} ${x} ${y})"`;
    }

    textElement += `>${this.escapeXml(watermark.text)}</text>`;
    svg += textElement;

    svg += '</svg>';
    return svg;
  }

  static generateWatermarkConfig(watermark: LogoWatermark | TextWatermark): string {
    return JSON.stringify(watermark, null, 2);
  }

  static applyPreset(presetName: string): WatermarkPreset {
    const preset = this.DEFAULT_PRESETS[presetName];
    if (!preset) {
      throw new Error(`Unknown watermark preset: ${presetName}`);
    }
    return preset;
  }

  static getPositionCoordinates(
    position: string,
    videoWidth: number,
    videoHeight: number,
    elementWidth: number = 100,
    elementHeight: number = 50
  ): { x: number; y: number } {
    const padding = 10;

    switch (position) {
      case 'top-left':
        return { x: padding, y: padding + elementHeight };
      case 'top-right':
        return { x: videoWidth - elementWidth - padding, y: padding + elementHeight };
      case 'bottom-left':
        return { x: padding, y: videoHeight - padding };
      case 'bottom-right':
        return { x: videoWidth - elementWidth - padding, y: videoHeight - padding };
      case 'center':
        return { x: videoWidth / 2, y: videoHeight / 2 };
      default:
        return { x: padding, y: videoHeight - padding };
    }
  }

  private static calculatePosition(
    position: string,
    videoWidth: number,
    videoHeight: number,
    elementHeight: number,
    padding: number
  ): { x: number; y: number } {
    switch (position) {
      case 'top-left':
        return { x: padding, y: padding + elementHeight };
      case 'top-right':
        return { x: videoWidth - padding, y: padding + elementHeight };
      case 'bottom-left':
        return { x: padding, y: videoHeight - padding };
      case 'bottom-right':
        return { x: videoWidth - padding, y: videoHeight - padding };
      case 'center':
        return { x: videoWidth / 2, y: videoHeight / 2 };
      default:
        return { x: padding, y: videoHeight - padding };
    }
  }

  private static escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  static createCompositeWatermark(logo?: LogoWatermark, text?: TextWatermark): { logo?: LogoWatermark; text?: TextWatermark } {
    const composite: { logo?: LogoWatermark; text?: TextWatermark } = {};

    if (logo && logo.enabled) {
      const logoValidation = this.validateWatermark(logo);
      if (logoValidation.valid) {
        composite.logo = logo;
      }
    }

    if (text && text.enabled) {
      const textValidation = this.validateWatermark(text);
      if (textValidation.valid) {
        composite.text = text;
      }
    }

    return composite;
  }
}
