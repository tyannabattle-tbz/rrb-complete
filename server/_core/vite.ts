import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { fileURLToPath } from "url";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  
  // Serve static video files from public/videos
  const publicVideosPath = path.resolve(
    import.meta.dirname,
    "../..",
    "public",
    "videos"
  );
  app.use("/videos", express.static(publicVideosPath));
  
  // Log build version on startup
  console.log(`[Cache Busting] Build version: ${BUILD_VERSION}`);
  
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

// Generate build-time version hash for cache-busting
const BUILD_VERSION = `v${Date.now()}_${Math.random().toString(36).substring(7)}`;

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  // Cache control middleware for static assets
  app.use((_req, res, next) => {
    const reqPath = _req.path;
    // HTML files: aggressive no-cache with strong ETag
    if (reqPath.endsWith('.html') || reqPath === '/') {
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, public',
        'Pragma': 'no-cache',
        'Expires': '0',
        'ETag': `"${BUILD_VERSION}"`,
        'X-Build-Version': BUILD_VERSION,
        'X-Served-At': new Date().toISOString(),
      });
    }
    // Versioned assets: aggressive cache
    else if (/\.[a-f0-9]{8}\.(js|css|woff2?)$/.test(reqPath)) {
      res.set({
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Build-Version': BUILD_VERSION,
      });
    }
    // Other static assets: moderate cache with version header
    else {
      res.set({
        'Cache-Control': 'public, max-age=3600, must-revalidate',
        'X-Build-Version': BUILD_VERSION,
      });
    }
    next();
  });

  // Serve static files with cache headers applied BEFORE express.static
  app.use((req, res, next) => {
    // For index.html specifically, add strong cache-busting
    if (req.path === '/' || req.path === '/index.html') {
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, public',
        'Pragma': 'no-cache',
        'Expires': '0',
        'ETag': `"${BUILD_VERSION}"`,
        'X-Build-Version': BUILD_VERSION,
      });
    }
    next();
  });

  app.use(express.static(distPath, {
    // Override cache control for all static files
    setHeaders: (res, filePath) => {
      // Always set build version
      res.set('X-Build-Version', BUILD_VERSION);
      
      if (filePath.endsWith('.html')) {
        res.set({
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, public',
          'Pragma': 'no-cache',
          'Expires': '0',
          'ETag': `"${BUILD_VERSION}"`,
        });
      } else if (/\.[a-f0-9]{8}\.(js|css|woff2?)$/.test(filePath)) {
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.set('Cache-Control', 'public, max-age=3600, must-revalidate');
      }
    },
  }));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, public',
      'Pragma': 'no-cache',
      'Expires': '0',
      'ETag': `"${BUILD_VERSION}"`,
      'X-Build-Version': BUILD_VERSION,
    });
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
