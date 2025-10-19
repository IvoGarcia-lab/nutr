import React, { useState } from 'react';
import { WeightEntry } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';

interface ProgressTrackerProps {
  history: WeightEntry[];
  onAddWeight: (weight: number) => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ history, onAddWeight }) => {
  const [weightInput, setWeightInput] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weight = parseFloat(weightInput);
    if (!isNaN(weight) && weight > 0) {
      onAddWeight(weight);
      setWeightInput('');
    }
  };

  const chartData = history.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }),
    Peso: entry.weight,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800">Acompanhamento de Progresso</h2>
      
      <Card>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col md:flex-row items-end gap-4">
          <div className="flex-grow">
            <Input
              label="Registar Peso Atual (kg)"
              type="number"
              name="weight"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="Ex: 70.5"
              step="0.1"
              required
            />
          </div>
          <Button type="submit">Adicionar Registo</Button>
        </form>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Evolução do Peso</h3>
          {history.length > 1 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Peso" stroke="#10B981" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-12">
              {history.length === 1 ? 'Adicione mais um registo para começar a ver o gráfico da sua evolução.' : 'Ainda não tem registos de peso. Adicione o seu primeiro registo para começar.'}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProgressTracker;
