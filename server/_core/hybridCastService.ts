/**
 * HybridCast Widget Configuration Service
 * Manages widget appearance, behavior, and integration settings
 */

export interface HybridCastWidgetConfig {
  widgetId: string;
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    accentColor: string;
    borderRadius: number;
    fontSize: number;
    fontFamily: string;
  };
  behavior: {
    autoPlay: boolean;
    loop: boolean;
    muted: boolean;
    controls: boolean;
    fullscreen: boolean;
    pip: boolean;
  };
  layout: {
    position: 'inline' | 'popup' | 'sidebar';
    width: number;
    height: number;
    maxWidth: number;
    maxHeight: number;
  };
  analytics: {
    trackViews: boolean;
    trackEngagement: boolean;
    trackShares: boolean;
    trackDownloads: boolean;
  };
  branding: {
    showLogo: boolean;
    showBranding: boolean;
    customLogo?: string;
    customBranding?: string;
  };
}

export interface HybridCastEmbedCode {
  scriptTag: string;
  containerHtml: string;
  initCode: string;
}

export class HybridCastService {
  private static readonly DEFAULT_CONFIG: HybridCastWidgetConfig = {
    widgetId: '',
    appearance: {
      theme: 'auto',
      primaryColor: '#3b82f6',
      accentColor: '#1e40af',
      borderRadius: 8,
      fontSize: 14,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    behavior: {
      autoPlay: false,
      loop: false,
      muted: false,
      controls: true,
      fullscreen: true,
      pip: true,
    },
    layout: {
      position: 'inline',
      width: 100,
      height: 100,
      maxWidth: 1200,
      maxHeight: 800,
    },
    analytics: {
      trackViews: true,
      trackEngagement: true,
      trackShares: true,
      trackDownloads: true,
    },
    branding: {
      showLogo: true,
      showBranding: true,
    },
  };

  static createConfig(widgetId: string, overrides?: Partial<HybridCastWidgetConfig>): HybridCastWidgetConfig {
    return {
      ...this.DEFAULT_CONFIG,
      widgetId,
      ...overrides,
    };
  }

  static generateEmbedCode(config: HybridCastWidgetConfig): HybridCastEmbedCode {
    const scriptTag = `<script src="https://hybridcast.sbs/hybridcast-widget.js"></script>`;
    
    const containerHtml = `<div id="hybridcast-widget-${config.widgetId}" class="hybridcast-widget"></div>`;
    
    const initCode = `
<script>
  if (window.HybridCast) {
    window.HybridCast.init({
      widgetId: '${config.widgetId}',
      containerId: 'hybridcast-widget-${config.widgetId}',
      config: ${JSON.stringify(config, null, 2)}
    });
  }
</script>
    `.trim();

    return {
      scriptTag,
      containerHtml,
      initCode,
    };
  }

  static validateConfig(config: HybridCastWidgetConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.widgetId) {
      errors.push('Widget ID is required');
    }

    if (config.appearance.borderRadius < 0 || config.appearance.borderRadius > 50) {
      errors.push('Border radius must be between 0 and 50');
    }

    if (config.appearance.fontSize < 8 || config.appearance.fontSize > 32) {
      errors.push('Font size must be between 8 and 32');
    }

    if (config.layout.width < 0 || config.layout.width > 100) {
      errors.push('Width must be between 0 and 100%');
    }

    if (config.layout.height < 0 || config.layout.height > 100) {
      errors.push('Height must be between 0 and 100%');
    }

    // Validate color format (hex)
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    if (!hexColorRegex.test(config.appearance.primaryColor)) {
      errors.push('Primary color must be a valid hex color');
    }

    if (!hexColorRegex.test(config.appearance.accentColor)) {
      errors.push('Accent color must be a valid hex color');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static getPresets(): Record<string, Partial<HybridCastWidgetConfig>> {
    return {
      minimal: {
        appearance: {
          theme: 'light',
          primaryColor: '#000000',
          accentColor: '#333333',
          borderRadius: 0,
          fontSize: 12,
          fontFamily: 'monospace',
        },
        behavior: {
          autoPlay: false,
          loop: false,
          muted: true,
          controls: true,
          fullscreen: false,
          pip: false,
        },
      },
      modern: {
        appearance: {
          theme: 'dark',
          primaryColor: '#3b82f6',
          accentColor: '#1e40af',
          borderRadius: 12,
          fontSize: 14,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        behavior: {
          autoPlay: true,
          loop: false,
          muted: false,
          controls: true,
          fullscreen: true,
          pip: true,
        },
      },
      professional: {
        appearance: {
          theme: 'light',
          primaryColor: '#1f2937',
          accentColor: '#111827',
          borderRadius: 4,
          fontSize: 13,
          fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        },
        behavior: {
          autoPlay: false,
          loop: false,
          muted: false,
          controls: true,
          fullscreen: true,
          pip: false,
        },
      },
      vibrant: {
        appearance: {
          theme: 'dark',
          primaryColor: '#ec4899',
          accentColor: '#be185d',
          borderRadius: 16,
          fontSize: 15,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        behavior: {
          autoPlay: true,
          loop: true,
          muted: false,
          controls: true,
          fullscreen: true,
          pip: true,
        },
      },
    };
  }

  static applyPreset(
    config: HybridCastWidgetConfig,
    presetName: string
  ): HybridCastWidgetConfig {
    const presets = this.getPresets();
    const preset = presets[presetName];

    if (!preset) {
      throw new Error(`Unknown preset: ${presetName}`);
    }

    return {
      ...config,
      ...preset,
    };
  }

  static exportConfig(config: HybridCastWidgetConfig): string {
    return JSON.stringify(config, null, 2);
  }

  static importConfig(jsonString: string): HybridCastWidgetConfig {
    try {
      const config = JSON.parse(jsonString);
      const validation = this.validateConfig(config);

      if (!validation.valid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }

      return config;
    } catch (error) {
      throw new Error(`Failed to import configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
