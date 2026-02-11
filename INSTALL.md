# RRB QUMUS Ecosystem — Installation & Execution Guide

**Canryn Production and its subsidiaries**

## Prerequisites

Before installing, ensure you have the following on your system:

| Requirement | Minimum Version | Check Command |
|-------------|----------------|---------------|
| Node.js | 22.x | `node --version` |
| pnpm | 9.x | `pnpm --version` |
| MySQL/TiDB | 8.0+ | `mysql --version` |

If you need to install Node.js and pnpm:

```bash
# Install Node.js 22 (macOS with Homebrew)
brew install node@22

# Install Node.js 22 (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm globally
npm install -g pnpm
```

## Quick Start (5 Minutes)

```bash
# 1. Extract the project
unzip rrb-qumus-ecosystem-v3.0.0.zip -d rrb-ecosystem
cd rrb-ecosystem

# 2. Install dependencies
pnpm install

# 3. Configure environment (see Environment Variables section below)
cp .env.example .env
# Edit .env with your values

# 4. Push database schema
pnpm db:push

# 5. Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Environment Variables

Create a `.env` file in the project root with these required variables:

```env
# Database (Required)
DATABASE_URL=mysql://user:password@host:port/database?ssl={"rejectUnauthorized":true}

# Authentication (Required)
JWT_SECRET=your-secret-key-at-least-32-characters
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://id.manus.im

# Owner Info
OWNER_OPEN_ID=your-open-id
OWNER_NAME=Ty Bat Zan

# Stripe Payments (Required for donations)
STRIPE_SECRET_KEY=sk_live_or_sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_or_pk_test_...

# S3 Storage (Required for file uploads)
# Configured via BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY

# AI/LLM Services
BUILT_IN_FORGE_API_URL=https://your-forge-api-url
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_URL=https://your-frontend-forge-url
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-key

# Push Notifications (Optional)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key

# LiveCallIn External Platforms (Optional — set your actual room URLs)
VITE_SKYPE_URL=https://join.skype.com/your-room
VITE_ZOOM_URL=https://zoom.us/j/your-meeting-id
VITE_MEET_URL=https://meet.google.com/your-room-code
VITE_DISCORD_URL=https://discord.gg/your-invite
```

## Commands Reference

### Development

```bash
# Start development server with hot reload
pnpm dev

# Start only the backend server
pnpm dev:server

# Start only the frontend (Vite)
pnpm dev:client
```

### Database

```bash
# Push schema changes to database (generates + migrates)
pnpm db:push

# Generate migration files only
npx drizzle-kit generate

# Run pending migrations
npx drizzle-kit migrate

# Open Drizzle Studio (database GUI)
npx drizzle-kit studio
```

### Testing

```bash
# Run all tests
pnpm test

# Run specific test file
npx vitest run server/media-flow.test.ts

# Run tests in watch mode
npx vitest

# Run tests with coverage
npx vitest run --coverage
```

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Or combine both
pnpm build && pnpm start
```

## Mac Mini Setup

When setting up on your Mac Mini as a local server:

```bash
# 1. Clone or extract the project
cd ~/Projects
unzip rrb-qumus-ecosystem-v3.0.0.zip -d rrb-ecosystem
cd rrb-ecosystem

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env
nano .env  # Edit with your values

# 4. Push database schema
pnpm db:push

# 5. Build and start production server
pnpm build
pnpm start

# 6. (Optional) Run as background service with PM2
npm install -g pm2
pm2 start "pnpm start" --name rrb-ecosystem
pm2 save
pm2 startup  # Auto-start on boot
```

### Cross-Device Access

Once running on your Mac Mini, access from any device on the same network:

```
http://your-mac-mini-ip:3000
```

All data syncs automatically across devices through the shared database and S3 storage. Login on your iPhone, iPad, laptop, or any browser — same account, same data, same state.

## Project Structure

```
rrb-ecosystem/
├── client/                 # Frontend (React 19 + Tailwind 4)
│   ├── src/
│   │   ├── pages/          # 181 page components
│   │   ├── components/     # 276 reusable components
│   │   ├── contexts/       # React contexts (Auth, Audio, Theme)
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # tRPC client, utilities
│   └── index.html          # Entry point with RSS auto-discovery
├── server/                 # Backend (Express + tRPC)
│   ├── routers/            # 167 tRPC routers
│   ├── routerChunks/       # Router chunks (TypeScript optimization)
│   ├── services/           # 73 service classes
│   ├── webhooks/           # Stripe webhook handler
│   ├── _core/              # Framework plumbing (do not edit)
│   ├── db.ts               # Database query helpers
│   ├── routers.ts          # Main router assembly
│   ├── storage.ts          # S3 helpers (storagePut/storageGet)
│   └── rss-feeds.ts        # RSS feed endpoints
├── drizzle/                # Database schema (145 tables)
│   └── schema.ts
├── shared/                 # Shared types and constants
└── package.json
```

## Troubleshooting

### Database connection fails
Ensure `DATABASE_URL` includes SSL parameters for TiDB: `?ssl={"rejectUnauthorized":true}`

### Stripe webhook returns 400
The webhook route must receive raw body (not JSON-parsed). Verify `/api/stripe/webhook` is registered with `express.raw()` BEFORE `express.json()` in `server/_core/index.ts`.

### Audio won't play on mobile
iOS Safari requires user interaction before audio playback. The platform includes automatic unlock via silent buffer playback on first touch. Ensure the user taps a play button (not auto-play).

### Files not persisting
All file uploads must go through S3 (`storagePut`). Local filesystem files are ephemeral and will be lost on restart. Check that your S3 credentials are configured.

---

**Produced by Canryn Production and its subsidiaries**
Supporting the Sweet Miracles Foundation — a 501(c)(3) / 508(c) nonprofit.
"A Voice for the Voiceless." All content is for historical preservation and educational purposes.
