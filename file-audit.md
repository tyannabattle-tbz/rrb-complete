# File Upload/Download Audit — Feb 2026

## Cross-Device Sync Architecture

The platform uses **Manus OAuth + JWT cookies** for authentication. When you log in on your Mac Mini, iPhone, or any other device:
- Your **user account** (openId) is the same across all devices
- All **data stored in the database** (MySQL/TiDB) syncs automatically — it's server-side
- All **files stored in S3** are accessible from any device via CDN URLs
- **localStorage data** (like user-uploaded tracks list) does NOT sync between devices

## S3-Backed Upload Paths (Working ✅)

| Component | Upload Path | Storage | Retrieval |
|-----------|-------------|---------|-----------|
| AudioUploadManager | `audio.uploadTrack` → S3 via `storagePut` | S3 + localStorage metadata | CDN URL (plays anywhere) |
| QUMUS File Upload | `qumusFileUpload.uploadFile` → S3 via `storagePut` | S3 + DB metadata | `storageGet` presigned URL |
| Image Generation | `imageGeneration.ts` → S3 via `storagePut` | S3 | CDN URL |
| Reports Service | `reportsService.ts` → S3 via `storagePut` | S3 | CDN URL |
| Text-to-Speech | `textToSpeech.ts` → S3 via `storagePut` | S3 | CDN URL |
| Video Production | `videoProductionService.ts` → S3 via `storagePut` | S3 | CDN URL |
| Backup Service | `backupService.ts` → S3 via `storagePut` | S3 | CDN URL |

## Client-Side Only (NOT synced across devices) ⚠️

| Component | Issue | Fix Needed |
|-----------|-------|------------|
| DocumentUpload page | Files stored in React state only, lost on refresh | Need S3 upload |
| AudioUploadManager metadata | Track list in localStorage | Need DB persistence |
| BookKeeping records | Client-side state only | Need DB persistence |

## Download/Export Paths (Working ✅)

| Component | Method | Status |
|-----------|--------|--------|
| ActionLogViewer | CSV export via Blob/createObjectURL | Works (client-side) |
| AdvancedSearch | CSV export via Blob/createObjectURL | Works (client-side) |
| AppHeader | JSON export via Blob/createObjectURL | Works (client-side) |
| BroadcastGenerator | Text export via Blob/createObjectURL | Works (client-side) |
| Analytics Export | CSV/PDF via server-side generation | Works |
| Chat Export | CSV via server-side generation | Works |
| RSS Feeds | XML served directly | Works |
| OPML | XML served directly | Works |

## Placeholder Download URLs (Non-functional) ⚠️

| Component | Issue |
|-----------|-------|
| BatchProcessing | Hardcoded `https://batch-results.s3.amazonaws.com/` URL |
| BillingRouter | Hardcoded `/invoices/inv-1.pdf` URL |
| AudioMusicRouter | Hardcoded `https://storage.example.com/audio/` URL |
| ConversationExport | Hardcoded `https://storage.example.com/exports/` URL |
| FeatureAnalyticsRouter | Hardcoded `https://storage.example.com/reports/` URL |
| ConversationSummaries | Hardcoded `https://api.manus.im/exports/` URL |
| AgentPerformanceMetrics | Hardcoded `https://api.manus.im/metrics/` URL |
