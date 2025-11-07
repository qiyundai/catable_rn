# Services

Business logic services in `src/services/`. These are singleton classes that abstract away implementation details.

## DatabaseService

**Location**: `src/services/DatabaseService.ts`

**Purpose**: All SQLite database operations

### Initialization
```typescript
await DatabaseService.init()
```
Creates database file and tables if they don't exist.

### Tables
- `users`: User accounts
- `pets`: Pet profiles
- `logs`: Activity logs
- `tasks`: Pending tasks
- `streaks`: Streak data

### Key Methods

**User Operations**:
- `saveUser(user: User)`: Save/update user
- `getUser(id: string)`: Retrieve user by ID

**Pet Operations**:
- `savePet(pet: Pet)`: Save/update pet
- `getPets(userId: string)`: Get all pets for user
- `deletePet(petId: string)`: Delete pet and all related data (cascading)

**Log Operations**:
- `saveLog(log: Log)`: Save log entry
- `getLogs(petId: string, limit?: number)`: Get logs for pet
- `getUnsyncedLogs()`: Get logs that haven't synced to cloud
- `markLogAsSynced(logId: string)`: Mark log as synced

**Task Operations**:
- `saveTask(task: Task)`: Save task
- `getTasks(petId: string)`: Get tasks for pet

**Streak Operations**:
- `saveStreak(streak: Streak)`: Save streak data
- `getStreak(petId: string)`: Get streak for pet

**Utility**:
- `clearAllData()`: Wipe all tables (for testing/reset)
- `close()`: Close database connection

### Data Conversion
- Dates stored as ISO strings, converted to Date objects on retrieval
- Booleans stored as integers (0/1), converted on retrieval

### Usage Pattern
```typescript
import DatabaseService from '../services/DatabaseService';

// Initialize on app start (in App.tsx or similar)
await DatabaseService.init();

// Use throughout app
await DatabaseService.savePet(newPet);
const pets = await DatabaseService.getPets(userId);
```

## NotificationService

**Location**: `src/services/NotificationService.ts`

**Purpose**: Local push notification scheduling and handling

### Initialization
Requires permission request before use:
```typescript
const hasPermission = await NotificationService.requestPermissions();
```

### Key Methods

**Permission**:
- `requestPermissions()`: Request notification permissions (returns boolean)

**Reminders**:
- `scheduleReminder(settings: NotificationSettings)`: Schedule recurring reminders
- `cancelReminder(notificationId: string)`: Cancel specific reminder
- `cancelAllReminders()`: Clear all scheduled notifications

**Task Reminders**:
- `scheduleTaskReminders(userTasks, reminderState, petName)`: Schedule reminders for all tasks
- `rescheduleTaskReminders(userTasks, reminderState, petName)`: Reschedule all task reminders

**Special Notifications**:
- `showAchievementNotification(title, description)`: Immediate achievement notification
- `scheduleStreakReminder(petName, streakDays)`: Daily 8PM reminder if no activity
- `scheduleDailySummary(petName)`: Daily 9PM summary notification
- `scheduleVetReminder(petName, appointmentDate)`: One-time vet appointment reminder

**Event Handlers**:
- `addNotificationResponseListener(listener)`: Handle notification tap
- `addNotificationReceivedListener(listener)`: Handle foreground notifications

### Notification Configuration
- Android: Uses notification channel 'default' with MAX importance
- iOS: Uses default system behavior
- Handler configured globally to show alerts and play sounds

### Usage Pattern
```typescript
import NotificationService from '../services/NotificationService';

// Request permissions on first use
await NotificationService.requestPermissions();

// Schedule task reminders
await NotificationService.scheduleTaskReminders(
  userTasks,
  reminderState,
  petName
);
```

## TaskReminderService

**Location**: `src/services/TaskReminderService.ts`

**Purpose**: Task cycle logic and reminder state management

### Key Methods

**Task Visibility**:
- `shouldShowTaskToday(task, reminderState, today)`: Determines if task should appear today
- `getTasksForToday(userTasks, reminderState)`: Get all tasks due today

**State Management**:
- `initializeReminderState(userTasks, today)`: Initialize state for all tasks
- `markTaskAsShown(taskId, reminderState, today)`: Mark task as shown
- `markTaskAsCompleted(taskId, reminderState, today)`: Mark task as completed

**Cycle Logic**:
- `getTaskCycle(taskId)`: Get cycle type (daily/weekly/monthly)
- `getNextReminderDate(task, reminderState, today)`: Calculate next reminder date

### Cycle Behavior
- **Daily**: Show every day
- **Weekly**: Show today, then 7 days later
- **Monthly**: Show today, then ~30 days later

### Usage Pattern
```typescript
import TaskReminderService from '../services/TaskReminderService';

// Get tasks for today
const tasksForToday = TaskReminderService.getTasksForToday(
  userTasks,
  reminderState
);

// Mark task as completed
const newState = TaskReminderService.markTaskAsCompleted(
  taskId,
  reminderState
);
```

## Service Patterns

### Singleton Pattern
All services export singleton instances:
```typescript
export default new DatabaseService();
export default new NotificationService();
export default new TaskReminderService();
```

Import and use directly, no need to instantiate.

### Error Handling
Services handle errors internally and log to console. Return null/empty arrays on failure rather than throwing.

### Async Operations
All service methods are async. Always use `await` when calling.

### Integration with Store
Services are typically called from:
1. Store actions (Zustand)
2. Screen components (on mount/user action)
3. Event handlers (notification taps)

The store manages state; services manage persistence/notifications.

## Related Documentation

- [05-state-management.md](./05-state-management.md) - Store that uses services
- [11-notifications.md](./11-notifications.md) - Notification system details
- [10-tasks-system.md](./10-tasks-system.md) - Task reminder system

