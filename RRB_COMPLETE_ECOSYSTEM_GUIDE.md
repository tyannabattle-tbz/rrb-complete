# RRB Complete Ecosystem - Mac mini Deployment Guide

**Version:** 1.0  
**Date:** February 28, 2026  
**Status:** Production Ready  
**Autonomy Level:** 90% Qumus + 10% Human Override

---

## 🎵 Overview

The **RRB Complete Ecosystem** is a fully autonomous, offline-first platform built on Qumus orchestration. It integrates:

- **Phase 1**: Qumus Autonomous Core (Task execution, policy decisions, LLM integration)
- **Phase 2**: RRB Radio Station (Channels, shows, listeners, 24/7 scheduling)
- **Phase 3**: Healing Frequencies (9 Solfeggio frequencies, binaural beats, sessions)
- **Phase 4**: Solbones Dice Game (Sacred math 4+3+2, AI players, frequency audio)
- **Phase 5**: HybridCast Emergency (Offline PWA, emergency broadcasts, mesh networking)
- **Phase 6**: Sweet Miracles Donations (Nonprofit giving, impact tracking)
- **Phase 7**: Merchandise Shop (Products, inventory, orders)
- **Phase 8**: Unified Integration (All systems orchestrated by Qumus)

**Zero Manus dependency. Complete offline operation. Mac mini ready.**

---

## 🚀 Quick Start (Mac mini)

### 1. One-Command Deployment

```bash
curl -fsSL https://your-repo-url/DEPLOY_MAC_MINI.sh | bash
```

Or manually:

```bash
cd ~/rrb-ecosystem
./DEPLOY_MAC_MINI.sh
```

### 2. Start the System

```bash
~/rrb-ecosystem/start-rrb.sh
```

Access at: **http://localhost:3000**

### 3. Verify All Systems

```bash
curl http://localhost:3000/api/trpc/rrb.ecosystem.getStatus
```

---

## 📋 System Architecture

### Database Layer (SQLite)
- **Location**: `~/rrb-ecosystem/data/rrb.db`
- **Type**: SQLite (offline-first)
- **Tables**: 50+ (radio, healing, games, donations, merchandise, etc.)
- **Backup**: Automatic daily snapshots

### LLM Layer (Ollama)
- **Model**: Mistral 7B (local, no API keys)
- **Port**: 11434
- **Usage**: Qumus policy decisions, scheduling, content generation
- **Fallback**: Cloud LLM support (optional)

### Storage Layer (Local)
- **Location**: `~/rrb-ecosystem/uploads`
- **Type**: Local filesystem
- **Fallback**: S3/MinIO support (optional)

### Application Layer (Node.js)
- **Framework**: Express 4 + tRPC 11 + React 19
- **Port**: 3000
- **Process**: Managed by systemd or launchd

### Orchestration Layer (Qumus)
- **Control**: 90% autonomous
- **Override**: 10% human
- **Policies**: 12+ decision policies
- **Monitoring**: Real-time dashboard

---

## 🔧 Configuration

### Environment Variables

**`.env.local` (created automatically)**

```env
# Offline-First Mode
OFFLINE_MODE=true
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=file:~/rrb-ecosystem/data/rrb.db

# Local LLM
OLLAMA_BASE_URL=http://localhost:11434
LLM_MODEL=mistral

# Storage
STORAGE_TYPE=local
STORAGE_PATH=~/rrb-ecosystem/uploads

# Qumus Control
QUMUS_AUTONOMOUS=true
QUMUS_CONTROL_LEVEL=90
```

### Optional: Cloud Integration

To enable cloud features (S3, Stripe, email):

```env
# AWS S3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1

# Stripe (for donations/merchandise)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

## 📡 System APIs

All systems accessible via tRPC at `http://localhost:3000/api/trpc`

