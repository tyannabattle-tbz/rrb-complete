/**
 * Admin & Compliance Module Router
 * Groups all admin, compliance, and management-related routers
 */

import { router } from '../../_core/trpc';
import { adminRouter } from '../admin';
import { adminDashboardRouter } from '../adminDashboard';
import { customDashboardsRouter } from '../customDashboards';
import { customDashboardBuilderRouter } from '../customDashboardBuilder';
import { analyticsDashboardRouter } from '../analyticsDashboard';
import { realtimeDashboardRouter } from '../realtimeDashboardRouter';
import { userManagementRouter } from '../userManagementRouter';
import { rateLimitingRouter } from '../rateLimiting';
import { usageQuotasRouter } from '../usageQuotasRouter';
import { billingRouter } from '../billingRouter';
import { auditTrailUIRouter } from '../auditTrailUI';
import { automatedReportsRouter } from '../automatedReports';
import { scheduledExportRouter } from '../scheduledExportRouter';
import { webhookAlertsRouter } from '../webhookAlerts';
import { budgetEnforcementRouter } from '../budgetEnforcement';
import { tokenBudgetingRouter } from '../tokenBudgeting';

export const adminComplianceRouter = router({
  // Admin Dashboards
  admin: adminRouter,
  adminDashboard: adminDashboardRouter,
  customDashboards: customDashboardsRouter,
  customDashboardBuilder: customDashboardBuilderRouter,
  analyticsDashboard: analyticsDashboardRouter,
  realtimeDashboard: realtimeDashboardRouter,

  // User & Access Management
  userManagement: userManagementRouter,
  rateLimiting: rateLimitingRouter,
  usageQuotas: usageQuotasRouter,

  // Billing & Budget
  billing: billingRouter,
  budgetEnforcement: budgetEnforcementRouter,
  tokenBudgeting: tokenBudgetingRouter,

  // Compliance & Reporting
  auditTrail: auditTrailUIRouter,
  automatedReports: automatedReportsRouter,
  scheduledExport: scheduledExportRouter,
  webhookAlerts: webhookAlertsRouter,
});
