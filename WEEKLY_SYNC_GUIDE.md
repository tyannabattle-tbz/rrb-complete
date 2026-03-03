# Weekly Sync Meeting Guide

## Overview

Weekly sync meetings keep QUMUS and RRB teams aligned, prevent conflicts, and ensure smooth collaboration on shared code. This guide explains how to run effective weekly meetings.

---

## Meeting Details

### Schedule

**Recommended:** Every Monday at 10:00 AM (or your preferred time)

**Duration:** 45 minutes

**Attendees:**
- QUMUS Team Lead
- RRB Team Lead
- Tech Lead / Project Manager
- Optional: Individual contributors (rotating)

### Meeting Link

Set up a recurring Zoom/Google Meet link and add to calendar:
- **Title:** Weekly QUMUS & RRB Sync
- **Time:** Mondays 10:00 AM - 10:45 AM
- **Recurring:** Weekly
- **Attendees:** [team leads + tech lead]

---

## Meeting Agenda (45 minutes)

### 1. Opening & Status Check (5 min)

**Purpose:** Quick overview of current state

**Topics:**
- Both sites live and functioning? ✅
- Any critical issues overnight?
- Any blockers from last week resolved?

**Owner:** Tech Lead

**Example:**
```
Tech Lead: "Good morning! Both sites are live and healthy. 
No critical issues overnight. QUMUS had 99.8% uptime, 
RRB had 99.9% uptime. Let's dive into this week's updates."
```

---

### 2. QUMUS Team Update (10 min)

**Purpose:** QUMUS team shares progress and plans

**Topics:**
- ✅ What was completed last week?
- 🔄 What's in progress this week?
- 🚧 Any blockers or challenges?
- 📋 Any shared code changes planned?

**Owner:** QUMUS Team Lead

**Example:**
```
QUMUS Lead: "Last week we completed the new autonomous policy 
for broadcast scheduling. This week we're working on the 
real-time monitoring dashboard. We're planning to add a new 
tRPC procedure for policy analytics - we'll announce in 
#shared-backend before we start."
```

**What to Listen For:**
- Any changes to `/server/routers.ts`?
- Any database schema changes?
- Any authentication changes?
- Any API credential updates?

---

### 3. RRB Team Update (10 min)

**Purpose:** RRB team shares progress and plans

**Topics:**
- ✅ What was completed last week?
- 🔄 What's in progress this week?
- 🚧 Any blockers or challenges?
- 📋 Any shared code changes planned?

**Owner:** RRB Team Lead

**Example:**
```
RRB Lead: "Last week we launched the new Spotify integration 
for radio channels. This week we're adding podcast support 
and improving the donation tracking. We need to add a new 
database table for podcast metadata - we'll coordinate with 
QUMUS before making changes."
```

**What to Listen For:**
- Any changes to `/server/routers.ts`?
- Any database schema changes?
- Any authentication changes?
- Any API credential updates?

---

### 4. Shared Code Coordination (10 min)

**Purpose:** Discuss and coordinate changes to shared files

**Topics:**
- Any planned changes to `/server/routers.ts`?
- Any planned changes to `/drizzle/schema.ts`?
- Any planned changes to `/client/src/App.tsx`?
- Any merge conflicts or issues?
- Any security or performance concerns?

**Owner:** Tech Lead

**Example Discussion:**

```
Tech Lead: "QUMUS team, I see you're planning to add 
analytics procedures. RRB team, you need a podcast table. 
Let's coordinate timing - QUMUS, can you do your changes 
first, then RRB can add the podcast table without conflicts?"

QUMUS Lead: "Sure, we can have our changes merged by 
Wednesday. That gives RRB time to add the podcast table."

RRB Lead: "Perfect. We'll start on Thursday then."

Tech Lead: "Great. Both teams, please announce in 
#shared-backend when you're ready to merge."
```

---

### 5. Issue Resolution (5 min)

**Purpose:** Address any blockers or issues

**Topics:**
- Any bugs affecting both sites?
- Any performance issues?
- Any security concerns?
- Any infrastructure issues?

**Owner:** Tech Lead

**Example:**
```
Tech Lead: "We had a minor issue with Stripe webhooks last 
week. It's fixed now, but both teams should be aware in case 
you see similar issues. If you do, ping me immediately."
```

---

### 6. Action Items & Next Steps (5 min)

**Purpose:** Confirm commitments and next steps

**Topics:**
- What will each team complete this week?
- When will shared code changes happen?
- Any follow-up meetings needed?
- Any escalations needed?

