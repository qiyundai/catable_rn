import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationSettings } from '../types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
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
        weekday: day + 1, // Convert 0-6 to 1-7 (Sunday = 1)
        hour: hours,
        minute: minutes,
        repeats: true,
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
      hour: 20,
      minute: 0,
      repeats: true,
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
      hour: 21,
      minute: 0,
      repeats: true,
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
}

export default new NotificationService();
