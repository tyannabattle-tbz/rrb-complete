/**
 * Production Deployment Configuration
 * 
 * This configuration file contains all production settings for the Manus Agent Web platform.
 * It ensures all features are properly configured for deployment on Mac Mini and other
 * production environments.
 */

export const productionConfig = {
  // Application Settings
  app: {
    name: 'Manus Agent Web',
    version: '1.0.0',
    environment: 'production',
    port: process.env.PORT || 3000,
    nodeEnv: 'production',
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'mysql://localhost:3306/manus_agent_web',
    pool: {
      min: 5,
      max: 20,
    },
    ssl: {
      enabled: process.env.DB_SSL_ENABLED === 'true',
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    },
  },

  // Authentication
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiry: '7d',
    cookieName: 'manus_session',
    cookieSecure: true,
    cookieHttpOnly: true,
    cookieSameSite: 'strict',
    oauthServerUrl: process.env.OAUTH_SERVER_URL,
    oauthPortalUrl: process.env.VITE_OAUTH_PORTAL_URL,
  },

  // Stripe Payment Processing
  stripe: {
    enabled: !!process.env.STRIPE_SECRET_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    mode: process.env.STRIPE_MODE || 'test',
  },

  // Forge API Integration
  forgeApi: {
    url: process.env.BUILT_IN_FORGE_API_URL,
    serverKey: process.env.BUILT_IN_FORGE_API_KEY,
    clientKey: process.env.VITE_FRONTEND_FORGE_API_KEY,
    clientUrl: process.env.VITE_FRONTEND_FORGE_API_URL,
  },

  // Analytics
  analytics: {
    endpoint: process.env.VITE_ANALYTICS_ENDPOINT,
    websiteId: process.env.VITE_ANALYTICS_WEBSITE_ID,
    enabled: !!process.env.VITE_ANALYTICS_ENDPOINT,
  },

  // Features Configuration
  features: {
    // RRB Broadcast Monitoring
    broadcastMonitoring: {
      enabled: true,
      updateInterval: 5000, // 5 seconds
      maxMetricsHistory: 1000,
      wsEndpoint: process.env.BROADCAST_WS_ENDPOINT || 'wss://broadcast.manus.im',
    },

    // Content Recommendations
    recommendations: {
      enabled: true,
      algorithm: 'collaborative-filtering',
      maxRecommendations: 20,
      minRelevanceScore: 0.5,
      updateInterval: 3600000, // 1 hour
    },

    // Sweet Miracles Impact Dashboard
    impactDashboard: {
      enabled: true,
      refreshInterval: 60000, // 1 minute
      enableNotifications: true,
      milestoneNotifications: true,
    },

    // Drone Infrastructure
    drone: {
      cicd: {
        enabled: true,
        provider: 'drone',
        endpoint: process.env.DRONE_SERVER_URL,
        token: process.env.DRONE_TOKEN,
      },
      logistics: {
        enabled: true,
        wsEndpoint: process.env.DRONE_LOGISTICS_WS || 'wss://logistics.manus.im',
        updateInterval: 2000, // 2 seconds
        encryption: 'AES-256-GCM',
      },
      videoCapture: {
        enabled: true,
        hybridcastIntegration: true,
        adaptiveBitrate: true,
        maxBitrate: 10000, // kbps
      },
    },

    // Map Arsenal
    mapArsenal: {
      enabled: true,
      provider: 'leaflet',
      defaultZoom: 12,
      maxZoom: 18,
      minZoom: 2,
      fullscreenMode: true,
      layerManagement: true,
      exportFormats: ['pdf', 'png', 'geojson'],
      offlineCaching: true,
    },
  },

  // Qumus AI Orchestration
  qumus: {
    enabled: true,
    autonomyLevel: 0.9, // 90% autonomous
    humanOversightRequired: true,
    decisionPolicies: 8,
    realTimeMonitoring: true,
    webhookUrl: process.env.QUMUS_WEBHOOK_URL,
    apiKey: process.env.QUMUS_API_KEY,
  },

  // HybridCast Integration
  hybridcast: {
    enabled: true,
    features: [
      'offline-first',
      'mesh-networking',
      'emergency-broadcast',
      'accessibility',
      'role-based-access',
    ],
    meshNetworking: {
      enabled: true,
      protocols: ['lora', 'meshtastic'],
      webSerial: true,
      webBluetooth: true,
    },
  },

  // Security
  security: {
    // CORS Configuration
    cors: {
      enabled: true,
      origins: [
        'http://localhost:3000',
        'http://localhost:3001',
        process.env.FRONTEND_URL || 'https://manus-agent-web.manus.space',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },

    // Rate Limiting
    rateLimit: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
      keyGenerator: (req) => req.ip,
    },

    // HTTPS/SSL
    https: {
      enabled: true,
      certPath: process.env.SSL_CERT_PATH,
      keyPath: process.env.SSL_KEY_PATH,
      redirectHttp: true,
    },

    // Security Headers
    securityHeaders: {
      contentSecurityPolicy: true,
      xssProtection: true,
      frameOptions: 'DENY',
      noSniff: true,
      referrerPolicy: 'strict-origin-when-cross-origin',
    },

    // Encryption
    encryption: {
      algorithm: 'AES-256-GCM',
      keyDerivation: 'PBKDF2',
      iterations: 100000,
    },
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    destination: process.env.LOG_DIR || './logs',
    maxFileSize: '100m',
    maxFiles: 14, // 2 weeks of daily logs
    errorTracking: {
      enabled: true,
      service: process.env.ERROR_TRACKING_SERVICE,
      dsn: process.env.ERROR_TRACKING_DSN,
    },
  },

  // Performance
  performance: {
    // Caching
    cache: {
      enabled: true,
      provider: 'redis',
      ttl: 3600, // 1 hour
      maxSize: '1gb',
    },

    // Compression
    compression: {
      enabled: true,
      level: 6,
      threshold: 1024, // bytes
    },

    // CDN
    cdn: {
      enabled: !!process.env.CDN_URL,
      url: process.env.CDN_URL,
      cacheControl: 'public, max-age=31536000',
    },
  },

  // Backup & Disaster Recovery
  backup: {
    enabled: true,
    schedule: '0 2 * * *', // 2 AM daily
    destination: process.env.BACKUP_DESTINATION || './backups',
    retention: 30, // days
    encryption: true,
  },

  // Monitoring & Alerts
  monitoring: {
    enabled: true,
    healthCheckInterval: 60000, // 1 minute
    metrics: {
      enabled: true,
      provider: 'prometheus',
      endpoint: '/metrics',
    },
    alerts: {
      enabled: true,
      channels: ['email', 'slack'],
      thresholds: {
        cpuUsage: 80,
        memoryUsage: 85,
        diskUsage: 90,
        errorRate: 5, // percent
      },
    },
  },

  // Owner Information
  owner: {
    name: process.env.OWNER_NAME,
    openId: process.env.OWNER_OPEN_ID,
    email: process.env.OWNER_EMAIL,
  },

  // Application URLs
  urls: {
    frontend: process.env.FRONTEND_URL || 'http://localhost:3000',
    api: process.env.API_URL || 'http://localhost:3000/api',
    webhookUrl: process.env.WEBHOOK_URL,
  },
};

/**
 * Validate production configuration
 */
export function validateProductionConfig(): boolean {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'OAUTH_SERVER_URL',
    'VITE_OAUTH_PORTAL_URL',
    'VITE_APP_ID',
  ];

  const missing = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missing.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missing.join(', ')}`
    );
    return false;
  }

  console.log('✅ Production configuration validated successfully');
  return true;
}

/**
 * Get feature status
 */
export function getFeatureStatus() {
  return {
    broadcastMonitoring: productionConfig.features.broadcastMonitoring.enabled,
    recommendations: productionConfig.features.recommendations.enabled,
    impactDashboard: productionConfig.features.impactDashboard.enabled,
    droneInfrastructure: productionConfig.features.drone.cicd.enabled,
    mapArsenal: productionConfig.features.mapArsenal.enabled,
    qumusAI: productionConfig.qumus.enabled,
    hybridcast: productionConfig.hybridcast.enabled,
  };
}

export default productionConfig;
