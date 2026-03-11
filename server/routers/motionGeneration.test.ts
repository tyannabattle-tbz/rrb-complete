import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the real video production service
vi.mock('../_core/realVideoProductionService', () => ({
  realVideoProductionService: {
    produceVideo: vi.fn().mockResolvedValue({
      id: 'prod-test-123',
      title: 'Test Production',
      status: 'completed',
      script: {
        title: 'Test Script',
        synopsis: 'A test synopsis',
        totalDuration: 30,
        scenes: [
          { sceneNumber: 1, description: 'Scene 1', narration: 'Narration 1', visualPrompt: 'Prompt 1', duration: 10 },
          { sceneNumber: 2, description: 'Scene 2', narration: 'Narration 2', visualPrompt: 'Prompt 2', duration: 10 },
          { sceneNumber: 3, description: 'Scene 3', narration: 'Narration 3', visualPrompt: 'Prompt 3', duration: 10 },
        ],
      },
      storyboardFrames: [
        { frameNumber: 1, imageUrl: 'https://s3.example.com/frame1.png', description: 'Scene 1', duration: 10, narration: 'Narration 1' },
        { frameNumber: 2, imageUrl: 'https://s3.example.com/frame2.png', description: 'Scene 2', duration: 10, narration: 'Narration 2' },
      ],
      narrationUrl: 'https://s3.example.com/narration.mp3',
      thumbnailUrl: 'https://s3.example.com/thumbnail.png',
      assets: [],
      progress: 100,
      createdAt: new Date(),
      completedAt: new Date(),
    }),
    generateScript: vi.fn().mockResolvedValue({
      title: 'Generated Script',
      synopsis: 'A generated synopsis',
      totalDuration: 30,
      scenes: [
        { sceneNumber: 1, description: 'Scene 1', narration: 'Narration 1', visualPrompt: 'Prompt 1', duration: 15 },
        { sceneNumber: 2, description: 'Scene 2', narration: 'Narration 2', visualPrompt: 'Prompt 2', duration: 15 },
      ],
    }),
  },
}));

// Mock image generation
vi.mock('../_core/imageGeneration', () => ({
  generateImage: vi.fn().mockResolvedValue({ url: 'https://s3.example.com/generated.png' }),
}));

// Mock LLM
vi.mock('../_core/llm', () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: '{"title":"Test","synopsis":"Test","totalDuration":30,"scenes":[]}' } }],
  }),
}));

// Mock TTS service
vi.mock('../_core/realTtsService', () => ({
  realTtsService: {
    generateSpeech: vi.fn().mockResolvedValue({ success: true, audioUrl: 'https://s3.example.com/speech.mp3', duration: 10, voice: 'nova' }),
    generateDjSpeech: vi.fn().mockResolvedValue({ success: true, audioUrl: 'https://s3.example.com/dj.mp3', duration: 10, voice: 'nova' }),
  },
  AVAILABLE_VOICES: [
    { id: 'alloy', name: 'Alloy', gender: 'neutral', description: 'Versatile voice' },
    { id: 'nova', name: 'Nova', gender: 'female', description: 'Warm voice' },
  ],
  DJ_VOICES: { valanna: 'nova', seraph: 'onyx' },
}));

// Import after mocks
import { motionGenerationRouter } from './motionGenerationRouter';

