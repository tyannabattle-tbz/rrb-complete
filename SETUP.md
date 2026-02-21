# UN WCS Broadcast System - Setup Guide

## Overview

This document provides complete setup instructions for the Rockin' Rockin' Boogie UN WCS parallel event broadcast system. The system supports custom streaming, live panel management, real-time audience engagement, and automatic failover.

**Event Date:** March 17, 2026  
**Expected Audience:** Worldwide (195+ countries)  
**Broadcast Duration:** 2-4 hours  
**Key Features:** Virtual panel, live chat, Q&A, multi-language captions, automatic recording

---

## System Requirements

### Hardware Requirements

- **Streaming Computer:** 
  - CPU: Intel i7/Ryzen 7 or better (6+ cores)
  - RAM: 16GB minimum (32GB recommended)
  - GPU: NVIDIA/AMD GPU with encoding support (optional but recommended)
  - Network: 25+ Mbps upload speed (fiber recommended)

- **Panelist Computers:**
  - CPU: Intel i5/Ryzen 5 or better
  - RAM: 8GB minimum
  - Network: 10+ Mbps upload speed
  - Webcam: 1080p minimum
  - Microphone: USB or built-in (headset recommended)

### Software Requirements

- **Server:** Node.js 18+, npm/pnpm
- **Streaming:** OBS Studio 30+, FFmpeg 6+
- **Browser:** Chrome/Firefox/Safari (latest versions)
- **Database:** MySQL 8+ or compatible

### Network Requirements

- Primary internet connection: 25+ Mbps upload
- Secondary backup connection: 10+ Mbps upload (optional)
- Low latency: <50ms preferred
- Stable connection: <5% packet loss

---

## Installation Steps

### 1. Environment Configuration

Create `.env.local` file in project root:

```env
# RTMP Endpoints
PRIMARY_RTMP_URL=rtmp://wcs-primary.example.com/live
PRIMARY_RTMP_KEY=your-primary-stream-key

SECONDARY_RTMP_URL=rtmp://wcs-secondary.example.com/live
SECONDARY_RTMP_KEY=your-secondary-stream-key

TERTIARY_RTMP_URL=rtmp://wcs-tertiary.example.com/live
TERTIARY_RTMP_KEY=your-tertiary-stream-key

# Database
DATABASE_URL=mysql://user:password@localhost:3306/rrb_broadcast

# Recording
RECORDING_PATH=/var/recordings/rrb

# Transcription
WHISPER_API_KEY=your-whisper-api-key
WHISPER_API_URL=https://api.openai.com/v1/audio/transcriptions

# OAuth (Manus)
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
```

### 2. Install Dependencies

```bash
# Install all dependencies
pnpm install

# Create database
pnpm db:push

# Seed with initial data (optional)
pnpm db:seed
```

### 3. Start Development Server

```bash
# Start dev server
pnpm dev

# Server will run on http://localhost:3000
# Open in browser: http://localhost:3000
```

### 4. Configure RTMP Endpoints

1. Navigate to `/broadcast-control` in browser
2. Click "Settings" → "RTMP Configuration"
3. Enter UN WCS RTMP details:
   - Primary endpoint URL
   - Stream key
   - Backup endpoints (secondary/tertiary)
4. Click "Test Connection" for each endpoint
5. Verify all endpoints show "Healthy"

### 5. OBS Studio Configuration

#### Stream Settings

1. Open OBS Studio
2. Go to Settings → Stream
3. Select "Custom RTMP Server"
4. Enter RTMP URL from `/broadcast-control`:
   ```
   rtmp://wcs-primary.example.com/live
   ```
5. Stream Key: `your-primary-stream-key`

#### Output Settings

Recommended for 1080p broadcast:

- **Bitrate:** 5000 kbps
- **Resolution:** 1920x1080
- **FPS:** 30
- **Encoder:** NVIDIA NVENC / AMD VCE / x264
- **Preset:** Medium (quality vs CPU balance)
- **Audio Bitrate:** 128 kbps

#### Scene Setup

Create scenes for:
1. **Main Panel** - All panelists visible
2. **Speaker Focus** - Current speaker only
3. **Slides/Presentation** - Screen share
4. **Graphics** - Lower thirds, overlays
5. **Break Screen** - During breaks

### 6. Panelist Setup

For each panelist:

1. **Send them this information:**
   - Event URL: `https://your-domain.com/broadcast-viewer`
   - Join time: 30 minutes before event
   - Test time: 15 minutes before event
   - Backup URL: `https://your-domain.com/un-wcs-event`

2. **Provide them with:**
   - Speaker notes (PDF or link)
   - Talking points
   - Time allocations
   - Q&A guidelines

3. **Technical requirements:**
   - Good lighting (face visible)
   - Quiet background
   - Professional appearance
   - Headset recommended
   - Test audio/video before event

---

## Pre-Event Checklist

### 48 Hours Before

- [ ] Test all RTMP endpoints
- [ ] Verify database connectivity
- [ ] Check transcription API access
- [ ] Test recording storage space (need 50GB+)
- [ ] Verify backup internet connection
- [ ] Test all panelist connections
- [ ] Create backup of database

### 24 Hours Before

