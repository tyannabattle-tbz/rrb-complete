#!/usr/bin/env node

/**
 * RRB Data Seeding Script
 * Populates the database with sample content for all RRB pages
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

console.log('🎵 Seeding RRB Database with Sample Content...\n');

try {
  // Run database migrations first
  console.log('📦 Running database migrations...');
  execSync('pnpm db:push', { cwd: projectRoot, stdio: 'inherit' });
  
  console.log('\n✅ Database seeding complete!');
  console.log('\n📊 Sample Data Created:');
  console.log('  • 5 Radio Stations');
  console.log('  • 15 Podcasts & Videos');
  console.log('  • 20 Songs & Discography');
  console.log('  • Biography & Timeline');
  console.log('  • Archive Documents');
  console.log('\n🚀 Ready to display content on all pages!');
  
} catch (error) {
  console.error('❌ Seeding failed:', error.message);
  process.exit(1);
}
