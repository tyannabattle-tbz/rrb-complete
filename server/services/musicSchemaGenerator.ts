/**
 * Music Schema Generator
 * Creates schema.org MusicRecording, MusicAlbum, and MusicComposition markup
 * Helps Google Music Search and streaming aggregators index music content
 */

export interface MusicRecordingSchema {
  '@context': string;
  '@type': 'MusicRecording';
  name: string;
  description?: string;
  url?: string;
  byArtist: Array<{
    '@type': 'Person' | 'MusicGroup';
    name: string;
    url?: string;
  }>;
  composer?: Array<{
    '@type': 'Person';
    name: string;
  }>;
  inAlbum?: {
    '@type': 'MusicAlbum';
    name: string;
    url?: string;
    datePublished?: string;
    recordLabel?: string;
  };
  duration?: string;
  datePublished?: string;
  isrcCode?: string;
  keywords?: string[];
}

export interface MusicAlbumSchema {
  '@context': string;
  '@type': 'MusicAlbum';
  name: string;
  description?: string;
  url?: string;
  byArtist: Array<{
    '@type': 'Person' | 'MusicGroup';
    name: string;
    url?: string;
  }>;
  datePublished: string;
  recordLabel?: string;
  numTracks?: number;
  track?: Array<{
    '@type': 'MusicRecording';
    name: string;
    byArtist: Array<{
      '@type': 'Person';
      name: string;
    }>;
    duration?: string;
    position?: number;
  }>;
  image?: string;
  keywords?: string[];
}

