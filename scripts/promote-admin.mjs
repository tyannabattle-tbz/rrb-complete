#!/usr/bin/env node

/**
 * Admin User Promotion Script
 * Promotes a user to admin role in the database
 * 
 * Usage: node scripts/promote-admin.mjs <user-id>
 * Example: node scripts/promote-admin.mjs user-123
 */

import { db } from '../server/db.js';
import { users } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';

const userId = process.argv[2];

if (!userId) {
  console.error('❌ Error: User ID is required');
  console.error('Usage: node scripts/promote-admin.mjs <user-id>');
  console.error('Example: node scripts/promote-admin.mjs user-123');
  process.exit(1);
}

async function promoteAdmin() {
  try {
    console.log(`🔄 Promoting user ${userId} to admin...`);

    // Get current user
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!currentUser || currentUser.length === 0) {
      console.error(`❌ Error: User ${userId} not found`);
      process.exit(1);
    }

    const user = currentUser[0];
    console.log(`📋 Current user: ${user.email}`);
    console.log(`📊 Current role: ${user.role}`);

    // Update role to admin
    await db
      .update(users)
      .set({ role: 'admin' })
      .where(eq(users.id, userId));

    console.log(`✅ Successfully promoted ${user.email} to admin role`);
    console.log(`🎯 User can now access: /admin/dashboard`);
    console.log(`⚙️  Admin features:`);
    console.log(`   - Responder management`);
    console.log(`   - Call queue control`);
    console.log(`   - Transfer approvals`);
    console.log(`   - Real-time analytics`);
    console.log(`   - Emergency broadcasts`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error promoting admin:', error);
    process.exit(1);
  }
}

promoteAdmin();
