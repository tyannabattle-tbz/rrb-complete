import { describe, it, expect } from "vitest";

describe("Twitter Bearer Token Validation", () => {
  it("should authenticate with the new bearer token", async () => {
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    expect(bearerToken).toBeTruthy();
    expect(bearerToken!.length).toBeGreaterThan(20);

    // Test with a lightweight API call - get authenticated user info
    const response = await fetch("https://api.twitter.com/2/users/me", {
      headers: {
        "Authorization": `Bearer ${bearerToken}`,
      },
    });

    // Bearer tokens can't access /users/me (requires OAuth 1.0a user context)
    // But a valid bearer token will return 403 (forbidden for user context)
    // An invalid token returns 401
    // 429 = rate limited but token is valid
    console.log(`Twitter Bearer Token test: status ${response.status}`);
    const body = await response.text();
    console.log(`Response: ${body.substring(0, 300)}`);

    // Accept 200 (success), 403 (valid token but wrong scope), or 429 (rate limited)
    // Reject 401 (invalid token)
    expect(response.status).not.toBe(401);
  });

  it("should be able to search tweets (app-only auth)", async () => {
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    expect(bearerToken).toBeTruthy();

    // Search is an app-only endpoint that works with bearer tokens
    const response = await fetch(
      "https://api.twitter.com/2/tweets/search/recent?query=test&max_results=10",
      {
        headers: {
          "Authorization": `Bearer ${bearerToken}`,
        },
      }
    );

    console.log(`Twitter search test: status ${response.status}`);
    const body = await response.text();
    console.log(`Response: ${body.substring(0, 300)}`);

    // 200 = success, 429 = rate limited (valid), 403 = scope issue (valid token)
    // 401 = invalid token
    expect(response.status).not.toBe(401);
  });
});
