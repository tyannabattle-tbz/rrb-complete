# QUMUS & RRB Collaboration Guide

## Overview

QUMUS and Rockin' Rockin' Boogie (RRB) share a **unified backend architecture** while maintaining separate frontends. This document explains how both teams can work together efficiently without conflicts.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Shared Backend                           │
│  (/home/ubuntu/manus-agent-web)                            │
│                                                             │
│  • Express.js Server                                        │
│  • tRPC Procedures (API routes)                            │
│  • Drizzle ORM Database                                    │
│  • Authentication & Authorization                          │
│  • Payment Processing (Stripe)                             │
│  • QUMUS Orchestration Engine                              │
│  • S3 File Storage                                         │
│  • Environment Variables & Secrets                         │
└─────────────────────────────────────────────────────────────┘
         ↓                                    ↓
    ┌─────────────┐                    ┌──────────────┐
    │   QUMUS     │                    │     RRB      │
    │  Frontend   │                    │   Frontend   │
    │             │                    │              │
    │ qumus.      │                    │ rockinrockin │
    │ manus.space │                    │ boogie.com   │
    │             │                    │              │
    │ • Dashboard │                    │ • Radio      │
    │ • Chat      │                    │ • Donations  │
    │ • Broadcast │                    │ • Music      │
    │ • Policies  │                    │ • Games      │
    └─────────────┘                    └──────────────┘
```

### Key Principle

**Same backend, different frontends.** Both sites use the same:
- Database tables and schemas
- API endpoints (tRPC procedures)
- Authentication system
- Payment processing
- File storage
- API credentials (Spotify, YouTube, Stripe)

---

## Project Structure & Responsibilities

### Backend (Shared by Both Teams)

```
/server
├── routers.ts                    ← All tRPC procedures (SHARED)
├── db.ts                         ← Database queries (SHARED)
├── auth.logout.test.ts           ← Authentication tests (SHARED)
├── api-credentials.test.ts       ← API validation tests (SHARED)
├── _core/                        ← Framework internals (DO NOT EDIT)
│   ├── context.ts
│   ├── llm.ts
│   ├── notification.ts
│   └── ...
└── [feature-specific services]   ← May be QUMUS or RRB specific

/drizzle
├── schema.ts                     ← Database schema (SHARED)
└── migrations/                   ← Database migrations (SHARED)
```

### Frontend - QUMUS

```
/client/src
├── pages/
│   ├── Home.tsx                  ← QUMUS home (conditional routing)
│   ├── Dashboard.tsx             ← QUMUS dashboard
│   ├── Chat.tsx                  ← QUMUS chat interface
│   ├── BroadcastManager.tsx       ← QUMUS broadcast control
│   └── ...
├── components/
│   ├── AppHeaderEnhanced.tsx      ← QUMUS header with blue lightning
│   ├── QumusChatInterface.tsx     ← QUMUS-specific chat
│   ├── ComprehensiveDashboard.tsx ← QUMUS dashboard
│   └── ...
└── App.tsx                       ← Conditional routing (SHARED)
```

### Frontend - RRB

```
/client/src
├── pages/
│   ├── RRBLegacySite.tsx         ← RRB home (conditional routing)
│   ├── RRBRadio.tsx              ← RRB radio streaming
│   ├── SolbonesGame.tsx           ← Solbones dice game
│   ├── DonationPage.tsx           ← Sweet Miracles donations
│   └── ...
├── components/
│   ├── RRBHeader.tsx             ← RRB header with gold vinyl
│   ├── RadioPlayer.tsx           ← Music streaming player
│   ├── ChannelSelector.tsx        ← Channel management
│   └── ...
└── App.tsx                       ← Conditional routing (SHARED)
```

---

## How Conditional Routing Works

**File:** `/client/src/App.tsx`

```typescript
// Conditional routing based on hostname
const isRRBDomain = hostname.includes('rockinrockinboogie.com') || 
                    hostname.includes('rrb');

// Home page selection
const HomePage = isRRBDomain ? RRBLegacySite : Home;

