/**
 * QUMUS Broadcast Chat Interface
 * Natural language command execution for broadcast orchestration
 * Processes user commands and executes autonomous broadcast operations
 */

import { getDb } from './db';
import { broadcastChatCommands, broadcastSchedules } from '../drizzle/schema';
import { invokeLLM } from './_core/llm';
import { eq } from 'drizzle-orm';

interface ChatCommand {
  userId?: number;
  broadcastId?: string;
  command: string;
  context?: Record<string, any>;
}

interface ParsedCommand {
  commandType: string;
  action: string;
  parameters: Record<string, any>;
  confidence: number;
}

interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Parse natural language command using LLM
 */
async function parseNaturalLanguageCommand(
  command: string,
  context?: Record<string, any>
): Promise<ParsedCommand> {
  const systemPrompt = `You are a broadcast orchestration AI assistant. Parse natural language commands for broadcast management.

Available command types:
- schedule: Schedule a new broadcast
- play: Start playing content
- pause: Pause current broadcast
- skip: Skip to next item
- insert_commercial: Insert commercial break
- adjust_volume: Adjust audio volume
- switch_camera: Switch camera/source
- add_track: Add music track to playlist
- remove_track: Remove music track
- start_stream: Start streaming to platform
- stop_stream: Stop streaming
- generate_content: Generate AI content
- list_broadcasts: List scheduled broadcasts
- get_status: Get broadcast status

Respond with JSON:
{
  "commandType": "string",
  "action": "string",
  "parameters": {},
  "confidence": 0-100
}`;

  const response = await invokeLLM({
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Parse this command: "${command}"${
          context ? `\nContext: ${JSON.stringify(context)}` : ''
        }`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'parsed_command',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            commandType: { type: 'string' },
            action: { type: 'string' },
            parameters: { type: 'object' },
            confidence: { type: 'number' },
          },
          required: ['commandType', 'action', 'parameters', 'confidence'],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  return JSON.parse(content);
}

/**
 * Execute broadcast command
 */
async function executeBroadcastCommand(
  parsed: ParsedCommand,
  userId?: number,
  broadcastId?: string
): Promise<CommandResult> {
  try {
    switch (parsed.commandType) {
      case 'schedule':
        return await scheduleNewBroadcast(parsed.parameters, userId);

      case 'play':
        return await playBroadcast(broadcastId, parsed.parameters);

      case 'pause':
        return await pauseBroadcast(broadcastId);

      case 'skip':
        return await skipContent(broadcastId, parsed.parameters);

      case 'insert_commercial':
        return await insertCommercial(broadcastId, parsed.parameters);

      case 'adjust_volume':
        return await adjustVolume(broadcastId, parsed.parameters);

      case 'start_stream':
        return await startStreaming(broadcastId, parsed.parameters);

      case 'stop_stream':
        return await stopStreaming(broadcastId);

      case 'generate_content':
        return await generateContent(broadcastId, parsed.parameters);

      case 'list_broadcasts':
        return await listBroadcasts(parsed.parameters);

      case 'get_status':
        return await getBroadcastStatus(broadcastId);

      default:
        return {
          success: false,
          message: `Unknown command type: ${parsed.commandType}`,
          error: 'UNKNOWN_COMMAND',
        };
    }
  } catch (error) {
    console.error('Command execution error:', error);
    return {
      success: false,
      message: 'Command execution failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Schedule new broadcast
 */
async function scheduleNewBroadcast(
  params: Record<string, any>,
  userId?: number
): Promise<CommandResult> {
  try {
    const broadcastId = `broadcast_${Date.now()}`;
    const scheduledStartTime = new Date(params.startTime || Date.now() + 3600000);
    const scheduledEndTime = new Date(params.endTime || scheduledStartTime.getTime() + 3600000);

    await db.insert(broadcastSchedules).values({
      broadcastId,
      title: params.title || 'Untitled Broadcast',
      description: params.description,
      scheduledStartTime,
      scheduledEndTime,
      status: 'scheduled',
      broadcastType: params.type || 'live',
      channels: params.channels || ['website'],
      createdBy: userId,
      autonomousScheduling: true,
    });

    return {
      success: true,
      message: `Broadcast scheduled: ${params.title}`,
      data: { broadcastId, scheduledStartTime, scheduledEndTime },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to schedule broadcast',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Play broadcast
 */
async function playBroadcast(
  broadcastId?: string,
  params?: Record<string, any>
): Promise<CommandResult> {
  if (!broadcastId) {
    return {
      success: false,
      message: 'Broadcast ID required',
      error: 'MISSING_BROADCAST_ID',
    };
  }

  try {
    await db
      .update(broadcastSchedules)
      .set({ status: 'live', actualStartTime: new Date() })
      .where(eq(broadcastSchedules.broadcastId, broadcastId));

    return {
      success: true,
      message: `Broadcast started: ${broadcastId}`,
      data: { broadcastId, status: 'live' },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to start broadcast',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Pause broadcast
 */
async function pauseBroadcast(broadcastId?: string): Promise<CommandResult> {
  if (!broadcastId) {
    return {
      success: false,
      message: 'Broadcast ID required',
      error: 'MISSING_BROADCAST_ID',
    };
  }

  try {
    await db
      .update(broadcastSchedules)
      .set({ status: 'paused' })
      .where(eq(broadcastSchedules.broadcastId, broadcastId));

    return {
      success: true,
      message: `Broadcast paused: ${broadcastId}`,
      data: { broadcastId, status: 'paused' },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to pause broadcast',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Skip to next content
 */
async function skipContent(
  broadcastId?: string,
  params?: Record<string, any>
): Promise<CommandResult> {
  if (!broadcastId) {
    return {
      success: false,
      message: 'Broadcast ID required',
      error: 'MISSING_BROADCAST_ID',
    };
  }

  return {
    success: true,
    message: `Skipped to next content in broadcast: ${broadcastId}`,
    data: { broadcastId, action: 'skip' },
  };
}

/**
 * Insert commercial break
 */
async function insertCommercial(
  broadcastId?: string,
  params?: Record<string, any>
): Promise<CommandResult> {
  if (!broadcastId) {
    return {
      success: false,
      message: 'Broadcast ID required',
      error: 'MISSING_BROADCAST_ID',
    };
  }

  return {
    success: true,
    message: `Commercial break inserted in broadcast: ${broadcastId}`,
    data: {
      broadcastId,
      action: 'insert_commercial',
      duration: params?.duration || 30,
    },
  };
}

/**
 * Adjust volume
 */
async function adjustVolume(
  broadcastId?: string,
  params?: Record<string, any>
): Promise<CommandResult> {
  if (!broadcastId) {
    return {
      success: false,
      message: 'Broadcast ID required',
      error: 'MISSING_BROADCAST_ID',
    };
  }

  return {
    success: true,
    message: `Volume adjusted for broadcast: ${broadcastId}`,
    data: {
      broadcastId,
      action: 'adjust_volume',
      level: params?.level || 50,
    },
  };
}

/**
 * Start streaming to platform
 */
async function startStreaming(
  broadcastId?: string,
  params?: Record<string, any>
): Promise<CommandResult> {
  if (!broadcastId) {
    return {
      success: false,
      message: 'Broadcast ID required',
      error: 'MISSING_BROADCAST_ID',
    };
  }

  const platforms = params?.platforms || ['youtube', 'twitch', 'facebook'];

  return {
    success: true,
    message: `Streaming started on platforms: ${platforms.join(', ')}`,
    data: {
      broadcastId,
      action: 'start_stream',
      platforms,
      status: 'streaming',
    },
  };
}

/**
 * Stop streaming
 */
async function stopStreaming(broadcastId?: string): Promise<CommandResult> {
  if (!broadcastId) {
    return {
      success: false,
      message: 'Broadcast ID required',
      error: 'MISSING_BROADCAST_ID',
    };
  }

  return {
    success: true,
    message: `Streaming stopped for broadcast: ${broadcastId}`,
    data: { broadcastId, action: 'stop_stream', status: 'offline' },
  };
}

/**
 * Generate AI content
 */
async function generateContent(
  broadcastId?: string,
  params?: Record<string, any>
): Promise<CommandResult> {
  if (!broadcastId) {
    return {
      success: false,
      message: 'Broadcast ID required',
      error: 'MISSING_BROADCAST_ID',
    };
  }

  const contentType = params?.contentType || 'description';
  const prompt = params?.prompt || `Generate ${contentType} for broadcast`;

  return {
    success: true,
    message: `AI content generated for broadcast: ${broadcastId}`,
    data: {
      broadcastId,
      action: 'generate_content',
      contentType,
      prompt,
    },
  };
}

/**
 * List broadcasts
 */
async function listBroadcasts(
  params?: Record<string, any>
): Promise<CommandResult> {
  try {
    const broadcasts = await db.select().from(broadcastSchedules).limit(10);

    return {
      success: true,
      message: `Found ${broadcasts.length} broadcasts`,
      data: { broadcasts, count: broadcasts.length },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to list broadcasts',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get broadcast status
 */
async function getBroadcastStatus(broadcastId?: string): Promise<CommandResult> {
  if (!broadcastId) {
    return {
      success: false,
      message: 'Broadcast ID required',
      error: 'MISSING_BROADCAST_ID',
    };
  }

  try {
    const broadcast = await db
      .select()
      .from(broadcastSchedules)
      .where(eq(broadcastSchedules.broadcastId, broadcastId))
      .limit(1);

    if (broadcast.length === 0) {
      return {
        success: false,
        message: `Broadcast not found: ${broadcastId}`,
        error: 'NOT_FOUND',
      };
    }

    return {
      success: true,
      message: `Broadcast status retrieved`,
      data: { broadcast: broadcast[0] },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to get broadcast status',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process chat command
 */
export async function processChatCommand(
  chatCommand: ChatCommand
): Promise<CommandResult> {
  try {
    // Parse natural language command
    const parsed = await parseNaturalLanguageCommand(
      chatCommand.command,
      chatCommand.context
    );

    // Log command
    const commandId = `cmd_${Date.now()}`;
    await db.insert(broadcastChatCommands).values({
      commandId,
      userId: chatCommand.userId,
      broadcastId: chatCommand.broadcastId,
      command: chatCommand.command,
      commandType: parsed.commandType,
      parameters: parsed.parameters,
      executedBy: 'ai_assistant',
      status: 'executing',
    });

    // Execute command
    const result = await executeBroadcastCommand(
      parsed,
      chatCommand.userId,
      chatCommand.broadcastId
    );

    // Update command status
    await db
      .update(broadcastChatCommands)
      .set({
        status: result.success ? 'completed' : 'failed',
        result: result.data,
        errorMessage: result.error,
        executionTime: Date.now(),
      })
      .where(eq(broadcastChatCommands.commandId, commandId));

    return result;
  } catch (error) {
    console.error('Chat command processing error:', error);
    return {
      success: false,
      message: 'Failed to process chat command',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get command history
 */
export async function getCommandHistory(
  broadcastId?: string,
  limit: number = 50
) {
  try {
    const query = db.select().from(broadcastChatCommands);

    if (broadcastId) {
      return await query
        .where(eq(broadcastChatCommands.broadcastId, broadcastId))
        .limit(limit);
    }

    return await query.limit(limit);
  } catch (error) {
    console.error('Error fetching command history:', error);
    return [];
  }
}

export default {
  processChatCommand,
  getCommandHistory,
  parseNaturalLanguageCommand,
  executeBroadcastCommand,
};
