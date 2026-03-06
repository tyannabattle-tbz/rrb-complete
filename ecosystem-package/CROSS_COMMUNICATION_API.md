# Cross-Communication API Reference

## Canryn Production Ecosystem — v2.47.24

This document provides the complete API reference for cross-platform communication between all ecosystem components: QUMUS, RRB, HybridCast, Sweet Miracles, Anna's Promotions, and all subsidiaries.

---

## Base URLs

| Service | Production URL | Description |
|---------|---------------|-------------|
| QUMUS Engine | `https://qumus.manus.space/api/trpc` | Central orchestration brain |
| RRB Platform | `https://manuweb.sbs/api/trpc` | Main ecosystem platform |
| HybridCast | `https://hybridcast.manus.space` | Emergency broadcast PWA |

---

## Authentication

All API calls require Bearer token authentication via the `Authorization` header.

```
Authorization: Bearer <BUILT_IN_FORGE_API_KEY>
```

For cross-service communication, use the shared QUMUS service token configured in environment variables.

---

## QUMUS Decision API

### POST /api/trpc/qumus.logDecision

Log an autonomous decision made by the QUMUS engine.

**Input:**
```json
{
  "policyId": "string",
  "action": "string",
  "confidence": 0.95,
  "context": {},
  "outcome": "approved | rejected | escalated",
  "requiresHumanReview": false
}
```

**Response:**
```json
{
  "id": "string",
  "timestamp": "ISO-8601",
  "status": "logged"
}
```

### GET /api/trpc/qumus.getDecisions

Retrieve decision history with optional filters.

**Query Parameters:**
- `policyId` (optional): Filter by policy
- `startDate` (optional): ISO-8601 start date
- `endDate` (optional): ISO-8601 end date
- `limit` (optional): Max results (default: 50)

---

## RRB Content Scheduler API

### POST /api/trpc/broadcast.schedule

Schedule content for broadcast across RRB Radio channels.

**Input:**
```json
{
  "channelId": "string",
  "contentType": "music | talk | commercial | emergency",
  "scheduledAt": "ISO-8601",
  "duration": 3600,
  "metadata": {
    "title": "string",
    "artist": "string",
    "genre": "string"
  }
}
```

### GET /api/trpc/broadcast.getSchedule

Retrieve the broadcast schedule for a given date range.

**Query Parameters:**
- `channelId` (optional): Filter by channel
- `date` (required): Target date (YYYY-MM-DD)

---

## Bot Management API

### POST /api/trpc/bots.activate

Activate a bot instance for a specific platform.

**Input:**
```json
{
  "botId": "string",
  "platform": "twitter | instagram | facebook | tiktok | discord | web",
  "config": {
    "autonomyLevel": 0.85,
    "contentPolicy": "promotional | engagement | moderation",
    "schedule": "cron expression"
  }
}
```

### GET /api/trpc/bots.status

Get status of all active bots.

**Response:**
```json
{
  "bots": [
    {
      "id": "string",
      "name": "string",
      "status": "active | standby | processing",
      "platform": ["string"],
      "lastAction": "string",
      "autonomyLevel": 0.85,
      "actionsToday": 42
    }
  ]
}
```

### POST /api/trpc/bots.command

Send a command to a specific bot.

**Input:**
```json
{
  "botId": "string",
  "command": "post | engage | moderate | report | pause | resume",
  "params": {}
}
```

---

## HybridCast Emergency API

### POST /api/trpc/emergency.broadcast

Initiate an emergency broadcast across all channels.

**Input:**
```json
{
  "severity": "info | warning | critical | emergency",
  "message": "string",
  "channels": ["all | radio | web | push | sms"],
  "location": {
    "lat": 0.0,
    "lng": 0.0,
    "radius": 50
  },
  "duration": 3600
}
```

### GET /api/trpc/emergency.status

Get current emergency broadcast status.

---

## Sweet Miracles Donation API

### POST /api/trpc/donations.create

Process a new donation through Sweet Miracles.

**Input:**
```json
{
  "amount": 50.00,
  "currency": "USD",
  "donorName": "string",
  "donorEmail": "string",
  "campaign": "string",
  "recurring": false
}
```

### GET /api/trpc/donations.impact

Get impact metrics for Sweet Miracles campaigns.

**Response:**
```json
{
  "totalDonations": 0,
  "totalAmount": 0.00,
  "activeCampaigns": 0,
  "communitiesServed": 0,
  "impactScore": 0.0
}
```

---

## Webhook Events

All services emit webhook events for cross-service coordination. Register webhook endpoints via the QUMUS dashboard.

### Event Types

| Event | Source | Description |
|-------|--------|-------------|
| `qumus.decision.made` | QUMUS | New autonomous decision logged |
| `qumus.decision.escalated` | QUMUS | Decision requires human review |
| `broadcast.scheduled` | RRB | New content scheduled |
| `broadcast.started` | RRB | Broadcast started |
| `broadcast.ended` | RRB | Broadcast ended |
| `bot.action.completed` | Bots | Bot completed an action |
| `bot.status.changed` | Bots | Bot status changed |
| `emergency.broadcast.started` | HybridCast | Emergency broadcast initiated |
| `emergency.broadcast.ended` | HybridCast | Emergency broadcast concluded |
| `donation.received` | Sweet Miracles | New donation processed |
| `donation.campaign.goal` | Sweet Miracles | Campaign goal reached |

### Webhook Payload Format

```json
{
  "event": "string",
  "timestamp": "ISO-8601",
  "source": "qumus | rrb | hybridcast | sweet-miracles | bots",
  "data": {},
  "signature": "HMAC-SHA256 signature"
}
```

---

## Rate Limits

| Endpoint Category | Rate Limit |
|-------------------|-----------|
| QUMUS Decisions | 100 req/min |
| Broadcast Scheduling | 30 req/min |
| Bot Commands | 60 req/min |
| Emergency Broadcasts | 10 req/min |
| Donation Processing | 50 req/min |
| Webhook Registration | 10 req/min |

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid request parameters |
| 401 | Authentication required |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
| 503 | Service temporarily unavailable |

---

*A Canryn Production — All rights reserved.*
*QUMUS Autonomous Orchestration Engine v2.47.24*
