# RRB Team Quick-Start Guide

Welcome to the Rockin' Rockin' Boogie development team! This guide will get you up and running in 30 minutes.

---

## What You Need to Know (5 min)

### The Architecture

**One Backend, Two Frontends:**

```
Backend (Shared)
├── Database (MySQL)
├── API (tRPC)
├── Authentication
├── Payment Processing (Stripe)
└── File Storage (S3)
        ↓
    ┌───┴───┐
    ↓       ↓
 QUMUS    RRB
 Site    Site
```

**Key Point:** You're working on the RRB frontend, but the backend is shared with the QUMUS team. This means:
- ✅ No duplicate work
- ✅ Shared features work for both sites
- ⚠️ Coordinate changes to shared code

### Your Responsibilities

**You Own These Files:**
```
/client/src/pages/RRBLegacySite.tsx       ← RRB home page
/client/src/pages/RRBRadio.tsx            ← Radio streaming
/client/src/pages/SolbonesGame.tsx         ← Dice game
/client/src/pages/DonationPage.tsx         ← Stripe donations
/client/src/components/RRBHeader.tsx       ← RRB navigation
/client/src/components/RadioPlayer.tsx     ← Music player
/client/src/components/ChannelSelector.tsx ← Channel picker
```

**You Share These Files:**
```
/server/routers.ts                    ← API procedures (coordinate!)
/drizzle/schema.ts                    ← Database schema (coordinate!)
/client/src/App.tsx                   ← Main routing (coordinate!)
/client/src/lib/trpc.ts               ← tRPC client (coordinate!)
```

---

## Setup (10 min)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd manus-agent-web
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Development Server

```bash
pnpm dev
```

You should see:
```
Dev server running at http://localhost:3000
```

### 4. Access the RRB Site

Open browser and visit:
- **Local:** http://localhost:3000
- **Dev:** https://rockinrockinboogie.com (if published)

You should see the RRB home page with:
- Gold vinyl record logo
- "Rockin' Rockin' Boogie" title
- "A Legacy Restored" subtitle
- Radio, Donations, and Games sections

---

## Your First Task (15 min)

### Task: Add a New Radio Channel

**Objective:** Add a new channel to the RRB Radio page

**Steps:**

1. **Open the radio component:**
   ```bash
   code /client/src/pages/RRBRadio.tsx
   ```

2. **Find the channels array:**
   ```typescript
   const channels = [
     { id: 1, name: "432Hz Healing", url: "..." },
     { id: 2, name: "Classical", url: "..." },
     // Add your channel here
   ];
   ```

3. **Add a new channel:**
   ```typescript
   { 
     id: 3, 
     name: "Jazz Classics", 
     url: "https://stream.example.com/jazz",
     description: "Smooth jazz for relaxation"
   }
   ```

4. **Save the file** (Ctrl+S or Cmd+S)

5. **Check the browser** — Your new channel should appear!

6. **Test it** — Click the channel to verify it plays

7. **Commit your change:**
   ```bash
   git add client/src/pages/RRBRadio.tsx
   git commit -m "[RRB] Add Jazz Classics radio channel"
   git push origin feature/rrb-jazz-channel
   ```

---

## Common Commands

### Development

```bash
# Start dev server
pnpm dev

# Run tests
pnpm test

# Run specific test
pnpm test -- RRBRadio.test.ts

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Database

```bash
# Push schema changes
pnpm db:push

# Open database UI
pnpm db:studio

# Rollback migration
pnpm db:rollback
```

### Git

```bash
# Create feature branch
git checkout -b feature/rrb-new-feature

# View changes
git status

# Stage changes
git add .

# Commit changes
git commit -m "[RRB] Description of changes"

# Push to remote
git push origin feature/rrb-new-feature

