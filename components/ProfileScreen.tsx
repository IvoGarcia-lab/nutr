
import React, { useState } from 'react';
import { User, UserData } from '../types';
import { updateUser } from '../services/mockAuthService';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import Card from './ui/Card';
import Loader from './ui/Loader';

interface ProfileScreenProps {
  user: User;
  onLogout: () => void;
  onProfileUpdate: (updatedUser: User) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout, onProfileUpdate }) => {
  const [formData, setFormData] = useState<UserData>({
    age: user.age,
    gender: user.gender,
    weight: user.weight,
    height: user.height,
    activityLevel: user.activityLevel,
    goal: user.goal,
    dietaryPreference: user.dietaryPreference,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'age' || name === 'weight' || name === 'height' ? parseFloat(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    try {
      const updatedUser = await updateUser(formData);
      onProfileUpdate(updatedUser);
      setSuccessMessage('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update profile', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-800">O seu Perfil</h2>
            <Button onClick={onLogout} variant="secondary">Terminar Sessão</Button>
        </div>
        
        <Card>
            <div className="p-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Olá, {user.name}!</h3>
                <p className="text-gray-500 mb-6">Pode ver e atualizar os seus dados pessoais aqui. Estes dados são usados para gerar os seus planos nutricionais.</p>
            </div>
        </Card>

        <Card>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <h3 className="text-xl font-semibold text-gray-700 border-b pb-4 mb-6">Os seus Dados</h3>
                
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
                
                {successMessage && <p className="text-emerald-600 bg-emerald-100 p-3 rounded-lg text-sm">{successMessage}</p>}

                <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                    {isLoading ? <Loader/> : 'Guardar Alterações'}
                </Button>
            </form>
        </Card>
    </div>
  );
};

export default ProfileScreen;
