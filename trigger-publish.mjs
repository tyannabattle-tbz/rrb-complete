import { createRequire } from 'module';
import { register } from 'node:module';

// Use tsx loader for TypeScript
const { checkAndPublishScheduledPosts } = await import('./server/socialMediaPublisher.ts');
const results = await checkAndPublishScheduledPosts();
console.log(JSON.stringify(results, null, 2));
process.exit(0);
