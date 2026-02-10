import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { initializeWebSocket } from "../websocket";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Initialize WebSocket manager
  initializeWebSocket(server);
  console.log("[WebSocket] Manager initialized");
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  // Initialize QUMUS Complete Engine (database persistence + heartbeat)
  try {
    const { QumusCompleteEngine } = await import("../qumus-complete-engine");
    await QumusCompleteEngine.initialize();
  } catch (e) {
    console.log('[QUMUS Engine] Init skipped:', (e as Error).message);
  }

  // Initialize QUMUS Content Scheduler (24/7 auto-rotation)
  try {
    const { getContentScheduler } = await import("../services/contentSchedulerService");
    const scheduler = getContentScheduler();
    scheduler.start();
  } catch (e) {
    console.log('[ContentScheduler] Init skipped:', (e as Error).message);
  }

  // Initialize QUMUS Autonomous Event Loop (generates real decisions)
  try {
    const { getAutonomousLoop } = await import("../services/qumus-autonomous-loop");
    const loop = getAutonomousLoop();
    // Start with 2-minute intervals between batches
    loop.start(120_000);
    console.log('[QUMUS Loop] Autonomous event loop started');
  } catch (e) {
    console.log('[QUMUS Loop] Init skipped:', (e as Error).message);
  }

  // Initialize AI Agent Networking — cross-platform collaboration
  try {
    const { getAgentNetwork } = await import("../services/agent-networking");
    const network = getAgentNetwork();
    network.start();
    console.log('[Agent Network] Cross-platform AI agent networking started');
  } catch (e) {
    console.log('[Agent Network] Init skipped:', (e as Error).message);
  }

  // Initialize Sweet Miracles Grant Discovery Engine
  try {
    const { startGrantDiscovery } = await import("../services/grant-discovery-engine");
    startGrantDiscovery(3600000); // Scan every hour
    console.log('[Grant Discovery] Automated grant finding protocol activated');
  } catch (e) {
    console.log('[Grant Discovery] Init skipped:', (e as Error).message);
  }

  // Initialize AI Business Operations Assistants (10 autonomous bots)
  try {
    const { startAIBusinessAssistants } = await import("../services/ai-business-assistants");
    startAIBusinessAssistants();
    console.log('[AI Business Bots] 10 autonomous AI assistants activated');
    console.log('[AI Business Bots] Bookkeeping | HR | Accounting | Legal | Radio Directory');
    console.log('[AI Business Bots] Social Media | Content Calendar | Engagement | Grant Discovery | Emergency');
  } catch (e) {
    console.log('[AI Business Bots] Init skipped:', (e as Error).message);
  }

  // Initialize AI Commercial Generation Engine (radio broadcast integration)
  try {
    const { startCommercialEngine } = await import("../services/commercial-engine");
    startCommercialEngine();
    console.log('[Commercial Engine] AI commercial generation & rotation active');
    console.log('[Commercial Engine] 7 default commercials seeded (station IDs, PSAs, promos, fundraisers)');
    console.log('[Commercial Engine] Auto-rotation scheduling engaged for 24/7 broadcast');
  } catch (e) {
    console.log('[Commercial Engine] Init skipped:', (e as Error).message);
  }

  // Initialize QUMUS Business Operations Oversight (monitors all modules every 5 minutes)
  try {
    const { QumusBusinessOversight } = await import("../services/qumus-business-oversight");
    QumusBusinessOversight.start();
    console.log('[QUMUS Oversight] Business operations monitoring ACTIVE');
    console.log('[QUMUS Oversight] Monitoring: Bookkeeping, HR, Accounting, Legal, Commercials, Radio, Advertising, Social Media, Grants');
    console.log('[QUMUS Oversight] Scan interval: every 5 minutes | Autonomy: 100% QUMUS-controlled');
  } catch (e) {
    console.log('[QUMUS Oversight] Init skipped:', (e as Error).message);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
