import { describe, it, expect, beforeAll } from "vitest";

/**
 * API Credentials Validation Tests
 * Validates that Spotify and YouTube API credentials are properly configured
 * and can authenticate with their respective services
 */

describe("API Credentials Validation", () => {
  const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
  const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const youtubeApiKey = process.env.YOUTUBE_API_KEY;

  describe("Spotify Credentials", () => {
    it("should have Spotify Client ID configured", () => {
      expect(spotifyClientId).toBeDefined();
      expect(spotifyClientId).toHaveLength(32);
      expect(spotifyClientId).toMatch(/^[a-f0-9]{32}$/);
    });

    it("should have Spotify Client Secret configured", () => {
      expect(spotifyClientSecret).toBeDefined();
      expect(spotifyClientSecret).toHaveLength(32);
      expect(spotifyClientSecret).toMatch(/^[a-f0-9]{32}$/);
    });

    it("should authenticate with Spotify API", async () => {
      if (!spotifyClientId || !spotifyClientSecret) {
        throw new Error("Spotify credentials not configured");
      }

      const auth = Buffer.from(
        `${spotifyClientId}:${spotifyClientSecret}`
      ).toString("base64");

      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as { access_token?: string };
      expect(data.access_token).toBeDefined();
      expect(typeof data.access_token).toBe("string");
    });

    it("should access Spotify Web API with valid token", async () => {
      if (!spotifyClientId || !spotifyClientSecret) {
        throw new Error("Spotify credentials not configured");
      }

      const auth = Buffer.from(
        `${spotifyClientId}:${spotifyClientSecret}`
      ).toString("base64");

      const tokenResponse = await fetch(
        "https://accounts.spotify.com/api/token",
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "grant_type=client_credentials",
        }
      );

      const tokenData = (await tokenResponse.json()) as { access_token: string };
      const accessToken = tokenData.access_token;

      const apiResponse = await fetch(
        "https://api.spotify.com/v1/me/top/tracks?limit=1",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      expect(apiResponse.status).toBe(200);
    });
  });

  describe("YouTube Credentials", () => {
    it("should have YouTube API Key configured", () => {
      expect(youtubeApiKey).toBeDefined();
      expect(youtubeApiKey).toHaveLength(39);
      expect(youtubeApiKey).toMatch(/^AIza[A-Za-z0-9_-]{35}$/);
    });

    it("should authenticate with YouTube Data API", async () => {
      if (!youtubeApiKey) {
        throw new Error("YouTube API key not configured");
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=rockin+rockin+boogie&key=${youtubeApiKey}&maxResults=1`
      );

      expect(response.status).toBe(200);
      const data = (await response.json()) as { items?: unknown[] };
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
    });

    it("should access YouTube videos with valid API key", async () => {
      if (!youtubeApiKey) {
        throw new Error("YouTube API key not configured");
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=dQw4w9WgXcQ&key=${youtubeApiKey}`
      );

      expect(response.status).toBe(200);
      const data = (await response.json()) as { items?: unknown[] };
      expect(data.items).toBeDefined();
    });
  });

  describe("Credential Format Validation", () => {
    it("should have all required credentials", () => {
      expect(spotifyClientId).toBeDefined();
      expect(spotifyClientSecret).toBeDefined();
      expect(youtubeApiKey).toBeDefined();
    });

    it("should not have empty credential values", () => {
      expect(spotifyClientId).not.toBe("");
      expect(spotifyClientSecret).not.toBe("");
      expect(youtubeApiKey).not.toBe("");
    });

    it("should have credentials in correct format", () => {
      // Spotify credentials are 32 hex characters
      expect(spotifyClientId).toMatch(/^[a-f0-9]{32}$/);
      expect(spotifyClientSecret).toMatch(/^[a-f0-9]{32}$/);

      // YouTube API key starts with AIza and is 39 characters total
      expect(youtubeApiKey).toMatch(/^AIza[A-Za-z0-9_-]{35}$/);
    });
  });
});
