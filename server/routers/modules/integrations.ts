/**
 * Integration & Marketplace Module Router
 * Groups all integration, marketplace, and collaboration-related routers
 */

import { router } from '../../_core/trpc';
import { webhooksRouter } from '../webhooks';
import { webhookIntegrationRouter } from '../webhookIntegrationRouter';
import { integrationMarketplaceRouter } from '../integrationMarketplace';
import { marketplaceRouter } from '../marketplace';
import { templateMarketplaceRouter } from '../templateMarketplace';
import { collaborationRouter } from '../collaborationRouter';
import { collaborationInvitesRouter } from '../collaborationInvites';
import { sessionSharingRouter } from '../sessionSharing';
import { sessionPinningRouter } from '../sessionPinning';
import { feedbackSystemRouter } from '../feedbackSystem';
import { apiIntegrationRouter } from '../apiIntegrationRouter';
import { stripeIntegrationRouter } from '../stripeIntegration';
import { agentCloningRouter } from '../agentCloning';
import { agentManagementRouter } from '../agentManagement';
import { agentVersioningRouter } from '../agentVersioning';
import { agentProfilingRouter } from '../agentProfiling';
import { agentCertificationRouter } from '../agentCertification';
import { agentMarketplaceRouter } from '../agentMarketplace';

export const integrationsRouter = router({
  // Webhooks
  webhooks: webhooksRouter,
  webhookIntegration: webhookIntegrationRouter,

  // Marketplaces
  integrationMarketplace: integrationMarketplaceRouter,
  marketplace: marketplaceRouter,
  templateMarketplace: templateMarketplaceRouter,
  agentMarketplace: agentMarketplaceRouter,

  // Collaboration
  collaboration: collaborationRouter,
  collaborationInvites: collaborationInvitesRouter,
  sessionSharing: sessionSharingRouter,
  sessionPinning: sessionPinningRouter,
  feedback: feedbackSystemRouter,

  // API & Payments
  apiIntegration: apiIntegrationRouter,
  stripe: stripeIntegrationRouter,

  // Agent Management
  agentCloning: agentCloningRouter,
  agentManagement: agentManagementRouter,
  agentVersioning: agentVersioningRouter,
  agentProfiling: agentProfilingRouter,
  agentCertification: agentCertificationRouter,
});
