import { useState } from "react";
import QumusHome from "./QumusHome";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Zap } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const { user, isLoading } = useAuth();

  // If user is authenticated, show the Control Center
  if (user) {
    return <QumusHome />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Show login options
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Zap className="w-12 h-12 text-blue-500" />
          </div>
          <CardTitle className="text-2xl text-white">QUMUS</CardTitle>
          <CardDescription className="text-slate-400">
            Autonomous Orchestration Engine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-300 text-center">
            90%+ Autonomy • Full Ecosystem Control
          </p>

          <div className="space-y-3 pt-4">
            {/* OAuth Login Button */}
            <Button
              onClick={() => {
                const loginUrl = new URL("/api/oauth/login", window.location.origin);
                window.location.href = loginUrl.toString();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              Sign In to QUMUS
            </Button>

            {/* Test Login Button */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-400">or</span>
              </div>
            </div>

            <Button
              onClick={() => {
                // Redirect to test login endpoint
                window.location.href = "/api/test-login";
              }}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              size="lg"
            >
              Test Login (Dev Mode)
            </Button>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-3 bg-amber-900/30 border border-amber-700/50 rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200">
              <p className="font-semibold">Development Mode</p>
              <p className="mt-1">Use "Test Login" to access QUMUS Control Center without OAuth authentication.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
