# Rockin' Rockin' Boogie — Deployment Guide

**Canryn Production | QUMUS Autonomous Orchestration Engine**

---

## Quick Start

```bash
# 1. Extract the ZIP
unzip rrb-platform.zip
cd manus-agent-web

# 2. Run setup
chmod +x setup.sh
./setup.sh

# 3. Start the server
pnpm dev
```

The platform will be available at `http://localhost:3000`.

---

## Requirements

| Requirement | Version | Notes |
|------------|---------|-------|
| Node.js | 18+ | LTS recommended |
| pnpm | 8+ | Installed automatically by setup.sh |
| MySQL/TiDB | 8+ | Required for database features |

---

## Environment Variables

Copy the `.env.example` or let `setup.sh` create one. Key variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | MySQL connection string |
| `JWT_SECRET` | Yes | Random string for session signing |
| `STRIPE_SECRET_KEY` | For payments | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | For payments | Stripe webhook signing secret |
| `VITE_STRIPE_PUBLISHABLE_KEY` | For payments | Stripe publishable key |

---

## Platform Architecture

```
┌─────────────────────────────────────────────────┐
│                 QUMUS Brain (90%)                │
│         Autonomous Orchestration Engine          │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ RRB Radio│  │ Podcasts │  │ Emergency│      │
│  │ CH-001   │  │ CH-002   │  │ CH-004   │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │Audiobooks│  │ Music    │  │Community │      │
│  │ CH-003   │  │ CH-005   │  │ CH-006   │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │Drop 432Hz│  │ Studio   │  │Solbones  │      │
│  │ CH-007   │  │ Suite    │  │ Game     │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Merch   │  │HybridCast│  │Sweet     │      │
│  │  Shop    │  │Emergency │  │Miracles  │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                  │
├─────────────────────────────────────────────────┤
│           Human Override (10%)                   │
└─────────────────────────────────────────────────┘
```

---

## 7 Channels — 62 Schedule Slots — 24/7 Coverage

| Channel | ID | Slots | Content |
|---------|-----|-------|---------|
| RRB Main Radio | CH-001 | 10 | Soul, funk, R&B, legacy music |
| Podcast Network | CH-002 | 9 | Original podcasts, interviews |
| Audiobook Stream | CH-003 | 5 | Sleep stories, narrated books |
| Emergency Broadcast | CH-004 | 4 | HybridCast 24/7 standby |
| Music Discovery | CH-005 | 7 | New artists, deep cuts |
| Community Voice | CH-006 | 8 | Listener stories, open mic |
| Drop Radio 432Hz | CH-007 | 8 | Solfeggio healing frequencies |

Plus 11 commercial break slots across channels.

---

## Key Features

**Legacy Restored (The Legacy)**
- Proof Vault with verified documentation
- Family history and archival records
- Legal documentation and timeline

**Legacy Continued (Music & Radio)**
- 7-channel autonomous radio broadcasting
- Podcast network with iTunes integration
- Healing music frequencies (432Hz, 528Hz, full Solfeggio)
- Meditation hub with guided sessions

**Studio Suite**
- Video production and processing
- Motion graphics generation
- Mobile studio for on-the-go creation
- Film production planning

**Solbones Game**
- 3 game modes: Standard (63), Advanced "In the 9", Spiral Up/Down (36)
- 3 play modes: Solo, vs QUMUS AI, Local 2-Player
- 7 dice skins + custom image upload
- Solfeggio frequency integration
- Leaderboard and score tracking

**Merchandise Shop**
- Stripe-powered checkout
- Product catalog with categories
- Order tracking

**HybridCast Emergency Broadcast**
- Offline-first PWA
- Emergency alert system
- 24/7 standby monitoring

**Sweet Miracles — A Voice for the Voiceless**
- Nonprofit integration
- Community support features

---

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm db:push      # Run database migrations
pnpm test         # Run test suite
```

---

## Stripe Testing

Use test card: `4242 4242 4242 4242` with any future expiry and any CVC.

---

## File Structure

```
client/               Frontend (React 19 + Tailwind 4)
  src/
    pages/            All page components
    components/       Reusable UI components
    hooks/            Custom React hooks
    contexts/         React contexts
    lib/              Utilities and tRPC client
  public/             Static assets
  index.html          Entry point

server/               Backend (Express + tRPC)
  routers.ts          Main tRPC router
  routers/            Feature routers
  services/           Business logic services
  webhooks/           Webhook handlers
  _core/              Framework internals

drizzle/              Database schema and migrations
shared/               Shared types and constants
```

---

## Credits

**Rockin' Rockin' Boogie** — Written by Seabrun "Candy" Hunter Jr. & Little Richard, 1972 Boogie Revival

**Canryn Production** — Platform development and QUMUS orchestration

**QUMUS** — Autonomous orchestration engine powering 90% of platform decisions

---

*A legacy restored — unified ecosystem of platforms, services, and autonomous intelligence.*
