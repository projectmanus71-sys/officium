
import React, { useState, useEffect } from 'react';
import { Sparkles, Send, BrainCircuit, RefreshCw, AlertCircle } from 'lucide-react';
import { getWellnessInsights } from '../services/geminiService';
import { Habit, HealthStats, Task, UserProfile } from '../types';

interface AIAssistantProps {
  stats: HealthStats;
  habits: Habit[];
  tasks: Task[];
  user: UserProfile;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ stats, habits, tasks, user }) => {
  const [insight, setInsight] = useState<string | null>(() => {
    return localStorage.getItem('nexus_last_insight');
  });
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const generate = async () => {
    setLoading(true);
    const result = await getWellnessInsights(stats, habits, tasks, user);
    if (result) {
      setInsight(result);
      localStorage.setItem('nexus_last_insight', result);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!insight) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-10 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-500/20 rounded-3xl border border-indigo-500/30 text-indigo-400 mb-4 animate-pulse">
          <BrainCircuit size={48} />
        </div>
        <h2 className="text-4xl font-bold text-white tracking-tight">Nexus Intelligence</h2>
        <p className="text-zinc-500 max-w-lg mx-auto">
          Análise circadiana personalizada para o perfil de {user.name.split(' ')[0]}.
        </p>
      </div>

      <div className="glass-card p-10 rounded-[3rem] space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="text-yellow-500" size={24} />
            <h3 className="text-xl font-black text-white uppercase tracking-widest">Estratégia de Performance</h3>
          </div>
          <button 
            onClick={generate}
            disabled={loading}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-6">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
            </div>
            <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em] animate-pulse">Processando Bio-Dados de {user.name.split(' ')[0]}...</p>
          </div>
        ) : insight ? (
          <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed whitespace-pre-wrap font-medium">
            {insight}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-400 py-4 justify-center">
            <AlertCircle size={20} />
            <span className="font-bold">Falha na sintonização neural. Tente novamente.</span>
          </div>
        )}

        <div className="pt-8 border-t border-white/5 flex gap-4">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pergunte ao Nexus sobre sua performance..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:border-indigo-500/50 transition-all text-sm font-bold"
            />
          </div>
          <button className="bg-white text-black font-black px-8 py-5 rounded-2xl hover:bg-zinc-200 transition-all flex items-center gap-2 group uppercase text-[10px] tracking-widest shadow-xl">
            <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
