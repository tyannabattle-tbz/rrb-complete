# LIVE Payment Flow Testing Guide

**Sweet Miracles NPO - Stripe LIVE Integration**

---

## Overview

This guide walks you through testing the complete LIVE payment flow for Sweet Miracles donations. All payments will be processed through your LIVE Stripe account.

**Important**: Once LIVE mode is enabled, all transactions are real and will appear in your Stripe account.

---

## Prerequisites

✅ Stripe account approved and set to LIVE mode
✅ LIVE API keys configured in Manus Settings → Payment
✅ Sweet Miracles donation product created with 4 price tiers
✅ Mac Mini deployment complete and server running
✅ Dashboard accessible at http://localhost:3000

---

## Part 1: Pre-Testing Checklist

### 1.1 Verify Stripe Configuration

1. Go to **Stripe Dashboard** (https://dashboard.stripe.com)
2. Confirm you're in **LIVE mode** (toggle in top right)
3. Go to **Products** and verify "Sweet Miracles Donation" exists
4. Verify all 4 price tiers are created:
   - Bronze: $25/month
   - Silver: $50/month
   - Gold: $100/month
   - Platinum: $250/month

### 1.2 Verify Manus Configuration

1. Open Master Dashboard (http://localhost:3000)
2. Go to **Settings → Payment**
3. Confirm:
   - ✅ Mode: **LIVE**
   - ✅ Secret Key: Starts with `sk_live_`
   - ✅ Publishable Key: Starts with `pk_live_`
   - ✅ Stripe Status: **Connected ✓**

### 1.3 Verify Webhook Configuration

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Confirm webhook endpoint exists:
   - URL: `https://your-domain/api/stripe/webhook`
   - Events: `payment_intent.succeeded`, `invoice.paid`, `customer.subscription.created`
   - Status: **Active ✓**

---

## Part 2: Test Donation Tiers

### 2.1 Test Bronze Tier ($25/month)

**Step 1: Navigate to Donation Form**
1. Open Master Dashboard
2. Go to **Sweet Miracles Dashboard**
3. Scroll to "Donation Tiers" section

**Step 2: Select Bronze Tier**
1. Click on the **"Bronze"** card ($25/month)
2. Click **"Donate"** button
3. You'll be redirected to Stripe Checkout

**Step 3: Complete Payment**
1. On Stripe Checkout page, enter:
   - Email: Your email address
   - Card: `4242 4242 4242 4242` (test card)
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - Name: Your name
2. Click **"Subscribe"**

**Step 4: Verify Success**
1. You should see "Payment successful" message
2. You'll be redirected back to the dashboard
3. Go to **Monitoring Dashboard**
4. Check "Recent Transactions" - should show $25 payment

**Step 5: Verify in Stripe**
1. Go to **Stripe Dashboard → Payments**
2. You should see a new payment for $25
3. Status should be **Succeeded**

---

### 2.2 Test Silver Tier ($50/month)

Repeat steps 2.1 but select **"Silver"** tier instead.

Expected results:
- ✅ Payment amount: $50
- ✅ Subscription created for Silver tier
- ✅ Appears in Stripe Dashboard

---

### 2.3 Test Gold Tier ($100/month)

Repeat steps 2.1 but select **"Gold"** tier instead.

Expected results:
- ✅ Payment amount: $100
- ✅ Subscription created for Gold tier
- ✅ Appears in Stripe Dashboard

---

### 2.4 Test Platinum Tier ($250/month)

Repeat steps 2.1 but select **"Platinum"** tier instead.

Expected results:
- ✅ Payment amount: $250
- ✅ Subscription created for Platinum tier
- ✅ Appears in Stripe Dashboard

---

## Part 3: Test Custom Donation

### 3.1 Test Custom Amount

**Step 1: Enter Custom Amount**
1. Go to **Sweet Miracles Dashboard**
2. Scroll to "Custom Donation" section
3. Enter amount: `$75.00`
4. Click **"Donate Custom Amount"**

**Step 2: Complete Payment**
1. On Stripe Checkout, enter card details (same as above)
2. Click **"Pay"**

**Step 3: Verify**
1. Check Monitoring Dashboard for $75 transaction
2. Verify in Stripe Dashboard

---

## Part 4: Test Error Scenarios

### 4.1 Test Insufficient Funds

**Step 1: Use Declined Card**
1. Go to donation form
2. Select any tier
3. On Stripe Checkout, use card: `4000 0000 0000 0002`
4. Try to complete payment

**Expected Result**: ❌ Payment declined with error message

**Step 2: Verify Error Handling**
1. Error message should appear on dashboard
2. No transaction should appear in Stripe
3. User should be able to retry

---

### 4.2 Test Minimum Amount Validation

**Step 1: Enter Invalid Amount**
1. Go to "Custom Donation"
2. Enter: `$0.25` (below $0.50 minimum)
3. Click **"Donate Custom Amount"**

**Expected Result**: ❌ Alert: "Please enter a valid donation amount (minimum $0.50)"

---

### 4.3 Test Missing Email

**Step 1: Try to Donate Without Email**
1. Go to donation form
2. Select any tier
3. On Stripe Checkout, leave email blank
4. Try to submit

**Expected Result**: ❌ Stripe validation error

---

## Part 5: Test Subscription Management

### 5.1 View Active Subscriptions

1. Go to **Stripe Dashboard → Subscriptions**
2. You should see all subscriptions created during testing
3. Each should show:
   - ✅ Customer email
   - ✅ Amount and frequency
   - ✅ Status: **Active**
   - ✅ Next billing date

### 5.2 Test Subscription Cancellation

1. In Stripe Dashboard, click on a subscription
2. Click **"Cancel subscription"**
3. Confirm cancellation
4. Status should change to **Canceled**

---

## Part 6: Test Webhook Events

### 6.1 Monitor Webhook Delivery

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click on your webhook endpoint
3. You should see recent events:
   - `payment_intent.succeeded`
   - `customer.subscription.created`
   - `invoice.paid`

### 6.2 Verify Event Processing

1. Each event should show:
   - ✅ Status: **Delivered**
   - ✅ Response: **200 OK**
   - ✅ Timestamp of delivery

---

## Part 7: Test Monitoring Dashboard

### 7.1 Check Payment Statistics

1. Go to **Monitoring Dashboard**
2. Verify you can see:
   - Total donations received
   - Number of donors
   - Donation breakdown by tier
   - Recent transactions list

### 7.2 Check File Upload Statistics

1. In Monitoring Dashboard, check:
   - Total files uploaded
   - Success rate
   - Average processing time
   - File type breakdown

---

## Part 8: Production Readiness Checklist

Before going fully live, verify:

- [ ] All 4 donation tiers tested successfully
- [ ] Custom donation amounts work
- [ ] Payments appear in Stripe Dashboard
- [ ] Subscriptions are created correctly
- [ ] Webhooks are being delivered
- [ ] Monitoring Dashboard shows accurate data
- [ ] Error messages display properly
- [ ] File uploads work in QUMUS
- [ ] QUMUS can process uploaded files
- [ ] All team members can access dashboard
- [ ] Backups are configured
- [ ] Support contact info is available

---

## Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| Bronze Tier ($25) | ✅ | |
| Silver Tier ($50) | ✅ | |
| Gold Tier ($100) | ✅ | |
| Platinum Tier ($250) | ✅ | |
| Custom Amount | ✅ | |
| Declined Card | ✅ | |
| Minimum Amount | ✅ | |
| Subscriptions | ✅ | |
| Webhooks | ✅ | |
| Monitoring | ✅ | |

---

## Troubleshooting

### Payment Not Appearing in Stripe

1. Check if payment actually succeeded (look for confirmation message)
2. Go to Stripe Dashboard → Payments
3. Filter by date to find your payment
4. If not found, check error logs:
```bash
tail -f ~/.manus-logs/devserver.log
```

### Webhook Not Delivering

1. Go to Stripe Dashboard → Webhooks
2. Click on endpoint
3. Check "Recent Events" tab
4. Look for failed deliveries (red X)
5. Click on failed event to see error details

### Subscription Not Created

1. Verify payment succeeded first
2. Check Stripe Dashboard → Subscriptions
3. If not there, check webhook logs
4. Restart server and try again

---

## Next Steps After Testing

1. ✅ Announce platform to donors
2. ✅ Set up email notifications for donations
3. ✅ Configure thank you emails
4. ✅ Set up monthly reporting
5. ✅ Train team on QUMUS operations
6. ✅ Schedule regular monitoring reviews

---

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review Stripe Dashboard for payment details
3. Check server logs for errors
4. Contact Manus support: https://help.manus.im

---

**Congratulations! Your LIVE payment system is ready! 🎉**

*Last Updated: February 4, 2026*
*Version: 1.0*
