# Screens

Screen components in `src/screens/`. This document describes each screen's purpose and features.

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
- Card deck tutorial using `CardDeck` component
- Progress bar showing completion
- Steps:
  1. Welcome/intro
  2. Cat name & photo upload
  3. Basic info (age, gender, breed, personality)
  4. Add another cat option
  5. Logging goals setup
  6. Daily tasks selection
  7. Weekly tasks selection
  8. Monthly tasks selection
  9. Reminder time picker
- Two-button navigation at bottom of each card
- Button labels adapt per step
- Saves selections to store as `userTasks`
- Initializes task reminder state
- Schedules notifications

**User Flow**: Sets `isOnboardingComplete = true` when finished

---

### TasksScreen
**Location**: `src/screens/TasksScreen.tsx`

**Purpose**: Daily task logging - core app feature

**Features**:
- Streak counter display (days in a row)
- Progress bar (tasks completed / total)
- Card deck interface for going through daily tasks
- Filters tasks based on what should appear today (daily/weekly/monthly)
- Two-button navigation at bottom of each card
- Input types:
  - **Boolean**: Yes/No buttons (uses deck buttons)
  - **Text**: Text input field
  - **Radio**: Single selection from options
  - **Scale**: Numeric scale with labels
  - **Choices**: Predefined choice options
  - **Date**: Date selection
  - **Object**: Complex nested fields (e.g., nail clipping paws)
- Button behavior:
  - For boolean-only tasks: "Yes" and "No" buttons
  - For other tasks: "Next"/"Submit" and "Skip" buttons
- Completion screen when all tasks done
- Increments streak when all tasks completed
- Marks tasks as shown and completed in reminder state

**Data Flow**:
- Reads `userTasks` from store
- Filters using `TaskReminderService.getTasksForToday()`
- Maps tasks to task definitions from `constants/tasks.ts`
- Updates local state for task values
- Calls `incrementStreak()` and `markTaskAsCompleted()` when completed

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

## Related Documentation

- [07-components.md](./07-components.md) - Components used by screens
- [04-navigation.md](./04-navigation.md) - Navigation flow
- [10-tasks-system.md](./10-tasks-system.md) - TasksScreen details

