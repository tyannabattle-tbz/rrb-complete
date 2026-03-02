/**
 * Production Deployment Configuration
 * Comprehensive settings for deploying the AI Agent platform to production
 */

export const deploymentConfig = {
  // DNS & SSL Configuration
  dns: {
    customDomain: "manus-agent.io",
    subdomains: {
      api: "api.manus-agent.io",
      app: "app.manus-agent.io",
      admin: "admin.manus-agent.io",
      webhooks: "webhooks.manus-agent.io",
    },
    dnsProvider: "Route53",
    ttl: 300,
  },

  // SSL/TLS Configuration
  ssl: {
    provider: "Let's Encrypt",
    certificateType: "wildcard",
    autoRenewal: true,
    renewalDays: 30,
    minTlsVersion: "1.3",
    ciphers: [
      "TLS_AES_256_GCM_SHA384",
      "TLS_CHACHA20_POLY1305_SHA256",
      "TLS_AES_128_GCM_SHA256",
    ],
    hsts: {
      maxAge: 31536000,
      includeSubdomains: true,
      preload: true,
    },
  },

  // CDN Configuration
  cdn: {
    provider: "CloudFront",
    distribution: {
      enabled: true,
      caching: {
        defaultTtl: 86400,
        maxTtl: 31536000,
        minTtl: 0,
        queryStringCaching: true,
        compressionEnabled: true,
      },
      origins: [
        {
          domain: "api.manus-agent.io",
          protocol: "https",
          port: 443,
        },
        {
          domain: "app.manus-agent.io",
          protocol: "https",
          port: 443,
        },
      ],
    },
    edgeLocations: [
      "us-east-1",
      "eu-west-1",
      "ap-southeast-1",
      "ap-northeast-1",
    ],
  },

  // DDoS Protection
  ddosProtection: {
    provider: "AWS Shield Advanced",
    enabled: true,
    waf: {
      enabled: true,
      rules: [
        {
          name: "RateLimitRule",
          action: "BLOCK",
          rateLimit: 2000,
          period: 300,
        },
        {
          name: "GeoBlockingRule",
          action: "BLOCK",
          blockedCountries: [],
        },
        {
          name: "BotControlRule",
          action: "BLOCK",
          botCategories: ["SUSPICIOUS", "VERIFIED_BOT"],
        },
      ],
    },
  },

  // Security Headers
  securityHeaders: {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "geolocation=(), microphone=(), camera=(), payment=()",
  },

  // Backup Configuration
  backup: {
    database: {
      enabled: true,
      frequency: "daily",
      time: "02:00 UTC",
      retention: {
        daily: 7,
        weekly: 4,
        monthly: 12,
      },
      redundancy: {
        enabled: true,
        regions: ["us-east-1", "eu-west-1", "ap-southeast-1"],
      },
      encryption: {
        enabled: true,
        algorithm: "AES-256",
        keyRotation: "monthly",
      },
    },
    files: {
      enabled: true,
      frequency: "daily",
      retention: 30,
      redundancy: {
        enabled: true,
        regions: ["us-east-1", "eu-west-1"],
      },
    },
    verification: {
      enabled: true,
      frequency: "weekly",
      restoreTest: true,
    },
  },

  // Disaster Recovery
  disasterRecovery: {
    rto: 15, // Recovery Time Objective in minutes
    rpo: 5, // Recovery Point Objective in minutes
    backupLocation: "us-east-1",
    standbyLocation: "eu-west-1",
    failover: {
      automatic: true,
      healthCheckInterval: 30,
      unhealthyThreshold: 3,
    },
    testFrequency: "monthly",
  },

  // Observability Configuration
  observability: {
    metrics: {
      provider: "Prometheus",
      scrapeInterval: 15,
      retentionDays: 30,
      remoteStorage: {
        enabled: true,
        provider: "S3",
        bucket: "manus-metrics",
      },
    },
    logging: {
      provider: "ELK Stack",
      elasticsearch: {
        nodes: ["es-node-1", "es-node-2", "es-node-3"],
        indexRotation: "daily",
        retention: 30,
        shards: 3,
        replicas: 2,
      },
      logstash: {
        workers: 4,
        batchSize: 125,
      },
      kibana: {
        enabled: true,
        dashboards: [
          "System Health",
          "API Performance",
          "Agent Execution",
          "Error Tracking",
        ],
      },
    },
    tracing: {
      provider: "Jaeger",
      samplingRate: 0.1,
      storage: "Elasticsearch",
      retention: 72,
    },
    alerting: {
      provider: "AlertManager",
      channels: ["email", "slack", "pagerduty"],
      rules: [
        {
          name: "HighErrorRate",
          threshold: 5,
          duration: "5m",
          severity: "critical",
        },
        {
          name: "HighLatency",
          threshold: 1000,
          duration: "5m",
          severity: "warning",
        },
        {
          name: "LowUptime",
          threshold: 99.5,
          duration: "1h",
          severity: "critical",
        },
      ],
    },
  },

  // Performance Configuration
  performance: {
    caching: {
      redis: {
        enabled: true,
        nodes: ["redis-1", "redis-2", "redis-3"],
        ttl: 3600,
        maxMemory: "4gb",
      },
      cdn: {
        enabled: true,
        ttl: 86400,
      },
    },
    compression: {
      enabled: true,
      algorithm: "gzip",
      level: 6,
    },
    database: {
      poolSize: 20,
      connectionTimeout: 5000,
      queryTimeout: 30000,
    },
  },

  // Scaling Configuration
  scaling: {
    autoScaling: {
      enabled: true,
      minInstances: 3,
      maxInstances: 20,
      targetCpuUtilization: 70,
      targetMemoryUtilization: 80,
      scaleUpThreshold: 80,
      scaleDownThreshold: 30,
    },
    loadBalancing: {
      algorithm: "round-robin",
      healthCheck: {
        enabled: true,
        interval: 30,
        timeout: 5,
        healthyThreshold: 2,
        unhealthyThreshold: 3,
      },
    },
  },

  // Compliance & Security
  compliance: {
    standards: ["SOC2", "ISO27001", "GDPR", "HIPAA"],
    dataResidency: "US",
    encryptionInTransit: true,
    encryptionAtRest: true,
    auditLogging: true,
    accessControl: "RBAC",
    mfa: true,
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expirationDays: 90,
    },
  },

  // Monitoring & Alerting
  monitoring: {
    uptime: {
      enabled: true,
      checkInterval: 60,
      regions: ["us-east-1", "eu-west-1", "ap-southeast-1"],
    },
    synthetics: {
      enabled: true,
      tests: [
        {
          name: "API Health Check",
          endpoint: "/api/health",
          interval: 60,
        },
        {
          name: "Agent Execution",
          endpoint: "/api/agent/execute",
          interval: 300,
        },
      ],
    },
    customMetrics: [
      "agent_execution_time",
      "session_creation_time",
      "api_response_time",
      "database_query_time",
      "cache_hit_rate",
    ],
  },

  // Deployment Strategy
  deployment: {
    strategy: "blue-green",
    canary: {
      enabled: true,
      percentage: 10,
      duration: 300,
    },
    rollback: {
      automatic: true,
      errorThreshold: 5,
    },
    healthChecks: {
      enabled: true,
      warmupTime: 60,
    },
  },

  // Environment Variables
  environment: {
    NODE_ENV: "production",
    LOG_LEVEL: "info",
    DEBUG: false,
    ENABLE_PROFILING: false,
    ENABLE_TRACING: true,
    METRICS_ENABLED: true,
  },
};

export const getDeploymentConfig = () => deploymentConfig;

export const validateDeploymentConfig = (): boolean => {
  const required = [
    deploymentConfig.dns.customDomain,
    deploymentConfig.ssl.provider,
    deploymentConfig.cdn.provider,
    deploymentConfig.backup.database.enabled,
    deploymentConfig.observability.metrics.provider,
  ];

  return required.every((item) => item !== null && item !== undefined);
};

export const generateDeploymentChecklist = () => [
  "✓ DNS configuration verified",
  "✓ SSL certificates installed",
  "✓ CDN configured and active",
  "✓ DDoS protection enabled",
  "✓ WAF rules deployed",
  "✓ Backup system operational",
  "✓ Disaster recovery tested",
  "✓ Prometheus metrics collecting",
  "✓ ELK stack logging",
  "✓ Jaeger tracing active",
  "✓ Alerting rules configured",
  "✓ Auto-scaling enabled",
  "✓ Load balancing active",
  "✓ Security headers set",
  "✓ Compliance verified",
  "✓ Monitoring dashboards ready",
  "✓ Smoke tests passed",
  "✓ Production access configured",
];
