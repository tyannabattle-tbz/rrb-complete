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
import { handleStripeWebhook } from "../webhooks/stripeWebhook";
import { activateQumus } from "../qumus/qumusActivation";
import { registerAudioStreamProxy } from "../audioStreamProxy";
import { registerPodcastRssRoutes } from "../routes/podcastRssFeed";
import { startProductionIntegration } from "../services/qumusProductionIntegration";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

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
  // Trust proxy headers (x-forwarded-proto, x-forwarded-for) for correct HTTPS detection
  // Critical for OAuth redirects and cookie Secure flag behind reverse proxies on mobile
  app.set("trust proxy", true);
  const server = createServer(app);
  
  // Stripe webhook endpoint - must be BEFORE body parser to get raw body
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    handleStripeWebhook(req as any, res).catch(err => {
      console.error('[Stripe Webhook] Unhandled error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  });
  
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
        presentationBuilder: true,
        musicStudio: true,
        valanna: true,
        seraph: true,
      },
    });
  } catch (error) {
    console.error("[QUMUS] Activation failed:", error);
  }
  
  // Initialize WebSocket manager
  initializeWebSocket(server);
  console.log("[WebSocket] Manager initialized");

  // Start QUMUS Production Integration Engine
  try {
    const productionEngine = startProductionIntegration();
    console.log("[QUMUS-PROD] Production Integration Engine activated");
  } catch (error) {
    console.error("[QUMUS-PROD] Failed to start:", error);
  }
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // TEST LOGIN ENDPOINT - Bypasses OAuth for development
  app.get("/api/test-login", async (req, res) => {
    try {
      // Import SDK singleton
      const { sdk } = await import("./sdk");
      const dbModule = await import("../db");
      const db = dbModule;
      const { getSessionCookieOptions } = await import("./cookies");
      
      const testOpenId = "test-user-" + Date.now();
      const testUser = {
        openId: testOpenId,
        name: "Test User",
        email: "test@qumus.local",
        loginMethod: "test",
      };
      
      // Create/update test user in database
      await db.upsertUser({
        openId: testUser.openId,
        name: testUser.name,
        email: testUser.email,
        loginMethod: testUser.loginMethod,
        lastSignedIn: new Date(),
      });
      
      // Create session token
      const sessionToken = await sdk.createSessionToken(testOpenId, {
        name: testUser.name,
        expiresInMs: ONE_YEAR_MS,
      });
      
      console.log("[Test Login] Session token created", {
        tokenLength: sessionToken.length,
        openId: testOpenId,
      });
      
      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      
      console.log("[Test Login] Cookie set successfully");
      
      // Redirect to home with token in URL
      const redirectUrl = `/?token=${encodeURIComponent(sessionToken)}`;
      console.log("[Test Login] Redirecting to", redirectUrl.substring(0, 50));
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

  // QUMUS Production Integration Status endpoint
  app.get("/api/qumus/production-status", (req, res) => {
    try {
      const { getProductionIntegration } = require("../services/qumusProductionIntegration");
      const engine = getProductionIntegration();
      res.json({ success: true, ...engine.getStatus() });
    } catch (error) {
      res.json({ success: false, error: String(error) });
    }
  });

  // QUMUS Event Emission endpoint (for subsystems to emit events)
  app.post("/api/qumus/emit-event", express.json(), (req, res) => {
    try {
      const { getProductionIntegration } = require("../services/qumusProductionIntegration");
      const engine = getProductionIntegration();
      const event = engine.createEvent(
        req.body.type,
        req.body.source || 'api',
        req.body.data || {},
        req.body.severity || 'info',
        req.body.requiresHumanReview || false,
      );
      engine.emit(event);
      res.json({ success: true, eventId: event.id });
    } catch (error) {
      res.status(500).json({ success: false, error: String(error) });
    }
  });
  
  // Stripe checkout endpoint
  app.post("/api/stripe/checkout", async (req, res) => {
    try {
      const { createCheckoutSession } = await import("../stripeService");
      const { userId, userEmail, userName, productName, priceId, successUrl, cancelUrl } = req.body;
      
      if (!userId || !userEmail || !priceId) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const session = await createCheckoutSession({
        userId,
        userEmail,
        userName: userName || "Donor",
        productName: productName || "Donation",
        priceId,
        successUrl: successUrl || `${req.protocol}://${req.get("host")}/donate?success=true`,
        cancelUrl: cancelUrl || `${req.protocol}://${req.get("host")}/donate?cancelled=true`,
      });
      
      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error("[Stripe Checkout] Error:", error);
      res.status(500).json({ error: String(error) });
    }
  });
  
  // Audio Stream Proxy - proxies HTTP radio streams through HTTPS server
  registerAudioStreamProxy(app);

  // Podcast RSS Feed endpoints
  registerPodcastRssRoutes(app);

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
