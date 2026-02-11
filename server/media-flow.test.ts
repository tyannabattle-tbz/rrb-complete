import { describe, it, expect, vi } from "vitest";

// Test that MockVideoService no longer uses local filesystem
describe("Media Entity Flow Paths", () => {
  describe("MockVideoService (Video Generation)", () => {
    it("should import storagePut from storage module, not fs", async () => {
      const source = await import("fs/promises").then(fs => 
        fs.readFile("server/_core/mockVideoService.ts", "utf-8")
      );
      
      // Must use S3 storage, not local filesystem
      expect(source).toContain("storagePut");
      expect(source).toContain("storageGet");
      expect(source).not.toContain("createWriteStream");
      expect(source).not.toContain("from 'fs'");
      expect(source).not.toContain("join(process.cwd()");
      expect(source).not.toContain("public/videos");
    });

    it("should not reference local /videos/ paths in response", async () => {
      const source = await import("fs/promises").then(fs => 
        fs.readFile("server/_core/mockVideoService.ts", "utf-8")
      );
      
      expect(source).not.toContain('url: `/videos/');
      expect(source).not.toContain("url: '/videos/");
    });
  });

  describe("VideoGallery (Frontend)", () => {
    it("should not reference local /videos/ paths", async () => {
      const source = await import("fs/promises").then(fs => 
        fs.readFile("client/src/pages/VideoGallery.tsx", "utf-8")
      );
      
      expect(source).not.toContain('"/videos/');
      expect(source).not.toContain("'/videos/");
    });
  });

  describe("Audio Upload (audioRouter)", () => {
    it("should use storagePut for S3 upload", async () => {
      const source = await import("fs/promises").then(fs => 
        fs.readFile("server/routers/audioRouter.ts", "utf-8")
      );
      
      expect(source).toContain("storagePut");
      expect(source).toContain("audio-uploads/");
    });
  });

  describe("Commercial Audio Upload", () => {
    it("should use storagePut for S3 upload", async () => {
      const source = await import("fs/promises").then(fs => 
        fs.readFile("server/routers/commercials.ts", "utf-8")
      );
      
      expect(source).toContain("storagePut");
      expect(source).toContain("commercials/");
    });
  });

  describe("Document Upload (qumusFileUpload)", () => {
    it("should use storagePut and storageGet for S3", async () => {
      const source = await import("fs/promises").then(fs => 
        fs.readFile("server/routers/qumusFileUpload.ts", "utf-8")
      );
      
      expect(source).toContain("storagePut");
      expect(source).toContain("storageGet");
    });
  });

  describe("No remaining local /videos/ references", () => {
    const filesToCheck = [
      "server/routers/liveStreamingRouter.ts",
      "server/routers/notificationsRouter.ts",
      "server/routers/searchRouter.ts",
      "server/routers/videoGalleryRouter.ts",
      "client/src/pages/UserProfile.tsx",
    ];

    filesToCheck.forEach((filePath) => {
      it(`${filePath} should not reference /videos/ local paths`, async () => {
        const source = await import("fs/promises").then(fs => 
          fs.readFile(filePath, "utf-8")
        );
        
        expect(source).not.toContain('"/videos/');
      });
    });
  });

  describe("Stripe Webhook Registration", () => {
    it("should register webhook route in server index", async () => {
      const source = await import("fs/promises").then(fs => 
        fs.readFile("server/_core/index.ts", "utf-8")
      );
      
      expect(source).toContain("/api/stripe/webhook");
      expect(source).toContain("express.raw");
    });
  });

  describe("Live Podcast Production Router", () => {
    it("should exist and have core procedures", async () => {
      const source = await import("fs/promises").then(fs => 
        fs.readFile("server/routers/livePodcastProduction.ts", "utf-8")
      );
      
      expect(source).toContain("addMarker");
      expect(source).toContain("startSegment");
      expect(source).toContain("addNote");
      expect(source).toContain("getSession");
    });
  });
});
