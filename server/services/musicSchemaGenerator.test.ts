/**
 * Tests for Music Schema Generator
 */

import { describe, it, expect } from 'vitest';
import MusicSchemaGenerator, { MusicRecordingSchema, MusicAlbumSchema } from './musicSchemaGenerator';

describe('MusicSchemaGenerator', () => {
  describe('generateMusicRecording', () => {
    it('should generate valid MusicRecording schema', () => {
      const schema = MusicSchemaGenerator.generateMusicRecording({
        name: 'Test Song',
        artists: ['Artist One', 'Artist Two'],
        releaseDate: '2024-01-01'
      });

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('MusicRecording');
      expect(schema.name).toBe('Test Song');
      expect(schema.byArtist).toHaveLength(2);
    });

    it('should include composers when provided', () => {
      const schema = MusicSchemaGenerator.generateMusicRecording({
        name: 'Test Song',
        artists: ['Artist'],
        composers: ['Composer One', 'Composer Two'],
        releaseDate: '2024-01-01'
      });

      expect(schema.composer).toHaveLength(2);
      expect(schema.composer?.[0].name).toBe('Composer One');
    });

    it('should include album information when provided', () => {
      const schema = MusicSchemaGenerator.generateMusicRecording({
        name: 'Test Song',
        artists: ['Artist'],
        album: {
          name: 'Test Album',
          releaseDate: '2024-01-01',
          label: 'Test Label'
        },
        releaseDate: '2024-01-01'
      });

      expect(schema.inAlbum).toBeDefined();
      expect(schema.inAlbum?.name).toBe('Test Album');
      expect(schema.inAlbum?.recordLabel).toBe('Test Label');
    });

    it('should include duration when provided', () => {
      const schema = MusicSchemaGenerator.generateMusicRecording({
        name: 'Test Song',
        artists: ['Artist'],
        duration: 'PT3M45S',
        releaseDate: '2024-01-01'
      });

      expect(schema.duration).toBe('PT3M45S');
    });

    it('should include keywords when provided', () => {
      const keywords = ['rock', 'collaboration', 'test'];
      const schema = MusicSchemaGenerator.generateMusicRecording({
        name: 'Test Song',
        artists: ['Artist'],
        keywords,
        releaseDate: '2024-01-01'
      });

      expect(schema.keywords).toEqual(keywords);
    });
  });

  describe('generateMusicAlbum', () => {
    it('should generate valid MusicAlbum schema', () => {
      const schema = MusicSchemaGenerator.generateMusicAlbum({
        name: 'Test Album',
        artists: ['Artist One', 'Artist Two'],
        releaseDate: '2024-01-01',
        label: 'Test Label'
      });

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('MusicAlbum');
      expect(schema.name).toBe('Test Album');
      expect(schema.byArtist).toHaveLength(2);
      expect(schema.recordLabel).toBe('Test Label');
    });

    it('should include track information when provided', () => {
      const schema = MusicSchemaGenerator.generateMusicAlbum({
        name: 'Test Album',
        artists: ['Artist'],
        releaseDate: '2024-01-01',
        tracks: [
          { name: 'Track 1', artists: ['Artist'], duration: 'PT3M00S', position: 1 },
          { name: 'Track 2', artists: ['Artist'], duration: 'PT4M00S', position: 2 }
        ]
      });

      expect(schema.track).toHaveLength(2);
      expect(schema.numTracks).toBe(2);
      expect(schema.track?.[0].name).toBe('Track 1');
      expect(schema.track?.[1].position).toBe(2);
    });

    it('should include image when provided', () => {
      const schema = MusicSchemaGenerator.generateMusicAlbum({
        name: 'Test Album',
        artists: ['Artist'],
        releaseDate: '2024-01-01',
        image: 'https://example.com/image.jpg'
      });

      expect(schema.image).toBe('https://example.com/image.jpg');
    });
  });

  describe('generateRockinRockinBoogie', () => {
    it('should generate schema for Rockin\' Rockin\' Boogie', () => {
      const schema = MusicSchemaGenerator.generateRockinRockinBoogie();

      expect(schema.name).toBe('Rockin\' Rockin\' Boogie');
      expect(schema.byArtist).toContainEqual(expect.objectContaining({ name: 'Little Richard' }));
      expect(schema.byArtist).toContainEqual(expect.objectContaining({ name: 'Seabrun Candy Hunter' }));
    });

    it('should include co-writers in composer field', () => {
      const schema = MusicSchemaGenerator.generateRockinRockinBoogie();

      expect(schema.composer).toBeDefined();
      expect(schema.composer?.length).toBeGreaterThan(0);
    });

    it('should reference The Second Coming album', () => {
      const schema = MusicSchemaGenerator.generateRockinRockinBoogie();

      expect(schema.inAlbum?.name).toBe('The Second Coming');
      expect(schema.inAlbum?.recordLabel).toBe('Reprise Records');
    });

    it('should include relevant keywords', () => {
      const schema = MusicSchemaGenerator.generateRockinRockinBoogie();

      expect(schema.keywords).toContain('Rockin\' Rockin\' Boogie');
      expect(schema.keywords).toContain('Little Richard');
      expect(schema.keywords).toContain('Seabrun Candy Hunter');
      expect(schema.keywords).toContain('collaboration');
    });

    it('should have correct duration', () => {
      const schema = MusicSchemaGenerator.generateRockinRockinBoogie();

      expect(schema.duration).toBe('PT3M45S');
    });

    it('should have 1971 release date', () => {
      const schema = MusicSchemaGenerator.generateRockinRockinBoogie();

      expect(schema.datePublished).toBe('1971-05-01');
    });
  });

  describe('generateTheSecondComingAlbum', () => {
    it('should generate schema for The Second Coming album', () => {
      const schema = MusicSchemaGenerator.generateTheSecondComingAlbum();

      expect(schema.name).toBe('The Second Coming');
      expect(schema.byArtist).toContainEqual(expect.objectContaining({ name: 'Little Richard' }));
      expect(schema.byArtist).toContainEqual(expect.objectContaining({ name: 'Seabrun Candy Hunter' }));
    });

    it('should include 10 tracks', () => {
      const schema = MusicSchemaGenerator.generateTheSecondComingAlbum();

      expect(schema.numTracks).toBe(10);
      expect(schema.track).toHaveLength(10);
    });

    it('should have Rockin\' Rockin\' Boogie as first track', () => {
      const schema = MusicSchemaGenerator.generateTheSecondComingAlbum();

      expect(schema.track?.[0].name).toBe('Rockin\' Rockin\' Boogie');
      expect(schema.track?.[0].position).toBe(1);
    });

    it('should reference Reprise Records', () => {
      const schema = MusicSchemaGenerator.generateTheSecondComingAlbum();

      expect(schema.recordLabel).toBe('Reprise Records');
    });

    it('should have 1971 release date', () => {
      const schema = MusicSchemaGenerator.generateTheSecondComingAlbum();

      expect(schema.datePublished).toBe('1971-05-01');
    });

    it('should include collaboration keywords', () => {
      const schema = MusicSchemaGenerator.generateTheSecondComingAlbum();

      expect(schema.keywords).toContain('collaboration');
      expect(schema.keywords).toContain('1971');
    });
  });

  describe('generateCollaborationEraSchemas', () => {
    it('should generate multiple schemas', () => {
      const schemas = MusicSchemaGenerator.generateCollaborationEraSchemas();

      expect(schemas.length).toBeGreaterThan(0);
    });

    it('should include Rockin\' Rockin\' Boogie recording', () => {
      const schemas = MusicSchemaGenerator.generateCollaborationEraSchemas();
      const rrrb = schemas.find(s => s.name === 'Rockin\' Rockin\' Boogie');

      expect(rrrb).toBeDefined();
    });

    it('should include The Second Coming album', () => {
      const schemas = MusicSchemaGenerator.generateCollaborationEraSchemas();
      const album = schemas.find(s => s.name === 'The Second Coming');

      expect(album).toBeDefined();
    });

    it('should include 1971-1980 era albums', () => {
      const schemas = MusicSchemaGenerator.generateCollaborationEraSchemas();
      const eraKeywords = schemas.filter(s => 
        s.keywords?.includes('collaboration') || 
        s.keywords?.includes('1971') ||
        s.keywords?.includes('1972') ||
        s.keywords?.includes('1973') ||
        s.keywords?.includes('1975') ||
        s.keywords?.includes('1976')
      );

      expect(eraKeywords.length).toBeGreaterThan(0);
    });
  });

  describe('injectSchema', () => {
    it('should generate valid script tag', () => {
      const schema = MusicSchemaGenerator.generateRockinRockinBoogie();
      const injected = MusicSchemaGenerator.injectSchema(schema);

      expect(injected).toContain('<script type="application/ld+json">');
      expect(injected).toContain('</script>');
    });

    it('should contain valid JSON', () => {
      const schema = MusicSchemaGenerator.generateRockinRockinBoogie();
      const injected = MusicSchemaGenerator.injectSchema(schema);
      const jsonMatch = injected.match(/<script[^>]*>([\s\S]*?)<\/script>/);

      expect(jsonMatch).toBeTruthy();
      expect(() => JSON.parse(jsonMatch![1])).not.toThrow();
    });

    it('should preserve schema data in JSON', () => {
      const schema = MusicSchemaGenerator.generateRockinRockinBoogie();
      const injected = MusicSchemaGenerator.injectSchema(schema);
      const jsonMatch = injected.match(/<script[^>]*>([\s\S]*?)<\/script>/);
      const parsed = JSON.parse(jsonMatch![1]);

      expect(parsed['@context']).toBe(schema['@context']);
      expect(parsed['@type']).toBe(schema['@type']);
      expect(parsed.name).toBe(schema.name);
    });
  });

  describe('schema.org compliance', () => {
    it('should use correct schema.org context', () => {
      const recordSchema = MusicSchemaGenerator.generateMusicRecording({
        name: 'Test',
        artists: ['Artist'],
        releaseDate: '2024-01-01'
      });
      const albumSchema = MusicSchemaGenerator.generateMusicAlbum({
        name: 'Test',
        artists: ['Artist'],
        releaseDate: '2024-01-01'
      });

      expect(recordSchema['@context']).toBe('https://schema.org');
      expect(albumSchema['@context']).toBe('https://schema.org');
    });

    it('should use correct type values', () => {
      const recordSchema = MusicSchemaGenerator.generateMusicRecording({
        name: 'Test',
        artists: ['Artist'],
        releaseDate: '2024-01-01'
      });
      const albumSchema = MusicSchemaGenerator.generateMusicAlbum({
        name: 'Test',
        artists: ['Artist'],
        releaseDate: '2024-01-01'
      });

      expect(recordSchema['@type']).toBe('MusicRecording');
      expect(albumSchema['@type']).toBe('MusicAlbum');
    });

    it('should use Person type for artists and composers', () => {
      const schema = MusicSchemaGenerator.generateMusicRecording({
        name: 'Test',
        artists: ['Artist'],
        composers: ['Composer'],
        releaseDate: '2024-01-01'
      });

      expect(schema.byArtist[0]['@type']).toBe('Person');
      expect(schema.composer?.[0]['@type']).toBe('Person');
    });

    it('should use ISO 8601 duration format', () => {
      const schema = MusicSchemaGenerator.generateMusicRecording({
        name: 'Test',
        artists: ['Artist'],
        duration: 'PT3M45S',
        releaseDate: '2024-01-01'
      });

      expect(schema.duration).toMatch(/^PT\d+M\d+S$/);
    });
  });
});
