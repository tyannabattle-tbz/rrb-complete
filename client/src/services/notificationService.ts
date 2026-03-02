import { toast } from "sonner";

export interface NotificationOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const notificationService = {
  // Quota alerts
  quotaAlert: (percentage: number, options?: NotificationOptions) => {
    if (percentage >= 90) {
      toast.error(`Critical: ${percentage}% of monthly quota used`, {
        duration: options?.duration || 5000,
        action: options?.action,
      });
    } else if (percentage >= 75) {
      toast.warning(`High: ${percentage}% of monthly quota used`, {
        duration: options?.duration || 4000,
        action: options?.action,
      });
    } else if (percentage >= 50) {
      toast.info(`Moderate: ${percentage}% of monthly quota used`, {
        duration: options?.duration || 3000,
        action: options?.action,
      });
    }
  },

  // Agent clone notifications
  agentCloned: (cloneName: string, options?: NotificationOptions) => {
    toast.success(`Agent cloned: ${cloneName}`, {
      duration: options?.duration || 3000,
      action: options?.action,
    });
  },

  // Collaboration invite notifications
  inviteReceived: (senderName: string, options?: NotificationOptions) => {
    toast.info(`${senderName} invited you to collaborate`, {
      duration: options?.duration || 4000,
      action: options?.action,
    });
  },

  inviteAccepted: (userName: string, options?: NotificationOptions) => {
    toast.success(`${userName} accepted your invite`, {
      duration: options?.duration || 3000,
      action: options?.action,
    });
  },

  // Session notifications
  sessionCreated: (sessionName: string, options?: NotificationOptions) => {
    toast.success(`Session created: ${sessionName}`, {
      duration: options?.duration || 2000,
      action: options?.action,
    });
  },

  sessionRenamed: (newName: string, options?: NotificationOptions) => {
    toast.success(`Session renamed to: ${newName}`, {
      duration: options?.duration || 2000,
      action: options?.action,
    });
  },

  sessionDeleted: (sessionName: string, options?: NotificationOptions) => {
    toast.info(`Session deleted: ${sessionName}`, {
      duration: options?.duration || 2000,
      action: options?.action,
    });
  },

  // Collaboration notifications
  userJoined: (userName: string, options?: NotificationOptions) => {
    toast.info(`${userName} joined the session`, {
      duration: options?.duration || 2000,
      action: options?.action,
    });
  },

  userLeft: (userName: string, options?: NotificationOptions) => {
    toast.info(`${userName} left the session`, {
      duration: options?.duration || 2000,
      action: options?.action,
    });
  },

  userTyping: (userName: string, options?: NotificationOptions) => {
    toast.info(`${userName} is typing...`, {
      duration: options?.duration || 1500,
      action: options?.action,
    });
  },

  // Error notifications
  error: (title: string, message?: string, options?: NotificationOptions) => {
    toast.error(message ? `${title}: ${message}` : title, {
      duration: options?.duration || 4000,
      action: options?.action,
    });
  },

  // Success notifications
  success: (title: string, message?: string, options?: NotificationOptions) => {
    toast.success(message ? `${title}: ${message}` : title, {
      duration: options?.duration || 2000,
      action: options?.action,
    });
  },

  // Info notifications
  info: (title: string, message?: string, options?: NotificationOptions) => {
    toast.info(message ? `${title}: ${message}` : title, {
      duration: options?.duration || 3000,
      action: options?.action,
    });
  },

  // Warning notifications
  warning: (title: string, message?: string, options?: NotificationOptions) => {
    toast.warning(message ? `${title}: ${message}` : title, {
      duration: options?.duration || 3000,
      action: options?.action,
    });
  },
};
