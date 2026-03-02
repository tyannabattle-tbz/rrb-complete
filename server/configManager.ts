/**
 * Environment Configuration Management System
 * 
 * Manages environment variables and configuration for all services
 */

export interface ConfigValue {
  key: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  required: boolean;
  default?: string | number | boolean;
  validation?: (value: any) => boolean;
}

export interface ConfigSection {
  name: string;
  description: string;
  configs: ConfigValue[];
}

class ConfigurationManager {
  private configs: Map<string, ConfigValue> = new Map();
  private sections: Map<string, ConfigSection> = new Map();
  private overrides: Map<string, any> = new Map();

  constructor() {
    this.initializeConfigurations();
  }

  /**
   * Initialize all configuration sections
   */
  private initializeConfigurations() {
    // Database Configuration
    this.registerSection({
      name: 'database',
      description: 'Database connection and settings',
      configs: [
        {
          key: 'DATABASE_URL',
          value: process.env.DATABASE_URL || '',
          type: 'string',
          description: 'Database connection string',
          required: true,
        },
        {
          key: 'DATABASE_POOL_SIZE',
          value: parseInt(process.env.DATABASE_POOL_SIZE || '10'),
          type: 'number',
          description: 'Database connection pool size',
          required: false,
          default: 10,
        },
      ],
    });

    // Broadcast Service Configuration
    this.registerSection({
      name: 'broadcast',
      description: 'RRB Broadcast service configuration',
      configs: [
        {
          key: 'RRB_BROADCAST_API',
          value: process.env.RRB_BROADCAST_API || 'http://localhost:3001/api/broadcast',
          type: 'string',
          description: 'RRB Broadcast API endpoint',
          required: false,
          default: 'http://localhost:3001/api/broadcast',
        },
        {
          key: 'RRB_WEBHOOK_URL',
          value: process.env.RRB_WEBHOOK_URL || '',
          type: 'string',
          description: 'RRB Webhook URL for Qumus decisions',
          required: false,
        },
        {
          key: 'RRB_WEBHOOK_SECRET',
          value: process.env.RRB_WEBHOOK_SECRET || '',
          type: 'string',
          description: 'RRB Webhook secret for signature verification',
          required: false,
        },
      ],
    });

    // Drone Service Configuration
    this.registerSection({
      name: 'drone',
      description: 'Drone fleet service configuration',
      configs: [
        {
          key: 'DRONE_API',
          value: process.env.DRONE_API || 'http://localhost:3002/api/fleet',
          type: 'string',
          description: 'Drone Fleet API endpoint',
          required: false,
          default: 'http://localhost:3002/api/fleet',
        },
        {
          key: 'DRONE_WEBHOOK_URL',
          value: process.env.DRONE_WEBHOOK_URL || '',
          type: 'string',
          description: 'Drone Webhook URL for Qumus decisions',
          required: false,
        },
        {
          key: 'DRONE_WEBHOOK_SECRET',
          value: process.env.DRONE_WEBHOOK_SECRET || '',
          type: 'string',
          description: 'Drone Webhook secret',
          required: false,
        },
      ],
    });

    // Fundraising Service Configuration
    this.registerSection({
      name: 'fundraising',
      description: 'Fundraising and donation service configuration',
      configs: [
        {
          key: 'FUNDRAISING_API',
          value: process.env.FUNDRAISING_API || 'http://localhost:3003/api/donations',
          type: 'string',
          description: 'Fundraising API endpoint',
          required: false,
          default: 'http://localhost:3003/api/donations',
        },
        {
          key: 'FUNDRAISING_WEBHOOK_URL',
          value: process.env.FUNDRAISING_WEBHOOK_URL || '',
          type: 'string',
          description: 'Fundraising Webhook URL',
          required: false,
        },
        {
          key: 'FUNDRAISING_WEBHOOK_SECRET',
          value: process.env.FUNDRAISING_WEBHOOK_SECRET || '',
          type: 'string',
          description: 'Fundraising Webhook secret',
          required: false,
        },
      ],
    });

    // Qumus Service Configuration
    this.registerSection({
      name: 'qumus',
      description: 'Qumus autonomous orchestration configuration',
      configs: [
        {
          key: 'QUMUS_API',
          value: process.env.QUMUS_API || 'http://localhost:3004/api/decisions',
          type: 'string',
          description: 'Qumus API endpoint',
          required: false,
          default: 'http://localhost:3004/api/decisions',
        },
        {
          key: 'QUMUS_AUTONOMY_LEVEL',
          value: parseInt(process.env.QUMUS_AUTONOMY_LEVEL || '90'),
          type: 'number',
          description: 'Qumus autonomy level (0-100)',
          required: false,
          default: 90,
          validation: (v) => v >= 0 && v <= 100,
        },
      ],
    });

    // Alert Configuration
    this.registerSection({
      name: 'alerts',
      description: 'Alert and notification configuration',
      configs: [
        {
          key: 'ALERT_WEBHOOK_URL',
          value: process.env.ALERT_WEBHOOK_URL || '',
          type: 'string',
          description: 'Alert webhook URL for notifications',
          required: false,
        },
        {
          key: 'ALERT_EMAIL_ENABLED',
          value: process.env.ALERT_EMAIL_ENABLED === 'true',
          type: 'boolean',
          description: 'Enable email alerts',
          required: false,
          default: true,
        },
        {
          key: 'ALERT_SMS_ENABLED',
          value: process.env.ALERT_SMS_ENABLED === 'true',
          type: 'boolean',
          description: 'Enable SMS alerts',
          required: false,
          default: false,
        },
      ],
    });

    // Security Configuration
    this.registerSection({
      name: 'security',
      description: 'Security and encryption settings',
      configs: [
        {
          key: 'JWT_SECRET',
          value: process.env.JWT_SECRET || '',
          type: 'string',
          description: 'JWT signing secret',
          required: true,
        },
        {
          key: 'ENCRYPTION_KEY',
          value: process.env.ENCRYPTION_KEY || '',
          type: 'string',
          description: 'Data encryption key',
          required: false,
        },
        {
          key: 'RATE_LIMIT_ENABLED',
          value: process.env.RATE_LIMIT_ENABLED !== 'false',
          type: 'boolean',
          description: 'Enable rate limiting',
          required: false,
          default: true,
        },
        {
          key: 'RATE_LIMIT_REQUESTS',
          value: parseInt(process.env.RATE_LIMIT_REQUESTS || '100'),
          type: 'number',
          description: 'Rate limit requests per minute',
          required: false,
          default: 100,
        },
      ],
    });
  }

