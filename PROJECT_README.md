# QUMUS Ecosystem — Rockin' Rockin' Boogie Platform

## Complete Autonomous Entertainment Ecosystem by Canryn Production

**Version:** Final Delivery — March 2026
**Domains:** qumus.manus.space | manuweb.sbs | manusweb-eshiamkd.manus.space

---

## Overview

The QUMUS Ecosystem is a comprehensive autonomous entertainment platform built for Canryn Production. It integrates radio broadcasting, video conferencing, podcast discovery, music production, presentation building, emergency broadcast capabilities, and AI-powered orchestration into a single unified platform.

### The Trinity
- **QUMUS** — The autonomous brain. 14 active policies, 18 subsystems, 90% autonomous control with human override.
- **RRB Radio** — 54-channel 24/7 radio network with 3 AI DJs (Valanna, Seraph, Candy), live chat, and healing frequencies.
- **Valanna** — AI voice assistant with 3 personas, voice recognition, text-to-speech, file handling, and conference mode.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind CSS 4, shadcn/ui, Wouter routing |
| Backend | Express 4, tRPC 11, Drizzle ORM |
| Database | MySQL/TiDB (cloud-hosted) |
| Storage | S3 (file uploads, media assets) |
| Auth | Manus OAuth with JWT sessions |
| AI | LLM integration (invokeLLM), image generation, voice transcription |
| Payments | Stripe (checkout sessions, webhooks, promo codes) |
| Audio | Web Audio API, Tone.js concepts, global RadioContext |
| Maps | Google Maps (Manus proxy, no API key needed) |

---

## Feature Inventory (54+ Features)

### Broadcasting & Radio
- 54 radio channels with metadata (bitrate, codec, source, DJ, category)
- 3 AI DJ profiles (Valanna, Seraph, Candy) with personality configs
- 63 broadcast schedule entries (7 days x 9 time slots)
- Live chat with AI-generated messages
- Stream health monitoring with circuit breaker
- Critical outage escalation alerts
- Channel performance leaderboard (30-day uptime)
- Persistent audio across page navigation (RadioContext)
- Persistent mini-player bar when navigating away

### Video & Conferencing
- Video gallery with upload (S3 storage)
- Video conferencing with Daily.co integration
- Picture-in-Picture mode
- Screen sharing
- Real-time transcription
- Language interpretation (16 languages)
- Conference AI chat panel
- Persistent meeting container (survives navigation)

### Content Creation
- **Presentation Builder** — Slide editor with AI content generation, templates, media integration, presenter mode
- **Music Studio (DAW)** — Multi-track editor, effects (reverb, EQ, compression, delay), virtual instruments, recording, MIDI, export

### AI & Automation
- QUMUS Control Center with 14 autonomous policies
- Command Console for ecosystem management
- AI Chat with streaming responses
- Valanna Voice Assistant (3 personas)
- Image generation integration
- Voice transcription (Whisper API)
- Structured JSON responses from LLM

### Emergency & Safety
- HybridCast Emergency Broadcast PWA
- Offline-first architecture
- Push notifications (VAPID)
- Emergency alert system

### Commerce & Donations
- Stripe payment integration (test + live)
- Sweet Miracles nonprofit donation system
- Merchandise shop
- Promo code support

### Monitoring & Analytics
- System Status Page (22 subsystems)
- Ecosystem Master Dashboard
- Stream Health Dashboard
- QUMUS Decision Log
- Real-time health monitoring

### Social & Communication
- Live chat system
- Enhanced chat with streaming
- QUMUS Chat Command Center
- Voice chat
- Push notifications

---

## Routes (40+ Pages)

| Route | Page |
|-------|------|
| / | Home / Landing |
| /live | RRB Live (Video/Radio/Podcast/Conference tabs) |
| /rrb-radio | RRB Radio Integration (54 channels) |
| /conference | Video Conference Room |
| /gallery | Video Gallery |
| /presentation-builder | Presentation Builder |
| /music-studio | Music Studio DAW |
| /qumus | QUMUS Control Center |
| /ecosystem | Ecosystem Master Dashboard |
| /system-status | System Status Page |
| /stream-health | Stream Health Dashboard |
| /podcast | Podcast Discovery (iTunes) |
| /gps-radar | GPS/Radar Map |
| /chat | Enhanced Chat |
| /qumus-chat | QUMUS Chat Interface |
| /hybridcast | HybridCast Emergency Broadcast |
| /settings | User Settings |
| /profile | User Profile |
| /orders | Payment History |
| ... | 20+ more routes |

---

## Database Tables

- users, sessions
- radio_channels (54 channels with full metadata)
- broadcast_schedules (63 entries)
- dj_profiles (3 AI DJs)
- qumus_decisions (decision audit log)
- chat_messages, videos, podcasts
- system_config, notifications
- stripe_customers, payments
- And more...

---

## Environment Variables

All secrets are managed through the Manus platform Settings > Secrets panel. Key variables:

- `DATABASE_URL` — MySQL connection string
- `JWT_SECRET` — Session signing
- `STRIPE_SECRET_KEY` / `VITE_STRIPE_PUBLISHABLE_KEY` — Payments
- `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` — Push notifications
- `BUILT_IN_FORGE_API_KEY` — LLM/AI services
- `YOUTUBE_API_KEY` — YouTube integration
- `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` — Spotify
- `TWITTER_*` — Twitter/X integration

---

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Run tests
pnpm test

# Push database changes
pnpm db:push

# Type check
pnpm typecheck
```

---

## Recovery

If the project needs to be restored:
1. Go to the Manus Management UI > Dashboard
2. Find the latest checkpoint and click "Rollback"
3. Or use the GitHub repo (synced via `user_github` remote)

---

## Architecture Notes

- **RadioContext** wraps the entire app to persist audio across navigation
- **MeetingContext** wraps the app to persist video conferences across navigation
- **PersistentRadioPlayer** shows a mini-bar when radio is playing and user navigates away
- **PersistentMeetingContainer** maintains video call in PiP mode during navigation
- **MobileBottomNav** includes "Rejoin Meeting" quick-action when in a meeting
- All `scrollIntoView` calls use `block: 'nearest'` to prevent page-level scrolling
- Stream proxy at `/api/stream-proxy` handles HTTP-to-HTTPS for radio streams
- QUMUS health checks run every 60 seconds, stream health every 5 minutes

---

## Credits

Built for **Canryn Production** by the QUMUS autonomous ecosystem.
Rockin' Rockin' Boogie | HybridCast | Sweet Miracles | Valanna | Seraph | Candy

*All rights reserved. Registered through Payten Music in BMI.*
