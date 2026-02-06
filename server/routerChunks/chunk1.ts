/**
 * Router Chunk 1: Core & Modular Routers
 * Imports modular router groups to reduce compilation load
 */

import { router } from '../_core/trpc';
import { entertainmentRouter } from '../routers/modules/entertainment';
import { infrastructureRouter } from '../routers/modules/infrastructure';
import { analyticsRouter_module } from '../routers/modules/analytics';
import { adminComplianceRouter } from '../routers/modules/admin';
import { aiChatRouter_module } from '../routers/modules/ai';
import { integrationsRouter } from '../routers/modules/integrations';

export const chunk1Router = router({
  entertainment: entertainmentRouter,
  infrastructure: infrastructureRouter,
  analytics: analyticsRouter_module,
  admin: adminComplianceRouter,
  ai: aiChatRouter_module,
  integrations: integrationsRouter,
});
