import React, { useEffect, useState } from 'react';

interface PortAwareRouterProps {
  qumusComponent: React.ComponentType;
  rrbComponent: React.ComponentType;
  hybridcastComponent: React.ComponentType;
}

/**
 * Port-Aware Router Component
 * Detects which system to show based on hostname or port
 */
export const PortAwareRouter: React.FC<PortAwareRouterProps> = ({
  qumusComponent: QumusComponent,
  rrbComponent: RRBComponent,
  hybridcastComponent: HybridCastComponent,
}) => {
  const [system, setSystem] = useState<'qumus' | 'rrb' | 'hybridcast'>('qumus');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Detect which system based on hostname or port
    const hostname = window.location.hostname;
    const port = window.location.port ? parseInt(window.location.port) : (window.location.protocol === 'https:' ? 443 : 80);
    
    console.log(`[PortAwareRouter] Hostname: ${hostname}, Port: ${port}`);
    
    // Check hostname for port indicators (for proxied URLs like 3001-xxxxx.us2.manus.computer)
    if (hostname.startsWith('3001-') || hostname.includes('rrb') || port === 3001) {
      console.log('[PortAwareRouter] Routing to RRB Radio');
      setSystem('rrb');
    } else if (hostname.startsWith('3002-') || hostname.includes('hybrid') || port === 3002) {
      console.log('[PortAwareRouter] Routing to HybridCast');
      setSystem('hybridcast');
    } else {
      console.log('[PortAwareRouter] Routing to Qumus');
      setSystem('qumus');
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading system...</p>
        </div>
      </div>
    );
  }

  // Route based on detected system
  if (system === 'rrb') {
    return <RRBComponent />;
  } else if (system === 'hybridcast') {
    return <HybridCastComponent />;
  } else {
    return <QumusComponent />;
  }
};

export default PortAwareRouter;
