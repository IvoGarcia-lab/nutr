import { supabase } from './supabaseClient';
import { User, AllUserData, UserData } from '../types';
import { Session } from '@supabase/supabase-js';

// --- Auth Functions ---

export const signUp = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: name,
            }
        }
    });
    if (error) throw error;
    return data.user;
};

export const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data.user;
};

export const logout = async () => {
    await supabase.auth.signOut();
};

export const getSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
};

export const onAuthStateChange = (callback: (session: Session | null) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session);
    });
    return subscription;
};


// --- Data Functions ---

const mapToAppUser = (supabaseUser: any, profile: any): User => {
    return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: profile?.name || supabaseUser.user_metadata?.name || '',
        age: profile?.age || 30,
        gender: profile?.gender || 'male',
        weight: profile?.weight || 70,
        height: profile?.height || 175,
        activityLevel: profile?.activity_level || 'moderate',
        goal: profile?.goal || 'maintain_weight',
        dietaryPreference: profile?.dietary_preference || 'none',
    };
};

const mapToAllUserData = (profile: any): AllUserData => {
    return {
        currentPlan: profile?.current_plan || null,
        planHistory: profile?.plan_history || [],
        weightHistory: profile?.weight_history || [],
        completedMeals: profile?.completed_meals || { breakfast: false, lunch: false, dinner: false, snacks: false },
        weeklyPlan: profile?.weekly_plan || null,
        shoppingList: profile?.shopping_list || null,
    };
};


export const getFullUserData = async (userId: string): Promise<{ user: User, allData: AllUserData } | null> => {
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser?.user) return null;

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        // It's possible the profile doesn't exist yet if the trigger is slow
        // Return a default structure
        const appUser = mapToAppUser(authUser.user, {});
        const allUserData = mapToAllUserData({});
        return { user: appUser, allData: allUserData };
    }
    
    const appUser = mapToAppUser(authUser.user, profile);
    const allUserData = mapToAllUserData(profile);

    return { user: appUser, allData: allUserData };
};

export const updateProfile = async (userId: string, data: Partial<AllUserData & User>) => {
    const profileData = {
        name: data.name,
        age: data.age,
        gender: data.gender,
        weight: data.weight,
        height: data.height,
        activity_level: data.activityLevel,
        goal: data.goal,
        dietary_preference: data.dietaryPreference,
        current_plan: data.currentPlan,
        plan_history: data.planHistory,
        weight_history: data.weightHistory,
        completed_meals: data.completedMeals,
        weekly_plan: data.weeklyPlan,
        shopping_list: data.shoppingList,
    };

    Object.keys(profileData).forEach(key => (profileData as any)[key] === undefined && delete (profileData as any)[key]);

    const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId);

    if (error) throw error;
};