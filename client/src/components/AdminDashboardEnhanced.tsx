import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Enhanced Admin Dashboard Component
 * Displays responder status, active call queue, and transfer management
 */

interface Responder {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'on-duty' | 'off-duty';
  currentCallCount: number;
  maxConcurrentCalls: number;
  successRate: number;
  totalCallsHandled: number;
}

interface CallQueueItem {
  callId: string;
  callerId: string;
  callerName: string;
  alertType: string;
  severity: string;
  position: number;
  estimatedWait: number;
  createdAt: Date;
}

interface TransferRequest {
  id: string;
  callId: string;
  fromResponder: string;
  toResponder: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function AdminDashboardEnhanced() {
  const [responders, setResponders] = useState<Responder[]>([]);
  const [callQueue, setCallQueue] = useState<CallQueueItem[]>([]);
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [selectedResponder, setSelectedResponder] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock data initialization
  useEffect(() => {
    initializeMockData();
    const interval = setInterval(updateDashboard, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const initializeMockData = () => {
    const mockResponders: Responder[] = [
      {
        id: 'resp-1',
        name: 'Dr. Sarah Johnson',
        role: 'medical',
        status: 'on-duty',
        currentCallCount: 2,
        maxConcurrentCalls: 3,
        successRate: 98,
        totalCallsHandled: 156,
      },
      {
        id: 'resp-2',
        name: 'Officer Mike Chen',
        role: 'security',
        status: 'on-duty',
        currentCallCount: 1,
        maxConcurrentCalls: 3,
        successRate: 95,
        totalCallsHandled: 142,
      },
      {
        id: 'resp-3',
        name: 'Counselor Emma Davis',
        role: 'mental-health',
        status: 'on-duty',
        currentCallCount: 3,
        maxConcurrentCalls: 3,
        successRate: 92,
        totalCallsHandled: 128,
      },
      {
        id: 'resp-4',
        name: 'Coordinator Tom Wilson',
        role: 'coordinator',
        status: 'off-duty',
        currentCallCount: 0,
        maxConcurrentCalls: 5,
        successRate: 99,
        totalCallsHandled: 287,
      },
    ];

    const mockCallQueue: CallQueueItem[] = [
      {
        callId: 'call-001',
        callerId: 'caller-1',
        callerName: 'John Smith',
        alertType: 'medical',
        severity: 'high',
        position: 1,
        estimatedWait: 2,
        createdAt: new Date(Date.now() - 120000),
      },
      {
        callId: 'call-002',
        callerId: 'caller-2',
        callerName: 'Jane Doe',
        alertType: 'security',
        severity: 'medium',
        position: 2,
        estimatedWait: 5,
        createdAt: new Date(Date.now() - 60000),
      },
      {
        callId: 'call-003',
        callerId: 'caller-3',
        callerName: 'Bob Johnson',
        alertType: 'mental-health',
        severity: 'high',
        position: 3,
        estimatedWait: 8,
        createdAt: new Date(Date.now() - 30000),
      },
    ];

    const mockTransfers: TransferRequest[] = [
      {
        id: 'transfer-1',
        callId: 'call-001',
        fromResponder: 'resp-1',
        toResponder: 'resp-2',
        reason: 'Specialist consultation needed',
        status: 'pending',
      },
    ];

    setResponders(mockResponders);
    setCallQueue(mockCallQueue);
    setTransfers(mockTransfers);
  };

  const updateDashboard = () => {
    // Simulate real-time updates
    setResponders(prev =>
      prev.map(r => ({
        ...r,
        currentCallCount: Math.max(0, Math.min(r.maxConcurrentCalls, r.currentCallCount + Math.random() - 0.5)),
      }))
    );
  };

  const handleResponderStatusChange = (responderId: string, newStatus: string) => {
    setResponders(prev =>
      prev.map(r =>
        r.id === responderId ? { ...r, status: newStatus as any } : r
      )
    );
  };

  const handleApproveTransfer = (transferId: string) => {
    setTransfers(prev =>
      prev.map(t =>
        t.id === transferId ? { ...t, status: 'approved' } : t
      )
    );
  };

  const handleRejectTransfer = (transferId: string) => {
    setTransfers(prev =>
      prev.map(t =>
        t.id === transferId ? { ...t, status: 'rejected' } : t
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-duty':
        return 'bg-green-100 text-green-800';
      case 'off-duty':
        return 'bg-gray-100 text-gray-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="text-sm text-gray-600">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Responder Status Board */}
      <Card>
        <CardHeader>
          <CardTitle>Responder Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {responders.map(responder => (
              <div
                key={responder.id}
                className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedResponder(responder.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{responder.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{responder.role}</p>
                  </div>
                  <Badge className={getStatusColor(responder.status)}>
                    {responder.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Active Calls:</span>
                    <span className="font-semibold">
                      {Math.round(responder.currentCallCount)}/{responder.maxConcurrentCalls}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className="font-semibold">{responder.successRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Calls:</span>
                    <span className="font-semibold">{responder.totalCallsHandled}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <select
                    value={responder.status}
                    onChange={e => handleResponderStatusChange(responder.id, e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded"
                  >
                    <option value="on-duty">On Duty</option>
                    <option value="off-duty">Off Duty</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Active Call Queue ({callQueue.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {callQueue.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No calls in queue</p>
            ) : (
              callQueue.map(call => (
                <div key={call.callId} className="border rounded-lg p-4 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold">#{call.position}</span>
                      <span className="font-semibold">{call.callerName}</span>
                      <Badge className={getSeverityColor(call.severity)}>
                        {call.severity}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {call.alertType}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Waiting: {Math.round((Date.now() - call.createdAt.getTime()) / 1000)}s
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">Est. Wait: {call.estimatedWait}m</p>
                    <Button size="sm" className="mt-2">
                      Assign
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transfer Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Transfer Requests ({transfers.filter(t => t.status === 'pending').length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transfers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No transfer requests</p>
            ) : (
              transfers.map(transfer => (
                <div key={transfer.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">Call {transfer.callId}</p>
                      <p className="text-sm text-gray-600">
                        {transfer.fromResponder} → {transfer.toResponder}
                      </p>
                      <p className="text-sm mt-1">{transfer.reason}</p>
                    </div>
                    <Badge
                      className={
                        transfer.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : transfer.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                      }
                    >
                      {transfer.status}
                    </Badge>
                  </div>
                  {transfer.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => handleApproveTransfer(transfer.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejectTransfer(transfer.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {responders.filter(r => r.status === 'on-duty').length}
              </p>
              <p className="text-sm text-gray-600">On Duty</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{callQueue.length}</p>
              <p className="text-sm text-gray-600">In Queue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(
                  responders.reduce((sum, r) => sum + r.currentCallCount, 0) /
                    responders.length
                )}
              </p>
              <p className="text-sm text-gray-600">Avg Calls</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {Math.round(
                  responders.reduce((sum, r) => sum + r.successRate, 0) /
                    responders.length
                )}
                %
              </p>
              <p className="text-sm text-gray-600">Avg Success</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
