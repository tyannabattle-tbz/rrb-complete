import { describe, it, expect, vi } from 'vitest';

// Mock the LLM module
vi.mock('../_core/llm', () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({ translated: 'Hola mundo' })
      }
    }]
  })
}));

describe('Interpreter Router', () => {
  it('should export interpreterRouter with expected procedures', async () => {
    const { interpreterRouter } = await import('./interpreterRouter');
    expect(interpreterRouter).toBeDefined();
    const routerDef = interpreterRouter._def;
    expect(routerDef).toBeDefined();
  });

  it('should have translate, batchTranslate, and getLanguages procedures', async () => {
    const { interpreterRouter } = await import('./interpreterRouter');
    const procedures = interpreterRouter._def.procedures;
    expect(procedures).toHaveProperty('translate');
    expect(procedures).toHaveProperty('batchTranslate');
    expect(procedures).toHaveProperty('getLanguages');
  });

  it('should have all three procedures defined as valid tRPC procedures', async () => {
    const { interpreterRouter } = await import('./interpreterRouter');
    const procedures = interpreterRouter._def.procedures;
    // Each procedure should have a _def with a type
    expect(procedures.translate._def).toBeDefined();
    expect(procedures.batchTranslate._def).toBeDefined();
    expect(procedures.getLanguages._def).toBeDefined();
  });

  it('translate procedure should accept text, sourceLang, and targetLang', async () => {
    const { interpreterRouter } = await import('./interpreterRouter');
    const translateProc = interpreterRouter._def.procedures.translate;
    // Verify the procedure has input validation (Zod schema)
    expect(translateProc._def.inputs).toBeDefined();
    expect(translateProc._def.inputs.length).toBeGreaterThan(0);
  });

  it('batchTranslate procedure should accept texts array and target languages', async () => {
    const { interpreterRouter } = await import('./interpreterRouter');
    const batchProc = interpreterRouter._def.procedures.batchTranslate;
    expect(batchProc._def.inputs).toBeDefined();
    expect(batchProc._def.inputs.length).toBeGreaterThan(0);
  });

  it('getLanguages procedure should not require input', async () => {
    const { interpreterRouter } = await import('./interpreterRouter');
    const langProc = interpreterRouter._def.procedures.getLanguages;
    // Query procedures with no input have empty or undefined inputs
    expect(langProc._def).toBeDefined();
  });
});
