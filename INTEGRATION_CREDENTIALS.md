# Integration Credentials Manager

**Last Updated:** 2026-02-20
**Status:** Production Ready
**Renewal Schedule:** Quarterly (Jan, Apr, Jul, Oct)

This document tracks all third-party integrations, API keys, OAuth credentials, and login requirements for the Rockin Rockin Boogie platform. All credentials are managed through environment variables and the Manus secure vault.

---

## 🔐 PHASE 2: RSS FEED & PODCAST DISTRIBUTION

### Apple Podcasts Connect
- **Status:** ⏳ Pending Setup
- **Login:** https://podcastsconnect.apple.com
- **Requirements:** Apple ID with verified email
- **Credentials Needed:**
  - Apple ID email
  - App-specific password (generated in Apple ID settings)
- **Feed URL:** `/api/rss/broadcasts`
- **Renewal:** Annual (expires with Apple ID password)
- **Update Procedure:**
  1. Log into podcastsconnect.apple.com
  2. Verify RSS feed is valid and updated
  3. Check listener statistics monthly
  4. Update podcast artwork if needed (3000x3000px minimum)
- **Contact:** Apple Podcast Support
- **Notes:** Requires manual verification of RSS feed quality

### Spotify for Podcasters
- **Status:** ⏳ Pending Setup
- **Login:** https://podcasters.spotify.com
- **Requirements:** Spotify account (free or premium)
- **Credentials Needed:**
  - Spotify email
  - Spotify password
- **Feed URL:** `/api/rss/broadcasts`
- **Renewal:** Ongoing (auto-renewed with Spotify account)
- **Update Procedure:**
  1. Log into podcasters.spotify.com
  2. Verify show details and artwork
  3. Monitor listener engagement weekly
  4. Update show description if needed
- **Contact:** Spotify Podcasters Support
- **Notes:** Automatic distribution to Spotify app once verified

### Google Podcasts
- **Status:** ⏳ Pending Setup
- **Login:** https://podcasts.google.com/podcasts/new
- **Requirements:** Google Account
- **Credentials Needed:**
  - Google email
  - Google password (or OAuth)
- **Feed URL:** `/api/rss/broadcasts`
- **Renewal:** Ongoing (auto-renewed with Google Account)
- **Update Procedure:**
  1. Log into podcasts.google.com
  2. Verify podcast details and artwork
  3. Check listener metrics in Google Podcasts Manager
  4. Update episode descriptions if needed
- **Contact:** Google Podcasts Support
- **Notes:** Integrates with Google Search and Google Assistant

### Amazon Music for Podcasters
- **Status:** ⏳ Pending Setup
- **Login:** https://musicforpodcasters.amazon.com
- **Requirements:** Amazon account
- **Credentials Needed:**
  - Amazon email
  - Amazon password
- **Feed URL:** `/api/rss/broadcasts`
- **Renewal:** Ongoing (auto-renewed with Amazon account)
- **Update Procedure:**
  1. Log into musicforpodcasters.amazon.com
  2. Verify podcast metadata
  3. Monitor listener statistics
  4. Update artwork if needed
- **Contact:** Amazon Music Support
- **Notes:** Reaches Alexa device users

### TuneIn Podcasts
- **Status:** ⏳ Pending Setup
- **Login:** https://tunein.com/podcasters
- **Requirements:** TuneIn account
- **Credentials Needed:**
  - TuneIn email
  - TuneIn password
- **Feed URL:** `/api/rss/broadcasts`
- **Renewal:** Ongoing (auto-renewed with TuneIn account)
- **Update Procedure:**
  1. Log into tunein.com/podcasters
  2. Verify show details and artwork
  3. Monitor listener engagement
  4. Update show information if needed
- **Contact:** TuneIn Support
- **Notes:** Largest radio and podcast platform

---

## 🎬 PHASE 3: SOCIAL MEDIA INTEGRATION

### YouTube Channel
- **Status:** ⏳ Pending Setup
- **Login:** https://youtube.com
- **Requirements:** Google Account
- **Credentials Needed:**
  - Google email
  - Google password (or OAuth)
  - YouTube API Key (from Google Cloud Console)
  - YouTube Channel ID
- **API Key:** `YOUTUBE_API_KEY` (stored in .env)
- **Renewal:** Annual (YouTube API key review)
- **Update Procedure:**
  1. Log into youtube.com
  2. Verify channel branding and artwork
  3. Check analytics weekly
  4. Upload broadcast clips (1-3 minutes)
  5. Update video descriptions with links
- **Contact:** YouTube Creator Support
- **API Docs:** https://developers.google.com/youtube/v3
- **Notes:** Auto-upload broadcast highlights every 24 hours