### Radio Station
```javascript
// Get all channels
await trpc.rrb.radio.getChannels.query()

// Get channel stats
await trpc.rrb.radio.getChannelStats.query({ channelId: 1 })

// Generate 24/7 schedule
await trpc.rrb.radio.generateAutoSchedule.mutate({ channelId: 1, daysAhead: 7 })
```

### Healing Frequencies
```javascript
// Get all Solfeggio frequencies
await trpc.rrb.healing.getFrequencies.query()

// Get healing sessions
await trpc.rrb.healing.getSessions.query()

// Generate binaural beat
await trpc.rrb.healing.generateBinauralBeat.query({ frequency: 528, duration: 30 })
```

### Solbones Dice Game
```javascript
// Create game
await trpc.rrb.solbones.createGame.mutate({ 
  players: ["Alice", "Bob"], 
  aiCount: 2 
})

// Roll dice
await trpc.rrb.solbones.rollDice.mutate({ gameId: "game-123" })

// Get game state
await trpc.rrb.solbones.getGameState.query({ gameId: "game-123" })
```

### Emergency Broadcast
```javascript
// Create alert
await trpc.rrb.emergency.createAlert.mutate({
  title: "Weather Alert",
  message: "Severe storm warning",
  severity: "high",
  channels: [1, 2, 3]
})

// Get active alerts
await trpc.rrb.emergency.getActiveAlerts.query()
```

### Donations
```javascript
// Create donation
await trpc.rrb.donations.createDonation.mutate({
  amount: 50,
  donorEmail: "donor@example.com",
  message: "Supporting the community"
})

// Get impact metrics
await trpc.rrb.donations.getImpactMetrics.query()
```

### Merchandise
```javascript
// Get products
await trpc.rrb.shop.getProducts.query()

// Create order
await trpc.rrb.shop.createOrder.mutate({
  products: [{ productId: 1, quantity: 2 }]
})
```

### Ecosystem Status
```javascript
// Get system status
await trpc.rrb.ecosystem.getStatus.query()

// Get full report
await trpc.rrb.ecosystem.getFullReport.query()
```

---

## 🧠 Qumus Orchestration

### How Qumus Controls the System

1. **Task Submission**: Human submits task via dashboard
2. **Policy Evaluation**: Qumus evaluates against 12+ policies
3. **LLM Decision**: Ollama (local) makes autonomous decision
4. **Execution**: Task executes with 90% autonomy
5. **Logging**: All decisions logged for audit trail
6. **Human Override**: 10% override capability for critical operations

### Example: Auto-Schedule Generation

```
User: "Generate 7-day radio schedule"
  ↓
Qumus Policy Check: Safety, quality, diversity checks
  ↓
Ollama LLM: "Analyze available shows and create optimal schedule"
  ↓
Decision: APPROVE with priority 8
  ↓
Execution: 168 episodes scheduled across 7 channels
  ↓
Logging: Decision ID, reasoning, results saved
  ↓
Dashboard: Shows "Schedule generated: 168 episodes"
```

---

## 📊 Monitoring & Maintenance

### Check System Health

```bash
# Check all services
curl http://localhost:3000/api/trpc/rrb.ecosystem.getStatus

# Check database
sqlite3 ~/rrb-ecosystem/data/rrb.db ".tables"

# Check Ollama
curl http://localhost:11434/api/tags

# Check disk usage
du -sh ~/rrb-ecosystem
```

### View Logs

```bash
# Application logs
tail -f ~/rrb-ecosystem/logs/rrb.log

# Error logs
tail -f ~/rrb-ecosystem/logs/rrb-error.log

# Qumus decisions
grep "DECISION" ~/rrb-ecosystem/logs/rrb.log
```

### Backup Data

```bash
# Manual backup
cp -r ~/rrb-ecosystem/data ~/rrb-ecosystem/data.backup.$(date +%Y%m%d)

# Restore from backup
cp ~/rrb-ecosystem/data.backup.20260228/* ~/rrb-ecosystem/data/
```

### Update System

