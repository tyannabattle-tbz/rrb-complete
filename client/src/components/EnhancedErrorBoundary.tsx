import React, { ReactNode } from 'react';
import { AlertCircle, RefreshCw, Copy, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorCount: number;
}

/**
 * Enhanced Error Boundary with comprehensive logging and error tracking
 * Logs all errors to console, localStorage, and displays user-friendly messages
 */
export class EnhancedErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorLog: Array<{ timestamp: number; error: string; stack?: string }> = [];
  private readonly MAX_ERRORS_IN_LOG = 50;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };

    // Load error log from localStorage
    this.loadErrorLog();
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console with styling
    console.error('[EnhancedErrorBoundary] Error caught:', error);
    console.error('[EnhancedErrorBoundary] Error Info:', errorInfo);
    console.error('[EnhancedErrorBoundary] Component Stack:', errorInfo.componentStack);

    // Log to state
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Add to error log
    this.addToErrorLog(error, errorInfo);

    // Log to localStorage for persistence
    this.persistErrorLog();

    // Optional: Send to error tracking service (e.g., Sentry, LogRocket)
    this.reportErrorToService(error, errorInfo);
  }

  private addToErrorLog(error: Error, errorInfo: React.ErrorInfo) {
    const logEntry = {
      timestamp: Date.now(),
      error: error.toString(),
      stack: errorInfo.componentStack,
    };

    this.errorLog.unshift(logEntry);

    // Keep only the last MAX_ERRORS_IN_LOG entries
    if (this.errorLog.length > this.MAX_ERRORS_IN_LOG) {
      this.errorLog = this.errorLog.slice(0, this.MAX_ERRORS_IN_LOG);
    }
  }

  private persistErrorLog() {
    try {
      localStorage.setItem('qumus_error_log', JSON.stringify(this.errorLog));
    } catch (e) {
      console.warn('[EnhancedErrorBoundary] Failed to persist error log:', e);
    }
  }

  private loadErrorLog() {
    try {
      const stored = localStorage.getItem('qumus_error_log');
      if (stored) {
        this.errorLog = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[EnhancedErrorBoundary] Failed to load error log:', e);
    }
  }

  private reportErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // This can be extended to send errors to external services
    // Example: Sentry, LogRocket, or custom error tracking
    const errorReport = {
      message: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Log to console as JSON for easy copying
    console.log('[ErrorReport]', JSON.stringify(errorReport, null, 2));
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleCopyError = () => {
    const errorText = `${this.state.error?.toString()}\n\n${this.state.errorInfo?.componentStack}`;
    navigator.clipboard.writeText(errorText).then(() => {
      alert('Error details copied to clipboard');
    });
  };

  private handleClearErrorLog = () => {
    this.errorLog = [];
    localStorage.removeItem('qumus_error_log');
    alert('Error log cleared');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg border border-red-200">
            {/* Header */}
            <div className="bg-red-100 border-b border-red-200 p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-red-600" />
                <div>
                  <h1 className="text-2xl font-bold text-red-900">Something went wrong</h1>
                  <p className="text-red-700 text-sm mt-1">
                    Error #{this.state.errorCount} - An unexpected error occurred in QUMUS
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">Error Message</h2>
                <div className="bg-gray-50 border border-gray-200 rounded p-3 font-mono text-sm text-gray-700 break-words">
                  {this.state.error?.toString()}
                </div>
              </div>

              {this.state.errorInfo?.componentStack && (
                <details className="border border-gray-200 rounded">
                  <summary className="font-semibold text-gray-900 p-3 cursor-pointer hover:bg-gray-50 flex items-center gap-2">
                    <ChevronDown className="w-4 h-4" />
                    Component Stack Trace
                  </summary>
                  <div className="bg-gray-50 border-t border-gray-200 p-3 font-mono text-xs text-gray-700 whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
                    {this.state.errorInfo.componentStack}
                  </div>
                </details>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900">
                <p className="font-semibold mb-1">What you can do:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Try refreshing the page or clicking the retry button below</li>
                  <li>Clear your browser cache and try again</li>
                  <li>Copy the error details and report them to support</li>
                  <li>Check the browser console for more details (F12)</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 p-6 flex gap-3 flex-wrap">
              <Button onClick={this.handleRetry} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button onClick={this.handleCopyError} variant="outline" className="gap-2">
                <Copy className="w-4 h-4" />
                Copy Error
              </Button>
              <Button onClick={this.handleClearErrorLog} variant="outline" className="gap-2">
                Clear Error Log
              </Button>
              <Button
                onClick={() => (window.location.href = '/')}
                variant="outline"
                className="gap-2"
              >
                Go Home
              </Button>
            </div>

            {/* Error Count Info */}
            <div className="bg-gray-50 border-t border-gray-200 p-4 text-xs text-gray-600">
              <p>
                Total errors in this session: <strong>{this.state.errorCount}</strong> | Error log
                size: <strong>{this.errorLog.length}</strong> entries
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
