# Slack Channel Setup Guide

## Overview

This guide helps you set up dedicated Slack channels for QUMUS and RRB team collaboration. Proper communication channels prevent conflicts, enable quick coordination, and keep discussions organized.

---

## Recommended Channel Structure

### 1. Team-Specific Channels

#### #qumus-dev
**Purpose:** QUMUS team development discussions

**Use for:**
- QUMUS feature development
- Dashboard and orchestration updates
- Autonomous policy discussions
- QUMUS-specific bugs and fixes

**Members:** QUMUS team + Tech Lead

**Posting Guidelines:**
- Daily standup updates (morning)
- Feature completion announcements
- Blockers and help requests
- Code review requests for QUMUS files

**Example Posts:**
```
🚀 [QUMUS] Added new autonomous policy for broadcast scheduling
🐛 [QUMUS] Found issue with dashboard widget rendering - investigating
❓ [QUMUS] Need review on PR #456 - new chat interface
```

---

#### #rrb-dev
**Purpose:** RRB team development discussions

**Use for:**
- RRB feature development
- Radio streaming and music library updates
- Solbones game development
- Sweet Miracles donation features
- RRB-specific bugs and fixes

**Members:** RRB team + Tech Lead

**Posting Guidelines:**
- Daily standup updates (morning)
- Feature completion announcements
- Blockers and help requests
- Code review requests for RRB files

**Example Posts:**
```
🎵 [RRB] Spotify playlist integration complete
🎮 [RRB] Solbones game now supports custom dice skins
💰 [RRB] Sweet Miracles donation tracking improved
```

---

### 2. Shared Channels

#### #shared-backend
**Purpose:** Coordination on shared backend code

**Use for:**
- Database schema changes (BEFORE making changes)
- tRPC procedure updates (BEFORE making changes)
- Authentication and security updates
- API credential management
- Shared file modifications

**Members:** Both teams + Tech Lead

**Posting Guidelines:**
- Announce shared file changes BEFORE committing
- Request approval for schema modifications
- Discuss architectural decisions
- Coordinate timing of shared code deployments

**Example Posts:**
```
⚠️ [SHARED] Planning to add new table for user preferences - need approval
🔐 [SHARED] Updated authentication flow - both teams should review
📊 [SHARED] Database migration scheduled for tomorrow at 2pm
```

---

#### #deployments
**Purpose:** Deployment notifications and status

**Use for:**
- Deployment announcements
- Rollback notifications
- Production issues
- Downtime alerts
- Release notes

**Members:** Both teams + Tech Lead + DevOps

**Posting Guidelines:**
- Announce deployments 30 minutes before
- Post deployment status after completion
- Alert immediately if issues occur
- Include rollback instructions if needed

**Example Posts:**
```
🚀 Deploying checkpoint f6a284bc in 30 minutes
✅ Deployment successful - both sites live
🚨 Production issue detected - rolling back to previous checkpoint
```

---

#### #general
**Purpose:** General team announcements

**Use for:**
- Company announcements
- Team meetings and events
- General discussions
- Off-topic conversations

**Members:** Entire organization

---

### 3. Optional Channels

#### #code-review
**Purpose:** Centralized code review requests

**Use for:**
- PR review requests
- Code review discussions
- Architecture reviews
- Security reviews

**Members:** Both teams + Tech Lead

---

#### #bugs-and-issues
**Purpose:** Bug tracking and issue discussion

**Use for:**
- Bug reports
- Issue investigations
- Root cause analysis
- Fix verification

**Members:** Both teams + Tech Lead

---

## Channel Setup Instructions

### Step 1: Create Channels

1. Open Slack workspace
2. Click **"Create a channel"** button
3. Create each channel with these settings:

| Channel | Type | Description |
|---------|------|-------------|
| #qumus-dev | Private | QUMUS team development |
| #rrb-dev | Private | RRB team development |
| #shared-backend | Private | Shared code coordination |
| #deployments | Public | Deployment notifications |
| #code-review | Private | Code review requests |
| #bugs-and-issues | Private | Bug tracking |

