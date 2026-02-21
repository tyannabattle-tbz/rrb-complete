import { randomUUID } from 'crypto';

const uuidv4 = () => randomUUID();

export interface Panelist {
  id: string;
  name: string;
  role: 'moderator' | 'panelist';
  videoStreamId?: string;
  audioStreamId?: string;
  isMuted: boolean;
  isSpeaking: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  joinedAt: Date;
}

export interface PanelSession {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  status: 'scheduled' | 'live' | 'paused' | 'ended';
  panelists: Panelist[];
  recordingUrl?: string;
  outputStreamUrl?: string;
}

export interface StreamOutput {
  id: string;
  panelSessionId: string;
  platform: 'un-wcs' | 'custom' | 'youtube' | 'facebook';
  streamUrl: string;
  status: 'active' | 'inactive' | 'error';
  bitrate: number;
  resolution: string;
}

/**
 * Virtual Panel Service
 * Manages WebRTC video conferencing for panelists
 */
export class VirtualPanelService {
  private sessions: Map<string, PanelSession> = new Map();
  private streamOutputs: Map<string, StreamOutput> = new Map();
  private panelistConnections: Map<string, any> = new Map();

  /**
   * Create a new panel session
   */
  async createPanelSession(input: {
    title: string;
    description: string;
    startTime: Date;
    moderatorName: string;
  }): Promise<PanelSession> {
    const sessionId = uuidv4();
    const moderatorId = uuidv4();

    const session: PanelSession = {
      id: sessionId,
      title: input.title,
      description: input.description,
      startTime: input.startTime,
      status: 'scheduled',
      panelists: [
        {
          id: moderatorId,
          name: input.moderatorName,
          role: 'moderator',
          isMuted: false,
          isSpeaking: false,
          connectionStatus: 'disconnected',
          joinedAt: new Date(),
        },
      ],
    };

    this.sessions.set(sessionId, session);
    console.log(`[VirtualPanel] Session created: ${sessionId}`);

    return session;
  }

  /**
   * Add a panelist to the session
   */
  async addPanelist(sessionId: string, name: string): Promise<Panelist> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const panelistId = uuidv4();
    const panelist: Panelist = {
      id: panelistId,
      name,
      role: 'panelist',
      isMuted: false,
      isSpeaking: false,
      connectionStatus: 'connecting',
      joinedAt: new Date(),
    };

    session.panelists.push(panelist);
    console.log(`[VirtualPanel] Panelist added: ${name} (${panelistId})`);

