import { describe, it, expect, beforeEach, vi } from 'vitest';
import { autonomousAgentService } from '../autonomousAgentService';
import { governmentSecurityService } from '../governmentSecurityService';

describe('Government Open Source Integration', () => {
  beforeEach(() => {
    governmentSecurityService.clearAuditLogs();
  });

  describe('Autonomous Agent Service', () => {
    it('should register a new agent', () => {
      const role = {
        id: 'broadcast-manager',
        name: 'Broadcast Manager',
        description: 'Manages broadcast operations',
        responsibilities: ['schedule broadcasts', 'manage content'],
        autonomyLevel: 75,
        approvalRequired: true,
      };

      const agent = autonomousAgentService.registerAgent('BroadcastBot', role);

      expect(agent.name).toBe('BroadcastBot');
      expect(agent.role.autonomyLevel).toBe(75);
      expect(agent.status).toBe('idle');
    });

    it('should create tasks for agents', () => {
      const role = {
        id: 'test-agent',
        name: 'Test Agent',
        description: 'Test',
        responsibilities: [],
        autonomyLevel: 50,
        approvalRequired: false,
      };

      const agent = autonomousAgentService.registerAgent('TestBot', role);
      const task = autonomousAgentService.createTask(
        agent.id,
        'Test Task',
        'Test task description',
        'high'
      );

      expect(task.title).toBe('Test Task');
      expect(task.status).toBe('pending');
      expect(task.priority).toBe('high');
    });

    it('should record agent decisions', () => {
      const role = {
        id: 'decision-maker',
        name: 'Decision Maker',
        description: 'Makes decisions',
        responsibilities: [],
        autonomyLevel: 80,
        approvalRequired: false,
      };

      const agent = autonomousAgentService.registerAgent('DecisionBot', role);
      const task = autonomousAgentService.createTask(agent.id, 'Decision Task', 'Make a decision');

      const decision = autonomousAgentService.recordDecision(
        agent.id,
        task.id,
        'Approve broadcast',
        'Content meets standards',
        0.95
      );

      expect(decision.decision).toBe('Approve broadcast');
      expect(decision.confidence).toBe(0.95);
      expect(decision.autonomyLevel).toBe(80);
    });

    it('should handle approval workflows', () => {
      const role = {
        id: 'critical-agent',
        name: 'Critical Agent',
        description: 'Makes critical decisions',
        responsibilities: [],
        autonomyLevel: 30, // Low autonomy = requires approval
        approvalRequired: true,
      };

      const agent = autonomousAgentService.registerAgent('CriticalBot', role);
      const task = autonomousAgentService.createTask(agent.id, 'Critical Task', 'Critical decision');

      const decision = autonomousAgentService.recordDecision(
        agent.id,
        task.id,
        'Critical action',
        'Requires review',
        0.85
      );

      expect(decision.status).toBe('pending');
      expect(decision.requiresApproval).toBe(true);

      const approved = autonomousAgentService.approveDecision(decision.id, 'admin-user');
      expect(approved.status).toBe('approved');
      expect(approved.approvedBy).toBe('admin-user');
    });

    it('should track system metrics', () => {
      const role = {
        id: 'metric-agent',
        name: 'Metric Agent',
        description: 'For metrics',
        responsibilities: [],
        autonomyLevel: 60,
        approvalRequired: false,
      };

      autonomousAgentService.registerAgent('MetricBot1', role);
      autonomousAgentService.registerAgent('MetricBot2', role);

      const metrics = autonomousAgentService.getSystemMetrics();

      expect(metrics.totalAgents).toBe(2);
      expect(metrics.averageAutonomy).toBe(60);
    });

    it('should generate audit trail', () => {
      const role = {
        id: 'audit-agent',
        name: 'Audit Agent',
        description: 'For audit',
        responsibilities: [],
        autonomyLevel: 50,
        approvalRequired: false,
      };

      const agent = autonomousAgentService.registerAgent('AuditBot', role);
      const task = autonomousAgentService.createTask(agent.id, 'Audit Task', 'Audit action');

      const trail = autonomousAgentService.getAuditTrail(agent.id);

      expect(trail.length).toBeGreaterThan(0);
      expect(trail[0].type).toBe('task_created');
      expect(trail[0].agentId).toBe(agent.id);
    });
  });

  describe('Government Security Service', () => {
    it('should encrypt and decrypt data', () => {
      const plaintext = 'Sensitive government data';
      const encrypted = governmentSecurityService.encrypt(plaintext);

      expect(encrypted.ciphertext).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.authTag).toBeDefined();

      const decrypted = governmentSecurityService.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('should hash data consistently', () => {
      const data = 'Test data';
      const hash1 = governmentSecurityService.hash(data);
      const hash2 = governmentSecurityService.hash(data);

      expect(hash1).toBe(hash2);
    });

    it('should verify hashes', () => {
      const data = 'Verify this';
      const hash = governmentSecurityService.hash(data);

      expect(governmentSecurityService.verifyHash(data, hash)).toBe(true);
      expect(governmentSecurityService.verifyHash('different data', hash)).toBe(false);
    });

    it('should generate secure tokens', () => {
      const token1 = governmentSecurityService.generateSecureToken();
      const token2 = governmentSecurityService.generateSecureToken();

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
    });

    it('should sign and verify data', () => {
      const data = 'Sign this data';
      const signature = governmentSecurityService.sign(data);

      expect(governmentSecurityService.verifySignature(data, signature)).toBe(true);
      expect(governmentSecurityService.verifySignature('different data', signature)).toBe(false);
    });

    it('should log audit events', () => {
      const log = governmentSecurityService.logAudit(
        'user-123',
        'broadcast_created',
        'broadcast:456',
        'success',
        { broadcastId: '456', title: 'Test Broadcast' }
      );

      expect(log.userId).toBe('user-123');
      expect(log.action).toBe('broadcast_created');
      expect(log.status).toBe('success');
      expect(log.details.broadcastId).toBe('456');
    });

    it('should retrieve filtered audit logs', () => {
      governmentSecurityService.logAudit('user-1', 'action-1', 'resource-1', 'success');
      governmentSecurityService.logAudit('user-2', 'action-2', 'resource-2', 'failure');
      governmentSecurityService.logAudit('user-1', 'action-3', 'resource-3', 'success');

      const userLogs = governmentSecurityService.getAuditLogs({ userId: 'user-1' });
      expect(userLogs.length).toBe(2);

      const failureLogs = governmentSecurityService.getAuditLogs({ status: 'failure' });
      expect(failureLogs.length).toBe(1);
    });

    it('should generate security report', () => {
      const report = governmentSecurityService.generateSecurityReport();

      expect(report.fipsCompliant).toBe(true);
      expect(report.encryptionAlgorithm).toBe('aes-256-gcm');
      expect(report.hashAlgorithm).toBe('sha256');
      expect(report.tlsVersion).toBe('1.3');
      expect(report.complianceStatus).toContain('FIPS');
    });

    it('should validate FIPS compliance', () => {
      const validation = governmentSecurityService.validateFIPSCompliance();

      expect(validation.compliant).toBe(true);
      expect(validation.issues.length).toBe(0);
    });

    it('should derive keys securely', () => {
      const password = 'secure-password';
      const key1 = governmentSecurityService.deriveKey(password);
      const key2 = governmentSecurityService.deriveKey(password);

      expect(key1).toBeDefined();
      expect(key2).toBeDefined();
      // Keys derived from same password should be different (different salt)
      expect(key1.toString('hex')).not.toBe(key2.toString('hex'));
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete agent workflow with security', () => {
      // Register agent
      const role = {
        id: 'secure-agent',
        name: 'Secure Agent',
        description: 'Secure operations',
        responsibilities: ['secure operations'],
        autonomyLevel: 70,
        approvalRequired: true,
      };

      const agent = autonomousAgentService.registerAgent('SecureBot', role);

      // Create task
      const task = autonomousAgentService.createTask(
        agent.id,
        'Secure Task',
        'Perform secure operation'
      );

      // Encrypt sensitive data
      const sensitiveData = 'Confidential broadcast content';
      const encrypted = governmentSecurityService.encrypt(sensitiveData);

      // Log security event
      const auditLog = governmentSecurityService.logAudit(
        agent.id,
        'secure_operation',
        `task:${task.id}`,
        'success',
        { encrypted: true, dataSize: sensitiveData.length }
      );

      // Verify workflow
      expect(agent.id).toBeDefined();
      expect(task.status).toBe('pending');
      expect(encrypted.ciphertext).toBeDefined();
      expect(auditLog.action).toBe('secure_operation');

      // Decrypt and verify
      const decrypted = governmentSecurityService.decrypt(encrypted);
      expect(decrypted).toBe(sensitiveData);
    });

    it('should handle multi-agent coordination', () => {
      const roles = [
        {
          id: 'content-creator',
          name: 'Content Creator',
          description: 'Creates content',
          responsibilities: ['create content'],
          autonomyLevel: 60,
          approvalRequired: false,
        },
        {
          id: 'content-reviewer',
          name: 'Content Reviewer',
          description: 'Reviews content',
          responsibilities: ['review content'],
          autonomyLevel: 80,
          approvalRequired: true,
        },
      ];

      const creatorAgent = autonomousAgentService.registerAgent('Creator', roles[0]);
      const reviewerAgent = autonomousAgentService.registerAgent('Reviewer', roles[1]);

      // Creator creates task
      const creationTask = autonomousAgentService.createTask(
        creatorAgent.id,
        'Create Broadcast',
        'Create new broadcast content'
      );

      // Reviewer creates review task
      const reviewTask = autonomousAgentService.createTask(
        reviewerAgent.id,
        'Review Broadcast',
        'Review broadcast content'
      );

      const metrics = autonomousAgentService.getSystemMetrics();
      expect(metrics.totalAgents).toBe(2);
      expect(metrics.totalTasks).toBe(2);
    });
  });
});
