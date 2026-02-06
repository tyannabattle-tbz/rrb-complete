/**
 * Lazy Router Loader
 * Dynamically loads routers on-demand to prevent TypeScript compiler crash
 * Uses lazy evaluation to avoid resolving all 149 router types at startup
 */

import { router } from './_core/trpc';
import type { AnyRouter } from '@trpc/server';

// Cache for loaded routers
const routerCache = new Map<string, AnyRouter>();

/**
 * Lazy load a router module
 * @param moduleName - Name of the router module
 * @returns Lazy-loaded router or null if not found
 */
async function lazyLoadRouter(moduleName: string): Promise<AnyRouter | null> {
  if (routerCache.has(moduleName)) {
    return routerCache.get(moduleName) || null;
  }

  try {
    // Dynamically import the router
    const module = await import(`./routers/${moduleName}`);
    
    // Find the router export (usually named as {name}Router)
    const routerName = Object.keys(module).find(key => 
      key.includes('Router') || key.includes('router')
    );
    
    if (!routerName) {
      console.warn(`[LazyRouter] No router export found in ${moduleName}`);
      return null;
    }

    const loadedRouter = module[routerName];
    routerCache.set(moduleName, loadedRouter);
    return loadedRouter;
  } catch (error) {
    console.error(`[LazyRouter] Failed to load router ${moduleName}:`, error);
    return null;
  }
}

/**
 * Create a lazy-loading router wrapper
 * Defers router loading until first access
 */
export function createLazyRouter(routerMap: Record<string, string>): AnyRouter {
  const lazyRouters: Record<string, any> = {};

  // Create getters for each router that load on first access
  for (const [key, moduleName] of Object.entries(routerMap)) {
    Object.defineProperty(lazyRouters, key, {
      get: () => {
        // Return a promise that resolves to the router
        return lazyLoadRouter(moduleName);
      },
      configurable: true,
    });
  }

  return router(lazyRouters);
}

/**
 * Preload specific routers to warm up the cache
 * @param moduleNames - Array of module names to preload
 */
export async function preloadRouters(moduleNames: string[]): Promise<void> {
  const promises = moduleNames.map(name => lazyLoadRouter(name));
  await Promise.all(promises);
  console.log(`[LazyRouter] Preloaded ${moduleNames.length} routers`);
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    loadedRouters: routerCache.size,
    cachedModules: Array.from(routerCache.keys()),
  };
}

/**
 * Clear the router cache
 */
export function clearRouterCache(): void {
  routerCache.clear();
  console.log('[LazyRouter] Cache cleared');
}
