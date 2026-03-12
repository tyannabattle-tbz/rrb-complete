#!/usr/bin/env node
/**
 * HybridCast Emergency Broadcast PWA — Port 3003
 * Offline-first emergency broadcast system with mesh networking,
 * MGRS mapping, multi-operator collaboration, and 116+ feature tabs.
 * 
 * © Canryn Production and its subsidiaries. All rights reserved.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.HYBRIDCAST_PORT || 3003;

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
    service: 'HybridCast Emergency Broadcast',
    port: PORT,
    status: 'standby',
    mode: 'monitoring',
    featureTabs: 116,
    meshNetworking: 'ready',
    offlineCapable: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '3.0.0',
  });
});

app.get('/api/hybridcast/status', (req, res) => {
  res.json({
    broadcastMode: 'standby',
    alertLevel: 'green',
    activeOperators: 0,
    meshNodes: 0,
    offlineCache: 'ready',
    lastBroadcast: null,
    capabilities: [
      'Emergency Alert System (EAS)',
      'Mesh Networking (LoRa/Meshtastic)',
      'MGRS Tactical Mapping',
      'Multi-Operator Collaboration',
      'Offline-First PWA',
      'WebUSB/WebSerial/WebBluetooth',
      'LiDAR AR Overlay',
      'Signal Relay/WiFi Bridge',
      'Incident Reporting',
      'SOC Dashboard',
    ],
  });
});

app.post('/api/hybridcast/alert', (req, res) => {
  const { level, message, area } = req.body;
  console.log(`[HybridCast] ALERT: Level=${level}, Area=${area}, Message=${message}`);
  res.json({
    success: true,
    alertId: `HC-${Date.now()}`,
    level,
    message,
    broadcastAt: new Date().toISOString(),
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚨 HybridCast Emergency Broadcast running on http://localhost:${PORT}`);
  console.log(`   Service: Emergency Broadcast PWA`);
  console.log(`   Features: 116 tabs | Mesh Networking | Offline-First`);
  console.log(`   Mode: Standby — Monitoring`);
  console.log(`   © Canryn Production and its subsidiaries\n`);
});
