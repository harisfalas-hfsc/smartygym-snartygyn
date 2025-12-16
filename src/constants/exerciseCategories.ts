// Exercise Library Category Constants

export const MUSCLE_CATEGORIES: Record<string, string[]> = {
  'Upper Body': [
    'Pectoralis Major',
    'Pectoralis Minor',
    'Latissimus Dorsi',
    'Trapezius',
    'Deltoids',
    'Biceps Brachii',
    'Triceps Brachii',
    'Brachialis',
    'Forearm Flexors',
    'Forearm Extensors'
  ],
  'Lower Body': [
    'Gluteus Maximus',
    'Gluteus Medius',
    'Gluteus Minimus',
    'Quadriceps',
    'Hamstrings',
    'Adductors',
    'Abductors',
    'Gastrocnemius',
    'Soleus',
    'Tibialis Anterior'
  ],
  'Core': [
    'Rectus Abdominis',
    'Transverse Abdominis',
    'Internal Obliques',
    'External Obliques',
    'Erector Spinae'
  ]
};

export const MUSCLE_GROUPS = Object.keys(MUSCLE_CATEGORIES) as ('Upper Body' | 'Lower Body' | 'Core')[];

export const ALL_MUSCLES = Object.values(MUSCLE_CATEGORIES).flat();

export const WORKOUT_CATEGORIES = [
  'Strength',
  'Calorie Burning',
  'Metabolic',
  'Cardio',
  'Mobility and Stability',
  'Challenge'
] as const;

export const PROGRAM_CATEGORIES = [
  'Cardio Endurance',
  'Functional Strength',
  'Muscle Hypertrophy',
  'Weight Loss',
  'Low Back Pain',
  'Mobility and Stability'
] as const;

export type MuscleGroup = keyof typeof MUSCLE_CATEGORIES;
export type WorkoutCategory = typeof WORKOUT_CATEGORIES[number];
export type ProgramCategory = typeof PROGRAM_CATEGORIES[number];
