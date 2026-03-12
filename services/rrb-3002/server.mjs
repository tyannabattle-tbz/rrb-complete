#!/usr/bin/env node
/**
 * Rockin' Rockin' Boogie (RRB) — Port 3002
 * Entertainment hub: 54 channels, 7-channel 24/7 scheduling, AI DJs,
 * healing frequencies, Solbones dice game, merchandise, and more.
 * 
 * © Canryn Production and its subsidiaries. All rights reserved.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.RRB_PORT || 3002;

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
    service: 'Rockin\' Rockin\' Boogie',
    port: PORT,
    status: 'operational',
    channels: 54,
    aiDJs: ['Valanna', 'Candy', 'DJ Harmony', 'MC Rhythm'],
    broadcastChannels: 7,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  });
});

app.get('/api/rrb/channels', (req, res) => {
  res.json({
    total: 54,
    categories: [
      { name: 'Music', count: 12, genres: ['Gospel', 'R&B', 'Jazz', 'Blues', 'Hip-Hop', 'Classical'] },
      { name: 'Talk Radio', count: 8, shows: ['Morning Motivation', 'Community Voice', 'Tech Talk'] },
      { name: 'Healing Frequencies', count: 7, frequencies: ['396Hz', '417Hz', '528Hz', '639Hz', '741Hz', '852Hz', '963Hz'] },
      { name: 'Podcast', count: 10, featured: ['GRITS & GREENS', 'Building the Bridge'] },
      { name: 'Live Events', count: 5, upcoming: ['SQUADD Strategy Session', 'Community Town Hall'] },
      { name: 'Education', count: 6, topics: ['Financial Literacy', 'Health & Wellness', 'History'] },
      { name: 'Entertainment', count: 6, features: ['Solbones Dice', 'Trivia Night', 'Story Time'] },
    ],
  });
});

app.get('/api/rrb/schedule', (req, res) => {
  res.json({
    broadcastChannels: 7,
    schedule: 'Automated 24/7 via QUMUS',
    nextBroadcast: new Date(Date.now() + 3600000).toISOString(),
    currentlyPlaying: {
      channel: 'RRB Main',
      show: 'Healing Frequencies — 528Hz Love Frequency',
      dj: 'Valanna',
    },
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎵 Rockin' Rockin' Boogie running on http://localhost:${PORT}`);
  console.log(`   Service: RRB Entertainment Hub`);
  console.log(`   Channels: 54 | AI DJs: 4 | Broadcast: 7-channel 24/7`);
  console.log(`   © Canryn Production and its subsidiaries\n`);
});
