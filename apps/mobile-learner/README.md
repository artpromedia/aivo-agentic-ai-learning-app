# Aivo Learner - Mobile App

React Native mobile application for neurodiverse learners.

## 📱 Overview

The Aivo Learner mobile app provides personalized learning experiences for children with IEPs, featuring:

- **Age-Based Themes**: K5 (5-10), MS (11-13), HS (14-18)
- **Accessibility First**: TTS, voice input, sensory-friendly UI
- **Offline Support**: Learn anywhere with WatermelonDB
- **Focus Monitoring**: Attention tracking with game breaks
- **Homework Helper**: Camera upload, OCR, AI assistance

## 🏗️ Tech Stack

- **Framework**: React Native 0.76+ (CLI, not Expo)
- **Language**: TypeScript 5.6+ (strict mode)
- **Navigation**: React Navigation 6
- **State Management**: Zustand
- **Server State**: TanStack Query
- **Styling**: NativeWind (Tailwind CSS)
- **UI Library**: React Native Paper
- **Offline Database**: WatermelonDB
- **Testing**: Jest + React Native Testing Library

## 📦 Installation

### Prerequisites

- Node.js 20+
- pnpm 10+
- Xcode 15+ (iOS)
- Android Studio (Android)
- CocoaPods (iOS)

### Install Dependencies

```bash
cd apps/mobile-learner
pnpm install
```

### iOS Setup

```bash
cd ios
pod install
cd ..
```

### Android Setup

Ensure Android SDK is configured in `local.properties`:

```
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

## 🚀 Development

### Run iOS

```bash
pnpm ios
# or specific device
pnpm ios --simulator="iPhone 15 Pro"
```

### Run Android

```bash
pnpm android
# or specific device
adb devices  # list devices
pnpm android --deviceId=DEVICE_ID
```

### Start Metro Bundler

```bash
pnpm start
```

### Clear Cache

```bash
pnpm clean:cache
```

## 🧪 Testing

### Run Tests

```bash
pnpm test
```

### Watch Mode

```bash
pnpm test:watch
```

### Coverage

```bash
pnpm test:coverage
```

## 📁 Project Structure

```
apps/mobile-learner/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation config
│   ├── services/        # API, storage services
│   ├── stores/          # Zustand stores
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Helper functions
│   ├── types/           # TypeScript types
│   ├── assets/          # Images, fonts
│   ├── theme/           # Design system
│   └── config/          # App config
├── android/             # Android native
├── ios/                 # iOS native
├── __tests__/          # Test files
└── App.tsx             # Root component
```

## 🎨 Theming

Three age-based themes with distinct color palettes:

```typescript
import {getTheme} from '@theme';

const theme = getTheme('K5');  // 'K5' | 'MS' | 'HS'
```

### K5 Theme (Ages 5-10)
- Primary: Pink (#FF6B9D)
- Playful, vibrant colors
- Larger UI elements

### MS Theme (Ages 11-13)
- Primary: Indigo (#6366F1)
- Cool, engaging colors
- Medium UI elements

### HS Theme (Ages 14-18)
- Primary: Sky Blue (#0EA5E9)
- Professional, modern colors
- Refined UI elements

## 🔌 API Integration

Configure API base URL in `.env`:

```env
API_BASE_URL=http://localhost:8000
```

Access via config:

```typescript
import config from '@config';

const apiUrl = config.api.baseUrl;
```

## 🌐 Offline Support

WatermelonDB provides offline-first functionality:

- Sync data when online
- Queue mutations for later sync
- Full CRUD operations offline
- Automatic conflict resolution

## ♿ Accessibility

Built with WCAG 2.1 Level AA compliance:

- **Text-to-Speech**: React Native TTS
- **Voice Input**: React Native Voice
- **Screen Reader**: Full VoiceOver/TalkBack support
- **High Contrast**: Accessible color palettes
- **Adjustable Text**: Font size scaling

## 🔒 Security

- Secure token storage with MMKV
- Encrypted AsyncStorage for sensitive data
- Certificate pinning (production)
- Biometric authentication support

## 📊 State Management

### Global State (Zustand)

```typescript
import {useAuthStore} from '@stores/authStore';

const {user, login, logout} = useAuthStore();
```

### Server State (TanStack Query)

```typescript
import {useQuery} from '@tanstack/react-query';

const {data, isLoading} = useQuery({
  queryKey: ['learner', id],
  queryFn: () => fetchLearner(id),
});
```

## 🛠️ Troubleshooting

### Metro Bundler Issues

```bash
pnpm clean:cache
```

### iOS Build Fails

```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Android Build Fails

```bash
cd android
./gradlew clean
cd ..
```

### Type Errors

```bash
pnpm type-check
```

## 📝 Code Style

### Linting

```bash
pnpm lint
pnpm lint:fix
```

### Formatting

Uses Prettier with ESLint integration. Auto-format on save recommended.

## 🚢 Building for Production

### iOS

```bash
cd ios
xcodebuild -workspace AivoLearner.xcworkspace \
  -scheme AivoLearner \
  -configuration Release \
  archive
```

### Android

```bash
cd android
./gradlew assembleRelease
```

## 📚 Documentation

- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [NativeWind](https://www.nativewind.dev/)
- [TanStack Query](https://tanstack.com/query)
- [Zustand](https://github.com/pmndrs/zustand)

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

## 📄 License

Copyright © 2025 Aivo Learning. All rights reserved.

## 🆘 Support

For issues or questions:
- GitHub Issues: [Create Issue](https://github.com/artpromedia/aivo-agentic-ai-learning-app/issues)
- Email: support@aivolearning.com

---

Built with ❤️ for neurodiverse learners
