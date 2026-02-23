import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { emergencyAlertService, EmergencyAlert } from '@/services/emergencyAlertService';

interface EmergencyAlertButtonsProps {
  userId?: string;
  userName?: string;
  onSOSTriggered?: (alert: EmergencyAlert) => void;
  onImOkayTriggered?: (alert: EmergencyAlert) => void;
}

export function EmergencyAlertButtons({
  userId = 'user-' + Math.random().toString(36).substr(2, 9),
  userName = 'User',
  onSOSTriggered,
  onImOkayTriggered,
}: EmergencyAlertButtonsProps) {
  const [sosLoading, setSOSLoading] = useState(false);
  const [imOkayLoading, setImOkayLoading] = useState(false);
  const [sosMessage, setSOSMessage] = useState('');
  const [showSOSInput, setShowSOSInput] = useState(false);
  const [lastAlert, setLastAlert] = useState<EmergencyAlert | null>(null);

  useEffect(() => {
    // Request notification permission on mount
    emergencyAlertService.requestNotificationPermission();

    // Listen for alert changes
    const unsubscribe = emergencyAlertService.onAlertChange((alert) => {
      setLastAlert(alert);
    });

    return unsubscribe;
  }, []);

  const handleSOSClick = async () => {
    setSOSLoading(true);
    try {
      const alert = await emergencyAlertService.sendSOSAlert(
        userId,
        userName,
        sosMessage || undefined
      );
      onSOSTriggered?.(alert);
      setSOSMessage('');
      setShowSOSInput(false);

      // Show confirmation
      alert && alert.id && console.log('SOS Alert sent:', alert.id);
    } catch (err) {
      console.error('Failed to send SOS alert:', err);
    } finally {
      setSOSLoading(false);
    }
  };

  const handleImOkayClick = async () => {
    setImOkayLoading(true);
    try {
      const alert = await emergencyAlertService.sendImOkayAlert(userId, userName);
      onImOkayTriggered?.(alert);

      // Show confirmation toast
      console.log('I\'m OK alert sent:', alert.id);
    } catch (err) {
      console.error('Failed to send I\'m OK alert:', err);
    } finally {
      setImOkayLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Emergency Alert Buttons */}
      <div className="flex gap-3 mb-4">
        {/* SOS Button */}
        <div className="flex-1">
          {showSOSInput ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Describe your emergency (optional)"
                value={sosMessage}
                onChange={(e) => setSOSMessage(e.target.value)}
                className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                maxLength={100}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSOSClick}
                  disabled={sosLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 flex items-center justify-center gap-2"
                >
                  {sosLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      SEND SOS
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowSOSInput(false);
                    setSOSMessage('');
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setShowSOSInput(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all hover:shadow-xl active:scale-95"
            >
              <AlertTriangle className="w-5 h-5" />
              SOS
            </Button>
          )}
        </div>

        {/* I'm OK Button */}
        <Button
          onClick={handleImOkayClick}
          disabled={imOkayLoading}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all hover:shadow-xl active:scale-95"
        >
          {imOkayLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              I'm OK
            </>
          )}
        </Button>
      </div>

      {/* Last Alert Status */}
      {lastAlert && (
        <div
          className={`p-3 rounded-lg text-sm font-semibold ${
            lastAlert.type === 'sos'
              ? 'bg-red-100 text-red-700 border border-red-300'
              : 'bg-green-100 text-green-700 border border-green-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span>{lastAlert.type === 'sos' ? '🚨 SOS Alert' : '✅ Wellness Check'}</span>
            <span className="text-xs font-mono">
              {lastAlert.status === 'resolved' ? 'Resolved' : 'Active'}
            </span>
          </div>
          <p className="text-xs opacity-75">
            {lastAlert.responders.length > 0
              ? `${lastAlert.responders.length} responder(s) acknowledged`
              : 'Waiting for responders...'}
          </p>
        </div>
      )}
    </div>
  );
}
