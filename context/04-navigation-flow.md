# Navigation & User Flow

## Navigation Architecture

The app uses a **Stack + Tabs** navigation pattern:
- **Root Stack**: Handles auth flow, onboarding, and modal screens
- **Main Tabs**: Primary app navigation (Tasks, Community, Pet Profiles)

## Navigation Structure

```
RootStackNavigator
├── Auth (if !isAuthenticated)
├── Onboarding (if authenticated && !isOnboardingComplete)
└── MainTabNavigator (if authenticated && isOnboardingComplete)
    ├── Tasks (default)
    ├── Community (floating button)
    └── PetProfiles
    Stack Screens (accessible from tabs):
    ├── ManagePet
    ├── PetProfile
    ├── Logging
    ├── Settings
    └── Profile
```

## Auth Flow

1. **AuthScreen**: First screen for unauthenticated users
   - Email/password login or signup
   - Social login (Google, Facebook, Apple) - stubbed
   - "Continue as Guest" option
   - Sets `isAuthenticated = true` in store

2. **OnboardingScreen**: Appears after auth (if not completed)
   - 8-step card-based tutorial
   - Sets `isOnboardingComplete = true` when finished

3. **MainTabNavigator**: Primary app interface (appears after onboarding)

## Main App Flow

### Tab Navigation

**Tasks Tab** (left, default):
- Daily task logging interface
- Card deck for going through selected tasks
- Streak counter and progress bar
- Swipe or tap to complete tasks

**PetProfiles Tab** (right):
- List of all pet profiles
- Add new pet button
- Tap pet to view/edit details

**Community Tab** (center, floating button):
- Floating island mini-game
- Pet avatars displayed on island
- Navigation to friend islands
- Message posting interface

### Stack Screens (accessible from anywhere)

**ProfileScreen**:
- User's own profile (cat owner, not pet)
- Accessible via header profile icon on all tabs
- Settings link

**SettingsScreen**:
- App preferences
- Pet management
- Units (kg/g, ml)
- Language selection
- Data export/clear

**ManagePetScreen**:
- Create or edit pet profile
- Name, avatar, breed, age, gender, personality

**PetProfileScreen**:
- View pet details
- History of logs
- Streak information

**LoggingScreen**:
- Detailed logging interface for specific log type
- Not currently used (tasks handled in TasksScreen)

## Custom Tab Bar

The tab bar is custom-designed:
- Two standard tabs (Tasks, PetProfiles) on edges
- Floating circular button in center (Community)
- Active state highlights with green background
- Community button hides when on Community screen

See `src/navigation/AppNavigator.tsx` for implementation.

## Active Screen Tracking

Uses React Context (`ActiveScreenContext`) to track which tab is active for styling purposes.

## Conditional Navigation

Navigation is conditionally rendered based on store state:
- `!isAuthenticated` → AuthScreen
- `!isOnboardingComplete` → OnboardingScreen
- Otherwise → MainTabNavigator

This is handled in `AppNavigator.tsx` using the Zustand store.

