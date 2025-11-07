import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationSettings, UserTasks } from '../types';
import { TaskReminderState } from './TaskReminderService';
import TaskReminderService from './TaskReminderService';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B6B',
      });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  async scheduleReminder(settings: NotificationSettings): Promise<string> {
    const { petId, logTypeId, time, days } = settings;
    
    // Parse time (format: "HH:mm")
    const [hours, minutes] = time.split(':').map(Number);
    
    // Create notification content
    const content = {
      title: 'Time to log! 🐱',
      body: `Don't forget to log your cat's ${logTypeId.replace('_', ' ')} activity`,
      data: { petId, logTypeId },
    };

    // Schedule for each selected day
    const notificationIds: string[] = [];
    
    for (const day of days) {
      const trigger: Notifications.WeeklyTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: day + 1, // Convert 0-6 to 1-7 (Sunday = 1)
        hour: hours,
        minute: minutes,
      };

      const id = await Notifications.scheduleNotificationAsync({
        content,
        trigger,
      });
      
      notificationIds.push(id);
    }

    return notificationIds.join(',');
  }

  async cancelReminder(notificationId: string): Promise<void> {
    if (notificationId.includes(',')) {
      // Multiple notifications
      const ids = notificationId.split(',');
      await Notifications.cancelScheduledNotificationAsync(ids[0]);
      for (let i = 1; i < ids.length; i++) {
        await Notifications.cancelScheduledNotificationAsync(ids[i]);
      }
    } else {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    }
  }

  async cancelAllReminders(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Achievement notifications
  async showAchievementNotification(title: string, description: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🎉 ${title}`,
        body: description,
        data: { type: 'achievement' },
      },
      trigger: null, // Show immediately
    });
  }

  // Streak reminder
  async scheduleStreakReminder(petName: string, streakDays: number): Promise<string> {
    const content = {
      title: 'Keep your streak alive! 🔥',
      body: `${petName} has a ${streakDays}-day streak! Don't break it today.`,
      data: { type: 'streak_reminder' },
    };

    // Schedule for 8 PM if no activity logged
    const trigger: Notifications.DailyTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    };

    return await Notifications.scheduleNotificationAsync({
      content,
      trigger,
    });
  }

  // Daily summary
  async scheduleDailySummary(petName: string): Promise<string> {
    const content = {
      title: 'Daily Summary 📊',
      body: `How did ${petName} do today? Check your progress!`,
      data: { type: 'daily_summary' },
    };

    // Schedule for 9 PM
    const trigger: Notifications.DailyTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 21,
      minute: 0,
    };

    return await Notifications.scheduleNotificationAsync({
      content,
      trigger,
    });
  }

  // Vet appointment reminder
  async scheduleVetReminder(petName: string, appointmentDate: Date): Promise<string> {
    const content = {
      title: 'Vet Appointment Reminder 🏥',
      body: `${petName} has a vet appointment tomorrow!`,
      data: { type: 'vet_reminder' },
    };

    // Schedule for 1 day before appointment
    const triggerDate = new Date(appointmentDate);
    triggerDate.setDate(triggerDate.getDate() - 1);
    triggerDate.setHours(10, 0, 0, 0);

    const trigger: Notifications.DateTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    };

    return await Notifications.scheduleNotificationAsync({
      content,
      trigger,
    });
  }

  // Handle notification response
  addNotificationResponseListener(listener: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  // Handle notification received while app is in foreground
  addNotificationReceivedListener(listener: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Schedule reminders for all user tasks based on their cycles
   */
  async scheduleTaskReminders(
    userTasks: UserTasks,
    reminderState: TaskReminderState,
    petName: string = 'your cat'
  ): Promise<void> {
    // Convert reminder time to 24-hour format
    let hour = userTasks.reminderTime.hour;
    if (userTasks.reminderTime.period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (userTasks.reminderTime.period === 'AM' && hour === 12) {
      hour = 0;
    }
    const minute = userTasks.reminderTime.minute;

    // Get all tasks that should be shown today
    const tasksForToday = TaskReminderService.getTasksForToday(userTasks, reminderState);

    // Schedule daily task reminders
    for (const task of tasksForToday.daily) {
      await this.scheduleTaskReminder(task, 'daily', hour, minute, petName);
    }

    // Schedule weekly task reminders
    for (const task of tasksForToday.weekly) {
      await this.scheduleTaskReminder(task, 'weekly', hour, minute, petName);
    }

    // Schedule monthly task reminders
    for (const task of tasksForToday.monthly) {
      await this.scheduleTaskReminder(task, 'monthly', hour, minute, petName);
    }
  }

  /**
   * Schedule a single task reminder based on its cycle
   */
  private async scheduleTaskReminder(
    task: { id: string; name: string },
    cycle: 'daily' | 'weekly' | 'monthly',
    hour: number,
    minute: number,
    petName: string
  ): Promise<string> {
    const content = {
      title: `Time to log: ${task.name} 🐱`,
      body: `Don't forget to log ${petName}'s ${task.name.toLowerCase()}`,
      data: { taskId: task.id, type: 'task_reminder' },
    };

    let trigger: Notifications.NotificationTriggerInput;

    switch (cycle) {
      case 'daily':
        trigger = {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        };
        break;

      case 'weekly':
        // Schedule for today, then repeat weekly
        const today = new Date();
        
        trigger = {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          hour,
          minute,
          weekday: today.getDay() + 1, // 1-7 (Sunday = 1)
        };
        break;

      case 'monthly':
        // Schedule for today, then repeat monthly
        const todayMonthly = new Date();
        const nextMonth = new Date(todayMonthly);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        // For monthly, we'll use a date trigger
        // Note: Expo doesn't support monthly repeats directly, so we'll schedule for next month
        trigger = {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: nextMonth,
        };
        break;

      default:
        trigger = {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        };
    }

    return await Notifications.scheduleNotificationAsync({
      content,
      trigger,
    });
  }

  /**
   * Reschedule all task reminders (call when tasks are completed or cycle changes)
   */
  async rescheduleTaskReminders(
    userTasks: UserTasks,
    reminderState: TaskReminderState,
    petName: string = 'your cat'
  ): Promise<void> {
    // Cancel all existing task reminders
    const allNotifications = await this.getScheduledNotifications();
    for (const notification of allNotifications) {
      if (notification.content.data?.type === 'task_reminder') {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    // Schedule new reminders
    await this.scheduleTaskReminders(userTasks, reminderState, petName);
  }
}

export default new NotificationService();
