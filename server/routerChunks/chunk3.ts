/**
 * Router Chunk 3: Batch Processing & Media
 */

import { router } from '../_core/trpc';
import { batchRouter } from '../routers/batchRouter';
import { batchProcessingRouter } from '../routers/batchProcessing';
import { batchTemplatesRouter } from '../routers/batchTemplatesRouter';
import { editingPresetsRouter } from '../routers/editingPresets';
import { recordingManagementRouter } from '../routers/recordingManagement';

export const chunk3Router = router({
  batch: batchRouter,
  batchProcessing: batchProcessingRouter,
  batchTemplates: batchTemplatesRouter,
  editingPresets: editingPresetsRouter,
  recordingManagement: recordingManagementRouter,
});
