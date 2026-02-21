# UN WCS Broadcast System - Operations Guide

## Overview

This document provides detailed procedures for operating the Rockin' Rockin' Boogie UN WCS parallel event broadcast on March 17, 2026. Follow these procedures exactly to ensure a smooth, professional broadcast.

**Event Details:**
- **Date:** March 17, 2026
- **Duration:** 2-4 hours
- **Expected Audience:** 195+ countries (worldwide)
- **Panelists:** 3 (1 main + 2 Ghana partners)
- **Broadcast Type:** Virtual panel with live engagement

---

## Pre-Broadcast (T-2 Hours)

### 1. System Startup (T-120 minutes)

**Streaming Computer:**
```bash
# Start services
systemctl start mysql
systemctl start redis
pnpm dev

# Verify services running
curl http://localhost:3000
```

**Moderator:**
1. Open browser to `http://localhost:3000/moderator-dashboard`
2. Verify login successful
3. Check all systems show "Ready" status

**Technical Lead:**
1. Verify all RTMP endpoints in `/broadcast-control`
2. Test primary RTMP connection
3. Confirm backup endpoints are healthy
4. Check recording storage (need 50GB+ free)

### 2. OBS Studio Setup (T-90 minutes)

**Launch OBS:**
1. Open OBS Studio
2. Go to Settings → Stream
3. Enter RTMP URL from dashboard
4. Enter stream key
5. Click "Apply" and "OK"

**Scene Verification:**
- [ ] Main Panel scene created
- [ ] Speaker Focus scene created
- [ ] Slides/Presentation scene created
- [ ] Graphics/Lower Thirds scene created
- [ ] Break Screen scene created

**Audio Setup:**
1. Settings → Audio
2. Set Microphone: Primary input device
3. Set Desktop Audio: System audio
4. Test levels (should peak around -6dB)

### 3. Panelist Connection (T-60 minutes)

**For Each Panelist:**

1. **Send Connection Link:**
   - URL: `https://your-domain.com/broadcast-viewer`
   - Backup: `https://your-domain.com/un-wcs-event`

2. **Verify Connection:**
   - Ask panelist to open link
   - Confirm video/audio working
   - Test chat message
   - Verify they can see engagement panel

3. **Audio Test:**
   - Ask panelist to speak
   - Monitor audio levels in OBS
   - Adjust microphone gain if needed
   - Confirm audio is clear

4. **Video Test:**
   - Verify lighting is adequate
   - Check background is professional
   - Confirm camera angle is good
   - Test video quality

### 4. Audience Preparation (T-45 minutes)

**Enable Broadcast Viewer:**
1. Navigate to `/broadcast-viewer`
2. Verify video player shows test pattern
3. Enable chat (click Chat tab)
4. Enable Q&A (click Q&A tab)
5. Enable polls (click Polls tab)

**Test Engagement:**
1. Post test message in chat
2. Submit test Q&A question
3. Create test poll
4. Verify all appear in real-time

### 5. Final Systems Check (T-30 minutes)

**Moderator Dashboard:**
- [ ] All panelists connected
- [ ] Stream health: Green
- [ ] Recording: Ready
- [ ] Chat: Enabled
- [ ] Q&A: Enabled
- [ ] Captions: Enabled

**OBS Studio:**
- [ ] Primary RTMP connected
- [ ] All scenes ready
- [ ] Audio levels good
- [ ] Video quality good
- [ ] Not streaming yet

**Broadcast Viewer:**
- [ ] Page loads quickly
- [ ] Video player responsive
- [ ] Chat working
- [ ] Q&A working
- [ ] Polls working

---

## Broadcast Start (T-0 Minutes)

### 1. Go Live Sequence (Exactly at start time)

**T-5 minutes:**
1. Moderator: Click "Go Live" button
2. Confirm all panelists ready
3. Confirm recording started
4. Confirm captions enabled

**T-2 minutes:**
1. OBS: Select "Main Panel" scene
2. OBS: Click "Start Streaming"
3. Wait 5 seconds for RTMP connection
4. Verify stream appears on RTMP endpoint

**T-0 minutes:**
1. Moderator: Click "Broadcast Live" button
2. Chat: Post "Welcome to UN WCS Parallel Event"
3. Broadcast Viewer: Verify video playing
4. Audience: Start joining

### 2. Opening Remarks (First 5 minutes)

**Moderator Responsibilities:**
- Monitor stream quality (should show 5000 kbps)
- Monitor viewer count (should be increasing)
- Watch chat for technical issues
- Be ready to pause if problems occur

**Technical Support:**
- Monitor CPU usage (should be <80%)
- Monitor memory usage (should be <75%)
- Monitor network bandwidth
- Be ready to failover if needed

---

## During Broadcast (T+5 to T+180 minutes)

### 1. Scene Management

**Switch Scenes Based On:**

