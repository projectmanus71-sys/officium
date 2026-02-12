
import React, { useState, useEffect } from 'react';
import { Moon, Zap, Coffee, Activity, RefreshCw, Clock, ChevronDown, ChevronUp, BarChart } from 'lucide-react';
import { HealthStats, NexusTheme, UserProfile } from '../types';
import { getSleepEnergyAnalysis } from '../services/geminiService';

interface SleepEnergyProps {
  sleep: number;
  energy: number;
  caffeine: number;
  socialBattery: HealthStats['socialBattery'];
  bedTime: string;
  wakeTime: string;
  updateSleep: (h: number) => void;
  updateEnergy: (e: number) => void;
  updateCaffeine: (c: number) => void;
  updateSocialBattery: (sb: HealthStats['socialBattery']) => void;
  updateTimes: (bed: string, wake: string) => void;
  currentTheme: NexusTheme;
  user: UserProfile;
}

const SleepEnergy: React.FC<SleepEnergyProps> = ({ 
  sleep, 
  energy, 
  caffeine, 
  socialBattery, 
  bedTime,
  wakeTime,
  updateSleep, 
  updateEnergy, 
  updateCaffeine, 
  updateSocialBattery,
  updateTimes,
  currentTheme: t,
  user
}) => {
  const isLight = document.body.classList.contains('light-mode');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTimeChange = (type: 'bed' | 'wake', value: string) => {
    const newBed = type === 'bed' ? value : bedTime;
    const newWake = type === 'wake' ? value : wakeTime;
    
    // Cálculo de diferença
    const [bH, bM] = newBed.split(':').map(Number);
    const [wH, wM] = newWake.split(':').map(Number);
    
    let diff = (wH + wM / 60) - (bH + bM / 60);
    if (diff < 0) diff += 24;
    
    const rounded = parseFloat(diff.toFixed(1));
    updateTimes(newBed, newWake);
    updateSleep(rounded);
  };

  const runASI = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingAnalysis(true);
    setIsExpanded(true);
    const result = await getSleepEnergyAnalysis({ sleep, energy, caffeine } as HealthStats, user);
    setAnalysis(result || "Dados insuficientes para processamento.");
    setLoadingAnalysis(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter light-mode:text-slate-900">Sono & Energia</h2>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Protocolo de Recuperação Biológica</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sleep Card */}
        <div className="glass-card p-8 rounded-[2rem] space-y-8 relative overflow-hidden transition-all duration-500 border-white/5">
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 rounded-xl bg-white/5 light-mode:bg-slate-100 text-zinc-400">
              <Moon size={20} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">Ciclo Circadiano</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="space-y-2">
              <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Início do Repouso</label>
              <input 
                type="time" 
                value={bedTime}
                onChange={(e) => handleTimeChange('bed', e.target.value)}
                className="w-full bg-white/5 light-mode:bg-white border border-white/10 light-mode:border-slate-200 rounded-xl px-4 py-3 text-white light-mode:text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Despertar Ativo</label>
              <input 
                type="time" 
                value={wakeTime}
                onChange={(e) => handleTimeChange('wake', e.target.value)}
                className="w-full bg-white/5 light-mode:bg-white border border-white/10 light-mode:border-slate-200 rounded-xl px-4 py-3 text-white light-mode:text-slate-900 font-bold outline-none focus:border-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col items-center py-4 relative z-10">
            <div className="text-7xl font-black text-white light-mode:text-slate-900 tabular-nums flex items-baseline">
              {sleep.toFixed(1)}
              <span className="text-lg text-zinc-600 font-bold ml-2">h</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full mt-6 overflow-hidden">
               <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${Math.min((sleep / 8) * 100, 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Energy Card */}
        <div className="glass-card p-8 rounded-[2rem] space-y-8 relative overflow-hidden transition-all duration-500 border-white/5">
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 rounded-xl bg-white/5 light-mode:bg-slate-100 text-zinc-400">
              <Zap size={20} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">Nível de Vitalidade</h3>
          </div>

          <div className="flex flex-col items-center py-6 relative z-10">
            <div className="text-8xl font-black text-white light-mode:text-slate-900 tabular-nums">
              {energy}
              <span className="text-xl text-zinc-700 font-bold ml-1">/10</span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 relative z-10">
            {[2, 4, 6, 8, 10].map((val) => (
              <button 
                key={val}
                onClick={() => updateEnergy(val)}
                className={`py-4 rounded-xl font-black transition-all border text-xs ${
                  energy === val 
                  ? 'bg-white text-black border-white shadow-xl' 
                  : 'bg-white/5 light-mode:bg-slate-50 border-white/5 text-zinc-600'
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
             <div className="flex items-center gap-2">
                <Coffee size={14} className="text-zinc-600" />
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Cafeína</span>
             </div>
             <div className="flex gap-1">
                {[1, 2, 3].map(lvl => (
                  <button 
                    key={lvl}
                    onClick={() => updateCaffeine(lvl)}
                    className={`w-5 h-2 rounded-full transition-all ${caffeine >= lvl ? 'bg-indigo-500' : 'bg-white/10'}`}
                  />
                ))}
                {caffeine > 0 && (
                  <button onClick={() => updateCaffeine(0)} className="text-[8px] font-black text-zinc-500 uppercase hover:text-white transition-colors ml-2">Limpar</button>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* ASI Section - Professional & Minimizable */}
      <section 
        className={`glass-card rounded-[2rem] border-white/5 transition-all duration-500 cursor-pointer overflow-hidden ${isExpanded ? 'p-8' : 'p-6'}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white light-mode:text-slate-900 uppercase tracking-[0.15em]">ASI: Análise Sincronizada</h3>
              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Motor de Inferência Bio-Estatística</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={runASI}
              disabled={loadingAnalysis}
              className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {loadingAnalysis ? <RefreshCw size={14} className="animate-spin" /> : <BarChart size={14} />}
              Processar Dados
            </button>
            <div className="text-zinc-600">
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="h-px bg-white/5 w-full" />
            
            {loadingAnalysis ? (
              <div className="py-12 flex flex-col items-center gap-4">
                 <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse [animation-delay:0.4s]" />
                 </div>
                 <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Sincronizando Metadados...</p>
              </div>
            ) : analysis ? (
              <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl">
                 <p className="text-xs font-medium text-zinc-400 leading-relaxed font-mono">
                   {analysis}
                 </p>
                 <div className="mt-4 flex items-center justify-end gap-2 text-[8px] font-black text-zinc-700 uppercase tracking-tighter">
                    <Clock size={10} /> Sincronizado: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                 </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                 <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Solicite o processamento para visualizar os insights.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default SleepEnergy;