### Step 2: Add Members

**#qumus-dev:**
- All QUMUS team members
- Tech Lead
- Project Manager (optional)

**#rrb-dev:**
- All RRB team members
- Tech Lead
- Project Manager (optional)

**#shared-backend:**
- All QUMUS team members
- All RRB team members
- Tech Lead
- Project Manager

**#deployments:**
- All team members
- DevOps/Deployment engineer

**#code-review:**
- All team members
- Tech Lead

**#bugs-and-issues:**
- All team members
- Tech Lead

### Step 3: Set Channel Descriptions

For each channel, add a description and topic:

**#qumus-dev**
- Description: "QUMUS team development discussions, feature updates, and code reviews"
- Topic: "QUMUS development | Dashboard | Orchestration | Autonomous policies"

**#rrb-dev**
- Description: "RRB team development discussions, feature updates, and code reviews"
- Topic: "RRB development | Radio | Music | Donations | Games"

**#shared-backend**
- Description: "Coordination on shared backend code, database changes, and API updates"
- Topic: "Shared backend | Database schema | tRPC procedures | Authentication"

**#deployments**
- Description: "Deployment notifications and production status updates"
- Topic: "Deployments | Production | Rollbacks | Incidents"

### Step 4: Pin Important Messages

Pin these messages in each channel:

**#qumus-dev:**
- Link to COLLABORATION_GUIDE.md
- Link to QUMUS development standards
- Link to current sprint board

**#rrb-dev:**
- Link to COLLABORATION_GUIDE.md
- Link to RRB development standards
- Link to current sprint board

**#shared-backend:**
- Link to COLLABORATION_GUIDE.md
- Link to database schema documentation
- Link to API documentation

**#deployments:**
- Link to deployment procedures
- Link to rollback procedures
- Link to incident response guide

---

## Communication Norms

### Response Time Expectations

| Channel | Response Time | Priority |
|---------|---------------|----------|
| #qumus-dev | 2-4 hours | Medium |
| #rrb-dev | 2-4 hours | Medium |
| #shared-backend | 1-2 hours | High |
| #deployments | Immediate | Critical |
| @mentions | 30 minutes | Urgent |

### Escalation Path

1. **Slack message** in relevant channel
2. **@mention** team lead if no response in 1 hour
3. **Direct message** to tech lead if urgent
4. **Phone call** if critical issue

### Daily Standup Format

Post daily in your team channel (morning):

```
🌅 [DATE] Daily Standup

✅ Yesterday:
- Completed [feature/fix]
- Reviewed [PR number]
- Fixed [issue]

🔄 Today:
- Working on [feature]
- Planning to merge [PR]
- Investigating [issue]

🚧 Blockers:
- [Blocker 1]
- [Blocker 2]

📊 Status: On track / At risk / Blocked
```

### Shared Code Change Announcement

When planning to modify shared files, post in #shared-backend:

```
⚠️ [TEAM] Planning shared code change

📝 File: /server/routers.ts
🔄 Change: Adding new procedure for [feature]
⏰ Timeline: Starting today, merging tomorrow
👥 Impact: May affect [other team]

🔔 Heads up - please review and let me know if you have concerns!
```

---

## Slack Integrations

### GitHub Integration

Connect GitHub to Slack for automatic PR and commit notifications:

1. Go to #shared-backend
2. Click **"Add an app"**
3. Search for **"GitHub"**
4. Install and configure
5. Set up notifications for:
   - PR created/merged
   - Issue created/closed
   - Commits to main branch

### Deployment Bot

Set up automatic deployment notifications:

1. Create a webhook for deployments
2. Post to #deployments when:
   - Deployment starts
   - Deployment completes
   - Deployment fails
   - Rollback occurs

### Daily Digest

Set up a bot to send daily summaries:

1. Summarize PRs merged
2. List open issues
3. Report test coverage changes
4. Alert on failed deployments

