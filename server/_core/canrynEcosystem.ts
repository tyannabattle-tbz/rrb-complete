/**
 * Canryn Production Inc. - Parent Company Structure
 * "A Corporation with the Right Stuff!"
 * 
 * LEGACY RESTORED (Original 6 Subsidiaries):
 *   Canryn Publishing Co. - Literary & Arts Publishing
 *   Seasha Distribution Co. - Shipping & Receiving Department
 *   Annas Promotion Co. - Artist & Model Management
 *   Jaelon Enterprises - Investment & Book Keeping Co. (Run by Jaelon)
 *   Little C Recording Co. - Video & Sound Recording Co.
 *   Sean's Music World - Video & Sound Publishing Co. (Run by Sean)
 * 
 * LEGACY CONTINUED (Digital Platform Products):
 *   Qumus - Autonomous Orchestration Engine
 *   RRB Radio - Emergency Broadcast & Community Radio
 *   HybridCast - Multi-platform Streaming & Broadcast
 *   Sweet Miracles - NPO for Community Support (Founded by Ty Battle, Seabrun's daughter)
 *   Rockin Rockin Boogie - Entertainment & Music Platform
 * 
 * Founder: Seabrun "Candy" Hunter Jr. | Operators: Jaelon, Sean
 */

export interface CanrynSubsidiary {
  subsidiaryId: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
  autonomyLevel: number; // 0-100, percentage of autonomous control
  humanOversightRequired: boolean;
  integrations: string[];
  lastHealthCheck: Date;
}

export interface CanrynConfig {
  companyName: string;
  founder: string;
  operators: string[];
  mission: string;
  motto: string;
  subsidiaries: Map<string, CanrynSubsidiary>;
  autonomyTarget: number; // 90% autonomous, 10% human
  humanOversightLevel: number; // 10% human interaction
}

export interface CanrynMetrics {
  totalSubsidiaries: number;
  activeSubsidiaries: number;
  systemHealth: number; // 0-100
  autonomyLevel: number;
  humanInterventions: number;
  lastUpdate: Date;
}

class CanrynEcosystem {
  private config: CanrynConfig;
  private metrics: CanrynMetrics;

  constructor() {
    this.config = {
      companyName: 'Canryn Production Inc.',
      founder: 'Seabrun "Candy" Hunter Jr.',
      operators: ['Jaelon', 'Sean'],
      mission: 'Create generational wealth through Canryn Production and Sweet Miracles grant and donation funding. Structured for legacy restored and legacy continued — perpetual operation. A Voice for the Voiceless.',
      motto: 'A Corporation with the Right Stuff!',
      subsidiaries: new Map(),
      autonomyTarget: 90,
      humanOversightLevel: 10,
    };

    this.metrics = {
      totalSubsidiaries: 0,
      activeSubsidiaries: 0,
      systemHealth: 100,
      autonomyLevel: 0,
      humanInterventions: 0,
      lastUpdate: new Date(),
    };

    this.initializeSubsidiaries();
  }

