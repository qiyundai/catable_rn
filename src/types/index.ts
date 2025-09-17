// Core types for CAT-able app

export interface User {
  id: string;
  email: string;
  displayName: string;
  region: string;
  language: 'en' | 'zh' | 'ja';
  isGuest: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pet {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  breed: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  personality: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LogType {
  id: string;
  name: string;
  category: 'daily' | 'recurring';
  inputType: 'numeric' | 'slider' | 'yesno' | 'text';
  unit?: string;
  options?: string[];
  isActive: boolean;
}

export interface Log {
  id: string;
  petId: string;
  logTypeId: string;
  value: string | number;
  notes?: string;
  loggedAt: Date;
  synced: boolean;
  createdAt: Date;
}

export interface Task {
  id: string;
  petId: string;
  logTypeId: string;
  title: string;
  description: string;
  isCompleted: boolean;
  dueDate: Date;
  completedAt?: Date;
}

export interface Streak {
  id: string;
  petId: string;
  currentStreak: number;
  longestStreak: number;
  lastLoggedAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
  xpReward: number;
}

export interface NotificationSettings {
  id: string;
  petId: string;
  logTypeId: string;
  enabled: boolean;
  time: string; // HH:mm format
  days: number[]; // 0-6 for Sunday-Saturday
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string;
  data?: any;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
  PetProfile: { petId: string };
  Logging: { petId: string; logTypeId: string };
  Settings: undefined;
  Profile: undefined;
};

export type MainTabParamList = {
  Tasks: undefined;
  Community: undefined;
  PetProfiles: undefined;
};

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface PetForm {
  name: string;
  breed: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  personality: string;
  avatar?: string;
}

// UI State types
export interface AppState {
  user: User | null;
  pets: Pet[];
  currentPet: Pet | null;
  isOnboardingComplete: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Logging input types
export interface NumericInput {
  value: number;
  unit: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface SliderInput {
  value: number;
  min: number;
  max: number;
  labels: string[];
}

export interface YesNoInput {
  value: boolean;
}

export interface TextInput {
  value: string;
  placeholder: string;
  maxLength?: number;
}
