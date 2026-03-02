import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createServer } from 'http';
import { QumusWebSocketServer } from './wsServer';
import WebSocket from 'ws';

describe('QumusWebSocketServer', () => {
  let server: any;
  let wsServer: QumusWebSocketServer;
  let port: number;

  beforeEach(() => {
    server = createServer();
    wsServer = new QumusWebSocketServer(server);
    port = 8080 + Math.floor(Math.random() * 1000);
    server.listen(port);
  });

  afterEach(() => {
    wsServer.close();
    server.close();
  });

  it('should initialize WebSocket server', () => {
    expect(wsServer).toBeDefined();
    const stats = wsServer.getStats();
    expect(stats.totalUsers).toBe(0);
    expect(stats.totalConnections).toBe(0);
  });

  it('should handle client connections', (done) => {
    const ws = new WebSocket(`ws://localhost:${port}/api/ws?userId=1&sessionId=test`);

    ws.on('open', () => {
      const stats = wsServer.getStats();
      expect(stats.totalUsers).toBeGreaterThan(0);
      ws.close();
      done();
    });

    ws.on('error', (error) => {
      done(error);
    });
  });

  it('should broadcast to user', (done) => {
    const ws = new WebSocket(`ws://localhost:${port}/api/ws?userId=1&sessionId=test`);
    let messageReceived = false;

    ws.on('open', () => {
      wsServer.sendPolicyDecision(1, {
        id: 'policy-1',
        decision: 'approve',
        confidence: 0.95,
      });
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === 'policy_decision') {
        messageReceived = true;
        expect(message.data.decision).toBe('approve');
        ws.close();
        done();
      }
    });

    ws.on('error', (error) => {
      done(error);
    });
  });

  it('should send task updates', (done) => {
    const ws = new WebSocket(`ws://localhost:${port}/api/ws?userId=1&sessionId=test`);
    let messageReceived = false;

    ws.on('open', () => {
      wsServer.sendTaskUpdate(1, {
        taskId: 'task-1',
        status: 'executing',
        progress: 50,
      });
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === 'task_update') {
        messageReceived = true;
        expect(message.data.status).toBe('executing');
        ws.close();
        done();
      }
    });

    ws.on('error', (error) => {
      done(error);
    });
  });

  it('should send metrics updates', (done) => {
    const ws = new WebSocket(`ws://localhost:${port}/api/ws?userId=1&sessionId=test`);

    ws.on('open', () => {
      wsServer.sendMetricsUpdate(1, {
        cpu: 45,
        memory: 60,
        storage: 30,
      });
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === 'metrics_update') {
        expect(message.data.cpu).toBe(45);
        ws.close();
        done();
      }
    });

    ws.on('error', (error) => {
      done(error);
    });
  });

  it('should send subscription changes', (done) => {
    const ws = new WebSocket(`ws://localhost:${port}/api/ws?userId=1&sessionId=test`);

    ws.on('open', () => {
      wsServer.sendSubscriptionChange(1, {
        subscriptionId: 'sub-1',
        tier: 'pro',
        status: 'active',
      });
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === 'subscription_change' && message.data.subscriptionId) {
        expect(message.data.tier).toBe('pro');
        ws.close();
        done();
      }
    });

    ws.on('error', (error) => {
      done(error);
    });
  });

  it('should handle client disconnection', (done) => {
    const ws = new WebSocket(`ws://localhost:${port}/api/ws?userId=1&sessionId=test`);

    ws.on('open', () => {
      const statsOpen = wsServer.getStats();
      expect(statsOpen.totalConnections).toBeGreaterThan(0);
      ws.close();
    });

    ws.on('close', () => {
      setTimeout(() => {
        const statsClosed = wsServer.getStats();
        expect(statsClosed.totalConnections).toBe(0);
        done();
      }, 100);
    });

    ws.on('error', (error) => {
      done(error);
    });
  });

  it('should reject connections without userId', (done) => {
    const ws = new WebSocket(`ws://localhost:${port}/api/ws?sessionId=test`);
    let closedWithError = false;

    ws.on('close', (code) => {
      expect(code).toBe(1008);
      done();
    });

    ws.on('error', () => {
      // Expected
    });
  });

  it('should get connection statistics', () => {
    const stats = wsServer.getStats();
    expect(stats).toHaveProperty('totalUsers');
    expect(stats).toHaveProperty('totalConnections');
    expect(typeof stats.totalUsers).toBe('number');
    expect(typeof stats.totalConnections).toBe('number');
  });
});
