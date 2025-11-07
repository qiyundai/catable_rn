# Tasks System

The task system handles task definitions, reminder cycles, and daily task logging.

## Task Repository

**Location**: `src/constants/tasks.ts`

Contains all MVP task definitions with their fields, question templates, and metadata.

### Task Structure

```typescript
interface TaskDefinition {
  id: string;
  title: string;
  question: string; // Supports {catName} placeholder
  fields: TaskField[];
  tags: string[];
  recurringCycle?: 'daily' | 'weekly' | 'monthly';
  icon?: string;
}
```

### Field Types

Tasks can have multiple fields of different types:

- **boolean**: Yes/No questions
- **text**: Free-form text input
- **radio**: Single selection from options
- **scale**: Numeric scale with optional labels
- **choices**: Predefined choice options
- **date**: Date selection
- **object**: Complex nested fields (e.g., nail clipping paws)

### Supported Tasks

All 11 MVP tasks are defined:
1. `food` - Food type and brand (radio + text)
2. `teeth-brushed` - Teeth brushing (boolean)
3. `playtime` - Playtime activeness (scale)
4. `poop` - Poop tracking (boolean + scale)
5. `pee-frequency` - Pee frequency (choices)
6. `groomed` - Grooming (boolean)
7. `nail-clipping` - Nail clipping (date + object)
8. `flea-treatment` - Flea treatment (date)
9. `deworming` - Deworming (date)
10. `vet-checkup` - Vet check-up (date)
11. `sleeping-resp-rate` - Breathing rate (choices)

### Backward Compatibility

Old task IDs are mapped to new ones:
- `feed` → `food`
- `peeing_frequency` → `pee-frequency`
- `poop_consistency` → `poop`
- `activity` → `playtime`
- etc.

## Task Reminder Service

**Location**: `src/services/TaskReminderService.ts`

Manages task cycles and determines which tasks should appear today.

### Cycle Logic

- **Daily**: Show every day
- **Weekly**: Show today, then 7 days later
- **Monthly**: Show today, then ~30 days later

### Key Methods

- `shouldShowTaskToday(task, reminderState, today)`: Determines if task should appear
- `getTasksForToday(userTasks, reminderState)`: Get all tasks due today
- `initializeReminderState(userTasks, today)`: Initialize state for all tasks
- `markTaskAsShown(taskId, reminderState, today)`: Mark task as shown
- `markTaskAsCompleted(taskId, reminderState, today)`: Mark task as completed

### Reminder State

Tracks for each task:
- `lastCompleted`: When task was last completed
- `lastShown`: When task was last shown
- `cycleStartDate`: When the cycle started

## TasksScreen Integration

**Location**: `src/screens/TasksScreen.tsx`

### Task Filtering

TasksScreen filters tasks based on what should appear today:
1. Gets all user tasks from store
2. Uses `TaskReminderService.getTasksForToday()` to filter
3. Combines daily, weekly, and monthly tasks that are due
4. Converts to task definitions
5. Marks tasks as shown when displayed

### Task Completion

When a task is completed:
1. Task values are saved
2. Task is marked as completed in reminder state
3. Streak is incremented (if all tasks done)
4. Next task appears (or completion screen)

### Input Rendering

TasksScreen renders appropriate inputs based on field types:
- Boolean fields in multi-field tasks: Yes/No buttons
- Text fields: TextInput
- Radio/Choices: Selectable option buttons
- Scale: Numeric scale buttons
- Date: Date picker (MVP: sets to today)
- Object: Toggle buttons for nested fields

## Onboarding Integration

**Location**: `src/screens/OnboardingScreen.tsx`

On completion:
1. Saves user's selected tasks to store
2. Initializes task reminder state
3. Schedules notifications for all tasks
4. Uses user's selected reminder time

## Notification Integration

**Location**: `src/services/NotificationService.ts`

Schedules reminders based on task cycles:
- Daily tasks: Recurring daily at user's reminder time
- Weekly tasks: Recurring weekly on same weekday
- Monthly tasks: Scheduled for next month

## Related Documentation

- [11-notifications.md](./11-notifications.md) - Notification system
- [05-state-management.md](./05-state-management.md) - Task reminder state in store
- [08-screens.md](./08-screens.md) - TasksScreen details

