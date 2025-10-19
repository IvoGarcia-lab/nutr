import { GoogleGenAI, Type, Chat as GeminiChat } from "@google/genai";
import { UserData, NutritionPlan, MealAnalysis, WeeklyPlan, ShoppingList, DayOfWeek } from '../types';

// According to guidelines, initialize with apiKey from env var.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Re-export Chat type for use in components
export type Chat = GeminiChat;

// Helper to convert File to Gemini's format
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

// --- Schemas for JSON responses ---

const mealSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        calories: { type: Type.NUMBER },
        protein: { type: Type.NUMBER },
        carbs: { type: Type.NUMBER },
        fat: { type: Type.NUMBER },
    },
    required: ['name', 'description', 'calories', 'protein', 'carbs', 'fat']
};

const nutritionPlanSchema = {
    type: Type.OBJECT,
    properties: {
        totalCalories: { type: Type.NUMBER },
        macros: {
            type: Type.OBJECT,
            properties: {
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fat: { type: Type.NUMBER },
            },
            required: ['protein', 'carbs', 'fat']
        },
        meals: {
            type: Type.OBJECT,
            properties: {
                breakfast: mealSchema,
                lunch: mealSchema,
                dinner: mealSchema,
                snacks: mealSchema,
            },
            required: ['breakfast', 'lunch', 'dinner', 'snacks']
        }
    },
    required: ['totalCalories', 'macros', 'meals']
};

// --- API Functions ---

export const generateNutritionPlan = async (userData: UserData, weeklyContext?: string): Promise<NutritionPlan> => {
    const goalMap = {
        lose_weight: 'perder peso',
        maintain_weight: 'manter o peso',
        gain_muscle: 'ganhar massa muscular'
    };
    const activityMap = {
        sedentary: 'Sedentário (pouco ou nenhum exercício)',
        light: 'Levemente Ativo (exercício leve 1-3 dias/semana)',
        moderate: 'Moderadamente Ativo (exercício moderado 3-5 dias/semana)',
        active: 'Muito Ativo (exercício intenso 6-7 dias/semana)',
        very_active: 'Extremamente Ativo (trabalho físico + exercício intenso)'
    };

    const basePrompt = `Crie um plano nutricional detalhado para um dia, em português de Portugal, para uma pessoa com as seguintes características:
- Idade: ${userData.age}
- Sexo: ${userData.gender === 'male' ? 'Masculino' : 'Feminino'}
- Peso: ${userData.weight} kg
- Altura: ${userData.height} cm
- Nível de Atividade: ${activityMap[userData.activityLevel]}
- Objetivo: ${goalMap[userData.goal]}
- Preferência Alimentar: ${userData.dietaryPreference === 'none' ? 'Nenhuma' : userData.dietaryPreference}

O plano deve incluir o total de calorias e a distribuição de macronutrientes (proteínas, hidratos de carbono, gorduras).
Deve detalhar 4 refeições: pequeno-almoço, almoço, jantar e snacks.
Para cada refeição, forneça o nome do prato, uma breve descrição, e a estimativa de calorias, proteínas, hidratos de carbono e gorduras.`;

    const fullPrompt = weeklyContext 
        ? `${basePrompt}\n\nContexto semanal: ${weeklyContext}\n\nResponda apenas com o objeto JSON formatado de acordo com o schema fornecido.`
        : `${basePrompt}\n\nResponda apenas com o objeto JSON formatado de acordo com o schema fornecido.`;


    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: nutritionPlanSchema,
        },
    });
    
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as NutritionPlan;
};

export const generateShoppingListFromPlan = async (weeklyPlan: WeeklyPlan): Promise<ShoppingList> => {
    // Simplify the plan to reduce prompt size and avoid API errors
    const simplifiedPlan = (Object.keys(weeklyPlan) as DayOfWeek[]).reduce((acc, day) => {
        const dailyPlan = weeklyPlan[day];
        if(dailyPlan && dailyPlan.meals) {
            acc[day] = {
                breakfast: dailyPlan.meals.breakfast?.description || '',
                lunch: dailyPlan.meals.lunch?.description || '',
                dinner: dailyPlan.meals.dinner?.description || '',
                snacks: dailyPlan.meals.snacks?.description || '',
            };
        }
        return acc;
    }, {} as Record<string, any>);


    const prompt = `Com base no seguinte resumo de um plano nutricional semanal, crie uma lista de compras agregada e organizada por categorias. Some as quantidades de ingredientes idênticos necessários para toda a semana. Comunique em português de Portugal.

Plano Semanal (resumo):
${JSON.stringify(simplifiedPlan)}

Categorias sugeridas: Frutas e Legumes, Carne e Peixe, Laticínios e Ovos, Padaria e Cereais, Despensa (ex: enlatados, azeite, especiarias), Outros.
Para cada item, forneça o nome, a quantidade total para a semana (com unidade), a categoria e o estado 'completed' como 'false'.
Responda apenas com o array de objetos JSON.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    const jsonStr = response.text.trim().replace(/```json|```/g, '');
    return JSON.parse(jsonStr) as ShoppingList;
};

export const analyzeMealImages = async (images: File[]): Promise<MealAnalysis[]> => {
    const imageParts = await Promise.all(images.map(fileToGenerativePart));

    const prompt = `Analise a(s) imagem(s) de refeição fornecida(s). Para cada imagem, identifique a refeição, forneça uma breve descrição dos alimentos visíveis, e faça uma estimativa das calorias totais e da distribuição de macronutrientes (proteínas, hidratos de carbono, gorduras) em gramas. Comunique em português de Portugal. Retorne uma lista de objetos JSON, um para cada imagem. Se houver apenas uma imagem, retorne uma lista com um único objeto.`;

    const contents = { parts: [...imageParts, { text: prompt }] };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', // Flash model supports multimodal input
        contents,
    });

    const jsonStr = response.text.trim().replace(/```json|```/g, '');
    return JSON.parse(jsonStr) as MealAnalysis[];
};

export const startChat = (systemInstruction: string): Chat => {
  const chat: Chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
    },
  });
  return chat;
};