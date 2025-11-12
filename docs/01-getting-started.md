# Getting Started

## What is CAT-able?

CAT-able is a mobile-first React Native application for tracking cat health and daily activities. The app helps cat owners maintain consistent logging habits through gamification, offline-first functionality, and an intuitive card-based interface.

## Core Value Proposition

- **Offline-First**: Works completely without network connection, syncs when available
- **Low-Friction Logging**: Quick, fun daily check-ins using swipeable cards
- **Gamification**: Streak tracking and achievements to maintain engagement
- **Multi-Pet Support**: Manage multiple cat profiles
- **Multi-Language**: Supports English, Chinese, and Japanese

## Target Users

Primary users are cat owners who want to:
- Track daily health metrics (feeding, water, activity, litter box)
- Monitor recurring care tasks (grooming, vet visits, medication)
- Maintain consistent care routines through streaks and reminders
- Share progress with veterinarians through generated reports

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

## Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd catable
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm start
   ```

4. Run on your preferred platform
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## Project Status

Currently in active development. The app includes:
- ✅ Authentication flow (email/social/guest)
- ✅ Onboarding tutorial (card-based flow)
- ✅ Daily task logging (card deck interface)
- ✅ Pet profile management
- ✅ Streak tracking
- ✅ Local database (SQLite) for offline-first
- ✅ Task reminder system with notifications
- ✅ Basic community screen structure
- ⏳ Backend API integration (stubbed)
- ⏳ Report generation and sharing

## Key Design Principles

1. **Mobile-First**: Designed for native mobile experience
2. **Offline Capable**: All core features work without internet
3. **Minimal Friction**: Simple, quick interactions (button-based navigation)
4. **Gamification**: Streaks, achievements, and progress tracking
5. **Accessibility**: Scalable text, VoiceOver support, color-contrast safe

## Next Steps

- Read [02-architecture.md](./02-architecture.md) to understand the tech stack
- Check [03-project-structure.md](./03-project-structure.md) to explore the codebase
- Review [04-navigation.md](./04-navigation.md) to understand user flows

