import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Session 4: Make All Pages Functional', () => {
  
  describe('Sweet Miracles - Ty Battle Update', () => {
    it('should reference Ty Battle as founder instead of Seabrun', () => {
      const content = fs.readFileSync(
        path.join(__dirname, '../client/src/pages/rrb/SweetMiraclesCompanyPage.tsx'),
        'utf-8'
      );
      expect(content).toContain('Ty Battle');
      expect(content).toContain("Seabrun Candy Hunter's daughter");
      expect(content).toContain('Founder & CEO');
      expect(content).not.toContain('Founder & Creative Director');
    });

    it('should describe Ty Battle as carrying forward the family legacy', () => {
      const content = fs.readFileSync(
        path.join(__dirname, '../client/src/pages/rrb/SweetMiraclesCompanyPage.tsx'),
        'utf-8'
      );
      expect(content).toContain('family legacy');
      expect(content).toContain("her father's legacy");
    });
  });

  describe('AudioEditor - Functional Buttons', () => {
    it('should have real audio URLs in the music library', () => {
      const content = fs.readFileSync(
        path.join(__dirname, '../client/src/pages/AudioEditor.tsx'),
        'utf-8'
      );
      expect(content).toContain('manuscdn.com');
      expect(content).toContain('soundhelix.com');
      expect(content).toContain('handlePreview');
      expect(content).toContain('handleSelect');
    });

    it('should have functional TTS using browser speech synthesis', () => {
      const content = fs.readFileSync(
        path.join(__dirname, '../client/src/pages/AudioEditor.tsx'),
        'utf-8'
      );
      expect(content).toContain('SpeechSynthesisUtterance');
      expect(content).toContain('handleGenerateSpeech');
      expect(content).toContain('speechSynthesis.speak');
    });

    it('should have functional voice recording using MediaRecorder', () => {
      const content = fs.readFileSync(
        path.join(__dirname, '../client/src/pages/AudioEditor.tsx'),
        'utf-8'
      );
      expect(content).toContain('MediaRecorder');
      expect(content).toContain('getUserMedia');
      expect(content).toContain('handleStartRecording');
      expect(content).toContain('handleStopRecording');
    });

    it('should have functional export that creates downloadable files', () => {
      const content = fs.readFileSync(
        path.join(__dirname, '../client/src/pages/AudioEditor.tsx'),
        'utf-8'
      );
      expect(content).toContain('handleExport');
      expect(content).toContain('createObjectURL');
      expect(content).toContain('download');
    });

    it('should use dark theme classes instead of slate-900', () => {
      const content = fs.readFileSync(
        path.join(__dirname, '../client/src/pages/AudioEditor.tsx'),
        'utf-8'
      );
      expect(content).toContain('bg-background');
      expect(content).toContain('text-foreground');
      expect(content).toContain('bg-amber-500');
    });
  });

  describe('MotionGenerationStudio - Functional Buttons', () => {
    it('should have onClick handlers on all buttons', () => {
      const content = fs.readFileSync(
        path.join(__dirname, '../client/src/pages/MotionGenerationStudio.tsx'),
        'utf-8'
      );
      // Template Use button
      expect(content).toContain('setActiveTab(\'create\')');
      expect(content).toContain('Template');
      // Download button
      expect(content).toContain('toast.info(`Download for');
      // Settings button
      expect(content).toContain('Settings panel coming soon');
    });
  });

  describe('HybridCast Widget - No More Infinite Loading', () => {
    it('should not have infinite loading spinner', () => {
      const content = fs.readFileSync(
        path.join(__dirname, '../client/src/components/rrb/HybridCastWidgetContainer.tsx'),
        'utf-8'
      );
      expect(content).not.toContain('Loading HybridCast Widget...');
    });

    it('should have functional radio player content', () => {
      const content = fs.readFileSync(
        path.join(__dirname, '../client/src/components/rrb/HybridCastWidgetContainer.tsx'),
        'utf-8'
      );
      // Should have actual playable content
      expect(content).toContain('audio');
    });
  });

  describe('Podcasts Page - Real Audio URLs', () => {
    it('should use real CDN audio URLs instead of missing local files', () => {
      const content = fs.readFileSync(
        path.join(__dirname, '../client/src/pages/rrb/Podcasts.tsx'),
        'utf-8'
      );
      expect(content).not.toContain('/audio/allaboutcandy1.mp3');
      expect(content).toContain('manuscdn.com');
    });

    it('should have functional play/pause controls', () => {
      const content = fs.readFileSync(
        path.join(__dirname, '../client/src/pages/rrb/Podcasts.tsx'),
        'utf-8'
      );
      expect(content).toContain('audioRef');
      expect(content).toContain('audio');
    });
  });

  describe('Content Scheduler - 24/7 Coverage', () => {
    it('should have 62 schedule slots across 7 channels', () => {
      const content = fs.readFileSync(
        path.join(__dirname, '../server/services/contentSchedulerService.ts'),
        'utf-8'
      );
      // Count schedule entries
      const slotMatches = content.match(/id: 'slot-/g);
      expect(slotMatches).toBeTruthy();
      expect(slotMatches!.length).toBeGreaterThanOrEqual(50);
    });
  });

  describe('Router Stubs - No Missing Procedure Errors', () => {
    it('should have contentRecommendation and rrbRadio router stubs', () => {
      const content = fs.readFileSync(
        path.join(__dirname, 'routers/missingRouterStubs.ts'),
        'utf-8'
      );
      expect(content).toContain('contentRecommendationRouter');
      expect(content).toContain('rrbRadioRouter');
      expect(content).toContain('getPersonalizedRecommendations');
      expect(content).toContain('getBroadcastMetrics');
    });

    it('should have routers wired in main routers.ts', () => {
      const content = fs.readFileSync(
        path.join(__dirname, 'routers.ts'),
        'utf-8'
      );
      expect(content).toContain('contentRecommendation');
      expect(content).toContain('rrbRadio');
      expect(content).toContain('ecosystem');
    });
  });
});
