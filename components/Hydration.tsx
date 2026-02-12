
import React, { useState, useEffect, useMemo } from 'react';
import { Droplets, Plus, Minus, AlertCircle, Sparkles, RefreshCw, Activity, Info } from 'lucide-react';
import { NexusTheme, UserProfile, HealthStats } from '../types';
import { getHydrationInsight } from '../services/geminiService';

interface HydrationProps {
  water: number;
  updateWater: (amount: number) => void;
  currentTheme: NexusTheme;
  user?: UserProfile;
  stats?: HealthStats;
}

const Hydration: React.FC<HydrationProps> = ({ water, updateWater, currentTheme: t, user, stats }) => {
  const isLight = document.body.classList.contains('light-mode');
  const goal = 3.0;
  const percentage = Math.min((water / goal) * 100, 100);

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const statusInfo = useMemo(() => {
    if (percentage < 30) return { label: 'Crítico', color: '#ef4444', message: 'Atenção imediata: Níveis críticos de desidratação.' };
    if (percentage < 60) return { label: 'Baixo', color: '#f59e0b', message: 'Hidratação insuficiente para manutenção cognitiva.' };
    if (percentage < 90) return { label: 'Otimizando', color: t.primary, message: 'Protocolo em andamento. Quase lá.' };
    return { label: 'Sincronizado', color: '#10b981', message: 'Equilíbrio hídrico ideal atingido.' };
  }, [percentage, t.primary]);

  const adjustWater = (amount: number) => {
    updateWater(Math.max(0, parseFloat((water + amount).toFixed(2))));
  };

  const fetchAiInsight = async () => {
    if (!user) return;
    setLoadingAi(true);
    const insight = await getHydrationInsight(water, stats?.history || [], user);
    setAiInsight(insight);
    setLoadingAi(false);
  };

  useEffect(() => {
    if (water > 0 && !aiInsight) {
      // Pequeno delay para não sobrecarregar
      const timer = setTimeout(fetchAiInsight, 1000);
      return () => clearTimeout(timer);
    }
  }, [water]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Dynamic Alert Banner */}
      <div 
        className="glass-card p-4 rounded-2xl border-l-4 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-700"
        style={{ borderLeftColor: statusInfo.color }}
      >
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full" style={{ backgroundColor: `${statusInfo.color}15`, color: statusInfo.color }}>
            <AlertCircle size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: statusInfo.color }}>{statusInfo.label}</span>
            <p className="text-xs font-bold text-zinc-400">{statusInfo.message}</p>
          </div>
        </div>
        <div className="hidden md:block">
           <span className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter">Fluxo {percentage.toFixed(0)}%</span>
        </div>
      </div>

      <div className="flex justify-between items-end px-1">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight light-mode:text-slate-900 leading-none">Hidratação</h2>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Gestão de fluidos e equilíbrio biológico</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-10 rounded-[32px] flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500"
             style={{ borderColor: `${t.metrics.water}20` }}>
          <div 
            className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-in-out opacity-20"
            style={{ height: `${percentage}%`, backgroundColor: t.metrics.water }}
          />
          
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div 
              className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500"
              style={{ backgroundColor: `${t.metrics.water}15`, color: t.metrics.water, boxShadow: `0 20px 40px ${t.metrics.water}20` }}
            >
              <Droplets size={48} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-7xl font-black text-white light-mode:text-slate-900 tabular-nums">{water.toFixed(1)}</span>
              <span className="text-xl text-zinc-500 font-bold uppercase tracking-tighter">Litros</span>
            </div>
            <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em]">Meta Diária: {goal}L</p>
            
            <div className="w-48 h-2 bg-white/5 light-mode:bg-slate-100 rounded-full overflow-hidden mt-6">
              <div 
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${percentage}%`, backgroundColor: t.metrics.water }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-8 rounded-3xl space-y-8 border-white/5">
            <h3 className="text-xl font-bold text-white light-mode:text-slate-900">Protocolo de Carga</h3>
            <div className="grid grid-cols-2 gap-4">
              {[0.25, 0.5, 0.75, 1.0].map((amount) => (
                <button 
                  key={amount}
                  onClick={() => adjustWater(amount)}
                  className="p-6 bg-white/5 light-mode:bg-slate-50 border border-white/5 light-mode:border-slate-100 rounded-2xl flex flex-col items-center gap-3 hover:scale-105 transition-all group"
                  style={{ '--hover-color': t.metrics.water } as any}
                >
                  <Plus className="transition-transform group-hover:scale-125" size={20} style={{ color: t.metrics.water }} />
                  <span className="text-white light-mode:text-slate-900 font-bold text-sm">{amount * 1000}ml</span>
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => adjustWater(-0.25)}
                className="flex-1 py-4 bg-white/5 light-mode:bg-slate-100 border border-white/5 light-mode:border-slate-200 rounded-2xl text-zinc-500 hover:text-white light-mode:hover:text-slate-900 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
              >
                <Minus size={18} /> Remover 250ml
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Card at the bottom */}
      <section className="glass-card rounded-[2rem] border-white/5 overflow-hidden transition-all duration-500 hover:border-indigo-500/20">
        <div className="p-8 flex flex-col md:flex-row items-center gap-8">
           <div className="w-20 h-20 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 relative flex-shrink-0">
              <Sparkles size={32} className="animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-ping" />
           </div>
           
           <div className="flex-1 space-y-3 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Nexus Intelligence</h4>
                 <div className="w-1 h-1 rounded-full bg-zinc-800" />
                 <span className="text-[8px] font-black text-indigo-500 uppercase">Análise de Fluxo</span>
              </div>
              
              {loadingAi ? (
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <RefreshCw size={14} className="text-zinc-700 animate-spin" />
                  <p className="text-xs font-bold text-zinc-700 uppercase tracking-widest italic">Processando biomarcadores...</p>
                </div>
              ) : (
                <p className="text-sm font-medium text-zinc-300 leading-relaxed max-w-2xl">
                  {aiInsight || "Aguardando sincronização de dados para gerar insights de regulação neural via hidratação."}
                </p>
              )}
           </div>

           <button 
            onClick={fetchAiInsight}
            disabled={loadingAi}
            className="p-4 bg-white/5 border border-white/10 rounded-2xl text-zinc-500 hover:text-white transition-all active:scale-90"
           >
              <RefreshCw size={18} className={loadingAi ? 'animate-spin' : ''} />
           </button>
        </div>
        
        <div className="px-8 pb-6 flex items-center gap-4">
           <div className="flex-1 h-px bg-white/5" />
           <div className="flex items-center gap-2 text-[8px] font-black text-zinc-700 uppercase tracking-widest">
              <Info size={10} />
              Sincronizado com Histórico de Performance
           </div>
           <div className="flex-1 h-px bg-white/5" />
        </div>
      </section>
    </div>
  );
};

export default Hydration;
