import { ExpoConfig, ConfigContext } from 'expo/config';

const config: ExpoConfig = {
  name: 'QUMUS',
  slug: 'qumus-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTabletMode: true,
    bundleIdentifier: 'com.qumus.app',
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'QUMUS needs access to your location for GPS mapping and emergency broadcasts.',
      NSMicrophoneUsageDescription:
        'QUMUS needs microphone access for voice calls and audio streaming.',
      NSCameraUsageDescription:
        'QUMUS needs camera access for video streaming and emergency broadcasts.',
      NSLocalNetworkUsageDescription:
        'QUMUS needs local network access for mesh networking.',
      NSBonjourServiceTypes: ['_qumus._tcp', '_http._tcp'],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.qumus.app',
    permissions: [
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.RECORD_AUDIO',
      'android.permission.CAMERA',
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.CHANGE_NETWORK_STATE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.VIBRATE',
      'android.permission.POST_NOTIFICATIONS',
    ],
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow QUMUS to access your location for GPS mapping.',
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission:
          'Allow QUMUS to access your camera for video streaming.',
        microphonePermission:
          'Allow QUMUS to access your microphone for audio.',
        recordAudioAndroid: true,
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#0066FF',
      },
    ],
  ],
  extra: {
    eas: {
      projectId: 'qumus-mobile',
    },
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.qumus.app',
    webSocketUrl: process.env.EXPO_PUBLIC_WS_URL || 'wss://ws.qumus.app',
  },
  scheme: 'qumus',
  deepLinking: {
    enabled: true,
    prefixes: ['qumus://', 'https://qumus.app'],
    config: {
      screens: {
        Home: '',
        Chat: 'chat',
        GPS: 'gps',
        HybridCast: 'hybridcast',
        Broadcasts: 'broadcasts/:id',
        Settings: 'settings',
      },
    },
  },
  notification: {
    icon: './assets/notification-icon.png',
    color: '#0066FF',
    sounds: ['./assets/notification-sound.wav'],
  },
};

export default config;
