# Clone / Duplicate / Backup Guide

**Canryn Production and its subsidiaries**
**Rockin' Rockin' Boogie Ecosystem — v11.6 FINAL**

---

## Method 1: GitHub Export (Recommended)

From the Manus Management UI:
1. Open **Settings** → **GitHub**
2. Select the GitHub owner account
3. Enter repository name (e.g., `rrb-qumus-ecosystem`)
4. Click **Export** — creates a full Git repository with all history

To clone the exported repo:
```bash
git clone https://github.com/<owner>/rrb-qumus-ecosystem.git
cd rrb-qumus-ecosystem
pnpm install
```

## Method 2: Download ZIP from Manus

1. Open the **Code** panel in Management UI
2. Click **Download All Files** (top-right)
3. Extract the ZIP to your desired location
4. Run `pnpm install` to restore dependencies

## Method 3: Manual Backup from Sandbox

```bash
# Create a full backup archive
cd /home/ubuntu
tar -czf rrb-ecosystem-backup-$(date +%Y%m%d).tar.gz \
  --exclude='node_modules' \
  --exclude='.manus-logs' \
  manus-agent-web/

# Or ZIP format
cd /home/ubuntu/manus-agent-web
zip -r ../rrb-backup.zip . -x "node_modules/*" ".manus-logs/*"
```

## Restoring from Backup

```bash
# Extract backup
tar -xzf rrb-ecosystem-backup-YYYYMMDD.tar.gz
cd manus-agent-web

# Install dependencies
pnpm install

# Push database schema to new database
# (Update DATABASE_URL in .env first)
pnpm db:push

# Start server
pnpm dev
```

## Database Backup

The database is MySQL/TiDB. Connection details are in **Settings** → **Database** in the Management UI.

```bash
# Export database
mysqldump -h <host> -P <port> -u <user> -p<password> --ssl <database> > rrb-db-backup.sql

# Import to new database
mysql -h <new-host> -P <port> -u <user> -p<password> --ssl <new-database> < rrb-db-backup.sql
```

## Duplicate to New Manus Project

1. Export code to GitHub (Method 1)
2. Create a new Manus project
3. Import from the GitHub repository
4. Configure environment variables in Settings → Secrets
5. Run `pnpm db:push` to initialize the database
6. Publish

## Critical Files to Preserve

| File/Directory | Purpose |
|----------------|---------|
| `drizzle/schema.ts` | Database schema (source of truth) |
| `server/services/` | All 14 QUMUS policy services |
| `server/routers/` | All tRPC API routers |
| `server/qumus-complete-engine.ts` | QUMUS brain with 14 CORE_POLICIES |
| `client/src/pages/rrb/` | All RRB ecosystem pages |
| `docs/` | Complete documentation suite |
| `.env` | Environment variables (DO NOT commit) |

## Recovery from Manus Checkpoints

If the project becomes corrupted:
1. Open Management UI → **Dashboard**
2. Find the desired checkpoint
3. Click **Rollback** to restore to that state
4. Current checkpoint: `b02f63ce` (v11.6 FINAL)

---

*Canryn Production and its subsidiaries. All rights reserved. 2024–2026.*
