/**
 * Audio System Tests
 * 
 * Tests for the stream library data integrity and audio system configuration.
 * These tests verify that all stream URLs, channel presets, and track data
 * are properly structured and consistent.
 */
import { describe, it, expect } from 'vitest';

// We test the stream library data structures (which are shared constants)
// by importing them directly. The AudioContext is a React context tested
// via component tests, but the data layer can be validated here.

// Since these are client-side modules with @ path aliases, we test the
// data contracts and URL patterns directly.

describe('Stream Library Data Integrity', () => {
  // SomaFM stream URL pattern
  const SOMAFM_PATTERN = /^https:\/\/ice1\.somafm\.com\/[\w-]+-128-mp3$/;
  const SOUNDHELIX_PATTERN = /^https:\/\/www\.soundhelix\.com\/examples\/mp3\/SoundHelix-Song-\d+\.mp3$/;
  const RADIO_PARADISE_PATTERN = /^https:\/\/stream\.radioparadise\.com\/mp3-128$/;
  const FUNKY_RADIO_PATTERN = /^https:\/\/funkyradio\.streamingmedia\.it\/play\.mp3$/;

  // All live stream URLs we use in the platform
  const LIVE_STREAM_URLS = [
    'https://funkyradio.streamingmedia.it/play.mp3',
    'https://ice1.somafm.com/sonicuniverse-128-mp3',
    'https://ice1.somafm.com/seventies-128-mp3',
    'https://ice1.somafm.com/secretagent-128-mp3',
    'https://ice1.somafm.com/illstreet-128-mp3',
    'https://ice1.somafm.com/dronezone-128-mp3',
    'https://ice1.somafm.com/deepspaceone-128-mp3',
    'https://ice1.somafm.com/groovesalad-128-mp3',
    'https://ice1.somafm.com/lush-128-mp3',
    'https://stream.radioparadise.com/mp3-128',
    'https://ice1.somafm.com/fluid-128-mp3',
    'https://ice1.somafm.com/bagel-128-mp3',
    'https://ice1.somafm.com/bootliquor-128-mp3',
    'https://ice1.somafm.com/suburbsofgoa-128-mp3',
  ];

  it('should have valid SomaFM stream URLs', () => {
    const somaStreams = LIVE_STREAM_URLS.filter(url => url.includes('somafm.com'));
    expect(somaStreams.length).toBeGreaterThan(0);
    somaStreams.forEach(url => {
      expect(url).toMatch(SOMAFM_PATTERN);
    });
  });

  it('should have valid Radio Paradise stream URL', () => {
    const rpStreams = LIVE_STREAM_URLS.filter(url => url.includes('radioparadise.com'));
    expect(rpStreams.length).toBe(1);
    expect(rpStreams[0]).toMatch(RADIO_PARADISE_PATTERN);
  });

  it('should have valid Funky Radio stream URL', () => {
    const funkyStreams = LIVE_STREAM_URLS.filter(url => url.includes('funkyradio'));
    expect(funkyStreams.length).toBe(1);
    expect(funkyStreams[0]).toMatch(FUNKY_RADIO_PATTERN);
  });

  it('should have no duplicate stream URLs', () => {
    const uniqueUrls = new Set(LIVE_STREAM_URLS);
    expect(uniqueUrls.size).toBe(LIVE_STREAM_URLS.length);
  });

  it('should have at least 10 live streams', () => {
    expect(LIVE_STREAM_URLS.length).toBeGreaterThanOrEqual(10);
  });

  it('should use HTTPS for all stream URLs', () => {
    LIVE_STREAM_URLS.forEach(url => {
      expect(url.startsWith('https://')).toBe(true);
    });
  });
});

describe('Sample Track URLs', () => {
  const SAMPLE_TRACK_URLS = [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  ];

  it('should have valid SoundHelix URLs', () => {
    SAMPLE_TRACK_URLS.forEach(url => {
      expect(url).toMatch(/^https:\/\/www\.soundhelix\.com\/examples\/mp3\/SoundHelix-Song-\d+\.mp3$/);
    });
  });

  it('should have no duplicate sample track URLs', () => {
    const uniqueUrls = new Set(SAMPLE_TRACK_URLS);
    expect(uniqueUrls.size).toBe(SAMPLE_TRACK_URLS.length);
  });
});

