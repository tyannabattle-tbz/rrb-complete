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
});
