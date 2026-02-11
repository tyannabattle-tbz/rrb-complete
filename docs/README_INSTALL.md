# Rockin' Rockin' Boogie — Install & Execute Guide

**Canryn Production and its subsidiaries**
**Quick Start, Installation, and Deployment Reference**

---

## Quick Start

### Prerequisites

- Node.js 22+ (LTS recommended)
- pnpm (package manager)
- MySQL or TiDB database
- S3-compatible storage

### Installation

```bash
# 1. Clone or extract the project
cd manus-agent-web

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
# Copy .env.example to .env and fill in required values
# See "Environment Variables" section below

# 4. Push database schema
pnpm db:push

# 5. Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | MySQL/TiDB connection string |
| `JWT_SECRET` | Yes | Session cookie signing secret |
| `VITE_APP_ID` | Yes | Manus OAuth application ID |
| `OAUTH_SERVER_URL` | Yes | Manus OAuth backend base URL |
| `VITE_OAUTH_PORTAL_URL` | Yes | Manus login portal URL |
| `OWNER_OPEN_ID` | Yes | Platform owner's Manus ID |
| `OWNER_NAME` | Yes | Platform owner's display name |
| `STRIPE_SECRET_KEY` | Yes | Stripe server-side secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe client-side publishable key |
| `BUILT_IN_FORGE_API_URL` | Yes | Manus built-in API URL |
| `BUILT_IN_FORGE_API_KEY` | Yes | Manus built-in API key |
| `VITE_FRONTEND_FORGE_API_URL` | Yes | Frontend API URL |
| `VITE_FRONTEND_FORGE_API_KEY` | Yes | Frontend API key |
| `VAPID_PUBLIC_KEY` | Optional | Push notification public key |
| `VAPID_PRIVATE_KEY` | Optional | Push notification private key |

---

## Project Structure Summary

```
manus-agent-web/
├── client/               # React 19 frontend (187 pages, 189 routes)
├── server/               # Express + tRPC backend (175 routers, 78 services)
├── drizzle/              # Database schema (150 tables)
├── shared/               # Shared types and constants
├── storage/              # S3 helper utilities
├── docs/                 # Documentation suite
│   ├── USER_MANUAL.md           # End-user guide
│   ├── ADMIN_CREATOR_GUIDE.md   # Admin & creator procedures
│   ├── SYSTEM_ARCHITECTURE.md   # Technical architecture
│   ├── QUMUS_OPERATIONS.md      # QUMUS operations procedures
│   ├── ROYALTY_COLLECTION_GUIDE.md # Royalty revenue stream setup
│   └── README_INSTALL.md        # This file
└── todo.md               # Feature tracking
```

---

## Key Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm test` | Run all tests |
| `pnpm db:push` | Push schema changes to database |

---

## Documentation Suite

| Document | Audience | Purpose |
|----------|----------|---------|
| **USER_MANUAL.md** | End users | How to navigate and use the platform |
| **ADMIN_CREATOR_GUIDE.md** | Admins, creators | System administration and content creation |
| **SYSTEM_ARCHITECTURE.md** | Developers | Technical architecture and extension guide |
| **QUMUS_OPERATIONS.md** | Operators | Daily/weekly/monthly operational procedures |
| **ROYALTY_COLLECTION_GUIDE.md** | Admins | How to set up royalty revenue streams from airwaves |
| **README_INSTALL.md** | Everyone | Installation and quick start |

---

## Platform Highlights

- **14 QUMUS Autonomous Policies** — 90% autonomous, 10% human oversight
- **7-Channel 24/7 Radio** — Live broadcasting with emergency override
- **Proof Vault** — Verified evidence repository with BMI screenshots
- **Royalty Audit** — Cross-platform payout discrepancy detection with MusicBrainz integration
- **Content Archival** — Wayback Machine preservation of evidence links
- **Community Engagement** — Listener tracking, donation patterns, campaign optimization
- **HybridCast** — Offline-first emergency broadcast with mesh networking
- **Solbones 4+3+2** — Sacred math dice game with AI opponents
- **Solfeggio Frequencies** — 10 healing frequency meditation sessions
- **Sweet Miracles Foundation** — Donation processing via Stripe
- **Accessibility-first** — Designed with the impaired community in mind

---

## Support

For studio services, advertising, and production packages, contact **Canryn Production** directly.

For platform technical issues, refer to the documentation suite or the QUMUS Command Console for diagnostics.

---

*Copyright 2024–2026 Canryn Production and its subsidiaries. All rights reserved.*
*A Voice for the Voiceless — Sweet Miracles Foundation*
