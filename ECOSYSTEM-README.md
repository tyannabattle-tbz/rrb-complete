# QUMUS Ecosystem — Canryn Production & Subsidiaries

**Version:** 3.1.0 — Ecosystem Sync Build  
**Date:** March 15, 2026  
**Credited:** A Canryn Production and its subsidiaries

---

## Quick Start (Install & Execute)

```bash
# 1. Clone the repository
git clone <repo-url> manus-agent-web
cd manus-agent-web

# 2. Install dependencies
pnpm install

# 3. Configure environment
# Copy .env.example to .env and fill in DATABASE_URL, JWT_SECRET, etc.
# Or connect to the Manus platform for auto-injection.

# 4. Push database schema
pnpm db:push

# 5. Run ecosystem sync (validates all 18 subsystems)
pnpm sync:all

# 6. Start development server
pnpm dev

# 7. Run tests
pnpm test
```

---

## Ecosystem Architecture

QUMUS is the autonomous brain controlling the entire ecosystem with 90% autonomous operation and 10% human override.

### Subsystems (18 Total)

| # | Subsystem | Category | Status | Description |
|---|-----------|----------|--------|-------------|
| 1 | QUMUS Autonomous Brain | Core | Active | 248K+ decision logs, 20 active policies, 18/18 subsystems |
| 2 | RRB Radio (54 Channels) | Broadcast | Active | Real streams from SomaFM, 181.FM, BBC, Radio Paradise, etc. |
| 3 | Broadcast & Scheduling | Broadcast | Active | 24/7 content scheduling, commercial rotation |
| 4 | HybridCast Emergency Broadcast | Broadcast | Active | Emergency alerts, node management, delivery tracking |
| 5 | Conference Hub (6 Platforms) | Community | Active | Jitsi (embedded), Zoom, Meet, Discord, Skype, RRB Live |
| 6 | Podcast Network | Content | Active | Shows, episodes, audio content management |
| 7 | Listener Analytics | Analytics | Active | 8,800+ analytics records, real-time tracking |
| 8 | User Management & Auth | Security | Active | 32 users, OAuth, session management |
| 9 | Content Engine | Content | Active | 1,000+ content items, social posts, news |
| 10 | Sweet Miracles Foundation | Community | Active | Real Stripe donations, grant management |
| 11 | Production Studio | Production | Active | Jitsi-based live broadcast, guest panels, S3 recording |
| 12 | Meditation & Healing Frequencies | Community | Active | 8 guided sessions, Solfeggio frequencies |
| 13 | Solbones Dice Game | Community | Active | Sacred math game, leaderboard, frequency rolls |
| 14 | Family Legacy & Archives | Content | Active | Family tree, historical documents |
| 15 | DJ & Host Management | Production | Active | DJ profiles, ad inventory |
| 16 | Squadd Goals Team | Community | Active | Team members, meeting rooms |
| 17 | Messaging & Chat | Community | Active | Real-time chat, radio chat, memory store |
| 18 | Custom Station Builder | Production | Active | Station templates, custom stream creation |

### External API Integrations

| Service | Status | Purpose |
|---------|--------|---------|
| Spotify | Connected | Music discovery, playlist integration |
| YouTube | Connected | Video content, channel management |
| iTunes/Apple Podcasts | Connected | Podcast directory search |
| Twitter/X | Connected | Social media posting, engagement |
| Stripe | Connected | Payments, donations, subscriptions |
| Jitsi | Connected | Video conferencing, live broadcast |
| Zoom | Connected | Conference Hub meetings |
| Google Meet | Connected | Conference Hub meetings |

---

## Key Commands

```bash
pnpm dev           # Start development server
pnpm build         # Production build
pnpm test          # Run vitest test suite
pnpm db:push       # Push schema changes to database
pnpm sync:all      # Full ecosystem sync (validates all 18 subsystems)
```

---

## Sync System

### Dashboard
Navigate to `/ecosystem-sync` to view the real-time Sync Dashboard showing:
- All 18 subsystem health status
- Database table counts and data integrity
- Warning alerts for degraded or offline systems
- Individual subsystem sync buttons
- Team CLI command reference

### CLI Sync
Run `pnpm sync:all` from any environment to get a full console report:
```
✅ QUMUS Autonomous Brain              ONLINE     Health: 100%  Records: 536,251
✅ RRB Radio (54 Channels)             ONLINE     Health: 100%  Records: 87
...
═══════════════════════════════════════════════════════════════
  Overall Health:    100%
  Subsystems:        18 online | 0 degraded | 0 offline
```

---

## Tech Stack

- **Frontend:** React 19 + Tailwind 4 + shadcn/ui
- **Backend:** Express 4 + tRPC 11
- **Database:** MySQL/TiDB via Drizzle ORM
- **Storage:** S3 (recordings, uploads, projects)
- **Auth:** Manus OAuth + JWT sessions
- **AI:** LLM integration (chat, translation, content generation)
- **Streaming:** Jitsi WebRTC (live broadcast + conferencing)
- **Payments:** Stripe (donations, subscriptions)

---

## Key URLs

| Page | Path | Description |
|------|------|-------------|
| Home | `/` | Main landing page |
| QUMUS Control | `/qumus` | QUMUS autonomous brain dashboard |
| RRB Radio | `/rrb` | Rockin' Rockin' Boogie radio station |
| Ecosystem Sync | `/ecosystem-sync` | Sync dashboard for all 18 subsystems |
| Ecosystem Dashboard | `/ecosystem-dashboard` | Master ecosystem overview |
| Live Stream | `/live` | Live broadcast (Go Live with Jitsi) |
| Conference Hub | `/conference` | 6-platform conference system |
| Sweet Miracles | `/sweet-miracles` | Donation and grant management |
| HybridCast | `/hybridcast` | Emergency broadcast management |
| Studio | `/studio` | Recording studio with S3 save |
| Solbones | `/solbones` | Sacred math dice game |
| Meditation | `/meditation` | Healing frequency sessions |

---

## Team Onboarding

1. Clone the repo and run `pnpm install`
2. Set up environment variables (DATABASE_URL, JWT_SECRET, etc.)
3. Run `pnpm db:push` to initialize the database schema
4. Run `pnpm sync:all` to validate all subsystems are connected
5. Run `pnpm dev` to start the development server
6. Navigate to `/ecosystem-sync` to verify everything is green

---

## Next Steps / TODO

- Connect Restream for multi-platform live distribution
- Expand podcast library with more shows
- Add more meditation sessions and frequency content
- Build out merchandise shop integration
- Implement push notifications for mobile users
- Add more Solbones game modes and tournaments

---

*A Canryn Production and its subsidiaries. All rights reserved.*
*"A Voice for the Voiceless" — Sweet Miracles Foundation*
