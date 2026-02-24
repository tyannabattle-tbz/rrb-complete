import { useEffect, useState } from "react";
import { Loader2, Brain, Zap, Shield, BarChart3, Clock, AlertCircle } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Set QUMUS-specific SEO
    document.title = "QUMUS - Autonomous Orchestration Engine";
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'QUMUS - Quantum Universal Management & Utility System. Autonomous orchestration engine with 12 decision policies, real-time monitoring, and 90% autonomy control.');
    
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'QUMUS, autonomous orchestration, AI management, decision policies, real-time monitoring, operator control center');
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-gray-100">
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12">
          {/* Header Section */}
          <div className="text-center space-y-4 py-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="w-12 h-12 text-blue-400" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                QUMUS
              </h1>
            </div>
            <p className="text-xl text-gray-300 font-semibold">
              Quantum Universal Management & Utility System
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Autonomous orchestration engine with 12 intelligent decision policies, real-time monitoring, and 90% autonomy control
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 border-blue-500/20 bg-blue-950/30 hover:bg-blue-950/50 transition">
              <Brain className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="font-bold text-lg mb-2">12 Autonomous Policies</h3>
              <p className="text-gray-400 text-sm">
                Intelligent decision-making with 90% autonomy and 10% human override capability
              </p>
            </Card>

            <Card className="p-6 border-cyan-500/20 bg-cyan-950/30 hover:bg-cyan-950/50 transition">
              <BarChart3 className="w-8 h-8 text-cyan-400 mb-3" />
              <h3 className="font-bold text-lg mb-2">Real-Time Monitoring</h3>
              <p className="text-gray-400 text-sm">
                Live dashboards with system metrics, decision tracking, and policy performance analytics
              </p>
            </Card>

            <Card className="p-6 border-teal-500/20 bg-teal-950/30 hover:bg-teal-950/50 transition">
              <Shield className="w-8 h-8 text-teal-400 mb-3" />
              <h3 className="font-bold text-lg mb-2">Compliance & Audit</h3>
              <p className="text-gray-400 text-sm">
                Complete decision audit trail, compliance logging, and human override tracking
              </p>
            </Card>

            <Card className="p-6 border-blue-500/20 bg-blue-950/30 hover:bg-blue-950/50 transition">
              <Zap className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="font-bold text-lg mb-2">Webhook Integration</h3>
              <p className="text-gray-400 text-sm">
                Slack, Discord, SendGrid, and custom webhook notifications for all system events
              </p>
            </Card>

            <Card className="p-6 border-cyan-500/20 bg-cyan-950/30 hover:bg-cyan-950/50 transition">
              <Clock className="w-8 h-8 text-cyan-400 mb-3" />
              <h3 className="font-bold text-lg mb-2">Policy Scheduling</h3>
              <p className="text-gray-400 text-sm">
                Time-based policy activation, scheduled decision execution, and automated workflows
              </p>
            </Card>

            <Card className="p-6 border-teal-500/20 bg-teal-950/30 hover:bg-teal-950/50 transition">
              <AlertCircle className="w-8 h-8 text-teal-400 mb-3" />
              <h3 className="font-bold text-lg mb-2">Alert Management</h3>
              <p className="text-gray-400 text-sm">
                Intelligent alerting, escalation policies, and incident response automation
              </p>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-4 py-8">
            <Button
              onClick={() => window.location.href = getLoginUrl()}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-3 rounded-lg font-semibold"
            >
              Login to Operator Control Center
            </Button>
            <p className="text-gray-400 text-sm">
              Access the QUMUS dashboard to manage autonomous policies and monitor system decisions
            </p>
          </div>

          {/* Footer Info */}
          <div className="border-t border-gray-700 pt-8 text-center text-gray-500 text-sm">
            <p>QUMUS Operator Control Center • Autonomous Orchestration Engine</p>
            <p className="mt-2">Version 1.0 • Deployed to qumus.rockinrockinboogie.com</p>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated view - redirect to dashboard
  useEffect(() => {
    navigate('/admin/qumus');
  }, [navigate]);

  return null;
}
