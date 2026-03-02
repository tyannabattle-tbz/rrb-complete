/**
 * QUMUS Command Router
 * Routes natural language commands from QUMUS Chat to appropriate subsystems
 */

export interface Command {
  type: 'broadcast' | 'content' | 'donation' | 'meditation' | 'emergency' | 'unknown';
  subsystem: 'HybridCast' | 'Rockin Rockin Boogie' | 'Sweet Miracles' | 'Canryn' | 'unknown';
  action: string;
  parameters: Record<string, any>;
  autonomyLevel: number; // 0-100
  requiresApproval: boolean;
}

export interface CommandResult {
  success: boolean;
  message: string;
  executionTime: number;
  subsystemResponse?: any;
}

const COMMAND_PATTERNS = {
  // HybridCast commands
  broadcast: [
    /^(start|begin|launch)\s+(emergency\s+)?broadcast/i,
    /^broadcast\s+(message|alert|announcement)/i,
    /^send\s+(emergency\s+)?broadcast/i,
  ],
  // Rockin Rockin Boogie commands
  content: [
    /^(play|start|queue)\s+(song|music|track|content)/i,
    /^(upload|add|publish)\s+(content|music|track)/i,
    /^manage\s+content/i,
  ],
  // Sweet Miracles commands
  donation: [
    /^(process|create|send)\s+(donation|fund|payment)/i,
    /^(donate|contribute)\s+/i,
    /^fundraise/i,
  ],
  // Meditation commands
  meditation: [
    /^(start|begin|play)\s+(meditation|session|healing)/i,
    /^meditation\s+(session|frequency|healing)/i,
    /^(heal|meditate|relax)/i,
  ],
  // Emergency commands
  emergency: [
    /^(emergency|urgent|crisis|alert)/i,
    /^(activate|trigger)\s+emergency/i,
  ],
};

const SUBSYSTEM_MAPPING = {
  broadcast: 'HybridCast',
  content: 'Rockin Rockin Boogie',
  donation: 'Sweet Miracles',
  meditation: 'Canryn',
  emergency: 'HybridCast',
};

/**
 * Parse user command and extract intent
 */
export function parseCommand(userMessage: string): Command {
  const message = userMessage.toLowerCase().trim();

  // Determine command type
  let commandType: Command['type'] = 'unknown';
  for (const [type, patterns] of Object.entries(COMMAND_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        commandType = type as Command['type'];
        break;
      }
    }
    if (commandType !== 'unknown') break;
  }

  // Determine subsystem
  const subsystem = SUBSYSTEM_MAPPING[commandType as keyof typeof SUBSYSTEM_MAPPING] || 'unknown';

  // Extract action
  const action = extractAction(message, commandType);

  // Determine autonomy level based on command type and content
  const autonomyLevel = calculateAutonomyLevel(commandType, message);

  // Determine if approval is required
  const requiresApproval = autonomyLevel < 80 || commandType === 'emergency';

  return {
    type: commandType as Command['type'],
    subsystem: subsystem as any,
    action,
    parameters: extractParameters(message, commandType),
    autonomyLevel,
    requiresApproval,
  };
}

/**
 * Extract the specific action from the command
 */
function extractAction(message: string, type: string): string {
  const actionPatterns: Record<string, RegExp[]> = {
    broadcast: [
      /broadcast\s+(\w+)/i,
      /send\s+(\w+)/i,
    ],
    content: [
      /play\s+(.+?)(?:\s+from|\s+on|$)/i,
      /upload\s+(.+?)(?:\s+to|$)/i,
    ],
    donation: [
      /donate\s+\$?([\d,]+)/i,
      /fundraise\s+for\s+(.+?)(?:\s+|$)/i,
    ],
    meditation: [
      /meditation\s+(.+?)(?:\s+session|$)/i,
      /frequency\s+(\d+)/i,
    ],
    emergency: [
      /emergency\s+(.+?)(?:\s+alert|$)/i,
    ],
  };

  const patterns = actionPatterns[type] || [];
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return type;
}

/**
 * Extract parameters from the command
 */
