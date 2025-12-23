import { User, WorkoutPlan, Role, Exercise } from '../types';
import { STANDARD_EXERCISES } from '../constants';

const jsonRequest = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

export const db = {
  // --- USERS ---
  getUsers: (): Promise<User[]> => jsonRequest<User[]>('/api/users'),

  hasAdmin: async (): Promise<boolean> => {
    const response = await jsonRequest<{ hasAdmin: boolean }>('/api/users?hasAdmin=1');
    return response.hasAdmin;
  },

  login: (username: string, password: string): Promise<User | null> =>
    jsonRequest<User | null>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  checkHealth: async (): Promise<boolean> => {
    const response = await jsonRequest<{ ok: boolean }>('/api/health');
    return response.ok;
  },

  saveUser: (user: User): Promise<User> =>
    jsonRequest<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    }),

  updateUser: (updatedUser: User): Promise<User> =>
    jsonRequest<User>('/api/users', {
      method: 'PUT',
      body: JSON.stringify(updatedUser),
    }),

  deleteUser: (id: string): Promise<void> =>
    jsonRequest<void>(`/api/users?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  // --- PLANS ---
  getPlans: (): Promise<WorkoutPlan[]> => jsonRequest<WorkoutPlan[]>('/api/plans'),

  savePlan: (plan: WorkoutPlan): Promise<WorkoutPlan> =>
    jsonRequest<WorkoutPlan>('/api/plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    }),

  deletePlan: (id: string): Promise<void> =>
    jsonRequest<void>(`/api/plans?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  // --- EXERCISES ---
  getCustomExercises: (): Promise<Exercise[]> => jsonRequest<Exercise[]>('/api/exercises'),

  saveCustomExercise: (exercise: Exercise): Promise<Exercise> =>
    jsonRequest<Exercise>('/api/exercises', {
      method: 'POST',
      body: JSON.stringify(exercise),
    }),

  getAllExercises: async (): Promise<Exercise[]> => {
    const custom = await db.getCustomExercises();
    return [...STANDARD_EXERCISES, ...custom];
  },

  // --- HELPERS ---
  getPlanById: (id: string): Promise<WorkoutPlan | null> =>
    jsonRequest<WorkoutPlan | null>(`/api/plans?id=${encodeURIComponent(id)}`),

  getStandardExercises: () => STANDARD_EXERCISES,
};
