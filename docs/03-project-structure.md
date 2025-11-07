# Project Structure

## Directory Structure

```
catable/
├── src/
│   ├── assets/          # Images, icons, logos, animations
│   ├── components/      # Reusable UI components
│   ├── constants/       # Design tokens, constants, configuration
│   ├── locales/         # i18n translation files
│   ├── navigation/      # Navigation configuration
│   ├── screens/         # Screen components (route destinations)
│   ├── services/        # Business logic services
│   ├── store/           # Zustand state management
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── docs/                # Documentation (this folder)
├── context/             # Legacy documentation (to be removed)
├── App.tsx              # Root component
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Source Directory Details

### `src/assets/`
- **animations/**: Lottie animation files
- **icons/**: SVG icon files
- **logos/**: App logo files

### `src/components/`
Reusable UI components:
- `Button.tsx` - Standardized button
- `Card.tsx` - Generic card container
- `CardDeck.tsx` - Card deck with button navigation
- `Input.tsx` - Text input component
- `Logo.tsx` - App logo display
- `ProgressBar.tsx` - Progress indicator
- `TagSelector.tsx` - Multi-select tag picker
- `WheelPicker.tsx` - Multi-column picker
- `FloatingIsland.tsx` - Community screen island
- `TabBarIcon.tsx` - Tab bar icon component

### `src/constants/`
- `index.ts` - Design tokens, app config, onboarding steps
- `tasks.ts` - Task definitions and repository

### `src/locales/`
Translation files:
- `en.json` - English
- `zh.json` - Chinese
- `ja.json` - Japanese

### `src/navigation/`
- `AppNavigator.tsx` - Root navigation configuration

### `src/screens/`
Screen components:
- `AuthScreen.tsx` - Authentication
- `OnboardingScreen.tsx` - First-time setup
- `TasksScreen.tsx` - Daily task logging
- `PetProfilesScreen.tsx` - Pet list
- `PetProfileScreen.tsx` - Pet details
- `ManagePetScreen.tsx` - Create/edit pet
- `CommunityScreen.tsx` - Social/mini-game
- `SettingsScreen.tsx` - App settings
- `ProfileScreen.tsx` - User profile
- `LoggingScreen.tsx` - Detailed logging (unused)

### `src/services/`
Business logic services:
- `DatabaseService.ts` - SQLite operations
- `NotificationService.ts` - Notification scheduling
- `TaskReminderService.ts` - Task cycle logic

### `src/store/`
- `index.ts` - Zustand store with persistence

### `src/types/`
- `index.ts` - All TypeScript type definitions

### `src/utils/`
- `i18n.ts` - Internationalization setup

## File Naming Conventions

- **Components**: PascalCase (e.g., `CardDeck.tsx`)
- **Screens**: PascalCase with "Screen" suffix (e.g., `TasksScreen.tsx`)
- **Services**: PascalCase with "Service" suffix (e.g., `DatabaseService.ts`)
- **Types**: PascalCase (e.g., `index.ts` in types folder)
- **Constants**: UPPER_SNAKE_CASE (e.g., `COLORS`, `SPACING`)

## Import Patterns

### Absolute Imports
Use relative imports from `src/`:
```typescript
import { useAppStore } from '../store';
import { COLORS } from '../constants';
```

### Component Imports
```typescript
import CardDeck from '../components/CardDeck';
```

### Service Imports
```typescript
import DatabaseService from '../services/DatabaseService';
```

## Code Organization Principles

1. **Separation of Concerns**: Components, screens, services, and store are separate
2. **Single Responsibility**: Each file has one clear purpose
3. **Reusability**: Components are designed for reuse
4. **Type Safety**: All files use TypeScript
5. **Consistency**: Follow existing patterns and conventions

## Related Documentation

- [02-architecture.md](./02-architecture.md) - Architecture overview
- [07-components.md](./07-components.md) - Component details
- [08-screens.md](./08-screens.md) - Screen details

