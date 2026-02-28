import React, { useState, useEffect } from 'react';
import { Radio, Zap, AlertCircle, ChevronDown, Globe } from 'lucide-react';

/**
 * Cross-Port Navigation Component
 * Provides links to all three systems (Qumus 3000, RRB 3001, HybridCast 3002)
 * Displays on every page for easy system switching
 */

interface PortStatus {
  port: number;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  isActive: boolean;
  url: string;
}

export const CrossPortNavigation: React.FC<{ currentPort?: number }> = ({ currentPort }) => {
  const [ports, setPorts] = useState<PortStatus[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPorts = async () => {
      const portConfigs: PortStatus[] = [
        {
          port: 3000,
          name: 'Qumus',
          icon: <Zap className="w-5 h-5" />,
          color: 'from-purple-500 to-purple-600',
          description: 'Autonomous Orchestration',
          isActive: false,
          url: 'http://localhost:3000',
        },
        {
          port: 3001,
          name: 'RRB',
          icon: <Radio className="w-5 h-5" />,
          color: 'from-pink-500 to-pink-600',
          description: 'Radio Station',
          isActive: false,
          url: 'http://localhost:3001',
        },
        {
          port: 3002,
          name: 'HybridCast',
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'from-red-500 to-red-600',
          description: 'Emergency Broadcast',
          isActive: false,
          url: 'http://localhost:3002',
        },
      ];

      // Check which ports are active
      for (const portConfig of portConfigs) {
        try {
          const response = await fetch(`${portConfig.url}/api/health`, { 
            method: 'HEAD',
            mode: 'no-cors'
          });
          portConfig.isActive = true;
        } catch (error) {
          portConfig.isActive = false;
        }
      }

      setPorts(portConfigs);
      setLoading(false);
    };

    checkPorts();
    const interval = setInterval(checkPorts, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const activePorts = ports.filter((p) => p.isActive);
  const otherPorts = ports.filter((p) => p.port !== currentPort && p.isActive);

  if (loading) {
    return null;
  }

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-slate-900 to-slate-800 border-b-2 border-slate-700 z-50 flex items-center px-6 gap-4">
        {/* Current System */}
        <div className="flex items-center gap-3">
          {ports
            .filter((p) => p.port === currentPort)
            .map((port) => (
              <div key={port.port} className="flex items-center gap-2">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${port.color}`}>
                  {port.icon}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{port.name}</p>
                  <p className="text-slate-400 text-xs">{port.description}</p>
                </div>
              </div>
            ))}
        </div>

        {/* Divider */}
        <div className="flex-1" />

        {/* Quick Links to Other Ports */}
        <div className="flex items-center gap-2">
          {otherPorts.map((port) => (
            <a
              key={port.port}
              href={port.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br ${port.color} text-white hover:shadow-lg transition-all hover:scale-105`}
              title={`Switch to ${port.name}`}
            >
              {port.icon}
              <span className="text-sm font-medium">{port.name}</span>
            </a>
          ))}

          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
              title="More options"
            >
              <ChevronDown className="w-5 h-5" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-800 border-2 border-slate-700 rounded-lg shadow-xl z-50">
                <div className="p-4">
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    All Systems
                  </h3>
                  <div className="space-y-2">
                    {ports.map((port) => (
                      <a
                        key={port.port}
                        href={port.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          port.isActive
                            ? 'bg-slate-700 hover:bg-slate-600 text-white'
                            : 'bg-slate-900 text-slate-500 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${port.color}`}>
                          {port.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{port.name}</p>
                          <p className="text-xs text-slate-400">{port.description}</p>
                        </div>
                        {port.isActive && (
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />

      {/* System Status Footer */}
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-slate-900 border-t-2 border-slate-700 z-50 flex items-center px-6 gap-4 text-xs">
        <span className="text-slate-400">System Status:</span>
        {ports.map((port) => (
          <div key={port.port} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${port.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={port.isActive ? 'text-slate-300' : 'text-slate-500'}>
              {port.name} ({port.port})
            </span>
          </div>
        ))}
      </div>

      {/* Spacer for fixed footer */}
      <div className="h-12" />
    </>
  );
};

export default CrossPortNavigation;
