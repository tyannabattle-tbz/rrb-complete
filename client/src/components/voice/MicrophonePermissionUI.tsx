import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface PermissionStatus {
  status: 'granted' | 'denied' | 'prompt' | 'unknown';
  message: string;
  canRequest: boolean;
}

export default function MicrophonePermissionUI() {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>({
    status: 'unknown',
    message: 'Checking microphone access...',
    canRequest: true,
  });
  const [isRequesting, setIsRequesting] = useState(false);
  const [browserSupport, setBrowserSupport] = useState({
    speechRecognition: false,
    mediaDevices: false,
  });

  // Check browser support and permissions on mount
  useEffect(() => {
    checkBrowserSupport();
    checkPermissions();
  }, []);

  const checkBrowserSupport = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const hasMediaDevices = !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    );

    setBrowserSupport({
      speechRecognition: !!SpeechRecognition,
      mediaDevices: hasMediaDevices,
    });
  };

  const checkPermissions = async () => {
    try {
      // Check if permissions API is available
      if (!navigator.permissions) {
        setPermissionStatus({
          status: 'unknown',
          message: 'Permissions API not available. Click "Request Access" to proceed.',
          canRequest: true,
        });
        return;
      }

      // Query microphone permission
      const permission = await navigator.permissions.query({
        name: 'microphone' as PermissionName,
      });

      const statusMap: Record<string, PermissionStatus> = {
        granted: {
          status: 'granted',
          message: '✓ Microphone access granted. Voice commands are ready to use.',
          canRequest: false,
        },
        denied: {
          status: 'denied',
          message:
            '✗ Microphone access denied. Please enable it in browser settings to use voice commands.',
          canRequest: false,
        },
        prompt: {
          status: 'prompt',
          message: 'Microphone permission required. Click below to grant access.',
          canRequest: true,
        },
      };

      setPermissionStatus(
        statusMap[permission.state] || {
          status: 'unknown',
          message: 'Unknown permission status',
          canRequest: true,
        }
      );

      // Listen for permission changes
      permission.addEventListener('change', () => {
        const newStatus = statusMap[permission.state];
        if (newStatus) {
          setPermissionStatus(newStatus);
          if (permission.state === 'granted') {
            toast.success('Microphone access granted!');
          }
        }
      });
    } catch (error) {
      setPermissionStatus({
        status: 'unknown',
        message: 'Could not check permission status. Click "Request Access" to proceed.',
        canRequest: true,
      });
    }
  };

  const requestMicrophoneAccess = async () => {
    setIsRequesting(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Stop the stream immediately - we just needed to request permission
      stream.getTracks().forEach((track) => track.stop());

      setPermissionStatus({
        status: 'granted',
        message: '✓ Microphone access granted. Voice commands are ready to use.',
        canRequest: false,
      });

      toast.success('Microphone access granted successfully!');
    } catch (error: any) {
      const errorMap: Record<string, string> = {
        NotAllowedError: 'Permission denied. Please enable microphone access in your browser settings.',
        NotFoundError: 'No microphone found. Please connect a microphone and try again.',
        NotSupportedError: 'Your browser does not support microphone access.',
        SecurityError: 'Microphone access requires a secure (HTTPS) connection.',
      };

      const message =
        errorMap[error.name] ||
        `Error: ${error.message || 'Failed to access microphone'}`;

      setPermissionStatus({
        status: 'denied',
        message,
        canRequest: error.name === 'NotAllowedError',
      });

      toast.error(message);
    } finally {
      setIsRequesting(false);
    }
  };

  const openBrowserSettings = () => {
    toast.info(
      'Please go to your browser settings and enable microphone access for this site.'
    );

    // Provide browser-specific instructions
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) {
      toast.info('Chrome: Settings → Privacy and security → Site settings → Microphone');
    } else if (userAgent.includes('Firefox')) {
      toast.info('Firefox: Preferences → Privacy & Security → Permissions → Microphone');
    } else if (userAgent.includes('Safari')) {
      toast.info('Safari: Preferences → Websites → Microphone');
    } else if (userAgent.includes('Edge')) {
      toast.info('Edge: Settings → Privacy → App permissions → Microphone');
    }
  };

  if (!browserSupport.speechRecognition || !browserSupport.mediaDevices) {
    return (
      <Card className="w-full shadow-lg border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertCircle className="w-5 h-5" />
            Browser Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-red-800">
            Your browser does not support voice commands. Please use:
          </p>
          <ul className="text-sm text-red-800 list-disc list-inside space-y-1">
            <li>Google Chrome (version 25+)</li>
            <li>Microsoft Edge (version 79+)</li>
            <li>Safari (version 14.1+)</li>
            <li>Opera (version 27+)</li>
          </ul>
          <p className="text-xs text-red-700 mt-4">
            Note: Firefox has limited support for Web Speech API
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Permission Status Card */}
      <Card
        className={`w-full shadow-lg ${
          permissionStatus.status === 'granted'
            ? 'border-green-200 bg-green-50'
            : permissionStatus.status === 'denied'
              ? 'border-red-200 bg-red-50'
              : 'border-blue-200 bg-blue-50'
        }`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {permissionStatus.status === 'granted' && (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-900">Microphone Ready</span>
              </>
            )}
            {permissionStatus.status === 'denied' && (
              <>
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-900">Access Denied</span>
              </>
            )}
            {permissionStatus.status !== 'granted' &&
              permissionStatus.status !== 'denied' && (
                <>
                  <Mic className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-900">Microphone Permission</span>
                </>
              )}
          </CardTitle>
          <CardDescription
            className={
              permissionStatus.status === 'granted'
                ? 'text-green-700'
                : permissionStatus.status === 'denied'
                  ? 'text-red-700'
                  : 'text-blue-700'
            }
          >
            {permissionStatus.message}
          </CardDescription>
        </CardHeader>

        {permissionStatus.canRequest && (
          <CardContent className="space-y-3">
            <Button
              onClick={requestMicrophoneAccess}
              disabled={isRequesting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Mic className="w-4 h-4 mr-2" />
              {isRequesting ? 'Requesting...' : 'Request Microphone Access'}
            </Button>

            {permissionStatus.status === 'denied' && (
              <Button
                onClick={openBrowserSettings}
                variant="outline"
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                Open Browser Settings
              </Button>
            )}
          </CardContent>
        )}
      </Card>

      {/* Troubleshooting Guide */}
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm">Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <div>
            <p className="font-medium text-slate-900">No microphone detected?</p>
            <p className="text-slate-600">
              Ensure your microphone is connected and not in use by another application.
            </p>
          </div>

          <div>
            <p className="font-medium text-slate-900">Still not working?</p>
            <p className="text-slate-600">
              Try refreshing the page and requesting permission again. Some browsers require
              a fresh start.
            </p>
          </div>

          <div>
            <p className="font-medium text-slate-900">Privacy concerns?</p>
            <p className="text-slate-600">
              Your microphone is only accessed when you click "Start Listening". No audio is
              recorded or stored.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Feature Info */}
      <Card className="w-full shadow-lg bg-slate-50">
        <CardContent className="pt-6">
          <p className="text-sm text-slate-700">
            💡 <strong>Tip:</strong> Once permission is granted, you can use voice commands
            throughout the application. Your microphone access can be revoked anytime in
            browser settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