# Create pull request
# (Do this on GitHub)
```

---

## File Structure Reference

```
manus-agent-web/
├── client/                          ← Frontend code
│   ├── src/
│   │   ├── pages/
│   │   │   ├── RRBLegacySite.tsx    ← RRB home (YOUR FILE)
│   │   │   ├── RRBRadio.tsx         ← Radio page (YOUR FILE)
│   │   │   ├── SolbonesGame.tsx     ← Game page (YOUR FILE)
│   │   │   ├── DonationPage.tsx     ← Donations (YOUR FILE)
│   │   │   ├── Home.tsx             ← QUMUS home (QUMUS team)
│   │   │   └── Dashboard.tsx        ← QUMUS dashboard (QUMUS team)
│   │   ├── components/
│   │   │   ├── RRBHeader.tsx        ← RRB nav (YOUR FILE)
│   │   │   ├── RadioPlayer.tsx      ← Player (YOUR FILE)
│   │   │   ├── AppHeaderEnhanced.tsx ← QUMUS nav (QUMUS team)
│   │   │   └── ...
│   │   ├── App.tsx                  ← Main routing (SHARED)
│   │   └── index.css                ← Global styles (SHARED)
│   └── public/                      ← Static assets
├── server/                          ← Backend code
│   ├── routers.ts                   ← API endpoints (SHARED)
│   ├── db.ts                        ← Database queries (SHARED)
│   ├── _core/                       ← Framework (DON'T EDIT)
│   └── *.test.ts                    ← Tests
├── drizzle/                         ← Database
│   ├── schema.ts                    ← Schema (SHARED)
│   └── migrations/                  ← Migrations (SHARED)
├── COLLABORATION_GUIDE.md           ← Team coordination guide
├── SLACK_SETUP.md                   ← Slack channels guide
└── package.json                     ← Dependencies
```

---

## API Integration (Already Configured!)

The following APIs are already set up and ready to use:

### Spotify Music Streaming
```
Client ID: bea00fa1cb3a44c09866bbcb6eeeb881
Status: ✅ Active
Used by: RRB Radio for music streaming
```

### YouTube Podcasts
```
API Key: AIzaSyAch1P1tvRnNB7vk-X8xUa31Jq0mADWL-c
Status: ✅ Active
Used by: RRB Radio for podcast integration
```

### Stripe Payments
```
Status: ✅ Active
Used by: Sweet Miracles donation system
```

**You don't need to configure these — they're already working!**

---

## Testing Your Changes

### Run Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test -- RRBRadio.test.ts

# Run tests in watch mode (re-run on file changes)
pnpm test -- --watch

# Run tests with coverage report
pnpm test -- --coverage
```

### Manual Testing

1. **Start dev server:** `pnpm dev`
2. **Open browser:** http://localhost:3000
3. **Test your feature:**
   - Click buttons
   - Fill forms
   - Check console for errors (F12)
   - Verify data saves

### Check for Errors

**Browser Console (F12):**
- Look for red error messages
- Check Network tab for failed requests
- Look for warnings in Console tab

**Server Console:**
- Watch for errors in terminal where you ran `pnpm dev`
- Look for database errors
- Check API response errors

---

## Git Workflow

### Creating a Feature Branch

```bash
# Create and switch to new branch
git checkout -b feature/rrb-my-feature

# Make your changes
# Edit files, test, etc.

# Stage changes
git add .

# Commit with clear message
git commit -m "[RRB] Add feature description"

# Push to remote
git push origin feature/rrb-my-feature
```

### Commit Message Format

```
[RRB] Brief description of change

Optional longer description explaining:
- What changed
- Why it changed
- How to test it
```

### Creating a Pull Request

1. Push your branch to GitHub
2. Go to repository on GitHub
3. Click "Create Pull Request"
4. Fill in title and description
5. Request review from team lead
6. Address feedback
7. Merge when approved

---

## Troubleshooting

### Issue: Dev server won't start

**Solution:**
```bash
# Kill any existing processes
pkill -f "pnpm dev"

# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Try again
pnpm dev
```

### Issue: Changes not showing in browser

**Solution:**
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Check browser console for errors (F12)
3. Check server console for errors
4. Restart dev server (Ctrl+C, then `pnpm dev`)

### Issue: Database error

**Solution:**
```bash
# Check database connection
pnpm db:studio

# Push schema changes
pnpm db:push

# If migration fails, rollback
pnpm db:rollback
```

### Issue: Git merge conflict

**Solution:**
1. Open conflicted file
2. Look for `<<<<<<<`, `=======`, `>>>>>>>`
3. Decide which version to keep
4. Remove conflict markers
5. Stage and commit

---

## Communication

### Slack Channels

- **#rrb-dev** — RRB team discussions
- **#shared-backend** — Shared code coordination
- **#deployments** — Deployment notifications
- **#code-review** — Code review requests

### Daily Standup

Post in #rrb-dev each morning:

```
✅ Yesterday: [what you completed]
🔄 Today: [what you're working on]
🚧 Blockers: [any issues]
```

### Before Modifying Shared Code

Always announce in #shared-backend:

```
⚠️ Planning to modify /server/routers.ts
Change: [description]
Timeline: [when]
Impact: [what might be affected]
```

---

## Resources

### Documentation
- **COLLABORATION_GUIDE.md** — Full team collaboration guide
- **SLACK_SETUP.md** — Slack channel setup
- **README.md** — Project overview

### External Resources
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC Documentation](https://trpc.io)
- [Git Documentation](https://git-scm.com/doc)

### Team Resources
- **Tech Lead:** [contact info]
- **QUMUS Team:** [contact info]
- **Project Manager:** [contact info]

---

## Next Steps

1. ✅ **Complete this guide** (you're here!)
2. ✅ **Set up your development environment** (clone, install, run)
3. ✅ **Make your first commit** (add a radio channel)
4. ✅ **Join Slack channels** (#rrb-dev, #shared-backend)
5. ✅ **Post your first standup** in #rrb-dev
6. ✅ **Review COLLABORATION_GUIDE.md** for detailed info
7. ✅ **Ask questions** — No question is too small!

---

## Quick Reference

| Task | Command |
|------|---------|
| Start dev server | `pnpm dev` |
| Run tests | `pnpm test` |
| Create feature branch | `git checkout -b feature/rrb-name` |
| Commit changes | `git commit -m "[RRB] description"` |
| Push changes | `git push origin feature/rrb-name` |
| Update database | `pnpm db:push` |
| View database | `pnpm db:studio` |
| Build for production | `pnpm build` |
| Preview production | `pnpm preview` |

---

## Welcome! 🎉

You're now ready to start developing for RRB! If you have any questions, don't hesitate to reach out to the team.

**Happy coding!**

---

**Last Updated:** March 3, 2026
**Version:** 1.0
**For:** RRB Development Team
