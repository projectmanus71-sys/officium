
import { GoogleGenAI, Type } from "@google/genai";
import { Habit, HealthStats, Task, UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Generates personalized health and wellness insights
export const getWellnessInsights = async (
  stats: HealthStats,
  habits: Habit[],
  tasks: Task[],
  user: UserProfile | null
) => {
  if (!navigator.onLine) {
    return "O Officium está operando em modo offline. Conecte-se à rede para receber novos insights da Nexus Intelligence.";
  }

  const model = "gemini-3-pro-preview";
  
  const today = new Date().toLocaleDateString('sv-SE');
  const dayOfWeek = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
  const userName = user?.name || "Membro Officium";
  
  const habitsStatus = habits.map(h => {
    const done = h.completedDays.includes(today);
    return `${h.name} (${h.category}): ${done ? 'Concluído' : 'Pendente'}`;
  }).join('\n');

  const activeTasks = tasks.filter(t => t.date === today);
  const tasksStatus = activeTasks.map(t => `${t.title} [${t.priority}]: ${t.completed ? 'Feito' : 'A fazer'}`).join('\n');

  const prompt = `
    Aja como um coach de alto desempenho e especialista em biohacking para o app Officium.
    Você está conversando com ${userName}.
    
    Analise os dados reais de ${userName} para hoje (${dayOfWeek}):

    ESTATÍSTICAS VITAIS:
    - Hidratação: ${stats.water}L (Meta 3L)
    - Sono: ${stats.sleep}h (Meta 8h)
    - Energia: ${stats.energy}/10
    - Cafeína: ${stats.caffeine} doses
    - Bateria Social: ${stats.socialBattery}

    HÁBITOS DE HOJE:
    ${habitsStatus || 'Nenhum hábito configurado.'}

    PLANEJAMENTO (Hoje):
    ${tasksStatus || 'Nenhuma tarefa planejada para hoje.'}

    INSTRUÇÕES:
    1. Forneça um feedback personalizado para ${userName}.
    2. Correlacione os dados de sono e energia com as tarefas pendentes.
    3. Idioma: Português Brasileiro.
    4. Use Markdown.

    Estrutura:
    - "Estado de Performance de ${userName}"
    - "Estratégia Neural do Dia"
    - "Otimização para Amanhã"
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.8,
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error fetching AI insights:", error);
    return "O Nexus Intelligence está temporariamente indisponível. Continue seguindo o protocolo local.";
  }
};

// Nova Análise de Hidratação Inteligente
export const getHydrationInsight = async (water: number, history: any[], user: UserProfile) => {
  if (!navigator.onLine) return "Sincronização offline.";

  const model = "gemini-3-flash-preview";
  const hour = new Date().getHours();
  const goal = 3.0;
  
  const prompt = `
    Análise de Hidratação para ${user.name}:
    - Consumo Atual: ${water}L de uma meta de ${goal}L.
    - Hora do dia: ${hour}h.
    - Histórico recente: ${JSON.stringify(history.slice(-3))}.

    Como um assistente de biohacking, dê um conselho ultra-curto e motivador (máximo 20 palavras) focado em regulação hídrica e clareza mental. Use um tom de alta performance.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { temperature: 0.7 }
    });
    return response.text;
  } catch (error) {
    return "Mantenha o fluxo hídrico constante.";
  }
};

// ASI: Análise de Sono Inteligente
export const getSleepEnergyAnalysis = async (stats: HealthStats, user: UserProfile) => {
  if (!navigator.onLine) return "Conecte-se para ativar a ASI.";

  const model = "gemini-3-flash-preview";
  const prompt = `
    Analise a relação entre Sono e Energia de ${user.name}:
    Dados: Sono ${stats.sleep}h, Energia ${stats.energy}/10, Cafeína ${stats.caffeine} doses.
    
    Forneça um insight curto (máx 3 frases) em Português sobre como o sono afetou a vitalidade de hoje. 
    Seja técnico mas direto (mencione ciclo circadiano ou adenosina se relevante).
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { temperature: 0.7 }
    });
    return response.text;
  } catch (error) {
    return "Falha na sintonização ASI.";
  }
};

// Generates a custom logo/icon variation based on the brand's aesthetics
export const generateBrandAsset = async (promptDescription: string) => {
  if (!navigator.onLine) return null;

  const model = 'gemini-2.5-flash-image';
  const fullPrompt = `High-end minimalist logo icon for a wellness ecosystem named "Officium". 
  Visual style: Cyber-indigo palette, futuristic bio-tech fusion, dark glassmorphism background, glowing edges, symmetric geometry. 
  Specific variation: ${promptDescription}. 
  Professional design, vector aesthetic, high contrast, luxury look.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: fullPrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating brand asset:", error);
    return null;
  }
};

// Searches for book metadata including author name and cover image URL
export const searchBookCover = async (title: string, author?: string) => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Atue como um especialista em metadados literários. Encontre as informações exatas para o livro: "${title}"${author ? ` do autor ${author}` : ''}.
  
  REQUISITOS:
  1. Identifique o nome completo e correto do autor.
  2. Forneça uma URL direta e pública para a imagem da capa (preferencialmente de serviços como Google Books, OpenLibrary ou Amazon). A URL deve ser funcional e apontar para a imagem.
  3. Encontre o número total de páginas médio desta obra.
  
  Retorne apenas JSON.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            image_url: {
              type: Type.STRING,
              description: "URL pública direta para a imagem da capa do livro",
            },
            author_name: {
              type: Type.STRING,
              description: "O nome completo oficial do autor",
            },
            total_pages: {
              type: Type.NUMBER,
              description: "O número total de páginas do livro",
            },
          },
          required: ["image_url", "author_name", "total_pages"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
    return null;
  } catch (error) {
    console.error("Error searching book cover:", error);
    return null;
  }
};
