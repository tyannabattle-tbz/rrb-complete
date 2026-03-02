# Mac Mini Deployment & Setup Guide

**Sweet Miracles NPO - Autonomous Fundraising Platform**

---

## Overview

This guide walks you through setting up the complete Sweet Miracles platform on your Mac Mini. The platform includes:

- **QUMUS**: Autonomous orchestration engine for managing all operations
- **Master Dashboard**: Unified control center for all platforms
- **Stripe Integration**: LIVE payment processing for donations
- **File Upload System**: Support for documents, images, and audio
- **Real-time Monitoring**: Track all system activity and metrics

---

## Prerequisites

**Mac Mini Specifications:**
- Mac Mini (500GB SSD, Intel Core i5, 4GB RAM)
- macOS 11 or later
- Internet connection (WiFi or Ethernet)
- ~50GB free disk space

**What You'll Need:**
- Terminal (built-in on Mac)
- Your Stripe LIVE API keys (already obtained)
- Your Manus account credentials

---

## Step 1: Initial Mac Setup (5 minutes)

### 1.1 Turn On Your Mac Mini

1. Connect power cable
2. Connect to internet (WiFi or Ethernet)
3. Go through initial macOS setup
4. Create your user account

### 1.2 Open Terminal

1. Press **Cmd + Space** to open Spotlight
2. Type "Terminal"
3. Press **Enter**

A terminal window will open. You're ready to proceed!

---

## Step 2: Automated Setup (20-30 minutes)

### 2.1 Run the Setup Script

Copy and paste this command into Terminal and press Enter:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/manus-agent-web/scripts/main/mac-mini-setup.sh)"
```

This script will automatically:
- ✅ Install Node.js and pnpm
- ✅ Install Git
- ✅ Clone the Sweet Miracles repository
- ✅ Install all dependencies
- ✅ Configure environment variables
- ✅ Set up the database
- ✅ Start the development server

### 2.2 Monitor the Installation

The script will show progress messages. Watch for:
- "Installing Node.js..." → "Node.js installed ✓"
- "Installing dependencies..." → "Dependencies installed ✓"
- "Starting server..." → "Server running at http://localhost:3000"

**If you see any errors**, note them and contact support.

---

## Step 3: Access Your Dashboard (5 minutes)

### 3.1 Open Your Browser

1. Open Safari, Chrome, or Firefox
2. Go to: **http://localhost:3000**

### 3.2 Log In

1. Click "Login" or "Sign In"
2. Enter your Manus credentials
3. You'll see the **Master Dashboard** with QUMUS

### 3.3 Verify Everything Works

You should see:
- ✅ QUMUS chat interface with file upload button
- ✅ Navigation to all platforms
- ✅ Real-time monitoring dashboard
- ✅ Donation form with Stripe integration

---

## Step 4: Configure Stripe LIVE Keys (5 minutes)

### 4.1 Add Your LIVE Keys

1. In the Master Dashboard, go to **Settings → Payment**
2. Toggle to **"Live Mode"**
3. Paste your LIVE keys:
   - **Secret Key**: `sk_live_...`
   - **Publishable Key**: `pk_live_...`
4. Click **Save**

### 4.2 Verify Stripe Connection

1. Go to **Monitoring Dashboard**
2. Look for "Stripe Status: Connected ✓"
3. You should see "Mode: LIVE"

---

## Step 5: Test Donation Flow (10 minutes)

### 5.1 Create a Test Donation

1. Go to **Sweet Miracles Dashboard**
2. Click on a donation tier (e.g., "Bronze - $25")
3. You'll be redirected to Stripe checkout
4. Use test card: **4242 4242 4242 4242**
5. Expiry: Any future date
6. CVC: Any 3 digits
7. Complete the payment

### 5.2 Verify Payment

1. Go back to Master Dashboard
2. Check **Monitoring Dashboard**
3. You should see the payment in "Recent Transactions"
4. Stripe should show the payment in your account

---

## Step 6: File Upload Testing (5 minutes)

### 6.1 Test File Upload in QUMUS

1. Go to **QUMUS Chat**
2. Click the **"Upload"** button
3. Select a file (PDF, image, or audio)
4. Drag and drop or click to upload
5. Watch the progress bar

### 6.2 Verify Processing

1. Go to **Monitoring Dashboard**
2. Check "File Upload Statistics"
3. You should see your uploaded file listed
4. Status should show "Processing" or "Complete"

---

## Step 7: Daily Operations

### 7.1 Starting the Server

If you restart your Mac, the server won't start automatically. To restart:

1. Open Terminal
2. Run:
```bash
cd ~/manus-agent-web && pnpm dev
```

3. Wait for "Server running at http://localhost:3000"
4. Open browser to http://localhost:3000

### 7.2 Monitoring Dashboard

Check the **Monitoring Dashboard** daily to see:
- Total donations received
- Active donors
- File uploads processed
- System health metrics
- Any errors or warnings

### 7.3 QUMUS Commands

In QUMUS chat, you can ask:
- "Show me today's donations"
- "What files were uploaded?"
- "System status"
- "Process this audio file"
- "Generate a report"

---

## Troubleshooting

### Server Won't Start

**Problem**: "Command not found: pnpm"

**Solution**:
```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