// Navigation and branding follow the same pattern
const HeaderComponent = isRRBDomain ? RRBHeader : AppHeaderEnhanced;
```

**Result:**
- Visit `qumus.manus.space` → See QUMUS interface
- Visit `rockinrockinboogie.com` → See RRB interface
- Same backend, different frontends

---

## Team Responsibilities

### QUMUS Team Owns

- ✅ Dashboard and analytics
- ✅ Chat interface and messaging
- ✅ Autonomous orchestration policies
- ✅ AI decision-making logic
- ✅ Broadcast management (QUMUS-specific)
- ✅ Real-time monitoring
- ✅ `/client/src/pages/Home.tsx` (QUMUS version)
- ✅ `/client/src/components/AppHeaderEnhanced.tsx`
- ✅ `/client/src/components/QumusChatInterface.tsx`
- ✅ `/client/src/components/ComprehensiveDashboard.tsx`

**Files to edit:**
```
/client/src/pages/Home.tsx (QUMUS version)
/client/src/pages/Dashboard.tsx
/client/src/pages/Chat.tsx
/client/src/pages/BroadcastManager.tsx
/client/src/components/AppHeaderEnhanced.tsx
/client/src/components/QumusChatInterface.tsx
/client/src/components/ComprehensiveDashboard.tsx
/client/src/components/MobileHeader.tsx (QUMUS styling)
```

### RRB Team Owns

- ✅ Radio streaming and channels
- ✅ Music library and playlists
- ✅ Solbones dice game
- ✅ Sweet Miracles donations
- ✅ Legacy content and pages
- ✅ Community features
- ✅ `/client/src/pages/RRBLegacySite.tsx`
- ✅ `/client/src/pages/RRBRadio.tsx`
- ✅ `/client/src/pages/SolbonesGame.tsx`
- ✅ `/client/src/pages/DonationPage.tsx`

**Files to edit:**
```
/client/src/pages/RRBLegacySite.tsx
/client/src/pages/RRBRadio.tsx
/client/src/pages/SolbonesGame.tsx
/client/src/pages/DonationPage.tsx
/client/src/components/RRBHeader.tsx
/client/src/components/RadioPlayer.tsx
/client/src/components/ChannelSelector.tsx
/client/src/components/MobileHeader.tsx (RRB styling)
```

### Both Teams Share (Coordinate Changes)

- 🔄 `/server/routers.ts` — tRPC procedures
- 🔄 `/drizzle/schema.ts` — Database schema
- 🔄 `/client/src/App.tsx` — Main routing and conditional logic
- 🔄 `/client/src/lib/trpc.ts` — tRPC client configuration
- 🔄 Authentication and authorization logic
- 🔄 Payment processing (Stripe)
- 🔄 API credentials (Spotify, YouTube)
- 🔄 Environment variables and secrets

---

## API Credentials (Shared)

All API credentials are stored in **Settings → Secrets** in the Manus Management UI:

| Credential | Current Value | Used By |
|-----------|---------------|---------|
| `SPOTIFY_CLIENT_ID` | `bea00fa1cb3a44c09866bbcb6eeeb881` | RRB Music Streaming |
| `SPOTIFY_CLIENT_SECRET` | `426e3b833bb343c9af3eeee938a10cba` | RRB Music Streaming |
| `YOUTUBE_API_KEY` | `AIzaSyAch1P1tvRnNB7vk-X8xUa31Jq0mADWL-c` | RRB Podcasts |
| `STRIPE_SECRET_KEY` | `sk_live_prod_key` | Sweet Miracles Donations |
| `STRIPE_WEBHOOK_SECRET` | `whsec_prod_secret` | Stripe Webhooks |

**Important:** Do NOT commit these to git. They're automatically injected from the Manus platform.

---

## Database Schema (Shared)

Both teams use the same database tables. Key tables:

```typescript
// Users & Authentication
users {
  id, email, role, createdAt, ...
}

// Payments & Donations
payments {
  id, userId, amount, stripePaymentIntentId, ...
}

donations {
  id, donorName, donorEmail, amount, broadcastHoursFunded, ...
}

