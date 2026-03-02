import { describe, it, expect } from 'vitest';
import {
  parseScript,
  generateSceneBreakdown,
  createStoryboard,
} from './storyboarding';

describe('AI Storyboarding Engine', () => {
  const sampleScript = `INT. COFFEE SHOP - DAY

A mysterious figure enters. The camera pans across the crowded cafe.

JOHN
What brings you here?

SARAH
I need your help.

EXT. CITY STREET - NIGHT

They walk together through the neon-lit streets. Thunder rumbles.

JOHN
This is dangerous.

SARAH
I know.`;

  describe('parseScript', () => {
    it('should extract title from script', () => {
      const analysis = parseScript(sampleScript);
      expect(analysis.title).toBeDefined();
      expect(analysis.title.length).toBeGreaterThan(0);
    });

    it('should extract characters', () => {
      const analysis = parseScript(sampleScript);
      expect(analysis.characters).toContain('JOHN');
      expect(analysis.characters).toContain('SARAH');
    });

    it('should extract locations', () => {
      const analysis = parseScript(sampleScript);
      expect(analysis.locations.length).toBeGreaterThan(0);
    });

    it('should estimate duration', () => {
      const analysis = parseScript(sampleScript);
      expect(analysis.duration).toBeGreaterThan(0);
    });

    it('should detect genre', () => {
      const analysis = parseScript(sampleScript);
      expect(analysis.genre).toBeDefined();
      expect(['Drama', 'Action', 'Comedy', 'Horror', 'Romance']).toContain(
        analysis.genre
      );
    });

    it('should extract themes', () => {
      const analysis = parseScript(sampleScript);
      expect(analysis.themes).toBeDefined();
      expect(analysis.themes.length).toBeGreaterThan(0);
    });
  });

  describe('generateSceneBreakdown', () => {
    it('should generate scenes from script', () => {
      const scenes = generateSceneBreakdown(sampleScript);
      expect(scenes.length).toBeGreaterThan(0);
    });

    it('should generate valid scenes with required properties', () => {
      const scenes = generateSceneBreakdown(sampleScript);

      for (const scene of scenes) {
        expect(scene.id).toBeDefined();
        expect(scene.sceneNumber).toBeGreaterThan(0);
        expect(scene.title).toBeDefined();
        expect(scene.location).toBeDefined();
        expect(scene.duration).toBeGreaterThan(0);
        expect(scene.shots).toBeDefined();
        expect(scene.shots.length).toBeGreaterThan(0);
      }
    });

    it('should generate shots for each scene', () => {
      const scenes = generateSceneBreakdown(sampleScript);

      for (const scene of scenes) {
        expect(scene.shots.length).toBeGreaterThan(0);

        for (const shot of scene.shots) {
          expect(shot.shotNumber).toBeGreaterThan(0);
          expect(shot.composition).toBeDefined();
          expect(['wide', 'medium', 'close-up', 'extreme close-up']).toContain(
            shot.composition
          );
          expect(shot.angle).toBeDefined();
          expect(shot.movement).toBeDefined();
          expect(shot.duration).toBeGreaterThan(0);
        }
      }
    });

    it('should assign mood to scenes', () => {
      const scenes = generateSceneBreakdown(sampleScript);

      for (const scene of scenes) {
        expect(scene.mood).toBeDefined();
        expect([
          'Dark',
          'Lighthearted',
          'Melancholic',
          'Intense',
          'Romantic',
          'Neutral',
        ]).toContain(scene.mood);
      }
    });

    it('should generate lighting suggestions', () => {
      const scenes = generateSceneBreakdown(sampleScript);

      for (const scene of scenes) {
        expect(scene.lighting).toBeDefined();
        expect(scene.lighting.length).toBeGreaterThan(0);
      }
    });

    it('should generate sound design suggestions', () => {
      const scenes = generateSceneBreakdown(sampleScript);

      for (const scene of scenes) {
        expect(scene.soundDesign).toBeDefined();
        expect(scene.soundDesign.length).toBeGreaterThan(0);
      }
    });

    it('should generate image prompts', () => {
      const scenes = generateSceneBreakdown(sampleScript);

      for (const scene of scenes) {
        expect(scene.imagePrompt).toBeDefined();
        expect(scene.imagePrompt?.length).toBeGreaterThan(0);
      }
    });
  });

  describe('createStoryboard', () => {
    it('should create complete storyboard', () => {
      const storyboard = createStoryboard(sampleScript);

      expect(storyboard.id).toBeDefined();
      expect(storyboard.title).toBeDefined();
      expect(storyboard.scenes).toBeDefined();
      expect(storyboard.scenes.length).toBeGreaterThan(0);
      expect(storyboard.totalDuration).toBeGreaterThan(0);
    });

    it('should include metadata in storyboard', () => {
      const storyboard = createStoryboard(sampleScript);

      expect(storyboard.metadata).toBeDefined();
      expect(storyboard.metadata.genre).toBeDefined();
      expect(storyboard.metadata.colorPalette).toBeDefined();
      expect(storyboard.metadata.colorPalette.length).toBeGreaterThan(0);
    });

    it('should calculate total duration correctly', () => {
      const storyboard = createStoryboard(sampleScript);

      const calculatedDuration = storyboard.scenes.reduce(
        (sum, scene) => sum + scene.duration,
        0
      );

      expect(storyboard.totalDuration).toBe(calculatedDuration);
    });

    it('should set timestamps', () => {
      const storyboard = createStoryboard(sampleScript);

      expect(storyboard.createdAt).toBeDefined();
      expect(storyboard.updatedAt).toBeDefined();
      expect(storyboard.createdAt instanceof Date).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty script', () => {
      const scenes = generateSceneBreakdown('');
      expect(scenes).toBeDefined();
    });

    it('should handle script without dialogue', () => {
      const silentScript = `INT. FOREST - DAY

A lone figure walks through the trees.`;

      const scenes = generateSceneBreakdown(silentScript);
      expect(scenes.length).toBeGreaterThan(0);
    });

    it('should handle script with minimal content', () => {
      const minimalScript = `INT. ROOM - DAY`;

      const scenes = generateSceneBreakdown(minimalScript);
      expect(scenes).toBeDefined();
    });
  });
});
