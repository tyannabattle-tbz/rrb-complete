import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

interface ChannelListeners {
  [channelId: string]: number;
}

/**
 * Hook to fetch and manage SomaFM listener counts
 * Automatically refreshes every 30 seconds
 */
export function useSomaFMListeners() {
  const [listeners, setListeners] = useState<ChannelListeners>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Query to get all listeners
  const getAllListenersQuery = trpc.somaFm.getAllListeners.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 25000, // Data is stale after 25 seconds
  });

  useEffect(() => {
    if (getAllListenersQuery.data?.success) {
      setListeners(getAllListenersQuery.data.listeners);
      setError(null);
    } else if (getAllListenersQuery.error) {
      setError("Failed to fetch listener counts");
      console.error("SomaFM API error:", getAllListenersQuery.error);
    }

    setIsLoading(getAllListenersQuery.isLoading);
  }, [getAllListenersQuery.data, getAllListenersQuery.error, getAllListenersQuery.isLoading]);

  return {
    listeners,
    isLoading,
    error,
    refetch: getAllListenersQuery.refetch,
  };
}

/**
 * Hook to fetch listener count for a specific channel
 */
export function useChannelListeners(channelId: string) {
  const query = trpc.somaFm.getChannelListeners.useQuery(channelId, {
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 25000,
  });

  return {
    listeners: query.data?.listeners ?? 0,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
