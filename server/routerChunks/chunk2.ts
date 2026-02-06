/**
 * Router Chunk 2: Voice, Reporting, Agent Features
 */

import { router } from '../_core/trpc';
import { voiceRouter } from '../routers/voiceRouter';
import { reportingRouter } from '../routers/reporting';
import { finetuningRouter } from '../routers/finetuning';
import { orchestrationRouter } from '../routers/orchestration';
import { multiAgentOrchestrationRouter } from '../routers/multiAgentOrchestration';
import { persistenceRouter } from '../routers/persistence';

export const chunk2Router = router({
  voice: voiceRouter,
  reporting: reportingRouter,
  finetuning: finetuningRouter,
  orchestration: orchestrationRouter,
  multiAgentOrchestration: multiAgentOrchestrationRouter,
  persistence: persistenceRouter,
});
