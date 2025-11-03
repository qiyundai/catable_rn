# Architecture & Tech Stack

## Technology Choices

### Core Framework
- **React Native**: Cross-platform mobile framework
- **Expo SDK 54**: Development platform and tooling
- **TypeScript**: Type safety throughout the codebase

### State Management
- **Zustand**: Lightweight state management with persistence
- **AsyncStorage**: Persistence layer for Zustand state
- **React Query** (in dependencies, not yet integrated): Planned for server state

### Navigation
- **@react-navigation/native**: Core navigation library
- **@react-navigation/stack**: Stack navigation for auth/onboarding flow
- **@react-navigation/bottom-tabs**: Tab navigation for main app

### Database
- **expo-sqlite**: Local SQLite database for offline-first data storage
- Database service pattern: `DatabaseService` singleton for all DB operations

### Forms & Validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form resolvers
- **zod**: Schema validation

### Internationalization
- **react-i18next**: i18n framework
- **expo-localization**: Device locale detection
- Language files: `src/locales/{en,zh,ja}.json`

### UI & Styling
- **StyleSheet API**: Native styling (not Tailwind)
- Design tokens: Centralized in `src/constants/index.ts`
- Custom fonts: LobsterTwo (headings), Roboto (body)

### Animations
- **react-native-reanimated**: Native animations (for CardDeck swipe gestures)

### Notifications
- **expo-notifications**: Local push notifications for reminders

### Lists & Performance
- **@shopify/flash-list**: High-performance list rendering (planned)

### Charts & Visualization
- **react-native-svg**: SVG rendering for charts (planned)

## Project Structure

```
src/
├── assets/          # Images, icons, logos, animations
├── components/      # Reusable UI components
├── constants/       # Design tokens, constants, configuration
├── locales/         # i18n translation files
├── navigation/      # Navigation configuration
├── screens/         # Screen components (route destinations)
├── services/        # Business logic services (Database, Notifications)
├── store/           # Zustand state management
├── types/           # TypeScript type definitions
└── utils/           # Utility functions (i18n setup, helpers)
```

## Architecture Patterns

### Service Layer Pattern
Business logic is abstracted into service classes:
- `DatabaseService`: All SQLite operations
- `NotificationService`: All notification scheduling/handling

### Store Pattern
Global state managed through Zustand store (`src/store/index.ts`):
- User session state
- Pet profiles
- Logs and tasks
- Streaks and achievements
- App-level flags (onboarding, auth)

### Component Composition
- Reusable components in `src/components/`
- Screen components compose smaller components
- Props-driven customization

## Key Design Decisions

1. **Offline-First**: SQLite as primary data store, with sync flags for eventual cloud sync
2. **Type Safety**: Strict TypeScript with comprehensive type definitions
3. **No External CSS**: Using StyleSheet API for consistent native performance
4. **Service Singletons**: Database and Notification services are singleton instances
5. **Persistence Strategy**: Zustand persists to AsyncStorage, SQLite stores raw data

