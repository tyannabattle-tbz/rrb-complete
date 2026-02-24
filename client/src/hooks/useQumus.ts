/**
 * useQumus Hook
 * React hook for Qumus integration in RRB components
 */

import { useState, useEffect, useCallback } from 'react';
import { qumusClient, QumusDecision, QumusMetrics, QumusPolicy } from '@/lib/qumusClient';

export function useQumusMetrics() {
  const [metrics, setMetrics] = useState<QumusMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await qumusClient.getMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [refresh]);

  return { metrics, loading, error, refresh };
}

export function useQumusPolicies() {
  const [policies, setPolicies] = useState<QumusPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await qumusClient.getPolicies();
      setPolicies(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch policies'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { policies, loading, error, refresh };
}

export function useQumusDecision() {
  const [decision, setDecision] = useState<QumusDecision | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const makeDecision = useCallback(
    async (policyId: string, action: string, metadata?: Record<string, any>) => {
      try {
        setLoading(true);
        const result = await qumusClient.makeDecision(policyId, action, metadata);
        setDecision(result);
        setError(null);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to make decision');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { decision, loading, error, makeDecision };
}

export function useQumusWebSocket(channel: string = 'decisions') {
  const [connected, setConnected] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const connect = async () => {
      try {
        await qumusClient.connectWebSocket(
          (message) => {
            setData(message);
          },
          (err) => {
            setError(err);
          }
        );
        qumusClient.subscribe(channel);
        setConnected(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to connect'));
      }
    };

    connect();

    return () => {
      qumusClient.disconnectWebSocket();
      setConnected(false);
    };
  }, [channel]);

  return { connected, data, error };
}

export function useQumusHealth() {
  const [healthy, setHealthy] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setLoading(true);
        await qumusClient.health();
        setHealthy(true);
      } catch (err) {
        setHealthy(false);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return { healthy, loading };
}
