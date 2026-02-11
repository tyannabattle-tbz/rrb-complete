# Rockin' Rockin' Boogie — System Architecture

**Canryn Production and its subsidiaries**
**Technical Architecture & Developer Reference**

---

## 1. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 19 |
| Styling | Tailwind CSS | 4 |
| UI Components | shadcn/ui | Latest |
| Routing | Wouter | Latest |
| API Layer | tRPC | 11 |
| Serialization | Superjson | Latest |
| Backend | Express | 4 |
| Database | MySQL / TiDB | — |
| ORM | Drizzle ORM | Latest |
| Authentication | Manus OAuth | — |
| Payments | Stripe | Latest |
| Storage | S3 | — |
| Build Tool | Vite | 7 |
| Testing | Vitest | 2.x |
| Runtime | Node.js | 22 |
| Package Manager | pnpm | Latest |

---

## 2. Project Structure

```
manus-agent-web/
├── client/                      # Frontend application
│   ├── public/                  # Static assets (CDN-cached)
│   ├── src/
│   │   ├── pages/               # 187 page components
│   │   │   ├── rrb/             # Main RRB ecosystem pages
│   │   │   └── Home.tsx         # Landing page
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   └── rrb/             # RRB-specific components
│   │   ├── contexts/            # React contexts
│   │   ├── hooks/               # Custom hooks
│   │   ├── lib/trpc.ts          # tRPC client binding
│   │   ├── App.tsx              # Routes (189 routes) & layout
│   │   ├── main.tsx             # Providers
│   │   └── index.css            # Global theme
│   └── index.html               # HTML entry
├── server/                      # Backend application
│   ├── _core/                   # Framework plumbing (DO NOT EDIT)
│   │   ├── context.ts           # tRPC context builder
│   │   ├── env.ts               # Environment variables
│   │   ├── llm.ts               # LLM integration helper
│   │   ├── notification.ts      # Owner notification helper
│   │   ├── imageGeneration.ts   # Image generation helper
│   │   └── voiceTranscription.ts # Voice transcription helper
│   ├── routers/                 # 175 tRPC router files
│   │   ├── rrb/                 # RRB-specific routers
│   │   ├── commandExecutionRouter.ts  # Command Console handler
│   │   ├── contentArchivalRouter.ts   # Policy #11
│   │   ├── royaltyAuditRouter.ts      # Policy #12
│   │   ├── communityEngagementRouter.ts # Policy #13
│   │   └── ...
│   ├── services/                # 78 service files
│   │   ├── qumus-complete-engine.ts   # QUMUS brain (13 policies)
│   │   ├── qumus-autonomous-loop.ts   # Autonomous event loop
│   │   ├── qumus-orchestration.ts     # Decision orchestration
│   │   ├── code-maintenance-policy.ts # Policy #9
│   │   ├── performance-monitoring-policy.ts # Policy #10
│   │   ├── content-archival-policy.ts # Policy #11
│   │   ├── royalty-audit-policy.ts    # Policy #12
│   │   ├── community-engagement-policy.ts # Policy #13
│   │   └── ...
│   ├── webhooks/                # Webhook handlers
│   │   └── stripeWebhook.ts    # Stripe webhook
│   ├── db.ts                    # Database query helpers
│   ├── routers.ts               # Main router merge point
│   ├── storage.ts               # S3 storage helpers
│   └── *.test.ts                # 101 test files
├── drizzle/                     # Database schema & migrations
│   └── schema.ts                # 150 tables
├── shared/                      # Shared constants & types
├── storage/                     # S3 helper utilities
├── docs/                        # Documentation
│   ├── USER_MANUAL.md
│   ├── ADMIN_CREATOR_GUIDE.md
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── QUMUS_OPERATIONS.md
│   ├── ROYALTY_COLLECTION_GUIDE.md
│   └── README_INSTALL.md
└── todo.md                      # Feature tracking
```

---

## 3. QUMUS Architecture

### 3.1 Core Engine

The QUMUS Complete Engine (`server/qumus-complete-engine.ts`) is a singleton that manages all 13 autonomous decision policies. It maintains:

- **Policy Registry** — All 13 policies with autonomy levels and descriptions
- **Metrics Cache** — In-memory metrics for fast reads, synced to DB periodically
- **Decision Pipeline** — Event → Confidence → Threshold → Execute/Escalate → Audit

