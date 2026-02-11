# Customize Your Own Autonomous Ecosystem

**Based on the RRB QUMUS Ecosystem by Canryn Production and its subsidiaries**

This guide walks you through forking and customizing this platform into your own branded autonomous ecosystem. No deep technical knowledge required — follow the steps in order and you will have a fully operational, white-label platform running under your own brand.

---

## Table of Contents

1. [Quick Overview](#quick-overview)
2. [Prerequisites](#prerequisites)
3. [Step 1 — Clone and Install](#step-1--clone-and-install)
4. [Step 2 — Brand Identity](#step-2--brand-identity)
5. [Step 3 — Theme and Colors](#step-3--theme-and-colors)
6. [Step 4 — Platform Modules](#step-4--platform-modules)
7. [Step 5 — QUMUS Brain Configuration](#step-5--qumus-brain-configuration)
8. [Step 6 — Database Customization](#step-6--database-customization)
9. [Step 7 — Payment Setup](#step-7--payment-setup)
10. [Step 8 — Content and Media](#step-8--content-and-media)
11. [Step 9 — Voice and Accessibility](#step-9--voice-and-accessibility)
12. [Step 10 — Deploy to Production](#step-10--deploy-to-production)
13. [Architecture Reference](#architecture-reference)
14. [FAQ](#faq)

---

## Quick Overview

This ecosystem is a full-stack autonomous platform built with React 19, Express 4, tRPC 11, Drizzle ORM, and Tailwind CSS 4. It includes:

| Feature | What You Get |
|---------|-------------|
| QUMUS Brain | Autonomous decision engine (90% auto, 10% human override) with 8 policies |
| Radio Network | 7-channel 24/7 broadcasting with content scheduling |
| Podcast Network | iTunes-compatible hosting with RSS feeds |
| Emergency Broadcast | Offline-first PWA with mesh networking (HybridCast) |
| Dice Game | Customizable sacred math game with AI opponents |
| Meditation Hub | Healing frequencies with binaural beats |
| Studio Suite | 5 production tools (audio, video, podcast, broadcast, publisher) |
| Merchandise Shop | E-commerce with Stripe checkout |
| Nonprofit Module | Donation management with grant discovery |
| Proof Vault | Archival documentation system |
| Royalty Tracker | Collaborator earnings and split management |
| AI Collaboration Hub | Engagement with 12+ open-source AI systems |
| Intelligence Dashboard | Real-time QUMUS monitoring with anomaly detection |
| Voice Commands | Speech recognition and text-to-speech |
| ADA Compliance | WCAG-compliant accessibility panel |

---

## Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Node.js | 22.x+ | Runtime |
| pnpm | 9.x+ | Package manager |
| MySQL or TiDB | 8.0+ | Database |
| Stripe Account | — | Payments (optional) |

---

## Step 1 — Clone and Install

```bash
# Extract the ecosystem
unzip rrb-qumus-ecosystem-v3.1.0.zip -d my-ecosystem
cd my-ecosystem

# Install all dependencies
pnpm install

# Set up environment
cp .env.example .env
```

Edit `.env` with your database credentials and API keys. See `INSTALL.md` for the full environment variable reference.

```bash
# Push database schema (creates all 150 tables)
pnpm db:push

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to verify the base platform is running.

---

## Step 2 — Brand Identity

Replace the RRB branding with your own. These are the key files to update:

### 2a. Site Title and Logo

Set these environment variables (or update via the Manus Settings panel):

```env
VITE_APP_TITLE=Your Platform Name
VITE_APP_LOGO=https://your-cdn.com/logo.png
```

### 2b. Navigation Branding

Edit `client/src/components/rrb/Navigation.tsx`:

```tsx
// Find the logo area (around line 15-25)
// Replace "RRB" with your brand abbreviation
<span className="text-xl font-bold text-amber-600">YOUR BRAND</span>
```

### 2c. Home Page Hero

Edit `client/src/pages/rrb/Home.tsx`:

| Find | Replace With |
|------|-------------|
| "Rockin' Rockin' Boogie" | Your platform name |
| "Seabrun Candy Hunter" | Your founder/artist name |
| "A legacy restored — unified ecosystem..." | Your tagline |
| Vinyl record image URL | Your hero image URL |

### 2d. Footer and Credits

Search across the project for "Canryn Production" and replace with your organization name:

```bash
grep -rn "Canryn Production" client/src/ --include="*.tsx"
```

Replace all instances with your production company name. Similarly search for "Sweet Miracles" if you have a different nonprofit arm.

### 2e. PWA Manifest

Edit `client/public/manifest.json` (if present) or the meta tags in `client/index.html`:

```html
<title>Your Platform Name</title>
<meta name="description" content="Your platform description" />
```

---

## Step 3 — Theme and Colors

### 3a. Color Palette

Edit `client/src/index.css` to change the OKLCH color variables:

```css
@layer base {
  :root {
    /* Primary brand color — change these to your palette */
    --primary: 0.65 0.15 45;        /* Amber/gold — change hue (last number) */
    --primary-foreground: 0.98 0 0;  /* White text on primary */
    
    /* Background */
    --background: 0.99 0 0;          /* Near-white */
    --foreground: 0.15 0 0;          /* Near-black text */
    
    /* Accent */
    --accent: 0.92 0.03 45;          /* Light amber — match your primary hue */
    --accent-foreground: 0.25 0 0;
  }
}
```

The OKLCH format uses three values: **lightness** (0-1), **chroma** (0-0.4), and **hue** (0-360). Common hue values:

| Color | Hue Value |
|-------|-----------|
| Red | 25 |
| Orange | 55 |
| Amber/Gold | 85 |
| Green | 145 |
| Teal | 185 |
| Blue | 250 |
| Purple | 300 |
| Pink | 350 |

### 3b. Fonts

Edit `client/index.html` to change the Google Font:

```html
<link href="https://fonts.googleapis.com/css2?family=Your+Font:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Then update `client/src/index.css`:

```css
@theme inline {
  --font-sans: "Your Font", sans-serif;
}
```

---

## Step 4 — Platform Modules

You can enable, disable, or rename any module. Each module is a self-contained page + router + service.

### Module Map

| Module | Page File | Router File | Can Remove? |
|--------|-----------|-------------|-------------|
| Radio Network | `pages/RadioStation.tsx` | `routers/radioStation.ts` | Yes |
| Podcast Network | `pages/PodcastNetwork.tsx` | `routers/podcastNetwork.ts` | Yes |
| HybridCast Emergency | `pages/HybridCast*.tsx` | `routers/hybridcast*.ts` | Yes |
| Solbones Dice Game | `pages/Solbones*.tsx` | `routers/solbones*.ts` | Yes |
| Meditation Hub | `pages/MeditationHub.tsx` | `routers/meditation*.ts` | Yes |
| Studio Suite | `pages/Studio*.tsx` | `routers/studio*.ts` | Yes |
| Merchandise Shop | `pages/rrb/MerchShop.tsx` | `routers/rrb/merchShop.ts` | Yes |
| Nonprofit/Donations | `pages/rrb/Donate.tsx` | `routers/rrb/stripePayments.ts` | Yes |
| Proof Vault | `pages/rrb/ProofVault.tsx` | `routers/proofVault.ts` | Yes |
| Royalty Tracker | `pages/rrb/RoyaltyTracker.tsx` | `routers/royaltyTracker.ts` | Yes |
| AI Collaboration Hub | `components/rrb/AICollaborationHub.tsx` | `routers/aiCompareRouter.ts` | Yes |
| QUMUS Brain | `server/qumus-complete-engine.ts` | Multiple routers | Core — keep |
| Auth/Users | `server/_core/` | Built-in | Core — keep |

### To Remove a Module

1. Delete the page file from `client/src/pages/`
2. Remove its route from `client/src/App.tsx`
3. Remove its router import and mount from `server/routers.ts`
4. Remove its navigation entry from `Navigation.tsx`
5. Optionally remove its database tables from `drizzle/schema.ts` and run `pnpm db:push`

### To Add a New Module

Follow the standard workflow:

1. Add tables to `drizzle/schema.ts` → run `pnpm db:push`
2. Create a service in `server/services/your-module.ts`
3. Create a router in `server/routers/your-module.ts`
4. Mount the router in `server/routers.ts`
5. Create the page in `client/src/pages/YourModule.tsx`
6. Add the route in `client/src/App.tsx`
7. Add navigation entry in `Navigation.tsx`
8. Write tests in `server/your-module.test.ts`

---

## Step 5 — QUMUS Brain Configuration

### 5a. Identity

Edit `server/_core/qumusIdentity.ts` to change the QUMUS personality:

```typescript
// Change the owner name and greeting
export const QUMUS_IDENTITY = {
  ownerName: "Your Name",
  platformName: "Your Platform",
  greeting: "Hello! I'm your autonomous assistant.",
  // ...
};
```

### 5b. Decision Policies

The 8 decision policies are defined in `server/qumus-complete-engine.ts`. Each policy has an autonomy level (75-98%) that determines how much QUMUS decides on its own vs. escalating to human review.

| Policy | Default Autonomy | Adjust For |
|--------|-----------------|------------|
| Content Scheduling | 85% | More/less human review of content |
| Emergency Broadcast | 95% | Critical alerts — keep high |
| Listener Engagement | 80% | Marketing automation level |
| Quality Assurance | 75% | Content moderation strictness |
| Resource Optimization | 90% | Infrastructure scaling |
| Compliance Enforcement | 95% | Regulatory requirements |
| Performance Tuning | 88% | System optimization |
| Failover Management | 98% | Auto-recovery — keep high |

### 5c. AI Bots

The 10 AI bots are defined in the QUMUS identity. You can rename, remove, or add bots:

```typescript
// In qumusIdentity.ts
bots: [
  { name: "Your Bot Name", role: "Your Bot Role", active: true },
  // Add or remove as needed
]
```

### 5d. AI Collaboration Hub Systems

Edit `client/src/components/rrb/AICollaborationHub.tsx` to change which external AI systems QUMUS can engage with. Add your own AI partners or remove ones that are not relevant.

---

## Step 6 — Database Customization

The schema is in `drizzle/schema.ts` (150 tables). You can:

1. **Add columns** to existing tables
2. **Add new tables** for your custom features
3. **Remove tables** for modules you have disabled

After any schema change:

```bash
pnpm db:push
```

If `db:push` hangs, use the manual approach:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

---

## Step 7 — Payment Setup

### Stripe Configuration

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Set these environment variables:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

3. Set up the webhook endpoint pointing to `https://your-domain.com/api/stripe/webhook`
4. Test with card number `4242 4242 4242 4242`

### Donation vs. Commerce

The platform supports both donation-only and full e-commerce modes. To switch:

- **Donation only**: Keep the `stripePayments.ts` router, remove `merchShop.ts`
- **Full commerce**: Keep both routers active
- **Subscription model**: Extend the Stripe router with subscription plans

---

## Step 8 — Content and Media

### Audio Content

All audio files are stored in S3. Upload via the Studio tools or programmatically:

```typescript
import { storagePut } from "./server/storage";

const { url } = await storagePut(
  `audio/${filename}`,
  audioBuffer,
  "audio/mpeg"
);
```

### Radio Channels

Edit the channel configuration in `server/services/radio-channels.ts` to rename, add, or remove channels. Default channels: Main, Gospel, Jazz, Blues, Talk, Youth, Healing.

### RSS Feeds

The platform generates iTunes-compatible RSS feeds automatically. Update the feed metadata in `server/rss-feeds.ts` with your podcast/radio information.

---

## Step 9 — Voice and Accessibility

### Voice Commands

Voice commands are powered by the Web Speech API (`client/src/lib/voiceService.ts`). They work on HTTPS only. Customize the command vocabulary by editing the voice service.

### ADA/WCAG Compliance

The accessibility panel (`client/src/components/AccessibilityPanel.tsx`) provides:

| Feature | Description |
|---------|-------------|
| High Contrast | Enhanced color contrast mode |
| Font Size | Adjustable 12-24px |
| Color Blind Modes | Deuteranopia, protanopia, tritanopia |
| Text Spacing | Adjustable letter and word spacing |
| Focus Indicators | Enhanced keyboard focus rings |
| Reduce Motion | Disables animations |
| Screen Reader | ARIA live announcements |
| Live Captions | Real-time caption display |

The panel appears as a gear icon in the bottom-right corner of every page. Settings persist in localStorage.

---

## Step 10 — Deploy to Production

### Option A: Manus Hosting (Recommended)

If you are building on Manus, simply click the **Publish** button in the Management UI. Your site will be deployed to `your-app.manus.space` with SSL, CDN, and auto-scaling included.

### Option B: Self-Hosted (VPS / Mac Mini / Cloud)

Follow the full production deployment guide in `INSTALL.md`. Summary:

```bash
# Build for production
pnpm build

# Start with PM2
pm2 start ecosystem.config.cjs

# Set up Nginx reverse proxy (see INSTALL.md for full config)
sudo nano /etc/nginx/sites-available/your-domain

# Enable SSL with Let's Encrypt
sudo certbot --nginx -d your-domain.com

# Enable PM2 auto-start on reboot
pm2 startup
pm2 save
```

### Option C: Docker (Advanced)

Create a `Dockerfile`:

```dockerfile
FROM node:22-slim
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

---

## Architecture Reference

```
your-ecosystem/
├── client/                     # Frontend (React 19 + Tailwind 4)
│   ├── src/
│   │   ├── pages/              # 184 page components
│   │   ├── components/         # 280+ reusable components
│   │   │   ├── ui/             # shadcn/ui primitives
│   │   │   └── rrb/            # Platform-specific components
│   │   ├── contexts/           # Auth, Audio, Theme contexts
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # tRPC client, voice service, utilities
│   │   └── App.tsx             # Routes & layout
│   └── index.html              # Entry point
├── server/                     # Backend (Express 4 + tRPC 11)
│   ├── routers/                # 170 tRPC routers
│   ├── services/               # 74 service classes
│   ├── _core/                  # Framework plumbing (do not edit)
│   ├── qumus-complete-engine.ts # QUMUS decision engine v11.0
│   └── routers.ts              # Main router assembly
├── drizzle/
│   └── schema.ts               # 150 database tables
├── ecosystem.config.cjs        # PM2 configuration
├── INSTALL.md                  # Production deployment guide
├── CUSTOMIZE.md                # This file
└── README.md                   # Platform documentation
```

---

## FAQ

**Q: Can I use this without QUMUS?**
Yes. QUMUS is the autonomous brain but the platform works without it. Simply remove the QUMUS routers and services, and manage content manually through the admin dashboards.

**Q: Can I add my own AI model instead of the built-in LLM?**
Yes. Edit `server/_core/llm.ts` to point to your own OpenAI-compatible API endpoint. The `invokeLLM` helper accepts standard chat completion parameters.

**Q: How do I add a new radio channel?**
Add the channel definition in the radio service, create a schedule entry, and it will appear in the 7-channel player automatically.

**Q: Can I run this on a Raspberry Pi?**
The platform is resource-intensive (150 tables, 170 routers). A Raspberry Pi 4 with 8GB RAM can run it in development mode, but production deployment is recommended on a machine with at least 4GB RAM and 2 CPU cores.

**Q: How do I update after forking?**
Pull the latest changes from the upstream repository and merge. Database migrations are handled by Drizzle — run `pnpm db:push` after updating the schema.

---

**Original Platform by Canryn Production and its subsidiaries**
Supporting the Sweet Miracles Foundation — a 501(c)(3) / 508(c) nonprofit.
"A Voice for the Voiceless."
