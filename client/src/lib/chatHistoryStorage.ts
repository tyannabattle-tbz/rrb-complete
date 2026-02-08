/**
 * Chat History Storage Utility
 * Manages persistence of chat messages to localStorage
 */

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  error?: string;
}

const STORAGE_KEY = 'qumus_chat_history';
const MAX_MESSAGES = 100;
const STORAGE_VERSION = 1;

interface StorageData {
  version: number;
  messages: ChatMessage[];
  lastUpdated: number;
}

/**
 * Save chat messages to localStorage
 */
export function saveChatHistory(messages: ChatMessage[]): boolean {
  try {
    // Keep only the last MAX_MESSAGES
    const messagesToSave = messages.slice(-MAX_MESSAGES);

    const data: StorageData = {
      version: STORAGE_VERSION,
      messages: messagesToSave,
      lastUpdated: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('[ChatHistoryStorage] Failed to save chat history:', error);
    return false;
  }
}

/**
 * Load chat messages from localStorage
 */
export function loadChatHistory(): ChatMessage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const data: StorageData = JSON.parse(stored);

    // Validate version
    if (data.version !== STORAGE_VERSION) {
      console.warn('[ChatHistoryStorage] Version mismatch, clearing history');
      clearChatHistory();
      return [];
    }

    // Validate messages
    if (!Array.isArray(data.messages)) {
      console.warn('[ChatHistoryStorage] Invalid messages format');
      return [];
    }

    return data.messages;
  } catch (error) {
    console.error('[ChatHistoryStorage] Failed to load chat history:', error);
    return [];
  }
}

/**
 * Clear chat history from localStorage
 */
export function clearChatHistory(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('[ChatHistoryStorage] Failed to clear chat history:', error);
    return false;
  }
}

/**
 * Get storage statistics
 */
export function getChatHistoryStats() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        messageCount: 0,
        storageSize: 0,
        lastUpdated: null,
      };
    }

    const data: StorageData = JSON.parse(stored);
    const sizeInBytes = new Blob([stored]).size;

    return {
      messageCount: data.messages.length,
      storageSize: sizeInBytes,
      lastUpdated: new Date(data.lastUpdated),
    };
  } catch (error) {
    console.error('[ChatHistoryStorage] Failed to get stats:', error);
    return {
      messageCount: 0,
      storageSize: 0,
      lastUpdated: null,
    };
  }
}

/**
 * Export chat history as JSON
 */
export function exportChatHistory(): string {
  try {
    const messages = loadChatHistory();
    return JSON.stringify(messages, null, 2);
  } catch (error) {
    console.error('[ChatHistoryStorage] Failed to export chat history:', error);
    return '[]';
  }
}

/**
 * Import chat history from JSON
 */
export function importChatHistory(jsonData: string): boolean {
  try {
    const messages = JSON.parse(jsonData);

    // Validate format
    if (!Array.isArray(messages)) {
      throw new Error('Invalid format: expected array of messages');
    }

    // Validate each message
    for (const msg of messages) {
      if (!msg.role || !msg.content || !msg.timestamp) {
        throw new Error('Invalid message format');
      }
    }

    return saveChatHistory(messages);
  } catch (error) {
    console.error('[ChatHistoryStorage] Failed to import chat history:', error);
    return false;
  }
}

/**
 * Hook for using chat history in React components
 */
export function useChatHistory() {
  const load = () => loadChatHistory();
  const save = (messages: ChatMessage[]) => saveChatHistory(messages);
  const clear = () => clearChatHistory();
  const stats = () => getChatHistoryStats();
  const exportData = () => exportChatHistory();
  const importData = (json: string) => importChatHistory(json);

  return {
    load,
    save,
    clear,
    stats,
    exportData,
    importData,
  };
}