### Instagram Business Account
- **Status:** ⏳ Pending Setup
- **Login:** https://instagram.com
- **Requirements:** Facebook Business Account
- **Credentials Needed:**
  - Instagram email
  - Instagram password
  - Facebook App ID
  - Facebook App Secret
  - Instagram Graph API Token
- **API Token:** `INSTAGRAM_API_TOKEN` (stored in .env)
- **Renewal:** 60 days (token refresh required)
- **Update Procedure:**
  1. Log into instagram.com
  2. Verify business profile setup
  3. Check insights weekly
  4. Post broadcast clips (15-60 seconds)
  5. Engage with comments and DMs
- **Contact:** Instagram Business Support
- **API Docs:** https://developers.facebook.com/docs/instagram-api
- **Notes:** Auto-post Reels every 48 hours

### TikTok Creator Account
- **Status:** ⏳ Pending Setup
- **Login:** https://tiktok.com
- **Requirements:** TikTok account (18+)
- **Credentials Needed:**
  - TikTok email or phone
  - TikTok password
  - TikTok Creator Access Token
- **API Token:** `TIKTOK_API_TOKEN` (stored in .env)
- **Renewal:** 30 days (token refresh required)
- **Update Procedure:**
  1. Log into tiktok.com
  2. Verify creator account status
  3. Check analytics daily
  4. Post broadcast clips (15-60 seconds)
  5. Engage with trending sounds
- **Contact:** TikTok Creator Support
- **API Docs:** https://developers.tiktok.com
- **Notes:** Auto-post trending clips daily

### Twitter/X Account
- **Status:** ⏳ Pending Setup
- **Login:** https://twitter.com
- **Requirements:** Twitter account
- **Credentials Needed:**
  - Twitter email
  - Twitter password
  - Twitter API Key
  - Twitter API Secret
  - Twitter Bearer Token
- **API Key:** `TWITTER_API_KEY` (stored in .env)
- **Renewal:** Annual (API key review)
- **Update Procedure:**
  1. Log into twitter.com
  2. Verify account verification status
  3. Check analytics daily
  4. Post broadcast updates (280 characters)
  5. Engage with mentions and retweets
- **Contact:** Twitter Developer Support
- **API Docs:** https://developer.twitter.com/en/docs
- **Notes:** Auto-post broadcast announcements hourly

---

## 📻 PHASE 4: RADIO DIRECTORY LISTINGS

### TuneIn Radio
- **Status:** ⏳ Pending Setup
- **Login:** https://tunein.com/broadcasters
- **Requirements:** TuneIn Broadcaster Account
- **Credentials Needed:**
  - TuneIn email
  - TuneIn password
  - Station ID (assigned by TuneIn)
- **Station ID:** `TUNEIN_STATION_ID` (stored in .env)
- **Renewal:** Annual (station verification)
- **Update Procedure:**
  1. Log into tunein.com/broadcasters
  2. Verify station details and artwork
  3. Monitor listener statistics weekly
  4. Update station description if needed
  5. Check for any platform updates
- **Contact:** TuneIn Broadcaster Support
- **Notes:** Largest radio directory globally

### Radio Garden
- **Status:** ⏳ Pending Setup
- **Login:** https://radio.garden
- **Requirements:** Radio Garden Account
- **Credentials Needed:**
  - Email
  - Password
  - Stream URL
- **Stream URL:** `RADIO_GARDEN_STREAM_URL` (stored in .env)
- **Renewal:** Ongoing (auto-renewed)
- **Update Procedure:**
  1. Log into radio.garden
  2. Verify station is listed
  3. Check listener metrics
  4. Update station metadata if needed
- **Contact:** Radio Garden Support
- **Notes:** Interactive global radio map

### iHeartRadio
- **Status:** ⏳ Pending Setup
- **Login:** https://www.iheartmedia.com/iheartradio
- **Requirements:** iHeartRadio Account
- **Credentials Needed:**
  - Email
  - Password
  - Station ID
- **Station ID:** `IHEARTRADIO_STATION_ID` (stored in .env)
- **Renewal:** Annual (station verification)
- **Update Procedure:**
  1. Log into iheartradio.com
  2. Verify station profile
  3. Monitor listener engagement
  4. Update station artwork
- **Contact:** iHeartRadio Support
- **Notes:** Major US radio platform

### Audacy (formerly SiriusXM)
- **Status:** ⏳ Pending Setup
- **Login:** https://www.audacy.com
- **Requirements:** Audacy Account
- **Credentials Needed:**
  - Email
  - Password
  - Station ID
- **Station ID:** `AUDACY_STATION_ID` (stored in .env)
- **Renewal:** Annual (station verification)
- **Update Procedure:**
  1. Log into audacy.com
  2. Verify station listing
  3. Check listener metrics
  4. Update station information
