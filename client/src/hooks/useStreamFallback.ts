/**
 * useStreamFallback Hook
 * Manages automatic stream fallback when primary fails
 */

import { useState, useCallback, useEffect } from 'react';
import { trpc } from '@/lib/trpc';

export interface StreamInfo {
  url: string;
  format: string;
  isHealthy: boolean;
  isFallback: boolean;
  fallbackIndex?: number;
}

export interface UseStreamFallbackReturn {
  streamUrl: string | null;
  isLoading: boolean;
  error: string | null;
  isHealthy: boolean;
  isFallback: boolean;
  retryStream: () => Promise<void>;
  clearCache: (url?: string) => Promise<void>;
}

/**
 * Hook to get the best available stream with automatic fallback
 */
export function useStreamFallback(channelId: string): UseStreamFallbackReturn {
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get best stream from server
  const getBestStreamQuery = trpc.stream.getBestStream.useQuery(
    { channelId },
    {
      enabled: !!channelId,
      retry: 3,
      retryDelay: 1000,
    }
  );

  // Clear cache mutation
  const clearCacheMutation = trpc.stream.clearCache.useMutation();

  // Update stream info when query completes
  useEffect(() => {
    if (getBestStreamQuery.isLoading) {
      setIsLoading(true);
    } else if (getBestStreamQuery.error) {
      setError(getBestStreamQuery.error.message);
      setIsLoading(false);
    } else if (getBestStreamQuery.data) {
      setStreamInfo(getBestStreamQuery.data);
      setError(null);
      setIsLoading(false);
    }
  }, [getBestStreamQuery.data, getBestStreamQuery.error, getBestStreamQuery.isLoading]);

  // Retry getting stream
  const retryStream = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await getBestStreamQuery.refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get stream');
    }
  }, [getBestStreamQuery]);

  // Clear cache
  const clearCache = useCallback(async (url?: string) => {
    try {
      await clearCacheMutation.mutateAsync({ url });
    } catch (err) {
      console.error('Failed to clear cache:', err);
    }
  }, [clearCacheMutation]);

  return {
    streamUrl: streamInfo?.url || null,
    isLoading,
    error,
    isHealthy: streamInfo?.isHealthy || false,
    isFallback: streamInfo?.isFallback || false,
    retryStream,
    clearCache,
  };
}

/**
 * Hook to verify a stream is accessible
 */
export function useStreamVerify(url: string | null) {
  const [isHealthy, setIsHealthy] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const verifyQuery = trpc.stream.verify.useQuery(
    { url: url || '' },
    {
      enabled: !!url,
      retry: 2,
      retryDelay: 500,
    }
  );

  useEffect(() => {
    if (verifyQuery.data) {
      setIsHealthy(verifyQuery.data.accessible);
    }
    setIsChecking(verifyQuery.isLoading);
  }, [verifyQuery.data, verifyQuery.isLoading]);

  return { isHealthy, isChecking };
}

/**
 * Hook to get stream metadata
 */
export function useStreamMetadata(url: string | null) {
  const metadataQuery = trpc.stream.getMetadata.useQuery(
    { url: url || '' },
    {
      enabled: !!url,
      retry: 1,
    }
  );

  return {
    metadata: metadataQuery.data,
    isLoading: metadataQuery.isLoading,
    error: metadataQuery.error,
  };
}
