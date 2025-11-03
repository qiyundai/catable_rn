# Features & Screens

## Core Screens

### AuthScreen
**Location**: `src/screens/AuthScreen.tsx`

**Purpose**: User authentication and registration

**Features**:
- Email/password login form
- Registration form (username, email, password, confirm password)
- Social login buttons (Google, Facebook, Apple) - UI only, backend stubbed
- "Continue as Guest" link
- Back button to exit auth flow

**User Flow**: Sets `isAuthenticated = true` in store on successful auth/guest selection

---

### OnboardingScreen
**Location**: `src/screens/OnboardingScreen.tsx`

**Purpose**: First-time user tutorial and setup

**Features**:
- 8-step card deck tutorial using `CardDeck` component
- Progress bar showing completion
- Steps:
  1. Welcome/intro
  2. Cat name & photo upload
  3. Basic info (age, gender, breed, personality)
  4. Add another cat option
  5. Logging goals setup
  6. Daily tasks selection
  7. Recurring tasks selection (weekly/monthly)
  8. Reminder time picker
- Skip and Next buttons on each card
- Saves selections to store as `userTasks`

**User Flow**: Sets `isOnboardingComplete = true` when finished

---

### TasksScreen
**Location**: `src/screens/TasksScreen.tsx`

**Purpose**: Daily task logging - core app feature

**Features**:
- Streak counter display (days in a row)
- Progress bar (tasks completed / total)
- Card deck interface for going through daily tasks
- Input types:
  - **Numeric**: +/- buttons (e.g., water intake)
  - **Slider**: Multiple choice buttons (e.g., poop consistency, activity level)
  - **Yes/No**: Binary toggle buttons
- Swipe gestures: right to complete, left to skip
- Completion screen when all tasks done
- Increments streak when all tasks completed

**Data Flow**:
- Reads `userTasks.daily` from store
- Maps tasks to card format with input configurations
- Updates local state for task values
- Calls `incrementStreak()` when completed

---

### PetProfilesScreen
**Location**: `src/screens/PetProfilesScreen.tsx`

**Purpose**: List and manage pet profiles

**Features**:
- Grid/list of all pet profile cards
- Each card shows: name, avatar, basic info
- "Add Pet" button (navigates to ManagePet)
- Tap pet to view/edit (PetProfileScreen)
- Swipe actions for deletion (planned)

---

### PetProfileScreen
**Location**: `src/screens/PetProfileScreen.tsx`

**Purpose**: View detailed pet information

**Features**:
- Pet details: name, avatar, breed, age, gender, personality
- Edit button (navigates to ManagePet)
- Log history (last 7/30 days)
- Streak information
- Chart visualizations (planned)

---

### ManagePetScreen
**Location**: `src/screens/ManagePetScreen.tsx`

**Purpose**: Create or edit pet profile

**Features**:
- Form fields: name, avatar (image picker), breed, age (months), gender, personality
- Validation using react-hook-form + Zod
- Save button saves to store and database
- Delete button (for existing pets)

---

### CommunityScreen
**Location**: `src/screens/CommunityScreen.tsx`

**Purpose**: Social/mini-game interface

**Features**:
- Floating island visualization (uses `FloatingIsland` component)
- Pet avatars displayed on island
- Left/right navigation to friend islands (stubbed)
- Message input at bottom (expanded from paper plane icon)
- Message bubbles on island when posted

**Status**: UI mostly complete, social features stubbed

---

### SettingsScreen
**Location**: `src/screens/SettingsScreen.tsx`

**Purpose**: App settings and preferences

**Features**:
- Units selection (kg/g, ml)
- 12/24 hour time format
- Language selection (en, zh, ja)
- Notification settings
- Data export (CSV) - stubbed
- Clear cache option
- Sign out button

---

### ProfileScreen
**Location**: `src/screens/ProfileScreen.tsx`

**Purpose**: User (owner) profile

**Features**:
- Display name
- Email
- Region
- Language preference
- Link to Settings
- Pet count
- Total streak across all pets

---

### LoggingScreen
**Location**: `src/screens/LoggingScreen.tsx`

**Purpose**: Detailed logging interface for specific log type

**Features**:
- Logging form for specific log type
- Input appropriate to log type (numeric, slider, yes/no, text)
- Notes field
- Save to database

**Status**: Not currently used in main flow (tasks handled in TasksScreen)

---

## Common Patterns

All screens:
- Use design tokens from `src/constants` (COLORS, TYPOGRAPHY, SPACING)
- Import from Zustand store for data
- Use navigation hooks for routing
- Follow consistent styling patterns

## Screen State Management

- **Local State**: UI state (form values, toggles, animations) managed with `useState`
- **Global State**: User data, pets, logs, tasks managed in Zustand store
- **Persistence**: Zustand persists to AsyncStorage, DatabaseService persists to SQLite