- [ ] Full end-to-end broadcast test
- [ ] Test chat and Q&A systems
- [ ] Verify caption generation
- [ ] Test failover system
- [ ] Confirm all panelist technical setup
- [ ] Verify recording functionality
- [ ] Test audience viewer page

### 2 Hours Before

- [ ] Start streaming computer
- [ ] Open OBS Studio
- [ ] Test primary RTMP connection
- [ ] Verify all scenes in OBS
- [ ] Test audio levels
- [ ] Confirm panelists are online
- [ ] Test moderator dashboard
- [ ] Verify chat moderation tools

### 30 Minutes Before

- [ ] Panelists join broadcast viewer
- [ ] Test all panelist audio/video
- [ ] Confirm speaker notes are loaded
- [ ] Start recording
- [ ] Enable captions
- [ ] Open chat for audience
- [ ] Verify all systems operational

---

## Operating the Broadcast

### Starting the Broadcast

1. **Moderator Dashboard:**
   - Navigate to `/moderator-dashboard`
   - Click "Go Live"
   - Confirm all panelists connected
   - Start recording

2. **OBS Studio:**
   - Select "Main Panel" scene
   - Click "Start Streaming"
   - Verify stream appears on RTMP endpoint

3. **Audience Broadcast Viewer:**
   - Navigate to `/broadcast-viewer`
   - Verify video player shows stream
   - Enable chat and Q&A
   - Monitor viewer count

### During the Broadcast

**Moderator Responsibilities:**
- Monitor stream quality (bitrate, FPS)
- Manage panelist audio (mute/unmute)
- Select active speaker
- Monitor chat for inappropriate content
- Approve Q&A questions
- Track time allocations

**Technical Support:**
- Monitor RTMP connection
- Watch for stream drops
- Check recording status
- Monitor server CPU/memory
- Be ready to failover if needed

### Ending the Broadcast

1. **Moderator Dashboard:**
   - Click "Stop Broadcast"
   - Confirm recording stopped
   - Save session data

2. **OBS Studio:**
   - Click "Stop Streaming"
   - Verify stream ended on RTMP

3. **Post-Broadcast:**
   - Download recordings
   - Generate captions export
   - Archive chat logs
   - Backup database

---

## Troubleshooting

### Stream Connection Issues

**Problem:** "Failed to connect to RTMP server"

**Solutions:**
1. Verify RTMP URL and stream key
2. Check firewall/port 1935 is open
3. Test with `ffmpeg -f lavfi -i testsrc=size=1920x1080:duration=10 -f flv "rtmp://..."`
4. Switch to secondary endpoint

### Audio Issues

**Problem:** "No sound from panelists"

**Solutions:**
1. Check OBS audio input levels
2. Verify panelist microphone is enabled
3. Check browser audio permissions
4. Test audio in system settings
5. Switch panelist to different device

### Caption/Transcription Issues

**Problem:** "Captions not appearing"

**Solutions:**
1. Verify Whisper API key is valid
2. Check transcription service is running
3. Verify language is set correctly
4. Check browser console for errors
5. Restart transcription service

### Failover Issues

**Problem:** "Failover not working"

**Solutions:**
1. Test all RTMP endpoints individually
2. Verify secondary endpoint credentials
3. Check failover service logs
4. Manually switch endpoint in dashboard
5. Contact backup provider

---

## Performance Optimization

### Network Optimization

- Use wired ethernet (not WiFi)
- Close unnecessary applications
- Disable VPN if possible
- Use CDN for viewer distribution
- Monitor bandwidth usage

### Server Optimization

- Monitor CPU usage (should be <80%)
- Monitor memory usage (should be <75%)
- Enable GPU encoding in OBS
- Use hardware-accelerated transcoding
- Optimize database queries

### Viewer Experience

- Adaptive bitrate streaming
- Regional CDN distribution
- Fallback to lower quality
- Mobile optimization
- Caching strategy

---

## Security Considerations

### Access Control

- Restrict moderator dashboard to authorized users
- Use strong passwords for RTMP keys
- Rotate stream keys regularly
- Limit API access with rate limiting

### Data Protection

- Encrypt RTMP stream (RTMPS)
- Secure database with SSL/TLS
- Backup recordings securely
- Comply with data privacy regulations

### Monitoring

- Log all access attempts
- Monitor for unusual activity
- Set up alerts for failures
- Track all moderator actions

---

## Support & Resources

### Emergency Contacts

- **Technical Support:** [support@example.com](mailto:support@example.com)
- **Stream Provider:** [provider@example.com](mailto:provider@example.com)
- **Backup Provider:** [backup@example.com](mailto:backup@example.com)

### Documentation

- [OPERATIONS.md](./OPERATIONS.md) - How to run the broadcast
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and fixes
- [API.md](./API.md) - tRPC procedures documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design overview

### Additional Resources

- [OBS Studio Documentation](https://obsproject.com/wiki/)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [RTMP Specification](https://rtmp.veriskope.com/docs/spec/)

---

## Next Steps

1. Complete all installation steps
2. Run pre-event checklist
3. Conduct full broadcast test
4. Train all operators
5. Prepare backup plans
6. Monitor system 24/7 during event

**Good luck with your UN WCS broadcast! 🌍📡**
