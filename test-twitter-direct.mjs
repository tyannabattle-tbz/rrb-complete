// Test Twitter API with credentials passed directly to bypass shell env corruption
import crypto from 'crypto';

// Read from server's env by making a request to the running server
const serverUrl = 'http://localhost:3000';

// First, let's test with a simple fetch to see if server is up
try {
  const healthResp = await fetch(`${serverUrl}/api/trpc/system.health`);
  console.log('Server health status:', healthResp.status);
} catch (e) {
  console.log('Server not reachable:', e.message);
}

// The server process has its own env vars loaded by the webdev system
// Let's create a temporary endpoint test by calling the social media router
try {
  const resp = await fetch(`${serverUrl}/api/trpc/socialMedia.getQueue`);
  const body = await resp.text();
  console.log('Social media queue status:', resp.status, body.substring(0, 300));
} catch (e) {
  console.log('Social media error:', e.message);
}
