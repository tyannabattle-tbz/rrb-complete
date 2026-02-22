/**
 * Admin Panelist Management Page
 * Manage SQUADD strategy session panelists and send invitations
 */

import React, { useState } from 'react';
import { Mail, Plus, Trash2, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';

interface Panelist {
  id: string;
  name: string;
  email: string;
  role: 'panelist' | 'moderator';
  eventName: string;
  status: 'pending' | 'confirmed' | 'declined';
  invitedAt: string;
  respondedAt?: string;
}

export const PanelistManagement: React.FC = () => {
  const { user } = useAuth();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('UN WCS Parallel Event');
  const [panelists, setPanelists] = useState<Panelist[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'panelist' as const,
    eventName: 'UN WCS Parallel Event',
    zoomLink: 'https://zoom.us/j/8792681602',
    meetingId: '879 2681 6025',
    passcode: '908875',
    eventDate: '2026-03-17',
    eventTime: '9:00 AM UTC',
  });

  const sendInviteMutation = trpc.admin.panelists.sendPanelistInvite.useMutation({
    onSuccess: (data) => {
      console.log('Invitation sent:', data);
      setFormData({
        email: '',
        name: '',
        role: 'panelist',
        eventName: 'UN WCS Parallel Event',
        zoomLink: 'https://zoom.us/j/8792681602',
        meetingId: '879 2681 6025',
        passcode: '908875',
        eventDate: '2026-03-17',
        eventTime: '9:00 AM UTC',
      });
      setShowInviteForm(false);
      // Refresh panelists list
      fetchPanelists();
    },
    onError: (error) => {
      console.error('Error sending invitation:', error);
    },
  });

  const listPanelistsQuery = trpc.admin.panelists.listPanelists.useQuery(
    { eventName: selectedEvent },
    { enabled: !!selectedEvent }
  );

  const removePanelistMutation = trpc.admin.panelists.removePanelist.useMutation({
    onSuccess: () => {
      fetchPanelists();
    },
  });

  const getEventSummaryQuery = trpc.admin.panelists.getEventSummary.useQuery(
    { eventName: selectedEvent },
    { enabled: !!selectedEvent }
  );

  const fetchPanelists = () => {
    listPanelistsQuery.refetch();
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    sendInviteMutation.mutate(formData);
  };

  const handleRemovePanelist = (panelistId: string) => {
    if (confirm('Are you sure you want to remove this panelist?')) {
      removePanelistMutation.mutate({ panelistId });
    }
  };

  // Check admin access
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-red-900/20 border-red-500">
            <CardContent className="pt-6">
              <p className="text-red-200">You do not have permission to access this page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const eventSummary = getEventSummaryQuery.data;
  const isLoading = listPanelistsQuery.isLoading || sendInviteMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Panelist Management</h1>
          <p className="text-gray-400">Manage SQUADD strategy session panelists and send Zoom invitations</p>
        </div>

        {/* Event Selector and Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-300">Total Invited</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{eventSummary?.totalInvited || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-green-400">Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{eventSummary?.confirmed || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-yellow-400">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">{eventSummary?.pending || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-red-400">Declined</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{eventSummary?.declined || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Send Panelist Invitation
              </CardTitle>
              <CardDescription>Send Zoom meeting details to a new panelist</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <Input
                      type="text"
                      placeholder="Panelist name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="panelist@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                    <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="panelist">Panelist</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Event</label>
                    <Input
                      type="text"
                      value={formData.eventName}
                      onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      disabled
                    />
                  </div>
                </div>

                <div className="border-t border-slate-600 pt-4">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">Zoom Meeting Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Zoom Link</label>
                      <Input
                        type="url"
                        value={formData.zoomLink}
                        onChange={(e) => setFormData({ ...formData, zoomLink: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Meeting ID</label>
                      <Input
                        type="text"
                        value={formData.meetingId}
                        onChange={(e) => setFormData({ ...formData, meetingId: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Passcode</label>
                      <Input
                        type="text"
                        value={formData.passcode}
                        onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Event Date</label>
                      <Input
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Invitation'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowInviteForm(false)}
                    className="border-slate-600 text-gray-300"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Panelists List */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Panelists for {selectedEvent}</CardTitle>
              <CardDescription>Manage invitations and track responses</CardDescription>
            </div>
            {!showInviteForm && (
              <Button onClick={() => setShowInviteForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-400">Loading panelists...</div>
            ) : listPanelistsQuery.data && listPanelistsQuery.data.length > 0 ? (
              <div className="space-y-3">
                {listPanelistsQuery.data.map((panelist) => (
                  <div key={panelist.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-semibold text-white">{panelist.name}</p>
                          <p className="text-sm text-gray-400">{panelist.email}</p>
                        </div>
                        <span className="px-2 py-1 text-xs bg-slate-600 text-gray-300 rounded">
                          {panelist.role}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {panelist.status === 'confirmed' && (
                        <div className="flex items-center gap-1 text-green-400">
                          <Check className="w-4 h-4" />
                          <span className="text-sm">Confirmed</span>
                        </div>
                      )}
                      {panelist.status === 'pending' && (
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">Pending</span>
                        </div>
                      )}
                      {panelist.status === 'declined' && (
                        <div className="flex items-center gap-1 text-red-400">
                          <X className="w-4 h-4" />
                          <span className="text-sm">Declined</span>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePanelist(panelist.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">No panelists invited yet</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
