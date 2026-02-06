/**
 * Infrastructure Module Router
 * Groups all infrastructure, operations, and platform-related routers
 */

import { router } from '../../_core/trpc';
import { agentInfrastructureRouter } from '../agentInfrastructure';
import { infrastructurePlatformRouter } from '../infrastructurePlatform';
import { productionInfrastructureRouter } from '../productionInfrastructure';
import { operationsPlatformRouter } from '../operationsPlatform';
import { finalOperationsRouter } from '../finalOperations';
import { performanceTestingRouter } from '../performanceTesting';
import { monitoringRouter } from '../monitoring';
import { monitoringActionsRouter } from '../monitoringActions';
import { alertRulesEngineRouter } from '../alertRulesEngine';
import { anomalyDetectionRouter } from '../anomalyDetection';
import { predictiveAlertsRouter } from '../predictiveAlerts';
import { suppressionRulesRouter } from '../suppressionRules';
import { multiTenancyRouter } from '../multiTenancy';
import { securityRouter } from '../securityRouter';
import { errorHandlingRouter } from '../errorHandlingRouter';
import { optimizationRouter } from '../optimizationRouter';

export const infrastructureRouter = router({
  // Agent Infrastructure
  agentInfrastructure: agentInfrastructureRouter,
  infrastructure: infrastructurePlatformRouter,
  productionInfrastructure: productionInfrastructureRouter,

  // Operations
  operations: operationsPlatformRouter,
  finalOperations: finalOperationsRouter,

  // Monitoring & Alerts
  monitoring: monitoringRouter,
  monitoringActions: monitoringActionsRouter,
  alertRules: alertRulesEngineRouter,
  anomalyDetection: anomalyDetectionRouter,
  predictiveAlerts: predictiveAlertsRouter,
  suppressionRules: suppressionRulesRouter,

  // Performance & Testing
  performanceTesting: performanceTestingRouter,

  // Multi-Tenancy & Security
  multiTenancy: multiTenancyRouter,
  security: securityRouter,
  errorHandling: errorHandlingRouter,
  optimization: optimizationRouter,
});
