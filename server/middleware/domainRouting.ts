/**
 * Domain Routing Middleware
 * Routes requests to appropriate platform based on domain
 */

import { Request, Response, NextFunction } from 'express';

export interface DomainConfig {
  domain: string;
  platformId: string;
  platformName: string;
  interfaceType: 'public' | 'broadcaster' | 'admin';
  color: string;
}

// Domain configurations
const domainConfigs: DomainConfig[] = [
  {
    domain: 'rockinrockinboogie.manus.space',
    platformId: 'rrb',
    platformName: 'Rockin Rockin Boogie',
    interfaceType: 'public',
    color: 'bg-orange-600',
  },
  {
    domain: 'squadd.manus.space',
    platformId: 'squadd',
    platformName: 'SQUADD',
    interfaceType: 'broadcaster',
    color: 'bg-red-600',
  },
  {
    domain: 'solbones.manus.space',
    platformId: 'solbones',
    platformName: 'Solbones Podcast',
    interfaceType: 'broadcaster',
    color: 'bg-purple-600',
  },
];

/**
 * Get domain config from request
 */
export function getDomainConfig(req: Request): DomainConfig | undefined {
  const host = req.get('host')?.split(':')[0];
  return domainConfigs.find((config) => config.domain === host || host?.includes(config.platformId));
}

/**
 * Domain routing middleware
 */
export function domainRoutingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const domainConfig = getDomainConfig(req);

  if (domainConfig) {
    // Attach domain config to request
    (req as any).domainConfig = domainConfig;
    (req as any).platformId = domainConfig.platformId;
    (req as any).interfaceType = domainConfig.interfaceType;

    console.log(
      `[Domain Routing] ${req.method} ${req.path} → ${domainConfig.platformName} (${domainConfig.interfaceType})`
    );
  }

  next();
}

/**
 * Get all domain configs
 */
export function getAllDomainConfigs(): DomainConfig[] {
  return domainConfigs;
}

/**
 * Get domain config by platform ID
 */
export function getDomainConfigByPlatformId(platformId: string): DomainConfig | undefined {
  return domainConfigs.find((config) => config.platformId === platformId);
}

/**
 * Get platform ID from domain
 */
export function getPlatformIdFromDomain(domain: string): string | undefined {
  const config = domainConfigs.find(
    (c) => c.domain === domain || domain.includes(c.platformId)
  );
  return config?.platformId;
}

/**
 * Check if domain is public interface
 */
export function isPublicInterface(req: Request): boolean {
  const domainConfig = (req as any).domainConfig as DomainConfig | undefined;
  return domainConfig?.interfaceType === 'public';
}

/**
 * Check if domain is broadcaster interface
 */
export function isBroadcasterInterface(req: Request): boolean {
  const domainConfig = (req as any).domainConfig as DomainConfig | undefined;
  return domainConfig?.interfaceType === 'broadcaster';
}

/**
 * Check if domain is admin interface
 */
export function isAdminInterface(req: Request): boolean {
  const domainConfig = (req as any).domainConfig as DomainConfig | undefined;
  return domainConfig?.interfaceType === 'admin';
}

/**
 * Get platform ID from request
 */
export function getPlatformIdFromRequest(req: Request): string | undefined {
  return (req as any).platformId;
}

/**
 * Get domain config from request
 */
export function getDomainConfigFromRequest(req: Request): DomainConfig | undefined {
  return (req as any).domainConfig;
}
