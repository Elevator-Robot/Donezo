# Converting Donezo to React Native for iOS App Store

## Prerequisites
- Mac computer (required for iOS development)
- Xcode installed
- Apple Developer Account ($99/year)
- Node.js and npm

## Step 1: Set up React Native Environment

```bash
# Install React Native CLI
npm install -g @react-native-community/cli

# Create new React Native project
npx react-native init DonezoApp --template react-native-template-typescript

# Navigate to project
cd DonezoApp
```

## Step 2: Install Required Dependencies

```bash
# Navigation
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context

# UI Components
npm install react-native-vector-icons
npm install react-native-linear-gradient
npm install react-native-reanimated
npm install react-native-gesture-handler

# Storage
npm install @react-native-async-storage/async-storage

# Notifications
npm install @react-native-community/push-notification-ios
npm install react-native-push-notification

# Icons
npm install react-native-svg
npm install react-native-svg-transformer
```

## Step 3: Project Structure

```
DonezoApp/
├── src/
│   ├── components/
│   │   ├── TaskItem.tsx
│   │   ├── ListItem.tsx
│   │   ├── AddTaskModal.tsx
│   │   └── AddListModal.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── TaskListScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── hooks/
│   │   ├── useTodos.ts
│   │   ├── useLists.ts
│   │   └── useTheme.ts
│   ├── utils/
│   │   ├── storage.ts
│   │   ├── notifications.ts
│   │   └── animations.ts
│   └── types/
│       └── index.ts
├── ios/
│   └── DonezoApp/
│       ├── Info.plist
│       ├── AppDelegate.m
│       └── LaunchScreen.storyboard
└── android/
```

## Step 4: Key Components to Convert

### 1. Task Management
- Convert HTML/CSS to React Native components
- Use AsyncStorage instead of localStorage
- Implement native animations with Reanimated

### 2. Theme System
- Use React Native's Appearance API
- Implement dark/light mode with native styling

### 3. Notifications
- Use React Native Push Notification
- Schedule local notifications for reminders

### 4. Animations
- Convert CSS animations to React Native Reanimated
- Implement gesture handling with React Native Gesture Handler

## Step 5: iOS Configuration

### App Icon
- Create app icons in various sizes (20x20 to 1024x1024)
- Add to Assets.xcassets in Xcode

### Launch Screen
- Design launch screen in Xcode
- Match your app's design

### Permissions
Add to Info.plist:
```xml
<key>NSUserNotificationUsageDescription</key>
<string>Donezo needs notifications to remind you of your tasks</string>
```

## Step 6: Build and Test

```bash
# Install iOS dependencies
cd ios && pod install && cd ..

# Run on iOS Simulator
npx react-native run-ios

# Run on device
npx react-native run-ios --device
```

## Step 7: App Store Preparation

### 1. App Store Connect Setup
- Create app in App Store Connect
- Fill in app metadata
- Upload screenshots and videos

### 2. Build for Distribution
```bash
# Archive the app
cd ios
xcodebuild -workspace DonezoApp.xcworkspace -scheme DonezoApp -configuration Release -destination generic/platform=iOS archive -archivePath DonezoApp.xcarchive

# Export for App Store
xcodebuild -exportArchive -archivePath DonezoApp.xcarchive -exportPath ./build -exportOptionsPlist exportOptions.plist
```

### 3. Upload to App Store Connect
- Use Xcode or Application Loader
- Submit for review

## Estimated Timeline
- **Week 1-2**: Environment setup and basic conversion
- **Week 3-4**: Core functionality implementation
- **Week 5-6**: Polish and testing
- **Week 7-8**: App Store submission and review

## Cost Breakdown
- Apple Developer Account: $99/year
- Development time: 6-8 weeks
- Optional: Design assets, marketing materials

## Alternative: Use Expo (Easier but Limited)

```bash
# Create Expo project
npx create-expo-app DonezoExpo --template blank-typescript

# Install dependencies
npx expo install expo-notifications expo-linear-gradient expo-haptics

# Build for iOS
npx expo build:ios
```

Expo is easier but has limitations on native features and customization.
