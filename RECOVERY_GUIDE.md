# Canryn Production — Disaster Recovery Guide

**Version:** 2.0.0  
**Date:** March 12, 2026

---

## Recovery Sources (Priority Order)

1. **This Zip Archive** — Complete offline backup of all code, docs, and services
2. **GitHub Repository** — https://github.com/tyannabattle-tbz/rockin-rockin-boogie-backup
3. **Manus Platform** — https://manuweb.sbs (live site with checkpoint history)
4. **Database Backups** — Automated daily backups via QUMUS

---

## Quick Recovery from Zip

```bash
# 1. Extract the archive
unzip canryn-production-complete.zip -d ~/canryn-production
cd ~/canryn-production

# 2. Install dependencies
pnpm install
cd services && npm install && cd ..

# 3. Configure environment
cp .env.example .env
nano .env  # Fill in your credentials

# 4. Push database schema
pnpm db:push

# 5. Start everything
cd services && node start-all.mjs &
cd ~/canryn-production && pnpm dev
```

---

## Recovery from GitHub

```bash
git clone https://github.com/tyannabattle-tbz/rockin-rockin-boogie-backup.git
cd rockin-rockin-boogie-backup
pnpm install
pnpm dev
```

---

## Database Recovery

```bash
# Export current database
mysqldump -u user -p database > backup-$(date +%Y%m%d).sql

# Import from backup
mysql -u user -p database < backup.sql

# Rebuild schema from code
pnpm db:push
```

---

## Service Port Recovery

If a port is stuck or occupied:

```bash
# Find and kill process on port
lsof -i :3001 | grep LISTEN
kill -9 <PID>

# Restart individual service
node services/qumus-3001/server.mjs
```

---

## Key Files to Preserve

| File | Purpose |
|------|---------|
| `.env` | All environment variables and secrets |
| `drizzle/schema.ts` | Database schema definition |
| `server/routers.ts` | All backend API procedures |
| `services/` | Multi-port service architecture |
| `todo.md` | Feature tracking and history |

---

*© 2025-2026 Canryn Production and its subsidiaries. All rights reserved.*
