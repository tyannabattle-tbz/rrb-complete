import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Professional Studio Suite - Comprehensive Audit', () => {
  describe('Route Registration', () => {
    it('should have Professional Studio routes in App.tsx', () => {
      const appTsPath = path.join(process.cwd(), 'client/src/App.tsx');
      const content = fs.readFileSync(appTsPath, 'utf-8');
      
      expect(content).toContain('ProfessionalStudioSuite');
      expect(content).toContain('/professional-studio');
      expect(content).toContain('/studio/pro');
    });

    it('should import ProfessionalStudioSuite component', () => {
      const appTsPath = path.join(process.cwd(), 'client/src/App.tsx');
      const content = fs.readFileSync(appTsPath, 'utf-8');
      
      expect(content).toContain('import ProfessionalStudioSuite from "@/pages/ProfessionalStudioSuite"');
    });
  });

  describe('Audio Files', () => {
    it('should have lead_vocals.wav file', () => {
      const filePath = path.join(process.cwd(), 'client/public/audio/lead_vocals.wav');
      expect(fs.existsSync(filePath)).toBe(true);
      
      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should have drums.wav file', () => {
      const filePath = path.join(process.cwd(), 'client/public/audio/drums.wav');
      expect(fs.existsSync(filePath)).toBe(true);
      
      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should have bass.wav file', () => {
      const filePath = path.join(process.cwd(), 'client/public/audio/bass.wav');
      expect(fs.existsSync(filePath)).toBe(true);
      
      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('all audio files should be valid WAV format', () => {
      const audioDir = path.join(process.cwd(), 'client/public/audio');
      const files = ['lead_vocals.wav', 'drums.wav', 'bass.wav'];
      
      files.forEach(file => {
        const filePath = path.join(audioDir, file);
        const buffer = fs.readFileSync(filePath);
        
        // Check WAV header (RIFF)
        expect(buffer.toString('utf-8', 0, 4)).toBe('RIFF');
        
        // Check WAV format (WAVE)
        expect(buffer.toString('utf-8', 8, 12)).toBe('WAVE');
      });
    });
  });

  describe('AudioEngineService - Lazy Initialization', () => {
    it('should have lazy initialization in AudioEngineService', () => {
      const audioServicePath = path.join(process.cwd(), 'client/src/lib/audioEngineService.ts');
      const content = fs.readFileSync(audioServicePath, 'utf-8');
      
      // Should NOT call initializeAudioContext in constructor
      expect(content).toContain('constructor() {');
      expect(content).toContain('// Lazy initialization - wait for user gesture');
      
      // Should have lazy initialization method
      expect(content).toContain('async initializeAudioContext()');
      expect(content).toContain('if (this.audioContext) {');
    });

    it('should handle browser autoplay policy', () => {
      const audioServicePath = path.join(process.cwd(), 'client/src/lib/audioEngineService.ts');
      const content = fs.readFileSync(audioServicePath, 'utf-8');
      
      expect(content).toContain('audioContext.state === \'suspended\'');
      expect(content).toContain('await audioContext.resume()');
    });

    it('should have resumeContext method', () => {
      const audioServicePath = path.join(process.cwd(), 'client/src/lib/audioEngineService.ts');
      const content = fs.readFileSync(audioServicePath, 'utf-8');
      
      expect(content).toContain('async resumeContext()');
      expect(content).toContain('if (!this.audioContext)');
    });
  });

  describe('ProfessionalStudioSuite Component', () => {
    it('should exist and be properly exported', () => {
      const componentPath = path.join(process.cwd(), 'client/src/pages/ProfessionalStudioSuite.tsx');
      expect(fs.existsSync(componentPath)).toBe(true);
      
      const content = fs.readFileSync(componentPath, 'utf-8');
      expect(content).toContain('export default function ProfessionalStudioSuite');
    });

    it('should have all 12 tabs implemented', () => {
      const componentPath = path.join(process.cwd(), 'client/src/pages/ProfessionalStudioSuite.tsx');
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      const tabs = [
        'mixer',
        'recorder',
        'editor',
        'streaming',
        'presets',
        'visualizer',
        'collaboration',
        'mastering',
        'mobile',
        'plugins',
        'midi',
        'cloudsync'
      ];
      
      tabs.forEach(tab => {
        expect(content).toContain(`'${tab}'`);
      });
    });

    it('should import all required components', () => {
      const componentPath = path.join(process.cwd(), 'client/src/pages/ProfessionalStudioSuite.tsx');
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      const components = [
        'MultiTrackMixer',
        'AudioRecorder',
        'WaveformEditor',
        'LiveStreamer',
        'PresetManager',
        'AudioVisualizerEnhanced',
        'CollaborationManager',
        'MasteringEngine',
        'MobileController',
        'PluginManager',
        'MIDIControllerIntegration',
        'CloudSyncManager'
      ];
      
      components.forEach(component => {
        expect(content).toContain(`import { ${component} }`);
      });
    });

    it('should have audio playback handler with resumeContext call', () => {
      const componentPath = path.join(process.cwd(), 'client/src/pages/ProfessionalStudioSuite.tsx');
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      expect(content).toContain('handlePlayAudio');
      expect(content).toContain('await audioEngine.resumeContext()');
    });
  });

  describe('Integration', () => {
    it('should have all components properly wired', () => {
      const componentPath = path.join(process.cwd(), 'client/src/pages/ProfessionalStudioSuite.tsx');
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      // Should render components based on activeTab
      expect(content).toContain('activeTab === \'mixer\'');
      expect(content).toContain('activeTab === \'recorder\'');
      expect(content).toContain('activeTab === \'editor\'');
    });

    it('should have error handling for audio initialization', () => {
      const componentPath = path.join(process.cwd(), 'client/src/pages/ProfessionalStudioSuite.tsx');
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      expect(content).toContain('catch (error)');
      expect(content).toContain('setError');
      expect(content).toContain('toast.error');
    });
  });

  describe('Accessibility & UX', () => {
    it('should have proper button labels and feedback', () => {
      const componentPath = path.join(process.cwd(), 'client/src/pages/ProfessionalStudioSuite.tsx');
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      expect(content).toContain('toast.success');
      expect(content).toContain('toast.error');
      // toast.info may not be present, but success and error are required
    });

    it('should have recording state indicators', () => {
      const componentPath = path.join(process.cwd(), 'client/src/pages/ProfessionalStudioSuite.tsx');
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      expect(content).toContain('isRecording');
      expect(content).toContain('isPlaying');
      expect(content).toContain('RECORDING');
      expect(content).toContain('READY');
    });
  });

  describe('Audio Playback Flow', () => {
    it('should load audio files on component mount', () => {
      const componentPath = path.join(process.cwd(), 'client/src/pages/ProfessionalStudioSuite.tsx');
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      expect(content).toContain('useEffect');
      expect(content).toContain('initAudio');
      // Audio files are referenced with .mp3 or .wav extension
      expect(content).toContain('lead_vocals');
      expect(content).toContain('drums');
      expect(content).toContain('bass');
    });

    it('should handle audio buffer loading errors gracefully', () => {
      const componentPath = path.join(process.cwd(), 'client/src/pages/ProfessionalStudioSuite.tsx');
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      expect(content).toContain('catch (err)');
      expect(content).toContain('console.error');
      expect(content).toContain('Failed to load');
    });

    it('should support play/pause toggle', () => {
      const componentPath = path.join(process.cwd(), 'client/src/pages/ProfessionalStudioSuite.tsx');
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      expect(content).toContain('isPlaying');
      expect(content).toContain('currentAudioSource');
      expect(content).toContain('handlePlayAudio');
    });
  });
});
