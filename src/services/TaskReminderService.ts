import { UserTask, UserTasks } from '../types';
import { TaskDefinition, getTaskById, getTaskByOldId } from '../constants/tasks';

export interface TaskCompletionRecord {
  taskId: string;
  lastCompleted?: Date;
  lastShown?: Date;
  cycleStartDate: Date; // When the cycle started (for weekly/monthly)
}

export interface TaskReminderState {
  [taskId: string]: TaskCompletionRecord;
}

class TaskReminderService {
  /**
   * Determines if a task should be shown today based on its cycle
   */
  shouldShowTaskToday(
    task: UserTask | TaskDefinition,
    reminderState: TaskReminderState,
    today: Date = new Date()
  ): boolean {
    const taskId = 'id' in task ? task.id : task.id;
    const cycle = 'recurringCycle' in task ? task.recurringCycle : this.getTaskCycle(taskId);
    const record = reminderState[taskId];

    if (!record) {
      // First time - show it today to start the cycle
      return true;
    }

    switch (cycle) {
      case 'daily':
        // Daily tasks: show every day
        return true;

      case 'weekly':
        // Weekly tasks: show today, then 7 days later
        if (!record.lastShown) {
          return true; // First time
        }
        const lastShown = new Date(record.lastShown);
        const daysSinceLastShown = Math.floor(
          (today.getTime() - lastShown.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysSinceLastShown >= 7;

      case 'monthly':
        // Monthly tasks: show today, then next month (approximately 30 days)
        if (!record.lastShown) {
          return true; // First time
        }
        const lastShownMonthly = new Date(record.lastShown);
        const daysSinceLastShownMonthly = Math.floor(
          (today.getTime() - lastShownMonthly.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysSinceLastShownMonthly >= 30;

      default:
        return false;
    }
  }

  /**
   * Get the cycle type for a task ID
   */
  getTaskCycle(taskId: string): 'daily' | 'weekly' | 'monthly' {
    // Try to get from new task definitions
    let taskDef = getTaskById(taskId);
    if (taskDef && taskDef.recurringCycle) {
      return taskDef.recurringCycle;
    }

    // Try old ID mapping
    taskDef = getTaskByOldId(taskId);
    if (taskDef && taskDef.recurringCycle) {
      return taskDef.recurringCycle;
    }

    // Default to daily if unknown
    return 'daily';
  }

  /**
   * Mark a task as shown today
   */
  markTaskAsShown(
    taskId: string,
    reminderState: TaskReminderState,
    today: Date = new Date()
  ): TaskReminderState {
    const record = reminderState[taskId] || {
      taskId,
      cycleStartDate: today,
    };

    return {
      ...reminderState,
      [taskId]: {
        ...record,
        lastShown: today,
      },
    };
  }

  /**
   * Mark a task as completed
   */
  markTaskAsCompleted(
    taskId: string,
    reminderState: TaskReminderState,
    today: Date = new Date()
  ): TaskReminderState {
    const record = reminderState[taskId] || {
      taskId,
      cycleStartDate: today,
    };

    return {
      ...reminderState,
      [taskId]: {
        ...record,
        lastCompleted: today,
        lastShown: today,
      },
    };
  }

  /**
   * Initialize reminder state for all user tasks
   * Called when onboarding is completed
   */
  initializeReminderState(userTasks: UserTasks, today: Date = new Date()): TaskReminderState {
    const state: TaskReminderState = {};

    // Initialize daily tasks
    userTasks.daily.forEach((task) => {
      state[task.id] = {
        taskId: task.id,
        cycleStartDate: today,
      };
    });

    // Initialize weekly tasks
    userTasks.weekly.forEach((task) => {
      state[task.id] = {
        taskId: task.id,
        cycleStartDate: today,
      };
    });

    // Initialize monthly tasks
    userTasks.monthly.forEach((task) => {
      state[task.id] = {
        taskId: task.id,
        cycleStartDate: today,
      };
    });

    // Initialize custom tasks
    Object.values(userTasks.customTasks).forEach((customTasks) => {
      customTasks.forEach((task) => {
        state[task.id] = {
          taskId: task.id,
          cycleStartDate: today,
        };
      });
    });

    return state;
  }

  /**
   * Get tasks that should be shown today
   */
  getTasksForToday(
    userTasks: UserTasks,
    reminderState: TaskReminderState
  ): { daily: UserTask[]; weekly: UserTask[]; monthly: UserTask[] } {
    const today = new Date();

    return {
      daily: userTasks.daily.filter((task) =>
        this.shouldShowTaskToday(task, reminderState, today)
      ),
      weekly: userTasks.weekly.filter((task) =>
        this.shouldShowTaskToday(task, reminderState, today)
      ),
      monthly: userTasks.monthly.filter((task) =>
        this.shouldShowTaskToday(task, reminderState, today)
      ),
    };
  }

  /**
   * Calculate next reminder date for a task
   */
  getNextReminderDate(
    task: UserTask | TaskDefinition,
    reminderState: TaskReminderState,
    today: Date = new Date()
  ): Date {
    const taskId = 'id' in task ? task.id : task.id;
    const cycle = 'recurringCycle' in task ? task.recurringCycle : this.getTaskCycle(taskId);
    const record = reminderState[taskId];
    const lastShown = record?.lastShown ? new Date(record.lastShown) : today;

    const nextDate = new Date(lastShown);

    switch (cycle) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
    }

    return nextDate;
  }
}

export default new TaskReminderService();

