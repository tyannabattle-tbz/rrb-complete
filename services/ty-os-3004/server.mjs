#!/usr/bin/env node
/**
 * Ty OS — Port 3004
 * Personal operating system interface for Ty Bat Zan.
 * Dashboard, task management, AI assistant, ecosystem control,
 * and cross-service orchestration hub.
 * 
 * © Canryn Production and its subsidiaries. All rights reserved.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.TYOS_PORT || 3004;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/api/health', (req, res) => {
  res.json({
    service: 'Ty OS',
    port: PORT,
    status: 'operational',
    user: 'Ty Bat Zan',
    mode: 'command-center',
    connectedServices: 4,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Ty OS Dashboard API
app.get('/api/tyos/dashboard', (req, res) => {
  res.json({
    user: 'Ty Bat Zan',
    role: 'Ecosystem Commander',
    quickActions: [
      { id: 'qumus', label: 'QUMUS Control', url: 'http://localhost:3001', icon: '⚡' },
      { id: 'rrb', label: 'RRB Studio', url: 'http://localhost:3002', icon: '🎵' },
      { id: 'hybridcast', label: 'HybridCast', url: 'http://localhost:3003', icon: '🚨' },
      { id: 'main', label: 'Main App', url: 'http://localhost:3000', icon: '🌐' },
    ],
    recentActivity: [
      { action: 'QUMUS health check', time: new Date().toISOString(), status: 'success' },
      { action: 'RRB broadcast scheduled', time: new Date(Date.now() - 3600000).toISOString(), status: 'success' },
      { action: 'HybridCast mesh test', time: new Date(Date.now() - 7200000).toISOString(), status: 'success' },
    ],
    systemMetrics: {
      servicesOnline: 4,
      totalChannels: 54,
      activePolicies: 14,
      autonomyLevel: '90%',
    },
  });
});

// Ty OS Command execution
app.post('/api/tyos/command', (req, res) => {
  const { command, target } = req.body;
  console.log(`[Ty OS] Command: ${command} → Target: ${target || 'all'}`);
  res.json({
    success: true,
    command,
    target: target || 'all',
    executedAt: new Date().toISOString(),
    result: `Command "${command}" dispatched to ${target || 'all services'}`,
  });
});

// Cross-service health aggregator
app.get('/api/tyos/ecosystem-health', async (req, res) => {
  const services = [
    { name: 'QUMUS', port: 3001 },
    { name: 'RRB', port: 3002 },
    { name: 'HybridCast', port: 3003 },
    { name: 'Ty OS', port: 3004 },
  ];

  const results = await Promise.all(
    services.map(async (svc) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const resp = await fetch(`http://localhost:${svc.port}/api/health`, { signal: controller.signal });
        clearTimeout(timeout);
        const data = await resp.json();
        return { ...svc, status: 'online', data };
      } catch {
        return { ...svc, status: svc.port === PORT ? 'online' : 'offline', data: null };
      }
    })
  );

  res.json({
    ecosystem: 'Canryn Production',
    checkedAt: new Date().toISOString(),
    services: results,
    summary: {
      online: results.filter(r => r.status === 'online').length,
      offline: results.filter(r => r.status === 'offline').length,
      total: results.length,
    },
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🖥️  Ty OS running on http://localhost:${PORT}`);
  console.log(`   Service: Personal Operating System`);
  console.log(`   User: Ty Bat Zan | Role: Ecosystem Commander`);
  console.log(`   Connected Services: QUMUS (3001), RRB (3002), HybridCast (3003)`);
  console.log(`   © Canryn Production and its subsidiaries\n`);
});
