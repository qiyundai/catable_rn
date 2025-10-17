// App constants and configuration

export const APP_CONFIG = {
  name: 'CAT-able',
  version: '1.0.0',
  supportedLanguages: ['en', 'zh', 'ja'] as const,
  defaultLanguage: 'en',
  databaseName: 'catable.db',
  apiBaseUrl: 'https://api.catable.app', // Placeholder
};

export const COLORS = {
  primary: '#18C07A',
  secondary: '#4ECDC4',
  accent: '#45B7D1',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  border: '#E1E8ED',
  success: '#18C07A',
  warning: '#F39C12',
  error: '#E74C3C',
  disabled: '#BDC3C7',
  progress: '#FF9633',
  black: '#000000',
  gray: '#F5F5F5',
  darkInk: '#1E232C',
};

export const SHADOWS = {
  small: {
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  medium: {
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  large: {
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
};

export const BORDER_RADIUS = {
  small: 4,
  medium: 8,
  large: 16,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
    fontFamily: 'LobsterTwo',
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
    fontFamily: 'LobsterTwo',
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    fontFamily: 'LobsterTwo',
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
    fontFamily: 'Roboto',
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
    fontFamily: 'Roboto',
  },
  small: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
    fontFamily: 'Roboto',
  },
  // Additional Roboto weights
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    fontFamily: 'Roboto',
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    lineHeight: 24,
    fontFamily: 'Roboto',
  },
  captionMedium: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    fontFamily: 'Roboto',
  },
  captionBold: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    lineHeight: 20,
    fontFamily: 'Roboto',
  },
};

export const LOG_TYPES = {
  DAILY: {
    WATER: {
      id: 'water',
      name: 'Water Intake',
      category: 'daily' as const,
      inputType: 'numeric' as const,
      unit: 'ml',
      isActive: true,
    },
    FEEDING: {
      id: 'feeding',
      name: 'Feeding',
      category: 'daily' as const,
      inputType: 'yesno' as const,
      isActive: true,
    },
    PLAYTIME: {
      id: 'playtime',
      name: 'Playtime Activity',
      category: 'daily' as const,
      inputType: 'slider' as const,
      options: ['Very Lazy', 'Lazy', 'Normal', 'Active', 'Super Energetic'],
      isActive: true,
    },
    POOP: {
      id: 'poop',
      name: 'Poop Consistency',
      category: 'daily' as const,
      inputType: 'slider' as const,
      options: ['Hard & Dry', 'Firm', 'Normal', 'Soft', 'Watery Diarrhea'],
      isActive: true,
    },
    LITTER: {
      id: 'litter',
      name: 'Litter Box',
      category: 'daily' as const,
      inputType: 'yesno' as const,
      isActive: true,
    },
  },
  RECURRING: {
    GROOMING: {
      id: 'grooming',
      name: 'Grooming',
      category: 'recurring' as const,
      inputType: 'yesno' as const,
      isActive: true,
    },
    TEETH_BRUSHING: {
      id: 'teeth_brushing',
      name: 'Tooth Brushing',
      category: 'recurring' as const,
      inputType: 'yesno' as const,
      isActive: true,
    },
    NAIL_CLIPPING: {
      id: 'nail_clipping',
      name: 'Nail Clipping',
      category: 'recurring' as const,
      inputType: 'yesno' as const,
      isActive: true,
    },
    FLEA_TREATMENT: {
      id: 'flea_treatment',
      name: 'Flea Treatment',
      category: 'recurring' as const,
      inputType: 'yesno' as const,
      isActive: true,
    },
    SHOWERING: {
      id: 'showering',
      name: 'Showering',
      category: 'recurring' as const,
      inputType: 'yesno' as const,
      isActive: true,
    },
    DEWORMING: {
      id: 'deworming',
      name: 'Internal Deworming',
      category: 'recurring' as const,
      inputType: 'yesno' as const,
      isActive: true,
    },
    VET_CHECKUP: {
      id: 'vet_checkup',
      name: 'Vet Check-up',
      category: 'recurring' as const,
      inputType: 'yesno' as const,
      isActive: true,
    },
  },
};

