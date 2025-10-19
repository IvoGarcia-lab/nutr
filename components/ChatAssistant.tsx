import React, { useState, useEffect, useRef } from 'react';
import { User, NutritionPlan, ChatMessage } from '../types';
import { startChat, Chat } from '../services/geminiService';
import Card from './ui/Card';
import Button from './ui/Button';
import Loader from './ui/Loader';

interface ChatAssistantProps {
  user: User;
  plan: NutritionPlan | null;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ user, plan }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const goalMap = {
      lose_weight: 'perda de peso',
      maintain_weight: 'manutenção de peso',
      gain_muscle: 'ganho de massa muscular'
    };
    
    const systemInstruction = `
        És um assistente de nutrição simpático e prestável chamado NutriAI.
        O teu objetivo é ajudar o utilizador a seguir o seu plano, responder a perguntas sobre nutrição e dar sugestões.
        Comunica em português de Portugal. As tuas respostas devem ser concisas e fáceis de entender.

        Este é o perfil do utilizador atual:
        - Nome: ${user.name}
        - Idade: ${user.age}
        - Sexo: ${user.gender === 'male' ? 'Masculino' : 'Feminino'}
        - Peso: ${user.weight} kg
        - Altura: ${user.height} cm
        - Objetivo: ${goalMap[user.goal]}

        ${plan ? `Este é o plano nutricional diário atual do utilizador:
        ${JSON.stringify(plan, null, 2)}` : 'O utilizador ainda não gerou um plano nutricional.'}

        Usa esta informação para dar respostas personalizadas e contextuais.
        Se o utilizador pedir para alterar o plano, explica que não podes alterar o plano principal, mas podes dar sugestões de substituições ou alternativas para refeições específicas.
        Começa a conversa com uma saudação amigável.
    `;
    
    const chatInstance = startChat(systemInstruction);
    setChat(chatInstance);
    
    // Start with a greeting from the model
    handleSendMessage("Olá!", true);

  }, [user, plan]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (messageText?: string, isInitialMessage = false) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || !chat) return;

    setIsLoading(true);
    if (!isInitialMessage) {
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', text: textToSend }]);
    }
    setInput('');

    try {
      const responseStream = await chat.sendMessageStream({ message: textToSend });
      let currentModelMessage: ChatMessage | null = null;
      
      for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        if (chunkText) {
          if (!currentModelMessage) {
            // First chunk, create new message
            const newMessage = { id: crypto.randomUUID(), role: 'model' as const, text: chunkText };
            setMessages(prev => [...prev, newMessage]);
            currentModelMessage = newMessage;
          } else {
            // Subsequent chunks, update existing message
            setMessages(prev => prev.map(msg => 
              msg.id === currentModelMessage!.id 
                ? { ...msg, text: msg.text + chunkText }
                : msg
            ));
          }
        }
      }
    } catch (error) {
        console.error("Error sending message:", error);
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'model', text: 'Desculpe, ocorreu um erro. Por favor, tente novamente.' }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <Card className="h-[75vh] flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold text-gray-800">Assistente NutriAI</h2>
        <p className="text-sm text-gray-500">Converse com a IA para tirar dúvidas e receber dicas.</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-emerald-500 text-white rounded-br-none' : 'bg-white text-gray-800 shadow-sm rounded-bl-none'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start">
                <div className="max-w-lg px-4 py-3 rounded-2xl bg-white text-gray-800 shadow-sm rounded-bl-none">
                    <div className="flex items-center space-x-2">
                       <span className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                       <span className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                       <span className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce"></span>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escreva a sua mensagem..."
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()} className="rounded-full !p-3">
            {isLoading ? <Loader className="h-5 w-5 text-white animate-spin"/> : 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            }
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default ChatAssistant;
