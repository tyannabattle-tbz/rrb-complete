/**
 * Operator Checklist Service
 * Generates quick-reference cards for broadcast operators
 * Covers all 5 UN WCS integration scenarios
 */

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  timeEstimate: number; // minutes
}

export interface OperatorChecklist {
  scenarioId: string;
  scenarioName: string;
  totalTime: number;
  items: ChecklistItem[];
  printableFormat: string;
}

const scenarios = {
  'rtmp-push': {
    name: 'RTMP Push (Most Common)',
    items: [
      { title: 'Get RTMP URL from UN WCS', description: 'Request their RTMP endpoint and stream key', time: 0 },
      { title: 'Open RTMP Configuration', description: 'Navigate to Dashboard → RTMP Configuration', time: 1 },
      { title: 'Add RTMP Endpoint', description: 'Enter the RTMP URL provided by UN WCS', time: 1 },
      { title: 'Verify Stream Key', description: 'Confirm authentication credentials if required', time: 1 },
      { title: 'Test Connection', description: 'Click "Test Connection" and verify UN WCS receives stream', time: 2 },
      { title: 'Configure Backup Endpoint', description: 'Add secondary RTMP for failover', time: 1 },
      { title: 'Monitor Stream Health', description: 'Watch bitrate, latency, and packet loss', time: 5 },
    ],
  },
  'webrtc-direct': {
    name: 'WebRTC Direct Connection',
    items: [
      { title: 'Copy Broadcast Viewer Link', description: 'Get the link for UN WCS operators', time: 1 },
      { title: 'Send Link to UN WCS', description: 'Provide link via secure channel', time: 1 },
      { title: 'UN WCS Opens Link', description: 'They open link in their broadcast control room', time: 2 },
      { title: 'Verify Connection', description: 'Confirm they can see live stream and panelists', time: 2 },
      { title: 'Test Audio/Video', description: 'Verify audio sync and video quality', time: 2 },
      { title: 'They Record/Embed', description: 'UN WCS records or embeds from their end', time: 0 },
    ],
  },
  'hls-streaming': {
    name: 'HLS Streaming (Fallback)',
    items: [
      { title: 'Enable HLS Output', description: 'Activate HLS streaming in Dashboard', time: 1 },
      { title: 'Copy HLS URL', description: 'Get the HLS stream URL', time: 1 },
      { title: 'Send URL to UN WCS', description: 'Provide HLS URL for embedding', time: 1 },
      { title: 'UN WCS Embeds Player', description: 'They configure their player with HLS URL', time: 2 },
      { title: 'Test Playback', description: 'Verify stream plays on their platform', time: 2 },
      { title: 'Monitor Bitrate Adaptation', description: 'Watch adaptive bitrate adjustment', time: 5 },
    ],
  },
  'youtube-live': {
    name: 'YouTube Live Integration',
    items: [
      { title: 'Create YouTube Live Event', description: 'Set up live event in YouTube Studio', time: 5 },
      { title: 'Get YouTube RTMP URL', description: 'Copy the RTMP URL from YouTube', time: 1 },
      { title: 'Configure YouTube RTMP', description: 'Add YouTube RTMP to your platform', time: 1 },
      { title: 'Send YouTube URL to UN WCS', description: 'Provide YouTube video URL for embedding', time: 1 },
      { title: 'UN WCS Embeds Player', description: 'They use YouTube embed code', time: 2 },
      { title: 'Monitor YouTube Analytics', description: 'Watch viewer count and engagement', time: 5 },
    ],
  },
  'custom-integration': {
    name: 'Custom Integration (Unknown)',
    items: [
      { title: 'Ask Technical Questions', description: 'Get detailed specs from UN WCS', time: 0 },
      { title: 'Document Requirements', description: 'Record all technical specifications', time: 5 },
      { title: 'Configure Your Platform', description: 'Adapt your setup to their requirements', time: 10 },
      { title: 'Test in Staging', description: 'Test with UN WCS in test environment', time: 15 },
      { title: 'Final Verification', description: 'Confirm everything working as expected', time: 5 },
      { title: 'Prepare Backup Plan', description: 'Have fallback to RTMP or YouTube ready', time: 5 },
    ],
  },
};

export class OperatorChecklistService {
  /**
   * Generate checklist for a specific scenario
   */
  static generateChecklist(scenarioId: string): OperatorChecklist {
    const scenario = scenarios[scenarioId as keyof typeof scenarios];
    if (!scenario) {
      throw new Error(`Unknown scenario: ${scenarioId}`);
    }

    const items: ChecklistItem[] = scenario.items.map((item, idx) => ({
      id: `${scenarioId}-${idx}`,
      title: item.title,
      description: item.description,
      completed: false,
      timeEstimate: item.time,
    }));

    const totalTime = items.reduce((sum, item) => sum + item.timeEstimate, 0);

    return {
      scenarioId,
      scenarioName: scenario.name,
      totalTime,
      items,
      printableFormat: this.generatePrintableFormat(scenarioId, scenario.name, items),
    };
  }

