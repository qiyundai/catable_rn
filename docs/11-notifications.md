# Notifications System

The notification system handles scheduling and managing push notifications for task reminders and other events.

## Overview

The notification system is designed to provide a **non-intrusive, user-friendly experience**:
- **One notification per day** (not one per task)
- Consolidated summary of all tasks
- User-configurable reminder time
- No notification spam

## NotificationService

**Location**: `src/services/NotificationService.ts`

Singleton service for all notification operations.

### Permission Management

```typescript
const hasPermission = await NotificationService.requestPermissions();
```

- Requests notification permissions on first use
- Android: Sets up notification channel with MAX importance
- iOS: Uses default system behavior
- Returns boolean indicating if permission granted

### Task Reminder Scheduling

**Schedule daily task reminder**:
```typescript
await NotificationService.scheduleTaskReminders(
  userTasks,
  reminderState,
  petName
);
```

**Behavior:**
- Converts user's reminder time (AM/PM) to 24-hour format
- Gets all tasks that should appear today
- Calculates total task count
- Schedules **ONE consolidated notification** per day
- Uses `DailyTriggerInput` for consistent daily scheduling

**Important:** This method schedules only a single notification, regardless of how many tasks or cats the user has. The notification provides a summary of all pending tasks.

**Reschedule reminders** (used when reminder time changes):
```typescript
await NotificationService.rescheduleTaskReminders(
  userTasks,
  reminderState,
  petName
);
```

**Behavior:**
- Cancels all existing task reminders (including `daily_task_reminder`)
- Schedules new consolidated reminder at updated time
- Prevents double notifications when changing reminder time

### Notification Types

**Daily Task Reminder** (Consolidated):
- Title: "Time to check on {petName}! 🐱"
- Body: "You have X tasks to complete today"
- Data: `{ type: 'daily_task_reminder' }`
- Frequency: Once per day at user's chosen time
- **Note**: This replaces individual per-task notifications to prevent spam

**Achievement Notifications**:
- Immediate notification when achievement unlocked
- Title: "🎉 {title}"
- Body: Description

**Streak Reminders**:
- Daily 8PM reminder if no activity logged
- Title: "Keep your streak alive! 🔥"
- Body: "{petName} has a {streakDays}-day streak!"

**Daily Summary**:
- Daily 9PM summary notification
- Title: "Daily Summary 📊"
- Body: "How did {petName} do today?"

**Vet Reminders**:
- One-time reminder 1 day before appointment
- Title: "Vet Appointment Reminder 🏥"
- Body: "{petName} has a vet appointment tomorrow!"

### Notification Configuration

**Handler Configuration**:
```typescript
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
```

**Android Channel**:
- Channel name: 'default'
- Importance: MAX
- Vibration pattern: [0, 250, 250, 250]
- Light color: '#FF6B6B'

### Event Handlers

**Notification Response** (user taps notification):
```typescript
NotificationService.addNotificationResponseListener((response) => {
  // Handle navigation, etc.
});
```

**Foreground Notifications**:
```typescript
NotificationService.addNotificationReceivedListener((notification) => {
  // Handle when app is in foreground
});
```

## Task Reminder Integration

### Onboarding Setup

When onboarding completes:
1. Request notification permissions
2. Initialize task reminder state
3. Schedule **ONE consolidated daily reminder** for all selected tasks
4. Use user's selected reminder time (hour, minute, AM/PM)

**Code Example** (from `OnboardingScreen.tsx`):
```typescript
const hasPermission = await NotificationService.requestPermissions();
if (hasPermission) {
  const petName = petForms[0]?.name || 'your cat';
  await NotificationService.scheduleTaskReminders(
    userTasks,
    reminderState,
    petName
  );
}
```

### Profile Screen Management

**Location**: `src/screens/ProfileScreen.tsx`

Users can manage their reminder time after onboarding:

1. Navigate to Profile screen
2. Tap on "Daily Reminder Time" in the "Notifications & Reminders" section
3. Use wheel picker to select new time
4. Save changes

**What happens when time is updated:**
```typescript
// Cancel all existing reminders
await NotificationService.cancelAllReminders();

// Update user tasks with new time
const updatedTasks = { ...userTasks, reminderTime: newTime };
setUserTasks(updatedTasks);

// Reschedule with new time
await NotificationService.rescheduleTaskReminders(
  updatedTasks,
  taskReminderState,
  petName
);
```

