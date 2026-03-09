/**
 * Router Chunk 5: QUMUS, Sweet Miracles, Utilities
 */

import { router } from '../_core/trpc';
import { seedDataRouter } from '../routers/seedData';
import { qumusOrchestrationRouter } from '../routers/qumusOrchestration';
import { qumusFileUploadRouter } from '../routers/qumusFileUpload';
import { abTestingRouter } from '../routers/abTesting';
import { emailNotificationRouter } from '../routers/emailNotificationRouter';
import { sweetMiraclesAlertsRouter } from '../routers/sweetMiraclesAlerts';
import { sweetMiraclesDonorsRouter } from '../routers/sweetMiraclesDonors';
import { sweetMiraclesGrantsRouter } from '../routers/sweetMiraclesGrants';
import { newsRouter } from '../routers/newsRouter';
import { familyTreeRouter } from '../routers/familyTreeRouter';
import { documentationRouter } from '../routers/documentationRouter';
import { rrbSeedDataRouter } from '../routers/rrbSeedData';
import { contentSchedulerRouter } from '../routers/contentSchedulerRouter';
import { rrbUpdateOrchestratorRouter } from '../routers/rrbUpdateOrchestrator';
import { teamUpdatesRouter } from '../routers/teamUpdatesRouter';
import { adRotationRouter } from '../routers/adRotationRouter';
import { listenerAnalyticsRouter } from '../routers/listenerAnalyticsRouter';
import { webhookManagerRouter } from '../routers/webhookManagerRouter';
import { productionIntegrationRouter } from '../routers/productionIntegrationRouter';
import { studioRouter } from '../routers/studioRouter';
import { conventionRouter } from '../routers/conventionRouter';
import { squaddGoalsRouter } from '../routers/squaddGoalsRouter';

export const chunk5Router = router({
  seedData: seedDataRouter,
  qumusOrchestration: qumusOrchestrationRouter,
  qumusFileUpload: qumusFileUploadRouter,
  abTesting: abTestingRouter,
  emailNotification: emailNotificationRouter,
  sweetMiracles: router({
    alerts: sweetMiraclesAlertsRouter || router({}),
    donors: sweetMiraclesDonorsRouter || router({}),
    grants: sweetMiraclesGrantsRouter || router({}),
  }),
  news: newsRouter,
  familyTree: familyTreeRouter,
  documentation: documentationRouter,
  rrbSeed: rrbSeedDataRouter,
  contentScheduler: contentSchedulerRouter,
  rrbUpdate: rrbUpdateOrchestratorRouter,
  teamUpdates: teamUpdatesRouter,
  adRotation: adRotationRouter,
  listenerAnalytics: listenerAnalyticsRouter,
  webhookManager: webhookManagerRouter,
  productionIntegration: productionIntegrationRouter,
  studio: studioRouter,
  convention: conventionRouter,
  squaddGoals: squaddGoalsRouter,
});
