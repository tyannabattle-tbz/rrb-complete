import http from "http";

const BASE_URL = "http://localhost:3000";
const CONCURRENT_USERS = 100;
const REQUESTS_PER_USER = 10;
const TEST_DURATION_MS = 60000; // 1 minute

interface TestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  minLatency: number;
  maxLatency: number;
  p95Latency: number;
  p99Latency: number;
  throughput: number; // requests per second
}

const results: number[] = [];
let totalRequests = 0;
let successfulRequests = 0;
let failedRequests = 0;

async function makeRequest(path: string): Promise<number> {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const req = http.get(`${BASE_URL}${path}`, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const latency = Date.now() - startTime;
        results.push(latency);

        if (res.statusCode === 200) {
          successfulRequests++;
        } else {
          failedRequests++;
        }

        resolve(latency);
      });
    });

    req.on("error", () => {
      failedRequests++;
      resolve(Date.now() - startTime);
    });

    req.end();
  });
}

async function simulateUser(userId: number): Promise<void> {
  for (let i = 0; i < REQUESTS_PER_USER; i++) {
    const paths = [
      "/api/trpc/system.ping",
      "/api/trpc/podcastPlayback.play",
      "/api/trpc/auditLogging.getAuditLogs",
      "/api/trpc/complianceReporting.getComplianceMetrics",
    ];

    const randomPath = paths[Math.floor(Math.random() * paths.length)];

    try {
      await makeRequest(randomPath);
      totalRequests++;
    } catch (error) {
      console.error(`User ${userId} request failed:`, error);
    }

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

async function runLoadTest(): Promise<TestResult> {
  console.log(`Starting load test with ${CONCURRENT_USERS} concurrent users...`);
  console.log(`Each user will make ${REQUESTS_PER_USER} requests`);
  console.log(`Total expected requests: ${CONCURRENT_USERS * REQUESTS_PER_USER}\n`);

  const startTime = Date.now();

  // Create all users
  const userPromises: Promise<void>[] = [];
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    userPromises.push(simulateUser(i));
  }

  // Wait for all users to complete
  await Promise.all(userPromises);

  const duration = Date.now() - startTime;

  // Calculate statistics
  results.sort((a, b) => a - b);

  const averageLatency = results.reduce((a, b) => a + b, 0) / results.length;
  const minLatency = results[0];
  const maxLatency = results[results.length - 1];
  const p95Index = Math.floor(results.length * 0.95);
  const p99Index = Math.floor(results.length * 0.99);
  const p95Latency = results[p95Index];
  const p99Latency = results[p99Index];
  const throughput = (totalRequests / duration) * 1000; // requests per second

  return {
    totalRequests,
    successfulRequests,
    failedRequests,
    averageLatency,
    minLatency,
    maxLatency,
    p95Latency,
    p99Latency,
    throughput,
  };
}

function printResults(results: TestResult): void {
  console.log("\n=== Load Test Results ===\n");
  console.log(`Total Requests: ${results.totalRequests}`);
  console.log(`Successful: ${results.successfulRequests} (${((results.successfulRequests / results.totalRequests) * 100).toFixed(2)}%)`);
  console.log(`Failed: ${results.failedRequests} (${((results.failedRequests / results.totalRequests) * 100).toFixed(2)}%)\n`);

  console.log("Latency (ms):");
  console.log(`  Min: ${results.minLatency.toFixed(2)}`);
  console.log(`  Avg: ${results.averageLatency.toFixed(2)}`);
  console.log(`  P95: ${results.p95Latency.toFixed(2)}`);
  console.log(`  P99: ${results.p99Latency.toFixed(2)}`);
  console.log(`  Max: ${results.maxLatency.toFixed(2)}\n`);

  console.log(`Throughput: ${results.throughput.toFixed(2)} req/s\n`);

  // Performance assessment
  console.log("=== Performance Assessment ===\n");

  if (results.p99Latency < 500) {
    console.log("✅ Latency: EXCELLENT (P99 < 500ms)");
  } else if (results.p99Latency < 1000) {
    console.log("✅ Latency: GOOD (P99 < 1000ms)");
  } else if (results.p99Latency < 2000) {
    console.log("⚠️  Latency: ACCEPTABLE (P99 < 2000ms)");
  } else {
    console.log("❌ Latency: POOR (P99 >= 2000ms)");
  }

  if (results.successfulRequests / results.totalRequests > 0.99) {
    console.log("✅ Success Rate: EXCELLENT (> 99%)");
  } else if (results.successfulRequests / results.totalRequests > 0.95) {
    console.log("✅ Success Rate: GOOD (> 95%)");
  } else {
    console.log("❌ Success Rate: POOR (< 95%)");
  }

  if (results.throughput > 100) {
    console.log("✅ Throughput: EXCELLENT (> 100 req/s)");
  } else if (results.throughput > 50) {
    console.log("✅ Throughput: GOOD (> 50 req/s)");
  } else {
    console.log("⚠️  Throughput: ACCEPTABLE (> 10 req/s)");
  }
}

// Run the test
runLoadTest().then((result) => {
  printResults(result);
  process.exit(result.failedRequests > 0 ? 1 : 0);
});
