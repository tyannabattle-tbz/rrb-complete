import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const timestamp = new Date().toISOString();
    const errorLog = {
      timestamp,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      type: error.constructor.name,
    };

    // Log to console with full details
    console.error('[ErrorBoundary] Caught error:', error.message);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    console.error('[ErrorBoundary] Full error log:', errorLog);

    // Store error in localStorage for debugging
    try {
      const errors = JSON.parse(localStorage.getItem('error_logs') || '[]');
      errors.push(errorLog);
      // Keep only last 10 errors
      if (errors.length > 10) errors.shift();
      localStorage.setItem('error_logs', JSON.stringify(errors));
    } catch (e) {
      console.warn('[ErrorBoundary] Failed to store error log:', e);
    }

    // Send error to server for monitoring (non-blocking)
    try {
      fetch('/api/errors/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorLog),
      }).catch(() => {}); // Silently fail if endpoint doesn't exist
    } catch (e) {
      // Ignore fetch errors
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-md text-center p-8">
            <AlertTriangle
              size={56}
              className="text-amber-500 mb-6 flex-shrink-0"
            />

            <h2 className="text-2xl font-bold mb-3 text-foreground">Something went wrong</h2>

            <p className="text-muted-foreground mb-8 text-base leading-relaxed">
              We encountered an unexpected issue. Please try reloading the page.
              If the problem persists, try clearing your browser cache.
            </p>

            {this.state.error && (
              <div className="w-full mb-6 p-4 bg-muted rounded-lg text-left text-xs text-muted-foreground font-mono max-h-32 overflow-y-auto">
                <div className="font-semibold mb-2">Error Details:</div>
                <div>{this.state.error.message}</div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { window.location.href = '/'; }}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg",
                  "bg-muted text-muted-foreground",
                  "hover:opacity-90 cursor-pointer"
                )}
              >
                <Home size={16} />
                Go Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg",
                  "bg-primary text-primary-foreground",
                  "hover:opacity-90 cursor-pointer"
                )}
              >
                <RotateCcw size={16} />
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
