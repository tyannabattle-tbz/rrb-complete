import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('SQUADD Goals Page', () => {
  it('should have the SquaddGoals component file', () => {
    const filePath = path.join(__dirname, '../client/src/pages/SquaddGoals.tsx');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('should contain SQUADD acronym content', () => {
    const filePath = path.join(__dirname, '../client/src/pages/SquaddGoals.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('Sisters');
    expect(content).toContain('Questing');
    expect(content).toContain('Unapologetically');
    expect(content).toContain('Divine');
    expect(content).toContain('Destiny');
  });

  it('should reference Seabrun Candy Hunter', () => {
    const filePath = path.join(__dirname, '../client/src/pages/SquaddGoals.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('Seabrun Candy Hunter');
  });

  it('should include all four ecosystem systems', () => {
    const filePath = path.join(__dirname, '../client/src/pages/SquaddGoals.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('QUMUS Engine');
    expect(content).toContain('RRB Radio');
    expect(content).toContain('HybridCast');
    expect(content).toContain('Sweet Miracles');
  });

  it('should include partnership events', () => {
    const filePath = path.join(__dirname, '../client/src/pages/SquaddGoals.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('Ghana Partnership');
    expect(content).toContain('Selma Jubilee');
    expect(content).toContain('UN NGO CSW70');
    expect(content).toContain('March 17, 2026');
    expect(content).toContain('March 7, 2026');
  });

  it('should include Canryn Production subsidiaries', () => {
    const filePath = path.join(__dirname, '../client/src/pages/SquaddGoals.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('Little C');
    expect(content).toContain("Sean's Music");
    expect(content).toContain("Anna's");
    expect(content).toContain('Jaelon Enterprises');
    expect(content).toContain('Payten Music (BMI)');
  });

  it('should include elder abuse statistics', () => {
    const filePath = path.join(__dirname, '../client/src/pages/SquaddGoals.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('1 in 10');
    expect(content).toContain('$2B+');
  });

  it('should include contact email', () => {
    const filePath = path.join(__dirname, '../client/src/pages/SquaddGoals.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('sweetmiraclesattt@gmail.com');
  });

  it('should include A Voice for the Voiceless tagline', () => {
    const filePath = path.join(__dirname, '../client/src/pages/SquaddGoals.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('A Voice for the Voiceless');
  });
});

describe('EventBanners Component', () => {
  it('should have the EventBanners component file', () => {
    const filePath = path.join(__dirname, '../client/src/components/EventBanners.tsx');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('should include both Selma and UN events', () => {
    const filePath = path.join(__dirname, '../client/src/components/EventBanners.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('SELMA JUBILEE 2026');
    expect(content).toContain('UN NGO CSW70');
    expect(content).toContain('PARTNERSHIP WITH GHANA');
  });

  it('should include event dates', () => {
    const filePath = path.join(__dirname, '../client/src/components/EventBanners.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('March 7, 2026');
    expect(content).toContain('March 17, 2026');
  });

  it('should include event locations', () => {
    const filePath = path.join(__dirname, '../client/src/components/EventBanners.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('Wallace Community College, Room 112');
    expect(content).toContain('United Nations, New York');
  });

  it('should have dismiss functionality', () => {
    const filePath = path.join(__dirname, '../client/src/components/EventBanners.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('handleDismiss');
    expect(content).toContain('dismissed_banners');
    expect(content).toContain('localStorage');
  });

  it('should link to SQUADD page', () => {
    const filePath = path.join(__dirname, '../client/src/components/EventBanners.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('/squadd');
  });
});

describe('LiveStreamPage Component', () => {
  it('should have the LiveStreamPage component file', () => {
    const filePath = path.join(__dirname, '../client/src/pages/LiveStreamPage.tsx');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('should include radio channels', () => {
    const filePath = path.join(__dirname, '../client/src/pages/LiveStreamPage.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('RRB Main');
    expect(content).toContain('Gospel Hour');
    expect(content).toContain('Healing Frequencies');
    expect(content).toContain('Community Talk');
    expect(content).toContain('Jazz & Soul');
    expect(content).toContain('Legacy Classics');
  });

  it('should include video, radio, and podcast tabs', () => {
    const filePath = path.join(__dirname, '../client/src/pages/LiveStreamPage.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain("'video'");
    expect(content).toContain("'radio'");
    expect(content).toContain("'podcast'");
  });

  it('should include live chat functionality', () => {
    const filePath = path.join(__dirname, '../client/src/pages/LiveStreamPage.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('Live Chat');
    expect(content).toContain('handleSendMessage');
    expect(content).toContain('chatMessages');
    expect(content).toContain('newMessage');
  });

  it('should include playback controls', () => {
    const filePath = path.join(__dirname, '../client/src/pages/LiveStreamPage.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('isPlaying');
    expect(content).toContain('isMuted');
    expect(content).toContain('volume');
    expect(content).toContain('toggleFullscreen');
  });

  it('should include healing frequency references', () => {
    const filePath = path.join(__dirname, '../client/src/pages/LiveStreamPage.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('432 Hz');
    expect(content).toContain('528 Hz');
  });

  it('should reference Canryn Production and Sweet Miracles', () => {
    const filePath = path.join(__dirname, '../client/src/pages/LiveStreamPage.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('Canryn Production');
    expect(content).toContain('Sweet Miracles');
    expect(content).toContain('A Voice for the Voiceless');
  });
});

describe('App.tsx Route Integration', () => {
  it('should have SQUADD route registered', () => {
    const filePath = path.join(__dirname, '../client/src/App.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain("path=\"/squadd\"");
    expect(content).toContain('SquaddGoals');
  });

  it('should have Live Stream route registered', () => {
    const filePath = path.join(__dirname, '../client/src/App.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain("path=\"/live\"");
    expect(content).toContain('LiveStreamPage');
  });

  it('should have EventBanners integrated', () => {
    const filePath = path.join(__dirname, '../client/src/App.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('EventBanners');
  });
});
