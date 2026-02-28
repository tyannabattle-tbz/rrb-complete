import express, { Express } from 'express';
import { createServer } from 'http';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './routers';
import { createContext } from './routers/_core/context';

/**
 * Multi-port server configuration
 * - Port 3000: Qumus (Orchestration Engine)
 * - Port 3001: RRB (Radio Station)
 * - Port 3002: HybridCast (Emergency Broadcast)
 */

export async function createMultiPortServer() {
  // Qumus Server (Port 3000)
  const qumusApp = express();
  setupQumusServer(qumusApp);

  // RRB Server (Port 3001)
  const rrbApp = express();
  setupRRBServer(rrbApp);

  // HybridCast Server (Port 3002)
  const hybridcastApp = express();
  setupHybridCastServer(hybridcastApp);

  // Start all servers
  const qumusServer = createServer(qumusApp);
  const rrbServer = createServer(rrbApp);
  const hybridcastServer = createServer(hybridcastApp);

  qumusServer.listen(3000, () => {
    console.log('[Qumus] Orchestration Engine running on http://localhost:3000');
  });

  rrbServer.listen(3001, () => {
    console.log('[RRB] Radio Station running on http://localhost:3001');
  });

  hybridcastServer.listen(3002, () => {
    console.log('[HybridCast] Emergency Broadcast running on http://localhost:3002');
  });

  return { qumusServer, rrbServer, hybridcastServer };
}

function setupQumusServer(app: Express) {
  // Qumus-specific middleware
  app.use(express.json());
  app.use(express.static('client/dist'));

  // CORS for cross-port communication
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // tRPC routes
  app.use(
    '/api/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Qumus-specific endpoints
  app.get('/api/qumus/status', (req, res) => {
    res.json({
      system: 'Qumus',
      status: 'online',
      port: 3000,
      role: 'Orchestration Engine',
      autonomyLevel: '90%',
      timestamp: new Date().toISOString(),
    });
  });

  // Command RRB
  app.post('/api/qumus/command/rrb', (req, res) => {
    const { command, payload } = req.body;
    console.log(`[Qumus] Sending command to RRB: ${command}`, payload);
    // Forward to RRB server
    res.json({ success: true, command, target: 'RRB' });
  });

  // Command HybridCast
  app.post('/api/qumus/command/hybridcast', (req, res) => {
    const { command, payload } = req.body;
    console.log(`[Qumus] Sending command to HybridCast: ${command}`, payload);
    // Forward to HybridCast server
    res.json({ success: true, command, target: 'HybridCast' });
  });

  // Fallback to React app
  app.get('*', (req, res) => {
    res.sendFile('client/dist/index.html', { root: process.cwd() });
  });
}

function setupRRBServer(app: Express) {
  // RRB-specific middleware
  app.use(express.json());
  app.use(express.static('client/dist'));

  // CORS for cross-port communication
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // tRPC routes
  app.use(
    '/api/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // RRB-specific endpoints
  app.get('/api/rrb/status', (req, res) => {
    res.json({
      system: 'RRB',
      status: 'online',
      port: 3001,
      role: 'Radio Station',
      listeners: 342,
      currentShow: 'Morning Motivation Mix',
      timestamp: new Date().toISOString(),
    });
  });

  // Receive commands from Qumus
  app.post('/api/rrb/command', (req, res) => {
    const { command, payload } = req.body;
    console.log(`[RRB] Received command from Qumus: ${command}`, payload);
    // Execute RRB-specific command
    res.json({ success: true, command, system: 'RRB' });
  });

  // Broadcast status to Qumus
  app.post('/api/rrb/report', (req, res) => {
    const { status, metrics } = req.body;
    console.log(`[RRB] Reporting to Qumus:`, metrics);
    res.json({ success: true, received: true });
  });

  // Fallback to React app
  app.get('*', (req, res) => {
    res.sendFile('client/dist/index.html', { root: process.cwd() });
  });
}

function setupHybridCastServer(app: Express) {
  // HybridCast-specific middleware
  app.use(express.json());
  app.use(express.static('client/dist'));

  // CORS for cross-port communication
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // tRPC routes
  app.use(
    '/api/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // HybridCast-specific endpoints
  app.get('/api/hybridcast/status', (req, res) => {
    res.json({
      system: 'HybridCast',
      status: 'online',
      port: 3002,
      role: 'Emergency Broadcast',
      alerts: 0,
      meshNodes: 12,
      offlineCapable: true,
      timestamp: new Date().toISOString(),
    });
  });

  // Receive commands from Qumus
  app.post('/api/hybridcast/command', (req, res) => {
    const { command, payload } = req.body;
    console.log(`[HybridCast] Received command from Qumus: ${command}`, payload);
    // Execute HybridCast-specific command
    res.json({ success: true, command, system: 'HybridCast' });
  });

  // Emergency alert endpoint
  app.post('/api/hybridcast/alert', (req, res) => {
    const { severity, message, channels } = req.body;
    console.log(`[HybridCast] Emergency alert: ${severity} - ${message}`);
    res.json({ success: true, alertId: Date.now(), channels });
  });

  // Fallback to React app
  app.get('*', (req, res) => {
    res.sendFile('client/dist/index.html', { root: process.cwd() });
  });
}

/**
 * Cross-Port Communication Helper
 * Used by Qumus to communicate with RRB and HybridCast
 */
export async function sendCommandToRRB(command: string, payload: any) {
  try {
    const response = await fetch('http://localhost:3001/api/rrb/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, payload }),
    });
    return await response.json();
  } catch (error) {
    console.error('[Qumus] Failed to send command to RRB:', error);
    throw error;
  }
}

export async function sendCommandToHybridCast(command: string, payload: any) {
  try {
    const response = await fetch('http://localhost:3002/api/hybridcast/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, payload }),
    });
    return await response.json();
  } catch (error) {
    console.error('[Qumus] Failed to send command to HybridCast:', error);
    throw error;
  }
}

export async function getSystemStatus() {
  try {
    const [qumusStatus, rrbStatus, hybridcastStatus] = await Promise.all([
      fetch('http://localhost:3000/api/qumus/status').then((r) => r.json()),
      fetch('http://localhost:3001/api/rrb/status').then((r) => r.json()),
      fetch('http://localhost:3002/api/hybridcast/status').then((r) => r.json()),
    ]);

    return {
      qumus: qumusStatus,
      rrb: rrbStatus,
      hybridcast: hybridcastStatus,
      allOnline: true,
    };
  } catch (error) {
    console.error('[Qumus] Failed to get system status:', error);
    return { allOnline: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
