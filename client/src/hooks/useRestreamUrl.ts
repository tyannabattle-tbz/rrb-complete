import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to access the Restream studio URL from system config.
 * All live/studio/broadcast buttons should use this hook.
 * 
 * Usage:
 *   const { openRestream, restreamUrl, isConfigured } = useRestreamUrl();
 *   <Button onClick={openRestream}>Enter Studio</Button>
 */
export function useRestreamUrl() {
  const { toast } = useToast();
  const { data, isLoading } = trpc.restreamConfig.getRestreamUrl.useQuery(undefined, {
    staleTime: 60_000, // cache for 1 minute
    refetchOnWindowFocus: false,
  });

  const restreamUrl = data?.url || '';
  const isConfigured = data?.isConfigured || false;

  const openRestream = () => {
    if (isConfigured && restreamUrl) {
      window.open(restreamUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: 'Restream Not Configured',
        description: 'The Restream studio URL has not been set yet. Go to Admin Settings to configure it.',
        variant: 'destructive',
      });
    }
  };

  return {
    restreamUrl,
    isConfigured,
    isLoading,
    openRestream,
  };
}