| Situation | Scene | Action |
|-----------|-------|--------|
| All panelists speaking | Main Panel | Show all 3 video feeds |
| One panelist speaking | Speaker Focus | Zoom to active speaker |
| Showing slides/data | Slides | Full screen presentation |
| Graphics/titles | Graphics | Lower thirds with names |
| Technical break | Break Screen | Professional hold screen |

**Scene Switching:**
1. In OBS, click desired scene
2. Wait 2 seconds for transition
3. Verify video shows correct content
4. Monitor audio continues

### 2. Panelist Management

**Mute/Unmute:**
1. Moderator Dashboard → Panelists section
2. Click microphone icon to toggle
3. Confirm audio changes in OBS
4. Announce if muting for technical reasons

**Speaker Selection:**
1. Click panelist name to make them active speaker
2. OBS automatically switches to Speaker Focus scene
3. Lower thirds update with panelist name
4. Chat shows "Now speaking: [Name]"

**Time Management:**
1. Each panelist has allocated time
2. Speaker Notes Panel shows time remaining
3. Give 2-minute warning before time ends
4. Smoothly transition to next speaker

### 3. Audience Engagement

**Monitor Chat:**
- Read messages in real-time
- Remove inappropriate content
- Pin important messages
- Respond to technical questions

**Manage Q&A:**
1. Questions appear in Q&A tab
2. Audience can upvote questions
3. Sort by votes to show most popular
4. Read questions to panelists
5. Panelists answer live

**Run Polls:**
1. Create poll in Polls tab
2. Set 2-3 minute duration
3. Announce poll to audience
4. Display results when complete
5. Discuss results with panelists

### 4. Caption Management

**Monitor Captions:**
1. Captions appear in real-time
2. Check accuracy as they appear
3. Correct obvious errors
4. Verify all languages enabled

**Language Switching:**
1. Click language selector
2. Switch between EN/FR/ES/SW
3. Captions update automatically
4. Announce language changes

### 5. Stream Quality Monitoring

**Every 10 Minutes:**

| Metric | Target | Action if Low |
|--------|--------|---------------|
| Bitrate | 5000 kbps | Check network, reduce quality |
| FPS | 30 fps | Check CPU, reduce resolution |
| Viewers | Growing | Check promotion, share link |
| Chat | Active | Engage audience, ask questions |

**If Stream Drops:**
1. Check RTMP connection in dashboard
2. Verify OBS still shows "Streaming"
3. If dropped, click "Start Streaming" again
4. Failover to secondary endpoint if needed

---

## Handling Issues

### Audio Problems

**No Audio from Panelist:**
1. Ask panelist to check microphone
2. Verify microphone is selected in OBS
3. Check audio levels in OBS
4. Ask panelist to restart browser
5. If still no audio, switch to backup panelist

**Audio Feedback/Echo:**
1. Ask panelist to mute their speaker
2. Use headphones instead
3. Reduce microphone gain in OBS
4. Move microphone away from speaker

**Audio Delay/Sync Issues:**
1. Check network latency (should be <50ms)
2. Reduce bitrate to 3000 kbps
3. Switch to lower resolution (720p)
4. Restart OBS if delay persists

### Video Problems

**Video Freezing:**
1. Check network bandwidth
2. Reduce video quality in OBS
3. Ask panelist to close other applications
4. Restart browser if panelist frozen

**Video Lag/Stuttering:**
1. Check CPU usage (should be <80%)
2. Switch to faster preset (ultrafast)
3. Reduce resolution to 720p
4. Disable GPU encoding if available

**Video Distortion/Artifacts:**
1. Check bitrate (should be 5000 kbps)
2. Increase bitrate if possible
3. Switch to better encoder (NVIDIA NVENC)
4. Ask panelist to improve lighting

### Stream Connection Issues

**RTMP Connection Failed:**
1. Verify RTMP URL is correct
2. Verify stream key is correct
3. Check firewall allows port 1935
4. Switch to secondary RTMP endpoint
5. Contact stream provider

**Stream Drops During Broadcast:**
1. Automatic failover should engage
2. If not, manually switch endpoint
3. Verify stream resumes on backup
4. Announce brief technical pause
5. Resume broadcast

### Chat/Q&A Issues

**Chat Not Loading:**
1. Refresh browser page
2. Check internet connection
3. Clear browser cache
4. Try different browser
5. Restart server if needed

**Q&A Questions Not Appearing:**
1. Verify Q&A service is running
2. Check database connection
3. Refresh Q&A panel
4. Restart Q&A service
5. Fall back to chat for questions

---

## Broadcast End (T+180 minutes)

### 1. Closing Remarks (Last 10 minutes)

**Moderator:**
1. Announce time remaining
2. Thank panelists and audience
3. Provide contact information
4. Announce recording availability

**Technical:**
1. Prepare to stop recording
2. Verify all data saved
3. Check storage space used
4. Prepare shutdown sequence

