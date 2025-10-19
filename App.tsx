import React, { useState, useEffect, useCallback } from 'react';
import NutritionForm from './components/NutritionForm';
import PlanDashboard from './components/PlanDashboard';
import ImageAnalyzer from './components/ImageAnalyzer';
import PlanHistory from './components/PlanHistory';
import ProgressTracker from './components/ProgressTracker';
import LoginScreen from './components/LoginScreen';
import ProfileScreen from './components/ProfileScreen';
import ChatAssistant from './components/ChatAssistant';
import WeeklyPlanView from './components/WeeklyPlanView';
import ShoppingListView from './components/ShoppingListView';
import { generateNutritionPlan, analyzeMealImages, generateShoppingListFromPlan } from './services/geminiService';
import * as supabaseService from './services/supabaseService';
import { NutritionPlan, UserData, MealAnalysis, CompletedMeals, PlanHistoryItem, WeightEntry, User, WeeklyPlan, ShoppingList, DayOfWeek } from './types';
import Loader from './components/ui/Loader';
import { Session } from '@supabase/supabase-js';

type View = 'dashboard' | 'form' | 'analyzer' | 'history' | 'progress' | 'profile' | 'assistant' | 'weekly' | 'shopping';

const dayTranslations: Record<DayOfWeek, string> = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  const [currentPlan, setCurrentPlan] = useState<NutritionPlan | null>(null);
  const [planHistory, setPlanHistory] = useState<PlanHistoryItem[]>([]);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [completedMeals, setCompletedMeals] = useState<CompletedMeals>({ breakfast: false, lunch: false, dinner: false, snacks: false });
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);

  const [mealAnalyses, setMealAnalyses] = useState<MealAnalysis[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>('dashboard');

  useEffect(() => {
    supabaseService.getSession().then((session) => {
      setSession(session);
      setIsAppLoading(false);
    });

    const subscription = supabaseService.onAuthStateChange((session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const resetAllData = () => {
      setCurrentPlan(null);
      setPlanHistory([]);
      setWeightHistory([]);
      setCompletedMeals({ breakfast: false, lunch: false, dinner: false, snacks: false });
      setWeeklyPlan(null);
      setShoppingList(null);
      setMealAnalyses(null);
      setActiveView('form');
  };

  useEffect(() => {
    if (session?.user) {
      setIsAppLoading(true);
      supabaseService.getFullUserData(session.user.id).then(data => {
        if (data) {
          setCurrentUser(data.user);
          const { allData } = data;
          setCurrentPlan(allData.currentPlan);
          setPlanHistory(allData.planHistory);
          setWeightHistory(allData.weightHistory);
          setCompletedMeals(allData.completedMeals);
          setWeeklyPlan(allData.weeklyPlan);
          setShoppingList(allData.shoppingList);
          setActiveView(allData.currentPlan ? 'dashboard' : 'form');
        }
        setIsAppLoading(false);
      });
    } else {
      setCurrentUser(null);
      resetAllData();
    }
  }, [session]);

  const saveDataForCurrentUser = useCallback(() => {
    if (currentUser) {
      supabaseService.updateProfile(currentUser.id, {
        currentPlan,
        planHistory,
        weightHistory,
        completedMeals,
        weeklyPlan,
        shoppingList
      });
    }
  }, [currentUser, currentPlan, planHistory, weightHistory, completedMeals, weeklyPlan, shoppingList]);
  
  useEffect(() => {
    // This effect will save data to Supabase whenever it changes.
    // In a real-world app, you might want to debounce this to avoid too many writes.
    if (!isAppLoading) {
        saveDataForCurrentUser();
    }
  }, [saveDataForCurrentUser, isAppLoading]);

  const handleApiError = (err: unknown, context: string) => {
      let errorMessage = `Ocorreu um erro ao ${context}. Por favor, tente novamente.`;
      if (err instanceof Error) {
          if (err.message.includes('API key not valid')) {
              errorMessage = 'A sua chave de API do Gemini parece ser inválida. Por favor, verifique os seus segredos.';
          } else {
              errorMessage = `Ocorreu um erro ao ${context}: ${err.message}`;
          }
      }
      setError(errorMessage);
      console.error(err);
  };

  const handleLogout = async () => {
    await supabaseService.logout();
  };
  
  const handleProfileUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    // The profile data itself is saved via a separate call in the ProfileScreen component
  };

  const handlePlanGeneration = async (userData: UserData) => {
    setIsLoading(true);
    setLoadingMessage('A gerar o seu plano diário...');
    setError(null);
    try {
      const plan = await generateNutritionPlan(userData);
      const newPlanHistoryItem = { date: new Date().toISOString(), plan };
      setCurrentPlan(plan);
      setPlanHistory(prev => [newPlanHistoryItem, ...prev]);
      setCompletedMeals({ breakfast: false, lunch: false, dinner: false, snacks: false });
      setActiveView('dashboard');
    } catch (err) {
      handleApiError(err, 'gerar o plano');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWeeklyPlanGeneration = async (userData: UserData) => {
    setIsLoading(true);
    setError(null);
    setWeeklyPlan(null);
    setShoppingList(null);

    try {
      const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const newWeeklyPlan: Partial<WeeklyPlan> = {};
      let previousMealsContext = "Este é o primeiro dia do plano semanal. Cria um plano inicial variado.";

      for (const day of days) {
        setLoadingMessage(`A gerar o plano para ${dayTranslations[day]}...`);
        const dailyPlan = await generateNutritionPlan(userData, previousMealsContext);
        newWeeklyPlan[day] = dailyPlan;

        const mealDescriptions = Object.values(dailyPlan.meals).map(m => m.name).join(', ');
        previousMealsContext = `As refeições do dia anterior foram: ${mealDescriptions}. Para o dia seguinte, cria um plano com refeições diferentes para garantir variedade.`;
      }

      setWeeklyPlan(newWeeklyPlan as WeeklyPlan);
      setActiveView('weekly');

    } catch (err) {
      handleApiError(err, 'gerar o plano semanal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShoppingListGeneration = async () => {
    if(!weeklyPlan) return;
    setIsLoading(true);
    setLoadingMessage('A criar a sua lista de compras...');
    setError(null);
    setShoppingList(null);
    try {
      const list = await generateShoppingListFromPlan(weeklyPlan);
      setShoppingList(list);
      setActiveView('shopping');
    } catch (err) {
      handleApiError(err, 'gerar a lista de compras');
    } finally {
      setIsLoading(false);
    }
  };


  const handleImageAnalysis = async (images: File[]) => {
    setIsLoading(true);
    setLoadingMessage('A analisar as suas refeições...');
    setError(null);
    setMealAnalyses(null);
    try {
      const analyses = await analyzeMealImages(images);
      setMealAnalyses(analyses);
    } catch (err) {
      handleApiError(err, 'analisar a imagem');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectPlanFromHistory = (plan: NutritionPlan) => {
    setCurrentPlan(plan);
    setCompletedMeals({ breakfast: false, lunch: false, dinner: false, snacks: false });
    setActiveView('dashboard');
  };
  
  const handleAddWeight = (weight: number) => {
    setWeightHistory(prev => [...prev, { date: new Date().toISOString(), weight }]);
  };

  const handleToggleMeal = (mealKey: keyof CompletedMeals) => {
    setCompletedMeals(prev => ({...prev, [mealKey]: !prev[mealKey]}));
  };
  
  const handleShoppingListItemToggle = (itemName: string) => {
    if (!shoppingList) return;
    const newList = shoppingList.map(item => 
      item.name === itemName ? { ...item, completed: !item.completed } : item
    );
    setShoppingList(newList);
  };

  if (isAppLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader className="h-10 w-10 text-emerald-500 animate-spin" /></div>;
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader className="animate-spin h-10 w-10 text-emerald-500" />
                <p className="mt-4 text-gray-600">{loadingMessage}</p>
            </div>
        );
    }

    if (error) {
      return <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>;
    }

    switch (activeView) {
      case 'dashboard':
        return currentPlan ? (
            <PlanDashboard plan={currentPlan} onBack={() => setActiveView('form')} completedMeals={completedMeals} onToggleMeal={handleToggleMeal}/>
        ) : (
            <NutritionForm onSubmit={handlePlanGeneration} onGenerateWeekly={handleWeeklyPlanGeneration} isLoading={isLoading} initialData={currentUser} />
        );
      case 'form':
        return <NutritionForm onSubmit={handlePlanGeneration} onGenerateWeekly={handleWeeklyPlanGeneration} isLoading={isLoading} initialData={currentUser} />;
      case 'analyzer':
        return <ImageAnalyzer onAnalyze={handleImageAnalysis} analyses={mealAnalyses} isLoading={isLoading} />;
      case 'history':
        return <PlanHistory history={planHistory} onSelectPlan={handleSelectPlanFromHistory} />;
      case 'progress':
        return <ProgressTracker history={weightHistory} onAddWeight={handleAddWeight} />;
      case 'profile':
        return <ProfileScreen user={currentUser} onLogout={handleLogout} onProfileUpdate={handleProfileUpdate} />;
      case 'assistant':
        return <ChatAssistant user={currentUser} plan={currentPlan} />;
      case 'weekly':
        return weeklyPlan ? <WeeklyPlanView weeklyPlan={weeklyPlan} onGenerateShoppingList={handleShoppingListGeneration} /> : <p>Nenhum plano semanal encontrado.</p>;
      case 'shopping':
        return shoppingList ? <ShoppingListView shoppingList={shoppingList} onItemToggle={handleShoppingListItemToggle} /> : <p>Nenhuma lista de compras encontrada.</p>;
      default:
        return null;
    }
  };
  
  const NavButton: React.FC<{view: View; label: string}> = ({view, label}) => (
    <button 
        onClick={() => {
            setActiveView(view);
            if(view !== 'analyzer') setMealAnalyses(null);
        }}
        className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${activeView === view ? 'bg-emerald-500 text-white shadow' : 'text-gray-600 hover:bg-emerald-100'}`}
    >
        {label}
    </button>
  );

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
        <header className="bg-white shadow-sm sticky top-0 z-10">
            <nav className="container mx-auto px-2 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                <h1 className="text-xl sm:text-2xl font-bold text-emerald-600">NutriAI</h1>
                <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
                    <NavButton view="dashboard" label="Hoje"/>
                    <NavButton view="weekly" label="Semana"/>
                    <NavButton view="shopping" label="Compras"/>
                    <NavButton view="assistant" label="Assistente"/>
                    <NavButton view="analyzer" label="Analisador"/>
                    <NavButton view="history" label="Histórico"/>
                    <NavButton view="progress" label="Progresso"/>
                    <NavButton view="profile" label="Perfil"/>
                </div>
            </nav>
        </header>

        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            {renderContent()}
        </main>
    </div>
  );
};

export default App;