  /**
   * Generate all checklists
   */
  static generateAllChecklists(): OperatorChecklist[] {
    return Object.keys(scenarios).map(scenarioId =>
      this.generateChecklist(scenarioId)
    );
  }

  /**
   * Generate printable format (markdown)
   */
  private static generatePrintableFormat(
    scenarioId: string,
    scenarioName: string,
    items: ChecklistItem[]
  ): string {
    const totalTime = items.reduce((sum, item) => sum + item.timeEstimate, 0);

    let markdown = `# UN WCS Broadcast Operator Checklist\n\n`;
    markdown += `## ${scenarioName}\n\n`;
    markdown += `**Total Setup Time:** ${totalTime} minutes\n\n`;
    markdown += `**Scenario ID:** ${scenarioId}\n\n`;
    markdown += `---\n\n`;

    markdown += `## Pre-Broadcast Checklist\n\n`;
    items.forEach((item, idx) => {
      markdown += `### ${idx + 1}. ${item.title}\n\n`;
      markdown += `- [ ] ${item.description}\n`;
      if (item.timeEstimate > 0) {
        markdown += `- **Time:** ~${item.timeEstimate} minutes\n`;
      }
      markdown += `\n`;
    });

    markdown += `---\n\n`;
    markdown += `## Quick Reference\n\n`;
    markdown += `- **Scenario:** ${scenarioName}\n`;
    markdown += `- **Total Time:** ${totalTime} minutes\n`;
    markdown += `- **Items:** ${items.length}\n`;
    markdown += `- **Completed:** 0/${items.length}\n\n`;

    markdown += `---\n\n`;
    markdown += `**Print this checklist and check off items as you complete them.**\n`;
    markdown += `**Keep this with you during the broadcast for quick reference.**\n`;

    return markdown;
  }

  /**
   * Generate emergency response checklist
   */
  static generateEmergencyChecklist(): string {
    return `# UN WCS Broadcast - Emergency Response Checklist

## If Stream Fails (0-30 seconds)

- [ ] Check stream health dashboard
- [ ] Verify RTMP connection status
- [ ] If failed, click "Activate Secondary Endpoint"
- [ ] Announce to audience: "Brief technical pause, resuming shortly"

## Short-term Response (30 seconds - 2 minutes)

- [ ] Verify secondary stream receiving data
- [ ] Confirm UN WCS received failover stream
- [ ] Resume broadcast
- [ ] Monitor closely for next 5 minutes

## If Secondary Also Fails

- [ ] Switch to YouTube Live output
- [ ] Send YouTube URL to UN WCS
- [ ] They switch to YouTube embed
- [ ] Continue broadcast

## If Panelist Connection Drops

- [ ] Mute their microphone
- [ ] Switch to Speaker Focus scene
- [ ] Try to reconnect them
- [ ] If unable, continue with remaining panelists

## If Internet Connection Fails

- [ ] Switch to mobile hotspot backup
- [ ] Quality will be reduced but broadcast continues
- [ ] Announce to audience if needed

## Post-Emergency

- [ ] Document what happened
- [ ] Note exact time of failure
- [ ] Record duration of outage
- [ ] Send incident report to UN WCS
- [ ] Analyze root cause
`;
  }

  /**
   * Generate pre-event preparation timeline
   */
  static generatePreEventTimeline(): string {
    return `# UN WCS Event - Pre-Event Preparation Timeline

## 2 Weeks Before Event

- [ ] Contact UN WCS for technical specifications
- [ ] Get their streaming requirements document
- [ ] Obtain RTMP URL(s) or streaming endpoint
- [ ] Test connection to their server
- [ ] Verify authentication credentials
- [ ] Get backup contact information
- [ ] Schedule technical rehearsal

## 1 Week Before Event

- [ ] Complete technical rehearsal with UN WCS
- [ ] Test all backup endpoints
- [ ] Verify panelists can connect
- [ ] Test chat, Q&A, polls functionality
- [ ] Test recording and archival
- [ ] Verify captions working in all languages
- [ ] Test failover procedures
- [ ] Brief all operators on procedures

## 3 Days Before Event

- [ ] Final system health check
- [ ] Update all documentation
- [ ] Confirm panelist details and contact info
- [ ] Verify all equipment functioning
- [ ] Test internet connection (upload speed >25 Mbps)
- [ ] Clear storage space (need 50GB+ for recording)
- [ ] Backup all configurations
- [ ] Create operator runbook printouts

## 1 Day Before Event

- [ ] System stress test (simulate full broadcast)
- [ ] Test with all panelists
- [ ] Verify UN WCS can receive your stream
- [ ] Test with sample audience
- [ ] Final walkthrough with all operators
- [ ] Charge all backup equipment
- [ ] Prepare backup internet connection (mobile hotspot)
- [ ] Print all checklists and procedures

## Day of Event (T-2 Hours)

- [ ] Start all systems
- [ ] Verify all services running
- [ ] Test panelist connections
- [ ] Test audience viewer
- [ ] Verify UN WCS receiving stream
- [ ] Final audio/video test
- [ ] Brief all operators
- [ ] Stand by for broadcast
`;
  }
}

export default OperatorChecklistService;
