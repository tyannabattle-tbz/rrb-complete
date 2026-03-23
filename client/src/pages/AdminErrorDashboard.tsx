import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Trash2, RefreshCw, Filter, Download } from 'lucide-react';

interface ErrorLog {
  timestamp: string;
  message: string;
  stack?: string;
  componentStack?: string;
  type: string;
}

export function AdminErrorDashboard() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [filteredErrors, setFilteredErrors] = useState<ErrorLog[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadErrors();
  }, []);

  useEffect(() => {
    if (filterType === 'all') {
      setFilteredErrors(errors);
    } else {
      setFilteredErrors(errors.filter(e => e.type === filterType));
    }
  }, [filterType, errors]);

  const loadErrors = () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem('error_logs');
      if (stored) {
        const parsed = JSON.parse(stored);
        setErrors(parsed);
      }
    } catch (e) {
      console.error('Failed to load errors:', e);
    }
    setLoading(false);
  };

  const clearErrors = () => {
    if (window.confirm('Are you sure you want to clear all error logs?')) {
      localStorage.removeItem('error_logs');
      setErrors([]);
      setFilteredErrors([]);
    }
  };

  const clearError = (index: number) => {
    const updated = errors.filter((_, i) => i !== index);
    localStorage.setItem('error_logs', JSON.stringify(updated));
    setErrors(updated);
  };

  const downloadErrors = () => {
    const dataStr = JSON.stringify(errors, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `error-logs-${new Date().toISOString()}.json`;
    link.click();
  };

  const errorTypes = Array.from(new Set(errors.map(e => e.type)));

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Error Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage application errors</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{errors.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Error Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{errorTypes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Latest Error</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {errors.length > 0
                  ? new Date(errors[errors.length - 1].timestamp).toLocaleTimeString()
                  : 'None'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Storage Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                Active
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            onClick={loadErrors}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm"
            >
              <option value="all">All Types</option>
              {errorTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <Button
            onClick={downloadErrors}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </Button>

          <Button
            onClick={clearErrors}
            variant="destructive"
            className="flex items-center gap-2 ml-auto"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>
        </div>

        {/* Error List */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Loading errors...</p>
              </CardContent>
            </Card>
          ) : filteredErrors.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <AlertTriangle className="w-5 h-5" />
                  <p>No errors found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredErrors.map((error, index) => (
              <Card key={index} className="border-l-4 border-l-red-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                          {error.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(error.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <CardTitle className="text-base">{error.message}</CardTitle>
                    </div>
                    <Button
                      onClick={() => clearError(index)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                {(error.stack || error.componentStack) && (
                  <CardContent>
                    <div className="space-y-3">
                      {error.componentStack && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Component Stack:</p>
                          <pre className="bg-muted p-3 rounded text-xs overflow-x-auto max-h-32 overflow-y-auto">
                            {error.componentStack}
                          </pre>
                        </div>
                      )}

                      {error.stack && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Stack Trace:</p>
                          <pre className="bg-muted p-3 rounded text-xs overflow-x-auto max-h-32 overflow-y-auto">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
