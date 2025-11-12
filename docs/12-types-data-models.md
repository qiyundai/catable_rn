# Types & Data Models

All type definitions are in `src/types/index.ts`. This document explains the core data structures.

## User

```typescript
interface User {
  id: string;
  email: string;
  userName: string;
  region: string;
  language: 'en' | 'zh' | 'ja';
  isGuest: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Purpose**: Represents the app user (cat owner). Supports guest mode for temporary usage.

## Pet

```typescript
interface Pet {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  breed: string;
  ageMonths: number; // More precise than years for kittens
  gender: 'male' | 'female' | 'other';
  personality: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Purpose**: Represents a cat profile. Multiple pets per user are supported.

## Log

```typescript
interface Log {
  id: string;
  petId: string;
  logTypeId: string;
  value: string | number;
  notes?: string;
  loggedAt: Date;
  synced: boolean; // For offline sync
  createdAt: Date;
}
```

**Purpose**: Represents a single logged activity/measurement. The `synced` flag tracks whether it's been synced to the cloud (when backend is integrated).

## LogType

```typescript
interface LogType {
  id: string;
  name: string;
  category: 'daily' | 'recurring';
  inputType: 'numeric' | 'slider' | 'yesno' | 'text';
  unit?: string;
  options?: string[];
  isActive: boolean;
}
```

**Purpose**: Defines the type of data being logged. Categories:
- **Daily**: Tracked every day (water, feeding, activity)
- **Recurring**: Tracked on a schedule (grooming, vet visits)

Input types determine the UI component:
- `numeric`: Increment/decrement buttons (e.g., water ml)
- `slider`: Multiple choice options (e.g., poop consistency)
- `yesno`: Binary toggle (e.g., fed today?)
- `text`: Free-form notes

## Task

```typescript
interface Task {
  id: string;
  petId: string;
  logTypeId: string;
  title: string;
  description: string;
  isCompleted: boolean;
  dueDate: Date;
  completedAt?: Date;
}
```

**Purpose**: Represents a pending task (e.g., "Groom Fluffy today"). Generated from user's selected log types and reminder schedule.

## Streak

```typescript
interface Streak {
  id: string;
  petId: string;
  currentStreak: number;
  longestStreak: number;
  lastLoggedAt: Date;
  updatedAt: Date;
}
```

**Purpose**: Tracks consecutive days of logging. Resets if a day is missed. Stores both current and all-time longest streak.

## Achievement

```typescript
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
  xpReward: number;
}
```

**Purpose**: Gamification milestones (e.g., "7-Day Streak", "Perfect Week"). XP rewards can be used for future features.

## UserTasks

```typescript
interface UserTasks {
  daily: UserTask[];
  weekly: UserTask[];
  monthly: UserTask[];
  customTasks: { [key: string]: UserTask[] };
  reminderTime: {
    hour: number;
    minute: number;
    period: 'AM' | 'PM';
  };
}
```

**Purpose**: Stores user's selected tracking preferences from onboarding. Used to generate daily task cards.

## UserTask

```typescript
interface UserTask {
  id: string;
  name: string;
  icon: string;
  recurringCycle: 'daily' | 'weekly' | 'monthly';
  isCustom: boolean;
}
```

**Purpose**: Individual task selection from onboarding.

## TaskReminderState

```typescript
interface TaskReminderState {
  [taskId: string]: TaskCompletionRecord;
}

interface TaskCompletionRecord {
  taskId: string;
  lastCompleted?: Date;
  lastShown?: Date;
  cycleStartDate: Date;
}
```

**Purpose**: Tracks task completion and cycle state for reminder system.

## NotificationSettings

```typescript
interface NotificationSettings {
  id: string;
  petId: string;
  logTypeId: string;
  enabled: boolean;
  time: string; // HH:mm format
  days: number[]; // 0-6 for Sunday-Saturday
}
```

**Purpose**: Defines when reminders should be sent for specific log types.

## Navigation Types

```typescript
type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
  ManagePet: { petId?: string };
  PetProfile: { petId: string };
  Logging: { petId: string; logTypeId: string };
  Settings: undefined;
  Profile: undefined;
};

type MainTabParamList = {
  Tasks: undefined;
  Community: undefined;
  PetProfiles: undefined;
};
```

**Purpose**: Type-safe navigation parameters for React Navigation.

## Form Types

- `LoginForm`: Email + password
- `RegisterForm`: Username, email, password, confirmPassword
- `PetForm`: All fields for creating/editing a pet

## Database Schema

Tables map directly to these types:
- `users`, `pets`, `logs`, `tasks`, `streaks`
- Foreign key relationships: `pets.userId`, `logs.petId`, `tasks.petId`, `streaks.petId`
- Dates stored as ISO strings, converted to Date objects on retrieval

## Related Documentation

- [06-services.md](./06-services.md) - Services that use these types
- [05-state-management.md](./05-state-management.md) - Store types

