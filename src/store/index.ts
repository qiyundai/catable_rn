import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Pet, Log, Task, Streak, Achievement, AppState, UserTasks } from '../types';
import { TaskReminderState } from '../services/TaskReminderService';

interface AppStore extends AppState {
  // Task reminder state
  taskReminderState: TaskReminderState;
  // Custom task frequencies per pet: { [petId: string]: { [taskId: string]: 'daily' | 'weekly' | 'monthly' } }
  taskFrequencies: { [petId: string]: { [taskId: string]: 'daily' | 'weekly' | 'monthly' } };
  
  // Actions
  setUser: (user: User | null) => void;
  addPet: (pet: Pet) => void;
  updatePet: (petId: string, updates: Partial<Pet>) => void;
  removePet: (petId: string) => void;
  setCurrentPet: (pet: Pet | null) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setUserTasks: (tasks: UserTasks) => void;
  
  // Task reminder actions
  setTaskReminderState: (state: TaskReminderState) => void;
  markTaskAsShown: (taskId: string) => void;
  markTaskAsCompleted: (taskId: string) => void;
  setTaskFrequency: (petId: string, taskId: string, frequency: 'daily' | 'weekly' | 'monthly') => void;
  getTaskFrequency: (petId: string, taskId: string) => 'daily' | 'weekly' | 'monthly' | null;
  
  // Streak actions
  updateStreak: (petId: string, streak: Streak) => void;
  getCurrentStreak: (petId: string) => number;
  incrementStreak: (petId: string) => void;
  resetStreak: (petId: string) => void;
  
  // Logging actions
  addLog: (log: Log) => void;
  updateLog: (logId: string, updates: Partial<Log>) => void;
  deleteLog: (logId: string) => void;
  
  // Task actions
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  completeTask: (taskId: string) => void;
  
  // Achievement actions
  unlockAchievement: (achievementId: string) => void;
  
  // Reset
  reset: () => void;
  
  // Sign out
  signOut: () => void;
}

