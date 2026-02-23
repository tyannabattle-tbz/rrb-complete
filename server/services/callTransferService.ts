/**
 * Call Transfer Service
 * Enables warm transfers between responders with full context preservation
 */

export interface CallContext {
  callId: string;
  callerId: string;
  callerName: string;
  callerPhone: string;
  currentResponderId: string;
  currentResponderName: string;
  startTime: Date;
  duration: number; // seconds
  alertType: 'medical' | 'security' | 'mental-health' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  notes: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  callRecordingId?: string;
  transferHistory: TransferRecord[];
}

export interface TransferRecord {
  id: string;
  fromResponderId: string;
  toResponderId: string;
  timestamp: Date;
  reason: string;
  contextPreserved: boolean;
}

export interface TransferRequest {
  callId: string;
  fromResponderId: string;
  toResponderId: string;
  reason: string;
  preserveContext: boolean;
  transferNotes?: string;
}

export interface TransferResponse {
  success: boolean;
  transferId: string;
  message: string;
  contextData?: CallContext;
  transferTime: number; // milliseconds
}

class CallTransferService {
  private activeTransfers: Map<string, TransferRecord> = new Map();
  private callContexts: Map<string, CallContext> = new Map();

  /**
   * Initiate a warm transfer
   */
  async initiateTransfer(request: TransferRequest): Promise<TransferResponse> {
    const startTime = Date.now();

    try {
      // Validate transfer request
      if (!request.callId || !request.fromResponderId || !request.toResponderId) {
        return {
          success: false,
          transferId: '',
          message: 'Invalid transfer request: missing required fields',
          transferTime: Date.now() - startTime,
        };
      }

      // Get call context
      const context = this.callContexts.get(request.callId);
      if (!context) {
        return {
          success: false,
          transferId: '',
          message: 'Call context not found',
          transferTime: Date.now() - startTime,
        };
      }

      // Create transfer record
      const transferId = `transfer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const transfer: TransferRecord = {
        id: transferId,
        fromResponderId: request.fromResponderId,
        toResponderId: request.toResponderId,
        timestamp: new Date(),
        reason: request.reason,
        contextPreserved: request.preserveContext,
      };

      // Store transfer
      this.activeTransfers.set(transferId, transfer);

      // Update call context
      if (request.preserveContext) {
        context.currentResponderId = request.toResponderId;
        context.transferHistory.push(transfer);

        if (request.transferNotes) {
          context.notes.push(`[Transfer] ${request.transferNotes}`);
        }

        this.callContexts.set(request.callId, context);
      }

      console.log(`[Call Transfer] Initiated: ${transferId} (${request.fromResponderId} -> ${request.toResponderId})`);

      return {
        success: true,
        transferId,
        message: `Call transferred successfully to responder ${request.toResponderId}`,
        contextData: request.preserveContext ? context : undefined,
        transferTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('[Call Transfer] Error:', error);
      return {
        success: false,
        transferId: '',
        message: `Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        transferTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Complete a transfer
   */
  async completeTransfer(transferId: string, notes?: string): Promise<boolean> {
    const transfer = this.activeTransfers.get(transferId);
    if (!transfer) {
      return false;
    }

    // Log completion
    console.log(`[Call Transfer] Completed: ${transferId}`);

    // Could add additional cleanup or logging here
    return true;
  }

  /**
   * Cancel a transfer
   */
  async cancelTransfer(transferId: string, reason: string): Promise<boolean> {
    const transfer = this.activeTransfers.get(transferId);
    if (!transfer) {
      return false;
    }

    // Log cancellation
    console.log(`[Call Transfer] Cancelled: ${transferId} - ${reason}`);

    // Remove transfer
    this.activeTransfers.delete(transferId);

    return true;
  }

  /**
   * Store call context for transfer
   */
  storeCallContext(context: CallContext): void {
    this.callContexts.set(context.callId, context);
    console.log(`[Call Context] Stored: ${context.callId}`);
  }

  /**
   * Get call context
   */
  getCallContext(callId: string): CallContext | undefined {
    return this.callContexts.get(callId);
  }

  /**
   * Add note to call context
   */
  addContextNote(callId: string, note: string): boolean {
    const context = this.callContexts.get(callId);
    if (!context) {
      return false;
    }

    context.notes.push(`[${new Date().toISOString()}] ${note}`);
    this.callContexts.set(callId, context);
    return true;
  }

  /**
   * Get transfer history for a call
   */
  getTransferHistory(callId: string): TransferRecord[] {
    const context = this.callContexts.get(callId);
    return context ? context.transferHistory : [];
  }

  /**
   * Get responder's active transfers
   */
  getResponderActiveTransfers(responderId: string): TransferRecord[] {
    return Array.from(this.activeTransfers.values()).filter(t => t.fromResponderId === responderId || t.toResponderId === responderId);
  }

  /**
   * Get transfer statistics
   */
  getTransferStats() {
    const allTransfers = Array.from(this.activeTransfers.values());
    const allContexts = Array.from(this.callContexts.values());

    return {
      activeTransfers: allTransfers.length,
      totalCalls: allContexts.length,
      callsWithTransfers: allContexts.filter(c => c.transferHistory.length > 0).length,
      averageTransfersPerCall: allContexts.length > 0 ? allContexts.reduce((sum, c) => sum + c.transferHistory.length, 0) / allContexts.length : 0,
      contextPreservationRate: allTransfers.length > 0 ? (allTransfers.filter(t => t.contextPreserved).length / allTransfers.length) * 100 : 0,
    };
  }

  /**
   * Get context summary for briefing new responder
   */
  getContextSummary(callId: string): string {
    const context = this.callContexts.get(callId);
    if (!context) {
      return 'Call context not found';
    }

    const duration = Math.floor(context.duration / 60);
    const summary = `
=== CALL CONTEXT SUMMARY ===
Caller: ${context.callerName} (${context.callerPhone})
Alert Type: ${context.alertType}
Severity: ${context.severity}
Duration: ${duration} minutes
Sentiment: ${context.sentiment}
Previous Responder: ${context.currentResponderName}
Transfers: ${context.transferHistory.length}

Description:
${context.description}

Notes:
${context.notes.map(n => `- ${n}`).join('\n')}

Transfer History:
${context.transferHistory.map(t => `- ${new Date(t.timestamp).toLocaleTimeString()}: Transferred to ${t.toResponderId} (${t.reason})`).join('\n')}
    `;

    return summary.trim();
  }

  /**
   * Validate transfer eligibility
   */
  validateTransferEligibility(callId: string, fromResponderId: string, toResponderId: string): { eligible: boolean; reason: string } {
    const context = this.callContexts.get(callId);

    if (!context) {
      return { eligible: false, reason: 'Call context not found' };
    }

    if (context.currentResponderId !== fromResponderId) {
      return { eligible: false, reason: 'Responder is not currently handling this call' };
    }

    if (fromResponderId === toResponderId) {
      return { eligible: false, reason: 'Cannot transfer to the same responder' };
    }

    // Check for excessive transfers (max 5 per call)
    if (context.transferHistory.length >= 5) {
      return { eligible: false, reason: 'Maximum number of transfers exceeded' };
    }

    return { eligible: true, reason: 'Transfer eligible' };
  }

  /**
   * Get recommended responders for transfer
   */
  getRecommendedTransferResponders(callId: string, availableResponders: any[]): string[] {
    const context = this.callContexts.get(callId);
    if (!context) {
      return [];
    }

    // Score responders based on specialization match
    const scored = availableResponders
      .filter(r => r.id !== context.currentResponderId) // Exclude current responder
      .map(responder => {
        let score = 0;

        // Match by alert type specialization
        if (responder.specializations) {
          const hasMatch = responder.specializations.some((spec: string) => spec.toLowerCase().includes(context.alertType.toLowerCase()));
          score += hasMatch ? 50 : 20;
        }

        // Match by certifications
        if (responder.certifications && responder.certifications.length > 0) {
          score += responder.certifications.length * 5;
        }

        // Match by language
        if (responder.languages && responder.languages.includes('en')) {
          score += 10;
        }

        // Lower load is better
        const loadPercentage = responder.currentCallCount / responder.maxConcurrentCalls;
        score += (1 - loadPercentage) * 20;

        return { id: responder.id, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3) // Return top 3
      .map(r => r.id);

    return scored;
  }

  /**
   * Clear call context (when call ends)
   */
  clearCallContext(callId: string): boolean {
    return this.callContexts.delete(callId);
  }
}

export const callTransferService = new CallTransferService();
