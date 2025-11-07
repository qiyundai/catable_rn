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
- **react-native-reanimated**: Native animations (for CardDeck animations)

### Notifications
- **expo-notifications**: Local push notifications for reminders

### Lists & Performance
- **@shopify/flash-list**: High-performance list rendering (planned)

### Charts & Visualization
- **react-native-svg**: SVG rendering for charts (planned)

## Architecture Patterns

### Service Layer Pattern
Business logic is abstracted into service classes:
- `DatabaseService`: All SQLite operations
- `NotificationService`: All notification scheduling/handling
- `TaskReminderService`: Task cycle logic and reminder state management

### Store Pattern
Global state managed through Zustand store (`src/store/index.ts`):
- User session state
- Pet profiles
- Logs and tasks
- Streaks and achievements
- Task reminder state
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
6. **Button-Based Navigation**: Card decks use buttons instead of swipe gestures for accessibility

## Data Flow

```
User Action → Component → Store Action → Service → Database/Notifications
                ↓
            UI Update (immediate)
                ↓
         Persistence (async)
```

## State Management Strategy

- **Global State (Zustand)**: User data, pets, tasks, streaks, app flags
- **Local State (useState)**: Form inputs, UI toggles, temporary state
- **Persistence**: Zustand → AsyncStorage, Services → SQLite

## Service Integration

Services are called from:
1. Store actions (Zustand)
2. Screen components (on mount/user action)
3. Event handlers (notification taps)

The store manages state; services manage persistence/notifications.

## Related Documentation

- [05-state-management.md](./05-state-management.md) - Detailed store documentation
- [06-services.md](./06-services.md) - Service implementations
- [03-project-structure.md](./03-project-structure.md) - File organization

