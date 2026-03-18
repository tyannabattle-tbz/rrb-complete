import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const clientDir = path.resolve(__dirname, '../client/src');

describe('StudioShareBar Component', () => {
  it('should exist as a shared component', () => {
    const componentPath = path.join(clientDir, 'components/StudioShareBar.tsx');
    expect(fs.existsSync(componentPath)).toBe(true);
    const content = fs.readFileSync(componentPath, 'utf-8');
    expect(content).toContain('StudioShareBar');
    expect(content).toContain('showShareDialog');
    expect(content).toContain('ZOOM_PMI_URL');
  });

  it('should include full social sharing platforms', () => {
    const content = fs.readFileSync(path.join(clientDir, 'components/StudioShareBar.tsx'), 'utf-8');
    expect(content).toContain('Twitter');
    expect(content).toContain('Facebook');
    expect(content).toContain('LinkedIn');
    expect(content).toContain('WhatsApp');
    expect(content).toContain('Telegram');
    expect(content).toContain('Email');
  });

  it('should include Zoom PMI entry button', () => {
    const content = fs.readFileSync(path.join(clientDir, 'components/StudioShareBar.tsx'), 'utf-8');
    expect(content).toContain('Join Zoom Room');
    expect(content).toContain('VITE_ZOOM_URL');
    expect(content).toContain('8502225524');
  });

  it('should include Multi-Stream/Restream entry', () => {
    const content = fs.readFileSync(path.join(clientDir, 'components/StudioShareBar.tsx'), 'utf-8');
    expect(content).toContain('Multi-Stream');
    expect(content).toContain('/conference/streaming');
  });

  it('should support compact mode for DAW toolbars', () => {
    const content = fs.readFileSync(path.join(clientDir, 'components/StudioShareBar.tsx'), 'utf-8');
    expect(content).toContain('compact');
    expect(content).toContain('if (compact)');
  });

  it('should include embed code copy feature', () => {
    const content = fs.readFileSync(path.join(clientDir, 'components/StudioShareBar.tsx'), 'utf-8');
    expect(content).toContain('embedCopied');
    expect(content).toContain('Copy Embed Code');
    expect(content).toContain('<iframe');
  });

  it('should include native share API support', () => {
    const content = fs.readFileSync(path.join(clientDir, 'components/StudioShareBar.tsx'), 'utf-8');
    expect(content).toContain('navigator.share');
    expect(content).toContain('Share via Device');
  });
});

describe('StudioShareBar Integration — All Studio Pages', () => {
  const studioPages = [
    { name: 'StudioControlRoom', path: 'pages/StudioControlRoom.tsx', studioName: 'Production Studio' },
    { name: 'StudioSuite', path: 'pages/StudioSuite.tsx', studioName: 'RRB Studio Pro' },
    { name: 'Studio', path: 'pages/Studio.tsx', studioName: 'Professional Studio' },
    { name: 'MusicStudio', path: 'pages/MusicStudio.tsx', studioName: 'Music Studio' },
    { name: 'MobileStudio', path: 'pages/MobileStudio.tsx', studioName: 'Mobile Studio' },
    { name: 'AdvancedStudioDashboard', path: 'pages/AdvancedStudioDashboard.tsx', studioName: 'Advanced Studio' },
  ];

  studioPages.forEach(({ name, path: filePath, studioName }) => {
    it(`${name} should import StudioShareBar`, () => {
      const content = fs.readFileSync(path.join(clientDir, filePath), 'utf-8');
      expect(content).toMatch(/import StudioShareBar from ['"]@\/components\/StudioShareBar['"]/);
    });

    it(`${name} should render StudioShareBar with correct studio name`, () => {
      const content = fs.readFileSync(path.join(clientDir, filePath), 'utf-8');
      expect(content).toContain(`studioName="${studioName}"`);
    });
  });

  it('StudioSuite and MusicStudio should use compact mode', () => {
    const studioSuite = fs.readFileSync(path.join(clientDir, 'pages/StudioSuite.tsx'), 'utf-8');
    const musicStudio = fs.readFileSync(path.join(clientDir, 'pages/MusicStudio.tsx'), 'utf-8');
    expect(studioSuite).toContain('compact');
    expect(musicStudio).toContain('compact');
  });
});

describe('Zoom PMI Configuration', () => {
  it('SQUADD podcast should NOT have Zoom PMI', () => {
    const content = fs.readFileSync(path.join(clientDir, 'pages/SquaddPodcast.tsx'), 'utf-8');
    // SQUADD should have undefined zoomRoomUrl
    expect(content).toContain('zoomRoomUrl: undefined');
  });

  it('Other podcasts should use VITE_ZOOM_URL for Zoom PMI', () => {
    const podcasts = ['CandysCornerPodcast.tsx', 'SolbonesPodcast.tsx', 'AroundTheQumUnityPodcast.tsx', 'AvatarPanelPodcast.tsx'];
    podcasts.forEach(file => {
      const content = fs.readFileSync(path.join(clientDir, 'pages', file), 'utf-8');
      expect(content).toContain('VITE_ZOOM_URL');
    });
  });
});
