import { trpc } from '@/lib/trpc';
import { useCallback, useState } from 'react';

/**
 * Custom hook for SMS and Responder Router tRPC integration
 * Provides type-safe access to all SMS and responder procedures
 */

export function useSmsResponderRouter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SMS Procedures
  const sendSMS = useCallback(
    async (phoneNumber: string, message: string, messageType: 'otp' | 'alert' | 'notification' | 'reminder', language = 'en', priority = 'normal') => {
      setLoading(true);
      setError(null);
      try {
        const result = await trpc.smsResponder.sendSMS.mutate({
          phoneNumber,
          message,
          messageType,
          language,
          priority: priority as 'low' | 'normal' | 'high' | 'critical',
        });
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send SMS';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const sendOTP = useCallback(
    async (phoneNumber: string, otp: string, language = 'en') => {
      setLoading(true);
      setError(null);
      try {
        const result = await trpc.smsResponder.sendOTP.mutate({
          phoneNumber,
          otp,
          language,
        });
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const sendEmergencyAlert = useCallback(
    async (phoneNumber: string, alertTitle: string, alertMessage: string, language = 'en') => {
      setLoading(true);
      setError(null);
      try {
        const result = await trpc.smsResponder.sendEmergencyAlert.mutate({
          phoneNumber,
          alertTitle,
          alertMessage,
          language,
        });
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send emergency alert';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getDeliveryStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await trpc.smsResponder.getDeliveryStats.query();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch delivery stats';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Responder Management Procedures
  const registerResponder = useCallback(
    async (name: string, role: 'coordinator' | 'operator' | 'medical' | 'security' | 'volunteer', phoneNumber: string, email: string, certifications: string[] = [], languages: string[] = ['en'], maxConcurrentCalls = 3) => {
      setLoading(true);
      setError(null);
      try {
        const result = await trpc.smsResponder.registerResponder.mutate({
          name,
          role,
          phoneNumber,
          email,
          certifications,
          languages,
          maxConcurrentCalls,
        });
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to register responder';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getResponder = useCallback(
    async (responderId: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await trpc.smsResponder.getResponder.query({ responderId });
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch responder';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getActiveResponders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await trpc.smsResponder.getActiveResponders.query();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch active responders';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateResponderStatus = useCallback(
    async (responderId: string, status: 'active' | 'inactive' | 'on-duty' | 'off-duty') => {
      setLoading(true);
      setError(null);
      try {
        const result = await trpc.smsResponder.updateResponderStatus.mutate({
          responderId,
          status,
        });
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update responder status';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getResponderStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await trpc.smsResponder.getResponderStats.query();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch responder stats';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // SOS Alert Procedures
  const createSOSAlert = useCallback(
    async (callerId: string, callerName: string, callerPhone: string, alertType: 'medical' | 'security' | 'mental-health' | 'other', description: string, severity: 'low' | 'medium' | 'high' | 'critical', location?: { latitude: number; longitude: number; address?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const result = await trpc.smsResponder.createSOSAlert.mutate({
          callerId,
          callerName,
          callerPhone,
          alertType,
          description,
          severity,
          location,
        });
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create SOS alert';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getSOSAlert = useCallback(
    async (alertId: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await trpc.smsResponder.getSOSAlert.query({ alertId });
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch SOS alert';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getActiveSOSAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await trpc.smsResponder.getActiveSOSAlerts.query();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch active SOS alerts';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignResponderToAlert = useCallback(
    async (alertId: string, responderId: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await trpc.smsResponder.assignResponderToAlert.mutate({
          alertId,
          responderId,
        });
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to assign responder';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const acknowledgeSOSAlert = useCallback(
    async (alertId: string, responderId: string, note: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await trpc.smsResponder.acknowledgeSOSAlert.mutate({
          alertId,
          responderId,
          note,
        });
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to acknowledge alert';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const resolveSOSAlert = useCallback(
    async (alertId: string, responderId: string, resolution: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await trpc.smsResponder.resolveSOSAlert.mutate({
          alertId,
          responderId,
          resolution,
        });
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to resolve alert';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getSOSAlertStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await trpc.smsResponder.getSOSAlertStats.query();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch SOS alert stats';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    loading,
    error,

    // SMS Procedures
    sendSMS,
    sendOTP,
    sendEmergencyAlert,
    getDeliveryStats,

    // Responder Management
    registerResponder,
    getResponder,
    getActiveResponders,
    updateResponderStatus,
    getResponderStats,

    // SOS Alerts
    createSOSAlert,
    getSOSAlert,
    getActiveSOSAlerts,
    assignResponderToAlert,
    acknowledgeSOSAlert,
    resolveSOSAlert,
    getSOSAlertStats,
  };
}