// RRB-specific
rrb_channels {
  id, name, description, streamUrl, ...
}

rrb_playlists {
  id, channelId, spotifyPlaylistId, ...
}

// QUMUS-specific
qumus_policies {
  id, name, autonomyLevel, ...
}

qumus_decisions {
  id, policyId, decision, reasoning, ...
}
```

**When adding new tables:**
1. Edit `/drizzle/schema.ts`
2. Run `pnpm db:push` to migrate
3. Notify the other team of schema changes
4. Update this document

---

## Git Workflow for Collaboration

### Branch Naming Convention

```
feature/qumus-[feature-name]     ← QUMUS features
feature/rrb-[feature-name]       ← RRB features
feature/shared-[feature-name]    ← Shared backend features
bugfix/[issue-description]       ← Bug fixes
```

### Commit Message Convention

```
[QUMUS] Add new dashboard widget
[RRB] Implement radio channel selector
[SHARED] Add new tRPC procedure for analytics
[SHARED] Update database schema for user preferences
```

### Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** (only in your team's files)
3. **Write tests** for any new functionality
4. **Run `pnpm test`** to ensure all tests pass
5. **Create a Pull Request** with:
   - Clear description of changes
   - Tag: `[QUMUS]`, `[RRB]`, or `[SHARED]`
   - List any shared files modified
6. **Notify the other team** if you modified shared files
7. **Wait for approval** before merging

### Avoiding Conflicts

**Rule 1: Own Your Files**
- QUMUS team only edits QUMUS-specific files
- RRB team only edits RRB-specific files
- Both teams coordinate changes to shared files

**Rule 2: Coordinate Shared Changes**
- Before editing `/server/routers.ts`, notify the other team
- Before editing `/drizzle/schema.ts`, get approval
- Before editing `/client/src/App.tsx`, discuss changes

**Rule 3: Test Before Merging**
- Run `pnpm test` to ensure all tests pass
- Test on both `qumus.manus.space` and `rockinrockinboogie.com`
- Verify your changes don't break the other site

---

## Development Workflow

### Local Development

```bash
# 1. Clone the repository
git clone <repo-url>
cd manus-agent-web

# 2. Install dependencies
pnpm install

# 3. Start dev server
pnpm dev

# 4. Access both sites locally
# QUMUS: http://localhost:3000
# RRB: http://localhost:3000 (with rockinrockinboogie.com header)
```

### Testing Your Changes

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test -- server/routers.test.ts

# Run tests in watch mode
pnpm test -- --watch

# Run tests with coverage
pnpm test -- --coverage
```

### Database Migrations

```bash
# After editing /drizzle/schema.ts
pnpm db:push

# View migration status
pnpm db:studio

# Rollback to previous migration
pnpm db:rollback
```

### Building for Production

```bash
# Build the project
pnpm build

# Preview production build locally
pnpm preview
```

---

## Common Scenarios & Solutions

### Scenario 1: Adding a New RRB Feature

**Task:** Add a new radio channel selector

**Steps:**
1. Create `/client/src/components/ChannelSelector.tsx` (RRB team only)
2. Import and use in `/client/src/pages/RRBRadio.tsx`
3. If you need a new database table:
   - Edit `/drizzle/schema.ts` (notify QUMUS team)
   - Run `pnpm db:push`
4. If you need a new API endpoint:
   - Add procedure to `/server/routers.ts` (coordinate with QUMUS team)
   - Write tests in `/server/routers.test.ts`
5. Test on `rockinrockinboogie.com`
6. Create PR with `[RRB]` tag

### Scenario 2: Adding a New QUMUS Policy

**Task:** Add autonomous decision policy for broadcast scheduling

**Steps:**
1. Create new database table in `/drizzle/schema.ts` (notify RRB team)
2. Run `pnpm db:push`
3. Add query helper in `/server/db.ts`
4. Add tRPC procedure in `/server/routers.ts` (notify RRB team)
5. Create component in `/client/src/components/` (QUMUS-specific)
6. Use in `/client/src/pages/Dashboard.tsx`
7. Write tests
8. Test on `qumus.manus.space`
9. Create PR with `[QUMUS]` tag

