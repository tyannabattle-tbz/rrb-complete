# Deployment and Integration Guide

## Complete Setup for Sweet Miracles NPO Platform

This guide covers deployment, Stripe integration, QUMUS file uploads, and Master Dashboard access.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Stripe Integration](#stripe-integration)
3. [QUMUS File Upload Feature](#qumus-file-upload-feature)
4. [Master Dashboard](#master-dashboard)
5. [Mac Mini Deployment](#mac-mini-deployment)
6. [Production Deployment](#production-deployment)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Quick Start

### For Mac Mini Users

```bash
# 1. Download setup script
curl -O https://your-repo/scripts/mac-mini-setup.sh

# 2. Run setup
bash mac-mini-setup.sh

# 3. Start development server
cd ~/Projects/sweet-miracles-platform
pnpm dev

# 4. Open browser
open http://localhost:3000
```

### For Linux/Windows Users

```bash
# Clone repository
git clone https://github.com/your-org/sweet-miracles-platform.git
cd sweet-miracles-platform

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
nano .env  # Edit with your configuration

# Start server
pnpm dev
```

---

## Stripe Integration

### Account Status: ✅ APPROVED

Your Stripe account has been approved for LIVE payments!

**Account Details:**
- Account ID: `acct_1St9hSRzKOILZyAN`
- Status: LIVE (Production Ready)
- Nonprofit Status: Verified 501(c)(3)

### LIVE API Keys

Your LIVE keys are configured in Manus Settings → Payment:

```
STRIPE_SECRET_KEY: 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
VITE_STRIPE_PUBLISHABLE_KEY: pk_live_51St9hSRzKOILZyAN8FDPi18HPBi62Go2V2g3nGdAZHUNLAMimCG2RXq4dHU5VYr6S6u7xdXpKDFqsHDKT7eznCet00KO5cbeyr
```

### Creating LIVE Products and Prices

#### Step 1: Create Product in Stripe Dashboard

1. Go to https://dashboard.stripe.com
2. Switch to **LIVE mode** (toggle in top right)
3. Navigate to **Products** → **Create product**
4. Fill in details:
   - **Name**: "Sweet Miracles Donation"
   - **Description**: "Support seniors and vulnerable populations"
   - **Type**: Service

#### Step 2: Create Price Tiers

For each tier, click **Add price**:

**Bronze Tier:**
- Amount: $25.00
- Currency: USD
- Billing Period: Monthly
- Price ID: `price_1St9hSRzKOILZyAN...` (copy this)

**Silver Tier:**
- Amount: $50.00
- Currency: USD
- Billing Period: Monthly
- Price ID: `price_1St9hSRzKOILZyAN...` (copy this)

**Gold Tier:**
- Amount: $100.00
- Currency: USD
- Billing Period: Monthly
- Price ID: `price_1St9hSRzKOILZyAN...` (copy this)

**Platinum Tier:**
- Amount: $250.00
- Currency: USD
- Billing Period: Monthly
- Price ID: `price_1St9hSRzKOILZyAN...` (copy this)

#### Step 3: Update Donation Form

In `client/src/pages/SweetMiraclesDashboard.tsx`:

```typescript
// Update price IDs
const DONATION_TIERS = {
  bronze: {
    name: "Bronze",
    amount: 25,
    priceId: "price_1St9hSRzKOILZyAN...", // Replace with your LIVE price ID
  },
  silver: {
    name: "Silver",
    amount: 50,
    priceId: "price_1St9hSRzKOILZyAN...", // Replace with your LIVE price ID
  },
  gold: {
    name: "Gold",
    amount: 100,
    priceId: "price_1St9hSRzKOILZyAN...", // Replace with your LIVE price ID
  },
  platinum: {
    name: "Platinum",
    amount: 250,
    priceId: "price_1St9hSRzKOILZyAN...", // Replace with your LIVE price ID
  },
};

// Update donation handler
const handleDonate = async (tier: string) => {
  const priceId = DONATION_TIERS[tier as keyof typeof DONATION_TIERS]?.priceId;
  
  if (!priceId) {
    toast.error("Invalid donation tier");
    return;
  }

  // Call Stripe checkout
  const { sessionUrl } = await trpc.stripeIntegration.createCheckoutSession.mutate({
    priceId,
    email: user?.email,
    metadata: {
      donationTier: tier,
      organizationId: "sweet-miracles",
    },
  });

  // Redirect to checkout
  window.open(sessionUrl, "_blank");
};
```

### Testing LIVE Payments

```bash
# 1. Use test card (even in LIVE mode, for testing)
Card: 4242 4242 4242 4242
Expiry: 12/25
CVC: 123

# 2. Check payment in Stripe Dashboard
# Navigate to Payments → View all payments
# You should see your test payment

# 3. Check webhook events
# Navigate to Developers → Webhooks
# Verify payment_intent.succeeded event was received
```

### Webhook Configuration

Your webhook is configured at:
```
https://manusweb-eshiamkd.manus.space/api/stripe/webhook
```

**Events to monitor:**
- `payment_intent.succeeded` - Payment completed
- `customer.subscription.created` - Subscription started
- `customer.subscription.updated` - Subscription modified
- `invoice.paid` - Invoice payment received

---

## QUMUS File Upload Feature

### Overview

QUMUS now supports uploading and processing files directly in the chat interface.

**Supported File Types:**
- **Documents** (50MB max): PDF, Word, Excel, PowerPoint, Text
- **Images** (10MB max): JPEG, PNG, GIF, WebP, SVG
- **Audio** (100MB max): MP3, WAV, OGG, WebM, M4A

### API Endpoints

#### Upload File

```typescript
// Upload a file
const result = await trpc.qumusFileUpload.uploadFile.mutate({
  fileName: "document.pdf",
  mimeType: "application/pdf",
  fileSize: 1024,
  base64Data: "JVBERi0xLjQK...", // base64 encoded file
  description: "Optional description"
});

// Response
{
  success: true,
  fileId: "1234567890-abc123",
  metadata: {
    originalName: "document.pdf",
    mimeType: "application/pdf",
    size: 1024,
    fileType: "document",
    s3Key: "qumus-uploads/123/document/1234567890-abc123.pdf",
    s3Url: "https://storage.example.com/...",
    uploadedAt: 1707062400000
  },
  s3Url: "https://storage.example.com/..."
}
```

#### Validate File

```typescript
// Validate before upload
const validation = await trpc.qumusFileUpload.validateFile.query({
  fileName: "document.pdf",
  mimeType: "application/pdf",
  fileSize: 1024
});

// Response
{
  isValid: true,
  errors: [],
  fileType: "document"
}
```

#### Process File

```typescript
// Initiate file processing (transcription, OCR, etc.)
const processing = await trpc.qumusFileUpload.processFile.mutate({
  s3Key: "qumus-uploads/123/document/1234567890-abc123.pdf",
  fileType: "document",
  processingType: "ocr" // or "transcribe", "analyze", "extract"
});

// Response
{
  success: true,
  processingType: "ocr",
  fileType: "document",
  status: "processing",
  message: "File processing initiated for ocr"
}
```

#### Get Upload Limits

```typescript
// Get file upload limits
const limits = await trpc.qumusFileUpload.getUploadLimits.query();

// Response
{
  documents: {
    maxSize: 52428800,
    maxSizeMB: 50,
    supportedTypes: ["application/pdf", ...]
  },
  images: {
    maxSize: 10485760,
    maxSizeMB: 10,
    supportedTypes: ["image/jpeg", ...]
  },
  audio: {
    maxSize: 104857600,
    maxSizeMB: 100,
    supportedTypes: ["audio/mpeg", ...]
  }
}
```

### Frontend Implementation

```typescript
// React component for file upload
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export function FileUploadComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const uploadMutation = trpc.qumusFileUpload.uploadFile.useMutation();

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      // Validate file
      const validation = await trpc.qumusFileUpload.validateFile.query({
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      });

      if (!validation.isValid) {
        console.error("Validation errors:", validation.errors);
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = (e.target?.result as string).split(",")[1];

        // Upload file
        const result = await uploadMutation.mutateAsync({
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          base64Data,
          description: "File uploaded from QUMUS",
        });

        console.log("Upload successful:", result);

        // Optionally process the file
        if (validation.fileType === "audio") {
          await trpc.qumusFileUpload.processFile.mutate({
            s3Key: result.metadata.s3Key,
            fileType: "audio",
            processingType: "transcribe",
          });
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        accept=".pdf,.doc,.docx,.jpg,.png,.mp3,.wav"
      />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {uploading ? "Uploading..." : "Upload File"}
      </button>
    </div>
  );
}
```

---

## Master Dashboard

### Accessing the Dashboard

**Local Access:**
```
http://localhost:3000
```

**Network Access (from other devices on same network):**
```
http://192.168.1.100:3000  # Replace with your Mac's IP
```

**Remote Access (from anywhere):**
```
https://3000-iicnzs2r1pdjnx0fhvo1v-1b0a60d8.us2.manus.computer
```

### Dashboard Sections

#### 1. QUMUS Orchestration Engine

- **Real-time Status**: Monitor agent operations
- **Decision Policies**: Configure autonomous decision-making
- **Service Integrations**: Manage 11+ service integrations
- **Operational Logs**: View detailed operation logs

#### 2. Chat Interface

- **Direct Communication**: Chat with QUMUS
- **File Upload**: Upload documents, images, audio
- **Session Management**: Create and manage sessions
- **Real-time Streaming**: See responses as they're generated

#### 3. Analytics Dashboard

- **Performance Metrics**: Track system performance
- **Usage Statistics**: Monitor usage patterns
- **Cost Tracking**: Track operational costs
- **Operational Insights**: Get actionable insights

#### 4. File Management

- **Upload Files**: Upload documents, images, audio
- **View Uploads**: Browse uploaded files
- **Process Files**: Initiate transcription, OCR, analysis
- **Download Files**: Access processed results

### Dashboard Features

**Session Management:**
- Create new sessions
- View session history
- Export sessions
- Share sessions with team

**Real-time Updates:**
- Live agent status
- Streaming responses
- Real-time notifications
- Activity feeds

**Advanced Features:**
- Custom dashboards
- Scheduled reports
- Webhook integrations
- API access

---

## Mac Mini Deployment

### Automated Setup

```bash
# 1. Run setup script
bash scripts/mac-mini-setup.sh

# 2. Follow prompts to install:
#    - Xcode Command Line Tools
#    - Homebrew
#    - Node.js
#    - pnpm
#    - Git
#    - Optional: Stripe CLI, PM2

# 3. Start development server
pnpm dev

# 4. Access dashboard
open http://localhost:3000
```

### Manual Setup

See `MAC_MINI_SETUP_GUIDE.md` for detailed manual setup instructions.

### Keep Running 24/7

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start "pnpm dev" --name "sweet-miracles"

# View logs
pm2 logs sweet-miracles

# Set to restart on boot
pm2 startup
pm2 save
```

---

## Production Deployment

### Option 1: Manus Built-in Deployment (Recommended)

```bash
# 1. Create checkpoint
pnpm webdev:checkpoint "Production deployment"

# 2. Click "Publish" button in Manus Management UI
# 3. Your app will be deployed to production
# 4. Access at: https://your-domain.manus.space
```

### Option 2: Docker Deployment

```bash
# Build Docker image
docker build -t sweet-miracles .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://..." \
  -e STRIPE_SECRET_KEY="sk_live_..." \
  sweet-miracles

# Or use Docker Compose
docker-compose up -d
```

### Option 3: Traditional Server Deployment

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Or use PM2
pm2 start "pnpm start" --name "sweet-miracles-prod"
```

### Environment Variables for Production

```bash
# Database
DATABASE_URL=mysql://user:password@prod-db.example.com:3306/sweet_miracles

# Stripe (LIVE keys)
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Manus OAuth
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# JWT
JWT_SECRET=your-secure-random-secret

# Domain
VITE_APP_TITLE=Sweet Miracles NPO
VITE_APP_LOGO=https://cdn.example.com/logo.png
```

---

## Monitoring and Maintenance

### Daily Checks

```bash
# Check server status
pm2 status

# View recent logs
pm2 logs sweet-miracles --lines 50

# Monitor resource usage
top -l 1 | grep "sweet-miracles"
```

### Weekly Maintenance

```bash
# Update dependencies
pnpm update

# Run tests
pnpm test

# Security audit
pnpm audit

# Database optimization
pnpm db:optimize
```

### Monthly Tasks

```bash
# Backup database
mysqldump -u root -p sweet_miracles > backup_$(date +%Y%m%d).sql

# Backup project files
tar -czf backup_$(date +%Y%m%d).tar.gz ~/Projects/sweet-miracles-platform

# Review logs
tail -f ~/.pm2/logs/sweet-miracles-out.log

# Update system
softwareupdate -a -i
brew update && brew upgrade
```

### Monitoring Tools

**PM2 Monitoring:**
```bash
# Install PM2 Plus (optional)
pm2 plus

# View real-time monitoring dashboard
pm2 web
# Access at http://localhost:9615
```

**Database Monitoring:**
```bash
# Check database size
mysql -u root -p -e "SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb FROM information_schema.tables WHERE table_schema = 'sweet_miracles';"

# Optimize tables
pnpm db:optimize
```

---

## Troubleshooting

### Payment Issues

```bash
# Check Stripe webhook logs
stripe logs tail

# Verify webhook endpoint
curl -X POST https://your-domain/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"test"}'

# Check payment intent status
stripe payment_intents list
```

### File Upload Issues

```bash
# Check S3 connectivity
curl -I https://storage.example.com

# Verify file size limits
pnpm test -- server/routers/qumusFileUpload.test.ts

# Check file permissions
ls -la ~/Projects/sweet-miracles-platform/uploads/
```

### Database Issues

```bash
# Check database connection
mysql -u root -p sweet_miracles -e "SELECT 1"

# Check database size
du -sh /var/lib/mysql/sweet_miracles

# Repair tables
pnpm db:repair
```

---

## Support

- **Manus Support**: https://help.manus.im
- **Stripe Support**: https://support.stripe.com
- **Documentation**: See README.md and other guides

---

## Checklist

- [ ] Stripe account approved and LIVE keys configured
- [ ] LIVE donation product and prices created in Stripe
- [ ] Donation form updated with LIVE price IDs
- [ ] QUMUS file upload feature tested
- [ ] Master Dashboard accessible locally
- [ ] Mac Mini setup completed
- [ ] Production deployment configured
- [ ] Monitoring and alerts set up
- [ ] Backups scheduled
- [ ] Team trained on platform usage

**You're ready to launch Sweet Miracles NPO platform!** 🚀