const initialState: AppState & { taskReminderState: TaskReminderState; taskFrequencies: { [petId: string]: { [taskId: string]: 'daily' | 'weekly' | 'monthly' } } } = {
  user: null,
  pets: [],
  currentPet: null,
  isOnboardingComplete: false,
  isAuthenticated: false,
  isLoading: false,
  userTasks: null,
  streaks: {},
  taskReminderState: {},
  taskFrequencies: {},
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setUser: (user) => set({ user }),
      
      addPet: (pet) => set((state) => ({
        pets: [...state.pets, pet],
        currentPet: state.currentPet || pet,
      })),
      
      updatePet: (petId, updates) => set((state) => ({
        pets: state.pets.map(pet => 
          pet.id === petId ? { ...pet, ...updates } : pet
        ),
        currentPet: state.currentPet?.id === petId 
          ? { ...state.currentPet, ...updates }
          : state.currentPet,
      })),
      
      removePet: (petId) => set((state) => ({
        pets: state.pets.filter(pet => pet.id !== petId),
        currentPet: state.currentPet?.id === petId ? null : state.currentPet,
      })),
      
      setCurrentPet: (pet) => set({ currentPet: pet }),
      
      setOnboardingComplete: (complete) => set({ isOnboardingComplete: complete }),
      
      setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setUserTasks: (tasks) => set({ userTasks: tasks }),
      
      setTaskReminderState: (state) => set({ taskReminderState: state }),
      
      markTaskAsShown: (taskId) => set((state) => {
        const TaskReminderService = require('../services/TaskReminderService').default;
        const newState = TaskReminderService.markTaskAsShown(taskId, state.taskReminderState);
        return { taskReminderState: newState };
      }),
      
      markTaskAsCompleted: (taskId) => set((state) => {
        const TaskReminderService = require('../services/TaskReminderService').default;
        const newState = TaskReminderService.markTaskAsCompleted(taskId, state.taskReminderState);
        return { taskReminderState: newState };
      }),
      
      setTaskFrequency: (petId, taskId, frequency) => set((state) => ({
        taskFrequencies: {
          ...state.taskFrequencies,
          [petId]: {
            ...(state.taskFrequencies[petId] || {}),
            [taskId]: frequency,
          },
        },
      })),
      
      getTaskFrequency: (petId, taskId) => {
        const state = get();
        return state.taskFrequencies[petId]?.[taskId] || null;
      },
      
      updateStreak: (petId, streak) => set((state) => ({
        streaks: {
          ...state.streaks,
          [petId]: streak,
        },
      })),
      
      getCurrentStreak: (petId) => {
        const state = get();
        return state.streaks[petId]?.currentStreak || 0;
      },
      
      incrementStreak: (petId) => set((state) => {
        const currentStreak = state.streaks[petId];
        const now = new Date();
        
        if (currentStreak) {
          // Check if we already logged today
          const lastLoggedDate = new Date(currentStreak.lastLoggedAt);
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const lastLoggedDay = new Date(lastLoggedDate.getFullYear(), lastLoggedDate.getMonth(), lastLoggedDate.getDate());
          
          if (lastLoggedDay.getTime() === today.getTime()) {
            // Already logged today, don't increment
            return state;
          }
          
          // Check if it's consecutive (yesterday)
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastLoggedDay.getTime() === yesterday.getTime()) {
            // Consecutive day, increment streak
            const newStreak = {
              ...currentStreak,
              currentStreak: currentStreak.currentStreak + 1,
              longestStreak: Math.max(currentStreak.currentStreak + 1, currentStreak.longestStreak),
              lastLoggedAt: now,
              updatedAt: now,
            };
            return {
              ...state,
              streaks: {
                ...state.streaks,
                [petId]: newStreak,
              },
            };
          } else {
            // Not consecutive, reset streak
            const newStreak = {
              ...currentStreak,
              currentStreak: 1,
              longestStreak: Math.max(1, currentStreak.longestStreak),
              lastLoggedAt: now,
              updatedAt: now,
            };
            return {
              ...state,
              streaks: {
                ...state.streaks,
                [petId]: newStreak,
              },
            };
          }
        } else {
          // First streak
          const newStreak: Streak = {
            id: `streak_${petId}_${Date.now()}`,
            petId,
            currentStreak: 1,
            longestStreak: 1,
            lastLoggedAt: now,
            updatedAt: now,
          };
          return {
            ...state,
            streaks: {
              ...state.streaks,
              [petId]: newStreak,
            },
          };
        }
      }),
      
      resetStreak: (petId) => set((state) => {
        const currentStreak = state.streaks[petId];
        if (currentStreak) {
          const newStreak = {
            ...currentStreak,
            currentStreak: 0,
            updatedAt: new Date(),
          };
          return {
            ...state,
            streaks: {
              ...state.streaks,
              [petId]: newStreak,
            },
          };
        }
        return state;
      }),
      
      addLog: (log) => set((state) => ({
        // This would be handled by a separate logs store in a real app
        // For now, we'll just update the state
      })),
      
      updateLog: (logId, updates) => set((state) => ({
        // This would be handled by a separate logs store in a real app
      })),
      
      deleteLog: (logId) => set((state) => ({
        // This would be handled by a separate logs store in a real app
      })),
      
      addTask: (task) => set((state) => ({
        // This would be handled by a separate tasks store in a real app
      })),
      
      updateTask: (taskId, updates) => set((state) => ({
        // This would be handled by a separate tasks store in a real app
      })),
      
      completeTask: (taskId) => set((state) => ({
        // This would be handled by a separate tasks store in a real app
      })),
      
      unlockAchievement: (achievementId) => set((state) => ({
        // This would be handled by a separate achievements store in a real app
      })),
      
      reset: () => set(initialState),
      
      signOut: () => set({
        user: null,
        pets: [],
        currentPet: null,
        isOnboardingComplete: false,
        isAuthenticated: false,
        isLoading: false,
        userTasks: null,
      }),
    }),
    {
      name: 'catable-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        pets: state.pets,
        currentPet: state.currentPet,
        isOnboardingComplete: state.isOnboardingComplete,
        isAuthenticated: state.isAuthenticated,
        userTasks: state.userTasks,
        streaks: state.streaks,
        taskReminderState: state.taskReminderState,
        taskFrequencies: state.taskFrequencies,
      }),
    }
  )
);