### Scenario 3: Updating Shared Authentication Logic

**Task:** Add two-factor authentication

**Steps:**
1. **Discuss with both teams** before starting
2. Update `/drizzle/schema.ts` (affects both sites)
3. Update `/server/routers.ts` authentication procedures
4. Update `/client/src/lib/trpc.ts` if needed
5. Write comprehensive tests
6. Test on both `qumus.manus.space` and `rockinrockinboogie.com`
7. Create PR with `[SHARED]` tag
8. Get approval from both teams
9. Merge and coordinate deployment

### Scenario 4: Fixing a Bug in Shared Code

**Task:** Fix payment processing issue affecting both sites

**Steps:**
1. Create bugfix branch: `bugfix/payment-processing-issue`
2. Identify root cause in `/server/routers.ts` or `/server/db.ts`
3. Write test that reproduces the bug
4. Fix the bug
5. Verify test passes
6. Test on both sites
7. Create PR with clear description
8. Notify both teams
9. Merge after approval

---

## Communication Best Practices

### Daily Standup

**Recommended:** Brief daily sync between teams

**Topics:**
- What each team worked on yesterday
- What each team is working on today
- Any blockers or conflicts
- Shared file changes that need coordination

### Weekly Sync

**Recommended:** Full team meeting

**Topics:**
- Review merged PRs
- Plan upcoming features
- Discuss architecture changes
- Address technical debt

### Slack/Chat Channels

**Suggested setup:**
- `#qumus-dev` — QUMUS team discussions
- `#rrb-dev` — RRB team discussions
- `#shared-backend` — Shared code discussions
- `#deployments` — Deployment notifications

### Before Merging Shared Code

**Always notify the other team:**
- "I'm merging changes to `/server/routers.ts`"
- "I updated the database schema"
- "I changed authentication logic"

**Wait for acknowledgment** before merging to avoid conflicts.

---

## Troubleshooting

### Issue: My changes broke the other site

**Solution:**
1. Identify which shared file you changed
2. Review the change in `/server/routers.ts`, `/drizzle/schema.ts`, or `/client/src/App.tsx`
3. Check if the other site is using that code path
4. Revert the change or fix it to work for both sites
5. Test on both sites before re-merging

### Issue: Database migration failed

**Solution:**
1. Check the error message: `pnpm db:studio`
2. Verify your schema changes in `/drizzle/schema.ts`
3. Ensure all required fields have defaults or are nullable
4. Rollback and fix: `pnpm db:rollback`
5. Re-run: `pnpm db:push`

### Issue: tRPC procedure not working

**Solution:**
1. Check that procedure is exported in `/server/routers.ts`
2. Verify the procedure is called correctly in frontend
3. Check browser console for errors
4. Check server logs: `pnpm dev`
5. Write a test to isolate the issue

### Issue: Merge conflict in shared file

**Solution:**
1. Contact the other team immediately
2. Review both changes
3. Merge manually, ensuring both features work
4. Test on both sites
5. Have both teams approve before merging

---

## Deployment

### Staging Deployment

```bash
# Create a checkpoint
# This saves the current state and prepares for deployment

pnpm build
pnpm preview  # Test production build locally
```

### Production Deployment

1. **Create a checkpoint** in Manus Management UI
2. **Both teams test** the checkpoint
3. **Click "Publish"** button in Management UI
4. **Monitor both sites** for errors

### Rollback

If something breaks in production:

1. Go to Manus Management UI → Dashboard
2. Find the previous checkpoint
3. Click "Rollback"
4. Verify both sites are working

---

## Resources

- **Manus Documentation:** https://docs.manus.im
- **tRPC Documentation:** https://trpc.io
- **Drizzle ORM:** https://orm.drizzle.team
- **React Documentation:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com

---

## Questions?

If you have questions about this collaboration guide, please:

1. Check the relevant section above
2. Ask your team lead
3. Contact the other team for shared code questions
4. Review the git history for similar changes

**Last Updated:** March 3, 2026
**Maintained By:** Manus Platform Team