Then restart Terminal and try again.

---

### Can't Connect to Stripe

**Problem**: "Stripe connection failed"

**Solution**:
1. Verify your LIVE keys are correct
2. Go to Settings → Payment
3. Check "Mode: LIVE" is enabled
4. Restart the server:
```bash
cd ~/manus-agent-web && pnpm dev
```

---

### File Upload Not Working

**Problem**: "Upload button not appearing"

**Solution**:
1. Refresh your browser (Cmd + R)
2. Clear browser cache (Cmd + Shift + Delete)
3. Restart the server

---

### Database Issues

**Problem**: "Database connection error"

**Solution**:
```bash
cd ~/manus-agent-web
pnpm db:push
```

This will reset and reinitialize the database.

---

## Advanced: Remote Access

To access your Mac Mini from another computer:

### 7.1 Enable Remote Desktop

1. System Preferences → Sharing
2. Check "Remote Management"
3. Allow access for your user

### 7.2 Access from Another Mac

1. Open "Screen Sharing" on another Mac
2. Enter your Mac Mini's IP address
3. Enter your credentials

### 7.3 Access from Windows

1. Download "Microsoft Remote Desktop" from App Store
2. Add connection with Mac Mini's IP
3. Connect and enter credentials

---

## Maintenance

### Weekly

- Check Monitoring Dashboard for errors
- Verify Stripe payments are processing
- Monitor file uploads

### Monthly

- Update dependencies:
```bash
cd ~/manus-agent-web && pnpm update
```

- Review system logs:
```bash
cd ~/manus-agent-web && tail -f .manus-logs/devserver.log
```

### Quarterly

- Backup your database
- Review and archive old logs
- Test disaster recovery

---

## Support & Resources

**Need Help?**

1. Check the troubleshooting section above
2. Review QUMUS logs: **Monitoring Dashboard → Logs**
3. Contact Manus support: https://help.manus.im
4. Check Stripe dashboard for payment issues

**Useful Commands**:

```bash
# Start server
cd ~/manus-agent-web && pnpm dev

# Run tests
cd ~/manus-agent-web && pnpm test

# Check logs
tail -f ~/.manus-logs/devserver.log

# Update dependencies
cd ~/manus-agent-web && pnpm update

# Reset database
cd ~/manus-agent-web && pnpm db:push
```

---

## Next Steps

1. ✅ Complete setup on Mac Mini
2. ✅ Test donation flow with Stripe
3. ✅ Verify file uploads work
4. ✅ Set up daily monitoring routine
5. ✅ Configure backups (optional)
6. ✅ Train team members on QUMUS

---

## Security Best Practices

1. **Never share your Stripe keys** - Keep them private
2. **Use strong passwords** - For your Manus account
3. **Enable backups** - Protect your data
4. **Monitor access logs** - Check who's accessing the system
5. **Keep macOS updated** - Run security updates regularly

---

**Congratulations! Your Sweet Miracles platform is now running on your Mac Mini! 🎉**

For questions or support, contact the Manus team at https://help.manus.im

---

*Last Updated: February 4, 2026*
*Version: 1.0*
