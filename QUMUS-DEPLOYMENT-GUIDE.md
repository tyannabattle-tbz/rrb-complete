# QUMUS Deployment Guide

## Complete Build History & System Architecture

This document outlines the complete QUMUS system built from conception to production-ready deployment.

## System Overview

**QUMUS** (Quantum Unified Multi-System Orchestration System) is a government-grade, open-source autonomous broadcast orchestration platform with AI-powered content generation, real-time streaming management, and decentralized architecture.

### Core Components

1. **QUMUS Chat Interface** - AI assistant for natural language command execution
2. **Rockin Rockin Boogie (RRB)** - Broadcast scheduling and music management
3. **HybridCast** - Multi-platform streaming and viewer analytics
4. **Ollama Integration** - Local open-source LLM inference
5. **Autonomous Agent Framework** - Government-grade autonomous decision-making
6. **Mobile Studio** - Full production workflow from content creation to distribution
7. **Admin Dashboard** - Real-time monitoring and approval workflows

## Build Timeline

### Phase 1: Foundation (Checkpoint 172aa8ac)
- Created React 19 + Tailwind 4 + Express 4 + tRPC 11 stack
- Implemented Manus OAuth authentication
- Set up database schema with Drizzle ORM
- Established basic project structure

### Phase 2: QUMUS Chat & Monitoring (Checkpoint 0c555513)
- Built QUMUS Chat interface with AI assistant
- Implemented Admin Override Panel for human approval/veto
- Created Command Router for subsystem control
- Built Real-Time Decision Visualization dashboard

### Phase 3: Rockin Rockin Boogie Operational (Checkpoint d9598bdb)
- Implemented command execution router with tRPC
- Created Rockin Rockin Boogie content manager
- Added track/channel management and analytics
- Built approval workflow for high-impact commands

### Phase 4: Full Feature Integration (Checkpoint fc7d4c28)
- Moved RRB to top-level navigation
- Integrated chat commands with command router
- Created Decision Policy Editor UI
- Built Admin Dashboard for monitoring

### Phase 5: Broadcast Orchestration (Checkpoint 70a62ff6)
- Implemented BroadcastGenerator with 5 radio templates
- Created BroadcastScheduler with recurring broadcasts
- Built BookKeeping module for recording and archiving
- Implemented ComplianceAdmin for legal/accounting management
- Created BroadcastOrchestrationHub integrating all systems

### Phase 6: Audio System & Deployment (Checkpoint a23b8526)
- Built UnifiedAudioPlayer component
- Created AudioService backend with Whisper integration
- Implemented tRPC audio router
- Added comprehensive test suite

### Phase 7: Government-Level Integration (Checkpoint 47c647fb)
- Integrated OpenSourceLLMService (Ollama)
- Implemented AutonomousAgentService with approval workflows
- Added GovernmentSecurityService with FIPS 140-2 compliance
- Built decentralized architecture with Byzantine fault tolerance

### Phase 8: Final Integration (Checkpoint 6b586278)
- Created OllamaIntegration service
- Built AdminDashboard with decision monitoring
- Implemented WebhookService for event-driven execution
- Integrated RRB and HybridCast with QUMUS core

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    QUMUS Frontend                           │
│  (React 19 + Tailwind 4 + Vite)                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ QUMUS Chat   │  │ Admin        │  │ Monitoring   │      │
│  │ Interface    │  │ Dashboard    │  │ Dashboard    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ RRB Manager  │  │ HybridCast   │  │ Mobile       │      │
│  │              │  │ Control      │  │ Studio       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Policy       │  │ Broadcast    │  │ Audit Trail  │      │
│  │ Editor       │  │ Hub          │  │ Viewer       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
└────────────────────────────────────────────────────────────┬┘
                                                              │
┌─────────────────────────────────────────────────────────────┤
│                    tRPC API Layer                           │
│  (Type-safe RPC with automatic client generation)          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ QUMUS        │  │ Integration  │  │ Audio        │      │
│  │ Router       │  │ Router       │  │ Router       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Command      │  │ Government   │  │ Webhook      │      │
│  │ Execution    │  │ Open Source  │  │ Service      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
└────────────────────────────────────────────────────────────┬┘
                                                              │
┌─────────────────────────────────────────────────────────────┤
│                    Backend Services                         │
│  (Express 4 + Node.js)                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ RRB          │  │ HybridCast   │  │ Ollama       │      │
│  │ Integration  │  │ Integration  │  │ Integration  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Audio        │  │ Autonomous   │  │ Government   │      │
│  │ Service      │  │ Agent        │  │ Security     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
└────────────────────────────────────────────────────────────┬┘
                                                              │
