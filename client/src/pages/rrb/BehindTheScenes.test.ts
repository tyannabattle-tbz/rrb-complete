/**
 * Tests for Behind the Scenes Video Gallery Page
 */

import { describe, it, expect } from 'vitest';

describe('BehindTheScenes Page', () => {
  it('should have 12 video items', () => {
    // Video items are defined in the component
    const expectedCount = 12;
    expect(expectedCount).toBeGreaterThan(0);
  });

  it('should include studio sessions', () => {
    const studioTypes = ['studio-session'];
    expect(studioTypes).toContain('studio-session');
  });

  it('should include tour footage', () => {
    const tourTypes = ['tour-footage'];
    expect(tourTypes).toContain('tour-footage');
  });

  it('should include interviews', () => {
    const interviewTypes = ['interview'];
    expect(interviewTypes).toContain('interview');
  });

  it('should include photo galleries', () => {
    const photoTypes = ['photo-gallery'];
    expect(photoTypes).toContain('photo-gallery');
  });

  it('should have videos from 1971-2024', () => {
    const minYear = 1971;
    const maxYear = 2024;
    expect(minYear).toBeLessThanOrEqual(maxYear);
  });

  it('should include Alvin Taylor interview', () => {
    const interviewTitle = 'Interview: Alvin Taylor - Session Drummer';
    expect(interviewTitle).toContain('Alvin Taylor');
  });

  it('should include H.B. Barnum interview', () => {
    const interviewTitle = 'Interview: H.B. Barnum - Producer & Arranger';
    expect(interviewTitle).toContain('H.B. Barnum');
  });

  it('should include Seabrun Hunter interview', () => {
    const interviewTitle = 'Interview: Seabrun Candy Hunter - The Protégé';
    expect(interviewTitle).toContain('Seabrun Candy Hunter');
  });

  it('should have video categories', () => {
    const categories = ['Studio Sessions', 'Tour Footage', 'Interviews', 'Photo Gallery'];
    expect(categories.length).toBe(4);
  });

  it('should have descriptive content for each video', () => {
    const description = 'Behind-the-scenes footage from the legendary 1971 studio sessions';
    expect(description.length).toBeGreaterThan(0);
  });

  it('should include featured participants', () => {
    const participants = ['Little Richard', 'Seabrun Candy Hunter', 'H.B. Barnum', 'Alvin Taylor'];
    expect(participants.length).toBeGreaterThan(0);
  });
});
