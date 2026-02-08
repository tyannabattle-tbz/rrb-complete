# QUMUS Customization Template

## Overview

This template allows you to customize your QUMUS (Quantum Unified Multi-System Orchestration System) instance to match your specific needs. QUMUS is a complete broadcast orchestration platform with autonomous AI agents, streaming management, and content generation capabilities.

## Quick Start

1. **Clone or download QUMUS**
   ```bash
   git clone https://github.com/qumus/qumus.git
   cd qumus
   ```

2. **Run the installation script**
   ```bash
   chmod +x install-qumus.sh
   ./install-qumus.sh --customize
   ```

3. **Configure your instance** using the interactive wizard

4. **Start QUMUS**
   ```bash
   ./install-qumus.sh --dev    # Development mode
   # or
   ./install-qumus.sh --prod   # Production mode
   ```

## Configuration Guide

### 1. Application Identity

Customize the name and branding of your QUMUS instance:

```json
{
  "appName": "My Custom QUMUS",
  "appDescription": "My autonomous broadcast orchestration system",
  "appLogo": "/path/to/logo.png",
  "appColors": {
    "primary": "#0066cc",
    "secondary": "#00cc99",
    "accent": "#ff6600"
  }
}
```

### 2. Subsystem Configuration

#### Rockin Rockin Boogie (RRB) - Broadcast Management

```json
{
  "rockinBoogie": {
    "enabled": true,
    "defaultBroadcastDuration": 3600,
    "autoGenerateContent": true,
    "musicLibrary": {
      "enabled": true,
      "defaultGenre": "mixed",
      "maxTracksPerBroadcast": 20
    },
    "commercials": {
      "enabled": true,
      "maxCommercialDuration": 60,
      "insertionFrequency": 900
    },
    "autonomyLevel": 75
  }
}
```

#### HybridCast - Streaming & Distribution

```json
{
  "hybridcast": {
    "enabled": true,
    "platforms": ["twitch", "youtube", "facebook"],
    "defaultBitrate": 5000,
    "defaultResolution": "1080p60",
    "analytics": {
      "enabled": true,
      "trackGeolocation": true,
      "trackDevices": true,
      "trackEngagement": true
    }
  }
}
```

#### Ollama - Local LLM Inference

```json
{
  "ollama": {
    "enabled": true,
    "baseUrl": "http://localhost:11434",
    "defaultModel": "llama2",
    "availableModels": ["llama2", "mistral", "neural-chat"],
    "streaming": true,
    "timeout": 300000
  }
}
```

### 3. Autonomous Agent Configuration

```json
{
  "autonomousAgents": {
    "enabled": true,
    "defaultAutonomyLevel": 75,
    "approvalRequired": {
      "high": true,
      "medium": false,
      "low": false
    },
    "policies": [
      {
        "name": "Auto-Schedule Broadcasts",
        "autonomyLevel": 85,
        "triggers": ["time-based", "content-available"],
        "actions": ["schedule-broadcast", "generate-content"]
      },
      {
        "name": "Auto-Distribute Content",
        "autonomyLevel": 90,
        "triggers": ["broadcast-complete"],
        "actions": ["distribute-to-platforms", "update-analytics"]
      }
    ]
  }
}
```

### 4. Security Configuration

```json
{
  "security": {
    "fipsCompliance": true,
    "encryption": {
      "algorithm": "AES-256-GCM",
      "keyRotation": 86400000
    },
    "tls": {
      "version": "1.3",
      "ciphers": "TLS_AES_256_GCM_SHA384"
    },
    "authentication": {
      "oauth": true,
      "mfa": true,
      "sessionTimeout": 3600000
    },
    "auditLogging": {
      "enabled": true,
      "retention": 2592000000
    }
  }
}
```

### 5. Database Configuration

```json
{
  "database": {
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "database": "qumus",
    "user": "qumus_user",
    "password": "secure_password",
    "ssl": true,
    "pool": {
      "min": 2,
      "max": 10
    }
  }
}
```

