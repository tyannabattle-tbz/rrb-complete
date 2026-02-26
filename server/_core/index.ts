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
import { activateQumus } from "../qumus/qumusActivation";

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
  
  // Activate QUMUS Autonomous Agent
  try {
    await activateQumus({
      maxConcurrentTasks: 20,
      enableAutoScheduling: true,
      enableSelfImprovement: true,
      enableMultiAgentCoordination: true,
      enablePredictiveAnalytics: true,
      ecosystemIntegration: {
        rrb: true,
        hybridcast: true,
        canryn: true,
        sweetMiracles: true,
      },
    });
  } catch (error) {
    console.error("[QUMUS] Activation failed:", error);
  }
  
  // Initialize WebSocket manager
  initializeWebSocket(server);
  console.log("[WebSocket] Manager initialized");
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // TEST LOGIN ENDPOINT - Bypasses OAuth for development
  app.get("/api/test-login", async (req, res) => {
    try {
      const { sdk } = require("./sdk");
      const db = require("../db");
      const { getSessionCookieOptions } = require("./cookies");
      
      const testOpenId = "test-user-" + Date.now();
      const testUser = {
        openId: testOpenId,
        name: "Test User",
        email: "test@qumus.local",
        loginMethod: "test",
      };
      
      // Create/update test user in database
      await db.upsertUser({
        ...testUser,
        lastSignedIn: new Date(),
      });
      
      // Create session token
      const sessionToken = await sdk.createSessionToken(testOpenId, {
        name: testUser.name,
        expiresInMs: 86400000, // 24 hours
      });
      
      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie("qumus_session", sessionToken, { ...cookieOptions, maxAge: 86400000 });
      
      // Redirect to home with token in URL
      const redirectUrl = `/?token=${encodeURIComponent(sessionToken)}`;
      res.redirect(302, redirectUrl);
    } catch (error) {
      console.error("[Test Login] Failed:", error);
      res.status(500).json({ error: "Test login failed", details: String(error) });
    }
  });
  
  // QUMUS Health Check endpoint
  app.get("/api/qumus/status", (req, res) => {
    try {
      const { getQumusActivation } = require("../qumus/qumusActivation");
      const qumus = getQumusActivation();
      const status = qumus.getStatus();
      res.json({ success: true, status });
    } catch (error) {
      res.json({ success: false, error: String(error) });
    }
  });
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

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
