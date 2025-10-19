
import React, { useState } from 'react';
import { login } from '../services/mockAuthService';
import { User } from '../types';
import Input from './ui/Input';
import Button from './ui/Button';
import Card from './ui/Card';
import Loader from './ui/Loader';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const user = await login(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao fazer login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card className="animate-fade-in">
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-emerald-600">NutriAI</h1>
                <p className="text-gray-500 mt-2">O seu assistente de nutrição pessoal.</p>
            </div>
            {error && <p className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-lg">{error}</p>}
            
            <Input
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="password123"
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader /> : 'Entrar'}
            </Button>
            <p className="text-xs text-gray-400 text-center">Use <strong className="text-gray-500">user@example.com</strong> e <strong className="text-gray-500">password123</strong> para testar.</p>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginScreen;