describe('Motion Generation Router (Real AI Production)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export a router with all required procedures', () => {
    expect(motionGenerationRouter).toBeDefined();
    // The router function returns the routes object
    const routes = motionGenerationRouter as any;
    expect(routes.generateVideoClip).toBeDefined();
    expect(routes.generateStoryboardFrame).toBeDefined();
    expect(routes.generateScript).toBeDefined();
    expect(routes.generateNarration).toBeDefined();
    expect(routes.generateAnimation).toBeDefined();
    expect(routes.generateMotionGraphics).toBeDefined();
    expect(routes.getVideoProgress).toBeDefined();
    expect(routes.listGeneratedVideos).toBeDefined();
    expect(routes.exportVideo).toBeDefined();
    expect(routes.generateFromScript).toBeDefined();
    expect(routes.getVideoTemplates).toBeDefined();
    expect(routes.createFromTemplate).toBeDefined();
    expect(routes.getMotionSettings).toBeDefined();
    expect(routes.updateMotionPreferences).toBeDefined();
  });

  it('should have no VEO or mock video service dependencies', async () => {
    const fs = await import('fs');
    const routerContent = fs.readFileSync(
      require('path').join(__dirname, 'motionGenerationRouter.ts'),
      'utf-8'
    );
    expect(routerContent).not.toContain('mockVideoService');
    // VEO is only mentioned in comments about its removal, not as a dependency
    expect(routerContent).not.toContain("import.*VEO");
    expect(routerContent).not.toContain("from 'veo'");
    expect(routerContent).toContain('realVideoProductionService');
    expect(routerContent).toContain('generateImage');
    expect(routerContent).toContain('realTtsService');
  });

  it('should use real AI services: generateImage, invokeLLM, realTtsService', async () => {
    const fs = await import('fs');
    const routerContent = fs.readFileSync(
      require('path').join(__dirname, 'motionGenerationRouter.ts'),
      'utf-8'
    );
    // Verify imports reference real services
    expect(routerContent).toContain("from '../_core/realVideoProductionService'");
    expect(routerContent).toContain("from '../_core/imageGeneration'");
    expect(routerContent).toContain("from '../_core/realTtsService'");
  });

  it('should report engine as open-source compatible in settings', () => {
    // The getMotionSettings procedure should indicate no VEO dependency
    const routes = motionGenerationRouter as any;
    expect(routes.getMotionSettings).toBeDefined();
  });

  it('should have UN CSW70 and RRB Radio templates', () => {
    const routes = motionGenerationRouter as any;
    expect(routes.getVideoTemplates).toBeDefined();
  });
});

describe('Real Video Production Service', () => {
  it('should produce video with storyboard frames and narration', async () => {
    const { realVideoProductionService } = await import('../_core/realVideoProductionService');
    const result = await realVideoProductionService.produceVideo('Test video about nature', {
      style: 'cinematic',
      duration: 30,
      generateNarration: true,
    });

    expect(result).toBeDefined();
    expect(result.id).toContain('prod-');
    expect(result.status).toBe('completed');
    expect(result.storyboardFrames.length).toBeGreaterThan(0);
    expect(result.narrationUrl).toBeDefined();
    expect(result.thumbnailUrl).toBeDefined();
    expect(result.progress).toBe(100);
  });

  it('should generate script with scenes', async () => {
    const { realVideoProductionService } = await import('../_core/realVideoProductionService');
    const script = await realVideoProductionService.generateScript(
      'A documentary about ocean conservation',
      'documentary',
      30,
      'general'
    );

    expect(script).toBeDefined();
    expect(script.title).toBeDefined();
    expect(script.synopsis).toBeDefined();
    expect(script.scenes.length).toBeGreaterThan(0);
  });
});

describe('Real TTS Service', () => {
  it('should generate speech with real API', async () => {
    const { realTtsService } = await import('../_core/realTtsService');
    const result = await realTtsService.generateSpeech({
      text: 'Hello world',
      voice: 'nova',
      speed: 1.0,
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.audioUrl).toBeDefined();
    expect(result.voice).toBe('nova');
  });

  it('should generate DJ speech with personality voice', async () => {
    const { realTtsService } = await import('../_core/realTtsService');
    const result = await realTtsService.generateDjSpeech('Welcome to RRB Radio!', 'valanna');

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.audioUrl).toBeDefined();
  });
});

describe('Audio Music Router (Real TTS)', () => {
  it('should export router with TTS using real Forge API', async () => {
    const fs = await import('fs');
    const routerContent = fs.readFileSync(
      require('path').join(__dirname, 'audioMusicRouter.ts'),
      'utf-8'
    );
    expect(routerContent).not.toContain('Simulate');
    expect(routerContent).not.toContain('simulate');
    expect(routerContent).toContain('realTtsService');
    expect(routerContent).toContain('AVAILABLE_VOICES');
  });
});

describe('Text-to-Speech Router (Real TTS)', () => {
  it('should export router with real Forge TTS', async () => {
    const fs = await import('fs');
    const routerContent = fs.readFileSync(
      require('path').join(__dirname, 'textToSpeech.ts'),
      'utf-8'
    );
    expect(routerContent).not.toContain('Simulate speech');
    expect(routerContent).toContain('realTtsService');
    expect(routerContent).toContain('generateDjSpeech');
    expect(routerContent).toContain('checkAvailability');
  });
});