**Owner:** Tech Lead

**Example:**
```
Tech Lead: "Alright, let's confirm action items:

QUMUS:
- Complete analytics procedures by Wednesday
- Announce in #shared-backend before merging
- Review RRB's podcast table changes

RRB:
- Add podcast metadata table by Friday
- Announce in #shared-backend before merging
- Test with QUMUS analytics procedures

Both teams:
- Post daily standups in your channels
- Use #shared-backend for any coordination
- Let me know immediately if you hit blockers

Next sync: Monday 10 AM. See you then!"
```

---

## Pre-Meeting Preparation (15 min before)

### Tech Lead Checklist

- [ ] Check both sites are live
- [ ] Review any PRs merged since last meeting
- [ ] Check for any failed deployments
- [ ] Review Slack #shared-backend for any issues
- [ ] Prepare any technical updates

### QUMUS Team Lead Checklist

- [ ] Prepare update on completed work
- [ ] Prepare update on in-progress work
- [ ] Identify any blockers
- [ ] List any planned shared code changes
- [ ] Prepare questions for tech lead

### RRB Team Lead Checklist

- [ ] Prepare update on completed work
- [ ] Prepare update on in-progress work
- [ ] Identify any blockers
- [ ] List any planned shared code changes
- [ ] Prepare questions for tech lead

---

## Post-Meeting Follow-Up (15 min after)

### Tech Lead Actions

1. **Send meeting summary** to #shared-backend
2. **Create action items** in project management tool
3. **Schedule any follow-up** meetings if needed
4. **Update roadmap** with new information

### Meeting Summary Template

```
📋 Weekly Sync Summary - [Date]

✅ Status:
- Both sites: Live and healthy
- Uptime: QUMUS 99.8%, RRB 99.9%
- No critical issues

📊 QUMUS Team:
- ✅ Completed: [items]
- 🔄 In Progress: [items]
- 🚧 Blockers: [items]

📊 RRB Team:
- ✅ Completed: [items]
- 🔄 In Progress: [items]
- 🚧 Blockers: [items]

🔄 Shared Code Changes:
- QUMUS: [changes] - Timeline: [when]
- RRB: [changes] - Timeline: [when]
- Coordination: [plan]

📋 Action Items:
- [ ] QUMUS: [action] - Due: [date]
- [ ] RRB: [action] - Due: [date]
- [ ] Tech Lead: [action] - Due: [date]

🚨 Escalations:
- [if any]

Next Sync: [date and time]
```

### Team Lead Actions

1. **Update your team** on decisions made
2. **Post action items** in your team Slack channel
3. **Confirm timeline** with your team
4. **Identify any concerns** and raise in next sync

---

## Communication During the Week

### Daily Standup (Async)

Each team posts daily in their channel:

```
🌅 [DATE] Daily Standup

✅ Yesterday:
- [completed items]

🔄 Today:
- [in-progress items]

🚧 Blockers:
- [any blockers]
```

### Shared Code Announcements

When planning shared code changes, post in #shared-backend:

```
⚠️ [TEAM] Planning shared code change

📝 File: [file path]
🔄 Change: [description]
⏰ Timeline: [when]
👥 Impact: [what might be affected]

🔔 Heads up - please review and let me know if you have concerns!
```

### Quick Coordination

For urgent questions, use Slack:

```
@Tech-Lead Quick question about the database schema change...
```

---

## Escalation Path

### Issue Severity Levels

| Level | Response | Action |
|-------|----------|--------|
| 🟢 Low | 24 hours | Discuss in next sync |
| 🟡 Medium | 4 hours | Discuss in Slack |
| 🔴 High | 1 hour | Call or immediate Slack |
| 🔴 Critical | 15 min | Phone call + all hands |

### Escalation Process

1. **Identify severity level** of issue
2. **Notify relevant team** in Slack
3. **If no response in time limit**, escalate to tech lead
4. **If critical**, call tech lead immediately
5. **Document issue** for next sync meeting

---

## Meeting Best Practices

### ✅ DO

- **Start on time** — Respect everyone's schedule
- **Come prepared** — Have your updates ready
- **Be specific** — Include file names, PR numbers, timelines
- **Listen actively** — Pay attention to the other team
- **Ask questions** — Clarify anything unclear
- **Take notes** — Document decisions and action items
- **Follow up** — Complete your action items
- **Communicate changes** — Announce in Slack if plans change

### ❌ DON'T

