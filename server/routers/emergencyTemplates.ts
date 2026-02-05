import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';

/**
 * Emergency Broadcast Templates Router
 * Provides pre-configured alert templates for rapid emergency deployment
 */

interface EmergencyTemplate {
  id: string;
  name: string;
  category: 'weather' | 'evacuation' | 'health' | 'security' | 'utility' | 'custom';
  description: string;
  messageTemplate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  icon: string;
  regions: string[];
  estimatedDuration: number; // minutes
}

const emergencyTemplates: EmergencyTemplate[] = [
  {
    id: 'severe-weather',
    name: 'Severe Weather Alert',
    category: 'weather',
    description: 'Tornado, hurricane, or severe thunderstorm warning',
    messageTemplate: 'SEVERE WEATHER ALERT: {{severity}} {{weatherType}} warning in effect for {{region}}. {{action}}. Stay tuned for updates.',
    priority: 'critical',
    icon: '⛈️',
    regions: ['US', 'Canada'],
    estimatedDuration: 120,
  },
  {
    id: 'evacuation-order',
    name: 'Evacuation Order',
    category: 'evacuation',
    description: 'Mandatory evacuation order issued',
    messageTemplate: 'EVACUATION ORDER: {{evacuationType}} evacuation ordered for {{region}}. {{instructions}}. Report to {{location}}.',
    priority: 'critical',
    icon: '🚨',
    regions: ['US', 'Canada'],
    estimatedDuration: 180,
  },
  {
    id: 'health-emergency',
    name: 'Health Emergency',
    category: 'health',
    description: 'Disease outbreak, contamination, or health crisis',
    messageTemplate: 'HEALTH ALERT: {{healthIssue}} reported in {{region}}. {{precautions}}. Call {{hotline}} for more information.',
    priority: 'high',
    icon: '🏥',
    regions: ['Global'],
    estimatedDuration: 240,
  },
  {
    id: 'security-threat',
    name: 'Security Threat',
    category: 'security',
    description: 'Active shooter, terrorism, or security incident',
    messageTemplate: 'SECURITY ALERT: {{threatType}} in {{region}}. {{action}}. Contact {{authority}} at {{number}}.',
    priority: 'critical',
    icon: '🛡️',
    regions: ['US', 'Canada'],
    estimatedDuration: 120,
  },
  {
    id: 'utility-outage',
    name: 'Utility Outage',
    category: 'utility',
    description: 'Power, water, or gas service disruption',
    messageTemplate: 'UTILITY OUTAGE: {{utilityType}} service disrupted in {{region}}. Estimated restoration: {{time}}. {{alternatives}}',
    priority: 'medium',
    icon: '⚡',
    regions: ['US', 'Canada'],
    estimatedDuration: 240,
  },
  {
    id: 'amber-alert',
    name: 'AMBER Alert',
    category: 'security',
    description: 'Missing child alert',
    messageTemplate: 'AMBER ALERT: Missing child {{name}}, age {{age}}. Last seen {{location}}. Vehicle: {{vehicle}}. Contact {{number}}.',
    priority: 'critical',
    icon: '👶',
    regions: ['US', 'Canada'],
    estimatedDuration: 240,
  },
  {
    id: 'civil-unrest',
    name: 'Civil Unrest',
    category: 'security',
    description: 'Riots, protests, or civil disturbance',
    messageTemplate: 'ALERT: Civil unrest reported in {{region}}. {{action}}. Avoid {{location}}. Stay informed.',
    priority: 'high',
    icon: '🚔',
    regions: ['US', 'Canada'],
    estimatedDuration: 120,
  },
];

export const emergencyTemplatesRouter = router({
  /**
   * Get all emergency templates
   */
  getTemplates: publicProcedure.query(async () => {
    return emergencyTemplates;
  }),

  /**
   * Get templates by category
   */
  getTemplatesByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      return emergencyTemplates.filter(t => t.category === input.category);
    }),

  /**
   * Get templates by priority
   */
  getTemplatesByPriority: publicProcedure
    .input(z.object({ priority: z.string() }))
    .query(async ({ input }) => {
      return emergencyTemplates.filter(t => t.priority === input.priority);
    }),

  /**
   * Get template by ID
   */
  getTemplate: publicProcedure
    .input(z.object({ templateId: z.string() }))
    .query(async ({ input }) => {
      return emergencyTemplates.find(t => t.id === input.templateId);
    }),

  /**
   * Generate emergency message from template
   */
  generateMessage: publicProcedure
    .input(
      z.object({
        templateId: z.string(),
        variables: z.record(z.string(), z.any()),
      })
    )
    .query(async ({ input }: any) => {
      const template = emergencyTemplates.find(t => t.id === input.templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      let message = template.messageTemplate;
      Object.entries(input.variables).forEach(([key, value]) => {
        message = message.replace(`{{${key}}}`, String(value));
      });

      return {
        success: true,
        message,
        template: template.name,
        priority: template.priority,
      };
    }),

  /**
   * Deploy emergency broadcast (admin only)
   */
  deployBroadcast: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        variables: z.record(z.string(), z.any()),
        regions: z.array(z.string()),
        duration: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      // Check admin role
      if (ctx.user.role !== 'admin') {
        throw new Error('Only admins can deploy emergency broadcasts');
      }

      const template = emergencyTemplates.find(t => t.id === input.templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Generate message
      let message = template.messageTemplate;
      Object.entries(input.variables).forEach(([key, value]) => {
        message = message.replace(`{{${key}}}`, String(value));
      });

      const decisionId = `broadcast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      console.log(`[EmergencyTemplates] Emergency broadcast deployed`, {
        decisionId,
        template: template.name,
        priority: template.priority,
        regions: input.regions,
        duration: input.duration || template.estimatedDuration,
        deployedBy: ctx.user.id,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        decisionId,
        broadcastId: `broadcast-${Date.now()}`,
        message,
        template: template.name,
        priority: template.priority,
        regions: input.regions,
        duration: input.duration || template.estimatedDuration,
        deployedAt: new Date().toISOString(),
      };
    }),

  /**
   * Get emergency categories
   */
  getCategories: publicProcedure.query(async () => {
    const categories = new Set(emergencyTemplates.map(t => t.category));
    return Array.from(categories);
  }),

  /**
   * Get priority levels
   */
  getPriorities: publicProcedure.query(async () => {
    return ['low', 'medium', 'high', 'critical'];
  }),

  /**
   * Search templates
   */
  searchTemplates: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }: any) => {
      const query = input.query.toLowerCase();
      return emergencyTemplates.filter(
        t =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
      );
    }),

  /**
   * Get template statistics
   */
  getStats: publicProcedure.query(async () => {
    const byCategory = emergencyTemplates.reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byPriority = emergencyTemplates.reduce(
      (acc, t) => {
        acc[t.priority] = (acc[t.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalTemplates: emergencyTemplates.length,
      byCategory,
      byPriority,
      averageEstimatedDuration:
        emergencyTemplates.reduce((sum, t) => sum + t.estimatedDuration, 0) /
        emergencyTemplates.length,
    };
  }),
});
