# Rockin' Rockin' Boogie — QUMUS Autonomous Ecosystem

**A Canryn Production and its subsidiaries**
**Version:** 3.1.0 | **Status:** Production | **Autonomy:** 90%+ | **Live:** [rockinrockinboogie.manus.space](https://rockinrockinboogie.manus.space)

---

## Executive Summary

Rockin' Rockin' Boogie (RRB) is an autonomous entertainment, broadcast, and legacy preservation platform honoring the life and music of **Seabrun "Candy" Hunter Jr.** Built and managed by **Canryn Production**, the platform operates under the governance of the **QUMUS autonomous orchestration engine** — a unified decision-making brain that controls all subsystems with 90% autonomy and 10% human override. The ecosystem encompasses radio broadcasting, emergency communications, a sacred mathematics dice game, podcast networking, healing frequency meditation, studio production tools, merchandise commerce, nonprofit fundraising through **Sweet Miracles** ("A Voice for the Voiceless"), and a comprehensive archival Proof Vault documenting the Hunter family legacy.

The platform is designed for **generational wealth creation** through Canryn Production and Sweet Miracles grant and donation funding, structured for **perpetual operation** and **legacy restored and continued**. It provides the community with access to essential tools during crises, enabling them to produce their own media, broadcast as they choose, and access information and communication. All operational features are built with the **impaired community in mind**, ensuring accessibility and usability for all.

---

## Architecture Overview

```
QUMUS Brain (90% autonomous, 10% human override)
│
├── Decision Engine v11.0 (8 policies, 75-98% autonomy per policy)
│   ├── Content Scheduling (85%)      → 7-channel radio, podcasts, 24/7 airwaves
│   ├── Emergency Broadcast (95%)     → HybridCast mesh network, offline-first
│   ├── Listener Engagement (80%)     → Analytics optimization, recommendations
│   ├── Quality Assurance (75%)       → Content validation, compliance checks
│   ├── Resource Optimization (90%)   → Infrastructure scaling, load balancing
│   ├── Compliance Enforcement (95%)  → Cross-platform regulatory rules
│   ├── Performance Tuning (88%)      → Broadcast node optimization
│   └── Failover Management (98%)     → Auto-recovery, redundancy activation
│
├── Propagation Service               → All-or-nothing cross-platform execution
│   ├── Content Manager Adapter
│   ├── Emergency Alerts Adapter
│   ├── Analytics Adapter
│   ├── Radio Stations Adapter
│   └── HybridCast Nodes Adapter
│
├── AI Agent Network                   → Autonomous brain collaboration
│   ├── Agent Discovery & Registry
│   ├── Encrypted P2P Messaging (AES-256-GCM)
│   ├── Trust Scoring & Heartbeat Monitoring
│   └── Capability Delegation & Consensus
│
├── Advanced Intelligence Layer         → v11.0 upgrades
│   ├── Cross-Policy Correlation (4 rules)
│   ├── Anomaly Detection (EMA baselines)
│   ├── Adaptive Scheduling (30s-5min)
│   ├── Learning Feedback Loop
│   └── Self-Assessment (A-F grades)
│
├── AI Collaboration Hub               → External AI engagement
│   ├── 12 Open-Source AI Systems
│   ├── Compare Responses (live LLM)
│   └── Protocol-Agnostic Messaging
│
└── Cross-Platform Communication       → Unified messaging protocol
    ├── HybridCast (emergency, mesh, offline)
    ├── RRB Radio (streaming, podcasts, scheduling)
    ├── Canryn Production (studio, video, film)
    └── Sweet Miracles (donations, grants, outreach)
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19, Tailwind CSS 4, shadcn/ui | Responsive PWA with dark amber/purple/gold theme |
| Backend | Express 4, tRPC 11, Superjson | Type-safe API with end-to-end type inference |
| Database | Drizzle ORM, MySQL/TiDB | 150 tables, schema-first migrations |
| Storage | S3 (via storagePut/storageGet) | Media files, uploads, static assets |
| Auth | Manus OAuth, JWT sessions | Protected procedures, role-based access |
| Payments | Stripe (checkout, webhooks, subscriptions) | Merchandise, donations, premium features |
| Audio | Web Audio API (iOS-compatible) | Solfeggio frequency tones, healing sounds |
| Testing | Vitest | 100+ test files across server routers and services |
| Deployment | Manus hosting, PWA service worker | Auto-deploy on checkpoint, offline support |

---

## Platform Scale

| Metric | Count |
|--------|-------|
| Database Tables | 150 |
| tRPC Routers | 170 |
| Server Services | 74 |
| React Components | 280+ |
| Pages | 184 |
| Test Files | 100+ |
| QUMUS Decision Policies | 8 |
| QUMUS Engine Version | v11.0 |
| AI Collaboration Systems | 12 |
| Radio Channels | 7 |
| Solbones Game Modes | 3 |
| Solfeggio Frequencies | 9 |

---

## Platform Modules

### RRB Radio Network (7 Channels)

A 24/7 radio broadcasting system with seven themed channels (Main, Gospel, Jazz, Blues, Talk, Youth, Healing). QUMUS autonomously schedules content across 62 time slots per day, optimizing for listener engagement patterns and time-of-day preferences. The content scheduler populates airwaves with radio, video, podcasts, and commercials continuously.

### HybridCast Emergency Broadcast

An offline-first Progressive Web App for emergency communications featuring mesh networking (LoRa/Meshtastic), MGRS mapping, multi-operator collaboration, and incident reporting. Designed for disaster response with resilient offline capabilities. QUMUS manages emergency broadcast decisions at 95% autonomy with automatic failover.

### Solbones 4+3+2 Dice Game

A sacred mathematics dice game based on Solfeggio frequencies, available in three modes. **Solbones 4+3+2** is the full frequency edition with AI opponents (Easy/Medium/Hard), custom dice skins with image upload, tournament brackets, and all 9 Solfeggio frequency tones. **Solbones Classic** is a simplified 3-dice version with frequency labels and sound toggle. **Solbones Online** enables multiplayer gameplay via WebSocket connections. All modes use the Web Audio API with iOS Safari compatibility, including `navigator.audioSession.type = 'playback'` to bypass the iOS mute switch and global touchstart unlock for AudioContext activation.

### Podcast Network

iTunes-compatible podcast hosting with episode management, RSS feed generation, analytics tracking, and QUMUS-driven content recommendations.

### Meditation Hub

Guided meditation sessions with binaural beats, Solfeggio healing frequencies (174Hz through 963Hz), and ambient soundscapes. The full 9-frequency Solfeggio scale is available for tap-to-play exploration.

### Studio Suite

Five production tools for content creation: audio editor, video editor, podcast producer, broadcast mixer, and content publisher. Integrated with S3 storage for media management.

### Merchandise Shop

E-commerce storefront with Stripe checkout integration, product catalog management, order tracking, and promotional code support. Connected to Sweet Miracles for nonprofit merchandise campaigns.

### Sweet Miracles Nonprofit

"A Voice for the Voiceless" — donation management system with Stripe payment processing, grant discovery, donor profiles, campaign tracking, and community outreach tools. Designed to create generational wealth through grant and donation funding.

### Proof Vault

Archival documentation system preserving the Hunter family legacy with verified sources, legal disclaimers, copyright compliance, and structured evidence presentation. All content credited as "A Canryn Production and its subsidiaries."

### Royalty Tracker

Collaborating artists can monitor their earnings, splits, and payment history from projects they work on together. Features include project CRUD, collaborator management with split percentages, automatic payment distribution based on splits, earnings dashboards with per-project breakdowns, and source type tracking (streaming, download, sync license, performance, mechanical, merchandise).

### QUMUS Intelligence Dashboard

Dedicated full-page view showing cross-policy correlation alerts, anomaly detection reports, self-assessment scores with A-F health grades, policy chain activity, adaptive scheduling state, and learning feedback entries. The QUMUS engine (v11.0) features cross-policy correlation (4 rules), anomaly detection with exponential moving average baselines, adaptive loop scheduling (30s-5min), learning feedback loop, and 3 policy chains (fraud detection, content-compliance, growth activation).

### AI Collaboration Hub

Compact widget enabling QUMUS to engage with 12 open-source AI autonomous systems (AutoGPT, LangChain, CrewAI, MetaGPT, AutoGen, BabyAGI, SuperAGI, OpenDevin, and more) for experience, growth, knowledge, collaboration, and mentorship — without requiring direct integration. Includes a Compare Responses tab powered by live LLM that generates side-by-side AI reasoning comparisons.

### QUMUS Admin Dashboards

Comprehensive administrative interfaces including the QUMUS Admin Dashboard (decision monitoring, policy management, autonomy controls), Human Review Dashboard (pending decisions requiring approval), Agent Network Dashboard (peer connections, trust scores, message logs), and Analytics Dashboard (listener metrics, engagement trends, content performance).

---

## AI Agent Networking

The QUMUS ecosystem implements a decentralized AI agent networking layer enabling autonomous brains to discover, authenticate, and collaborate across platforms. Each platform operates its own QUMUS agent instance, and the networking layer ensures they function as a unified autonomous system.

### Agent Discovery and Registry

Each QUMUS agent registers with a unique identity containing capabilities, autonomy level, endpoint, and RSA-2048 public key. The `AgentNetworkService` maintains a peer registry with continuous heartbeat monitoring. Discovery filters allow agents to find peers by capability, autonomy level, or exclusion criteria. Trust scores (0-100) are computed from uptime, message success rate, and historical reliability.

### Encrypted Peer-to-Peer Messaging

All inter-agent communication uses AES-256-GCM encryption with per-session keys negotiated via RSA handshake. The `SeamlessAgentConnectionService` manages secure channels with four message types: request (expects response), response (reply), notification (fire-and-forget), and broadcast (one-to-many). Priority levels range from low to critical, with critical messages bypassing the queue for immediate execution.

### Cross-Platform Communication Protocol

The `CrossPlatformCommunicationService` provides a unified messaging protocol across all Canryn Production platforms. Each platform has a dedicated adapter with health monitoring, message queuing, and automatic retry with exponential backoff. Message routing flows through the QUMUS decision engine, which evaluates routing policies and applies compliance checks before delivery.

### Autonomous Collaboration Patterns

The system supports four collaboration patterns. **Consensus Decision-Making** requires majority agreement (>50%) from connected agents for multi-platform decisions, with critical decisions requiring unanimous consent from agents with autonomy >= 90%. **Capability Delegation** allows agents to delegate tasks to peers with specialized capabilities. **Shared Memory** provides a distributed memory store with scoped access (global, platform, or agent-specific) and automatic TTL expiration. **Federated Learning** enables agents to share anonymized performance metrics to improve collective decision-making across the ecosystem.

---

## QUMUS Decision Flow

Every action in the ecosystem follows a standardized decision pipeline:

1. **Event Detection** — A trigger occurs (content upload, emergency alert, listener spike, schedule gap)
2. **Policy Matching** — QUMUS identifies which of the 8 decision policies applies
3. **Autonomy Check** — If the policy's autonomy level exceeds the confidence threshold, execute autonomously; otherwise, queue for human review
4. **Execution** — The decision is executed through the appropriate platform adapter
5. **Propagation** — Results propagate to all affected platforms using all-or-nothing semantics with automatic rollback on failure
6. **Audit Logging** — Every decision, its context, alternatives considered, and outcome are logged for complete traceability

Human operators can override any decision at any time via the QumusAdminDashboard or QumusHumanReviewDashboard. Critical decisions (severity >= HIGH) with confidence below 80% automatically require human approval before execution.

---

## File Structure

```
client/
  src/
    pages/
      rrb/              → Public-facing RRB pages (Home, Legacy, Music, ProofVault)
      Solbones.tsx       → Solbones 4+3+2 Frequency Edition
      SolbonesClassic.tsx → Solbones Classic (3-dice)
      SolbonesOnline.tsx → Solbones Online Multiplayer
      RadioStation.tsx   → 7-channel radio player
      MeditationHub.tsx  → Healing frequency sessions
      Studio*.tsx        → 5 studio production tools
      Admin*.tsx         → QUMUS admin dashboards
    components/          → 280+ reusable UI components
    contexts/            → React contexts (auth, theme, audio)
    hooks/               → Custom hooks
    lib/trpc.ts          → tRPC client binding
    App.tsx              → Routes & layout (184 pages)
    index.css            → OKLCH theme variables
server/
  routers/               → 170 tRPC procedure files
  services/              → 74 service classes
    agentNetworkService.ts           → Agent discovery & P2P
    crossPlatformCommunicationService.ts → Unified messaging
    seamlessAgentConnectionService.ts → Encrypted channels
    qumusOrchestrationService.ts     → Decision engine
  db.ts                  → Query helpers
  routers.ts             → Root router aggregation
  storage.ts             → S3 helpers
drizzle/
  schema.ts              → 150 database tables
shared/                  → Shared types & constants
```

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | MySQL/TiDB connection string |
| `JWT_SECRET` | Session cookie signing |
| `VITE_APP_TITLE` | Site title and PWA name |
| `VITE_APP_LOGO` | Logo URL |
| `STRIPE_SECRET_KEY` | Stripe payment processing |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe frontend key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification |
| `BUILT_IN_FORGE_API_URL` | Manus built-in APIs (LLM, storage) |
| `BUILT_IN_FORGE_API_KEY` | Server-side API authentication |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Push notification keys |

---

## Installation and Deployment

The platform is deployed and hosted on Manus infrastructure at [rockinrockinboogie.manus.space](https://rockinrockinboogie.manus.space). For local development or self-hosted deployment, see the `INSTALL.md` file included in the distribution ZIP.

### Quick Start (Development)

```bash
# Clone the repository
git clone <repo-url> && cd manus-agent-web

# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env  # Edit with your values

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

### Production Deployment

Follow the structured deployment protocol: automated setup phases, configuration of live infrastructure endpoints, and continuous monitoring of autonomous decisions and operational logs.

---

## Credits

**Rockin' Rockin' Boogie** — Honoring the legacy of Seabrun "Candy" Hunter Jr.
**Canryn Production** — Platform development and management
**Sweet Miracles** — "A Voice for the Voiceless" — Nonprofit arm
**QUMUS** — Autonomous orchestration engine
**Built with Manus AI** — Autonomous development platform

---

*A Canryn Production and its subsidiaries. All rights reserved.*