- **Start late** — Delays cascade through the day
- **Ramble** — Stick to the agenda
- **Interrupt** — Let each team finish their update
- **Make decisions alone** — Discuss shared code changes
- **Forget action items** — Write them down
- **Skip meetings** — Attendance is important
- **Ignore blockers** — Escalate if needed
- **Surprise the other team** — Announce changes in advance

---

## Sample Meeting Transcript

```
Tech Lead: "Good morning everyone! Let's get started. 
Both sites are live and healthy. QUMUS 99.8%, RRB 99.9%. 
No critical issues. QUMUS team, what did you accomplish 
last week?"

QUMUS Lead: "Thanks! Last week we completed the autonomous 
policy for broadcast scheduling and added real-time monitoring. 
This week we're building the analytics dashboard. We'll need 
to add a new tRPC procedure for policy metrics - we'll announce 
in #shared-backend before we start."

Tech Lead: "Great! Any blockers?"

QUMUS Lead: "No blockers. We're on track."

Tech Lead: "Perfect. RRB team, your turn."

RRB Lead: "We launched Spotify integration last week and it's 
working great! This week we're adding YouTube podcast support 
and improving donation tracking. We need to add a new database 
table for podcast metadata. Should we coordinate with QUMUS?"

Tech Lead: "Good question. QUMUS, does the analytics procedure 
conflict with the podcast table?"

QUMUS Lead: "No, they're separate. We can do our changes first, 
then RRB can add the podcast table."

Tech Lead: "Perfect. RRB, can you start on the podcast table 
after QUMUS merges?"

RRB Lead: "Absolutely. We'll start Wednesday."

Tech Lead: "Great. Let's confirm action items:

QUMUS:
- Complete analytics procedures by Wednesday
- Announce in #shared-backend before merging

RRB:
- Add podcast table by Friday
- Announce in #shared-backend before merging

Both teams:
- Daily standups in your channels
- Any coordination in #shared-backend
- Escalate blockers immediately

Any questions? No? Great. Next sync Monday 10 AM. 
See you then!"
```

---

## Recurring Meeting Checklist

### Before Every Meeting

- [ ] Check both sites are live
- [ ] Review PRs merged since last meeting
- [ ] Check Slack for any issues
- [ ] Prepare agenda
- [ ] Send reminder 24 hours before

### During Every Meeting

- [ ] Start on time
- [ ] Follow agenda
- [ ] Take notes
- [ ] Confirm action items
- [ ] End on time

### After Every Meeting

- [ ] Send summary to #shared-backend
- [ ] Create action items
- [ ] Update roadmap
- [ ] Schedule follow-ups if needed

---

## Handling Common Scenarios

### Scenario 1: Team Missed Deadline

```
Tech Lead: "RRB team, I noticed the podcast table wasn't 
merged by Friday. What happened?"

RRB Lead: "We ran into an issue with the migration. We're 
fixing it now and should have it merged by Monday."

Tech Lead: "Okay. Can you post an update in #shared-backend 
so QUMUS knows? And let me know if you need help."

RRB Lead: "Will do. We'll post an update today."
```

### Scenario 2: Unexpected Shared Code Conflict

```
QUMUS Lead: "We found a conflict with the analytics procedure 
and RRB's podcast table. They both use the same database field."

Tech Lead: "Okay, let's discuss. Can you both explain your 
approach? [discussion] Alright, I think we should combine them 
like this [solution]. RRB, can you update your implementation?"

RRB Lead: "Sure, we can do that. We'll have it updated by 
tomorrow."
```

### Scenario 3: Critical Bug Found

```
Tech Lead: "We have a critical bug in the Stripe webhook 
handler. Both sites are affected. This needs immediate attention."

RRB Lead: "I can take this. I'll start investigating now."

Tech Lead: "Great. Keep me posted. If you need help, let me 
know. This is blocking donations."

RRB Lead: "Will do. I'll post updates in #shared-backend."
```

---

## Resources

- **COLLABORATION_GUIDE.md** — Full team collaboration guide
- **SLACK_SETUP.md** — Slack channel setup
- **RRB_QUICKSTART.md** — RRB team onboarding
- **Project Management Tool** — [link to your tool]
- **GitHub Repository** — [link to repo]

---

## Questions?

If you have questions about weekly syncs, please:

1. Ask your team lead
2. Post in #shared-backend
3. Contact the tech lead

---

**Last Updated:** March 3, 2026
**Version:** 1.0
**For:** QUMUS & RRB Team Leads
