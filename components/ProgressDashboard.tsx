
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, ComposedChart, Line
} from 'recharts';
import { 
  Zap, BarChart3, Activity, Droplets, Moon, Target, ChevronRight, ChevronLeft, 
  Calendar, LayoutList, StretchHorizontal, Rows, Info
} from 'lucide-react';
import { Habit, HealthStats, Task, ReadingItem, NexusTheme, TimeScale, DaySnapshot } from '../types';

interface ProgressDashboardProps {
  habits: Habit[];
  stats: HealthStats;
  tasks: Task[];
  books: ReadingItem[];
  currentTheme: NexusTheme;
}

type MetricFilter = 'geral' | 'água' | 'sono' | 'energia' | 'hábitos';

// Helper para converter string YYYY-MM-DD em objeto Date local
const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // Meio-dia para evitar pulos de DST
};

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ habits, stats, tasks, books, currentTheme }) => {
  const isLight = document.body.classList.contains('light-mode');
  const [metric, setMetric] = useState<MetricFilter>('geral');
  const [scale, setScale] = useState<TimeScale>('semana');
  const [isCompact, setIsCompact] = useState(false);
  
  const [dateOffset, setDateOffset] = useState(0);

  const navigationLabel = useMemo(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    if (scale === 'semana') {
      const start = new Date(d);
      start.setDate(d.getDate() - 6 + (dateOffset * 7));
      const end = new Date(d);
      end.setDate(d.getDate() + (dateOffset * 7));
      return `${start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`;
    }
    if (scale === 'mês') {
      d.setMonth(d.getMonth() + dateOffset);
      return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }
    if (scale === 'ano') {
      d.setFullYear(d.getFullYear() + dateOffset);
      return d.getFullYear().toString();
    }
    return "";
  }, [scale, dateOffset]);

  const chartData = useMemo(() => {
    const history = stats.history || [];
    const baseDate = new Date();
    baseDate.setHours(12, 0, 0, 0);

    if (scale === 'semana') {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() - (6 - i) + (dateOffset * 7));
        const dateStr = d.toLocaleDateString('sv-SE'); // YYYY-MM-DD
        const entry = history.find(h => h.date === dateStr);
        return {
          label: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
          date: dateStr,
          water: entry?.water || 0,
          sleep: entry?.sleep || 0,
          energy: entry?.energy || 0,
          habits: entry ? (entry.habitsCompleted / (entry.totalHabits || 1)) * 100 : 0
        };
      });
    }

    if (scale === 'mês') {
      const targetMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + dateOffset, 1, 12, 0, 0);
      const daysInMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
      
      return Array.from({ length: daysInMonth }, (_, i) => {
        const d = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), i + 1, 12, 0, 0);
        const dateStr = d.toLocaleDateString('sv-SE');
        const entry = history.find(h => h.date === dateStr);
        return {
          label: (i + 1).toString(),
          date: dateStr,
          water: entry?.water || 0,
          sleep: entry?.sleep || 0,
          energy: entry?.energy || 0,
          habits: entry ? (entry.habitsCompleted / (entry.totalHabits || 1)) * 100 : 0
        };
      });
    }

    if (scale === 'ano') {
      const targetYear = baseDate.getFullYear() + dateOffset;
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return months.map((m, i) => {
        const monthEntries = history.filter(h => {
          const d = parseLocalDate(h.date);
          return d.getMonth() === i && d.getFullYear() === targetYear;
        });
        
        const avg = (key: keyof DaySnapshot) => 
          monthEntries.length > 0 
            ? monthEntries.reduce((acc, curr) => acc + (curr[key] as number), 0) / monthEntries.length 
            : 0;

        const habitAvg = monthEntries.length > 0
          ? monthEntries.reduce((acc, curr) => acc + (curr.habitsCompleted / (curr.totalHabits || 1)), 0) / monthEntries.length * 100
          : 0;

        return {
          label: m,
          water: avg('water'),
          sleep: avg('sleep'),
          energy: avg('energy'),
          habits: habitAvg
        };
      });
    }

    return [];
  }, [stats.history, scale, dateOffset]);

  const activeMetricConfig = useMemo(() => {
    switch (metric) {
      case 'água': return { key: 'water', color: currentTheme.metrics.water, unit: 'L', label: 'Consumo de Água' };
      case 'sono': return { key: 'sleep', color: currentTheme.metrics.sleep, unit: 'h', label: 'Ciclo de Sono' };
      case 'energia': return { key: 'energy', color: currentTheme.metrics.energy, unit: '/10', label: 'Vitalidade' };
      case 'hábitos': return { key: 'habits', color: '#6366f1', unit: '%', label: 'Aderência' };
      default: return { key: 'energy', color: currentTheme.primary, unit: '', label: 'Visão Geral' };
    }
  }, [metric, currentTheme]);

  return (
    <div className="space-y-10 pb-32 animate-fadeIn">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 text-indigo-500 font-black text-[10px] uppercase tracking-[0.3em] mb-3">
            <Activity size={14} /> Performance Ledger
          </div>
          <h2 className="text-5xl font-black tracking-tighter light-mode:text-slate-900">Registros</h2>
          <p className="text-zinc-500 text-sm font-medium mt-2">Sua jornada biológica organizada e acessível.</p>
        </div>

        <div className="flex flex-col gap-4">
           <div className="flex bg-white/5 light-mode:bg-slate-100 p-1.5 rounded-2xl border border-white/5">
             {(['semana', 'mês', 'ano'] as TimeScale[]).map(s => (
               <button
                 key={s}
                 onClick={() => { setScale(s); setDateOffset(0); }}
                 className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${scale === s ? 'bg-indigo-600 text-white shadow-xl' : 'text-zinc-500 hover:text-white'}`}
               >
                 {s}
               </button>
             ))}
           </div>
           
           <div className="flex items-center justify-between gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
              <button onClick={() => setDateOffset(p => p - 1)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                <ChevronLeft size={20} />
              </button>
              <span className="text-[10px] font-black uppercase tracking-widest text-white light-mode:text-slate-900 min-w-[120px] text-center">
                {navigationLabel}
              </span>
              <button 
                onClick={() => setDateOffset(p => p + 1)} 
                disabled={dateOffset >= 0}
                className={`p-2 transition-colors ${dateOffset >= 0 ? 'text-zinc-800' : 'text-zinc-500 hover:text-white'}`}
              >
                <ChevronRight size={20} />
              </button>
           </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        <MetricTab active={metric === 'geral'} onClick={() => setMetric('geral')} label="Geral" icon={<BarChart3 size={18} />} />
        <MetricTab active={metric === 'água'} onClick={() => setMetric('água')} label="Água" icon={<Droplets size={18} />} />
        <MetricTab active={metric === 'sono'} onClick={() => setMetric('sono')} label="Sono" icon={<Moon size={18} />} />
        <MetricTab active={metric === 'energia'} onClick={() => setMetric('energia')} label="Energia" icon={<Zap size={18} />} />
        <MetricTab active={metric === 'hábitos'} onClick={() => setMetric('hábitos')} label="Hábitos" icon={<Target size={18} />} />
      </div>

      <div className="glass-card p-8 md:p-12 rounded-[3rem] border-white/5 space-y-10 overflow-hidden">
        <div className="flex items-center justify-between">
           <div>
              <h3 className="text-2xl font-black light-mode:text-slate-900 capitalize">{activeMetricConfig.label}</h3>
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-1">Status de Performance</p>
           </div>
           {metric !== 'geral' && (
             <div className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-xl font-black text-white light-mode:text-slate-900 tabular-nums">
                  {(chartData.reduce((acc, curr) => acc + (curr[activeMetricConfig.key as keyof typeof curr] as number), 0) / chartData.length).toFixed(1)}
                </span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">{activeMetricConfig.unit} (Média)</span>
             </div>
           )}
        </div>

        <div className="h-[400px] w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            {metric === 'geral' ? (
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)"} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isLight ? '#fff' : '#121212', border: 'none', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 700 }}
                />
                <Bar dataKey="energy" fill={currentTheme.metrics.energy} radius={[8, 8, 0, 0]} barSize={scale === 'mês' ? 6 : 30} />
                <Line type="monotone" dataKey="sleep" stroke={currentTheme.metrics.sleep} strokeWidth={4} dot={scale === 'semana'} />
                <Line type="monotone" dataKey="water" stroke={currentTheme.metrics.water} strokeWidth={4} dot={false} />
              </ComposedChart>
            ) : (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeMetricConfig.color} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={activeMetricConfig.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)"} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                   contentStyle={{ backgroundColor: isLight ? '#fff' : '#121212', border: 'none', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey={activeMetricConfig.key} 
                  stroke={activeMetricConfig.color} 
                  strokeWidth={5} 
                  fill="url(#metricGradient)" 
                  animationDuration={1500}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
             <h3 className="text-xl font-black light-mode:text-slate-900">Histórico de Eventos</h3>
             <span className="px-2 py-0.5 bg-white/5 rounded-md text-[8px] font-black text-zinc-600 uppercase tracking-widest">{scale}</span>
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
             <button 
              onClick={() => setIsCompact(false)} 
              className={`p-2 rounded-lg transition-all ${!isCompact ? 'bg-white text-black shadow-lg' : 'text-zinc-600'}`}
              title="Visualização Detalhada"
             >
                <Rows size={14} />
             </button>
             <button 
              onClick={() => setIsCompact(true)} 
              className={`p-2 rounded-lg transition-all ${isCompact ? 'bg-white text-black shadow-lg' : 'text-zinc-600'}`}
              title="Visualização Compacta"
             >
                <StretchHorizontal size={14} />
             </button>
          </div>
        </div>
        
        <div className={`grid grid-cols-1 ${isCompact ? 'gap-2' : 'gap-4'}`}>
          {[...chartData].reverse().map((entry, idx) => {
            const dateObj = entry.date ? parseLocalDate(entry.date) : null;
            
            if (isCompact) {
              return (
                <div key={idx} className="glass-card px-6 py-3 rounded-2xl flex items-center justify-between gap-4 border-white/5 hover:border-white/10 transition-all group animate-in slide-in-from-left-2 duration-300">
                  <div className="flex items-center gap-4 min-w-[120px]">
                    <span className="text-[10px] font-black text-white light-mode:text-slate-900 uppercase">{entry.label}</span>
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter truncate">{dateObj ? dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'Total'}</span>
                  </div>
                  <div className="flex-1 flex items-center justify-end gap-6">
                    <div className="flex items-center gap-1.5">
                       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentTheme.metrics.water }} />
                       <span className="text-[10px] font-black text-white tabular-nums">{entry.water.toFixed(1)}L</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentTheme.metrics.sleep }} />
                       <span className="text-[10px] font-black text-white tabular-nums">{entry.sleep.toFixed(1)}h</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentTheme.metrics.energy }} />
                       <span className="text-[10px] font-black text-white tabular-nums">{entry.energy.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                       <span className="text-[10px] font-black text-white tabular-nums">{Math.round(entry.habits)}%</span>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={idx} className="glass-card p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 border-white/5 hover:border-white/10 transition-all group animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-6 w-full md:w-auto">
                   <div className="w-14 h-14 rounded-2xl bg-white/5 flex flex-col items-center justify-center border border-white/5">
                      <span className="text-[9px] font-black text-zinc-600 uppercase">{entry.label}</span>
                      <span className="text-xl font-black text-white light-mode:text-slate-900">{dateObj ? dateObj.getDate() : idx + 1}</span>
                   </div>
                   <div>
                      <h4 className="font-bold text-white light-mode:text-slate-900 capitalize">{dateObj ? dateObj.toLocaleDateString('pt-BR', { weekday: 'long' }) : 'Resumo Mensal'}</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{entry.date || navigationLabel}</p>
                        {entry.energy > 8 && (
                           <span className="flex items-center gap-1 text-[8px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full uppercase">Alta Performance</span>
                        )}
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-4 gap-4 md:gap-10 w-full md:w-auto">
                   <HistoryMetric label="Água" value={entry.water.toFixed(1)} unit="L" color={currentTheme.metrics.water} />
                   <HistoryMetric label="Sono" value={entry.sleep.toFixed(1)} unit="h" color={currentTheme.metrics.sleep} />
                   <HistoryMetric label="Energia" value={entry.energy.toFixed(1)} unit="" color={currentTheme.metrics.energy} />
                   <HistoryMetric label="Hábitos" value={Math.round(entry.habits)} unit="%" color="#6366f1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const MetricTab = ({ active, onClick, label, icon }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all whitespace-nowrap ${
      active 
      ? 'bg-white text-black border-white shadow-xl scale-105 z-10' 
      : 'bg-white/5 text-zinc-500 border-white/5 hover:bg-white/10'
    }`}
  >
    {icon}
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const HistoryMetric = ({ label, value, unit, color }: any) => (
  <div className="text-center md:text-left">
    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-tighter mb-1">{label}</p>
    <div className="flex items-baseline gap-1 justify-center md:justify-start">
      <span className="text-base font-black text-white light-mode:text-slate-900 tabular-nums" style={{ color: color }}>{value}</span>
      <span className="text-[9px] font-bold text-zinc-600">{unit}</span>
    </div>
  </div>
);

export default ProgressDashboard;
