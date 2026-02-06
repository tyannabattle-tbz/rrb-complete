/**
 * Router Chunk 3: Batch Processing & Media
 */

import { router } from '../_core/trpc';
import { editingPresetsRouter } from '../routers/editingPresets';
import { recordingManagementRouter } from '../routers/recordingManagement';

export const chunk3Router = router({
  editingPresets: editingPresetsRouter,
  recordingManagement: recordingManagementRouter,
});
