import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { fileURLToPath } from "url";
import type Express from "express";
import express from "express";

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

export function serveStatic(app: Express) {
  // Production build is in dist/public
  const distPath = path.resolve(import.meta.dirname, "../..", "dist", "public");
  
  console.log(`[Static] Serving from: ${distPath}`);
  console.log(`[Static] Directory exists: ${fs.existsSync(distPath)}`);
  
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  // Serve static files with caching
  app.use(express.static(distPath, { maxAge: "1d" }));

  // SPA fallback: serve index.html for all unmatched routes
  app.use("*", (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    console.log(`[Static] SPA fallback for ${req.path} -> ${indexPath}`);
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error(`[Static] Error sending index.html:`, err);
          res.status(500).send("Internal Server Error");
        }
      });
    } else {
      console.error(`[Static] index.html not found at ${indexPath}`);
      res.status(404).send("index.html not found");
    }
  });
}