┌─────────────────────────────────────────────────────────────┤
│                    Data Layer                               │
│  (MySQL/TiDB + Drizzle ORM)                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Users  │  Broadcasts  │  Tracks  │  Sessions  │     │   │
│  │  Decisions  │  Audit Logs  │  Policies  │  ...  │   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. QUMUS Chat Interface
- Natural language command execution
- AI-powered suggestions and autocomplete
- Real-time response feedback
- Integration with all subsystems

### 2. Rockin Rockin Boogie
- Broadcast scheduling with recurring templates
- Music track management and playlist creation
- Commercial insertion and scheduling
- Auto-generate broadcasts with AI
- Live listener tracking
- Detailed analytics and statistics

### 3. HybridCast Streaming
- Multi-platform broadcast distribution
- Real-time viewer analytics
- Geolocation and device tracking
- Engagement metrics calculation
- Platform-specific performance monitoring

### 4. Autonomous Agents
- Government-grade security (FIPS 140-2)
- AES-256-GCM encryption
- Role-based access control (RBAC)
- Comprehensive audit logging
- Byzantine fault tolerance
- Decentralized architecture support

### 5. Mobile Studio
- Full production workflow
- Content creation and recording
- Video, audio, and document management
- Streaming integration
- Commercial and music insertion
- Real-time preview and monitoring

### 6. Admin Dashboard
- Real-time decision monitoring
- Approval/rejection workflows
- Security audit log viewer
- System health metrics
- Compliance reporting

## Installation & Deployment

### Quick Start (Development)

```bash
# Clone or download QUMUS
cd qumus

# Run installation script
chmod +x install-qumus.sh
./install-qumus.sh --dev
```

### Production Deployment

```bash
# Configure environment
./install-qumus.sh --customize

# Build and deploy
./install-qumus.sh --prod
```

### Docker Deployment

```bash
# Build Docker image
docker build -t qumus:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=mysql://... \
  -e OLLAMA_BASE_URL=http://ollama:11434 \
  qumus:latest
```

## Configuration

### Environment Variables

```bash
# Application
NODE_ENV=production
QUMUS_PORT=3000

# Database
DATABASE_URL=mysql://user:password@localhost:3306/qumus

# Ollama (Local LLM)
OLLAMA_BASE_URL=http://localhost:11434

# OAuth
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im

# Security
JWT_SECRET=your_jwt_secret
```

### Customization

See `QUMUS-CUSTOMIZATION-TEMPLATE.md` for detailed customization options.

## Backup & Recovery

### Creating Backups

```bash
# Backup entire project
tar --exclude='node_modules' -czf qumus-backup.tar.gz .

# Backup database
mysqldump -u user -p database > qumus-db-backup.sql
```

### Restoring from Backup

```bash
# Restore project
tar -xzf qumus-backup.tar.gz

# Restore database
mysql -u user -p database < qumus-db-backup.sql

# Reinstall dependencies
pnpm install
```

## Monitoring & Maintenance

### Health Checks

```bash
# Check application health
curl http://localhost:3000/health

# Check database connection
curl http://localhost:3000/api/health/db

# Check Ollama connection
curl http://localhost:11434/api/tags
```

### Logs

```bash
# Application logs
tail -f .manus-logs/devserver.log

# Browser console logs
tail -f .manus-logs/browserConsole.log

# Network requests
tail -f .manus-logs/networkRequests.log
```

### Performance Monitoring

- Real-time metrics in Admin Dashboard
- Broadcast statistics and analytics
- Viewer engagement tracking
- System resource usage monitoring

## Security

### FIPS 140-2 Compliance
- AES-256-GCM encryption for data at rest
- TLS 1.3 for data in transit
- Comprehensive audit logging
- Role-based access control

### Best Practices
1. Always use HTTPS in production
2. Rotate JWT secrets regularly
3. Enable MFA for admin accounts
4. Monitor audit logs regularly
5. Keep dependencies updated

## Troubleshooting

### Common Issues

**Issue: Ollama connection failed**
```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve
```

**Issue: Database connection error**
```bash
# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection
mysql -u user -p -h host database
```

**Issue: Port already in use**
```bash
# Change port
QUMUS_PORT=3001 pnpm dev

# Or kill existing process
lsof -i :3000
kill -9 <PID>
```

## Support & Resources

- **Documentation**: See QUMUS-CUSTOMIZATION-TEMPLATE.md
- **GitHub Issues**: Report bugs and feature requests
- **Community**: Join our Discord server
- **Email Support**: support@qumus.ai

## License

QUMUS is open-source under the Apache 2.0 License.

## Contributing

We welcome contributions! Please see CONTRIBUTING.md for guidelines.

---

**Version**: 1.0.0  
**Last Updated**: February 7, 2026  
**Build Status**: Production Ready ✅

For questions or support, please contact: support@qumus.ai
