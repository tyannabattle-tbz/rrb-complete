import { notifyOwner } from "../_core/notification";

export interface EmailNotification {
  to: string;
  subject: string;
  template: "collaboration" | "session_update" | "agent_renamed" | "usage_alert";
  data: Record<string, any>;
}

export class EmailNotificationService {
  static async sendCollaborationNotification(
    userEmail: string,
    collaboratorName: string,
    sessionName: string
  ) {
    try {
      await notifyOwner({
        title: "New Collaborator",
        content: `${collaboratorName} joined your session "${sessionName}"`,
      });
      console.log(`[Email] Collaboration notification sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error("[Email] Failed to send collaboration notification:", error);
      return false;
    }
  }

  static async sendSessionUpdateNotification(
    userEmail: string,
    sessionName: string,
    updateType: string
  ) {
    try {
      await notifyOwner({
        title: "Session Updated",
        content: `Your session "${sessionName}" was ${updateType}`,
      });
      console.log(`[Email] Session update notification sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error("[Email] Failed to send session update notification:", error);
      return false;
    }
  }

  static async sendAgentRenamedNotification(
    userEmail: string,
    oldName: string,
    newName: string
  ) {
    try {
      await notifyOwner({
        title: "Agent Renamed",
        content: `Your agent "${oldName}" has been renamed to "${newName}"`,
      });
      console.log(`[Email] Agent renamed notification sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error("[Email] Failed to send agent renamed notification:", error);
      return false;
    }
  }

  static async sendUsageAlertNotification(
    userEmail: string,
    tokensUsed: number,
    tokensLimit: number,
    percentageUsed: number
  ) {
    try {
      await notifyOwner({
        title: "Usage Alert",
        content: `You've used ${percentageUsed}% of your monthly token limit (${tokensUsed}/${tokensLimit} tokens)`,
      });
      console.log(`[Email] Usage alert notification sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error("[Email] Failed to send usage alert notification:", error);
      return false;
    }
  }

  static async sendBatchNotifications(notifications: EmailNotification[]) {
    const results = await Promise.all(
      notifications.map((notif) => this.sendNotification(notif))
    );
    return results.filter((result) => result).length;
  }

  private static async sendNotification(notification: EmailNotification) {
    try {
      switch (notification.template) {
        case "collaboration":
          return await this.sendCollaborationNotification(
            notification.to,
            notification.data.collaboratorName,
            notification.data.sessionName
          );
        case "session_update":
          return await this.sendSessionUpdateNotification(
            notification.to,
            notification.data.sessionName,
            notification.data.updateType
          );
        case "agent_renamed":
          return await this.sendAgentRenamedNotification(
            notification.to,
            notification.data.oldName,
            notification.data.newName
          );
        case "usage_alert":
          return await this.sendUsageAlertNotification(
            notification.to,
            notification.data.tokensUsed,
            notification.data.tokensLimit,
            notification.data.percentageUsed
          );
        default:
          return false;
      }
    } catch (error) {
      console.error("[Email] Error sending notification:", error);
      return false;
    }
  }
}
