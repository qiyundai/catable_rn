// Task repository - MVP task definitions
// This file contains all supported tasks for both onboarding and daily logging

export interface TaskField {
  id: string;
  label: string;
  type: 'boolean' | 'text' | 'radio' | 'scale' | 'choices' | 'date' | 'object';
  valueType: 'boolean' | 'string' | 'number' | 'date' | 'object';
  options?: Array<{ label: string; value: string | number }>;
  scale?: {
    min: number;
    max: number;
    labels?: { [key: string]: string };
  };
  schema?: { [key: string]: string }; // For object types
  unit?: string;
  help?: string;
}

export interface TaskDefinition {
  id: string;
  title: string;
  question: string; // Supports {catName} placeholder
  fields: TaskField[];
  tags: string[];
  // For onboarding categorization
  recurringCycle?: 'daily' | 'weekly' | 'monthly';
  icon?: string;
}

// All MVP tasks
export const TASK_DEFINITIONS: TaskDefinition[] = [
  {
    id: 'food',
    title: 'Food Type',
    question: 'What type of food did {catName} have today?',
    fields: [
      {
        id: 'kind',
        label: 'Type',
        type: 'radio',
        options: [
          { label: 'Dry', value: 'dry' },
          { label: 'Wet', value: 'wet' },
          { label: 'Both', value: 'both' },
        ],
        valueType: 'string',
      },
      {
        id: 'brand',
        label: 'Brand name',
        type: 'text',
        valueType: 'string',
      },
    ],
    tags: ['nutrition'],
    recurringCycle: 'daily',
    icon: '🍽️',
  },
  {
    id: 'teeth-brushed',
    title: 'Teeth Brushing',
    question: 'Did {catName} have their teeth brushed?',
    fields: [
      {
        id: 'brushed',
        label: 'Brushed today',
        type: 'boolean',
        valueType: 'boolean',
      },
    ],
    tags: ['hygiene'],
    recurringCycle: 'weekly',
    icon: '🪥',
  },
  {
    id: 'playtime',
    title: 'Playtime',
    question: 'Did {catName} have any playtime today?',
    fields: [
      {
        id: 'activeness',
        label: 'Play activeness',
        type: 'scale',
        scale: { min: 1, max: 5 },
        valueType: 'number',
      },
    ],
    tags: ['activity'],
    recurringCycle: 'daily',
    icon: '🎾',
  },
  {
    id: 'poop',
    title: 'Poop',
    question: 'Has {catName} pooped today?',
    fields: [
      {
        id: 'pooped',
        label: 'Pooped today',
        type: 'boolean',
        valueType: 'boolean',
      },
      {
        id: 'consistency',
        label: 'Poop consistency',
        type: 'scale',
        scale: {
          min: 1,
          max: 3,
          labels: {
            '1': 'Loose',
            '2': 'Normal',
            '3': 'Hard',
          },
        },
        valueType: 'number',
      },
    ],
    tags: ['litter', 'health'],
    recurringCycle: 'daily',
    icon: '💩',
  },
  {
    id: 'pee-frequency',
    title: 'Pee Frequency',
    question: 'How often did {catName} pee today?',
    fields: [
      {
        id: 'frequency',
        label: 'Times today',
        type: 'choices',
        options: [
          { label: '< 2 times', value: '<2' },
          { label: '2–4 times', value: '2-4' },
          { label: '> 4 times', value: '>4' },
        ],
        valueType: 'string',
      },
    ],
    tags: ['litter', 'health'],
    recurringCycle: 'daily',
    icon: '💧',
  },
  {
    id: 'groomed',
    title: 'Grooming',
    question: 'Was {catName} groomed today?',
    fields: [
      {
        id: 'groomed',
        label: 'Groomed today',
        type: 'boolean',
        valueType: 'boolean',
      },
    ],
    tags: ['hygiene'],
    recurringCycle: 'daily',
    icon: '🪥',
  },
  {
    id: 'nail-clipping',
    title: 'Nail Clipping',
    question: 'Has {catName} had their nails clipped recently?',
    fields: [
      {
        id: 'date',
        label: 'Date',
        type: 'date',
        valueType: 'date',
      },
      {
        id: 'paws',
        label: 'Paws done',
        type: 'object',
        valueType: 'object',
        help: 'Select paws clipped',
        schema: {
          frontLeft: 'boolean',
          frontRight: 'boolean',
          backLeft: 'boolean',
          backRight: 'boolean',
        },
      },
    ],
    tags: ['hygiene'],
    recurringCycle: 'weekly',
    icon: '✂️',
  },
  {
    id: 'flea-treatment',
    title: 'Flea Treatment',
    question: 'Record the date of {catName}\'s flea treatment.',
    fields: [
      {
        id: 'date',
        label: 'Date',
        type: 'date',
        valueType: 'date',
      },
    ],
    tags: ['medication', 'preventive'],
    recurringCycle: 'monthly',
    icon: '🦟',
  },
  {
    id: 'deworming',
    title: 'Deworming',
    question: 'Record the date of {catName}\'s last deworming.',
    fields: [
      {
        id: 'date',
        label: 'Date',
        type: 'date',
        valueType: 'date',
      },
    ],
    tags: ['medication', 'preventive'],
    recurringCycle: 'monthly',
    icon: '💊',
  },
  {
    id: 'vet-checkup',
    title: 'Vet Check-up',
    question: 'Record the date of {catName}\'s last vet check-up.',
    fields: [
      {
        id: 'date',
        label: 'Date',
        type: 'date',
        valueType: 'date',
      },
    ],
    tags: ['vet', 'preventive'],
    recurringCycle: 'monthly',
    icon: '🏥',
  },
  {
    id: 'sleeping-resp-rate',
    title: 'Breathing Rate (Sleeping)',
    question: 'How many breaths per minute did {catName} take while sleeping?',
    fields: [
      {
        id: 'range',
        label: 'Breaths per minute',
        type: 'choices',
        options: [
          { label: '20–30', value: '20-30' },
          { label: '30–40', value: '30-40' },
          { label: '> 40', value: '>40' },
        ],
        unit: 'breaths/min',
        valueType: 'number',
      },
    ],
    tags: ['vitals'],
    recurringCycle: 'weekly',
    icon: '😴',
  },
];

// Helper functions to get tasks by category
export const getTasksByCategory = (category: 'daily' | 'weekly' | 'monthly'): TaskDefinition[] => {
  return TASK_DEFINITIONS.filter(task => task.recurringCycle === category);
};

// Get task by ID
export const getTaskById = (id: string): TaskDefinition | undefined => {
  return TASK_DEFINITIONS.find(task => task.id === id);
};

// Map old task IDs to new task IDs for backward compatibility
export const TASK_ID_MAPPING: { [oldId: string]: string } = {
  'feed': 'food',
  'peeing_frequency': 'pee-frequency',
  'poop_consistency': 'poop',
  'activity': 'playtime',
  'grooming': 'groomed',
  'sleep_breathing': 'sleeping-resp-rate',
  'tooth_brushing': 'teeth-brushed',
  'nail_clipping': 'nail-clipping',
  'flea_treatment': 'flea-treatment',
  'internal_deworming': 'deworming',
  'vet_visit': 'vet-checkup',
};

// Get task by old ID (for backward compatibility)
export const getTaskByOldId = (oldId: string): TaskDefinition | undefined => {
  const newId = TASK_ID_MAPPING[oldId];
  return newId ? getTaskById(newId) : undefined;
};