  /**
   * Register a configuration section
   */
  private registerSection(section: ConfigSection) {
    this.sections.set(section.name, section);
    for (const config of section.configs) {
      this.configs.set(config.key, config);
    }
  }

  /**
   * Get configuration value
   */
  public get(key: string): any {
    // Check overrides first
    if (this.overrides.has(key)) {
      return this.overrides.get(key);
    }

    const config = this.configs.get(key);
    if (!config) {
      throw new Error(`Configuration key not found: ${key}`);
    }

    return config.value;
  }

  /**
   * Set configuration override
   */
  public set(key: string, value: any): void {
    const config = this.configs.get(key);
    if (!config) {
      throw new Error(`Configuration key not found: ${key}`);
    }

    // Validate if validation function exists
    if (config.validation && !config.validation(value)) {
      throw new Error(`Invalid value for ${key}: ${value}`);
    }

    this.overrides.set(key, value);
  }

  /**
   * Get all configurations
   */
  public getAll(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, config] of this.configs) {
      result[key] = this.overrides.has(key) ? this.overrides.get(key) : config.value;
    }
    return result;
  }

  /**
   * Get section configurations
   */
  public getSection(sectionName: string): Record<string, any> {
    const section = this.sections.get(sectionName);
    if (!section) {
      throw new Error(`Configuration section not found: ${sectionName}`);
    }

    const result: Record<string, any> = {};
    for (const config of section.configs) {
      result[config.key] = this.overrides.has(config.key) ? this.overrides.get(config.key) : config.value;
    }
    return result;
  }

  /**
   * Validate all required configurations
   */
  public validateRequired(): { valid: boolean; missing: string[] } {
    const missing: string[] = [];

    for (const [key, config] of this.configs) {
      if (config.required) {
        const value = this.overrides.has(key) ? this.overrides.get(key) : config.value;
        if (!value) {
          missing.push(key);
        }
      }
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
   * Get configuration report
   */
  public getReport(): Record<string, any> {
    const report: Record<string, any> = {};

    for (const [sectionName, section] of this.sections) {
      report[sectionName] = {
        description: section.description,
        configs: {},
      };

      for (const config of section.configs) {
        const value = this.overrides.has(config.key) ? this.overrides.get(config.key) : config.value;
        report[sectionName].configs[config.key] = {
          description: config.description,
          type: config.type,
          required: config.required,
          value: config.key.includes('SECRET') || config.key.includes('PASSWORD') ? '***' : value,
          configured: !!value,
        };
      }
    }

    return report;
  }
}

// Global instance
let configManager: ConfigurationManager | null = null;

export function initializeConfigManager(): ConfigurationManager {
  if (!configManager) {
    configManager = new ConfigurationManager();
  }
  return configManager;
}

export function getConfigManager(): ConfigurationManager | null {
  return configManager;
}