export const ACHIEVEMENTS = [
  {
    id: 'first_log',
    title: 'First Steps',
    description: 'Log your first cat activity',
    icon: '🌟',
    xpReward: 10,
  },
  {
    id: 'week_streak',
    title: 'Week Warrior',
    description: 'Maintain a 7-day logging streak',
    icon: '🔥',
    xpReward: 50,
  },
  {
    id: 'month_streak',
    title: 'Monthly Master',
    description: 'Maintain a 30-day logging streak',
    icon: '💎',
    xpReward: 200,
  },
  {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: 'Complete all daily tasks for 7 days',
    icon: '⭐',
    xpReward: 100,
  },
];

export const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: "Let's get started!",
    description: 'Setting up your cat\'s profile',
    component: 'Welcome',
    type: 'flow_control',
    skipBehavior: 'skip_to_next_flow_control',
  },
  {
    id: 'cat_name',
    title: 'What\'s your cat\'s name?',
    description: 'Add a name and photo for your cat',
    component: 'CatName',
    type: 'data_collection',
    skipBehavior: 'next',
  },
  {
    id: 'cat_info',
    title: 'Basic Information',
    description: 'Tell us about your cat',
    component: 'CatInfo',
    type: 'data_collection',
    skipBehavior: 'next',
  },
  {
    id: 'add_another',
    title: 'Add Another Cat?',
    description: 'You can always add more cats later',
    component: 'AddAnother',
    type: 'flow_control',
    skipBehavior: 'next',
  },
  {
    id: 'logging_goals',
    title: 'Set Logging Goals',
    description: 'Choose what you\'d like to track',
    component: 'LoggingGoals',
    type: 'flow_control',
    skipBehavior: 'skip_to_next_flow_control',
  },
  {
    id: 'daily_tasks',
    title: 'Daily Tasks',
    description: 'Select daily activities to track',
    component: 'DailyTasks',
    type: 'data_collection',
    skipBehavior: 'next',
  },
  {
    id: 'weekly_tasks',
    title: 'Weekly Tasks',
    description: 'Choose weekly activities to track',
    component: 'WeeklyTasks',
    type: 'data_collection',
    skipBehavior: 'next',
  },
  {
    id: 'monthly_tasks',
    title: 'Monthly Tasks',
    description: 'Select monthly or less frequent activities',
    component: 'MonthlyTasks',
    type: 'data_collection',
    skipBehavior: 'next',
  },
  {
    id: 'reminder_time',
    title: 'Reminder Time',
    description: 'When would you like daily reminders?',
    component: 'ReminderTime',
    type: 'data_collection',
    skipBehavior: 'next',
  },
];

export const PET_GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

export const PET_BREED_OPTIONS = [
  { label: 'Mixed', value: 'Mixed' },
  { label: 'Persian', value: 'Persian' },
  { label: 'Maine Coon', value: 'Maine Coon' },
  { label: 'Siamese', value: 'Siamese' },
  { label: 'British Shorthair', value: 'British Shorthair' },
  { label: 'Ragdoll', value: 'Ragdoll' },
  { label: 'American Shorthair', value: 'American Shorthair' },
  { label: 'Scottish Fold', value: 'Scottish Fold' },
  { label: 'Other', value: 'Other' },
];

export const PET_PERSONALITY_OPTIONS = [
  { label: 'Playful', value: 'Playful' },
  { label: 'Calm', value: 'Calm' },
  { label: 'Energetic', value: 'Energetic' },
  { label: 'Independent', value: 'Independent' },
  { label: 'Affectionate', value: 'Affectionate' },
  { label: 'Curious', value: 'Curious' },
  { label: 'Shy', value: 'Shy' },
  { label: 'Social', value: 'Social' },
];

export const SOCIAL_LOGIN_PROVIDERS = [
  {
    id: 'google',
    name: 'Google',
    icon: '🔍',
    color: '#DB4437',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    color: '#4267B2',
  },
  {
    id: 'apple',
    name: 'Apple',
    icon: '🍎',
    color: '#000000',
  },
];