---

## Best Practices

### ✅ DO

- **Be specific** — Include file names, PR numbers, and error messages
- **Use threads** — Reply to messages in threads to keep conversations organized
- **Use reactions** — React with ✅ to acknowledge messages
- **Tag relevant people** — Use @mentions for important updates
- **Search before asking** — Check if your question has been answered
- **Use code blocks** — Format code with triple backticks
- **Link to resources** — Include links to PRs, issues, and documentation

### ❌ DON'T

- **Don't spam** — Avoid excessive messages or notifications
- **Don't discuss sensitive info** — Use private channels for credentials
- **Don't forget context** — Provide background when asking questions
- **Don't ignore @mentions** — Respond to direct mentions promptly
- **Don't use all caps** — It's considered shouting
- **Don't make decisions alone** — Discuss shared code changes first

---

## Example Conversations

### Scenario 1: Announcing a Shared Code Change

```
[#shared-backend]

@Tech Lead @RRB Team

⚠️ Planning to update database schema for user preferences

📝 Changes:
- Add new table: user_preferences
- Add columns: theme, language, notifications_enabled
- Migration: Add default values for existing users

⏰ Timeline:
- Today: Schema review
- Tomorrow: Migration and testing
- Day after: Deployment

🔔 Both teams should be aware - this may affect authentication flow

Any concerns or questions?
```

**Response:**
```
✅ QUMUS team acknowledges - looks good to us
✅ RRB team acknowledges - no conflicts expected
```

---

### Scenario 2: Reporting a Bug in Shared Code

```
[#bugs-and-issues]

🐛 Bug: Payment processing failing for donations

📍 Location: /server/routers.ts - stripe webhook handler
🔴 Severity: Critical
📊 Impact: RRB donations not being recorded

Steps to reproduce:
1. Go to rockinrockinboogie.com/donate
2. Complete Stripe payment
3. Check database - donation not recorded

Error message:
```
Error: Cannot read property 'amount' of undefined
at stripeWebhookHandler (line 234)
```

🔍 Investigation: Appears to be issue with webhook signature verification

@Tech Lead - need urgent review
```

**Response:**
```
[Tech Lead]
Looking into this now - found the issue in webhook handler
Creating fix on branch: bugfix/stripe-webhook-signature
Will have PR ready in 30 minutes
```

---

### Scenario 3: Requesting Code Review

```
[#code-review]

👀 Code review requested: PR #456

📝 Title: Add new autonomous policy for broadcast scheduling
🔗 Link: https://github.com/[repo]/pull/456
📊 Changes: 450 lines added, 120 lines removed

Summary:
- New QUMUS policy for automatic broadcast scheduling
- Integrates with existing orchestration engine
- Includes 15 new unit tests
- No changes to shared code

⏰ Timeline: Needed by EOD tomorrow

@QUMUS-lead @Tech-lead - please review when available
```

**Response:**
```
[QUMUS Lead]
✅ Reviewed - looks great! A few minor suggestions in comments

[Tech Lead]
✅ Approved - ready to merge
```

---

## Troubleshooting

### Issue: Too Many Notifications

**Solution:**
1. Go to channel settings
2. Adjust notification preferences
3. Set to "Mentions only" or "Off"
4. Use "Mute channel" for less important channels

### Issue: Important Message Missed

**Solution:**
1. Use @channel or @here for urgent messages
2. Pin important messages
3. Set up keyword notifications for critical terms

### Issue: Conversation Getting Off-Topic

**Solution:**
1. Move discussion to thread
2. Create new channel if recurring topic
3. Use "Remind me" feature to follow up later

---

## Resources

- [Slack Best Practices](https://slack.com/help/articles/360059928654-How-to-use-Slack-effectively)
- [GitHub Slack Integration](https://slack.github.com/)
- [Slack API Documentation](https://api.slack.com/)

---

**Last Updated:** March 3, 2026
**Maintained By:** Manus Platform Team
