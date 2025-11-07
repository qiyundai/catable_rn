# Notifications System

The notification system handles scheduling and managing push notifications for task reminders and other events.

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

**Schedule all task reminders**:
```typescript
await NotificationService.scheduleTaskReminders(
  userTasks,
  reminderState,
  petName
);
```

- Converts user's reminder time (AM/PM) to 24-hour format
- Gets tasks that should appear today
- Schedules notifications based on cycle:
  - **Daily**: Recurring daily at specified time
  - **Weekly**: Recurring weekly on same weekday
  - **Monthly**: Scheduled for next month (Expo limitation)

**Reschedule reminders**:
```typescript
await NotificationService.rescheduleTaskReminders(
  userTasks,
  reminderState,
  petName
);
```

- Cancels all existing task reminders
- Schedules new reminders based on current state

### Notification Types

**Task Reminders**:
- Title: "Time to log: {task name} 🐱"
- Body: "Don't forget to log {petName}'s {task name}"
- Data: `{ taskId, type: 'task_reminder' }`

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
3. Schedule reminders for all selected tasks
4. Use user's selected reminder time

### Daily Task Flow

1. TasksScreen filters tasks using `TaskReminderService.getTasksForToday()`
2. Tasks that should appear today are shown
3. When task is completed, reminder state is updated
4. Notifications are rescheduled if needed

### Cycle Behavior

- **Daily tasks**: Notification every day at reminder time
- **Weekly tasks**: Notification on same weekday each week
- **Monthly tasks**: Notification scheduled for next month (one-time, needs rescheduling)

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

## Related Documentation

- [10-tasks-system.md](./10-tasks-system.md) - Task system that uses notifications
- [06-services.md](./06-services.md) - Service details

