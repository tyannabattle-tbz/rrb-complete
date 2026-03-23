/**
 * Session Replay Logger
 * Captures user interactions leading up to errors for debugging
 */

export interface SessionEvent {
  type: 'click' | 'input' | 'navigation' | 'error' | 'api_call' | 'state_change';
  timestamp: string;
  target?: string;
  value?: string;
  url?: string;
  details?: Record<string, any>;
}

export interface SessionReplay {
  sessionId: string;
  startTime: string;
  events: SessionEvent[];
  userAgent: string;
  viewport: { width: number; height: number };
}

class SessionReplayLogger {
  private sessionId: string;
  private events: SessionEvent[] = [];
  private maxEvents = 100; // Keep last 100 events
  private sessionStartTime: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = new Date().toISOString();
    this.initializeListeners();
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeListeners(): void {
    // Track clicks
    document.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement);
      this.logEvent({
        type: 'click',
        target: target.id || target.className || target.tagName,
        details: {
          x: e.clientX,
          y: e.clientY,
          element: target.outerHTML.substring(0, 100),
        },
      });
    }, true);

    // Track input changes
    document.addEventListener('input', (e) => {
      const target = (e.target as HTMLInputElement);
      this.logEvent({
        type: 'input',
        target: target.id || target.name,
        value: target.type === 'password' ? '***' : target.value.substring(0, 50),
      });
    }, true);

    // Track navigation
    window.addEventListener('hashchange', () => {
      this.logEvent({
        type: 'navigation',
        url: window.location.href,
      });
    });

    // Track API calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [resource, config] = args;
      const url = typeof resource === 'string' ? resource : resource.url;

      this.logEvent({
        type: 'api_call',
        url: url.substring(0, 100),
        details: {
          method: (config as any)?.method || 'GET',
          status: 'pending',
        },
      });

      try {
        const response = await originalFetch(...args);
        this.logEvent({
          type: 'api_call',
          url: url.substring(0, 100),
          details: {
            method: (config as any)?.method || 'GET',
            status: response.status,
          },
        });
        return response;
      } catch (error) {
        this.logEvent({
          type: 'api_call',
          url: url.substring(0, 100),
          details: {
            method: (config as any)?.method || 'GET',
            error: (error as Error).message,
          },
        });
        throw error;
      }
    };

    // Track errors
    window.addEventListener('error', (e) => {
      this.logEvent({
        type: 'error',
        details: {
          message: e.message,
          filename: e.filename,
          lineno: e.lineno,
          colno: e.colno,
        },
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      this.logEvent({
        type: 'error',
        details: {
          type: 'unhandledRejection',
          reason: String(e.reason),
        },
      });
    });
  }

  logEvent(event: Omit<SessionEvent, 'timestamp'>): void {
    const sessionEvent: SessionEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    this.events.push(sessionEvent);

    // Keep only last N events
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Store in localStorage for persistence
    this.persistToStorage();
  }

  private persistToStorage(): void {
    try {
      const replay: SessionReplay = {
        sessionId: this.sessionId,
        startTime: this.sessionStartTime,
        events: this.events,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      };

      localStorage.setItem(`session-replay-${this.sessionId}`, JSON.stringify(replay));

      // Keep only last 5 sessions
      const sessions = this.getStoredSessions();
      if (sessions.length > 5) {
        const oldestSession = sessions[0];
        localStorage.removeItem(`session-replay-${oldestSession}`);
      }
    } catch (e) {
      console.warn('[SessionReplay] Failed to persist to storage:', e);
    }
  }

  getReplay(): SessionReplay {
    return {
      sessionId: this.sessionId,
      startTime: this.sessionStartTime,
      events: this.events,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  }

  private getStoredSessions(): string[] {
    const sessions: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('session-replay-')) {
        sessions.push(key.replace('session-replay-', ''));
      }
    }
    return sessions.sort();
  }

  /**
   * Get session replay for error reporting
   */
  getSessionReplayForError(): string {
    const replay = this.getReplay();
    return JSON.stringify(replay, null, 2);
  }

  /**
   * Export all stored sessions
   */
  static exportAllSessions(): Record<string, SessionReplay> {
    const sessions: Record<string, SessionReplay> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('session-replay-')) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            sessions[key] = JSON.parse(data);
          } catch (e) {
            console.warn('Failed to parse session:', key);
          }
        }
      }
    }
    return sessions;
  }

  /**
   * Clear old sessions
   */
  static clearOldSessions(maxAge: number = 86400000): void { // 24 hours default
    const now = Date.now();
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith('session-replay-')) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const replay = JSON.parse(data) as SessionReplay;
            const sessionAge = now - new Date(replay.startTime).getTime();
            if (sessionAge > maxAge) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
  }
}

// Create singleton instance
export const sessionReplay = new SessionReplayLogger();

// Auto-export sessions when error occurs
if (typeof window !== 'undefined') {
  window.addEventListener('error', () => {
    try {
      const replay = sessionReplay.getSessionReplayForError();
      const stored = localStorage.getItem('session_replays_for_errors') || '[]';
      const replays = JSON.parse(stored);
      replays.push({
        timestamp: new Date().toISOString(),
        replay: JSON.parse(replay),
      });
      // Keep only last 5 error replays
      if (replays.length > 5) replays.shift();
      localStorage.setItem('session_replays_for_errors', JSON.stringify(replays));
    } catch (e) {
      console.warn('[SessionReplay] Failed to export error replay:', e);
    }
  });
}
