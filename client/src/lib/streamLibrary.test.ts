import { describe, it, expect } from 'vitest';
import {
  LIVE_STREAMS,
  CHANNEL_PRESETS,
  RRB_LEGACY_TRACKS,
  getAllLiveStreams,
  getChannelByGenre,
  searchStreams
} from './streamLibrary';

describe('Stream Library', () => {
  describe('LIVE_STREAMS', () => {
    it('should have all genre channels defined', () => {
      expect(LIVE_STREAMS.soulAndRB).toBeDefined();
      expect(LIVE_STREAMS.funkRadio).toBeDefined();
      expect(LIVE_STREAMS.jazzChannel).toBeDefined();
      expect(LIVE_STREAMS.bluesChannel).toBeDefined();
      expect(LIVE_STREAMS.rockChannel).toBeDefined();
      expect(LIVE_STREAMS.countryChannel).toBeDefined();
      expect(LIVE_STREAMS.talkRadio).toBeDefined();
      expect(LIVE_STREAMS.newsRadio).toBeDefined();
      expect(LIVE_STREAMS.sportsRadio).toBeDefined();
    });

    it('should have valid stream URLs', () => {
      Object.values(LIVE_STREAMS).forEach(stream => {
        expect(stream.url).toBeDefined();
        expect(stream.url.length).toBeGreaterThan(0);
        expect(stream.url).toMatch(/^https?:\/\//);
      });
    });

    it('should have unique stream IDs', () => {
      const ids = Object.values(LIVE_STREAMS).map(s => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have titles and artists', () => {
      Object.values(LIVE_STREAMS).forEach(stream => {
        expect(stream.title).toBeDefined();
        expect(stream.title.length).toBeGreaterThan(0);
        expect(stream.artist).toBeDefined();
        expect(stream.artist.length).toBeGreaterThan(0);
      });
    });

    it('should have valid frequency values', () => {
      Object.values(LIVE_STREAMS).forEach(stream => {
        expect(stream.frequency).toBeGreaterThan(0);
        expect([432, 528]).toContain(stream.frequency);
      });
    });
  });

  describe('Genre-specific channels', () => {
    it('should have R&B and Soul channels', () => {
      expect(LIVE_STREAMS.soulAndRB.title).toContain('Soul & R&B');
      expect(LIVE_STREAMS.retroSoul.title).toContain('Retro Soul');
      expect(LIVE_STREAMS.ninetyRap.title).toContain('90s Hip-Hop');
    });

    it('should have Jazz channels', () => {
      expect(LIVE_STREAMS.jazzChannel.title).toContain('Jazz');
      expect(LIVE_STREAMS.smoothJazz.title).toContain('Smooth Jazz');
      expect(LIVE_STREAMS.jazzFusion.title).toContain('Jazz Fusion');
    });

    it('should have Blues channels', () => {
      expect(LIVE_STREAMS.bluesChannel.title).toContain('Blues');
      expect(LIVE_STREAMS.chicagoBlues.title).toContain('Chicago Blues');
    });

    it('should have 70s and 80s Rock channels', () => {
      expect(LIVE_STREAMS.seventies.title).toContain('70s');
      expect(LIVE_STREAMS.eighties.title).toContain('80s');
    });

    it('should have Country channels', () => {
      expect(LIVE_STREAMS.countryChannel.title).toContain('Country');
      expect(LIVE_STREAMS.classicCountry.title).toContain('Classic Country');
    });

    it('should have Talk, News, and Sports channels', () => {
      expect(LIVE_STREAMS.talkRadio.title).toContain('Talk');
      expect(LIVE_STREAMS.newsRadio.title).toContain('News');
      expect(LIVE_STREAMS.sportsRadio.title).toContain('Sports');
    });

    it('should have Funk and Groove channels', () => {
      expect(LIVE_STREAMS.funkRadio.title).toContain('Funk');
    });
  });

  describe('CHANNEL_PRESETS', () => {
    it('should have all major genre presets', () => {
      const presetIds = CHANNEL_PRESETS.map(p => p.id);
      expect(presetIds).toContain('soul-funk');
      expect(presetIds).toContain('jazz');
      expect(presetIds).toContain('blues');
      expect(presetIds).toContain('rock');
      expect(presetIds).toContain('country');
      expect(presetIds).toContain('talk');
    });

    it('should have unique preset IDs', () => {
      const ids = CHANNEL_PRESETS.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have emoji in preset names', () => {
      CHANNEL_PRESETS.forEach(preset => {
        expect(preset.name).toMatch(/[🎙️🎷🎺🎸🎻📡🧘⚡🌍👑🤘]/);
      });
    });

    it('should have color codes', () => {
      CHANNEL_PRESETS.forEach(preset => {
        expect(preset.color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it('should have streams in each preset', () => {
      CHANNEL_PRESETS.forEach(preset => {
        expect(preset.streams.length).toBeGreaterThan(0);
      });
    });

    it('should have descriptions', () => {
      CHANNEL_PRESETS.forEach(preset => {
        expect(preset.description).toBeDefined();
        expect(preset.description?.length).toBeGreaterThan(0);
      });
    });
  });

  describe('RRB_LEGACY_TRACKS', () => {
    it('should contain legacy tracks', () => {
      expect(RRB_LEGACY_TRACKS.length).toBeGreaterThan(0);
    });

    it('should have Rockin Rockin Boogie track', () => {
      const rrbTrack = RRB_LEGACY_TRACKS.find(t => t.id === 'legacy-rrb');
      expect(rrbTrack).toBeDefined();
      expect(rrbTrack?.title).toContain('Rockin\' Rockin\' Boogie');
    });
  });

  describe('getAllLiveStreams', () => {
    it('should return all live streams', () => {
      const allStreams = getAllLiveStreams();
      expect(allStreams.length).toBeGreaterThan(0);
    });

    it('should include all genre streams', () => {
      const allStreams = getAllLiveStreams();
      const titles = allStreams.map(s => s.title);

      expect(titles.some(t => t.includes('R&B'))).toBe(true);
      expect(titles.some(t => t.includes('Jazz'))).toBe(true);
      expect(titles.some(t => t.includes('Blues'))).toBe(true);
      expect(titles.some(t => t.includes('Rock'))).toBe(true);
      expect(titles.some(t => t.includes('Country'))).toBe(true);
    });
  });

  describe('getChannelByGenre', () => {
    it('should find Soul & Funk channel', () => {
      const channel = getChannelByGenre('funk');
      expect(channel).toBeDefined();
      expect(channel?.name).toContain('Soul & Funk');
    });

    it('should find Jazz channel', () => {
      const channel = getChannelByGenre('jazz');
      expect(channel).toBeDefined();
      expect(channel?.name).toContain('Jazz');
    });

    it('should find Blues channel', () => {
      const channel = getChannelByGenre('blues');
      expect(channel).toBeDefined();
      expect(channel?.name).toContain('Blues');
    });

    it('should find Rock channel', () => {
      const channel = getChannelByGenre('rock');
      expect(channel).toBeDefined();
      expect(channel?.name).toContain('Rock');
    });

    it('should find Country channel', () => {
      const channel = getChannelByGenre('country');
      expect(channel).toBeDefined();
      expect(channel?.name).toContain('Country');
    });

    it('should find Talk channel', () => {
      const channel = getChannelByGenre('talk');
      expect(channel).toBeDefined();
      expect(channel?.name).toContain('Talk');
    });

    it('should be case-insensitive', () => {
      const channel1 = getChannelByGenre('JAZZ');
      const channel2 = getChannelByGenre('jazz');
      expect(channel1?.id).toBe(channel2?.id);
    });

    it('should return undefined for unknown genre', () => {
      const channel = getChannelByGenre('unknown-genre-xyz');
      expect(channel).toBeUndefined();
    });
  });

  describe('searchStreams', () => {
    it('should find streams by title', () => {
      const results = searchStreams('jazz');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(s => s.title.includes('Jazz'))).toBe(true);
    });

    it('should find streams by artist', () => {
      const results = searchStreams('AccuRadio');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find streams by channel', () => {
      const results = searchStreams('RRB');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should be case-insensitive', () => {
      const results1 = searchStreams('BLUES');
      const results2 = searchStreams('blues');
      expect(results1.length).toBe(results2.length);
    });

    it('should return empty array for no matches', () => {
      const results = searchStreams('nonexistent-stream-xyz');
      expect(results.length).toBe(0);
    });

    it('should find multiple matches', () => {
      const results = searchStreams('rock');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Stream source providers', () => {
    it('should use AccuRadio for R&B', () => {
      expect(LIVE_STREAMS.soulAndRB.artist).toBe('AccuRadio');
      expect(LIVE_STREAMS.soulAndRB.url).toContain('accuradio');
    });

    it('should use JazzRadio for Jazz', () => {
      expect(LIVE_STREAMS.jazzChannel.artist).toBe('JazzRadio');
      expect(LIVE_STREAMS.jazzChannel.url).toContain('jazzradio');
    });

    it('should use RadioTunes for multiple genres', () => {
      const radioTunesStreams = Object.values(LIVE_STREAMS)
        .filter(s => s.artist === 'RadioTunes');
      expect(radioTunesStreams.length).toBeGreaterThan(0);
    });

    it('should use TuneIn for Talk/News/Sports', () => {
      expect(LIVE_STREAMS.talkRadio.artist).toBe('TuneIn');
      expect(LIVE_STREAMS.newsRadio.artist).toBe('TuneIn');
      expect(LIVE_STREAMS.sportsRadio.artist).toBe('TuneIn');
    });

    it('should use SomaFM for Ambient/Meditation', () => {
      expect(LIVE_STREAMS.droneZone.artist).toBe('SomaFM');
      expect(LIVE_STREAMS.grooveSalad.artist).toBe('SomaFM');
    });
  });
});
