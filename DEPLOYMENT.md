# RRB Ecosystem - Complete Deployment Guide

**Canryn Production & Subsidiaries**  
**A Voice for the Voiceless**

---

## System Overview

The RRB Ecosystem is a complete autonomous platform consisting of three integrated systems:

1. **QUMUS** - Autonomous orchestration engine (90% autonomous control)
2. **RRB Radio** - 24/7 broadcasting with healing frequencies and Solbones game
3. **HybridCast** - Emergency broadcast system with offline-first PWA
4. **Sweet Miracles** - 501(c)(3) donation platform

---

## Quick Start

### Development Environment
```bash
cd /home/ubuntu/manus-agent-web
pnpm install
pnpm dev
```

Access at: `https://3000-i9ul10bqn9luk79r6g35i-107197dc.us2.manus.computer`

### Production Deployment
```bash
pnpm build
pnpm start
```

---

## System Architecture

### Database Schema
- **users** - User accounts with system roles
- **broadcasts** - All broadcasts across systems
- **listeners** - Listener activity and analytics
- **donations** - Sweet Miracles donation tracking
- **metrics** - Real-time system metrics
- **autonomous_decisions** - QUMUS policy decisions
- **commands** - Cross-system commands
- **audit_logs** - Complete audit trail
- **radio_channels** - RRB radio channel configuration

### API Routes

#### Ecosystem Router (`/api/trpc/ecosystem.*`)
- `ecosystem.broadcasts.list` - Get all broadcasts
- `ecosystem.broadcasts.create` - Create new broadcast
- `ecosystem.listeners.getCount` - Get listener count
- `ecosystem.donations.create` - Process donation
- `ecosystem.metrics.get` - Get system metrics
- `ecosystem.commands.execute` - Execute cross-system command
- `ecosystem.decisions.log` - Log autonomous decision
- `ecosystem.audit.log` - Log audit event

---

## Key Features

### QUMUS Autonomous Orchestration
- 90% autonomous control with 10% human override
- Policy-based decision making
- Real-time monitoring dashboard
- Automatic task execution
- Error recovery and resilience

### RRB Radio Station
- 12+ active channels
- Default 432Hz healing frequency
- Solbones 4+3+2 dice game integration
- Listener analytics and metrics
- 24/7 broadcasting capability

### HybridCast Emergency Broadcast
- Offline-first PWA architecture
- Mesh networking support (LoRa/Meshtastic)
- Multi-operator collaboration
- Emergency alert system
- Cross-platform notifications

### Sweet Miracles Donations
- Stripe payment integration
- 501(c)(3) tax-exempt status
- Donation receipts and tracking
- Impact dashboard
- Donor management

---

## Configuration

### Environment Variables
```
DATABASE_URL=<mysql_connection>
JWT_SECRET=<session_secret>
VITE_APP_ID=<oauth_app_id>
OAUTH_SERVER_URL=<oauth_server>
STRIPE_SECRET_KEY=<stripe_secret>
VITE_STRIPE_PUBLISHABLE_KEY=<stripe_public>
STRIPE_WEBHOOK_SECRET=<webhook_secret>
```

### Default Settings
- **Default Frequency**: 432Hz (Healing)
- **Max Listeners**: 10,000
- **Autonomy Level**: 92%
- **Backup Frequency**: Daily
- **System Health Target**: 99%+

---

## Navigation & Access

### Public Routes
- `/` - Home page with three system entry points
- `/rrb` - RRB Legacy Site with spinning record
- `/solbones` - Solbones game
- `/donate` - Sweet Miracles donations

### Dashboard Routes
- `/ecosystem-dashboard` - Master unified dashboard
- `/admin` - Admin control panel
- `/qumus` - QUMUS orchestration interface
- `/emergency` - HybridCast emergency broadcast

### Admin Routes
- `/admin/users` - User management
- `/admin/systems` - System configuration
- `/admin/settings` - Global settings

---

## Monitoring & Health Checks

### System Health Metrics
- QUMUS Core: Online/Offline
- RRB Radio: Active listeners, broadcast count
- HybridCast: Alert count, emergency broadcasts
- Sweet Miracles: Donation processing, donor count

### Real-Time Monitoring
Access `/ecosystem-dashboard` for:
- Live listener count
- Active broadcasts
- Donation metrics
- System health percentage
- QUMUS autonomy level

---

## Stripe Integration

### Test Mode
- Card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC

### Live Mode
1. Complete Stripe KYC verification
2. Update `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLISHABLE_KEY`
3. Configure webhook at `/api/stripe/webhook`
4. Test with 99% discount promo code

---

## Audio Streaming

### Default Channels
1. RRB Main Stream (432Hz)
2. 432Hz Healing Frequency
3. Ambient Meditation (528Hz)
4. Classical Solfeggio (528Hz)
5. Nature Sounds (432Hz)
6. Binaural Beats (40Hz)

### Stream Configuration
- Default frequency: 432Hz
- Backup frequency: 528Hz
- Stream health check: Automatic
- Listener tracking: Enabled

---

## Deployment Checklist

- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] Stripe keys validated
- [ ] OAuth setup verified
- [ ] Audio streams configured
- [ ] SSL certificates installed
- [ ] Backup system enabled
- [ ] Monitoring dashboard active
- [ ] Admin users created
- [ ] Documentation reviewed

---

## Support & Maintenance

### Regular Maintenance
- Daily backups
- Weekly health checks
- Monthly security audits
- Quarterly performance reviews

### Emergency Procedures
1. HybridCast activation
2. Mesh network fallback
3. Offline-first PWA mode
4. Manual override capability

---

## Canryn Production Branding

All systems are branded as **Canryn Production & Subsidiaries**:
- RRB (Rockin Rockin Boogie) - Music & Entertainment
- Sweet Miracles - 501(c)(3) Nonprofit
- HybridCast - Emergency Communications
- QUMUS - Autonomous Orchestration

**Mission**: "A Voice for the Voiceless"

---

## Technical Support

For technical issues or questions, refer to:
- `/admin` - Admin Control Panel
- `/ecosystem-dashboard` - System Status
- Database logs - `/var/log/manus-agent-web/`
- Server logs - Check dev server output

---

**Last Updated**: March 2, 2026  
**Version**: 3.0.0  
**Status**: Production Ready
