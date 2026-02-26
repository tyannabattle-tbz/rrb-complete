import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWebSocket, usePolicyDecisions, useTaskUpdates, useMetricsUpdates } from './useWebSocket';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.OPEN;
  onopen: (() => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onclose: (() => void) | null = null;

  send(data: string) {
    // Mock implementation
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.();
  }

  static INSTANCES: MockWebSocket[] = [];

  constructor(url: string) {
    MockWebSocket.INSTANCES.push(this);
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.();
    }, 0);
  }
}

// Replace global WebSocket
(global as any).WebSocket = MockWebSocket;

describe('useWebSocket', () => {
  beforeEach(() => {
    MockWebSocket.INSTANCES = [];
    vi.clearAllMocks();
  });

  afterEach(() => {
    MockWebSocket.INSTANCES.forEach((ws) => ws.close());
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useWebSocket({ autoConnect: false }));

    expect(result.current.isConnected).toBe(false);
    expect(result.current.lastMessage).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should connect to WebSocket', async () => {
    const { result } = renderHook(() => useWebSocket({ autoConnect: true }));

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });

  it('should send messages through WebSocket', async () => {
    const { result } = renderHook(() => useWebSocket({ autoConnect: true }));

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    const sendSpy = vi.spyOn(MockWebSocket.INSTANCES[0], 'send');

    act(() => {
      result.current.send({
        type: 'policy_decision',
        data: { test: 'data' },
      });
    });

    expect(sendSpy).toHaveBeenCalled();
  });

  it('should handle ping/pong', async () => {
    const { result } = renderHook(() => useWebSocket({ autoConnect: true }));

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    const sendSpy = vi.spyOn(MockWebSocket.INSTANCES[0], 'send');

    act(() => {
      result.current.ping();
    });

    expect(sendSpy).toHaveBeenCalled();
  });

  it('should disconnect from WebSocket', async () => {
    const { result } = renderHook(() => useWebSocket({ autoConnect: true }));

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.isConnected).toBe(false);
  });

  it('should handle reconnection', async () => {
    const { result } = renderHook(() =>
      useWebSocket({ autoConnect: true, reconnectAttempts: 2, reconnectDelay: 100 })
    );

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    const ws = MockWebSocket.INSTANCES[0];
    act(() => {
      ws.close();
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
    });

    // Wait for reconnection attempt
    await waitFor(
      () => {
        expect(result.current.isConnected).toBe(true);
      },
      { timeout: 500 }
    );
  });
});

describe('useWebSocketListener hooks', () => {
  beforeEach(() => {
    MockWebSocket.INSTANCES = [];
    vi.clearAllMocks();
  });

  afterEach(() => {
    MockWebSocket.INSTANCES.forEach((ws) => ws.close());
  });

  it('should listen to policy decisions', async () => {
    const callback = vi.fn();
    const { result } = renderHook(() => {
      usePolicyDecisions(callback);
      return useWebSocket({ autoConnect: true });
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    const ws = MockWebSocket.INSTANCES[0];
    act(() => {
      ws.onmessage?.({
        data: JSON.stringify({
          type: 'policy_decision',
          data: { decision: 'approve' },
          timestamp: Date.now(),
        }),
      });
    });

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith({ decision: 'approve' });
    });
  });

  it('should listen to task updates', async () => {
    const callback = vi.fn();
    const { result } = renderHook(() => {
      useTaskUpdates(callback);
      return useWebSocket({ autoConnect: true });
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    const ws = MockWebSocket.INSTANCES[0];
    act(() => {
      ws.onmessage?.({
        data: JSON.stringify({
          type: 'task_update',
          data: { status: 'executing' },
          timestamp: Date.now(),
        }),
      });
    });

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith({ status: 'executing' });
    });
  });

  it('should listen to metrics updates', async () => {
    const callback = vi.fn();
    const { result } = renderHook(() => {
      useMetricsUpdates(callback);
      return useWebSocket({ autoConnect: true });
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    const ws = MockWebSocket.INSTANCES[0];
    act(() => {
      ws.onmessage?.({
        data: JSON.stringify({
          type: 'metrics_update',
          data: { cpu: 45 },
          timestamp: Date.now(),
        }),
      });
    });

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith({ cpu: 45 });
    });
  });
});
