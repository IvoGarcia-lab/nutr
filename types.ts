export interface Meal {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionPlan {
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks: Meal;
  };
}

export interface UserData {
  age: number;
  gender: 'male' | 'female';
  weight: number;
  height: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose_weight' | 'maintain_weight' | 'gain_muscle';
  dietaryPreference: 'none' | 'vegetarian' | 'vegan' | 'gluten_free';
}

export interface User extends UserData {
    id: string;
    name: string;
    email: string;
}

export interface MealAnalysis {
  mealName: string;
  description: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface CompletedMeals {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  snacks: boolean;
}

export interface PlanHistoryItem {
    date: string;
    plan: NutritionPlan;
}

export interface WeightEntry {
    date: string;
    weight: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type WeeklyPlan = {
  [key in DayOfWeek]: NutritionPlan;
};

export interface ShoppingListItem {
  name: string;
  quantity: string;
  category: string;
  completed: boolean;
}

export type ShoppingList = ShoppingListItem[];


export interface AllUserData {
    currentPlan: NutritionPlan | null;
    planHistory: PlanHistoryItem[];
    weightHistory: WeightEntry[];
    completedMeals: CompletedMeals;
    weeklyPlan: WeeklyPlan | null;
    shoppingList: ShoppingList | null;
}