import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Pet, Log, Task, Streak, Achievement, AppState } from '../types';

interface AppStore extends AppState {
  // Actions
  setUser: (user: User | null) => void;
  addPet: (pet: Pet) => void;
  updatePet: (petId: string, updates: Partial<Pet>) => void;
  removePet: (petId: string) => void;
  setCurrentPet: (pet: Pet | null) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  
  // Logging actions
  addLog: (log: Log) => void;
  updateLog: (logId: string, updates: Partial<Log>) => void;
  deleteLog: (logId: string) => void;
  
  // Task actions
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  completeTask: (taskId: string) => void;
  
  // Streak actions
  updateStreak: (petId: string, streak: Streak) => void;
  
  // Achievement actions
  unlockAchievement: (achievementId: string) => void;
  
  // Reset
  reset: () => void;
}

const initialState: AppState = {
  user: null,
  pets: [],
  currentPet: null,
  isOnboardingComplete: false,
  isAuthenticated: false,
  isLoading: false,
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
      
      updateStreak: (petId, streak) => set((state) => ({
        // This would be handled by a separate streaks store in a real app
      })),
      
      unlockAchievement: (achievementId) => set((state) => ({
        // This would be handled by a separate achievements store in a real app
      })),
      
      reset: () => set(initialState),
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
      }),
    }
  )
);