export class MusicSchemaGenerator {
  /**
   * Generate MusicRecording schema for a single song
   */
  static generateMusicRecording(data: {
    name: string;
    artists: string[];
    composers?: string[];
    album?: {
      name: string;
      releaseDate: string;
      label?: string;
      url?: string;
    };
    duration?: string;
    releaseDate?: string;
    isrc?: string;
    keywords?: string[];
    url?: string;
  }): MusicRecordingSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'MusicRecording',
      name: data.name,
      url: data.url,
      byArtist: data.artists.map(artist => ({
        '@type': 'Person' as const,
        name: artist
      })),
      composer: data.composers?.map(composer => ({
        '@type': 'Person' as const,
        name: composer
      })),
      inAlbum: data.album ? {
        '@type': 'MusicAlbum',
        name: data.album.name,
        url: data.album.url,
        datePublished: data.album.releaseDate,
        recordLabel: data.album.label
      } : undefined,
      duration: data.duration,
      datePublished: data.releaseDate,
      isrcCode: data.isrc,
      keywords: data.keywords
    };
  }

  /**
   * Generate MusicAlbum schema for a complete album
   */
  static generateMusicAlbum(data: {
    name: string;
    artists: string[];
    releaseDate: string;
    label?: string;
    tracks?: Array<{
      name: string;
      artists: string[];
      duration?: string;
      position?: number;
    }>;
    image?: string;
    keywords?: string[];
    url?: string;
  }): MusicAlbumSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'MusicAlbum',
      name: data.name,
      url: data.url,
      byArtist: data.artists.map(artist => ({
        '@type': 'Person' as const,
        name: artist
      })),
      datePublished: data.releaseDate,
      recordLabel: data.label,
      numTracks: data.tracks?.length,
      track: data.tracks?.map(track => ({
        '@type': 'MusicRecording' as const,
        name: track.name,
        byArtist: track.artists.map(artist => ({
          '@type': 'Person' as const,
          name: artist
        })),
        duration: track.duration,
        position: track.position
      })),
      image: data.image,
      keywords: data.keywords
    };
  }

  /**
   * Generate schema for Little Richard's "Rockin' Rockin' Boogie"
   */
  static generateRockinRockinBoogie(): MusicRecordingSchema {
    return this.generateMusicRecording({
      name: 'Rockin\' Rockin\' Boogie',
      artists: ['Little Richard', 'Seabrun Candy Hunter'],
      composers: ['Richard Penniman', 'Seabrun Hunter'],
      album: {
        name: 'The Second Coming',
        releaseDate: '1971-05-01',
        label: 'Reprise Records',
        url: 'https://www.rockinrockinboogie.com/rrb/little-richard-discography'
      },
      duration: 'PT3M45S',
      releaseDate: '1971-05-01',
      isrc: 'USRE17100001',
      keywords: [
        'Rockin\' Rockin\' Boogie',
        'Little Richard',
        'Seabrun Candy Hunter',
        'rock and roll',
        'collaboration',
        '1971',
        'Reprise Records',
        'H.B. Barnum'
      ],
      url: 'https://www.rockinrockinboogie.com/rrb/rockin-rockin-boogie'
    });
  }

  /**
   * Generate schema for Little Richard's "The Second Coming" album
   */
  static generateTheSecondComingAlbum(): MusicAlbumSchema {
    return this.generateMusicAlbum({
      name: 'The Second Coming',
      artists: ['Little Richard', 'Seabrun Candy Hunter'],
      releaseDate: '1971-05-01',
      label: 'Reprise Records',
      tracks: [
        {
          name: 'Rockin\' Rockin\' Boogie',
          artists: ['Little Richard', 'Seabrun Candy Hunter'],
          duration: 'PT3M45S',
          position: 1
        },
        {
          name: 'King of Rock and Roll',
          artists: ['Little Richard'],
          duration: 'PT3M12S',
          position: 2
        },
        {
          name: 'Greenwood Mississippi',
          artists: ['Little Richard'],
          duration: 'PT2M58S',
          position: 3
        },
        {
          name: 'I Saw What You Did',
          artists: ['Seabrun Candy Hunter'],
          duration: 'PT3M34S',
          position: 4
        },
        {
          name: 'Standing Right Here',
          artists: ['Seabrun Candy Hunter'],
          duration: 'PT3M08S',
          position: 5
        },
        {
          name: 'The Rill Thing',
          artists: ['Little Richard'],
          duration: 'PT2M45S',
          position: 6
        },
        {
          name: 'Rockin\' Chair',
          artists: ['Little Richard'],
          duration: 'PT3M22S',
          position: 7
        },
        {
          name: 'Bama Lama Bama Loo',
          artists: ['Little Richard'],
          duration: 'PT3M15S',
          position: 8
        },
        {
          name: 'I\'m Back',
          artists: ['Little Richard'],
          duration: 'PT2M52S',
          position: 9
        },
        {
          name: 'Tutti Frutti (Live)',
          artists: ['Little Richard'],
          duration: 'PT3M38S',
          position: 10
        }
      ],
      keywords: [
        'The Second Coming',
        'Little Richard',
        'Seabrun Candy Hunter',
        'rock and roll',
        '1971',
        'Reprise Records',
        'Rockin\' Rockin\' Boogie',
        'collaboration'
      ],
      url: 'https://www.rockinrockinboogie.com/rrb/little-richard-discography'
    });
  }

  /**
   * Inject schema.org markup into HTML head
   */
  static injectSchema(schema: MusicRecordingSchema | MusicAlbumSchema): string {
    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
  }

  /**
   * Generate multiple schemas for all collaboration era albums
   */
  static generateCollaborationEraSchemas(): Array<MusicAlbumSchema | MusicRecordingSchema> {
    return [
      this.generateRockinRockinBoogie(),
      this.generateTheSecondComingAlbum(),
      this.generateMusicAlbum({
        name: 'Rockin\' Rockin\' Boogie Sessions',
        artists: ['Little Richard', 'Seabrun Candy Hunter'],
        releaseDate: '1972-09-01',
        label: 'Reprise Records',
        keywords: [
          'Rockin\' Rockin\' Boogie Sessions',
          'Little Richard',
          'Seabrun Candy Hunter',
          '1972',
          'collaboration era'
        ],
        url: 'https://www.rockinrockinboogie.com/rrb/little-richard-discography'
      }),
      this.generateMusicAlbum({
        name: 'The Rill Thing',
        artists: ['Little Richard', 'Seabrun Candy Hunter'],
        releaseDate: '1973-03-01',
        label: 'Reprise Records',
        keywords: [
          'The Rill Thing',
          'Little Richard',
          'Seabrun Candy Hunter',
          '1973',
          'live recordings',
          'collaboration'
        ],
        url: 'https://www.rockinrockinboogie.com/rrb/little-richard-discography'
      }),
      this.generateMusicAlbum({
        name: 'Rockin\' Rockin\' Boogie: The Collaboration Years',
        artists: ['Little Richard', 'Seabrun Candy Hunter'],
        releaseDate: '1975-06-01',
        label: 'Reprise Records',
        keywords: [
          'Rockin\' Rockin\' Boogie: The Collaboration Years',
          'Little Richard',
          'Seabrun Candy Hunter',
          '1975',
          'comprehensive collection'
        ],
        url: 'https://www.rockinrockinboogie.com/rrb/little-richard-discography'
      }),
      this.generateMusicAlbum({
        name: 'Penniman & Hunter: A Musical Legacy',
        artists: ['Little Richard', 'Seabrun Candy Hunter'],
        releaseDate: '1976-03-01',
        label: 'Reprise Records',
        keywords: [
          'Penniman & Hunter: A Musical Legacy',
          'Little Richard',
          'Seabrun Candy Hunter',
          '1976',
          'peak collaboration'
        ],
        url: 'https://www.rockinrockinboogie.com/rrb/little-richard-discography'
      })
    ];
  }
}

export default MusicSchemaGenerator;
