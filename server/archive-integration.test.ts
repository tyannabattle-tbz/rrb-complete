import { describe, it, expect } from 'vitest';

// ── Test: News Router Structure ──
describe('News Router', () => {
  it('should export newsRouter with correct procedures', async () => {
    const { newsRouter } = await import('./routers/newsRouter');
    expect(newsRouter).toBeDefined();
    expect(newsRouter._def).toBeDefined();
    // Check router has expected procedures
    const procedures = Object.keys(newsRouter._def.procedures || newsRouter._def.record || {});
    expect(procedures).toContain('list');
    expect(procedures).toContain('breaking');
    expect(procedures).toContain('featured');
    expect(procedures).toContain('getBySlug');
    expect(procedures).toContain('create');
  });

  it('should have 5 procedures total', async () => {
    const { newsRouter } = await import('./routers/newsRouter');
    const procedures = Object.keys(newsRouter._def.procedures || newsRouter._def.record || {});
    expect(procedures.length).toBe(5);
  });
});

// ── Test: Family Tree Router Structure ──
describe('Family Tree Router', () => {
  it('should export familyTreeRouter with correct procedures', async () => {
    const { familyTreeRouter } = await import('./routers/familyTreeRouter');
    expect(familyTreeRouter).toBeDefined();
    const procedures = Object.keys(familyTreeRouter._def.procedures || familyTreeRouter._def.record || {});
    expect(procedures).toContain('list');
    expect(procedures).toContain('roots');
    expect(procedures).toContain('children');
    expect(procedures).toContain('keyFigures');
    expect(procedures).toContain('getById');
    expect(procedures).toContain('create');
    expect(procedures).toContain('update');
  });

  it('should have 7 procedures total', async () => {
    const { familyTreeRouter } = await import('./routers/familyTreeRouter');
    const procedures = Object.keys(familyTreeRouter._def.procedures || familyTreeRouter._def.record || {});
    expect(procedures.length).toBe(7);
  });
});

// ── Test: Documentation Router Structure ──
describe('Documentation Router', () => {
  it('should export documentationRouter with correct procedures', async () => {
    const { documentationRouter } = await import('./routers/documentationRouter');
    expect(documentationRouter).toBeDefined();
    const procedures = Object.keys(documentationRouter._def.procedures || documentationRouter._def.record || {});
    expect(procedures).toContain('list');
    expect(procedures).toContain('getBySlug');
    expect(procedures).toContain('categories');
    expect(procedures).toContain('create');
    expect(procedures).toContain('update');
  });

  it('should have 5 procedures total', async () => {
    const { documentationRouter } = await import('./routers/documentationRouter');
    const procedures = Object.keys(documentationRouter._def.procedures || documentationRouter._def.record || {});
    expect(procedures.length).toBe(5);
  });
});

// ── Test: Schema Tables ──
describe('Drizzle Schema Tables', () => {
  it('should export newsArticles table', async () => {
    const schema = await import('../drizzle/schema');
    expect(schema.newsArticles).toBeDefined();
  });

  it('should export familyTree table', async () => {
    const schema = await import('../drizzle/schema');
    expect(schema.familyTree).toBeDefined();
  });

  it('should export documentationPages table', async () => {
    const schema = await import('../drizzle/schema');
    expect(schema.documentationPages).toBeDefined();
  });

  it('newsArticles should have required columns', async () => {
    const schema = await import('../drizzle/schema');
    const table = schema.newsArticles;
    // Check that the table has the expected column names
    const columns = Object.keys(table);
    expect(columns).toContain('id');
    expect(columns).toContain('title');
    expect(columns).toContain('slug');
    expect(columns).toContain('category');
    expect(columns).toContain('isBreaking');
    expect(columns).toContain('isFeatured');
  });

  it('familyTree should have required columns', async () => {
    const schema = await import('../drizzle/schema');
    const columns = Object.keys(schema.familyTree);
    expect(columns).toContain('id');
    expect(columns).toContain('name');
    expect(columns).toContain('relationship');
    expect(columns).toContain('generation');
    expect(columns).toContain('isKeyFigure');
    expect(columns).toContain('parentId');
  });

  it('documentationPages should have required columns', async () => {
    const schema = await import('../drizzle/schema');
    const columns = Object.keys(schema.documentationPages);
    expect(columns).toContain('id');
    expect(columns).toContain('title');
    expect(columns).toContain('slug');
    expect(columns).toContain('category');
    expect(columns).toContain('sortOrder');
    expect(columns).toContain('isPublished');
  });
});

// ── Test: Chunk5 Router Integration ──
describe('Chunk5 Router Integration', () => {
  it('should include news, familyTree, and documentation routers', async () => {
    const { chunk5Router } = await import('./routerChunks/chunk5');
    expect(chunk5Router).toBeDefined();
    const keys = Object.keys(chunk5Router._def.procedures || chunk5Router._def.record || {});
    // These should be nested routers, so check for the namespace
    expect(keys.some(k => k.startsWith('news'))).toBe(true);
    expect(keys.some(k => k.startsWith('familyTree'))).toBe(true);
    expect(keys.some(k => k.startsWith('documentation'))).toBe(true);
  });
});

// ── Test: QUMUS 13 Policies (from orchestration engine) ──
describe('QUMUS Orchestration Engine - 13 Policies', () => {
  it('should have exactly 13 policies', async () => {
    const { qumusEngine } = await import('./qumus-orchestration');
    const policies = qumusEngine.getPolicies();
    expect(policies.length).toBe(13);
  });

  it('should include all 5 new ecosystem policies', async () => {
    const { qumusEngine } = await import('./qumus-orchestration');
    const policies = qumusEngine.getPolicies();
    const policyIds = policies.map((p: any) => p.id);
    expect(policyIds).toContain('policy_content_scheduling');
    expect(policyIds).toContain('policy_broadcast_management');
    expect(policyIds).toContain('policy_emergency_response');
    expect(policyIds).toContain('policy_community_engagement');
    expect(policyIds).toContain('policy_code_maintenance');
  });
});

// ── Test: QUMUS Policy Registry (12 frontend policies) ──
describe('QUMUS Policy Registry - 12 Frontend Policies', () => {
  it('should export POLICY_REGISTRY with 12 policies', async () => {
    const { POLICY_REGISTRY } = await import('./qumusPolicies');
    expect(POLICY_REGISTRY).toBeDefined();
    expect(Array.isArray(POLICY_REGISTRY)).toBe(true);
    expect(POLICY_REGISTRY.length).toBe(12);
  });

  it('should include all ecosystem policies', async () => {
    const { POLICY_REGISTRY } = await import('./qumusPolicies');
    const ids = POLICY_REGISTRY.map((p: any) => p.id);
    expect(ids).toContain('content_scheduling');
    expect(ids).toContain('broadcast_management');
    expect(ids).toContain('emergency_response');
    expect(ids).toContain('community_engagement');
    expect(ids).toContain('code_maintenance');
  });
});
