import { User, WorkoutPlan, Role, Exercise } from '../types';
import { STANDARD_EXERCISES } from '../constants';

const USERS_KEY = 'titan_users';
const PLANS_KEY = 'titan_plans';
const CUSTOM_EXERCISES_KEY = 'titan_custom_exercises';

export const db = {
  // --- USERS ---
  getUsers: (): User[] => {
    const stored = localStorage.getItem(USERS_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  },

  hasAdmin: (): boolean => {
    const users = db.getUsers();
    return users.some(u => u.role === Role.ADMIN);
  },

  saveUser: (user: User) => {
    const users = db.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  updateUser: (updatedUser: User) => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  deleteUser: (id: string) => {
    const users = db.getUsers().filter(u => u.id !== id);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  // --- PLANS ---
  getPlans: (): WorkoutPlan[] => {
    const stored = localStorage.getItem(PLANS_KEY);
    const plans = stored ? JSON.parse(stored) : [];
    // Sort plans by date descending (newest first)
    return plans.sort((a: WorkoutPlan, b: WorkoutPlan) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  savePlan: (plan: WorkoutPlan) => {
    const plans = db.getPlans();
    const existingIndex = plans.findIndex(p => p.id === plan.id);
    if (existingIndex >= 0) {
      plans[existingIndex] = plan;
    } else {
      plans.push(plan);
    }
    localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
  },

  deletePlan: (id: string) => {
      const plans = db.getPlans().filter(p => p.id !== id);
      localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
  },

  // --- EXERCISES ---
  getCustomExercises: (): Exercise[] => {
      const stored = localStorage.getItem(CUSTOM_EXERCISES_KEY);
      return stored ? JSON.parse(stored) : [];
  },

  saveCustomExercise: (exercise: Exercise) => {
      const customs = db.getCustomExercises();
      customs.push(exercise);
      localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(customs));
  },

  getAllExercises: (): Exercise[] => {
      const custom = db.getCustomExercises();
      return [...STANDARD_EXERCISES, ...custom];
  },

  // --- HELPERS ---
  getPlanById: (id: string): WorkoutPlan | undefined => {
    return db.getPlans().find(p => p.id === id);
  },

  getStandardExercises: () => STANDARD_EXERCISES,
};