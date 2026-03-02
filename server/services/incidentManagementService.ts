import { invokeLLM } from "../_core/llm";

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "investigating" | "mitigating" | "resolved" | "closed";
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  affectedServices: string[];
  affectedUsers: number;
  rootCause?: string;
  timeline: IncidentEvent[];
  assignedTo?: string;
  estimatedResolution?: Date;
  actualResolution?: Date;
  impact: {
    downtime: number; // minutes
    usersAffected: number;
    revenue: number; // estimated
  };
}

export interface IncidentEvent {
  timestamp: Date;
  type: "created" | "updated" | "escalated" | "mitigated" | "resolved" | "comment";
  description: string;
  author?: string;
  data?: Record<string, any>;
}

export interface IncidentAnalysis {
  rootCause: string;
  contributingFactors: string[];
  recommendations: string[];
  preventionStrategies: string[];
}

export class IncidentManagementService {
  private incidents: Map<string, Incident> = new Map();
  private eventLog: IncidentEvent[] = [];

  async createIncident(
    title: string,
    description: string,
    severity: Incident["severity"],
    affectedServices: string[],
    affectedUsers: number
  ): Promise<Incident> {
    const id = `incident-${Date.now()}`;
    const incident: Incident = {
      id,
      title,
      description,
      severity,
      status: "open",
      createdAt: new Date(),
      updatedAt: new Date(),
      affectedServices,
      affectedUsers,
      timeline: [
        {
          timestamp: new Date(),
          type: "created",
          description: `Incident created: ${title}`,
        },
      ],
      impact: {
        downtime: 0,
        usersAffected: affectedUsers,
        revenue: affectedUsers * 10, // rough estimate
      },
    };

    this.incidents.set(id, incident);
    this.logEvent({
      timestamp: new Date(),
      type: "created",
      description: `Incident ${id} created with severity ${severity}`,
      data: { incidentId: id },
    });

    return incident;
  }

  async updateIncidentStatus(
    incidentId: string,
    status: Incident["status"],
    notes: string
  ): Promise<Incident | null> {
    const incident = this.incidents.get(incidentId);
    if (!incident) return null;

    incident.status = status;
    incident.updatedAt = new Date();

    if (status === "resolved") {
      incident.resolvedAt = new Date();
      incident.actualResolution = new Date();
      incident.impact.downtime = Math.round(
        (incident.resolvedAt.getTime() - incident.createdAt.getTime()) / 60000
      );
    }

    incident.timeline.push({
      timestamp: new Date(),
      type: status === "resolved" ? "resolved" : "updated",
      description: notes,
    });

    this.logEvent({
      timestamp: new Date(),
      type: "updated",
      description: `Incident ${incidentId} status updated to ${status}`,
      data: { incidentId, status, notes },
    });

    return incident;
  }

  async analyzeIncident(incident: Incident): Promise<IncidentAnalysis> {
    const prompt = `Analyze this incident and provide root cause analysis:
Title: ${incident.title}
Description: ${incident.description}
Severity: ${incident.severity}
Affected Services: ${incident.affectedServices.join(", ")}
Users Affected: ${incident.affectedUsers}
Timeline: ${incident.timeline.map((e) => `${e.timestamp.toISOString()}: ${e.description}`).join("\n")}

Provide:
1. Root cause
2. Contributing factors (list)
3. Recommendations (list)
4. Prevention strategies (list)

Format as JSON with keys: rootCause, contributingFactors, recommendations, preventionStrategies`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an incident analysis expert. Analyze incidents and provide actionable insights.",
        },
        { role: "user", content: prompt },
      ],
    });

    try {
      const msgContent = response.choices[0]?.message?.content;
      const content = typeof msgContent === 'string' ? msgContent : JSON.stringify(msgContent || {});
      const analysis = JSON.parse(content);
      return {
        rootCause: analysis.rootCause || "Unknown",
        contributingFactors: analysis.contributingFactors || [],
        recommendations: analysis.recommendations || [],
        preventionStrategies: analysis.preventionStrategies || [],
      };
    } catch {
      return {
        rootCause: "Analysis pending",
        contributingFactors: [],
        recommendations: [],
        preventionStrategies: [],
      };
    }
  }

  async getIncidentTimeline(incidentId: string): Promise<IncidentEvent[]> {
    const incident = this.incidents.get(incidentId);
    return incident?.timeline || [];
  }

  async getActiveIncidents(): Promise<Incident[]> {
    return Array.from(this.incidents.values()).filter((i) => i.status !== "closed");
  }

  async getIncidentStats(): Promise<{
    totalIncidents: number;
    activeIncidents: number;
    criticalIncidents: number;
    averageResolutionTime: number;
    mttr: number;
  }> {
    const incidents = Array.from(this.incidents.values());
    const resolved = incidents.filter((i) => i.resolvedAt);
    const avgResolution =
      resolved.length > 0
        ? resolved.reduce((sum, i) => sum + (i.impact.downtime || 0), 0) / resolved.length
        : 0;

    return {
      totalIncidents: incidents.length,
      activeIncidents: incidents.filter((i) => i.status !== "closed").length,
      criticalIncidents: incidents.filter((i) => i.severity === "critical").length,
      averageResolutionTime: avgResolution,
      mttr: avgResolution,
    };
  }

  private logEvent(event: IncidentEvent): void {
    this.eventLog.push(event);
  }

  getEventLog(): IncidentEvent[] {
    return this.eventLog;
  }
}
