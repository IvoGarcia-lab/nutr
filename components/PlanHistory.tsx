import React from 'react';
import { PlanHistoryItem, NutritionPlan } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';

interface PlanHistoryProps {
  history: PlanHistoryItem[];
  onSelectPlan: (plan: NutritionPlan) => void;
}

const PlanHistory: React.FC<PlanHistoryProps> = ({ history, onSelectPlan }) => {
  if (history.length === 0) {
    return (
      <Card>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-700">Histórico de Planos</h2>
          <p className="mt-4 text-gray-500">Ainda não gerou nenhum plano. Crie o seu primeiro plano para o ver aqui!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800">Histórico de Planos</h2>
      {history.map((item, index) => (
        <Card key={index} className="hover:shadow-xl transition-shadow">
          <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <p className="font-bold text-lg text-emerald-600">
                {new Date(item.date).toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-gray-600">
                Plano de <span className="font-semibold">{item.plan.totalCalories.toFixed(0)} kcal</span>
              </p>
            </div>
            <Button onClick={() => onSelectPlan(item.plan)}>
              Usar Este Plano
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PlanHistory;
