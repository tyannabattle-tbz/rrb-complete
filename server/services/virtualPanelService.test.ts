import { describe, it, expect, beforeEach } from 'vitest';
import { VirtualPanelService } from './virtualPanelService';

describe('VirtualPanelService', () => {
  let service: VirtualPanelService;

  beforeEach(() => {
    service = new VirtualPanelService();
  });

  describe('Panel Session Management', () => {
    it('should create a new panel session', async () => {
      const session = await service.createPanelSession({
        title: 'UN WCS Panel',
        description: 'Global broadcast discussion',
        startTime: new Date(),
        moderatorName: 'John Doe',
      });

      expect(session).toBeDefined();
      expect(session.title).toBe('UN WCS Panel');
      expect(session.status).toBe('scheduled');
      expect(session.panelists).toHaveLength(1);
      expect(session.panelists[0].name).toBe('John Doe');
      expect(session.panelists[0].role).toBe('moderator');
    });

    it('should retrieve a session', async () => {
      const created = await service.createPanelSession({
        title: 'Test Panel',
        description: 'Test',
        startTime: new Date(),
        moderatorName: 'Test Moderator',
      });

      const retrieved = await service.getSession(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.title).toBe('Test Panel');
    });

    it('should list all sessions', async () => {
      await service.createPanelSession({
        title: 'Panel 1',
        description: 'Test',
        startTime: new Date(),
        moderatorName: 'Mod 1',
      });

      await service.createPanelSession({
        title: 'Panel 2',
        description: 'Test',
        startTime: new Date(),
        moderatorName: 'Mod 2',
      });

      const sessions = await service.listSessions();
      expect(sessions).toHaveLength(2);
    });

    it('should start a session', async () => {
      const session = await service.createPanelSession({
        title: 'Test',
        description: 'Test',
        startTime: new Date(),
        moderatorName: 'Mod',
      });

      await service.startSession(session.id);
      const updated = await service.getSession(session.id);

      expect(updated?.status).toBe('live');
    });

    it('should pause a session', async () => {
      const session = await service.createPanelSession({
        title: 'Test',
        description: 'Test',
        startTime: new Date(),
        moderatorName: 'Mod',
      });

      await service.startSession(session.id);
      await service.pauseSession(session.id);
      const updated = await service.getSession(session.id);

      expect(updated?.status).toBe('paused');
    });

    it('should end a session', async () => {
      const session = await service.createPanelSession({
        title: 'Test',
        description: 'Test',
        startTime: new Date(),
        moderatorName: 'Mod',
      });

      await service.endSession(session.id);
      const updated = await service.getSession(session.id);

      expect(updated?.status).toBe('ended');
      expect(updated?.endTime).toBeDefined();
    });
  });

  describe('Panelist Management', () => {
    let sessionId: string;

    beforeEach(async () => {
      const session = await service.createPanelSession({
        title: 'Test',
        description: 'Test',
        startTime: new Date(),
        moderatorName: 'Moderator',
      });
      sessionId = session.id;
    });

    it('should add a panelist', async () => {
      const panelist = await service.addPanelist(sessionId, 'Ghana Partner 1');

      expect(panelist).toBeDefined();
      expect(panelist.name).toBe('Ghana Partner 1');
      expect(panelist.role).toBe('panelist');
      expect(panelist.isMuted).toBe(false);
    });

    it('should get all panelists', async () => {
      await service.addPanelist(sessionId, 'Panelist 1');
      await service.addPanelist(sessionId, 'Panelist 2');

      const panelists = await service.getPanelists(sessionId);

      expect(panelists).toHaveLength(3); // 1 moderator + 2 panelists
    });

    it('should toggle panelist mute', async () => {
      const panelist = await service.addPanelist(sessionId, 'Test Panelist');

      const isMuted1 = await service.togglePanelistMute(sessionId, panelist.id);
      expect(isMuted1).toBe(true);

      const isMuted2 = await service.togglePanelistMute(sessionId, panelist.id);
      expect(isMuted2).toBe(false);
    });

    it('should set active speaker', async () => {
      const panelist1 = await service.addPanelist(sessionId, 'Panelist 1');
      const panelist2 = await service.addPanelist(sessionId, 'Panelist 2');

      await service.setSpeaker(sessionId, panelist1.id);
      let session = await service.getSession(sessionId);
      expect(session?.panelists.find(p => p.id === panelist1.id)?.isSpeaking).toBe(true);
      expect(session?.panelists.find(p => p.id === panelist2.id)?.isSpeaking).toBe(false);

      await service.setSpeaker(sessionId, panelist2.id);
      session = await service.getSession(sessionId);
      expect(session?.panelists.find(p => p.id === panelist1.id)?.isSpeaking).toBe(false);
      expect(session?.panelists.find(p => p.id === panelist2.id)?.isSpeaking).toBe(true);
    });

    it('should update panelist connection status', async () => {
      const panelist = await service.addPanelist(sessionId, 'Test');

      await service.updatePanelistStatus(sessionId, panelist.id, 'connected');
      let session = await service.getSession(sessionId);
      expect(session?.panelists.find(p => p.id === panelist.id)?.connectionStatus).toBe('connected');

      await service.updatePanelistStatus(sessionId, panelist.id, 'disconnected');
      session = await service.getSession(sessionId);
      expect(session?.panelists.find(p => p.id === panelist.id)?.connectionStatus).toBe('disconnected');
    });

    it('should remove a panelist', async () => {
      const panelist = await service.addPanelist(sessionId, 'Test');
      let panelists = await service.getPanelists(sessionId);
      expect(panelists).toHaveLength(2);

      await service.removePanelist(sessionId, panelist.id);
      panelists = await service.getPanelists(sessionId);
      expect(panelists).toHaveLength(1);
    });
  });

  describe('Stream Output Management', () => {
    let sessionId: string;

    beforeEach(async () => {
      const session = await service.createPanelSession({
        title: 'Test',
        description: 'Test',
        startTime: new Date(),
        moderatorName: 'Mod',
      });
      sessionId = session.id;
    });

    it('should add stream output', async () => {
      const output = await service.addStreamOutput({
        panelSessionId: sessionId,
        platform: 'un-wcs',
        streamUrl: 'rtmp://un-wcs.example.com/live',
        bitrate: 5000,
        resolution: '1080p',
      });

      expect(output).toBeDefined();
      expect(output.platform).toBe('un-wcs');
      expect(output.status).toBe('active');
    });

    it('should get stream outputs', async () => {
      await service.addStreamOutput({
        panelSessionId: sessionId,
        platform: 'un-wcs',
        streamUrl: 'rtmp://un-wcs.example.com/live',
        bitrate: 5000,
        resolution: '1080p',
      });

      await service.addStreamOutput({
        panelSessionId: sessionId,
        platform: 'custom',
        streamUrl: 'rtmp://custom.example.com/live',
        bitrate: 3000,
        resolution: '720p',
      });

      const outputs = await service.getStreamOutputs(sessionId);
      expect(outputs).toHaveLength(2);
    });

    it('should update stream status', async () => {
      const output = await service.addStreamOutput({
        panelSessionId: sessionId,
        platform: 'un-wcs',
        streamUrl: 'rtmp://un-wcs.example.com/live',
        bitrate: 5000,
        resolution: '1080p',
      });

      await service.updateStreamStatus(output.id, 'error');
      const outputs = await service.getStreamOutputs(sessionId);
      expect(outputs[0].status).toBe('error');
    });
  });

  describe('Recording Management', () => {
    let sessionId: string;

    beforeEach(async () => {
      const session = await service.createPanelSession({
        title: 'Test',
        description: 'Test',
        startTime: new Date(),
        moderatorName: 'Mod',
      });
      sessionId = session.id;
    });

    it('should start recording', async () => {
      const result = await service.recordSession(sessionId);

      expect(result.recordingId).toBeDefined();
      const session = await service.getSession(sessionId);
      expect(session?.recordingUrl).toBeDefined();
    });

    it('should stop recording', async () => {
      await service.recordSession(sessionId);
      const result = await service.stopRecording(sessionId);

      expect(result.recordingUrl).toBeDefined();
      expect(result.recordingUrl).toContain('.mp4');
    });
  });

  describe('Session Statistics', () => {
    let sessionId: string;

    beforeEach(async () => {
      const session = await service.createPanelSession({
        title: 'Test',
        description: 'Test',
        startTime: new Date(),
        moderatorName: 'Moderator',
      });
      sessionId = session.id;
    });

    it('should get session statistics', async () => {
      const panelist1 = await service.addPanelist(sessionId, 'Panelist 1');
      const panelist2 = await service.addPanelist(sessionId, 'Panelist 2');

      await service.updatePanelistStatus(sessionId, panelist1.id, 'connected');
      await service.setSpeaker(sessionId, panelist1.id);

      const stats = await service.getSessionStats(sessionId);

      expect(stats.totalPanelists).toBe(3); // 1 moderator + 2 panelists
      expect(stats.connectedPanelists).toBe(1);
      expect(stats.activeSpeaker).toBe('Panelist 1');
      expect(stats.sessionDuration).toBeGreaterThanOrEqual(0);
    });

    it('should track recording status in statistics', async () => {
      await service.recordSession(sessionId);
      const stats = await service.getSessionStats(sessionId);

      expect(stats.recordingStatus).toBe('recording');
    });
  });
});
