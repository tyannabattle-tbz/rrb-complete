import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Radio, Clock, Archive, Shield, Zap } from 'lucide-react';
import { BroadcastGenerator } from '@/components/BroadcastGenerator';
import { BroadcastScheduler } from '@/components/BroadcastScheduler';
import { BookKeeping } from '@/components/BookKeeping';
import { ComplianceAdmin } from '@/components/ComplianceAdmin';

export default function BroadcastOrchestrationHub() {
  const [activeTab, setActiveTab] = useState('generator');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-purple-900 border-b border-slate-700 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-blue-600 rounded-lg p-3">
              <Radio className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">QUMUS Broadcast Orchestration</h1>
              <p className="text-slate-300">Complete broadcast management platform with scheduling, compliance, and accounting</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700">
            <TabsList className="grid w-full grid-cols-5 bg-transparent border-0 rounded-none p-0 h-auto">
              <TabsTrigger
                value="generator"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-6 py-4"
              >
                <Radio className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Generator</span>
              </TabsTrigger>
              <TabsTrigger
                value="scheduler"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-6 py-4"
              >
                <Clock className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Scheduler</span>
              </TabsTrigger>
              <TabsTrigger
                value="bookkeeping"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-6 py-4"
              >
                <Archive className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Records</span>
              </TabsTrigger>
              <TabsTrigger
                value="compliance"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-6 py-4"
              >
                <Shield className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Compliance</span>
              </TabsTrigger>
              <TabsTrigger
                value="automation"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-6 py-4"
              >
                <Zap className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Automation</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Generator Tab */}
          <TabsContent value="generator" className="mt-0">
            <BroadcastGenerator />
          </TabsContent>

          {/* Scheduler Tab */}
          <TabsContent value="scheduler" className="mt-0">
            <BroadcastScheduler />
          </TabsContent>

          {/* Bookkeeping Tab */}
          <TabsContent value="bookkeeping" className="mt-0">
            <BookKeeping />
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="mt-0">
            <ComplianceAdmin />
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="mt-0 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
                <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Automation & Integration</h2>
                <p className="text-slate-300 mb-6">
                  QUMUS automatically orchestrates all broadcast systems with intelligent scheduling, compliance checking, and financial tracking.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="bg-slate-700 rounded p-4">
                    <h3 className="font-bold text-white mb-2">🤖 AI-Powered Generation</h3>
                    <p className="text-sm text-slate-300">Automatically generates broadcast content using QUMUS AI</p>
                  </div>
                  <div className="bg-slate-700 rounded p-4">
                    <h3 className="font-bold text-white mb-2">📅 Smart Scheduling</h3>
                    <p className="text-sm text-slate-300">Intelligent conflict detection and optimal scheduling</p>
                  </div>
                  <div className="bg-slate-700 rounded p-4">
                    <h3 className="font-bold text-white mb-2">✅ Compliance Tracking</h3>
                    <p className="text-sm text-slate-300">Automatic FCC compliance and legal document management</p>
                  </div>
                  <div className="bg-slate-700 rounded p-4">
                    <h3 className="font-bold text-white mb-2">💰 Financial Automation</h3>
                    <p className="text-sm text-slate-300">Automatic billing, invoicing, and accounting</p>
                  </div>
                  <div className="bg-slate-700 rounded p-4">
                    <h3 className="font-bold text-white mb-2">📡 Radio Distribution</h3>
                    <p className="text-sm text-slate-300">Seamless HybridCast integration for broadcast</p>
                  </div>
                  <div className="bg-slate-700 rounded p-4">
                    <h3 className="font-bold text-white mb-2">📊 Real-Time Monitoring</h3>
                    <p className="text-sm text-slate-300">Live dashboard with system health and metrics</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