- **Contact:** Audacy Support
- **Notes:** Major US radio platform

### Shoutcast
- **Status:** ⏳ Pending Setup
- **Login:** https://www.shoutcast.com
- **Requirements:** Shoutcast Account
- **Credentials Needed:**
  - Email
  - Password
  - Station ID
- **Station ID:** `SHOUTCAST_STATION_ID` (stored in .env)
- **Renewal:** Ongoing (auto-renewed)
- **Update Procedure:**
  1. Log into shoutcast.com
  2. Verify station details
  3. Monitor listener statistics
  4. Update metadata if needed
- **Contact:** Shoutcast Support
- **Notes:** Independent radio directory

---

## 📅 PHASE 5: CONTENT CALENDAR & PROMOTION

### Google Calendar API
- **Status:** ⏳ Pending Setup
- **Login:** https://calendar.google.com
- **Requirements:** Google Account
- **Credentials Needed:**
  - Google email
  - Google password
  - Google Calendar API Key
  - Calendar ID
- **API Key:** `GOOGLE_CALENDAR_API_KEY` (stored in .env)
- **Renewal:** Annual (API key review)
- **Update Procedure:**
  1. Log into calendar.google.com
  2. Create broadcast schedule
  3. Set up automatic reminders
  4. Share calendar with team
- **Contact:** Google Calendar Support
- **API Docs:** https://developers.google.com/calendar
- **Notes:** Syncs with all social media platforms

### SendGrid (Email Notifications)
- **Status:** ⏳ Pending Setup
- **Login:** https://sendgrid.com
- **Requirements:** SendGrid Account
- **Credentials Needed:**
  - SendGrid email
  - SendGrid password
  - SendGrid API Key
- **API Key:** `SENDGRID_API_KEY` (stored in .env)
- **Renewal:** Annual (API key review)
- **Update Procedure:**
  1. Log into sendgrid.com
  2. Verify sender domain
  3. Monitor email delivery rates
  4. Update email templates if needed
- **Contact:** SendGrid Support
- **API Docs:** https://sendgrid.com/docs
- **Notes:** Sends broadcast reminders to subscribers

---

## 📊 PHASE 6: LISTENER ANALYTICS & TRACKING

### Google Analytics 4
- **Status:** ⏳ Pending Setup
- **Login:** https://analytics.google.com
- **Requirements:** Google Account
- **Credentials Needed:**
  - Google email
  - Google password
  - Measurement ID
- **Measurement ID:** `VITE_ANALYTICS_WEBSITE_ID` (already configured)
- **Renewal:** Ongoing (auto-renewed)
- **Update Procedure:**
  1. Log into analytics.google.com
  2. Check real-time listener data
  3. Review weekly reports
  4. Monitor conversion goals
  5. Update event tracking if needed
- **Contact:** Google Analytics Support
- **Docs:** https://support.google.com/analytics
- **Notes:** Real-time listener tracking and demographics

### Mixpanel (Advanced Analytics)
- **Status:** ⏳ Pending Setup
- **Login:** https://mixpanel.com
- **Requirements:** Mixpanel Account
- **Credentials Needed:**
  - Mixpanel email
  - Mixpanel password
  - Mixpanel Token
- **Token:** `MIXPANEL_TOKEN` (stored in .env)
- **Renewal:** Annual (token review)
- **Update Procedure:**
  1. Log into mixpanel.com
  2. Monitor user engagement funnels
  3. Check retention metrics
  4. Review cohort analysis
- **Contact:** Mixpanel Support
- **Docs:** https://docs.mixpanel.com
- **Notes:** Advanced user behavior tracking

---

## 👥 PHASE 7: COMMUNITY & ENGAGEMENT

### Discord Server
- **Status:** ⏳ Pending Setup
- **Login:** https://discord.com
- **Requirements:** Discord Account
- **Credentials Needed:**
  - Discord email
  - Discord password
  - Discord Bot Token
  - Server ID
- **Bot Token:** `DISCORD_BOT_TOKEN` (stored in .env)
- **Renewal:** Ongoing (auto-renewed)
- **Update Procedure:**
  1. Log into discord.com
  2. Verify bot permissions
  3. Monitor community activity
  4. Update bot commands if needed
  5. Engage with members daily
- **Contact:** Discord Support
- **Docs:** https://discord.com/developers
- **Notes:** Real-time listener community

### Telegram Bot
- **Status:** ⏳ Pending Setup
- **Login:** https://telegram.org
- **Requirements:** Telegram Account
- **Credentials Needed:**
  - Telegram phone number
  - Telegram password
  - Bot Token (from @BotFather)
  - Chat ID
