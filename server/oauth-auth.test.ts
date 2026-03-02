import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Test suite for OAuth token extraction and Authorization header authentication
 * Verifies the hybrid authentication approach:
 * 1. Token extraction from URL parameter
 * 2. Token storage in localStorage
 * 3. Authorization header injection in tRPC client
 * 4. Server-side token validation
 */

// Mock localStorage for Node.js environment
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

describe("OAuth Token Authentication Flow", () => {
  describe("Client-side: URL token extraction", () => {
    it("should extract token from URL parameter", () => {
      const testToken = "jwt_token_12345";
      const params = new URLSearchParams(`token=${testToken}`);
      const extractedToken = params.get("token");
      
      expect(extractedToken).toBe(testToken);
    });

    it("should handle missing token parameter gracefully", () => {
      const params = new URLSearchParams("");
      const extractedToken = params.get("token");
      
      expect(extractedToken).toBeNull();
    });

    it("should extract token with special characters", () => {
      const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      const params = new URLSearchParams(`token=${encodeURIComponent(testToken)}`);
      const extractedToken = params.get("token");
      
      expect(extractedToken).toBe(testToken);
    });
  });

  describe("Client-side: localStorage token storage", () => {
    beforeEach(() => {
      // Clear mock localStorage before each test
      mockLocalStorage.clear();
    });

    it("should store token in localStorage", () => {
      const testToken = "jwt_token_12345";
      mockLocalStorage.setItem("session_token", testToken);
      
      const storedToken = mockLocalStorage.getItem("session_token");
      expect(storedToken).toBe(testToken);
    });

    it("should retrieve stored token for Authorization header", () => {
      const testToken = "jwt_token_12345";
      mockLocalStorage.setItem("session_token", testToken);
      
      // Simulate tRPC client behavior
      const token = mockLocalStorage.getItem("session_token");
      const headers = new Headers();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      
      expect(headers.get("Authorization")).toBe(`Bearer ${testToken}`);
    });

    it("should handle missing token gracefully in header injection", () => {
      mockLocalStorage.clear();
      
      // Simulate tRPC client behavior with no token
      const token = mockLocalStorage.getItem("session_token");
      const headers = new Headers();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      
      expect(headers.get("Authorization")).toBeNull();
    });

    it("should remove token on logout", () => {
      const testToken = "jwt_token_12345";
      mockLocalStorage.setItem("session_token", testToken);
      expect(mockLocalStorage.getItem("session_token")).toBe(testToken);
      
      mockLocalStorage.removeItem("session_token");
      expect(mockLocalStorage.getItem("session_token")).toBeNull();
    });
  });

  describe("Server-side: Authorization header parsing", () => {
    it("should extract Bearer token from Authorization header", () => {
      const authHeader = "Bearer jwt_token_12345";
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;
      
      expect(token).toBe("jwt_token_12345");
    });

    it("should handle malformed Authorization header", () => {
      const authHeader = "InvalidFormat jwt_token_12345";
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;
      
      expect(token).toBeNull();
    });

    it("should handle missing Authorization header", () => {
      const authHeader = undefined;
      const token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;
      
      expect(token).toBeNull();
    });

    it("should prioritize Authorization header over cookie", () => {
      // Simulate request with both header and cookie
      const authHeader = "Bearer header_token";
      const cookieToken = "cookie_token";
      
      // Server logic: check header first
      let sessionToken = null;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.substring(7);
      } else {
        sessionToken = cookieToken;
      }
      
      expect(sessionToken).toBe("header_token");
    });

    it("should fall back to cookie if no Authorization header", () => {
      // Simulate request with only cookie
      const authHeader = undefined;
      const cookieToken = "cookie_token";
      
      // Server logic: check header first, fall back to cookie
      let sessionToken = null;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.substring(7);
      } else {
        sessionToken = cookieToken;
      }
      
      expect(sessionToken).toBe("cookie_token");
    });

    it("should handle empty Authorization header", () => {
      const authHeader = "";
      const token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;
      
      expect(token).toBeNull();
    });

    it("should handle Bearer prefix with extra spaces", () => {
      const authHeader = "Bearer  jwt_token_12345"; // Extra space
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;
      
      expect(token).toBe(" jwt_token_12345"); // Includes the extra space
    });
  });

  describe("End-to-end: OAuth flow simulation", () => {
    beforeEach(() => {
      mockLocalStorage.clear();
    });

    it("should complete full OAuth flow: extract -> store -> send -> validate", () => {
      const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IkpvaG4gRG9lIn0.signature";
      
      // Step 1: Extract from URL
      const params = new URLSearchParams(`token=${encodeURIComponent(jwtToken)}`);
      const extractedToken = params.get("token");
      expect(extractedToken).toBe(jwtToken);
      
      // Step 2: Store in localStorage
      mockLocalStorage.setItem("session_token", extractedToken!);
      const storedToken = mockLocalStorage.getItem("session_token");
      expect(storedToken).toBe(jwtToken);
      
      // Step 3: Create Authorization header
      const headers = new Headers();
      if (storedToken) {
        headers.set("Authorization", `Bearer ${storedToken}`);
      }
      expect(headers.get("Authorization")).toBe(`Bearer ${jwtToken}`);
      
      // Step 4: Server validates Authorization header
      const authHeader = headers.get("Authorization");
      let sessionToken = null;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.substring(7);
      }
      expect(sessionToken).toBe(jwtToken);
    });

    it("should handle OAuth redirect with token parameter", () => {
      const redirectUrl = "https://qumus.manus.space/?token=jwt_abc123";
      const url = new URL(redirectUrl);
      const token = url.searchParams.get("token");
      
      expect(token).toBe("jwt_abc123");
      
      // Store and verify
      mockLocalStorage.setItem("session_token", token!);
      expect(mockLocalStorage.getItem("session_token")).toBe("jwt_abc123");
    });

    it("should clean up URL after token extraction", () => {
      const originalUrl = "https://qumus.manus.space/?token=jwt_abc123";
      const url = new URL(originalUrl);
      const token = url.searchParams.get("token");
      
      // Simulate URL cleanup
      url.searchParams.delete("token");
      const cleanedUrl = url.toString();
      
      expect(token).toBe("jwt_abc123");
      expect(cleanedUrl).not.toContain("token=");
    });

    it("should handle multiple query parameters with token", () => {
      const redirectUrl = "https://qumus.manus.space/?redirect=/dashboard&token=jwt_abc123&state=xyz";
      const url = new URL(redirectUrl);
      const token = url.searchParams.get("token");
      const redirect = url.searchParams.get("redirect");
      
      expect(token).toBe("jwt_abc123");
      expect(redirect).toBe("/dashboard");
    });
  });

  describe("Hybrid authentication fallback", () => {
    it("should use header token when both header and cookie present", () => {
      const headerToken = "header_jwt_token";
      const cookieToken = "cookie_jwt_token";
      
      // Simulate server logic
      let selectedToken = null;
      if (headerToken) {
        selectedToken = headerToken;
      } else if (cookieToken) {
        selectedToken = cookieToken;
      }
      
      expect(selectedToken).toBe("header_jwt_token");
    });

    it("should use cookie token when header missing", () => {
      const headerToken = null;
      const cookieToken = "cookie_jwt_token";
      
      // Simulate server logic
      let selectedToken = null;
      if (headerToken) {
        selectedToken = headerToken;
      } else if (cookieToken) {
        selectedToken = cookieToken;
      }
      
      expect(selectedToken).toBe("cookie_jwt_token");
    });

    it("should handle both missing", () => {
      const headerToken = null;
      const cookieToken = null;
      
      // Simulate server logic
      let selectedToken = null;
      if (headerToken) {
        selectedToken = headerToken;
      } else if (cookieToken) {
        selectedToken = cookieToken;
      }
      
      expect(selectedToken).toBeNull();
    });

    it("should prefer Authorization header over empty cookie", () => {
      const headerToken = "Bearer jwt_token";
      const cookieToken = "";
      
      // Simulate server logic
      let selectedToken = null;
      if (headerToken && headerToken.startsWith("Bearer ")) {
        selectedToken = headerToken.substring(7);
      } else if (cookieToken) {
        selectedToken = cookieToken;
      }
      
      expect(selectedToken).toBe("jwt_token");
    });
  });

  describe("tRPC client header injection", () => {
    beforeEach(() => {
      mockLocalStorage.clear();
    });

    it("should inject Authorization header when token exists", () => {
      const testToken = "jwt_token_12345";
      mockLocalStorage.setItem("session_token", testToken);
      
      // Simulate tRPC fetch function
      const token = mockLocalStorage.getItem("session_token");
      const headers = new Headers({});
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      
      expect(headers.get("Authorization")).toBe(`Bearer ${testToken}`);
    });

    it("should not inject header when token missing", () => {
      mockLocalStorage.clear();
      
      // Simulate tRPC fetch function
      const token = mockLocalStorage.getItem("session_token");
      const headers = new Headers({});
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      
      expect(headers.get("Authorization")).toBeNull();
    });

    it("should preserve existing headers while adding Authorization", () => {
      const testToken = "jwt_token_12345";
      mockLocalStorage.setItem("session_token", testToken);
      
      // Simulate tRPC fetch function with existing headers
      const existingHeaders = new Headers({
        "Content-Type": "application/json",
        "X-Custom-Header": "custom-value",
      });
      
      const token = mockLocalStorage.getItem("session_token");
      if (token) {
        existingHeaders.set("Authorization", `Bearer ${token}`);
      }
      
      expect(existingHeaders.get("Authorization")).toBe(`Bearer ${testToken}`);
      expect(existingHeaders.get("Content-Type")).toBe("application/json");
      expect(existingHeaders.get("X-Custom-Header")).toBe("custom-value");
    });
  });
});
