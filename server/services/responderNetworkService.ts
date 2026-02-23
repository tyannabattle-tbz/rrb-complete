/**
 * Emergency Responder Network Service
 * Manages responders, escalation chains, and emergency routing
 */

export interface Responder {
  id: string;
  name: string;
  role: 'coordinator' | 'operator' | 'medical' | 'security' | 'volunteer';
  phoneNumber: string;
  email: string;
  status: 'active' | 'inactive' | 'on-duty' | 'off-duty';
  availability: {
    monday: TimeRange[];
    tuesday: TimeRange[];
    wednesday: TimeRange[];
    thursday: TimeRange[];
    friday: TimeRange[];
    saturday: TimeRange[];
    sunday: TimeRange[];
  };
  certifications: string[];
  languages: string[];
  maxConcurrentCalls: number;
  currentCallCount: number;
  responseTime: number; // milliseconds
  successRate: number; // percentage
  createdAt: Date;
  lastActiveAt: Date;
}

export interface TimeRange {
  start: string; // HH:MM format
  end: string; // HH:MM format
}

export interface EscalationChain {
  id: string;
  name: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  responders: string[]; // responder IDs in order
  timeoutSeconds: number; // time before escalating to next responder
  maxEscalations: number;
  notificationMethods: ('sms' | 'call' | 'email' | 'push')[];
  createdAt: Date;
}

export interface SOSAlert {
  id: string;
  callerId: string;
  callerName: string;
  callerPhone: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  alertType: 'medical' | 'security' | 'mental-health' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  assignedResponders: string[]; // responder IDs
  createdAt: Date;
  resolvedAt?: Date;
  notes: string[];
}

// In-memory storage (in production, use database)
const responders: Map<string, Responder> = new Map();
const escalationChains: Map<string, EscalationChain> = new Map();
const sosAlerts: Map<string, SOSAlert> = new Map();

/**
 * Register a new responder
 */
export function registerResponder(responderData: Omit<Responder, 'id' | 'createdAt' | 'lastActiveAt'>): Responder {
  const responder: Responder = {
    ...responderData,
    id: `responder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    lastActiveAt: new Date(),
  };

  responders.set(responder.id, responder);
  console.log(`[Responder Network] Registered: ${responder.name} (${responder.role})`);

  return responder;
}

/**
 * Get responder by ID
 */
export function getResponder(responderId: string): Responder | undefined {
  return responders.get(responderId);
}

/**
 * Get all active responders
 */
export function getActiveResponders(): Responder[] {
  return Array.from(responders.values()).filter(r => r.status === 'active' || r.status === 'on-duty');
}

/**
 * Get available responders for a specific alert type
 */
export function getAvailableResponders(alertType: string, language?: string): Responder[] {
  const now = new Date();
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()] as keyof Responder['availability'];

  return Array.from(responders.values()).filter(responder => {
    // Check status
    if (responder.status !== 'active' && responder.status !== 'on-duty') return false;

    // Check call capacity
    if (responder.currentCallCount >= responder.maxConcurrentCalls) return false;

    // Check availability
    const availability = responder.availability[dayOfWeek];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const isAvailable = availability.some(range => currentTime >= range.start && currentTime <= range.end);
    if (!isAvailable) return false;

    // Check language if specified
    if (language && !responder.languages.includes(language)) return false;

    return true;
  });
}

/**
 * Create escalation chain
 */
export function createEscalationChain(chainData: Omit<EscalationChain, 'id' | 'createdAt'>): EscalationChain {
  const chain: EscalationChain = {
    ...chainData,
    id: `chain-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
  };

  escalationChains.set(chain.id, chain);
  console.log(`[Escalation Chain] Created: ${chain.name} (${chain.priority})`);

  return chain;
}

/**
 * Get escalation chain
 */
export function getEscalationChain(chainId: string): EscalationChain | undefined {
  return escalationChains.get(chainId);
}

/**
 * Get all escalation chains
 */
export function getAllEscalationChains(): EscalationChain[] {
  return Array.from(escalationChains.values());
}

/**
 * Create SOS alert
 */
