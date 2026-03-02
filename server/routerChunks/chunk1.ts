/**
 * Router Chunk 1: Core & Modular Routers
 * Imports modular router groups to reduce compilation load
 */

import { router } from '../_core/trpc';
import { entertainmentRouter } from '../routers/modules/entertainment';

export const chunk1Router = router({
  entertainment: entertainmentRouter,
});
