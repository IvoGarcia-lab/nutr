import { User, AllUserData } from '../types';

const USER_SESSION_KEY = 'nutrition-app-user-session';
const USER_DATA_KEY_PREFIX = 'nutrition-app-data_';

// Mock user database
const mockUsers: { [key: string]: User } = {
  'user@example.com': {
    id: '1',
    name: 'Utilizador Exemplo',
    email: 'user@example.com',
    age: 30,
    gender: 'male',
    weight: 75,
    height: 180,
    activityLevel: 'moderate',
    goal: 'maintain_weight',
    dietaryPreference: 'none',
  },
};

export const login = (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === 'user@example.com' && password === 'password123') {
        const user = mockUsers[email];
        sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
        // Initialize user data if not present
        const userData = localStorage.getItem(`${USER_DATA_KEY_PREFIX}${user.id}`);
        if (!userData) {
            const initialData: AllUserData = {
                currentPlan: null,
                planHistory: [],
                weightHistory: [],
                completedMeals: { breakfast: false, lunch: false, dinner: false, snacks: false },
                weeklyPlan: null,
                shoppingList: null,
            };
            localStorage.setItem(`${USER_DATA_KEY_PREFIX}${user.id}`, JSON.stringify(initialData));
        }
        resolve(user);
      } else {
        reject(new Error('Email ou password inválidos. Use "user@example.com" e "password123".'));
      }
    }, 500);
  });
};

export const logout = (): Promise<void> => {
  return new Promise((resolve) => {
    sessionStorage.removeItem(USER_SESSION_KEY);
    resolve();
  });
};

export const getCurrentUser = (): User | null => {
  try {
    const userJson = sessionStorage.getItem(USER_SESSION_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Failed to get user from session storage', error);
    return null;
  }
};

export const updateUser = (updatedUserData: Partial<User>): Promise<User> => {
    return new Promise((resolve, reject) => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            reject(new Error("No user is logged in."));
            return;
        }

        const updatedUser = { ...currentUser, ...updatedUserData };
        sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(updatedUser));
        mockUsers[currentUser.email] = updatedUser; // update in-memory "DB"
        resolve(updatedUser);
    });
};

export const getUserData = (userId: string): AllUserData | null => {
    try {
        const dataJson = localStorage.getItem(`${USER_DATA_KEY_PREFIX}${userId}`);
        return dataJson ? JSON.parse(dataJson) : null;
    } catch (error) {
        console.error('Failed to get user data from local storage', error);
        return null;
    }
};

export const saveUserData = (userId: string, data: Partial<AllUserData>): void => {
    try {
        const existingData = getUserData(userId) || {};
        const newData = { ...existingData, ...data };
        localStorage.setItem(`${USER_DATA_KEY_PREFIX}${userId}`, JSON.stringify(newData));
    } catch (error) {
        console.error('Failed to save user data to local storage', error);
    }
};