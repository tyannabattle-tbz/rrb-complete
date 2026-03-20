import React, { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class ProductionErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Send to error tracking service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, { contexts: { react: errorInfo } });
    }

    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="w-full h-screen bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1e] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#2a2a3e] rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3 text-red-500">
                <AlertTriangle className="w-6 h-6" />
                <h1 className="text-xl font-bold">Something went wrong</h1>
              </div>

              <p className="text-gray-300 text-sm">
                We encountered an unexpected error. Our team has been notified and is working on a fix.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-[#1a1a2e] rounded p-3 space-y-2">
                  <p className="text-xs font-mono text-red-400">{this.state.error.toString()}</p>
                  {this.state.errorInfo && (
                    <p className="text-xs font-mono text-gray-400 max-h-32 overflow-y-auto">
                      {this.state.errorInfo.componentStack}
                    </p>
                  )}
                </div>
              )}

              <div className="text-xs text-gray-400">
                Error ID: {Date.now()}-{Math.random().toString(36).substr(2, 9)}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Reload Page
                </Button>
              </div>

              {this.state.errorCount > 3 && (
                <div className="bg-yellow-900 bg-opacity-20 border border-yellow-600 rounded p-3">
                  <p className="text-yellow-400 text-xs">
                    Multiple errors detected. Please clear your browser cache or contact support.
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