    return panelist;
  }

  /**
   * Update panelist connection status
   */
  async updatePanelistStatus(
    sessionId: string,
    panelistId: string,
    status: 'connected' | 'connecting' | 'disconnected'
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const panelist = session.panelists.find(p => p.id === panelistId);
    if (!panelist) {
      throw new Error('Panelist not found');
    }

    panelist.connectionStatus = status;
    console.log(`[VirtualPanel] Panelist ${panelist.name} status: ${status}`);
  }

  /**
   * Mute/unmute a panelist
   */
  async togglePanelistMute(sessionId: string, panelistId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const panelist = session.panelists.find(p => p.id === panelistId);
    if (!panelist) {
      throw new Error('Panelist not found');
    }

    panelist.isMuted = !panelist.isMuted;
    console.log(`[VirtualPanel] Panelist ${panelist.name} muted: ${panelist.isMuted}`);

    return panelist.isMuted;
  }

  /**
   * Set panelist as speaker
   */
  async setSpeaker(sessionId: string, panelistId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Clear previous speaker
    session.panelists.forEach(p => (p.isSpeaking = false));

    // Set new speaker
    const panelist = session.panelists.find(p => p.id === panelistId);
    if (!panelist) {
      throw new Error('Panelist not found');
    }

    panelist.isSpeaking = true;
    console.log(`[VirtualPanel] Speaker set to: ${panelist.name}`);
  }

  /**
   * Start the panel session
   */
  async startSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'live';
    console.log(`[VirtualPanel] Session started: ${sessionId}`);
  }

  /**
   * Pause the panel session
   */
  async pauseSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'paused';
    console.log(`[VirtualPanel] Session paused: ${sessionId}`);
  }

  /**
   * End the panel session
   */
  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'ended';
    session.endTime = new Date();
    console.log(`[VirtualPanel] Session ended: ${sessionId}`);
  }

  /**
   * Add stream output (to UN WCS or other platforms)
   */
  async addStreamOutput(input: {
    panelSessionId: string;
    platform: 'un-wcs' | 'custom' | 'youtube' | 'facebook';
    streamUrl: string;
    bitrate: number;
    resolution: string;
  }): Promise<StreamOutput> {
    const outputId = uuidv4();

    const output: StreamOutput = {
      id: outputId,
      panelSessionId: input.panelSessionId,
      platform: input.platform,
      streamUrl: input.streamUrl,
      status: 'active',
      bitrate: input.bitrate,
      resolution: input.resolution,
    };

    this.streamOutputs.set(outputId, output);
    console.log(`[VirtualPanel] Stream output added: ${input.platform}`);

    return output;
  }

  /**
   * Get panel session
   */
  async getSession(sessionId: string): Promise<PanelSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get all panelists in session
   */
  async getPanelists(sessionId: string): Promise<Panelist[]> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    return session.panelists;
  }

  /**
   * Get stream outputs for session
   */
  async getStreamOutputs(sessionId: string): Promise<StreamOutput[]> {
    return Array.from(this.streamOutputs.values()).filter(
      output => output.panelSessionId === sessionId
    );
  }

  /**
   * Record panel session
   */
  async recordSession(sessionId: string): Promise<{ recordingId: string }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const recordingId = uuidv4();
    session.recordingUrl = `recordings/${recordingId}.mp4`;

    console.log(`[VirtualPanel] Recording started for session ${sessionId}`);

    return { recordingId };
  }

  /**
   * Stop recording
   */
  async stopRecording(sessionId: string): Promise<{ recordingUrl: string }> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.recordingUrl) {
      throw new Error('Session or recording not found');
    }

    console.log(`[VirtualPanel] Recording stopped for session ${sessionId}`);

    return { recordingUrl: session.recordingUrl };
  }

  /**
   * Get session statistics
   */
  async getSessionStats(sessionId: string): Promise<{
    totalPanelists: number;
    connectedPanelists: number;
    activeSpeaker: string | null;
    sessionDuration: number;
    recordingStatus: string;
  }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const connectedPanelists = session.panelists.filter(
      p => p.connectionStatus === 'connected'
    ).length;

    const activeSpeaker = session.panelists.find(p => p.isSpeaking)?.name || null;

    const sessionDuration =
      session.endTime && session.status === 'ended'
        ? session.endTime.getTime() - session.startTime.getTime()
        : Date.now() - session.startTime.getTime();

    return {
      totalPanelists: session.panelists.length,
      connectedPanelists,
      activeSpeaker,
      sessionDuration,
      recordingStatus: session.recordingUrl ? 'recording' : 'not-recording',
    };
  }

  /**
   * List all sessions
   */
  async listSessions(): Promise<PanelSession[]> {
    return Array.from(this.sessions.values());
  }

  /**
   * Remove a panelist
   */
  async removePanelist(sessionId: string, panelistId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const index = session.panelists.findIndex(p => p.id === panelistId);
    if (index === -1) {
      throw new Error('Panelist not found');
    }

    const panelist = session.panelists[index];
    session.panelists.splice(index, 1);

    console.log(`[VirtualPanel] Panelist removed: ${panelist.name}`);
  }

  /**
   * Update stream output status
   */
  async updateStreamStatus(
    outputId: string,
    status: 'active' | 'inactive' | 'error'
  ): Promise<void> {
    const output = this.streamOutputs.get(outputId);
    if (!output) {
      throw new Error('Stream output not found');
    }

    output.status = status;
    console.log(`[VirtualPanel] Stream ${outputId} status: ${status}`);
  }
}

export const virtualPanelService = new VirtualPanelService();
