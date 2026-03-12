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
    console.error('[ErrorBoundary] Caught error:', error.message);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
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
