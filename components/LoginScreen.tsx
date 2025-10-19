import React, { useState } from 'react';
import { login, signUp } from '../services/supabaseService';
import Input from './ui/Input';
import Button from './ui/Button';
import Card from './ui/Card';
import Loader from './ui/Loader';

const LoginScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      if (isSignUp) {
        if (!name) {
            setError('Por favor, introduza o seu nome.');
            setIsLoading(false);
            return;
        }
        await signUp(name, email, password);
        setMessage('Conta criada! Por favor, verifique o seu email para confirmar a sua conta antes de fazer login.');
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      const errorMessage = err.message === 'Invalid login credentials' 
        ? 'Email ou password inválidos.'
        : err.message;
      setError(errorMessage || `Ocorreu um erro ao ${isSignUp ? 'criar a conta' : 'fazer login'}.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card className="animate-fade-in">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-emerald-600">NutriAI</h1>
                <p className="text-gray-500 mt-2">{isSignUp ? 'Crie a sua conta para começar' : 'O seu assistente de nutrição pessoal'}</p>
            </div>
            {error && <p className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-lg">{error}</p>}
            {message && <p className="text-emerald-600 text-sm text-center bg-emerald-100 p-3 rounded-lg">{message}</p>}
            
            {isSignUp && (
                <Input
                    label="Nome"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="O seu nome completo"
                />
            )}
            <Input
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@exemplo.com"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Pelo menos 6 caracteres"
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader /> : (isSignUp ? 'Criar Conta' : 'Entrar')}
            </Button>
            <p className="text-sm text-gray-500 text-center">
                {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
                <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }} className="font-semibold text-emerald-600 hover:underline ml-1">
                    {isSignUp ? 'Faça login' : 'Crie uma'}
                </button>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginScreen;