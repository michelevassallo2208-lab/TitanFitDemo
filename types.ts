export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  videoUrl: string; // Placeholder for GIF/Video
  description: string;
  tips: string[];
  isCustom?: boolean; // Flag to identify manually added exercises
}

export interface WorkoutExercise extends Exercise {
  sets: number;
  reps: string;
  restSeconds: number;
  customNotes?: string;
}

export interface WorkoutDay {
  id: string;
  name: string; // e.g., "Giorno A - Spinta"
  exercises: WorkoutExercise[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  days: WorkoutDay[];
  createdAt: string;
}

export interface ArchivedPlan {
  planId: string;
  planName: string;
  archivedAt: string;
}

export interface User {
  id: string;
  username: string; // Used for login ID
  password: string;
  fullName: string;
  role: Role;
  assignedPlanId?: string;
  planHistory?: ArchivedPlan[]; // History of previous plans
  goals?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}