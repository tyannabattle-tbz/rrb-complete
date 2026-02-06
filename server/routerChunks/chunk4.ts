/**
 * Router Chunk 4: Real-time & Alerts
 */

import { router } from '../_core/trpc';
import { notificationSystemRouter } from '../routers/notificationSystemRouter';
import { realtimeUpdatesRouter } from '../routers/realtimeUpdatesRouter';
import { websocketRouter } from '../routers/websocket';
import { emergencyAlertsRouter } from '../routers/emergencyAlerts';
// import { alertBroadcastingRouter } from '../routers/alertBroadcasting'; // Disabled: missing schema

export const chunk4Router = router({
  notifications: notificationSystemRouter,
  realtime: realtimeUpdatesRouter,
  websocket: websocketRouter,
  emergencyAlerts: emergencyAlertsRouter,
  // alertBroadcasting: alertBroadcastingRouter, // Disabled: missing schema
});