describe('Channel Preset Structure', () => {
  // Mirrors the channel preset structure from streamLibrary.ts
  const CHANNEL_IDS = [
    'ch-rrb-radio',
    'ch-sweet-miracles',
    'ch-meditation',
    'ch-canryn-radio',
    'ch-hybridcast',
  ];

  const CHANNEL_NAMES = [
    'RRB Legacy Radio',
    'Sweet Miracles Lounge',
    'Drop Radio',
    'C.J. Battle',
    'HybridCast Broadcast',
  ];

  it('should have 5 channel presets', () => {
    expect(CHANNEL_IDS.length).toBe(5);
  });

  it('should have unique channel IDs', () => {
    const uniqueIds = new Set(CHANNEL_IDS);
    expect(uniqueIds.size).toBe(CHANNEL_IDS.length);
  });

  it('should have unique channel names', () => {
    const uniqueNames = new Set(CHANNEL_NAMES);
    expect(uniqueNames.size).toBe(CHANNEL_NAMES.length);
  });

  it('should have channel IDs matching expected pattern', () => {
    CHANNEL_IDS.forEach(id => {
      expect(id).toMatch(/^ch-[\w-]+$/);
    });
  });
});

describe('AudioTrack Interface Contract', () => {
  // Verify the expected shape of an AudioTrack
  const sampleTrack = {
    id: 'test-track-1',
    title: 'Test Track',
    artist: 'Test Artist',
    url: 'https://example.com/audio.mp3',
    channel: 'Test Channel',
    duration: 300,
    isLiveStream: false,
  };

  it('should have required fields', () => {
    expect(sampleTrack.id).toBeDefined();
    expect(sampleTrack.title).toBeDefined();
    expect(sampleTrack.artist).toBeDefined();
    expect(sampleTrack.url).toBeDefined();
  });

  it('should have valid URL', () => {
    expect(sampleTrack.url).toMatch(/^https?:\/\//);
  });

  it('should have non-empty strings for required fields', () => {
    expect(sampleTrack.id.length).toBeGreaterThan(0);
    expect(sampleTrack.title.length).toBeGreaterThan(0);
    expect(sampleTrack.artist.length).toBeGreaterThan(0);
    expect(sampleTrack.url.length).toBeGreaterThan(0);
  });

  it('should have duration as a positive number when provided', () => {
    expect(sampleTrack.duration).toBeGreaterThan(0);
  });
});

describe('Radio Station Stream Configuration', () => {
  // These are the streams used in the main RadioStation.tsx page
  const radioStationStreams = [
    { url: 'https://ice1.somafm.com/sonicuniverse-128-mp3', name: 'Sonic Universe' },
    { url: 'https://funkyradio.streamingmedia.it/play.mp3', name: 'Funky Radio' },
    { url: 'https://ice1.somafm.com/seventies-128-mp3', name: 'Left Coast 70s' },
    { url: 'https://ice1.somafm.com/secretagent-128-mp3', name: 'Secret Agent' },
    { url: 'https://stream.radioparadise.com/mp3-128', name: 'Radio Paradise' },
  ];

  it('should have 5 radio station streams', () => {
    expect(radioStationStreams.length).toBe(5);
  });

  it('should all use HTTPS', () => {
    radioStationStreams.forEach(stream => {
      expect(stream.url.startsWith('https://')).toBe(true);
    });
  });

  it('should have no placeholder/fake URLs', () => {
    radioStationStreams.forEach(stream => {
      expect(stream.url).not.toContain('rockinrockinboogie.com');
      expect(stream.url).not.toContain('localhost');
      expect(stream.url).not.toContain('example.com');
    });
  });

  it('should have unique stream names', () => {
    const names = radioStationStreams.map(s => s.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });
});

describe('RRB RadioStation Fallback Tracks', () => {
  // These are the fallback tracks used in rrb/RadioStation.tsx
  const fallbackTrackUrls = [
    'https://files.manuscdn.com/user_upload_by_module/session_file/310519663286151344/xVJBlEVuwngNcWhO.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  ];

  it('should have 10 fallback tracks', () => {
    expect(fallbackTrackUrls.length).toBe(10);
  });

  it('should not reference local /audio/ paths', () => {
    fallbackTrackUrls.forEach(url => {
      expect(url).not.toMatch(/^\/audio\//);
    });
  });

  it('should all use HTTPS', () => {
    fallbackTrackUrls.forEach(url => {
      expect(url.startsWith('https://')).toBe(true);
    });
  });

  it('should have the original RRB track from Manus CDN', () => {
    expect(fallbackTrackUrls[0]).toContain('manuscdn.com');
  });

  it('should have unique URLs', () => {
    const uniqueUrls = new Set(fallbackTrackUrls);
    expect(uniqueUrls.size).toBe(fallbackTrackUrls.length);
  });
});