### 6. Feature Toggles

```json
{
  "features": {
    "videoGeneration": true,
    "watermarking": true,
    "batchProcessing": true,
    "analytics": true,
    "marketing": true,
    "voiceToText": true,
    "documentUpload": true,
    "realTimeMonitoring": true,
    "mobileStudio": true
  }
}
```

### 7. Integration Configuration

```json
{
  "integrations": {
    "stripe": {
      "enabled": false,
      "publishableKey": "pk_test_...",
      "secretKey": "sk_test_..."
    },
    "googleMaps": {
      "enabled": true,
      "apiKey": "your_api_key"
    },
    "webhooks": {
      "enabled": true,
      "retryAttempts": 3,
      "retryDelay": 5000
    }
  }
}
```

## Environment Variables

Create a `.env` file in your QUMUS root directory:

```bash
# Application
NODE_ENV=production
QUMUS_PORT=3000
QUMUS_ENV=production

# Database
DATABASE_URL=mysql://user:password@localhost:3306/qumus

# Ollama
OLLAMA_BASE_URL=http://localhost:11434

# OAuth
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im

# Security
JWT_SECRET=your_jwt_secret_here

# API Keys
BUILT_IN_FORGE_API_KEY=your_api_key
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your_website_id
```

## Customizing the UI

### Branding

Edit `client/src/index.css` to customize colors:

```css
@layer base {
  :root {
    --primary: #0066cc;
    --secondary: #00cc99;
    --accent: #ff6600;
    --background: #ffffff;
    --foreground: #000000;
  }
}
```

### Navigation

Edit `client/src/components/AppHeaderEnhanced.tsx` to customize navigation items:

```tsx
const navigationItems = [
  { label: "Home", href: "/" },
  { label: "Chat", href: "/chat" },
  { label: "Rockin Boogie", href: "/rockin-boogie" },
  { label: "HybridCast", href: "/hybridcast" },
  // Add your custom items here
];
```

### Custom Pages

Create new pages in `client/src/pages/`:

```tsx
// client/src/pages/MyCustomPage.tsx
export default function MyCustomPage() {
  return (
    <div className="container">
      <h1>My Custom Page</h1>
      {/* Your content here */}
    </div>
  );
}
```

Register in `client/src/App.tsx`:

```tsx
<Route path="/my-custom-page" component={MyCustomPage} />
```

## Deploying Your Custom QUMUS

### Development

```bash
./install-qumus.sh --dev
```

### Production

```bash
# Build
pnpm build

# Start
NODE_ENV=production pnpm start

# Or use the installation script
./install-qumus.sh --prod
```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

Build and run:

```bash
docker build -t my-qumus .
docker run -p 3000:3000 -e DATABASE_URL=... my-qumus
```

## Advanced Customization

### Adding Custom Routers

Create `server/routers/myCustomRouter.ts`:

```typescript
import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';

export const myCustomRouter = router({
  getData: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // Your logic here
      return { data: "custom data" };
    }),
});
```

Register in `server/routers.ts`:

```typescript
import { myCustomRouter } from './routers/myCustomRouter';

export const appRouter = router({
  // ... other routers
  myCustom: myCustomRouter,
});
```

### Adding Custom Services

Create `server/myCustomService.ts`:

```typescript
export class MyCustomService {
  async doSomething(input: string): Promise<string> {
    // Your implementation
    return `Processed: ${input}`;
  }
}

export const myCustomService = new MyCustomService();
```

## Support & Documentation

- **Official Docs**: https://docs.qumus.ai
- **GitHub**: https://github.com/qumus/qumus
- **Community**: https://community.qumus.ai
- **Issues**: https://github.com/qumus/qumus/issues

## License

QUMUS is open-source and available under the Apache 2.0 License.

## Contributing

We welcome contributions! Please see CONTRIBUTING.md for guidelines.

---

**Happy customizing! 🚀**

For questions or issues, please open an issue on GitHub or contact our support team.
