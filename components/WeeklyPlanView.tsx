import React, { useState } from 'react';
import { WeeklyPlan, DayOfWeek, NutritionPlan, Meal } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface WeeklyPlanViewProps {
  weeklyPlan: WeeklyPlan;
  onGenerateShoppingList: () => void;
}

const dayTranslations: Record<DayOfWeek, string> = {
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

const MealRow: React.FC<{ mealName: string, meal?: Meal }> = ({ mealName, meal }) => (
    <div className="py-2 px-3 odd:bg-gray-50 grid grid-cols-3 gap-2 items-center">
        <p className="font-semibold text-gray-700">{mealName}</p>
        <p className="text-sm text-gray-600 col-span-2">{meal?.name || 'N/A'}</p>
    </div>
);


const DailyPlanCard: React.FC<{ plan?: NutritionPlan }> = ({ plan }) => {
    if (!plan) {
        return <Card className="h-full p-6 text-center text-gray-500">Plano para este dia não disponível.</Card>
    }

    const macroData = [
        { name: 'Proteína', value: plan.macros?.protein || 0 },
        { name: 'Hidratos', value: plan.macros?.carbs || 0 },
        { name: 'Gordura', value: plan.macros?.fat || 0 },
    ];
    const COLORS = ['#10B981', '#3B82F6', '#F59E0B'];

    return (
        <Card className="h-full">
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Resumo do Dia</h3>
                        <div className="mt-2 text-3xl font-extrabold text-emerald-600">
                            {(plan.totalCalories || 0).toFixed(0)} <span className="text-xl font-medium text-gray-500">kcal</span>
                        </div>
                    </div>
                    <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={macroData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={50} fill="#8884d8">
                            {macroData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `${value.toFixed(0)}g`} />
                        </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div>
                     <h4 className="font-semibold text-gray-700 mb-2 border-t pt-4">Refeições</h4>
                     <div className="border rounded-lg overflow-hidden">
                        <MealRow mealName="P. Almoço" meal={plan.meals?.breakfast}/>
                        <MealRow mealName="Almoço" meal={plan.meals?.lunch}/>
                        <MealRow mealName="Jantar" meal={plan.meals?.dinner}/>
                        <MealRow mealName="Snack" meal={plan.meals?.snacks}/>
                    </div>
                </div>
            </div>
        </Card>
    );
}

const WeeklyPlanView: React.FC<WeeklyPlanViewProps> = ({ weeklyPlan, onGenerateShoppingList }) => {
  const days = Object.keys(dayTranslations) as DayOfWeek[];
  const [activeDay, setActiveDay] = useState<DayOfWeek>(days[0]);

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h2 className="text-3xl font-bold text-gray-800">O seu Plano Semanal</h2>
            <Button onClick={onGenerateShoppingList}>
                Gerar Lista de Compras
            </Button>
        </div>
      
        <Card>
            <div className="p-4 sm:p-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto" aria-label="Tabs">
                        {days.map(day => (
                            <button
                                key={day}
                                onClick={() => setActiveDay(day)}
                                className={`whitespace-nowrap py-3 px-2 sm:px-4 border-b-2 font-medium text-sm transition-colors ${
                                    activeDay === day
                                    ? 'border-emerald-500 text-emerald-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {dayTranslations[day]}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="mt-6">
                    <DailyPlanCard plan={weeklyPlan?.[activeDay]} />
                </div>
            </div>
      </Card>
    </div>
  );
};

export default WeeklyPlanView;