- **Bot Token:** `TELEGRAM_BOT_TOKEN` (stored in .env)
- **Renewal:** Ongoing (auto-renewed)
- **Update Procedure:**
  1. Log into telegram.org
  2. Verify bot functionality
  3. Monitor channel subscribers
  4. Post broadcast updates
  5. Engage with listeners
- **Contact:** Telegram Support
- **Docs:** https://core.telegram.org/bots
- **Notes:** Broadcast notifications and listener engagement

---

## 🔑 CREDENTIAL MANAGEMENT BEST PRACTICES

### Storage & Security
- All credentials stored in `.env` file (never committed to git)
- Sensitive values encrypted in Manus secure vault
- API keys rotated quarterly
- Passwords changed every 6 months
- Two-factor authentication enabled on all accounts

### Renewal Calendar
```
January 15   - Apple Podcasts, TuneIn, Audacy verification
April 15     - Google APIs, YouTube, Analytics review
July 15      - Instagram, TikTok, Twitter token refresh
October 15   - All passwords and API keys rotation
```

### Update Procedures
1. **Monthly:** Check all platform dashboards for updates
2. **Quarterly:** Verify all credentials are active and valid
3. **Semi-Annually:** Rotate passwords and API keys
4. **Annually:** Review platform terms and update metadata

### Emergency Procedures
- **Compromised Credential:** Immediately rotate the affected key/password
- **Platform Down:** Switch to backup distribution channel
- **API Rate Limit:** Implement exponential backoff retry logic
- **Authentication Failure:** Check credential expiration and renew if needed

---

## 📋 CREDENTIAL CHECKLIST

### Phase 2: RSS & Podcasts
- [ ] Apple Podcasts Connect account created and verified
- [ ] Spotify for Podcasters account created and verified
- [ ] Google Podcasts account created and verified
- [ ] Amazon Music for Podcasters account created and verified
- [ ] TuneIn Podcasts account created and verified
- [ ] All RSS feeds tested and validated

### Phase 3: Social Media
- [ ] YouTube channel created with API key
- [ ] Instagram business account created with API token
- [ ] TikTok creator account created with API token
- [ ] Twitter/X account created with API keys
- [ ] All social media credentials stored in .env
- [ ] Auto-posting scheduled and tested

### Phase 4: Radio Directories
- [ ] TuneIn Radio broadcaster account created
- [ ] Radio Garden account created
- [ ] iHeartRadio account created
- [ ] Audacy account created
- [ ] Shoutcast account created
- [ ] All station IDs stored in .env

### Phase 5: Content Calendar
- [ ] Google Calendar API configured
- [ ] SendGrid account created with API key
- [ ] Email templates created
- [ ] Broadcast schedule populated
- [ ] Automatic reminders tested

### Phase 6: Analytics
- [ ] Google Analytics 4 configured (already done)
- [ ] Mixpanel account created with token
- [ ] Event tracking implemented
- [ ] Dashboards created and shared

### Phase 7: Community
- [ ] Discord server created with bot token
- [ ] Telegram bot created with token
- [ ] Bot commands configured
- [ ] Community guidelines posted
- [ ] Moderation team assigned

---

## 📞 SUPPORT CONTACTS

| Platform | Support URL | Email | Phone |
|----------|------------|-------|-------|
| Apple Podcasts | podcasts.apple.com/support | podcasts@apple.com | N/A |
| Spotify | support.spotify.com | support@spotify.com | N/A |
| Google | support.google.com | support@google.com | N/A |
| YouTube | support.google.com/youtube | youtube-support@google.com | N/A |
| Instagram | instagram.com/help | help@instagram.com | N/A |
| TikTok | tiktok.com/help | support@tiktok.com | N/A |
| Twitter | twitter.com/support | support@twitter.com | N/A |
| TuneIn | tunein.com/support | support@tunein.com | N/A |
| iHeartRadio | iheartradio.com/support | support@iheartradio.com | N/A |
| Discord | discord.com/support | support@discord.com | N/A |
| Telegram | telegram.org/support | support@telegram.org | N/A |

---

## 📝 LAST UPDATED LOG

| Date | Update | Status |
|------|--------|--------|
| 2026-02-20 | Initial Credentials Manager created | ✅ Complete |
| TBD | Phase 2 RSS feeds implemented | ⏳ Pending |
| TBD | Phase 3 Social media integration | ⏳ Pending |
| TBD | Phase 4 Radio directories | ⏳ Pending |
| TBD | Phase 5 Content calendar | ⏳ Pending |
| TBD | Phase 6 Analytics setup | ⏳ Pending |
| TBD | Phase 7 Community integration | ⏳ Pending |

---

**Next Review Date:** 2026-05-20 (Quarterly Review)
**Maintenance Owner:** Ty Bat Zan (@tyannabattle)
**Emergency Contact:** tyannabattle@gmail.com
