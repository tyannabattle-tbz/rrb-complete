import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { QumusChatInterface } from "@/components/QumusChatInterface";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";

export default function AgentDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-6">Qumus</h1>
          <p className="text-muted-foreground mb-6">
            Welcome, {user?.name || "User"}. Use the QUMUS chat interface below to interact with the agent.
          </p>
          
          <div className="mt-8">
            <QumusChatInterface />
          </div>
        </Card>
      </div>
    </div>
  );
}
