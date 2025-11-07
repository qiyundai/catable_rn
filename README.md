# CAT-able 🐱

A mobile app for tracking your cat's health and daily activities, built with React Native and Expo.

## Features

- **Daily Health Tracking**: Log water intake, feeding, playtime, litter box usage, and more
- **Pet Profiles**: Manage multiple cats with detailed profiles
- **Streak System**: Gamify your pet care routine with daily streaks
- **Community**: Share your cat's activities in a fun mini-game environment
- **Offline-First**: Works without internet connection, syncs when available
- **Multi-language Support**: Available in English, Chinese, and Japanese
- **Smart Notifications**: Customizable reminders for daily tasks

## Tech Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack + Tabs)
- **State Management**: Zustand
- **Database**: Expo SQLite (offline-first)
- **Notifications**: Expo Notifications
- **Internationalization**: react-i18next
- **Forms**: React Hook Form + Zod validation
- **Animations**: React Native Reanimated

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

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

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
├── navigation/         # Navigation configuration
├── store/             # State management (Zustand)
├── services/          # Business logic and API services
├── types/             # TypeScript type definitions
├── constants/         # App constants and configuration
├── utils/             # Utility functions
├── locales/           # Internationalization files
└── assets/            # Images, fonts, and other assets
```

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) folder:

- **[Getting Started](./docs/01-getting-started.md)** - Setup and quick start
- **[Architecture](./docs/02-architecture.md)** - Tech stack and design decisions
- **[Project Structure](./docs/03-project-structure.md)** - File organization
- **[Navigation](./docs/04-navigation.md)** - Navigation flow and routing
- **[State Management](./docs/05-state-management.md)** - Zustand store patterns
- **[Services](./docs/06-services.md)** - Database, Notifications, Task Reminders
- **[Components](./docs/07-components.md)** - Reusable UI components
- **[Screens](./docs/08-screens.md)** - Screen components and features
- **[Styling & Design](./docs/09-styling-design.md)** - Design system and UI patterns
- **[Tasks System](./docs/10-tasks-system.md)** - Task definitions and reminder logic
- **[Notifications](./docs/11-notifications.md)** - Notification scheduling
- **[Types & Data Models](./docs/12-types-data-models.md)** - TypeScript types
- **[Constants & Config](./docs/13-constants-config.md)** - Configuration reference
- **[Internationalization](./docs/14-i18n.md)** - i18n setup and usage

See [docs/README.md](./docs/README.md) for the complete documentation index.

## Key Features Implementation

### Authentication Flow
- Simple SUSI (Sign Up/Sign In) with email/password
- Social login (Google, Facebook, Apple)
- Guest mode for quick access

### Onboarding
- 8-step tutorial carousel
- Pet profile setup
- Task selection and configuration
- Reminder time setup

### Daily Tasks
- Card-based logging interface
- Multiple input types (numeric, slider, yes/no)
- Progress tracking and streaks
- Offline data storage

### Community
- Floating island mini-game
- Pet avatars and interactions
- Message sharing system
- Island navigation

## Development

### Code Style
- TypeScript for type safety
- Functional components with hooks
- Modular component architecture
- Consistent naming conventions

### State Management
- Zustand for global state
- Local component state for UI
- AsyncStorage for persistence
- SQLite for offline data

### Testing
- Jest for unit testing
- React Testing Library for component testing
- Detox for E2E testing (planned)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with ❤️ for cat lovers everywhere
- Inspired by the need for better pet health tracking
- Community feedback and suggestions welcome
