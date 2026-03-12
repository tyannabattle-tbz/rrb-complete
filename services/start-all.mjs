#!/usr/bin/env node
/**
 * Canryn Production Ecosystem — Start All Services
 * Launches all 4 micro-services simultaneously:
 *   Port 3001: QUMUS Control Center
 *   Port 3002: Rockin' Rockin' Boogie
 *   Port 3003: HybridCast Emergency Broadcast
 *   Port 3004: Ty OS
 * 
 * © Canryn Production and its subsidiaries. All rights reserved.
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const services = [
  { name: 'QUMUS',     port: 3001, script: 'qumus-3001/server.mjs',     color: '\x1b[35m' }, // purple
  { name: 'RRB',       port: 3002, script: 'rrb-3002/server.mjs',       color: '\x1b[33m' }, // yellow
  { name: 'HybridCast',port: 3003, script: 'hybridcast-3003/server.mjs',color: '\x1b[31m' }, // red
  { name: 'Ty OS',     port: 3004, script: 'ty-os-3004/server.mjs',     color: '\x1b[34m' }, // blue
];

const reset = '\x1b[0m';

console.log(`
╔══════════════════════════════════════════════════════════════╗
║           CANRYN PRODUCTION ECOSYSTEM LAUNCHER              ║
║                                                              ║
║   ⚡ QUMUS Control Center ............ http://localhost:3001  ║
║   🎵 Rockin' Rockin' Boogie ......... http://localhost:3002  ║
║   🚨 HybridCast Emergency .......... http://localhost:3003  ║
║   🖥️  Ty OS ......................... http://localhost:3004  ║
║                                                              ║
║   © Canryn Production and its subsidiaries                   ║
╚══════════════════════════════════════════════════════════════╝
`);

const processes = [];

for (const svc of services) {
  const proc = spawn('node', [path.join(__dirname, svc.script)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  proc.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\\n');
    lines.forEach(line => {
      console.log(`${svc.color}[${svc.name}:${svc.port}]${reset} ${line}`);
    });
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\\n');
    lines.forEach(line => {
      console.error(`${svc.color}[${svc.name}:${svc.port}]${reset} \x1b[31m${line}${reset}`);
    });
  });

  proc.on('exit', (code) => {
    console.log(`${svc.color}[${svc.name}:${svc.port}]${reset} Process exited with code ${code}`);
  });

  processes.push({ ...svc, proc });
}

// Graceful shutdown
function shutdown() {
  console.log('\\n🛑 Shutting down all services...');
  processes.forEach(({ name, port, proc }) => {
    console.log(`   Stopping ${name} (:${port})...`);
    proc.kill('SIGTERM');
  });
  setTimeout(() => {
    console.log('   All services stopped. Goodbye!');
    process.exit(0);
  }, 2000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('All services launching... Press Ctrl+C to stop all.\\n');