export function createSOSAlert(alertData: Omit<SOSAlert, 'id' | 'createdAt' | 'status' | 'assignedResponders' | 'notes'>): SOSAlert {
  const alert: SOSAlert = {
    ...alertData,
    id: `sos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    status: 'active',
    assignedResponders: [],
    notes: [],
    createdAt: new Date(),
  };

  sosAlerts.set(alert.id, alert);
  console.log(`[SOS Alert] Created: ${alert.id} (${alert.severity}) - ${alert.alertType}`);

  return alert;
}

/**
 * Get SOS alert
 */
export function getSOSAlert(alertId: string): SOSAlert | undefined {
  return sosAlerts.get(alertId);
}

/**
 * Get active SOS alerts
 */
export function getActiveSOSAlerts(): SOSAlert[] {
  return Array.from(sosAlerts.values()).filter(a => a.status === 'active');
}

/**
 * Assign responder to SOS alert
 */
export function assignResponderToAlert(alertId: string, responderId: string): boolean {
  const alert = sosAlerts.get(alertId);
  const responder = responders.get(responderId);

  if (!alert || !responder) return false;

  alert.assignedResponders.push(responderId);
  responder.currentCallCount++;
  responder.lastActiveAt = new Date();

  sosAlerts.set(alertId, alert);
  responders.set(responderId, responder);

  console.log(`[SOS Alert] Assigned ${responder.name} to ${alertId}`);

  return true;
}

/**
 * Acknowledge SOS alert
 */
export function acknowledgeSOSAlert(alertId: string, responderId: string, note: string): boolean {
  const alert = sosAlerts.get(alertId);

  if (!alert) return false;

  alert.status = 'acknowledged';
  alert.notes.push(`[${new Date().toISOString()}] ${responderId}: ${note}`);
  sosAlerts.set(alertId, alert);

  console.log(`[SOS Alert] Acknowledged: ${alertId}`);

  return true;
}

/**
 * Resolve SOS alert
 */
export function resolveSOSAlert(alertId: string, responderId: string, resolution: string): boolean {
  const alert = sosAlerts.get(alertId);

  if (!alert) return false;

  alert.status = 'resolved';
  alert.resolvedAt = new Date();
  alert.notes.push(`[${new Date().toISOString()}] ${responderId}: RESOLVED - ${resolution}`);

  // Release responder
  const responder = responders.get(responderId);
  if (responder) {
    responder.currentCallCount = Math.max(0, responder.currentCallCount - 1);
    responders.set(responderId, responder);
  }

  sosAlerts.set(alertId, alert);

  console.log(`[SOS Alert] Resolved: ${alertId}`);

  return true;
}

/**
 * Get responder statistics
 */
export function getResponderStats() {
  const allResponders = Array.from(responders.values());

  return {
    total: allResponders.length,
    active: allResponders.filter(r => r.status === 'active' || r.status === 'on-duty').length,
    onDuty: allResponders.filter(r => r.status === 'on-duty').length,
    currentCalls: allResponders.reduce((sum, r) => sum + r.currentCallCount, 0),
    avgResponseTime: Math.round(allResponders.reduce((sum, r) => sum + r.responseTime, 0) / allResponders.length),
    avgSuccessRate: Math.round(allResponders.reduce((sum, r) => sum + r.successRate, 0) / allResponders.length),
    byRole: {
      coordinator: allResponders.filter(r => r.role === 'coordinator').length,
      operator: allResponders.filter(r => r.role === 'operator').length,
      medical: allResponders.filter(r => r.role === 'medical').length,
      security: allResponders.filter(r => r.role === 'security').length,
      volunteer: allResponders.filter(r => r.role === 'volunteer').length,
    },
  };
}

/**
 * Get SOS alert statistics
 */
export function getSOSAlertStats() {
  const allAlerts = Array.from(sosAlerts.values());

  return {
    total: allAlerts.length,
    active: allAlerts.filter(a => a.status === 'active').length,
    acknowledged: allAlerts.filter(a => a.status === 'acknowledged').length,
    resolved: allAlerts.filter(a => a.status === 'resolved').length,
    byType: {
      medical: allAlerts.filter(a => a.alertType === 'medical').length,
      security: allAlerts.filter(a => a.alertType === 'security').length,
      'mental-health': allAlerts.filter(a => a.alertType === 'mental-health').length,
      other: allAlerts.filter(a => a.alertType === 'other').length,
    },
    bySeverity: {
      low: allAlerts.filter(a => a.severity === 'low').length,
      medium: allAlerts.filter(a => a.severity === 'medium').length,
      high: allAlerts.filter(a => a.severity === 'high').length,
      critical: allAlerts.filter(a => a.severity === 'critical').length,
    },
  };
}

/**
 * Update responder status
 */
export function updateResponderStatus(responderId: string, status: Responder['status']): boolean {
  const responder = responders.get(responderId);

  if (!responder) return false;

  responder.status = status;
  responder.lastActiveAt = new Date();
  responders.set(responderId, responder);

  console.log(`[Responder Network] Status updated: ${responder.name} → ${status}`);

  return true;
}

/**
 * Get responders by language
 */
export function getRespondersByLanguage(language: string): Responder[] {
  return Array.from(responders.values()).filter(r => r.languages.includes(language));
}