function extractParameters(message: string, type: string): Record<string, any> {
  const params: Record<string, any> = {};

  // Extract common parameters
  const amountMatch = message.match(/\$?([\d,]+(?:\.\d{2})?)/);
  if (amountMatch) {
    params.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  const frequencyMatch = message.match(/(\d+)\s*hz/i);
  if (frequencyMatch) {
    params.frequency = parseInt(frequencyMatch[1]);
  }

  const durationMatch = message.match(/(\d+)\s*(minute|hour|second)s?/i);
  if (durationMatch) {
    params.duration = {
      value: parseInt(durationMatch[1]),
      unit: durationMatch[2].toLowerCase(),
    };
  }

  // Type-specific parameters
  if (type === 'broadcast') {
    params.isEmergency = /emergency|urgent|critical/i.test(message);
    params.priority = params.isEmergency ? 'critical' : 'normal';
  }

  if (type === 'content') {
    params.autoPlay = /auto[\s-]?play|immediately/i.test(message);
  }

  if (type === 'donation') {
    params.anonymous = /anonymous|private/i.test(message);
  }

  return params;
}

/**
 * Calculate autonomy level for the command
 */
function calculateAutonomyLevel(type: string, message: string): number {
  let baseLevel = 75; // Default autonomy

  // Reduce autonomy for high-impact operations
  if (type === 'emergency') baseLevel = 95; // Emergency broadcasts are highly autonomous
  if (type === 'donation' && message.includes('$')) {
    const amountMatch = message.match(/\$?([\d,]+)/);
    if (amountMatch) {
      const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
      if (amount > 1000) baseLevel = 40; // Large donations need approval
      else if (amount > 500) baseLevel = 60;
      else if (amount > 100) baseLevel = 70;
    }
  }

  // Reduce autonomy for content changes
  if (type === 'content' && /delete|remove|archive/i.test(message)) {
    baseLevel = 50;
  }

  // Increase autonomy for routine operations
  if (type === 'meditation' || type === 'broadcast') {
    baseLevel = Math.min(90, baseLevel + 10);
  }

  return Math.min(100, Math.max(0, baseLevel));
}

/**
 * Execute command on the appropriate subsystem
 */
export async function executeCommand(command: Command): Promise<CommandResult> {
  const startTime = Date.now();

  try {
    // Route to appropriate subsystem
    let response: any;

    switch (command.subsystem) {
      case 'HybridCast':
        response = await executeHybridCastCommand(command);
        break;
      case 'Rockin Rockin Boogie':
        response = await executeRockinBoogieCommand(command);
        break;
      case 'Sweet Miracles':
        response = await executeSweetMiraclesCommand(command);
        break;
      case 'Canryn':
        response = await executeCanrynCommand(command);
        break;
      default:
        throw new Error(`Unknown subsystem: ${command.subsystem}`);
    }

    return {
      success: true,
      message: `Command executed on ${command.subsystem}`,
      executionTime: Date.now() - startTime,
      subsystemResponse: response,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to execute command: ${error instanceof Error ? error.message : 'Unknown error'}`,
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * HybridCast command execution
 */
async function executeHybridCastCommand(command: Command): Promise<any> {
  // Simulate HybridCast API call
  return {
    subsystem: 'HybridCast',
    action: command.action,
    status: 'executed',
    timestamp: new Date().toISOString(),
    broadcastId: `bc-${Date.now()}`,
  };
}

/**
 * Rockin Rockin Boogie command execution
 */
async function executeRockinBoogieCommand(command: Command): Promise<any> {
  // Simulate Rockin Rockin Boogie API call
  return {
    subsystem: 'Rockin Rockin Boogie',
    action: command.action,
    status: 'executed',
    timestamp: new Date().toISOString(),
    contentId: `rrb-${Date.now()}`,
  };
}

/**
 * Sweet Miracles command execution
 */
async function executeSweetMiraclesCommand(command: Command): Promise<any> {
  // Simulate Sweet Miracles API call
  return {
    subsystem: 'Sweet Miracles',
    action: command.action,
    status: 'executed',
    timestamp: new Date().toISOString(),
    donationId: `sm-${Date.now()}`,
    amount: command.parameters.amount || 0,
  };
}

/**
 * Canryn (Meditation) command execution
 */
async function executeCanrynCommand(command: Command): Promise<any> {
  // Simulate Canryn API call
  return {
    subsystem: 'Canryn',
    action: command.action,
    status: 'executed',
    timestamp: new Date().toISOString(),
    sessionId: `can-${Date.now()}`,
    frequency: command.parameters.frequency || 0,
  };
}
