#!/usr/bin/env node
/**
 * Real-Time System Monitor Dashboard
 * Displays live status of all 4 ecosystem ports
 * 
 * © Canryn Production - System Monitoring
 */

import http from 'http';
import os from 'os';
import { execSync } from 'child_process';

const PORTS = [3000, 3001, 3002, 3003, 3004];
const CHECK_INTERVAL = 5000; // 5 seconds

// Service information
const SERVICES = {
  3000: { name: 'QUMUS Main', color: '🟣', role: 'Dev Server' },
  3001: { name: 'QUMUS Control', color: '⚡', role: 'Orchestration Brain' },
  3002: { name: 'RRB Entertainment', color: '🎵', role: '54-Channel Radio' },
  3003: { name: 'HybridCast', color: '🚨', role: 'Emergency Broadcast' },
  3004: { name: 'Ty OS', color: '🖥️ ', role: 'Master Coordinator' },
};

let systemStatus = {
  timestamp: new Date(),
  ports: {},
  uptime: 0,
  memory: {},
};

/**
 * Check if port is listening
 */
function isPortListening(port) {
  try {
    const result = execSync(`ss -tln | grep -q ":${port}" && echo "1" || echo "0"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    return result.trim() === '1';
  } catch {
    return false;
  }
}

/**
 * Get service status
 */
function getServiceStatus(port) {
  const isListening = isPortListening(port);
  const service = SERVICES[port];
  
  return {
    port,
    name: service.name,
    role: service.role,
    status: isListening ? 'ONLINE' : 'OFFLINE',
    color: service.color,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Update system status
 */
function updateSystemStatus() {
  systemStatus.timestamp = new Date();
  systemStatus.uptime = process.uptime();
  systemStatus.memory = process.memoryUsage();
  
  systemStatus.ports = {};
  for (const port of PORTS) {
    systemStatus.ports[port] = getServiceStatus(port);
  }
}

/**
 * Generate HTML dashboard
 */
function generateDashboard() {
  const onlinePorts = Object.values(systemStatus.ports).filter(p => p.status === 'ONLINE').length;
  const totalPorts = PORTS.length;
  const healthPercent = Math.round((onlinePorts / totalPorts) * 100);

  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ecosystem System Monitor</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Monaco', 'Courier New', monospace;
      background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
      color: #00ff88;
      padding: 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #00ff88;
      padding-bottom: 20px;
    }
    .header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
      text-shadow: 0 0 20px #00ff88;
    }
    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .status-card {
      background: rgba(0, 255, 136, 0.05);
      border: 2px solid #00ff88;
      border-radius: 8px;
      padding: 20px;
      transition: all 0.3s ease;
    }
    .status-card.online {
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
    }
    .status-card.offline {
      border-color: #ff0055;
      background: rgba(255, 0, 85, 0.05);
    }
    .status-card.offline .status-indicator {
      color: #ff0055;
    }
    .port-number {
      font-size: 0.9em;
      color: #888;
      margin-bottom: 10px;
    }
    .service-name {
      font-size: 1.2em;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .service-role {
      font-size: 0.85em;
      color: #00cc66;
      margin-bottom: 15px;
    }
    .status-indicator {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #00ff88;
      margin-right: 8px;
      animation: pulse 2s infinite;
    }
    .status-text {
      font-weight: bold;
    }
    .status-text.online {
      color: #00ff88;
    }
    .status-text.offline {
      color: #ff0055;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .health-bar {
      background: rgba(0, 255, 136, 0.1);
      border: 1px solid #00ff88;
      height: 30px;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 20px;
    }
    .health-fill {
      height: 100%;
      background: linear-gradient(90deg, #00ff88, #00cc66);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #000;
      font-weight: bold;
      transition: width 0.3s ease;
    }
    .metrics {
      background: rgba(0, 255, 136, 0.05);
      border: 1px solid #00ff88;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
    }
    .metric-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid rgba(0, 255, 136, 0.2);
    }
    .metric-row:last-child {
      border-bottom: none;
    }
    .metric-label {
      color: #00cc66;
    }
    .metric-value {
      font-weight: bold;
      color: #00ff88;
    }
    .timestamp {
      text-align: center;
      color: #888;
      font-size: 0.9em;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌐 Ecosystem System Monitor</h1>
      <p>Real-Time Status Dashboard - Canryn Production</p>
    </div>

    <div class="health-bar">
      <div class="health-fill" style="width: ${healthPercent}%">
        ${onlinePorts}/${totalPorts} ONLINE (${healthPercent}%)
      </div>
    </div>

    <div class="status-grid">
`;

  for (const port of PORTS) {
    const status = systemStatus.ports[port];
    const isOnline = status.status === 'ONLINE';
    
    html += `
      <div class="status-card ${isOnline ? 'online' : 'offline'}">
        <div class="port-number">PORT ${status.port}</div>
        <div class="service-name">${status.color} ${status.name}</div>
        <div class="service-role">${status.role}</div>
        <div>
          <span class="status-indicator" ${!isOnline ? 'style="background: #ff0055;"' : ''}></span>
          <span class="status-text ${isOnline ? 'online' : 'offline'}">
            ${status.status}
          </span>
        </div>
      </div>
    `;
  }

  html += `
    </div>

    <div class="metrics">
      <div class="metric-row">
        <span class="metric-label">System Uptime:</span>
        <span class="metric-value">${Math.floor(systemStatus.uptime / 3600)}h ${Math.floor((systemStatus.uptime % 3600) / 60)}m</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Memory Usage:</span>
        <span class="metric-value">${(systemStatus.memory.heapUsed / 1024 / 1024).toFixed(2)} MB / ${(systemStatus.memory.heapTotal / 1024 / 1024).toFixed(2)} MB</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Services Online:</span>
        <span class="metric-value">${onlinePorts} / ${totalPorts}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">System Health:</span>
        <span class="metric-value">${healthPercent}%</span>
      </div>
    </div>

    <div class="timestamp">
      Last updated: ${systemStatus.timestamp.toLocaleTimeString()}
      <br>
      Auto-refreshing every 5 seconds...
    </div>
  </div>

  <script>
    setInterval(() => {
      location.reload();
    }, 5000);
  </script>
</body>
</html>
  `;

  return html;
}

/**
 * Start HTTP server
 */
function startServer() {
  const server = http.createServer((req, res) => {
    if (req.url === '/') {
      updateSystemStatus();
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(generateDashboard());
    } else if (req.url === '/api/status') {
      updateSystemStatus();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(systemStatus, null, 2));
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  const PORT = 8888;
  server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║         SYSTEM MONITOR DASHBOARD - ACTIVE                      ║
║                                                                ║
║   📊 Dashboard: http://localhost:${PORT}                          ║
║   📡 API Status: http://localhost:${PORT}/api/status               ║
║                                                                ║
║   Monitoring ${PORTS.length} ecosystem ports every 5 seconds      ║
║   © Canryn Production - System Monitoring                       ║
╚════════════════════════════════════════════════════════════════╝
    `);
  });
}

// Start monitoring
startServer();

// Update status every 5 seconds
setInterval(updateSystemStatus, CHECK_INTERVAL);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 System Monitor shutting down...');
  process.exit(0);
});
