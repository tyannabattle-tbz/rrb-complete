/**
 * Analytics Module Router
 * Groups all analytics, reporting, and data-related routers
 */

import { router } from '../../_core/trpc';
import { analyticsRouter } from '../analytics';
import { analyticsExportRouter } from '../analyticsExportRouter';
import { analyticsReportingRouter } from '../analyticsReporting';
import { metricsRouter } from '../metrics';
import { performanceAnalyticsRouter } from '../performanceAnalytics';
import { featureAnalyticsRouter } from '../featureAnalyticsRouter';
import { advancedSearchRouter } from '../advancedSearch';
import { conversationSearchRouter } from '../conversationSearch';
import { searchDiscoveryRouter } from '../searchDiscoveryRouter';
import { usageForecastingRouter } from '../usageForecasting';
import { costAttributionRouter } from '../costAttribution';
import { spendingReportsRouter } from '../spendingReports';
import { costTrackingRouter } from '../costTracking';
import { costOptimizationRouter } from '../costOptimizationRouter';
import { chargebackAutomationRouter } from '../chargebackAutomation';

export const analyticsRouter_module = router({
  // Core Analytics
  analytics: analyticsRouter,
  analyticsExport: analyticsExportRouter,
  analyticsReporting: analyticsReportingRouter,
  metrics: metricsRouter,

  // Performance & Features
  performanceAnalytics: performanceAnalyticsRouter,
  featureAnalytics: featureAnalyticsRouter,

  // Search & Discovery
  advancedSearch: advancedSearchRouter,
  conversationSearch: conversationSearchRouter,
  searchDiscovery: searchDiscoveryRouter,

  // Cost & Usage
  usageForecasting: usageForecastingRouter,
  costAttribution: costAttributionRouter,
  spendingReports: spendingReportsRouter,
  costTracking: costTrackingRouter,
  costOptimization: costOptimizationRouter,
  chargebackAutomation: chargebackAutomationRouter,
});
