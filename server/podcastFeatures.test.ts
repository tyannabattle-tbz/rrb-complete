/**
 * Podcast Features Test Suite
 * Tests for interactive podcast player, studio booking, and distribution
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { interactivePodcastPlayerService } from './services/interactivePodcastPlayerService';
import { studioBookingService } from './services/studioBookingService';
import { podcastDistributionService } from './services/podcastDistributionService';

describe('Interactive Podcast Player Service', () => {
  let playerId: string;

  beforeEach(() => {
    playerId = `player-${Date.now()}`;
  });

  it('should create a podcast player configuration', () => {
    const config = interactivePodcastPlayerService.createPlayerConfig({
      episodeId: 'ep-001',
      title: 'Test Episode',
      description: 'Test description',
      audioUrl: 'https://example.com/audio.mp3',
      videoUrl: 'https://example.com/video.mp4',
      duration: 3600,
      transcript: 'Test transcript content',
      aiAssistant: 'seraph',
      gameEnabled: true,
      callInEnabled: true,
      chapters: []
    });

    expect(config).toBeDefined();
    expect(config.episodeId).toBe('ep-001');
    expect(config.title).toBe('Test Episode');
    expect(config.aiAssistant).toBe('seraph');
  });

  it('should get player configuration', () => {
    interactivePodcastPlayerService.createPlayerConfig({
      episodeId: 'ep-002',
      title: 'Test Episode 2',
      description: 'Test',
      audioUrl: 'https://example.com/audio.mp3',
      duration: 1800,
      transcript: 'Test',
      aiAssistant: 'candy',
      gameEnabled: false,
      callInEnabled: true,
      chapters: []
    });

    const config = interactivePodcastPlayerService.getPlayerConfig('ep-002');
    expect(config).toBeDefined();
    expect(config?.title).toBe('Test Episode 2');
  });

  it('should create a game screen', () => {
    interactivePodcastPlayerService.createPlayerConfig({
      episodeId: 'ep-003',
      title: 'Test Episode 3',
      description: 'Test',
      audioUrl: 'https://example.com/audio.mp3',
      duration: 2700,
      transcript: 'This is about AI and technology',
      aiAssistant: 'none',
      gameEnabled: true,
      callInEnabled: false,
      chapters: []
    });

    const gameScreen = interactivePodcastPlayerService.createGameScreen('ep-003', {
      type: 'trivia',
      questions: [
        {
          id: 'q1',
          question: 'What is AI?',
          options: ['Artificial Intelligence', 'Artificial Interface', 'Applied Insight', 'Advanced Innovation'],
          correctAnswer: 'Artificial Intelligence',
          points: 10
        }
      ],
      duration: 300,
      mobileOptimized: true
    });

    expect(gameScreen).toBeDefined();
    expect(gameScreen.type).toBe('trivia');
  });

  it('should create a call-in session', () => {
    const session = interactivePodcastPlayerService.createCallInSession(
      'ep-004',
      'John Caller',
      'caller-001'
    );

    expect(session).toBeDefined();
    expect(session.callerName).toBe('John Caller');
    expect(session.status).toBe('waiting');
  });

  it('should start a call-in session', () => {
    const session = interactivePodcastPlayerService.createCallInSession(
      'ep-005',
      'Jane Caller',
      'caller-002'
    );

    const started = interactivePodcastPlayerService.startCallInSession(session.sessionId);
    expect(started.status).toBe('active');
  });

  it('should end a call-in session', () => {
    const session = interactivePodcastPlayerService.createCallInSession(
      'ep-006',
      'Bob Caller',
      'caller-003'
    );

    interactivePodcastPlayerService.startCallInSession(session.sessionId);
    const ended = interactivePodcastPlayerService.endCallInSession(session.sessionId);

    expect(ended.status).toBe('completed');
  });

  it('should configure AI assistant', () => {
    interactivePodcastPlayerService.createPlayerConfig({
      episodeId: 'ep-007',
      title: 'Test Episode 7',
      description: 'Test',
      audioUrl: 'https://example.com/audio.mp3',
      duration: 1800,
      transcript: 'Test',
      aiAssistant: 'none',
      gameEnabled: false,
      callInEnabled: false,
      chapters: []
    });

    const config = interactivePodcastPlayerService.configureAIAssistant('ep-007', 'seraph');
    expect(config.aiAssistant).toBe('seraph');
  });

  it('should get player analytics', () => {
    interactivePodcastPlayerService.createPlayerConfig({
      episodeId: 'ep-008',
      title: 'Test Episode 8',
      description: 'Test',
      audioUrl: 'https://example.com/audio.mp3',
      duration: 3600,
      transcript: 'Test',
      aiAssistant: 'candy',
      gameEnabled: true,
      callInEnabled: true,
      chapters: []
    });

    const analytics = interactivePodcastPlayerService.getPlayerAnalytics('ep-008');
    expect(analytics).toBeDefined();
    expect(analytics.totalPlays).toBeGreaterThanOrEqual(0);
  });
});

describe('Studio Booking Service', () => {
  it('should create a reservation', () => {
    const reservation = studioBookingService.createReservation(
      'studio-001',
      'RRB Main Studio',
      'user-001',
      'John Producer',
      new Date('2026-04-01T09:00:00'),
      new Date('2026-04-01T11:00:00'),
      'Podcast Recording',
      ['Microphone', 'Mixer'],
      true
    );

    expect(reservation).toBeDefined();
    expect(reservation.studioName).toBe('RRB Main Studio');
    expect(reservation.status).toBe('pending');
  });

  it('should confirm a reservation', () => {
    const reservation = studioBookingService.createReservation(
      'studio-002',
      'Legacy Restoration Studio',
      'user-002',
      'Jane Producer',
      new Date('2026-04-02T10:00:00'),
      new Date('2026-04-02T12:00:00'),
      'Audiobook Recording',
      [],
      true
    );

    const confirmed = studioBookingService.confirmReservation(reservation.reservationId);
    expect(confirmed.status).toBe('confirmed');
  });

  it('should start a session', () => {
    const reservation = studioBookingService.createReservation(
      'studio-003',
      'Interview Studio',
      'user-003',
      'Bob Producer',
      new Date('2026-04-03T14:00:00'),
      new Date('2026-04-03T15:00:00'),
      'Interview Recording',
      [],
      true
    );

    studioBookingService.confirmReservation(reservation.reservationId);
    const session = studioBookingService.startSession(reservation.reservationId);

    expect(session.status).toBe('active');
  });

  it('should end a session', () => {
    const reservation = studioBookingService.createReservation(
      'studio-004',
      'Music Studio',
      'user-004',
      'Alice Producer',
      new Date('2026-04-04T16:00:00'),
      new Date('2026-04-04T18:00:00'),
      'Music Recording',
      [],
      true
    );

    studioBookingService.confirmReservation(reservation.reservationId);
    studioBookingService.startSession(reservation.reservationId);
    const ended = studioBookingService.endSession(reservation.reservationId);

    expect(ended.status).toBe('completed');
  });

  it('should get studio availability', () => {
    const availability = studioBookingService.getStudioAvailability(
      'studio-001',
      new Date('2026-04-05')
    );

    expect(availability).toBeDefined();
    expect(Array.isArray(availability.availableSlots)).toBe(true);
  });

  it('should start recording', () => {
    const reservation = studioBookingService.createReservation(
      'studio-005',
      'Voiceover Studio',
      'user-005',
      'Charlie Producer',
      new Date('2026-04-06T09:00:00'),
      new Date('2026-04-06T10:00:00'),
      'Voiceover Recording',
      [],
      true
    );

    studioBookingService.confirmReservation(reservation.reservationId);
    studioBookingService.startSession(reservation.reservationId);

    const recording = studioBookingService.startRecording(
      reservation.reservationId,
      'studio-005',
      'My Voiceover',
      'Charlie Producer',
      'Voiceover'
    );

    expect(recording).toBeDefined();
    expect(recording.status).toBe('recording');
  });

  it('should stop recording', () => {
    const reservation = studioBookingService.createReservation(
      'studio-006',
      'Emergency Broadcast Studio',
      'user-006',
      'Diana Producer',
      new Date('2026-04-07T11:00:00'),
      new Date('2026-04-07T12:00:00'),
      'Emergency Broadcast',
      [],
      true
    );

    studioBookingService.confirmReservation(reservation.reservationId);
    studioBookingService.startSession(reservation.reservationId);

    const recording = studioBookingService.startRecording(
      reservation.reservationId,
      'studio-006',
      'Emergency Broadcast',
      'Diana Producer',
      'Radio'
    );

    const stopped = studioBookingService.stopRecording(recording.recordingId);
    expect(stopped.status).toBe('completed');
  });
});

describe('Podcast Distribution Service', () => {
  it('should register an episode', () => {
    const episode = podcastDistributionService.registerEpisode({
      episodeId: 'ep-dist-001',
      title: 'Distribution Test Episode',
      description: 'Testing podcast distribution',
      audioUrl: 'https://example.com/episode.mp3',
      duration: 3600,
      releaseDate: new Date(),
      author: 'Test Author',
      artwork: 'https://example.com/artwork.jpg',
      transcript: 'Test transcript',
      tags: ['test', 'podcast'],
      explicit: false
    });

    expect(episode).toBeDefined();
    expect(episode.title).toBe('Distribution Test Episode');
  });

  it('should get all platforms', () => {
    const platforms = podcastDistributionService.getAllPlatforms();

    expect(Array.isArray(platforms)).toBe(true);
    expect(platforms.length).toBeGreaterThan(0);
    expect(platforms.some((p) => p.name === 'Spotify')).toBe(true);
  });

  it('should enable a platform', () => {
    const platform = podcastDistributionService.enablePlatform('Spotify');

    expect(platform).toBeDefined();
    expect(platform?.enabled).toBe(true);
  });

  it('should disable a platform', () => {
    const platform = podcastDistributionService.disablePlatform('YouTube');

    expect(platform).toBeDefined();
    expect(platform?.enabled).toBe(false);
  });

  it('should get distribution statistics', () => {
    const stats = podcastDistributionService.getDistributionStats();

    expect(stats).toBeDefined();
    expect(stats.totalPlatforms).toBeGreaterThan(0);
    expect(stats.enabledPlatforms).toBeGreaterThanOrEqual(0);
  });

  it('should publish episode to all platforms', async () => {
    const episode = podcastDistributionService.registerEpisode({
      episodeId: 'ep-dist-002',
      title: 'Multi-Platform Episode',
      description: 'Testing multi-platform distribution',
      audioUrl: 'https://example.com/episode2.mp3',
      duration: 2700,
      releaseDate: new Date(),
      author: 'Test Author',
      artwork: 'https://example.com/artwork2.jpg',
      transcript: 'Test transcript 2',
      tags: ['test', 'distribution'],
      explicit: false
    });

    const results = await podcastDistributionService.publishEpisodeToAllPlatforms(episode.episodeId);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.status === 'success')).toBe(true);
  });

  it('should get distribution results', async () => {
    const episode = podcastDistributionService.registerEpisode({
      episodeId: 'ep-dist-003',
      title: 'Results Test Episode',
      description: 'Testing result retrieval',
      audioUrl: 'https://example.com/episode3.mp3',
      duration: 1800,
      releaseDate: new Date(),
      author: 'Test Author',
      artwork: 'https://example.com/artwork3.jpg',
      transcript: 'Test transcript 3',
      tags: ['test'],
      explicit: false
    });

    await podcastDistributionService.publishEpisodeToAllPlatforms(episode.episodeId);
    const results = podcastDistributionService.getDistributionResults(episode.episodeId);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });
});