**Key Features:**
- ✅ Prevents double notifications
- ✅ Cancels old time before scheduling new time
- ✅ Provides user feedback with success/error alerts
- ✅ Shows current reminder time in readable format
- ✅ Only appears if user has configured tasks

### Daily Task Flow

1. TasksScreen filters tasks using `TaskReminderService.getTasksForToday()`
2. Tasks that should appear today are shown
3. When task is completed, reminder state is updated
4. Daily notification summarizes all pending tasks

### Notification Behavior

- **One notification per day**: Regardless of task count or cat count
- **Smart summary**: Shows total number of tasks to complete
- **Consistent timing**: Always at user's chosen time
- **No spam**: Eliminates multiple overlapping notifications

## Notification Management

### Canceling Notifications

```typescript
// Cancel specific reminder
await NotificationService.cancelReminder(notificationId);

// Cancel all reminders
await NotificationService.cancelAllReminders();
```

### Getting Scheduled Notifications

```typescript
const notifications = await NotificationService.getScheduledNotifications();
```

## Best Practices

1. **Request permissions early**: On onboarding completion
2. **Reschedule when needed**: After task completion or cycle changes
3. **Handle permission denial**: Gracefully degrade if permissions not granted
4. **Test notifications**: Use Expo's notification testing tools
5. **Clean up**: Cancel old notifications when rescheduling
6. **Single daily notification**: Always schedule one notification per day, not per task
7. **User control**: Allow users to manage reminder time in Profile screen

## Testing & Verification

### Verify Single Notification

Check scheduled notifications in debug mode:
```typescript
const notifications = await NotificationService.getScheduledNotifications();
console.log('Count:', notifications.length); // Should be 1
console.log('Notification:', notifications[0]);
```

**Expected Output:**
- Count: `1` (or `0` if no tasks configured)
- Type: `daily_task_reminder`
- Trigger: Daily at specified hour/minute

### Test Reminder Time Change

1. Complete onboarding with tasks
2. Go to Profile → Tap "Daily Reminder Time"
3. Change time (e.g., 9:00 AM to 2:00 PM)
4. Save changes
5. Check notifications again:
   ```typescript
   const notifications = await NotificationService.getScheduledNotifications();
   // Should still be 1 notification, but at new time
   ```

### Test Multiple Cats

1. Add multiple cats with tasks
2. Verify still only ONE notification scheduled
3. Notification message should reference first pet's name

### Manual Testing Checklist

- [ ] Complete onboarding and verify 1 notification is scheduled
- [ ] Change reminder time and verify old notification is cancelled
- [ ] Verify new notification is scheduled at updated time
- [ ] Add multiple cats and verify still only 1 notification
- [ ] Verify notification appears at correct time with correct message
- [ ] Test on both iOS and Android
- [ ] Test permission denial scenario

## Troubleshooting

### Multiple Notifications Showing

**Problem**: Multiple notifications at different times

**Solution**: 
```typescript
// Cancel all and reschedule
await NotificationService.cancelAllReminders();
await NotificationService.scheduleTaskReminders(userTasks, reminderState, petName);
```

### Notification Not Appearing

**Checks**:
1. Permissions granted? Check device settings
2. Notification scheduled? Use `getScheduledNotifications()`
3. Time in future? Check hour/minute values
4. Android channel configured? Check `requestPermissions()`

### Wrong Time

**Checks**:
1. AM/PM conversion correct?
2. Timezone issues? Use device local time
3. Check saved `userTasks.reminderTime` values

## Migration Notes

### v1.0 → v2.0 (Consolidated Notifications)

**Breaking Changes:**
- Old per-task notifications replaced with single daily notification
- Notification data type changed from `task_reminder` to `daily_task_reminder`
- No `taskId` in notification data (use type only)

**Migration Steps:**
1. Cancel all existing notifications on app update
2. Reschedule using new consolidated method
3. Update any notification response handlers to use new type

## Related Documentation

- [10-tasks-system.md](./10-tasks-system.md) - Task system that uses notifications
- [06-services.md](./06-services.md) - Service details
- [08-screens.md](./08-screens.md) - ProfileScreen reminder management UI

