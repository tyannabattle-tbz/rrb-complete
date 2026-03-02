/**
 * Qumus Offline Configuration System
 * Manages all offline-first settings with cloud fallbacks
 * Zero external dependencies required for core functionality
 */

import path from 'path';
import os from 'os';

export interface OfflineConfig {
  // Database Configuration
  database: {
    type: 'sqlite' | 'mysql' | 'postgresql';
    sqlite?: {
      path: string;
      enableWAL: boolean;
    };
    mysql?: {
      host: string;
      port: number;
      user: string;
      password: string;
      database: string;
    };
    postgresql?: {
      host: string;
      port: number;
      user: string;
      password: string;
      database: string;
    };
  };

  // LLM Configuration
  llm: {
    primary: 'ollama' | 'openai' | 'anthropic' | 'local';
    ollama?: {
      baseUrl: string;
      model: string;
      port: number;
    };
    openai?: {
      apiKey: string;
      model: string;
    };
    anthropic?: {
      apiKey: string;
      model: string;
    };
    fallback: 'cloud' | 'local' | 'none';
    timeout: number;
  };

  // Storage Configuration
  storage: {
    type: 'local' | 's3' | 'minio';
    local?: {
      basePath: string;
      maxFileSize: number; // in bytes
    };
    s3?: {
      bucket: string;
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
    };
    minio?: {
      endpoint: string;
      port: number;
      useSSL: boolean;
      accessKey: string;
      secretKey: string;
      bucket: string;
    };
  };

  // Email Configuration
  email: {
    type: 'smtp' | 'sendgrid' | 'mailgun' | 'offline';
    smtp?: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
    sendgrid?: {
      apiKey: string;
    };
    mailgun?: {
      apiKey: string;
      domain: string;
    };
    offline?: {
      logPath: string;
      queuePath: string;
    };
  };

  // Payment Configuration
  payment: {
    type: 'stripe' | 'simulation' | 'offline';
    stripe?: {
      secretKey: string;
      publishableKey: string;
    };
    simulation?: {
      enabled: boolean;
      dataPath: string;
    };
  };

  // Server Configuration
  server: {
    port: number;
    host: string;
    environment: 'development' | 'production' | 'offline';
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };

  // Offline Mode Settings
  offline: {
    enabled: boolean;
    queuePath: string;
    syncInterval: number; // milliseconds
    maxQueueSize: number;
    persistState: boolean;
  };
}

/**
 * Get default offline configuration
 */
export function getDefaultOfflineConfig(): OfflineConfig {
  const homeDir = os.homedir();
  const qumusDir = path.join(homeDir, '.qumus');

  return {
    database: {
      type: 'sqlite',
      sqlite: {
        path: path.join(qumusDir, 'qumus.db'),
        enableWAL: true,
      },
    },

    llm: {
      primary: 'ollama',
      ollama: {
        baseUrl: 'http://localhost',
        model: 'mistral',
        port: 11434,
      },
      fallback: 'none',
      timeout: 30000,
    },

    storage: {
      type: 'local',
      local: {
        basePath: path.join(qumusDir, 'storage'),
        maxFileSize: 100 * 1024 * 1024, // 100MB
      },
    },

    email: {
      type: 'offline',
      offline: {
        logPath: path.join(qumusDir, 'emails'),
        queuePath: path.join(qumusDir, 'email-queue'),
      },
    },

    payment: {
      type: 'simulation',
      simulation: {
        enabled: true,
        dataPath: path.join(qumusDir, 'payments'),
      },
    },

    server: {
      port: 3000,
      host: 'localhost',
      environment: 'offline',
      logLevel: 'info',
    },

    offline: {
      enabled: true,
      queuePath: path.join(qumusDir, 'queue'),
      syncInterval: 60000,
      maxQueueSize: 10000,
      persistState: true,
    },
  };
}

/**
 * Get configuration from environment variables
 */
export function getConfigFromEnv(): Partial<OfflineConfig> {
  const config: Partial<OfflineConfig> = {};

  // Database
  if (process.env.DATABASE_URL) {
    if (process.env.DATABASE_URL.startsWith('sqlite:')) {
      config.database = {
        type: 'sqlite',
        sqlite: {
          path: process.env.DATABASE_URL.replace('sqlite://', ''),
          enableWAL: true,
        },
      };
    }
  }

  // LLM
  if (process.env.OLLAMA_BASE_URL) {
    config.llm = {
      primary: 'ollama',
      ollama: {
        baseUrl: process.env.OLLAMA_BASE_URL,
        model: process.env.OLLAMA_MODEL || 'mistral',
        port: parseInt(process.env.OLLAMA_PORT || '11434'),
      },
      fallback: 'none',
      timeout: 30000,
    };
  }

  if (process.env.OPENAI_API_KEY) {
    config.llm = {
      primary: 'openai',
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-4',
      },
      fallback: 'local',
      timeout: 30000,
    };
  }

  // Storage
  if (process.env.STORAGE_TYPE === 'minio') {
    config.storage = {
      type: 'minio',
      minio: {
        endpoint: process.env.MINIO_ENDPOINT || 'localhost',
        port: parseInt(process.env.MINIO_PORT || '9000'),
        useSSL: process.env.MINIO_USE_SSL === 'true',
        accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
        bucket: process.env.MINIO_BUCKET || 'qumus',
      },
    };
  }

  // Email
  if (process.env.SMTP_HOST) {
    config.email = {
      type: 'smtp',
      smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
      },
    };
  }

  // Server
  if (process.env.PORT || process.env.NODE_ENV) {
    config.server = {
      port: parseInt(process.env.PORT || '3000'),
      host: process.env.HOST || 'localhost',
      environment: (process.env.NODE_ENV as any) || 'offline',
      logLevel: (process.env.LOG_LEVEL as any) || 'info',
    };
  }

  return config;
}

/**
 * Merge configurations with defaults
 */
export function mergeConfigs(
  defaults: OfflineConfig,
  overrides: Partial<OfflineConfig>
): OfflineConfig {
  return {
    database: { ...defaults.database, ...overrides.database },
    llm: { ...defaults.llm, ...overrides.llm },
    storage: { ...defaults.storage, ...overrides.storage },
    email: { ...defaults.email, ...overrides.email },
    payment: { ...defaults.payment, ...overrides.payment },
    server: { ...defaults.server, ...overrides.server },
    offline: { ...defaults.offline, ...overrides.offline },
  };
}

/**
 * Load configuration
 */
export function loadOfflineConfig(): OfflineConfig {
  const defaults = getDefaultOfflineConfig();
  const envOverrides = getConfigFromEnv();
  return mergeConfigs(defaults, envOverrides);
}

// Export singleton instance
export const offlineConfig = loadOfflineConfig();