### 3.2 Autonomous Event Loop

The autonomous loop (`server/services/qumus-autonomous-loop.ts`) generates real decisions at configurable intervals. It uses `EVENT_TEMPLATES` for each policy to simulate realistic operational scenarios:

```
policy_recommendation → Content recommendation events
policy_payment → Payment processing events
policy_moderation → Content moderation events
policy_registration → User registration events
policy_subscription → Subscription management events
policy_performance_alert → Performance alert events
policy_analytics → Analytics aggregation events
policy_compliance → Compliance reporting events
policy_code_maintenance → Code health scan events
policy_performance_monitoring → Performance benchmark events
policy_content_archival → Link monitoring events
policy_royalty_audit → Royalty verification events
policy_community_engagement → Community engagement events
```

### 3.3 Decision Orchestration

The orchestration layer (`server/qumus-orchestration.ts`) handles:

1. **Policy lookup** — Validates the policy exists
2. **Confidence calculation** — Determines decision confidence
3. **Autonomy threshold** — Compares confidence against policy autonomy level
4. **Execution** — Autonomous decisions are executed immediately
5. **Escalation** — Low-confidence decisions go to Human Review
6. **Notification** — Critical events trigger owner notifications

---

## 4. Data Architecture

### 4.1 Database

The platform uses MySQL/TiDB with Drizzle ORM. The schema contains 150 tables organized by domain:

**Core Tables:**
- `users` — User accounts with role (admin/user)
- `sessions` — Authentication sessions

**QUMUS Tables:**
- `qumus_decisions` — All autonomous decisions with audit trail
- `qumus_metrics` — Policy performance metrics
- `qumus_escalations` — Human review queue

**Content Tables:**
- `channels` — Radio broadcast channels
- `content_items` — Scheduled content
- `podcasts` — Podcast episodes
- `proof_items` — Proof Vault evidence

**Financial Tables:**
- `donations` — Stripe donation records (IDs only, not amounts)
- `stripe_customers` — Customer ID mapping

### 4.2 Storage

All file assets are stored in S3 using the `storagePut` / `storageGet` helpers. The database stores only metadata and S3 references (URLs and keys). No file bytes are stored in database columns.

### 4.3 Caching Strategy

- **In-memory** — QUMUS metrics cache, policy state, scheduler state
- **tRPC query cache** — Client-side caching with configurable refetch intervals
- **CDN** — Static assets in `client/public/` served with aggressive caching

---

## 5. API Architecture

### 5.1 tRPC Procedures

All API communication uses tRPC. Procedures are organized by domain:

| Router | Prefix | Auth | Purpose |
|--------|--------|------|---------|
| `auth` | `auth.*` | Public | Login, logout, session |
| `qumusComplete` | `qumusComplete.*` | Protected | QUMUS brain operations |
| `ecosystem` | `ecosystem.*` | Protected | Ecosystem overview |
| `codeMaintenance` | `codeMaintenance.*` | Protected | Policy #9 |
| `performanceMonitoring` | `performanceMonitoring.*` | Mixed | Policy #10 (queries public, mutations protected) |
| `contentArchival` | `contentArchival.*` | Mixed | Policy #11 (queries public, mutations protected) |
| `royaltyAudit` | `royaltyAudit.*` | Mixed | Policy #12 (queries public, mutations protected) |
| `communityEngagement` | `communityEngagement.*` | Mixed | Policy #13 (queries public, mutations protected) |
| `commandExecution` | `commandExecution.*` | Protected | Command Console |
| `stripePayments` | `stripePayments.*` | Protected | Payment processing |
| `rrbBroadcast` | `rrbBroadcast.*` | Public/Protected | Broadcasting |

### 5.2 Authentication Flow

1. User clicks Sign In → redirected to Manus OAuth portal
2. OAuth callback at `/api/oauth/callback` drops a session cookie
3. Each tRPC request builds context via `server/_core/context.ts`
4. `protectedProcedure` injects `ctx.user`; `publicProcedure` allows anonymous access
5. Admin procedures check `ctx.user.role === 'admin'`

### 5.3 Webhook Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/stripe/webhook` | Stripe payment events |

Webhooks use `express.raw()` for signature verification before `express.json()`.

---

## 6. Frontend Architecture

