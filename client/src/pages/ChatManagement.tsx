import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trash2,
  Archive,
  Eye,
  ExternalLink,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export const ChatManagement: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  // Get session count
  const { data: countData } = (trpc as any).chatHistory.getSessionCount.useQuery();

  React.useEffect(() => {
    if (countData) {
      setSessionCount(countData.count);
    }
  }, [countData]);

  // Clear all mutation
  const clearAllMutation = (trpc as any).chatHistory.clearAll.useMutation({
    onSuccess: () => {
      toast.success('All chat history cleared');
      setShowConfirm(false);
      setSessionCount(0);
    },
    onError: () => {
      toast.error('Failed to clear history');
    },
  });

  const handleClearAll = () => {
    clearAllMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Chat Management</h1>
          <p className="text-slate-400">
            Manage your conversation history and connect to Rockin Rockin Boogie
          </p>
        </div>

        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800 border border-slate-700">
            <TabsTrigger value="history">Clear History</TabsTrigger>
            <TabsTrigger value="rockin">Rockin Rockin Boogie</TabsTrigger>
          </TabsList>

          {/* Clear History Tab */}
          <TabsContent value="history" className="space-y-4">
            {/* Current Status */}
            <Card className="p-6 bg-slate-800 border-slate-700">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Current Sessions
                    </h2>
                    <p className="text-slate-400">
                      You have {sessionCount} active chat session
                      {sessionCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-4xl font-bold text-blue-500">
                    {sessionCount}
                  </div>
                </div>
              </div>
            </Card>

            {/* Options */}
            <Card className="p-6 bg-slate-800 border-slate-700 space-y-4">
              <h3 className="text-xl font-bold text-white">Clear Options</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Archive Option */}
                <Card className="p-4 bg-slate-700 border-slate-600 hover:border-slate-500 transition-all cursor-pointer">
                  <div className="flex items-start gap-3">
                    <Archive className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">Archive</h4>
                      <p className="text-sm text-slate-300 mb-3">
                        Keep history but mark as archived for later reference
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => toast.info('Archive feature coming soon')}
                      >
                        Archive All
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Hide Option */}
                <Card className="p-4 bg-slate-700 border-slate-600 hover:border-slate-500 transition-all cursor-pointer">
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-purple-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">Hide</h4>
                      <p className="text-sm text-slate-300 mb-3">
                        Hide from view but keep in database for recovery
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => toast.info('Hide feature coming soon')}
                      >
                        Hide All
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Delete Option */}
                <Card className="p-4 bg-red-900/20 border-red-700 hover:border-red-600 transition-all cursor-pointer">
                  <div className="flex items-start gap-3">
                    <Trash2 className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">
                        Permanently Delete
                      </h4>
                      <p className="text-sm text-slate-300 mb-3">
                        Permanently remove all chat history (cannot be undone)
                      </p>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full"
                        onClick={() => setShowConfirm(true)}
                      >
                        Delete All
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>

            {/* Confirmation Dialog */}
            {showConfirm && (
              <Card className="p-6 bg-red-900/20 border-red-700">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-white text-lg">
                        Confirm Permanent Deletion
                      </h3>
                      <p className="text-slate-300 mt-2">
                        You are about to permanently delete {sessionCount} chat
                        session{sessionCount !== 1 ? 's' : ''} and all associated
                        messages. This action cannot be undone.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleClearAll}
                      disabled={clearAllMutation.isPending}
                    >
                      {clearAllMutation.isPending
                        ? 'Deleting...'
                        : 'Yes, Delete All'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Rockin Rockin Boogie Tab */}
          <TabsContent value="rockin" className="space-y-4">
            <Card className="p-6 bg-slate-800 border-slate-700">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Rockin Rockin Boogie
                  </h2>
                  <p className="text-slate-400">
                    Connect to the Rockin Rockin Boogie platform for enhanced
                    production capabilities and content management
                  </p>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 bg-slate-700 border-slate-600 hover:border-blue-500 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white mb-1">
                          Main Platform
                        </h3>
                        <p className="text-sm text-slate-300">
                          Access the full Rockin Rockin Boogie platform
                        </p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-blue-500" />
                    </div>
                    <Button
                      className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
                      onClick={() =>
                        window.open(
                          'https://rockinrockinboogie.com',
                          '_blank'
                        )
                      }
                    >
                      Visit Platform
                    </Button>
                  </Card>

                  <Card className="p-4 bg-slate-700 border-slate-600 hover:border-purple-500 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white mb-1">
                          Content Library
                        </h3>
                        <p className="text-sm text-slate-300">
                          Browse and manage your content library
                        </p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-purple-500" />
                    </div>
                    <Button
                      className="w-full mt-3 bg-purple-600 hover:bg-purple-700"
                      onClick={() =>
                        window.open(
                          'https://rockinrockinboogie.com/library',
                          '_blank'
                        )
                      }
                    >
                      View Library
                    </Button>
                  </Card>

                  <Card className="p-4 bg-slate-700 border-slate-600 hover:border-green-500 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white mb-1">
                          Analytics
                        </h3>
                        <p className="text-sm text-slate-300">
                          View production analytics and insights
                        </p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-green-500" />
                    </div>
                    <Button
                      className="w-full mt-3 bg-green-600 hover:bg-green-700"
                      onClick={() =>
                        window.open(
                          'https://rockinrockinboogie.com/analytics',
                          '_blank'
                        )
                      }
                    >
                      View Analytics
                    </Button>
                  </Card>

                  <Card className="p-4 bg-slate-700 border-slate-600 hover:border-yellow-500 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white mb-1">
                          Settings
                        </h3>
                        <p className="text-sm text-slate-300">
                          Configure integration settings
                        </p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-yellow-500" />
                    </div>
                    <Button
                      className="w-full mt-3 bg-yellow-600 hover:bg-yellow-700"
                      onClick={() =>
                        window.open(
                          'https://rockinrockinboogie.com/settings',
                          '_blank'
                        )
                      }
                    >
                      Go to Settings
                    </Button>
                  </Card>
                </div>

                {/* Integration Status */}
                <Card className="p-4 bg-green-900/20 border-green-700">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <h4 className="font-semibold text-white">
                        Integration Active
                      </h4>
                      <p className="text-sm text-slate-300">
                        Qumus is connected to Rockin Rockin Boogie and ready to
                        sync content
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ChatManagement;
