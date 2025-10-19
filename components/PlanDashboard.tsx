import React from 'react';
import { NutritionPlan, Meal, CompletedMeals } from '../types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from './ui/Card';
import Button from './ui/Button';

interface PlanDashboardProps {
  plan: NutritionPlan;
  onBack: () => void;
  completedMeals: CompletedMeals;
  onToggleMeal: (mealKey: keyof CompletedMeals) => void;
}

interface MealCardProps {
    meal: Meal;
    title: string;
    mealKey: keyof CompletedMeals;
    bgColor: string;
    isCompleted: boolean;
    onToggle: (mealKey: keyof CompletedMeals) => void;
}

const MealCard: React.FC<MealCardProps> = ({ meal, title, mealKey, bgColor, isCompleted, onToggle }) => (
  <Card className={`flex-1 min-w-[280px] transition-all duration-300 ${isCompleted ? 'opacity-70 grayscale' : ''}`}>
    <div className={`p-4 rounded-t-lg flex justify-between items-center ${bgColor}`}>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <input 
        type="checkbox"
        checked={isCompleted}
        onChange={() => onToggle(mealKey)}
        className="form-checkbox h-6 w-6 text-emerald-400 bg-white/30 border-white/50 rounded focus:ring-emerald-300 cursor-pointer"
        aria-label={`Marcar ${title} como concluído`}
      />
    </div>
    <div className="p-4 space-y-2">
      <h4 className="font-semibold text-lg text-gray-800">{meal.name}</h4>
      <p className="text-gray-600 text-sm">{meal.description}</p>
      <div className="text-xs grid grid-cols-2 gap-2 pt-2">
          <div className="bg-gray-100 p-2 rounded"><strong>Calorias:</strong> {meal.calories.toFixed(0)}</div>
          <div className="bg-gray-100 p-2 rounded"><strong>Proteína:</strong> {meal.protein.toFixed(1)}g</div>
          <div className="bg-gray-100 p-2 rounded"><strong>Hidratos:</strong> {meal.carbs.toFixed(1)}g</div>
          <div className="bg-gray-100 p-2 rounded"><strong>Gordura:</strong> {meal.fat.toFixed(1)}g</div>
      </div>
    </div>
  </Card>
);

const PlanDashboard: React.FC<PlanDashboardProps> = ({ plan, onBack, completedMeals, onToggleMeal }) => {
  const macroData = [
    { name: 'Proteína', value: plan.macros.protein },
    { name: 'Hidratos', value: plan.macros.carbs },
    { name: 'Gordura', value: plan.macros.fat },
  ];

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B']; // Emerald, Blue, Amber
  
  const completedCount = Object.values(completedMeals).filter(Boolean).length;
  const totalMeals = Object.keys(completedMeals).length;
  const progressPercentage = (completedCount / totalMeals) * 100;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">O seu Plano Nutricional Diário</h2>
        <Button onClick={onBack} variant="secondary">Criar Novo Plano</Button>
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Progresso Diário</h3>
          <div className="flex items-center gap-4">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-emerald-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <span className="font-bold text-emerald-600">{completedCount}/{totalMeals}</span>
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Resumo Diário</h3>
            <p className="text-gray-600">Total de calorias e distribuição de macronutrientes recomendados para atingir o seu objetivo.</p>
            <div className="mt-4 text-4xl font-extrabold text-emerald-600">
              {plan.totalCalories.toFixed(0)} <span className="text-2xl font-medium text-gray-500">kcal</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}g`}/>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
      
      <div className="flex flex-wrap gap-6 justify-center">
        <MealCard meal={plan.meals.breakfast} title="Pequeno-Almoço" mealKey="breakfast" bgColor="bg-blue-500" isCompleted={completedMeals.breakfast} onToggle={onToggleMeal} />
        <MealCard meal={plan.meals.lunch} title="Almoço" mealKey="lunch" bgColor="bg-emerald-500" isCompleted={completedMeals.lunch} onToggle={onToggleMeal} />
        <MealCard meal={plan.meals.dinner} title="Jantar" mealKey="dinner" bgColor="bg-amber-500" isCompleted={completedMeals.dinner} onToggle={onToggleMeal} />
        <MealCard meal={plan.meals.snacks} title="Snacks" mealKey="snacks" bgColor="bg-indigo-500" isCompleted={completedMeals.snacks} onToggle={onToggleMeal} />
      </div>
    </div>
  );
};

export default PlanDashboard;
