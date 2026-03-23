/**
 * QUMUS Blockchain Verification Service
 * Immutable decision logging and verification for autonomous actions
 * Ensures compliance, audit trails, and transparent governance
 */

export interface DecisionBlock {
  id: string;
  timestamp: number;
  decisionId: string;
  agent: 'valanna' | 'candy' | 'seraph' | 'qumus';
  action: string;
  reasoning: string;
  confidence: number;
  impact: number;
  autonomyLevel: number;
  humanOverride: boolean;
  previousHash: string;
  hash: string;
  signature: string;
  verified: boolean;
}

export interface BlockchainLedger {
  chain: DecisionBlock[];
  difficulty: number;
  pendingTransactions: DecisionBlock[];
  minedBlocks: number;
}

export class QUMUSBlockchainVerification {
  private ledger: BlockchainLedger;
  private difficulty = 4; // Number of leading zeros required in hash

  constructor() {
    this.ledger = {
      chain: [this.createGenesisBlock()],
      difficulty: this.difficulty,
      pendingTransactions: [],
      minedBlocks: 1,
    };

    console.log('[QUMUS Blockchain] Initialized with genesis block');
  }

  /**
   * Create genesis block
   */
  private createGenesisBlock(): DecisionBlock {
    const block: DecisionBlock = {
      id: `block_0`,
      timestamp: Date.now(),
      decisionId: 'genesis',
      agent: 'qumus',
      action: 'Initialize blockchain',
      reasoning: 'Genesis block for QUMUS decision verification',
      confidence: 100,
      impact: 0,
      autonomyLevel: 0,
      humanOverride: false,
      previousHash: '0',
      hash: '',
      signature: 'genesis_signature',
      verified: true,
    };

    block.hash = this.calculateHash(block);
    return block;
  }

  /**
   * Calculate hash for a block
   */
  private calculateHash(block: DecisionBlock): string {
    const blockString = JSON.stringify({
      timestamp: block.timestamp,
      decisionId: block.decisionId,
      agent: block.agent,
      action: block.action,
      reasoning: block.reasoning,
      confidence: block.confidence,
      impact: block.impact,
      autonomyLevel: block.autonomyLevel,
      humanOverride: block.humanOverride,
      previousHash: block.previousHash,
    });

    // Simple hash function (in production, use SHA-256)
    let hash = 0;
    for (let i = 0; i < blockString.length; i++) {
      const char = blockString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(16);
  }

  /**
   * Mine a new block
   */
  private mineBlock(block: DecisionBlock): void {
    let nonce = 0;
    let hash = this.calculateHash(block);

    while (!hash.startsWith('0'.repeat(this.difficulty))) {
      nonce++;
      block.hash = hash + nonce;
      hash = this.calculateHash(block);
    }

    block.hash = hash;
    block.verified = true;

    console.log(`[QUMUS Blockchain] Block mined: ${block.id} (nonce: ${nonce})`);
  }

  /**
   * Record a decision on blockchain
   */
  recordDecision(
    decisionId: string,
    agent: 'valanna' | 'candy' | 'seraph' | 'qumus',
    action: string,
    reasoning: string,
    confidence: number,
    impact: number,
    autonomyLevel: number,
    humanOverride: boolean = false,
  ): DecisionBlock {
    const lastBlock = this.ledger.chain[this.ledger.chain.length - 1];

    const newBlock: DecisionBlock = {
      id: `block_${this.ledger.chain.length}`,
      timestamp: Date.now(),
      decisionId,
      agent,
      action,
      reasoning,
      confidence,
      impact,
      autonomyLevel,
      humanOverride,
      previousHash: lastBlock.hash,
      hash: '',
      signature: this.generateSignature(agent, decisionId),
      verified: false,
    };

    // Mine the block
    this.mineBlock(newBlock);

    // Add to chain
    this.ledger.chain.push(newBlock);
    this.ledger.minedBlocks++;

    console.log(`[QUMUS Blockchain] Decision recorded: ${action} by ${agent}`);

    return newBlock;
  }

  /**
   * Generate signature for decision
   */
  private generateSignature(agent: string, decisionId: string): string {
    return `sig_${agent}_${decisionId}_${Date.now()}`;
  }

  /**
   * Verify blockchain integrity
   */
  verifyChain(): boolean {
    for (let i = 1; i < this.ledger.chain.length; i++) {
      const currentBlock = this.ledger.chain[i];
      const previousBlock = this.ledger.chain[i - 1];

      // Verify current block hash
      if (currentBlock.hash !== this.calculateHash(currentBlock)) {
        console.error(`[QUMUS Blockchain] Invalid hash at block ${i}`);
        return false;
      }

      // Verify previous hash link
      if (currentBlock.previousHash !== previousBlock.hash) {
        console.error(`[QUMUS Blockchain] Invalid previous hash link at block ${i}`);
        return false;
      }

      // Verify block is mined
      if (!currentBlock.hash.startsWith('0'.repeat(this.difficulty))) {
        console.error(`[QUMUS Blockchain] Block ${i} not properly mined`);
        return false;
      }
    }

    console.log('[QUMUS Blockchain] Chain verified successfully');
    return true;
  }

  /**
   * Get decision history
   */
  getDecisionHistory(limit: number = 50): DecisionBlock[] {
    return this.ledger.chain.slice(-limit);
  }

  /**
   * Get decisions by agent
   */
  getDecisionsByAgent(agent: string, limit: number = 50): DecisionBlock[] {
    return this.ledger.chain.filter((block) => block.agent === agent).slice(-limit);
  }

  /**
   * Get high-impact decisions
   */
  getHighImpactDecisions(minImpact: number = 50, limit: number = 50): DecisionBlock[] {
    return this.ledger.chain.filter((block) => block.impact >= minImpact).slice(-limit);
  }

  /**
   * Get human override decisions
   */
  getHumanOverrideDecisions(limit: number = 50): DecisionBlock[] {
    return this.ledger.chain.filter((block) => block.humanOverride).slice(-limit);
  }

  /**
   * Get blockchain statistics
   */
  getStatistics() {
    const recentBlocks = this.ledger.chain.slice(-100);

    return {
      totalBlocks: this.ledger.chain.length,
      minedBlocks: this.ledger.minedBlocks,
      chainValid: this.verifyChain(),
      avgConfidence: (recentBlocks.reduce((sum, b) => sum + b.confidence, 0) / recentBlocks.length).toFixed(1),
      avgImpact: (recentBlocks.reduce((sum, b) => sum + b.impact, 0) / recentBlocks.length).toFixed(1),
      avgAutonomy: (recentBlocks.reduce((sum, b) => sum + b.autonomyLevel, 0) / recentBlocks.length).toFixed(1),
      humanOverrides: recentBlocks.filter((b) => b.humanOverride).length,
      agentBreakdown: {
        valanna: recentBlocks.filter((b) => b.agent === 'valanna').length,
        candy: recentBlocks.filter((b) => b.agent === 'candy').length,
        seraph: recentBlocks.filter((b) => b.agent === 'seraph').length,
        qumus: recentBlocks.filter((b) => b.agent === 'qumus').length,
      },
    };
  }

  /**
   * Export blockchain for audit
   */
  exportBlockchain(): string {
    return JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        chainLength: this.ledger.chain.length,
        difficulty: this.ledger.difficulty,
        chainValid: this.verifyChain(),
        blocks: this.ledger.chain,
      },
      null,
      2,
    );
  }

  /**
   * Get chain length
   */
  getChainLength(): number {
    return this.ledger.chain.length;
  }
}

// Singleton instance
export const qumusBlockchainVerification = new QUMUSBlockchainVerification();
