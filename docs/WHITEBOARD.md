# Project Whiteboard — Architecture & System Map

**Canryn Production and its subsidiaries**
**Rockin' Rockin' Boogie Ecosystem — v11.6 FINAL**
**Logo designed by Seabrun Candy Hunter**

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    QUMUS AUTONOMOUS BRAIN                        │
│              14 Policies · 90% Autonomous · 10% Human           │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Recommend │ │ Payment  │ │ Content  │ │ User Reg │           │
│  │ Engine    │ │ Process  │ │ Moderate │ │ 95%      │           │
│  │ 92%      │ │ 85%      │ │ 88%      │ │          │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Subscript │ │ Perf     │ │ Analytics│ │ Complianc│           │
│  │ Mgmt 90% │ │ Alert 92%│ │ Agg 95%  │ │ Report75%│           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Code     │ │ Perf     │ │ Content  │ │ Royalty  │           │
│  │ Maint 90%│ │ Mon 92%  │ │ Archive  │ │ Audit 88%│           │
│  │          │ │          │ │ 90%      │ │ +MusicBrz│           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐                                      │
│  │ Community│ │ AI Contnt│  Human Review Queue                  │
│  │ Engage   │ │ Gen 87%  │  ← Override at /rrb/qumus/          │
│  │ 85%      │ │ +LLM     │     human-review                    │
│  └──────────┘ └──────────┘                                      │
└─────────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌──────────┐ ┌──────────────┐
│   Canryn    │ │   Sweet     │ │ Hybrid   │ │   Rockin'    │
│ Production  │ │  Miracles   │ │  Cast    │ │   Rockin'    │
│ & Subsid.   │ │ 501c/508    │ │ Emergency│ │   Boogie     │
└─────────────┘ └─────────────┘ └──────────┘ └──────────────┘
```

## Entity Hierarchy

```
Canryn Production (Parent)
├── Rockin' Rockin' Boogie (Music/Legacy Platform)
│   ├── 7-Channel Radio Broadcasting (24/7)
│   ├── Proof Vault (Evidence Preservation)
│   ├── Music Library & Streaming
│   └── Solbones 4+3+2 Dice Game
├── Sweet Miracles Foundation (501c/508 Nonprofit)
│   ├── Donation Processing (Stripe)
│   └── Community Outreach
├── HybridCast (Emergency Broadcast PWA)
│   ├── Mesh Networking (LoRa/Meshtastic)
│   └── Offline-First Architecture
└── QUMUS (Autonomous Brain)
    ├── 14 Decision Policies
    ├── Human Review Queue
    ├── Command Console
    └── Autonomous Loop (24/7)
```

## Tech Stack Map

```
FRONTEND                    BACKEND                     DATA
─────────                   ───────                     ────
React 19                    Express 4                   MySQL/TiDB
Tailwind 4                  tRPC 11                     Drizzle ORM
shadcn/ui                   Node.js 22                  S3 Storage
Wouter (routing)            Manus OAuth                 150 DB Tables
Lucide Icons                Stripe SDK
Sonner (toasts)             Built-in LLM (AI Content)
                            MusicBrainz API
```

## Data Flow

```
User Request → tRPC Client → Express Server → tRPC Router
                                                    │
                              ┌─────────────────────┤
                              ▼                     ▼
                         publicProcedure      protectedProcedure
                         (read-only)          (requires auth)
                              │                     │
                              ▼                     ▼
                         Service Layer ←── QUMUS Policy Engine
                              │                     │
                              ▼                     ▼
                         Drizzle ORM           Human Review
                              │                (if < threshold)
                              ▼
                         MySQL/TiDB + S3
```

## 7 Radio Channels

| # | Channel | Content Type |
|---|---------|-------------|
| 1 | RRB Main | Rockin' Rockin' Boogie originals |
| 2 | Legacy Gold | Classic tracks and collaborations |
| 3 | Community | Listener submissions and dedications |
| 4 | Healing Frequencies | Solfeggio meditation tones |
| 5 | Podcast Network | Interviews and storytelling |
| 6 | Emergency | HybridCast emergency broadcasts |
| 7 | Sweet Miracles | Foundation updates and outreach |

## Key URLs (Production)

| Page | Route | Purpose |
|------|-------|---------|
| Home | `/` | Landing page with audio player |
| Proof Vault | `/rrb/proof-vault` | Evidence preservation |
| Ecosystem Dashboard | `/rrb/ecosystem` | Full system overview |
| QUMUS Admin | `/rrb/qumus/admin` | Policy management |
| Human Review | `/rrb/qumus/human-review` | Approve/reject decisions |
| Command Console | `/rrb/qumus/command` | CLI-style commands |
| State of Studio | `/rrb/state-of-studio` | Health metrics |
| Royalty Audit | `/rrb/qumus/royalty-audit` | Payout monitoring |
| Content Archival | `/rrb/qumus/content-archival` | Link preservation |
| Community Engagement | `/rrb/qumus/community-engagement` | Listener tracking |
| AI Content | `/rrb/qumus/ai-content` | Auto-generated content |
| Code Maintenance | `/rrb/qumus/code-maintenance` | Code health |
| Performance Monitor | `/rrb/qumus/performance-monitoring` | System performance |
| Divisions | `/rrb/divisions` | Canryn subsidiaries |
| Sweet Miracles | `/rrb/sweet-miracles` | Donation platform |
| Solbones | `/rrb/solbones` | Dice game |

## Revenue Flow

```
BMI Registration ──────────────┐
SoundExchange Registration ────┤
DistroKid/TuneCore Distribution┤──→ Royalty Audit Dashboard
Spotify/Apple Music Streams ───┤    (CSV Import + MusicBrainz)
YouTube Content ID ────────────┤         │
Mechanical Royalties (MLC) ────┘         ▼
                                   Discrepancy Detection
                                         │
                                         ▼
                                   QUMUS Alert (88% auto)
                                         │
                                    ┌────┴────┐
                                    ▼         ▼
                               Auto-resolve  Human Review
```

---

*Canryn Production and its subsidiaries. All rights reserved. 2024–2026.*
*A Voice for the Voiceless — Sweet Miracles Foundation (501c/508)*