  /**
   * Initialize all Canryn subsidiaries
   */
  private initializeSubsidiaries(): void {
    // === LEGACY RESTORED: Original 6 Subsidiaries (The Foundation) ===
    this.registerSubsidiary({
      subsidiaryId: 'canryn-publishing',
      name: 'Canryn Publishing Co.',
      description: 'Literary & Arts Publishing — preserving and publishing the creative works of Seabrun Candy Hunter and the Canryn legacy',
      status: 'active',
      autonomyLevel: 80,
      humanOversightRequired: true,
      integrations: ['seasha-distribution', 'seans-music-world', 'little-c-recording'],
      lastHealthCheck: new Date(),
    });
    this.registerSubsidiary({
      subsidiaryId: 'seasha-distribution',
      name: 'Seasha Distribution Co.',
      description: 'Shipping & Receiving Department — handling all physical and digital distribution for Canryn Production',
      status: 'active',
      autonomyLevel: 85,
      humanOversightRequired: true,
      integrations: ['canryn-publishing', 'little-c-recording', 'seans-music-world'],
      lastHealthCheck: new Date(),
    });
    this.registerSubsidiary({
      subsidiaryId: 'annas-promotion',
      name: 'Annas Promotion Co.',
      description: 'Artist & Model Management — managing talent, promotions, and brand partnerships',
      status: 'active',
      autonomyLevel: 75,
      humanOversightRequired: true,
      integrations: ['canryn-publishing', 'little-c-recording'],
      lastHealthCheck: new Date(),
    });
    this.registerSubsidiary({
      subsidiaryId: 'jaelon-enterprises',
      name: 'Jaelon Enterprises',
      description: 'Investment & Book Keeping Co. — managing finances, investments, and corporate operations. Run by Jaelon.',
      status: 'active',
      autonomyLevel: 70,
      humanOversightRequired: true,
      integrations: ['canryn-publishing', 'seasha-distribution', 'annas-promotion', 'little-c-recording', 'seans-music-world'],
      lastHealthCheck: new Date(),
    });
    this.registerSubsidiary({
      subsidiaryId: 'little-c-recording',
      name: 'Little C Recording Co.',
      description: 'Video & Sound Recording Co. — the studio arm of Canryn Production for all audio and video recording',
      status: 'active',
      autonomyLevel: 85,
      humanOversightRequired: true,
      integrations: ['canryn-publishing', 'seasha-distribution', 'seans-music-world'],
      lastHealthCheck: new Date(),
    });
    this.registerSubsidiary({
      subsidiaryId: 'seans-music-world',
      name: "Sean's Music World",
      description: 'Video & Sound Publishing Co. — publishing and distributing music and video content worldwide. Run by Sean.',
      status: 'active',
      autonomyLevel: 85,
      humanOversightRequired: true,
      integrations: ['canryn-publishing', 'seasha-distribution', 'little-c-recording'],
      lastHealthCheck: new Date(),
    });

    // === LEGACY CONTINUED: Digital Platform Products ===
    // Qumus - Central Brain
    this.registerSubsidiary({
      subsidiaryId: 'qumus-core',
      name: 'Qumus',
      description: 'Autonomous orchestration engine — Central brain controlling all digital systems (Legacy Continued)',
      status: 'active',
      autonomyLevel: 95,
      humanOversightRequired: false,
      integrations: ['rrb-radio', 'hybridcast', 'sweet-miracles', 'rockin-boogie'],
      lastHealthCheck: new Date(),
    });

    // RRB Radio - Broadcasting
    this.registerSubsidiary({
      subsidiaryId: 'rrb-radio',
      name: 'RRB Radio',
      description: 'Emergency broadcast and community radio station',
      status: 'active',
      autonomyLevel: 85,
      humanOversightRequired: true,
      integrations: ['qumus-core', 'hybridcast', 'sweet-miracles'],
      lastHealthCheck: new Date(),
    });

    // HybridCast - Multi-platform Streaming
    this.registerSubsidiary({
      subsidiaryId: 'hybridcast',
      name: 'HybridCast',
      description: 'Multi-platform streaming and broadcast management',
      status: 'active',
      autonomyLevel: 90,
      humanOversightRequired: true,
      integrations: ['qumus-core', 'rrb-radio', 'sweet-miracles'],
      lastHealthCheck: new Date(),
    });

    // Sweet Miracles - NPO & Fundraising (Founded by Ty Battle, Seabrun's daughter)
    this.registerSubsidiary({
      subsidiaryId: 'sweet-miracles',
      name: 'Sweet Miracles',
      description: 'Non-profit organization for community support and fundraising. Founded by Ty Battle, Seabrun\'s daughter. A Voice for the Voiceless.',
      status: 'active',
      autonomyLevel: 80,
      humanOversightRequired: true,
      integrations: ['qumus-core', 'rrb-radio', 'hybridcast'],
      lastHealthCheck: new Date(),
    });

    // Rockin Rockin Boogie - Entertainment Platform
    this.registerSubsidiary({
      subsidiaryId: 'rockin-boogie',
      name: 'Rockin Rockin Boogie',
      description: 'Entertainment and music streaming platform',
      status: 'active',
      autonomyLevel: 85,
      humanOversightRequired: true,
      integrations: ['qumus-core', 'hybridcast', 'rrb-radio'],
      lastHealthCheck: new Date(),
    });

    console.log('[Canryn] Ecosystem initialized: 6 Legacy Restored + 5 Legacy Continued = 11 entities');
    this.updateMetrics();
  }

  /**
   * Register a new subsidiary
   */
  private registerSubsidiary(subsidiary: CanrynSubsidiary): void {
    this.config.subsidiaries.set(subsidiary.subsidiaryId, subsidiary);
    console.log(`[Canryn] Subsidiary registered: ${subsidiary.name}`);
  }

  /**
   * Get subsidiary by ID
   */
  getSubsidiary(subsidiaryId: string): CanrynSubsidiary | null {
    return this.config.subsidiaries.get(subsidiaryId) || null;
  }

  /**
   * Get all subsidiaries
   */
  getAllSubsidiaries(): CanrynSubsidiary[] {
    return Array.from(this.config.subsidiaries.values());
  }

