# Qumus Mobile App Companion

## Overview

The Qumus Mobile App Companion provides native iOS and Android applications for on-the-go video monitoring, queue management, and real-time notifications.

## Features

### iOS App
- **Video Queue Monitoring** - Real-time status updates on video processing jobs
- **Push Notifications** - Instant alerts when videos complete or fail
- **Offline Mode** - View cached video metadata without internet connection
- **Quick Actions** - One-tap access to common operations (pause, cancel, download)
- **Dark Mode Support** - Native iOS dark mode integration
- **Siri Shortcuts** - Voice control for common tasks

### Android App
- **Material Design 3** - Modern Android UI with latest Material guidelines
- **Background Services** - Continuous monitoring even when app is closed
- **Widget Support** - Home screen widgets for queue status and recent videos
- **Notification Channels** - Customizable notification preferences
- **Adaptive Icons** - Dynamic icon support for Android 13+
- **Google Assistant Integration** - Voice commands via Google Assistant

## Architecture

### Shared Core
- **React Native** - Shared codebase for iOS and Android
- **Redux** - State management across mobile platforms
- **tRPC Client** - Type-safe API communication
- **SQLite** - Local data persistence

### Platform-Specific
- **iOS**: Swift interop for native APIs
- **Android**: Kotlin interop for native APIs

## Installation

### iOS
```bash
# Clone and install dependencies
git clone https://github.com/qumus/mobile-app-ios.git
cd mobile-app-ios
pod install

# Build and run
xcode-select --install
open Qumus.xcworkspace
```

### Android
```bash
# Clone and install dependencies
git clone https://github.com/qumus/mobile-app-android.git
cd mobile-app-android
./gradlew build

# Run on emulator or device
./gradlew installDebug
```

## API Integration

### Authentication
```swift
// iOS
import QumusSDK

let qumus = QumusClient(apiKey: "YOUR_API_KEY")
qumus.authenticate { result in
    switch result {
    case .success(let user):
        print("Authenticated as \(user.email)")
    case .failure(let error):
        print("Auth failed: \(error)")
    }
}
```

```kotlin
// Android
import com.qumus.sdk.QumusClient

val qumus = QumusClient(apiKey = "YOUR_API_KEY")
qumus.authenticate { result ->
    result.onSuccess { user ->
        Log.d("Qumus", "Authenticated as ${user.email}")
    }
    result.onFailure { error ->
        Log.e("Qumus", "Auth failed: $error")
    }
}
```

### Real-time Updates
```swift
// iOS
let subscription = qumus.subscribeToQueue { jobs in
    DispatchQueue.main.async {
        self.jobs = jobs
        self.tableView.reloadData()
    }
}
```

```kotlin
// Android
qumus.subscribeToQueue { jobs ->
    runOnUiThread {
        adapter.updateJobs(jobs)
    }
}
```

## Push Notifications

### Setup
1. Configure Firebase Cloud Messaging (FCM)
2. Register device token with Qumus backend
3. Enable notification permissions in app settings

### Notification Types
- `video.completed` - Video generation finished
- `video.failed` - Video generation failed
- `batch.completed` - Batch job finished
- `batch.failed` - Batch job failed
- `quota.exceeded` - Usage quota exceeded

## Offline Support

The mobile app automatically caches:
- Recent video metadata
- Queue status
- User preferences
- Completed videos (up to 500MB)

When offline, users can:
- View cached video information
- Browse completed videos
- Access offline-enabled features

When connection is restored, the app automatically syncs changes.

## Development

### Local Development
```bash
# Start dev server
npm run dev

# Run iOS simulator
npm run ios

# Run Android emulator
npm run android

# Run tests
npm run test:mobile
```

### Building for Release
```bash
# iOS
npm run build:ios:release

# Android
npm run build:android:release
```

## Distribution

### App Store (iOS)
- TestFlight beta: https://testflight.apple.com/join/qumus
- Production: Available on Apple App Store

### Google Play (Android)
- Beta: https://play.google.com/apps/testing/com.qumus.mobile
- Production: Available on Google Play Store

## Support

For mobile app issues:
- GitHub Issues: https://github.com/qumus/mobile-app/issues
- Email: mobile-support@qumus.io
- Discord: https://discord.gg/qumus

## Roadmap

### Q1 2026
- [ ] Offline video editing
- [ ] Advanced filtering and search
- [ ] Custom notifications

### Q2 2026
- [ ] Apple Watch companion app
- [ ] Wear OS integration
- [ ] Advanced analytics dashboard

### Q3 2026
- [ ] AR video preview
- [ ] Collaborative editing on mobile
- [ ] AI-powered recommendations
