import { describe, it, expect } from 'vitest';

describe('socialMediaQueueRouter', () => {
  it('should export a valid router with expected procedures', async () => {
    const { socialMediaQueueRouter } = await import('./socialMediaQueueRouter');
    expect(socialMediaQueueRouter).toBeDefined();
    expect(socialMediaQueueRouter._def).toBeDefined();
    
    const procedures = socialMediaQueueRouter._def.procedures;
    expect(procedures).toBeDefined();
    
    // Verify all expected procedures exist
    expect(procedures.listPosts).toBeDefined();
    expect(procedures.retryPost).toBeDefined();
    expect(procedures.retryAllFailed).toBeDefined();
    expect(procedures.deletePost).toBeDefined();
    expect(procedures.validateCredentials).toBeDefined();
    expect(procedures.getStats).toBeDefined();
  }, 30000);

  it('should have correct procedure types', async () => {
    const { socialMediaQueueRouter } = await import('./socialMediaQueueRouter');
    const procedures = socialMediaQueueRouter._def.procedures;
    
    // listPosts and validateCredentials and getStats should be queries
    expect(procedures.listPosts._def.type).toBe('query');
    expect(procedures.validateCredentials._def.type).toBe('query');
    expect(procedures.getStats._def.type).toBe('query');
    
    // retryPost, retryAllFailed, deletePost should be mutations
    expect(procedures.retryPost._def.type).toBe('mutation');
    expect(procedures.retryAllFailed._def.type).toBe('mutation');
    expect(procedures.deletePost._def.type).toBe('mutation');
  }, 30000);
});
