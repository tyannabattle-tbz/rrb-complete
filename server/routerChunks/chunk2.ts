/**
 * Router Chunk 2: Voice, Reporting, Agent Features
 */

import { router } from '../_core/trpc';
import { reportingRouter } from '../routers/reporting';
import { finetuningRouter } from '../routers/finetuning';
import { multiAgentOrchestrationRouter } from '../routers/multiAgentOrchestration';

export const chunk2Router = router({
  reporting: reportingRouter,
  finetuning: finetuningRouter,
  multiAgentOrchestration: multiAgentOrchestrationRouter,
});
