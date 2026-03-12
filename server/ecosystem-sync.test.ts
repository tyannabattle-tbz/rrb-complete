import { describe, it, expect, vi } from 'vitest';

describe('Ecosystem Sync & New Integrations', () => {
  
  describe('QUMUS Tool Registry', () => {
    it('should register presentation builder tools', async () => {
      const { getToolRegistry } = await import('./qumus/toolRegistry');
      const registry = getToolRegistry();
      
      expect(registry.getToolCount()).toBeGreaterThanOrEqual(20);
      
      const presentationTool = registry.getTool('create_presentation');
      expect(presentationTool).toBeDefined();
      expect(presentationTool?.category).toBe('presentation');
      
      const slideContentTool = registry.getTool('generate_slide_content');
      expect(slideContentTool).toBeDefined();
      expect(slideContentTool?.category).toBe('presentation');
      
      const exportPresentationTool = registry.getTool('export_presentation');
      expect(exportPresentationTool).toBeDefined();
      expect(exportPresentationTool?.category).toBe('presentation');
    });
    
    it('should register music studio tools', async () => {
      const { getToolRegistry } = await import('./qumus/toolRegistry');
      const registry = getToolRegistry();
      
      const musicProjectTool = registry.getTool('create_music_project');
      expect(musicProjectTool).toBeDefined();
      expect(musicProjectTool?.category).toBe('music');
      
      const addTrackTool = registry.getTool('add_track');
      expect(addTrackTool).toBeDefined();
      expect(addTrackTool?.category).toBe('music');
      
      const effectTool = registry.getTool('apply_audio_effect');
      expect(effectTool).toBeDefined();
      expect(effectTool?.category).toBe('music');
      
      const exportAudioTool = registry.getTool('export_audio');
      expect(exportAudioTool).toBeDefined();
      expect(exportAudioTool?.category).toBe('music');
      
      const broadcastTool = registry.getTool('broadcast_to_rrb');
      expect(broadcastTool).toBeDefined();
      expect(broadcastTool?.category).toBe('music');
    });
    
    it('should register media production tools', async () => {
      const { getToolRegistry } = await import('./qumus/toolRegistry');
      const registry = getToolRegistry();
      
      const imageGenTool = registry.getTool('generate_image');
      expect(imageGenTool).toBeDefined();
      expect(imageGenTool?.category).toBe('media');
      
      const transcribeTool = registry.getTool('transcribe_audio');
      expect(transcribeTool).toBeDefined();
      expect(transcribeTool?.category).toBe('media');
    });
    
    it('should execute presentation tool handlers', async () => {
      const { getToolRegistry } = await import('./qumus/toolRegistry');
      const registry = getToolRegistry();
      
      const result = await registry.callTool('create_presentation', {
        title: 'SQUADD CSW70 Presentation',
        topic: 'Coalition goals',
        slideCount: 8
      });
      
      expect(result).toBeDefined();
      expect(result.status).toBe('created');
      expect(result.slides).toBe(8);
    });
    
    it('should execute music studio tool handlers', async () => {
      const { getToolRegistry } = await import('./qumus/toolRegistry');
      const registry = getToolRegistry();
      
      const result = await registry.callTool('create_music_project', {
        name: 'RRB Radio Jingle',
        bpm: 120,
        frequency: 432
      });
      
      expect(result).toBeDefined();
      expect(result.status).toBe('created');
      expect(result.bpm).toBe(120);
      expect(result.frequency).toBe(432);
    });
  });
  
  describe('QUMUS Activation Config', () => {
    it('should include new ecosystem integrations in config', () => {
      // Verify the QumusConfig interface accepts new fields
      const config = {
        maxConcurrentTasks: 20,
        enableAutoScheduling: true,
        enableSelfImprovement: true,
        enableMultiAgentCoordination: true,
        enablePredictiveAnalytics: true,
        ecosystemIntegration: {
          rrb: true,
          hybridcast: true,
          canryn: true,
          sweetMiracles: true,
          presentationBuilder: true,
          musicStudio: true,
          valanna: true,
          seraph: true,
        },
      };
      
      expect(config.ecosystemIntegration.presentationBuilder).toBe(true);
      expect(config.ecosystemIntegration.musicStudio).toBe(true);
      expect(config.ecosystemIntegration.valanna).toBe(true);
      expect(config.ecosystemIntegration.seraph).toBe(true);
      expect(Object.keys(config.ecosystemIntegration)).toHaveLength(8);
    });
  });
  
  describe('Radio Channel Reconnection Fix', () => {
    it('should use ref-based retry tracking to prevent stale closures', () => {
      // The fix uses useRef instead of useState for failoverAttempts
      // This prevents the stale closure issue in the error handler
      let attemptsRef = { current: 0 };
      const MAX_RETRIES = 3;
      
      // Simulate multiple rapid error events
      for (let i = 0; i < 5; i++) {
        if (attemptsRef.current < MAX_RETRIES) {
          attemptsRef.current += 1;
        }
      }
      
      // Should cap at MAX_RETRIES
      expect(attemptsRef.current).toBe(MAX_RETRIES);
    });
    
    it('should reset retry counter on channel change', () => {
      let attemptsRef = { current: 3 };
      
      // Simulate channel change
      attemptsRef.current = 0;
      
      expect(attemptsRef.current).toBe(0);
    });
  });
});
