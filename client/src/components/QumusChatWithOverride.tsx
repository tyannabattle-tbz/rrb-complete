import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Settings } from 'lucide-react';
import { QumusChatInterface } from './QumusChatInterface';
import AdminOverridePanel from './AdminOverridePanel';
import RealTimeDecisionVisualization from './RealTimeDecisionVisualization';

/**
 * Enhanced QUMUS Chat with Admin Override Panel and Real-Time Visualization
 * This component provides:
 * 1. QUMUS Chat Interface (main interaction point)
 * 2. Admin Override Panel (human approval/veto of autonomous decisions)
 * 3. Real-Time Decision Visualization (policy execution traces)
 */
export function QumusChatWithOverride() {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="w-full h-screen flex bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="w-full justify-start border-b border-slate-700 bg-slate-800/50 rounded-none">
            <TabsTrigger value="chat" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
              💬 QUMUS Chat
            </TabsTrigger>
            <TabsTrigger value="decisions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
              ⚡ Real-Time Decisions
            </TabsTrigger>
            <TabsTrigger value="override" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500">
              🔐 Admin Override
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 overflow-hidden">
            <QumusChatInterface />
          </TabsContent>

          {/* Real-Time Decisions Tab */}
          <TabsContent value="decisions" className="flex-1 overflow-hidden">
            <RealTimeDecisionVisualization />
          </TabsContent>

          {/* Admin Override Tab */}
          <TabsContent value="override" className="flex-1 overflow-hidden">
            <AdminOverridePanel />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Admin Panel Toggle (Optional) */}
      {!showAdminPanel && (
        <Button
          onClick={() => setShowAdminPanel(true)}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 p-0 bg-blue-600 hover:bg-blue-700 shadow-lg z-50"
          title="Open Admin Override Panel"
        >
          <Settings className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}

export default QumusChatWithOverride;