### 2. Stop Streaming (T+180 minutes)

**OBS Studio:**
1. Click "Stop Streaming"
2. Wait for confirmation
3. Verify "Streaming" indicator off
4. Close OBS

**Moderator Dashboard:**
1. Click "Stop Broadcast"
2. Confirm recording stopped
3. Verify session saved
4. Export session data

**Broadcast Viewer:**
1. Display "Thank You" message
2. Show replay availability
3. Provide feedback form link
4. Display contact information

### 3. Post-Broadcast Tasks (T+180 to T+240 minutes)

**Immediate (First 10 minutes):**
- [ ] Stop all recording
- [ ] Verify all files saved
- [ ] Check storage integrity
- [ ] Backup database
- [ ] Export chat logs

**Short-term (Within 1 hour):**
- [ ] Download recordings
- [ ] Generate captions export
- [ ] Create highlight reel
- [ ] Compile statistics
- [ ] Send thank you emails

**Medium-term (Within 24 hours):**
- [ ] Process recordings (transcode, compress)
- [ ] Upload to archive
- [ ] Create YouTube version
- [ ] Write event summary
- [ ] Gather feedback

---

## Emergency Procedures

### Stream Failure

**If RTMP connection drops:**
1. Automatic failover engages (5 seconds)
2. If failover fails, manually switch:
   - Dashboard → RTMP Configuration
   - Select secondary endpoint
   - Click "Activate"
   - OBS automatically reconnects
3. Announce brief technical pause
4. Resume broadcast

### Power Failure

**If streaming computer loses power:**
1. Backup computer automatically starts
2. OBS connects to secondary RTMP
3. Moderator continues from backup
4. Audience experiences brief interruption
5. Resume broadcast

### Internet Failure

**If primary internet fails:**
1. Automatic failover to secondary connection
2. Stream continues on backup connection
3. Quality may be reduced
4. If both fail, broadcast ends
5. Archive and replay available

### Panelist Disconnect

**If panelist video/audio drops:**
1. Switch to Speaker Focus scene (shows other panelists)
2. Announce technical difficulty
3. Try to reconnect panelist
4. If unable, continue with remaining panelists
5. Provide panelist update when reconnected

---

## Monitoring Dashboard

### Real-Time Metrics

**Stream Health:**
- Bitrate: 5000 kbps ± 200
- FPS: 30 fps (constant)
- Latency: <50ms
- Packet Loss: <1%

**Server Health:**
- CPU: <80% utilization
- Memory: <75% utilization
- Disk: >50GB free
- Network: >25 Mbps upload

**Audience Metrics:**
- Viewers: Growing (should increase over time)
- Chat Activity: Active engagement
- Q&A Questions: Steady flow
- Poll Participation: >30% of viewers

### Alerts

**Critical Alerts (Stop Broadcast):**
- RTMP connection lost (both primary and secondary)
- Recording failed
- Database connection lost
- Storage full

**Warning Alerts (Prepare to Act):**
- Bitrate dropping below 3000 kbps
- CPU usage above 85%
- Memory usage above 80%
- Packet loss above 5%

---

## Checklist Summary

### Pre-Broadcast
- [ ] All systems started
- [ ] OBS configured and tested
- [ ] All panelists connected and tested
- [ ] Broadcast viewer ready
- [ ] Chat/Q&A/Polls enabled
- [ ] Recording ready
- [ ] Captions enabled

### During Broadcast
- [ ] Monitor stream quality every 10 minutes
- [ ] Manage panelists and scenes
- [ ] Engage audience with chat/Q&A/polls
- [ ] Monitor for technical issues
- [ ] Have backup plans ready

### Post-Broadcast
- [ ] Stop recording and streaming
- [ ] Backup all data
- [ ] Export recordings and captions
- [ ] Generate statistics
- [ ] Archive session data

---

## Support & Escalation

**Technical Issues:**
1. Check troubleshooting guide
2. Consult SETUP.md for configuration
3. Contact technical support
4. Escalate to stream provider if needed

**Panelist Issues:**
1. Try technical troubleshooting
2. Have backup panelist ready
3. Communicate with audience
4. Continue with available panelists

**Audience Issues:**
1. Monitor chat for complaints
2. Respond to technical questions
3. Provide alternative access methods
4. Post status updates

---

## Success Metrics

**Broadcast is successful if:**
- ✅ Stream runs for full duration without drops
- ✅ All panelists connected and speaking
- ✅ Audience engagement high (active chat/Q&A)
- ✅ Video quality maintained (1080p, 30fps)
- ✅ Audio clear and synchronized
- ✅ Captions accurate in all languages
- ✅ Recording complete and archived
- ✅ Viewer count reaches target
- ✅ No major technical issues
- ✅ Positive feedback from audience

---

**Good luck with your UN WCS broadcast! 🌍📡**

For additional help, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
