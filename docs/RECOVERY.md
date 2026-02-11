# Recovery Procedures

**Canryn Production and its subsidiaries**
**Rockin' Rockin' Boogie Ecosystem — v11.6 FINAL**

---

## Scenario 1: Application Not Loading

1. Check if the dev server is running: visit the preview URL
2. If down, click **Dashboard** in Management UI to check status
3. If server shows errors, check `.manus-logs/devserver.log`
4. Common fix: restart the server from the Management UI

## Scenario 2: Database Connection Failed

1. Verify `DATABASE_URL` in Settings → Secrets
2. Check if TiDB cluster is active (Manus manages this automatically)
3. If schema is out of sync: `pnpm db:push`
4. If data is corrupted: restore from database backup (see CLONE_DUPLICATE_BACKUP.md)

## Scenario 3: QUMUS Not Making Decisions

1. Navigate to `/rrb/qumus/admin` — check if policies show as active
2. Check `/rrb/qumus/human-review` — decisions may be queued for human review
3. The autonomous loop runs on a timer; allow 30-60 seconds for decisions to appear
4. If policies show 0% autonomy, the engine may need a server restart

## Scenario 4: Stripe Payments Failing

1. Check Settings → Payment for key status
2. Verify webhook is configured at `/api/stripe/webhook`
3. Check Stripe Dashboard → Developers → Webhooks for delivery logs
4. Test with card: `4242 4242 4242 4242`, any future expiry, any CVC

## Scenario 5: Login Loop on Policy Dashboards

This was fixed in v11.5. All policy dashboard queries use `publicProcedure`. If it recurs:
1. Check that the specific router file uses `publicProcedure` for query procedures
2. Only mutations should use `protectedProcedure`
3. The global error handler in `client/src/main.tsx` redirects on UNAUTHORIZED

## Scenario 6: Human Review Approve/Reject Not Working

Fixed in v11.5. The `reviewDecision` method matches on both numeric DB `id` and string `decisionId`. If it recurs:
1. Check `server/qumus-complete-engine.ts` → `reviewDecision` method
2. Ensure it handles both `Number(reviewId)` matching and string matching

## Scenario 7: Full Project Recovery

1. **From Manus checkpoint:** Dashboard → find checkpoint → Rollback
2. **From GitHub:** Clone repo, `pnpm install`, configure `.env`, `pnpm db:push`
3. **From ZIP backup:** Extract, `pnpm install`, configure `.env`, `pnpm db:push`
4. **Current stable checkpoint:** `b02f63ce` (v11.6 FINAL — 14 QUMUS policies)

## Scenario 8: Audio Not Playing

1. Browser autoplay policies require user interaction first
2. The audio player appears at the bottom of the page
3. User must click play manually on first visit (browser restriction)
4. After first interaction, subsequent plays work automatically

## Key Checkpoint History

| Version | Checkpoint ID | Description |
|---------|--------------|-------------|
| v11.6 FINAL | b02f63ce | 14 QUMUS policies, CSV import, AI content generation |
| v11.5 | 2528266c | 13 policies, MusicBrainz, bug fixes, full docs |
| v11.4 | 84fc1c29 | 12 policies, royalty audit, documentation suite |
| v11.3 | 61619854 | Proof Vault BMI evidence, content archival |

---

*Canryn Production and its subsidiaries. All rights reserved. 2024–2026.*
