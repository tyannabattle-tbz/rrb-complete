import { Capacitor, Plugins } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';

export class CapacitorService {
  static isNative = Capacitor.isNativePlatform();
  static platform = Capacitor.getPlatform();

  /**
   * Initialize push notifications for native app
   */
  static async initializePushNotifications() {
    if (!this.isNative) return;

    try {
      // Request permission
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive === 'granted') {
        // Register with push service
        await PushNotifications.register();

        // Listen for push notifications
        PushNotifications.addListener('pushNotificationReceived', notification => {
          console.log('Push notification received:', notification);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', notification => {
          console.log('Push notification action performed:', notification);
        });

        console.log('Push notifications initialized');
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  }

  /**
   * Send local notification
   */
  static async sendLocalNotification(
    title: string,
    body: string,
    id: number = 1,
    delayMs: number = 0
  ) {
    if (!this.isNative) return;

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id,
            schedule: { at: new Date(Date.now() + delayMs) },
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#488AFF',
          },
        ],
      });
    } catch (error) {
      console.error('Failed to send local notification:', error);
    }
  }

  /**
   * Get current geolocation
   */
  static async getCurrentLocation() {
    if (!this.isNative) return null;

    try {
      const coordinates = await Geolocation.getCurrentPosition();
      return coordinates;
    } catch (error) {
      console.error('Failed to get location:', error);
      return null;
    }
  }

  /**
   * Take a photo using native camera
   */
  static async takePhoto() {
    if (!this.isNative) return null;

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: 'uri',
      });
      return image;
    } catch (error) {
      console.error('Failed to take photo:', error);
      return null;
    }
  }

  /**
   * Save file to device storage
   */
  static async saveFile(path: string, data: string, fileName: string) {
    if (!this.isNative) return null;

    try {
      const result = await Filesystem.writeFile({
        path: `${path}/${fileName}`,
        data,
        directory: 'Documents',
        encoding: 'utf8',
      });
      return result;
    } catch (error) {
      console.error('Failed to save file:', error);
      return null;
    }
  }

  /**
   * Read file from device storage
   */
  static async readFile(path: string, fileName: string) {
    if (!this.isNative) return null;

    try {
      const result = await Filesystem.readFile({
        path: `${path}/${fileName}`,
        directory: 'Documents',
        encoding: 'utf8',
      });
      return result;
    } catch (error) {
      console.error('Failed to read file:', error);
      return null;
    }
  }

  /**
   * Get app version
   */
  static async getAppVersion() {
    if (!this.isNative) return null;

    try {
      const { version } = await (window as any).cordova.getAppVersion;
      return version;
    } catch (error) {
      console.error('Failed to get app version:', error);
      return null;
    }
  }

  /**
   * Check if app is running in native environment
   */
  static isRunningNative(): boolean {
    return this.isNative;
  }

  /**
   * Get platform information
   */
  static getPlatformInfo() {
    return {
      isNative: this.isNative,
      platform: this.platform,
      isIOS: this.platform === 'ios',
      isAndroid: this.platform === 'android',
      isWeb: this.platform === 'web',
    };
  }

  /**
   * Initialize all native features
   */
  static async initializeAll() {
    if (!this.isNative) {
      console.log('Running in web environment, skipping native initialization');
      return;
    }

    console.log(`Initializing native features for ${this.platform}`);
    
    try {
      await this.initializePushNotifications();
      console.log('All native features initialized successfully');
    } catch (error) {
      console.error('Error initializing native features:', error);
    }
  }
}
