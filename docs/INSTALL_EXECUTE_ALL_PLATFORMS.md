# Install & Execute — All Platforms

**Canryn Production and its subsidiaries**
**Rockin' Rockin' Boogie Ecosystem — v11.6 FINAL**
**Logo designed by Seabrun Candy Hunter**

---

## Quick Start (Any Platform)

```bash
git clone <your-repo-url> rrb-ecosystem
cd rrb-ecosystem
pnpm install
cp .env.example .env
pnpm db:push
pnpm dev
```

## Platform-Specific Instructions

### Linux / Ubuntu / Debian

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm
git clone <your-repo-url> rrb-ecosystem && cd rrb-ecosystem
pnpm install && pnpm db:push && pnpm dev
```

### macOS

```bash
brew install node pnpm
git clone <your-repo-url> rrb-ecosystem && cd rrb-ecosystem
pnpm install && pnpm db:push && pnpm dev
```

### Windows

```powershell
npm install -g pnpm
git clone <your-repo-url> rrb-ecosystem
cd rrb-ecosystem
pnpm install && pnpm db:push && pnpm dev
```

### Docker

```bash
docker build -t rrb-ecosystem .
docker run -p 3000:3000 --env-file .env rrb-ecosystem
```

### Manus Platform (Current)

Click Publish in the Management UI. Platform handles SSL, database, S3, OAuth, and custom domains.

## Required Environment Variables

| Variable | Description |
|----------|-------------|
| DATABASE_URL | MySQL/TiDB connection string |
| JWT_SECRET | Session signing secret |
| STRIPE_SECRET_KEY | Stripe secret key |
| VITE_STRIPE_PUBLISHABLE_KEY | Stripe publishable key |
| STRIPE_WEBHOOK_SECRET | Stripe webhook secret |
| BUILT_IN_FORGE_API_URL | LLM/Storage API URL |
| BUILT_IN_FORGE_API_KEY | API bearer token |

## QUMUS Activation

QUMUS activates automatically on server start. 14 policies at 90% autonomous control.

Verify at: /rrb/qumus/admin, /rrb/ecosystem, /rrb/state-of-studio, /rrb/qumus/command

Human Override: /rrb/qumus/human-review

## Production Checklist

- All environment variables set
- Database schema pushed (pnpm db:push)
- Stripe webhook at /api/stripe/webhook
- QUMUS autonomous loop running
- BMI/SoundExchange registrations (see ROYALTY_COLLECTION_GUIDE.md)
- Test donation with card 4242 4242 4242 4242

*Canryn Production and its subsidiaries. All rights reserved. 2024-2026.*
*A Voice for the Voiceless — Sweet Miracles Foundation (501c/508)*