  /**
   * Update subsidiary status
   */
  updateSubsidiaryStatus(
    subsidiaryId: string,
    status: CanrynSubsidiary['status']
  ): boolean {
    const subsidiary = this.config.subsidiaries.get(subsidiaryId);
    if (!subsidiary) return false;

    subsidiary.status = status;
    subsidiary.lastHealthCheck = new Date();

    console.log(`[Canryn] ${subsidiary.name} status updated to: ${status}`);
    this.updateMetrics();

    return true;
  }

  /**
   * Update subsidiary autonomy level
   */
  updateAutonomyLevel(subsidiaryId: string, level: number): boolean {
    const subsidiary = this.config.subsidiaries.get(subsidiaryId);
    if (!subsidiary || level < 0 || level > 100) return false;

    subsidiary.autonomyLevel = level;
    console.log(`[Canryn] ${subsidiary.name} autonomy updated to: ${level}%`);
    this.updateMetrics();

    return true;
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    const subsidiaries = Array.from(this.config.subsidiaries.values());
    const active = subsidiaries.filter((s) => s.status === 'active');
    const autonomyLevels = subsidiaries.map((s) => s.autonomyLevel);
    const avgAutonomy =
      autonomyLevels.reduce((a, b) => a + b, 0) / autonomyLevels.length;

    this.metrics = {
      totalSubsidiaries: subsidiaries.length,
      activeSubsidiaries: active.length,
      systemHealth: Math.min(100, avgAutonomy),
      autonomyLevel: Math.round(avgAutonomy),
      humanInterventions: this.metrics.humanInterventions,
      lastUpdate: new Date(),
    };
  }

  /**
   * Get ecosystem metrics
   */
  getMetrics(): CanrynMetrics {
    return { ...this.metrics };
  }

  /**
   * Get ecosystem configuration
   */
  getConfig() {
    return {
      companyName: this.config.companyName,
      founder: this.config.founder,
      operators: this.config.operators,
      mission: this.config.mission,
      motto: this.config.motto,
      autonomyTarget: this.config.autonomyTarget,
      humanOversightLevel: this.config.humanOversightLevel,
    };
  }

  /**
   * Log human intervention
   */
  logHumanIntervention(subsidiaryId: string, action: string): void {
    const subsidiary = this.config.subsidiaries.get(subsidiaryId);
    if (!subsidiary) return;

    this.metrics.humanInterventions++;
    console.log(`[Canryn] Human intervention in ${subsidiary.name}: ${action}`);
    console.log(`[Canryn] Total interventions: ${this.metrics.humanInterventions}`);
  }

  /**
   * Get system health report
   */
  getHealthReport(): {
    status: string;
    systemHealth: number;
    autonomyLevel: number;
    subsidiaryStatus: Array<{
      name: string;
      status: string;
      autonomy: number;
    }>;
  } {
    const subsidiaries = Array.from(this.config.subsidiaries.values());

    return {
      status: this.metrics.systemHealth >= 80 ? 'HEALTHY' : 'DEGRADED',
      systemHealth: this.metrics.systemHealth,
      autonomyLevel: this.metrics.autonomyLevel,
      subsidiaryStatus: subsidiaries.map((s) => ({
        name: s.name,
        status: s.status,
        autonomy: s.autonomyLevel,
      })),
    };
  }

  /**
   * Enable human override for critical operations
   */
  enableHumanOverride(subsidiaryId: string): boolean {
    const subsidiary = this.config.subsidiaries.get(subsidiaryId);
    if (!subsidiary) return false;

    subsidiary.humanOversightRequired = true;
    this.logHumanIntervention(subsidiaryId, 'Override enabled');

    return true;
  }

  /**
   * Disable human override (return to autonomous)
   */
  disableHumanOverride(subsidiaryId: string): boolean {
    const subsidiary = this.config.subsidiaries.get(subsidiaryId);
    if (!subsidiary) return false;

    subsidiary.humanOversightRequired = false;
    this.logHumanIntervention(subsidiaryId, 'Override disabled - autonomous mode');

    return true;
  }

  /**
   * Get integration map showing cross-subsidiary connections
   */
  getIntegrationMap(): Record<string, string[]> {
    const map: Record<string, string[]> = {};

    this.config.subsidiaries.forEach((subsidiary) => {
      map[subsidiary.name] = subsidiary.integrations.map((id) => {
        const integrated = this.config.subsidiaries.get(id);
        return integrated?.name || id;
      });
    });

    return map;
  }
}

// Export singleton instance
export const canrynEcosystem = new CanrynEcosystem();
