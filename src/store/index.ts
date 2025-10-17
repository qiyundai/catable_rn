import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Pet, Log, Task, Streak, Achievement, AppState, UserTasks } from '../types';

interface AppStore extends AppState {
  // Additional state
  logs: Log[];
  tasks: Task[];
  achievements: Achievement[];
  
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

const initialState: AppState & { logs: Log[]; tasks: Task[]; achievements: Achievement[] } = {
  user: null,
  pets: [],
  currentPet: null,
  isOnboardingComplete: false,
  isAuthenticated: false,
  isLoading: false,
  userTasks: null,
  streaks: {},
  logs: [],
  tasks: [],
  achievements: [],
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
        logs: [...state.logs, log],
      })),
      
      updateLog: (logId, updates) => set((state) => ({
        logs: state.logs.map(log => 
          log.id === logId ? { ...log, ...updates } : log
        ),
      })),
      
      deleteLog: (logId) => set((state) => ({
        logs: state.logs.filter(log => log.id !== logId),
      })),
      
      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, task],
      })),
      
      updateTask: (taskId, updates) => set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        ),
      })),
      
      completeTask: (taskId) => set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === taskId 
            ? { ...task, isCompleted: true, completedAt: new Date() }
            : task
        ),
      })),
      
      unlockAchievement: (achievementId) => set((state) => ({
        achievements: state.achievements.map(achievement =>
          achievement.id === achievementId
            ? { ...achievement, isUnlocked: true, unlockedAt: new Date() }
            : achievement
        ),
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
        logs: [],
        tasks: [],
        achievements: [],
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
        logs: state.logs,
        tasks: state.tasks,
        achievements: state.achievements,
      }),
    }
  )
);
