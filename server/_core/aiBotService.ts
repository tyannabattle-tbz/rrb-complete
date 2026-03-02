import { invokeLLM } from './llm';

export interface AiBot {
  botId: string;
  name: string;
  description: string;
  type: 'generator' | 'editor' | 'analyzer' | 'optimizer';
  enabled: boolean;
  config: Record<string, any>;
  createdAt: number;
  lastRun?: number;
}

export interface BotTask {
  taskId: string;
  botId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  createdAt: number;
  completedAt?: number;
}

export class AiBotService {
  private static bots = new Map<string, AiBot>();
  private static tasks: BotTask[] = [];

  static createBot(name: string, type: AiBot['type'], config: Record<string, any> = {}): AiBot {
    const bot: AiBot = {
      botId: `bot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: `${type} bot for automated video operations`,
      type,
      enabled: true,
      config,
      createdAt: Date.now(),
    };
    this.bots.set(bot.botId, bot);
    return bot;
  }

  static getBot(botId: string): AiBot | null {
    return this.bots.get(botId) || null;
  }

  static listBots(type?: AiBot['type']): AiBot[] {
    const bots = Array.from(this.bots.values());
    return type ? bots.filter(b => b.type === type) : bots;
  }

  static async executeTask(botId: string, input: Record<string, any>): Promise<BotTask> {
    const bot = this.getBot(botId);
    if (!bot) throw new Error('Bot not found');
    if (!bot.enabled) throw new Error('Bot is disabled');

    const task: BotTask = {
      taskId: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      botId,
      status: 'running',
      input,
      createdAt: Date.now(),
    };
    this.tasks.push(task);

    try {
      const prompt = this.buildPrompt(bot, input);
      const response = await invokeLLM({
        messages: [
          { role: 'system', content: `You are a ${bot.type} bot. ${bot.description}` },
          { role: 'user', content: prompt },
        ],
      });

      task.output = { result: response.choices[0].message.content };
      task.status = 'completed';
      task.completedAt = Date.now();
      bot.lastRun = Date.now();
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      task.completedAt = Date.now();
    }

    return task;
  }

  private static buildPrompt(bot: AiBot, input: Record<string, any>): string {
    switch (bot.type) {
      case 'generator':
        return `Generate video content with: ${JSON.stringify(input)}`;
      case 'editor':
        return `Edit video with: ${JSON.stringify(input)}`;
      case 'analyzer':
        return `Analyze video: ${JSON.stringify(input)}`;
      case 'optimizer':
        return `Optimize video: ${JSON.stringify(input)}`;
      default:
        return JSON.stringify(input);
    }
  }

  static getTask(taskId: string): BotTask | null {
    return this.tasks.find(t => t.taskId === taskId) || null;
  }

  static getBotTasks(botId: string, limit: number = 50): BotTask[] {
    return this.tasks.filter(t => t.botId === botId).slice(-limit);
  }

  static updateBotConfig(botId: string, config: Record<string, any>): AiBot {
    const bot = this.getBot(botId);
    if (!bot) throw new Error('Bot not found');
    bot.config = { ...bot.config, ...config };
    return bot;
  }

  static toggleBot(botId: string, enabled: boolean): AiBot {
    const bot = this.getBot(botId);
    if (!bot) throw new Error('Bot not found');
    bot.enabled = enabled;
    return bot;
  }

  static deleteBot(botId: string): void {
    this.bots.delete(botId);
    this.tasks = this.tasks.filter(t => t.botId !== botId);
  }

  static getStats(): { totalBots: number; activeBots: number; totalTasks: number; completedTasks: number } {
    return {
      totalBots: this.bots.size,
      activeBots: Array.from(this.bots.values()).filter(b => b.enabled).length,
      totalTasks: this.tasks.length,
      completedTasks: this.tasks.filter(t => t.status === 'completed').length,
    };
  }
}
