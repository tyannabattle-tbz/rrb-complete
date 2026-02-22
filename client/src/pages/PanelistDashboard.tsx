/**
 * Public Panelist Dashboard
 * Allows panelists to confirm/decline attendance and access Zoom details
 */

import React, { useState, useEffect } from 'react';
import { Check, X, Clock, Download, Copy, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';

interface PanelistInvitation {
  panelistId: string;
  name: string;
  email: string;
  role: 'panelist' | 'moderator';
  eventName: string;
  eventDate: string;
  eventTime: string;
  zoomLink: string;
  meetingId: string;
  passcode: string;
  status: 'pending' | 'confirmed' | 'declined';
}

export const PanelistDashboard: React.FC = () => {
  const [invitation, setInvitation] = useState<PanelistInvitation | null>(null);
  const [showPasscode, setShowPasscode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Get panelistId from URL
  const panelistId = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('id') 
    : null;

  // Fetch panelist details
  const getPanelistQuery = trpc.admin.panelists.getPanelistDetails.useQuery(
    { panelistId: panelistId || '' },
    { enabled: !!panelistId }
  );

  // Update status mutation
  const updateStatusMutation = trpc.admin.panelists.updatePanelistStatus.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => {
        getPanelistQuery.refetch();
      }, 2000);
    },
    onError: (error) => {
      setError(error.message || 'Failed to update status');
    },
  });

  useEffect(() => {
    if (getPanelistQuery.data) {
      setInvitation(getPanelistQuery.data as any);
      setLoading(false);
    }
  }, [getPanelistQuery.data]);

  useEffect(() => {
    if (getPanelistQuery.isError) {
      setError('Invitation not found or has expired');
      setLoading(false);
    }
  }, [getPanelistQuery.isError]);

  const handleConfirm = () => {
    if (panelistId) {
      updateStatusMutation.mutate({
        panelistId,
        status: 'confirmed',
      });
    }
  };

  const handleDecline = () => {
    if (panelistId) {
      updateStatusMutation.mutate({
        panelistId,
        status: 'declined',
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    // Show toast notification
    const toast = document.createElement('div');
    toast.textContent = `${label} copied to clipboard`;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 1000;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="bg-red-900/20 border-red-500 max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <X className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-200 mb-2">Invitation Not Found</h2>
              <p className="text-red-100 mb-4">
                {error || 'This invitation link is invalid or has expired.'}
              </p>
              <p className="text-sm text-red-200">
                Please contact the event organizers for assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isConfirmed = invitation.status === 'confirmed';
  const isDeclined = invitation.status === 'declined';
  const isPending = invitation.status === 'pending';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">🔴 UN WCS Parallel Event</h1>
          <p className="text-gray-400">Panelist Invitation & Confirmation</p>
        </div>

        {/* Success Message */}
        {submitted && (
          <Card className="bg-green-900/20 border-green-500 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Check className="w-6 h-6 text-green-400" />
                <p className="text-green-200">
                  Your response has been recorded. Thank you!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invitation Card */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl text-white">
                  Hello, {invitation.name}!
                </CardTitle>
                <CardDescription>
                  You are invited as a {invitation.role}
                </CardDescription>
              </div>
              <div className={`px-4 py-2 rounded-full font-semibold text-sm ${
                isConfirmed
                  ? 'bg-green-900/30 text-green-300'
                  : isDeclined
                  ? 'bg-red-900/30 text-red-300'
                  : 'bg-yellow-900/30 text-yellow-300'
              }`}>
                {isConfirmed ? '✓ Confirmed' : isDeclined ? '✗ Declined' : '⏳ Pending'}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Event Details */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-3">Event Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Event:</span>
                  <span className="text-white font-medium">{invitation.eventName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-white font-medium">{invitation.eventDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time:</span>
                  <span className="text-white font-medium">{invitation.eventTime} UTC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Role:</span>
                  <span className="text-white font-medium capitalize">{invitation.role}</span>
                </div>
              </div>
            </div>

            {/* Zoom Details */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-3">Zoom Meeting Details</h3>
              
              {/* Zoom Link */}
              <div className="mb-4">
                <label className="text-xs text-gray-400 uppercase tracking-wide">Meeting Link</label>
                <div className="flex items-center gap-2 mt-2">
                  <a
                    href={invitation.zoomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-slate-600 text-blue-300 rounded text-sm hover:bg-slate-500 truncate"
                  >
                    {invitation.zoomLink}
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(invitation.zoomLink, 'Link')}
                    className="text-gray-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Meeting ID */}
              <div className="mb-4">
                <label className="text-xs text-gray-400 uppercase tracking-wide">Meeting ID</label>
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 px-3 py-2 bg-slate-600 text-white rounded text-sm font-mono">
                    {invitation.meetingId}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(invitation.meetingId, 'Meeting ID')}
                    className="text-gray-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Passcode */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">Passcode</label>
                <div className="flex items-center gap-2 mt-2">
                  <code className={`flex-1 px-3 py-2 bg-slate-600 rounded text-sm font-mono ${
                    showPasscode ? 'text-white' : 'text-gray-500'
                  }`}>
                    {showPasscode ? invitation.passcode : '••••••'}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="text-gray-400 hover:text-white"
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(invitation.passcode, 'Passcode')}
                    className="text-gray-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
              <h4 className="font-semibold text-blue-200 mb-2">Before the Event</h4>
              <ul className="text-sm text-blue-100 space-y-1">
                <li>✓ Join 10 minutes early to test your audio and video</li>
                <li>✓ Use a stable internet connection</li>
                <li>✓ Find a quiet location with good lighting</li>
                <li>✓ Have your camera and microphone ready</li>
              </ul>
            </div>

            {/* Confirmation Buttons */}
            {isPending && !submitted && (
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleConfirm}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {updateStatusMutation.isPending ? 'Confirming...' : 'Confirm Attendance'}
                </Button>
                <Button
                  onClick={handleDecline}
                  disabled={updateStatusMutation.isPending}
                  variant="outline"
                  className="flex-1 border-red-500 text-red-400 hover:bg-red-900/20"
                >
                  <X className="w-4 h-4 mr-2" />
                  {updateStatusMutation.isPending ? 'Declining...' : 'Decline'}
                </Button>
              </div>
            )}

            {/* Status Display */}
            {(isConfirmed || isDeclined) && (
              <div className={`rounded-lg p-4 text-center ${
                isConfirmed
                  ? 'bg-green-900/20 border border-green-500'
                  : 'bg-red-900/20 border border-red-500'
              }`}>
                <p className={isConfirmed ? 'text-green-200' : 'text-red-200'}>
                  {isConfirmed
                    ? '✓ Your attendance has been confirmed. We look forward to seeing you!'
                    : '✗ Your attendance has been declined. Thank you for your consideration.'}
                </p>
              </div>
            )}

            {/* Download Button */}
            <Button
              variant="outline"
              className="w-full border-slate-600 text-gray-300 hover:bg-slate-700"
              onClick={() => {
                const text = `UN WCS Parallel Event - Zoom Details\n\nEvent: ${invitation.eventName}\nDate: ${invitation.eventDate}\nTime: ${invitation.eventTime} UTC\nRole: ${invitation.role}\n\nZoom Link: ${invitation.zoomLink}\nMeeting ID: ${invitation.meetingId}\nPasscode: ${invitation.passcode}`;
                const element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                element.setAttribute('download', 'zoom-details.txt');
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Zoom Details
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400">
          <p>Questions? Contact the event organizers for support.</p>
          <p className="mt-2">SQUADD • UN WCS Parallel Event • March 17, 2026</p>
        </div>
      </div>
    </div>
  );
};
