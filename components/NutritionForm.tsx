import React, { useState } from 'react';
import { UserData } from '../types';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import Card from './ui/Card';

interface NutritionFormProps {
  onSubmit: (data: UserData) => void;
  onGenerateWeekly: (data: UserData) => void;
  isLoading: boolean;
  initialData?: Partial<UserData>;
}

const NutritionForm: React.FC<NutritionFormProps> = ({ onSubmit, onGenerateWeekly, isLoading, initialData }) => {
  const [formData, setFormData] = useState<UserData>({
    age: initialData?.age || 30,
    gender: initialData?.gender || 'male',
    weight: initialData?.weight || 70,
    height: initialData?.height || 175,
    activityLevel: initialData?.activityLevel || 'moderate',
    goal: initialData?.goal || 'maintain_weight',
    dietaryPreference: initialData?.dietaryPreference || 'none',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'age' || name === 'weight' || name === 'height' ? parseFloat(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  const handleWeeklySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateWeekly(formData);
  };

  return (
    <Card>
      <form className="p-8 space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center">Crie o Seu Plano Personalizado</h2>
        <p className="text-center text-gray-500">Forneça os seus dados para a IA gerar um plano nutricional à sua medida.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Idade" name="age" type="number" value={formData.age} onChange={handleChange} required min="1" />
          <Select
            label="Sexo"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            options={[
              { value: 'male', label: 'Masculino' },
              { value: 'female', label: 'Feminino' },
            ]}
          />
          <Input label="Peso (kg)" name="weight" type="number" value={formData.weight} onChange={handleChange} required min="1" step="0.1" />
          <Input label="Altura (cm)" name="height" type="number" value={formData.height} onChange={handleChange} required min="1" />
        </div>
        
        <Select
          label="Nível de Atividade Física"
          name="activityLevel"
          value={formData.activityLevel}
          onChange={handleChange}
          options={[
            { value: 'sedentary', label: 'Sedentário (pouco ou nenhum exercício)' },
            { value: 'light', label: 'Levemente Ativo (exercício leve 1-3 dias/semana)' },
            { value: 'moderate', label: 'Moderadamente Ativo (exercício moderado 3-5 dias/semana)' },
            { value: 'active', label: 'Muito Ativo (exercício intenso 6-7 dias/semana)' },
            { value: 'very_active', label: 'Extremamente Ativo (trabalho físico + exercício intenso)' },
          ]}
        />
        
        <Select
          label="Qual o seu objetivo?"
          name="goal"
          value={formData.goal}
          onChange={handleChange}
          options={[
            { value: 'lose_weight', label: 'Perder Peso' },
            { value: 'maintain_weight', label: 'Manter o Peso' },
            { value: 'gain_muscle', label: 'Ganhar Massa Muscular' },
          ]}
        />

        <Select
          label="Preferência Alimentar (opcional)"
          name="dietaryPreference"
          value={formData.dietaryPreference}
          onChange={handleChange}
          options={[
            { value: 'none', label: 'Nenhuma' },
            { value: 'vegetarian', label: 'Vegetariano' },
            { value: 'vegan', label: 'Vegan' },
            { value: 'gluten_free', label: 'Sem Glúten' },
          ]}
        />
        
        <div className="flex flex-col sm:flex-row gap-4">
            <Button type="button" onClick={handleSubmit} disabled={isLoading} className="w-full">
              {isLoading ? 'A gerar...' : 'Gerar Plano de Hoje'}
            </Button>
            <Button type="button" onClick={handleWeeklySubmit} disabled={isLoading} variant="secondary" className="w-full">
              {isLoading ? 'A gerar...' : 'Gerar Plano Semanal'}
            </Button>
        </div>
      </form>
    </Card>
  );
};

export default NutritionForm;