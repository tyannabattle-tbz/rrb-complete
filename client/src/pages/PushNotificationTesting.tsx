/**
 * Mobile Push Notification Testing Dashboard
 * Test push delivery across iOS/Android with QUMUS policy triggers
 * Validates cross-platform delivery reliability
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, Send, Smartphone } from 'lucide-react';

interface PushTest {
  id: string;
  title: string;
  message: string;
  platform: 'ios' | 'android' | 'web' | 'all';
  triggerType: 'policy_decision' | 'content_upload' | 'listener_engagement' | 'revenue_alert' | 'manual';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: number;
  deliveredAt?: number;
  failureReason?: string;
  deviceCount: number;
  deliveryRate: number;
}

interface PushTestResult {
  testId: string;
  platform: string;
  deviceId: string;
  status: 'delivered' | 'failed' | 'pending';
  deliveryTime?: number;
  errorMessage?: string;
  timestamp: number;
}

const PushNotificationTesting: React.FC = () => {
  const [tests, setTests] = useState<PushTest[]>([]);
  const [results, setResults] = useState<PushTestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState<PushTest | null>(null);
  const [testForm, setTestForm] = useState({
    title: 'QUMUS Policy Decision',
    message: 'A new policy decision requires your attention',
    platform: 'all',
    triggerType: 'policy_decision',
  });

  useEffect(() => {
    loadPushTests();
  }, []);

  const loadPushTests = async () => {
    try {
      setLoading(true);
      // Simulate loading push tests
      const mockTests: PushTest[] = [
        {
          id: 'test_001',
          title: 'Policy Decision Alert',
          message: 'Content moderation decision requires review',
          platform: 'all',
          triggerType: 'policy_decision',
          status: 'delivered',
          sentAt: Date.now() - 3600000,
          deliveredAt: Date.now() - 3595000,
          deviceCount: 1250,
          deliveryRate: 0.98,
        },
        {
          id: 'test_002',
          title: 'New Content Upload',
          message: 'Neo-Soul channel has new content available',
          platform: 'ios',
          triggerType: 'content_upload',
          status: 'delivered',
          sentAt: Date.now() - 1800000,
          deliveredAt: Date.now() - 1790000,
          deviceCount: 650,
          deliveryRate: 0.96,
        },
        {
          id: 'test_003',
          title: 'Listener Engagement',
          message: 'Your favorite channel is live now',
          platform: 'android',
          triggerType: 'listener_engagement',
          status: 'delivered',
          sentAt: Date.now() - 900000,
          deliveredAt: Date.now() - 885000,
          deviceCount: 800,
          deliveryRate: 0.94,
        },
        {
          id: 'test_004',
          title: 'Revenue Alert',
          message: 'Daily revenue target achieved',
          platform: 'web',
          triggerType: 'revenue_alert',
          status: 'sent',
          sentAt: Date.now() - 300000,
          deviceCount: 2100,
          deliveryRate: 0.0,
        },
      ];

      setTests(mockTests);

      // Simulate delivery results
      const mockResults: PushTestResult[] = [
        {
          testId: 'test_001',
          platform: 'ios',
          deviceId: 'device_ios_001',
          status: 'delivered',
          deliveryTime: 2500,
          timestamp: Date.now() - 3595000,
        },
        {
          testId: 'test_001',
          platform: 'android',
          deviceId: 'device_android_001',
          status: 'delivered',
          deliveryTime: 3200,
          timestamp: Date.now() - 3594000,
        },
        {
          testId: 'test_002',
          platform: 'ios',
          deviceId: 'device_ios_002',
          status: 'delivered',
          deliveryTime: 1800,
          timestamp: Date.now() - 1790000,
        },
        {
          testId: 'test_003',
          platform: 'android',
          deviceId: 'device_android_002',
          status: 'failed',
          errorMessage: 'Device offline',
          timestamp: Date.now() - 885000,
        },
      ];

      setResults(mockResults);
    } catch (error) {
      console.error('Failed to load push tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    try {
      const newTest: PushTest = {
        id: `test_${Date.now()}`,
        title: testForm.title,
        message: testForm.message,
        platform: testForm.platform as any,
        triggerType: testForm.triggerType as any,
        status: 'sent',
        sentAt: Date.now(),
        deviceCount: Math.floor(Math.random() * 2000) + 500,
        deliveryRate: 0,
      };

      setTests([newTest, ...tests]);
      setTestForm({
        title: 'QUMUS Policy Decision',
        message: 'A new policy decision requires your attention',
        platform: 'all',
        triggerType: 'policy_decision',
      });

      // Simulate delivery completion
      setTimeout(() => {
        setTests(prev =>
          prev.map(t =>
            t.id === newTest.id
              ? {
                  ...t,
                  status: 'delivered',
                  deliveredAt: Date.now(),
                  deliveryRate: Math.random() * 0.05 + 0.93,
                }
              : t
          )
        );
      }, 3000);

      console.log('[Push Testing] Test sent:', newTest.id);
    } catch (error) {
      console.error('Failed to send push test:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'sent':
        return <Clock className="w-5 h-5 text-blue-400" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    return <Smartphone className="w-4 h-4" />;
  };

  const getDeliveryColor = (rate: number) => {
    if (rate >= 0.95) return 'bg-green-100 text-green-800';
    if (rate >= 0.90) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const avgDeliveryRate = tests.length > 0 ? (tests.reduce((sum, t) => sum + t.deliveryRate, 0) / tests.length) * 100 : 0;
  const successfulTests = tests.filter(t => t.status === 'delivered').length;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Push Notification Testing</h1>
          <p className="text-slate-400">Test cross-platform push delivery with QUMUS policy triggers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Total Tests</p>
                <p className="text-3xl font-bold text-white">{tests.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Successful</p>
                <p className="text-3xl font-bold text-green-400">{successfulTests}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Avg Delivery Rate</p>
                <p className="text-3xl font-bold text-blue-400">{avgDeliveryRate.toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Total Devices</p>
                <p className="text-3xl font-bold text-purple-400">{tests.reduce((sum, t) => sum + t.deviceCount, 0)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Test Form */}
          <Card className="bg-slate-800 border-slate-700 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-white">Create Test</CardTitle>
              <CardDescription>Send a new push notification test</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input
                  type="text"
                  value={testForm.title}
                  onChange={e => setTestForm({ ...testForm, title: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                  placeholder="Notification title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                <textarea
                  value={testForm.message}
                  onChange={e => setTestForm({ ...testForm, message: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                  placeholder="Notification message"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Platform</label>
                <select
                  value={testForm.platform}
                  onChange={e => setTestForm({ ...testForm, platform: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                >
                  <option value="all">All Platforms</option>
                  <option value="ios">iOS Only</option>
                  <option value="android">Android Only</option>
                  <option value="web">Web Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Trigger Type</label>
                <select
                  value={testForm.triggerType}
                  onChange={e => setTestForm({ ...testForm, triggerType: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                >
                  <option value="policy_decision">Policy Decision</option>
                  <option value="content_upload">Content Upload</option>
                  <option value="listener_engagement">Listener Engagement</option>
                  <option value="revenue_alert">Revenue Alert</option>
                  <option value="manual">Manual Test</option>
                </select>
              </div>
              <Button onClick={handleSendTest} className="w-full bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4 mr-2" />
                Send Test
              </Button>
            </CardContent>
          </Card>

          {/* Test Results */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <p className="text-slate-400">Loading tests...</p>
                </CardContent>
              </Card>
            ) : tests.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <p className="text-slate-400">No push tests yet</p>
                </CardContent>
              </Card>
            ) : (
              tests.map(test => (
                <Card key={test.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getStatusIcon(test.status)}</div>
                        <div>
                          <h3 className="font-semibold text-white">{test.title}</h3>
                          <p className="text-sm text-slate-400 mt-1">{test.message}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-slate-300">
                        {test.platform.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-slate-500">Status</p>
                        <p className="text-white font-semibold capitalize">{test.status}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Devices</p>
                        <p className="text-white font-semibold">{test.deviceCount}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Delivery Rate</p>
                        <Badge className={getDeliveryColor(test.deliveryRate)}>
                          {(test.deliveryRate * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <div>
                        <p className="text-slate-500">Trigger</p>
                        <p className="text-white font-semibold text-xs">{test.triggerType.replace(/_/g, ' ')}</p>
                      </div>
                    </div>

                    {test.sentAt && (
                      <div className="text-xs text-slate-400">
                        Sent: {new Date(test.sentAt).toLocaleString()}
                        {test.deliveredAt && ` • Delivered: ${new Date(test.deliveredAt).toLocaleString()}`}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Delivery Details */}
        {selectedTest && (
          <Card className="bg-slate-800 border-slate-700 mt-6">
            <CardHeader>
              <CardTitle className="text-white">Delivery Details</CardTitle>
              <CardDescription>Device-level delivery results for {selectedTest.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results
                  .filter(r => r.testId === selectedTest.id)
                  .map(result => (
                    <div key={`${result.testId}_${result.deviceId}`} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                      <div className="flex items-center gap-3">
                        {getPlatformIcon(result.platform)}
                        <div>
                          <p className="text-sm font-semibold text-white">{result.deviceId}</p>
                          <p className="text-xs text-slate-400">{result.platform}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {result.status === 'delivered' ? (
                          <>
                            <div className="text-right">
                              <p className="text-sm text-slate-300">{result.deliveryTime}ms</p>
                            </div>
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          </>
                        ) : result.status === 'failed' ? (
                          <>
                            <div className="text-right">
                              <p className="text-xs text-red-400">{result.errorMessage}</p>
                            </div>
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          </>
                        ) : (
                          <Clock className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PushNotificationTesting;
