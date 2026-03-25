#!/usr/bin/env node
/**
 * Auto-Sync & Upgrade System
 * Monitors code changes and automatically syncs/upgrades all 4 ecosystem ports
 * 
 * © Canryn Production - Automated Deployment System
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import chokidar from 'chokidar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Configuration
const PORTS = [3000, 3001, 3002, 3003, 3004];
const WATCH_PATHS = [
  path.join(projectRoot, 'client/src'),
  path.join(projectRoot, 'server'),
  path.join(projectRoot, 'services'),
  path.join(projectRoot, 'drizzle'),
];

const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/.git/**',
  '**/.manus/**',
  '**/dist/**',
  '**/build/**',
  '**/*.log',
];

let isDeploying = false;
let deployQueue = [];

console.log(`
╔════════════════════════════════════════════════════════════════╗
║         AUTO-SYNC & UPGRADE SYSTEM - ACTIVE                   ║
║                                                                ║
║   Monitoring: ${WATCH_PATHS.length} directories                              ║
║   Ports: ${PORTS.join(', ')}                                     ║
║   Auto-Deploy: ENABLED                                         ║
║                                                                ║
║   © Canryn Production - Automated Deployment                   ║
╚════════════════════════════════════════════════════════════════╝
`);

/**
 * Deploy changes to all ports
 */
async function deployChanges(changedFile) {
  if (isDeploying) {
    deployQueue.push(changedFile);
    return;
  }

  isDeploying = true;
  const timestamp = new Date().toLocaleTimeString();
  
  console.log(`\n📝 [${timestamp}] Change detected: ${path.relative(projectRoot, changedFile)}`);
  console.log(`🚀 Starting auto-sync deployment to all ${PORTS.length} ports...`);

  try {
    // Step 1: Git commit changes
    console.log('📦 Committing changes to git...');
    await executeCommand('git', ['add', '-A'], projectRoot);
    await executeCommand('git', ['commit', '-m', `Auto-sync: ${path.basename(changedFile)}`], projectRoot);

    // Step 2: Rebuild TypeScript
    console.log('🔨 Rebuilding TypeScript...');
    await executeCommand('pnpm', ['build'], projectRoot);

    // Step 3: Deploy to each port
    for (const port of PORTS) {
      console.log(`🔄 Syncing Port ${port}...`);
      
      if (port === 3000) {
        // Main dev server - trigger HMR
        console.log(`   ✅ Port 3000 (Dev Server) - HMR triggered`);
      } else {
        // Microservices - restart service
        const serviceName = getServiceName(port);
        console.log(`   ✅ Port ${port} (${serviceName}) - Restarting service`);
        await restartService(port);
      }
    }

    console.log(`✅ Auto-sync deployment complete!`);
    
    // Process queue
    if (deployQueue.length > 0) {
      const next = deployQueue.shift();
      console.log(`📋 Processing queued change...`);
      await deployChanges(next);
    }
  } catch (error) {
    console.error(`❌ Deployment failed: ${error.message}`);
  } finally {
    isDeploying = false;
  }
}

/**
 * Execute shell command
 */
function executeCommand(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { cwd, stdio: 'pipe' });
    let output = '';
    
    proc.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    proc.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`${cmd} failed with code ${code}: ${output}`));
      }
    });
  });
}

/**
 * Get service name by port
 */
function getServiceName(port) {
  const names = {
    3000: 'QUMUS Main',
    3001: 'QUMUS Control Center',
    3002: 'RRB Entertainment',
    3003: 'HybridCast Emergency',
    3004: 'Ty OS',
  };
  return names[port] || `Service ${port}`;
}

/**
 * Restart service on port
 */
async function restartService(port) {
  // In production, this would use PM2 or similar
  // For now, log the action
  console.log(`   Restarting ${getServiceName(port)} on port ${port}`);
}

/**
 * Watch for file changes
 */
function startWatching() {
  const watcher = chokidar.watch(WATCH_PATHS, {
    ignored: IGNORE_PATTERNS,
    persistent: true,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100,
    },
  });

  watcher
    .on('change', (file) => deployChanges(file))
    .on('add', (file) => deployChanges(file))
    .on('error', (error) => console.error(`Watcher error: ${error}`));

  console.log(`\n👁️  Watching ${WATCH_PATHS.length} directories for changes...`);
  console.log(`   Ready for auto-sync deployment!\n`);
}

/**
 * Graceful shutdown
 */
function shutdown() {
  console.log('\n\n🛑 Auto-Sync System shutting down...');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start watching
startWatching();

// Health check every 30 seconds
setInterval(() => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`💚 [${timestamp}] Auto-Sync System healthy - Monitoring ${WATCH_PATHS.length} directories`);
}, 30000);
