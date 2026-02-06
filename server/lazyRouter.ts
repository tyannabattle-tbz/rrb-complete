/**
 * Router Lazy-Loading System
 * Splits large router definitions into smaller chunks that load on-demand
 * Reduces TypeScript compilation burden and improves dev server startup time
 */

import { router } from './_core/trpc';

// Cache for loaded routers to avoid re-importing
const routerCache = new Map<string, any>();

/**
 * Lazy load a router module on-demand
 * @param moduleName - Name of the router module (e.g., 'podcastPlayback', 'videoStreaming')
 * @returns The loaded router instance
 */
export async function loadRouterModule(moduleName: string): Promise<any> {
  if (routerCache.has(moduleName)) {
    return routerCache.get(moduleName);
  }

  try {
    // Dynamically import the router module
    const module = await import(`./${moduleName}`);
    const routerInstance = module[`${moduleName}Router`] || module.default;
    
    if (!routerInstance) {
      console.warn(`[LazyRouter] Router not found in module: ${moduleName}`);
      return null;
    }

    // Cache the loaded router
    routerCache.set(moduleName, routerInstance);
    return routerInstance;
  } catch (error) {
    console.error(`[LazyRouter] Failed to load router module: ${moduleName}`, error);
    return null;
  }
}

/**
 * Preload multiple router modules in parallel
 * @param moduleNames - Array of router module names to preload
 */
export async function preloadRouters(moduleNames: string[]): Promise<void> {
  const loadPromises = moduleNames.map(name => loadRouterModule(name));
  await Promise.all(loadPromises);
  console.log(`[LazyRouter] Preloaded ${moduleNames.length} router modules`);
}

/**
 * Create a lazy-loaded router group
 * Routers in the group are loaded on first access
 */
export function createLazyRouterGroup(
  groupName: string,
  moduleNames: string[]
): any {
  const lazyRouters: Record<string, any> = {};

  // Create proxy getters for each router
  for (const moduleName of moduleNames) {
    Object.defineProperty(lazyRouters, moduleName, {
      get: async () => {
        return loadRouterModule(moduleName);
      },
      configurable: true,
    });
  }

  return router(lazyRouters);
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats(): {
  loadedRouters: number;
  cachedModules: string[];
} {
  return {
    loadedRouters: routerCache.size,
    cachedModules: Array.from(routerCache.keys()),
  };
}

/**
 * Clear router cache (useful for testing or hot reload)
 */
export function clearRouterCache(): void {
  routerCache.clear();
  console.log('[LazyRouter] Router cache cleared');
}