```bash
cd ~/rrb-ecosystem
git pull origin main
pnpm install
pnpm build
./start-rrb.sh
```

---

## 🔐 Security & Privacy

### Offline-First Design
- ✅ No data leaves your Mac mini
- ✅ No cloud dependency
- ✅ Complete control over data
- ✅ No vendor lock-in

### Local LLM
- ✅ Ollama runs locally
- ✅ No API keys exposed
- ✅ No external LLM calls (by default)
- ✅ Full privacy for all decisions

### Database Security
- ✅ SQLite with optional encryption
- ✅ Local file permissions
- ✅ Regular backups
- ✅ Audit logging

### Network Security
- ✅ Localhost-only by default
- ✅ Optional reverse proxy for remote access
- ✅ JWT authentication
- ✅ HTTPS support

---

## 🌐 Remote Access (Optional)

To access RRB from outside your Mac mini:

### Option 1: SSH Tunnel
```bash
ssh -L 3000:localhost:3000 user@mac-mini-ip
# Access at http://localhost:3000
```

### Option 2: Reverse Proxy (nginx)
```nginx
server {
    listen 80;
    server_name rrb.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

### Option 3: Cloudflare Tunnel
```bash
cloudflared tunnel create rrb
cloudflared tunnel route dns rrb rrb.yourdomain.com
cloudflared tunnel run rrb --url http://localhost:3000
```

---

## 🆘 Troubleshooting

### Ollama Not Starting
```bash
# Check if running
pgrep ollama

# Start manually
ollama serve

# Pull model if missing
ollama pull mistral
```

### Database Errors
```bash
# Check database integrity
sqlite3 ~/rrb-ecosystem/data/rrb.db "PRAGMA integrity_check;"

# Reset database (WARNING: deletes data)
rm ~/rrb-ecosystem/data/rrb.db
pnpm db:push
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 ./start-rrb.sh
```

### High CPU Usage
```bash
# Check running processes
top -o %CPU

# Reduce Ollama concurrency
OLLAMA_NUM_PARALLEL=1 ollama serve
```

---

## 📈 Performance Optimization

### For Mac mini M1/M2
```env
# Optimize for Apple Silicon
OLLAMA_NUM_PARALLEL=4
NODE_OPTIONS=--max-old-space-size=4096
```

### For Mac mini Intel
```env
# Optimize for Intel
OLLAMA_NUM_PARALLEL=2
NODE_OPTIONS=--max-old-space-size=2048
```

### Database Optimization
```bash
# Vacuum database (reclaim space)
sqlite3 ~/rrb-ecosystem/data/rrb.db "VACUUM;"

# Analyze for query optimization
sqlite3 ~/rrb-ecosystem/data/rrb.db "ANALYZE;"
```

---

## 📚 Additional Resources

- **Qumus Documentation**: See `QUMUS_PHASE1_TODO.md`
- **RRB Build Plan**: See `RRB_BUILD_PLAN.md`
- **API Documentation**: See `server/routers/rrbUnifiedRouter.ts`
- **Database Schema**: See `drizzle/schema-rrb-radio.ts`

---

## 🎯 Next Steps

1. **Deploy**: Run `./DEPLOY_MAC_MINI.sh`
2. **Verify**: Check `http://localhost:3000`
3. **Configure**: Edit `.env.local` for cloud features (optional)
4. **Monitor**: Use dashboard to watch Qumus decisions
5. **Extend**: Add custom policies or integrations

---

## 📞 Support

For issues or questions:

1. Check logs: `tail -f ~/rrb-ecosystem/logs/rrb.log`
2. Review configuration: `cat ~/rrb-ecosystem/.env.local`
3. Test connectivity: `curl http://localhost:3000/api/trpc/rrb.ecosystem.getStatus`
4. Restart system: `./start-rrb.sh`

---

**Built with ❤️ for RRB by Qumus**  
**Offline. Autonomous. Yours.**
