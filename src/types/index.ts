// Core types for CAT-able app

export interface User {
  id: string;
  email: string;
  userName: string;
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
  ageMonths: number; // Age in months for more precise tracking
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
  ManagePet: { petId?: string };
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
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface PetForm {
  name: string;
  breed: string;
  ageMonths: number;
  gender: 'male' | 'female' | 'other';
  personality: string;
  avatar?: string;
}

// User task selection types
export interface UserTask {
  id: string;
  name: string;
  icon: string;
  recurringCycle: 'daily' | 'weekly' | 'monthly';
  isCustom: boolean;
}

export interface UserTasks {
  daily: UserTask[];
  weekly: UserTask[];
  monthly: UserTask[];
  customTasks: { [key: string]: UserTask[] };
  reminderTime: {
    hour: number;
    minute: number;
    period: 'AM' | 'PM';
  };
}

// UI State types
export interface AppState {
  user: User | null;
  pets: Pet[];
  currentPet: Pet | null;
  isOnboardingComplete: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  userTasks: UserTasks | null;
  streaks: { [petId: string]: Streak };
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