### 6.1 Routing

The application uses Wouter for client-side routing with 189 routes defined in `App.tsx`. Routes are organized hierarchically:

```
/                           → Home (landing page)
/rrb/*                      → Main RRB ecosystem
/rrb/qumus/*                → QUMUS admin pages
/rrb/broadcast/*            → Broadcasting pages
/rrb/studio/*               → Studio suite pages
/rrb/the-music              → Music catalog
/rrb/proof-vault            → Evidence repository
/rrb/sweet-miracles/*       → Foundation pages
```

### 6.2 Global Audio Player

A persistent audio player sits at the bottom of every page, supporting:

- 7-channel switching
- Play/pause/seek/volume controls
- Track metadata display
- Solfeggio frequency playback for meditation

### 6.3 Theme System

The platform uses a dark theme with amber/gold accent colors. Theme variables are defined in `client/src/index.css` using CSS custom properties. The ThemeProvider supports dark/light mode switching.

---

## 7. Testing

### 7.1 Test Suite

The project includes 101 test files using Vitest. Tests cover:

- Service logic (all 13 QUMUS policies)
- Router procedures
- Command Console parsing and execution
- Data integrity (default sources, proof items)
- Scheduler operations

### 7.2 Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
npx vitest run server/royalty-audit.test.ts

# Run tests matching a pattern
npx vitest run --grep "QUMUS"
```

---

## 8. Deployment

### 8.1 Environment Variables

All environment variables are managed through the platform's secret management system. Key variables:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | MySQL/TiDB connection string |
| `JWT_SECRET` | Session cookie signing |
| `VITE_APP_ID` | Manus OAuth application ID |
| `STRIPE_SECRET_KEY` | Stripe server-side key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `BUILT_IN_FORGE_API_KEY` | Manus built-in API access |

### 8.2 Database Migrations

```bash
# Push schema changes to database
pnpm db:push
```

This runs `drizzle-kit generate` and `drizzle-kit migrate` to apply schema changes.

### 8.3 Build & Deploy

The platform deploys through the Manus Management UI:

1. Save a checkpoint
2. Click Publish in the Management UI header
3. The build process compiles the frontend and bundles the server
4. The application is deployed to the production domain

---

## 9. Extending the Platform

### 9.1 Adding a New QUMUS Policy

To add a 14th (or beyond) QUMUS policy:

1. **Create the service** — `server/services/new-policy.ts` following the pattern in `royalty-audit-policy.ts`
2. **Create the router** — `server/routers/newPolicyRouter.ts` following `royaltyAuditRouter.ts`
3. **Register in main router** — Import and merge in `server/routers.ts`
4. **Register in QUMUS engine** — Add to `CORE_POLICIES` in `server/qumus-complete-engine.ts`
5. **Add event templates** — Add to `EVENT_TEMPLATES` in `server/services/qumus-autonomous-loop.ts`
6. **Create the dashboard** — `client/src/pages/rrb/NewPolicyDashboard.tsx`
7. **Add route** — Register in `client/src/App.tsx`
8. **Integrate** — Add to QUMUS Admin sidebar, Ecosystem Dashboard, State of Studio, Command Console
9. **Write tests** — `server/new-policy.test.ts`
10. **Update documentation** — Add to all relevant docs

### 9.2 Adding a New Page

1. Create the page component in `client/src/pages/rrb/NewPage.tsx`
2. Add the route in `client/src/App.tsx`
3. Add navigation links in the appropriate section
4. If it requires data, create a tRPC router and service

### 9.3 Adding a New Radio Channel

1. Add the channel configuration in the broadcast service
2. Update the channel count in the global audio player
3. Add scheduling entries in the content scheduler
4. Update the Broadcast Admin dashboard

---

## 10. Platform Statistics

| Metric | Count |
|--------|-------|
| Frontend Pages | 187 |
| Routes | 189 |
| tRPC Routers | 175 |
| Backend Services | 78 |
| Database Tables | 150 |
| Test Files | 101 |
| QUMUS Policies | 13 |
| Radio Channels | 7 |
| Solfeggio Frequencies | 10 |

---

*Copyright 2024–2026 Canryn Production and its subsidiaries. All rights reserved.*
*Built with React 19 + tRPC 11 + Drizzle ORM + QUMUS Autonomous Engine*
