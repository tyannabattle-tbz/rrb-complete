# QUMUS Deployment Configuration Guide

## Production Deployment Checklist

### 1. Ollama Server Deployment
```bash
# Install Ollama (if not already installed)
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# Pull recommended models
ollama pull llama2
ollama pull mistral
ollama pull neural-chat

# Configure environment
export OLLAMA_BASE_URL=http://localhost:11434
```

### 2. Environment Variables Configuration
```bash
# Create .env.production file
OLLAMA_BASE_URL=http://localhost:11434
WEBHOOK_SECRET=your-webhook-secret-key
WEBSOCKET_URL=wss://your-domain.com/ws
DATABASE_URL=your-database-connection-string
JWT_SECRET=your-jwt-secret-key
NODE_ENV=production
```

### 3. Webhook Signature Verification
```typescript
// Enabled in server/webhookValidator.ts
// All webhooks require HMAC-SHA256 signature verification
// Header: X-Webhook-Signature
```

### 4. Real-Time WebSocket Sync
- WebSocket server running on port 3001
- Automatic reconnection with exponential backoff
- Heartbeat every 30 seconds
- Automatic metric sync every 5 seconds

### 5. Automation Rules Enabled
- Default 4 automation rules active on startup
- Custom rules can be created via Automation Rules UI
- All rules logged and auditable

### 6. Security Features Enabled
- FIPS 140-2 compliance
- AES-256-GCM encryption for sensitive data
- TLS 1.3 for all connections
- Comprehensive audit logging
- Role-based access control (RBAC)

### 7. Monitoring & Alerts
- Real-Time Metrics Dashboard active
- System health monitoring
- Error tracking and alerting
- Performance metrics collection

## Deployment Steps

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.production
   # Edit .env.production with your values
   ```

3. **Build for Production**
   ```bash
   pnpm build
   ```

4. **Start Services**
   ```bash
   # Start Ollama server
   ollama serve &
   
   # Start QUMUS application
   pnpm start:production
   ```

5. **Verify Deployment**
   - Check Ollama server: http://localhost:11434/api/tags
   - Check QUMUS dashboard: https://your-domain.com
   - Verify WebSocket connection in browser console
   - Check Real-Time Metrics Dashboard

## Troubleshooting

### Ollama Server Not Responding
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
killall ollama
ollama serve
```

### WebSocket Connection Failed
- Check firewall settings
- Verify WEBSOCKET_URL environment variable
- Check browser console for connection errors
- Restart application server

### Webhook Events Not Processing
- Verify webhook secret matches configuration
- Check webhook signature in X-Webhook-Signature header
- Review webhook logs in Real-Time Metrics Dashboard
- Test webhook with curl command

## Performance Optimization

### Ollama Model Selection
- **llama2**: Best for general chat (7B, 13B, 70B variants)
- **mistral**: Fast and efficient (7B variant)
- **neural-chat**: Optimized for conversations

### WebSocket Optimization
- Metric sync interval: 5 seconds (configurable)
- Heartbeat interval: 30 seconds (configurable)
- Max reconnection attempts: 10 with exponential backoff

### Database Optimization
- Enable connection pooling
- Configure appropriate indexes
- Monitor query performance

## Backup & Recovery

See BACKUP-RECOVERY-GUIDE.md for complete backup and recovery procedures.

## Support & Documentation

- Installation Guide: INSTALLATION-GUIDE.md
- User Guide: USER-GUIDE.md
- API Documentation: API-DOCS.md
- Troubleshooting: TROUBLESHOOTING.md

---

**Production Deployment Version**: 1.0.0
**Last Updated**: February 2026
**Maintained by**: Canryn Production and subsidiaries
